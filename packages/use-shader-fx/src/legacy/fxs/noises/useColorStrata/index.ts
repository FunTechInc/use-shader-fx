import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn, RootState } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type ColorStrataParams = {
   /** default : `null` */
   texture?: THREE.Texture | false;
   /** Valid when texture is false. default : `1` */
   scale?: number;
   /** default : `1.0` */
   laminateLayer?: number;
   /** default : `(0.1, 0.1)` */
   laminateInterval?: THREE.Vector2;
   /** default : `(1.0, 1.0)` */
   laminateDetail?: THREE.Vector2;
   /** default : `(0.0, 0.0)` */
   distortion?: THREE.Vector2;
   /** default : `(1.0, 1.0, 1.0)` */
   colorFactor?: THREE.Vector3;
   /** default : `(0.0, 0.0)` */
   timeStrength?: THREE.Vector2;
   /** default : `false` */
   noise?: THREE.Texture | false;
   /** default : `(0.0,0.0)` */
   noiseStrength?: THREE.Vector2;
   /** you can get into the rhythm ♪ , default : `false` */
   beat?: number | false;
};

export type ColorStrataObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const COLORSTRATA_PARAMS: ColorStrataParams = Object.freeze({
   texture: false,
   scale: 1.0,
   laminateLayer: 1.0,
   laminateInterval: new THREE.Vector2(0.1, 0.1),
   laminateDetail: new THREE.Vector2(1, 1),
   distortion: new THREE.Vector2(0, 0),
   colorFactor: new THREE.Vector3(1, 1, 1),
   timeStrength: new THREE.Vector2(0, 0),
   noise: false,
   noiseStrength: new THREE.Vector2(0, 0),
   beat: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useColorStrata = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<
   ColorStrataParams,
   ColorStrataObject,
   CustomParams
> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, onBeforeInit });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      isSizeUpdate,
      ...renderTargetOptions,
   });

   const [params, setParams] = useParams<ColorStrataParams>(COLORSTRATA_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: ColorStrataParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: ColorStrataParams,
         customParams?: CustomParams
      ) => {
         const { gl, clock } = rootState;

         updateParams(newParams, customParams);

         if (params.texture) {
            updateValue("uTexture", params.texture);
            updateValue("isTexture", true);
         } else {
            updateValue("isTexture", false);
            updateValue("scale", params.scale!);
         }

         if (params.noise) {
            updateValue("noise", params.noise);
            updateValue("isNoise", true);
            updateValue("noiseStrength", params.noiseStrength!);
         } else {
            updateValue("isNoise", false);
         }

         updateValue("uTime", params.beat || clock.getElapsedTime());

         updateValue("laminateLayer", params.laminateLayer!);
         updateValue("laminateInterval", params.laminateInterval!);
         updateValue("laminateDetail", params.laminateDetail!);
         updateValue("distortion", params.distortion!);
         updateValue("colorFactor", params.colorFactor!);
         updateValue("timeStrength", params.timeStrength!);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, params, updateParams]
   );

   return [
      updateFx,
      updateParams,
      {
         scene: scene,
         mesh: mesh,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
