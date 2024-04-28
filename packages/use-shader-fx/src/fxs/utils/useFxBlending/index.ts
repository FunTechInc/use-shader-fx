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

export type FxBlendingParams = {
   /** Make this texture Blending , default : `THREE.Texture` */
   texture?: THREE.Texture;
   /** map texture, default : `THREE.Texture` */
   map?: THREE.Texture;
   /** map strength , r,g value are affecting , default : `0.3` */
   mapIntensity?: number;
};

export type FxBlendingObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const FXBLENDING_PARAMS: FxBlendingParams = {
   texture: new THREE.Texture(),
   map: new THREE.Texture(),
   mapIntensity: 0.3,
};

/**
 * Blend map to texture. You can change the intensity of fx applied by the rg value of map. Unlike "useBlending", the map color is not reflected.
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFxBlending = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<
   FxBlendingParams,
   FxBlendingObject,
   CustomParams
> => {
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

   const [params, setParams] = useParams<FxBlendingParams>(FXBLENDING_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: FxBlendingParams,
         customParams?: CustomParams
      ) => {
         const { gl } = props;
         newParams && setParams(newParams);
         updateValue("u_texture", params.texture!);
         updateValue("u_map", params.map!);
         updateValue("u_mapIntensity", params.mapIntensity!);

         updateCustomValue(customParams);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, setParams, params, updateCustomValue]
   );

   return [
      updateFx,
      setParams,
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
