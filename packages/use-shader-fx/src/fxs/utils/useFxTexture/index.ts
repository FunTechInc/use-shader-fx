import * as THREE from "three";
import { useCallback, useMemo } from "react";
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

export type FxTextureParams = {
   /** 1st texture , default : `THREE.Texture()` */
   texture0?: THREE.Texture;
   /** 2nd texture , default : `THREE.Texture()` */
   texture1?: THREE.Texture;
   /** add transparent padding, 0.0 ~ 1.0 , default : `0.0` */
   padding?: number;
   /** The color map. The uv value is affected according to this rbg , default : `THREE.Texture()` */
   map?: THREE.Texture;
   /** intensity of map , r,g value are affecting , default : `0.0` */
   mapIntensity?: number;
   /** Intensity of effect on edges , default : `0.0` */
   edgeIntensity?: number;
   /** epicenter of fx, -1 ~ 1 , default : `vec2(0.0,0.0)` */
   epicenter?: THREE.Vector2;
   /** Switch value to switch between texture0 and texture1 , 0 ~ 1 , default : `0` */
   progress?: number;
   /** direction of transition , default: `THREE.Vector2(0, 0)` */
   dir?: THREE.Vector2;
};

export type FxTextureObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const FXTEXTURE_PARAMS: FxTextureParams = Object.freeze({
   texture0: DEFAULT_TEXTURE,
   texture1: DEFAULT_TEXTURE,
   padding: 0.0,
   map: DEFAULT_TEXTURE,
   mapIntensity: 0.0,
   edgeIntensity: 0.0,
   epicenter: new THREE.Vector2(0, 0),
   progress: 0.0,
   dir: new THREE.Vector2(0, 0),
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFxTexture = ({
   size,
   dpr,
   samples,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<FxTextureParams, FxTextureObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      onBeforeInit,
   });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr: _dpr.fbo,
      size,
      samples,
      isSizeUpdate,
      ...renderTargetOptions,
   });

   const [params, setParams] = useParams<FxTextureParams>(FXTEXTURE_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: FxTextureParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: FxTextureParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("uTexture0", params.texture0!);
         updateValue("uTexture1", params.texture1!);
         updateValue("progress", params.progress!);
         // calculate resolution by linear interpolation.
         const tex0Res = [
            params.texture0!?.image?.width || 0,
            params.texture0!?.image?.height || 0,
         ];
         const tex1Res = [
            params.texture1!?.image?.width || 0,
            params.texture1!?.image?.height || 0,
         ];
         const interpolatedResolution = tex0Res.map((value, index) => {
            return value + (tex1Res[index] - value) * params.progress!;
         });
         updateValue("uTextureResolution", interpolatedResolution);
         updateValue("padding", params.padding!);
         updateValue("uMap", params.map!);
         updateValue("mapIntensity", params.mapIntensity!);
         updateValue("edgeIntensity", params.edgeIntensity!);
         updateValue("epicenter", params.epicenter!);
         updateValue("dirX", params.dir!.x);
         updateValue("dirY", params.dir!.y);

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
