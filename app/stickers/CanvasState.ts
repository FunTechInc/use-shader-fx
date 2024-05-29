import * as THREE from "three";
import { CLICKED_WOBBLE_STRENGTH } from "./StickerBall";
import { STICKER_TEXTURES_LENGTH } from "./StickerBall/useStickers";

export class CanvasState {
   private static instance: CanvasState;

   public static getInstance(): CanvasState {
      if (!CanvasState.instance) {
         CanvasState.instance = new CanvasState();
      }
      return CanvasState.instance;
   }

   private STICKER_SIZE = {
      min: 0.04,
      max: 0.08,
   };

   public CAMERA_Z = {
      zoom: 3.2,
      default: 4,
   };

   private getRandomSize() {
      return (
         Math.random() * (this.STICKER_SIZE.max - this.STICKER_SIZE.min) +
         this.STICKER_SIZE.min
      );
   }
   private getRandomAngle() {
      return Math.random() * Math.PI * 2;
   }
   private getNextStickerIndex() {
      const prevIndex = this.stickerState.nextStickerIndex;
      let nextIndex;
      // Select the next sticker to avoid duplication.
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
      point: new THREE.Vector3(0, 0, this.CAMERA_Z.default),
   };

   public clockState = {
      waiting: 0,
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
      nextStickerIndex: Math.floor(Math.random() * STICKER_TEXTURES_LENGTH),
      wrinkle: null,
      wrinkleIntensity: Math.random(),
      size: this.getRandomSize(),
      angle: this.getRandomAngle(),
      count: 0,
   };

   public setStickerState(point: THREE.Vector2) {
      this.stickerState = {
         isNotSticked: false,
         wobbleStrength: CLICKED_WOBBLE_STRENGTH,
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
         count: this.stickerState.count + 2, // To swap FBOs
      };
   }
}
