import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import { MorphParticlesParams } from ".";
import { Create3DHooksProps } from "../types";
export type UseCreateMorphParticlesProps = {
    size: Size;
    dpr: number;
    /** default : THREE.SphereGeometry(1, 32, 32) */
    geometry?: THREE.BufferGeometry;
    positions?: Float32Array[];
    uvs?: Float32Array[];
    /** Array of textures to map to points. Mapped at random. */
    mapArray?: THREE.Texture[];
};
type UpdateUniform = (props: RootState | null, params?: MorphParticlesParams) => void;
type UseCreateMorphParticlesReturn = [
    UpdateUniform,
    {
        points: THREE.Points;
        interactiveMesh: THREE.Mesh;
        positions: Float32Array[];
        uvs: Float32Array[];
    }
];
export declare const useCreateMorphParticles: ({ size, dpr, scene, geometry, positions, uvs, mapArray, }: Create3DHooksProps & UseCreateMorphParticlesProps) => UseCreateMorphParticlesReturn;
export {};
