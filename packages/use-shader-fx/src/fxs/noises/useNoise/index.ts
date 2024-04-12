import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";

export type NoiseParams = {
   /** noise scale , default : `0.004` */
   scale?: number;
   /** time factor default : `0.3` */
   timeStrength?: number;
   /** noiseOctaves, affects performance default : `2` */
   noiseOctaves?: number;
   /** fbmOctaves, affects performance default : `2` */
   fbmOctaves?: number;
   /** domain warping octaves , affects performance default : `2`  */
   warpOctaves?: number;
   /** direction of domain warping , default : `(2.0,2,0)` */
   warpDirection?: THREE.Vector2;
   /** strength of domain warping , default : `8.0` */
   warpStrength?: number;
   /** you can get into the rhythm ♪ , default : `false` */
   beat?: number | false;
};

export type NoiseObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const NOISE_PARAMS: NoiseParams = Object.freeze({
   scale: 0.004,
   timeStrength: 0.3,
   noiseOctaves: 2,
   fbmOctaves: 2,
   warpOctaves: 2,
   warpDirection: new THREE.Vector2(2.0, 2.0),
   warpStrength: 8.0,
   beat: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useNoise = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
}: HooksProps): HooksReturn<NoiseParams, NoiseObject> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<NoiseParams>(NOISE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: NoiseParams) => {
         const { gl, clock } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "scale", params.scale!);
         setUniform(material, "timeStrength", params.timeStrength!);
         setUniform(material, "noiseOctaves", params.noiseOctaves!);
         setUniform(material, "fbmOctaves", params.fbmOctaves!);
         setUniform(material, "warpOctaves", params.warpOctaves!);
         setUniform(material, "warpDirection", params.warpDirection!);
         setUniform(material, "warpStrength", params.warpStrength!);

         setUniform(material, "uTime", params.beat || clock.getElapsedTime());

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, material, setParams, params]
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
