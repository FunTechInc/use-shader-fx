import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type ColorStrataParams = {
    /** default: null */
    texture?: THREE.Texture | false;
    /** default: 1.0 */
    laminateLayer?: number;
    /** default: (0.1, 0.1) */
    laminateInterval?: THREE.Vector2;
    /** default: (1.0, 1.0) */
    laminateDetail?: THREE.Vector2;
    /** default: (0.0, 0.0) */
    distortion?: THREE.Vector2;
    /** default: (1.0, 1.0,1.0) */
    colorFactor?: THREE.Vector3;
};
export type ColorStrataObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const COLORSTRATA_PARAMS: ColorStrataParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useColorStrata: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<ColorStrataParams, ColorStrataObject>;
