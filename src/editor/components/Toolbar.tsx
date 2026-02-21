import { observer } from 'mobx-react-lite'
import { MousePointer2, Square, Circle, Type, Undo2, Redo2, Trash2, Pen } from 'lucide-react'
import { useEditorStore } from '../context/EditorContext'
import type { Tool } from '../types'

const tools: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'pen', icon: Pen, label: 'Pen' },
]

export const Toolbar = observer(function Toolbar() {
  const store = useEditorStore()

  const btnBase =
    'p-2 border-2 border-[var(--brutal-black)] shadow-[3px_3px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--brutal-black)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-0 disabled:hover:shadow-[3px_3px_0_var(--brutal-black)]'

  const btnActive = 'bg-[var(--brutal-black)] text-[var(--brutal-yellow)]'
  const btnInactive = 'bg-[var(--brutal-white)] text-[var(--brutal-black)]'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--brutal-cyan)] border-b-[3px] border-[var(--brutal-black)]">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => store.setTool(id)}
          title={label}
          className={`${btnBase} ${
            store.tool === id ? btnActive : btnInactive
          }`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </button>
      ))}

      <div className="w-[2px] h-6 bg-[var(--brutal-black)] mx-2" />

      <button
        onClick={() => store.undo()}
        disabled={!store.canUndo}
        title="Undo"
        className={`${btnBase} ${btnInactive}`}
      >
        <Undo2 size={20} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => store.redo()}
        disabled={!store.canRedo}
        title="Redo"
        className={`${btnBase} ${btnInactive}`}
      >
        <Redo2 size={20} strokeWidth={2.5} />
      </button>

      <div className="w-[2px] h-6 bg-[var(--brutal-black)] mx-2" />

      <button
        onClick={() => store.deleteSelected()}
        disabled={store.selectedIds.length === 0}
        title="Delete"
        className={`${btnBase} bg-[var(--brutal-red)] text-white border-[var(--brutal-black)]`}
      >
        <Trash2 size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
})
