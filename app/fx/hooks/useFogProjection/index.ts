import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

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

export const useFogProjection = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const handleUpdate = useCallback(
      (props: RootState, params: FogProjectionParams) => {
         const { gl, clock } = props;
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

         //set params
         setUniform(material, "uTime", clock.getElapsedTime());
         texture && setUniform(material, "uTexture", texture);
         timeStrength && setUniform(material, "timeStrength", timeStrength);
         distortionStrength &&
            setUniform(material, "distortionStrength", distortionStrength);
         fogEdge0 && setUniform(material, "fogEdge0", fogEdge0);
         fogEdge1 && setUniform(material, "fogEdge1", fogEdge1);
         fogColor && setUniform(material, "fogColor", fogColor);
         noiseOct && setUniform(material, "noiseOct", noiseOct);
         fbmOct && setUniform(material, "fbmOct", fbmOct);

         //update render target
         const bufferTexture = updateRenderTarget(gl);

         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget, material]
   );
   return handleUpdate;
};
