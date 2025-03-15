"use client"

import { useState } from "react";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm uppercase tracking-wider">Contact Us</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            &times;
          </button>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <footer className="border-t border-zinc-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-zinc-400">&copy; {new Date().getFullYear()} RED. All rights reserved.</p>
          </div>
          
          <nav className="flex space-x-6">
            <Link href="/terms" className="text-xs uppercase text-zinc-400 hover:text-white transition">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs uppercase text-zinc-400 hover:text-white transition">
              Privacy
            </Link>
            <button 
              onClick={() => setShowContactModal(true)}
              className="text-xs uppercase text-zinc-400 hover:text-white transition"
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
      
      {showContactModal && <Modal onClose={() => setShowContactModal(false)} />}
    </footer>
  );
}