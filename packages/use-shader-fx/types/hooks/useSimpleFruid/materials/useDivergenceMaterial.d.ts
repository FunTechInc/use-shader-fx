import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    dataTex: {
        value: THREE.Texture;
    };
};
export declare class DivergenceMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useDivergenceMaterial: () => DivergenceMaterial;
export {};
