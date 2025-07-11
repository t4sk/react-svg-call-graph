import React from "react"
import {Func} from "./types"

const Tracer: React.FC<{ trace: Func[] }> = ({trace}) => {
  return (
    <div style={{color: "white"}}>
    {trace.map((f, i) => {
      return (
        <div key={i}>{i} {f.depth} {f.obj}.{f.name}</div>
      )
    })}
    </div>
  )
}

export default Tracer
