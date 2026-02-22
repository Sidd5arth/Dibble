import { useEffect, useState } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--brutal-white)] z-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold text-[var(--brutal-black)] mb-4">
            Not Available on Mobile
          </h1>
          <p className="text-lg text-[var(--brutal-black)]/80 mb-6">
            This editor is designed for desktop and tablet devices. Please use a larger screen to access the editor.
          </p>
          <div className="bg-[var(--brutal-yellow)] border-2 border-[var(--brutal-black)] shadow-[4px_4px_0_var(--brutal-black)] p-4">
            <p className="text-sm font-semibold text-[var(--brutal-black)]">
              Minimum screen width: 768px
            </p>
          </div>
        </div>
      </div>
    )
  }

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
