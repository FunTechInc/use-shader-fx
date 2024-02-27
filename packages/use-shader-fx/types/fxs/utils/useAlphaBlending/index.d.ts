import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type AlphaBlendingParams = {
    /** default:THREE.Texture()*/
    texture?: THREE.Texture;
    /** alpha map , default:THREE.Texture() */
    map?: THREE.Texture;
};
export type AlphaBlendingObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const ALPHABLENDING_PARAMS: AlphaBlendingParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useAlphaBlending: ({ size, dpr, samples, }: HooksProps) => HooksReturn<AlphaBlendingParams, AlphaBlendingObject>;
