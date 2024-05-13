import * as THREE from "three";
type Object3DConstructor<T, M extends THREE.Material> = new (geometry: THREE.BufferGeometry, material: M) => T;
/**
 * Add geometry and material to Object3D and add them to scene.
 */
export declare const useAddObject: <T extends THREE.Object3D<THREE.Object3DEventMap>, M extends THREE.Material>(scene: THREE.Scene | false, geometry: THREE.BufferGeometry, material: M, Proto: Object3DConstructor<T, M>) => T;
export {};
