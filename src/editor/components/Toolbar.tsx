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

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 border-b border-slate-700">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => store.setTool(id)}
          title={label}
          className={`p-2 rounded-lg transition-colors ${
            store.tool === id
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Icon size={20} />
        </button>
      ))}

      <div className="w-px h-6 bg-slate-600 mx-2" />

      <button
        onClick={() => store.undo()}
        disabled={!store.canUndo}
        title="Undo"
        className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Undo2 size={20} />
      </button>
      <button
        onClick={() => store.redo()}
        disabled={!store.canRedo}
        title="Redo"
        className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Redo2 size={20} />
      </button>

      <div className="w-px h-6 bg-slate-600 mx-2" />

      <button
        onClick={() => store.deleteSelected()}
        disabled={store.selectedIds.length === 0}
        title="Delete"
        className="p-2 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 size={20} />
      </button>
    </div>
  )
})
