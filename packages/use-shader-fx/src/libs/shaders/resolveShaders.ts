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

function includeReplacer(match: string, include: string): string {
   return resolveIncludes(SHADER_CHUNK[include] || "");
}

function resolveIncludes(string: string): string {
   return string.replace(includePattern, includeReplacer);
}

export { resolveIncludes };
