import * as THREE from "three";
type TUniforms = {
    uVelocity: {
        value: THREE.Texture;
    };
    uCurl: {
        value: THREE.Texture;
    };
    curl: {
        value: number;
    };
    dt: {
        value: number;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class VorticityMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useVorticityMaterial: () => VorticityMaterial;
export {};
