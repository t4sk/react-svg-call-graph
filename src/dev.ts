import { Call } from "./lib/types"

export const calls: Call[] = [
  { id: 0, parent: null, depth: 0, children: [1, 2, 3, 4] },
  { id: 1, parent: 0, depth: 1, children: [5, 6, 7] },
  { id: 5, parent: 1, depth: 2, children: null },
  { id: 6, parent: 1, depth: 2, children: null },
  { id: 7, parent: 1, depth: 2, children: null },
  { id: 2, parent: 0, depth: 1, children: [8, 9, 10] },
  { id: 8, parent: 2, depth: 2, children: null },
  { id: 9, parent: 2, depth: 2, children: null },
  { id: 10, parent: 2, depth: 2, children: null },
  { id: 3, parent: 0, depth: 1, children: [11, 12, 13] },
  { id: 11, parent: 3, depth: 2, children: null },
  { id: 12, parent: 3, depth: 2, children: null },
  { id: 13, parent: 3, depth: 2, children: null },
  { id: 4, parent: 0, depth: 1, children: [14, 15, 16] },
  { id: 14, parent: 4, depth: 2, children: null },
  { id: 15, parent: 4, depth: 2, children: null },
  { id: 16, parent: 4, depth: 2, children: null },
  // { id: 16, parent: 4, depth: 2, children: [0] },
  // { id: 0, parent: 16, depth: 3, children: [99] },
  // { id: 99, parent: 0, depth: 4, children: null },
]
