import * as THREE from "three";
import { useCallback, useMemo, useRef } from "react";

/**
 * @param fps FPS you want to limit , default : 60
 *
 * ```tsx
 * const limiter = useFPSLimiter(fps);
 * useFrame((props) => {
 *     if (limiter(props.clock)) {
 *		    //some code
 *     }
 * });
 * ```
 */
export const useFPSLimiter = (fps: number = 60) => {
   const interval = useMemo(() => 1 / Math.max(Math.min(fps, 60), 1), [fps]);
   const prevTime = useRef<number | null>(null);

   const limiter = useCallback(
      (clock: THREE.Clock) => {
         const tick = clock.getElapsedTime();
         if (prevTime.current === null) {
            prevTime.current = tick;
            return true;
         }
         const deltaTime = tick - prevTime.current;
         if (deltaTime >= interval) {
            prevTime.current = tick;
            return true;
         }
         return false;
      },
      [interval]
   );

   return limiter;
};
