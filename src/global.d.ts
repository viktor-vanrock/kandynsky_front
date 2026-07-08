export {};

interface Turnstile {
  render(
    container: HTMLElement,
    opts: {
      sitekey: string;
      theme?: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ): number;
  remove(widgetId: number): void;
  execute(widgetId: number): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

interface HTMLVideoElement {
  requestVideoFrameCallback?(
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void,
  ): number;
}

interface VideoFrameCallbackMetadata {
  presentationTime: number;
  expectedDisplayTime: number;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
  processingDuration?: number;
}
