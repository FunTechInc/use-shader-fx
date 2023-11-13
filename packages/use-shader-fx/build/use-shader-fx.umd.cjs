(function(g,A){typeof exports=="object"&&typeof module<"u"?A(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],A):(g=typeof globalThis<"u"?globalThis:g||self,A(g["use-shader-fx"]={},g.THREE,g.React))})(this,function(g,A,o){"use strict";function X(r){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const t in r)if(t!=="default"){const e=Object.getOwnPropertyDescriptor(r,t);Object.defineProperty(i,t,e.get?e:{enumerable:!0,get:()=>r[t]})}}return i.default=r,Object.freeze(i)}const n=X(A);var Y=`varying vec2 vUv;

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
}`;const _=(r,i=!1)=>{const t=i?r.width*i:r.width,e=i?r.height*i:r.height;return o.useMemo(()=>new n.Vector2(t,e),[t,e])},U=(r,i,t)=>{const e=o.useMemo(()=>new n.Mesh(i,t),[i,t]);return o.useEffect(()=>{r.add(e)},[r,e]),e},a=(r,i,t)=>{r.uniforms&&r.uniforms[i]&&t!==void 0&&t!==null?r.uniforms[i].value=t:console.error(`Uniform key "${String(i)}" does not exist in the material. or "${String(i)}" is null | undefined`)},J=({scene:r,size:i,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:Y,fragmentShader:H}),[]),s=_(i,t);return o.useEffect(()=>{a(u,"uAspect",s.width/s.height),a(u,"uResolution",s.clone())},[s,u]),U(r,e,u),u},K=(r,i)=>{const t=i,e=r/i,[u,s]=[t*e/2,t/2];return{width:u,height:s,near:-1e3,far:1e3}},D=r=>{const i=_(r),{width:t,height:e,near:u,far:s}=K(i.x,i.y);return o.useMemo(()=>new n.OrthographicCamera(-t,t,e,-e,u,s),[t,e,u,s])},$={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},F=({scene:r,camera:i,size:t,dpr:e=!1,isSizeUpdate:u=!1})=>{const s=o.useRef(),l=_(t,e);s.current=o.useMemo(()=>new n.WebGLRenderTarget(l.x,l.y,$),[]),o.useLayoutEffect(()=>{var c;u&&((c=s.current)==null||c.setSize(l.x,l.y))},[l,u]);const v=o.useCallback((c,f)=>{const d=s.current;return c.setRenderTarget(d),f&&f({read:d.texture}),c.render(r,i),c.setRenderTarget(null),c.clear(),d.texture},[r,i]);return[s.current,v]},B=({scene:r,camera:i,size:t,dpr:e=!1,isSizeUpdate:u=!1})=>{const s=o.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),l=_(t,e),v=o.useMemo(()=>{const f=new n.WebGLRenderTarget(l.x,l.y,$),d=new n.WebGLRenderTarget(l.x,l.y,$);return{read:f,write:d}},[]);s.current.read=v.read,s.current.write=v.write,o.useLayoutEffect(()=>{var f,d;u&&((f=s.current.read)==null||f.setSize(l.x,l.y),(d=s.current.write)==null||d.setSize(l.x,l.y))},[l,u]);const c=o.useCallback((f,d)=>{var p;const m=s.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(r,i),m.swap(),f.setRenderTarget(null),f.clear(),(p=m.read)==null?void 0:p.texture},[r,i]);return[{read:s.current.read,write:s.current.write},c]},E=()=>{const r=o.useRef(new n.Vector2(0,0)),i=o.useRef(new n.Vector2(0,0)),t=o.useRef(0),e=o.useRef(new n.Vector2(0,0)),u=o.useRef(!1);return o.useCallback(l=>{const v=performance.now(),c=l.clone();t.current===0&&(t.current=v,r.current=c);const f=Math.max(1,v-t.current);t.current=v,e.current.copy(c).sub(r.current).divideScalar(f);const d=e.current.length()>0,m=u.current?r.current.clone():c;return!u.current&&d&&(u.current=!0),r.current=c,{currentPointer:c,prevPointer:m,diffPointer:i.current.subVectors(c,m),velocity:e.current,isVelocityUpdate:d}},[])},P=r=>{const i=o.useRef(r),t=o.useCallback(e=>{for(const u in e){const s=u;s in i.current&&e[s]!==void 0&&e[s]!==null?i.current[s]=e[s]:console.error(`"${String(s)}" does not exist in the params. or "${String(s)}" is null | undefined`)}},[]);return[i.current,t]},Z={texture:new n.Texture,radius:.05,smudge:0,dissipation:.9,motionBlur:0,motionSample:5,color:new n.Color(16777215)},Q=({size:r,dpr:i})=>{const t=o.useMemo(()=>new n.Scene,[]),e=J({scene:t,size:r,dpr:i}),u=D(r),s=E(),[l,v]=B({scene:t,camera:u,size:r}),[c,f]=P(Z);return[o.useCallback((m,p)=>{const{gl:T,pointer:w}=m;p&&f(p),a(e,"uTexture",c.texture),a(e,"uRadius",c.radius),a(e,"uSmudge",c.smudge),a(e,"uDissipation",c.dissipation),a(e,"uMotionBlur",c.motionBlur),a(e,"uMotionSample",c.motionSample),a(e,"uColor",c.color);const{currentPointer:y,prevPointer:S,velocity:b}=s(w);return a(e,"uMouse",y),a(e,"uPrevMouse",S),a(e,"uVelocity",b),v(T,({read:O})=>{a(e,"uMap",O)})},[e,s,v,c,f]),f,{scene:t,material:e,camera:u,renderTarget:l}]};var ee=`varying vec2 vUv;

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
}`;const te=r=>{const i=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:ee,fragmentShader:ne}),[]);return U(r,i,t),t},re={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},oe=({size:r})=>{const i=o.useMemo(()=>new n.Scene,[]),t=te(i),e=D(r),[u,s]=F({scene:i,camera:e,size:r}),[l,v]=P(re);return[o.useCallback((f,d)=>{const{gl:m}=f;return d&&v(d),a(t,"uTexture",l.texture),a(t,"uColor0",l.color0),a(t,"uColor1",l.color1),s(m)},[s,t,v,l]),v,{scene:i,material:t,camera:e,renderTarget:u}]};var ie=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ue=`precision mediump float;

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
}`;const ae=({scene:r,size:i,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:null},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:1},uRadius:{value:0},uAlpha:{value:0},uDissipation:{value:0},uMagnification:{value:0},uMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)}},vertexShader:ie,fragmentShader:ue}),[]),s=_(i,t);return o.useEffect(()=>{a(u,"uAspect",s.width/s.height),a(u,"uResolution",s.clone())},[s,u]),U(r,e,u),u},se={radius:.1,magnification:0,alpha:0,dissipation:.9},le=({size:r,dpr:i})=>{const t=o.useMemo(()=>new n.Scene,[]),e=ae({scene:t,size:r,dpr:i}),u=D(r),s=E(),[l,v]=B({scene:t,camera:u,size:r}),[c,f]=P(se);return[o.useCallback((m,p)=>{const{gl:T,pointer:w}=m;p&&f(p),a(e,"uRadius",c.radius),a(e,"uAlpha",c.alpha),a(e,"uDissipation",c.dissipation),a(e,"uMagnification",c.magnification);const{currentPointer:y,velocity:S}=s(w);return a(e,"uMouse",y),a(e,"uVelocity",S),v(T,({read:h})=>{a(e,"uMap",h)})},[e,s,v,c,f]),f,{scene:t,material:e,camera:u,renderTarget:l}]};var ce=`varying vec2 vUv;

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
}`;const fe=r=>{const i=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},uTexture:{value:new n.Texture},uNoiseMap:{value:new n.Texture},distortionStrength:{value:0},fogEdge0:{value:0},fogEdge1:{value:.9},fogColor:{value:new n.Color(16777215)}},vertexShader:ce,fragmentShader:ve}),[]);return U(r,i,t),t},de={texture:new n.Texture,noiseMap:new n.Texture,distortionStrength:.03,fogEdge0:0,fogEdge1:.9,fogColor:new n.Color(16777215)},me=({size:r})=>{const i=o.useMemo(()=>new n.Scene,[]),t=fe(i),e=D(r),[u,s]=F({scene:i,camera:e,size:r}),[l,v]=P(de);return[o.useCallback((f,d)=>{const{gl:m,clock:p}=f;return d&&v(d),a(t,"uTime",p.getElapsedTime()),a(t,"uTexture",l.texture),a(t,"uNoiseMap",l.noiseMap),a(t,"distortionStrength",l.distortionStrength),a(t,"fogEdge0",l.fogEdge0),a(t,"fogEdge1",l.fogEdge1),a(t,"fogColor",l.fogColor),s(m)},[s,t,v,l]),v,{scene:i,material:t,camera:e,renderTarget:u}]};var V=`precision mediump float;
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
}`,pe=`precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const ge=()=>o.useMemo(()=>new n.ShaderMaterial({vertexShader:V,fragmentShader:pe,depthTest:!1,depthWrite:!1}),[]);var xe=`precision mediump float;
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
}`;const Me=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:V,fragmentShader:xe}),[]);var ye=`precision mediump float;
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
}`;const Te=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:ye}),[]);var he=`precision mediump float;
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
}`;const Se=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:he}),[]);var we=`precision mediump float;
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
}`;const Re=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:we}),[]);var be=`precision mediump float;
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
}`;const Ce=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:be}),[]);var De=`precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Pe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:De}),[]);var Ve=`precision mediump float;
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
}`;const _e=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Ve}),[]);var Ue=`precision mediump float;
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
}`;const Fe=()=>o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:V,fragmentShader:Ue}),[]),Be=({scene:r,size:i,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=ge(),s=u.clone(),l=Re(),v=Ce(),c=Me(),f=Te(),d=Se(),m=Pe(),p=_e(),T=Fe(),w=o.useMemo(()=>({vorticityMaterial:v,curlMaterial:l,advectionMaterial:c,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:p,splatMaterial:T}),[v,l,c,f,d,m,p,T]),y=_(i,t);o.useEffect(()=>{a(w.splatMaterial,"aspectRatio",y.x/y.y);for(const h of Object.values(w))a(h,"texelSize",new n.Vector2(1/y.x,1/y.y))},[y,w]);const S=U(r,e,u);o.useEffect(()=>{u.dispose(),S.material=s},[u,S,s]);const b=o.useCallback(h=>{S.material=h,S.material.needsUpdate=!0},[S]);return[w,b]},Oe={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fruid_color:new n.Vector3(1,1,1)},Le=({size:r,dpr:i})=>{const t=o.useMemo(()=>new n.Scene,[]),[e,u]=Be({scene:t,size:r,dpr:i}),s=D(r),l=E(),v=o.useMemo(()=>({scene:t,camera:s,size:r,dpr:i}),[t,s,r,i]),[c,f]=B(v),[d,m]=B(v),[p,T]=F(v),[w,y]=F(v),[S,b]=B(v),h=o.useRef(0),O=o.useRef(new n.Vector2(0,0)),N=o.useRef(new n.Vector3(0,0,0)),[R,x]=P(Oe);return[o.useCallback((He,z)=>{const{gl:C,pointer:Je,clock:k,size:j}=He;z&&x(z),h.current===0&&(h.current=k.getElapsedTime());const q=Math.min((k.getElapsedTime()-h.current)/3,.02);h.current=k.getElapsedTime();const G=f(C,({read:M})=>{u(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",M),a(e.advectionMaterial,"uSource",M),a(e.advectionMaterial,"dt",q),a(e.advectionMaterial,"dissipation",R.velocity_dissipation)}),Ke=m(C,({read:M})=>{u(e.advectionMaterial),a(e.advectionMaterial,"uVelocity",G),a(e.advectionMaterial,"uSource",M),a(e.advectionMaterial,"dissipation",R.density_dissipation)}),{currentPointer:Ze,diffPointer:Qe,isVelocityUpdate:en,velocity:nn}=l(Je);en&&(f(C,({read:M})=>{u(e.splatMaterial),a(e.splatMaterial,"uTarget",M),a(e.splatMaterial,"point",Ze);const L=Qe.multiply(O.current.set(j.width,j.height).multiplyScalar(R.velocity_acceleration));a(e.splatMaterial,"color",N.current.set(L.x,L.y,1)),a(e.splatMaterial,"radius",R.splat_radius)}),m(C,({read:M})=>{u(e.splatMaterial),a(e.splatMaterial,"uTarget",M);const L=typeof R.fruid_color=="function"?R.fruid_color(nn):R.fruid_color;a(e.splatMaterial,"color",L)}));const tn=T(C,()=>{u(e.curlMaterial),a(e.curlMaterial,"uVelocity",G)});f(C,({read:M})=>{u(e.vorticityMaterial),a(e.vorticityMaterial,"uVelocity",M),a(e.vorticityMaterial,"uCurl",tn),a(e.vorticityMaterial,"curl",R.curl_strength),a(e.vorticityMaterial,"dt",q)});const rn=y(C,()=>{u(e.divergenceMaterial),a(e.divergenceMaterial,"uVelocity",G)});b(C,({read:M})=>{u(e.clearMaterial),a(e.clearMaterial,"uTexture",M),a(e.clearMaterial,"value",R.pressure_dissipation)}),u(e.pressureMaterial),a(e.pressureMaterial,"uDivergence",rn);let W;for(let M=0;M<R.pressure_iterations;M++)W=b(C,({read:L})=>{a(e.pressureMaterial,"uPressure",L)});return f(C,({read:M})=>{u(e.gradientSubtractMaterial),a(e.gradientSubtractMaterial,"uPressure",W),a(e.gradientSubtractMaterial,"uVelocity",M)}),Ke},[e,u,T,m,y,l,b,f,x,R]),x,{scene:t,materials:e,camera:s,renderTarget:{velocity:c,density:d,curl:p,divergence:w,pressure:S}}]},Ae=({scale:r,max:i,texture:t,scene:e})=>{const u=o.useRef([]),s=o.useMemo(()=>new n.PlaneGeometry(r,r),[r]),l=o.useMemo(()=>new n.MeshBasicMaterial({map:t??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[t]);return o.useEffect(()=>{for(let v=0;v<i;v++){const c=new n.Mesh(s.clone(),l.clone());c.rotateZ(2*Math.PI*Math.random()),c.visible=!1,e.add(c),u.current.push(c)}},[s,l,e,i]),u.current},Ee={frequency:.01,rotation:.01,fadeout_speed:.9,scale:.15,alpha:.6},$e=({texture:r,scale:i=64,max:t=100,size:e})=>{const u=o.useMemo(()=>new n.Scene,[]),s=Ae({scale:i,max:t,texture:r,scene:u}),l=D(e),v=E(),[c,f]=F({scene:u,camera:l,size:e}),[d,m]=P(Ee),p=o.useRef(0);return[o.useCallback((w,y)=>{const{gl:S,pointer:b,size:h}=w;y&&m(y);const{currentPointer:O,diffPointer:N}=v(b);if(d.frequency<N.length()){const x=s[p.current];x.visible=!0,x.position.set(O.x*(h.width/2),O.y*(h.height/2),0),x.scale.x=x.scale.y=0,x.material.opacity=d.alpha,p.current=(p.current+1)%t}return s.forEach(x=>{if(x.visible){const I=x.material;x.rotation.z+=d.rotation,I.opacity*=d.fadeout_speed,x.scale.x=d.fadeout_speed*x.scale.x+d.scale,x.scale.y=x.scale.x,I.opacity<.002&&(x.visible=!1)}}),f(S)},[f,s,v,t,d,m]),m,{scene:u,camera:l,meshArr:s,renderTarget:c}]};var Ne=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ie=`precision mediump float;

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

}`;const ke=({scene:r,size:i,dpr:t})=>{const e=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uImageResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},uNoiseMap:{value:new n.Texture},noiseStrength:{value:0},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Ne,fragmentShader:Ie}),[]),s=_(i,t);return o.useEffect(()=>{u.uniforms.uResolution.value=s.clone()},[s,u]),U(r,e,u),u},Ge={texture0:new n.Texture,texture1:new n.Texture,imageResolution:new n.Vector2(0,0),uNoiseMap:new n.Texture,noiseStrength:0,progress:0,dir:new n.Vector2(0,0)},ze=({size:r,dpr:i})=>{const t=o.useMemo(()=>new n.Scene,[]),e=ke({scene:t,size:r,dpr:i}),u=D(r),[s,l]=F({scene:t,camera:u,dpr:i,size:r,isSizeUpdate:!0}),[v,c]=P(Ge);return[o.useCallback((d,m)=>{const{gl:p}=d;return m&&c(m),a(e,"uTexture0",v.texture0),a(e,"uTexture1",v.texture1),a(e,"uImageResolution",v.imageResolution),a(e,"uNoiseMap",v.uNoiseMap),a(e,"noiseStrength",v.noiseStrength),a(e,"progress",v.progress),a(e,"dirX",v.dir.x),a(e,"dirY",v.dir.y),l(p)},[l,e,v,c]),c,{scene:t,material:e,camera:u,renderTarget:s}]};var je=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,qe=`precision mediump float;

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
}`;const We=r=>{const i=o.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=o.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0}},vertexShader:je,fragmentShader:qe}),[]);return U(r,i,t),t},Xe={timeStrength:.3,noiseOctaves:8,fbmOctaves:3},Ye=({size:r,dpr:i})=>{const t=o.useMemo(()=>new n.Scene,[]),e=We(t),u=D(r),[s,l]=F({scene:t,camera:u,size:r,dpr:i}),[v,c]=P(Xe);return[o.useCallback((d,m)=>{const{gl:p,clock:T}=d;return m&&c(m),a(e,"timeStrength",v.timeStrength),a(e,"noiseOctaves",v.noiseOctaves),a(e,"fbmOctaves",v.fbmOctaves),a(e,"uTime",T.getElapsedTime()),l(p)},[l,e,c,v]),c,{scene:t,material:e,camera:u,renderTarget:s}]};g.setUniform=a,g.useAddMesh=U,g.useBrush=Q,g.useCamera=D,g.useDoubleFBO=B,g.useDuoTone=oe,g.useFlowmap=le,g.useFogProjection=me,g.useFruid=Le,g.useNoise=Ye,g.useParams=P,g.usePointer=E,g.useResolution=_,g.useRipple=$e,g.useSingleFBO=F,g.useTransitionBg=ze,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
