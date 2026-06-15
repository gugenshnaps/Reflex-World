declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties } from 'react'

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
    onClick?: () => void
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
}
