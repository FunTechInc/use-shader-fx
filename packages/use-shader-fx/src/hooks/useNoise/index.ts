import { useCallback } from "react";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { NoiseMaterial, NoiseValues } from "../../materials";
import { useFxScene } from "../../utils/useFxScene";

export type NoiseProps = HooksProps & NoiseValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useNoise = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: NoiseProps): HooksReturn<NoiseValues, NoiseMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: NoiseMaterial,
      uniformValues,
      materialParameters,
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
      (newValues: NoiseValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: NoiseValues) => {
         const { gl, clock } = rootState;
         newValues && setValues(newValues);
         material.uniforms.tick.value =
            newValues?.tick || clock.getElapsedTime();
         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget, material]
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
