import * as THREE from "three";
export declare class CurlMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uVelocity: {
            value: THREE.Texture;
        };
        texelSize: {
            value: THREE.Vector2;
        };
    };
}
export declare const useCurlMaterial: () => CurlMaterial;
