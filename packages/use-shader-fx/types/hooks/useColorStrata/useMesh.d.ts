import * as THREE from "three";
export declare class ColorStrataMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        isTexture: {
            value: boolean;
        };
        scale: {
            value: number;
        };
        noise: {
            value: THREE.Texture;
        };
        noiseStrength: {
            value: THREE.Vector2;
        };
        isNoise: {
            value: boolean;
        };
        laminateLayer: {
            value: number;
        };
        laminateInterval: {
            value: THREE.Vector2;
        };
        laminateDetail: {
            value: THREE.Vector2;
        };
        distortion: {
            value: THREE.Vector2;
        };
        colorFactor: {
            value: THREE.Vector3;
        };
        uTime: {
            value: number;
        };
        timeStrength: {
            value: THREE.Vector2;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => ColorStrataMaterial;
