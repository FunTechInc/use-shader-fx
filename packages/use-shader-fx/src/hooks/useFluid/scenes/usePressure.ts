import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { FluidMaterials } from "../../../materials";

export const usePressure = (
   {
      size,
      dpr,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
   } & FluidMaterials.PressureValues,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.PressureMaterial,
      uniformValues,
   });

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera });
      },
      [updateRenderTarget, scene, camera]
   );

   return { render, material };
};
