import * as THREE from "three/webgpu";
import { useCallback, useMemo } from "react";
import { NoiseNodeMaterial } from "./NoiseNodeMaterial";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn, OnInit, RootState } from "../types";
import { getDpr } from "../../utils/getDpr";
import { useAddObject } from "../../utils/useAddObject";

export type NoiseValues = {
   noiseScale?: number;
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useNoise = (
   {
      size,
      dpr,
      sizeUpdate,
      renderTargetOptions,
      ...values
   }: HooksProps & NoiseValues,
   onInit?: OnInit<NoiseNodeMaterial>
): HooksReturn<NoiseValues, NoiseNodeMaterial> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);

   const camera = useCamera(size);

   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const material = useMemo(() => {
      const _mat = new NoiseNodeMaterial(values);
      onInit && onInit(_mat);
      return _mat;
   }, [onInit, values]);

   useAddObject(scene, geometry, material, THREE.Mesh);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      sizeUpdate,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: NoiseValues) => {
         material.setValues(newValues as THREE.MaterialParameters);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: NoiseValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);
         return updateRenderTarget(gl);
      },
      [setValues, updateRenderTarget]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
   };
};
