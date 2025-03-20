import { HooksProps, HooksReturn } from "../types";
import { RawBlankMaterial } from "../../materials";
import { ShaderWithUniforms } from "../../shaders/uniformsUtils";
export type RawBlankProps = HooksProps & ShaderWithUniforms;
/**
 * type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
   renderCount: { value: number };
    はデフォルトである
    あとvaringでvUvつかえる
    
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useRawBlank: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, ...shaderWithUniforms }: RawBlankProps) => HooksReturn<{}, RawBlankMaterial>;
