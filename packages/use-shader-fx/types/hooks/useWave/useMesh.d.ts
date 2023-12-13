import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare class WaveMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uEpicenter: {
            value: THREE.Vector2;
        };
        uProgress: {
            value: number;
        };
        uStrength: {
            value: number;
        };
        uWidth: {
            value: number;
        };
        uResolution: {
            value: THREE.Vector2;
        };
        uMode: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => WaveMaterial;
