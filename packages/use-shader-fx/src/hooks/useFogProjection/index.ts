import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type FogProjectionParams = {
   /** Make this texture FogProjection , default:THREE.Texture */
   texture?: THREE.Texture;
   /** 重ねがけるnoise texture, default:THREE.Texture */
   noiseMap?: THREE.Texture;
   /** 乗算するdistortionの強さ , default:0.03 */
   distortionStrength?: number;
   /** noiseを反映する底地 , default:0.0 */
   fogEdge0?: number;
   /** noiseを反映する天井値 , default:0.9  */
   fogEdge1?: number;
   /** fogのカラー , default: THREE.Color(0xffffff) */
   fogColor?: THREE.Color;
};

export type FogProjectionObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const FOGPROJECTION_PARAMS: FogProjectionParams = {
   texture: new THREE.Texture(),
   noiseMap: new THREE.Texture(),
   distortionStrength: 0.03,
   fogEdge0: 0.0,
   fogEdge1: 0.9,
   fogColor: new THREE.Color(0xffffff),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useFogProjection = ({
   size,
}: {
   size: Size;
}): HooksReturn<FogProjectionParams, FogProjectionObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
   });

   const [params, setParams] =
      useParams<FogProjectionParams>(FOGPROJECTION_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: FogProjectionParams) => {
         const { gl, clock } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "uTime", clock.getElapsedTime());
         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uNoiseMap", params.noiseMap!);
         setUniform(material, "distortionStrength", params.distortionStrength!);
         setUniform(material, "fogEdge0", params.fogEdge0!);
         setUniform(material, "fogEdge1", params.fogEdge1!);
         setUniform(material, "fogColor", params.fogColor!);
         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [updateRenderTarget, material, setParams, params]
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
