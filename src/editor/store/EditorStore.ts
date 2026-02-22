import { makeAutoObservable } from 'mobx'
import type { CanvasObject, Tool, Viewport, PathPoint } from '../types'
import { generateId } from '../utils/id'
import { createHistoryStore } from './history'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/coords'

// Center the canvas on initial render: viewport offset = center * (1 - zoom)
const initialViewport: Viewport = {
  x: (CANVAS_WIDTH / 2) * (1 - 4),
  y: (CANVAS_HEIGHT / 2) * (1 - 4),
  zoom: 4,
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

  setViewport(updates: Partial<Viewport>, canvasRect?: DOMRect) {
    // Round zoom and pan values to prevent floating point drift
    const roundedUpdates: Partial<Viewport> = { ...updates }
    let newZoom = updates.zoom !== undefined ? updates.zoom : this.viewport.zoom
    if (updates.zoom !== undefined) {
      newZoom = Math.round(updates.zoom * 1000000) / 1000000
      roundedUpdates.zoom = newZoom
    }
    
    // Calculate bounds for panning
    let newX = updates.x !== undefined ? updates.x : this.viewport.x
    let newY = updates.y !== undefined ? updates.y : this.viewport.y
    
    if (canvasRect && (updates.x !== undefined || updates.y !== undefined || updates.zoom !== undefined)) {
      const displayWidth = canvasRect.width
      const displayHeight = canvasRect.height
      
      // The coordinate system works like this:
      // 1. Canvas (CANVAS_WIDTH x CANVAS_HEIGHT) is scaled to fit display (displayWidth x displayHeight)
      // 2. We translate by (viewport.x, viewport.y) in buffer space
      // 3. We scale by zoom
      // 
      // In buffer space, viewport coordinates map to canvas coordinates:
      // bufferX = (displayX * CANVAS_WIDTH) / displayWidth
      // So the canvas spans from 0 to CANVAS_WIDTH in buffer space
      // After zoom, the visible area in buffer space = (display size * CANVAS_WIDTH / displayWidth) / zoom
      const scaleX = CANVAS_WIDTH / displayWidth
      const scaleY = CANVAS_HEIGHT / displayHeight
      const visibleWidth = (displayWidth * scaleX) / newZoom
      const visibleHeight = (displayHeight * scaleY) / newZoom
      
      // Canvas bounds in buffer space (actual canvas dimensions)
      const canvasMaxX = CANVAS_WIDTH
      const canvasMaxY = CANVAS_HEIGHT
      
      // Only clamp viewport position if visible area is smaller than canvas (zoomed in)
      // If visible area is larger than canvas (zoomed out), allow free panning
      if (visibleWidth <= canvasMaxX && visibleHeight <= canvasMaxY) {
        // Zoomed in: clamp to prevent showing empty space beyond canvas boundaries
        // viewport.x in [canvasMaxX*(1-zoom), 0] keeps design 0..CANVAS_WIDTH in view
        const minX = canvasMaxX * (1 - newZoom)
        const minY = canvasMaxY * (1 - newZoom)
        const maxX = 0
        const maxY = 0
        
        newX = Math.max(minX, Math.min(maxX, newX))
        newY = Math.max(minY, Math.min(maxY, newY))
      }
      // If zoomed out (visibleWidth > canvasMaxX or visibleHeight > canvasMaxY), allow panning without bounds
    }
    
    if (updates.x !== undefined) {
      roundedUpdates.x = Math.round(newX * 100) / 100
    }
    if (updates.y !== undefined) {
      roundedUpdates.y = Math.round(newY * 100) / 100
    }
    
    this.viewport = { ...this.viewport, ...roundedUpdates }
  }

  zoomBy(delta: number, min = 1, max = 4, canvasRect?: DOMRect) {
    const z1 = this.viewport.zoom
    const next = Math.max(min, Math.min(max, z1 * (1 + delta)))
    const z2 = Math.round(next * 1000000) / 1000000
    if (z2 === z1) return

    // Zoom from center: keep the design point at screen center fixed
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    const ratio = z2 / z1
    const newX = centerX * (1 - ratio) + this.viewport.x * ratio
    const newY = centerY * (1 - ratio) + this.viewport.y * ratio
    this.setViewport({ zoom: z2, x: newX, y: newY }, canvasRect)
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
