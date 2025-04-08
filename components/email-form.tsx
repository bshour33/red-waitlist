"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Remove this import if you're not using it in this component
// import ContactForm from '@/components/ContactForm'

export default function EmailForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          isWaitlist: true 
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit email")
      }

      setSubmitted(true)
      setEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Thank You for Joining!</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          You're now on the exclusive waitlist. We'll notify you about upcoming product drops and special offers.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Join the Waitlist</h2>
          <p className="text-zinc-400">
            Be the first to know about our exclusive drops and special offers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <motion.div
              animate={{
                scale: focused ? 1.02 : 1,
                borderColor: focused ? "rgb(59, 130, 246)" : "rgb(63, 63, 70)"
              }}
              className="relative flex w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 text-base placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="relative inline-flex items-center rounded-r-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Join"
                )}
              </button>
            </motion.div>
            
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-6 left-0 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>

        <p className="text-center text-sm text-zinc-500">
          By joining, you agree to our{" "}
          <a href="/terms" className="text-blue-500 hover:text-blue-400 underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-500 hover:text-blue-400 underline">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  )
}