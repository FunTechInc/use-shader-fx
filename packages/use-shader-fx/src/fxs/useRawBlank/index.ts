import * as THREE from "three";
import { useCallback } from "react";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { useDpr } from "../../utils/useDpr";
import { RootState } from "../types";
import { RawBlankMaterial } from "./RawBlankMaterial";
import { useFxScene } from "../../utils/useFxScene";
import { ShaderWithUniforms } from "../materials/FxMaterial";

export type RawBlankValues = {};

type RawBlankConfig = ShaderWithUniforms;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRawBlank = ({
   size,
   dpr,
   sizeUpdate,
   renderTargetOptions,
   materialParameters,
   uniforms,
   vertexShader,
   fragmentShader,
   ...uniformValues
}: HooksProps & RawBlankValues & RawBlankConfig): HooksReturn<
   RawBlankValues,
   RawBlankMaterial
> => {
   const _dpr = useDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: RawBlankMaterial,
      uniformValues,
      materialParameters,
      uniforms,
      vertexShader,
      fragmentShader,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      sizeUpdate,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: RawBlankValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: RawBlankValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);
         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
      camera,
   };
};
