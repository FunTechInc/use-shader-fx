import * as THREE from "three";
import { useCallback, useRef } from "react";

export const usePointer = () => {
   const beforePointerPos = useRef(new THREE.Vector2());
   const updatePointer = useCallback((pointer: THREE.Vector2) => {
      const temp = beforePointerPos.current;
      beforePointerPos.current = pointer.clone();
      return {
         pointerPos: pointer,
         beforePointerPos: temp,
      };
   }, []);
   return updatePointer;
};
