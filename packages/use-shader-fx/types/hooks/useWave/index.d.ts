import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type WaveParams = {
    /** -1.0 ~ 1.0 , default:vec2(0.0,0.0) */
    epicenter?: THREE.Vector2;
    /** 0.0 ~ 1.0 , default:0.0 */
    progress?: number;
    /** default:0.0 */
    width?: number;
    /** default:0.0 */
    strength?: number;
    /** default:center */
    mode?: "center" | "horizontal" | "vertical";
};
export type WaveObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const WAVE_PARAMS: WaveParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useWave: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<WaveParams, WaveObject>;
