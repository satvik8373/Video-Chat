// global.d.ts

interface HTMLElement {
  webkitRequestFullscreen?: () => void;
  msRequestFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  msExitFullscreen?: () => void;
}
