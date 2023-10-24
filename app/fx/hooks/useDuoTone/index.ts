import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

export type BgTextureParams = {
   texture: THREE.Texture;
   color: THREE.Color[];
};

/**
 * @returns handleUpdate(props: RootState)=> THREE.WebGLRenderTarget.texture
 */
export const useDuoTone = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const handleUpdate = useCallback(
      (props: RootState, params: BgTextureParams) => {
         const { gl } = props;
         const { texture, color } = params;
         //set params
         setUniform(material, "uTexture", texture);
         setUniform(material, "uColor0", color[0]);
         setUniform(material, "uColor1", color[1]);
         //update render target
         const bufferTexture = updateRenderTarget(gl);
         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget, material]
   );
   return handleUpdate;
};
