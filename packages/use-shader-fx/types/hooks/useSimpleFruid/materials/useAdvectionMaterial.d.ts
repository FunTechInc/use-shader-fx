import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    dataTex: {
        value: THREE.Texture;
    };
    attenuation: {
        value: number;
    };
};
export declare class AdvectionMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useAdvectionMaterial: () => AdvectionMaterial;
export {};
