import * as THREE from "three";
import { Size } from "@react-three/fiber";

type Utils = {
   interpolate: (
      startValue: number,
      endValue: number,
      progress: number,
      threshold?: number
   ) => number;
   /**
    * Returns the maximum dpr for size according to `GL_MAX_TEXTURE_SIZE`.
    */
   getMaxDpr: (gl: THREE.WebGLRenderer, size: Size) => number;
};

export const Utils: Utils = Object.freeze({
   interpolate(startValue, endValue, progress, threshold = 1e-6): number {
      const result = startValue + (endValue - startValue) * progress;
      return Math.abs(result) < threshold ? 0 : result;
   },
   getMaxDpr(gl, size) {
      return Math.floor(
         gl.capabilities.maxTextureSize / Math.max(size.width, size.height)
      );
   },
});
