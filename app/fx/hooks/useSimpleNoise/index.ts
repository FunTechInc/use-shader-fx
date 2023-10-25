import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

export type SimpleNoiseParams = {
   texture: THREE.Texture;
   xDir: THREE.Vector2;
   yDir: THREE.Vector2;
   xTimeStrength: number;
   yTimeStrength: number;
   xStrength: number;
   yStrength: number;
};

/**
 * @returns handleUpdate(props: RootState)=> THREE.WebGLRenderTarget.texture
 */
export const useSimpleNoise = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const handleUpdate = useCallback(
      (props: RootState, params: SimpleNoiseParams) => {
         const { gl, clock } = props;
         const {
            texture,
            xDir,
            xTimeStrength,
            xStrength,
            yDir,
            yTimeStrength,
            yStrength,
         } = params;
         //set params
         setUniform(material, "uTexture", texture);
         setUniform(material, "xDir", xDir);
         setUniform(material, "xTimeStrength", xTimeStrength);
         setUniform(material, "xStrength", xStrength);
         setUniform(material, "yDir", yDir);
         setUniform(material, "yTimeStrength", yTimeStrength);
         setUniform(material, "yStrength", yStrength);
         setUniform(material, "uTime", clock.getElapsedTime());
         //update render target
         const bufferTexture = updateRenderTarget(gl);
         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget, material]
   );
   return handleUpdate;
};
