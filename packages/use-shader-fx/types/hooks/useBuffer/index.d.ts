import { HooksProps, HooksReturn } from "../types";
import { BufferMaterial, BufferMaterialProps, BufferValues } from "../../materials";
export type BufferProps = HooksProps & BufferValues;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useBuffer: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, ...uniformValues }: BufferProps) => HooksReturn<BufferValues, BufferMaterial & BufferMaterialProps>;
