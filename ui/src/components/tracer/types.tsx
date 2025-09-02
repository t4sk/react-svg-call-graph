export type Input = {
  type: string
  name: string
  value: string
}

export type Output = {
  type: string
  name: string
  value: string
}

export type Fn = {
  id: string
  mod: string
  name: string
  inputs: Input[]
  outputs: Output[]
  // TODO: ok + error?
}

export type Trace<C> = {
  id: number
  depth: number
  fn: Fn
  calls: Trace<C>[]
  ctx: C
}
