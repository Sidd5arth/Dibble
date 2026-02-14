export type ObjectType = 'rect' | 'ellipse' | 'text' | 'image' | 'path'

export interface PathPoint {
  x: number
  y: number
  handleIn?: { x: number; y: number } | null
  handleOut?: { x: number; y: number } | null
}

export interface BaseObject {
  id: string
  type: ObjectType
  name?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity: number
  locked?: boolean
}

export interface RectObject extends BaseObject {
  type: 'rect'
  rx?: number
  ry?: number
}

export interface EllipseObject extends BaseObject {
  type: 'ellipse'
}

export interface TextObject extends BaseObject {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  textAlign: CanvasTextAlign
}

export interface ImageObject extends BaseObject {
  type: 'image'
  src: string
  imageElement?: HTMLImageElement
}

export interface PathObject extends BaseObject {
  type: 'path'
  points: PathPoint[]
  closed: boolean
}

export type CanvasObject =
  | RectObject
  | EllipseObject
  | TextObject
  | ImageObject
  | PathObject

export type Tool = 'select' | 'rect' | 'ellipse' | 'text' | 'hand' | 'pen'

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface CanvasState {
  objects: CanvasObject[]
  selectedIds: string[]
  tool: Tool
  viewport: Viewport
}
