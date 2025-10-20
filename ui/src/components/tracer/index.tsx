import React, { useState } from "react"
import styles from "./index.module.css"
import { Trace } from "./types"
import { useTracerContext } from "./TracerContext"
import DropDown from "./DropDown"
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
  renderCtx?: (ctx: V) => React.ReactNode
  highlights: { [key: string]: boolean }
  setHighlight: (key: string, on: boolean) => void
}

function Fn<V>({ trace, renderCtx, highlights, setHighlight }: FnProps<V>) {
  const { state, fold, setHover, pin } = useTracerContext()

  const onClick = () => {
    pin(trace.i)
  }

  const onClickFold = () => {
    fold(trace.i)
  }

  const onMouseEnter = () => {
    setHover(trace.i)
  }

  const onMouseLeave = () => {
    setHover(null)
  }

  const show = !state.hidden.has(trace.i)

  return (
    <div className={styles.fn}>
      <div
        className={styles.line}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={styles.index} onClick={onClick}>
          {state.pins.has(trace.i) ? (
            <span className={styles.pin}>x</span>
          ) : (
            trace.i
          )}
        </div>
        <Padd depth={trace.depth} />
        <div className={styles.func}>
          <Fold
            show={show}
            hasChildren={trace.calls.length > 0}
            onClick={onClickFold}
          />
          <div className={styles.obj}>
            <DropDown
              label={trace.fn.mod}
              highlight={highlights[trace.fn.mod]}
              onMouseEnter={() => setHighlight(trace.fn.mod, true)}
              onMouseLeave={() => setHighlight(trace.fn.mod, false)}
            >
              TODO
            </DropDown>
          </div>
          <div className={styles.dot}>.</div>
          <div className={styles.funcName}>{trace.fn.name}</div>
          {renderCtx ? renderCtx(trace.ctx) : null}
          <div>(</div>
          <Inputs inputs={trace.inputs} />
          <div>)</div>
          {trace.outputs.length > 0 ? (
            <div className={styles.outputs}>
              <div className={styles.arrow}>{"=>"}</div>
              <div>(</div>
              <Outputs outputs={trace.outputs} />
              <div>)</div>
            </div>
          ) : null}
        </div>
      </div>
      {show
        ? trace.calls.map((t) => (
            <Fn
              key={t.i}
              trace={t}
              highlights={highlights}
              setHighlight={setHighlight}
            />
          ))
        : null}
    </div>
  )
}

type TracerProps<V> = {
  trace: Trace<V>
  renderCtx?: (ctx: V) => React.ReactNode
}

// TODO: hover and copy contract address
// TODO: hover and copy func selector, etc
function Tracer<V>({ trace, renderCtx }: TracerProps<V>) {
  // Highlight state of modules and functions
  const [highlights, setHighlights] = useState<{ [key: string]: boolean }>({})

  const setHighlight = (key: string, on: boolean) => {
    setHighlights((state) => ({
      ...state,
      [key]: on,
    }))
  }

  return (
    <div className={styles.component}>
      <Fn
        trace={trace}
        renderCtx={renderCtx}
        highlights={highlights}
        setHighlight={setHighlight}
      />
    </div>
  )
}

export default Tracer
