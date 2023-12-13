import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type RippleParams = {
    /** How often ripples appear,default:0.01 */
    frequency?: number;
    /** rotation rate,default:0.05 */
    rotation?: number;
    /** fadeout speed,default:0.9 */
    fadeout_speed?: number;
    /** scale rate,default:0.3 */
    scale?: number;
    /** alpha,default:0.6 */
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
