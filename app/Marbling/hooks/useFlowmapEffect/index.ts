import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
import { useMemo } from "react";
import { usePointer } from "./usePointer";
import { RootState } from "@react-three/fiber";

const FALLOFF = 0.3; // size of the stamp, percentage of the size
const ALPHA = 1; // opacity of the stamp
const DISSIPATION = 0.9; // affects the speed that the stamp fades. Closer to 1 is slower

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFlowmapEffect = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({
      scene,
      falloff: FALLOFF,
      alpha: ALPHA,
      dissipation: DISSIPATION,
   });
   const camera = useCamera();
   const updateVelocity = usePointer();
   const updateRenderTarget = useRenderTarget();

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = (props: RootState) => {
      const { gl } = props;
      if (!camera.current) {
         return;
      }
      //update velocity
      updateVelocity(material);
      //update render target
      const bufferTexture = updateRenderTarget(gl, (fbo) => {
         if (material.uniforms.tMap.value !== fbo.write?.texture) {
            // 前のフレームとFBOが一緒の時はrenderさせない
            gl.render(scene, camera.current!);
         }
      });
      //return buffer
      material.uniforms.tMap.value = bufferTexture;
      return bufferTexture;
   };
   return handleUpdate;
};
