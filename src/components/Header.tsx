import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import { Home, Menu, X } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="flex-shrink-0 p-4 flex items-center bg-[var(--brutal-yellow)] border-b-[3px] border-[var(--brutal-black)] h-16">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all"
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
        <h1 className="ml-4 text-xl font-bold">
          <Link
            to="/"
            className="text-[var(--brutal-black)] hover:underline font-extrabold"
          >
            DIBBLE
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-[var(--brutal-cyan)] border-r-[3px] border-[var(--brutal-black)] z-50 transform transition-transform duration-200 flex flex-col shadow-[4px_0_0_var(--brutal-black)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b-[3px] border-[var(--brutal-black)] bg-[var(--brutal-white)]">
          <h2 className="text-xl font-bold text-[var(--brutal-black)]">
            NAVIGATION
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-[var(--brutal-pink)] border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all"
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto bg-[var(--brutal-cyan)]">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 mb-2 bg-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all font-semibold"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 mb-2 bg-[var(--brutal-black)] text-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] font-semibold',
            }}
          >
            <Home size={20} strokeWidth={2.5} />
            <span>Home</span>
          </Link>
          <Link
            to="/editor"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 mb-2 bg-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all font-semibold"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 mb-2 bg-[var(--brutal-black)] text-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] font-semibold',
            }}
          >
            <span>Editor</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
