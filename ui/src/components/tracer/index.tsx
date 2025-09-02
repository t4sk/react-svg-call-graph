import React from "react"
import styles from "./index.module.css"
import { Trace } from "./types"
import { useTracerContext } from "./TracerContext"
import Inputs from "./Inputs"
import Outputs from "./Outputs"

const Padd: React.FC<{ depth: number }> = ({ depth }) => {
  const lines = []
  for (let i = 0; i < depth; i++) {
    lines.push(<div key={i} className={styles.padd} />)
  }
  return lines
}

const Fold: React.FC<{
  show: boolean
  hasChildren: boolean
  onClick: () => void
}> = ({ show, hasChildren, onClick }) => {
  return (
    <div className={styles.fold} onClick={onClick}>
      {hasChildren ? (show ? "-" : "+") : ""}
    </div>
  )
}

type FnProps<V> = {
  trace: Trace<V>
}

function Fn<V>({ trace }: FnProps<V>) {
  const { state, fold, setHover, pin } = useTracerContext()

  const onClick = () => {
    pin(trace.id)
  }

  const onClickFold = () => {
    fold(trace.id)
  }

  const onMouseEnter = () => {
    setHover(trace.id)
  }

  const onMouseLeave = () => {
    setHover(null)
  }

  const show = !state.hidden.has(trace.id)

  return (
    <div className={styles.fn}>
      <div
        className={styles.line}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={styles.index} onClick={onClick}>
          {state.pins.has(trace.id) ? (
            <span className={styles.pin}>x</span>
          ) : (
            trace.id
          )}
        </div>
        <Padd depth={trace.depth} />
        <div className={styles.func}>
          <Fold
            show={show}
            hasChildren={trace.calls.length > 0}
            onClick={onClickFold}
          />
          <div className={styles.obj}>{trace.fn.mod}</div>
          <div className={styles.dot}>.</div>
          <div className={styles.funcName}>{trace.fn.name}</div>
          {trace.ctx?.value ? (
            <div className={styles.ctx}>
              <div>{"{"}</div>
              <div className={styles.vmLabel}>value: </div>
              <div className={styles.value}>
                {(trace.ctx.value || 0).toString()}
              </div>
              <div>{"}"}</div>
            </div>
          ) : null}
          <div>(</div>
          <Inputs inputs={trace.fn.inputs} />
          <div>)</div>
          {trace.fn.outputs.length > 0 ? (
            <div className={styles.outputs}>
              <div className={styles.arrow}>{"=>"}</div>
              <div>(</div>
              <Outputs outputs={trace.fn.outputs} />
              <div>)</div>
            </div>
          ) : null}
        </div>
      </div>
      {show ? trace.calls.map((t) => <Fn key={t.id} trace={t} />) : null}
    </div>
  )
}

type TracerProps<V> = {
  trace: Trace<V>
}

function Tracer<V>({ trace }: TracerProps<V>) {
  return (
    <div className={styles.component}>
      <Fn trace={trace} />
    </div>
  )
}

export default Tracer
