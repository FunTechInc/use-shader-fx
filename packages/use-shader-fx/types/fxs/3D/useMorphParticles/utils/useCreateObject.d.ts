import * as THREE from "three";
type UseCreateObjectProps = {
    scene: THREE.Scene | false;
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
    positions?: Float32Array[];
    uvs?: Float32Array[];
};
export declare const useCreateObject: ({ scene, geometry, material, positions, uvs, }: UseCreateObjectProps) => {
    object: THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material>;
    interactiveMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material>;
    positions: Float32Array[];
    uvs: Float32Array[];
};
export {};
