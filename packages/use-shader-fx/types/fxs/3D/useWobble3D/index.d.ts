import * as THREE from "three";
import { HooksReturn } from "../../types";
import { UseCreateWobble3DProps } from "./useCreateWobble3D";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { HooksProps3D } from "../types";
export type Wobble3DParams = {
    wobbleStrength?: number;
    wobblePositionFrequency?: number;
    wobbleTimeFrequency?: number;
    /** The roughness is attenuated by the strength of the wobble. It has no meaning if the roughness is set to 0 or if the material does not have a roughness param ,default : `0` */
    wobbleShine?: number;
    warpStrength?: number;
    warpPositionFrequency?: number;
    warpTimeFrequency?: number;
    /** Refraction samples, default : `6`  */
    samples?: number;
    color0?: THREE.Color;
    color1?: THREE.Color;
    color2?: THREE.Color;
    color3?: THREE.Color;
    /** Mixing ratio with the material's original output color, 0~1 , defaulat : `1` */
    colorMix?: number;
    /** valid only for MeshPhysicalMaterial , default : `0.5` */
    chromaticAberration?: number;
    /** valid only for MeshPhysicalMaterial , default : `0.1` */
    anisotropicBlur?: number;
    /** valid only for MeshPhysicalMaterial , default : `0.1` */
    distortion?: number;
    /** valid only for MeshPhysicalMaterial , default : `0.1` */
    distortionScale?: number;
    /** valid only for MeshPhysicalMaterial , default : `0.1` */
    temporalDistortion?: number;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
};
export type Wobble3DObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    depthMaterial: THREE.MeshDepthMaterial;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const WOBBLE3D_PARAMS: Wobble3DParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export declare const useWobble3D: <T extends WobbleMaterialConstructor>({ size, dpr, samples, camera, geometry, baseMaterial, materialParameters, }: HooksProps3D & UseCreateWobble3DProps & WobbleMaterialProps<T>) => HooksReturn<Wobble3DParams, Wobble3DObject>;
