// canvas-to-blob.d.ts
declare module 'canvas-to-blob' {
    export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob>;
  }