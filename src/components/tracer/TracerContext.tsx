import React, { useState, createContext, useContext, useMemo }  from "react"

export type State = {
  hover: number | null
  pins: { [key: number]: boolean }
  hidden: { [key: number]: boolean }
}

const STATE: State = { hidden: {}, hover: null, pins: {} }

const TracerContext = createContext({
  state: STATE,
  fold: (_: number) => {},
  setHover: (_: number | null) => {},
  pin: (_: number) => {}
})

export function useTracerContext() {
  return useContext(TracerContext)
}

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children
}) =>  {
  const [state, setState] = useState<State>(STATE)

  const fold = (id: number) => {
    setState(state => ({
      ...state,
      hidden: {
        ...state.hidden,
        [id]: !state.hidden[id]
      }
    }))
  }

  const setHover = (id: number | null) => {
    setState(state => ({
      ...state,
      hover: id
    }))
  }

  const pin = (id: number) => {
    setState(state => ({
      ...state,
      pins: {
        ...state.pins,
        [id]: !state.pins[id]
      }
    }))
  }

  const value = useMemo(
    () => ({
      state,
      fold,
      setHover,
      pin,
    }), [state]
  )

  return (
    <TracerContext.Provider value={value}>
      {children}
    </TracerContext.Provider>
  )
}
