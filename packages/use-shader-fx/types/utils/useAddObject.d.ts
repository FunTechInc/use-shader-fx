import * as THREE from "three";
type Object3DConstructor<T> = new (geometry: THREE.BufferGeometry, material: THREE.Material) => T;
/**
 * Add geometry and material to Object3D and add them to scene.
 */
export declare const useAddObject: <T extends THREE.Object3D<THREE.Event>>(scene: THREE.Scene | false, geometry: THREE.BufferGeometry, material: THREE.Material, Proto: Object3DConstructor<T>) => T;
export {};
