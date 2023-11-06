import { Size } from "@react-three/fiber";
import * as THREE from "three";
export type DoubleRenderTarget = {
    read: THREE.WebGLRenderTarget | null;
    write: THREE.WebGLRenderTarget | null;
};
export type UseFboProps = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    size: Size;
    /** If dpr is set, dpr will be multiplied, default:false */
    dpr?: number | false;
    /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false */
    isSizeUpdate?: boolean;
};
