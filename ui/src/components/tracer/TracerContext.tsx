import React, { useState, createContext, useContext, useMemo } from "react"

export type State = {
  hover: number | null
  pins: Set<number>
  hidden: Set<number>
}

const STATE: State = { hidden: new Set(), hover: null, pins: new Set() }

const TracerContext = createContext({
  state: STATE,
  fold: (_: number) => {},
  setHover: (_: number | null) => {},
  pin: (_: number) => {},
})

export function useTracerContext() {
  return useContext(TracerContext)
}

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<State>(STATE)

  const fold = (id: number) => {
    const hidden = new Set(state.hidden)
    if (hidden.has(id)) {
      hidden.delete(id)
    } else {
      hidden.add(id)
    }

    setState((state) => ({
      ...state,
      hidden,
    }))
  }

  const setHover = (id: number | null) => {
    setState((state) => ({
      ...state,
      hover: id,
    }))
  }

  const pin = (id: number) => {
    const pins = new Set(state.pins)
    if (pins.has(id)) {
      pins.delete(id)
    } else {
      pins.add(id)
    }

    setState((state) => ({
      ...state,
      pins,
    }))
  }

  const value = useMemo(
    () => ({
      state,
      fold,
      setHover,
      pin,
    }),
    [state],
  )

  return (
    <TracerContext.Provider value={value}>{children}</TracerContext.Provider>
  )
}
