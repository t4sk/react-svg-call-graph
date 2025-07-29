export function assert(b: boolean, msg: string) {
  if (!b) {
    throw new Error(msg)
  }
}

// Binary search
export function search<A>(
  arr: A[],
  get: (a: A) => number,
  x: number
): number | null {
  if (arr.length == 0) {
    return null
  }

  if (arr.length == 1) {
    return 0
  }

  let low = 0
  let high = arr.length - 1

  assert(get(arr[low]) < get(arr[high]), "data not sorted")

  // Binary search
  while (low < high) {
    let mid = ((low + high) / 2) >> 0

    if (get(arr[mid]) > x) {
      high = mid
    } else {
      low = mid + 1
    }
  }

  return low
}
