import React from "react"
import styles from "./index.module.css"
import {Func} from "./types"
import Inputs from "./Inputs"
import Outputs from "./Outputs"

const Padd: React.FC<{ depth: number }> = ({ depth }) => {
  const lines = []
  for (let i = 0; i < depth; i++) {
    lines.push(<div key={i} className={styles.padd}/>)
  }
  return lines
}

const Tracer: React.FC<{ trace: Func[] }> = ({trace}) => {
  // TODO: ETH value
  return (
    <div className={styles.component}>
    {trace.map((f, i) => {
      return (
        <div key={i} className={styles.line}>
          <div className={styles.index}>{i}</div>
          <Padd depth={f.depth} />
          <div className={styles.func}>
            <div className={styles.obj}>{f.obj}</div>
            <div className={styles.funcName}>.{f.name}</div>
            <div>(</div>
            <Inputs inputs={f.inputs} />
            <div>)</div>
            {f.outputs.length > 0 ? (
              <div className={styles.outputs}>
                <div className={styles.arrow}>{"=>"}</div>
                <div>(</div>
                <Outputs outputs={f.outputs} />
                <div>)</div>
              </div>
            ): null}
          </div>
        </div>
      )
    })}
    </div>
  )
}

export default Tracer
