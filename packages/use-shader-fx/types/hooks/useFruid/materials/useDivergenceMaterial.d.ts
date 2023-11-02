import * as THREE from "three";
type TUniforms = {
    uVelocity: {
        value: THREE.Texture;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class DivergenceMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useDivergenceMaterial: () => DivergenceMaterial;
export {};
