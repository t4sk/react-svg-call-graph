export function zip<A, B, C>(a: A[], b: B[], f: (a: A, b: B) => C): C[] {
  const n = Math.min(a.length, b.length)
  const c: C[] = []

  for (let i = 0; i < n; i++) {
    c.push(f(a[i], b[i]))
  }

  return c
}
