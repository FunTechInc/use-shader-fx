import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type FogProjectionParams = {
    /** Make this texture FogProjection , default:THREE.Texture */
    texture?: THREE.Texture;
    /** 重ねがけるnoise texture, default:THREE.Texture */
    noiseMap?: THREE.Texture;
    /** 乗算するdistortionの強さ , default:0.03 */
    distortionStrength?: number;
    /** noiseを反映する底地 , default:0.0 */
    fogEdge0?: number;
    /** noiseを反映する天井値 , default:0.9  */
    fogEdge1?: number;
    /** fogのカラー , default: THREE.Color(0xffffff) */
    fogColor?: THREE.Color;
};
export type FogProjectionObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const FOGPROJECTION_PARAMS: FogProjectionParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useFogProjection: ({ size, }: {
    size: Size;
}) => HooksReturn<FogProjectionParams, FogProjectionObject>;
