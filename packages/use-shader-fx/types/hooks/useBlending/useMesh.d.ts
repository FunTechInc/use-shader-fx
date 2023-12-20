import * as THREE from "three";
export declare class BlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTime: {
            value: number;
        };
        uTexture: {
            value: THREE.Texture;
        };
        uMap: {
            value: THREE.Texture;
        };
        distortionStrength: {
            value: number;
        };
        edge0: {
            value: number;
        };
        edge1: {
            value: number;
        };
        color: {
            value: THREE.Color;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => BlendingMaterial;
