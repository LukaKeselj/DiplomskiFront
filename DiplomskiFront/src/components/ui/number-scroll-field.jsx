import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const PIXELS_PER_STEP = 12
const HOLD_REPEAT_DELAY = 350
const HOLD_REPEAT_INTERVAL = 100

export function NumberScrollField({ id, label, value, onChange, min = 0, max = Infinity, step = 1, suffix, className }) {
  const dragRef = useRef(null)
  const holdRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => () => clearTimeout(holdRef.current), [])

  function clamp(next) {
    return Math.min(max, Math.max(min, next))
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { startY: event.clientY, startValue: value }
    setIsDragging(true)
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return
    const deltaY = dragRef.current.startY - event.clientY
    const steps = Math.round(deltaY / PIXELS_PER_STEP)
    const next = clamp(dragRef.current.startValue + steps * step)
    if (next !== value) onChange(next)
  }

  function handlePointerUp(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setIsDragging(false)
  }

  function handleWheel(event) {
    const direction = event.deltaY > 0 ? -1 : 1
    onChange(clamp(value + direction * step))
  }

  function startHold(direction) {
    onChange((current) => clamp(current + direction * step))
    clearTimeout(holdRef.current)
    holdRef.current = setTimeout(function repeat() {
      onChange((current) => clamp(current + direction * step))
      holdRef.current = setTimeout(repeat, HOLD_REPEAT_INTERVAL)
    }, HOLD_REPEAT_DELAY)
  }

  function stopHold() {
    clearTimeout(holdRef.current)
    holdRef.current = null
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm leading-none font-medium">
          {label}
        </label>
      )}
      <div
        className={cn(
          "border-input bg-muted/40 dark:bg-input/30 flex flex-col items-stretch overflow-hidden rounded-md border shadow-xs transition-colors",
          isDragging && "border-primary"
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent border-input/60 flex items-center justify-center border-b py-2.5 transition-colors select-none"
          onPointerDown={(event) => {
            event.preventDefault()
            startHold(1)
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <ChevronUp className="size-4" />
        </button>
        <div
          id={id}
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max === Infinity ? undefined : max}
          className={cn(
            "flex touch-none items-baseline justify-center gap-1 py-2.5 text-xl font-semibold tabular-nums select-none active:cursor-grabbing",
            isDragging && "bg-primary/10 text-primary"
          )}
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {value}
          {suffix && <span className="text-muted-foreground text-sm font-normal">{suffix}</span>}
        </div>
        <button
          type="button"
          tabIndex={-1}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent border-input/60 flex items-center justify-center border-t py-2.5 transition-colors select-none"
          onPointerDown={(event) => {
            event.preventDefault()
            startHold(-1)
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  )
}
