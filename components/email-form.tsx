"use client"

import type React from "react"
import { useState } from "react"

// Remove this import if you're not using it in this component
// import ContactForm from '@/components/ContactForm'

export default function EmailForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Submitting email:", email)
      
      // Send the email to your API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          isWaitlist: true 
        })
      })

      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit email")
      }

      setSubmitted(true)
      setEmail("")
    } catch (err) {
      console.error("Error submitting email:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-sm uppercase tracking-wider">THANK YOU FOR SIGNING UP</h2>
        <p className="text-sm uppercase tracking-wider max-w-md">
          YOU WILL BE NOTIFIED VIA EMAIL ABOUT UPCOMING PRODUCT DROPS
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="text-center mb-4 uppercase text-sm tracking-wider">Sign up for access</p>

      <form onSubmit={handleSubmit} className="flex w-full flex-col">
        <div className="flex w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter E-Mail"
            required
            disabled={loading}
            className="flex-1 bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-800 border border-zinc-700 border-l-0 px-4 py-2 text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </form>
    </div>
  )
}