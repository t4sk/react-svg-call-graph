import React, { useRef, useState } from "react"
import useOutsideClick from "../../hooks/useOutsideClick"
import CopyText from "../CopyText"
import { Input } from "./types"
import styles from "./DropDown.module.css"

const DropDown: React.FC<{
  label: string
  highlight: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  // func: FuncCall
}> = ({ label, highlight, onMouseEnter, onMouseLeave }) => {
  const trigger = useRef<HTMLDivElement | null>(null)
  const dropDown = useRef<HTMLDivElement | null>(null)
  const [show, set] = useState(false)

  useOutsideClick(dropDown, (e) => {
    if (show && e.target != trigger.current) {
      set(false)
    }
  })

  const onClick = () => {
    set(!show)
  }

  // TODO: css
  return (
    <div
      className={`${styles.component} ${highlight ? styles.contract_highlight : styles.contract}`}
      onMouseEnter={() => onMouseEnter()}
      onMouseLeave={() => onMouseLeave()}
    >
      <span ref={trigger} onClick={onClick}>
        {label}
      </span>
      <div
        ref={dropDown}
        className={`${styles.tooltip} ${show ? styles.show : ""}`}
      >
        <div className="flex flex-row items-center">
          <span className={styles.label}>address</span>
          {/*
          <CopyText text={func.address} />
          */}
        </div>
      </div>
    </div>
  )
}

export default DropDown
