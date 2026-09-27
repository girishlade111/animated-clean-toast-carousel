"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AppCard } from "./carousel-card"

const noScrollbarCSS = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

interface CarouselProps {
  items: Array<{
    Icon: LucideIcon
    title: string
    description: string
    action: () => void
  }>
}

export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    updateScrollButtons()
    carousel.addEventListener("scroll", updateScrollButtons, { passive: true })
    window.addEventListener("resize", updateScrollButtons)
    return () => {
      carousel.removeEventListener("scroll", updateScrollButtons)
      window.removeEventListener("resize", updateScrollButtons)
    }
  }, [updateScrollButtons, items.length])

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2

      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <>
      <style>{noScrollbarCSS}</style>
      <div className="relative w-full max-w-5xl p-8 rounded-3xl bg-white/30 backdrop-blur-xl">
        <motion.div
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto py-4 no-scrollbar"
          style={{ scrollSnapType: "x mandatory", msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {items.map((item, index) => (
            <motion.div key={index} className="flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
              <AppCard Icon={item.Icon} title={item.title} description={item.description} onClick={item.action} />
            </motion.div>
          ))}
        </motion.div>
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              type="button"
              aria-label="Scroll carousel left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("left")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg transition-colors hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              type="button"
              aria-label="Scroll carousel right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("right")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg transition-colors hover:bg-white"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
