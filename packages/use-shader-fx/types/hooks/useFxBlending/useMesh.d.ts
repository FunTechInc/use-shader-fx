import * as THREE from "three";
export declare class FxBlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_map: {
            value: THREE.Texture;
        };
        u_mapIntensity: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => FxBlendingMaterial;
