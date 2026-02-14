import { useEffect, useCallback } from 'react'
import { useEditorStore } from '../context/EditorContext'

/**
 * Hook for managing undo/redo functionality
 * Handles keyboard shortcuts and provides undo/redo functions
 */
export function useHistory() {
  const store = useEditorStore()

  const undo = useCallback(() => {
    if (store.canUndo) {
      store.undo()
    }
  }, [store])

  const redo = useCallback(() => {
    if (store.canRedo) {
      store.redo()
    }
  }, [store])

  const pushHistory = useCallback(() => {
    store.pushHistory()
  }, [store])

  // Global keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    undo,
    redo,
    pushHistory,
    canUndo: store.canUndo,
    canRedo: store.canRedo,
  }
}
