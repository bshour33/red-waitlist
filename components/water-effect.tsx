"use client"

import { useRef, useEffect, useState } from "react"

export default function WaterEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentRef = useRef<number[][]>([])
  const previousRef = useRef<number[][]>([])
  const dampingRef = useRef<number>(0.97)
  const animationRef = useRef<number>(0)
  const [debug, setDebug] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    console.log("Water effect initialized")

    // Set canvas to full screen
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      console.log(`Canvas resized to ${canvas.width}x${canvas.height}`)

      // Initialize 2D arrays for the ripple effect
      const cols = Math.floor(canvas.width / 5)
      const rows = Math.floor(canvas.height / 5)

      currentRef.current = Array(cols)
        .fill(0)
        .map(() => Array(rows).fill(0))
      previousRef.current = Array(cols)
        .fill(0)
        .map(() => Array(rows).fill(0))
    }

    window.addEventListener("resize", resize)
    resize()

    // Handle clicks to create ripples
    const handleClick = (e: MouseEvent) => {
      const x = Math.floor(e.clientX / 5)
      const y = Math.floor(e.clientY / 5)

      console.log(`Click detected at ${e.clientX}, ${e.clientY} (grid: ${x}, ${y})`)
      setDebug({ x: e.clientX, y: e.clientY })

      // Create a ripple at the click point with a wider radius for smoother effect
      const radius = 8 // Larger radius
      for (let i = x - radius; i <= x + radius; i++) {
        for (let j = y - radius; j <= y + radius; j++) {
          if (
            i >= 0 &&
            i < previousRef.current.length &&
            j >= 0 &&
            previousRef.current[i] &&
            j < previousRef.current[i].length
          ) {
            // Calculate distance from center
            const distance = Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2))
            if (distance <= radius) {
              // Apply a smooth falloff based on distance
              const strength = 800 * (1 - distance / radius) // Much stronger ripple
              previousRef.current[i][j] = strength
            }
          }
        }
      }
    }

    // Make sure we're capturing clicks on the canvas
    canvas.addEventListener("click", handleClick)

    // Animation loop
    const animate = () => {
      // Clear with a fully black background
      ctx.fillStyle = "rgba(0, 0, 0, 1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Water ripple physics
      for (let i = 1; i < currentRef.current.length - 1; i++) {
        for (let j = 1; j < currentRef.current[i].length - 1; j++) {
          // Calculate the average of the surrounding cells
          currentRef.current[i][j] =
            (previousRef.current[i - 1][j] +
              previousRef.current[i + 1][j] +
              previousRef.current[i][j - 1] +
              previousRef.current[i][j + 1]) /
              2 -
            currentRef.current[i][j]

          // Apply damping
          currentRef.current[i][j] *= dampingRef.current

          // Draw the ripple
          const intensity = Math.abs(currentRef.current[i][j])
          if (intensity > 1) {
            // Lower threshold for more subtle effect
            // More pronounced displacement
            const displacement = currentRef.current[i][j] * 0.08 // Increased displacement

            // Draw with more visible gray tones
            const grayValue = Math.min(intensity * 1.2, 120) // Higher cap for more visibility
            ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, 0.7)` // Higher opacity

            // Draw larger pixels
            ctx.beginPath()
            ctx.arc(i * 5 + displacement, j * 5 + displacement, 4, 0, Math.PI * 2) // Larger radius
            ctx.fill()
          }
        }
      }

      // Draw debug indicator if needed
      if (debug) {
        ctx.beginPath()
        ctx.arc(debug.x, debug.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
        ctx.fill()
      }

      // Swap buffers
      const temp = previousRef.current
      previousRef.current = currentRef.current
      currentRef.current = temp

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("click", handleClick)
      cancelAnimationFrame(animationRef.current)
    }
  }, [debug])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 bg-black"
        style={{ pointerEvents: "auto" }} // Ensure clicks are captured
      />
      {/* Invisible overlay to ensure clicks are captured */}
      <div
        className="fixed inset-0 z-0"
        onClick={(e) => {
          console.log("Overlay clicked")
          const canvas = canvasRef.current
          if (canvas) {
            const rect = canvas.getBoundingClientRect()
            const event = new MouseEvent("click", {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true,
            })
            canvas.dispatchEvent(event)
          }
        }}
      />
    </>
  )
}

