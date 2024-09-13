import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { OnInit, RootState } from "../types";
import { useAddObject } from "../../utils/useAddObject";
import { NoiseMaterial } from "./NoiseMaterial";

export type NoiseValues = {
   /** noise scale , default : `0.004` */
   scale?: number;
   /** time factor default : `0.3` */
   timeStrength?: number;
   /** noiseOctaves, affects performance default : `2` */
   noiseOctaves?: number;
   /** fbmOctaves, affects performance default : `2` */
   fbmOctaves?: number;
   /** domain warping octaves , affects performance default : `2`  */
   warpOctaves?: number;
   /** direction of domain warping , default : `(2.0,2,0)` */
   warpDirection?: THREE.Vector2;
   /** strength of domain warping , default : `8.0` */
   warpStrength?: number;
   /** you can get into the rhythm ♪ , default : `false` */
   beat?: number | false;
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
   onInit?: OnInit<NoiseMaterial>
): HooksReturn<NoiseValues, NoiseMaterial> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);

   const camera = useCamera(size);

   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const material = useMemo(() => {
      const _mat = new NoiseMaterial(values);
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
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: NoiseValues) => {
         const { gl, clock } = rootState;
         newValues && setValues(newValues);
         material.uniforms.uTime.value =
            newValues?.beat || clock.getElapsedTime();
         return updateRenderTarget(gl);
      },
      [setValues, updateRenderTarget, material]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
   };
};
