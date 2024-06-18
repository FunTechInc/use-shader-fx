import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type ColorStrataParams = {
    /** default : `null` */
    texture?: THREE.Texture | false;
    /** Valid when texture is false. default : `1` */
    scale?: number;
    /** default : `1.0` */
    laminateLayer?: number;
    /** default : `(0.1, 0.1)` */
    laminateInterval?: THREE.Vector2;
    /** default : `(1.0, 1.0)` */
    laminateDetail?: THREE.Vector2;
    /** default : `(0.0, 0.0)` */
    distortion?: THREE.Vector2;
    /** default : `(1.0, 1.0, 1.0)` */
    colorFactor?: THREE.Vector3;
    /** default : `(0.0, 0.0)` */
    timeStrength?: THREE.Vector2;
    /** default : `false` */
    noise?: THREE.Texture | false;
    /** default : `(0.0,0.0)` */
    noiseStrength?: THREE.Vector2;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
};
export type ColorStrataObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const COLORSTRATA_PARAMS: ColorStrataParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useColorStrata: ({ size, dpr, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<ColorStrataParams, ColorStrataObject, CustomParams>;
