import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type BrightnessPickerParams = {
    /** pick brightness from this texture , default : `THREE.Texture` */
    texture?: THREE.Texture;
    /** default : `(0.5,0.5,0.5)` */
    brightness?: THREE.Vector3;
    /** default : `0.0` */
    min?: number;
    /** default : `1.0` */
    max?: number;
};
export type BrightnessPickerObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const BRIGHTNESSPICKER_PARAMS: BrightnessPickerParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useBrightnessPicker: ({ size, dpr, samples, isSizeUpdate, uniforms, onBeforeCompile, }: HooksProps) => HooksReturn<BrightnessPickerParams, BrightnessPickerObject, CustomParams>;
