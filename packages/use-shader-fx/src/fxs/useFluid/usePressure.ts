import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "../types";
import { useAddObject } from "../../utils/useAddObject";
import { SingleFBOUpdateFunction } from "../../utils/useSingleFBO";
import { useResolution } from "../../utils/useResolution";
import { PressureMaterial } from "./materials/PressureMaterial";

type PressureValues = {
   velocity: THREE.Texture;
   pressure: THREE.Texture;
};

export const usePressure = ({
   size,
   dpr,
   updateRenderTarget,
   ...values
}: {
   size: Size;
   dpr: number | false;
   updateRenderTarget: SingleFBOUpdateFunction;
} & PressureValues) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const material = useMemo(() => {
      const _mat = new PressureMaterial(values);
      return _mat;
   }, [values]);

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);

   useAddObject(scene, geometry, material, THREE.Mesh);

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera });
      },
      [updateRenderTarget, scene, camera]
   );

   return render;
};
