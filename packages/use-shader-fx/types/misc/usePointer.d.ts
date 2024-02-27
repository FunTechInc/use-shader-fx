import * as THREE from "three";
export type PointerValues = {
    currentPointer: THREE.Vector2;
    prevPointer: THREE.Vector2;
    diffPointer: THREE.Vector2;
    velocity: THREE.Vector2;
    isVelocityUpdate: boolean;
};
type UpdatePointer = (currentPointer: THREE.Vector2) => PointerValues;
/**
 * @description When given the pointer vector2 from r3f's RootState, it generates an update function that returns {`currentPointer`, `prevPointer`, `diffPointer`, `isVelocityUpdate`, `velocity`}.
 * @description When calling custom in a `useFrame` loop, you can avoid duplication of execution by passing `pointerValues` to the update function of a Pointer-activated fxHook, such as `useBrush`.
 * @param lerp 0~1, lerp intensity (0 to less than 1) , default: 0
 */
export declare const usePointer: (lerp?: number) => UpdatePointer;
export {};
