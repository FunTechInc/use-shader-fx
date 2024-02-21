import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { setUniform } from "../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { useSingleFBO } from "../../utils/useSingleFBO";

export type AlphaBlendingParams = {
   /**  , default: */
   texture?: THREE.Texture;
   /**  , default: */
   map?: THREE.Texture;
};

export type AlphaBlendingObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const ALPHABLENDING_PARAMS: AlphaBlendingParams = {
   texture: new THREE.Texture(),
   map: new THREE.Texture(),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useAlphaBlending = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<AlphaBlendingParams, AlphaBlendingObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
   });

   const [params, setParams] =
      useParams<AlphaBlendingParams>(ALPHABLENDING_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: AlphaBlendingParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uMap", params.map!);

         return updateRenderTarget(gl);
      },
      [material, updateRenderTarget, params, setParams]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
