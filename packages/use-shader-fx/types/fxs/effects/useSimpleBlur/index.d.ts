import * as THREE from "three";
import type { HooksProps, HooksReturn } from "../../types";
export type SimpleBlurParams = {
    /** Make this texture blur , Default:new THREE.Texture() */
    texture?: THREE.Texture;
    /** blurSize, default:3 */
    blurSize?: number;
    /** blurPower, affects performance default:5 */
    blurPower?: number;
};
export type SimpleBlurObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const SIMPLEBLUR_PARAMS: SimpleBlurParams;
export declare const useSimpleBlur: ({ size, dpr, samples, }: HooksProps) => HooksReturn<SimpleBlurParams, SimpleBlurObject>;
