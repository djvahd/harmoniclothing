type QueryValue = string | number | boolean | readonly string[] | undefined | null;

/**
 * Serializes params into a `?key=value` query string; array values become
 * repeated `key[]=` entries (Laravel's array query param convention).
 * Returns "" (no leading `?`) when there is nothing to serialize.
 */
export function buildQuery(params?: object): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {}) as [string, QueryValue][]) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => qs.append(`${key}[]`, item));
    } else {
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  return query ? `?${query}` : "";
}
