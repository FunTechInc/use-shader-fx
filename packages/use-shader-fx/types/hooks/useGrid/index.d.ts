import { HooksProps, HooksReturn } from "../types";
import { GridMaterial, GridValues, GridMaterialProps } from "../../materials";
export type GridProps = HooksProps & GridValues;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useGrid: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, ...uniformValues }: GridProps) => HooksReturn<GridValues, GridMaterial & GridMaterialProps>;
