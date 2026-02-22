import { observer } from 'mobx-react-lite'
import { useRef, useEffect } from 'react'
import { useEditorStore } from '../context/EditorContext'
import { drawObject } from '../utils/draw'
import { useCanvasInteraction } from '../hooks/useCanvasInteraction'
import { useViewport } from '../hooks/useViewport'

export const Canvas = observer(function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const store = useEditorStore()

  const { fit, getCanvasRect, screenToCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } =
    useViewport(containerRef, canvasRef)

  const { handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown } =
    useCanvasInteraction(canvasRef, {
      getCanvasRect,
      screenToCanvas,
    })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS_WIDTH * dpr
    canvas.height = CANVAS_HEIGHT * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)

    ctx.translate(store.viewport.x, store.viewport.y)
    ctx.scale(store.viewport.zoom, store.viewport.zoom)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const gridSize = 20
    ctx.strokeStyle = '#0f0f0f'
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.15
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    const selectedSet = new Set(store.selectedIds)
    store.objects.forEach((obj) => {
      drawObject(ctx, obj, selectedSet.has(obj.id))
    })

    // Draw in-progress pen path
    if (store.isPenDrawing && store.penPoints.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.fillStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      ctx.beginPath()
      const firstPt = store.penPoints[0]
      ctx.moveTo(firstPt.x, firstPt.y)
      
      for (let i = 1; i < store.penPoints.length; i++) {
        const pt = store.penPoints[i]
        const prevPt = store.penPoints[i - 1]
        
        if (prevPt.handleOut || pt.handleIn) {
          const cp1x = prevPt.x + (prevPt.handleOut?.x ?? 0)
          const cp1y = prevPt.y + (prevPt.handleOut?.y ?? 0)
          const cp2x = pt.x + (pt.handleIn?.x ?? 0)
          const cp2y = pt.y + (pt.handleIn?.y ?? 0)
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pt.x, pt.y)
        } else {
          ctx.lineTo(pt.x, pt.y)
        }
      }
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw points and handles
      store.penPoints.forEach((pt, i) => {
        // Draw handle lines
        if (pt.handleOut) {
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt.x, pt.y)
          ctx.lineTo(pt.x + pt.handleOut.x, pt.y + pt.handleOut.y)
          ctx.stroke()
          
          ctx.fillStyle = '#94a3b8'
          ctx.beginPath()
          ctx.arc(pt.x + pt.handleOut.x, pt.y + pt.handleOut.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Draw point
        ctx.fillStyle = i === 0 ? '#22c55e' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    ctx.restore()
  }, [store.objects, store.selectedIds, store.viewport, store.isPenDrawing, store.penPoints])

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-auto bg-[var(--brutal-yellow)] flex items-center justify-center p-4 outline-none"
      style={{ height: '100%', minHeight: '100%' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="shrink-0 bg-[var(--brutal-white)] border-[3px] border-[var(--brutal-black)] shadow-[8px_8px_0_var(--brutal-black)]"
        style={{
          width: fit.width,
          height: fit.height,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    </div>
  )
})
