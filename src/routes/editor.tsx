import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Canvas, Toolbar, LayersPanel, PropertiesPanel, EditorProvider, useEditorStore, useHistory } from '../editor'

export const Route = createFileRoute('/editor')({
  component: EditorPage,
})

function ZoomShortcuts() {
  const store = useEditorStore()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        store.zoomBy(0.2)
      } else if (e.key === '-') {
        e.preventDefault()
        store.zoomBy(-0.2)
      } else if (e.key === '0') {
        e.preventDefault()
        store.zoomReset()
      }
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [store])
  return null
}

function HistoryManager() {
  useHistory() // This sets up global undo/redo keyboard shortcuts
  return null
}

function EditorPage() {
  return (
    <EditorProvider>
      <ZoomShortcuts />
      <HistoryManager />
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Toolbar />
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <Canvas />
        </div>
        <LayersPanel />
        <PropertiesPanel />
      </div>
    </div>
    </EditorProvider>
  )
}
