import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type MarbleParams = {
    /** You can add random patterns to noise by passing random numbers ,default:0 */
    pattern?: number;
    /** default:2 */
    complexity?: number;
    /** default:0.2 */
    complexityAttenuation?: number;
    /** default:8 */
    iterations?: number;
    /** default:0.2 */
    timeStrength?: number;
    /** default:0.002 */
    scale?: number;
    /** you can get into the rhythm ♪ , default:false */
    beat?: number | false;
};
export type MarbleObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const MARBLE_PARAMS: MarbleParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useMarble: ({ size, dpr, samples, }: HooksProps) => HooksReturn<MarbleParams, MarbleObject>;
