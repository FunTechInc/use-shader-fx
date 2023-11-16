import * as THREE from "three";
export declare class FogProjectionMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTime: {
            value: number;
        };
        uTexture: {
            value: THREE.Texture;
        };
        uNoiseMap: {
            value: THREE.Texture;
        };
        distortionStrength: {
            value: number;
        };
        fogEdge0: {
            value: number;
        };
        fogEdge1: {
            value: number;
        };
        fogColor: {
            value: THREE.Color;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => FogProjectionMaterial;
