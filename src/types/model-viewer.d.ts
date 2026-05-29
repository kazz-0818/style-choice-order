import type { Object3D } from 'three'

export interface ModelViewerElement extends HTMLElement {
  model?: Object3D
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement> & {
          src?: string
          alt?: string
          'camera-controls'?: boolean | ''
          'touch-action'?: string
          'auto-rotate'?: boolean | ''
          'rotation-per-second'?: string
          'environment-image'?: string
          'shadow-intensity'?: string
          exposure?: string
          'interaction-prompt'?: string
        },
        ModelViewerElement
      >
    }
  }
}
