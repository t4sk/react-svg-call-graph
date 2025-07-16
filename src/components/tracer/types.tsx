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
    value?: string
    // call, staticcall, delegatecall, event, etc...
    type: string
    raw: string
    selector: string
  }
}

export type Trace = {
  func: Func,
  children: Trace[]
}
