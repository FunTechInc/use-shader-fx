import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RawBlankMaterial, useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { CustomParams, setCustomUniform } from "../../../utils/setUniforms";
import type { HooksProps, HooksReturn, RootState } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps, useSingleFBO } from "../../../utils/useSingleFBO";

export type RawBlankParams = {};

export type RawBlankObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      RawBlankMaterial
   >;
   material: RawBlankMaterial;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const RAWBLANK_PARAMS: RawBlankParams = Object.freeze({});

/**
 * By default, it is a blank canvas with nothing drawn on it. You can customise the shaders using `onBeforeCompile`.
 * Fragment shaders have `uResolution` as default uniforms.
 *
 * ※ `usf_FragColor` overrides `gl_FragColor`
 *
 * ※ `usf_Position` overrides `gl_Position`
 * 
 * `RawBlankParams` is an empty object. so you can't pass any parameters to second argument. Nothing will happen if you pass them.
 * ```tsx
 * useFrame((state) => {
      update(
         state,
         {},
         {
            uTime: state.clock.getElapsedTime(),
         }
      );
   });
 * ```
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRawBlank = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<RawBlankParams, RawBlankObject, CustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);

   const { material, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      onBeforeInit,
   });

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

   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: RawBlankParams, customParams?: CustomParams) => {
         updateCustomValue(customParams);
      },
      [updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: RawBlankParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;
         updateParams(newParams, customParams);
         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateParams]
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
