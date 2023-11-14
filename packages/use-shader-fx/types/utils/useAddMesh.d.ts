import * as THREE from "three";
/** Generate mesh from geometry and material and add to scene */
export declare const useAddMesh: (scene: THREE.Scene, geometry: THREE.PlaneGeometry, material: THREE.Material) => THREE.Mesh<THREE.PlaneGeometry, THREE.Material>;
