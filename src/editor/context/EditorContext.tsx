import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { EditorStore } from '../store/EditorStore'

const EditorStoreContext = createContext<EditorStore | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => new EditorStore(), [])
  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  )
}

export function useEditorStore() {
  const store = useContext(EditorStoreContext)
  if (!store) {
    throw new Error('useEditorStore must be used within EditorProvider')
  }
  return store
}
