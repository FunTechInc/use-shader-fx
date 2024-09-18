import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { Dpr, RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
import { useResolution } from "../../../utils/useResolution";
import { PoissonMaterial } from "../materials/PoissonMaterial";
import { useScene } from "../../../utils/useScene";

export const usePoisson = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      divergence: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material } = useScene({
      material: PoissonMaterial,
      uniformValues: values,
   });

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);

   const camera = useCamera(size);

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         for (let i = 0; i < material.iteration; i++) {
            updateRenderTarget({ gl, scene, camera }, ({ read }) => {
               material.uniforms.pressure.value = read;
            });
         }
      },
      [updateRenderTarget, material, scene, camera]
   );

   return { render, material };
};
