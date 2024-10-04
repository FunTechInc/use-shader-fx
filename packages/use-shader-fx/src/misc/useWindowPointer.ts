import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Size } from "../hooks/types";

const PASSIVE = { passive: true };

/**
 * @param size Size
 * @returns THREE.Vector2
 */
export const useWindowPointer = (size: Size) => {
   const windowPointer = useRef(new THREE.Vector2(0));

   useEffect(() => {
      const compute = (x: number, y: number) => {
         windowPointer.current.set(
            ((x - size.left) / size.width) * 2 - 1,
            -((y - size.top) / size.height) * 2 + 1
         );
      };
      const handleTouchMove = (event: TouchEvent) => {
         const touch = event.touches[0];
         compute(touch.clientX, touch.clientY);
      };
      const handlePointerMove = (event: PointerEvent) => {
         compute(event.clientX, event.clientY);
      };

      window.addEventListener("touchmove", handleTouchMove, PASSIVE);
      window.addEventListener("pointermove", handlePointerMove, PASSIVE);

      return () => {
         window.removeEventListener("touchmove", handleTouchMove);
         window.removeEventListener("pointermove", handlePointerMove);
      };
   }, [size]);

   return windowPointer.current;
};
