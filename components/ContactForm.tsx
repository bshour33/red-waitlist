"use client"
import EmailForm from '../components/email-form'
import type React from "react"
import { useState } from "react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Submitting contact form:", formData)
      
      // Send the contact form data to your API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          isWaitlist: false 
        })
      })

      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit form")
      }

      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        orderNumber: "",
        message: ""
      })
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-sm uppercase tracking-wider">THANK YOU FOR CONTACTING US</h2>
        <p className="text-sm uppercase tracking-wider max-w-md">
          WE WILL GET BACK TO YOU AS SOON AS POSSIBLE
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-center mb-6 uppercase text-sm tracking-wider">Contact Support</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs uppercase mb-1">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-xs uppercase mb-1">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        
        <div>
          <label htmlFor="orderNumber" className="block text-xs uppercase mb-1">Order Number (Optional)</label>
          <input
            id="orderNumber"
            name="orderNumber"
            type="text"
            value={formData.orderNumber}
            onChange={handleChange}
            disabled={loading}
            className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-xs uppercase mb-1">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </form>
    </div>
  )
}