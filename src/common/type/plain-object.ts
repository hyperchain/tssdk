type BaseData = number | string | boolean | bigint;

export default interface PlainObject {
  [key: string]: BaseData | BaseData[] | PlainObject | PlainObject[] | undefined | null;
}
