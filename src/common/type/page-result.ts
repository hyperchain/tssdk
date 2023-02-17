export default interface PageResult<T> {
  hasmore: boolean;
  data: T[];
}
