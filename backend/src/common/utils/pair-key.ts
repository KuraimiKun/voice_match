export function normalizedPair(a: string, b: string): [string, string] {
  if (a === b) throw new Error('pair_requires_distinct_users');
  return a < b ? [a, b] : [b, a];
}
