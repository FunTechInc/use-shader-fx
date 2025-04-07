export type ShaderChunkTypes = "default_pars_fragment" | "srcSystem_pars_vertex" | "srcSystem_pars_fragment" | "default_pars_vertex" | "default_vertex" | "plane_vertex" | "mixSrc_fragment_begin" | "mixSrc_fragment_end" | "mixSrc_pars_fragment" | "mixSrc_pars_vertex" | "mixSrc_vertex" | "mixDst_fragment" | "mixDst_pars_fragment" | "mixDst_pars_vertex" | "mixDst_vertex" | "texture_pars_fragment" | "texture_pars_vertex" | "texture_vertex" | "adjustments_fragment" | "adjustments_pars_fragment" | "calcSrcUv";
export declare const ShaderChunk: {
    [K in ShaderChunkTypes]: string;
};
