// ... existing utils ...

/**
 * Converts empty string values to null in an object
 * @param obj The object to transform
 * @returns A new object with empty strings converted to null
 */
export const nullifyEmptyStrings = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === "" ? null : value
    ])
  ) as T;
};
