import * as THREE from "three";
import { HooksProps, HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/useDoubleFBO";
export type BrushParams = {
    /** Texture applied to the brush.Mixed with the value of a , default:THREE.Texture() */
    texture?: THREE.Texture;
    /** size of the stamp, percentage of the size ,default:0.05 */
    radius?: number;
    /** Strength of smudge effect , default:0.0*/
    smudge?: number;
    /** dissipation rate. If set to 1, it will remain. ,default:1.0 */
    dissipation?: number;
    /** Strength of motion blur , default:0.0 */
    motionBlur?: number;
    /** Number of motion blur samples. Affects performance default: 5 */
    motionSample?: number;
    /** brush color , default:THREE.Color(0xffffff) */
    color?: THREE.Color;
};
export type BrushObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
};
export declare const BRUSH_PARAMS: BrushParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useBrush: ({ size, dpr, samples, }: HooksProps) => HooksReturn<BrushParams, BrushObject>;
