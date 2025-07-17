import React, { useState, useEffect }  from "react"
import styles from "./index.module.css"
import {Trace, Func} from "./types"
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

const Fn: React.FC<{ trace: Trace }> = ({trace }) => {
  // TODO: ETH value
  const [show, set] = useState(true)

  const onClickFold = () => {
    set(!show)
  }

  return (
    <div className={styles.fn}>
      <div className={styles.line}>
        <div className={styles.index}>{trace.id}</div>
        <Padd depth={trace.func.depth} />
        <div className={styles.func}>
          <Fold show={show} hasChildren={trace.children.length > 0} onClick={onClickFold} />
          <div className={styles.obj}>{trace.func.obj}</div>
          <div className={styles.funcName}>.{trace.func.name}</div>
          <div>(</div>
          <Inputs inputs={trace.func.inputs} />
          <div>)</div>
          {trace.func.outputs.length > 0 ? (
            <div className={styles.outputs}>
              <div className={styles.arrow}>{"=>"}</div>
              <div>(</div>
              <Outputs outputs={trace.func.outputs} />
              <div>)</div>
            </div>
          ): null}
        </div>
      </div>
      {show ? trace.children.map(t => <Fn key={t.id} trace={t} />) : null}
    </div>
  )
}

const Tracer: React.FC<{ trace: Trace }> = ({trace}) => {
  return (
    <div className={styles.component}>
      <Fn trace={trace} />
    </div>
  )
}

export default Tracer
