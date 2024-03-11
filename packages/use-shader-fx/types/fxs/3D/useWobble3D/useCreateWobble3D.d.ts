import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { Wobble3DParams } from ".";
import { Create3DHooksProps } from "../types";
export type UseCreateWobble3DProps = {
    /** default : THREE.IcosahedronGeometry(2,50) */
    geometry?: THREE.BufferGeometry;
};
type UpdateUniform = (props: RootState | null, params?: Wobble3DParams) => void;
type UseCreateWobble3DReturn = [
    UpdateUniform,
    {
        mesh: THREE.Mesh;
        depthMaterial: THREE.MeshDepthMaterial;
    }
];
export declare const useCreateWobble3D: <T extends WobbleMaterialConstructor>({ scene, geometry, baseMaterial, materialParameters, }: UseCreateWobble3DProps & Create3DHooksProps & WobbleMaterialProps<T>) => UseCreateWobble3DReturn;
export {};
