import type { CanvasObject } from '../types'

const MAX_HISTORY = 50

export interface HistoryState {
  objects: CanvasObject[]
}


export function createHistoryStore() {
  let past: HistoryState[] = []
  let future: HistoryState[] = []

  return {
    push(state: HistoryState) {
      // Only push if state is different from the last one
      console.log('push', state);
      const lastState = past[past.length - 1]
      const stateStr = JSON.stringify(state)
      const lastStr = lastState ? JSON.stringify(lastState) : null
      console.log(stateStr)
      if (stateStr === lastStr) return
      
      past.push(JSON.parse(stateStr))
      future = []
      
      // Keep only MAX_HISTORY items
      if (past.length > MAX_HISTORY) {
        past = past.slice(-MAX_HISTORY)
      }
    },

    undo(current: HistoryState): HistoryState | null {
      console.log('undo', current);
      if (past.length === 0) return null
      future.unshift(JSON.parse(JSON.stringify(current)))
      const prev = past.pop()!
      console.log('prev', prev)
      return prev
    },

    redo(current: HistoryState): HistoryState | null {
      console.log('redo', current);
      if (future.length === 0) return null
      past.push(JSON.parse(JSON.stringify(current)))
      const next = future.shift()!
      return next
    },

    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    
    // Debug helpers
    getPastLength: () => past.length,
    getFutureLength: () => future.length,
  }
}

export type HistoryStore = ReturnType<typeof createHistoryStore>
