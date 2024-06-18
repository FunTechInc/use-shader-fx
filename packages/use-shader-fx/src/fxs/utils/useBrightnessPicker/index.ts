import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type BrightnessPickerParams = {
   /** pick brightness from this texture , default : `THREE.Texture` */
   texture?: THREE.Texture;
   /** default : `(0.5,0.5,0.5)` */
   brightness?: THREE.Vector3;
   /** default : `0.0` */
   min?: number;
   /** default : `1.0` */
   max?: number;
};

export type BrightnessPickerObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const BRIGHTNESSPICKER_PARAMS: BrightnessPickerParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   brightness: new THREE.Vector3(0.5, 0.5, 0.5),
   min: 0.0,
   max: 1.0,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBrightnessPicker = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<
   BrightnessPickerParams,
   BrightnessPickerObject,
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

   const [params, setParams] = useParams<BrightnessPickerParams>(
      BRIGHTNESSPICKER_PARAMS
   );

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: BrightnessPickerParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: BrightnessPickerParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("u_texture", params.texture!);
         updateValue("u_brightness", params.brightness!);
         updateValue("u_min", params.min!);
         updateValue("u_max", params.max!);

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
