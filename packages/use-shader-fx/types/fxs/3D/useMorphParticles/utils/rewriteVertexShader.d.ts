import * as THREE from "three";
export declare const rewriteVertexShader: (modifeidAttributes: Float32Array[], targetGeometry: THREE.BufferGeometry, targetAttibute: "position" | "uv", vertexShader: string, itemSize: number) => string;
