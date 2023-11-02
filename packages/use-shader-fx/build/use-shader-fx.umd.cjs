(function(h,E){typeof exports=="object"&&typeof module<"u"?E(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],E):(h=typeof globalThis<"u"?globalThis:h||self,E(h["use-shader-fx"]={},h.THREE,h.React))})(this,function(h,E,a){"use strict";function W(r){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const e in r)if(e!=="default"){const n=Object.getOwnPropertyDescriptor(r,e);Object.defineProperty(i,e,n.get?n:{enumerable:!0,get:()=>r[e]})}}return i.default=r,Object.freeze(i)}const t=W(E);var H=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,N=`precision mediump float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;

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
	
	
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, uVelocity, uMotionBlur,uMotionSample);

	
	vec4 bufferColor = motionBlurredColor * uDissipation;

	
	float modifiedRadius = uRadius + (length(velocity) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);

	
	
	vec3 color = vec3(1.0,1.0,1.0);

	
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	
	float onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect);

	
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);
	gl_FragColor = bufferColor;
}`;const _=(r,i=!1)=>{const e=i?r.width*i:r.width,n=i?r.height*i:r.height;return a.useMemo(()=>new t.Vector2(e,n),[e,n])},U=(r,i,e)=>{const n=a.useMemo(()=>new t.Mesh(i,e),[i,e]);return a.useEffect(()=>{r.add(n)},[r,n]),n},o=(r,i,e)=>{r.uniforms&&r.uniforms[i]&&e!==void 0&&e!==null?r.uniforms[i].value=e:console.error(`Uniform key "${i}" does not exist in the material. or "${i}" is null | undefined`)},K=({scene:r,size:i})=>{const e=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=a.useMemo(()=>new t.ShaderMaterial({uniforms:{uMap:{value:null},uResolution:{value:new t.Vector2(0,0)},uAspect:{value:1},uTexture:{value:new t.Texture},uRadius:{value:0},uAlpha:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMagnification:{value:0},uMotionBlur:{value:0},uMotionSample:{value:10},uMouse:{value:new t.Vector2(0,0)},uPrevMouse:{value:new t.Vector2(0,0)},uVelocity:{value:new t.Vector2(0,0)}},vertexShader:H,fragmentShader:N}),[]),u=_(i);return a.useEffect(()=>{o(n,"uAspect",u.width/u.height),o(n,"uResolution",u.clone())},[u,n]),U(r,e,n),n},Z=(r,i)=>{const e=i,n=r/i,[u,l]=[e*n/2,e/2];return{width:u,height:l,near:-1e3,far:1e3}},D=r=>{const i=_(r),{width:e,height:n,near:u,far:l}=Z(i.x,i.y);return a.useMemo(()=>new t.OrthographicCamera(-e,e,n,-n,u,l),[e,n,u,l])},z={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},B=({scene:r,camera:i,size:e,dpr:n=!1,isSizeUpdate:u=!1})=>{const l=a.useRef(),s=_(e,n);l.current=a.useMemo(()=>new t.WebGLRenderTarget(s.x,s.y,z),[]),a.useLayoutEffect(()=>{var v;u&&((v=l.current)==null||v.setSize(s.x,s.y))},[s,u]);const c=a.useCallback((v,f)=>{const d=l.current;return v.setRenderTarget(d),f&&f({read:d.texture}),v.render(r,i),v.setRenderTarget(null),v.clear(),d.texture},[r,i]);return[l.current,c]},O=({scene:r,camera:i,size:e,dpr:n=!1,isSizeUpdate:u=!1})=>{const l=a.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),s=_(e,n),c=a.useMemo(()=>{const f=new t.WebGLRenderTarget(s.x,s.y,z),d=new t.WebGLRenderTarget(s.x,s.y,z);return{read:f,write:d}},[]);l.current.read=c.read,l.current.write=c.write,a.useLayoutEffect(()=>{var f,d;u&&((f=l.current.read)==null||f.setSize(s.x,s.y),(d=l.current.write)==null||d.setSize(s.x,s.y))},[s,u]);const v=a.useCallback((f,d)=>{var p;const m=l.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(r,i),m.swap(),f.setRenderTarget(null),f.clear(),(p=m.read)==null?void 0:p.texture},[r,i]);return[{read:l.current.read,write:l.current.write},v]},$=()=>{const r=a.useRef(new t.Vector2(0,0)),i=a.useRef(new t.Vector2(0,0)),e=a.useRef(0),n=a.useRef(new t.Vector2(0,0)),u=a.useRef(!1);return a.useCallback(s=>{const c=performance.now(),v=s.clone();e.current===0&&(e.current=c,r.current=v);const f=Math.max(1,c-e.current);e.current=c,n.current.copy(v).sub(r.current).divideScalar(f);const d=n.current.length()>0,m=u.current?r.current.clone():v;return!u.current&&d&&(u.current=!0),r.current=v,{currentPointer:v,prevPointer:m,diffPointer:i.current.subVectors(v,m),velocity:n.current,isVelocityUpdate:d}},[])},F=r=>{const i=a.useRef(r),e=a.useCallback(n=>{for(const u in n){const l=u;l in i.current&&n[l]!==void 0&&n[l]!==null?i.current[l]=n[l]:console.error(`"${String(l)}" does not exist in the params. or "${String(l)}" is null | undefined`)}},[]);return[i.current,e]},J=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),e=K({scene:i,size:r}),n=D(r),u=$(),[l,s]=O({scene:i,camera:n,size:r}),[c,v]=F({texture:new t.Texture,radius:0,alpha:0,smudge:0,dissipation:0,magnification:0,motionBlur:0,motionSample:10});return{updateFx:a.useCallback((d,m)=>{const{gl:p,pointer:g}=d;v(m),o(e,"uTexture",c.texture),o(e,"uRadius",c.radius),o(e,"uAlpha",c.alpha),o(e,"uSmudge",c.smudge),o(e,"uDissipation",c.dissipation),o(e,"uMagnification",c.magnification),o(e,"uMotionBlur",c.motionBlur),o(e,"uMotionSample",c.motionSample);const{currentPointer:T,prevPointer:M,velocity:w}=u(g);return o(e,"uMouse",T),o(e,"uPrevMouse",M),o(e,"uVelocity",w),s(p,({read:S})=>{o(e,"uMap",S)})},[e,u,s,c,v]),setParams:v,fxObject:{scene:i,material:e,camera:n,renderTarget:l}}};var Q=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ee=`precision mediump float;

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
}`;const ne=r=>{const i=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),e=a.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:Q,fragmentShader:ee}),[]);return U(r,i,e),e},te=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),e=ne(i),n=D(r),[u,l]=B({scene:i,camera:n,size:r}),[s,c]=F({texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)});return{updateFx:a.useCallback((f,d)=>{const{gl:m}=f;return c(d),o(e,"uTexture",s.texture),o(e,"uColor0",s.color0),o(e,"uColor1",s.color1),l(m)},[l,e,c,s]),setParams:c,fxObject:{scene:i,material:e,camera:n,renderTarget:u}}};var re=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,oe=`precision mediump float;

uniform sampler2D uMap;
uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {

	vec2 st = vUv * 2.0 - 1.0; 

	vec2 vel = uVelocity * uResolution;

	
	vec4 bufferColor = texture2D(uMap, vUv) * uDissipation;
	
	
	vec3 color = vec3(vel * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(vel)), 1.0));
	

	
	vec2 nMouse = (uMouse + vec2(1.0)) * 0.5;
	vec2 cursor = vUv - nMouse;
	cursor.x *= uAspect;

	
	float modifiedRadius = uRadius + (length(vel) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);
	float finalBrush = smoothstep(modifiedRadius,0.0,length(cursor)) * uAlpha;

	
	bufferColor.rgb = mix(bufferColor.rgb, color, vec3(finalBrush));

	gl_FragColor = bufferColor;
}`;const ae=({scene:r,size:i})=>{const e=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=a.useMemo(()=>new t.ShaderMaterial({uniforms:{uMap:{value:null},uResolution:{value:new t.Vector2(0,0)},uAspect:{value:1},uRadius:{value:0},uAlpha:{value:0},uDissipation:{value:0},uMagnification:{value:0},uMouse:{value:new t.Vector2(0,0)},uVelocity:{value:new t.Vector2(0,0)}},vertexShader:re,fragmentShader:oe}),[]),u=_(i);return a.useEffect(()=>{o(n,"uAspect",u.width/u.height),o(n,"uResolution",u.clone())},[u,n]),U(r,e,n),n},ie=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),e=ae({scene:i,size:r}),n=D(r),u=$(),[l,s]=O({scene:i,camera:n,size:r}),[c,v]=F({radius:0,magnification:0,alpha:0,dissipation:0});return{updateFx:a.useCallback((d,m)=>{const{gl:p,pointer:g}=d;v(m),o(e,"uRadius",c.radius),o(e,"uAlpha",c.alpha),o(e,"uDissipation",c.dissipation),o(e,"uMagnification",c.magnification);const{currentPointer:T,velocity:M}=u(g);return o(e,"uMouse",T),o(e,"uVelocity",M),s(p,({read:C})=>{o(e,"uMap",C)})},[e,u,s,c,v]),setParams:v,fxObject:{scene:i,material:e,camera:n,renderTarget:l}}};var ue=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,se=`precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform float timeStrength;
uniform float distortionStrength;
uniform float fogEdge0;
uniform float fogEdge1;
uniform vec3 fogColor;
uniform int noiseOct; 
uniform int fbmOct; 

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
	for(int i = 0; i < noiseOct; i++){
		float freq = pow(2.0, float(i));
		float amp  = pow(per, float(noiseOct - i));
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
	for (int i = 0; i < fbmOct; ++i) {
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
	
	float noiseTextureMap = noiseMap*2.0-1.0;
	uv += noiseTextureMap * distortionStrength;
	vec3 textureMap = texture2D(uTexture, uv).rgb;

	float edge0 = fogEdge0;
	float edge1 = fogEdge1;
	float blendValue = smoothstep(edge0, edge1, noiseMap);

	vec3 outputColor = blendValue * fogColor + (1.0 - blendValue) * textureMap;
	gl_FragColor = vec4(outputColor, 1.0);
}`;const le=r=>{const i=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),e=a.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new t.Texture},timeStrength:{value:0},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new t.Color(16777215)},noiseOct:{value:8},fbmOct:{value:3}},vertexShader:ue,fragmentShader:se}),[]);return U(r,i,e),e},ce=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),e=le(i),n=D(r),[u,l]=B({scene:i,camera:n,size:r}),[s,c]=F({texture:new t.Texture,timeStrength:0,distortionStrength:0,fogEdge0:0,fogEdge1:.9,fogColor:new t.Color(16777215),noiseOct:8,fbmOct:3});return{updateFx:a.useCallback((f,d)=>{const{gl:m,clock:p}=f;return c(d),o(e,"uTime",p.getElapsedTime()),o(e,"uTexture",s.texture),o(e,"timeStrength",s.timeStrength),o(e,"distortionStrength",s.distortionStrength),o(e,"fogEdge0",s.fogEdge0),o(e,"fogEdge1",s.fogEdge1),o(e,"fogColor",s.fogColor),o(e,"noiseOct",s.noiseOct),o(e,"fbmOct",s.fbmOct),l(m)},[l,e,c,s]),setParams:c,fxObject:{scene:i,material:e,camera:n,renderTarget:u}}};var V=`precision mediump float;
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
}`,ve=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const fe=()=>a.useMemo(()=>new t.ShaderMaterial({vertexShader:V,fragmentShader:ve,depthTest:!1,depthWrite:!1}),[]);var de=`precision mediump float;
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
}`;const me=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:V,fragmentShader:de}),[]);var pe=`precision mediump float;
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
}`;const ge=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:pe}),[]);var xe=`precision mediump float;
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
}`;const ye=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:xe}),[]);var Me=`precision mediump float;
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
}`;const he=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:Me}),[]);var Te=`precision mediump float;
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
}`;const we=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:Te}),[]);var Se=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const be=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:Se}),[]);var Ce=`precision mediump float;
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
}`;const Pe=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:Ce}),[]);var Re=`precision mediump float;
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
}`;const Ve=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:V,fragmentShader:Re}),[]),_e=({scene:r,size:i,dpr:e})=>{const n=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=fe(),l=u.clone(),s=he(),c=we(),v=me(),f=ge(),d=ye(),m=be(),p=Pe(),g=Ve(),T=a.useMemo(()=>({vorticityMaterial:c,curlMaterial:s,advectionMaterial:v,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:p,splatMaterial:g}),[c,s,v,f,d,m,p,g]),M=_(i,e);a.useEffect(()=>{o(T.splatMaterial,"aspectRatio",M.x/M.y);for(const S of Object.values(T))o(S,"texelSize",new t.Vector2(1/M.x,1/M.y))},[M,T]);const w=U(r,n,u);a.useEffect(()=>{u.dispose(),w.material=l},[u,w,l]);const C=a.useCallback(S=>{w.material=S,w.material.needsUpdate=!0},[w]);return[T,C]},De=({size:r,dpr:i})=>{const e=a.useMemo(()=>new t.Scene,[]),[n,u]=_e({scene:e,size:r,dpr:i}),l=D(r),s=$(),c=a.useMemo(()=>({scene:e,camera:l,size:r,dpr:i}),[e,l,r,i]),[v,f]=O(c),[d,m]=O(c),[p,g]=B(c),[T,M]=B(c),[w,C]=O(c),S=a.useRef(0),b=a.useRef(new t.Vector2(0,0)),A=a.useRef(new t.Vector3(0,0,0)),[P,x]=F({density_dissipation:0,velocity_dissipation:0,velocity_acceleration:0,pressure_dissipation:0,pressure_iterations:20,curl_strength:0,splat_radius:.001,fruid_color:new t.Vector3(1,1,1)});return{updateFx:a.useCallback((Ne,Ke)=>{const{gl:R,pointer:Ze,clock:q,size:G}=Ne;x(Ke),S.current===0&&(S.current=q.getElapsedTime());const X=Math.min((q.getElapsedTime()-S.current)/3,.02);S.current=q.getElapsedTime();const I=f(R,({read:y})=>{u(n.advectionMaterial),o(n.advectionMaterial,"uVelocity",y),o(n.advectionMaterial,"uSource",y),o(n.advectionMaterial,"dt",X),o(n.advectionMaterial,"dissipation",P.velocity_dissipation)}),Je=m(R,({read:y})=>{u(n.advectionMaterial),o(n.advectionMaterial,"uVelocity",I),o(n.advectionMaterial,"uSource",y),o(n.advectionMaterial,"dissipation",P.density_dissipation)}),{currentPointer:Qe,diffPointer:en,isVelocityUpdate:nn,velocity:tn}=s(Ze);nn&&(f(R,({read:y})=>{u(n.splatMaterial),o(n.splatMaterial,"uTarget",y),o(n.splatMaterial,"point",Qe);const L=en.multiply(b.current.set(G.width,G.height).multiplyScalar(P.velocity_acceleration));o(n.splatMaterial,"color",A.current.set(L.x,L.y,1)),o(n.splatMaterial,"radius",P.splat_radius)}),m(R,({read:y})=>{u(n.splatMaterial),o(n.splatMaterial,"uTarget",y);const L=typeof P.fruid_color=="function"?P.fruid_color(tn):P.fruid_color;o(n.splatMaterial,"color",L)}));const rn=g(R,()=>{u(n.curlMaterial),o(n.curlMaterial,"uVelocity",I)});f(R,({read:y})=>{u(n.vorticityMaterial),o(n.vorticityMaterial,"uVelocity",y),o(n.vorticityMaterial,"uCurl",rn),o(n.vorticityMaterial,"curl",P.curl_strength),o(n.vorticityMaterial,"dt",X)});const on=M(R,()=>{u(n.divergenceMaterial),o(n.divergenceMaterial,"uVelocity",I)});C(R,({read:y})=>{u(n.clearMaterial),o(n.clearMaterial,"uTexture",y),o(n.clearMaterial,"value",P.pressure_dissipation)}),u(n.pressureMaterial),o(n.pressureMaterial,"uDivergence",on);let Y;for(let y=0;y<P.pressure_iterations;y++)Y=C(R,({read:L})=>{o(n.pressureMaterial,"uPressure",L)});return f(R,({read:y})=>{u(n.gradientSubtractMaterial),o(n.gradientSubtractMaterial,"uPressure",Y),o(n.gradientSubtractMaterial,"uVelocity",y)}),Je},[n,u,g,m,M,s,C,f,x,P]),setParams:x,fxObject:{scene:e,materials:n,camera:l,renderTarget:{velocity:v,density:d,curl:p,divergence:T,pressure:w}}}},Fe=({scale:r,max:i,texture:e,scene:n})=>{const u=a.useRef([]),l=a.useMemo(()=>new t.PlaneGeometry(r,r),[r]),s=a.useMemo(()=>new t.MeshBasicMaterial({map:e??null,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[e]);return a.useEffect(()=>{for(let c=0;c<i;c++){const v=new t.Mesh(l.clone(),s.clone());v.rotateZ(2*Math.PI*Math.random()),v.visible=!1,n.add(v),u.current.push(v)}},[l,s,n,i]),u.current},Ue=({texture:r,scale:i=64,max:e=100,size:n})=>{const u=a.useMemo(()=>new t.Scene,[]),l=Fe({scale:i,max:e,texture:r,scene:u}),s=D(n),c=$(),[v,f]=B({scene:u,camera:s,size:n}),[d,m]=F({frequency:.01,rotation:.01,fadeout_speed:.9,scale:.15,alpha:.6}),p=a.useRef(0);return{updateFx:a.useCallback((T,M)=>{const{gl:w,pointer:C,size:S}=T;m(M);const{currentPointer:b,diffPointer:A}=c(C);if(d.frequency<A.length()){const x=l[p.current];x.visible=!0,x.position.set(b.x*(S.width/2),b.y*(S.height/2),0),x.scale.x=x.scale.y=0,x.material.opacity=d.alpha,p.current=(p.current+1)%e}return l.forEach(x=>{if(x.visible){const k=x.material;x.rotation.z+=d.rotation,k.opacity*=d.fadeout_speed,x.scale.x=d.fadeout_speed*x.scale.x+d.scale,x.scale.y=x.scale.x,k.opacity<.002&&(x.visible=!1)}}),f(w)},[f,l,c,e,d,m]),setParams:m,fxObject:{scene:u,camera:s,meshArr:l,renderTarget:v}}};var j=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Be=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Oe=()=>a.useMemo(()=>new t.ShaderMaterial({vertexShader:j,fragmentShader:Be,depthTest:!1,depthWrite:!1}),[]);var Le=`precision highp float;

uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform vec2 resolution;
uniform sampler2D dataTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;

#pragma glslify: map            = require('./map.glsl')
#pragma glslify: samplePressure = require('./samplePressure.glsl')
#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')

varying vec2 vUv;

void main(){
	vec2 r = resolution;
	vec2 uv = gl_FragCoord.xy / r;
	vec4 data = texture2D(dataTex, uv);
	vec2 v = data.xy;

	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	
	vec2 mPos = 0.5 * (pointerPos + 1.0) * r;
	vec2 mPPos = 0.5 * (beforePointerPos + 1.0) * r;
	vec2 mouseV = mPos - mPPos;
	float len = length(mPos - uv * r) / forceRadius;
	float d = clamp(1.0 - len, 0.0, 1.0) * length(mouseV) * forceCoefficient;
	vec2 mforce = d * normalize(mPos - uv * r + mouseV);

	v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
	v += mforce;
	v *= viscosity;

	gl_FragColor = vec4(v, data.zw);
}`;const Ee=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{resolution:{value:new t.Vector2},dataTex:{value:null},pointerPos:{value:null},beforePointerPos:{value:null},viscosity:{value:0},forceRadius:{value:0},forceCoefficient:{value:0}},vertexShader:j,fragmentShader:Le}),[]);var $e=`precision highp float;

uniform float attenuation;
uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')
#pragma glslify: samplePressure = require('./samplePressure.glsl')

varying vec2 vUv;

vec2 bilerpVelocity(sampler2D tex, vec2 p, vec2 resolution) {
	vec4 ij; 
	ij.xy = floor(p - 0.5) + 0.5;
	ij.zw = ij.xy + 1.0;

	vec4 uv = ij / resolution.xyxy;
	vec2 d11 = sampleVelocity(tex, uv.xy, resolution);
	vec2 d21 = sampleVelocity(tex, uv.zy, resolution);
	vec2 d12 = sampleVelocity(tex, uv.xw, resolution);
	vec2 d22 = sampleVelocity(tex, uv.zw, resolution);

	vec2 a = p - ij.xy;

	return mix(mix(d11, d21, a.x), mix(d12, d22, a.x), a.y);
}

void main(){
	vec2 r = resolution;
	vec2 p = gl_FragCoord.xy - sampleVelocity(dataTex, gl_FragCoord.xy / r, r);

	gl_FragColor = vec4(bilerpVelocity(dataTex, p, r) * attenuation, samplePressure(dataTex, gl_FragCoord.xy / r, r), 0.0);
}`;const je=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{resolution:{value:new t.Vector2(0,0)},dataTex:{value:null},attenuation:{value:0}},vertexShader:j,fragmentShader:$e}),[]);var Ae=`precision highp float;

uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')

void main(){
	vec2 r = resolution;
	vec4 data = texture2D(dataTex, gl_FragCoord.xy / r);

	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	
	vec2 vLeft   = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	vec2 vRight  = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	vec2 vTop    = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	vec2 vBottom = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y)) * 0.5;

	gl_FragColor = vec4(data.xy, data.z, divergence);

}`;const ze=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{resolution:{value:new t.Vector2},dataTex:{value:null}},vertexShader:j,fragmentShader:Ae}),[]);var ke=`precision highp float;

uniform float alpha;
uniform float beta;
uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: samplePressure = require('./samplePressure.glsl')

void main(){
	vec2 r = resolution;
	vec4 data = texture2D(dataTex, gl_FragCoord.xy / r);

	
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - vec2(1.0, 0.0)) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + vec2(1.0, 0.0)) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - vec2(0.0, 1.0)) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + vec2(0.0, 1.0)) / r, r);

	float divergence = data.w;
	float pressure = (divergence * alpha + (pLeft + pRight + pTop + pBottom)) * 0.25 * beta;
	gl_FragColor = vec4(data.xy, pressure, divergence);
}`;const qe=()=>a.useMemo(()=>new t.ShaderMaterial({uniforms:{resolution:{value:new t.Vector2},dataTex:{value:null},alpha:{value:0},beta:{value:0}},vertexShader:j,fragmentShader:ke}),[]),Ie=({scene:r,size:i})=>{const e=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=Oe(),u=n.clone(),l=Ee(),s=je(),c=ze(),v=qe(),f=a.useMemo(()=>({velocityMaterial:l,advectionMaterial:s,divergenceMaterial:c,pressureMaterial:v}),[l,s,c,v]),d=_(i);a.useEffect(()=>{for(const g of Object.values(f))o(g,"resolution",d)},[d,f]);const m=U(r,e,n);a.useEffect(()=>{n.dispose(),m.material=u},[n,m,u]);const p=a.useCallback(g=>{m.material=g,m.material.needsUpdate=!0},[m]);return[f,p]},Ge=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),[e,n]=Ie({scene:i,size:r}),u=D(r),l=$(),[s,c]=O({scene:i,camera:u,size:r,isSizeUpdate:!0}),[v,f]=F({pressure_iterations:20,attenuation:1,alpha:1,beta:1,viscosity:.99,forceRadius:90,forceCoefficient:1});return{updateFx:a.useCallback((m,p)=>{const{gl:g,pointer:T}=m;f(p),o(e.advectionMaterial,"attenuation",v.attenuation),o(e.pressureMaterial,"alpha",v.alpha),o(e.pressureMaterial,"beta",v.beta),o(e.velocityMaterial,"viscosity",v.viscosity),o(e.velocityMaterial,"forceRadius",v.forceRadius),o(e.velocityMaterial,"forceCoefficient",v.forceCoefficient),c(g,({read:b})=>{n(e.divergenceMaterial),o(e.divergenceMaterial,"dataTex",b)});const M=v.pressure_iterations;for(let b=0;b<M;b++)c(g,({read:A})=>{n(e.pressureMaterial),o(e.pressureMaterial,"dataTex",A)});const{currentPointer:w,prevPointer:C}=l(T);return o(e.velocityMaterial,"pointerPos",w),o(e.velocityMaterial,"beforePointerPos",C),c(g,({read:b})=>{n(e.velocityMaterial),o(e.velocityMaterial,"dataTex",b)}),c(g,({read:b})=>{n(e.advectionMaterial),o(e.advectionMaterial,"dataTex",b)})},[e,n,l,c,f,v]),setParams:f,fxObject:{scene:i,materials:e,camera:u,renderTarget:s}}};var Xe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ye=`precision mediump float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D noise;
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

	
	vec2 noiseMap = texture2D(noise, uv).rg;
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

}`;const We=({scene:r,size:i})=>{const e=a.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=a.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uImageResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},noise:{value:new t.Texture},noiseStrength:{value:0},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Xe,fragmentShader:Ye}),[]),u=_(i);return a.useEffect(()=>{n.uniforms.uResolution.value=u.clone()},[u,n]),U(r,e,n),n},He=({size:r})=>{const i=a.useMemo(()=>new t.Scene,[]),e=We({scene:i,size:r}),n=D(r),[u,l]=B({scene:i,camera:n,size:r}),[s,c]=F({texture0:new t.Texture,texture1:new t.Texture,imageResolution:new t.Vector2(0,0),noise:new t.Texture,noiseStrength:0,progress:0,dir:new t.Vector2(0,0)});return{updateFx:a.useCallback((f,d)=>{const{gl:m}=f;return c(d),o(e,"uTexture0",s.texture0),o(e,"uTexture1",s.texture1),o(e,"uImageResolution",s.imageResolution),o(e,"noise",s.noise),o(e,"noiseStrength",s.noiseStrength),o(e,"progress",s.progress),o(e,"dirX",s.dir.x),o(e,"dirY",s.dir.y),l(m)},[l,e,s,c]),setParams:c,fxObject:{scene:i,material:e,camera:n,renderTarget:u}}};h.useBrush=J,h.useDuoTone=te,h.useFlowmap=ie,h.useFogProjection=ce,h.useFruid=De,h.useRipple=Ue,h.useSimpleFruid=Ge,h.useTransitionBg=He,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
