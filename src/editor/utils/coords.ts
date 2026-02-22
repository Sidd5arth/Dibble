import type { Viewport } from '../types'

export const CANVAS_WIDTH = 3200
export const CANVAS_HEIGHT = 2400

/**
 * Convert screen coordinates (mouse position) to canvas/design coordinates.
 * Accounts for viewport pan/zoom and canvas display size (which may differ from logical 800x600).
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const displayX = screenX - canvasRect.left
  const displayY = screenY - canvasRect.top
  const bufferX = (displayX * CANVAS_WIDTH) / (canvasRect.width || 1)
  const bufferY = (displayY * CANVAS_HEIGHT) / (canvasRect.height || 1)
  const x = (bufferX - viewport.x) / viewport.zoom
  const y = (bufferY - viewport.y) / viewport.zoom
  // Round to 2 decimal places to prevent floating point drift accumulation
  return { 
    x: Math.round(x * 100) / 100, 
    y: Math.round(y * 100) / 100 
  }
}

/**
 * Convert canvas/design coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const bufferX = viewport.x + canvasX * viewport.zoom
  const bufferY = viewport.y + canvasY * viewport.zoom
  const displayX = (bufferX * canvasRect.width) / CANVAS_WIDTH
  const displayY = (bufferY * canvasRect.height) / CANVAS_HEIGHT
  return {
    x: canvasRect.left + displayX,
    y: canvasRect.top + displayY,
  }
}
