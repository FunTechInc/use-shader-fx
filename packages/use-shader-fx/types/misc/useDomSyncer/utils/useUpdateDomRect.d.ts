/// <reference types="react" />
import * as THREE from "three";
import { DomSyncerParams } from "..";
import { Size } from "@react-three/fiber";
type UpdateDomRect = ({ params, size, resolutionRef, scene, isIntersectingRef, }: {
    params: DomSyncerParams;
    size: Size;
    resolutionRef: React.MutableRefObject<THREE.Vector2>;
    scene: THREE.Scene;
    isIntersectingRef: React.MutableRefObject<boolean[]>;
}) => void;
type UseUpdateDomRectReturn = [DOMRect[], UpdateDomRect];
export declare const useUpdateDomRect: () => UseUpdateDomRectReturn;
export {};
