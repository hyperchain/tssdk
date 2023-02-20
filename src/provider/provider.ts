import { Request, Response } from "../request";

export default interface Provider {
  send<T, R extends Response<T> = Response<T>>(request: Request<T>): Promise<R>;
  getId(): number;
}
