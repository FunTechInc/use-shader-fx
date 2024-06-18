import * as THREE from "three";
import { DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import { CustomParams } from "../../../utils/setUniforms";
import type { HooksProps, HooksReturn } from "../../types";
export type SimpleBlurParams = {
    /** Make this texture blur , default : `THREE.Texture()` */
    texture?: THREE.Texture;
    /** blurSize, default : `3` */
    blurSize?: number;
    /** blurPower, affects performance default : `5` */
    blurPower?: number;
};
export type SimpleBlurObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
    output: THREE.Texture;
};
export declare const SIMPLEBLUR_PARAMS: SimpleBlurParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useSimpleBlur: ({ size, dpr, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<SimpleBlurParams, SimpleBlurObject, CustomParams>;
