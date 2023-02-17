export default interface Response<R> {
  jsonrpc: string;
  id: string;
  code: number;
  message: string;
  namespace: string;
  result: R;
}
