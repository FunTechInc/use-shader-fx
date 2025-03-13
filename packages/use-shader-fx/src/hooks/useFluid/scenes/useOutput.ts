import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { FluidMaterials } from "../../../materials";

export const useOutput = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
   } & FluidMaterials.OutputValues,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.OutputMaterial,
      uniformValues: values,
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
