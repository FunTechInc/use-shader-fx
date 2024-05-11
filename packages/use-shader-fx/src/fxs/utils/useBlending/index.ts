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

export type BlendingParams = {
   /** Make this texture Blending , default : `THREE.Texture` */
   texture?: THREE.Texture;
   /** map texture, default : `THREE.Texture` */
   map?: THREE.Texture;
   /** map strength , r,g value are affecting , default : `0.3` */
   mapIntensity?: number;
   /** Alpha blending is performed using the alpha of the set texture. , default : `false` */
   alphaMap?: THREE.Texture | false;
   /** default : `(0.5,0.5,0.5)` */
   brightness?: THREE.Vector3;
   /** default : `0.0` */
   min?: number;
   /** default : `1.0` */
   max?: number;
   /** If set, this value will apply color dodge , default : `false` */
   dodgeColor?: THREE.Color | false;
};

export type BlendingObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const BLENDING_PARAMS: BlendingParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   map: DEFAULT_TEXTURE,
   alphaMap: false,
   mapIntensity: 0.3,
   brightness: new THREE.Vector3(0.5, 0.5, 0.5),
   min: 0.0,
   max: 1.0,
   dodgeColor: false,
});

/**
 * Blend map to texture. You can set the threshold for blending with brightness. You can set the dodge color by setting color. 
If you don't want to reflect the map's color, you can use useFxBlending instead.
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBlending = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<BlendingParams, BlendingObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, uniforms, onBeforeCompile });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<BlendingParams>(BLENDING_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: BlendingParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: BlendingParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("u_texture", params.texture!);
         updateValue("uMap", params.map!);
         updateValue("uMapIntensity", params.mapIntensity!);
         if (params.alphaMap) {
            updateValue("u_alphaMap", params.alphaMap!);
            updateValue("u_isAlphaMap", true);
         } else {
            updateValue("u_isAlphaMap", false);
         }
         updateValue("u_brightness", params.brightness!);
         updateValue("u_min", params.min!);
         updateValue("u_max", params.max!);
         if (params.dodgeColor) {
            updateValue("u_dodgeColor", params.dodgeColor);
            updateValue("u_isDodgeColor", true);
         } else {
            updateValue("u_isDodgeColor", false);
         }

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
