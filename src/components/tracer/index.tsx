import React, { useState }  from "react"
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

const Fold: React.FC<{ show: boolean, hasChildren: boolean, onClick: () => void}> = ({ show, hasChildren, onClick }) => {
  return (
    <div className={styles.fold} onClick={onClick}>{hasChildren ? (show ? "-" : "+") : ""}</div>
  )
}

const Tracer: React.FC<{ trace: Func[] }> = ({trace}) => {
  const [hidden, set] = useState<{[key: number]: boolean}>({})

  const onClickFold = (i: number) => {
    set(state => ({
      ...state,
      [i]: !state[i]
    }))
  }

  // TODO: ETH value
  const len = trace.length
  return (
    <div className={styles.component}>
    {trace.map((f, i) => {
      const show = !hidden[i]
      const hasChildren = trace[i + 1]?.depth > f.depth
      return (
        <div key={i} className={show ? styles.line : styles.hide}>
          <div className={styles.index}>{i}</div>
          <Padd depth={f.depth} />
          <div className={styles.func}>
            <Fold show={!hidden[i]} hasChildren={hasChildren} onClick={() => onClickFold(i)}/>
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
