import * as THREE from "three";
type TUniforms = {
    uTime: {
        value: number;
    };
    timeStrength: {
        value: number;
    };
    noiseOctaves: {
        value: number;
    };
    fbmOctaves: {
        value: number;
    };
};
export declare class NoiseMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useMesh: (scene: THREE.Scene) => NoiseMaterial;
export {};
