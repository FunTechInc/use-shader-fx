import * as THREE from "three";
export declare class GradientSubtractMaterial extends THREE.ShaderMaterial {
    uniforms: {
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
}
export declare const useGradientSubtractMaterial: () => GradientSubtractMaterial;
