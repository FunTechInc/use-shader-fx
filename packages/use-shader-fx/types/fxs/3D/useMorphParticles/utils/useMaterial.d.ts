import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare class MorphParticlesMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uResolution: {
            value: THREE.Vector2;
        };
        uMorphProgress: {
            value: number;
        };
        uBlurAlpha: {
            value: number;
        };
        uBlurRadius: {
            value: number;
        };
        uPointSize: {
            value: number;
        };
        uPointAlpha: {
            value: number;
        };
        uPicture: {
            value: THREE.Texture;
        };
        uIsPicture: {
            value: boolean;
        };
        uAlphaPicture: {
            value: THREE.Texture;
        };
        uIsAlphaPicture: {
            value: boolean;
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
        uMap: {
            value: THREE.Texture;
        };
        uIsMap: {
            value: boolean;
        };
        uAlphaMap: {
            value: THREE.Texture;
        };
        uIsAlphaMap: {
            value: boolean;
        };
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
        uDisplacement: {
            value: THREE.Texture;
        };
        uIsDisplacement: {
            value: boolean;
        };
        uDisplacementIntensity: {
            value: number;
        };
        uDisplacementColorIntensity: {
            value: number;
        };
        uSizeRandomIntensity: {
            value: number;
        };
        uSizeRandomTimeFrequency: {
            value: number;
        };
        uSizeRandomMin: {
            value: number;
        };
        uSizeRandomMax: {
            value: number;
        };
        uDivergence: {
            value: number;
        };
        uDivergencePoint: {
            value: THREE.Vector3;
        };
    };
}
export declare const useMaterial: ({ size, dpr, geometry, positions, uvs, mapArray, }: {
    size: Size;
    dpr: number | false;
    geometry: THREE.BufferGeometry;
    positions?: Float32Array[] | undefined;
    uvs?: Float32Array[] | undefined;
    mapArray?: THREE.Texture[] | undefined;
}) => {
    material: MorphParticlesMaterial;
    modifiedPositions: Float32Array[];
    modifiedUvs: Float32Array[];
};
