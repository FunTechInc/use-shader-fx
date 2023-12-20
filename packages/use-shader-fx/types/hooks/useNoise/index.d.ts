import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type NoiseParams = {
    /** noise scale , default:0.004 */
    scale?: number;
    /** time factor default:0.3 */
    timeStrength?: number;
    /** noiseOctaves, affects performance default:2 */
    noiseOctaves?: number;
    /** fbmOctaves, affects performance default:2 */
    fbmOctaves?: number;
    /** domain warping octaves , affects performance default:2  */
    warpOctaves?: number;
    /** direction of domain warping , default:(2.0,2,0) */
    warpDirection?: THREE.Vector2;
    /** strength of domain warping , default:8.0 */
    warpStrength?: number;
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
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export declare const useNoise: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<NoiseParams, NoiseObject>;
