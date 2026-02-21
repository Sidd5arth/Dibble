import { makeAutoObservable } from 'mobx'
import type { CanvasObject, Tool, Viewport, PathPoint } from '../types'
import { generateId } from '../utils/id'
import { createHistoryStore } from './history'

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
}

export class EditorStore {
  objects: CanvasObject[] = []
  selectedIds: string[] = []
  tool: Tool = 'select'
  viewport: Viewport = initialViewport
  
  // Pen tool state
  penPoints: PathPoint[] = []
  isPenDrawing: boolean = false

  // History state - make it observable
  historyPastLength: number = 0
  historyFutureLength: number = 0

  private history = createHistoryStore()

  constructor() {
    makeAutoObservable(this, {
      history: false,
    } as { history: false })
    
    // Push initial state so first action can be undone
    this.history.push({ objects: [] })
    this.updateHistoryState()
  }

  setTool(tool: Tool) {
    this.tool = tool
  }

  addObject(obj: Omit<CanvasObject, 'id'>) {
    const newObj = { ...obj, id: generateId() }
    this.history.push({ objects: this.objects })
    this.objects = [...this.objects, newObj as CanvasObject]
    this.selectedIds = [newObj.id]
  }

  updateObject(id: string, updates: any) {
    this.objects = this.objects.map((o) =>
      o.id === id ? ({ ...o, ...updates } as CanvasObject) : o
    )
  }

  deleteSelected() {
    const ids = new Set(this.selectedIds)
    this.history.push({ objects: this.objects })
    this.objects = this.objects.filter((o) => !ids.has(o.id))
    this.selectedIds = []
  }

  setSelectedIds(ids: string[]) {
    this.selectedIds = ids
  }

  reorderObject(draggedId: string, targetIndex: number) {
    const fromIndex = this.objects.findIndex((o) => o.id === draggedId)
    if (fromIndex === -1) return
    const obj = this.objects[fromIndex]
    const newObjects = this.objects.filter((o) => o.id !== draggedId)
    const toIndex = Math.max(0, Math.min(targetIndex, newObjects.length))
    newObjects.splice(toIndex, 0, obj)
    this.history.push({ objects: this.objects })
    this.objects = newObjects
  }

  selectObject(id: string) {
    this.selectedIds = [id]
  }

  clearSelection() {
    this.selectedIds = []
  }

  undo() {
    const restored = this.history.undo({ objects: this.objects })
    if (restored) {
      this.objects = restored.objects
      this.updateHistoryState()
    }
  }

  redo() {
    const restored = this.history.redo({ objects: this.objects })
    if (restored) {
      this.objects = restored.objects
      this.updateHistoryState()
    }
  }

  get canUndo() {
    return this.historyPastLength > 0
  }

  get canRedo() {
    return this.historyFutureLength > 0
  }

  pushHistory() {
    this.history.push({ objects: this.objects })
    this.updateHistoryState()
  }

  private updateHistoryState() {
    this.historyPastLength = this.history.getPastLength()
    this.historyFutureLength = this.history.getFutureLength()
  }

  setViewport(updates: Partial<Viewport>) {
    this.viewport = { ...this.viewport, ...updates }
  }

  zoomBy(delta: number, min = 0.25, max = 4) {
    const next = Math.max(min, Math.min(max, this.viewport.zoom * (1 + delta)))
    this.setViewport({ zoom: next })
  }

  zoomReset() {
    this.setViewport({ zoom: 1, x: 0, y: 0 })
  }

  // Pen tool methods
  startPenPath() {
    this.isPenDrawing = true
    this.penPoints = []
  }

  addPenPoint(point: PathPoint) {
    this.penPoints = [...this.penPoints, point]
  }

  updateLastPenPoint(updates: Partial<PathPoint>) {
    if (this.penPoints.length === 0) return
    const last = this.penPoints[this.penPoints.length - 1]
    this.penPoints = [
      ...this.penPoints.slice(0, -1),
      { ...last, ...updates },
    ]
  }

  finishPenPath(closed: boolean = false) {
    if (this.penPoints.length < 2) {
      this.cancelPenPath()
      return
    }

    const xs = this.penPoints.map((p) => p.x)
    const ys = this.penPoints.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    const width = Math.max(maxX - minX, 10)
    const height = Math.max(maxY - minY, 10)

    // Convert points to be relative to the bounding box
    const relativePoints = this.penPoints.map((p) => ({
      x: p.x - minX,
      y: p.y - minY,
      handleIn: p.handleIn,
      handleOut: p.handleOut,
    }))

    this.history.push({ objects: this.objects })
    const newObj = {
      type: 'path' as const,
      x: minX,
      y: minY,
      width,
      height,
      rotation: 0,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2,
      opacity: 1,
      points: relativePoints,
      closed,
      id: generateId(),
    }
    this.objects = [...this.objects, newObj]
    this.selectedIds = [newObj.id]
    this.isPenDrawing = false
    this.penPoints = []
    this.tool = 'select'
  }

  cancelPenPath() {
    this.isPenDrawing = false
    this.penPoints = []
  }
}
