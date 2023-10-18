import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";

const RADIUS = 0.06; // size of the stamp, percentage of the size
const MAGNIFICATION = 0.01; //拡大率
const ALPHA = 0.1; // opacity TODO*これバグってるいので修正
const DISSIPATION = 1.0; // 拡散率。1にすると残り続ける
const MOTION_BLUR = 0.0; //モーションブラーの強さ
const MOTION_SAMPLE = 10; //モーションブラーのサンプル数 これを高くするとパフォーマンスへの影響大
const SMUDGE = 0.0; //滲み効果の強さ

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useBrush = (texture?: THREE.Texture) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({
      texture,
      scene,
      radius: RADIUS,
      alpha: ALPHA,
      smudge: SMUDGE,
      dissipation: DISSIPATION,
      magnification: MAGNIFICATION,
      motionBlur: MOTION_BLUR,
      motionSample: MOTION_SAMPLE,
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
         const { currentPointer, prevPointer, velocity } =
            updatePointer(pointer);
         material.uniforms.uMouse.value = currentPointer.clone();
         material.uniforms.uPrevMouse.value = prevPointer.clone();
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
