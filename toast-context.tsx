"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useRef } from "react"

type ToastType = "flower" | "saint" | "warning" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  // Monotonic counter — Date.now() can collide when toasts fire in the same
  // millisecond, which breaks React keys and dismisses the wrong toast.
  const idRef = useRef(0)

  const addToast = useCallback((message: string, type: ToastType) => {
    idRef.current += 1
    const id = idRef.current
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>
}
