import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    dataTex: {
        value: THREE.Texture;
    };
    alpha: {
        value: number;
    };
    beta: {
        value: number;
    };
};
export declare class PressureMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const usePressureMaterial: () => PressureMaterial;
export {};
