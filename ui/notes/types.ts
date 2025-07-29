export type Call = {
    from: string
    to: string
    type: "CALL" | "DELEGATECALL" | "STATICCALL"
    input: string
    output?: string
    gas: string
    gasUsed: string
    value: string
    calls?: Call[]
}

export type TxTrace = {
    result: Call
}

export type ContractInfo = {
    ABI: string
    ContractName: string
}

