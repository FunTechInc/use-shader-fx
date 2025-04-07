import { HooksProps, HooksReturn } from "../types";
import { NoiseMaterial, NoiseMaterialProps, NoiseValues } from "../../materials";
export type NoiseProps = HooksProps & NoiseValues;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useNoise: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, ...uniformValues }: NoiseProps) => HooksReturn<NoiseValues, NoiseMaterial & NoiseMaterialProps>;
