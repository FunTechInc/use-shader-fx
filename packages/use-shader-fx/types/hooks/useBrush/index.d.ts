import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../utils/types";
export type BrushParams = {
    /** ブラシに適用するテクスチャー */
    texture?: THREE.Texture;
    /** size of the stamp, percentage of the size */
    radius?: number;
    /** opacity TODO*これバグってるいので修正 */
    alpha?: number;
    /** 滲み効果の強さ */
    smudge?: number;
    /** 拡散率。1にすると残り続ける */
    dissipation?: number;
    /** 拡大率 */
    magnification?: number;
    /** モーションブラーの強さ */
    motionBlur?: number;
    /** モーションブラーのサンプル数 これを高くするとパフォーマンスへの影響大 */
    motionSample?: number;
};
export type BrushObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
};
export declare const useBrush: ({ size, }: {
    size: Size;
}) => HooksReturn<BrushParams, BrushObject>;
