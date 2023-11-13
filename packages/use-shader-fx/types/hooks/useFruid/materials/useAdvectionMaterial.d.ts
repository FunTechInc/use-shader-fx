import * as THREE from "three";
type TUniforms = {
    uVelocity: {
        value: THREE.Texture;
    };
    uSource: {
        value: THREE.Texture;
    };
    texelSize: {
        value: THREE.Vector2;
    };
    dt: {
        value: number;
    };
    dissipation: {
        value: number;
    };
};
export declare class AdvectionMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useAdvectionMaterial: () => AdvectionMaterial;
export {};
