import * as i from "three";
import { useState as O, useEffect as K, useCallback as h, useRef as E } from "react";
const R = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, N = (e, t = !1) => {
  const r = t ? e.width * t : e.width, a = t ? e.height * t : e.height, [n] = O(() => new i.Vector2(r, a));
  return n.set(r, a), n;
}, De = (e, t) => {
  const r = t, a = e / t, [n, o] = [r * a / 2, r / 2];
  return { width: n, height: o, near: -1e3, far: 1e3 };
}, we = (e, t = "OrthographicCamera") => {
  const r = N(e), { width: a, height: n, near: o, far: s } = De(
    r.x,
    r.y
  ), [c] = O(() => t === "OrthographicCamera" ? new i.OrthographicCamera(
    -a,
    a,
    n,
    -n,
    o,
    s
  ) : new i.PerspectiveCamera(50, a / n));
  return c instanceof i.OrthographicCamera ? (c.left = -a, c.right = a, c.top = n, c.bottom = -n, c.near = o, c.far = s, c.updateProjectionMatrix()) : c instanceof i.PerspectiveCamera && (c.aspect = a / n, c.updateProjectionMatrix()), c;
}, te = {
  depthBuffer: !1
}, de = ({
  gl: e,
  fbo: t,
  scene: r,
  camera: a,
  clear: n = !0,
  onBeforeRender: o,
  onSwap: s
}) => {
  if (!r || !a)
    return;
  const c = e.autoClear;
  e.autoClear = n, e.setRenderTarget(t), o(), e.render(r, a), s && s(), e.setRenderTarget(null), e.autoClear = c;
}, w = (e) => {
  const {
    scene: t,
    camera: r,
    size: a,
    dpr: n = !1,
    fboAutoSetSize: o = !1,
    depth: s = !1,
    ...c
  } = e, l = N(a, n), [u] = O(() => {
    const _ = new i.WebGLRenderTarget(l.x, l.y, {
      ...te,
      ...c
    });
    return s && (_.depthTexture = new i.DepthTexture(
      l.x,
      l.y,
      i.FloatType
    )), _;
  });
  o && u.setSize(l.x, l.y), K(() => {
    const _ = u;
    return () => {
      _ == null || _.dispose();
    };
  }, [u]);
  const v = h(
    (_, m) => {
      const x = u;
      return de({
        ..._,
        scene: _.scene || t,
        camera: _.camera || r,
        fbo: x,
        onBeforeRender: () => m == null ? void 0 : m({ read: x.texture })
      }), x.texture;
    },
    [t, r, u]
  );
  return [u, v];
}, he = (e) => {
  var _, m;
  const {
    scene: t,
    camera: r,
    size: a,
    dpr: n = !1,
    fboAutoSetSize: o = !1,
    depth: s = !1,
    ...c
  } = e, l = N(a, n), [u] = O(() => {
    const x = new i.WebGLRenderTarget(l.x, l.y, {
      ...te,
      ...c
    }), p = new i.WebGLRenderTarget(l.x, l.y, {
      ...te,
      ...c
    });
    return s && (x.depthTexture = new i.DepthTexture(
      l.x,
      l.y,
      i.FloatType
    ), p.depthTexture = new i.DepthTexture(
      l.x,
      l.y,
      i.FloatType
    )), {
      read: x,
      write: p,
      swap: function() {
        let f = this.read;
        this.read = this.write, this.write = f;
      }
    };
  });
  o && ((_ = u.read) == null || _.setSize(l.x, l.y), (m = u.write) == null || m.setSize(l.x, l.y)), K(() => {
    const x = u;
    return () => {
      var p, f;
      (p = x.read) == null || p.dispose(), (f = x.write) == null || f.dispose();
    };
  }, [u]);
  const v = h(
    (x, p) => {
      var g;
      const f = u;
      return de({
        ...x,
        scene: x.scene || t,
        camera: x.camera || r,
        fbo: f.write,
        onBeforeRender: () => p == null ? void 0 : p({
          read: f.read.texture,
          write: f.write.texture
        }),
        onSwap: () => f.swap()
      }), (g = f.read) == null ? void 0 : g.texture;
    },
    [t, r, u]
  );
  return [
    { read: u.read, write: u.write },
    v
  ];
}, be = (e, t, r, a) => {
  const [n] = O(() => new a(t, r));
  return K(() => (e && e.add(n), () => {
    e && e.remove(n), t.dispose(), r.dispose();
  }), [e, t, r, n]), n;
}, U = ({
  size: e,
  dpr: t,
  material: r,
  geometry: a = i.PlaneGeometry,
  geometrySize: n,
  ...o
}) => {
  const [s] = O(() => new i.Scene()), [c] = O(
    () => new a((n == null ? void 0 : n.width) || 2, (n == null ? void 0 : n.height) || 2)
  ), [l] = O(() => new r(o)), u = N(e, t);
  l.updateResolution(u.x, u.y), be(s, c, l, i.Mesh);
  const v = we(e);
  return {
    scene: s,
    material: l,
    camera: v
  };
}, Ce = (e) => {
  const t = E(e), r = h((a) => {
    t.current = typeof a == "function" ? a(t.current) : a;
  }, []);
  return [t, r];
}, Te = process.env.NODE_ENV === "development", S = new i.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  i.RGBAFormat
), Ee = "use-shader-fx", Oe = [
  "isColor",
  "isMatrix3",
  "isMatrix4",
  "isVector2",
  "isVector3",
  "isVector4",
  "isTexture",
  "isQuaternion",
  "isWebGLRenderTarget",
  "isEuler",
  "isBufferGeometry",
  "isMaterial",
  "isCamera",
  "isLight",
  "isObject3D",
  "isBone",
  "isVideoTexture"
], j = (e) => {
  Te && console.warn(`${Ee}: ${e}`);
}, re = {
  /*===============================================
  mixSrc
  ===============================================*/
  mixSrc: { value: !1 },
  mixSrc_src: { value: new i.Texture() },
  mixSrc_fit: { value: 0 },
  mixSrc_fitScale: { value: new i.Vector2(1, 1) },
  // uv
  mixSrc_uv: { value: !1 },
  mixSrc_uv_ch: { value: 0 },
  mixSrc_uv_factor: { value: 0 },
  mixSrc_uv_offset: { value: new i.Vector2(0, 0) },
  mixSrc_uv_radius: { value: 0.5 },
  mixSrc_uv_position: { value: new i.Vector2(0.5, 0.5) },
  mixSrc_uv_range: { value: new i.Vector2(0, 1) },
  mixSrc_uv_mixMap: { value: !1 },
  mixSrc_uv_mixMap_src: { value: S },
  mixSrc_uv_mixMap_ch: { value: 0 },
  // color
  mixSrc_color: { value: !1 },
  mixSrc_color_factor: { value: 0 },
  mixSrc_color_radius: { value: 0.5 },
  mixSrc_color_position: { value: new i.Vector2(0.5, 0.5) },
  mixSrc_color_range: { value: new i.Vector2(0, 1) },
  mixSrc_color_mixMap: { value: !1 },
  mixSrc_color_mixMap_src: { value: S },
  mixSrc_color_mixMap_ch: { value: 0 },
  // alpha
  mixSrc_alpha: { value: !1 },
  mixSrc_alpha_factor: { value: 0 },
  mixSrc_alpha_radius: { value: 0.5 },
  mixSrc_alpha_position: { value: new i.Vector2(0.5, 0.5) },
  mixSrc_alpha_range: { value: new i.Vector2(0, 1) },
  mixSrc_alpha_mixMap: { value: !1 },
  mixSrc_alpha_mixMap_src: { value: S },
  mixSrc_alpha_mixMap_ch: { value: 0 },
  /*===============================================
  mixDst
  ===============================================*/
  mixDst: { value: !1 },
  mixDst_src: { value: new i.Texture() },
  mixDst_fit: { value: 0 },
  mixDst_fitScale: { value: new i.Vector2(1, 1) },
  // uv
  mixDst_uv: { value: !1 },
  mixDst_uv_ch: { value: 0 },
  mixDst_uv_factor: { value: 0 },
  mixDst_uv_offset: { value: new i.Vector2(0, 0) },
  mixDst_uv_radius: { value: 0.5 },
  mixDst_uv_position: { value: new i.Vector2(0.5, 0.5) },
  mixDst_uv_range: { value: new i.Vector2(0, 1) },
  mixDst_uv_mixMap: { value: !1 },
  mixDst_uv_mixMap_src: { value: S },
  mixDst_uv_mixMap_ch: { value: 0 },
  // color
  mixDst_color: { value: !1 },
  mixDst_color_factor: { value: 0 },
  mixDst_color_radius: { value: 0.5 },
  mixDst_color_position: { value: new i.Vector2(0.5, 0.5) },
  mixDst_color_range: { value: new i.Vector2(0, 1) },
  mixDst_color_mixMap: { value: !1 },
  mixDst_color_mixMap_src: { value: S },
  mixDst_color_mixMap_ch: { value: 0 },
  // alpha
  mixDst_alpha: { value: !1 },
  mixDst_alpha_factor: { value: 0 },
  mixDst_alpha_radius: { value: 0.5 },
  mixDst_alpha_position: { value: new i.Vector2(0.5, 0.5) },
  mixDst_alpha_range: { value: new i.Vector2(0, 1) },
  mixDst_alpha_mixMap: { value: !1 },
  mixDst_alpha_mixMap_src: { value: S },
  mixDst_alpha_mixMap_ch: { value: 0 },
  /*===============================================
  adjustments
  ===============================================*/
  // levels
  levels: { value: !1 },
  levels_shadows: { value: new i.Vector4(0, 0, 0, 0) },
  levels_midtones: { value: new i.Vector4(1, 1, 1, 1) },
  levels_highlights: { value: new i.Vector4(1, 1, 1, 1) },
  levels_outputMin: { value: new i.Vector4(0, 0, 0, 0) },
  levels_outputMax: { value: new i.Vector4(1, 1, 1, 1) },
  // contrast
  contrast: { value: !1 },
  contrast_factor: { value: new i.Vector4(1, 1, 1, 1) },
  // colorBalance
  colorBalance: { value: !1 },
  colorBalance_factor: { value: new i.Vector3(1, 1, 1) },
  // hsv
  hsv: { value: !1 },
  hsv_hueShift: { value: 0 },
  hsv_saturation: { value: 1 },
  hsv_brightness: { value: 1 },
  // posterize
  posterize: { value: !1 },
  posterize_levels: { value: new i.Vector4(0, 0, 0, 0) },
  // grayscale
  grayscale: { value: !1 },
  grayscale_weight: { value: new i.Vector3(0, 0, 0) },
  grayscale_duotone: { value: !1 },
  grayscale_duotone_color0: { value: new i.Color(0) },
  grayscale_duotone_color1: { value: new i.Color(16777215) },
  grayscale_threshold: { value: -1 }
};
function Ve(e) {
  const {
    mixSrc: t,
    mixDst: r,
    srcSystem: a,
    levels: n,
    contrast: o,
    colorBalance: s,
    hsv: c,
    posterize: l,
    grayscale: u
  } = e;
  return {
    USF_USE_SRC_SYSTEM: a,
    USF_USE_MIXSRC: t,
    USF_USE_MIXDST: r,
    USF_USE_LEVELS: n,
    USF_USE_CONTRAST: o,
    USF_USE_COLORBALANCE: s,
    USF_USE_HSV: c,
    USF_USE_POSTERIZE: l,
    USF_USE_GRAYSCALE: u
  };
}
function ue(e) {
  const t = !!e.mixSrc.value, r = !!e.mixDst.value;
  return {
    mixSrc: t,
    mixDst: r,
    srcSystem: t || r,
    levels: !!e.levels.value,
    contrast: !!e.contrast.value,
    colorBalance: !!e.colorBalance.value,
    hsv: !!e.hsv.value,
    posterize: !!e.posterize.value,
    grayscale: !!e.grayscale.value
  };
}
var Pe = "#usf <plane_vertex>", Ie = "#usf <default_vertex>", Be = "#usf <default_pars_vertex>", Re = "#usf <default_pars_fragment>", Le = `#usf <mixSrc_vertex>
#usf <mixDst_vertex>`, Ae = `#usf <srcSystem_pars_vertex>
#usf <mixSrc_pars_vertex>
#usf <mixDst_pars_vertex>`, $e = `#usf <mixSrc_pars_fragment>
#usf <mixDst_pars_fragment>
#usf <srcSystem_pars_fragment>
#usf <adjustments_pars_fragment>`, ke = "#usf <mixSrc_fragment_begin>", je = `#usf <mixSrc_fragment_end>
#usf <mixDst_fragment>
#usf <adjustments_fragment>`, ze = "#usf <texture_vertex>", Ke = "#usf <texture_pars_vertex>", Ne = "#usf <texture_pars_fragment>";
const d = Object.freeze({
  plane_vertex: Pe,
  default_vertex: Ie,
  default_pars_vertex: Be,
  default_pars_fragment: Re,
  basicFx_vertex: Le,
  basicFx_pars_vertex: Ae,
  basicFx_pars_fragment: $e,
  basicFx_fragment_begin: ke,
  basicFx_fragment_end: je,
  samplingFx_vertex: ze,
  samplingFx_pars_vertex: Ke,
  samplingFx_pars_fragment: Ne
}), Xe = `
	void main() {
		${d.plane_vertex}
	}
`, qe = `
	precision highp int;

	uniform float tick;
	uniform float timeStrength;
	uniform int noiseOctaves;
	uniform int fbmOctaves;
	uniform int warpOctaves;
	uniform vec2 warpDirection;
	uniform float warpStrength;
	uniform float scale;
	uniform float timeOffset;

	const float per  = 0.5;
	const float PI   = 3.14159265359;

	float rnd(vec2 n) {
		float a = 0.129898;
		float b = 0.78233;
		float c = 437.585453;
		float dt= dot(n ,vec2(a, b));
		float sn= mod(dt, PI);
		return fract(sin(sn) * c);
	}

	float interpolate(float a, float b, float x){
		float f = (1.0 - cos(x * PI)) * 0.5;
		return a * (1.0 - f) + b * f;
	}

	float irnd(vec2 p){
		vec2 i = floor(p);
		vec2 f = fract(p);
		vec4 v = vec4(rnd(vec2(i.x,i.y)),rnd(vec2(i.x + 1.0,i.y)),rnd(vec2(i.x,i.y + 1.0)),rnd(vec2(i.x + 1.0, i.y + 1.0)));
		return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
	}

	// Based on The Book of Shaders
	// https://thebookofshaders.com/13/
	float noise(vec2 p, float time){
		float _time = time + timeOffset;
		float t = 0.0;
		for(int i = 0; i < noiseOctaves; i++){
			float freq = pow(2.0, float(i));
			float amp  = pow(per, float(noiseOctaves - i));
			t += irnd(vec2(p.y / freq + _time, p.x / freq + _time)) * amp;
		}
		return t;
	}

	float fbm(vec2 x, float time) {
		float v = 0.0;
		float a = 0.5;
		vec2 shift = vec2(100);
		mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
		float sign = 1.0;
		for (int i = 0; i < fbmOctaves; ++i) {
			v += a * noise(x, time * sign);
			x = rot * x * 2.0 + shift;
			a *= 0.5;
			sign *= -1.0;
		}
		return v;
	}

	float warp(vec2 x, float g,float time){
		float val = 0.0;
		for (int i = 0; i < warpOctaves; i++){
			val = fbm(x + g * vec2(cos(warpDirection.x * val), sin(warpDirection.y * val)), time);
		}
		return val;
	}

	void main() {

		vec2 usf_Uv = gl_FragCoord.xy * scale;

		${d.basicFx_fragment_begin}

		float noise = warp(usf_Uv ,warpStrength,tick * timeStrength);

		vec4 usf_FragColor = vec4(noise);

		${d.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;
var Ge = "gl_Position = vec4(position, 1.0);", He = `#ifdef USF_USE_SRC_SYSTEM

	#usf <calcSrcUv>

#endif`, Qe = `#ifdef USF_USE_SRC_SYSTEM

	#usf <calcSrcUv>

	float calcMixCirclePower(vec2 center, float radius, vec2 range)
	{
		vec2 adjustedUV = (vUv - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
		vec2 adjustedCenter = (center - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
		
		float dist = length(adjustedUV - adjustedCenter);
		float power = radius > 0.0 ? 1.0 - dist / radius : 1.0;
		return smoothstep(range.x,range.y,power);
	}

	float calcMixMapPower(sampler2D map,vec2 range, int ch)
	{
		return smoothstep(range.x,range.y, texture2D(map, vUv)[ch]);
	}

	vec4 fitTexture(sampler2D src , vec2 uv, int fitType)
	{
		
		float a = fitType == 2 ? step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0) : 1.;
		return mix(vec4(0.), texture2D(src, uv), a);
	}

#endif`, Ye = "vUv = uv;", We = `precision highp float;

varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 texelSize;
uniform float aspectRatio;
uniform vec2 maxAspect;`, Ze = `precision highp float;

varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 texelSize;
uniform float aspectRatio;
uniform vec2 maxAspect;
uniform int renderCount;`, Je = `#ifdef USF_USE_MIXSRC
	varying vec2 vMixSrcCoverUv;
	uniform vec2 mixSrc_fitScale;
#endif`, et = `#ifdef USF_USE_MIXSRC			
	vMixSrcCoverUv = calcSrcUv(vUv, mixSrc_fitScale);	
#endif`, tt = `#ifdef USF_USE_MIXSRC
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

#endif`, rt = `#ifdef USF_USE_MIXSRC

	vec4 mixSrcColor = fitTexture(mixSrc_src, vMixSrcCoverUv, mixSrc_fit);

	usf_Uv += mixSrc_uv 
		? (mixSrc_uv_offset + (vec2(mixSrcColor[mixSrc_uv_ch]) * 2. - 1.)) * 
			(mixSrc_uv_mixMap 
				? calcMixMapPower(mixSrc_uv_mixMap_src,mixSrc_uv_range,mixSrc_uv_mixMap_ch)
				: calcMixCirclePower(mixSrc_uv_position,mixSrc_uv_radius,mixSrc_uv_range)) * mixSrc_uv_factor
		: vec2(0.);

#endif`, at = `#ifdef USF_USE_MIXSRC
	
	usf_FragColor = mixSrc_color 
		? mix(usf_FragColor, mixSrcColor,
			(mixSrc_color_mixMap
				? calcMixMapPower(mixSrc_color_mixMap_src,mixSrc_color_range,mixSrc_color_mixMap_ch)
				: calcMixCirclePower(mixSrc_color_position,mixSrc_color_radius,mixSrc_color_range)) * mixSrc_color_factor) 
		: usf_FragColor;
	
	
	usf_FragColor = mixSrc_alpha 
		? mix(usf_FragColor, mixSrcColor, 
			(mixSrc_alpha_mixMap
				? calcMixMapPower(mixSrc_alpha_mixMap_src,mixSrc_alpha_range,mixSrc_alpha_mixMap_ch)
				: calcMixCirclePower(mixSrc_alpha_position,mixSrc_alpha_radius,mixSrc_alpha_range)) * mixSrc_alpha_factor * mixSrcColor.a)
		: usf_FragColor;

#endif`, nt = `#ifdef USF_USE_MIXDST
	varying vec2 vMixDstCoverUv;
	uniform vec2 mixDst_fitScale;
#endif`, st = `#ifdef USF_USE_MIXDST		
	vMixDstCoverUv = calcSrcUv(vUv, mixDst_fitScale);	
#endif`, it = `#ifdef USF_USE_MIXDST

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

#endif`, ot = `#ifdef USF_USE_MIXDST

	
	vec2 mixedUv = vMixDstCoverUv;
	mixedUv += mixDst_uv 
		? (mixDst_uv_offset + (vec2(usf_FragColor[mixDst_uv_ch]) * 2. - 1.)) * 
			(mixDst_uv_mixMap 
				? calcMixMapPower(mixDst_uv_mixMap_src,mixDst_uv_range,mixDst_uv_mixMap_ch)
				: calcMixCirclePower(mixDst_uv_position,mixDst_uv_radius,mixDst_uv_range)) * mixDst_uv_factor
		: vec2(0.);
	vec4 mixDstColor = fitTexture(mixDst_src, mixedUv , mixDst_fit);

	
	usf_FragColor = mixDst_color 
		? mix(usf_FragColor, mixDstColor,
			(mixDst_color_mixMap
				? calcMixMapPower(mixDst_color_mixMap_src,mixDst_color_range,mixDst_color_mixMap_ch)
				: calcMixCirclePower(mixDst_color_position,mixDst_color_radius,mixDst_color_range)) * mixDst_color_factor) 
		: usf_FragColor;

	
	usf_FragColor = mixDst_alpha 
		? mix(usf_FragColor, mixDstColor, 
			(mixDst_alpha_mixMap
				? calcMixMapPower(mixDst_alpha_mixMap_src,mixDst_alpha_range,mixDst_alpha_mixMap_ch)
				: calcMixCirclePower(mixDst_alpha_position,mixDst_alpha_radius,mixDst_alpha_range)) * mixDst_alpha_factor * mixDstColor.a)
		: usf_FragColor;

#endif`, ct = `#ifdef USF_USE_TEXTURE		
	vTextureCoverUv = calcSrcUv(vUv, texture_fitScale);
#endif`, lt = `#ifdef USF_USE_TEXTURE
	varying vec2 vTextureCoverUv;
	uniform vec2 texture_fitScale;
#endif`, ut = `#ifdef USF_USE_TEXTURE	
	varying vec2 vTextureCoverUv;
	uniform sampler2D texture_src;
	uniform int texture_fit;
	uniform vec2 texture_fitScale;
#endif`, ft = `#ifdef USF_USE_LEVELS
	usf_FragColor = (usf_FragColor - vec4(levels_shadows)) / (vec4(levels_highlights) - vec4(levels_shadows));
	usf_FragColor = pow(usf_FragColor, vec4(1.0 / levels_midtones));
	usf_FragColor = usf_FragColor * (vec4(levels_outputMax) - vec4(levels_outputMin)) + vec4(levels_outputMin);
#endif

#ifdef USF_USE_CONTRAST
	usf_FragColor = clamp(((usf_FragColor-.5)*contrast_factor)+.5, 0., 1.);
#endif

#ifdef USF_USE_COLORBALANCE
	usf_FragColor.rgb = clamp(usf_FragColor.rgb * colorBalance_factor, 0., 1.);
#endif

#ifdef USF_USE_HSV
	vec3 hsv = rgb2hsv(usf_FragColor.rgb);
	hsv.x = fract(hsv.x + hsv_hueShift);
	hsv.y = clamp(hsv.y * hsv_saturation, 0.0, 1.0);
	hsv.z = clamp(hsv.z * hsv_brightness, 0.0, 1.0);
	usf_FragColor.rgb = hsv2rgb(hsv);
#endif

#ifdef USF_USE_POSTERIZE
	usf_FragColor = posterize(usf_FragColor, posterize_levels);
#endif

#ifdef USF_USE_GRAYSCALE
	float grayscale = dot(usf_FragColor.rgb, vec3(0.299 + grayscale_weight.r, 0.587 + grayscale_weight.g, 0.114 + grayscale_weight.b));
	grayscale = grayscale_threshold > 0.0 ? step(grayscale_threshold, grayscale) : grayscale;
	vec3 duotoneColor = mix(grayscale_duotone_color0, grayscale_duotone_color1, grayscale);
	usf_FragColor.rgb = grayscale_duotone ? duotoneColor : vec3(grayscale);
#endif`, _t = `#ifdef USF_USE_LEVELS
	uniform vec4 levels_shadows;
	uniform vec4 levels_midtones;
	uniform vec4 levels_highlights;
	uniform vec4 levels_outputMin;
	uniform vec4 levels_outputMax;
#endif

#ifdef USF_USE_CONTRAST
	uniform vec4 contrast_factor;
#endif

#ifdef USF_USE_COLORBALANCE
	uniform vec3 colorBalance_factor;
#endif

#ifdef USF_USE_HSV
	uniform float hsv_hueShift;
	uniform float hsv_saturation;
	uniform float hsv_brightness;
	vec3 hsv2rgb(vec3 c)
	{
		vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
	}
	vec3 rgb2hsv(vec3 c)
	{
		vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
		vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
		vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

		float d = q.x - min(q.w, q.y);
		float e = 1.0e-10;
		return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
	}
#endif

#ifdef USF_USE_POSTERIZE
	uniform vec4 posterize_levels;
	vec4 posterize(vec4 color, vec4 levels) 
	{
		return vec4(
			levels.x > 1. ? floor(color.r * levels.x) / levels.x : color.r,
			levels.y > 1. ? floor(color.g * levels.y) / levels.y : color.g,
			levels.z > 1. ? floor(color.b * levels.z) / levels.z : color.b,
			levels.w > 1. ? floor(color.a * levels.w) / levels.w : color.a
		);
	}
#endif

#ifdef USF_USE_GRAYSCALE
	uniform vec3 grayscale_weight;
	uniform bool grayscale_duotone;
	uniform vec3 grayscale_duotone_color0;
	uniform vec3 grayscale_duotone_color1;
	uniform float grayscale_threshold;
#endif`, vt = `vec2 calcSrcUv(vec2 uv, vec2 fitScale) {
	return uv * fitScale + (1.0 - fitScale) * .5;
}`;
const mt = Object.freeze({
  plane_vertex: Ge,
  srcSystem_pars_vertex: He,
  srcSystem_pars_fragment: Qe,
  default_vertex: Ye,
  default_pars_vertex: We,
  default_pars_fragment: Ze,
  mixSrc_vertex: et,
  mixSrc_pars_vertex: Je,
  mixSrc_pars_fragment: tt,
  mixSrc_fragment_begin: rt,
  mixSrc_fragment_end: at,
  mixDst_pars_vertex: nt,
  mixDst_vertex: st,
  mixDst_pars_fragment: it,
  mixDst_fragment: ot,
  texture_vertex: ct,
  texture_pars_vertex: lt,
  texture_pars_fragment: ut,
  adjustments_fragment: ft,
  adjustments_pars_fragment: _t,
  calcSrcUv: vt
});
function P(e) {
  return e.filter((t) => t !== "").join(`
`);
}
function ne(e, t, r) {
  let a, n;
  const o = {
    default: {
      vertexPars: d.default_pars_vertex,
      vertexMain: d.default_vertex,
      fragmentPars: d.default_pars_fragment
    },
    basicFx: {
      vertexPars: d.basicFx_pars_vertex,
      vertexMain: d.basicFx_vertex,
      fragmentPars: d.basicFx_pars_fragment
    },
    samplingFx: {
      vertexPars: P([
        d.basicFx_pars_vertex,
        d.samplingFx_pars_vertex
      ]),
      vertexMain: P([
        d.basicFx_vertex,
        d.samplingFx_vertex
      ]),
      fragmentPars: P([
        d.basicFx_pars_fragment,
        d.samplingFx_pars_fragment
      ])
    }
  }, s = o[r].vertexPars, c = o[r].vertexMain, l = o[r].fragmentPars;
  return e && (a = P([s, e]), a = a.replace(
    /void\s+main\s*\(\)\s*\{/,
    `void main() {
${c}`
  )), t && (n = P([l, t])), [a, n];
}
const pt = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function xt(e, t) {
  return ae(mt[t] || "");
}
function ae(e) {
  return e.replace(pt, xt);
}
function dt(e) {
  return e && Oe.some((t) => e[t] === !0);
}
function ht(e) {
  const t = {}, r = (a, n = "") => {
    for (const [o, s] of Object.entries(a)) {
      const c = n ? `${n}_${o}` : o;
      s && typeof s == "object" && !Array.isArray(s) && !dt(s) ? (t[c] = !0, r(s, c)) : (t.hasOwnProperty(c) && j(`${c} already exists and will be overwritten.`), t[c] = s);
    }
  };
  return r(e), t;
}
class b extends i.ShaderMaterial {
  constructor({
    uniformValues: t,
    materialParameters: r = {},
    uniforms: a,
    vertexShader: n,
    fragmentShader: o
  } = {}) {
    super(r), this.uniforms = {
      resolution: { value: new i.Vector2() },
      texelSize: { value: new i.Vector2() },
      aspectRatio: { value: 0 },
      maxAspect: { value: new i.Vector2() },
      // 一部のFXでiterationをカウントする必要があるため
      renderCount: { value: 0 },
      ...a
    }, this._setupShaders(n, o), this.setUniformValues(t), this._defineUniformAccessors();
  }
  /** This is updated in useFxScene */
  updateResolution(t, r) {
    const a = Math.max(t, r);
    this.uniforms.resolution.value.set(t, r), this.uniforms.texelSize.value.set(1 / t, 1 / r), this.uniforms.aspectRatio.value = t / r, this.uniforms.maxAspect.value.set(a / t, a / r);
  }
  _setupShaders(t, r) {
    if (!t && !r)
      return;
    const [a, n] = ne(
      t,
      r,
      "default"
    );
    this.vertexShader = a ? ae(a) : this.vertexShader, this.fragmentShader = n ? ae(n) : this.fragmentShader;
  }
  setUniformValues(t) {
    if (t === void 0)
      return;
    const r = ht(t);
    for (const [a, n] of Object.entries(r)) {
      if (n === void 0) {
        j(`parameter '${a}' has value of undefined.`);
        continue;
      }
      const o = this.uniforms[a];
      if (o === void 0) {
        j(`'${a}' is not a uniform property of ${this.type}.`);
        continue;
      }
      o.value = n;
    }
    return r;
  }
  /** define getter/setters　*/
  _defineUniformAccessors(t) {
    for (const r of Object.keys(this.uniforms)) {
      if (this.hasOwnProperty(r)) {
        j(`'${r}' is already defined in ${this.type}.`);
        continue;
      }
      Object.defineProperty(this, r, {
        get: () => this.uniforms[r].value,
        set: (a) => {
          this.uniforms[r].value = a, t == null || t();
        }
      });
    }
  }
}
b.key = i.MathUtils.generateUUID();
class se extends b {
  constructor({
    uniforms: t,
    vertexShader: r,
    fragmentShader: a,
    ...n
  } = {}) {
    var o;
    super({
      ...n,
      uniforms: {
        ...i.UniformsUtils.clone(re),
        ...t
      }
    }), this.defines = {
      ...(o = n == null ? void 0 : n.materialParameters) == null ? void 0 : o.defines
    }, this.programCache = 0, this.fxKey = this._setupFxKey(this.uniforms), this._setupFxShaders(r, a);
  }
  _setupFxShaders(t, r) {
    if (!t && !r)
      return;
    this._updateFxDefines();
    const [a, n] = this._handleMergeShaderLib(
      t,
      r
    );
    super._setupShaders(a, n);
  }
  /** SamplingFxMaterialで継承するため、handlerとして独立させる */
  _handleMergeShaderLib(t, r) {
    return ne(t, r, "basicFx");
  }
  _updateFxShaders() {
    if (!this.fxKey)
      return;
    const t = this.programCache, { diffCount: r, newFxKey: a } = this._handleUpdateFxShaders();
    this.programCache += r, this.fxKey = a, t !== this.programCache && (this._updateFxDefines(), this.needsUpdate = !0);
  }
  /** SamplingFxMaterialで継承するため、handlerとして独立させる */
  _handleUpdateFxShaders() {
    const t = ue(this.uniforms);
    return {
      diffCount: Object.keys(t).filter((a) => this.fxKey[a] !== t[a]).length,
      newFxKey: t
    };
  }
  _updateFxDefines() {
    Object.assign(this.defines, this._handleUpdateFxDefines());
  }
  /** SamplingFxMaterialで継承するため、handlerとして独立させる */
  _handleUpdateFxDefines() {
    return Ve(this.fxKey);
  }
  _isContainsBasicFxValues(t, r) {
    return t ? Object.keys(t).some(
      (a) => Object.keys(r ?? re).includes(a)
    ) : !1;
  }
  _setupFxKey(t) {
    return ue(t);
  }
  /*===============================================
  Fit Scale
  ===============================================*/
  _calcFitScale(t, r) {
    var c;
    let a = 1;
    const n = new i.Vector2(1, 1), o = this.uniforms.aspectRatio.value, s = (c = t == null ? void 0 : t.source) == null ? void 0 : c.data;
    return s != null && s.width && (s != null && s.height) ? a = s.width / s.height : a = o, r === 1 ? n.set(
      Math.min(o / a, 1),
      Math.min(a / o, 1)
    ) : r === 2 && n.set(
      Math.max(o / a, 1),
      Math.max(a / o, 1)
    ), n;
  }
  _setFitScale(t) {
    const r = this.uniforms;
    r[`${t}_fitScale`].value = this._calcFitScale(
      r[`${t}_src`].value,
      r[`${t}_fit`].value
    );
  }
  _updateFitScale() {
    var t, r;
    (t = this.fxKey) != null && t.mixSrc && this._setFitScale("mixSrc"), (r = this.fxKey) != null && r.mixDst && this._setFitScale("mixDst");
  }
  /*===============================================
  super FxMaterial
  ===============================================*/
  /**
   * @param needsUpdate default : `true`
   */
  setUniformValues(t, r = !0) {
    const a = super.setUniformValues(t);
    return r && this._isContainsBasicFxValues(a) && (this._updateFxShaders(), this._updateFitScale()), a;
  }
  _defineUniformAccessors(t) {
    super._defineUniformAccessors(() => {
      this._updateFxShaders(), this._updateFitScale(), t == null || t();
    });
  }
  updateResolution(t, r) {
    super.updateResolution(t, r), this._updateFitScale();
  }
}
const ge = class Se extends se {
  constructor(t = {}) {
    super({
      ...t,
      vertexShader: Xe,
      fragmentShader: qe,
      uniforms: {
        tick: { value: 0 },
        scale: { value: 0.03 },
        timeStrength: { value: 0.3 },
        noiseOctaves: { value: 2 },
        fbmOctaves: { value: 2 },
        warpOctaves: { value: 2 },
        warpDirection: { value: new i.Vector2(2, 2) },
        warpStrength: { value: 8 },
        timeOffset: { value: 0 }
      }
    }), this.type = Se.type;
  }
  static get type() {
    return "NoiseMaterial";
  }
};
ge.key = i.MathUtils.generateUUID();
let gt = ge;
const fe = `
	uniform bool bounce;
	varying vec2 vL;
	varying vec2 vR;
	varying vec2 vT;
	varying vec2 vB;
`, ee = (e = !0) => `
		vec3 pos = position;
		vec2 scale = ${e ? "bounce ? vec2(1.,1.) : 1.-texelSize*2." : "1.-texelSize*2."};
		pos.xy = pos.xy * scale;
		vUv = vec2(.5)+(pos.xy)*.5;
	`, _e = (e) => `
		vL = vUv - vec2(texelSize.x * ${e}, 0.0);
		vR = vUv + vec2(texelSize.x * ${e}, 0.0);
		vT = vUv + vec2(0.0, texelSize.y * ${e});
		vB = vUv - vec2(0.0, texelSize.y * ${e});
	`, St = {
  main: `
		${fe}

		void main(){
		
			${ee()}
			${_e("1.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
  poisson: `
		${fe}
		
		void main(){

			${ee()}
			${_e("2.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
  advection: `
		void main(){
			${ee(!1)}
			gl_Position = vec4(pos, 1.0);
		}
	`,
  splat: `
		uniform vec2 center;
		uniform vec2 scale;
		void main(){		
			vec2 pos = position.xy * scale * 2.0 * texelSize + center;
			gl_Position = vec4(pos, 0.0, 1.0);
		}
	`
}, A = St;
var yt = `uniform float deltaTime;
uniform sampler2D velocity;
uniform float dissipation;

void main(){
	vec2 vel = texture2D(velocity, vUv).xy;
	vec2 uv2 = vUv - vel * deltaTime * maxAspect;
	vec2 newVel = texture2D(velocity, uv2).xy;
	gl_FragColor = vec4(dissipation * newVel, 0.0, 0.0);
}`;
class X extends b {
  constructor(t) {
    super({
      ...t,
      vertexShader: A.advection,
      fragmentShader: yt,
      uniforms: {
        dissipation: { value: 0.99 },
        velocity: { value: S },
        deltaTime: { value: W }
      }
    }), this.type = X.type;
  }
  static get type() {
    return "AdvectionMaterial";
  }
}
var Ft = `uniform float deltaTime;
uniform sampler2D velocity;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){
    float L = texture2D(velocity, vL).r;
    float R = texture2D(velocity, vR).r;
    float B = texture2D(velocity, vB).g;
    float T = texture2D(velocity, vT).g;
	 
    float divergence = (R-L + T-B) / 2.0;
    gl_FragColor = vec4(divergence / deltaTime);
}`;
class q extends b {
  constructor(t) {
    super({
      ...t,
      vertexShader: A.main,
      fragmentShader: Ft,
      uniforms: {
        bounce: { value: !0 },
        velocity: { value: S },
        deltaTime: { value: W }
      }
    }), this.type = q.type;
  }
  static get type() {
    return "DivergenceMaterial";
  }
}
var Mt = `uniform float deltaTime;
uniform sampler2D pressure;
uniform sampler2D velocity;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){

	float L = texture2D(pressure, vL).r;
	float R = texture2D(pressure, vR).r;
	float B = texture2D(pressure, vB).r;
	float T = texture2D(pressure, vT).r;

	vec2 v = texture2D(velocity, vUv).xy;
	vec2 gradP = vec2(R - L, T - B) * 0.5;
	v = v - gradP * deltaTime;

	gl_FragColor = vec4(v, 0.0, 1.0);

}`;
class G extends b {
  constructor(t) {
    super({
      ...t,
      vertexShader: A.main,
      fragmentShader: Mt,
      uniforms: {
        bounce: { value: !0 },
        deltaTime: { value: W },
        pressure: { value: S },
        velocity: { value: S }
      }
    }), this.type = G.type;
  }
  static get type() {
    return "PressureMaterial";
  }
}
var Ut = `uniform sampler2D pressure;
uniform sampler2D divergence;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){    

	float L = texture2D(pressure, vL).r;
	float R = texture2D(pressure, vR).r;
	float B = texture2D(pressure, vB).r;
	float T = texture2D(pressure, vT).r;

	float div = texture2D(divergence, vUv).r;
	
	float newP = (L + R + B + T) / 4.0 - div;

	gl_FragColor = vec4(newP);
}`;
class H extends b {
  constructor({ customParameters: t, ...r }) {
    super({
      ...r,
      vertexShader: A.poisson,
      fragmentShader: Ut,
      uniforms: {
        bounce: { value: !0 },
        pressure: { value: S },
        divergence: { value: S }
      }
    }), this.iterations = (t == null ? void 0 : t.iterations) ?? 32, this.type = H.type;
  }
  static get type() {
    return "PoissonMaterial";
  }
}
var Dt = `uniform vec2 force;

void main(){
	gl_FragColor = vec4(force * pow(1.0 - clamp(2.0 * distance(vUv, vec2(0.5)), 0.0, 1.0), 2.0), 0.0, 1.0);
}`;
class Q extends b {
  constructor({ customParameters: t, ...r }) {
    super({
      ...r,
      vertexShader: A.splat,
      fragmentShader: Dt,
      uniforms: {
        force: { value: new i.Vector2(0, 0) },
        center: { value: new i.Vector2(0, 0) },
        scale: { value: new i.Vector2(50, 50) }
      }
    }), this.type = Q.type, this.forceBias = (t == null ? void 0 : t.forceBias) ?? 20, this.blending = i.AdditiveBlending;
  }
  static get type() {
    return "SplatMaterial";
  }
}
class Y extends se {
  constructor(t = {}) {
    super({
      ...t,
      vertexShader: `
				void main() {
					${d.plane_vertex}
				}
			`,
      fragmentShader: `
				uniform sampler2D src;
				void main() {
					vec2 usf_Uv = vUv;
					
					${d.basicFx_fragment_begin}

					vec4 usf_FragColor = vec4(length(texture2D(src,usf_Uv).rg));

					${d.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`,
      uniforms: {
        src: { value: S }
      }
    }), this.type = Y.type;
  }
  static get type() {
    return "OutputMaterial";
  }
}
const W = 8e-3, $t = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AdvectionMaterial: X,
  DELTA_TIME: W,
  DivergenceMaterial: q,
  OutputMaterial: Y,
  PoissonMaterial: H,
  PressureMaterial: G,
  SplatMaterial: Q
}, Symbol.toStringTag, { value: "Module" })), ve = {
  texture: { value: !0 },
  texture_src: { value: S },
  texture_fit: { value: 0 },
  texture_fitScale: { value: new i.Vector2(1, 1) }
};
class ye extends se {
  constructor({ uniforms: t, ...r }) {
    super({
      ...r,
      uniforms: {
        ...i.UniformsUtils.clone(ve),
        ...t
      }
    });
  }
  _handleMergeShaderLib(t, r) {
    return ne(t, r, "samplingFx");
  }
  _isContainsBasicFxValues(t) {
    return super._isContainsBasicFxValues(t, {
      ...re,
      ...ve
    });
  }
  _updateFitScale() {
    super._updateFitScale(), this._setFitScale("texture");
  }
  _setupFxKey(t) {
    const r = super._setupFxKey(t);
    return r.srcSystem = !0, r;
  }
  _handleUpdateFxShaders() {
    const { diffCount: t, newFxKey: r } = super._handleUpdateFxShaders();
    return r.srcSystem = !0, {
      diffCount: t,
      newFxKey: r
    };
  }
  _handleUpdateFxDefines() {
    return Object.assign(super._handleUpdateFxDefines(), {
      USF_USE_TEXTURE: !0
    });
  }
}
const Fe = class Me extends ye {
  constructor(t = {}) {
    super({
      ...t,
      vertexShader: `
				void main() {
					${d.plane_vertex}
				}
			`,
      fragmentShader: `
				void main() {
					vec2 usf_Uv = vTextureCoverUv;

					${d.basicFx_fragment_begin}

					vec4 usf_FragColor = fitTexture(texture_src,usf_Uv,texture_fit);

					${d.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`
    }), this.type = Me.type;
  }
  static get type() {
    return "BufferMaterial";
  }
};
Fe.key = i.MathUtils.generateUUID();
let wt = Fe;
class ie extends b {
  static get type() {
    return "RawBlankMaterial";
  }
  constructor(t) {
    super(t), this.type = ie.type;
  }
}
const me = `
	uniform float time;
	uniform vec2 pointer;
	uniform sampler2D backbuffer;
`;
class oe extends b {
  constructor({
    vertexShader: t,
    fragmentShader: r,
    uniforms: a,
    ...n
  }) {
    super({
      ...n,
      vertexShader: t && P([me, t]),
      fragmentShader: r && P([me, r]),
      uniforms: {
        time: { value: 0 },
        pointer: { value: new i.Vector2() },
        backbuffer: { value: new i.Texture() },
        ...a
      }
    }), this.type = oe.type;
  }
  static get type() {
    return "BlankMaterial";
  }
}
const bt = `
	void main() {
		${d.plane_vertex}
	}
`, Ct = `
	uniform vec2 count;
	uniform bool autoScale;
	uniform float tick;
	uniform bool shuffle;
	uniform float shuffle_frequency;
	uniform float shuffle_range;

	uniform bool sprite;
	uniform sampler2D sprite_src;
	uniform float sprite_length;
	uniform float sprite_shuffleSpeed;

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
	}

	vec2 shuffleIndex(vec2 cellIndex , vec2 count) {

		float discreteTime = floor(tick * shuffle_frequency);

		float r1 = hash(cellIndex + vec2(0.123, discreteTime));
		float r2 = hash(cellIndex + vec2(0.789, discreteTime));

		// -range ~ +range
		float offsetX = floor(r1 * (shuffle_range * 2.0 + 1.0)) - shuffle_range;
		float offsetY = floor(r2 * (shuffle_range * 2.0 + 1.0)) - shuffle_range;
		vec2 offset = vec2(offsetX, offsetY);

		return mod(cellIndex + offset, count);
	}

	void main() {
		vec2 usf_Uv = vUv;
		${d.basicFx_fragment_begin}

		vec2 n_count = count;
		n_count.x *= autoScale ? aspectRatio : 1.;

		vec2 cellIndex = ceil(usf_Uv * n_count);

		vec2 shuffledIndex = shuffle ? shuffleIndex(cellIndex, n_count) : cellIndex;

		vec2 cellCenter = calcSrcUv((shuffledIndex - .5) / n_count, texture_fitScale);

		vec4 gridTextureColor = fitTexture(texture_src, cellCenter, texture_fit);

		if(sprite){
			vec2 cellUv = fract(usf_Uv * n_count);
			float cellHash = hash(cellIndex);
			float spritePos = fract(cellHash + tick * sprite_shuffleSpeed);
			float spriteIndex = floor(spritePos * sprite_length);
			float spriteSize = 1.0 / sprite_length;
			float spriteOffset = spriteIndex * spriteSize;
			float spriteU = spriteOffset + cellUv.x * spriteSize;
			vec2 spriteUv = vec2(spriteU, cellUv.y);
			vec4 spriteColor = texture2D(sprite_src, spriteUv);
			gridTextureColor *= spriteColor;
		}

		vec4 usf_FragColor = gridTextureColor;
		${d.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;
class ce extends ye {
  constructor(t) {
    super({
      ...t,
      vertexShader: bt,
      fragmentShader: Ct,
      uniforms: {
        count: { value: new i.Vector2(20, 20) },
        autoScale: { value: !0 },
        tick: { value: 0 },
        shuffle: { value: !1 },
        shuffle_frequency: { value: 5 },
        shuffle_range: { value: 2 },
        sprite: { value: !1 },
        sprite_src: { value: new i.Texture() },
        sprite_length: { value: 10 },
        sprite_shuffleSpeed: { value: 0 }
      }
    }), this.setNearestFilter(), this.type = ce.type;
  }
  static get type() {
    return "GridMaterial";
  }
  /** When gridding with floor, you must use NearestFilter. */
  setNearestFilter() {
    this.uniforms.texture_src.value.magFilter = i.NearestFilter, this.uniforms.texture_src.value.minFilter = i.NearestFilter, this.uniforms.sprite_src.value.magFilter = i.NearestFilter, this.uniforms.sprite_src.value.minFilter = i.NearestFilter;
  }
}
const kt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  ...o
}) => {
  const s = R(t), { scene: c, material: l, camera: u } = U({
    size: e,
    dpr: s.shader,
    material: gt,
    uniformValues: o,
    materialParameters: n
  }), [v, _] = w({
    scene: c,
    camera: u,
    size: e,
    dpr: s.fbo,
    fboAutoSetSize: r,
    ...a
  }), m = h(
    (p, f = !0) => {
      l.setUniformValues(p, f);
    },
    [l]
  );
  return {
    render: h(
      (p, f) => {
        const { gl: g, clock: C } = p;
        return f && m(f, !1), l.uniforms.tick.value = (f == null ? void 0 : f.tick) || C.getElapsedTime(), _({ gl: g });
      },
      [m, _, l]
    ),
    setValues: m,
    texture: v.texture,
    material: l,
    scene: c,
    camera: u,
    renderTarget: v
  };
}, Tt = ({
  size: e,
  dpr: t,
  ...r
}, a) => {
  const { scene: n, material: o, camera: s } = U({
    size: e,
    dpr: t,
    material: X,
    uniformValues: r
  });
  return { render: h(
    (l) => {
      const { gl: u } = l;
      a({ gl: u, scene: n, camera: s });
    },
    [a, n, s]
  ), material: o };
}, Et = (e = 0) => {
  const t = E(new i.Vector2(0, 0)), r = E(new i.Vector2(0, 0)), a = E(new i.Vector2(0, 0)), n = E(0), o = E(new i.Vector2(0, 0)), s = E(!1);
  return h(
    (l) => {
      const u = performance.now();
      let v;
      s.current && e ? (a.current = a.current.lerp(
        l,
        1 - e
      ), v = a.current.clone()) : (v = l.clone(), a.current = v), n.current === 0 && (n.current = u, t.current = v);
      const _ = Math.max(1, u - n.current);
      n.current = u, o.current.copy(v).sub(t.current).divideScalar(_);
      const m = o.current.length() > 0, x = s.current ? t.current.clone() : v;
      return !s.current && m && (s.current = !0), t.current = v, {
        currentPointer: v,
        prevPointer: x,
        diffPointer: r.current.subVectors(v, x),
        velocity: o.current,
        isVelocityUpdate: m
      };
    },
    [e]
  );
}, Ot = ({
  size: e,
  dpr: t,
  force: r,
  ...a
}, n) => {
  const { scene: o, material: s, camera: c } = U({
    size: e,
    dpr: t,
    material: Q,
    geometrySize: {
      width: 1,
      height: 1
    },
    uniformValues: a,
    customParameters: {
      forceBias: r
    }
  }), l = Et();
  return { render: h(
    (v) => {
      const { gl: _, pointer: m } = v, { currentPointer: x, diffPointer: p } = l(m);
      s.uniforms.center.value.copy(x), s.uniforms.force.value.copy(
        p.multiplyScalar(s.forceBias)
      ), n({ gl: _, scene: o, camera: c, clear: !1 });
    },
    [n, s, l, o, c]
  ), material: s };
}, Vt = ({
  size: e,
  dpr: t,
  ...r
}, a) => {
  const { scene: n, material: o, camera: s } = U({
    size: e,
    dpr: t,
    material: q,
    uniformValues: r
  });
  return { render: h(
    (l) => {
      const { gl: u } = l;
      a({ gl: u, scene: n, camera: s });
    },
    [a, n, s]
  ), material: o };
}, Pt = ({
  size: e,
  dpr: t,
  pressureIterations: r,
  ...a
}, n) => {
  const { scene: o, material: s, camera: c } = U({
    size: e,
    dpr: t,
    material: H,
    uniformValues: a,
    customParameters: {
      iterations: r
    }
  });
  return { render: h(
    (u) => {
      const { gl: v } = u;
      for (let _ = 0; _ < s.iterations; _++)
        n({ gl: v, scene: o, camera: c }, ({ read: m }) => {
          s.uniforms.pressure.value = m;
        });
    },
    [n, s, o, c]
  ), material: s };
}, It = ({
  size: e,
  dpr: t,
  ...r
}, a) => {
  const { scene: n, material: o, camera: s } = U({
    size: e,
    dpr: t,
    material: G,
    uniformValues: r
  });
  return { render: h(
    (l) => {
      const { gl: u } = l;
      a({ gl: u, scene: n, camera: s });
    },
    [a, n, s]
  ), material: o };
}, Bt = ({
  size: e,
  dpr: t,
  ...r
}, a) => {
  const { scene: n, material: o, camera: s } = U({
    size: e,
    dpr: t,
    material: Y,
    uniformValues: r
  });
  return { render: h(
    (l) => {
      const { gl: u } = l;
      a({ gl: u, scene: n, camera: s });
    },
    [a, n, s]
  ), material: o };
}, L = (e) => Object.fromEntries(
  Object.entries(e).filter(([, t]) => t !== void 0)
), pe = (e) => {
  const {
    dissipation: t,
    deltaTime: r,
    bounce: a,
    pressureIterations: n,
    scale: o,
    force: s,
    ...c
  } = e;
  return [
    {
      advection: L({ dissipation: t, deltaTime: r }),
      divergence: L({ bounce: a, deltaTime: r }),
      poisson: L({ bounce: a }),
      pressure: L({ bounce: a, deltaTime: r }),
      splat: L({ scale: o }),
      pressureIterations: n,
      force: s
    },
    c
  ];
}, jt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  ...o
}) => {
  const s = R(t), c = {
    dpr: s.fbo,
    size: e,
    fboAutoSetSize: r,
    type: i.HalfFloatType,
    ...a
  }, [l, u] = w(c), [v, _] = w(c), [m, x] = w(c), [p, f] = he(c), [g, C] = w(c), [F, le] = pe(o), M = { size: e, dpr: s.shader }, D = Tt(
    {
      ...M,
      ...F.advection,
      velocity: l.texture
    },
    _
  ), T = Ot(
    {
      ...M,
      ...F.splat,
      force: F.force
    },
    _
  ), I = Vt(
    {
      ...M,
      ...F.divergence,
      velocity: v.texture
    },
    x
  ), V = Pt(
    {
      ...M,
      ...F.poisson,
      divergence: m.texture,
      pressureIterations: F.pressureIterations
    },
    f
  ), B = It(
    {
      ...M,
      ...F.pressure,
      velocity: v.texture,
      pressure: p.read.texture
    },
    u
  ), $ = Bt(
    {
      ...M,
      ...le,
      src: l.texture
    },
    C
  ), Z = h(
    (J, k = !0) => {
      const [y, Ue] = pe(J);
      $.material.setUniformValues(Ue, k), D.material.setUniformValues(y.advection), I.material.setUniformValues(y.divergence), V.material.setUniformValues(y.poisson), B.material.setUniformValues(y.pressure), T.material.setUniformValues(y.splat), y.pressureIterations && (V.material.iterations = y.pressureIterations), y.force && (T.material.forceBias = y.force);
    },
    [$, D, I, V, B, T]
  );
  return {
    render: h(
      (J, k) => (k && Z(k, !1), [D, T, I, V, B, $].forEach(
        (y) => y == null ? void 0 : y.render(J)
      ), g.texture),
      [
        Z,
        g.texture,
        D,
        T,
        I,
        V,
        B,
        $
      ]
    ),
    setValues: Z,
    texture: g.texture,
    velocity: l.texture
  };
}, zt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  ...o
}) => {
  const s = R(t), { scene: c, material: l, camera: u } = U({
    size: e,
    dpr: s.shader,
    material: wt,
    uniformValues: o,
    materialParameters: n
  }), [v, _] = w({
    scene: c,
    camera: u,
    size: e,
    dpr: s.fbo,
    fboAutoSetSize: r,
    ...a
  }), m = h(
    (p, f = !0) => {
      l.setUniformValues(p, f);
    },
    [l]
  );
  return {
    render: h(
      (p, f) => {
        const { gl: g } = p;
        return f && m(f, !1), _({ gl: g });
      },
      [m, _]
    ),
    setValues: m,
    texture: v.texture,
    material: l,
    scene: c,
    camera: u,
    renderTarget: v
  };
}, Kt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  ...o
}) => {
  const s = R(t), { scene: c, material: l, camera: u } = U({
    size: e,
    dpr: s.shader,
    material: ie,
    materialParameters: n,
    ...o
  }), [v, _] = w({
    scene: c,
    camera: u,
    size: e,
    dpr: s.fbo,
    fboAutoSetSize: r,
    ...a
  }), m = h(
    (p) => {
      l.setUniformValues(p);
    },
    [l]
  );
  return {
    render: h(
      (p, f) => {
        const { gl: g } = p;
        return f && m(f), _({ gl: g });
      },
      [m, _]
    ),
    setValues: m,
    texture: v.texture,
    material: l,
    scene: c,
    camera: u,
    renderTarget: v
  };
}, Nt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  pointerLerp: o = 1,
  ...s
}) => {
  const c = R(t), { scene: l, material: u, camera: v } = U({
    size: e,
    dpr: c.shader,
    material: oe,
    materialParameters: n,
    ...s
  }), _ = {
    scene: l,
    camera: v,
    size: e,
    dpr: c.fbo,
    fboAutoSetSize: r,
    ...a
  }, [m, x] = w(_), [p, f] = he(_), [g, C] = Ce({ pointerLerp: o }), F = h(
    ({ pointerLerp: M, ...D }) => {
      u.setUniformValues(D), M && C({ pointerLerp: M });
    },
    [u, C]
  );
  return {
    render: h(
      (M, D) => {
        const { gl: T, clock: I, pointer: V } = M;
        return D && F(D), u.uniforms.time.value = I.getElapsedTime(), u.uniforms.pointer.value.lerp(
          V,
          g.current.pointerLerp
        ), f(
          { gl: T },
          ({ read: B }) => u.uniforms.backbuffer.value = B
        ), x({ gl: T });
      },
      [F, x, u, f, g]
    ),
    setValues: F,
    texture: m.texture,
    material: u,
    scene: l,
    camera: v,
    renderTarget: m
  };
}, Xt = ({
  size: e,
  dpr: t,
  fboAutoSetSize: r,
  renderTargetOptions: a,
  materialParameters: n,
  ...o
}) => {
  const s = R(t), { scene: c, material: l, camera: u } = U({
    size: e,
    dpr: s.shader,
    material: ce,
    uniformValues: o,
    materialParameters: n
  }), [v, _] = w({
    scene: c,
    camera: u,
    size: e,
    dpr: s.fbo,
    fboAutoSetSize: r,
    ...a
  }), m = h(
    (p, f = !0) => {
      l.setUniformValues(p, f), l.setNearestFilter();
    },
    [l]
  );
  return {
    render: h(
      (p, f) => {
        const { gl: g, clock: C } = p;
        return f && m(f, !1), l.uniforms.tick.value = (f == null ? void 0 : f.tick) || C.getElapsedTime(), _({ gl: g });
      },
      [m, _, l]
    ),
    setValues: m,
    texture: v.texture,
    material: l,
    scene: c,
    camera: u,
    renderTarget: v
  };
}, z = Object.freeze({
  easeInSine(e) {
    return 1 - Math.cos(e * Math.PI / 2);
  },
  easeOutSine(e) {
    return Math.sin(e * Math.PI / 2);
  },
  easeInOutSine(e) {
    return -(Math.cos(Math.PI * e) - 1) / 2;
  },
  easeInQuad(e) {
    return e * e;
  },
  easeOutQuad(e) {
    return 1 - (1 - e) * (1 - e);
  },
  easeInOutQuad(e) {
    return e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
  },
  easeInCubic(e) {
    return e * e * e;
  },
  easeOutCubic(e) {
    return 1 - Math.pow(1 - e, 3);
  },
  easeInOutCubic(e) {
    return e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  },
  easeInQuart(e) {
    return e * e * e * e;
  },
  easeOutQuart(e) {
    return 1 - Math.pow(1 - e, 4);
  },
  easeInOutQuart(e) {
    return e < 0.5 ? 8 * e * e * e * e : 1 - Math.pow(-2 * e + 2, 4) / 2;
  },
  easeInQuint(e) {
    return e * e * e * e * e;
  },
  easeOutQuint(e) {
    return 1 - Math.pow(1 - e, 5);
  },
  easeInOutQuint(e) {
    return e < 0.5 ? 16 * e * e * e * e * e : 1 - Math.pow(-2 * e + 2, 5) / 2;
  },
  easeInExpo(e) {
    return e === 0 ? 0 : Math.pow(2, 10 * e - 10);
  },
  easeOutExpo(e) {
    return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
  },
  easeInOutExpo(e) {
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2;
  },
  easeInCirc(e) {
    return 1 - Math.sqrt(1 - Math.pow(e, 2));
  },
  easeOutCirc(e) {
    return Math.sqrt(1 - Math.pow(e - 1, 2));
  },
  easeInOutCirc(e) {
    return e < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * e, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * e + 2, 2)) + 1) / 2;
  },
  easeInBack(e) {
    return 2.70158 * e * e * e - 1.70158 * e * e;
  },
  easeOutBack(e) {
    return 1 + 2.70158 * Math.pow(e - 1, 3) + 1.70158 * Math.pow(e - 1, 2);
  },
  easeInOutBack(e) {
    const r = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((r + 1) * 2 * e - r) / 2 : (Math.pow(2 * e - 2, 2) * ((r + 1) * (e * 2 - 2) + r) + 2) / 2;
  },
  easeInElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * t);
  },
  easeOutElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * t) + 1;
  },
  easeInOutElastic(e) {
    const t = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * t)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * t) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - z.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - z.easeOutBounce(1 - 2 * e)) / 2 : (1 + z.easeOutBounce(2 * e - 1)) / 2;
  }
});
function Rt(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const qt = (e, t = "easeOutQuart") => {
  const r = e / 60, a = z[t];
  return h(
    (o) => {
      let s = o.getElapsedTime() * r;
      const c = Math.floor(s), l = a(s - c);
      s = l + c;
      const u = Rt(c);
      return {
        beat: s,
        floor: c,
        fract: l,
        hash: u
      };
    },
    [r, a]
  );
}, xe = { passive: !0 }, Gt = (e) => {
  const t = E(new i.Vector2(0));
  return K(() => {
    const r = (o, s) => {
      t.current.set(
        (o - e.left) / e.width * 2 - 1,
        -((s - e.top) / e.height) * 2 + 1
      );
    }, a = (o) => {
      const s = o.touches[0];
      r(s.clientX, s.clientY);
    }, n = (o) => {
      r(o.clientX, o.clientY);
    };
    return window.addEventListener("touchmove", a, xe), window.addEventListener("pointermove", n, xe), () => {
      window.removeEventListener("touchmove", a), window.removeEventListener("pointermove", n);
    };
  }, [e]), t.current;
};
export {
  re as BASICFX_VALUES,
  oe as BlankMaterial,
  wt as BufferMaterial,
  $t as FluidMaterials,
  ce as GridMaterial,
  gt as NoiseMaterial,
  ie as RawBlankMaterial,
  ue as getFxKeyFromUniforms,
  Ve as handleUpdateFxDefines,
  qt as useBeat,
  Nt as useBlank,
  zt as useBuffer,
  he as useDoubleFBO,
  jt as useFluid,
  Xt as useGrid,
  kt as useNoise,
  Et as usePointerTracker,
  Kt as useRawBlank,
  w as useSingleFBO,
  Gt as useWindowPointer
};
//# sourceMappingURL=use-shader-fx.js.map
