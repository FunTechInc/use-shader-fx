import * as THREE from "three";
import { Size } from "@react-three/fiber";
type Utils = {
    interpolate: (startValue: number, endValue: number, progress: number, threshold?: number) => number;
    /** Useful if you intentionally want to specify a higher resolution than `window.devicePixelRatio`. The maximum dpr is returned according to `GL_MAX_TEXTURE_SIZE`. */
    getMaxDpr: (gl: THREE.WebGLRenderer, size: Size) => number;
};
export declare const Utils: Utils;
export {};
