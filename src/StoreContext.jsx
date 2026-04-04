import { createContext, useContext, useEffect, useState } from 'react'
import { store } from './store'

const StoreContext = createContext()

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => store.getState())

  useEffect(() => {
    const unsub = store.subscribe(setState)
    return unsub
  }, [])

  return (
    <StoreContext.Provider value={{ state, store }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
