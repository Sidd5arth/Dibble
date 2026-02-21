import { observer } from 'mobx-react-lite'
import { useEditorStore } from '../context/EditorContext'
import type { CanvasObject } from '../types'

function getDefaultLabel(obj: CanvasObject): string {
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

const inputClass =
  'w-full px-2 py-1.5 bg-[var(--brutal-white)] border-2 border-[var(--brutal-black)] text-[var(--brutal-black)] text-sm font-medium shadow-[2px_2px_0_var(--brutal-black)] focus:outline-none focus:shadow-[1px_1px_0_var(--brutal-black)] focus:translate-x-[1px] focus:translate-y-[1px] placeholder:text-[var(--brutal-black)]/50'

export const PropertiesPanel = observer(function PropertiesPanel() {
  const store = useEditorStore()
  const selected = store.objects.find((o) => store.selectedIds[0] === o.id)
  if (!selected) {
    return (
      <div className="w-64 flex-shrink-0 bg-[var(--brutal-green)] border-l-[3px] border-[var(--brutal-black)] flex flex-col min-h-0">
        <div className="px-3 py-2 border-b-[3px] border-[var(--brutal-black)] bg-[var(--brutal-white)]">
          <h3 className="font-bold text-[var(--brutal-black)] text-sm">
            PROPERTIES
          </h3>
        </div>
        <div className="p-4 text-[var(--brutal-black)]/80 text-sm font-medium">
          Select an object to edit its properties
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 flex-shrink-0 bg-[var(--brutal-green)] border-l-[3px] border-[var(--brutal-black)] flex flex-col min-h-0">
      <div className="px-3 py-2 border-b-[3px] border-[var(--brutal-black)] bg-[var(--brutal-white)]">
        <h3 className="font-bold text-[var(--brutal-black)] text-sm">
          PROPERTIES
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4 bg-[var(--brutal-green)]">
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Layer name
          </label>
          <input
            type="text"
            value={selected.name ?? ''}
            onChange={(e) =>
              store.updateObject(selected.id, {
                name: e.target.value || undefined,
              })
            }
            placeholder={getDefaultLabel(selected)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            X
          </label>
          <input
            type="number"
            value={Math.round(selected.x)}
            onChange={(e) =>
              store.updateObject(selected.id, { x: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Y
          </label>
          <input
            type="number"
            value={Math.round(selected.y)}
            onChange={(e) =>
              store.updateObject(selected.id, { y: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Width
          </label>
          <input
            type="number"
            value={Math.round(selected.width)}
            min={1}
            onChange={(e) =>
              store.updateObject(selected.id, { width: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Height
          </label>
          <input
            type="number"
            value={Math.round(selected.height)}
            min={1}
            onChange={(e) =>
              store.updateObject(selected.id, { height: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Rotation (°)
          </label>
          <input
            type="number"
            value={Math.round(selected.rotation)}
            min={-360}
            max={360}
            onChange={(e) =>
              store.updateObject(selected.id, {
                rotation: Number(e.target.value),
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
            Fill
          </label>
          <input
            type="color"
            value={selected.fill}
            onChange={(e) =>
              store.updateObject(selected.id, { fill: e.target.value })
            }
            className="w-full h-10 bg-[var(--brutal-white)] border-2 border-[var(--brutal-black)] cursor-pointer shadow-[2px_2px_0_var(--brutal-black)]"
          />
        </div>
        {selected.type === 'text' && (
          <div>
            <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
              Text
            </label>
            <input
              type="text"
              value={selected.text}
              onChange={(e) =>
                store.updateObject(selected.id, { text: e.target.value })
              }
              className={inputClass}
            />
          </div>
        )}
        {selected.type === 'text' && (
          <div>
            <label className="block text-xs font-bold text-[var(--brutal-black)] mb-1">
              Font size
            </label>
            <input
              type="number"
              value={selected.fontSize}
              min={8}
              max={200}
              onChange={(e) =>
                store.updateObject(selected.id, {
                  fontSize: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
        )}
      </div>
    </div>
  )
})
