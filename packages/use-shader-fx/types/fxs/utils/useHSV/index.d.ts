import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type HSVParams = {
    /** default : `THREE.Texture()` */
    texture?: THREE.Texture;
    /** default : `1` */
    brightness?: number;
    /** default : `1` */
    saturation?: number;
};
export type HSVObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const HSV_PARAMS: HSVParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useHSV: ({ size, dpr, samples, isSizeUpdate, onBeforeCompile, }: HooksProps) => HooksReturn<HSVParams, HSVObject>;
