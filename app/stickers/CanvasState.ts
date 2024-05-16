import * as THREE from "three";

export class CanvasState {
   private static instance: CanvasState;
   public static getInstance(): CanvasState {
      if (!CanvasState.instance) {
         CanvasState.instance = new CanvasState();
      }
      return CanvasState.instance;
   }
   private STICKERSIZE = {
      min: 0.04,
      max: 0.08,
   };
   private getRandomSize() {
      return (
         Math.random() * (this.STICKERSIZE.max - this.STICKERSIZE.min) +
         this.STICKERSIZE.min
      );
   }
   private getRandomAngle() {
      return Math.random() * Math.PI * 2;
   }

   private getNextStickerIndex() {
      return Math.floor(Math.random() * this.textures.stickers.length);
   }

   public textures: {
      wrinkles: THREE.Texture[];
      stickers: THREE.Texture[];
   } = {
      wrinkles: [],
      stickers: [],
   };

   public cursorState = {
      isOver: false,
      point: new THREE.Vector2(0, 0),
   };

   public state: {
      point: THREE.Vector2;
      cameraPoint: THREE.Vector3;
      sticker: THREE.Texture | null;
      nextStickerIndex: number;
      wrinkle: THREE.Texture | null;
      wrinkleIntensity: number;
      size: number;
      angle: number;
      count: number;
   } = {
      point: new THREE.Vector2(0, 0),
      cameraPoint: new THREE.Vector3(0, 0, 4),
      sticker: null,
      nextStickerIndex: this.getNextStickerIndex(),
      wrinkle: null,
      wrinkleIntensity: Math.random(),
      size: this.getRandomSize(),
      angle: this.getRandomAngle(),
      count: 0,
   };

   public setState(point: THREE.Vector2, cameraPoint: THREE.Vector3) {
      this.state = {
         point: point,
         cameraPoint: this.state.cameraPoint.set(
            cameraPoint.x,
            cameraPoint.y,
            3.5
         ),
         sticker: this.textures.stickers[this.state.nextStickerIndex],
         nextStickerIndex: this.getNextStickerIndex(),
         wrinkle:
            this.textures.wrinkles[
               Math.floor(Math.random() * this.textures.wrinkles.length)
            ],
         wrinkleIntensity: Math.random(),
         size: this.getRandomSize(),
         angle: this.getRandomAngle(),
         count: this.state.count + 2,
      };
   }
}
