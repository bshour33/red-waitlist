import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isWaitlist: true }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setIsSubmitted(true);
      } else {
        setMessage("Failed to join waitlist.");
      }
    } catch (error) {
      setMessage("Error sending request.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isSubmitted ? (
        <p className="text-green-500">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Join Waitlist
          </button>
        </form>
      )}
    </div>
  );
}
