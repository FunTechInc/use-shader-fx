import * as THREE from "three";
import { DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import { CustomParams } from "../../../utils/setUniforms";
import type { HooksProps, HooksReturn } from "../../types";
export type MotionBlurParams = {
    /** Make this texture blur, default : `THREE.Texture()` */
    texture?: THREE.Texture;
    /** motion begin, default : `THREE.Vector2(0, 0)` */
    begin?: THREE.Vector2;
    /** motion end, default : `THREE.Vector2(0, 0)` */
    end?: THREE.Vector2;
    /** motion strength, default : `0.9` */
    strength?: number;
};
export type MotionBlurObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
    output: THREE.Texture;
};
export declare const MOTIONBLUR_PARAMS: MotionBlurParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useMotionBlur: ({ size, dpr, samples, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<MotionBlurParams, MotionBlurObject, CustomParams>;
