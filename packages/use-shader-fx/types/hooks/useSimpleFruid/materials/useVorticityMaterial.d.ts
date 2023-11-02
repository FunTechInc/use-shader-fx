import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    dataTex: {
        value: THREE.Texture;
    };
};
export declare class VorticityMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useVorticityMaterial: () => VorticityMaterial;
export {};
