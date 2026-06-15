declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties, MouseEvent, TouchEvent } from 'react'

  export interface Geography {
    rsmKey: string
    id?: string
    properties?: Record<string, string>
  }

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: { scale?: number; center?: [number, number] }
    width?: number
    height?: number
    style?: CSSProperties
    children?: ReactNode
  }

  export interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: Geography[] }) => ReactNode
  }

  export interface GeographyProps {
    geography: Geography
    onClick?: (event: MouseEvent<SVGPathElement>) => void
    onMouseDown?: (event: MouseEvent<SVGPathElement>) => void
    onTouchStart?: (event: TouchEvent<SVGPathElement>) => void
    onTouchEnd?: (event: TouchEvent<SVGPathElement>) => void
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
  }

  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    onMoveStart?: (args: { coordinates: [number, number]; zoom: number }) => void
    onMove?: (args: { coordinates: [number, number]; zoom: number }) => void
    onMoveEnd?: (args: { coordinates: [number, number]; zoom: number }) => void
    children?: ReactNode
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element
}
