import * as THREE from "three";
import { HooksReturn } from "../../types";
import { UseCreateWobble3DProps } from "./useCreateWobble3D";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { HooksProps3D } from "../types";
import { CustomParams } from "../../../utils/setUniforms";
export type Wobble3DParams = {
    /** default : `0.3` */
    wobbleStrength?: number;
    /** default : `0.3` */
    wobblePositionFrequency?: number;
    /** default : `0.3` */
    wobbleTimeFrequency?: number;
    /** default : `0.3` */
    warpStrength?: number;
    /** default : `0.3` */
    warpPositionFrequency?: number;
    /** default : `0.3` */
    warpTimeFrequency?: number;
    color0?: THREE.Color;
    color1?: THREE.Color;
    color2?: THREE.Color;
    color3?: THREE.Color;
    /** Mixing ratio with the material's original output color, 0~1 , defaulat : `1` */
    colorMix?: number;
    /** Threshold of edge. 0 for edge disabled, default : `0` */
    edgeThreshold?: number;
    /** Color of edge. default : `0x000000` */
    edgeColor?: THREE.Color;
    /** you can get into the rhythm ♪ , default : `false` */
    beat?: number | false;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `0.1` */
    chromaticAberration?: number;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `0.1` */
    anisotropicBlur?: number;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `0.0` */
    distortion?: number;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `0.1` */
    distortionScale?: number;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `0.0` */
    temporalDistortion?: number;
    /** valid only for `MeshPhysicalMaterial` && `isCustomTransmission:true` , default : `6`  */
    refractionSamples?: number;
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
export declare const useWobble3D: <T extends WobbleMaterialConstructor>({ size, dpr, samples, renderTargetOptions, isSizeUpdate, camera, geometry, baseMaterial, materialParameters, isCustomTransmission, onBeforeInit, depthOnBeforeInit, }: HooksProps3D & UseCreateWobble3DProps & WobbleMaterialProps<T>) => HooksReturn<Wobble3DParams, Wobble3DObject, CustomParams>;
