import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/types";
export type FlowmapParams = {
    /** size of the stamp, percentage of the size ,default:0.1 */
    radius?: number;
    /** 拡大率 , default:0.0 */
    magnification?: number;
    /** opacity  , default:0.0 */
    alpha?: number;
    /** 拡散率。1にすると残り続ける , default:0.9 */
    dissipation?: number;
};
export type FlowmapObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
};
export declare const FLOWMAP_PARAMS: FlowmapParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useFlowmap: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<FlowmapParams, FlowmapObject>;
