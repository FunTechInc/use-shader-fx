import * as THREE from "three";
import { Size } from "@react-three/fiber";
import type { HooksReturn } from "../types";
export type SimpleBlurParams = {
    /** Make this texture blur , Default:new THREE.Texture() */
    texture: THREE.Texture;
    /** blurSize, default:3 */
    blurSize: number;
    /** blurPower, affects performance default:5 */
    blurPower: number;
};
export type SimpleBlurObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const SIMPLEBLUR_PARAMS: SimpleBlurParams;
export declare const useSimpleBlur: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<SimpleBlurParams, SimpleBlurObject>;
