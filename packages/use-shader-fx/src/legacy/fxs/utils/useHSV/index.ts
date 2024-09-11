import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo } from "react";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn, RootState } from "../../types";
import { useParams } from "../../../utils/useParams";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { getDpr } from "../../../utils/getDpr";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type HSVParams = {
   /** default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** default : `1` */
   brightness?: number;
   /** default : `1` */
   saturation?: number;
};

export type HSVObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const HSV_PARAMS: HSVParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   brightness: 1,
   saturation: 1,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useHSV = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<HSVParams, HSVObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({
      scene,
      size,
      onBeforeInit,
   });
   const camera = useCamera(size);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      isSizeUpdate,
      ...renderTargetOptions,
   });

   const [params, setParams] = useParams<HSVParams>(HSV_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: HSVParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: HSVParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("u_texture", params.texture!);
         updateValue("u_brightness", params.brightness!);
         updateValue("u_saturation", params.saturation!);

         return updateRenderTarget(gl);
      },
      [updateValue, updateRenderTarget, params, updateParams]
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
