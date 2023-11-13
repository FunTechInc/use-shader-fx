import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/types";
export type BrushParams = {
    /** ブラシに適用するテクスチャー.aの値でmixさせてます , default:THREE.Texture() */
    texture?: THREE.Texture;
    /** size of the stamp, percentage of the size ,default:0.05 */
    radius?: number;
    /** 滲み効果の強さ , default:0.0*/
    smudge?: number;
    /** 拡散率。1にすると残り続ける ,default:0.9 */
    dissipation?: number;
    /** モーションブラーの強さ , default:0.0 */
    motionBlur?: number;
    /** モーションブラーのサンプル数 これを高くするとパフォーマンスへの影響大, default: 5 */
    motionSample?: number;
    /** ブラシの色 , default:THREE.Color(0xffffff) */
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
export declare const useBrush: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<BrushParams, BrushObject>;
