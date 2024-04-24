import * as THREE from "three";
import { MaterialProps } from "../../types";
type UseMeshProps = {
    scale: number;
    max: number;
    texture?: THREE.Texture;
    scene: THREE.Scene;
};
export declare const useMesh: ({ scale, max, texture, scene, onBeforeCompile, }: UseMeshProps & MaterialProps) => THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>[];
export {};
