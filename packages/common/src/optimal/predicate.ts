import { AnySchema, InferSchemaType } from "optimal";

export function createGuardedPredicate<S extends AnySchema, T = InferSchemaType<S>>(
  schema: S,
) {
  return (value: unknown): value is T => {
    if (value == null) {
      return false;
    }
    try {
      schema.validate(value);
    } catch {
      return false;
    }
    return true;
  };
}
