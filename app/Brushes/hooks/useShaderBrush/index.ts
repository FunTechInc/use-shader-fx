import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";

const RADIUS = 0.05; // size of the stamp, percentage of the size
const MAGNIFICATION = 0.02; //拡大率
const ALPHA = 1.0; // opacity
const DISSIPATION = 0.9; // 拡散率。1にすると残り続ける

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useShaderBrush = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({
      scene,
      radius: RADIUS,
      alpha: ALPHA,
      dissipation: DISSIPATION,
      magnification: MAGNIFICATION,
   });
   const camera = useCamera();
   const updatePointer = usePointer();
   const updateRenderTarget = useRenderTarget();

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer } = props;

         //update velocity
         const { currentPointer, prevPointer, velocity } =
            updatePointer(pointer);
         material.uniforms.uMouse.value = currentPointer.clone();
         material.uniforms.uPrevMouse.value = prevPointer.clone();
         material.uniforms.uVelocity.value.lerp(
            velocity,
            velocity.length() ? 0.15 : 0.1
         );

         //update render target
         const bufferTexture = updateRenderTarget(gl, (fbo) => {
            if (material.uniforms.tMap.value !== fbo.write?.texture) {
               // 前のフレームとFBOが一緒の時はrenderさせない
               gl.render(scene, camera.current);
            }
         });
         //return buffer
         material.uniforms.tMap.value = bufferTexture;

         return bufferTexture;
      },
      [camera]
   );
   return handleUpdate;
};
