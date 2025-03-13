import * as THREE from "three";
import { useCallback } from "react";
import { useSingleFBO, useDoubleFBO, getDpr } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { useAdvection } from "./scenes/useAdvection";
import { useSplat } from "./scenes/useSplat";
import { useDivergence } from "./scenes/useDivergence";
import { usePoisson } from "./scenes/usePoisson";
import { usePressure } from "./scenes/usePressure";
import { useOutput } from "./scenes/useOutput";
import { BasicFxValues, FluidMaterials } from "../../materials";

export type FluidValues = {
   pressureIterations?: number;
   force?: number;
} & BasicFxValues &
   FluidMaterials.AdvectionValuesClient &
   FluidMaterials.DivergenceValuesClient &
   FluidMaterials.PoissonValuesClient &
   FluidMaterials.PressureValuesClient &
   FluidMaterials.SplatValuesClient;

export type FluidProps = HooksProps & FluidValues;

const removeUndefined = <T extends object>(obj: T): Partial<T> =>
   Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
   ) as Partial<T>;

const extractValues = (values: FluidValues) => {
   const {
      dissipation,
      deltaTime,
      bounce,
      pressureIterations,
      scale,
      force,
      ...basicFxValues
   } = values;

   return [
      {
         advection: removeUndefined({ dissipation, deltaTime }),
         divergence: removeUndefined({ bounce, deltaTime }),
         poisson: removeUndefined({ bounce }),
         pressure: removeUndefined({ bounce, deltaTime }),
         splat: removeUndefined({ scale }),
         pressureIterations,
         force,
      },
      basicFxValues,
   ] as const;
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFluid = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: FluidProps): HooksReturn<
   FluidValues,
   any,
   {
      /** velocity map */
      velocity: THREE.Texture;
   }
> => {
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
   const [outputFBO, updateOutputFBO] = useSingleFBO(fboProps);

   // scenes
   const [extractedValues, basicFxValues] = extractValues(uniformValues);

   const SceneSize = { size, dpr: _dpr.shader };
   const advection = useAdvection(
      {
         ...SceneSize,
         ...extractedValues.advection,
         velocity: velocity_0.texture,
      },
      updateVelocity_1
   );
   const splat = useSplat(
      {
         ...SceneSize,
         ...extractedValues.splat,
         force: extractedValues.force,
      },
      updateVelocity_1
   );
   const divergence = useDivergence(
      {
         ...SceneSize,
         ...extractedValues.divergence,
         velocity: velocity_1.texture,
      },
      updateDivergenceFBO
   );
   const poisson = usePoisson(
      {
         ...SceneSize,
         ...extractedValues.poisson,
         divergence: divergenceFBO.texture,
         pressureIterations: extractedValues.pressureIterations,
      },
      updatePressureFBO
   );
   const pressure = usePressure(
      {
         ...SceneSize,
         ...extractedValues.pressure,
         velocity: velocity_1.texture,
         pressure: pressureFBO.read.texture,
      },
      updateVelocity_0
   );
   const output = useOutput(
      {
         ...SceneSize,
         ...basicFxValues,
         src: velocity_0.texture,
      },
      updateOutputFBO
   );

   const setValues = useCallback(
      (newValues: FluidValues, needsUpdate: boolean = true) => {
         const [_extractedValues, _basicFxValues] = extractValues(newValues);

         output.material.setUniformValues(_basicFxValues, needsUpdate);
         advection.material.setUniformValues(_extractedValues.advection);
         divergence.material.setUniformValues(_extractedValues.divergence);
         poisson.material.setUniformValues(_extractedValues.poisson);
         pressure.material.setUniformValues(_extractedValues.pressure);
         splat.material.setUniformValues(_extractedValues.splat);
         if (_extractedValues.pressureIterations) {
            poisson.material.iterations = _extractedValues.pressureIterations;
         }
         if (_extractedValues.force) {
            splat.material.forceBias = _extractedValues.force;
         }
      },
      [output, advection, divergence, poisson, pressure, splat]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: FluidValues) => {
         newValues && setValues(newValues, false);

         [advection, splat, divergence, poisson, pressure, output].forEach(
            (shader) => shader?.render(rootState)
         );

         return outputFBO.texture;
      },
      [
         setValues,
         outputFBO.texture,
         advection,
         splat,
         divergence,
         poisson,
         pressure,
         output,
      ]
   );

   return {
      render,
      setValues,
      texture: outputFBO.texture,
      velocity: velocity_0.texture,
   };
};
