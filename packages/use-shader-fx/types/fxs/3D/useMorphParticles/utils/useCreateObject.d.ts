import * as THREE from "three";
type UseCreateObjectProps = {
    scene: THREE.Scene | false;
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
};
export type MorphParticlePoints = THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.ShaderMaterial>;
export type InteractiveMesh = THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.ShaderMaterial>;
export declare const useCreateObject: ({ scene, geometry, material, }: UseCreateObjectProps) => {
    points: MorphParticlePoints;
    interactiveMesh: InteractiveMesh;
};
export {};
