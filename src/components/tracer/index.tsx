import React from "react"

type Input = {
    type: string
    value: string
}

type Output = {
    type: string
    value: string
}

type Func = {
    // TODO: contract name and address
    // TODO: meta data (value, call, staticcall, event, etc...)
    depth: number
    name: string
    inputs: Input[]
    outputs: Output[]
}

const Tracer: React.FC<{}> = () => {
  return (
      <div style={{color: "white"}}>tracer</div>
  )
}

export default Tracer
