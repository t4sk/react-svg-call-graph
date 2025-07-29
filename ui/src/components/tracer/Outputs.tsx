import React from "react"
import styles from "./Inputs.module.css"
import {Output} from "./types"

const Outputs: React.FC<{outputs: Output[]}> = ({outputs}) => {
  // TODO: highight address type
  const len = outputs.length
  return (
    <div className={styles.component}>
    {outputs.map((output, i) => (
      <div key={i} className={styles.output}>
        {output.name ? (
          <>
            <span className={styles.name}>{output.name}</span>
            <span className={styles.eq}>=</span>
          </>
        ) : null}
        <span className={styles.value}>{output.value.toString()}</span>
        {i < len - 1 ? (
          <span className={styles.comma}>,</span>
        ) : null}
      </div>
    ))}
    </div>
  )
}

export default Outputs
