import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { BlurMaterial, BlurValues } from "../../materials";
import { useFxScene } from "../../utils/useFxScene";
import { useDoubleFBO } from "../../utils/useDoubleFBO";

type BlurConfig = {
   blurIteration?: number;
};

export type BlurProps = HooksProps & BlurValues & BlurConfig;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBlur = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   blurIteration = 5,
   ...uniformValues
}: BlurProps): HooksReturn<BlurValues, BlurMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: BlurMaterial,
      uniformValues,
      materialParameters,
   });

   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: BlurValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: BlurValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);

         const srcCache = material.uniforms.src?.value;

         material.updateBasicFx();

         updateRenderTarget({ gl });

         for (let i = 0; i < blurIteration; i++) {
            updateRenderTarget({ gl }, ({ read }) => {
               material.uniforms.src.value = read;
            });
         }

         material.uniforms.src.value = srcCache;

         return renderTarget.read.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, blurIteration]
   );

   return {
      render,
      setValues,
      texture: renderTarget.read.texture,
      material,
      scene,
      camera,
      renderTarget,
   };
};
