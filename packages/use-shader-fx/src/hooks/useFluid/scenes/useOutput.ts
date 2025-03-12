import * as THREE from "three";
import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import {
   BufferMaterial,
   NoiseMaterial,
   FluidMaterials,
} from "../../../materials";

export const useOutput = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      src: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: FluidMaterials.OutputMaterial,
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
