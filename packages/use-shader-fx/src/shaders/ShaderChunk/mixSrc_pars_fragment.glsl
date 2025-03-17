#ifdef USF_USE_MIXSRC
	varying vec2 vMixSrcCoverUv;
	uniform sampler2D mixSrc_src;
	uniform int mixSrc_fit;

	uniform bool mixSrc_uv;
	uniform int mixSrc_uv_ch;
	uniform float mixSrc_uv_factor;
	uniform vec2 mixSrc_uv_offset;
	uniform float mixSrc_uv_radius;
	uniform vec2 mixSrc_uv_position;
	uniform vec2 mixSrc_uv_range;
	uniform bool mixSrc_uv_mixMap;
	uniform sampler2D mixSrc_uv_mixMap_src;
	uniform int mixSrc_uv_mixMap_ch;

	uniform bool mixSrc_color;
	uniform float mixSrc_color_factor;
	uniform float mixSrc_color_radius;
	uniform vec2 mixSrc_color_position;
	uniform vec2 mixSrc_color_range;
	uniform bool mixSrc_color_mixMap;
	uniform sampler2D mixSrc_color_mixMap_src;
	uniform int mixSrc_color_mixMap_ch;

	uniform bool mixSrc_alpha;
	uniform float mixSrc_alpha_factor;
	uniform float mixSrc_alpha_radius;
	uniform vec2 mixSrc_alpha_position;
	uniform vec2 mixSrc_alpha_range;
	uniform bool mixSrc_alpha_mixMap;
	uniform sampler2D mixSrc_alpha_mixMap_src;
	uniform int mixSrc_alpha_mixMap_ch;

#endif