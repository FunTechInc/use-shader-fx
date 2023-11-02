import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../utils/types";
export type FlowmapParams = {
    /** size of the stamp, percentage of the size */
    radius?: number;
    /** 拡大率 */
    magnification?: number;
    /** opacity */
    alpha?: number;
    /** 拡散率。1にすると残り続ける */
    dissipation?: number;
};
export type FlowmapObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
};
export declare const useFlowmap: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<FlowmapParams, FlowmapObject>;
