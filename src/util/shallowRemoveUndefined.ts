export function shallowRemoveUndefined<T>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, val]) => val !== undefined)
  ) as T;
}

export function shallowRemoveUndefinedInRecord<T>(
  obj: Record<string, T | undefined>
): Record<string, T> {
  return shallowRemoveUndefined(obj) as Record<string, T>;
}
