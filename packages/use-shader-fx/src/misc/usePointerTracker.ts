import * as THREE from "three";
import { useCallback, useRef } from "react";

export type PointerValues = {
   currentPointer: THREE.Vector2;
   prevPointer: THREE.Vector2;
   diffPointer: THREE.Vector2;
   velocity: THREE.Vector2;
   isVelocityUpdate: boolean;
};

type PointerTracker = (currentPointer: THREE.Vector2) => PointerValues;

/**
 * @description When given the pointer vector2 from r3f's RootState, it generates an update function that returns {`currentPointer`, `prevPointer`, `diffPointer`, `isVelocityUpdate`, `velocity`}.
 * @description When calling custom in a `useFrame` loop, you can avoid duplication of execution by passing `pointerValues` to the update function of a Pointer-activated fxHook, such as `useBrush`.
 * @param lerp 0~1, lerp intensity (0 to less than 1) , default : `0`
 */
export const usePointerTracker = (lerp: number = 0): PointerTracker => {
   const prevPointer = useRef(new THREE.Vector2(0, 0));
   const diffPointer = useRef(new THREE.Vector2(0, 0));
   const lerpPointer = useRef(new THREE.Vector2(0, 0));
   const lastUpdateTime = useRef<number>(0);
   const velocity = useRef(new THREE.Vector2(0, 0));
   const isMoved = useRef(false);

   const pointerTracker = useCallback(
      (currentPointer: THREE.Vector2) => {
         const now = performance.now();

         // lerp
         let current: THREE.Vector2;
         if (isMoved.current && lerp) {
            lerpPointer.current = lerpPointer.current.lerp(
               currentPointer,
               1 - lerp
            );
            current = lerpPointer.current.clone();
         } else {
            current = currentPointer.clone();
            lerpPointer.current = current;
         }

         // first frame
         if (lastUpdateTime.current === 0) {
            lastUpdateTime.current = now;
            prevPointer.current = current;
         }
         const deltaTime = Math.max(1, now - lastUpdateTime.current);
         lastUpdateTime.current = now;

         // get velocity
         velocity.current
            .copy(current)
            .sub(prevPointer.current)
            .divideScalar(deltaTime);
         const isUpdate = velocity.current.length() > 0;

         //set prev temp pos
         const prevTemp = isMoved.current
            ? prevPointer.current.clone()
            : current;
         if (!isMoved.current && isUpdate) {
            isMoved.current = true;
         }
         prevPointer.current = current;

         return {
            currentPointer: current,
            prevPointer: prevTemp,
            diffPointer: diffPointer.current.subVectors(current, prevTemp),
            velocity: velocity.current,
            isVelocityUpdate: isUpdate,
         };
      },
      [lerp]
   );

   return pointerTracker;
};
