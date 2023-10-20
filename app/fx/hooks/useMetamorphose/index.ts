import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

type TParams = {
   texture: THREE.Texture[];
   imageResolution: THREE.Vector2;
   noise: THREE.Texture;
   noiseStrength?: number;
   progress?: number;
   dir?: {
      x: number;
      y: number;
   };
};

/**
 * @returns handleUpdate(props: RootState)=> THREE.WebGLRenderTarget.texture
 */
export const useMetamorphose = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const handleUpdate = useCallback(
      (props: RootState, params: TParams) => {
         const { gl } = props;
         const {
            noise,
            texture,
            imageResolution,
            noiseStrength = 0.0,
            progress = 0.0,
            dir = { x: 0.0, y: 0.0 },
         } = params;
         //set params
         setUniform(material, "uTexture0", texture[0]);
         setUniform(material, "uTexture1", texture[1]);
         setUniform(material, "uImageResolution", imageResolution);
         setUniform(material, "noise", noise);
         setUniform(material, "noiseStrength", noiseStrength);
         setUniform(material, "progress", progress);
         setUniform(material, "dirX", dir.x);
         setUniform(material, "dirY", dir.y);
         //update render target
         const bufferTexture = updateRenderTarget(gl);
         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget]
   );
   return handleUpdate;
};
