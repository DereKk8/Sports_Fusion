"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoadingStateProps {
  isLoading?: boolean
  onComplete?: () => void
}

export function LoadingState({ isLoading = true, onComplete }: LoadingStateProps) {
  const [show, setShow] = useState(isLoading)

  useEffect(() => {
    setShow(isLoading)

    if (!isLoading && onComplete) {
      const timer = setTimeout(() => {
        onComplete()
      }, 500) // Allow exit animation to complete

      return () => clearTimeout(timer)
    }
  }, [isLoading, onComplete])

  if (!show) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/60 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fog overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 to-[#050505]/50 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-5 mix-blend-overlay pointer-events-none"></div>

      {/* Spinner container */}
      <div className="relative z-10">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Custom spinner */}
          <div className="relative w-24 h-24">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-3 border-t-transparent border-l-transparent border-r-gray-400 border-b-white"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />

            {/* Inner ring */}
            <motion.div
              className="absolute inset-3 rounded-full border-3 border-b-transparent border-r-transparent border-l-gray-400 border-t-white"
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />

            {/* Center dot with gradient */}
            <motion.div
              className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gradient-to-r from-white to-gray-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 