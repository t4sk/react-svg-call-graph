import React from "react"
import styles from "./GraphController.module.css"

export const GraphController: React.FC<{
  zoomPercentage: number
  onClickPlus: () => void
  onClickMinus: () => void
  color?: string
  backgroundColor?: string
}> = ({
  zoomPercentage,
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
        {Math.round(zoomPercentage)}%
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
