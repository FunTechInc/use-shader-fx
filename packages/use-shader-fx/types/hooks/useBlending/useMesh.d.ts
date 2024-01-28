import * as THREE from "three";
export declare class BlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_map: {
            value: THREE.Texture;
        };
        u_alphaMap: {
            value: THREE.Texture;
        };
        u_isAlphaMap: {
            value: boolean;
        };
        u_mapIntensity: {
            value: number;
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
        u_dodgeColor: {
            value: THREE.Color;
        };
        u_isDodgeColor: {
            value: boolean;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => BlendingMaterial;
