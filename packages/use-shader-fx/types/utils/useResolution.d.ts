import * as THREE from "three";
import { Size } from "../fxs/types";
/**
 * @params dpr if dpr is set, it returns the resolution which is size multiplied by dpr.
 */
export declare const useResolution: (size: Size, dpr?: number | false) => THREE.Vector2;
