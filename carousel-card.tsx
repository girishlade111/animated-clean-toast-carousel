import type React from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AppCardProps {
  Icon: LucideIcon
  title: string
  description: string
  onClick: () => void
}

export const AppCard: React.FC<AppCardProps> = ({ Icon, title, description, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-xl p-6 shadow-md cursor-pointer w-64 h-72 flex flex-col justify-between transition-colors duration-300 hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 font-figtree">{title}</h2>
        <p className="text-gray-600 text-sm font-figtree font-light">{description}</p>
      </div>
      <div className="mt-4 text-indigo-600 text-sm font-figtree font-medium">Click Me</div>
    </motion.div>
  )
}
