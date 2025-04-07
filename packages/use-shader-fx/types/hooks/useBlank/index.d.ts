import { HooksProps, HooksReturn } from "../types";
import { BlankMaterial } from "../../materials";
import { ShaderWithUniforms } from "../../shaders/uniformsUtils";
type BlankConfig = {
    pointerLerp?: number;
};
export type BlankProps = HooksProps & ShaderWithUniforms;
/**
 * type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
   renderCount: { value: number };
    はデフォルトである
    あとvaringでvUvつかえる

    加えて、
    time
    pointer
    backbuffer
    もデフォルトで使える

    あと、pointerLerp使えるよ

 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useBlank: ({ size, dpr, fboAutoSetSize, renderTargetOptions, materialParameters, pointerLerp, ...shaderWithUniforms }: BlankProps & BlankConfig) => HooksReturn<{}, BlankMaterial>;
export {};
