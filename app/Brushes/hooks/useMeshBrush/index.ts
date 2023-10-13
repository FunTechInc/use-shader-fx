import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { useMesh } from "./useMesh";
import { useTrail } from "./useTrail";

/*===============================================
params
- MeshLineMaterialのparams
useTrailのparams
- maxLength
	- 長さの最大値
- erase 物理量の減衰率
	- 長さが0に向かう速さ
	- 0で残り続ける
- eraseInterval={1}
	- ポイントを消すまでに待つinterval
- eraseLerp : number
- attenuation={(width) => width}  
	- ポイント毎wiodthの減衰値

want 
- attraction 
	- これはfragシェーダー
	- velocityに引っ張られる力
- dissipation 散逸率
- viscosity 粘度
	- 速度によっての粘度を変える
	- これもシェーダ側
===============================================*/

const ERASE_INTERVAL = 2;
const ERASE = 1;
const ATTENUATION = (width: number) => 1;

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useBrush = (texture: THREE.Texture) => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const geometry = useMesh({ texture, scene });
   const camera = useCamera();
   const updatePointer = usePointer();
   const updateTrail = useTrail();
   const updateRenderTarget = useRenderTarget();

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer, size } = props;

         //ポインター
         const { currentPointer, prevPointer, isVelocityUpdate, velocity } =
            updatePointer(pointer);

         //トレイル処理
         const points = updateTrail({
            prevPointer,
            currentPointer,
            size,
            isVelocityUpdate,
            velocity,
            eraseInterval: ERASE_INTERVAL,
            erase: ERASE,
         });
         geometry.setPoints(points, ATTENUATION);

         //焼きつけ
         const bufferTexture = updateRenderTarget(gl, () => {
            gl.render(scene, camera.current);
         });

         //return buffer
         return bufferTexture;
      },
      [scene, camera, updateRenderTarget]
   );
   return handleUpdate;
};
