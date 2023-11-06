import * as THREE from "three";
import { SimpleFruidMaterials } from "./useMesh";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/types";
export type SimpleFruidParams = {
    /** 圧力のヤコビ法の計算回数 */
    pressure_iterations?: number;
    /** 圧力のステップごとの減衰値 */
    attenuation?: number;
    /** 圧力計算時の係数 */
    alpha?: number;
    /** 圧力計算時の係数 */
    beta?: number;
    /** 粘度 */
    viscosity?: number;
    /** 力を加える円の半径 */
    forceRadius?: number;
    /** 速度の係数 */
    forceCoefficient?: number;
};
export type SimpleFruidObject = {
    scene: THREE.Scene;
    materials: SimpleFruidMaterials;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
};
export declare const useSimpleFruid: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<SimpleFruidParams, SimpleFruidObject>;
