import * as THREE from "three";
import { PointerValues } from "../../../misc/usePointer";
import { HooksProps, HooksReturn } from "../../types";
export type RippleParams = {
    /** How often ripples appear, default : `0.01` */
    frequency?: number;
    /** rotation rate, default : `0.05` */
    rotation?: number;
    /** fadeout speed, default : `0.9` */
    fadeout_speed?: number;
    /** scale rate, default : `0.3` */
    scale?: number;
    /** alpha, default : `0.6` */
    alpha?: number;
    /** When calling usePointer in a frame loop, setting PointerValues ​​to this value prevents double calls , default : `false` */
    pointerValues?: PointerValues | false;
};
export type RippleObject = {
    scene: THREE.Scene;
    meshArr: THREE.Mesh[];
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const RIPPLE_PARAMS: RippleParams;
interface UseRippleProps extends HooksProps {
    /** texture applied to ripple */
    texture?: THREE.Texture;
    /** ripple size, default:64 */
    scale?: number;
    /** ripple max length, default:100 */
    max?: number;
}
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useRipple: ({ texture, scale, max, size, dpr, samples, isSizeUpdate, onBeforeCompile, }: UseRippleProps) => HooksReturn<RippleParams, RippleObject>;
export {};
