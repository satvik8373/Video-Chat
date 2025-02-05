// global.d.ts

declare global {
  interface HTMLElement {
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
    webkitExitFullscreen?: () => void;
    msExitFullscreen?: () => void;
  }
}

// This is needed to make the global declarations work properly
export {};
