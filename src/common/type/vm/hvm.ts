export enum DataType {
  Void = "Void",
  Bool = "Bool",
  Char = "Char",
  Byte = "Byte",
  Short = "Short",
  Int = "Int",
  Long = "Long",
  Float = "Float",
  Double = "Double",
  String = "String",
  Array = "Array",
  List = "List",
  Map = "Map",
  Struct = "Struct",
}

export enum BeanType {
  InvokeBean = "InvokeBean",
  MethodBean = "MethodBean",
}

export interface DataDesc {
  name: string;
  type: DataType;
  properties: DataDesc[];
  structName: string;
}

// application binary interface
export interface Bean {
  version: string;
  beanName: string;
  inputs: DataDesc[];
  output: DataDesc;
  classBytes?: string; // invokeBean 独有
  structs: DataDesc[]; // 对非基础类型字段做类型描述
  beanType: BeanType;
}
