import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type CoverTextureParams = {
    /** Textures that you want to display exactly on the screen , default : `THREE.Texture()` */
    texture?: THREE.Texture;
};
export type CoverTextureObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const COVERTEXTURE_PARAMS: CoverTextureParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useCoverTexture: ({ size, dpr, samples, isSizeUpdate, uniforms, onBeforeCompile, }: HooksProps) => HooksReturn<CoverTextureParams, CoverTextureObject, CustomParams>;
