import * as THREE from "three";
import { HooksProps, HooksReturn } from "../types";
import { BasicFxValues, FluidMaterials } from "../../materials";
export type FluidValues = {
    pressureIterations?: number;
} & BasicFxValues & FluidMaterials.AdvectionValuesClient & FluidMaterials.DivergenceValuesClient & FluidMaterials.PoissonValuesClient & FluidMaterials.PressureValuesClient & FluidMaterials.SplatValuesClient;
export type FluidProps = HooksProps & FluidValues;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useFluid: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, ...uniformValues }: FluidProps) => HooksReturn<FluidValues, any, {
    /** velocity map */
    velocity: THREE.Texture;
}>;
