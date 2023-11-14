import * as THREE from "three";
type TUniforms = {
    uTarget: {
        value: THREE.Texture;
    };
    aspectRatio: {
        value: number;
    };
    color: {
        value: THREE.Vector3;
    };
    point: {
        value: THREE.Vector2;
    };
    radius: {
        value: number;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class SplatMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useSplateMaterial: () => SplatMaterial;
export {};
