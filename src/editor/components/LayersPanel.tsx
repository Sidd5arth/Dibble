import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Square, Circle, Type, Image, GripVertical } from 'lucide-react'
import { useEditorStore } from '../context/EditorContext'
import type { CanvasObject } from '../types'

function getIcon(type: CanvasObject['type']) {
  switch (type) {
    case 'rect':
      return Square
    case 'ellipse':
      return Circle
    case 'text':
      return Type
    case 'image':
      return Image
    default:
      return Square
  }
}

function getLabel(obj: CanvasObject): string {
  if (obj.name?.trim()) return obj.name.trim()
  switch (obj.type) {
    case 'rect':
      return 'Rectangle'
    case 'ellipse':
      return 'Ellipse'
    case 'text':
      return obj.text || 'Text'
    case 'image':
      return 'Image'
    default:
      return 'Layer'
  }
}

export const LayersPanel = observer(function LayersPanel() {
  const store = useEditorStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const layers = [...store.objects].reverse()

  const handleDragStart = (e: React.DragEvent, obj: CanvasObject) => {
    setDraggedId(obj.id)
    e.dataTransfer.setData('text/plain', obj.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, displayIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(displayIndex)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (
    e: React.DragEvent,
    dropDisplayIndex: number,
    targetObj: CanvasObject
  ) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id || id === targetObj.id) return

    const targetArrayIndex = store.objects.length - 1 - dropDisplayIndex
    store.reorderObject(id, targetArrayIndex)
    setDraggedId(null)
    setDragOverIndex(null)
  }

  return (
    <div className="w-56 bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="px-3 py-2 border-b border-slate-700">
        <h3 className="font-semibold text-white text-sm">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {store.objects.length === 0 ? (
          <p className="text-slate-500 text-sm p-2">No layers yet</p>
        ) : (
          <div className="space-y-1">
            {layers.map((obj, displayIndex) => {
              const Icon = getIcon(obj.type)
              const isSelected = store.selectedIds.includes(obj.id)
              const isDragging = draggedId === obj.id
              const isDragOver = dragOverIndex === displayIndex

              return (
                <div
                  key={obj.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, obj)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, displayIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, displayIndex, obj)}
                  onClick={() => store.setSelectedIds([obj.id])}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } ${isDragging ? 'opacity-50' : ''} ${
                    isDragOver ? 'ring-2 ring-cyan-400 ring-inset' : ''
                  }`}
                >
                  <GripVertical
                    size={14}
                    className="flex-shrink-0 text-slate-500 drag-handle"
                  />
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="truncate text-sm flex-1">{getLabel(obj)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
