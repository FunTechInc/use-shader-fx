import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { FluidMaterials } from "../../../materials";
import { useSetup, SingleFBOUpdateFunction } from "../../../utils";

export const useDivergence = (
   {
      size,
      dpr,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
   } & FluidMaterials.DivergenceValues,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.DivergenceMaterial,
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
