import * as THREE from "three";
/**
 * @param fps FPS you want to limit , default : `60`
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
export declare const useFPSLimiter: (fps?: number) => (clock: THREE.Clock) => boolean;
