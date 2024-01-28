import * as THREE from "three";
type UseMeshProps = {
    scale: number;
    max: number;
    texture?: THREE.Texture;
    scene: THREE.Scene;
};
export declare const useMesh: ({ scale, max, texture, scene }: UseMeshProps) => THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>[];
export {};
