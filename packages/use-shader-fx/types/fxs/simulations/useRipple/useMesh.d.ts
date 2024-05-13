import * as THREE from "three";
import { MaterialProps } from "../../types";
type UseMeshProps = {
    scale: number;
    max: number;
    scene: THREE.Scene;
    texture?: THREE.Texture;
};
export declare const useMesh: ({ scale, max, texture, scene, uniforms, onBeforeCompile, }: UseMeshProps & MaterialProps) => THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap>[];
export {};
