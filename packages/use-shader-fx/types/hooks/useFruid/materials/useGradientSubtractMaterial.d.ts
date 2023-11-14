import * as THREE from "three";
type TUniforms = {
    uPressure: {
        value: THREE.Texture;
    };
    uVelocity: {
        value: THREE.Texture;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class GradientSubtractMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useGradientSubtractMaterial: () => GradientSubtractMaterial;
export {};
