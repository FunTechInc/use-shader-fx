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
   texture?: THREE.Texture;
   noiseMap?: THREE.Texture;
   distortionStrength?: number;
   fogEdge0?: number;
   fogEdge1?: number;
   fogColor?: THREE.Color;
};

export type FogProjectionObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

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

   const [params, setParams] = useParams<FogProjectionParams>({
      texture: new THREE.Texture(),
      noiseMap: new THREE.Texture(),
      distortionStrength: 0.0,
      fogEdge0: 0.0,
      fogEdge1: 0.9,
      fogColor: new THREE.Color(0xffffff),
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: FogProjectionParams) => {
         const { gl, clock } = props;
         setParams(updateParams);
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
