import * as THREE from "three";
import { useCallback } from "react";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { NoiseMaterial } from "./NoiseMaterial";
import { useFxScene } from "../../utils/useFxScene";
import { BasicFxValues } from "../../materials/core/BasicFxLib";

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
   /** useBeatを渡せば、リズムを変えられる。 */
   tick?: number;
} & BasicFxValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useNoise = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: HooksProps & NoiseValues): HooksReturn<NoiseValues, NoiseMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: NoiseMaterial,
      uniformValues,
      materialParameters,
   });

   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
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
         material.uniforms.tick.value =
            newValues?.tick || clock.getElapsedTime();

         material.updateBasicFx();

         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget, material]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
      camera,
      renderTarget,
   };
};
