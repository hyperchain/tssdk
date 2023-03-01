import * as ByteUtil from "../util/byte";
import * as NumUtil from "../util/num";
import * as StringUtil from "../util/string";
import * as JSONBigintUtil from "../util/json-bigint";
import { ArgError, RuntimeError } from "../error";
import { Bean, BeanType, DataType } from "../type/vm/hvm";

interface Arg {
  structName: string;
  value: unknown;
}

export default class InvokeParams {
  private params?: string;

  public static HvmAbiParamsBuilder: typeof HvmAbiParamsBuilder;
  public static HvmDirectParamsBuilder: typeof HvmDirectParamsBuilder;

  public getParams(): string | undefined {
    return this.params;
  }

  public setParams(params: string): void {
    this.params = params;
  }
}

class HvmAbiParamsBuilder {
  private invokeParams: InvokeParams;
  private bean: Bean; // 单个调用
  private args: unknown[]; // 实际参数

  /**
   * create params instance.
   *
   * @param abi the hvm contract abi of json
   * @param beanType   the type of beanName
   * @param beanName   name of beanName you want to invoke
   */
  public constructor(abi: string | Uint8Array | ArrayBuffer, beanType: BeanType, beanName: string) {
    let abiJson: string;
    if (typeof abi === "string") {
      abiJson = abi;
    } else {
      abiJson = ByteUtil.toString(abi);
    }
    const abiList = JSON.parse(abiJson) as Bean[];
    this.bean = this.getBeanAbi(abiList, beanType, beanName);
    const classBytes: Uint8Array = ByteUtil.fromHex(this.bean.classBytes);
    if (classBytes.length > 0xffff) {
      throw new ArgError("the bean class is too large"); // 64kb
    }
    this.invokeParams = new InvokeParams();
    this.args = [] as unknown[];
  }

  private getBeanAbi(abiList: Bean[], beanType: BeanType, beanName: string) {
    let beanAbi: Bean | undefined;
    if (beanType === BeanType.MethodBean) {
      beanAbi = this.getMethodBeanAbi(abiList, beanName);
    } else {
      beanAbi = this.getInvokeBeanAbi(abiList, beanName);
    }
    if (beanAbi == null) {
      throw new RuntimeError("getBeanAbi", `can not find target beanName of ${beanName}`);
    }
    return beanAbi;
  }

  private getMethodBeanAbi(abiList: Bean[], beanName: string): Bean | undefined {
    if (!beanName.includes("(")) {
      return abiList.find(
        (bean: Bean) => bean.beanName === beanName && bean.beanType === BeanType.MethodBean
      );
    } else {
      return abiList.find(
        (bean: Bean) =>
          bean.beanType === BeanType.MethodBean &&
          `${bean.beanName}(${
            bean.inputs != null ? bean.inputs.map(({ structName }) => structName).join(",") : ""
          })` === beanName
      );
    }
  }

  private getInvokeBeanAbi(abiList: Bean[], beanName: string): Bean | undefined {
    return abiList.find(
      (bean: Bean) => bean.beanName === beanName && bean.beanType === BeanType.InvokeBean
    );
  }

  public addParam(value: unknown): HvmAbiParamsBuilder {
    this.args.push(value);
    return this;
  }

  public build(): InvokeParams {
    if (this.bean.inputs.length !== this.args.length) {
      throw new RuntimeError("build", "param count is not match with input");
    }
    const length = this.args.length;
    const argMap: { [key: string]: Arg } = {};
    for (let i = 0; i < length; i += 1) {
      const arg = this.args[i];
      const requiredDataDesc = this.bean.inputs[i];

      if (!checkType(arg, requiredDataDesc.type)) {
        throw new RuntimeError(
          "build",
          `the param[${i}] type not match, require ${
            requiredDataDesc.structName
          }, but get ${typeof arg}`
        );
      }
      // 如果是 InvokeBean，mapKey 不会重复；如果是 MethodBean，mapKey 可能存在重复（buildMethodBeanPayload 不需要使用到 key 值，所以保证不重复即可）；
      const mapKey =
        this.bean.beanType === BeanType.InvokeBean
          ? requiredDataDesc.name
          : `${requiredDataDesc.name}#${i}`;
      argMap[mapKey] = {
        structName: requiredDataDesc.structName,
        value: arg,
      };
    }

    let payload: string;
    if (this.bean.beanType === BeanType.InvokeBean) {
      payload = this.buildInvokeBeanPayload(argMap);
    } else {
      payload = this.buildMethodBeanPayload(argMap);
    }
    this.invokeParams.setParams(payload);
    return this.invokeParams;
  }

  /**
   * InvokeBean；将 classBtyes、beanName、params 进行组合编码
   * @param argMap 参数对象
   * @returns 十六进制编码
   */
  private buildInvokeBeanPayload(argMap: { [key: string]: Arg }): string {
    const classBtyes: Uint8Array = ByteUtil.fromHex(this.bean.classBytes);
    const beanNameBytes: Uint8Array = StringUtil.toByte(this.bean.beanName);
    const classBytesLen: Uint8Array = NumUtil.toByte(classBtyes.length, 4);
    const beanNameBytesLen: Uint8Array = NumUtil.toByte(beanNameBytes.length, 2);
    // 参数对象（去掉类型） { a: 1, b: '2', c: false }
    const object = Object.entries(argMap).reduce((prev, [k, v]) => {
      return {
        ...prev,
        [k]: v.value,
      };
    }, {});
    const paramJson = JSONBigintUtil.stringify(object);
    const paramBytes = StringUtil.toByte(paramJson);

    const bytes = ByteUtil.concat(
      classBytesLen,
      beanNameBytesLen,
      classBtyes,
      beanNameBytes,
      paramBytes
    );

    return ByteUtil.toHex(bytes);
  }

  /**
   * MethodBean 字段组合编码
   * @param argMap 参数对象
   * @returns 十六进制编码
   */
  private buildMethodBeanPayload(argMap: { [key: string]: Arg }): string {
    const bytes: Uint8Array[] = [];
    const beanNameBytes: Uint8Array = StringUtil.toByte(this.bean.beanName);
    const beanNameBytesLen: Uint8Array = NumUtil.toByte(beanNameBytes.length, 2);
    bytes.push(beanNameBytesLen);
    bytes.push(beanNameBytes);
    Object.entries(argMap).forEach(([, v]) => {
      const clazzNameBytes: Uint8Array = StringUtil.toByte(v.structName);
      const paramBytes: Uint8Array = StringUtil.toByte(
        typeof v.value === "string" ? v.value : JSONBigintUtil.stringify(v.value)
      );
      const clazzNameBytesLen: Uint8Array = NumUtil.toByte(clazzNameBytes.length, 2);
      const paramBytesLen: Uint8Array = NumUtil.toByte(paramBytes.length, 4);
      bytes.push(clazzNameBytesLen);
      bytes.push(paramBytesLen);
      bytes.push(clazzNameBytes);
      bytes.push(paramBytes);
    });
    return `fefffbce${ByteUtil.toHex(ByteUtil.concat(...bytes))}`;
  }
}

class HvmDirectParamsBuilder {
  private invokeParams: InvokeParams;
  private payload: Uint8Array;

  constructor(methodName: string) {
    this.invokeParams = new InvokeParams();

    const methodNameBytes = StringUtil.toByte(methodName);
    const methodNameBytesLen = NumUtil.toByte(methodNameBytes.length, 2);
    this.payload = ByteUtil.concat(methodNameBytesLen, methodNameBytes);
  }

  public addBytePrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Byte)) {
      throw new ArgError(`${n} is not a byte!`);
    }
    return this.addObject("byte", n);
  }

  public addByte(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Byte)) {
      throw new ArgError(`${n} is not a java.lang.Byte!`);
    }
    return this.addObject("java.lang.Byte", n);
  }

  public addShortPrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Short)) {
      throw new ArgError(`${n} is not a short!`);
    }
    return this.addObject("short", n);
  }

  public addShort(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Short)) {
      throw new ArgError(`${n} is not a java.lang.Short!`);
    }
    return this.addObject("java.lang.Short", n);
  }

  public addIntPrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Int)) {
      throw new ArgError(`${n} is not an int!`);
    }
    return this.addObject("int", n);
  }

  public addInteger(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Int)) {
      throw new ArgError(`${n} is not a java.lang.Integer!`);
    }
    return this.addObject("java.lang.Integer", n);
  }

  public addLongPrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Long)) {
      throw new ArgError(`${n} is not a long!`);
    }
    return this.addObject("long", n);
  }

  public addLong(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Long)) {
      throw new ArgError(`${n} is not an java.lang.Long!`);
    }
    return this.addObject("java.lang.Long", n);
  }

  public addFloatPrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Float)) {
      throw new ArgError(`${n} is not a float!`);
    }
    return this.addObject("float", n);
  }

  public addFloat(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Float)) {
      throw new ArgError(`${n} is not a java.lang.Float!`);
    }
    return this.addObject("java.lang.Float", n);
  }

  public addDoublePrimitive(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Double)) {
      throw new ArgError(`${n} is not a double!`);
    }
    return this.addObject("double", n);
  }

  public addDouble(n: number): HvmDirectParamsBuilder {
    if (!checkType(n, DataType.Double)) {
      throw new ArgError(`${n} is not a java.lang.Double!`);
    }
    return this.addObject("java.lang.Double", n);
  }

  public addBooleanPrimitive(b: boolean): HvmDirectParamsBuilder {
    return this.addObject("boolean", b);
  }

  public addBoolean(b: boolean): HvmDirectParamsBuilder {
    return this.addObject("java.lang.Boolean", b);
  }

  public addCharPrimitive(c: string): HvmDirectParamsBuilder {
    return this.addObject("char", c);
  }

  public addChar(c: string): HvmDirectParamsBuilder {
    return this.addObject("java.lang.Character", c);
  }

  public addString(str: string): HvmDirectParamsBuilder {
    return this.addObject("java.lang.String", str);
  }

  public addObject(className: string, obj: any): HvmDirectParamsBuilder {
    const paramBytes = this.paramToBytes(className, obj);
    this.payload = ByteUtil.concat(this.payload, paramBytes);
    return this;
  }

  public build(): InvokeParams {
    this.invokeParams.setParams(`fefffbce${ByteUtil.toHex(this.payload)}`);
    return this.invokeParams;
  }

  private paramToBytes(clazzName: string, param: unknown): Uint8Array {
    const paramStr = typeof param === "string" ? param : JSONBigintUtil.stringify(param);
    const clazzNameBytes = StringUtil.toByte(clazzName);
    const paramStrBytes = StringUtil.toByte(paramStr);

    const clazzNameBytesLen = NumUtil.toByte(clazzNameBytes.length, 2);
    const paramStrBytesLen = NumUtil.toByte(paramStrBytes.length, 4);

    return ByteUtil.concat(clazzNameBytesLen, paramStrBytesLen, clazzNameBytes, paramStrBytes);
  }
}

InvokeParams.HvmAbiParamsBuilder = HvmAbiParamsBuilder;
InvokeParams.HvmDirectParamsBuilder = HvmDirectParamsBuilder;

/**
 * @param value
 * @param targetType
 * @returns
 */
function checkType(value: unknown, targetType: DataType): boolean {
  switch (targetType) {
    case DataType.Bool:
      return typeof value === "boolean";
    case DataType.Char:
    case DataType.String:
      return typeof value === "string";
    case DataType.Long:
    case DataType.Int:
    case DataType.Short:
    case DataType.Byte:
      return typeof value === "number" && NumUtil.isInteger(value);
    case DataType.Float:
    case DataType.Double:
      return typeof value === "number" && NumUtil.isFloat(value);
    default:
      return true;
  }
}
