import * as THREE from "three";
export declare class ColorStrataMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        isTexture: {
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
    };
}
export declare const useMesh: (scene: THREE.Scene) => ColorStrataMaterial;
