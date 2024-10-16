import { useCallback } from "react";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { RawBlankMaterial, RawBlankValues } from "../../materials";
import { useFxScene } from "../../utils/useFxScene";
import { ShaderWithUniforms } from "../../materials/core/FxMaterial";

type RawBlankConfig = ShaderWithUniforms;

export type RawBlankProps = HooksProps & RawBlankValues & RawBlankConfig;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRawBlank = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   uniforms,
   vertexShader,
   fragmentShader,
   ...uniformValues
}: RawBlankProps): HooksReturn<RawBlankValues, RawBlankMaterial> => {
   const _dpr = getDpr(dpr);

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
      fboAutoSetSize,
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
      renderTarget,
   };
};
