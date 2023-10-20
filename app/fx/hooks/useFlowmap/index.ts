import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";
import { setUniform } from "../utils/setUniforms";

const RADIUS = 0.1; // size of the stamp, percentage of the size
const MAGNIFICATION = 0.0; //拡大率
const ALPHA = 0.1; // opacity
const DISSIPATION = 1.0; // 拡散率。1にすると残り続ける

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
   const updateRenderTarget = useDoubleFBO(scene, camera);

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer } = props;

         //update velocity
         const { currentPointer, velocity } = updatePointer(pointer);
         setUniform(material, "uMouse", currentPointer.clone());
         setUniform(
            material,
            "uVelocity",
            velocity.lerp(velocity, velocity.length() ? 0.15 : 0.1)
         );

         //update render target
         const bufferTexture = updateRenderTarget(gl, ({ read }) => {
            setUniform(material, "tMap", read);
         });
         //return buffer
         return bufferTexture;
      },
      [material, updatePointer, updateRenderTarget]
   );
   return handleUpdate;
};
