(function(p,L){typeof exports=="object"&&typeof module<"u"?L(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],L):(p=typeof globalThis<"u"?globalThis:p||self,L(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,L,i){"use strict";function oe(n){const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(n){for(const r in n)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(n,r);Object.defineProperty(a,r,e.get?e:{enumerable:!0,get:()=>n[r]})}}return a.default=n,Object.freeze(a)}const t=oe(L);var ue=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ie=`precision highp float;

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
}`;const F=(n,a=!1)=>{const r=a?n.width*a:n.width,e=a?n.height*a:n.height;return i.useMemo(()=>new t.Vector2(r,e),[r,e])},U=(n,a,r)=>{const e=i.useMemo(()=>new t.Mesh(a,r),[a,r]);return i.useEffect(()=>{n.add(e)},[n,e]),i.useEffect(()=>()=>{n.remove(e),a.dispose(),r.dispose()},[n,a,r,e]),e},c=(n,a,r)=>{n.uniforms&&n.uniforms[a]&&r!==void 0&&r!==null?n.uniforms[a].value=r:console.error(`Uniform key "${String(a)}" does not exist in the material. or "${String(a)}" is null | undefined`)},ae=({scene:n,size:a,dpr:r})=>{const e=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uMap:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new t.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(0,0)},uPrevMouse:{value:new t.Vector2(0,0)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Color(16777215)}},vertexShader:ue,fragmentShader:ie}),[]),s=F(a,r);return i.useEffect(()=>{c(o,"uAspect",s.width/s.height),c(o,"uResolution",s.clone())},[s,o]),U(n,e,o),o},se=(n,a)=>{const r=a,e=n/a,[o,s]=[r*e/2,r/2];return{width:o,height:s,near:-1e3,far:1e3}},b=n=>{const a=F(n),{width:r,height:e,near:o,far:s}=se(a.x,a.y);return i.useMemo(()=>new t.OrthographicCamera(-r,r,e,-e,o,s),[r,e,o,s])},I={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},_=({scene:n,camera:a,size:r,dpr:e=!1,isSizeUpdate:o=!1})=>{const s=i.useRef(),v=F(r,e);s.current=i.useMemo(()=>new t.WebGLRenderTarget(v.x,v.y,I),[]),i.useLayoutEffect(()=>{var l;o&&((l=s.current)==null||l.setSize(v.x,v.y))},[v,o]),i.useEffect(()=>{const l=s.current;return()=>{l==null||l.dispose()}},[]);const u=i.useCallback((l,d)=>{const f=s.current;return l.setRenderTarget(f),d&&d({read:f.texture}),l.render(n,a),l.setRenderTarget(null),l.clear(),f.texture},[n,a]);return[s.current,u]},A=({scene:n,camera:a,size:r,dpr:e=!1,isSizeUpdate:o=!1})=>{const s=i.useRef({read:null,write:null,swap:function(){let d=this.read;this.read=this.write,this.write=d}}),v=F(r,e),u=i.useMemo(()=>{const d=new t.WebGLRenderTarget(v.x,v.y,I),f=new t.WebGLRenderTarget(v.x,v.y,I);return{read:d,write:f}},[]);s.current.read=u.read,s.current.write=u.write,i.useLayoutEffect(()=>{var d,f;o&&((d=s.current.read)==null||d.setSize(v.x,v.y),(f=s.current.write)==null||f.setSize(v.x,v.y))},[v,o]),i.useEffect(()=>{const d=s.current;return()=>{var f,m;(f=d.read)==null||f.dispose(),(m=d.write)==null||m.dispose()}},[]);const l=i.useCallback((d,f)=>{var g;const m=s.current;return d.setRenderTarget(m.write),f&&f({read:m.read.texture,write:m.write.texture}),d.render(n,a),m.swap(),d.setRenderTarget(null),d.clear(),(g=m.read)==null?void 0:g.texture},[n,a]);return[{read:s.current.read,write:s.current.write},l]},z=()=>{const n=i.useRef(new t.Vector2(0,0)),a=i.useRef(new t.Vector2(0,0)),r=i.useRef(0),e=i.useRef(new t.Vector2(0,0)),o=i.useRef(!1);return i.useCallback(v=>{const u=performance.now(),l=v.clone();r.current===0&&(r.current=u,n.current=l);const d=Math.max(1,u-r.current);r.current=u,e.current.copy(l).sub(n.current).divideScalar(d);const f=e.current.length()>0,m=o.current?n.current.clone():l;return!o.current&&f&&(o.current=!0),n.current=l,{currentPointer:l,prevPointer:m,diffPointer:a.current.subVectors(l,m),velocity:e.current,isVelocityUpdate:f}},[])},C=n=>{const a=o=>Object.values(o).some(s=>typeof s=="function"),r=i.useRef(a(n)?n:structuredClone(n)),e=i.useCallback(o=>{for(const s in o){const v=s;v in r.current&&o[v]!==void 0&&o[v]!==null?r.current[v]=o[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[r.current,e]},N={texture:new t.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Color(16777215)},le=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=ae({scene:r,size:n,dpr:a}),o=b(n),s=z(),[v,u]=A({scene:r,camera:o,size:n,dpr:a}),[l,d]=C(N);return[i.useCallback((m,g)=>{const{gl:x,pointer:h}=m;g&&d(g),c(e,"uTexture",l.texture),c(e,"uRadius",l.radius),c(e,"uSmudge",l.smudge),c(e,"uDissipation",l.dissipation),c(e,"uMotionBlur",l.motionBlur),c(e,"uMotionSample",l.motionSample),c(e,"uColor",l.color);const{currentPointer:y,prevPointer:w,velocity:R}=s(h);return c(e,"uMouse",y),c(e,"uPrevMouse",w),c(e,"uVelocity",R),u(x,({read:D})=>{c(e,"uMap",D)})},[e,s,u,l,d]),d,{scene:r,material:e,camera:o,renderTarget:v}]};var ce=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ve=`precision highp float;

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
}`;const de=n=>{const a=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:ce,fragmentShader:ve}),[]);return U(n,a,r),r},W={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},fe=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=de(r),o=b(n),[s,v]=_({scene:r,camera:o,size:n,dpr:a}),[u,l]=C(W);return[i.useCallback((f,m)=>{const{gl:g}=f;return m&&l(m),c(e,"uTexture",u.texture),c(e,"uColor0",u.color0),c(e,"uColor1",u.color1),v(g)},[v,e,l,u]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var me=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,pe=`precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uMap;
uniform float distortionStrength;
uniform float edge0;
uniform float edge1;
uniform vec3 color;

void main() {
	vec2 uv = vUv;

	vec2 map = texture2D(uMap, uv).rg;
	vec2 normalizedMap = map * 2.0 - 1.0;
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap), distortionStrength);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(uTexture, uv);

	float blendValue = smoothstep(edge0, edge1, map.r);

	vec3 outputColor = blendValue * color + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;const ge=n=>{const a=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new t.Texture},uMap:{value:new t.Texture},distortionStrength:{value:0},edge0:{value:0},edge1:{value:.9},color:{value:new t.Color(16777215)}},vertexShader:me,fragmentShader:pe}),[]);return U(n,a,r),r},j={texture:new t.Texture,map:new t.Texture,distortionStrength:.3,edge0:0,edge1:.9,color:new t.Color(16777215)},xe=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=ge(r),o=b(n),[s,v]=_({scene:r,camera:o,size:n,dpr:a}),[u,l]=C(j);return[i.useCallback((f,m)=>{const{gl:g,clock:x}=f;return m&&l(m),c(e,"uTime",x.getElapsedTime()),c(e,"uTexture",u.texture),c(e,"uMap",u.map),c(e,"distortionStrength",u.distortionStrength),c(e,"edge0",u.edge0),c(e,"edge1",u.edge1),c(e,"color",u.color),v(g)},[v,e,l,u]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var B=`varying vec2 vUv;
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
}`,he=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const ye=()=>i.useMemo(()=>new t.ShaderMaterial({vertexShader:B,fragmentShader:he,depthTest:!1,depthWrite:!1}),[]);var Me=`precision highp float;

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
}`;const Te=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:B,fragmentShader:Me}),[]);var Se=`precision highp float;

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
}`;const we=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Se}),[]);var Re=`precision highp float;

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
}`;const be=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Re}),[]);var _e=`precision highp float;

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
}`;const Ce=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:_e}),[]);var Pe=`precision highp float;

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
}`;const De=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Pe}),[]);var Ue=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ve=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Ue}),[]);var Fe=`precision highp float;

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
}`;const Be=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Fe}),[]);var Ae=`precision highp float;

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
}`;const Ee=()=>i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:B,fragmentShader:Ae}),[]),Oe=({scene:n,size:a,dpr:r})=>{const e=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=ye(),s=o.clone(),v=Ce(),u=De(),l=Te(),d=we(),f=be(),m=Ve(),g=Be(),x=Ee(),h=i.useMemo(()=>({vorticityMaterial:u,curlMaterial:v,advectionMaterial:l,divergenceMaterial:d,pressureMaterial:f,clearMaterial:m,gradientSubtractMaterial:g,splatMaterial:x}),[u,v,l,d,f,m,g,x]),y=F(a,r);i.useEffect(()=>{c(h.splatMaterial,"aspectRatio",y.x/y.y);for(const M of Object.values(h))c(M,"texelSize",new t.Vector2(1/y.x,1/y.y))},[y,h]);const w=U(n,e,o);i.useEffect(()=>{o.dispose(),w.material=s},[o,w,s]),i.useEffect(()=>()=>{for(const M of Object.values(h))M.dispose()},[h]);const R=i.useCallback(M=>{w.material=M,w.material.needsUpdate=!0},[w]);return[h,R]},H={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1)},Le=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),[e,o]=Oe({scene:r,size:n,dpr:a}),s=b(n),v=z(),u=i.useMemo(()=>({scene:r,camera:s,size:n}),[r,s,n]),[l,d]=A(u),[f,m]=A(u),[g,x]=_(u),[h,y]=_(u),[w,R]=A(u),M=i.useRef(0),D=i.useRef(new t.Vector2(0,0)),E=i.useRef(new t.Vector3(0,0,0)),[P,T]=C(H);return[i.useCallback((gn,ee)=>{const{gl:V,pointer:xn,clock:k,size:ne}=gn;ee&&T(ee),M.current===0&&(M.current=k.getElapsedTime());const te=Math.min((k.getElapsedTime()-M.current)/3,.02);M.current=k.getElapsedTime();const G=d(V,({read:S})=>{o(e.advectionMaterial),c(e.advectionMaterial,"uVelocity",S),c(e.advectionMaterial,"uSource",S),c(e.advectionMaterial,"dt",te),c(e.advectionMaterial,"dissipation",P.velocity_dissipation)}),hn=m(V,({read:S})=>{o(e.advectionMaterial),c(e.advectionMaterial,"uVelocity",G),c(e.advectionMaterial,"uSource",S),c(e.advectionMaterial,"dissipation",P.density_dissipation)}),{currentPointer:yn,diffPointer:Mn,isVelocityUpdate:Tn,velocity:Sn}=v(xn);Tn&&(d(V,({read:S})=>{o(e.splatMaterial),c(e.splatMaterial,"uTarget",S),c(e.splatMaterial,"point",yn);const O=Mn.multiply(D.current.set(ne.width,ne.height).multiplyScalar(P.velocity_acceleration));c(e.splatMaterial,"color",E.current.set(O.x,O.y,1)),c(e.splatMaterial,"radius",P.splat_radius)}),m(V,({read:S})=>{o(e.splatMaterial),c(e.splatMaterial,"uTarget",S);const O=typeof P.fluid_color=="function"?P.fluid_color(Sn):P.fluid_color;c(e.splatMaterial,"color",O)}));const wn=x(V,()=>{o(e.curlMaterial),c(e.curlMaterial,"uVelocity",G)});d(V,({read:S})=>{o(e.vorticityMaterial),c(e.vorticityMaterial,"uVelocity",S),c(e.vorticityMaterial,"uCurl",wn),c(e.vorticityMaterial,"curl",P.curl_strength),c(e.vorticityMaterial,"dt",te)});const Rn=y(V,()=>{o(e.divergenceMaterial),c(e.divergenceMaterial,"uVelocity",G)});R(V,({read:S})=>{o(e.clearMaterial),c(e.clearMaterial,"uTexture",S),c(e.clearMaterial,"value",P.pressure_dissipation)}),o(e.pressureMaterial),c(e.pressureMaterial,"uDivergence",Rn);let re;for(let S=0;S<P.pressure_iterations;S++)re=R(V,({read:O})=>{c(e.pressureMaterial,"uPressure",O)});return d(V,({read:S})=>{o(e.gradientSubtractMaterial),c(e.gradientSubtractMaterial,"uPressure",re),c(e.gradientSubtractMaterial,"uVelocity",S)}),hn},[e,o,x,m,y,v,R,d,T,P]),T,{scene:r,materials:e,camera:s,renderTarget:{velocity:l,density:f,curl:g,divergence:h,pressure:w}}]},Ie=({scale:n,max:a,texture:r,scene:e})=>{const o=i.useRef([]),s=i.useMemo(()=>new t.PlaneGeometry(n,n),[n]),v=i.useMemo(()=>new t.MeshBasicMaterial({map:r??null,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return i.useEffect(()=>{for(let u=0;u<a;u++){const l=new t.Mesh(s.clone(),v.clone());l.rotateZ(2*Math.PI*Math.random()),l.visible=!1,e.add(l),o.current.push(l)}},[s,v,e,a]),i.useEffect(()=>()=>{o.current.forEach(u=>{u.geometry.dispose(),Array.isArray(u.material)?u.material.forEach(l=>l.dispose()):u.material.dispose(),e.remove(u)}),o.current=[]},[e]),o.current},X={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},ze=({texture:n,scale:a=64,max:r=100,size:e})=>{const o=i.useMemo(()=>new t.Scene,[]),s=Ie({scale:a,max:r,texture:n,scene:o}),v=b(e),u=z(),[l,d]=_({scene:o,camera:v,size:e}),[f,m]=C(X),g=i.useRef(0);return[i.useCallback((h,y)=>{const{gl:w,pointer:R,size:M}=h;y&&m(y);const{currentPointer:D,diffPointer:E}=u(R);if(f.frequency<E.length()){const T=s[g.current];T.visible=!0,T.position.set(D.x*(M.width/2),D.y*(M.height/2),0),T.scale.x=T.scale.y=0,T.material.opacity=f.alpha,g.current=(g.current+1)%r}return s.forEach(T=>{if(T.visible){const $=T.material;T.rotation.z+=f.rotation,$.opacity*=f.fadeout_speed,T.scale.x=f.fadeout_speed*T.scale.x+f.scale,T.scale.y=T.scale.x,$.opacity<.002&&(T.visible=!1)}}),d(w)},[d,s,u,r,f,m]),m,{scene:o,camera:v,meshArr:s,renderTarget:l}]};var $e=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ke=`precision highp float;

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

}`;const Ge=({scene:n,size:a,dpr:r})=>{const e=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:$e,fragmentShader:ke}),[]),s=F(a,r);return i.useEffect(()=>{o.uniforms.uResolution.value=s.clone()},[s,o]),U(n,e,o),o},Y={texture0:new t.Texture,texture1:new t.Texture,textureResolution:new t.Vector2(0,0),padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},Ne=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=Ge({scene:r,size:n,dpr:a}),o=b(n),[s,v]=_({scene:r,camera:o,dpr:a,size:n,isSizeUpdate:!0}),[u,l]=C(Y);return[i.useCallback((f,m)=>{const{gl:g}=f;return m&&l(m),c(e,"uTexture0",u.texture0),c(e,"uTexture1",u.texture1),c(e,"uTextureResolution",u.textureResolution),c(e,"padding",u.padding),c(e,"uMap",u.map),c(e,"mapIntensity",u.mapIntensity),c(e,"edgeIntensity",u.edgeIntensity),c(e,"epicenter",u.epicenter),c(e,"progress",u.progress),c(e,"dirX",u.dir.x),c(e,"dirY",u.dir.y),v(g)},[v,e,u,l]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var We=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,je=`precision highp float;
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
}`;const He=n=>{const a=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new t.Vector2},warpStrength:{value:0}},vertexShader:We,fragmentShader:je}),[]);return U(n,a,r),r},q={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new t.Vector2(2,2),warpStrength:8},Xe=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=He(r),o=b(n),[s,v]=_({scene:r,camera:o,size:n,dpr:a}),[u,l]=C(q);return[i.useCallback((f,m)=>{const{gl:g,clock:x}=f;return m&&l(m),c(e,"scale",u.scale),c(e,"timeStrength",u.timeStrength),c(e,"noiseOctaves",u.noiseOctaves),c(e,"fbmOctaves",u.fbmOctaves),c(e,"warpOctaves",u.warpOctaves),c(e,"warpDirection",u.warpDirection),c(e,"warpStrength",u.warpStrength),c(e,"uTime",x.getElapsedTime()),v(g)},[v,e,l,u]),l,{scene:r,material:e,camera:o,renderTarget:s}]},Ye=n=>{var o,s,v;const a=(o=n.dom)==null?void 0:o.length,r=(s=n.texture)==null?void 0:s.length,e=(v=n.resolution)==null?void 0:v.length;if(!a||!r||!e)throw new Error("No dom or texture or resolution is set");if(a!==r||a!==e)throw new Error("Match dom, texture and resolution length")};var qe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Ke=`precision highp float;

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
}`;const Ze=({params:n,size:a,scene:r})=>{r.children.length>0&&(r.children.forEach(e=>{e instanceof t.Mesh&&(e.geometry.dispose(),e.material.dispose())}),r.remove(...r.children)),n.texture.forEach((e,o)=>{const s=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:qe,fragmentShader:Ke,transparent:!0,uniforms:{u_texture:{value:e},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:n.boderRadius[o]?n.boderRadius[o]:0}}}));r.add(s)})},Je=()=>{const n=i.useRef([]),a=i.useRef([]);return i.useCallback(({isIntersectingRef:e,isIntersectingOnceRef:o,params:s})=>{n.current.length>0&&n.current.forEach((u,l)=>{u.unobserve(a.current[l])}),a.current=[],n.current=[];const v=new Array(s.dom.length).fill(!1);e.current=[...v],o.current=[...v],s.dom.forEach((u,l)=>{const d=m=>{m.forEach(g=>{s.onIntersect[l]&&s.onIntersect[l](g),e.current[l]=g.isIntersecting})},f=new IntersectionObserver(d,{rootMargin:"0px",threshold:0});f.observe(u),n.current.push(f),a.current.push(u)})},[])},Qe=({params:n,size:a,resolutionRef:r,scene:e,isIntersectingRef:o})=>{e.children.forEach((s,v)=>{const u=n.dom[v];if(!u)throw new Error("DOM is null.");if(o.current[v]){const l=u.getBoundingClientRect();if(s.scale.set(l.width,l.height,1),s.position.set(l.left+l.width*.5-a.width*.5,-l.top-l.height*.5+a.height*.5,0),n.rotation[v]&&s.rotation.copy(n.rotation[v]),s instanceof t.Mesh){const d=s.material;c(d,"u_texture",n.texture[v]),c(d,"u_textureResolution",n.resolution[v]),c(d,"u_resolution",r.current.set(l.width,l.height)),c(d,"u_borderRadius",n.boderRadius[v]?n.boderRadius[v]:0)}}})},en=()=>{const n=i.useRef([]),a=i.useRef([]),r=i.useCallback((e,o=!1)=>{n.current.forEach((v,u)=>{v&&(a.current[u]=!0)});const s=o?[...a.current]:[...n.current];return e<0?s:s[e]},[]);return{isIntersectingRef:n,isIntersectingOnceRef:a,isIntersecting:r}},K={texture:[],dom:[],resolution:[],boderRadius:[],rotation:[],onIntersect:[]},nn=({size:n,dpr:a},r=[])=>{const e=i.useMemo(()=>new t.Scene,[]),o=b(n),[s,v]=_({scene:e,camera:o,size:n,dpr:a,isSizeUpdate:!0}),[u,l]=C(K),d=i.useRef(new t.Vector2(0,0)),[f,m]=i.useState(!0);i.useEffect(()=>{m(!0)},r);const g=Je(),{isIntersectingOnceRef:x,isIntersectingRef:h,isIntersecting:y}=en();return[i.useCallback((R,M)=>{const{gl:D,size:E}=R;return M&&l(M),Ye(u),f&&(Ze({params:u,size:E,scene:e}),g({isIntersectingRef:h,isIntersectingOnceRef:x,params:u}),m(!1)),Qe({params:u,size:E,resolutionRef:d,scene:e,isIntersectingRef:h}),v(D)},[v,l,g,f,e,u,x,h]),l,{scene:e,camera:o,renderTarget:s,isIntersecting:y}]};var tn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,rn=`precision mediump float;

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
}`;const on=n=>{const a=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:tn,fragmentShader:rn}),[]);return U(n,a,r),r},Z={texture:new t.Texture,blurSize:3,blurPower:5},un=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=on(r),o=b(n),s=i.useMemo(()=>({scene:r,camera:o,size:n,dpr:a}),[r,o,n,a]),[v,u]=_(s),[l,d]=A(s),[f,m]=C(Z);return[i.useCallback((x,h)=>{const{gl:y}=x;h&&m(h),c(e,"uTexture",f.texture),c(e,"uResolution",[f.texture.source.data.width,f.texture.source.data.height]),c(e,"uBlurSize",f.blurSize);let w=d(y);const R=f.blurPower;for(let D=0;D<R;D++)c(e,"uTexture",w),w=d(y);return u(y)},[u,d,e,m,f]),m,{scene:r,material:e,camera:o,renderTarget:v}]};var an=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,sn=`precision highp float;

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
}`;const ln=({scene:n,size:a,dpr:r})=>{const e=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=i.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:new t.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uResolution:{value:new t.Vector2},uMode:{value:0}},vertexShader:an,fragmentShader:sn}),[]),s=F(a,r);return i.useEffect(()=>{o.uniforms.uResolution.value=s.clone()},[s,o]),U(n,e,o),o},J={epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},cn=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=ln({scene:r,size:n,dpr:a}),o=b(n),[s,v]=_({scene:r,camera:o,size:n,dpr:a,isSizeUpdate:!0}),[u,l]=C(J);return[i.useCallback((f,m)=>{const{gl:g}=f;return m&&l(m),c(e,"uEpicenter",u.epicenter),c(e,"uProgress",u.progress),c(e,"uWidth",u.width),c(e,"uStrength",u.strength),c(e,"uMode",u.mode==="center"?0:u.mode==="horizontal"?1:2),v(g)},[v,e,l,u]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,dn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(u_texture, uv).rgb;
	float brightness = dot(color,u_brightness);
	float alpha = smoothstep(u_min, u_max, brightness);
	gl_FragColor = vec4(color, alpha);
}`;const fn=n=>{const a=i.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:vn,fragmentShader:dn}),[]);return U(n,a,r),r},Q={texture:new t.Texture,brightness:new t.Vector3(.5,.5,.5),min:0,max:1},mn=({size:n,dpr:a})=>{const r=i.useMemo(()=>new t.Scene,[]),e=fn(r),o=b(n),[s,v]=_({scene:r,camera:o,size:n,dpr:a}),[u,l]=C(Q);return[i.useCallback((f,m)=>{const{gl:g}=f;return m&&l(m),c(e,"u_texture",u.texture),c(e,"u_brightness",u.brightness),c(e,"u_min",u.min),c(e,"u_max",u.max),v(g)},[v,e,l,u]),l,{scene:r,material:e,camera:o,renderTarget:s}]},pn=({scene:n,camera:a,size:r,dpr:e=!1,isSizeUpdate:o=!1},s)=>{const v=i.useRef([]),u=F(r,e);v.current=i.useMemo(()=>Array.from({length:s},()=>new t.WebGLRenderTarget(u.x,u.y,I)),[s]),i.useLayoutEffect(()=>{o&&v.current.forEach(d=>d.setSize(u.x,u.y))},[u,o]),i.useEffect(()=>{const d=v.current;return()=>{d.forEach(f=>f.dispose())}},[s]);const l=i.useCallback((d,f,m)=>{const g=v.current[f];return d.setRenderTarget(g),m&&m({read:g.texture}),d.render(n,a),d.setRenderTarget(null),d.clear(),g.texture},[n,a]);return[v.current,l]};p.BLENDING_PARAMS=j,p.BRIGHTNESSPICKER_PARAMS=Q,p.BRUSH_PARAMS=N,p.DOMSYNCER_PARAMS=K,p.DUOTONE_PARAMS=W,p.FLUID_PARAMS=H,p.FXTEXTURE_PARAMS=Y,p.NOISE_PARAMS=q,p.RIPPLE_PARAMS=X,p.SIMPLEBLUR_PARAMS=Z,p.WAVE_PARAMS=J,p.setUniform=c,p.useAddMesh=U,p.useBlending=xe,p.useBrightnessPicker=mn,p.useBrush=le,p.useCamera=b,p.useCopyTexture=pn,p.useDomSyncer=nn,p.useDoubleFBO=A,p.useDuoTone=fe,p.useFluid=Le,p.useFxTexture=Ne,p.useNoise=Xe,p.useParams=C,p.usePointer=z,p.useResolution=F,p.useRipple=ze,p.useSimpleBlur=un,p.useSingleFBO=_,p.useWave=cn,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
