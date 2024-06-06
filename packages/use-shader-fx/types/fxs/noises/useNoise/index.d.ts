import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type NoiseParams = {
    /** noise scale , default : `0.004` */
    scale?: number;
    /** time factor default : `0.3` */
    timeStrength?: number;
    /** noiseOctaves, affects performance default : `2` */
    noiseOctaves?: number;
    /** fbmOctaves, affects performance default : `2` */
    fbmOctaves?: number;
    /** domain warping octaves , affects performance default : `2`  */
    warpOctaves?: number;
    /** direction of domain warping , default : `(2.0,2,0)` */
    warpDirection?: THREE.Vector2;
    /** strength of domain warping , default : `8.0` */
    warpStrength?: number;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
};
export type NoiseObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const NOISE_PARAMS: NoiseParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export declare const useNoise: ({ size, dpr, samples, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<NoiseParams, NoiseObject, CustomParams>;
