#ifdef USF_USE_MIXDST

	varying vec2 vMixDstCoverUv;
	uniform sampler2D mixDst_src;
	uniform int mixDst_fit;
	
	uniform bool mixDst_uv;
	uniform int mixDst_uv_ch;
	uniform float mixDst_uv_factor;
	uniform vec2 mixDst_uv_offset;
	uniform float mixDst_uv_radius;
	uniform vec2 mixDst_uv_position;
	uniform vec2 mixDst_uv_range;
	uniform bool mixDst_uv_mixMap;
	uniform sampler2D mixDst_uv_mixMap_src;
	uniform int mixDst_uv_mixMap_ch;

	uniform bool mixDst_color;
	uniform float mixDst_color_factor;
	uniform float mixDst_color_radius;
	uniform vec2 mixDst_color_position;
	uniform vec2 mixDst_color_range;
	uniform bool mixDst_color_mixMap;
	uniform sampler2D mixDst_color_mixMap_src;
	uniform int mixDst_color_mixMap_ch;

	uniform bool mixDst_alpha;
	uniform float mixDst_alpha_factor;
	uniform float mixDst_alpha_radius;
	uniform vec2 mixDst_alpha_position;
	uniform vec2 mixDst_alpha_range;
	uniform bool mixDst_alpha_mixMap;
	uniform sampler2D mixDst_alpha_mixMap_src;
	uniform int mixDst_alpha_mixMap_ch;

#endif