export type ShaderLibTypes = "plane_vertex" | "default_vertex" | "default_pars_vertex" | "default_pars_fragment" | "basicFx_vertex" | "basicFx_pars_vertex" | "basicFx_pars_fragment" | "basicFx_fragment_begin" | "basicFx_fragment_end" | "samplingFx_vertex" | "samplingFx_pars_vertex" | "samplingFx_pars_fragment";
export declare const ShaderLib: {
    [K in ShaderLibTypes]: string;
};
