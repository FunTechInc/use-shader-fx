import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => THREE.ShaderMaterial;
