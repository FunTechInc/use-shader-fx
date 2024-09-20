import basicFx_vertex from "./ShaderLib/basicFx_vertex.glsl";
import basicFx_fragment_begin from "./ShaderLib/basicFx_fragment_begin.glsl";
import basicFx_fragment_end from "./ShaderLib/basicFx_fragment_end.glsl";
import basicFx_pars_fragment from "./ShaderLib/basicFx_pars_fragment.glsl";
import basicFx_pars_vertex from "./ShaderLib/basicFx_pars_vertex.glsl";

export type ShaderLibTypes =
   | "basicFx_vertex"
   | "basicFx_fragment_begin"
   | "basicFx_fragment_end"
   | "basicFx_pars_fragment"
   | "basicFx_pars_vertex";

export const ShaderLib: { [K in ShaderLibTypes]: string } = Object.freeze({
   basicFx_vertex,
   basicFx_fragment_begin,
   basicFx_fragment_end,
   basicFx_pars_fragment,
   basicFx_pars_vertex,
});
