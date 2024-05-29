import * as THREE from "three";
import { Size } from "@react-three/fiber";
type Utils = {
    interpolate: (startValue: number, endValue: number, progress: number, threshold?: number) => number;
    /**
     * Returns the maximum dpr for size according to `GL_MAX_TEXTURE_SIZE`.
     */
    getMaxDpr: (gl: THREE.WebGLRenderer, size: Size) => number;
};
export declare const Utils: Utils;
export {};
