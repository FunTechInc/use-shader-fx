import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { FluidMaterials } from "../../../materials";

export const usePoisson = (
   {
      size,
      dpr,
      pressureIterations,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
      pressureIterations?: number;
   } & Omit<FluidMaterials.PoissonValues, "pressure">,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.PoissonMaterial,
      uniformValues,
      customParameters: {
         iterations: pressureIterations,
      },
   });

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         for (let i = 0; i < material.iterations; i++) {
            updateRenderTarget({ gl, scene, camera }, ({ read }) => {
               material.uniforms.pressure.value = read;
            });
         }
      },
      [updateRenderTarget, material, scene, camera]
   );

   return { render, material };
};
