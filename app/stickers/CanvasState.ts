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
      const prevIndex = this.stickerState.nextStickerIndex;
      let nextIndex;
      // 重複しないように次のステッカーを選ぶ
      do {
         nextIndex = Math.floor(Math.random() * this.textures.stickers.length);
      } while (nextIndex === prevIndex);
      return nextIndex;
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

   public cameraState: {
      point: THREE.Vector3;
   } = {
      point: new THREE.Vector3(0, 0, 4),
   };

   public stickerState: {
      isNotSticked: boolean;
      wobbleStrength: number;
      point: THREE.Vector2;
      sticker: THREE.Texture | null;
      nextStickerIndex: number;
      wrinkle: THREE.Texture | null;
      wrinkleIntensity: number;
      size: number;
      angle: number;
      count: number;
   } = {
      isNotSticked: true,
      wobbleStrength: 0,
      point: new THREE.Vector2(0, 0),
      sticker: null,
      nextStickerIndex: 0,
      wrinkle: null,
      wrinkleIntensity: Math.random(),
      size: this.getRandomSize(),
      angle: this.getRandomAngle(),
      count: 0,
   };

   public setStickerState(point: THREE.Vector2) {
      this.stickerState = {
         isNotSticked: false,
         wobbleStrength: 0.4,
         point: point,
         sticker: this.textures.stickers[this.stickerState.nextStickerIndex],
         nextStickerIndex: this.getNextStickerIndex(),
         wrinkle:
            this.textures.wrinkles[
               Math.floor(Math.random() * this.textures.wrinkles.length)
            ],
         wrinkleIntensity: Math.random(),
         size: this.getRandomSize(),
         angle: this.getRandomAngle(),
         count: this.stickerState.count + 2,
      };
   }
}
