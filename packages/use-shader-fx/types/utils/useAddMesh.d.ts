import * as THREE from "three";
/** Generate mesh from geometry and material and add to scene */
export declare const useAddMesh: (scene: THREE.Scene, geometry: THREE.BufferGeometry, material: THREE.Material) => THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material, THREE.Object3DEventMap>;
