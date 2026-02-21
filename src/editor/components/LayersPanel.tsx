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
    <div className="w-56 flex-shrink-0 bg-[var(--brutal-pink)] border-r-[3px] border-[var(--brutal-black)] flex flex-col min-h-0">
      <div className="px-3 py-2 border-b-[3px] border-[var(--brutal-black)] bg-[var(--brutal-white)]">
        <h3 className="font-bold text-[var(--brutal-black)] text-sm">
          LAYERS
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-[var(--brutal-pink)]">
        {store.objects.length === 0 ? (
          <p className="text-[var(--brutal-black)]/70 text-sm p-2 font-medium">
            No layers yet
          </p>
        ) : (
          <div className="space-y-2">
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
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-all cursor-grab active:cursor-grabbing border-2 border-[var(--brutal-black)] font-semibold ${
                    isSelected
                      ? 'bg-[var(--brutal-black)] text-[var(--brutal-yellow)] shadow-[3px_3px_0_var(--brutal-black)]'
                      : 'bg-[var(--brutal-white)] text-[var(--brutal-black)] shadow-[2px_2px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--brutal-black)]'
                  } ${isDragging ? 'opacity-50' : ''} ${
                    isDragOver
                      ? 'ring-2 ring-[var(--brutal-black)] ring-offset-2 ring-offset-[var(--brutal-pink)]'
                      : ''
                  }`}
                >
                  <GripVertical
                    size={14}
                    className="flex-shrink-0 opacity-70"
                  />
                  <Icon size={16} className="flex-shrink-0" strokeWidth={2.5} />
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
