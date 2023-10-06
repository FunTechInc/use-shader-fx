import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { usePointer } from "./usePointer";
import { useRenderTarget } from "../utils/useRenderTarget";
import { RootState } from "@react-three/fiber";

const SIZE = 64;
const MAX = 100;
const FREQUENCY = 1;

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useRippleEffect = (texture?: THREE.Texture) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const meshArr = useMesh({
      size: SIZE,
      max: MAX,
      texture,
      scene,
   });
   const camera = useCamera();
   const trackPointerPos = usePointer(meshArr, FREQUENCY, MAX);
   const updateRenderTarget = useRenderTarget();

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl } = props;
         if (!camera.current) {
            return;
         }
         //update pointer and meshArr
         trackPointerPos();
         //update render target
         const bufferTexture = updateRenderTarget(gl, () => {
            gl.render(scene, camera.current!);
         });
         //return buffer
         return bufferTexture;
      },
      [scene, camera, trackPointerPos, updateRenderTarget]
   );
   return handleUpdate;
};
