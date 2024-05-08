import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import { InteractiveMesh, MorphParticlePoints } from "./utils/useCreateObject";
import { MorphParticlesParams } from ".";
import { CustomParams } from "../../../utils/setUniforms";
import { Create3DHooksProps } from "../types";
import { Dpr } from "../../types";
export type UseCreateMorphParticlesProps = {
    size: Size;
    dpr: Dpr;
    /** default : `THREE.SphereGeometry(1, 32, 32)` */
    geometry?: THREE.BufferGeometry;
    positions?: Float32Array[];
    uvs?: Float32Array[];
    /** Array of textures to map to points. Mapped at random. */
    mapArray?: THREE.Texture[];
};
type UpdateUniform = (props: RootState | null, params?: MorphParticlesParams, customParams?: CustomParams) => void;
type UseCreateMorphParticlesReturn = [
    UpdateUniform,
    {
        points: MorphParticlePoints;
        interactiveMesh: InteractiveMesh;
        positions: Float32Array[];
        uvs: Float32Array[];
    }
];
export declare const useCreateMorphParticles: ({ size, dpr, scene, geometry, positions, uvs, mapArray, uniforms, onBeforeCompile, }: Create3DHooksProps & UseCreateMorphParticlesProps) => UseCreateMorphParticlesReturn;
export {};
