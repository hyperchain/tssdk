import AbiCoder from "web3-eth-abi";
import * as ByteUtil from "../util/byte";
import * as StringUtil from "../util/string";
import * as Base64Util from "../util/base64";
import * as EvmType from "../type/vm/evm";
import Response from "../../request/response";
import Receipt from "../type/receipt";
import { ArgError } from "../error";
import { DecodedRet } from "../type/vm/bvm";

export function decodeEvmResult(
  response: Response<Receipt>,
  abi: string | ArrayBuffer | Uint8Array,
  methodName: string
): any[] {
  const abiStr = typeof abi === "string" ? abi : ByteUtil.toString(abi);
  const abiJson = JSON.parse(abiStr) as EvmType.AbiItem[];
  const abiItem = abiJson.find(
    ({ name, inputs }) =>
      `${name}(${inputs != null ? inputs.map(({ type }) => type).join(",") : ""})` === methodName
  );
  if (abiItem == null) {
    throw new ArgError(`can't find ${methodName} from abi!`);
  }
  // 结果为 void 的情况
  if (response.result.ret === "0x0") {
    return [];
  }
  const decodedResult = AbiCoder.decodeParameters(abiItem.outputs || [], response.result.ret);
  // 优化结果显示 {0: '123', 1: '123', 2: '123', 3: ['123', '123'], __length__: 4} => ['123', '123', '123', ['123', '123']]
  const prettyResult: unknown[] = [];
  let curIndex = 0;
  while (decodedResult[curIndex] != null) {
    prettyResult.push(decodedResult[curIndex]);
    curIndex += 1;
  }
  return prettyResult;
}

export function decodeBvmResultRet(ret: string): DecodedRet {
  return JSON.parse(StringUtil.fromHex(ret));
}

export function decodeBvmResultRetRet(ret?: string) {
  if (ret == null) {
    return null;
  }
  const retStr = Base64Util.decodeToString(ret);
  try {
    return JSON.parse(retStr);
  } catch (error) {
    return retStr;
  }
}
