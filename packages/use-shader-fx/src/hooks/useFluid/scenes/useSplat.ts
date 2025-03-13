import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { FluidMaterials } from "../../../materials";
import { usePointerTracker } from "../../../misc/usePointerTracker";

export const useSplat = (
   {
      size,
      dpr,
      force,
      ...uniformValues
   }: {
      size: Size;
      dpr: number | false;
      force?: number;
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
      customParameters: {
         forceBias: force,
      },
   });

   const pointerTracker = usePointerTracker();

   const render = useCallback(
      (rootState: RootState) => {
         const { gl, pointer } = rootState;
         const { currentPointer, diffPointer } = pointerTracker(pointer);

         material.uniforms.center.value.copy(currentPointer);
         material.uniforms.force.value.copy(
            diffPointer.multiplyScalar(material.forceBias)
         );

         updateRenderTarget({ gl, scene, camera, clear: false });
      },
      [updateRenderTarget, material, pointerTracker, scene, camera]
   );

   return { render, material };
};
