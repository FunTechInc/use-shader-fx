import * as THREE from "three";
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
        uMode: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => WaveMaterial;
