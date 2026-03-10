import type { CanvasObject } from '../types'
import { drawObject } from './draw'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './coords'

export type ExportFormat = 'png' | 'jpeg'

function getObjectBounds(obj: CanvasObject): { minX: number; minY: number; maxX: number; maxY: number } {
  if (obj.rotation === 0) {
    return {
      minX: obj.x,
      minY: obj.y,
      maxX: obj.x + obj.width,
      maxY: obj.y + obj.height,
    }
  }
  const rad = (obj.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = obj.x + obj.width / 2
  const cy = obj.y + obj.height / 2
  const w2 = obj.width / 2
  const h2 = obj.height / 2
  const corners: [number, number][] = [
    [-w2, -h2],
    [w2, -h2],
    [w2, h2],
    [-w2, h2],
  ]
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [lx, ly] of corners) {
    const rx = cx + lx * cos - ly * sin
    const ry = cy + lx * sin + ly * cos
    minX = Math.min(minX, rx)
    minY = Math.min(minY, ry)
    maxX = Math.max(maxX, rx)
    maxY = Math.max(maxY, ry)
  }
  return { minX, minY, maxX, maxY }
}

/**
 * Renders the canvas objects to an offscreen canvas and returns a data URL.
 * If selectedIds is provided and non-empty, exports only those objects cropped to their bounding box.
 */
function renderToDataURL(
  objects: CanvasObject[],
  format: ExportFormat,
  jpegQuality: number = 0.92,
  selectedIds?: string[]
): string {
  let toDraw = objects
  let offsetX = 0
  let offsetY = 0
  let outWidth = CANVAS_WIDTH
  let outHeight = CANVAS_HEIGHT

  if (selectedIds && selectedIds.length > 0) {
    toDraw = objects.filter((o) => selectedIds.includes(o.id))
    if (toDraw.length === 0) {
      // Fallback to full canvas
    } else {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const obj of toDraw) {
        const b = getObjectBounds(obj)
        minX = Math.min(minX, b.minX)
        minY = Math.min(minY, b.minY)
        maxX = Math.max(maxX, b.maxX)
        maxY = Math.max(maxY, b.maxY)
      }
      const padding = 2
      offsetX = minX - padding
      offsetY = minY - padding
      outWidth = Math.ceil(maxX - minX + padding * 2)
      outHeight = Math.ceil(maxY - minY + padding * 2)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, outWidth)
  canvas.height = Math.max(1, outHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.translate(-offsetX, -offsetY)
  toDraw.forEach((obj) => {
    drawObject(ctx, obj, false)
  })

  if (format === 'png') {
    return canvas.toDataURL('image/png')
  }
  return canvas.toDataURL('image/jpeg', jpegQuality)
}

/**
 * Triggers a download of the canvas content as PNG or JPEG.
 * If selectedIds is provided and non-empty, exports only the selected objects.
 */
export function exportCanvasAsImage(
  objects: CanvasObject[],
  format: ExportFormat,
  filename?: string,
  selectedIds?: string[]
): void {
  const ext = format === 'png' ? 'png' : 'jpg'
  const name = filename || `dibble-export-${Date.now()}.${ext}`

  const dataUrl = renderToDataURL(objects, format, 0.92, selectedIds)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = name
  link.click()
}
