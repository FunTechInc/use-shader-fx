import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { FluidMaterials } from "../../../materials";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";

export const useAdvection = (
   {
      size,
      dpr,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
   } & FluidMaterials.AdvectionValues,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.AdvectionMaterial,
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
