export async function post<Req, Res>(url: string, params: Req): Promise<Res> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`)
  }

  return await res.json()
}

export async function get<Res>(url: string): Promise<Res> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`)
  }

  return await res.json()
}

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

export async function getTxTrace(txHash: string): Promise<TxTrace> {
  return post<any, TxTrace>(import.meta.env.VITE_RPC_URL, {
    jsonrpc: "2.0",
    method: "debug_traceTransaction",
    params: [txHash, { tracer: "callTracer" }],
    id: 1,
  })
}

export async function getEtherscanContract(
  addr: string,
): Promise<{ abi: any | null; name: string | null }> {
  const res = await get<{ result: ContractInfo[] }>(
    `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${addr}&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY}`,
  )

  // @ts-ignore
  const abi = res?.result?.[0]?.ABI || ""
  // @ts-ignore
  const name = res?.result?.[0]?.ContractName || null

  const parse = (abi: string) => {
    try {
      return JSON.parse(abi)
    } catch (e) {
      return null
    }
  }

  return { abi: parse(abi), name }
}

export type Contract = {
  chain: string
  address: string
  name?: string
  abi?: any[]
  label?: string
}

export async function getContracts(params: {
  chain: string
  chain_id: number
  addrs: string[]
}): Promise<Contract[]> {
  return post<any, Contract[]>(
    `${import.meta.env.VITE_API_URL}/contracts`,
    params,
  )
}
