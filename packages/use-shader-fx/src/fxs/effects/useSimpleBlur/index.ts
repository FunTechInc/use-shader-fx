import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useDoubleFBO, DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";

import type { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps } from "../../..";

export type SimpleBlurParams = {
   /** Make this texture blur , default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** blurSize, default : `3` */
   blurSize?: number;
   /** blurPower, affects performance default : `5` */
   blurPower?: number;
};

export type SimpleBlurObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
   output: THREE.Texture;
};

export const SIMPLEBLUR_PARAMS: SimpleBlurParams = Object.freeze({
   texture: new THREE.Texture(),
   blurSize: 3,
   blurPower: 5,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useSimpleBlur = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   onBeforeCompile,
}: HooksProps): HooksReturn<SimpleBlurParams, SimpleBlurObject> => {
   const _dpr = getDpr(dpr);
   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, onBeforeCompile });
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

   const [renderTarget, updateTempTexture] = useDoubleFBO(fboProps);
   const [params, setParams] = useParams<SimpleBlurParams>(SIMPLEBLUR_PARAMS);

   const updateValue = setUniform(material);
   const updateFx = useCallback(
      (props: RootState, updateParams?: SimpleBlurParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         updateValue("uTexture", params.texture!);
         updateValue("uResolution", [
            params.texture!?.source?.data?.width || 0,
            params.texture!?.source?.data?.height || 0,
         ]);
         updateValue("uBlurSize", params.blurSize!);

         let _tempTexture: THREE.Texture = updateTempTexture(gl);

         const iterations = params.blurPower!;
         for (let i = 0; i < iterations; i++) {
            updateValue("uTexture", _tempTexture);
            _tempTexture = updateTempTexture(gl);
         }

         return _tempTexture;
      },
      [updateTempTexture, updateValue, setParams, params]
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
