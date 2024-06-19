import * as THREE from "three";
import { RawBlankMaterial } from "./useMesh";
import { CustomParams } from "../../../utils/setUniforms";
import type { HooksProps, HooksReturn } from "../../types";
export type RawBlankParams = {};
export type RawBlankObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, RawBlankMaterial>;
    material: RawBlankMaterial;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const RAWBLANK_PARAMS: RawBlankParams;
/**
 * By default, it is a blank canvas with nothing drawn on it. You can customise the shaders using `onBeforeCompile`.
 * Fragment shaders have `uResolution` as default uniforms.
 *
 * ※ `usf_FragColor` overrides `gl_FragColor`
 *
 * ※ `usf_Position` overrides `gl_Position`
 *
 * `RawBlankParams` is an empty object. so you can't pass any parameters to second argument. Nothing will happen if you pass them.
 * ```tsx
 * useFrame((state) => {
      update(
         state,
         {},
         {
            uTime: state.clock.getElapsedTime(),
         }
      );
   });
 * ```
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useRawBlank: ({ size, dpr, renderTargetOptions, isSizeUpdate, onBeforeInit, }: HooksProps) => HooksReturn<RawBlankParams, RawBlankObject, CustomParams>;
