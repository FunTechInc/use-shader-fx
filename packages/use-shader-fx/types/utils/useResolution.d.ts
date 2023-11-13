import * as THREE from "three";
import { Size } from "@react-three/fiber";
/**
 * @params isDpr Whether to multiply dpr, default:false
 */
export declare const useResolution: (size: Size, dpr?: number | false) => THREE.Vector2;
