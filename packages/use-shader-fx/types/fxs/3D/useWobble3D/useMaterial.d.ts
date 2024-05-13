import * as THREE from "three";
import { MaterialProps } from "../../types";
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
        uEdgeThreshold: {
            value: number;
        };
        uEdgeColor: {
            value: THREE.Color;
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
        uRefractionSamples: {
            value: number;
        };
    };
}
export type WobbleMaterialConstructor = new (opts: {
    [key: string]: any;
}) => THREE.Material;
type WobbleMaterialParams<T extends WobbleMaterialConstructor> = ConstructorParameters<T>[0];
export interface WobbleMaterialProps<T extends WobbleMaterialConstructor> extends MaterialProps {
    /** default:THREE.MeshPhysicalMaterial */
    baseMaterial?: T;
    materialParameters?: WobbleMaterialParams<T>;
    /**
     * depthMaterial's onBeforeCompile
     * @param parameters — WebGL program parameters
     * @param renderer — WebGLRenderer Context that is initializing the material
     */
    depthOnBeforeCompile?: (parameters: THREE.WebGLProgramParametersWithUniforms, renderer: THREE.WebGLRenderer) => void;
    /**
     * Whether to apply more advanced `transmission` or not. valid only for `MeshPhysicalMaterial`. This is a function referring to `drei/MeshTransmissionMaterial`, default : `false`
     * @link https://github.com/pmndrs/drei?tab=readme-ov-file#meshtransmissionmaterial
     * */
    isCustomTransmission?: boolean;
}
export declare const useMaterial: <T extends WobbleMaterialConstructor>({ baseMaterial, materialParameters, onBeforeCompile, depthOnBeforeCompile, isCustomTransmission, uniforms, }: WobbleMaterialProps<T>) => {
    material: Wobble3DMaterial;
    depthMaterial: THREE.MeshDepthMaterial;
};
export {};
