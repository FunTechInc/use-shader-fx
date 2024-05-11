type OnBeforeCompile = (shader: THREE.Shader, renderer: THREE.WebGLRenderer) => void;
export declare const setOnBeforeCompile: (onBeforeCompile?: OnBeforeCompile) => OnBeforeCompile;
export {};
