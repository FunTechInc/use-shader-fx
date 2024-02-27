import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type CoverTextureParams = {
    /** Textures that you want to display exactly on the screen , default:THREE.Texture()  */
    texture?: THREE.Texture;
};
export type CoverTextureObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const COVERTEXTURE_PARAMS: CoverTextureParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useCoverTexture: ({ size, dpr, samples, }: HooksProps) => HooksReturn<CoverTextureParams, CoverTextureObject>;
