import { Receipt, sleep } from "../common";
import { RequestError, RequestErrorCode } from "../common";
import { ServiceManager } from "../service";
import Response from "./response";
import Request from "./request";

export default class PollingResponse implements Response<string | Receipt> {
  public readonly jsonrpc: string;
  public readonly id: string;
  public readonly code: number;
  public readonly message: string;
  public readonly namespace: string;
  public readonly result: string | Receipt;
  private attempt: number; // request times
  private sleepTime: number; // unit ms, the time interval between two adjacent requests
  private stepSize: number; // unit ms, the value of an increase in sleepTime after get receipt failed
  private request: Request<string>;

  constructor(
    { jsonrpc, id, code, message, namespace, result }: Response<string | Receipt>,
    request: Request<string>,
    attempt = 10,
    sleepTime = 50,
    stepSize = 50
  ) {
    this.jsonrpc = jsonrpc;
    this.id = id;
    this.code = code;
    this.message = message;
    this.namespace = namespace;
    this.result = result;
    this.attempt = attempt;
    this.sleepTime = sleepTime;
    this.stepSize = stepSize;
    this.request = request;
  }

  public async poll(
    attempt: number = this.attempt,
    sleepTime: number = this.sleepTime,
    stepSize: number = this.stepSize
  ): Promise<Response<Receipt>> {
    // simulate 情况：polling 之前，就已经拿到了结果；再调用 polling 拿，只是为了逻辑统一；
    if (typeof this.result !== "string") {
      const response: Response<Receipt> = {
        jsonrpc: this.jsonrpc,
        id: this.id,
        code: this.code,
        message: this.message,
        namespace: this.namespace,
        result: this.result as Receipt,
      };
      return Promise.resolve(response);
    }
    const providerManager = this.request.getProviderManager();
    const nodeIds = this.request.getNodeIds();
    const txService = ServiceManager.getTxService(providerManager);
    const request = txService.getTransactionReceipt(this.result, ...nodeIds);

    // 多次尝试发送（中间休息）
    for (let i = 0; i < attempt; i += 1) {
      try {
        const result = await request.send();
        return result;
      } catch (err) {
        if (!(err instanceof RequestError)) {
          throw err;
        }
        // if (err.getCode() === RequestErrorCode.INVALID_SIGNATURE) {
        //   // providerManager.init();
        //   // 重新发送 transation
        // }
        // 继续尝试
        else if (
          err.getCode() === RequestErrorCode.RECEIPT_NOT_FOUND ||
          err.getCode() === RequestErrorCode.SYSTEM_BUSY ||
          err.getCode() === RequestErrorCode.HTTP_TIME_OUT ||
          err.getCode() === RequestErrorCode.NETWORK_GETBODY_FAILED ||
          err.getCode() === RequestErrorCode.REQUEST_ERROR
        ) {
          await sleep(sleepTime);
          sleepTime += stepSize;
        } else {
          throw err;
        }
      }
    }
    throw new RequestError(
      null,
      RequestErrorCode.POLLING_TIME_OUT,
      "can't get receipt from server after " + attempt + " times attempt"
    );
  }

  public setAttempt(attempt: number) {
    this.attempt = attempt;
    return this;
  }

  public setSleepTime(sleepTime: number) {
    this.sleepTime = sleepTime;
    return this;
  }

  public setStepSize(stepSize: number) {
    this.stepSize = stepSize;
    return this;
  }
}
