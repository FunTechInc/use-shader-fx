import * as THREE from "three";
import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../types";
import { useDpr } from "../../utils/useDpr";
import { RootState } from "../types";
import { BlurMaterial } from "./BlurMaterial";
import { useFxScene } from "../../utils/useFxScene";
import { BasicFxValues } from "../../materials/BasicFxLib";
import { useDoubleFBO } from "../../utils/useDoubleFBO";

export type BlurValues = {
   src?: THREE.Texture | null;
   blurSize?: number;
} & BasicFxValues;

type BlurConfig = {
   blurIteration?: number;
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBlur = ({
   size,
   dpr,
   sizeUpdate,
   renderTargetOptions,
   materialParameters,
   blurIteration = 5,
   ...uniformValues
}: HooksProps & BlurValues & BlurConfig): HooksReturn<
   BlurValues,
   BlurMaterial
> => {
   const _dpr = useDpr(dpr);

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
      sizeUpdate,
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
   };
};
