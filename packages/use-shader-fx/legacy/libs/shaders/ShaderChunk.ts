import wobble3D from "./shaderChunk/wobble3D.glsl";
import snoise from "./shaderChunk/snoise.glsl";
import coverTexture from "./shaderChunk/coverTexture.glsl";
import fxBlending from "./shaderChunk/fxBlending.glsl";
import planeVertex from "./shaderChunk/planeVertex.glsl";
import defaultVertex from "./shaderChunk/defaultVertex.glsl";
import hsv2rgb from "./shaderChunk/hsv2rgb.glsl";
import rgb2hsv from "./shaderChunk/rgb2hsv.glsl";

export type ShaderChunkTypes =
   | "wobble3D"
   | "snoise"
   | "coverTexture"
   | "fxBlending"
   | "planeVertex"
   | "defaultVertex"
   | "hsv2rgb"
   | "rgb2hsv";

export const ShaderChunk: { [K in ShaderChunkTypes]: string } = Object.freeze({
   wobble3D,
   snoise,
   coverTexture,
   fxBlending,
   planeVertex,
   defaultVertex,
   hsv2rgb,
   rgb2hsv,
});
