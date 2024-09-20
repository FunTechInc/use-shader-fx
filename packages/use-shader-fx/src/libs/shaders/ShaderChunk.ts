import default_pars_fragment from "./ShaderChunk/default_pars_fragment.glsl";
import default_pars_vertex from "./ShaderChunk/default_pars_vertex.glsl";
import mixSrc_fragment_begin from "./ShaderChunk/mixSrc_fragment_begin.glsl";
import mixSrc_fragment_end from "./ShaderChunk/mixSrc_fragment_end.glsl";
import mixSrc_pars_fragment from "./ShaderChunk/mixSrc_pars_fragment.glsl";
import mixSrc_pars_vertex from "./ShaderChunk/mixSrc_pars_vertex.glsl";
import mixSrc_vertex from "./ShaderChunk/mixSrc_vertex.glsl";
import mixDst_fragment from "./ShaderChunk/mixDst_fragment.glsl";
import mixDst_pars_fragment from "./ShaderChunk/mixDst_pars_fragment.glsl";
import mixDst_pars_vertex from "./ShaderChunk/mixDst_pars_vertex.glsl";
import mixDst_vertex from "./ShaderChunk/mixDst_vertex.glsl";

export type ShaderChunkTypes =
   | "default_pars_fragment"
   | "default_pars_vertex"
   | "mixSrc_fragment_begin"
   | "mixSrc_fragment_end"
   | "mixSrc_pars_fragment"
   | "mixSrc_pars_vertex"
   | "mixSrc_vertex"
   | "mixDst_fragment"
   | "mixDst_pars_fragment"
   | "mixDst_pars_vertex"
   | "mixDst_vertex";

export const ShaderChunk: { [K in ShaderChunkTypes]: string } = Object.freeze({
   default_pars_fragment,
   default_pars_vertex,
   mixSrc_fragment_begin,
   mixSrc_fragment_end,
   mixSrc_pars_fragment,
   mixSrc_pars_vertex,
   mixSrc_vertex,
   mixDst_fragment,
   mixDst_pars_fragment,
   mixDst_pars_vertex,
   mixDst_vertex,
});
