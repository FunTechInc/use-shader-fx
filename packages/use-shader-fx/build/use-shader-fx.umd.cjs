(function(d,I){typeof exports=="object"&&typeof module<"u"?I(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],I):(d=typeof globalThis<"u"?globalThis:d||self,I(d["use-shader-fx"]={},d.THREE,d.React))})(this,function(d,I,f){"use strict";function we(e){const t=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const r in e)if(r!=="default"){const a=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(t,r,a.get?a:{enumerable:!0,get:()=>e[r]})}}return t.default=e,Object.freeze(t)}const i=we(I),P=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},A=(e,t=!1)=>{const r=t?e.width*t:e.width,a=t?e.height*t:e.height,[n]=f.useState(()=>new i.Vector2(r,a));return n.set(r,a),n},Ce=(e,t)=>{const r=t,a=e/t,[n,o]=[r*a/2,r/2];return{width:n,height:o,near:-1e3,far:1e3}},Te=(e,t="OrthographicCamera")=>{const r=A(e),{width:a,height:n,near:o,far:s}=Ce(r.x,r.y),[c]=f.useState(()=>t==="OrthographicCamera"?new i.OrthographicCamera(-a,a,n,-n,o,s):new i.PerspectiveCamera(50,a/n));return c instanceof i.OrthographicCamera?(c.left=-a,c.right=a,c.top=n,c.bottom=-n,c.near=o,c.far=s,c.updateProjectionMatrix()):c instanceof i.PerspectiveCamera&&(c.aspect=a/n,c.updateProjectionMatrix()),c},te={depthBuffer:!1},ue=({gl:e,fbo:t,scene:r,camera:a,clear:n=!0,onBeforeRender:o,onSwap:s})=>{if(!r||!a)return;const c=e.autoClear;e.autoClear=n,e.setRenderTarget(t),o(),e.render(r,a),s&&s(),e.setRenderTarget(null),e.autoClear=c},b=e=>{const{scene:t,camera:r,size:a,dpr:n=!1,fboAutoSetSize:o=!1,depth:s=!1,...c}=e,l=A(a,n),[u]=f.useState(()=>{const v=new i.WebGLRenderTarget(l.x,l.y,{...te,...c});return s&&(v.depthTexture=new i.DepthTexture(l.x,l.y,i.FloatType)),v});o&&u.setSize(l.x,l.y),f.useEffect(()=>{const v=u;return()=>{v==null||v.dispose()}},[u]);const m=f.useCallback((v,p)=>{const h=u;return ue({...v,scene:v.scene||t,camera:v.camera||r,fbo:h,onBeforeRender:()=>p==null?void 0:p({read:h.texture})}),h.texture},[t,r,u]);return[u,m]},re=e=>{var v,p;const{scene:t,camera:r,size:a,dpr:n=!1,fboAutoSetSize:o=!1,depth:s=!1,...c}=e,l=A(a,n),[u]=f.useState(()=>{const h=new i.WebGLRenderTarget(l.x,l.y,{...te,...c}),x=new i.WebGLRenderTarget(l.x,l.y,{...te,...c});return s&&(h.depthTexture=new i.DepthTexture(l.x,l.y,i.FloatType),x.depthTexture=new i.DepthTexture(l.x,l.y,i.FloatType)),{read:h,write:x,swap:function(){let _=this.read;this.read=this.write,this.write=_}}});o&&((v=u.read)==null||v.setSize(l.x,l.y),(p=u.write)==null||p.setSize(l.x,l.y)),f.useEffect(()=>{const h=u;return()=>{var x,_;(x=h.read)==null||x.dispose(),(_=h.write)==null||_.dispose()}},[u]);const m=f.useCallback((h,x)=>{var S;const _=u;return ue({...h,scene:h.scene||t,camera:h.camera||r,fbo:_.write,onBeforeRender:()=>x==null?void 0:x({read:_.read.texture,write:_.write.texture}),onSwap:()=>_.swap()}),(S=_.read)==null?void 0:S.texture},[t,r,u]);return[{read:u.read,write:u.write},m]},Ee=(e,t,r,a)=>{const[n]=f.useState(()=>new a(t,r));return f.useEffect(()=>(e&&e.add(n),()=>{e&&e.remove(n),t.dispose(),r.dispose()}),[e,t,r,n]),n},M=({size:e,dpr:t,material:r,geometry:a=i.PlaneGeometry,geometrySize:n,...o})=>{const[s]=f.useState(()=>new i.Scene),[c]=f.useState(()=>new a((n==null?void 0:n.width)||2,(n==null?void 0:n.height)||2)),[l]=f.useState(()=>new r(o)),u=A(e,t);l.updateResolution(u.x,u.y),Ee(s,c,l,i.Mesh);const m=Te(e);return{scene:s,material:l,camera:m}},Oe=e=>{const t=f.useRef(e),r=f.useCallback(a=>{t.current=typeof a=="function"?a(t.current):a},[]);return[t,r]},Ve=process.env.NODE_ENV==="development",y=new i.DataTexture(new Uint8Array([0,0,0,0]),1,1,i.RGBAFormat),Pe="use-shader-fx",Be=["isColor","isMatrix3","isMatrix4","isVector2","isVector3","isVector4","isTexture","isQuaternion","isWebGLRenderTarget","isEuler","isBufferGeometry","isMaterial","isCamera","isLight","isObject3D","isBone","isVideoTexture"],$=e=>{Ve&&console.warn(`${Pe}: ${e}`)},j={mixSrc:{value:!1},mixSrc_src:{value:new i.Texture},mixSrc_fit:{value:0},mixSrc_fitScale:{value:new i.Vector2(1,1)},mixSrc_uv:{value:!1},mixSrc_uv_ch:{value:0},mixSrc_uv_factor:{value:0},mixSrc_uv_offset:{value:new i.Vector2(0,0)},mixSrc_uv_radius:{value:.5},mixSrc_uv_position:{value:new i.Vector2(.5,.5)},mixSrc_uv_range:{value:new i.Vector2(0,1)},mixSrc_uv_mixMap:{value:!1},mixSrc_uv_mixMap_src:{value:y},mixSrc_uv_mixMap_ch:{value:0},mixSrc_color:{value:!1},mixSrc_color_factor:{value:0},mixSrc_color_radius:{value:.5},mixSrc_color_position:{value:new i.Vector2(.5,.5)},mixSrc_color_range:{value:new i.Vector2(0,1)},mixSrc_color_mixMap:{value:!1},mixSrc_color_mixMap_src:{value:y},mixSrc_color_mixMap_ch:{value:0},mixSrc_alpha:{value:!1},mixSrc_alpha_factor:{value:0},mixSrc_alpha_radius:{value:.5},mixSrc_alpha_position:{value:new i.Vector2(.5,.5)},mixSrc_alpha_range:{value:new i.Vector2(0,1)},mixSrc_alpha_mixMap:{value:!1},mixSrc_alpha_mixMap_src:{value:y},mixSrc_alpha_mixMap_ch:{value:0},mixDst:{value:!1},mixDst_src:{value:new i.Texture},mixDst_fit:{value:0},mixDst_fitScale:{value:new i.Vector2(1,1)},mixDst_uv:{value:!1},mixDst_uv_ch:{value:0},mixDst_uv_factor:{value:0},mixDst_uv_offset:{value:new i.Vector2(0,0)},mixDst_uv_radius:{value:.5},mixDst_uv_position:{value:new i.Vector2(.5,.5)},mixDst_uv_range:{value:new i.Vector2(0,1)},mixDst_uv_mixMap:{value:!1},mixDst_uv_mixMap_src:{value:y},mixDst_uv_mixMap_ch:{value:0},mixDst_color:{value:!1},mixDst_color_factor:{value:0},mixDst_color_radius:{value:.5},mixDst_color_position:{value:new i.Vector2(.5,.5)},mixDst_color_range:{value:new i.Vector2(0,1)},mixDst_color_mixMap:{value:!1},mixDst_color_mixMap_src:{value:y},mixDst_color_mixMap_ch:{value:0},mixDst_alpha:{value:!1},mixDst_alpha_factor:{value:0},mixDst_alpha_radius:{value:.5},mixDst_alpha_position:{value:new i.Vector2(.5,.5)},mixDst_alpha_range:{value:new i.Vector2(0,1)},mixDst_alpha_mixMap:{value:!1},mixDst_alpha_mixMap_src:{value:y},mixDst_alpha_mixMap_ch:{value:0},levels:{value:!1},levels_shadows:{value:new i.Vector4(0,0,0,0)},levels_midtones:{value:new i.Vector4(1,1,1,1)},levels_highlights:{value:new i.Vector4(1,1,1,1)},levels_outputMin:{value:new i.Vector4(0,0,0,0)},levels_outputMax:{value:new i.Vector4(1,1,1,1)},contrast:{value:!1},contrast_factor:{value:new i.Vector4(1,1,1,1)},colorBalance:{value:!1},colorBalance_factor:{value:new i.Vector3(1,1,1)},hsv:{value:!1},hsv_hueShift:{value:0},hsv_saturation:{value:1},hsv_brightness:{value:1},posterize:{value:!1},posterize_levels:{value:new i.Vector4(0,0,0,0)},grayscale:{value:!1},grayscale_weight:{value:new i.Vector3(0,0,0)},grayscale_duotone:{value:!1},grayscale_duotone_color0:{value:new i.Color(0)},grayscale_duotone_color1:{value:new i.Color(16777215)},grayscale_threshold:{value:-1}};function fe(e){const{mixSrc:t,mixDst:r,srcSystem:a,levels:n,contrast:o,colorBalance:s,hsv:c,posterize:l,grayscale:u}=e;return{USF_USE_SRC_SYSTEM:a,USF_USE_MIXSRC:t,USF_USE_MIXDST:r,USF_USE_LEVELS:n,USF_USE_CONTRAST:o,USF_USE_COLORBALANCE:s,USF_USE_HSV:c,USF_USE_POSTERIZE:l,USF_USE_GRAYSCALE:u}}function ae(e){const t=!!e.mixSrc.value,r=!!e.mixDst.value;return{mixSrc:t,mixDst:r,srcSystem:t||r,levels:!!e.levels.value,contrast:!!e.contrast.value,colorBalance:!!e.colorBalance.value,hsv:!!e.hsv.value,posterize:!!e.posterize.value,grayscale:!!e.grayscale.value}}var Re="#usf <plane_vertex>",Ie="#usf <default_vertex>",ke="#usf <default_pars_vertex>",Le="#usf <default_pars_fragment>",Ae=`#usf <mixSrc_vertex>
#usf <mixDst_vertex>`,$e=`#usf <srcSystem_pars_vertex>
#usf <mixSrc_pars_vertex>
#usf <mixDst_pars_vertex>`,je=`#usf <mixSrc_pars_fragment>
#usf <mixDst_pars_fragment>
#usf <srcSystem_pars_fragment>
#usf <adjustments_pars_fragment>`,ze="#usf <mixSrc_fragment_begin>",Ne=`#usf <mixSrc_fragment_end>
#usf <mixDst_fragment>
#usf <adjustments_fragment>`,Ke="#usf <texture_vertex>",Xe="#usf <texture_pars_vertex>",qe="#usf <texture_pars_fragment>";const g=Object.freeze({plane_vertex:Re,default_vertex:Ie,default_pars_vertex:ke,default_pars_fragment:Le,basicFx_vertex:Ae,basicFx_pars_vertex:$e,basicFx_pars_fragment:je,basicFx_fragment_begin:ze,basicFx_fragment_end:Ne,samplingFx_vertex:Ke,samplingFx_pars_vertex:Xe,samplingFx_pars_fragment:qe}),Ge=`
	void main() {
		${g.plane_vertex}
	}
`,He=`
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

		${g.basicFx_fragment_begin}

		float noise = warp(usf_Uv ,warpStrength,tick * timeStrength);

		vec4 usf_FragColor = vec4(noise);

		${g.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;var Qe="gl_Position = vec4(position, 1.0);",Ye=`#ifdef USF_USE_SRC_SYSTEM

	#usf <calcSrcUv>

#endif`,We=`#ifdef USF_USE_SRC_SYSTEM

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

#endif`,Ze="vUv = uv;",Je=`precision highp float;

varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 texelSize;
uniform float aspectRatio;
uniform vec2 maxAspect;`,et=`precision highp float;

varying vec2 vUv;
uniform vec2 resolution;
uniform vec2 texelSize;
uniform float aspectRatio;
uniform vec2 maxAspect;
uniform int renderCount;`,tt=`#ifdef USF_USE_MIXSRC
	varying vec2 vMixSrcCoverUv;
	uniform vec2 mixSrc_fitScale;
#endif`,rt=`#ifdef USF_USE_MIXSRC			
	vMixSrcCoverUv = calcSrcUv(vUv, mixSrc_fitScale);	
#endif`,at=`#ifdef USF_USE_MIXSRC
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

#endif`,nt=`#ifdef USF_USE_MIXSRC

	vec4 mixSrcColor = fitTexture(mixSrc_src, vMixSrcCoverUv, mixSrc_fit);

	usf_Uv += mixSrc_uv 
		? (mixSrc_uv_offset + (vec2(mixSrcColor[mixSrc_uv_ch]) * 2. - 1.)) * 
			(mixSrc_uv_mixMap 
				? calcMixMapPower(mixSrc_uv_mixMap_src,mixSrc_uv_range,mixSrc_uv_mixMap_ch)
				: calcMixCirclePower(mixSrc_uv_position,mixSrc_uv_radius,mixSrc_uv_range)) * mixSrc_uv_factor
		: vec2(0.);

#endif`,st=`#ifdef USF_USE_MIXSRC
	
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

#endif`,it=`#ifdef USF_USE_MIXDST
	varying vec2 vMixDstCoverUv;
	uniform vec2 mixDst_fitScale;
#endif`,ot=`#ifdef USF_USE_MIXDST		
	vMixDstCoverUv = calcSrcUv(vUv, mixDst_fitScale);	
#endif`,ct=`#ifdef USF_USE_MIXDST

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

#endif`,lt=`#ifdef USF_USE_MIXDST

	
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

#endif`,ut=`#ifdef USF_USE_TEXTURE		
	vTextureCoverUv = calcSrcUv(vUv, texture_fitScale);
#endif`,ft=`#ifdef USF_USE_TEXTURE
	varying vec2 vTextureCoverUv;
	uniform vec2 texture_fitScale;
#endif`,_t=`#ifdef USF_USE_TEXTURE	
	varying vec2 vTextureCoverUv;
	uniform sampler2D texture_src;
	uniform int texture_fit;
	uniform vec2 texture_fitScale;
#endif`,vt=`#ifdef USF_USE_LEVELS
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
#endif`,mt=`#ifdef USF_USE_LEVELS
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
#endif`,pt=`vec2 calcSrcUv(vec2 uv, vec2 fitScale) {
	return uv * fitScale + (1.0 - fitScale) * .5;
}`;const xt=Object.freeze({plane_vertex:Qe,srcSystem_pars_vertex:Ye,srcSystem_pars_fragment:We,default_vertex:Ze,default_pars_vertex:Je,default_pars_fragment:et,mixSrc_vertex:rt,mixSrc_pars_vertex:tt,mixSrc_pars_fragment:at,mixSrc_fragment_begin:nt,mixSrc_fragment_end:st,mixDst_pars_vertex:it,mixDst_vertex:ot,mixDst_pars_fragment:ct,mixDst_fragment:lt,texture_vertex:ut,texture_pars_vertex:ft,texture_pars_fragment:_t,adjustments_fragment:vt,adjustments_pars_fragment:mt,calcSrcUv:pt});function O(e){return e.filter(t=>t!=="").join(`
`)}function ne(e,t,r){let a,n;const o={default:{vertexPars:g.default_pars_vertex,vertexMain:g.default_vertex,fragmentPars:g.default_pars_fragment},basicFx:{vertexPars:g.basicFx_pars_vertex,vertexMain:g.basicFx_vertex,fragmentPars:g.basicFx_pars_fragment},samplingFx:{vertexPars:O([g.basicFx_pars_vertex,g.samplingFx_pars_vertex]),vertexMain:O([g.basicFx_vertex,g.samplingFx_vertex]),fragmentPars:O([g.basicFx_pars_fragment,g.samplingFx_pars_fragment])}},s=o[r].vertexPars,c=o[r].vertexMain,l=o[r].fragmentPars;return e&&(a=O([s,e]),a=a.replace(/void\s+main\s*\(\)\s*\{/,`void main() {
${c}`)),t&&(n=O([l,t])),[a,n]}const dt=/^[ \t]*#usf +<([\w\d./]+)>/gm;function ht(e,t){return se(xt[t]||"")}function se(e){return e.replace(dt,ht)}function gt(e){return e&&Be.some(t=>e[t]===!0)}function St(e){const t={},r=(a,n="")=>{for(const[o,s]of Object.entries(a)){const c=n?`${n}_${o}`:o;s&&typeof s=="object"&&!Array.isArray(s)&&!gt(s)?(t[c]=!0,r(s,c)):(t.hasOwnProperty(c)&&$(`${c} already exists and will be overwritten.`),t[c]=s)}};return r(e),t}class w extends i.ShaderMaterial{constructor({uniformValues:t,materialParameters:r={},uniforms:a,vertexShader:n,fragmentShader:o}={}){super(r),this.uniforms={resolution:{value:new i.Vector2},texelSize:{value:new i.Vector2},aspectRatio:{value:0},maxAspect:{value:new i.Vector2},renderCount:{value:0},...a},this._setupShaders(n,o),this.setUniformValues(t),this._defineUniformAccessors()}updateResolution(t,r){const a=Math.max(t,r);this.uniforms.resolution.value.set(t,r),this.uniforms.texelSize.value.set(1/t,1/r),this.uniforms.aspectRatio.value=t/r,this.uniforms.maxAspect.value.set(a/t,a/r)}_setupShaders(t,r){if(!t&&!r)return;const[a,n]=ne(t,r,"default");this.vertexShader=a?se(a):this.vertexShader,this.fragmentShader=n?se(n):this.fragmentShader}setUniformValues(t){if(t===void 0)return;const r=St(t);for(const[a,n]of Object.entries(r)){if(n===void 0){$(`parameter '${a}' has value of undefined.`);continue}const o=this.uniforms[a];if(o===void 0){$(`'${a}' is not a uniform property of ${this.type}.`);continue}o.value=n}return r}_defineUniformAccessors(t){for(const r of Object.keys(this.uniforms)){if(this.hasOwnProperty(r)){$(`'${r}' is already defined in ${this.type}.`);continue}Object.defineProperty(this,r,{get:()=>this.uniforms[r].value,set:a=>{this.uniforms[r].value=a,t==null||t()}})}}}w.key=i.MathUtils.generateUUID();class ie extends w{constructor({uniforms:t,vertexShader:r,fragmentShader:a,...n}={}){var o;super({...n,uniforms:{...i.UniformsUtils.clone(j),...t}}),this.defines={...(o=n==null?void 0:n.materialParameters)==null?void 0:o.defines},this.programCache=0,this.fxKey=this._setupFxKey(this.uniforms),this._setupFxShaders(r,a)}_setupFxShaders(t,r){if(!t&&!r)return;this._updateFxDefines();const[a,n]=this._handleMergeShaderLib(t,r);super._setupShaders(a,n)}_handleMergeShaderLib(t,r){return ne(t,r,"basicFx")}_updateFxShaders(){if(!this.fxKey)return;const t=this.programCache,{diffCount:r,newFxKey:a}=this._handleUpdateFxShaders();this.programCache+=r,this.fxKey=a,t!==this.programCache&&(this._updateFxDefines(),this.needsUpdate=!0)}_handleUpdateFxShaders(){const t=ae(this.uniforms);return{diffCount:Object.keys(t).filter(a=>this.fxKey[a]!==t[a]).length,newFxKey:t}}_updateFxDefines(){Object.assign(this.defines,this._handleUpdateFxDefines())}_handleUpdateFxDefines(){return fe(this.fxKey)}_isContainsBasicFxValues(t,r){return t?Object.keys(t).some(a=>Object.keys(r??j).includes(a)):!1}_setupFxKey(t){return ae(t)}_calcFitScale(t,r){var c;let a=1;const n=new i.Vector2(1,1),o=this.uniforms.aspectRatio.value,s=(c=t==null?void 0:t.source)==null?void 0:c.data;return s!=null&&s.width&&(s!=null&&s.height)?a=s.width/s.height:a=o,r===1?n.set(Math.min(o/a,1),Math.min(a/o,1)):r===2&&n.set(Math.max(o/a,1),Math.max(a/o,1)),n}_setFitScale(t){const r=this.uniforms;r[`${t}_fitScale`].value=this._calcFitScale(r[`${t}_src`].value,r[`${t}_fit`].value)}_updateFitScale(){var t,r;(t=this.fxKey)!=null&&t.mixSrc&&this._setFitScale("mixSrc"),(r=this.fxKey)!=null&&r.mixDst&&this._setFitScale("mixDst")}setUniformValues(t,r=!0){const a=super.setUniformValues(t);return r&&this._isContainsBasicFxValues(a)&&(this._updateFxShaders(),this._updateFitScale()),a}_defineUniformAccessors(t){super._defineUniformAccessors(()=>{this._updateFxShaders(),this._updateFitScale(),t==null||t()})}updateResolution(t,r){super.updateResolution(t,r),this._updateFitScale()}}const _e=class De extends ie{constructor(t={}){super({...t,vertexShader:Ge,fragmentShader:He,uniforms:{tick:{value:0},scale:{value:.03},timeStrength:{value:.3},noiseOctaves:{value:2},fbmOctaves:{value:2},warpOctaves:{value:2},warpDirection:{value:new i.Vector2(2,2)},warpStrength:{value:8},timeOffset:{value:0}}}),this.type=De.type}static get type(){return"NoiseMaterial"}};_e.key=i.MathUtils.generateUUID();let ve=_e;const me=`
	uniform bool bounce;
	varying vec2 vL;
	varying vec2 vR;
	varying vec2 vT;
	varying vec2 vB;
`,oe=(e=!0)=>`
		vec3 pos = position;
		vec2 scale = ${e?"bounce ? vec2(1.,1.) : 1.-texelSize*2.":"1.-texelSize*2."};
		pos.xy = pos.xy * scale;
		vUv = vec2(.5)+(pos.xy)*.5;
	`,pe=e=>`
		vL = vUv - vec2(texelSize.x * ${e}, 0.0);
		vR = vUv + vec2(texelSize.x * ${e}, 0.0);
		vT = vUv + vec2(0.0, texelSize.y * ${e});
		vB = vUv - vec2(0.0, texelSize.y * ${e});
	`,k={main:`
		${me}

		void main(){
		
			${oe()}
			${pe("1.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,poisson:`
		${me}
		
		void main(){

			${oe()}
			${pe("2.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,advection:`
		void main(){
			${oe(!1)}
			gl_Position = vec4(pos, 1.0);
		}
	`,splat:`
		uniform vec2 center;
		uniform vec2 scale;
		void main(){		
			vec2 pos = position.xy * scale * 2.0 * texelSize + center;
			gl_Position = vec4(pos, 0.0, 1.0);
		}
	`};var yt=`uniform float deltaTime;
uniform sampler2D velocity;
uniform float dissipation;

void main(){
	vec2 vel = texture2D(velocity, vUv).xy;
	vec2 uv2 = vUv - vel * deltaTime * maxAspect;
	vec2 newVel = texture2D(velocity, uv2).xy;
	gl_FragColor = vec4(dissipation * newVel, 0.0, 0.0);
}`;class z extends w{constructor(t){super({...t,vertexShader:k.advection,fragmentShader:yt,uniforms:{dissipation:{value:.99},velocity:{value:y},deltaTime:{value:H}}}),this.type=z.type}static get type(){return"AdvectionMaterial"}}var Ft=`uniform float deltaTime;
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
}`;class N extends w{constructor(t){super({...t,vertexShader:k.main,fragmentShader:Ft,uniforms:{bounce:{value:!0},velocity:{value:y},deltaTime:{value:H}}}),this.type=N.type}static get type(){return"DivergenceMaterial"}}var Mt=`uniform float deltaTime;
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

}`;class K extends w{constructor(t){super({...t,vertexShader:k.main,fragmentShader:Mt,uniforms:{bounce:{value:!0},deltaTime:{value:H},pressure:{value:y},velocity:{value:y}}}),this.type=K.type}static get type(){return"PressureMaterial"}}var Ut=`uniform sampler2D pressure;
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
}`;class X extends w{constructor({customParameters:t,...r}){super({...r,vertexShader:k.poisson,fragmentShader:Ut,uniforms:{bounce:{value:!0},pressure:{value:y},divergence:{value:y}}}),this.iterations=(t==null?void 0:t.iterations)??32,this.type=X.type}static get type(){return"PoissonMaterial"}}var Dt=`uniform vec2 force;

void main(){
	gl_FragColor = vec4(force * pow(1.0 - clamp(2.0 * distance(vUv, vec2(0.5)), 0.0, 1.0), 2.0), 0.0, 1.0);
}`;class q extends w{constructor({customParameters:t,...r}){super({...r,vertexShader:k.splat,fragmentShader:Dt,uniforms:{force:{value:new i.Vector2(0,0)},center:{value:new i.Vector2(0,0)},scale:{value:new i.Vector2(50,50)}}}),this.type=q.type,this.forceBias=(t==null?void 0:t.forceBias)??20,this.blending=i.AdditiveBlending}static get type(){return"SplatMaterial"}}class G extends ie{constructor(t={}){super({...t,vertexShader:`
				void main() {
					${g.plane_vertex}
				}
			`,fragmentShader:`
				uniform sampler2D src;
				void main() {
					vec2 usf_Uv = vUv;
					
					${g.basicFx_fragment_begin}

					vec4 usf_FragColor = vec4(length(texture2D(src,usf_Uv).rg));

					${g.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`,uniforms:{src:{value:y}}}),this.type=G.type}static get type(){return"OutputMaterial"}}const H=.008,bt=Object.freeze(Object.defineProperty({__proto__:null,AdvectionMaterial:z,DELTA_TIME:H,DivergenceMaterial:N,OutputMaterial:G,PoissonMaterial:X,PressureMaterial:K,SplatMaterial:q},Symbol.toStringTag,{value:"Module"})),xe={texture:{value:!0},texture_src:{value:y},texture_fit:{value:0},texture_fitScale:{value:new i.Vector2(1,1)}};class de extends ie{constructor({uniforms:t,...r}){super({...r,uniforms:{...i.UniformsUtils.clone(xe),...t}})}_handleMergeShaderLib(t,r){return ne(t,r,"samplingFx")}_isContainsBasicFxValues(t){return super._isContainsBasicFxValues(t,{...j,...xe})}_updateFitScale(){super._updateFitScale(),this._setFitScale("texture")}_setupFxKey(t){const r=super._setupFxKey(t);return r.srcSystem=!0,r}_handleUpdateFxShaders(){const{diffCount:t,newFxKey:r}=super._handleUpdateFxShaders();return r.srcSystem=!0,{diffCount:t,newFxKey:r}}_handleUpdateFxDefines(){return Object.assign(super._handleUpdateFxDefines(),{USF_USE_TEXTURE:!0})}}const he=class be extends de{constructor(t={}){super({...t,vertexShader:`
				void main() {
					${g.plane_vertex}
				}
			`,fragmentShader:`
				void main() {
					vec2 usf_Uv = vTextureCoverUv;

					${g.basicFx_fragment_begin}

					vec4 usf_FragColor = fitTexture(texture_src,usf_Uv,texture_fit);

					${g.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`}),this.type=be.type}static get type(){return"BufferMaterial"}};he.key=i.MathUtils.generateUUID();let ge=he;class Q extends w{static get type(){return"RawBlankMaterial"}constructor(t){super(t),this.type=Q.type}}const Se=`
	uniform float time;
	uniform vec2 pointer;
	uniform sampler2D backbuffer;
`;class Y extends w{constructor({vertexShader:t,fragmentShader:r,uniforms:a,...n}){super({...n,vertexShader:t&&O([Se,t]),fragmentShader:r&&O([Se,r]),uniforms:{time:{value:0},pointer:{value:new i.Vector2},backbuffer:{value:new i.Texture},...a}}),this.type=Y.type}static get type(){return"BlankMaterial"}}const wt=`
	void main() {
		${g.plane_vertex}
	}
`,Ct=`
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
		${g.basicFx_fragment_begin}

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
		${g.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;class W extends de{constructor(t){super({...t,vertexShader:wt,fragmentShader:Ct,uniforms:{count:{value:new i.Vector2(20,20)},autoScale:{value:!0},tick:{value:0},shuffle:{value:!1},shuffle_frequency:{value:5},shuffle_range:{value:2},sprite:{value:!1},sprite_src:{value:new i.Texture},sprite_length:{value:10},sprite_shuffleSpeed:{value:0}}}),this.setNearestFilter(),this.type=W.type}static get type(){return"GridMaterial"}setNearestFilter(){this.uniforms.texture_src.value.magFilter=i.NearestFilter,this.uniforms.texture_src.value.minFilter=i.NearestFilter,this.uniforms.sprite_src.value.magFilter=i.NearestFilter,this.uniforms.sprite_src.value.minFilter=i.NearestFilter}}const Tt=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,...o})=>{const s=P(t),{scene:c,material:l,camera:u}=M({size:e,dpr:s.shader,material:ve,uniformValues:o,materialParameters:n}),[m,v]=b({scene:c,camera:u,size:e,dpr:s.fbo,fboAutoSetSize:r,...a}),p=f.useCallback((x,_=!0)=>{l.setUniformValues(x,_)},[l]);return{render:f.useCallback((x,_)=>{const{gl:S,clock:T}=x;return _&&p(_,!1),l.uniforms.tick.value=(_==null?void 0:_.tick)||T.getElapsedTime(),v({gl:S})},[p,v,l]),setValues:p,texture:m.texture,material:l,scene:c,camera:u,renderTarget:m}},Et=({size:e,dpr:t,...r},a)=>{const{scene:n,material:o,camera:s}=M({size:e,dpr:t,material:z,uniformValues:r});return{render:f.useCallback(l=>{const{gl:u}=l;a({gl:u,scene:n,camera:s})},[a,n,s]),material:o}},ye=(e=0)=>{const t=f.useRef(new i.Vector2(0,0)),r=f.useRef(new i.Vector2(0,0)),a=f.useRef(new i.Vector2(0,0)),n=f.useRef(0),o=f.useRef(new i.Vector2(0,0)),s=f.useRef(!1);return f.useCallback(l=>{const u=performance.now();let m;s.current&&e?(a.current=a.current.lerp(l,1-e),m=a.current.clone()):(m=l.clone(),a.current=m),n.current===0&&(n.current=u,t.current=m);const v=Math.max(1,u-n.current);n.current=u,o.current.copy(m).sub(t.current).divideScalar(v);const p=o.current.length()>0,h=s.current?t.current.clone():m;return!s.current&&p&&(s.current=!0),t.current=m,{currentPointer:m,prevPointer:h,diffPointer:r.current.subVectors(m,h),velocity:o.current,isVelocityUpdate:p}},[e])},Ot=({size:e,dpr:t,force:r,...a},n)=>{const{scene:o,material:s,camera:c}=M({size:e,dpr:t,material:q,geometrySize:{width:1,height:1},uniformValues:a,customParameters:{forceBias:r}}),l=ye();return{render:f.useCallback(m=>{const{gl:v,pointer:p}=m,{currentPointer:h,diffPointer:x}=l(p);s.uniforms.center.value.copy(h),s.uniforms.force.value.copy(x.multiplyScalar(s.forceBias)),n({gl:v,scene:o,camera:c,clear:!1})},[n,s,l,o,c]),material:s}},Vt=({size:e,dpr:t,...r},a)=>{const{scene:n,material:o,camera:s}=M({size:e,dpr:t,material:N,uniformValues:r});return{render:f.useCallback(l=>{const{gl:u}=l;a({gl:u,scene:n,camera:s})},[a,n,s]),material:o}},Pt=({size:e,dpr:t,pressureIterations:r,...a},n)=>{const{scene:o,material:s,camera:c}=M({size:e,dpr:t,material:X,uniformValues:a,customParameters:{iterations:r}});return{render:f.useCallback(u=>{const{gl:m}=u;for(let v=0;v<s.iterations;v++)n({gl:m,scene:o,camera:c},({read:p})=>{s.uniforms.pressure.value=p})},[n,s,o,c]),material:s}},Bt=({size:e,dpr:t,...r},a)=>{const{scene:n,material:o,camera:s}=M({size:e,dpr:t,material:K,uniformValues:r});return{render:f.useCallback(l=>{const{gl:u}=l;a({gl:u,scene:n,camera:s})},[a,n,s]),material:o}},Rt=({size:e,dpr:t,...r},a)=>{const{scene:n,material:o,camera:s}=M({size:e,dpr:t,material:G,uniformValues:r});return{render:f.useCallback(l=>{const{gl:u}=l;a({gl:u,scene:n,camera:s})},[a,n,s]),material:o}},L=e=>Object.fromEntries(Object.entries(e).filter(([,t])=>t!==void 0)),Fe=e=>{const{dissipation:t,deltaTime:r,bounce:a,pressureIterations:n,scale:o,force:s,...c}=e;return[{advection:L({dissipation:t,deltaTime:r}),divergence:L({bounce:a,deltaTime:r}),poisson:L({bounce:a}),pressure:L({bounce:a,deltaTime:r}),splat:L({scale:o}),pressureIterations:n,force:s},c]},It=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,...o})=>{const s=P(t),c={dpr:s.fbo,size:e,fboAutoSetSize:r,type:i.HalfFloatType,...a},[l,u]=b(c),[m,v]=b(c),[p,h]=b(c),[x,_]=re(c),[S,T]=b(c),[U,Ue]=Fe(o),D={size:e,dpr:s.shader},C=Et({...D,...U.advection,velocity:l.texture},v),E=Ot({...D,...U.splat,force:U.force},v),B=Vt({...D,...U.divergence,velocity:m.texture},h),V=Pt({...D,...U.poisson,divergence:p.texture,pressureIterations:U.pressureIterations},_),R=Bt({...D,...U.pressure,velocity:m.texture,pressure:x.read.texture},u),J=Rt({...D,...Ue,src:l.texture},T),ce=f.useCallback((le,ee=!0)=>{const[F,Kt]=Fe(le);J.material.setUniformValues(Kt,ee),C.material.setUniformValues(F.advection),B.material.setUniformValues(F.divergence),V.material.setUniformValues(F.poisson),R.material.setUniformValues(F.pressure),E.material.setUniformValues(F.splat),F.pressureIterations&&(V.material.iterations=F.pressureIterations),F.force&&(E.material.forceBias=F.force)},[J,C,B,V,R,E]);return{render:f.useCallback((le,ee)=>(ee&&ce(ee,!1),[C,E,B,V,R,J].forEach(F=>F==null?void 0:F.render(le)),S.texture),[ce,S.texture,C,E,B,V,R,J]),setValues:ce,texture:S.texture,velocity:l.texture}},kt=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,...o})=>{const s=P(t),{scene:c,material:l,camera:u}=M({size:e,dpr:s.shader,material:ge,uniformValues:o,materialParameters:n}),[m,v]=b({scene:c,camera:u,size:e,dpr:s.fbo,fboAutoSetSize:r,...a}),p=f.useCallback((x,_=!0)=>{l.setUniformValues(x,_)},[l]);return{render:f.useCallback((x,_)=>{const{gl:S}=x;return _&&p(_,!1),v({gl:S})},[p,v]),setValues:p,texture:m.texture,material:l,scene:c,camera:u,renderTarget:m}},Lt=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,...o})=>{const s=P(t),{scene:c,material:l,camera:u}=M({size:e,dpr:s.shader,material:Q,materialParameters:n,...o}),[m,v]=b({scene:c,camera:u,size:e,dpr:s.fbo,fboAutoSetSize:r,...a}),p=f.useCallback(x=>{l.setUniformValues(x)},[l]);return{render:f.useCallback((x,_)=>{const{gl:S}=x;return _&&p(_),v({gl:S})},[p,v]),setValues:p,texture:m.texture,material:l,scene:c,camera:u,renderTarget:m}},At=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,pointerLerp:o=1,...s})=>{const c=P(t),{scene:l,material:u,camera:m}=M({size:e,dpr:c.shader,material:Y,materialParameters:n,...s}),v={scene:l,camera:m,size:e,dpr:c.fbo,fboAutoSetSize:r,...a},[p,h]=b(v),[x,_]=re(v),[S,T]=Oe({pointerLerp:o}),U=f.useCallback(({pointerLerp:D,...C})=>{u.setUniformValues(C),D&&T({pointerLerp:D})},[u,T]);return{render:f.useCallback((D,C)=>{const{gl:E,clock:B,pointer:V}=D;return C&&U(C),u.uniforms.time.value=B.getElapsedTime(),u.uniforms.pointer.value.lerp(V,S.current.pointerLerp),_({gl:E},({read:R})=>u.uniforms.backbuffer.value=R),h({gl:E})},[U,h,u,_,S]),setValues:U,texture:p.texture,material:u,scene:l,camera:m,renderTarget:p}},$t=({size:e,dpr:t,fboAutoSetSize:r,renderTargetOptions:a,materialParameters:n,...o})=>{const s=P(t),{scene:c,material:l,camera:u}=M({size:e,dpr:s.shader,material:W,uniformValues:o,materialParameters:n}),[m,v]=b({scene:c,camera:u,size:e,dpr:s.fbo,fboAutoSetSize:r,...a}),p=f.useCallback((x,_=!0)=>{l.setUniformValues(x,_),l.setNearestFilter()},[l]);return{render:f.useCallback((x,_)=>{const{gl:S,clock:T}=x;return _&&p(_,!1),l.uniforms.tick.value=(_==null?void 0:_.tick)||T.getElapsedTime(),v({gl:S})},[p,v,l]),setValues:p,texture:m.texture,material:l,scene:c,camera:u,renderTarget:m}},Z=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const r=2.5949095;return e<.5?Math.pow(2*e,2)*((r+1)*2*e-r)/2:(Math.pow(2*e-2,2)*((r+1)*(e*2-2)+r)+2)/2},easeInElastic(e){const t=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*t)},easeOutElastic(e){const t=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*t)+1},easeInOutElastic(e){const t=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*t))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*t)/2+1},easeInBounce(e){return 1-Z.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-Z.easeOutBounce(1-2*e))/2:(1+Z.easeOutBounce(2*e-1))/2}});function jt(e){let t=Math.sin(e*12.9898)*43758.5453;return t-Math.floor(t)}const zt=(e,t="easeOutQuart")=>{const r=e/60,a=Z[t];return f.useCallback(o=>{let s=o.getElapsedTime()*r;const c=Math.floor(s),l=a(s-c);s=l+c;const u=jt(c);return{beat:s,floor:c,fract:l,hash:u}},[r,a])},Me={passive:!0},Nt=e=>{const t=f.useRef(new i.Vector2(0));return f.useEffect(()=>{const r=(o,s)=>{t.current.set((o-e.left)/e.width*2-1,-((s-e.top)/e.height)*2+1)},a=o=>{const s=o.touches[0];r(s.clientX,s.clientY)},n=o=>{r(o.clientX,o.clientY)};return window.addEventListener("touchmove",a,Me),window.addEventListener("pointermove",n,Me),()=>{window.removeEventListener("touchmove",a),window.removeEventListener("pointermove",n)}},[e]),t.current};d.BASICFX_VALUES=j,d.BlankMaterial=Y,d.BufferMaterial=ge,d.FluidMaterials=bt,d.GridMaterial=W,d.NoiseMaterial=ve,d.RawBlankMaterial=Q,d.getFxKeyFromUniforms=ae,d.handleUpdateFxDefines=fe,d.useBeat=zt,d.useBlank=At,d.useBuffer=kt,d.useDoubleFBO=re,d.useFluid=It,d.useGrid=$t,d.useNoise=Tt,d.usePointerTracker=ye,d.useRawBlank=Lt,d.useSingleFBO=b,d.useWindowPointer=Nt,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
