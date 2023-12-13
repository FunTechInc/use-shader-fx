import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
export declare const updateRect: ({ params, size, resolutionRef, scene, isIntersectingRef, }: {
    params: DomSyncerParams;
    size: Size;
    resolutionRef: React.MutableRefObject<THREE.Vector2>;
    scene: THREE.Scene;
    isIntersectingRef: React.MutableRefObject<boolean[]>;
}) => void;
