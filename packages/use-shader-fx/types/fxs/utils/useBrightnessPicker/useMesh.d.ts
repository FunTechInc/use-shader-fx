import * as THREE from "three";
export declare class BrightnessPickerMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_brightness: {
            value: THREE.Vector3;
        };
        u_min: {
            value: number;
        };
        u_max: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => BrightnessPickerMaterial;
