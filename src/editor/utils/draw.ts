import type { CanvasObject } from '../types'

export function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
  isSelected: boolean
): void {
  ctx.save()

  ctx.globalAlpha = obj.opacity
  ctx.fillStyle = obj.fill
  if (obj.stroke) {
    ctx.strokeStyle = obj.stroke
    ctx.lineWidth = obj.strokeWidth ?? 1
  }

  const cx = obj.x + obj.width / 2
  const cy = obj.y + obj.height / 2
  ctx.translate(cx, cy)
  ctx.rotate((obj.rotation * Math.PI) / 180)
  ctx.translate(-obj.width / 2, -obj.height / 2)

  switch (obj.type) {
    case 'rect': {
      const rx = obj.rx ?? 0
      const ry = obj.ry ?? 0
      if (rx > 0 || ry > 0) {
        ctx.beginPath()
        ctx.roundRect(0, 0, obj.width, obj.height, rx)
        ctx.fill()
        if (obj.stroke) ctx.stroke()
      } else {
        ctx.fillRect(0, 0, obj.width, obj.height)
        if (obj.stroke) ctx.strokeRect(0, 0, obj.width, obj.height)
      }
      break
    }
    case 'ellipse': {
      ctx.save()
      ctx.translate(obj.width / 2, obj.height / 2)
      ctx.scale(1, obj.height / obj.width)
      ctx.beginPath()
      ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2)
      ctx.fill()
      if (obj.stroke) ctx.stroke()
      ctx.restore()
      break
    }
    case 'text': {
      ctx.font = `${obj.fontStyle} ${obj.fontWeight} ${obj.fontSize}px ${obj.fontFamily}`
      ctx.textAlign = obj.textAlign
      ctx.textBaseline = 'top'
      ctx.fillStyle = obj.fill
      const lines = obj.text.split('\n')
      const lineHeight = obj.fontSize * 1.2
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * lineHeight, obj.width)
      })
      break
    }
    case 'image': {
      if (obj.imageElement?.complete && obj.imageElement.naturalWidth > 0) {
        ctx.drawImage(obj.imageElement, 0, 0, obj.width, obj.height)
      } else {
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(0, 0, obj.width, obj.height)
        ctx.fillStyle = '#6b7280'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Loading...', obj.width / 2, obj.height / 2 - 7)
      }
      if (obj.stroke) {
        ctx.strokeRect(0, 0, obj.width, obj.height)
      }
      break
    }
    case 'path': {
      if (obj.points.length < 2) break
      
      ctx.beginPath()
      const firstPt = obj.points[0]
      ctx.moveTo(firstPt.x, firstPt.y)
      
      for (let i = 1; i < obj.points.length; i++) {
        const pt = obj.points[i]
        const prevPt = obj.points[i - 1]
        
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
      
      if (obj.closed) {
        const lastPt = obj.points[obj.points.length - 1]
        if (lastPt.handleOut || firstPt.handleIn) {
          const cp1x = lastPt.x + (lastPt.handleOut?.x ?? 0)
          const cp1y = lastPt.y + (lastPt.handleOut?.y ?? 0)
          const cp2x = firstPt.x + (firstPt.handleIn?.x ?? 0)
          const cp2y = firstPt.y + (firstPt.handleIn?.y ?? 0)
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, firstPt.x, firstPt.y)
        } else {
          ctx.closePath()
        }
      }
      
      if (obj.fill && obj.fill !== 'transparent') {
        ctx.fill()
      }
      if (obj.stroke) {
        ctx.stroke()
      }
      break
    }
  }

  ctx.restore()

  if (isSelected) {
    drawSelectionHandles(ctx, obj)
  }
}

function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject
): void {
  const padding = 4
  const handleSize = 6
  const w = obj.width + padding * 2
  const h = obj.height + padding * 2

  ctx.save()
  ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2)
  ctx.rotate((obj.rotation * Math.PI) / 180)
  ctx.translate(-obj.width / 2 - padding, -obj.height / 2 - padding)

  const handleColor = '#2a2a2a'
  ctx.strokeStyle = handleColor
  ctx.lineWidth = 1
  ctx.setLineDash([3, 2])
  ctx.strokeRect(0, 0, w, h)

  ctx.setLineDash([])
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = handleColor
  ctx.lineWidth = 1
  const handles = [
    [0, 0],
    [w / 2 - handleSize / 2, 0],
    [w - handleSize, 0],
    [w - handleSize, h / 2 - handleSize / 2],
    [w - handleSize, h - handleSize],
    [w / 2 - handleSize / 2, h - handleSize],
    [0, h - handleSize],
    [0, h / 2 - handleSize / 2],
  ]

  handles.forEach(([hx, hy]) => {
    ctx.fillRect(hx, hy, handleSize, handleSize)
    ctx.strokeRect(hx, hy, handleSize, handleSize)
  })

  const rotateHandleY = -20
  const rotateHandleX = w / 2
  const rotateRadius = 6
  ctx.setLineDash([3, 2])
  ctx.beginPath()
  ctx.moveTo(rotateHandleX, 0)
  ctx.lineTo(rotateHandleX, rotateHandleY + rotateRadius)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw rotation icon (circular arrow)
  ctx.lineWidth = 1
  ctx.strokeStyle = handleColor
  ctx.fillStyle = '#ffffff'
  const arcStart = Math.PI * 0.35
  const arcEnd = Math.PI * 1.8
  ctx.beginPath()
  ctx.arc(rotateHandleX, rotateHandleY, rotateRadius, arcStart, arcEnd)
  ctx.stroke()
  // Arrowhead at end of arc - tip points in curve direction (tangent)
  const ax = rotateHandleX + rotateRadius * Math.cos(arcEnd)
  const ay = rotateHandleY + rotateRadius * Math.sin(arcEnd)
  const tangentX = -Math.sin(arcEnd)
  const tangentY = Math.cos(arcEnd)
  const tipLen = 3
  const tipX = ax + tipLen * tangentX
  const tipY = ay + tipLen * tangentY
  const backLen = 2.5
  const arrowWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(
    ax - backLen * tangentX + backLen * arrowWidth * Math.cos(arcEnd),
    ay - backLen * tangentY + backLen * arrowWidth * Math.sin(arcEnd)
  )
  ctx.lineTo(
    ax - backLen * tangentX - backLen * arrowWidth * Math.cos(arcEnd),
    ay - backLen * tangentY - backLen * arrowWidth * Math.sin(arcEnd)
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}
