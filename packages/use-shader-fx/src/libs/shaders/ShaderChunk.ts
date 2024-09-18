import wobble3D from "./shaderChunk/wobble3D.glsl";
import snoise from "./shaderChunk/snoise.glsl";
import coverTexture from "./shaderChunk/coverTexture.glsl";
import planeVertex from "./shaderChunk/planeVertex.glsl";
import defaultVertex from "./shaderChunk/defaultVertex.glsl";
import hsv2rgb from "./shaderChunk/hsv2rgb.glsl";
import rgb2hsv from "./shaderChunk/rgb2hsv.glsl";
import blendingColor from "./shaderChunk/blendingColor.glsl";
import blendingUniforms from "./shaderChunk/blendingUniforms.glsl";
import blendingPlaneVertex from "./shaderChunk/blendingPlaneVertex.glsl";

export type ShaderChunkTypes =
   | "wobble3D"
   | "snoise"
   | "coverTexture"
   | "planeVertex"
   | "defaultVertex"
   | "hsv2rgb"
   | "rgb2hsv"
   | "blendingColor"
   | "blendingUniforms"
   | "blendingPlaneVertex";

export const ShaderChunk: { [K in ShaderChunkTypes]: string } = Object.freeze({
   wobble3D,
   snoise,
   coverTexture,
   planeVertex,
   defaultVertex,
   hsv2rgb,
   rgb2hsv,
   blendingColor,
   blendingUniforms,
   blendingPlaneVertex,
});
