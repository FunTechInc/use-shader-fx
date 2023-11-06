import * as THREE from "three";
/**
 * @returns updatePointer frameで呼び出す更新関数を返す
 */
export declare const usePointer: () => (currentPointer: THREE.Vector2) => {
    currentPointer: THREE.Vector2;
    prevPointer: THREE.Vector2;
    diffPointer: THREE.Vector2;
    velocity: THREE.Vector2;
    isVelocityUpdate: boolean;
};
