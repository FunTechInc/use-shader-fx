import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "../types";
import { useAddObject } from "../../utils/useAddObject";
import { SingleFBOUpdateFunction } from "../../utils/useSingleFBO";
import { useResolution } from "../../utils/useResolution";
import { SplatMaterial } from "./materials/SplatMaterial";
import { usePointer } from "../../misc/usePointer";

export const useSplat = ({
   size,
   dpr,
   updateRenderTarget,
}: {
   size: Size;
   dpr: number | false;
   updateRenderTarget: SingleFBOUpdateFunction;
}) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

   const material = useMemo(() => {
      const _mat = new SplatMaterial();
      return _mat;
   }, []);

   const resolution = useResolution(size, dpr);
   material.uniforms.texelsize.value.set(1 / resolution.x, 1 / resolution.y);

   useAddObject(scene, geometry, material, THREE.Mesh);

   const updatePointer = usePointer();

   const render = useCallback(
      (rootState: RootState) => {
         const { gl, pointer } = rootState;

         const { currentPointer } = updatePointer(pointer);
         material.uniforms.center.value.copy(currentPointer);

         updateRenderTarget({ gl, scene, camera, clear: false });
      },
      [updateRenderTarget, material, updatePointer, scene, camera]
   );

   return render;
};
