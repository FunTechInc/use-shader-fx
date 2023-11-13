import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type NoiseParams = {
    /** 時間係数 default:0.3 */
    timeStrength?: number;
    /** noiseの振幅回数 default:8 */
    noiseOctaves?: number;
    /** fbmの振幅回数 default:3 */
    fbmOctaves?: number;
};
export type NoiseObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const NOISE_PARAMS: NoiseParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useNoise: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<NoiseParams, NoiseObject>;
