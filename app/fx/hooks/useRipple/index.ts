import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { usePointer } from "../utils/usePointer";

export type RippleParams = {
   frequency: number;
   rotation: number;
   fadeout_speed: number;
   scale: number;
   alpha: number;
};
type TUseRipple = {
   texture: THREE.Texture;
   size: number;
   max: number;
};

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useRipple = ({ texture, size, max }: TUseRipple) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const meshArr = useMesh({
      size: size,
      max: max,
      texture,
      scene,
   });
   const camera = useCamera();
   const updatePointer = usePointer();
   const updateRenderTarget = useSingleFBO(scene, camera);

   const currentWave = useRef(0);
   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState, params: RippleParams) => {
         const { gl, pointer, size } = props;
         const { frequency, alpha, rotation, fadeout_speed, scale } = params;

         //update pointer and meshArr
         const { currentPointer, diffPointer } = updatePointer(pointer);
         if (frequency < diffPointer.length()) {
            const mesh = meshArr[currentWave.current];
            mesh.visible = true;
            mesh.position.set(
               currentPointer.x * (size.width / 2),
               currentPointer.y * (size.height / 2),
               0
            );
            mesh.scale.x = mesh.scale.y = 0.0;
            (mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
            currentWave.current = (currentWave.current + 1) % max;
         }
         meshArr.forEach((mesh) => {
            if (mesh.visible) {
               const material = mesh.material as THREE.MeshBasicMaterial;
               mesh.rotation.z += rotation;
               material.opacity *= fadeout_speed;
               mesh.scale.x = fadeout_speed * mesh.scale.x + scale;
               mesh.scale.y = mesh.scale.x;
               if (material.opacity < 0.002) mesh.visible = false;
            }
         });

         //update render target
         const bufferTexture = updateRenderTarget(gl);
         //return buffer
         return bufferTexture;
      },
      [updateRenderTarget, meshArr, updatePointer, max]
   );
   return handleUpdate;
};
