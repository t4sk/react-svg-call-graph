import React, { useState, createContext, useContext, useMemo }  from "react"

export type State = {
  hover: number | null
  pin: number | null
  hidden: { [key: number]: boolean }
}

const STATE: State = { hidden: {}, hover: null, pin: null }

const TracerContext = createContext({
  state: STATE,
  toggle: (_: number) => {}
})

export function useTracerContext() {
  return useContext(TracerContext)
}

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children
}) =>  {
  const [state, setState] = useState<State>(STATE)

  const toggle = (id: number) => {
    setState(state => ({
      ...state,
      hidden: {
        ...state.hidden,
        [id]: !state.hidden[id]
      }
    }))
  }

  const value = useMemo(
    () => ({
      state,
      toggle
    }), [state]
  )

  return (
    <TracerContext.Provider value={value}>
      {children}
    </TracerContext.Provider>
  )
}
