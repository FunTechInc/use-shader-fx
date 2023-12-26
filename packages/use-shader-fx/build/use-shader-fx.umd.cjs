(function(p,I){typeof exports=="object"&&typeof module<"u"?I(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],I):(p=typeof globalThis<"u"?globalThis:p||self,I(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,I,u){"use strict";function ae(t){const s=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(t){for(const r in t)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(s,r,e.get?e:{enumerable:!0,get:()=>t[r]})}}return s.default=t,Object.freeze(s)}const n=ae(I);var ie=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,se=`precision highp float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float width, float aspect) {
	
	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	
	vec2 dir = normalize(end - start);
	
	
	vec2 n = vec2(dir.y, -dir.x);

	vec2 p0 = point - start;
	
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	
	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < width && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < width || distFromEnd < width;

	return float(withinLine);
}

vec4 createSmudge(){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);
	
	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.0);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uMap, vUv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

vec4 createMotionBlur(vec4 baseColor, vec2 velocity, float motion, int samples) {
	vec4 motionBlurredColor = baseColor;
	vec2 scaledVelocity = velocity * motion;
	for(int i = 1; i < samples; i++) {
		float t = float(i) / float(samples - 1);
		vec2 offset = t * scaledVelocity / uResolution;
		motionBlurredColor += texture2D(uMap, vUv + offset);
	}
	return motionBlurredColor / float(samples);
}

void main() {
	
	vec2 st = vUv * 2.0 - 1.0;
	
	
	vec2 velocity = uVelocity * uResolution;

	
	vec4 smudgedColor = createSmudge();
	
	
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, velocity, uMotionBlur,uMotionSample);

	vec4 bufferColor = motionBlurredColor * uDissipation;

	
	float modifiedRadius = max(0.0,uRadius);

	
	vec3 color = uColor;

	
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	float onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect);
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);
	
	gl_FragColor = vec4(bufferColor.rgb,1.0);
}`;const F=(t,s=!1)=>{const r=s?t.width*s:t.width,e=s?t.height*s:t.height;return u.useMemo(()=>new n.Vector2(r,e),[r,e])},P=(t,s,r)=>{const e=u.useMemo(()=>new n.Mesh(s,r),[s,r]);return u.useEffect(()=>{t.add(e)},[t,e]),u.useEffect(()=>()=>{t.remove(e),s.dispose(),r.dispose()},[t,s,r,e]),e},i=(t,s,r)=>{t.uniforms&&t.uniforms[s]&&r!==void 0&&r!==null?t.uniforms[s].value=r:console.error(`Uniform key "${String(s)}" does not exist in the material. or "${String(s)}" is null | undefined`)},le=({scene:t,size:s,dpr:r})=>{const e=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),a=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:ie,fragmentShader:se}),[]),c=F(s,r);return u.useEffect(()=>{i(a,"uAspect",c.width/c.height),i(a,"uResolution",c.clone())},[c,a]),P(t,e,a),a},ce=(t,s)=>{const r=s,e=t/s,[a,c]=[r*e/2,r/2];return{width:a,height:c,near:-1e3,far:1e3}},_=t=>{const s=F(t),{width:r,height:e,near:a,far:c}=ce(s.x,s.y);return u.useMemo(()=>new n.OrthographicCamera(-r,r,e,-e,a,c),[r,e,a,c])},L={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},R=({scene:t,camera:s,size:r,dpr:e=!1,isSizeUpdate:a=!1})=>{const c=u.useRef(),v=F(r,e);c.current=u.useMemo(()=>new n.WebGLRenderTarget(v.x,v.y,L),[]),u.useLayoutEffect(()=>{var l;a&&((l=c.current)==null||l.setSize(v.x,v.y))},[v,a]),u.useEffect(()=>{const l=c.current;return()=>{l==null||l.dispose()}},[]);const o=u.useCallback((l,m)=>{const f=c.current;return l.setRenderTarget(f),m&&m({read:f.texture}),l.render(t,s),l.setRenderTarget(null),l.clear(),f.texture},[t,s]);return[c.current,o]},B=({scene:t,camera:s,size:r,dpr:e=!1,isSizeUpdate:a=!1})=>{const c=u.useRef({read:null,write:null,swap:function(){let m=this.read;this.read=this.write,this.write=m}}),v=F(r,e),o=u.useMemo(()=>{const m=new n.WebGLRenderTarget(v.x,v.y,L),f=new n.WebGLRenderTarget(v.x,v.y,L);return{read:m,write:f}},[]);c.current.read=o.read,c.current.write=o.write,u.useLayoutEffect(()=>{var m,f;a&&((m=c.current.read)==null||m.setSize(v.x,v.y),(f=c.current.write)==null||f.setSize(v.x,v.y))},[v,a]),u.useEffect(()=>{const m=c.current;return()=>{var f,d;(f=m.read)==null||f.dispose(),(d=m.write)==null||d.dispose()}},[]);const l=u.useCallback((m,f)=>{var g;const d=c.current;return m.setRenderTarget(d.write),f&&f({read:d.read.texture,write:d.write.texture}),m.render(t,s),d.swap(),m.setRenderTarget(null),m.clear(),(g=d.read)==null?void 0:g.texture},[t,s]);return[{read:c.current.read,write:c.current.write},l]},z=()=>{const t=u.useRef(new n.Vector2(0,0)),s=u.useRef(new n.Vector2(0,0)),r=u.useRef(0),e=u.useRef(new n.Vector2(0,0)),a=u.useRef(!1);return u.useCallback(v=>{const o=performance.now(),l=v.clone();r.current===0&&(r.current=o,t.current=l);const m=Math.max(1,o-r.current);r.current=o,e.current.copy(l).sub(t.current).divideScalar(m);const f=e.current.length()>0,d=a.current?t.current.clone():l;return!a.current&&f&&(a.current=!0),t.current=l,{currentPointer:l,prevPointer:d,diffPointer:s.current.subVectors(l,d),velocity:e.current,isVelocityUpdate:f}},[])},b=t=>{const s=a=>Object.values(a).some(c=>typeof c=="function"),r=u.useRef(s(t)?t:structuredClone(t)),e=u.useCallback(a=>{for(const c in a){const v=c;v in r.current&&a[v]!==void 0&&a[v]!==null?r.current[v]=a[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[r.current,e]},j={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},ve=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=le({scene:r,size:t,dpr:s}),a=_(t),c=z(),[v,o]=B({scene:r,camera:a,size:t,dpr:s}),[l,m]=b(j);return[u.useCallback((d,g)=>{const{gl:x,pointer:M}=d;g&&m(g),i(e,"uTexture",l.texture),i(e,"uRadius",l.radius),i(e,"uSmudge",l.smudge),i(e,"uDissipation",l.dissipation),i(e,"uMotionBlur",l.motionBlur),i(e,"uMotionSample",l.motionSample),i(e,"uColor",l.color);const{currentPointer:y,prevPointer:T,velocity:D}=c(M);return i(e,"uMouse",y),i(e,"uPrevMouse",T),i(e,"uVelocity",D),o(x,({read:U})=>{i(e,"uMap",U)})},[e,c,o,l,m]),m,{scene:r,material:e,camera:a,renderTarget:v}]};var fe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,de=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;

uniform vec3 uColor0;
uniform vec3 uColor1;

void main() {
	vec2 uv = vUv;
	vec4 texColor = texture2D(uTexture, uv);
	float grayscale = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
	vec3 duotone = mix(uColor0, uColor1, grayscale);
	gl_FragColor = vec4(duotone, texColor.a);
}`;const me=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:fe,fragmentShader:de}),[]);return P(t,s,r),r},G={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},pe=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=me(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(G);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"uTexture",o.texture),i(e,"uColor0",o.color0),i(e,"uColor1",o.color1),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var ge=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,xe=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D u_map;
uniform float u_mapIntensity;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;
uniform vec3 u_dodgeColor;
uniform bool u_isDodgeColor;

void main() {
	vec2 uv = vUv;

	vec3 mapColor = texture2D(u_map, uv).rgb;
	vec3 normalizedMap = mapColor * 2.0 - 1.0;

	float brightness = dot(mapColor,u_brightness);
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(u_texture, uv);

	float blendValue = smoothstep(u_min, u_max, brightness);

	vec3 dodgeColor = u_isDodgeColor ? u_dodgeColor : mapColor;

	vec3 outputColor = blendValue * dodgeColor + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;const he=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new n.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:ge,fragmentShader:xe}),[]);return P(t,s,r),r},W={texture:new n.Texture,map:new n.Texture,mapIntensity:.3,brightness:new n.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},ye=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=he(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(W);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"u_texture",o.texture),i(e,"u_map",o.map),i(e,"u_mapIntensity",o.mapIntensity),i(e,"u_brightness",o.brightness),i(e,"u_min",o.min),i(e,"u_max",o.max),o.dodgeColor?(i(e,"u_dodgeColor",o.dodgeColor),i(e,"u_isDodgeColor",!0)):i(e,"u_isDodgeColor",!1),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var A=`varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main () {
	vUv = uv;
	vL = vUv - vec2(texelSize.x, 0.0);
	vR = vUv + vec2(texelSize.x, 0.0);
	vT = vUv + vec2(0.0, texelSize.y);
	vB = vUv - vec2(0.0, texelSize.y);
	gl_Position = vec4(position, 1.0);
}`,Me=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Te=()=>u.useMemo(()=>new n.ShaderMaterial({vertexShader:A,fragmentShader:Me,depthTest:!1,depthWrite:!1}),[]);var Se=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = dissipation * texture2D(uSource, coord);
	gl_FragColor.a = 1.0;
}`;const we=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:A,fragmentShader:Se}),[]);var _e=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

vec2 sampleVelocity (in vec2 uv) {
	vec2 multiplier = vec2(1.0, 1.0);
	if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
	if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
	if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
	if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
	return multiplier * texture2D(uVelocity, uv).xy;
}

void main () {
	float L = sampleVelocity(vL).x;
	float R = sampleVelocity(vR).x;
	float T = sampleVelocity(vT).y;
	float B = sampleVelocity(vB).y;
	float div = 0.5 * (R - L + T - B);
	gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;const Re=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:_e}),[]);var be=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

vec2 boundary (in vec2 uv) {
	uv = min(max(uv, 0.0), 1.0);
	return uv;
}

void main () {
	float L = texture2D(uPressure, boundary(vL)).x;
	float R = texture2D(uPressure, boundary(vR)).x;
	float T = texture2D(uPressure, boundary(vT)).x;
	float B = texture2D(uPressure, boundary(vB)).x;
	float C = texture2D(uPressure, vUv).x;
	float divergence = texture2D(uDivergence, vUv).x;
	float pressure = (L + R + B + T - divergence) * 0.25;
	gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;const Ce=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:be}),[]);var De=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uVelocity, vL).y;
	float R = texture2D(uVelocity, vR).y;
	float T = texture2D(uVelocity, vT).x;
	float B = texture2D(uVelocity, vB).x;
	float vorticity = R - L - T + B;
	gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}`;const Pe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:De}),[]);var Ue=`precision highp float;

varying vec2 vUv;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main () {
	float T = texture2D(uCurl, vT).x;
	float B = texture2D(uCurl, vB).x;
	float C = texture2D(uCurl, vUv).x;
	vec2 force = vec2(abs(T) - abs(B), 0.0);
	force *= 1.0 / length(force + 0.00001) * curl * C;
	vec2 vel = texture2D(uVelocity, vUv).xy;
	gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}`;const Ve=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ue}),[]);var Fe=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ae=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Fe}),[]);var Be=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

vec2 boundary (in vec2 uv) {
	uv = min(max(uv, 0.0), 1.0);
	return uv;
}

void main () {
	float L = texture2D(uPressure, boundary(vL)).x;
	float R = texture2D(uPressure, boundary(vR)).x;
	float T = texture2D(uPressure, boundary(vT)).x;
	float B = texture2D(uPressure, boundary(vB)).x;
	vec2 velocity = texture2D(uVelocity, vUv).xy;
	velocity.xy -= vec2(R - L, T - B);
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;const Oe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Be}),[]);var Ee=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
	vec2 nPoint = (point + vec2(1.0)) * 0.5;
	vec2 p = vUv - nPoint.xy;
	p.x *= aspectRatio;
	vec3 splat = exp(-dot(p, p) / radius) * color;
	vec3 base = texture2D(uTarget, vUv).xyz;
	gl_FragColor = vec4(base + splat, 1.0);
}`;const Ie=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ee}),[]),Le=({scene:t,size:s,dpr:r})=>{const e=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),a=Te(),c=a.clone(),v=Pe(),o=Ve(),l=we(),m=Re(),f=Ce(),d=Ae(),g=Oe(),x=Ie(),M=u.useMemo(()=>({vorticityMaterial:o,curlMaterial:v,advectionMaterial:l,divergenceMaterial:m,pressureMaterial:f,clearMaterial:d,gradientSubtractMaterial:g,splatMaterial:x}),[o,v,l,m,f,d,g,x]),y=F(s,r);u.useEffect(()=>{i(M.splatMaterial,"aspectRatio",y.x/y.y);for(const w of Object.values(M))i(w,"texelSize",new n.Vector2(1/y.x,1/y.y))},[y,M]);const T=P(t,e,a);u.useEffect(()=>{a.dispose(),T.material=c},[a,T,c]),u.useEffect(()=>()=>{for(const w of Object.values(M))w.dispose()},[M]);const D=u.useCallback(w=>{T.material=w,T.material.needsUpdate=!0},[T]);return[M,D]},X={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new n.Vector3(1,1,1)},ze=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),[e,a]=Le({scene:r,size:t,dpr:s}),c=_(t),v=z(),o=u.useMemo(()=>({scene:r,camera:c,size:t}),[r,c,t]),[l,m]=B(o),[f,d]=B(o),[g,x]=R(o),[M,y]=R(o),[T,D]=B(o),w=u.useRef(0),U=u.useRef(new n.Vector2(0,0)),O=u.useRef(new n.Vector3(0,0,0)),[C,h]=b(X);return[u.useCallback((bn,te)=>{const{gl:V,pointer:Cn,clock:N,size:re}=bn;te&&h(te),w.current===0&&(w.current=N.getElapsedTime());const oe=Math.min((N.getElapsedTime()-w.current)/3,.02);w.current=N.getElapsedTime();const k=m(V,({read:S})=>{a(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",S),i(e.advectionMaterial,"uSource",S),i(e.advectionMaterial,"dt",oe),i(e.advectionMaterial,"dissipation",C.velocity_dissipation)}),Dn=d(V,({read:S})=>{a(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",k),i(e.advectionMaterial,"uSource",S),i(e.advectionMaterial,"dissipation",C.density_dissipation)}),{currentPointer:Pn,diffPointer:Un,isVelocityUpdate:Vn,velocity:Fn}=v(Cn);Vn&&(m(V,({read:S})=>{a(e.splatMaterial),i(e.splatMaterial,"uTarget",S),i(e.splatMaterial,"point",Pn);const E=Un.multiply(U.current.set(re.width,re.height).multiplyScalar(C.velocity_acceleration));i(e.splatMaterial,"color",O.current.set(E.x,E.y,1)),i(e.splatMaterial,"radius",C.splat_radius)}),d(V,({read:S})=>{a(e.splatMaterial),i(e.splatMaterial,"uTarget",S);const E=typeof C.fluid_color=="function"?C.fluid_color(Fn):C.fluid_color;i(e.splatMaterial,"color",E)}));const An=x(V,()=>{a(e.curlMaterial),i(e.curlMaterial,"uVelocity",k)});m(V,({read:S})=>{a(e.vorticityMaterial),i(e.vorticityMaterial,"uVelocity",S),i(e.vorticityMaterial,"uCurl",An),i(e.vorticityMaterial,"curl",C.curl_strength),i(e.vorticityMaterial,"dt",oe)});const Bn=y(V,()=>{a(e.divergenceMaterial),i(e.divergenceMaterial,"uVelocity",k)});D(V,({read:S})=>{a(e.clearMaterial),i(e.clearMaterial,"uTexture",S),i(e.clearMaterial,"value",C.pressure_dissipation)}),a(e.pressureMaterial),i(e.pressureMaterial,"uDivergence",Bn);let ue;for(let S=0;S<C.pressure_iterations;S++)ue=D(V,({read:E})=>{i(e.pressureMaterial,"uPressure",E)});return m(V,({read:S})=>{a(e.gradientSubtractMaterial),i(e.gradientSubtractMaterial,"uPressure",ue),i(e.gradientSubtractMaterial,"uVelocity",S)}),Dn},[e,a,x,d,y,v,D,m,h,C]),h,{scene:r,materials:e,camera:c,renderTarget:{velocity:l,density:f,curl:g,divergence:M,pressure:T}}]},$e=({scale:t,max:s,texture:r,scene:e})=>{const a=u.useRef([]),c=u.useMemo(()=>new n.PlaneGeometry(t,t),[t]),v=u.useMemo(()=>new n.MeshBasicMaterial({map:r??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return u.useEffect(()=>{for(let o=0;o<s;o++){const l=new n.Mesh(c.clone(),v.clone());l.rotateZ(2*Math.PI*Math.random()),l.visible=!1,e.add(l),a.current.push(l)}},[c,v,e,s]),u.useEffect(()=>()=>{a.current.forEach(o=>{o.geometry.dispose(),Array.isArray(o.material)?o.material.forEach(l=>l.dispose()):o.material.dispose(),e.remove(o)}),a.current=[]},[e]),a.current},H={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},Ne=({texture:t,scale:s=64,max:r=100,size:e})=>{const a=u.useMemo(()=>new n.Scene,[]),c=$e({scale:s,max:r,texture:t,scene:a}),v=_(e),o=z(),[l,m]=R({scene:a,camera:v,size:e}),[f,d]=b(H),g=u.useRef(0);return[u.useCallback((M,y)=>{const{gl:T,pointer:D,size:w}=M;y&&d(y);const{currentPointer:U,diffPointer:O}=o(D);if(f.frequency<O.length()){const h=c[g.current];h.visible=!0,h.position.set(U.x*(w.width/2),U.y*(w.height/2),0),h.scale.x=h.scale.y=0,h.material.opacity=f.alpha,g.current=(g.current+1)%r}return c.forEach(h=>{if(h.visible){const $=h.material;h.rotation.z+=f.rotation,$.opacity*=f.fadeout_speed,h.scale.x=f.fadeout_speed*h.scale.x+f.scale,h.scale.y=h.scale.x,$.opacity<.002&&(h.visible=!1)}}),m(T)},[m,c,o,r,f,d]),d,{scene:a,camera:v,meshArr:c,renderTarget:l}]};var ke=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,je=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uMap;
uniform float mapIntensity;
uniform float edgeIntensity;
uniform float progress;
uniform float dirX;
uniform float dirY;
uniform vec2 epicenter;
uniform float padding;

bool isInPaddingArea(vec2 uv) {
   return uv.x < padding || uv.x > 1.0 - padding || uv.y < padding || uv.y > 1.0 - padding;
}

void main() {
	vec2 bgRatio=vec2(
		min((uResolution.x/uResolution.y)/(uTextureResolution.x/uTextureResolution.y),1.),
		min((uResolution.y/uResolution.x)/(uTextureResolution.y/uTextureResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	
	vec2 map = texture2D(uMap, uv).rg;
	vec2 normalizedMap = map * 2.0 - 1.0;

	
	uv = uv * 2.0 - 1.0;
	uv *= map * distance(epicenter, uv) * edgeIntensity + 1.0;
	uv = (uv + 1.0) / 2.0;

	
	if (isInPaddingArea(uv)) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}
	vec2 paddedUV = uv * (1.0 - 2.0 * padding * -1.) + padding * -1.;

	
	vec2 centeredUV = paddedUV - vec2(0.5);

	
	centeredUV *= normalizedMap * map * mapIntensity + 1.0;

	
	float xOffsetTexture0 = 0.5 - dirX * progress;
	float yOffsetTexture0 = 0.5 - dirY * progress;
	vec2 samplePosTexture0 = vec2(xOffsetTexture0, yOffsetTexture0) + centeredUV;

	
	float xOffsetTexture1 = 0.5 + dirX * (1.0 - progress);
	float yOffsetTexture1 = 0.5 + dirY * (1.0 - progress);
	vec2 samplePosTexture1 = vec2(xOffsetTexture1, yOffsetTexture1) + centeredUV;

	vec4 color0 = texture2D(uTexture0, samplePosTexture0);
	vec4 color1 = texture2D(uTexture1, samplePosTexture1);

	gl_FragColor = mix(color0, color1, progress);

}`;const Ge=({scene:t,size:s,dpr:r})=>{const e=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),a=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},padding:{value:0},uMap:{value:new n.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new n.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:ke,fragmentShader:je}),[]),c=F(s,r);return u.useEffect(()=>{a.uniforms.uResolution.value=c.clone()},[c,a]),P(t,e,a),a},Y={texture0:new n.Texture,texture1:new n.Texture,textureResolution:new n.Vector2(0,0),padding:0,map:new n.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new n.Vector2(0,0),progress:0,dir:new n.Vector2(0,0)},We=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=Ge({scene:r,size:t,dpr:s}),a=_(t),[c,v]=R({scene:r,camera:a,dpr:s,size:t,isSizeUpdate:!0}),[o,l]=b(Y);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"uTexture0",o.texture0),i(e,"uTexture1",o.texture1),i(e,"uTextureResolution",o.textureResolution),i(e,"padding",o.padding),i(e,"uMap",o.map),i(e,"mapIntensity",o.mapIntensity),i(e,"edgeIntensity",o.edgeIntensity),i(e,"epicenter",o.epicenter),i(e,"progress",o.progress),i(e,"dirX",o.dir.x),i(e,"dirY",o.dir.y),v(g)},[v,e,o,l]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var Xe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,He=`precision highp float;
precision highp int;

varying vec2 vUv;
uniform float uTime;
uniform float timeStrength;
uniform int noiseOctaves;
uniform int fbmOctaves;
uniform int warpOctaves;
uniform vec2 warpDirection;
uniform float warpStrength;
uniform float scale;

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

float noise(vec2 p, float time){
	float t = 0.0;
	for(int i = 0; i < noiseOctaves; i++){
		float freq = pow(2.0, float(i));
		float amp  = pow(per, float(noiseOctaves - i));
		t += irnd(vec2(p.y / freq + time, p.x / freq + time)) * amp;
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
	float noise = warp(gl_FragCoord.xy * scale ,warpStrength,uTime * timeStrength);
	gl_FragColor = vec4(vec3(noise),1.0);
}`;const Ye=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new n.Vector2},warpStrength:{value:0}},vertexShader:Xe,fragmentShader:He}),[]);return P(t,s,r),r},q={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new n.Vector2(2,2),warpStrength:8},qe=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=Ye(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(q);return[u.useCallback((f,d)=>{const{gl:g,clock:x}=f;return d&&l(d),i(e,"scale",o.scale),i(e,"timeStrength",o.timeStrength),i(e,"noiseOctaves",o.noiseOctaves),i(e,"fbmOctaves",o.fbmOctaves),i(e,"warpOctaves",o.warpOctaves),i(e,"warpDirection",o.warpDirection),i(e,"warpStrength",o.warpStrength),i(e,"uTime",x.getElapsedTime()),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]},Ke=t=>{var a,c,v;const s=(a=t.dom)==null?void 0:a.length,r=(c=t.texture)==null?void 0:c.length,e=(v=t.resolution)==null?void 0:v.length;if(!s||!r||!e)throw new Error("No dom or texture or resolution is set");if(s!==r||s!==e)throw new Error("Match dom, texture and resolution length")};var Ze=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Je=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_textureResolution;
uniform vec2 u_resolution;
uniform float u_borderRadius;

void main() {
	
	vec2 ratio = vec2(
		min((u_resolution.x / u_resolution.y) / (u_textureResolution.x / u_textureResolution.y), 1.0),
		min((u_resolution.y / u_resolution.x) / (u_textureResolution.y / u_textureResolution.x), 1.0)
	);
	vec2 adjustedUv = vUv * ratio + (1.0 - ratio) * 0.5;
	vec3 textureColor = texture2D(u_texture, adjustedUv).rgb;
	float textureAlpha = texture2D(u_texture, adjustedUv).a;

	
	float maxSide = max(u_resolution.x, u_resolution.y);
	float minSide = min(u_resolution.x, u_resolution.y);
	vec2 aspect = u_resolution / maxSide;
	vec2 alphaUv = vUv - 0.5;

	float borderRadius = min(u_borderRadius, minSide * 0.5);
	vec2 offset = vec2(borderRadius) / u_resolution;
	vec2 alphaXY = smoothstep(vec2(0.5 - offset), vec2(0.5 - offset - 0.001), abs(alphaUv));
	float alpha = min(1.0, alphaXY.x + alphaXY.y);

	vec2 alphaUv2 = abs(vUv - 0.5);
	float radius = borderRadius / maxSide;
	alphaUv2 = (alphaUv2 - 0.5) * aspect + radius;
	float roundAlpha = smoothstep(radius + 0.001, radius, length(alphaUv2));

	alpha = min(1.0, alpha + roundAlpha);

	
	alpha *= textureAlpha;

	gl_FragColor = vec4(textureColor, alpha);
}`;const Qe=({params:t,size:s,scene:r})=>{r.children.length>0&&(r.children.forEach(e=>{e instanceof n.Mesh&&(e.geometry.dispose(),e.material.dispose())}),r.remove(...r.children)),t.texture.forEach((e,a)=>{const c=new n.Mesh(new n.PlaneGeometry(1,1),new n.ShaderMaterial({vertexShader:Ze,fragmentShader:Je,transparent:!0,uniforms:{u_texture:{value:e},u_textureResolution:{value:new n.Vector2(0,0)},u_resolution:{value:new n.Vector2(0,0)},u_borderRadius:{value:t.boderRadius[a]?t.boderRadius[a]:0}}}));r.add(c)})},en=()=>{const t=u.useRef([]),s=u.useRef([]);return u.useCallback(({isIntersectingRef:e,isIntersectingOnceRef:a,params:c})=>{t.current.length>0&&t.current.forEach((o,l)=>{o.unobserve(s.current[l])}),s.current=[],t.current=[];const v=new Array(c.dom.length).fill(!1);e.current=[...v],a.current=[...v],c.dom.forEach((o,l)=>{const m=d=>{d.forEach(g=>{c.onIntersect[l]&&c.onIntersect[l](g),e.current[l]=g.isIntersecting})},f=new IntersectionObserver(m,{rootMargin:"0px",threshold:0});f.observe(o),t.current.push(f),s.current.push(o)})},[])},nn=()=>{const t=u.useRef([]),s=u.useCallback(({params:r,size:e,resolutionRef:a,scene:c,isIntersectingRef:v})=>{c.children.length!==t.current.length&&(t.current=new Array(c.children.length)),c.children.forEach((o,l)=>{const m=r.dom[l];if(!m)throw new Error("DOM is null.");const f=m.getBoundingClientRect();if(t.current[l]=f,o.scale.set(f.width,f.height,1),o.position.set(f.left+f.width*.5-e.width*.5,-f.top-f.height*.5+e.height*.5,0),v.current[l]&&(r.rotation[l]&&o.rotation.copy(r.rotation[l]),o instanceof n.Mesh)){const d=o.material;i(d,"u_texture",r.texture[l]),i(d,"u_textureResolution",r.resolution[l]),i(d,"u_resolution",a.current.set(f.width,f.height)),i(d,"u_borderRadius",r.boderRadius[l]?r.boderRadius[l]:0)}})},[]);return[t.current,s]},tn=()=>{const t=u.useRef([]),s=u.useRef([]),r=u.useCallback((e,a=!1)=>{t.current.forEach((v,o)=>{v&&(s.current[o]=!0)});const c=a?[...s.current]:[...t.current];return e<0?c:c[e]},[]);return{isIntersectingRef:t,isIntersectingOnceRef:s,isIntersecting:r}},K={texture:[],dom:[],resolution:[],boderRadius:[],rotation:[],onIntersect:[]},rn=({size:t,dpr:s},r=[])=>{const e=u.useMemo(()=>new n.Scene,[]),a=_(t),[c,v]=R({scene:e,camera:a,size:t,dpr:s,isSizeUpdate:!0}),[o,l]=b(K),[m,f]=nn(),d=u.useRef(new n.Vector2(0,0)),[g,x]=u.useState(!0);u.useEffect(()=>{x(!0)},r);const M=en(),{isIntersectingOnceRef:y,isIntersectingRef:T,isIntersecting:D}=tn();return[u.useCallback((U,O)=>{const{gl:C,size:h}=U;return O&&l(O),Ke(o),g&&(Qe({params:o,size:h,scene:e}),M({isIntersectingRef:T,isIntersectingOnceRef:y,params:o}),x(!1)),f({params:o,size:h,resolutionRef:d,scene:e,isIntersectingRef:T}),v(C)},[v,l,M,f,g,e,o,y,T]),l,{scene:e,camera:a,renderTarget:c,isIntersecting:D,DOMRects:m}]};var on=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,un=`precision mediump float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uBlurSize;

void main() {
	vec2 uv = vUv;	
	vec2 perDivSize = uBlurSize / uResolution;

	
	vec4 outColor = vec4(
		texture2D(uTexture, uv + perDivSize * vec2(-1.0, -1.0)) +
		texture2D(uTexture, uv + perDivSize * vec2(0.0, -1.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(1.0, -1.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(-1.0, 0.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(0.0,  0.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(1.0,  0.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(-1.0, 1.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(0.0,  1.0)) + 
		texture2D(uTexture, uv + perDivSize * vec2(1.0,  1.0))
		) / 9.0;
	
	gl_FragColor = outColor;
}`;const an=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:on,fragmentShader:un}),[]);return P(t,s,r),r},Z={texture:new n.Texture,blurSize:3,blurPower:5},sn=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=an(r),a=_(t),c=u.useMemo(()=>({scene:r,camera:a,size:t,dpr:s}),[r,a,t,s]),[v,o]=R(c),[l,m]=B(c),[f,d]=b(Z);return[u.useCallback((x,M)=>{const{gl:y}=x;M&&d(M),i(e,"uTexture",f.texture),i(e,"uResolution",[f.texture.source.data.width,f.texture.source.data.height]),i(e,"uBlurSize",f.blurSize);let T=m(y);const D=f.blurPower;for(let U=0;U<D;U++)i(e,"uTexture",T),T=m(y);return o(y)},[o,m,e,d,f]),d,{scene:r,material:e,camera:a,renderTarget:v}]};var ln=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,cn=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uStrength;
uniform float uWidth;
uniform vec2 uEpicenter;
uniform int uMode;

float PI = 3.141592653589;

void main() {
	float progress = min(uProgress, 1.0);
	float progressFactor = sin(progress * PI);

	float border = progress - progress * progressFactor * uWidth;
	float blur = uStrength * progressFactor;
	
	
	vec2 normalizeCenter = (uEpicenter + 1.0) / 2.0;

	
	float dist = uMode == 0 ? length(vUv - normalizeCenter) : uMode == 1 ? length(vUv.x - normalizeCenter.x) : length(vUv.y - normalizeCenter.y);

	
	float maxDistance = max(
		length(vec2(0.0, 0.0) - normalizeCenter),
		max(
				length(vec2(1.0, 0.0) - normalizeCenter),
				max(
					length(vec2(0.0, 1.0) - normalizeCenter),
					length(vec2(1.0, 1.0) - normalizeCenter)
				)
		)
	);

	
	dist = maxDistance > 0.0 ? dist / maxDistance : dist;

	vec3 color = vec3(smoothstep(border - blur, border, dist) -
                  smoothstep(progress, progress + blur, dist));
	
	
	color *= progressFactor;

	gl_FragColor = vec4(color, 1.0);
}`;const vn=({scene:t,size:s,dpr:r})=>{const e=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),a=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uEpicenter:{value:new n.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uResolution:{value:new n.Vector2},uMode:{value:0}},vertexShader:ln,fragmentShader:cn}),[]),c=F(s,r);return u.useEffect(()=>{a.uniforms.uResolution.value=c.clone()},[c,a]),P(t,e,a),a},J={epicenter:new n.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},fn=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=vn({scene:r,size:t,dpr:s}),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s,isSizeUpdate:!0}),[o,l]=b(J);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"uEpicenter",o.epicenter),i(e,"uProgress",o.progress),i(e,"uWidth",o.width),i(e,"uStrength",o.strength),i(e,"uMode",o.mode==="center"?0:o.mode==="horizontal"?1:2),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var dn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,mn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(u_texture, uv).rgb;
	float brightness = dot(color,u_brightness);
	float alpha = clamp(smoothstep(u_min, u_max, brightness),0.0,1.0);
	gl_FragColor = vec4(color, alpha);
}`;const pn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:dn,fragmentShader:mn}),[]);return P(t,s,r),r},Q={texture:new n.Texture,brightness:new n.Vector3(.5,.5,.5),min:0,max:1},gn=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=pn(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(Q);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"u_texture",o.texture),i(e,"u_brightness",o.brightness),i(e,"u_min",o.min),i(e,"u_max",o.max),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var xn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,hn=`precision highp float;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform bool isTexture;
uniform sampler2D noise;
uniform bool isNoise;
uniform vec2 noiseStrength;
uniform float laminateLayer;
uniform vec2 laminateInterval;
uniform vec2 laminateDetail;
uniform vec2 distortion;
uniform vec3 colorFactor;
uniform float uTime;
uniform vec2 timeStrength;
uniform float scale;

void main() {
	vec2 uv = vUv;

	vec2 pos = isTexture ? texture2D(uTexture, uv).rg : uv * scale;
	vec2 noise = isNoise ? texture2D(noise, uv).rg : vec2(0.0);
	float alpha = isTexture ? texture2D(uTexture, uv).a : 1.0;
	
	alpha = (alpha < 1e-10) ? 0.0 : alpha;

	vec3 col;
	for(float j = 0.0; j < 3.0; j++){
		for(float i = 1.0; i < laminateLayer; i++){
			float timeNoiseSin = sin(uTime / (i + j)) * timeStrength.x + noise.r * noiseStrength.x;
			float timeNoiseCos = cos(uTime / (i + j)) * timeStrength.y + noise.g * noiseStrength.y;
			pos.x += laminateInterval.x / (i + j) * cos(i * distortion.x * pos.y + timeNoiseSin + sin(i + j));
			pos.y += laminateInterval.y / (i + j) * cos(i * distortion.y * pos.x + timeNoiseCos + sin(i + j));
		}
		col[int(j)] = sin(pow(pos.x, 2.) * pow(laminateDetail.x, 2.)) + sin(pow(pos.y, 2.) * pow(laminateDetail.y, 2.));
	}

	col *= colorFactor * alpha;
	col = clamp(col, 0.0, 1.0);
	
	gl_FragColor = vec4(col, alpha);
}`;const yn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new n.Texture},noiseStrength:{value:new n.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new n.Vector2(.1,.1)},laminateDetail:{value:new n.Vector2(1,1)},distortion:{value:new n.Vector2(0,0)},colorFactor:{value:new n.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new n.Vector2(0,0)}},vertexShader:xn,fragmentShader:hn}),[]);return P(t,s,r),r},ee={texture:!1,scale:1,laminateLayer:1,laminateInterval:new n.Vector2(.1,.1),laminateDetail:new n.Vector2(1,1),distortion:new n.Vector2(0,0),colorFactor:new n.Vector3(1,1,1),timeStrength:new n.Vector2(0,0),noise:!1,noiseStrength:new n.Vector2(0,0)},Mn=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=yn(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(ee);return[u.useCallback((f,d)=>{const{gl:g,clock:x}=f;return d&&l(d),o.texture?(i(e,"uTexture",o.texture),i(e,"isTexture",!0)):(i(e,"isTexture",!1),i(e,"scale",o.scale)),o.noise?(i(e,"noise",o.noise),i(e,"isNoise",!0),i(e,"noiseStrength",o.noiseStrength)):i(e,"isNoise",!1),i(e,"uTime",x.getElapsedTime()),i(e,"laminateLayer",o.laminateLayer),i(e,"laminateInterval",o.laminateInterval),i(e,"laminateDetail",o.laminateDetail),i(e,"distortion",o.distortion),i(e,"colorFactor",o.colorFactor),i(e,"timeStrength",o.timeStrength),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]};var Tn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Sn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D u_map;
uniform float u_mapIntensity;

void main() {
	vec2 uv = vUv;

	vec2 mapColor = texture2D(u_map, uv).rg;
	vec2 normalizedMap = mapColor * 2.0 - 1.0;
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	gl_FragColor = texture2D(u_texture, uv);
}`;const wn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0}},vertexShader:Tn,fragmentShader:Sn}),[]);return P(t,s,r),r},ne={texture:new n.Texture,map:new n.Texture,mapIntensity:.3},_n=({size:t,dpr:s})=>{const r=u.useMemo(()=>new n.Scene,[]),e=wn(r),a=_(t),[c,v]=R({scene:r,camera:a,size:t,dpr:s}),[o,l]=b(ne);return[u.useCallback((f,d)=>{const{gl:g}=f;return d&&l(d),i(e,"u_texture",o.texture),i(e,"u_map",o.map),i(e,"u_mapIntensity",o.mapIntensity),v(g)},[v,e,l,o]),l,{scene:r,material:e,camera:a,renderTarget:c}]},Rn=({scene:t,camera:s,size:r,dpr:e=!1,isSizeUpdate:a=!1},c)=>{const v=u.useRef([]),o=F(r,e);v.current=u.useMemo(()=>Array.from({length:c},()=>new n.WebGLRenderTarget(o.x,o.y,L)),[c]),u.useLayoutEffect(()=>{a&&v.current.forEach(m=>m.setSize(o.x,o.y))},[o,a]),u.useEffect(()=>{const m=v.current;return()=>{m.forEach(f=>f.dispose())}},[c]);const l=u.useCallback((m,f,d)=>{const g=v.current[f];return m.setRenderTarget(g),d&&d({read:g.texture}),m.render(t,s),m.setRenderTarget(null),m.clear(),g.texture},[t,s]);return[v.current,l]};p.BLENDING_PARAMS=W,p.BRIGHTNESSPICKER_PARAMS=Q,p.BRUSH_PARAMS=j,p.COLORSTRATA_PARAMS=ee,p.DOMSYNCER_PARAMS=K,p.DUOTONE_PARAMS=G,p.FLUID_PARAMS=X,p.FXBLENDING_PARAMS=ne,p.FXTEXTURE_PARAMS=Y,p.NOISE_PARAMS=q,p.RIPPLE_PARAMS=H,p.SIMPLEBLUR_PARAMS=Z,p.WAVE_PARAMS=J,p.setUniform=i,p.useAddMesh=P,p.useBlending=ye,p.useBrightnessPicker=gn,p.useBrush=ve,p.useCamera=_,p.useColorStrata=Mn,p.useCopyTexture=Rn,p.useDomSyncer=rn,p.useDoubleFBO=B,p.useDuoTone=pe,p.useFluid=ze,p.useFxBlending=_n,p.useFxTexture=We,p.useNoise=qe,p.useParams=b,p.usePointer=z,p.useResolution=F,p.useRipple=Ne,p.useSimpleBlur=sn,p.useSingleFBO=R,p.useWave=fn,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
