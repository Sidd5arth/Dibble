import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Home,
  Menu,
  X,
  MousePointer2,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Pen,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEditorStore } from '../editor/context/EditorContext'
import type { Tool } from '../editor/types'

const tools: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'pen', icon: Pen, label: 'Pen' },
]

const EditorHeader = observer(function EditorHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const store = useEditorStore()

  const btnBase =
    'p-1.5 border-2 border-[var(--brutal-black)] shadow-[2px_2px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--brutal-black)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-0 disabled:hover:shadow-[2px_2px_0_var(--brutal-black)]'
  const btnActive = 'bg-[var(--brutal-black)] text-[var(--brutal-yellow)]'
  const btnInactive = 'bg-[var(--brutal-white)] text-[var(--brutal-black)]'

  return (
    <>
      <header className="flex-shrink-0 h-16 px-4 flex items-center gap-4 bg-[var(--brutal-yellow)] border-b-[3px] border-[var(--brutal-black)]">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
        <Link
          to="/"
          className="text-[var(--brutal-black)] hover:underline font-extrabold text-xl shrink-0"
        >
          DIBBLE
        </Link>

        <div className="flex-1 flex items-center gap-2 justify-center min-w-0">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => store.setTool(id)}
              title={label}
              className={`${btnBase} shrink-0 ${
                store.tool === id ? btnActive : btnInactive
              }`}
            >
              <Icon size={18} strokeWidth={2.5} />
            </button>
          ))}
          <div className="w-[2px] h-5 bg-[var(--brutal-black)] mx-1 shrink-0" />
          <button
            onClick={() => store.undo()}
            disabled={!store.canUndo}
            title="Undo"
            className={`${btnBase} shrink-0 ${btnInactive}`}
          >
            <Undo2 size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => store.redo()}
            disabled={!store.canRedo}
            title="Redo"
            className={`${btnBase} shrink-0 ${btnInactive}`}
          >
            <Redo2 size={18} strokeWidth={2.5} />
          </button>
          <div className="w-[2px] h-5 bg-[var(--brutal-black)] mx-1 shrink-0" />
          <button
            onClick={() => store.deleteSelected()}
            disabled={store.selectedIds.length === 0}
            title="Delete"
            className={`${btnBase} shrink-0 bg-[var(--brutal-red)] text-white border-[var(--brutal-black)]`}
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
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
})

export default EditorHeader
