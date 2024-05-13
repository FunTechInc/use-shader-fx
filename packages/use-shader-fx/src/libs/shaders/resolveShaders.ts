import * as THREE from "three";

import wobble3D from "./shaderChunk/wobble3D.glsl";
import snoise from "./shaderChunk/snoise.glsl";
import coverTexture from "./shaderChunk/coverTexture.glsl";
import fxBlending from "./shaderChunk/fxBlending.glsl";
import planeVert from "./shaderChunk/planeVert.glsl";

const SHADER_CHUNK: { [key: string]: string } = {
   wobble3D,
   snoise,
   coverTexture,
   fxBlending,
   planeVert,
};

const includePattern = /^[ \t]*#usf +<([\w\d./]+)>/gm;

function includeReplacer(match: string, include: string) {
   let string = SHADER_CHUNK[include] || "";
   return resolveIncludes(string);
}

function resolveIncludes(string: string) {
   return string.replace(includePattern, includeReplacer);
}

export const resolveShaders = (
   parameters: THREE.WebGLProgramParametersWithUniforms
) => {
   parameters.vertexShader = resolveIncludes(parameters.vertexShader);
   parameters.fragmentShader = resolveIncludes(parameters.fragmentShader);
};
