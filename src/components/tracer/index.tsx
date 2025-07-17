import React, { useState, createContext, useContext, useMemo }  from "react"
import styles from "./index.module.css"
import {Trace, Func} from "./types"
import Inputs from "./Inputs"
import Outputs from "./Outputs"

// Context
type State = {
  hidden: { [key: number]: boolean }
}

const STATE: State = { hidden: {} }

const TracerContext = createContext({
  state: STATE,
  toggle: (_: number) => {}
})

function useTracerContext() {
  return useContext(TracerContext)
}

const Provider: React.FC<{ children: React.ReactNode }> = ({
  children
}) =>  {
  const [state, setState] = useState<State>(STATE)

  const toggle = (id: number) => {
    setState(state => ({
      ...state,
      hidden: {
        ...state.hidden,
        [id]: !state.hidden[id]
      }
    }))
  }

  const value = useMemo(
    () => ({
      state,
      toggle
    }), [state]
  )

  return (
    <TracerContext.Provider value={value}>
      {children}
    </TracerContext.Provider>
  )
}

// Components
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
  const { state, toggle } = useTracerContext()

  const onClickFold = () => {
    toggle(trace.id)
  }

  const show = !state.hidden[trace.id]

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
    <Provider>
      <div className={styles.component}>
        <Fn trace={trace} />
      </div>
    </Provider>
  )
}

export default Tracer
