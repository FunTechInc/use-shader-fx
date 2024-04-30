import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { BlankMaterial, useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useDoubleFBO, DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import type { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps } from "../../..";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type BlankParams = {
   /** texture, default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** you can get into the rhythm ♪ , default : `false` */
   beat?: number | false;
};

export type BlankObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      BlankMaterial
   >;
   material: BlankMaterial;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
   output: THREE.Texture;
};

export const BLANK_PARAMS: BlankParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   beat: false,
});

/**
 * By default, it is a blank canvas with nothing drawn on it. You can customise the shaders using `onBeforeCompile`.
 * Fragment shaders have `uTexture`,`uBackbuffer`,`uTime`,`uPointer` and `uResolution` as default uniforms.
 *
 * ※ `usf_FragColor` overrides `gl_FragColor`
 *
 * ※ `usf_Position` overrides `gl_Position`
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBlank = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<BlankParams, BlankObject, CustomParams> => {
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

   const fboProps = useMemo(
      () => ({
         scene,
         camera,
         size,
         dpr: _dpr.fbo,
         samples,
         isSizeUpdate,
      }),
      [scene, camera, size, _dpr.fbo, samples, isSizeUpdate]
   ) as UseFboProps;

   const [renderTarget, updateRenderTarget] = useDoubleFBO(fboProps);

   const [params, setParams] = useParams<BlankParams>(BLANK_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: BlankParams,
         customParams?: CustomParams
      ) => {
         const { gl, clock, pointer } = props;

         newParams && setParams(newParams);
         updateValue("uTexture", params.texture!);
         updateValue("uPointer", pointer);
         updateValue("uTime", params.beat || clock.getElapsedTime());

         updateCustomValue(customParams);

         return updateRenderTarget(gl, ({ read }) => {
            updateValue("uBackbuffer", read);
         });
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
         output: renderTarget.read.texture,
      },
   ];
};
