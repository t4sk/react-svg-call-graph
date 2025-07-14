import React from "react"
import styles from "./index.module.css"
import {Func, Input, Output} from "./types"

const Padd: React.FC<{ depth: number }> = ({ depth }) => {
  const lines = []
  for (let i = 0; i < depth; i++) {
    lines.push(<div key={i} className={styles.vline} />)
  }
  return lines
}

const Inputs: React.FC<{inputs: Input[]}> = ({inputs}) => {
  // TODO: highight address type
  const len = inputs.length
  return (
    <div className={styles.inputs}>
    {inputs.map((input, i) => (
      <div key={i} className={styles.inputWrapper}>
        <span className={styles.inputName}>{input.name}</span>
        <span className={styles.eq}>=</span>
        <span className={styles.inputValue}>{input.value.toString()}</span>
        {i < len - 1 ? (
          <span className={styles.comma}>,</span>
        ) : null}
      </div>
    ))}
    </div>
  )
}

const Outputs: React.FC<{outputs: Output[]}> = ({outputs}) => {
  // TODO: highight address type
  const len = outputs.length
  return (
    <div className={styles.outputs}>
    {outputs.map((output, i) => (
      <div key={i} className={styles.outputWrapper}>
        {output.name ? (
          <>
            <span className={styles.outputName}>{output.name}</span>
            <span className={styles.eq}>=</span>
          </>
        ) : null}
        <span className={styles.outputValue}>{output.value.toString()}</span>
        {i < len - 1 ? (
          <span className={styles.comma}>,</span>
        ) : null}
      </div>
    ))}
    </div>
  )
}

const Tracer: React.FC<{ trace: Func[] }> = ({trace}) => {
  return (
    <div className={styles.component}>
    {trace.map((f, i) => {
      return (
        <div key={i} className={styles.func}>
        <div className={styles.index}>{i}</div>
        <Padd depth={f.depth} />
        <div className={styles.funcCallWrapper}>
          <div className={styles.obj}>{f.obj}</div>
          <div className={styles.funcName}>.{f.name}</div>
          <div>(</div>
          <Inputs inputs={f.inputs} />
          <div>)</div>
          {f.outputs.length > 0 ? (
            <div className={styles.funcOutputs}>
            <div className={styles.arrow}> {"=>"} </div>
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
