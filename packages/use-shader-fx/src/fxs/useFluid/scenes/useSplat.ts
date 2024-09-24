import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { SplatMaterial } from "../materials/SplatMaterial";
import { usePointer } from "../../../misc/usePointer";
import { useScene } from "../../../utils/useScene";

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
   const { scene, material } = useScene({
      size,
      dpr,
      material: SplatMaterial,
      geometrySize: {
         width: 1,
         height: 1,
      },
   });

   const camera = useCamera(size);

   const updatePointer = usePointer();

   const render = useCallback(
      (rootState: RootState) => {
         const { gl, pointer } = rootState;
         const { currentPointer, diffPointer } = updatePointer(pointer);

         material.uniforms.center.value.copy(currentPointer);
         material.uniforms.force.value.copy(
            diffPointer.multiplyScalar(material.force)
         );

         updateRenderTarget({ gl, scene, camera, clear: false });
      },
      [updateRenderTarget, material, updatePointer, scene, camera]
   );

   return { render, material };
};
