import * as THREE from "three";
type UpdatePointer = (currentPointer: THREE.Vector2) => {
    currentPointer: THREE.Vector2;
    prevPointer: THREE.Vector2;
    diffPointer: THREE.Vector2;
    velocity: THREE.Vector2;
    isVelocityUpdate: boolean;
};
/** When given the pointer vector2 from r3f's RootState, it generates an update function that returns {currentPointer, prevPointer, diffPointer, isVelocityUpdate, velocity}. */
export declare const usePointer: () => UpdatePointer;
export {};
