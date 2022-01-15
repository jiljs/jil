export interface ObjectConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [p: string]: any;
}

export class ObjectWithOptions {
  constructor(public readonly options: ObjectConfig = {}) {}
}
