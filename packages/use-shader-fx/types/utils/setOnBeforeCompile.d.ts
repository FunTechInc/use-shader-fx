import * as THREE from "three";
type OnBeforeCompile = (parameters: THREE.WebGLProgramParametersWithUniforms, renderer: THREE.WebGLRenderer) => void;
export declare const setOnBeforeCompile: (onBeforeCompile?: OnBeforeCompile) => OnBeforeCompile;
export {};
