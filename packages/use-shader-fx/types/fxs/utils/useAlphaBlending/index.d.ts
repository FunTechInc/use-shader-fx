import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type AlphaBlendingParams = {
    /** default : `THREE.Texture()` */
    texture?: THREE.Texture;
    /** alpha map , default : `THREE.Texture()` */
    map?: THREE.Texture;
};
export type AlphaBlendingObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const ALPHABLENDING_PARAMS: AlphaBlendingParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useAlphaBlending: ({ size, dpr, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<AlphaBlendingParams, AlphaBlendingObject, CustomParams>;
