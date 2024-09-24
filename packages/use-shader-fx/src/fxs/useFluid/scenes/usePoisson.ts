import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../../utils/useCamera";
import { Dpr, RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils/useSingleFBO";
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
      size,
      dpr,
      material: PoissonMaterial,
      uniformValues: values,
   });

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
