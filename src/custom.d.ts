declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.module.css';
declare module '*.hdr' {
  const content: string;
  export default content;
}
declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*?url' {
  const content: string;
  export default content;
}

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean;
      'ar-modes'?: string;
      'ios-src'?: string;
      'camera-controls'?: boolean;
      'auto-rotate'?: boolean;
      poster?: string;
      style?: React.CSSProperties;
      loading: string;
    };
  }
}
