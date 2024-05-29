export type ShaderChunkTypes = "wobble3D" | "snoise" | "coverTexture" | "fxBlending" | "planeVertex" | "defaultVertex";
export declare const ShaderChunk: {
    [K in ShaderChunkTypes]: string;
};
