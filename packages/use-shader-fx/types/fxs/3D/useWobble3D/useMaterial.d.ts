import * as THREE from "three";
export declare class Wobble3DMaterial extends THREE.Material {
    uniforms: {
        uTime: {
            value: number;
        };
        uWobblePositionFrequency: {
            value: number;
        };
        uWobbleTimeFrequency: {
            value: number;
        };
        uWobbleStrength: {
            value: number;
        };
        uWarpPositionFrequency: {
            value: number;
        };
        uWarpTimeFrequency: {
            value: number;
        };
        uWarpStrength: {
            value: number;
        };
        uWobbleShine: {
            value: number;
        };
        uColor0: {
            value: THREE.Color;
        };
        uColor1: {
            value: THREE.Color;
        };
        uColor2: {
            value: THREE.Color;
        };
        uColor3: {
            value: THREE.Color;
        };
        uColorMix: {
            value: number;
        };
        uChromaticAberration: {
            value: number;
        };
        uAnisotropicBlur: {
            value: number;
        };
        uDistortion: {
            value: number;
        };
        uDistortionScale: {
            value: number;
        };
        uTemporalDistortion: {
            value: number;
        };
        uSamples: {
            value: number;
        };
    };
}
export type WobbleMaterialConstructor = new (opts: {
    [key: string]: any;
}) => THREE.Material;
type MaterialParams<T extends WobbleMaterialConstructor> = ConstructorParameters<T>[0];
export type WobbleMaterialProps<T extends WobbleMaterialConstructor> = {
    /** default:THREE.MeshPhysicalMaterial */
    baseMaterial?: T;
    materialParameters?: MaterialParams<T>;
};
export declare const useMaterial: <T extends WobbleMaterialConstructor>({ baseMaterial, materialParameters, }: WobbleMaterialProps<T>) => {
    material: Wobble3DMaterial;
    depthMaterial: THREE.MeshDepthMaterial;
};
export {};
