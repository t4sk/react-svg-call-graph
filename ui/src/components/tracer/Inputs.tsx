import React from "react"
import styles from "./Inputs.module.css"
import { Input } from "./types"

const Inputs: React.FC<{ inputs: Input[] }> = ({ inputs }) => {
  // TODO: highight address type
  const len = inputs.length
  return (
    <div className={styles.component}>
      {inputs.map((input, i) => (
        <div key={i} className={styles.input}>
          <span className={styles.name}>{input.name}</span>
          <span className={styles.eq}>=</span>
          <span className={styles.value}>{input.value.toString()}</span>
          {i < len - 1 ? <span className={styles.comma}>,</span> : null}
        </div>
      ))}
    </div>
  )
}

export default Inputs
