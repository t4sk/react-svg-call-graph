import React, { useRef, useState } from "react"
import useOutsideClick from "../../hooks/useOutsideClick"
import CopyText from "../CopyText"
import { Input } from "./types"
import styles from "./Inputs.module.css"
/*

.contract {
  cursor: pointer;
  padding: 0 2px 0 2px;
  border-radius: 2px;
  color: #72b0ff;
  transition: color 0.1s ease, background-color 0.1s ease;
}
.contract_highlight {
  cursor: pointer;
  padding: 0 2px 0 2px;
  border-radius: 2px;
  background-color: #66b2ff33;
  color: #ededef;
  outline: 1px solid #66b2ffa6;
  outline-offset: -1px;
  transition: color 0.1s ease, background-color 0.1s ease;
}
.label {
  color: var(--term-color-2);
  margin-right: 4px;
}
*/

const ModuleDropDown: React.FC<{
  highlight: boolean
  onMouseEnter: (address: string) => void
  onMouseLeave: (address: string) => void
  // func: FuncCall
}> = ({ highlight, onMouseEnter, onMouseLeave }) => {
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
      className={`relative ${highlight ? styles.contract_highlight : styles.contract}`}
      onMouseEnter={() => onMouseEnter(func.address)}
      onMouseLeave={() => onMouseLeave(func.address)}
    >
      {/*
      <span ref={trigger} onClick={onClick}>
        {func.label || fmt(func.address)}
      </span>
      */}
      <div
        ref={dropDown}
        className={`absolute left-0 z-10 mt-1 px-2 py-1 rounded-md border border-[color:var(--border-color)] bg-[color:var(--black)] transition-all duration-300 ease-in-out transform ${show ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
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

export default ModuleDropDown
