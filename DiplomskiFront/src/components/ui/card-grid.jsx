import { forwardRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
}

const hoverAnimation = {
  y: -4,
  scale: 1.02,
  boxShadow: "0 16px 32px -12px rgba(0,0,0,0.22)",
  transition: { type: "spring", stiffness: 400, damping: 22 },
}

const CardGrid = forwardRef(function CardGrid({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cn(className)} {...props}>
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  )
})

function CardGridItem({ className, children, hover = true, ...props }) {
  return (
    <motion.div
      layout
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={itemVariants}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      whileHover={hover ? hoverAnimation : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={cn("rounded-xl", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { CardGrid, CardGridItem }
