import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { Wobble3DParams } from ".";
import { CustomParams } from "../../../utils/setUniforms";
import { Create3DHooksProps } from "../types";
export type UseCreateWobble3DProps = {
    /** default : `THREE.IcosahedronGeometry(2,20)` */
    geometry?: THREE.BufferGeometry;
};
type UpdateUniform = (rootState: RootState | null, newParams?: Wobble3DParams, customParams?: CustomParams) => void;
type UseCreateWobble3DReturn<T> = [
    UpdateUniform,
    {
        mesh: THREE.Mesh;
        depthMaterial: THREE.MeshDepthMaterial;
    }
];
export declare const useCreateWobble3D: <T extends WobbleMaterialConstructor>({ scene, geometry, isCustomTransmission, baseMaterial, materialParameters, onBeforeCompile, depthOnBeforeCompile, uniforms, }: UseCreateWobble3DProps & Create3DHooksProps & WobbleMaterialProps<T>) => UseCreateWobble3DReturn<T>;
export {};
