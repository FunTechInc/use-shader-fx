import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { Dpr, RootState, Size } from "../../types";
import { AdvectionMaterial } from "../materials/AdvectionMaterial";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { useResolution } from "../../../utils/useResolution";
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
      material: AdvectionMaterial,
      uniformValues: values,
   });

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);
   const maxAspect = Math.max(size.width, size.height);
   material.uniforms.ratio.value.set(
      maxAspect / resolution.x,
      maxAspect / resolution.y
   );

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
