import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
import { useMemo } from "react";
import { usePointer } from "./usePointer";
import { RootState } from "@react-three/fiber";

const RADIUS = 0.1; // size of the stamp, percentage of the size
const MAGNIFICATION = 0.02; //拡大率
const ALPHA = 0.3; // opacity
const DISSIPATION = 1.0; // 拡散率。1にすると残り続ける

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useMarbleEffect = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({
      scene,
      radius: RADIUS,
      alpha: ALPHA,
      dissipation: DISSIPATION,
      magnification: MAGNIFICATION,
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
