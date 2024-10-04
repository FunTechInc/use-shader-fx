import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { SplatMaterial } from "../materials/SplatMaterial";
import { usePointerTracker } from "../../../misc/usePointerTracker";
import { useFxScene } from "../../../utils/useFxScene";

export const useSplat = (
   {
      size,
      dpr,
   }: {
      size: Size;
      dpr: number | false;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useFxScene({
      size,
      dpr,
      material: SplatMaterial,
      geometrySize: {
         width: 1,
         height: 1,
      },
   });

   const pointerTracker = usePointerTracker();

   const render = useCallback(
      (rootState: RootState) => {
         const { gl, pointer } = rootState;
         const { currentPointer, diffPointer } = pointerTracker(pointer);

         material.uniforms.center.value.copy(currentPointer);
         material.uniforms.force.value.copy(
            diffPointer.multiplyScalar(material.force)
         );

         updateRenderTarget({ gl, scene, camera, clear: false });
      },
      [updateRenderTarget, material, pointerTracker, scene, camera]
   );

   return { render, material };
};
