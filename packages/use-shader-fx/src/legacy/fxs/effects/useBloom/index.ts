import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useDoubleFBO, DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import type { HooksProps, HooksReturn, RootState } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps, useSingleFBO } from "../../..";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type BloomParams = {
   /** Make this texture bloom, default : `THREE.Texture()` */
   texture?: THREE.Texture;
};

export type BloomObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const BLOOM_PARAMS: BloomParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBloom = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<BloomParams, BloomObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, onBeforeInit });
   const camera = useCamera(size);

   const fboProps = useMemo(
      () => ({
         scene,
         camera,
         size,
         dpr: _dpr.fbo,
         isSizeUpdate,
         ...renderTargetOptions,
      }),
      [scene, camera, size, _dpr.fbo, isSizeUpdate, renderTargetOptions]
   ) as UseFboProps;

   const [renderTarget, updateRenderTarget] = useSingleFBO(fboProps);

   const [params, setParams] = useParams<BloomParams>(BLOOM_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: BloomParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: BloomParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("uTexture", params.texture!);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, updateParams, params]
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
