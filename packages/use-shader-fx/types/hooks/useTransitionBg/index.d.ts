import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type TransitionBgParams = {
    /** 1st texture , default:THREE.Texture() */
    texture0?: THREE.Texture;
    /** 2nd texture , default:THREE.Texture() */
    texture1?: THREE.Texture;
    /** background image ratio , default:THREE.Vector2(0, 0) */
    imageResolution?: THREE.Vector2;
    /** Noise texture to be multiplied when transitioning. You can use useNoise, but you can also use noise texture exported as an image. , default:THREE.Texture() */
    noiseMap?: THREE.Texture;
    /** noise strength , default:0.0 */
    noiseStrength?: number;
    /** Switch value to switch between texture0 and texture1 */
    progress?: number;
    /** direction of transition , default: THREE.Vector2(0, 0) */
    dir?: THREE.Vector2;
};
export type TransitionBgObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const TRANSITIONBG_PARAMS: TransitionBgParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useTransitionBg: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<TransitionBgParams, TransitionBgObject>;
