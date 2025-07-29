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

export type Func = {
  depth: number
  obj: string
  name: string
  inputs: Input[]
  outputs: Output[]
  ok: boolean
  vm?: {
    // EVM specific
    contract?: string
    address: string
    value?: bigint
    // call, staticcall, delegatecall, event, etc...
    type: string
    rawInput?: string
    rawOutput?: string
    selector?: string
    gas?: bigint
  }
}

export type Trace = {
  id: number
  func: Func,
  children: Trace[]
}
