import * as THREE from "three";
import { useCallback, useMemo, useState } from "react";
import { UseFboProps, useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { useDoubleFBO } from "../../utils/useDoubleFBO";
import { useAdvection } from "./scenes/useAdvection";
import { useSplat } from "./scenes/useSplat";
import { useDivergence } from "./scenes/useDivergence";
import { usePoisson } from "./scenes/usePoisson";
import { usePressure } from "./scenes/usePressure";

export const DeltaTime = 0.015;

export type FluidValues = {
   /*===============================================
	TODO * 
	- 出力でcolormapとvelocitymapを選択できるみたいな仕組みにする
		- colormapはfxBasicFxmaterialで、基礎FXも
	- params
	 - velocity dissipation
	 - color dissipation (color map)
	===============================================*/
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useFluid = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   ...values
}: HooksProps & FluidValues): HooksReturn<FluidValues, NoiseMaterial> => {
   const _dpr = getDpr(dpr);

   // fbos
   const fboProps = {
      dpr: _dpr.fbo,
      size,
      fboAutoSetSize,
      type: THREE.HalfFloatType,
      ...renderTargetOptions,
   };
   const [velocity_0, updateVelocity_0] = useSingleFBO(fboProps);
   const [velocity_1, updateVelocity_1] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);

   // scenes
   const SceneSize = { size, dpr: _dpr.shader };
   const advection = useAdvection(
      {
         ...SceneSize,
         velocity: velocity_0.texture,
      },
      updateVelocity_1
   );
   const splat = useSplat(SceneSize, updateVelocity_1);
   const divergence = useDivergence(
      {
         ...SceneSize,
         velocity: velocity_1.texture,
      },
      updateDivergenceFBO
   );
   const poisson = usePoisson(
      {
         ...SceneSize,
         divergence: divergenceFBO.texture,
      },
      updatePressureFBO
   );
   const pressure = usePressure(
      {
         ...SceneSize,
         velocity: velocity_1.texture,
         pressure: pressureFBO.read.texture,
      },
      updateVelocity_0
   );

   const setValues = useCallback((newValues: FluidValues) => {
      // splat.material.force = newValues.force;
      // bounce の設定
      divergence.material.uniforms.isBounce.value = false;
      poisson.material.uniforms.isBounce.value = false;
      pressure.material.uniforms.isBounce.value = false;
   }, []);

   const render = useCallback(
      (rootState: RootState, newValues?: FluidValues) => {
         newValues && setValues(newValues);

         [advection, splat, divergence, poisson, pressure].forEach((shader) => {
            shader.render(rootState);
         });

         return velocity_0.texture;
      },
      [
         setValues,
         velocity_0.texture,
         advection,
         splat,
         divergence,
         poisson,
         pressure,
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
