import React from "react"
import styles from "./Controller.module.css"

export const Controller: React.FC<{
  percentage: number
  onClickPlus: () => void
  onClickMinus: () => void
  color?: string
  backgroundColor?: string
}> = ({
  percentage,
  onClickPlus,
  onClickMinus,
  color = "white",
  backgroundColor = "black",
}) => {
  return (
    <div className={styles.component}>
      <button
        className={styles.buttonLeft}
        style={{ color, backgroundColor }}
        onClick={onClickMinus}
      >
        -
      </button>
      <div className={styles.level} style={{ color, backgroundColor }}>
        {Math.round(percentage)}%
      </div>
      <button
        className={styles.buttonRight}
        style={{ color, backgroundColor }}
        onClick={onClickPlus}
      >
        +
      </button>
    </div>
  )
}
