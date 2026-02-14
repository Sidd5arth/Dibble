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

export const PropertiesPanel = observer(function PropertiesPanel() {
  const store = useEditorStore()
  const selected = store.objects.find((o) => store.selectedIds[0] === o.id)
  if (!selected) {
    return (
      <div className="w-64 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="px-3 py-2 border-b border-slate-700">
          <h3 className="font-semibold text-white text-sm">Properties</h3>
        </div>
        <div className="p-4 text-slate-500 text-sm">
          Select an object to edit its properties
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="px-3 py-2 border-b border-slate-700">
        <h3 className="font-semibold text-white text-sm">Properties</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Layer name</label>
          <input
            type="text"
            value={selected.name ?? ''}
            onChange={(e) =>
              store.updateObject(selected.id, {
                name: e.target.value || undefined,
              })
            }
            placeholder={getDefaultLabel(selected)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">X</label>
          <input
            type="number"
            value={Math.round(selected.x)}
            onChange={(e) =>
              store.updateObject(selected.id, { x: Number(e.target.value) })
            }
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Y</label>
          <input
            type="number"
            value={Math.round(selected.y)}
            onChange={(e) =>
              store.updateObject(selected.id, { y: Number(e.target.value) })
            }
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Width</label>
          <input
            type="number"
            value={Math.round(selected.width)}
            min={1}
            onChange={(e) =>
              store.updateObject(selected.id, { width: Number(e.target.value) })
            }
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Height</label>
          <input
            type="number"
            value={Math.round(selected.height)}
            min={1}
            onChange={(e) =>
              store.updateObject(selected.id, { height: Number(e.target.value) })
            }
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Rotation (°)</label>
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
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Fill</label>
          <input
            type="color"
            value={selected.fill}
            onChange={(e) =>
              store.updateObject(selected.id, { fill: e.target.value })
            }
            className="w-full h-8 bg-slate-700 border border-slate-600 rounded cursor-pointer"
          />
        </div>
        {selected.type === 'text' && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Text</label>
            <input
              type="text"
              value={selected.text}
              onChange={(e) =>
                store.updateObject(selected.id, { text: e.target.value })
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          </div>
        )}
        {selected.type === 'text' && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Font size</label>
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
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
})
