import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { Dpr, RootState, Size } from "../types";
import { AdvectionMaterial } from "./materials/AdvectionMaterial";
import { useAddObject } from "../../utils/useAddObject";
import { SingleFBOUpdateFunction } from "../../utils/useSingleFBO";
import { useResolution } from "../../utils/useResolution";
import { PoissonMaterial } from "./materials/PoissonMaterial";

type PoissonValues = {
   divergence: THREE.Texture;
};

export const usePoisson = ({
   size,
   dpr,
   updateRenderTarget,
   ...values
}: {
   size: Size;
   dpr: number | false;
   updateRenderTarget: SingleFBOUpdateFunction;
} & PoissonValues) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const material = useMemo(() => {
      const _mat = new PoissonMaterial(values);
      return _mat;
   }, [values]);

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);

   useAddObject(scene, geometry, material, THREE.Mesh);

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera }, ({ read }) => {
            material.uniforms.pressure.value = read;
         });
      },
      [updateRenderTarget, material, scene, camera]
   );

   return render;
};
