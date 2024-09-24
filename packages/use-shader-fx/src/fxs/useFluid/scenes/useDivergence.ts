import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { Dpr, RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { DivergenceMaterial } from "../materials/DivergenceMaterial";
import { useScene } from "../../../utils/useScene";

export const useDivergence = (
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
      material: DivergenceMaterial,
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
