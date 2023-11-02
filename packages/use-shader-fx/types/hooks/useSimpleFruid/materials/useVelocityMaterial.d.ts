import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    viscosity: {
        value: number;
    };
    forceRadius: {
        value: number;
    };
    forceCoefficient: {
        value: number;
    };
    dataTex: {
        value: THREE.Texture;
    };
    pointerPos: {
        value: THREE.Vector2;
    };
    beforePointerPos: {
        value: THREE.Vector2;
    };
};
export declare class VelocityMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useVelocityMaterial: () => VelocityMaterial;
export {};
