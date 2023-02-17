import { Response } from "../../request";
import { ArgError } from "./arg-error";
import RequestErrorCode from "./request-error-code";

export default class RequestError<R = unknown> extends Error {
  private code: RequestErrorCode;
  private response: Response<R> | null;

  constructor(response: Response<R> | null, code?: RequestErrorCode, message?: string) {
    super(`RequestError: ${response?.message}`);

    if (response == null && (code == null || message == null)) {
      throw new ArgError("code and message are required!");
    }

    if (response != null) {
      this.code = response.code;
    } else {
      this.code = code!;
      this.message = `RequestError: ${message}`;
    }
    this.response = response;
  }

  public getCode(): RequestErrorCode {
    return this.code;
  }

  public getResponse(): Response<R> | null {
    return this.response;
  }
}
