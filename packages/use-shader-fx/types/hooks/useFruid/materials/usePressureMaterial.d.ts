import * as THREE from "three";
type TUniforms = {
    uPressure: {
        value: THREE.Texture;
    };
    uDivergence: {
        value: THREE.Texture;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class PressureMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const usePressureMaterial: () => PressureMaterial;
export {};
