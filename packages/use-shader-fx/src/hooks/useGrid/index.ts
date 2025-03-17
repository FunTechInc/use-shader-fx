import { useCallback } from "react";
import { useSingleFBO, getDpr, useSetup } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { GridMaterial, GridValues, GridMaterialProps } from "../../materials";

export type GridProps = HooksProps & GridValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useGrid = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: GridProps): HooksReturn<GridValues, GridMaterial & GridMaterialProps> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: GridMaterial,
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
      (newValues: GridValues, needsUpdate: boolean = true) => {
         material.setUniformValues(newValues, needsUpdate);
         material.setNearestFilter();
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: GridValues) => {
         const { gl, clock } = rootState;
         newValues && setValues(newValues, false);
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
