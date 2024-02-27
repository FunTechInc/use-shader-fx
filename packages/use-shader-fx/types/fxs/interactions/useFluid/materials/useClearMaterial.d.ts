import * as THREE from "three";
export declare class ClearMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        value: {
            value: number;
        };
        texelSize: {
            value: THREE.Vector2;
        };
    };
}
export declare const useClearMaterial: () => ClearMaterial;
