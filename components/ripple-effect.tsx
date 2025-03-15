"use client"

import { useState, useEffect } from "react"

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export default function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        id: counter,
        x: e.clientX,
        y: e.clientY,
        size: 50, // Fixed size for consistency
      }

      setRipples((prev) => [...prev, newRipple])
      setCounter((prev) => prev + 1)

      // Remove the ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
      }, 2000)
    }

    window.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("click", handleClick)
    }
  }, [counter])

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: "50%",
            border: "4px solid rgba(255, 255, 255, 0.8)",
            animation: "ripple 2s ease-out forwards",
          }}
        />
      ))}
    </div>
  )
}

