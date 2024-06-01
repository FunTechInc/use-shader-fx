export type ShaderChunkTypes = "wobble3D" | "snoise" | "coverTexture" | "fxBlending" | "planeVertex" | "defaultVertex" | "hsv2rgb" | "rgb2hsv";
export declare const ShaderChunk: {
    [K in ShaderChunkTypes]: string;
};
