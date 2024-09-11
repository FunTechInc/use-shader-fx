import { ShaderChunk, ShaderChunkTypes } from "./ShaderChunk";

const includePattern = /^[ \t]*#usf +<([\w\d./]+)>/gm;

function includeReplacer(match: string, include: ShaderChunkTypes): string {
   return resolveIncludes(ShaderChunk[include] || "");
}

function resolveIncludes(string: string): string {
   return string.replace(includePattern, includeReplacer);
}

export { resolveIncludes };
