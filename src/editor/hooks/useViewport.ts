import { useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '../context/EditorContext'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  screenToCanvas as coordsScreenToCanvas,
  canvasToScreen as coordsCanvasToScreen,
} from '../utils/coords'

function fitSize(
  containerW: number,
  containerH: number,
  contentW: number,
  contentH: number
): { width: number; height: number } {
  if (containerW <= 0 || containerH <= 0) {
    return { width: contentW, height: contentH }
  }
  const scale = Math.min(
    containerW / contentW,
    containerH / contentH,
    1
  )
  return {
    width: Math.round(contentW * scale),
    height: Math.round(contentH * scale),
  }
}

export function useViewport(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const store = useEditorStore()
  const [fit, setFit] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const { clientWidth, clientHeight } = container
      setFit(fitSize(clientWidth, clientHeight, CANVAS_WIDTH, CANVAS_HEIGHT))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)
  }, [canvasRef])

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = getCanvasRect()
      return coordsScreenToCanvas(screenX, screenY, store.viewport, rect)
    },
    [store.viewport, getCanvasRect]
  )

  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number) => {
      const rect = getCanvasRect()
      return coordsCanvasToScreen(canvasX, canvasY, store.viewport, rect)
    },
    [store.viewport, getCanvasRect]
  )

  const scale = fit.width / CANVAS_WIDTH

  return {
    fit,
    getCanvasRect,
    screenToCanvas,
    canvasToScreen,
    scale,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  }
}
