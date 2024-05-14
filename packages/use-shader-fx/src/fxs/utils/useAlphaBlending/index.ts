import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { getDpr } from "../../../utils/getDpr";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type AlphaBlendingParams = {
   /** default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** alpha map , default : `THREE.Texture()` */
   map?: THREE.Texture;
};

export type AlphaBlendingObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const ALPHABLENDING_PARAMS: AlphaBlendingParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   map: DEFAULT_TEXTURE,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useAlphaBlending = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<
   AlphaBlendingParams,
   AlphaBlendingObject,
   CustomParams
> => {
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
      samples,
      isSizeUpdate,
   });

   const [params, setParams] =
      useParams<AlphaBlendingParams>(ALPHABLENDING_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: AlphaBlendingParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: AlphaBlendingParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("uTexture", params.texture!);
         updateValue("uMap", params.map!);

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
