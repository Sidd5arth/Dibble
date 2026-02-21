import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Canvas, LayersPanel, PropertiesPanel, EditorProvider, useEditorStore, useHistory } from '../editor'
import EditorHeader from '../components/EditorHeader'

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
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <EditorProvider>
      <ZoomShortcuts />
      <HistoryManager />
      <EditorHeader />
      <div className="fixed top-16 left-0 right-0 bottom-0 flex flex-col overflow-hidden bg-[var(--brutal-white)]">
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <LayersPanel />
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
            <Canvas />
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </EditorProvider>
  )
}
