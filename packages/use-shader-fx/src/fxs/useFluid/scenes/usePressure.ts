import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { PressureMaterial } from "../materials/PressureMaterial";
import { useScene } from "../../../utils/useScene";

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
   const { scene, material } = useScene({
      size,
      dpr,
      material: PressureMaterial,
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
