(function(p,E){typeof exports=="object"&&typeof module<"u"?E(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],E):(p=typeof globalThis<"u"?globalThis:p||self,E(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,E,o){"use strict";function X(r){const u=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const t in r)if(t!=="default"){const e=Object.getOwnPropertyDescriptor(r,t);Object.defineProperty(u,t,e.get?e:{enumerable:!0,get:()=>r[t]})}}return u.default=r,Object.freeze(u)}const n=X(E);var Y=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,H=`precision mediump float;

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
}`;const F=(r,u=!1)=>{const t=u?r.width*u:r.width,e=u?r.height*u:r.height;return o.useMemo(()=>new n.Vector2(t,e),[t,e])},U=(r,u,t)=>{const e=o.useMemo(()=>new n.Mesh(u,t),[u,t]);return o.useEffect(()=>{r.add(e)},[r,e]),o.useEffect(()=>()=>{r.remove(e),u.dispose(),t.dispose()},[r,u,t,e]),e},a=(r,u,t)=>{r.uniforms&&r.uniforms[u]&&t!==void 0&&t!==null?r.uniforms[u].value=t:console.error(`Uniform key "${String(u)}" does not exist in the material. or "${String(u)}" is null | undefined`)},J=({scene:r,size:u,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:Y,fragmentShader:H}),[]),s=F(u,t);return o.useEffect(()=>{a(i,"uAspect",s.width/s.height),a(i,"uResolution",s.clone())},[s,i]),U(r,e,i),i},K=(r,u)=>{const t=u,e=r/u,[i,s]=[t*e/2,t/2];return{width:i,height:s,near:-1e3,far:1e3}},P=r=>{const u=F(r),{width:t,height:e,near:i,far:s}=K(u.x,u.y);return o.useMemo(()=>new n.OrthographicCamera(-t,t,e,-e,i,s),[t,e,i,s])},$={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},_=({scene:r,camera:u,size:t,dpr:e=!1,isSizeUpdate:i=!1})=>{const s=o.useRef(),l=F(t,e);s.current=o.useMemo(()=>new n.WebGLRenderTarget(l.x,l.y,$),[]),o.useLayoutEffect(()=>{var v;i&&((v=s.current)==null||v.setSize(l.x,l.y))},[l,i]),o.useEffect(()=>{const v=s.current;return()=>{v==null||v.dispose()}},[]);const c=o.useCallback((v,f)=>{const d=s.current;return v.setRenderTarget(d),f&&f({read:d.texture}),v.render(r,u),v.setRenderTarget(null),v.clear(),d.texture},[r,u]);return[s.current,c]},L=({scene:r,camera:u,size:t,dpr:e=!1,isSizeUpdate:i=!1})=>{const s=o.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),l=F(t,e),c=o.useMemo(()=>{const f=new n.WebGLRenderTarget(l.x,l.y,$),d=new n.WebGLRenderTarget(l.x,l.y,$);return{read:f,write:d}},[]);s.current.read=c.read,s.current.write=c.write,o.useLayoutEffect(()=>{var f,d;i&&((f=s.current.read)==null||f.setSize(l.x,l.y),(d=s.current.write)==null||d.setSize(l.x,l.y))},[l,i]),o.useEffect(()=>{const f=s.current;return()=>{var d,m;(d=f.read)==null||d.dispose(),(m=f.write)==null||m.dispose()}},[]);const v=o.useCallback((f,d)=>{var g;const m=s.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(r,u),m.swap(),f.setRenderTarget(null),f.clear(),(g=m.read)==null?void 0:g.texture},[r,u]);return[{read:s.current.read,write:s.current.write},v]},A=()=>{const r=o.useRef(new n.Vector2(0,0)),u=o.useRef(new n.Vector2(0,0)),t=o.useRef(0),e=o.useRef(new n.Vector2(0,0)),i=o.useRef(!1);return o.useCallback(l=>{const c=performance.now(),v=l.clone();t.current===0&&(t.current=c,r.current=v);const f=Math.max(1,c-t.current);t.current=c,e.current.copy(v).sub(r.current).divideScalar(f);const d=e.current.length()>0,m=i.current?r.current.clone():v;return!i.current&&d&&(i.current=!0),r.current=v,{currentPointer:v,prevPointer:m,diffPointer:u.current.subVectors(v,m),velocity:e.current,isVelocityUpdate:d}},[])},V=r=>{const u=i=>Object.values(i).some(s=>typeof s=="function"),t=o.useRef(u(r)?r:structuredClone(r)),e=o.useCallback(i=>{for(const s in i){const l=s;l in t.current&&i[l]!==void 0&&i[l]!==null?t.current[l]=i[l]:console.error(`"${String(l)}" does not exist in the params. or "${String(l)}" is null | undefined`)}},[]);return[t.current,e]},Z={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},Q=({size:r,dpr:u})=>{const t=o.useMemo(()=>new n.Scene,[]),e=J({scene:t,size:r,dpr:u}),i=P(r),s=A(),[l,c]=L({scene:t,camera:i,size:r}),[v,f]=V(Z);return[o.useCallback((m,g)=>{const{gl:h,pointer:S}=m;g&&f(g),a(e,"uTexture",v.texture),a(e,"uRadius",v.radius),a(e,"uSmudge",v.smudge),a(e,"uDissipation",v.dissipation),a(e,"uMotionBlur",v.motionBlur),a(e,"uMotionSample",v.motionSample),a(e,"uColor",v.color);const{currentPointer:T,prevPointer:R,velocity:D}=s(S);return a(e,"uMouse",T),a(e,"uPrevMouse",R),a(e,"uVelocity",D),c(h,({read:B})=>{a(e,"uMap",B)})},[e,s,c,v,f]),f,{scene:t,material:e,camera:i,renderTarget:l}]};var ee=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ne=`precision mediump float;

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
}`;const te=r=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:ee,fragmentShader:ne}),[]);return U(r,u,t),t},re={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},oe=({size:r})=>{const u=o.useMemo(()=>new n.Scene,[]),t=te(u),e=P(r),[i,s]=_({scene:u,camera:e,size:r}),[l,c]=V(re);return[o.useCallback((f,d)=>{const{gl:m}=f;return d&&c(d),a(t,"uTexture",l.texture),a(t,"uColor0",l.color0),a(t,"uColor1",l.color1),s(m)},[s,t,c,l]),c,{scene:u,material:t,camera:e,renderTarget:i}]};var ie=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ue=`precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uNoiseMap;
uniform float distortionStrength;
uniform float fogEdge0;
uniform float fogEdge1;
uniform vec3 fogColor;

void main() {
	vec2 uv = vUv;

	float noiseMap = texture2D(uNoiseMap,uv).r;
	
	float noiseTextureMap = noiseMap*2.0-1.0;
	uv += noiseTextureMap * distortionStrength;
	vec3 textureMap = texture2D(uTexture, uv).rgb;

	float edge0 = fogEdge0;
	float edge1 = fogEdge1;
	float blendValue = smoothstep(edge0, edge1, noiseMap);

	vec3 outputColor = blendValue * fogColor + (1.0 - blendValue) * textureMap;
	gl_FragColor = vec4(outputColor, 1.0);
}`;const ae=r=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new n.Texture},uNoiseMap:{value:new n.Texture},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new n.Color(16777215)}},vertexShader:ie,fragmentShader:ue}),[]);return U(r,u,t),t},se={texture:new n.Texture,noiseMap:new n.Texture,distortionStrength:.03,fogEdge0:0,fogEdge1:.9,fogColor:new n.Color(16777215)},le=({size:r})=>{const u=o.useMemo(()=>new n.Scene,[]),t=ae(u),e=P(r),[i,s]=_({scene:u,camera:e,size:r}),[l,c]=V(se);return[o.useCallback((f,d)=>{const{gl:m,clock:g}=f;return d&&c(d),a(t,"uTime",g.getElapsedTime()),a(t,"uTexture",l.texture),a(t,"uNoiseMap",l.noiseMap),a(t,"distortionStrength",l.distortionStrength),a(t,"fogEdge0",l.fogEdge0),a(t,"fogEdge1",l.fogEdge1),a(t,"fogColor",l.fogColor),s(m)},[s,t,c,l]),c,{scene:u,material:t,camera:e,renderTarget:i}]};var C=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
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
}`,ce=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const ve=()=>o.useMemo(()=>new n.ShaderMaterial({vertexShader:C,fragmentShader:ce,depthTest:!1,depthWrite:!1}),[]);var fe=`precision mediump float;
precision mediump sampler2D;

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
}`;const de=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:C,fragmentShader:fe}),[]);var me=`precision mediump float;
precision mediump sampler2D;

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
}`;const pe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:me}),[]);var ge=`precision mediump float;
precision mediump sampler2D;

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
}`;const xe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:ge}),[]);var ye=`precision mediump float;
precision mediump sampler2D;

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
}`;const Me=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:ye}),[]);var Te=`precision mediump float;
precision mediump sampler2D;

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
}`;const he=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Te}),[]);var Se=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const we=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Se}),[]);var Re=`precision mediump float;
precision mediump sampler2D;

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
}`;const be=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Re}),[]);var Ce=`precision mediump float;
precision mediump sampler2D;

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
}`;const De=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Ce}),[]),Pe=({scene:r,size:u,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=ve(),s=i.clone(),l=Me(),c=he(),v=de(),f=pe(),d=xe(),m=we(),g=be(),h=De(),S=o.useMemo(()=>({vorticityMaterial:c,curlMaterial:l,advectionMaterial:v,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:g,splatMaterial:h}),[c,l,v,f,d,m,g,h]),T=F(u,t);o.useEffect(()=>{a(S.splatMaterial,"aspectRatio",T.x/T.y);for(const M of Object.values(S))a(M,"texelSize",new n.Vector2(1/T.x,1/T.y))},[T,S]);const R=U(r,e,i);o.useEffect(()=>{i.dispose(),R.material=s},[i,R,s]),o.useEffect(()=>()=>{for(const M of Object.values(S))M.dispose()},[S]);const D=o.useCallback(M=>{R.material=M,R.material.needsUpdate=!0},[R]);return[S,D]},_e={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fruid_color:new n.Vector3(1,1,1)},Ve=({size:r,dpr:u})=>{const t=o.useMemo(()=>new n.Scene,[]),[e,i]=Pe({scene:t,size:r,dpr:u}),s=P(r),l=A(),c=o.useMemo(()=>({scene:t,camera:s,size:r,dpr:u}),[t,s,r,u]),[v,f]=L(c),[d,m]=L(c),[g,h]=_(c),[S,T]=_(c),[R,D]=L(c),M=o.useRef(0),B=o.useRef(new n.Vector2(0,0)),I=o.useRef(new n.Vector3(0,0,0)),[w,x]=V(_e);return[o.useCallback((je,G)=>{const{gl:b,pointer:qe,clock:k,size:j}=je;G&&x(G),M.current===0&&(M.current=k.getElapsedTime());const q=Math.min((k.getElapsedTime()-M.current)/3,.02);M.current=k.getElapsedTime();const z=f(b,({read:y})=>{i(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",y),a(e.advectionMaterial,"uSource",y),a(e.advectionMaterial,"dt",q),a(e.advectionMaterial,"dissipation",w.velocity_dissipation)}),We=m(b,({read:y})=>{i(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",z),a(e.advectionMaterial,"uSource",y),a(e.advectionMaterial,"dissipation",w.density_dissipation)}),{currentPointer:Xe,diffPointer:Ye,isVelocityUpdate:He,velocity:Je}=l(qe);He&&(f(b,({read:y})=>{i(e.splatMaterial),a(e.splatMaterial,"uTarget",y),a(e.splatMaterial,"point",Xe);const O=Ye.multiply(B.current.set(j.width,j.height).multiplyScalar(w.velocity_acceleration));a(e.splatMaterial,"color",I.current.set(O.x,O.y,1)),a(e.splatMaterial,"radius",w.splat_radius)}),m(b,({read:y})=>{i(e.splatMaterial),a(e.splatMaterial,"uTarget",y);const O=typeof w.fruid_color=="function"?w.fruid_color(Je):w.fruid_color;a(e.splatMaterial,"color",O)}));const Ke=h(b,()=>{i(e.curlMaterial),a(e.curlMaterial,"uVelocity",z)});f(b,({read:y})=>{i(e.vorticityMaterial),a(e.vorticityMaterial,"uVelocity",y),a(e.vorticityMaterial,"uCurl",Ke),a(e.vorticityMaterial,"curl",w.curl_strength),a(e.vorticityMaterial,"dt",q)});const Ze=T(b,()=>{i(e.divergenceMaterial),a(e.divergenceMaterial,"uVelocity",z)});D(b,({read:y})=>{i(e.clearMaterial),a(e.clearMaterial,"uTexture",y),a(e.clearMaterial,"value",w.pressure_dissipation)}),i(e.pressureMaterial),a(e.pressureMaterial,"uDivergence",Ze);let W;for(let y=0;y<w.pressure_iterations;y++)W=D(b,({read:O})=>{a(e.pressureMaterial,"uPressure",O)});return f(b,({read:y})=>{i(e.gradientSubtractMaterial),a(e.gradientSubtractMaterial,"uPressure",W),a(e.gradientSubtractMaterial,"uVelocity",y)}),We},[e,i,h,m,T,l,D,f,x,w]),x,{scene:t,materials:e,camera:s,renderTarget:{velocity:v,density:d,curl:g,divergence:S,pressure:R}}]},Fe=({scale:r,max:u,texture:t,scene:e})=>{const i=o.useRef([]),s=o.useMemo(()=>new n.PlaneGeometry(r,r),[r]),l=o.useMemo(()=>new n.MeshBasicMaterial({map:t??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[t]);return o.useEffect(()=>{for(let c=0;c<u;c++){const v=new n.Mesh(s.clone(),l.clone());v.rotateZ(2*Math.PI*Math.random()),v.visible=!1,e.add(v),i.current.push(v)}},[s,l,e,u]),o.useEffect(()=>()=>{i.current.forEach(c=>{c.geometry.dispose(),Array.isArray(c.material)?c.material.forEach(v=>v.dispose()):c.material.dispose(),e.remove(c)}),i.current=[]},[e]),i.current},Ue={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},Be=({texture:r,scale:u=64,max:t=100,size:e})=>{const i=o.useMemo(()=>new n.Scene,[]),s=Fe({scale:u,max:t,texture:r,scene:i}),l=P(e),c=A(),[v,f]=_({scene:i,camera:l,size:e}),[d,m]=V(Ue),g=o.useRef(0);return[o.useCallback((S,T)=>{const{gl:R,pointer:D,size:M}=S;T&&m(T);const{currentPointer:B,diffPointer:I}=c(D);if(d.frequency<I.length()){const x=s[g.current];x.visible=!0,x.position.set(B.x*(M.width/2),B.y*(M.height/2),0),x.scale.x=x.scale.y=0,x.material.opacity=d.alpha,g.current=(g.current+1)%t}return s.forEach(x=>{if(x.visible){const N=x.material;x.rotation.z+=d.rotation,N.opacity*=d.fadeout_speed,x.scale.x=d.fadeout_speed*x.scale.x+d.scale,x.scale.y=x.scale.x,N.opacity<.002&&(x.visible=!1)}}),f(R)},[f,s,c,t,d,m]),m,{scene:i,camera:l,meshArr:s,renderTarget:v}]};var Oe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ee=`precision mediump float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uNoiseMap;
uniform float noiseStrength;
uniform float progress;
uniform float dirX;
uniform float dirY;

void main() {
	vec2 bgRatio=vec2(
		min((uResolution.x/uResolution.y)/(uImageResolution.x/uImageResolution.y),1.),
		min((uResolution.y/uResolution.x)/(uImageResolution.y/uImageResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	
	vec2 noiseMap = texture2D(uNoiseMap, uv).rg;
	noiseMap=noiseMap*2.0-1.0;
	uv += noiseMap * noiseStrength;

	
	vec2 centeredUV = uv - vec2(0.5);
	
	
	float xOffsetTexture0 = 0.5 - dirX * progress;
	float yOffsetTexture0 = 0.5 - dirY * progress;
	vec2 samplePosTexture0 = vec2(xOffsetTexture0, yOffsetTexture0) + centeredUV;

	
	float xOffsetTexture1 = 0.5 + dirX * (1.0 - progress);
	float yOffsetTexture1 = 0.5 + dirY * (1.0 - progress);
	vec2 samplePosTexture1 = vec2(xOffsetTexture1, yOffsetTexture1) + centeredUV;

	vec4 color0 = texture2D(uTexture0, samplePosTexture0);
	vec4 color1 = texture2D(uTexture1, samplePosTexture1);

	gl_FragColor = mix(color0, color1, progress);

}`;const Le=({scene:r,size:u,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uImageResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},uNoiseMap:{value:new n.Texture},noiseStrength:{value:0},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Oe,fragmentShader:Ee}),[]),s=F(u,t);return o.useEffect(()=>{i.uniforms.uResolution.value=s.clone()},[s,i]),U(r,e,i),i},Ae={texture0:new n.Texture,texture1:new n.Texture,imageResolution:new n.Vector2(0,0),noiseMap:new n.Texture,noiseStrength:0,progress:0,dir:new n.Vector2(0,0)},$e=({size:r,dpr:u})=>{const t=o.useMemo(()=>new n.Scene,[]),e=Le({scene:t,size:r,dpr:u}),i=P(r),[s,l]=_({scene:t,camera:i,dpr:u,size:r,isSizeUpdate:!0}),[c,v]=V(Ae);return[o.useCallback((d,m)=>{const{gl:g}=d;return m&&v(m),a(e,"uTexture0",c.texture0),a(e,"uTexture1",c.texture1),a(e,"uImageResolution",c.imageResolution),a(e,"uNoiseMap",c.noiseMap),a(e,"noiseStrength",c.noiseStrength),a(e,"progress",c.progress),a(e,"dirX",c.dir.x),a(e,"dirY",c.dir.y),l(g)},[l,e,c,v]),v,{scene:t,material:e,camera:i,renderTarget:s}]};var Ie=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ne=`precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float timeStrength;
uniform int noiseOctaves;
uniform int fbmOctaves;

const float per  = 0.5;
const float PI   = 3.1415926;

float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
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
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	float sign = 1.0;
	for (int i = 0; i < fbmOctaves; ++i) {
		v += a * noise(x, time * sign);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
		sign *= -1.0;
	}
	return v;
}

void main() {
	vec2 uv = vUv;
	float noiseMap = fbm(gl_FragCoord.xy ,uTime * timeStrength);
	gl_FragColor = vec4(noiseMap,noiseMap,noiseMap,1.0);
}`;const ke=r=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0}},vertexShader:Ie,fragmentShader:Ne}),[]);return U(r,u,t),t},ze={timeStrength:.3,noiseOctaves:8,fbmOctaves:3},Ge=({size:r,dpr:u})=>{const t=o.useMemo(()=>new n.Scene,[]),e=ke(t),i=P(r),[s,l]=_({scene:t,camera:i,size:r,dpr:u}),[c,v]=V(ze);return[o.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&v(m),a(e,"timeStrength",c.timeStrength),a(e,"noiseOctaves",c.noiseOctaves),a(e,"fbmOctaves",c.fbmOctaves),a(e,"uTime",h.getElapsedTime()),l(g)},[l,e,v,c]),v,{scene:t,material:e,camera:i,renderTarget:s}]};p.setUniform=a,p.useAddMesh=U,p.useBrush=Q,p.useCamera=P,p.useDoubleFBO=L,p.useDuoTone=oe,p.useFogProjection=le,p.useFruid=Ve,p.useNoise=Ge,p.useParams=V,p.usePointer=A,p.useResolution=F,p.useRipple=Be,p.useSingleFBO=_,p.useTransitionBg=$e,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
