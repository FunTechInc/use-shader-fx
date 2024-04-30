import * as THREE from "three";
import { BlankMaterial } from "./useMesh";
import { DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import { CustomParams } from "../../../utils/setUniforms";
import type { HooksProps, HooksReturn } from "../../types";
export type BlankParams = {
    /** texture, default : `THREE.Texture()` */
    texture?: THREE.Texture;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
};
export type BlankObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BlankMaterial>;
    material: BlankMaterial;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
    output: THREE.Texture;
};
export declare const BLANK_PARAMS: BlankParams;
/**
 * By default, it is a blank canvas with nothing drawn on it. You can customise the shaders using `onBeforeCompile`.
 * Fragment shaders have `uTexture`,`uBackbuffer`,`uTime`,`uPointer` and `uResolution` as default uniforms.
 *
 * ※ `usf_FragColor` overrides `gl_FragColor`
 *
 * ※ `usf_Position` overrides `gl_Position`
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useBlank: ({ size, dpr, samples, isSizeUpdate, uniforms, onBeforeCompile, }: HooksProps) => HooksReturn<BlankParams, BlankObject, CustomParams>;
