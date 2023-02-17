import Provider from "./provider";
import { PollingResponse, Request, Response } from "../request";
import { ArgError, RequestError } from "../common";
import { JSONBigintUtil, Receipt, EnvUtil } from "../common";
import http from "http";
import https from "https";

interface HttpProviderOptions {
  security?: boolean; // 是否开启 https，默认为 false
  timeout?: number; // millisecond
  nodeHttps?: {
    key: ArrayBuffer;
    cert: ArrayBuffer;
    ca: ArrayBuffer;
  };
}

const defaultHttpProviderOptions: HttpProviderOptions = {
  security: false,
  timeout: 60 * 1000,
};

export default class HttpProvider implements Provider {
  private static readonly HTTP = "http://";
  private static readonly HTTPS = "https://";
  private id: number;
  private host: string;
  private urlPrefix: string;
  private options?: HttpProviderOptions;

  constructor(id: number, host: string, options?: HttpProviderOptions) {
    options = {
      ...options,
      security: options?.security || defaultHttpProviderOptions.security,
      timeout: options?.timeout || defaultHttpProviderOptions.timeout,
    };
    // node.js 必须要通过 api 携带客户端证书；浏览器通过本地证书设置（例如 mac 的 Keychain Access）；
    if (options.security && options.nodeHttps == null && EnvUtil.isInNode()) {
      throw new ArgError("options.nodeHttps can't be null while using https in node.js");
    }

    if (options.security) {
      this.urlPrefix = HttpProvider.HTTPS;
    } else {
      this.urlPrefix = HttpProvider.HTTP;
    }

    this.id = id;
    this.host = host;
    this.options = options;
  }

  public async send<T, R extends Response<T> = Response<T>>(request: Request<T>): Promise<R> {
    // node sdk 对 payload 和 options 做复杂处理
    const bodyStr = JSONBigintUtil.stringify(request.body());

    const headers = request.getHeaders();

    return this.post<R>(`${this.urlPrefix}${this.host}`, bodyStr, headers).then((data) => {
      if (data.code !== 0) {
        throw new RequestError(data);
      }

      // 结果可轮询再查（可轮询的 response 的 result 一定为 string）
      if (request.getPollable()) {
        return new PollingResponse(
          data as unknown as Response<string | Receipt>,
          request as unknown as Request<string>
        ) as unknown as R;
      }
      // 默认返回
      return data as R;
    });
  }

  public getId() {
    return this.id;
  }

  public getUrl() {
    return `${this.urlPrefix}${this.host}`;
  }

  private async post<R>(url: string, data: string, headers?: HeadersInit): Promise<R> {
    const timeout = this.options!.timeout!;
    // 浏览器环境 使用 fetch
    if (EnvUtil.isInBrowser()) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);
      return fetch(url, {
        method: "POST",
        body: data,
        headers,
        signal: abortController.signal,
      }).then(async (response) => {
        clearTimeout(timeoutId);
        return response.text().then((jsonStr) => {
          return JSONBigintUtil.parse(jsonStr) as unknown as R;
        });
        // return response.json() as unknown as R;
      });
      // 超时会自动抛出错误（Promise 的状态为 rejected）
    } else {
      let req: http.ClientRequest;
      if (url.startsWith(HttpProvider.HTTPS)) {
        const { key, cert, ca } = this.options!.nodeHttps!;
        req = https.request(url, {
          method: "POST",
          headers: headers as http.OutgoingHttpHeaders,
          key: Buffer.from(key),
          cert: Buffer.from(cert),
          ca: Buffer.from(ca),
          // 不需要校验服务端的证书
          rejectUnauthorized: false, // If true, the server certificate is verified against the list of supplied CAs. throw an error: localhost Hostname/IP doesn't match certificate's altnames
          agent: false, // must be false
        });
      } else {
        req = http.request(url, {
          method: "POST",
          headers: headers as http.OutgoingHttpHeaders,
        });
      }

      req.setTimeout(timeout, () => {
        req.destroy();
      });

      return new Promise((resolve, reject) => {
        req.on("response", (resp) => {
          const buff: Uint8Array[] = [];
          resp.on("data", (data: Uint8Array) => {
            buff.push(data);
          });
          resp.on("end", () => {
            // const result = JSON.parse(Buffer.concat(buff).toString());
            const result = JSONBigintUtil.parse(Buffer.concat(buff).toString()) as R;
            resolve(result);
          });
          resp.on("error", (err) => {
            reject(err);
          });
        });
        req.on("error", (err) => {
          reject(err);
        });
        req.write(data);
        req.end();
      });
    }
  }
}
