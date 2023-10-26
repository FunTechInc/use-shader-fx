import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

export type TransitionBgParams = {
   texture?: THREE.Texture[];
   imageResolution?: THREE.Vector2;
   noise?: THREE.Texture;
   noiseStrength?: number;
   progress?: number;
   dir?: THREE.Vector2;
};

export const useTransitionBg = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const handleUpdate = useCallback(
      (props: RootState, params: TransitionBgParams) => {
         const { gl } = props;
         const {
            noise,
            texture,
            imageResolution,
            noiseStrength,
            progress,
            dir,
         } = params;

         //set params
         texture && setUniform(material, "uTexture0", texture[0]);
         texture && setUniform(material, "uTexture1", texture[1]);
         imageResolution &&
            setUniform(material, "uImageResolution", imageResolution);
         noise && setUniform(material, "noise", noise);
         noiseStrength && setUniform(material, "noiseStrength", noiseStrength);
         progress && setUniform(material, "progress", progress);
         dir && setUniform(material, "dirX", dir.x);
         dir && setUniform(material, "dirY", dir.y);

         //update render target
         const bufferTexture = updateRenderTarget(gl);

         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget, material]
   );
   return handleUpdate;
};
