import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type FxBlendingParams = {
    /** Make this texture Blending , default:THREE.Texture */
    texture?: THREE.Texture;
    /** map texture, default:THREE.Texture */
    map?: THREE.Texture;
    /** map strength , r,g value are affecting , default:0.3 */
    mapIntensity?: number;
};
export type FxBlendingObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const FXBLENDING_PARAMS: FxBlendingParams;
/**
 * Blend map to texture. You can change the intensity of fx applied by the rg value of map. Unlike "useBlending", the map color is not reflected.
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useFxBlending: ({ size, dpr, samples, }: HooksProps) => HooksReturn<FxBlendingParams, FxBlendingObject>;
