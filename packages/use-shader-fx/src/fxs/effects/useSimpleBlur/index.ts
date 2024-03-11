import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { useDoubleFBO } from "../../../utils/useDoubleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";

import type { HooksProps, HooksReturn } from "../../types";

export type SimpleBlurParams = {
   /** Make this texture blur , Default:new THREE.Texture() */
   texture?: THREE.Texture;
   /** blurSize, default:3 */
   blurSize?: number;
   /** blurPower, affects performance default:5 */
   blurPower?: number;
};

export type SimpleBlurObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
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
   samples = 0,
}: HooksProps): HooksReturn<SimpleBlurParams, SimpleBlurObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh(scene);
   const camera = useCamera(size);

   const fboProps = useMemo(
      () => ({
         scene,
         camera,
         size,
         dpr,
         samples,
      }),
      [scene, camera, size, dpr, samples]
   );
   const [renderTarget, updateRenderTarget] = useSingleFBO(fboProps);
   const [_, updateTempTexture] = useDoubleFBO(fboProps);
   const [params, setParams] = useParams<SimpleBlurParams>(SIMPLEBLUR_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: SimpleBlurParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uResolution", [
            params.texture!?.source?.data?.width || 0,
            params.texture!?.source?.data?.height || 0,
         ]);
         setUniform(material, "uBlurSize", params.blurSize!);

         let _tempTexture: THREE.Texture = updateTempTexture(gl);

         const iterations = params.blurPower!;
         for (let i = 0; i < iterations; i++) {
            setUniform(material, "uTexture", _tempTexture);
            _tempTexture = updateTempTexture(gl);
         }

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateTempTexture, material, setParams, params]
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
