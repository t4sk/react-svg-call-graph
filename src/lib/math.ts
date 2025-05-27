export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + t * b
}

export function lin(dy: number, dx: number, x: number, y0: number): number {
  return (dy / dx) * x + y0
}

