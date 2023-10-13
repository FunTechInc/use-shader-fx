import * as THREE from "three";
import { useCallback, useRef } from "react";
import { Size } from "@react-three/fiber";

type TUpdateTrail = {
   prevPointer: THREE.Vector2;
   currentPointer: THREE.Vector2;
   size: Size;
   velocity: THREE.Vector2;
   isVelocityUpdate: boolean;
   eraseInterval: number;
   erase: number;
};

const erasePoints = (collection: Float32Array, steps: number): Float32Array => {
   collection.set(collection.subarray(steps));
   return collection;
};

const drawPoints = (currentPoints: Float32Array, newPoints: number[]) => {
   const updatedPoints = new Float32Array(
      currentPoints.length + newPoints.length
   );
   updatedPoints.set(currentPoints);
   updatedPoints.set(newPoints, currentPoints.length);
   return updatedPoints;
};

const createNewPoints = (
   beforePointerPos: THREE.Vector2,
   pointerPos: THREE.Vector2,
   size: Size
): number[] => {
   return [
      (beforePointerPos.x * size.width) / 2,
      (beforePointerPos.y * size.height) / 2,
      0,
      (pointerPos.x * size.width) / 2,
      (pointerPos.y * size.height) / 2,
      0,
   ];
};

/*===============================================
TODO*
動いてる時だけポイントが増えるようにする
	isMovingみたいな、それかvelocityをpointerでつくるか。

- eraseLerp / EASE をうまくvelocityと掛け合わせる感じにして、イージングを実装する
===============================================*/

export const useTrail = () => {
   const currentPoints = useRef<Float32Array>(new Float32Array());
   // 減衰カウント
   const eraseCount = useRef(0);

   const updateTrail = useCallback(
      ({
         prevPointer,
         currentPointer,
         size,
         isVelocityUpdate,
         velocity,
         eraseInterval,
         erase,
      }: TUpdateTrail): Float32Array => {
         const newPoints = createNewPoints(prevPointer, currentPointer, size);

         let updatedPoints: Float32Array = new Float32Array();

         //減衰
         if (eraseCount.current === 0) {
            const steps = 1 * erase;
            const digit = newPoints.length;
            for (let i = 0; i < steps; i++) {
               if (currentPoints.current.length <= digit) break;
               erasePoints(currentPoints.current, digit);
            }
         }

         //描く
         if (isVelocityUpdate) {
            updatedPoints = drawPoints(currentPoints.current, newPoints);
            currentPoints.current = updatedPoints;
         }

         //減衰カウントの更新
         eraseCount.current++;
         eraseCount.current = eraseCount.current % eraseInterval;

         return currentPoints.current;
      },
      []
   );
   return updateTrail;
};
