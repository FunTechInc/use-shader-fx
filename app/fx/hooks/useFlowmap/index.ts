import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";

const RADIUS = 0.1; // size of the stamp, percentage of the size
const MAGNIFICATION = 0.02; //拡大率
const ALPHA = 1.0; // opacity
const DISSIPATION = 0.8; // 拡散率。1にすると残り続ける

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFlowmap = () => {
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
   const updateRenderTarget = useDoubleFBO();

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer } = props;

         //update velocity
         const { currentPointer, velocity } = updatePointer(pointer);
         material.uniforms.uMouse.value = currentPointer.clone();
         material.uniforms.uVelocity.value.lerp(
            velocity,
            velocity.length() ? 0.15 : 0.1
         );

         //update render target
         const bufferTexture = updateRenderTarget(gl, ({ read }) => {
            material.uniforms.tMap.value = read;
            gl.render(scene, camera.current);
         });
         //return buffer
         return bufferTexture;
      },
      [camera]
   );
   return handleUpdate;
};
