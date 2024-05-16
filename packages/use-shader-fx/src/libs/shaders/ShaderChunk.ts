import wobble3D from "./shaderChunk/wobble3D.glsl";
import snoise from "./shaderChunk/snoise.glsl";
import coverTexture from "./shaderChunk/coverTexture.glsl";
import fxBlending from "./shaderChunk/fxBlending.glsl";
import planeVertex from "./shaderChunk/planeVertex.glsl";
import defaultVertex from "./shaderChunk/defaultVertex.glsl";

export const ShaderChunk: { [key: string]: string } = Object.freeze({
   wobble3D,
   snoise,
   coverTexture,
   fxBlending,
   planeVertex,
   defaultVertex,
});
