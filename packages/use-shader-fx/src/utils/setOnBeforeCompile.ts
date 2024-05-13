import * as THREE from "three";
import { resolveShaders } from "../libs/shaders/resolveShaders";

type OnBeforeCompile = (
   parameters: THREE.WebGLProgramParametersWithUniforms,
   renderer: THREE.WebGLRenderer
) => void;

export const setOnBeforeCompile = (
   onBeforeCompile?: OnBeforeCompile
): OnBeforeCompile => {
   return (parameters, renderer) => {
      onBeforeCompile && onBeforeCompile(parameters, renderer);
      resolveShaders(parameters);
   };
};
