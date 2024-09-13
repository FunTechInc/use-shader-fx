import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { UseFboProps, useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { OnInit, RootState } from "../types";
import { useAddObject } from "../../utils/useAddObject";
import { useDoubleFBO } from "../../utils/useDoubleFBO";
import { useAdvection } from "./useAdvection";
import { useSplat } from "./useSplat";
import { useDivergence } from "./useDivergence";
import { usePoisson } from "./usePoisson";
import { usePressure } from "./usePressure";

export type FluidValues = {};

/*===============================================
- mause周りの修正
- 境界の作成
- リファクタリング
	- vertexShader、普通でいいのでは？

useAddObject を　useObject3Dに
sceneにいれたり、useObject3Dをする部分を、useSceneにまとめる

===============================================*/

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useFluid = (
   {
      size,
      dpr,
      sizeUpdate,
      renderTargetOptions,
      ...values
   }: HooksProps & FluidValues,
   onInit?: OnInit<NoiseMaterial>
): HooksReturn<FluidValues, NoiseMaterial> => {
   const _dpr = getDpr(dpr);

   const fboProps = useMemo<UseFboProps>(
      () => ({
         dpr: _dpr.fbo,
         size,
         sizeUpdate,
         type: THREE.FloatType,
         ...renderTargetOptions,
      }),
      [size, _dpr.fbo, renderTargetOptions, sizeUpdate]
   );
   const [velocity_0, updateVelocity_0] = useSingleFBO(fboProps);
   const [velocity_1, updateVelocity_1] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);

   const updateAdvection = useAdvection({
      size,
      dpr: _dpr.shader,
      velocity: velocity_0.texture,
      updateRenderTarget: updateVelocity_1,
   });
   const updateSplat = useSplat({
      size,
      dpr: _dpr.shader,
      updateRenderTarget: updateVelocity_1,
   });
   const updateDivergence = useDivergence({
      size,
      dpr: _dpr.shader,
      velocity: velocity_1.texture,
      updateRenderTarget: updateDivergenceFBO,
   });
   const updatePoisson = usePoisson({
      size,
      dpr: _dpr.shader,
      divergence: divergenceFBO.texture,
      updateRenderTarget: updatePressureFBO,
   });
   const updatePressure = usePressure({
      size,
      dpr: _dpr.shader,
      velocity: velocity_1.texture,
      pressure: pressureFBO.read.texture,
      updateRenderTarget: updateVelocity_0,
   });

   const setValues = useCallback((newValues: FluidValues) => {
      // material.setUniformValues(newValues);
   }, []);

   const render = useCallback(
      (rootState: RootState, newValues?: FluidValues) => {
         updateAdvection(rootState);
         updateSplat(rootState);
         updateDivergence(rootState);
         for (let i = 0; i < 32; i++) {
            updatePoisson(rootState);
         }
         updatePressure(rootState);
         return velocity_0.texture;
      },
      [
         updateAdvection,
         updateDivergence,
         updatePoisson,
         updatePressure,
         updateSplat,
         velocity_0.texture,
      ]
   );

   return {
      render,
      setValues,
      texture: velocity_0.texture,
      // material,
      // scene,
   };
};
