import * as THREE from "three";
type UseCreateObjectProps = {
    scene: THREE.Scene | false;
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
};
export declare const useCreateObject: ({ scene, geometry, material, }: UseCreateObjectProps) => {
    points: THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material>;
    interactiveMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material>;
};
export {};
