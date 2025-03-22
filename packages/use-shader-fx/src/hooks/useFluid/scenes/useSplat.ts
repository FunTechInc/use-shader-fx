import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { FluidMaterials } from "../../../materials";
import { usePointerTracker } from "../../../misc/usePointerTracker";

export const useSplat = (
   {
      size,
      dpr,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
   } & FluidMaterials.SplatValuesClient,
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.SplatMaterial,
      geometrySize: {
         width: 1,
         height: 1,
      },
      uniformValues,
   });

   const pointerTracker = usePointerTracker();

   const render = useCallback(
      (rootState: RootState) => {
         const { gl, pointer } = rootState;
         const { currentPointer, diffPointer } = pointerTracker(pointer);

         material.uniforms.center.value.copy(currentPointer);
         material.uniforms.force.value.copy(diffPointer);

         updateRenderTarget({ gl, scene, camera, clear: false });
      },
      [updateRenderTarget, material, pointerTracker, scene, camera]
   );

   return { render, material };
};
