import * as THREE from "three";
type TUniforms = {
    uTexture: {
        value: THREE.Texture;
    };
    uColor0: {
        value: THREE.Color;
    };
    uColor1: {
        value: THREE.Color;
    };
};
export declare class DuoToneMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useMesh: (scene: THREE.Scene) => DuoToneMaterial;
export {};
