import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { text, isError }
  const timerRef = useRef(null)

  const showToast = useCallback((text, isError = false) => {
    clearTimeout(timerRef.current)
    setToast({ text, isError })
    timerRef.current = setTimeout(() => setToast(null), 2200)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${toast ? ' show' : ''}${toast?.isError ? ' error' : ''}`}>
        {toast?.text || ''}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
