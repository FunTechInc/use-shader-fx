import { useCallback } from "react";
import { useSingleFBO, getDpr, useSetup } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import {
   BufferMaterial,
   BufferMaterialProps,
   BufferValues,
} from "../../materials";

export type BufferProps = HooksProps & BufferValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBuffer = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: BufferProps): HooksReturn<
   BufferValues,
   BufferMaterial & BufferMaterialProps
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: BufferMaterial,
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
      (newValues: BufferValues, needsUpdate: boolean = true) => {
         material.setUniformValues(newValues, needsUpdate);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: BufferValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues, false);
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
