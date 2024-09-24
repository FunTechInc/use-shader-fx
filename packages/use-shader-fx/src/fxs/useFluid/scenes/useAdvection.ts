import * as THREE from "three";
import { useCallback } from "react";
import { useCamera } from "../../../utils/useCamera";
import { RootState, Size } from "../../types";
import { AdvectionMaterial } from "../materials/AdvectionMaterial";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { useScene } from "../../../utils/useScene";

export const useAdvection = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      velocity: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material } = useScene({
      size,
      dpr,
      material: AdvectionMaterial,
      uniformValues: values,
   });

   const camera = useCamera(size);

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera });
      },
      [updateRenderTarget, scene, camera]
   );

   return { render, material };
};
