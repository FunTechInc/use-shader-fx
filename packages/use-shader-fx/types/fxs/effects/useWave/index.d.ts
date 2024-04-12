import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type WaveParams = {
    /** -1.0 ~ 1.0 , default : `vec2(0.0,0.0)` */
    epicenter?: THREE.Vector2;
    /** 0.0 ~ 1.0 , default : `0.0` */
    progress?: number;
    /** default : `0.0` */
    width?: number;
    /** default : `0.0` */
    strength?: number;
    /** default : `center` */
    mode?: "center" | "horizontal" | "vertical";
};
export type WaveObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const WAVE_PARAMS: WaveParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export declare const useWave: ({ size, dpr, samples, isSizeUpdate, }: HooksProps) => HooksReturn<WaveParams, WaveObject>;
