import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

export type BgTextureParams = {
   texture: THREE.Texture;
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
      (props: RootState, params: BgTextureParams) => {
         const { gl, clock } = props;
         const { texture } = params;
         //set params
         setUniform(material, "uTexture", texture);
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
