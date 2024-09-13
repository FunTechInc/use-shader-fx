import * as THREE from "three";
/*===============================================
- boundaryつくってsceneにaddする
===============================================*/
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { Dpr, RootState, Size } from "../types";
import { AdvectionMaterial } from "./materials/AdvectionMaterial";
import { useAddObject } from "../../utils/useAddObject";
import { SingleFBOUpdateFunction } from "../../utils/useSingleFBO";
import { useResolution } from "../../utils/useResolution";

type AdvectionValues = {
   velocity: THREE.Texture;
};

export const useAdvection = ({
   size,
   dpr,
   updateRenderTarget,
   ...values
}: {
   size: Size;
   dpr: number | false;
   updateRenderTarget: SingleFBOUpdateFunction;
} & AdvectionValues) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const material = useMemo(() => {
      const _mat = new AdvectionMaterial(values);
      return _mat;
   }, [values]);

   useAddObject(scene, geometry, material, THREE.Mesh);

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);
   material.uniforms.ratio.value.copy(resolution);

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera });
      },
      [updateRenderTarget, scene, camera]
   );

   return render;
};
