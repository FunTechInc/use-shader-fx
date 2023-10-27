import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";
import { HooksReturn } from "../types";

export type FogProjectionParams = {
   texture?: THREE.Texture;
   timeStrength?: number;
   distortionStrength?: number;
   fogEdge0?: number;
   fogEdge1?: number;
   fogColor?: THREE.Color;
   noiseOct?: number;
   fbmOct?: number;
};

export type FogProjectionObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const useFogProjection = (): HooksReturn<
   FogProjectionParams,
   FogProjectionObject
> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const [renderTarget, updateRenderTarget] = useSingleFBO(
      scene,
      camera,
      false
   );

   const handleSetUniform = useCallback(
      (params: FogProjectionParams) => {
         const {
            texture,
            timeStrength,
            distortionStrength,
            fogEdge0,
            fogEdge1,
            fogColor,
            noiseOct,
            fbmOct,
         } = params;
         texture && setUniform(material, "uTexture", texture);
         timeStrength && setUniform(material, "timeStrength", timeStrength);
         distortionStrength &&
            setUniform(material, "distortionStrength", distortionStrength);
         fogEdge0 && setUniform(material, "fogEdge0", fogEdge0);
         fogEdge1 && setUniform(material, "fogEdge1", fogEdge1);
         fogColor && setUniform(material, "fogColor", fogColor);
         noiseOct && setUniform(material, "noiseOct", noiseOct);
         fbmOct && setUniform(material, "fbmOct", fbmOct);
      },
      [material]
   );

   const handleUpdate = useCallback(
      (props: RootState, params: FogProjectionParams) => {
         const { gl, clock } = props;
         setUniform(material, "uTime", clock.getElapsedTime());
         handleSetUniform(params);
         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [updateRenderTarget, material, handleSetUniform]
   );

   return [
      handleUpdate,
      handleSetUniform,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
      },
   ];
};
