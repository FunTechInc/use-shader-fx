import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type TransitionBgParams = {
    /** 0番目のtexture , default:THREE.Texture() */
    texture0?: THREE.Texture;
    /** 1番目のtexture , default:THREE.Texture() */
    texture1?: THREE.Texture;
    /** 画像の比率 , default:THREE.Vector2(0, 0) */
    imageResolution?: THREE.Vector2;
    /** transitionする際に乗算するnoise texture. useNoiseでもいいけど、画像として書き出したnoise textureでも可 , default:THREE.Texture() */
    uNoiseMap?: THREE.Texture;
    /** noiseの強さ , default:0.0 */
    noiseStrength?: number;
    /** texture0とtexture1を切り替えるスイッチ値 */
    progress?: number;
    /** transitionする方向 , default: THREE.Vector2(0, 0) */
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
