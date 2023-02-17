import JSZip from "jszip";
import { TxVersion } from "../../transaction";
import * as ByteUtil from "./byte";
import * as NumUtil from "./num";
import * as StringUtil from "./string";
import * as Base64Util from "./base64";
import { ArgError } from "../error";
import { BvmOperation } from "..";
import ProposalContentOperation from "../bvm-operation/porposal-content-operation";

function encodeDeployOlderVersion(file: ArrayBuffer): string {
  if (file.byteLength > 1024 * 512) {
    throw new ArgError("the contract jar should not be larger than 512KB");
  }
  return ByteUtil.toHex(file);
}

export async function encodeDeployJar(file: ArrayBuffer, txVersion: TxVersion): Promise<string> {
  if (txVersion.isGreaterOrEqual(TxVersion.TxVersion30)) {
    const contractDeployMagic = "fefffbcd";
    const bytes = await JSZip.loadAsync(file).then(async (zip: JSZip) => {
      return Promise.all([parseMainClass(zip), ...parseClasses(zip)]).then(
        (bytesArr: Uint8Array[]) => {
          return ByteUtil.concat(...bytesArr);
        }
      );
    });
    const result = `${contractDeployMagic}${ByteUtil.toHex(bytes)}`;
    return result;
  }
  return encodeDeployOlderVersion(file);
}

// export function encodeBVM(methodName: string, ...params: string[]): string {
//   throw new Error("not implemented");
// }

/**
 * 按照以下格式，将 MANIFEST 文件中的 Main-Class 字段编码：
 * Main-Class name length (2 bytes) | Main-Class name
 */
async function parseMainClass(zip: JSZip): Promise<Uint8Array> {
  const contractManifestPath = "META-INF/MANIFEST.MF";
  const mainClassKey = "Main-Class";
  const file = zip.file(contractManifestPath);
  if (file == null) {
    throw new Error(`${contractManifestPath} doesn't exist!`);
  }

  return file.async("string").then((text) => {
    let kvList: string[];
    // 按照 \n 或者 \r 分行
    if (text.includes("\n")) {
      kvList = text.replace(/\r/g, "").split("\n");
    } else if (text.includes("\r")) {
      kvList = text.split("\r");
    } else {
      throw new Error(`the format of ${contractManifestPath} is incorrect!`);
    }
    // 找到包含 Main-Class 的一行
    const mainClassKv = kvList.find((kv) => kv.includes(mainClassKey));
    if (mainClassKv == null) {
      throw new Error(`${contractManifestPath} have no key named Main-Class`);
    }
    const [, value] = mainClassKv.split(":");
    if (value == null) {
      throw new Error(`the format of ${contractManifestPath} is incorrect!`);
    }
    const mainClass = value.trim();
    const mainClassByte = StringUtil.toByte(mainClass); // name bytes
    const mainClassByteLenByte = NumUtil.toByte(mainClassByte.byteLength, 2); // name length bytes
    return ByteUtil.concat(mainClassByteLenByte, mainClassByte);
  });
}

/**
 * 按照以下格式，将所有的 class 文件编码：
 * (class length (4 bytes) | name length (2 bytes) | class | name ) 以此循环
 */
function parseClasses(zip: JSZip): Promise<Uint8Array>[] {
  const contractClassSuffix = ".class";
  const classLimitBytesLength = 64 * 1024; // 64k
  const files = zip.files;

  return Object.keys(files)
    .filter((fileName: string) => !files[fileName].dir && fileName.endsWith(contractClassSuffix)) // 过滤出所有的 class 文件
    .map((classFileName) => zip.file(classFileName))
    .filter((zipClassFile) => zipClassFile != null)
    .map(async (zipClassFileP: JSZip.JSZipObject | null) => {
      const zipClassFile = zipClassFileP as JSZip.JSZipObject;
      const className = zipClassFile.name.replace(contractClassSuffix, "");
      const classNameByte = StringUtil.toByte(className); // class name bytes
      const classNameByteLenByte = NumUtil.toByte(classNameByte.byteLength, 2); // class name bytes length bytes
      return zipClassFile.async("uint8array").then((contentByte: Uint8Array) => {
        if (contentByte.byteLength > classLimitBytesLength) {
          throw new Error("the single class content should not be larger than 64KB");
        }
        const contentByteLenByte = NumUtil.toByte(contentByte.byteLength, 4); // class content bytes length bytes
        return ByteUtil.concat(
          contentByteLenByte,
          classNameByteLenByte,
          contentByte,
          classNameByte
        );
      });
    });
}

export function encodeBVM(methodName: string, ...params: string[]) {
  const methodNameLenBytes = NumUtil.toByte(methodName.length, 4);
  const methodNameBytes = StringUtil.toByte(methodName);
  const paramsLenBytes = NumUtil.toByte(params.length, 4);

  const paramsBytesArr: Uint8Array[] = [];
  for (const param of params) {
    const paramBytes = StringUtil.toByte(param);
    const paramBytesLenBytes = NumUtil.toByte(paramBytes.length, 4);
    paramsBytesArr.push(paramBytesLenBytes);
    paramsBytesArr.push(paramBytes);
  }

  const result = ByteUtil.concat(
    methodNameLenBytes,
    methodNameBytes,
    paramsLenBytes,
    ...paramsBytesArr
  );
  return ByteUtil.toHex(result);
}

export function encodeOperation(opt: BvmOperation.Operation): Uint8Array {
  // encode : |method bytes length(4b)|method| params count(4)|params1 length(4)|params1|...
  const methodBytes = StringUtil.toByte(opt.getMethod()!);
  const methodLengthBytes = NumUtil.toByte(methodBytes.byteLength, 4);

  let argLen;
  const args = opt.getArgs();
  if (args == null) {
    argLen = 0;
  } else {
    argLen = args.length;
  }

  let base64Index: boolean[] | undefined;
  const argLenBytes = NumUtil.toByte(argLen, 4);
  if (opt instanceof BvmOperation.Builtin) {
    base64Index = opt.getBase64Index();
  }

  let result = ByteUtil.concat(methodLengthBytes, methodBytes, argLenBytes);

  for (let i = 0; i < argLen; i += 1) {
    const argBytes: Uint8Array =
      base64Index != null && base64Index[i]
        ? Base64Util.decodeToUint8Array(args![i])
        : StringUtil.toByte(args![i]);
    const argBytesLenBytes = NumUtil.toByte(argBytes.byteLength, 4);
    result = ByteUtil.concat(result, argBytesLenBytes, argBytes);
  }

  return result;
}

export function encodeProposalContents(ops: ProposalContentOperation[]) {
  // encode : |operation length(4)|operation|...
  if (ops == null) {
    return NumUtil.toByte(0, 4);
  }
  const opBytesArr: Uint8Array[] = [];
  for (const op of ops) {
    opBytesArr.push(encodeOperation(op));
  }
  return ByteUtil.concat(NumUtil.toByte(ops.length, 4), ...opBytesArr);
}
