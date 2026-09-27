"use client"

import type React from "react"
import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flower, Cross, AlertTriangle, Info, X } from "lucide-react"
import { useToast } from "./toast-context"

const icons = {
  flower: Flower,
  saint: Cross,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  flower: "text-pink-500",
  saint: "text-indigo-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
}

interface ToastProps {
  id: number
  message: string
  type: "flower" | "saint" | "warning" | "info"
  /** Auto-dismiss delay in ms. Defaults to 3000. */
  duration?: number
}

const AnimatedToast: React.FC<ToastProps> = ({ id, message, type, duration = 3000 }) => {
  const { removeToast } = useToast()
  const Icon = icons[type]

  const handleRemove = useCallback(() => {
    removeToast(id)
  }, [id, removeToast])

  useEffect(() => {
    const timer = setTimeout(handleRemove, duration)
    return () => clearTimeout(timer)
  }, [handleRemove, duration])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
      }}
      className="bg-white backdrop-blur-md rounded-2xl shadow-lg p-4 w-80 flex items-start space-x-3 mb-4"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${colors[type]}`} />
      <p className="flex-1 text-sm font-medium text-gray-800 font-figtree">{message}</p>
      <button
        onClick={handleRemove}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {toasts.map((toast) => (
          <AnimatedToast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
