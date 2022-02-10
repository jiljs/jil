/**
 * Shallow merges previous and next objects into a new object using object spread.
 */
export function mergeObject<T extends Record<never, never>>(prev: T, next: T): T {
	return { ...prev, ...next };
}
