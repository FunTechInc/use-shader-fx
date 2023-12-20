import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type BlendingParams = {
    /** Make this texture Blending , default:THREE.Texture */
    texture?: THREE.Texture;
    /** map texture, default:THREE.Texture */
    map?: THREE.Texture;
    /** distortion strength , default:0.03 */
    distortionStrength?: number;
    /** value that reflects noise , default:0.0 */
    edge0?: number;
    /** value that reflects noise , default:0.9  */
    edge1?: number;
    /** dodge color , default: THREE.Color(0xffffff) */
    color?: THREE.Color;
};
export type BlendingObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const BLENDING_PARAMS: BlendingParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useBlending: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<BlendingParams, BlendingObject>;
