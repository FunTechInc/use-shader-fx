import * as THREE from "three";
import { Size } from "@react-three/fiber";
/**
 * @params dpr if dpr is set, it returns the resolution which is size multiplied by dpr.
 */
export declare const useResolution: (size: Size, dpr?: number | false) => THREE.Vector2;
