import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type RippleParams = {
    /** rippleが出現する頻度,default:0.01 */
    frequency?: number;
    /** rippleの回転,default:0.01 */
    rotation?: number;
    /** rippleがフェードアウトするスピード,default:0.9 */
    fadeout_speed?: number;
    /** rippleの拡大率,default:0.15 */
    scale?: number;
    /** rippleの透明度,default:0.6 */
    alpha?: number;
};
export type RippleObject = {
    scene: THREE.Scene;
    meshArr: THREE.Mesh[];
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const RIPPLE_PARAMS: RippleParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useRipple: ({ texture, scale, max, size, }: {
    /** texture applied to ripple */
    texture: THREE.Texture;
    /** ripple size, default:64 */
    scale?: number | undefined;
    /** ripple max length, default:100 */
    max?: number | undefined;
    size: Size;
}) => HooksReturn<RippleParams, RippleObject>;
