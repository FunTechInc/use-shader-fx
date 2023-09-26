import { useMemo } from "react";
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
export const useRippleEffect = (texture: THREE.Texture) => {
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
   //set pointer
   const trackPointerPos = usePointer(meshArr, FREQUENCY, MAX);
   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = (gl: THREE.WebGLRenderer) => {
      if (!camera.current) {
         return;
      }
      //update pointer
      trackPointerPos();
      //update render target
      gl.setRenderTarget(renderTarget.write);
      gl.render(scene, camera.current);
      renderTarget.swap();
      gl.setRenderTarget(null);
      gl.clear();
      //update meshArr
      meshArr.forEach((mesh) => {
         if (mesh.visible) {
            const material = mesh.material as THREE.MeshBasicMaterial;
            mesh.rotation.z += 0.02;
            material.opacity *= 0.97;
            mesh.scale.x = 0.98 * mesh.scale.x + 0.17;
            mesh.scale.y = mesh.scale.x;
            if (material.opacity < 0.002) mesh.visible = false;
         }
      });
      return renderTarget.read?.texture as THREE.Texture;
   };
   return handleUpdate;
};
