(function(p,L){typeof exports=="object"&&typeof module<"u"?L(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],L):(p=typeof globalThis<"u"?globalThis:p||self,L(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,L,u){"use strict";function re(n){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(n){for(const r in n)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(n,r);Object.defineProperty(i,r,e.get?e:{enumerable:!0,get:()=>n[r]})}}return i.default=n,Object.freeze(i)}const t=re(L);var oe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ue=`precision highp float;

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
}`;const E=(n,i=!1)=>{const r=i?n.width*i:n.width,e=i?n.height*i:n.height;return u.useMemo(()=>new t.Vector2(r,e),[r,e])},V=(n,i,r)=>{const e=u.useMemo(()=>new t.Mesh(i,r),[i,r]);return u.useEffect(()=>{n.add(e)},[n,e]),u.useEffect(()=>()=>{n.remove(e),i.dispose(),r.dispose()},[n,i,r,e]),e},c=(n,i,r)=>{n.uniforms&&n.uniforms[i]&&r!==void 0&&r!==null?n.uniforms[i].value=r:console.error(`Uniform key "${String(i)}" does not exist in the material. or "${String(i)}" is null | undefined`)},ie=({scene:n,size:i,dpr:r})=>{const e=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uMap:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new t.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(0,0)},uPrevMouse:{value:new t.Vector2(0,0)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Color(16777215)}},vertexShader:oe,fragmentShader:ue}),[]),s=E(i,r);return u.useEffect(()=>{c(o,"uAspect",s.width/s.height),c(o,"uResolution",s.clone())},[s,o]),V(n,e,o),o},ae=(n,i)=>{const r=i,e=n/i,[o,s]=[r*e/2,r/2];return{width:o,height:s,near:-1e3,far:1e3}},_=n=>{const i=E(n),{width:r,height:e,near:o,far:s}=ae(i.x,i.y);return u.useMemo(()=>new t.OrthographicCamera(-r,r,e,-e,o,s),[r,e,o,s])},I={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},C=({scene:n,camera:i,size:r,dpr:e=!1,isSizeUpdate:o=!1})=>{const s=u.useRef(),v=E(r,e);s.current=u.useMemo(()=>new t.WebGLRenderTarget(v.x,v.y,I),[]),u.useLayoutEffect(()=>{var l;o&&((l=s.current)==null||l.setSize(v.x,v.y))},[v,o]),u.useEffect(()=>{const l=s.current;return()=>{l==null||l.dispose()}},[]);const a=u.useCallback((l,f)=>{const d=s.current;return l.setRenderTarget(d),f&&f({read:d.texture}),l.render(n,i),l.setRenderTarget(null),l.clear(),d.texture},[n,i]);return[s.current,a]},O=({scene:n,camera:i,size:r,dpr:e=!1,isSizeUpdate:o=!1})=>{const s=u.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),v=E(r,e),a=u.useMemo(()=>{const f=new t.WebGLRenderTarget(v.x,v.y,I),d=new t.WebGLRenderTarget(v.x,v.y,I);return{read:f,write:d}},[]);s.current.read=a.read,s.current.write=a.write,u.useLayoutEffect(()=>{var f,d;o&&((f=s.current.read)==null||f.setSize(v.x,v.y),(d=s.current.write)==null||d.setSize(v.x,v.y))},[v,o]),u.useEffect(()=>{const f=s.current;return()=>{var d,m;(d=f.read)==null||d.dispose(),(m=f.write)==null||m.dispose()}},[]);const l=u.useCallback((f,d)=>{var g;const m=s.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(n,i),m.swap(),f.setRenderTarget(null),f.clear(),(g=m.read)==null?void 0:g.texture},[n,i]);return[{read:s.current.read,write:s.current.write},l]},z=()=>{const n=u.useRef(new t.Vector2(0,0)),i=u.useRef(new t.Vector2(0,0)),r=u.useRef(0),e=u.useRef(new t.Vector2(0,0)),o=u.useRef(!1);return u.useCallback(v=>{const a=performance.now(),l=v.clone();r.current===0&&(r.current=a,n.current=l);const f=Math.max(1,a-r.current);r.current=a,e.current.copy(l).sub(n.current).divideScalar(f);const d=e.current.length()>0,m=o.current?n.current.clone():l;return!o.current&&d&&(o.current=!0),n.current=l,{currentPointer:l,prevPointer:m,diffPointer:i.current.subVectors(l,m),velocity:e.current,isVelocityUpdate:d}},[])},P=n=>{const i=o=>Object.values(o).some(s=>typeof s=="function"),r=u.useRef(i(n)?n:structuredClone(n)),e=u.useCallback(o=>{for(const s in o){const v=s;v in r.current&&o[v]!==void 0&&o[v]!==null?r.current[v]=o[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[r.current,e]},G={texture:new t.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Color(16777215)},se=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=ie({scene:r,size:n,dpr:i}),o=_(n),s=z(),[v,a]=O({scene:r,camera:o,size:n,dpr:i}),[l,f]=P(G);return[u.useCallback((m,g)=>{const{gl:h,pointer:x}=m;g&&f(g),c(e,"uTexture",l.texture),c(e,"uRadius",l.radius),c(e,"uSmudge",l.smudge),c(e,"uDissipation",l.dissipation),c(e,"uMotionBlur",l.motionBlur),c(e,"uMotionSample",l.motionSample),c(e,"uColor",l.color);const{currentPointer:y,prevPointer:w,velocity:R}=s(x);return c(e,"uMouse",y),c(e,"uPrevMouse",w),c(e,"uVelocity",R),a(h,({read:D})=>{c(e,"uMap",D)})},[e,s,a,l,f]),f,{scene:r,material:e,camera:o,renderTarget:v}]};var le=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ce=`precision highp float;

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
}`;const ve=n=>{const i=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:le,fragmentShader:ce}),[]);return V(n,i,r),r},j={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},de=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=ve(r),o=_(n),[s,v]=C({scene:r,camera:o,size:n,dpr:i}),[a,l]=P(j);return[u.useCallback((d,m)=>{const{gl:g}=d;return m&&l(m),c(e,"uTexture",a.texture),c(e,"uColor0",a.color0),c(e,"uColor1",a.color1),v(g)},[v,e,l,a]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var fe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,me=`precision highp float;

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
}`;const pe=n=>{const i=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new t.Texture},uNoiseMap:{value:new t.Texture},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new t.Color(16777215)}},vertexShader:fe,fragmentShader:me}),[]);return V(n,i,r),r},W={texture:new t.Texture,noiseMap:new t.Texture,distortionStrength:.03,fogEdge0:0,fogEdge1:.9,fogColor:new t.Color(16777215)},ge=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=pe(r),o=_(n),[s,v]=C({scene:r,camera:o,size:n,dpr:i}),[a,l]=P(W);return[u.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&l(m),c(e,"uTime",h.getElapsedTime()),c(e,"uTexture",a.texture),c(e,"uNoiseMap",a.noiseMap),c(e,"distortionStrength",a.distortionStrength),c(e,"fogEdge0",a.fogEdge0),c(e,"fogEdge1",a.fogEdge1),c(e,"fogColor",a.fogColor),v(g)},[v,e,l,a]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var F=`varying vec2 vUv;
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
}`,xe=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const he=()=>u.useMemo(()=>new t.ShaderMaterial({vertexShader:F,fragmentShader:xe,depthTest:!1,depthWrite:!1}),[]);var ye=`precision highp float;

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
}`;const Me=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:F,fragmentShader:ye}),[]);var Te=`precision highp float;

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
}`;const Se=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:Te}),[]);var we=`precision highp float;

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
}`;const Re=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:we}),[]);var be=`precision highp float;

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
}`;const _e=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:be}),[]);var Ce=`precision highp float;

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
}`;const Pe=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:Ce}),[]);var De=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ue=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:De}),[]);var Ve=`precision highp float;

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
}`;const Fe=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:Ve}),[]);var Ee=`precision highp float;

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
}`;const Oe=()=>u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:F,fragmentShader:Ee}),[]),Ae=({scene:n,size:i,dpr:r})=>{const e=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=he(),s=o.clone(),v=_e(),a=Pe(),l=Me(),f=Se(),d=Re(),m=Ue(),g=Fe(),h=Oe(),x=u.useMemo(()=>({vorticityMaterial:a,curlMaterial:v,advectionMaterial:l,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:g,splatMaterial:h}),[a,v,l,f,d,m,g,h]),y=E(i,r);u.useEffect(()=>{c(x.splatMaterial,"aspectRatio",y.x/y.y);for(const M of Object.values(x))c(M,"texelSize",new t.Vector2(1/y.x,1/y.y))},[y,x]);const w=V(n,e,o);u.useEffect(()=>{o.dispose(),w.material=s},[o,w,s]),u.useEffect(()=>()=>{for(const M of Object.values(x))M.dispose()},[x]);const R=u.useCallback(M=>{w.material=M,w.material.needsUpdate=!0},[w]);return[x,R]},X={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1)},Be=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),[e,o]=Ae({scene:r,size:n,dpr:i}),s=_(n),v=z(),a=u.useMemo(()=>({scene:r,camera:s,size:n}),[r,s,n]),[l,f]=O(a),[d,m]=O(a),[g,h]=C(a),[x,y]=C(a),[w,R]=O(a),M=u.useRef(0),D=u.useRef(new t.Vector2(0,0)),A=u.useRef(new t.Vector3(0,0,0)),[b,T]=P(X);return[u.useCallback((cn,Q)=>{const{gl:U,pointer:vn,clock:k,size:ee}=cn;Q&&T(Q),M.current===0&&(M.current=k.getElapsedTime());const ne=Math.min((k.getElapsedTime()-M.current)/3,.02);M.current=k.getElapsedTime();const N=f(U,({read:S})=>{o(e.advectionMaterial),c(e.advectionMaterial,"uVelocity",S),c(e.advectionMaterial,"uSource",S),c(e.advectionMaterial,"dt",ne),c(e.advectionMaterial,"dissipation",b.velocity_dissipation)}),dn=m(U,({read:S})=>{o(e.advectionMaterial),c(e.advectionMaterial,"uVelocity",N),c(e.advectionMaterial,"uSource",S),c(e.advectionMaterial,"dissipation",b.density_dissipation)}),{currentPointer:fn,diffPointer:mn,isVelocityUpdate:pn,velocity:gn}=v(vn);pn&&(f(U,({read:S})=>{o(e.splatMaterial),c(e.splatMaterial,"uTarget",S),c(e.splatMaterial,"point",fn);const B=mn.multiply(D.current.set(ee.width,ee.height).multiplyScalar(b.velocity_acceleration));c(e.splatMaterial,"color",A.current.set(B.x,B.y,1)),c(e.splatMaterial,"radius",b.splat_radius)}),m(U,({read:S})=>{o(e.splatMaterial),c(e.splatMaterial,"uTarget",S);const B=typeof b.fluid_color=="function"?b.fluid_color(gn):b.fluid_color;c(e.splatMaterial,"color",B)}));const xn=h(U,()=>{o(e.curlMaterial),c(e.curlMaterial,"uVelocity",N)});f(U,({read:S})=>{o(e.vorticityMaterial),c(e.vorticityMaterial,"uVelocity",S),c(e.vorticityMaterial,"uCurl",xn),c(e.vorticityMaterial,"curl",b.curl_strength),c(e.vorticityMaterial,"dt",ne)});const hn=y(U,()=>{o(e.divergenceMaterial),c(e.divergenceMaterial,"uVelocity",N)});R(U,({read:S})=>{o(e.clearMaterial),c(e.clearMaterial,"uTexture",S),c(e.clearMaterial,"value",b.pressure_dissipation)}),o(e.pressureMaterial),c(e.pressureMaterial,"uDivergence",hn);let te;for(let S=0;S<b.pressure_iterations;S++)te=R(U,({read:B})=>{c(e.pressureMaterial,"uPressure",B)});return f(U,({read:S})=>{o(e.gradientSubtractMaterial),c(e.gradientSubtractMaterial,"uPressure",te),c(e.gradientSubtractMaterial,"uVelocity",S)}),dn},[e,o,h,m,y,v,R,f,T,b]),T,{scene:r,materials:e,camera:s,renderTarget:{velocity:l,density:d,curl:g,divergence:x,pressure:w}}]},Le=({scale:n,max:i,texture:r,scene:e})=>{const o=u.useRef([]),s=u.useMemo(()=>new t.PlaneGeometry(n,n),[n]),v=u.useMemo(()=>new t.MeshBasicMaterial({map:r??null,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return u.useEffect(()=>{for(let a=0;a<i;a++){const l=new t.Mesh(s.clone(),v.clone());l.rotateZ(2*Math.PI*Math.random()),l.visible=!1,e.add(l),o.current.push(l)}},[s,v,e,i]),u.useEffect(()=>()=>{o.current.forEach(a=>{a.geometry.dispose(),Array.isArray(a.material)?a.material.forEach(l=>l.dispose()):a.material.dispose(),e.remove(a)}),o.current=[]},[e]),o.current},H={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},ze=({texture:n,scale:i=64,max:r=100,size:e})=>{const o=u.useMemo(()=>new t.Scene,[]),s=Le({scale:i,max:r,texture:n,scene:o}),v=_(e),a=z(),[l,f]=C({scene:o,camera:v,size:e}),[d,m]=P(H),g=u.useRef(0);return[u.useCallback((x,y)=>{const{gl:w,pointer:R,size:M}=x;y&&m(y);const{currentPointer:D,diffPointer:A}=a(R);if(d.frequency<A.length()){const T=s[g.current];T.visible=!0,T.position.set(D.x*(M.width/2),D.y*(M.height/2),0),T.scale.x=T.scale.y=0,T.material.opacity=d.alpha,g.current=(g.current+1)%r}return s.forEach(T=>{if(T.visible){const $=T.material;T.rotation.z+=d.rotation,$.opacity*=d.fadeout_speed,T.scale.x=d.fadeout_speed*T.scale.x+d.scale,T.scale.y=T.scale.x,$.opacity<.002&&(T.visible=!1)}}),f(w)},[f,s,a,r,d,m]),m,{scene:o,camera:v,meshArr:s,renderTarget:l}]};var Ie=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,$e=`precision highp float;

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

}`;const ke=({scene:n,size:i,dpr:r})=>{const e=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Ie,fragmentShader:$e}),[]),s=E(i,r);return u.useEffect(()=>{o.uniforms.uResolution.value=s.clone()},[s,o]),V(n,e,o),o},Y={texture0:new t.Texture,texture1:new t.Texture,textureResolution:new t.Vector2(0,0),padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},Ne=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=ke({scene:r,size:n,dpr:i}),o=_(n),[s,v]=C({scene:r,camera:o,dpr:i,size:n,isSizeUpdate:!0}),[a,l]=P(Y);return[u.useCallback((d,m)=>{const{gl:g}=d;return m&&l(m),c(e,"uTexture0",a.texture0),c(e,"uTexture1",a.texture1),c(e,"uTextureResolution",a.textureResolution),c(e,"padding",a.padding),c(e,"uMap",a.map),c(e,"mapIntensity",a.mapIntensity),c(e,"edgeIntensity",a.edgeIntensity),c(e,"epicenter",a.epicenter),c(e,"progress",a.progress),c(e,"dirX",a.dir.x),c(e,"dirY",a.dir.y),v(g)},[v,e,a,l]),l,{scene:r,material:e,camera:o,renderTarget:s}]};var Ge=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,je=`precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float timeStrength;
uniform int noiseOctaves;
uniform int fbmOctaves;

const float per  = 0.5;
const float PI   = 3.14159265359;

float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

float rnd(vec2 p){
	vec3 p3 = fract(vec3(p.xyx) * .1995);
	p3 += dot(p3, p3.yzx + 11.28);
	return fract((p3.x + p3.y) * p3.z);
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

void main() {
	float noiseMap = fbm(gl_FragCoord.xy ,uTime * timeStrength);
	gl_FragColor = vec4(noiseMap,noiseMap,noiseMap,1.0);
}`;const We=n=>{const i=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0}},vertexShader:Ge,fragmentShader:je}),[]);return V(n,i,r),r},q={timeStrength:.3,noiseOctaves:8,fbmOctaves:3},Xe=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=We(r),o=_(n),[s,v]=C({scene:r,camera:o,size:n,dpr:i}),[a,l]=P(q);return[u.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&l(m),c(e,"timeStrength",a.timeStrength),c(e,"noiseOctaves",a.noiseOctaves),c(e,"fbmOctaves",a.fbmOctaves),c(e,"uTime",h.getElapsedTime()),v(g)},[v,e,l,a]),l,{scene:r,material:e,camera:o,renderTarget:s}]},He=n=>{var o,s,v;const i=(o=n.dom)==null?void 0:o.length,r=(s=n.texture)==null?void 0:s.length,e=(v=n.resolution)==null?void 0:v.length;if(!i||!r||!e)throw new Error("No dom or texture or resolution is set");if(i!==r||i!==e)throw new Error("Match dom, texture and resolution length")};var Ye=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,qe=`precision highp float;

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
}`;const Je=({params:n,size:i,scene:r})=>{r.children.length>0&&(r.children.forEach(e=>{e instanceof t.Mesh&&(e.geometry.dispose(),e.material.dispose())}),r.remove(...r.children)),n.texture.forEach((e,o)=>{const s=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:Ye,fragmentShader:qe,transparent:!0,uniforms:{u_texture:{value:e},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:n.boderRadius[o]?n.boderRadius[o]:0}}}));r.add(s)})},Ke=()=>{const n=u.useRef([]),i=u.useRef([]);return u.useCallback(({isIntersectingRef:e,isIntersectingOnceRef:o,params:s})=>{n.current.length>0&&n.current.forEach((a,l)=>{a.unobserve(i.current[l])}),i.current=[],n.current=[];const v=new Array(s.dom.length).fill(!1);e.current=[...v],o.current=[...v],s.dom.forEach((a,l)=>{const f=m=>{m.forEach(g=>{s.onIntersect[l]&&s.onIntersect[l](g),e.current[l]=g.isIntersecting})},d=new IntersectionObserver(f,{rootMargin:"0px",threshold:0});d.observe(a),n.current.push(d),i.current.push(a)})},[])},Ze=({params:n,size:i,resolutionRef:r,scene:e,isIntersectingRef:o})=>{e.children.forEach((s,v)=>{const a=n.dom[v];if(!a)throw new Error("DOM is null.");if(o.current[v]){const l=a.getBoundingClientRect();if(s.scale.set(l.width,l.height,1),s.position.set(l.left+l.width*.5-i.width*.5,-l.top-l.height*.5+i.height*.5,0),s instanceof t.Mesh){const f=s.material;c(f,"u_texture",n.texture[v]),c(f,"u_textureResolution",n.resolution[v]),c(f,"u_resolution",r.current.set(l.width,l.height)),c(f,"u_borderRadius",n.boderRadius[v]?n.boderRadius[v]:0)}}})},Qe=()=>{const n=u.useRef([]),i=u.useRef([]),r=u.useCallback((e,o=!1)=>{n.current.forEach((v,a)=>{v&&(i.current[a]=!0)});const s=o?[...i.current]:[...n.current];return e<0?s:s[e]},[]);return{isIntersectingRef:n,isIntersectingOnceRef:i,isIntersecting:r}},J={texture:[],dom:[],resolution:[],boderRadius:[],onIntersect:[]},en=({size:n,dpr:i},r=[])=>{const e=u.useMemo(()=>new t.Scene,[]),o=_(n),[s,v]=C({scene:e,camera:o,size:n,dpr:i,isSizeUpdate:!0}),[a,l]=P(J),f=u.useRef(new t.Vector2(0,0)),[d,m]=u.useState(!0);u.useEffect(()=>{m(!0)},r);const g=Ke(),{isIntersectingOnceRef:h,isIntersectingRef:x,isIntersecting:y}=Qe();return[u.useCallback((R,M)=>{const{gl:D,size:A}=R;return M&&l(M),He(a),d&&(Je({params:a,size:A,scene:e}),g({isIntersectingRef:x,isIntersectingOnceRef:h,params:a}),m(!1)),Ze({params:a,size:A,resolutionRef:f,scene:e,isIntersectingRef:x}),v(D)},[v,l,g,d,e,a,h,x]),l,{scene:e,camera:o,renderTarget:s,isIntersecting:y}]};var nn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,tn=`precision mediump float;

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
}`;const rn=n=>{const i=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:nn,fragmentShader:tn}),[]);return V(n,i,r),r},K={texture:new t.Texture,blurSize:3,blurPower:5},on=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=rn(r),o=_(n),s=u.useMemo(()=>({scene:r,camera:o,size:n,dpr:i}),[r,o,n,i]),[v,a]=C(s),[l,f]=O(s),[d,m]=P(K);return[u.useCallback((h,x)=>{const{gl:y}=h;x&&m(x),c(e,"uTexture",d.texture),c(e,"uResolution",[d.texture.source.data.width,d.texture.source.data.height]),c(e,"uBlurSize",d.blurSize);let w=f(y);const R=d.blurPower;for(let D=0;D<R;D++)c(e,"uTexture",w),w=f(y);return a(y)},[a,f,e,m,d]),m,{scene:r,material:e,camera:o,renderTarget:v}]};var un=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,an=`precision highp float;

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
}`;const sn=({scene:n,size:i,dpr:r})=>{const e=u.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:new t.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uResolution:{value:new t.Vector2},uMode:{value:0}},vertexShader:un,fragmentShader:an}),[]),s=E(i,r);return u.useEffect(()=>{o.uniforms.uResolution.value=s.clone()},[s,o]),V(n,e,o),o},Z={epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},ln=({size:n,dpr:i})=>{const r=u.useMemo(()=>new t.Scene,[]),e=sn({scene:r,size:n,dpr:i}),o=_(n),[s,v]=C({scene:r,camera:o,size:n,dpr:i,isSizeUpdate:!0}),[a,l]=P(Z);return[u.useCallback((d,m)=>{const{gl:g}=d;return m&&l(m),c(e,"uEpicenter",a.epicenter),c(e,"uProgress",a.progress),c(e,"uWidth",a.width),c(e,"uStrength",a.strength),c(e,"uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),v(g)},[v,e,l,a]),l,{scene:r,material:e,camera:o,renderTarget:s}]};p.BRUSH_PARAMS=G,p.DOMSYNCER_PARAMS=J,p.DUOTONE_PARAMS=j,p.FLUID_PARAMS=X,p.FOGPROJECTION_PARAMS=W,p.FXTEXTURE_PARAMS=Y,p.NOISE_PARAMS=q,p.RIPPLE_PARAMS=H,p.SIMPLEBLUR_PARAMS=K,p.WAVE_PARAMS=Z,p.setUniform=c,p.useAddMesh=V,p.useBrush=se,p.useCamera=_,p.useDomSyncer=en,p.useDoubleFBO=O,p.useDuoTone=de,p.useFluid=Be,p.useFogProjection=ge,p.useFxTexture=Ne,p.useNoise=Xe,p.useParams=P,p.usePointer=z,p.useResolution=E,p.useRipple=ze,p.useSimpleBlur=on,p.useSingleFBO=C,p.useWave=ln,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
