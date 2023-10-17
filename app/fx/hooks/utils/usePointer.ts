import * as THREE from "three";
import { useCallback, useRef } from "react";

/**
 * @returns updatePointer frameで呼び出す更新関数を返す
 */
export const usePointer = () => {
   const prevPointer = useRef(new THREE.Vector2());
   const lastUpdateTime = useRef<number>(0);
   const velocity = useRef(new THREE.Vector2(0, 0));
   const isMoved = useRef(false);

   const updatePointer = useCallback((currentPointer: THREE.Vector2) => {
      const now = performance.now();
      const current = currentPointer.clone();

      // get delta time
      if (lastUpdateTime.current === 0) {
         lastUpdateTime.current = now;
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
      const prevTemp = isMoved.current ? prevPointer.current.clone() : current;
      if (!isMoved.current && isUpdate) {
         isMoved.current = true;
      }
      prevPointer.current = current;

      return {
         currentPointer: current,
         prevPointer: prevTemp,
         velocity: velocity.current,
         isVelocityUpdate: isUpdate,
      };
   }, []);

   return updatePointer;
};
