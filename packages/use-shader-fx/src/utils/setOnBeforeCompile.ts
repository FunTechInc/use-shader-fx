import { resolveShaders } from "../libs/shaders/resolveShaders";

type OnBeforeCompile = (
   shader: THREE.Shader,
   renderer: THREE.WebGLRenderer
) => void;

export const setOnBeforeCompile = (
   onBeforeCompile?: OnBeforeCompile
): OnBeforeCompile => {
   return (shader, renderer) => {
      onBeforeCompile && onBeforeCompile(shader, renderer);
      resolveShaders(shader);
   };
};
