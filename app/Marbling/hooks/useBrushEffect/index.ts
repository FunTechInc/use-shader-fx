import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { usePointer } from "./usePointer";
import { useRenderTarget } from "../utils/useRenderTarget";

const SIZE = 64;
const MAX = 100;
const FREQUENCY = 5;

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useBrushEffect = (texture: THREE.Texture) => {
   // set scene
   const scene = useMemo(() => new THREE.Scene(), []);
   // create FBO
   const renderTarget = useRenderTarget();
   // create mesh
   const meshArr = useMesh({
      size: SIZE,
      max: MAX,
      texture,
      scene,
   });
   // create camera
   const camera = useCamera();
   // set pointer event
   const trackPointerPos = usePointer(meshArr, FREQUENCY, MAX);
   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (gl: THREE.WebGLRenderer) => {
         if (!camera.current) {
            return;
         }
         //update pointer and meshArr
         trackPointerPos();
         //update render target
         gl.setRenderTarget(renderTarget.write);
         gl.render(scene, camera.current);
         renderTarget.swap();
         gl.setRenderTarget(null);
         gl.clear();
         //return buffer
         return renderTarget.read?.texture as THREE.Texture;
      },
      [camera, renderTarget, scene, trackPointerPos]
   );
   return handleUpdate;
};
