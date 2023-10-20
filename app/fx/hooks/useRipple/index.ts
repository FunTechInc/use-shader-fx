import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { usePointer } from "./usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";

const SIZE = 64;
const MAX = 100;
const FREQUENCY = 1;

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useRipple = (texture?: THREE.Texture) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const meshArr = useMesh({
      size: SIZE,
      max: MAX,
      texture,
      scene,
   });
   const camera = useCamera();
   const trackPointerPos = usePointer(meshArr, FREQUENCY, MAX);
   const updateRenderTarget = useSingleFBO(scene, camera);

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl } = props;

         //update pointer and meshArr
         trackPointerPos();
         //update render target
         const bufferTexture = updateRenderTarget(gl);
         //return buffer
         return bufferTexture;
      },
      [trackPointerPos, updateRenderTarget]
   );
   return handleUpdate;
};
