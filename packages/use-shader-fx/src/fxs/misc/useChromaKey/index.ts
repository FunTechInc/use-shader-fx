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

export type ChromaKeyParams = {
   /** Process this texture with chroma key , default : `THREE.Texture` */
   texture?: THREE.Texture;
   /** key color for chromakey processing , default: `THREE.Color(0x00ff00)` */
   keyColor?: THREE.Color;
   /** If the similarity with the key color exceeds this value, it becomes transparent. , default : `0.2` */
   similarity?: number;
   /** smoothness , default : `0.1` */
   smoothness?: number;
   /** spill , default : `0.2` */
   spill?: number;
   /** tone correction , default : `THREE.Vector4(1.0, 1.0, 1.0, 1.0)` */
   color?: THREE.Vector4;
   /** contrast , default : `1.0` */
   contrast?: number;
   /** brightness , default : `0.0` */
   brightness?: number;
   /** gamma correction , default : `1.0` */
   gamma?: number;
};

export type ChromaKeyObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const CHROMAKEY_PARAMS: ChromaKeyParams = Object.freeze({
   texture: new THREE.Texture(),
   keyColor: new THREE.Color(0x00ff00),
   similarity: 0.2,
   smoothness: 0.1,
   spill: 0.2,
   color: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
   contrast: 1.0,
   brightness: 0.0,
   gamma: 1.0,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useChromaKey = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<ChromaKeyParams, ChromaKeyObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      uniforms,
      onBeforeCompile,
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

   const [params, setParams] = useParams<ChromaKeyParams>(CHROMAKEY_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: ChromaKeyParams,
         customParams?: CustomParams
      ) => {
         const { gl } = props;
         newParams && setParams(newParams);

         updateValue("u_texture", params.texture!);
         updateValue("u_keyColor", params.keyColor!);
         updateValue("u_similarity", params.similarity!);
         updateValue("u_smoothness", params.smoothness!);
         updateValue("u_spill", params.spill!);
         updateValue("u_color", params.color!);
         updateValue("u_contrast", params.contrast!);
         updateValue("u_brightness", params.brightness!);
         updateValue("u_gamma", params.gamma!);

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
