import * as THREE from "three";
/**
 * Calculate the maximum length of attribute (position and uv) to match the length of all lists. Randomly map missing attributes when matching to maximum length
 * */
export declare const modifyAttributes: (attribute: Float32Array[] | undefined, targetGeometry: THREE.BufferGeometry, targetAttibute: "position" | "uv", itemSize: number) => Float32Array[];
