import type { CanvasObject } from '../types'

/**
 * Check if a point is inside a rotated rectangle
 * Rotation is around the center of the shape
 */
function isPointInRotatedRect(
  px: number,
  py: number,
  ox: number,
  oy: number,
  width: number,
  height: number,
  rotation: number
): boolean {
  const cx = ox + width / 2
  const cy = oy + height / 2
  if (rotation === 0) {
    return px >= ox && px <= ox + width && py >= oy && py <= oy + height
  }
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(-rad)
  const sin = Math.sin(-rad)
  const dx = px - cx
  const dy = py - cy
  const localX = dx * cos - dy * sin
  const localY = dx * sin + dy * cos
  return (
    localX >= -width / 2 &&
    localX <= width / 2 &&
    localY >= -height / 2 &&
    localY <= height / 2
  )
}

/**
 * Hit test for rectangle
 */
function hitTestRect(
  obj: { x: number; y: number; width: number; height: number; rotation: number; rx?: number; ry?: number },
  x: number,
  y: number
): boolean {
  return isPointInRotatedRect(x, y, obj.x, obj.y, obj.width, obj.height, obj.rotation)
}

/**
 * Hit test for ellipse - check if point is inside ellipse in local space
 */
function hitTestEllipse(
  obj: { x: number; y: number; width: number; height: number; rotation: number },
  x: number,
  y: number
): boolean {
  const rad = (obj.rotation * Math.PI) / 180
  const cos = Math.cos(-rad)
  const sin = Math.sin(-rad)
  const cx = obj.x + obj.width / 2
  const cy = obj.y + obj.height / 2
  const dx = x - cx
  const dy = y - cy
  const localX = dx * cos - dy * sin
  const localY = dx * sin + dy * cos
  const rx = obj.width / 2
  const ry = obj.height / 2
  return (localX * localX) / (rx * rx) + (localY * localY) / (ry * ry) <= 1
}

/**
 * Hit test for path - check if point is near the path stroke or inside if closed
 */
function hitTestPath(
  obj: { 
    type: 'path'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    points: Array<{ x: number; y: number; handleIn?: { x: number; y: number } | null; handleOut?: { x: number; y: number } | null }>
    closed: boolean
  },
  px: number,
  py: number
): boolean {
  // Transform point to local space (accounting for rotation)
  const rad = (obj.rotation * Math.PI) / 180
  const cos = Math.cos(-rad)
  const sin = Math.sin(-rad)
  const cx = obj.x + obj.width / 2
  const cy = obj.y + obj.height / 2
  const dx = px - cx
  const dy = py - cy
  const localX = dx * cos - dy * sin
  const localY = dx * sin + dy * cos

  // Convert to object-space coordinates (relative to obj.x, obj.y)
  const objX = localX + obj.width / 2
  const objY = localY + obj.height / 2

  // For closed paths, check if point is inside using ray casting
  if (obj.closed && obj.points.length >= 3) {
    let inside = false
    for (let i = 0, j = obj.points.length - 1; i < obj.points.length; j = i++) {
      const xi = obj.points[i].x
      const yi = obj.points[i].y
      const xj = obj.points[j].x
      const yj = obj.points[j].y
      
      const intersect = ((yi > objY) !== (yj > objY)) &&
        (objX < (xj - xi) * (objY - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    if (inside) return true
  }

  // Also check distance to stroke for all paths
  const threshold = 8

  // Check distance to each segment
  for (let i = 0; i < obj.points.length - 1; i++) {
    const p1 = obj.points[i]
    const p2 = obj.points[i + 1]
    const dist = distToSegmentSimple(objX, objY, p1.x, p1.y, p2.x, p2.y)
    if (dist <= threshold) return true
  }

  // Check closing segment if closed
  if (obj.closed && obj.points.length > 2) {
    const p1 = obj.points[obj.points.length - 1]
    const p2 = obj.points[0]
    const dist = distToSegmentSimple(objX, objY, p1.x, p1.y, p2.x, p2.y)
    if (dist <= threshold) return true
  }

  return false
}

function distToSegmentSimple(
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
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  const nearestX = x1 + t * dx
  const nearestY = y1 + t * dy
  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2)
}

/**
 * Find the topmost object at the given canvas coordinates
 */
export function hitTest(
  objects: CanvasObject[],
  x: number,
  y: number
): CanvasObject | null {
  // Iterate in reverse order (top to bottom in draw order)
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]
    let hit = false

    switch (obj.type) {
      case 'rect':
        hit = hitTestRect(obj, x, y)
        break
      case 'ellipse':
        hit = hitTestEllipse(obj, x, y)
        break
      case 'text':
      case 'image':
        hit = hitTestRect(obj, x, y)
        break
      case 'path':
        hit = hitTestPath(obj, x, y)
        break
    }

    if (hit) return obj
  }
  return null
}
