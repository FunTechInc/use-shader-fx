import * as THREE from "three";
import { Size } from "@react-three/fiber";
export type ResizeBoundary = {
    /** Useful if you intentionally want to specify a higher resolution than `window.devicePixelRatio`. The maximum dpr is returned according to `GL_MAX_TEXTURE_SIZE`. */
    maxDpr: number;
    isUpdate: boolean;
};
export declare const useResizeBoundary: ({ gl, size, boundFor, threshold, }: {
    gl: THREE.WebGLRenderer;
    size: Size;
    boundFor: "smaller" | "larger" | "both";
    threshold: number;
}) => ResizeBoundary;
