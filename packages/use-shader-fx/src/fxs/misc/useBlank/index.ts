import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { BlankMaterial, CustomUniforms, useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useDoubleFBO, DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import type { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps } from "../../..";

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
   texture: new THREE.Texture(),
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
   onBeforeCompile,
   uniforms,
}: HooksProps & CustomUniforms): HooksReturn<BlankParams, BlankObject> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      onBeforeCompile,
      uniforms,
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

   const updateFx = useCallback(
      (props: RootState, updateParams?: BlankParams) => {
         const { gl, clock, pointer } = props;

         updateParams && setParams(updateParams);

         updateValue("uTexture", params.texture!);
         updateValue("uPointer", pointer);
         updateValue("uTime", params.beat || clock.getElapsedTime());

         return updateRenderTarget(gl, ({ read }) => {
            updateValue("uBackbuffer", read);
         });
      },
      [updateRenderTarget, updateValue, setParams, params]
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
