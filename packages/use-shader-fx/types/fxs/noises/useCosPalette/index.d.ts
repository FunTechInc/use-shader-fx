import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type CosPaletteParams = {
    /** color1, default : `rgb(50%, 50%, 50%)` */
    color1?: THREE.Color;
    /** color2, default : `rgb(50%, 50%, 50%)` */
    color2?: THREE.Color;
    /** color3, default : `rgb(100%, 100%, 100%)` */
    color3?: THREE.Color;
    /** color4, default : `rgb(0%, 10%, 20%)` */
    color4?: THREE.Color;
    /** texture to be used as a palette */
    texture?: THREE.Texture;
    /** weight of the rgb, default : `THREE.Vector3(1.0,0.0,0.0)` */
    rgbWeight?: THREE.Vector3;
};
export type ColorPaletteObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const COSPALETTE_PARAMS: CosPaletteParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useCosPalette: ({ size, dpr, samples, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<CosPaletteParams, ColorPaletteObject, CustomParams>;
