import React from "react"
import CopyText from "../CopyText"
import { Input } from "./types"
import styles from "./Inputs.module.css"

const Inputs: React.FC<{ inputs: Input[] }> = ({ inputs }) => {
  const len = inputs.length
  return (
    <div className={styles.component}>
      {inputs.map((input, i) => (
        <div key={i} className={styles.input}>
          <span className={styles.name}>{input.name}</span>
          <span className={styles.eq}>=</span>
          <span className={styles.value}>
            <CopyText text={input.value.toString()} />
          </span>
          {i < len - 1 ? <span className={styles.comma}>,</span> : null}
        </div>
      ))}
    </div>
  )
}

export default Inputs
