import * as THREE from "three";
import { CustomParams } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
export type FxTextureParams = {
    /** 1st texture , default : `THREE.Texture()` */
    texture0?: THREE.Texture;
    /** 2nd texture , default : `THREE.Texture()` */
    texture1?: THREE.Texture;
    /** add transparent padding, 0.0 ~ 1.0 , default : `0.0` */
    padding?: number;
    /** The color map. The uv value is affected according to this rbg , default : `THREE.Texture()` */
    map?: THREE.Texture;
    /** intensity of map , r,g value are affecting , default : `0.0` */
    mapIntensity?: number;
    /** Intensity of effect on edges , default : `0.0` */
    edgeIntensity?: number;
    /** epicenter of fx, -1 ~ 1 , default : `vec2(0.0,0.0)` */
    epicenter?: THREE.Vector2;
    /** Switch value to switch between texture0 and texture1 , 0 ~ 1 , default : `0` */
    progress?: number;
    /** direction of transition , default: `THREE.Vector2(0, 0)` */
    dir?: THREE.Vector2;
};
export type FxTextureObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const FXTEXTURE_PARAMS: FxTextureParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useFxTexture: ({ size, dpr, samples, isSizeUpdate, uniforms, onBeforeCompile, }: HooksProps) => HooksReturn<FxTextureParams, FxTextureObject, CustomParams>;
