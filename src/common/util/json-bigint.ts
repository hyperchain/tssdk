import JSONbig from "json-bigint";
/**
 * 大数 json 化
 * 例如：1661157399353999872n => 1661157399353999872（不带引号）
 */
export function stringify(obj: unknown): string {
  return JSONbig({ storeAsString: false, useNativeBigInt: true }).stringify(obj);
}

export function parse(jsonStr: string): unknown {
  return JSONbig({ storeAsString: false, useNativeBigInt: true }).parse(jsonStr);
}

// stringify
// const markingChars = ["===", "xxx", "yyy"];
// let prefix = `{{==BIGINT==`;
// let suffix = `==BIGINT==}}`;
//
// let regExp = new RegExp(`"${prefix}(\\d+)${suffix}"`, "g");
// const originJson = JSON.stringify(obj, (key, value) => {
//   return typeof value === "bigint" ? value.toString() : value;
// });
// // 遍历检查整个“对象”中是否存在“标记符号”，如果存在，则需要修改“标记符号”，
// // 以此保证不会与“对象的原有属性”出现重复，避免后续的 json.replace 的时候替换错误。
// while (regExp.test(originJson)) {
//   const randomIndex = Math.floor(Math.random() * markingChars.length);
//   const randomChar = markingChars[randomIndex];
//   prefix = `${prefix}${randomChar}`;
//   suffix = `${randomChar}${suffix}`;
//   regExp = new RegExp(`"${prefix}(\\d+)${suffix}"`, "g");
// }
// const json = JSON.stringify(obj, (key, value) => {
//   if (typeof value === "bigint") {
//     return `${prefix}${value.toString()}${suffix}`;
//   }
//   return value;
// });
// return json.replace(regExp, `$1`);
