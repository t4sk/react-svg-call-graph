import React, { useState, createContext, useContext, useMemo }  from "react"

export type State = {
  hover: number | null
  pin: number | null
  hidden: { [key: number]: boolean }
}

const STATE: State = { hidden: {}, hover: null, pin: null }

const TracerContext = createContext({
  state: STATE,
  fold: (_: number) => {},
  setHover: (_: number | null) => {}
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

  const value = useMemo(
    () => ({
      state,
      fold,
      setHover,
    }), [state]
  )

  return (
    <TracerContext.Provider value={value}>
      {children}
    </TracerContext.Provider>
  )
}
