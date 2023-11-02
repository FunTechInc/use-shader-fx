(function(w,$){typeof exports=="object"&&typeof module<"u"?$(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],$):(w=typeof globalThis<"u"?globalThis:w||self,$(w["use-shader-fx"]={},w.THREE,w.React))})(this,function(w,$,a){"use strict";function W(t){const u=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(t){for(const r in t)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(u,r,e.get?e:{enumerable:!0,get:()=>t[r]})}}return u.default=t,Object.freeze(u)}const n=W($);var H=`varying vec2 vUv;

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
}`;const _=(t,u=!1)=>{const r=u?t.width*u:t.width,e=u?t.height*u:t.height;return a.useMemo(()=>new n.Vector2(r,e),[r,e])},U=(t,u,r)=>{const e=a.useMemo(()=>new n.Mesh(u,r),[u,r]);return a.useEffect(()=>{t.add(e)},[t,e]),e},o=(t,u,r)=>{t.uniforms&&t.uniforms[u]&&r!==void 0&&r!==null?t.uniforms[u].value=r:console.error(`Uniform key "${u}" does not exist in the material. or "${u}" is null | undefined`)},K=({scene:t,size:u,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:null},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:1},uTexture:{value:new n.Texture},uRadius:{value:0},uAlpha:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMagnification:{value:0},uMotionBlur:{value:0},uMotionSample:{value:10},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)}},vertexShader:H,fragmentShader:N}),[]),s=_(u,r);return a.useEffect(()=>{o(i,"uAspect",s.width/s.height),o(i,"uResolution",s.clone())},[s,i]),U(t,e,i),i},Z=(t,u)=>{const r=u,e=t/u,[i,s]=[r*e/2,r/2];return{width:i,height:s,near:-1e3,far:1e3}},D=t=>{const u=_(t),{width:r,height:e,near:i,far:s}=Z(u.x,u.y);return a.useMemo(()=>new n.OrthographicCamera(-r,r,e,-e,i,s),[r,e,i,s])},j={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},O=({scene:t,camera:u,size:r,dpr:e=!1,isSizeUpdate:i=!1})=>{const s=a.useRef(),c=_(r,e);s.current=a.useMemo(()=>new n.WebGLRenderTarget(c.x,c.y,j),[]),a.useLayoutEffect(()=>{var l;i&&((l=s.current)==null||l.setSize(c.x,c.y))},[c,i]);const f=a.useCallback((l,v)=>{const d=s.current;return l.setRenderTarget(d),v&&v({read:d.texture}),l.render(t,u),l.setRenderTarget(null),l.clear(),d.texture},[t,u]);return[s.current,f]},L=({scene:t,camera:u,size:r,dpr:e=!1,isSizeUpdate:i=!1})=>{const s=a.useRef({read:null,write:null,swap:function(){let v=this.read;this.read=this.write,this.write=v}}),c=_(r,e),f=a.useMemo(()=>{const v=new n.WebGLRenderTarget(c.x,c.y,j),d=new n.WebGLRenderTarget(c.x,c.y,j);return{read:v,write:d}},[]);s.current.read=f.read,s.current.write=f.write,a.useLayoutEffect(()=>{var v,d;i&&((v=s.current.read)==null||v.setSize(c.x,c.y),(d=s.current.write)==null||d.setSize(c.x,c.y))},[c,i]);const l=a.useCallback((v,d)=>{var p;const m=s.current;return v.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),v.render(t,u),m.swap(),v.setRenderTarget(null),v.clear(),(p=m.read)==null?void 0:p.texture},[t,u]);return[{read:s.current.read,write:s.current.write},l]},A=()=>{const t=a.useRef(new n.Vector2(0,0)),u=a.useRef(new n.Vector2(0,0)),r=a.useRef(0),e=a.useRef(new n.Vector2(0,0)),i=a.useRef(!1);return a.useCallback(c=>{const f=performance.now(),l=c.clone();r.current===0&&(r.current=f,t.current=l);const v=Math.max(1,f-r.current);r.current=f,e.current.copy(l).sub(t.current).divideScalar(v);const d=e.current.length()>0,m=i.current?t.current.clone():l;return!i.current&&d&&(i.current=!0),t.current=l,{currentPointer:l,prevPointer:m,diffPointer:u.current.subVectors(l,m),velocity:e.current,isVelocityUpdate:d}},[])},F=t=>{const u=a.useRef(t),r=a.useCallback(e=>{for(const i in e){const s=i;s in u.current&&e[s]!==void 0&&e[s]!==null?u.current[s]=e[s]:console.error(`"${String(s)}" does not exist in the params. or "${String(s)}" is null | undefined`)}},[]);return[u.current,r]},J=({size:t,dpr:u})=>{const r=a.useMemo(()=>new n.Scene,[]),e=K({scene:r,size:t,dpr:u}),i=D(t),s=A(),[c,f]=L({scene:r,camera:i,size:t}),[l,v]=F({texture:new n.Texture,radius:0,alpha:0,smudge:0,dissipation:0,magnification:0,motionBlur:0,motionSample:10});return[a.useCallback((m,p)=>{const{gl:M,pointer:g}=m;v(p),o(e,"uTexture",l.texture),o(e,"uRadius",l.radius),o(e,"uAlpha",l.alpha),o(e,"uSmudge",l.smudge),o(e,"uDissipation",l.dissipation),o(e,"uMagnification",l.magnification),o(e,"uMotionBlur",l.motionBlur),o(e,"uMotionSample",l.motionSample);const{currentPointer:h,prevPointer:S,velocity:b}=s(g);return o(e,"uMouse",h),o(e,"uPrevMouse",S),o(e,"uVelocity",b),f(M,({read:B})=>{o(e,"uMap",B)})},[e,s,f,l,v]),v,{scene:r,material:e,camera:i,renderTarget:c}]};var Q=`varying vec2 vUv;

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
}`;const ne=t=>{const u=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:Q,fragmentShader:ee}),[]);return U(t,u,r),r},te=({size:t})=>{const u=a.useMemo(()=>new n.Scene,[]),r=ne(u),e=D(t),[i,s]=O({scene:u,camera:e,size:t}),[c,f]=F({texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)});return[a.useCallback((v,d)=>{const{gl:m}=v;return f(d),o(r,"uTexture",c.texture),o(r,"uColor0",c.color0),o(r,"uColor1",c.color1),s(m)},[s,r,f,c]),f,{scene:u,material:r,camera:e,renderTarget:i}]};var re=`varying vec2 vUv;

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
}`;const ae=({scene:t,size:u,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:null},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:1},uRadius:{value:0},uAlpha:{value:0},uDissipation:{value:0},uMagnification:{value:0},uMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)}},vertexShader:re,fragmentShader:oe}),[]),s=_(u,r);return a.useEffect(()=>{o(i,"uAspect",s.width/s.height),o(i,"uResolution",s.clone())},[s,i]),U(t,e,i),i},ie=({size:t,dpr:u})=>{const r=a.useMemo(()=>new n.Scene,[]),e=ae({scene:r,size:t,dpr:u}),i=D(t),s=A(),[c,f]=L({scene:r,camera:i,size:t}),[l,v]=F({radius:0,magnification:0,alpha:0,dissipation:0});return[a.useCallback((m,p)=>{const{gl:M,pointer:g}=m;v(p),o(e,"uRadius",l.radius),o(e,"uAlpha",l.alpha),o(e,"uDissipation",l.dissipation),o(e,"uMagnification",l.magnification);const{currentPointer:h,velocity:S}=s(g);return o(e,"uMouse",h),o(e,"uVelocity",S),f(M,({read:T})=>{o(e,"uMap",T)})},[e,s,f,l,v]),v,{scene:r,material:e,camera:i,renderTarget:c}]};var ue=`varying vec2 vUv;

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
}`;const le=t=>{const u=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new n.Texture},timeStrength:{value:0},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new n.Color(16777215)},noiseOct:{value:8},fbmOct:{value:3}},vertexShader:ue,fragmentShader:se}),[]);return U(t,u,r),r},ce=({size:t})=>{const u=a.useMemo(()=>new n.Scene,[]),r=le(u),e=D(t),[i,s]=O({scene:u,camera:e,size:t}),[c,f]=F({texture:new n.Texture,timeStrength:0,distortionStrength:0,fogEdge0:0,fogEdge1:.9,fogColor:new n.Color(16777215),noiseOct:8,fbmOct:3});return[a.useCallback((v,d)=>{const{gl:m,clock:p}=v;return f(d),o(r,"uTime",p.getElapsedTime()),o(r,"uTexture",c.texture),o(r,"timeStrength",c.timeStrength),o(r,"distortionStrength",c.distortionStrength),o(r,"fogEdge0",c.fogEdge0),o(r,"fogEdge1",c.fogEdge1),o(r,"fogColor",c.fogColor),o(r,"noiseOct",c.noiseOct),o(r,"fbmOct",c.fbmOct),s(m)},[s,r,f,c]),f,{scene:u,material:r,camera:e,renderTarget:i}]};var V=`precision mediump float;
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
}`;const fe=()=>a.useMemo(()=>new n.ShaderMaterial({vertexShader:V,fragmentShader:ve,depthTest:!1,depthWrite:!1}),[]);var de=`precision mediump float;
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
}`;const me=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:V,fragmentShader:de}),[]);var pe=`precision mediump float;
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
}`;const ge=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:pe}),[]);var xe=`precision mediump float;
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
}`;const ye=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:xe}),[]);var Me=`precision mediump float;
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
}`;const he=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Me}),[]);var Te=`precision mediump float;
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
}`;const we=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Te}),[]);var Se=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ce=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Se}),[]);var be=`precision mediump float;
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
}`;const Pe=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:be}),[]);var Re=`precision mediump float;
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
}`;const Ve=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Re}),[]),_e=({scene:t,size:u,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=fe(),s=i.clone(),c=he(),f=we(),l=me(),v=ge(),d=ye(),m=Ce(),p=Pe(),M=Ve(),g=a.useMemo(()=>({vorticityMaterial:f,curlMaterial:c,advectionMaterial:l,divergenceMaterial:v,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:p,splatMaterial:M}),[f,c,l,v,d,m,p,M]),h=_(u,r);a.useEffect(()=>{o(g.splatMaterial,"aspectRatio",h.x/h.y);for(const T of Object.values(g))o(T,"texelSize",new n.Vector2(1/h.x,1/h.y))},[h,g]);const S=U(t,e,i);a.useEffect(()=>{i.dispose(),S.material=s},[i,S,s]);const b=a.useCallback(T=>{S.material=T,S.material.needsUpdate=!0},[S]);return[g,b]},De=({size:t,dpr:u})=>{const r=a.useMemo(()=>new n.Scene,[]),[e,i]=_e({scene:r,size:t,dpr:u}),s=D(t),c=A(),f=a.useMemo(()=>({scene:r,camera:s,size:t,dpr:u}),[r,s,t,u]),[l,v]=L(f),[d,m]=L(f),[p,M]=O(f),[g,h]=O(f),[S,b]=L(f),T=a.useRef(0),B=a.useRef(new n.Vector2(0,0)),P=a.useRef(new n.Vector3(0,0,0)),[C,x]=F({density_dissipation:0,velocity_dissipation:0,velocity_acceleration:0,pressure_dissipation:0,pressure_iterations:20,curl_strength:0,splat_radius:.001,fruid_color:new n.Vector3(1,1,1)});return[a.useCallback((Ne,Ke)=>{const{gl:R,pointer:Ze,clock:q,size:G}=Ne;x(Ke),T.current===0&&(T.current=q.getElapsedTime());const X=Math.min((q.getElapsedTime()-T.current)/3,.02);T.current=q.getElapsedTime();const I=v(R,({read:y})=>{i(e.advectionMaterial),o(e.advectionMaterial,"uVelocity",y),o(e.advectionMaterial,"uSource",y),o(e.advectionMaterial,"dt",X),o(e.advectionMaterial,"dissipation",C.velocity_dissipation)}),Je=m(R,({read:y})=>{i(e.advectionMaterial),o(e.advectionMaterial,"uVelocity",I),o(e.advectionMaterial,"uSource",y),o(e.advectionMaterial,"dissipation",C.density_dissipation)}),{currentPointer:Qe,diffPointer:en,isVelocityUpdate:nn,velocity:tn}=c(Ze);nn&&(v(R,({read:y})=>{i(e.splatMaterial),o(e.splatMaterial,"uTarget",y),o(e.splatMaterial,"point",Qe);const E=en.multiply(B.current.set(G.width,G.height).multiplyScalar(C.velocity_acceleration));o(e.splatMaterial,"color",P.current.set(E.x,E.y,1)),o(e.splatMaterial,"radius",C.splat_radius)}),m(R,({read:y})=>{i(e.splatMaterial),o(e.splatMaterial,"uTarget",y);const E=typeof C.fruid_color=="function"?C.fruid_color(tn):C.fruid_color;o(e.splatMaterial,"color",E)}));const rn=M(R,()=>{i(e.curlMaterial),o(e.curlMaterial,"uVelocity",I)});v(R,({read:y})=>{i(e.vorticityMaterial),o(e.vorticityMaterial,"uVelocity",y),o(e.vorticityMaterial,"uCurl",rn),o(e.vorticityMaterial,"curl",C.curl_strength),o(e.vorticityMaterial,"dt",X)});const on=h(R,()=>{i(e.divergenceMaterial),o(e.divergenceMaterial,"uVelocity",I)});b(R,({read:y})=>{i(e.clearMaterial),o(e.clearMaterial,"uTexture",y),o(e.clearMaterial,"value",C.pressure_dissipation)}),i(e.pressureMaterial),o(e.pressureMaterial,"uDivergence",on);let Y;for(let y=0;y<C.pressure_iterations;y++)Y=b(R,({read:E})=>{o(e.pressureMaterial,"uPressure",E)});return v(R,({read:y})=>{i(e.gradientSubtractMaterial),o(e.gradientSubtractMaterial,"uPressure",Y),o(e.gradientSubtractMaterial,"uVelocity",y)}),Je},[e,i,M,m,h,c,b,v,x,C]),x,{scene:r,materials:e,camera:s,renderTarget:{velocity:l,density:d,curl:p,divergence:g,pressure:S}}]},Fe=({scale:t,max:u,texture:r,scene:e})=>{const i=a.useRef([]),s=a.useMemo(()=>new n.PlaneGeometry(t,t),[t]),c=a.useMemo(()=>new n.MeshBasicMaterial({map:r??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return a.useEffect(()=>{for(let f=0;f<u;f++){const l=new n.Mesh(s.clone(),c.clone());l.rotateZ(2*Math.PI*Math.random()),l.visible=!1,e.add(l),i.current.push(l)}},[s,c,e,u]),i.current},Ue=({texture:t,scale:u=64,max:r=100,size:e})=>{const i=a.useMemo(()=>new n.Scene,[]),s=Fe({scale:u,max:r,texture:t,scene:i}),c=D(e),f=A(),[l,v]=O({scene:i,camera:c,size:e}),[d,m]=F({frequency:.01,rotation:.01,fadeout_speed:.9,scale:.15,alpha:.6}),p=a.useRef(0);return[a.useCallback((g,h)=>{const{gl:S,pointer:b,size:T}=g;m(h);const{currentPointer:B,diffPointer:P}=f(b);if(d.frequency<P.length()){const x=s[p.current];x.visible=!0,x.position.set(B.x*(T.width/2),B.y*(T.height/2),0),x.scale.x=x.scale.y=0,x.material.opacity=d.alpha,p.current=(p.current+1)%r}return s.forEach(x=>{if(x.visible){const k=x.material;x.rotation.z+=d.rotation,k.opacity*=d.fadeout_speed,x.scale.x=d.fadeout_speed*x.scale.x+d.scale,x.scale.y=x.scale.x,k.opacity<.002&&(x.visible=!1)}}),v(S)},[v,s,f,r,d,m]),m,{scene:i,camera:c,meshArr:s,renderTarget:l}]};var z=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Be=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Oe=()=>a.useMemo(()=>new n.ShaderMaterial({vertexShader:z,fragmentShader:Be,depthTest:!1,depthWrite:!1}),[]);var Le=`precision highp float;

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
}`;const Ee=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{resolution:{value:new n.Vector2},dataTex:{value:null},pointerPos:{value:null},beforePointerPos:{value:null},viscosity:{value:0},forceRadius:{value:0},forceCoefficient:{value:0}},vertexShader:z,fragmentShader:Le}),[]);var $e=`precision highp float;

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
}`;const Ae=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{resolution:{value:new n.Vector2(0,0)},dataTex:{value:null},attenuation:{value:0}},vertexShader:z,fragmentShader:$e}),[]);var ze=`precision highp float;

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

}`;const je=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{resolution:{value:new n.Vector2},dataTex:{value:null}},vertexShader:z,fragmentShader:ze}),[]);var ke=`precision highp float;

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
}`;const qe=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{resolution:{value:new n.Vector2},dataTex:{value:null},alpha:{value:0},beta:{value:0}},vertexShader:z,fragmentShader:ke}),[]),Ie=({scene:t,size:u,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=Oe(),s=i.clone(),c=Ee(),f=Ae(),l=je(),v=qe(),d=a.useMemo(()=>({velocityMaterial:c,advectionMaterial:f,divergenceMaterial:l,pressureMaterial:v}),[c,f,l,v]),m=_(u,r);a.useEffect(()=>{for(const g of Object.values(d))o(g,"resolution",m)},[m,d]);const p=U(t,e,i);a.useEffect(()=>{i.dispose(),p.material=s},[i,p,s]);const M=a.useCallback(g=>{p.material=g,p.material.needsUpdate=!0},[p]);return[d,M]},Ge=({size:t,dpr:u})=>{const r=a.useMemo(()=>new n.Scene,[]),[e,i]=Ie({scene:r,size:t,dpr:u}),s=D(t),c=A(),[f,l]=L({scene:r,camera:s,size:t,isSizeUpdate:!0}),[v,d]=F({pressure_iterations:20,attenuation:1,alpha:1,beta:1,viscosity:.99,forceRadius:90,forceCoefficient:1});return[a.useCallback((p,M)=>{const{gl:g,pointer:h}=p;d(M),o(e.advectionMaterial,"attenuation",v.attenuation),o(e.pressureMaterial,"alpha",v.alpha),o(e.pressureMaterial,"beta",v.beta),o(e.velocityMaterial,"viscosity",v.viscosity),o(e.velocityMaterial,"forceRadius",v.forceRadius),o(e.velocityMaterial,"forceCoefficient",v.forceCoefficient),l(g,({read:P})=>{i(e.divergenceMaterial),o(e.divergenceMaterial,"dataTex",P)});const S=v.pressure_iterations;for(let P=0;P<S;P++)l(g,({read:C})=>{i(e.pressureMaterial),o(e.pressureMaterial,"dataTex",C)});const{currentPointer:b,prevPointer:T}=c(h);return o(e.velocityMaterial,"pointerPos",b),o(e.velocityMaterial,"beforePointerPos",T),l(g,({read:P})=>{i(e.velocityMaterial),o(e.velocityMaterial,"dataTex",P)}),l(g,({read:P})=>{i(e.advectionMaterial),o(e.advectionMaterial,"dataTex",P)})},[e,i,c,l,d,v]),d,{scene:r,materials:e,camera:s,renderTarget:f}]};var Xe=`varying vec2 vUv;

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

}`;const We=({scene:t,size:u,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),i=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uImageResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},noise:{value:new n.Texture},noiseStrength:{value:0},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Xe,fragmentShader:Ye}),[]),s=_(u,r);return a.useEffect(()=>{i.uniforms.uResolution.value=s.clone()},[s,i]),U(t,e,i),i},He=({size:t,dpr:u})=>{const r=a.useMemo(()=>new n.Scene,[]),e=We({scene:r,size:t,dpr:u}),i=D(t),[s,c]=O({scene:r,camera:i,dpr:u,size:t,isSizeUpdate:!0}),[f,l]=F({texture0:new n.Texture,texture1:new n.Texture,imageResolution:new n.Vector2(0,0),noise:new n.Texture,noiseStrength:0,progress:0,dir:new n.Vector2(0,0)});return[a.useCallback((d,m)=>{const{gl:p}=d;return l(m),o(e,"uTexture0",f.texture0),o(e,"uTexture1",f.texture1),o(e,"uImageResolution",f.imageResolution),o(e,"noise",f.noise),o(e,"noiseStrength",f.noiseStrength),o(e,"progress",f.progress),o(e,"dirX",f.dir.x),o(e,"dirY",f.dir.y),c(p)},[c,e,f,l]),l,{scene:r,material:e,camera:i,renderTarget:s}]};w.useBrush=J,w.useDuoTone=te,w.useFlowmap=ie,w.useFogProjection=ce,w.useFruid=De,w.useRipple=Ue,w.useSimpleFruid=Ge,w.useTransitionBg=He,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
