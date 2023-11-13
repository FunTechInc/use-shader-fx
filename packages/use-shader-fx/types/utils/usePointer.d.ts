import * as THREE from "three";
type UpdatePointer = (currentPointer: THREE.Vector2) => {
    currentPointer: THREE.Vector2;
    prevPointer: THREE.Vector2;
    diffPointer: THREE.Vector2;
    velocity: THREE.Vector2;
    isVelocityUpdate: boolean;
};
export declare const usePointer: () => UpdatePointer;
export {};
