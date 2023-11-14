import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type TransitionBgParams = {
   /** 1st texture , default:THREE.Texture() */
   texture0?: THREE.Texture;
   /** 2nd texture , default:THREE.Texture() */
   texture1?: THREE.Texture;
   /** background image ratio , default:THREE.Vector2(0, 0) */
   imageResolution?: THREE.Vector2;
   /** Noise texture to be multiplied when transitioning. You can use useNoise, but you can also use noise texture exported as an image. , default:THREE.Texture() */
   noiseMap?: THREE.Texture;
   /** noise strength , default:0.0 */
   noiseStrength?: number;
   /** Switch value to switch between texture0 and texture1 */
   progress?: number;
   /** direction of transition , default: THREE.Vector2(0, 0) */
   dir?: THREE.Vector2;
};

export type TransitionBgObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const TRANSITIONBG_PARAMS: TransitionBgParams = {
   texture0: new THREE.Texture(),
   texture1: new THREE.Texture(),
   imageResolution: new THREE.Vector2(0, 0),
   noiseMap: new THREE.Texture(),
   noiseStrength: 0.0,
   progress: 0.0,
   dir: new THREE.Vector2(0, 0),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useTransitionBg = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<TransitionBgParams, TransitionBgObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr,
      size,
      isSizeUpdate: true,
   });

   const [params, setParams] =
      useParams<TransitionBgParams>(TRANSITIONBG_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: TransitionBgParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture0", params.texture0!);
         setUniform(material, "uTexture1", params.texture1!);
         setUniform(material, "uImageResolution", params.imageResolution!);
         setUniform(material, "uNoiseMap", params.noiseMap!);
         setUniform(material, "noiseStrength", params.noiseStrength!);
         setUniform(material, "progress", params.progress!);
         setUniform(material, "dirX", params.dir!.x);
         setUniform(material, "dirY", params.dir!.y);

         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [updateRenderTarget, material, params, setParams]
   );
   return [
      updateFx,
      setParams,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
      },
   ];
};
