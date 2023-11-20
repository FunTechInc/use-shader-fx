(function(p,E){typeof exports=="object"&&typeof module<"u"?E(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],E):(p=typeof globalThis<"u"?globalThis:p||self,E(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,E,o){"use strict";function ee(t){const u=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(t){for(const r in t)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(u,r,e.get?e:{enumerable:!0,get:()=>t[r]})}}return u.default=t,Object.freeze(u)}const n=ee(E);var ne=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,te=`precision mediump float;

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
}`;const U=(t,u=!1)=>{const r=u?t.width*u:t.width,e=u?t.height*u:t.height;return o.useMemo(()=>new n.Vector2(r,e),[r,e])},O=(t,u,r)=>{const e=o.useMemo(()=>new n.Mesh(u,r),[u,r]);return o.useEffect(()=>{t.add(e)},[t,e]),o.useEffect(()=>()=>{t.remove(e),u.dispose(),r.dispose()},[t,u,r,e]),e},a=(t,u,r)=>{t.uniforms&&t.uniforms[u]&&r!==void 0&&r!==null?t.uniforms[u].value=r:console.error(`Uniform key "${String(u)}" does not exist in the material. or "${String(u)}" is null | undefined`)},re=({scene:t,size:u,dpr:r})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:ne,fragmentShader:te}),[]),c=U(u,r);return o.useEffect(()=>{a(i,"uAspect",c.width/c.height),a(i,"uResolution",c.clone())},[c,i]),O(t,e,i),i},oe=(t,u)=>{const r=u,e=t/u,[i,c]=[r*e/2,r/2];return{width:i,height:c,near:-1e3,far:1e3}},D=t=>{const u=U(t),{width:r,height:e,near:i,far:c}=oe(u.x,u.y);return o.useMemo(()=>new n.OrthographicCamera(-r,r,e,-e,i,c),[r,e,i,c])},I={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},_=({scene:t,camera:u,size:r,dpr:e=!1,isSizeUpdate:i=!1})=>{const c=o.useRef(),v=U(r,e);c.current=o.useMemo(()=>new n.WebGLRenderTarget(v.x,v.y,I),[]),o.useLayoutEffect(()=>{var l;i&&((l=c.current)==null||l.setSize(v.x,v.y))},[v,i]),o.useEffect(()=>{const l=c.current;return()=>{l==null||l.dispose()}},[]);const s=o.useCallback((l,f)=>{const d=c.current;return l.setRenderTarget(d),f&&f({read:d.texture}),l.render(t,u),l.setRenderTarget(null),l.clear(),d.texture},[t,u]);return[c.current,s]},A=({scene:t,camera:u,size:r,dpr:e=!1,isSizeUpdate:i=!1})=>{const c=o.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),v=U(r,e),s=o.useMemo(()=>{const f=new n.WebGLRenderTarget(v.x,v.y,I),d=new n.WebGLRenderTarget(v.x,v.y,I);return{read:f,write:d}},[]);c.current.read=s.read,c.current.write=s.write,o.useLayoutEffect(()=>{var f,d;i&&((f=c.current.read)==null||f.setSize(v.x,v.y),(d=c.current.write)==null||d.setSize(v.x,v.y))},[v,i]),o.useEffect(()=>{const f=c.current;return()=>{var d,m;(d=f.read)==null||d.dispose(),(m=f.write)==null||m.dispose()}},[]);const l=o.useCallback((f,d)=>{var g;const m=c.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(t,u),m.swap(),f.setRenderTarget(null),f.clear(),(g=m.read)==null?void 0:g.texture},[t,u]);return[{read:c.current.read,write:c.current.write},l]},L=()=>{const t=o.useRef(new n.Vector2(0,0)),u=o.useRef(new n.Vector2(0,0)),r=o.useRef(0),e=o.useRef(new n.Vector2(0,0)),i=o.useRef(!1);return o.useCallback(v=>{const s=performance.now(),l=v.clone();r.current===0&&(r.current=s,t.current=l);const f=Math.max(1,s-r.current);r.current=s,e.current.copy(l).sub(t.current).divideScalar(f);const d=e.current.length()>0,m=i.current?t.current.clone():l;return!i.current&&d&&(i.current=!0),t.current=l,{currentPointer:l,prevPointer:m,diffPointer:u.current.subVectors(l,m),velocity:e.current,isVelocityUpdate:d}},[])},V=t=>{const u=i=>Object.values(i).some(c=>typeof c=="function"),r=o.useRef(u(t)?t:structuredClone(t)),e=o.useCallback(i=>{for(const c in i){const v=c;v in r.current&&i[v]!==void 0&&i[v]!==null?r.current[v]=i[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[r.current,e]},G={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},ie=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),e=re({scene:r,size:t,dpr:u}),i=D(t),c=L(),[v,s]=A({scene:r,camera:i,size:t,dpr:u}),[l,f]=V(G);return[o.useCallback((m,g)=>{const{gl:M,pointer:S}=m;g&&f(g),a(e,"uTexture",l.texture),a(e,"uRadius",l.radius),a(e,"uSmudge",l.smudge),a(e,"uDissipation",l.dissipation),a(e,"uMotionBlur",l.motionBlur),a(e,"uMotionSample",l.motionSample),a(e,"uColor",l.color);const{currentPointer:h,prevPointer:R,velocity:P}=c(S);return a(e,"uMouse",h),a(e,"uPrevMouse",R),a(e,"uVelocity",P),s(M,({read:F})=>{a(e,"uMap",F)})},[e,c,s,l,f]),f,{scene:r,material:e,camera:i,renderTarget:v}]};var ue=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ae=`precision mediump float;

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
}`;const se=t=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:ue,fragmentShader:ae}),[]);return O(t,u,r),r},j={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},le=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),e=se(r),i=D(t),[c,v]=_({scene:r,camera:i,size:t,dpr:u}),[s,l]=V(j);return[o.useCallback((d,m)=>{const{gl:g}=d;return m&&l(m),a(e,"uTexture",s.texture),a(e,"uColor0",s.color0),a(e,"uColor1",s.color1),v(g)},[v,e,l,s]),l,{scene:r,material:e,camera:i,renderTarget:c}]};var ce=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ve=`precision mediump float;

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
}`;const fe=t=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new n.Texture},uNoiseMap:{value:new n.Texture},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new n.Color(16777215)}},vertexShader:ce,fragmentShader:ve}),[]);return O(t,u,r),r},q={texture:new n.Texture,noiseMap:new n.Texture,distortionStrength:.03,fogEdge0:0,fogEdge1:.9,fogColor:new n.Color(16777215)},de=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),e=fe(r),i=D(t),[c,v]=_({scene:r,camera:i,size:t,dpr:u}),[s,l]=V(q);return[o.useCallback((d,m)=>{const{gl:g,clock:M}=d;return m&&l(m),a(e,"uTime",M.getElapsedTime()),a(e,"uTexture",s.texture),a(e,"uNoiseMap",s.noiseMap),a(e,"distortionStrength",s.distortionStrength),a(e,"fogEdge0",s.fogEdge0),a(e,"fogEdge1",s.fogEdge1),a(e,"fogColor",s.fogColor),v(g)},[v,e,l,s]),l,{scene:r,material:e,camera:i,renderTarget:c}]};var C=`precision mediump float;
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
}`,me=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const pe=()=>o.useMemo(()=>new n.ShaderMaterial({vertexShader:C,fragmentShader:me,depthTest:!1,depthWrite:!1}),[]);var ge=`precision mediump float;
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
}`;const xe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:C,fragmentShader:ge}),[]);var ye=`precision mediump float;
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
}`;const Me=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:ye}),[]);var Te=`precision mediump float;
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
}`;const Se=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Te}),[]);var he=`precision mediump float;
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
}`;const we=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:he}),[]);var Re=`precision mediump float;
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
}`;const be=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Re}),[]);var Ce=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Pe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Ce}),[]);var De=`precision mediump float;
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
}`;const _e=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:De}),[]);var Ve=`precision mediump float;
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
}`;const Ue=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:C,fragmentShader:Ve}),[]),Oe=({scene:t,size:u,dpr:r})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=pe(),c=i.clone(),v=we(),s=be(),l=xe(),f=Me(),d=Se(),m=Pe(),g=_e(),M=Ue(),S=o.useMemo(()=>({vorticityMaterial:s,curlMaterial:v,advectionMaterial:l,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:g,splatMaterial:M}),[s,v,l,f,d,m,g,M]),h=U(u,r);o.useEffect(()=>{a(S.splatMaterial,"aspectRatio",h.x/h.y);for(const T of Object.values(S))a(T,"texelSize",new n.Vector2(1/h.x,1/h.y))},[h,S]);const R=O(t,e,i);o.useEffect(()=>{i.dispose(),R.material=c},[i,R,c]),o.useEffect(()=>()=>{for(const T of Object.values(S))T.dispose()},[S]);const P=o.useCallback(T=>{R.material=T,R.material.needsUpdate=!0},[R]);return[S,P]},W={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fruid_color:new n.Vector3(1,1,1)},Fe=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),[e,i]=Oe({scene:r,size:t,dpr:u}),c=D(t),v=L(),s=o.useMemo(()=>({scene:r,camera:c,size:t,isSizeUpdate:!0}),[r,c,t]),[l,f]=A(s),[d,m]=A({...s,isSizeUpdate:!1}),[g,M]=_(s),[S,h]=_(s),[R,P]=A(s),T=o.useRef(0),F=o.useRef(new n.Vector2(0,0)),N=o.useRef(new n.Vector3(0,0,0)),[w,x]=V(W);return[o.useCallback((je,J)=>{const{gl:b,pointer:qe,clock:z,size:K}=je;J&&x(J),T.current===0&&(T.current=z.getElapsedTime());const Z=Math.min((z.getElapsedTime()-T.current)/3,.02);T.current=z.getElapsedTime();const k=f(b,({read:y})=>{i(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",y),a(e.advectionMaterial,"uSource",y),a(e.advectionMaterial,"dt",Z),a(e.advectionMaterial,"dissipation",w.velocity_dissipation)}),We=m(b,({read:y})=>{i(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",k),a(e.advectionMaterial,"uSource",y),a(e.advectionMaterial,"dissipation",w.density_dissipation)}),{currentPointer:He,diffPointer:Xe,isVelocityUpdate:Ye,velocity:Je}=v(qe);Ye&&(f(b,({read:y})=>{i(e.splatMaterial),a(e.splatMaterial,"uTarget",y),a(e.splatMaterial,"point",He);const B=Xe.multiply(F.current.set(K.width,K.height).multiplyScalar(w.velocity_acceleration));a(e.splatMaterial,"color",N.current.set(B.x,B.y,1)),a(e.splatMaterial,"radius",w.splat_radius)}),m(b,({read:y})=>{i(e.splatMaterial),a(e.splatMaterial,"uTarget",y);const B=typeof w.fruid_color=="function"?w.fruid_color(Je):w.fruid_color;a(e.splatMaterial,"color",B)}));const Ke=M(b,()=>{i(e.curlMaterial),a(e.curlMaterial,"uVelocity",k)});f(b,({read:y})=>{i(e.vorticityMaterial),a(e.vorticityMaterial,"uVelocity",y),a(e.vorticityMaterial,"uCurl",Ke),a(e.vorticityMaterial,"curl",w.curl_strength),a(e.vorticityMaterial,"dt",Z)});const Ze=h(b,()=>{i(e.divergenceMaterial),a(e.divergenceMaterial,"uVelocity",k)});P(b,({read:y})=>{i(e.clearMaterial),a(e.clearMaterial,"uTexture",y),a(e.clearMaterial,"value",w.pressure_dissipation)}),i(e.pressureMaterial),a(e.pressureMaterial,"uDivergence",Ze);let Q;for(let y=0;y<w.pressure_iterations;y++)Q=P(b,({read:B})=>{a(e.pressureMaterial,"uPressure",B)});return f(b,({read:y})=>{i(e.gradientSubtractMaterial),a(e.gradientSubtractMaterial,"uPressure",Q),a(e.gradientSubtractMaterial,"uVelocity",y)}),We},[e,i,M,m,h,v,P,f,x,w]),x,{scene:r,materials:e,camera:c,renderTarget:{velocity:l,density:d,curl:g,divergence:S,pressure:R}}]},Be=({scale:t,max:u,texture:r,scene:e})=>{const i=o.useRef([]),c=o.useMemo(()=>new n.PlaneGeometry(t,t),[t]),v=o.useMemo(()=>new n.MeshBasicMaterial({map:r??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return o.useEffect(()=>{for(let s=0;s<u;s++){const l=new n.Mesh(c.clone(),v.clone());l.rotateZ(2*Math.PI*Math.random()),l.visible=!1,e.add(l),i.current.push(l)}},[c,v,e,u]),o.useEffect(()=>()=>{i.current.forEach(s=>{s.geometry.dispose(),Array.isArray(s.material)?s.material.forEach(l=>l.dispose()):s.material.dispose(),e.remove(s)}),i.current=[]},[e]),i.current},H={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},Ee=({texture:t,scale:u=64,max:r=100,size:e})=>{const i=o.useMemo(()=>new n.Scene,[]),c=Be({scale:u,max:r,texture:t,scene:i}),v=D(e),s=L(),[l,f]=_({scene:i,camera:v,size:e}),[d,m]=V(H),g=o.useRef(0);return[o.useCallback((S,h)=>{const{gl:R,pointer:P,size:T}=S;h&&m(h);const{currentPointer:F,diffPointer:N}=s(P);if(d.frequency<N.length()){const x=c[g.current];x.visible=!0,x.position.set(F.x*(T.width/2),F.y*(T.height/2),0),x.scale.x=x.scale.y=0,x.material.opacity=d.alpha,g.current=(g.current+1)%r}return c.forEach(x=>{if(x.visible){const $=x.material;x.rotation.z+=d.rotation,$.opacity*=d.fadeout_speed,x.scale.x=d.fadeout_speed*x.scale.x+d.scale,x.scale.y=x.scale.x,$.opacity<.002&&(x.visible=!1)}}),f(R)},[f,c,s,r,d,m]),m,{scene:i,camera:v,meshArr:c,renderTarget:l}]};var Ae=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Le=`precision mediump float;

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

}`;const Ie=({scene:t,size:u,dpr:r})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uImageResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},uNoiseMap:{value:new n.Texture},noiseStrength:{value:0},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Ae,fragmentShader:Le}),[]),c=U(u,r);return o.useEffect(()=>{i.uniforms.uResolution.value=c.clone()},[c,i]),O(t,e,i),i},X={texture0:new n.Texture,texture1:new n.Texture,imageResolution:new n.Vector2(0,0),noiseMap:new n.Texture,noiseStrength:0,progress:0,dir:new n.Vector2(0,0)},Ne=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),e=Ie({scene:r,size:t,dpr:u}),i=D(t),[c,v]=_({scene:r,camera:i,dpr:u,size:t,isSizeUpdate:!0}),[s,l]=V(X);return[o.useCallback((d,m)=>{const{gl:g}=d;return m&&l(m),a(e,"uTexture0",s.texture0),a(e,"uTexture1",s.texture1),a(e,"uImageResolution",s.imageResolution),a(e,"uNoiseMap",s.noiseMap),a(e,"noiseStrength",s.noiseStrength),a(e,"progress",s.progress),a(e,"dirX",s.dir.x),a(e,"dirY",s.dir.y),v(g)},[v,e,s,l]),l,{scene:r,material:e,camera:i,renderTarget:c}]};var $e=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ze=`precision mediump float;

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
}`;const ke=t=>{const u=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0}},vertexShader:$e,fragmentShader:ze}),[]);return O(t,u,r),r},Y={timeStrength:.3,noiseOctaves:8,fbmOctaves:3},Ge=({size:t,dpr:u})=>{const r=o.useMemo(()=>new n.Scene,[]),e=ke(r),i=D(t),[c,v]=_({scene:r,camera:i,size:t,dpr:u}),[s,l]=V(Y);return[o.useCallback((d,m)=>{const{gl:g,clock:M}=d;return m&&l(m),a(e,"timeStrength",s.timeStrength),a(e,"noiseOctaves",s.noiseOctaves),a(e,"fbmOctaves",s.fbmOctaves),a(e,"uTime",M.getElapsedTime()),v(g)},[v,e,l,s]),l,{scene:r,material:e,camera:i,renderTarget:c}]};p.BRUSH_PARAMS=G,p.DUOTONE_PARAMS=j,p.FOGPROJECTION_PARAMS=q,p.FRUID_PARAMS=W,p.NOISE_PARAMS=Y,p.RIPPLE_PARAMS=H,p.TRANSITIONBG_PARAMS=X,p.setUniform=a,p.useAddMesh=O,p.useBrush=ie,p.useCamera=D,p.useDoubleFBO=A,p.useDuoTone=le,p.useFogProjection=de,p.useFruid=Fe,p.useNoise=Ge,p.useParams=V,p.usePointer=L,p.useResolution=U,p.useRipple=Ee,p.useSingleFBO=_,p.useTransitionBg=Ne,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
