import * as THREE from "three";
import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { PressureMaterial } from "../materials/PressureMaterial";
import { useFxScene } from "../../../utils/useFxScene";

export const usePressure = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      velocity: THREE.Texture;
      pressure: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useFxScene({
      size,
      dpr,
      material: PressureMaterial,
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
