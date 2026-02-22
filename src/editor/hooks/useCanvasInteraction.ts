import { useRef, useCallback } from 'react'
import { screenToCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/coords'
import { hitTest } from '../utils/hitTest'
import { useEditorStore } from '../context/EditorContext'
import type { CanvasObject } from '../types'

export interface ViewportApi {
  getCanvasRect: () => DOMRect
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number }
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate' | null

const EDGE_HIT_THRESHOLD = 8
const CORNER_HIT_THRESHOLD = 8

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  const nearestX = x1 + t * dx
  const nearestY = y1 + t * dy
  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2)
}

function distToPoint(px: number, py: number, x: number, y: number): number {
  return Math.sqrt((px - x) ** 2 + (py - y) ** 2)
}

function getHandle(
  obj: CanvasObject,
  localX: number,
  localY: number
): Handle {
  const padding = 4
  const x = -padding
  const y = -padding
  const w = obj.width + padding * 2
  const h = obj.height + padding * 2

  const rotateHandleCenterX = obj.width / 2
  const rotateHandleCenterY = -24
  const distToRotate = Math.sqrt(
    (localX - rotateHandleCenterX) ** 2 + (localY - rotateHandleCenterY) ** 2
  )
  if (distToRotate <= 12) return 'rotate'

  const corners: [number, number, Handle][] = [
    [x, y, 'nw'],
    [x + w, y, 'ne'],
    [x + w, y + h, 'se'],
    [x, y + h, 'sw'],
  ]

  for (const [cx, cy, name] of corners) {
    if (distToPoint(localX, localY, cx, cy) <= CORNER_HIT_THRESHOLD) {
      return name
    }
  }

  const edges: [number, number, number, number, Handle][] = [
    [x, y, x + w, y, 'n'],
    [x + w, y, x + w, y + h, 'e'],
    [x + w, y + h, x, y + h, 's'],
    [x, y + h, x, y, 'w'],
  ]

  for (const [x1, y1, x2, y2, name] of edges) {
    if (distToSegment(localX, localY, x1, y1, x2, y2) <= EDGE_HIT_THRESHOLD) {
      return name
    }
  }

  return null
}

export function useCanvasInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  viewport?: ViewportApi
) {
  const store = useEditorStore()
  const dragRef = useRef<{
    type: 'move' | 'resize' | 'rotate' | 'pen-drag' | 'pan'
    obj: CanvasObject
    handle: Handle
    startX: number
    startY: number
    startObj: { x: number; y: number; width: number; height: number; rotation: number }
    startViewportX?: number
    startViewportY?: number
    startScreenX?: number
    startScreenY?: number
  } | null>(null)

  const getCanvasRect = useCallback(
    () => viewport?.getCanvasRect() ?? canvasRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0),
    [canvasRef, viewport]
  )

  const toCanvas = useCallback(
    (screenX: number, screenY: number) =>
      viewport
        ? viewport.screenToCanvas(screenX, screenY)
        : screenToCanvas(screenX, screenY, store.viewport, getCanvasRect()),
    [viewport, store.viewport, getCanvasRect]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)

      // Check for shift+click or middle mouse to pan
      if (e.shiftKey || e.button === 1) {
        dragRef.current = {
          type: 'pan',
          obj: store.objects[0], // dummy
          handle: null,
          startX: 0,
          startY: 0,
          startObj: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
          startViewportX: store.viewport.x,
          startViewportY: store.viewport.y,
          startScreenX: e.clientX,
          startScreenY: e.clientY,
        }
        return
      }

      const { objects, selectedIds, tool } = store
      const { x, y } = toCanvas(e.clientX, e.clientY)

      if (tool === 'select') {
        const hit = hitTest(objects, x, y)
        const tryHandleOn = (obj: CanvasObject): Handle | null => {
          const rad = (obj.rotation * Math.PI) / 180
          const cos = Math.cos(-rad)
          const sin = Math.sin(-rad)
          const cx = obj.x + obj.width / 2
          const cy = obj.y + obj.height / 2
          const dx = x - cx
          const dy = y - cy
          const localX = dx * cos - dy * sin + obj.width / 2
          const localY = dx * sin + dy * cos + obj.height / 2
          return getHandle(obj, localX, localY)
        }

        // Always check handles on selected objects FIRST – even when click is over
        // another object (e.g. resize/rotate handle over a shape below)
        if (selectedIds.length > 0) {
          for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i]
            if (!selectedIds.includes(obj.id)) continue
            const handle = tryHandleOn(obj)
            if (handle) {
              store.pushHistory()
              dragRef.current = {
                type: handle === 'rotate' ? 'rotate' : 'resize',
                obj,
                handle,
                startX: x,
                startY: y,
                startObj: {
                  x: obj.x,
                  y: obj.y,
                  width: obj.width,
                  height: obj.height,
                  rotation: obj.rotation,
                },
              }
              return
            }
          }
        }

        if (hit) {
          store.selectObject(hit.id)
          // Push history BEFORE starting move (save old position)
          store.pushHistory()
          dragRef.current = {
            type: 'move',
            obj: hit,
            handle: null,
            startX: x,
            startY: y,
            startObj: {
              x: hit.x,
              y: hit.y,
              width: hit.width,
              height: hit.height,
              rotation: hit.rotation,
            },
          }
        } else {
          store.clearSelection()
        }
      } else if (tool === 'rect') {
        store.addObject({
          type: 'rect',
          x,
          y,
          width: 100,
          height: 80,
          rotation: 0,
          fill: '#3b82f6',
          opacity: 1,
        })
        store.setTool('select')
      } else if (tool === 'ellipse') {
        store.addObject({
          type: 'ellipse',
          x,
          y,
          width: 100,
          height: 80,
          rotation: 0,
          fill: '#10b981',
          opacity: 1,
        })
        store.setTool('select')
      } else if (tool === 'text') {
        store.addObject({
          type: 'text',
          x,
          y,
          width: 120,
          height: 40,
          rotation: 0,
          fill: '#1f2937',
          opacity: 1,
          text: 'Text',
          fontSize: 16,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left',
        } as any)
        store.setTool('select')
      } else if (tool === 'pen') {
        if (!store.isPenDrawing) {
          store.startPenPath()
        }
        
        // Check if clicking on first point to close the path
        if (store.penPoints.length > 2) {
          const firstPt = store.penPoints[0]
          const dist = Math.sqrt((x - firstPt.x) ** 2 + (y - firstPt.y) ** 2)
          if (dist < 10) {
            store.finishPenPath(true)
            return
          }
        }
        
        // Add new point
        store.addPenPoint({ x, y, handleIn: null, handleOut: null })
        
        // Start dragging to create handles
        dragRef.current = {
          type: 'pen-drag',
          obj: store.objects[0], // dummy
          handle: null,
          startX: x,
          startY: y,
          startObj: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
        }
      }
    },
    [store, canvasRef, toCanvas]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !dragRef.current) return

      const { x, y } = toCanvas(e.clientX, e.clientY)
      const drag = dragRef.current

      if (drag.type === 'move') {
        const dx = x - drag.startX
        const dy = y - drag.startY
        store.updateObject(drag.obj.id, {
          x: drag.startObj.x + dx,
          y: drag.startObj.y + dy,
        })
      } else if (drag.type === 'rotate' && drag.handle === 'rotate') {
        const cx = drag.startObj.x + drag.startObj.width / 2
        const cy = drag.startObj.y + drag.startObj.height / 2
        const startAngle = Math.atan2(drag.startY - cy, drag.startX - cx)
        const currentAngle = Math.atan2(y - cy, x - cx)
        const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI
        const newRotation = drag.startObj.rotation + deltaDeg
        store.updateObject(drag.obj.id, { rotation: newRotation })
      } else if (drag.type === 'resize' && drag.handle && drag.handle !== 'rotate') {
        const dx = x - drag.startX
        const dy = y - drag.startY
        const rad = (drag.obj.rotation * Math.PI) / 180
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)
        const localDx = dx * cos + dy * sin
        const localDy = -dx * sin + dy * cos

        const cx = drag.startObj.x + drag.startObj.width / 2
        const cy = drag.startObj.y + drag.startObj.height / 2
        let w = drag.startObj.width
        let h = drag.startObj.height
        const minSize = 10

        switch (drag.handle) {
          case 'se':
            w = Math.max(minSize, w + localDx)
            h = Math.max(minSize, h + localDy)
            break
          case 'sw':
            w = Math.max(minSize, w - localDx)
            h = Math.max(minSize, h + localDy)
            break
          case 'ne':
            w = Math.max(minSize, w + localDx)
            h = Math.max(minSize, h - localDy)
            break
          case 'nw':
            w = Math.max(minSize, w - localDx)
            h = Math.max(minSize, h - localDy)
            break
          case 'e':
            w = Math.max(minSize, w + localDx)
            break
          case 'w':
            w = Math.max(minSize, w - localDx)
            break
          case 's':
            h = Math.max(minSize, h + localDy)
            break
          case 'n':
            h = Math.max(minSize, h - localDy)
            break
        }
        const ox = cx - w / 2
        const oy = cy - h / 2
        
        // Special handling for path objects - scale points
        if (drag.obj.type === 'path') {
          const scaleX = w / drag.startObj.width
          const scaleY = h / drag.startObj.height
          const originalPath = drag.obj as any
          const scaledPoints = originalPath.points.map((pt: any) => ({
            x: pt.x * scaleX,
            y: pt.y * scaleY,
            handleIn: pt.handleIn ? { x: pt.handleIn.x * scaleX, y: pt.handleIn.y * scaleY } : null,
            handleOut: pt.handleOut ? { x: pt.handleOut.x * scaleX, y: pt.handleOut.y * scaleY } : null,
          }))
          store.updateObject(drag.obj.id, { x: ox, y: oy, width: w, height: h, points: scaledPoints })
        } else {
          store.updateObject(drag.obj.id, { x: ox, y: oy, width: w, height: h })
        }
      } else if (drag.type === 'pen-drag') {
        // Update the handles of the last point
        const dx = x - drag.startX
        const dy = y - drag.startY
        store.updateLastPenPoint({
          handleOut: { x: dx, y: dy },
          handleIn: { x: -dx, y: -dy },
        })
      } else if (drag.type === 'pan') {
        // Pan the canvas viewport
        if (drag.startViewportX !== undefined && drag.startViewportY !== undefined &&
            drag.startScreenX !== undefined && drag.startScreenY !== undefined) {
          const canvasRect = getCanvasRect()
          const screenDx = e.clientX - drag.startScreenX
          const screenDy = e.clientY - drag.startScreenY

          // Convert screen delta to viewport space (viewport is in buffer coords)
          const vpDx = (screenDx * CANVAS_WIDTH) / (canvasRect.width || 1)
          const vpDy = (screenDy * CANVAS_HEIGHT) / (canvasRect.height || 1)

          store.setViewport({
            x: drag.startViewportX + vpDx,
            y: drag.startViewportY + vpDy,
          }, canvasRect)
        }
      }
    },
    [store, canvasRef, toCanvas, getCanvasRect]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer already released
    }
    dragRef.current = null
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        if (store.isPenDrawing) {
          store.cancelPenPath()
        } else {
          store.deleteSelected()
        }
      }
      if (e.key === 'Enter' && store.isPenDrawing) {
        e.preventDefault()
        store.finishPenPath(false)
      }
      if (e.key === 'Escape' && store.isPenDrawing) {
        e.preventDefault()
        store.cancelPenPath()
      }
    },
    [store]
  )

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  }
}
