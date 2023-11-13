import * as THREE from "three";
import { useCallback, useRef } from "react";

type UpdatePointer = (currentPointer: THREE.Vector2) => {
   currentPointer: THREE.Vector2;
   prevPointer: THREE.Vector2;
   diffPointer: THREE.Vector2;
   velocity: THREE.Vector2;
   isVelocityUpdate: boolean;
};

export const usePointer = (): UpdatePointer => {
   const prevPointer = useRef(new THREE.Vector2(0, 0));
   const diffPointer = useRef(new THREE.Vector2(0, 0));
   const lastUpdateTime = useRef<number>(0);
   const velocity = useRef(new THREE.Vector2(0, 0));
   const isMoved = useRef(false);

   const updatePointer = useCallback((currentPointer: THREE.Vector2) => {
      const now = performance.now();
      const current = currentPointer.clone();

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
      const prevTemp = isMoved.current ? prevPointer.current.clone() : current;
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
   }, []);

   return updatePointer;
};
