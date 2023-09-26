import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
import { useMemo } from "react";
import { usePointer } from "./usePointer";

const FALLOFF = 0.3; // size of the stamp, percentage of the size
const ALPHA = 1; // opacity of the stamp
const DISSIPATION = 0.98; // affects the speed that the stamp fades. Closer to 1 is slower

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFlowmapEffect = () => {
   // set scene
   const scene = useMemo(() => new THREE.Scene(), []);
   // create FBO
   const renderTarget = useRenderTarget();
   // create mesh
   const material = useMesh({
      scene,
      falloff: FALLOFF,
      alpha: ALPHA,
      dissipation: DISSIPATION,
   });
   // create camera
   const camera = useCamera();
   // pointer
   const updateVelocity = usePointer();
   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = (gl: THREE.WebGLRenderer) => {
      if (!camera.current) {
         return;
      }
      //update velocity
      updateVelocity(material);
      //update render target
      gl.setRenderTarget(renderTarget.write);
      if (material.uniforms.tMap.value !== renderTarget.write?.texture) {
         //前のフレームとFBOが一緒の時はrenderさせない
         gl.render(scene, camera.current);
      }
      renderTarget.swap();
      gl.setRenderTarget(null);
      gl.clear();
      //return buffer
      const bufferTexture = renderTarget.read!.texture;
      material.uniforms.tMap.value = bufferTexture;
      return bufferTexture as THREE.Texture;
   };
   return handleUpdate;
};
