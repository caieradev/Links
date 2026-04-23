'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

interface MobileMenuProps {
  onNavigate: (id: string) => void
}

export function MobileMenu({ onNavigate }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (id: string) => {
    onNavigate(id)
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40">
          <div className="flex flex-col p-4 space-y-4">
            <button
              onClick={() => handleNavigate('features')}
              className="text-left text-gray-600 hover:text-gray-900 transition py-2"
            >
              Recursos
            </button>
            <button
              onClick={() => handleNavigate('pricing')}
              className="text-left text-gray-600 hover:text-gray-900 transition py-2"
            >
              Planos
            </button>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition text-center"
              onClick={() => setIsOpen(false)}
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
