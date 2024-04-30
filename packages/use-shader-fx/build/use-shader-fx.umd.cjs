(function(S,re){typeof exports=="object"&&typeof module<"u"?re(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],re):(S=typeof globalThis<"u"?globalThis:S||self,re(S["use-shader-fx"]={},S.THREE,S.React))})(this,function(S,re,m){"use strict";function We(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const o=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,o.get?o:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const a=We(re);var ke=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,$e=`precision highp float;

uniform sampler2D uBuffer;
uniform sampler2D uTexture;
uniform bool uIsTexture;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform float uMapIntensity;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;
uniform bool uIsCursor;
uniform float uPressureStart;
uniform float uPressureEnd;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float radius, float pressureStart, float pressureEnd) {
	
	float aspect = uResolution.x / uResolution.y;

	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	vec2 dir = normalize(end - start);
	vec2 n = vec2(dir.y, -dir.x);
	vec2 p0 = point - start;
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	float progress = clamp(distAlongLine / totalLength, 0.0, 1.0);
	float pressure = mix(pressureStart, pressureEnd, progress);
	radius = min(radius,radius * pressure);

	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < radius && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < radius || distFromEnd < radius;

	return float(withinLine);
}

vec4 createSmudge(vec2 uv){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);

	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uBuffer, uv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

vec4 createMotionBlur(vec2 uv , vec4 baseColor, vec2 velocity) {
	vec2 scaledV = velocity * uMotionBlur;
	for(int i = 1; i < uMotionSample; i++) {
		float t = float(i) / float(uMotionSample - 1);
		vec2 offset = t * scaledV / uResolution;
		baseColor += texture2D(uBuffer, uv + offset);
	}
	return baseColor / float(uMotionSample);
}

void main() {

	vec2 uv = vUv;
	if(uIsMap){
		vec2 mapColor = texture2D(uMap, uv).rg;
		vec2 normalizedMap = mapColor * 2.0 - 1.0;
		uv = uv * 2.0 - 1.0;
		uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
		uv = (uv + 1.0) / 2.0;
	}
	vec2 suv = uv*2.-1.;

	vec2 velocity = uVelocity * uResolution;

	float radius = max(0.0,uRadius);
	
	vec4 smudgedColor = uSmudge > 0. ? createSmudge(uv) : texture2D(uBuffer, uv);

	vec4 motionBlurredColor = uMotionBlur > 0. ? createMotionBlur(uv,smudgedColor, velocity) : smudgedColor;

	vec4 bufferColor = motionBlurredColor;
	bufferColor.a = bufferColor.a < 1e-10 ? 0.0 : bufferColor.a * uDissipation;
	
	vec4 brushColor = uIsTexture ? texture2D(uTexture, uv) : vec4(uColor,1.);
	
	float onLine = isOnLine(suv, uPrevMouse, uMouse, radius, uPressureStart,uPressureEnd);
	float isOnLine = length(velocity) > 0. ? onLine : uIsCursor ? onLine : 0.;

	vec4 finalColor = mix(bufferColor, brushColor, isOnLine);

	gl_FragColor = finalColor;
}`;const N=(e,n=!1)=>{const t=n?e.width*n:e.width,o=n?e.height*n:e.height;return m.useMemo(()=>new a.Vector2(t,o),[t,o])},A=e=>(n,t)=>{if(t===void 0)return;const o=e.uniforms;o&&o[n]&&(o[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const o=e.uniforms;o&&o[t]&&(o[t].value=n[t])})},L=(e,n,t,o)=>{const r=m.useMemo(()=>{const f=new o(n,t);return e&&e.add(f),f},[n,t,o,e]);return m.useEffect(()=>()=>{e&&e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},Ce=process.env.NODE_ENV==="development",z={transparent:!1,depthTest:!1,depthWrite:!1},T=new a.DataTexture(new Uint8Array([0,0,0,0]),1,1,a.RGBAFormat),je=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:r})=>{const f=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),s=m.useMemo(()=>{const g=new a.ShaderMaterial({uniforms:{uBuffer:{value:T},uResolution:{value:new a.Vector2(0,0)},uTexture:{value:T},uIsTexture:{value:!1},uMap:{value:T},uIsMap:{value:!1},uMapIntensity:{value:Y.mapIntensity},uRadius:{value:Y.radius},uSmudge:{value:Y.smudge},uDissipation:{value:Y.dissipation},uMotionBlur:{value:Y.motionBlur},uMotionSample:{value:Y.motionSample},uMouse:{value:new a.Vector2(-10,-10)},uPrevMouse:{value:new a.Vector2(-10,-10)},uVelocity:{value:new a.Vector2(0,0)},uColor:{value:Y.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1},...o},vertexShader:ke,fragmentShader:$e,...z,transparent:!0});return r&&(g.onBeforeCompile=r),g},[r,o]),i=N(n,t);A(s)("uResolution",i.clone());const v=L(e,f,s,a.Mesh);return{material:s,mesh:v}},qe=(e,n)=>{const t=n,o=e/n,[r,f]=[t*o/2,t/2];return{width:r,height:f,near:-1e3,far:1e3}},W=(e,n="OrthographicCamera")=>{const t=N(e),{width:o,height:r,near:f,far:s}=qe(t.x,t.y);return m.useMemo(()=>n==="OrthographicCamera"?new a.OrthographicCamera(-o,o,r,-r,f,s):new a.PerspectiveCamera(50,o/r),[o,r,f,s,n])},de=(e=0)=>{const n=m.useRef(new a.Vector2(0,0)),t=m.useRef(new a.Vector2(0,0)),o=m.useRef(new a.Vector2(0,0)),r=m.useRef(0),f=m.useRef(new a.Vector2(0,0)),s=m.useRef(!1);return m.useCallback(v=>{const g=performance.now();let x;s.current&&e?(o.current=o.current.lerp(v,1-e),x=o.current.clone()):(x=v.clone(),o.current=x),r.current===0&&(r.current=g,n.current=x);const h=Math.max(1,g-r.current);r.current=g,f.current.copy(x).sub(n.current).divideScalar(h);const p=f.current.length()>0,l=s.current?n.current.clone():x;return!s.current&&p&&(s.current=!0),n.current=x,{currentPointer:x,prevPointer:l,diffPointer:t.current.subVectors(x,l),velocity:f.current,isVelocityUpdate:p}},[e])},k=e=>{const n=r=>Object.values(r).some(f=>typeof f=="function"),t=m.useRef(n(e)?e:structuredClone(e)),o=m.useCallback(r=>{for(const f in r){const s=f;s in t.current&&r[s]!==void 0&&r[s]!==null?t.current[s]=r[s]:console.error(`"${String(s)}" does not exist in the params. or "${String(s)}" is null | undefined`)}},[]);return[t.current,o]},ce={minFilter:a.LinearFilter,magFilter:a.LinearFilter,type:a.HalfFloatType,stencilBuffer:!1},ge=({gl:e,fbo:n,scene:t,camera:o,onBeforeRender:r,onSwap:f})=>{e.setRenderTarget(n),r(),e.clear(),e.render(t,o),f&&f(),e.setRenderTarget(null),e.clear()},$=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:r=!1,samples:f=0,depthBuffer:s=!1,depthTexture:i=!1})=>{var h;const v=m.useRef(),g=N(t,o);v.current=m.useMemo(()=>{const p=new a.WebGLRenderTarget(g.x,g.y,{...ce,samples:f,depthBuffer:s});return i&&(p.depthTexture=new a.DepthTexture(g.x,g.y,a.FloatType)),p},[]),r&&((h=v.current)==null||h.setSize(g.x,g.y)),m.useEffect(()=>{const p=v.current;return()=>{p==null||p.dispose()}},[]);const x=m.useCallback((p,l)=>{const d=v.current;return ge({gl:p,fbo:d,scene:e,camera:n,onBeforeRender:()=>l&&l({read:d.texture})}),d.texture},[e,n]);return[v.current,x]},ne=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:r=!1,samples:f=0,depthBuffer:s=!1,depthTexture:i=!1})=>{var p,l;const v=m.useRef({read:null,write:null,swap:function(){let d=this.read;this.read=this.write,this.write=d}}),g=N(t,o),x=m.useMemo(()=>{const d=new a.WebGLRenderTarget(g.x,g.y,{...ce,samples:f,depthBuffer:s}),u=new a.WebGLRenderTarget(g.x,g.y,{...ce,samples:f,depthBuffer:s});return i&&(d.depthTexture=new a.DepthTexture(g.x,g.y,a.FloatType),u.depthTexture=new a.DepthTexture(g.x,g.y,a.FloatType)),{read:d,write:u}},[]);v.current.read=x.read,v.current.write=x.write,r&&((p=v.current.read)==null||p.setSize(g.x,g.y),(l=v.current.write)==null||l.setSize(g.x,g.y)),m.useEffect(()=>{const d=v.current;return()=>{var u,c;(u=d.read)==null||u.dispose(),(c=d.write)==null||c.dispose()}},[]);const h=m.useCallback((d,u)=>{var M;const c=v.current;return ge({gl:d,scene:e,camera:n,fbo:c.write,onBeforeRender:()=>u&&u({read:c.read.texture,write:c.write.texture}),onSwap:()=>c.swap()}),(M=c.read)==null?void 0:M.texture},[e,n]);return[{read:v.current.read,write:v.current.write},h]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Y=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new a.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ne=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=je({scene:i,size:e,dpr:s.shader,uniforms:r,onBeforeCompile:f}),x=W(e),h=de(),[p,l]=ne({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[d,u]=k(Y),c=m.useRef(null),M=A(v),_=V(v);return[m.useCallback((b,C,w)=>{const{gl:R,pointer:U}=b;C&&u(C),d.texture?(M("uIsTexture",!0),M("uTexture",d.texture)):M("uIsTexture",!1),d.map?(M("uIsMap",!0),M("uMap",d.map),M("uMapIntensity",d.mapIntensity)):M("uIsMap",!1),M("uRadius",d.radius),M("uSmudge",d.smudge),M("uDissipation",d.dissipation),M("uMotionBlur",d.motionBlur),M("uMotionSample",d.motionSample);const F=d.pointerValues||h(U);F.isVelocityUpdate&&(M("uMouse",F.currentPointer),M("uPrevMouse",F.prevPointer)),M("uVelocity",F.velocity);const I=typeof d.color=="function"?d.color(F.velocity):d.color;return M("uColor",I),M("uIsCursor",d.isCursor),M("uPressureEnd",d.pressure),c.current===null&&(c.current=d.pressure),M("uPressureStart",c.current),c.current=d.pressure,_(w),l(R,({read:P})=>{M("uBuffer",P)})},[M,h,l,d,u,_]),u,{scene:i,mesh:g,material:v,camera:x,renderTarget:p,output:p.read.texture}]};var Q=`varying vec2 vUv;
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
}`,Ge=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Ke=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:n,vertexShader:Q,fragmentShader:Ge,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Xe=`precision highp float;

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
}`;const He=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uVelocity:{value:T},uSource:{value:T},texelSize:{value:new a.Vector2},dt:{value:0},dissipation:{value:0},...n},vertexShader:Q,fragmentShader:Xe,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Ye=`precision highp float;

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
}`;const Qe=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:Ye,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Ze=`precision highp float;

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
}`;const Je=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:Ze,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var en=`precision highp float;

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
}`;const nn=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:en,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var tn=`precision highp float;

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
}`;const on=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:tn,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var rn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const an=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uTexture:{value:T},value:{value:0},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:rn,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var un=`precision highp float;

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
}`;const sn=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uPressure:{value:T},uVelocity:{value:T},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:un,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var ln=`precision highp float;

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
}`;const cn=({onBeforeCompile:e,uniforms:n})=>m.useMemo(()=>{const o=new a.ShaderMaterial({uniforms:{uTarget:{value:T},aspectRatio:{value:0},color:{value:new a.Vector3},point:{value:new a.Vector2},radius:{value:0},texelSize:{value:new a.Vector2},...n},vertexShader:Q,fragmentShader:ln,...z});return e&&(o.onBeforeCompile=e),o},[e,n]),Z=(e,n)=>{const t=n==null?void 0:n.onBeforeCompile;return e({onBeforeCompile:t})},vn=({scene:e,size:n,dpr:t,fluidOnBeforeCompile:o})=>{const r=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),{curl:f,vorticity:s,advection:i,divergence:v,pressure:g,clear:x,gradientSubtract:h,splat:p}=o??{},l=Z(Ke),d=l.clone(),u=Z(nn,f),c=Z(on,s),M=Z(He,i),_=Z(Qe,v),y=Z(Je,g),b=Z(an,x),C=Z(sn,h),w=Z(cn,p),R=m.useMemo(()=>({vorticityMaterial:c,curlMaterial:u,advectionMaterial:M,divergenceMaterial:_,pressureMaterial:y,clearMaterial:b,gradientSubtractMaterial:C,splatMaterial:w}),[c,u,M,_,y,b,C,w]),U=N(n,t);m.useMemo(()=>{A(R.splatMaterial)("aspectRatio",U.x/U.y);for(const P of Object.values(R))A(P)("texelSize",new a.Vector2(1/U.x,1/U.y))},[U,R]);const F=L(e,r,l,a.Mesh);m.useMemo(()=>{l.dispose(),F.material=d},[l,F,d]),m.useEffect(()=>()=>{for(const P of Object.values(R))P.dispose()},[R]);const I=m.useCallback(P=>{F.material=P,F.material.needsUpdate=!0},[F]);return{materials:R,setMeshMaterial:I,mesh:F}},Te=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new a.Vector3(1,1,1),pointerValues:!1}),mn=({size:e,dpr:n,samples:t,isSizeUpdate:o,fluidOnBeforeCompile:r})=>{const f=O(n),s=m.useMemo(()=>new a.Scene,[]),{materials:i,setMeshMaterial:v,mesh:g}=vn({scene:s,size:e,dpr:f.shader,fluidOnBeforeCompile:r}),x=W(e),h=de(),p=m.useMemo(()=>({scene:s,camera:x,dpr:f.fbo,size:e,samples:t,isSizeUpdate:o}),[s,x,e,t,f.fbo,o]),[l,d]=ne(p),[u,c]=ne(p),[M,_]=$(p),[y,b]=$(p),[C,w]=ne(p),R=m.useRef(0),U=m.useRef(new a.Vector2(0,0)),F=m.useRef(new a.Vector3(0,0,0)),[I,P]=k(Te),D=m.useMemo(()=>({advection:A(i.advectionMaterial),splat:A(i.splatMaterial),curl:A(i.curlMaterial),vorticity:A(i.vorticityMaterial),divergence:A(i.divergenceMaterial),clear:A(i.clearMaterial),pressure:A(i.pressureMaterial),gradientSubtract:A(i.gradientSubtractMaterial)}),[i]),q=m.useMemo(()=>({advection:V(i.advectionMaterial),splat:V(i.splatMaterial),curl:V(i.curlMaterial),vorticity:V(i.vorticityMaterial),divergence:V(i.divergenceMaterial),clear:V(i.clearMaterial),pressure:V(i.pressureMaterial),gradientSubtract:V(i.gradientSubtractMaterial)}),[i]);return[m.useCallback((H,fe,se)=>{const{gl:G,pointer:oo,clock:Se,size:Ee}=H;fe&&P(fe),R.current===0&&(R.current=Se.getElapsedTime());const Be=Math.min((Se.getElapsedTime()-R.current)/3,.02);R.current=Se.getElapsedTime();const _e=d(G,({read:j})=>{v(i.advectionMaterial),D.advection("uVelocity",j),D.advection("uSource",j),D.advection("dt",Be),D.advection("dissipation",I.velocity_dissipation)}),ro=c(G,({read:j})=>{v(i.advectionMaterial),D.advection("uVelocity",_e),D.advection("uSource",j),D.advection("dissipation",I.density_dissipation)}),be=I.pointerValues||h(oo);be.isVelocityUpdate&&(d(G,({read:j})=>{v(i.splatMaterial),D.splat("uTarget",j),D.splat("point",be.currentPointer);const le=be.diffPointer.multiply(U.current.set(Ee.width,Ee.height).multiplyScalar(I.velocity_acceleration));D.splat("color",F.current.set(le.x,le.y,1)),D.splat("radius",I.splat_radius)}),c(G,({read:j})=>{v(i.splatMaterial),D.splat("uTarget",j);const le=typeof I.fluid_color=="function"?I.fluid_color(be.velocity):I.fluid_color;D.splat("color",le)}));const ao=_(G,()=>{v(i.curlMaterial),D.curl("uVelocity",_e)});d(G,({read:j})=>{v(i.vorticityMaterial),D.vorticity("uVelocity",j),D.vorticity("uCurl",ao),D.vorticity("curl",I.curl_strength),D.vorticity("dt",Be)});const io=b(G,()=>{v(i.divergenceMaterial),D.divergence("uVelocity",_e)});w(G,({read:j})=>{v(i.clearMaterial),D.clear("uTexture",j),D.clear("value",I.pressure_dissipation)}),v(i.pressureMaterial),D.pressure("uDivergence",io);let Le;for(let j=0;j<I.pressure_iterations;j++)Le=w(G,({read:le})=>{D.pressure("uPressure",le)});return d(G,({read:j})=>{v(i.gradientSubtractMaterial),D.gradientSubtract("uPressure",Le),D.gradientSubtract("uVelocity",j)}),se&&Object.keys(se).forEach(j=>{q[j](se[j])}),ro},[i,D,v,_,c,b,h,w,d,q,P,I]),P,{scene:s,mesh:g,materials:i,camera:x,renderTarget:{velocity:l,density:u,curl:M,divergence:y,pressure:C},output:u.read.texture}]};var pn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,fn=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const dn=({scale:e,max:n,texture:t,scene:o,uniforms:r,onBeforeCompile:f})=>{const s=m.useMemo(()=>new a.PlaneGeometry(e,e),[e]),i=m.useMemo(()=>new a.ShaderMaterial({uniforms:{uOpacity:{value:0},uMap:{value:t||T},...r},blending:a.AdditiveBlending,vertexShader:pn,fragmentShader:fn,...z,transparent:!0}),[t,r]),v=m.useMemo(()=>{const g=[];for(let x=0;x<n;x++){const h=i.clone();f&&(h.onBeforeCompile=f);const p=new a.Mesh(s.clone(),h);p.rotateZ(2*Math.PI*Math.random()),p.visible=!1,o.add(p),g.push(p)}return g},[f,s,i,o,n]);return m.useEffect(()=>()=>{v.forEach(g=>{g.geometry.dispose(),Array.isArray(g.material)?g.material.forEach(x=>x.dispose()):g.material.dispose(),o.remove(g)})},[o,v]),v},we=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),gn=({texture:e,scale:n=64,max:t=100,size:o,dpr:r,samples:f,isSizeUpdate:s,uniforms:i,onBeforeCompile:v})=>{const g=O(r),x=m.useMemo(()=>new a.Scene,[]),h=dn({scale:n,max:t,texture:e,scene:x,uniforms:i,onBeforeCompile:v}),p=W(o),l=de(),[d,u]=$({scene:x,camera:p,size:o,dpr:g.fbo,samples:f,isSizeUpdate:s}),[c,M]=k(we),_=m.useRef(0);return[m.useCallback((b,C,w)=>{const{gl:R,pointer:U,size:F}=b;C&&M(C);const I=c.pointerValues||l(U);if(c.frequency<I.diffPointer.length()){const P=h[_.current],D=P.material;P.visible=!0,P.position.set(I.currentPointer.x*(F.width/2),I.currentPointer.y*(F.height/2),0),P.scale.x=P.scale.y=0,A(D)("uOpacity",c.alpha),_.current=(_.current+1)%t}return h.forEach(P=>{if(P.visible){const D=P.material;P.rotation.z+=c.rotation,P.scale.x=c.fadeout_speed*P.scale.x+c.scale,P.scale.y=P.scale.x;const q=D.uniforms.uOpacity.value;A(D)("uOpacity",q*c.fadeout_speed),q<.001&&(P.visible=!1),V(D)(w)}}),u(R)},[u,h,l,t,c,M]),M,{scene:x,camera:p,meshArr:h,renderTarget:d,output:d.texture}]};var hn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,xn=`precision highp float;
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
}`;const bn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:J.scale},timeStrength:{value:J.timeStrength},noiseOctaves:{value:J.noiseOctaves},fbmOctaves:{value:J.fbmOctaves},warpOctaves:{value:J.warpOctaves},warpDirection:{value:J.warpDirection},warpStrength:{value:J.warpStrength},...n},vertexShader:hn,fragmentShader:xn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},J=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new a.Vector2(2,2),warpStrength:8,beat:!1}),Mn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=bn({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(J),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C,clock:w}=_;return y&&d(y),u("scale",l.scale),u("timeStrength",l.timeStrength),u("noiseOctaves",l.noiseOctaves),u("fbmOctaves",l.fbmOctaves),u("warpOctaves",l.warpOctaves),u("warpDirection",l.warpDirection),u("warpStrength",l.warpStrength),u("uTime",l.beat||w.getElapsedTime()),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var yn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Sn=`precision highp float;
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
}`;const _n=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},isTexture:{value:!1},scale:{value:K.scale},noise:{value:T},noiseStrength:{value:K.noiseStrength},isNoise:{value:!1},laminateLayer:{value:K.laminateLayer},laminateInterval:{value:K.laminateInterval},laminateDetail:{value:K.laminateDetail},distortion:{value:K.distortion},colorFactor:{value:K.colorFactor},uTime:{value:0},timeStrength:{value:K.timeStrength},...n},vertexShader:yn,fragmentShader:Sn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},K=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new a.Vector2(.1,.1),laminateDetail:new a.Vector2(1,1),distortion:new a.Vector2(0,0),colorFactor:new a.Vector3(1,1,1),timeStrength:new a.Vector2(0,0),noise:!1,noiseStrength:new a.Vector2(0,0),beat:!1}),Cn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=_n({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(K),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C,clock:w}=_;return y&&d(y),l.texture?(u("uTexture",l.texture),u("isTexture",!0)):(u("isTexture",!1),u("scale",l.scale)),l.noise?(u("noise",l.noise),u("isNoise",!0),u("noiseStrength",l.noiseStrength)):u("isNoise",!1),u("uTime",l.beat||w.getElapsedTime()),u("laminateLayer",l.laminateLayer),u("laminateInterval",l.laminateInterval),u("laminateDetail",l.laminateDetail),u("distortion",l.distortion),u("colorFactor",l.colorFactor),u("timeStrength",l.timeStrength),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Tn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,wn=`precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform float u_pattern;
uniform float u_complexity;
uniform float u_complexityAttenuation;
uniform float u_iterations;
uniform float u_timeStrength;
uniform float u_scale;

vec3 marble(vec3 p){
	vec4 n;
	for(float i;i<u_iterations;i++){
		p+=sin(p.yzx + u_pattern);
		n=u_complexity*n+vec4(cross(cos(p + u_pattern),sin(p.zxy + u_pattern)),1.)*(1.+i*u_complexityAttenuation);
		p*=u_complexity;
	}
	return n.xyz/n.w;
}

void main() {
	float time = u_time * u_timeStrength;
	vec3 color = clamp(marble(vec3(gl_FragCoord.xy*u_scale,time)),0.,1.);
	gl_FragColor = vec4(color,1.);
}`;const Dn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:te.pattern},u_complexity:{value:te.complexity},u_complexityAttenuation:{value:te.complexityAttenuation},u_iterations:{value:te.iterations},u_timeStrength:{value:te.timeStrength},u_scale:{value:te.scale},...n},vertexShader:Tn,fragmentShader:wn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},te=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Rn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Dn({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(te),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C,clock:w}=_;return y&&d(y),u("u_pattern",l.pattern),u("u_complexity",l.complexity),u("u_complexityAttenuation",l.complexityAttenuation),u("u_iterations",l.iterations),u("u_timeStrength",l.timeStrength),u("u_scale",l.scale),u("u_time",l.beat||w.getElapsedTime()),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var An=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Pn=`precision highp float;
precision highp int;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uRgbWeight;

vec3 cosPalette(  float t,  vec3 color1,  vec3 color2,  vec3 color3, vec3 color4 ){
    return color1 + color2 * cos( 6.28318 * ( color3 * t + color4) );
}

void main() {

	vec4 tex = texture2D(uTexture, vUv);
	float gray = dot(tex.rgb, uRgbWeight);		

	vec3 outColor = cosPalette(
		gray,
		uColor1,
		uColor2,
		uColor3,
		uColor4
	);

	gl_FragColor = vec4(outColor, tex.a);
}`;const In=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uRgbWeight:{value:ae.rgbWeight},uColor1:{value:ae.color1},uColor2:{value:ae.color2},uColor3:{value:ae.color3},uColor4:{value:ae.color4},...n},vertexShader:An,fragmentShader:Pn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},ae=Object.freeze({texture:T,color1:new a.Color().set(.5,.5,.5),color2:new a.Color().set(.5,.5,.5),color3:new a.Color().set(1,1,1),color4:new a.Color().set(0,.1,.2),rgbWeight:new a.Vector3(.299,.587,.114)}),Fn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=In({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(ae),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("uTexture",l.texture),u("uColor1",l.color1),u("uColor2",l.color2),u("uColor3",l.color3),u("uColor4",l.color4),u("uRgbWeight",l.rgbWeight),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,zn=`precision highp float;

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
}`;const Un=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uColor0:{value:he.color0},uColor1:{value:he.color1},...n},vertexShader:Vn,fragmentShader:zn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},he=Object.freeze({texture:T,color0:new a.Color(16777215),color1:new a.Color(0)}),On=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Un({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(he),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("uTexture",l.texture),u("uColor0",l.color0),u("uColor1",l.color1),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var En=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Bn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D u_map;
uniform bool u_isAlphaMap;
uniform sampler2D u_alphaMap;
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

	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	
	float brightness = dot(mapColor,u_brightness);
	vec4 textureMap = texture2D(u_texture, uv);
	float blendValue = smoothstep(u_min, u_max, brightness);

	
	vec3 dodgeColor = u_isDodgeColor ? u_dodgeColor : mapColor;
	vec3 outputColor = blendValue * dodgeColor + (1.0 - blendValue) * textureMap.rgb;
	
	
	float alpha = u_isAlphaMap ? texture2D(u_alphaMap, uv).a : textureMap.a;
	float mixValue = u_isAlphaMap ? alpha : 0.0;
	vec3 alphColor = mix(outputColor,mapColor,mixValue);

	gl_FragColor = vec4(alphColor, alpha);
}`;const Ln=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_alphaMap:{value:T},u_isAlphaMap:{value:!1},u_mapIntensity:{value:ie.mapIntensity},u_brightness:{value:ie.brightness},u_min:{value:ie.min},u_max:{value:ie.max},u_dodgeColor:{value:ie.dodgeColor},u_isDodgeColor:{value:!1},...n},vertexShader:En,fragmentShader:Bn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},ie=Object.freeze({texture:T,map:T,alphaMap:!1,mapIntensity:.3,brightness:new a.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Wn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Ln({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(ie),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("u_texture",l.texture),u("u_map",l.map),u("u_mapIntensity",l.mapIntensity),l.alphaMap?(u("u_alphaMap",l.alphaMap),u("u_isAlphaMap",!0)):u("u_isAlphaMap",!1),u("u_brightness",l.brightness),u("u_min",l.min),u("u_max",l.max),l.dodgeColor?(u("u_dodgeColor",l.dodgeColor),u("u_isDodgeColor",!0)):u("u_isDodgeColor",!1),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var kn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,$n=`precision highp float;

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
	float screenAspect = uResolution.x / uResolution.y;
	float textureAspect = uTextureResolution.x / uTextureResolution.y;
	vec2 aspectRatio = vec2(
		min(screenAspect / textureAspect, 1.0),
		min(textureAspect / screenAspect, 1.0)
	);
	vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;

	
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

}`;const jn=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:r})=>{const f=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),s=m.useMemo(()=>{var x,h;const g=new a.ShaderMaterial({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture0:{value:T},uTexture1:{value:T},padding:{value:ee.padding},uMap:{value:T},edgeIntensity:{value:ee.edgeIntensity},mapIntensity:{value:ee.mapIntensity},epicenter:{value:ee.epicenter},progress:{value:ee.progress},dirX:{value:(x=ee.dir)==null?void 0:x.x},dirY:{value:(h=ee.dir)==null?void 0:h.y},...o},vertexShader:kn,fragmentShader:$n,...z});return r&&(g.onBeforeCompile=r),g},[r,o]),i=N(n,t);A(s)("uResolution",i.clone());const v=L(e,f,s,a.Mesh);return{material:s,mesh:v}},ee=Object.freeze({texture0:T,texture1:T,padding:0,map:T,mapIntensity:0,edgeIntensity:0,epicenter:new a.Vector2(0,0),progress:0,dir:new a.Vector2(0,0)}),qn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=jn({scene:i,size:e,dpr:s.shader,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,dpr:s.fbo,size:e,samples:t,isSizeUpdate:o}),[l,d]=k(ee),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{var F,I,P,D,q,oe,H,fe;const{gl:C}=_;y&&d(y),u("uTexture0",l.texture0),u("uTexture1",l.texture1),u("progress",l.progress);const w=[((I=(F=l.texture0)==null?void 0:F.image)==null?void 0:I.width)||0,((D=(P=l.texture0)==null?void 0:P.image)==null?void 0:D.height)||0],R=[((oe=(q=l.texture1)==null?void 0:q.image)==null?void 0:oe.width)||0,((fe=(H=l.texture1)==null?void 0:H.image)==null?void 0:fe.height)||0],U=w.map((se,G)=>se+(R[G]-se)*l.progress);return u("uTextureResolution",U),u("padding",l.padding),u("uMap",l.map),u("mapIntensity",l.mapIntensity),u("edgeIntensity",l.edgeIntensity),u("epicenter",l.epicenter),u("dirX",l.dir.x),u("dirY",l.dir.y),c(b),p(C)},[p,u,l,d,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Nn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Gn=`precision highp float;

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
}`;const Kn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:ve.brightness},u_min:{value:ve.min},u_max:{value:ve.max},...n},vertexShader:Nn,fragmentShader:Gn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},ve=Object.freeze({texture:T,brightness:new a.Vector3(.5,.5,.5),min:0,max:1}),Xn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Kn({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(ve),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("u_texture",l.texture),u("u_brightness",l.brightness),u("u_min",l.min),u("u_max",l.max),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Hn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Yn=`precision highp float;

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
}`;const Qn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_mapIntensity:{value:Me.mapIntensity},...n},vertexShader:Hn,fragmentShader:Yn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},Me=Object.freeze({texture:T,map:T,mapIntensity:.3}),Zn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Qn({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(Me),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("u_texture",l.texture),u("u_map",l.map),u("u_mapIntensity",l.mapIntensity),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Jn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,et=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const nt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uMap:{value:T},...n},vertexShader:Jn,fragmentShader:et,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},De=Object.freeze({texture:T,map:T}),tt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=nt({scene:i,size:e,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(De),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("uTexture",l.texture),u("uMap",l.map),c(b),p(C)},[u,p,l,d,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var ot=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,rt=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_saturation;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	vec4 tex = texture2D(u_texture, vUv);
	vec3 hsv = rgb2hsv(tex.rgb);
	hsv.y *= u_saturation;
	hsv.z *= u_brightness;
	vec3 final = hsv2rgb(hsv);
	gl_FragColor = vec4(final, tex.a);
}`;const at=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:xe.brightness},u_saturation:{value:xe.saturation},...n},vertexShader:ot,fragmentShader:rt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},xe=Object.freeze({texture:T,brightness:1,saturation:1}),it=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=at({scene:i,size:e,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(xe),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("u_texture",l.texture),u("u_brightness",l.brightness),u("u_saturation",l.saturation),c(b),p(C)},[u,p,l,d,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var ut=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,st=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	float screenAspect = uResolution.x / uResolution.y;
	float textureAspect = uTextureResolution.x / uTextureResolution.y;
	vec2 aspectRatio = vec2(
		min(screenAspect / textureAspect, 1.0),
		min(textureAspect / screenAspect, 1.0)
	);
	vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;
	
	gl_FragColor = texture2D(uTexture, uv);

}`;const lt=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:r})=>{const f=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),s=m.useMemo(()=>{const g=new a.ShaderMaterial({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture:{value:T},...o},vertexShader:ut,fragmentShader:st,...z});return r&&(g.onBeforeCompile=r),g},[r,o]),i=N(n,t);A(s)("uResolution",i.clone());const v=L(e,f,s,a.Mesh);return{material:s,mesh:v}},Re=Object.freeze({texture:T}),ct=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=lt({scene:i,size:e,dpr:s.shader,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,dpr:s.fbo,size:e,samples:t,isSizeUpdate:o}),[l,d]=k(Re),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{var w,R,U,F,I,P;const{gl:C}=_;return y&&d(y),u("uTexture",l.texture),u("uTextureResolution",[((U=(R=(w=l.texture)==null?void 0:w.source)==null?void 0:R.data)==null?void 0:U.width)||0,((P=(I=(F=l.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.height)||0]),c(b),p(C)},[p,u,l,d,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var vt=`precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,mt=`precision highp float;

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
}`;const pt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uResolution:{value:new a.Vector2(0,0)},uBlurSize:{value:ye.blurSize},...n},vertexShader:vt,fragmentShader:mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},ye=Object.freeze({texture:T,blurSize:3,blurPower:5}),ft=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=pt({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),h=m.useMemo(()=>({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[i,x,e,s.fbo,t,o]),[p,l]=ne(h),[d,u]=k(ye),c=A(v),M=V(v);return[m.useCallback((y,b,C)=>{var F,I,P,D,q,oe;const{gl:w}=y;b&&u(b),c("uTexture",d.texture),c("uResolution",[((P=(I=(F=d.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.width)||0,((oe=(q=(D=d.texture)==null?void 0:D.source)==null?void 0:q.data)==null?void 0:oe.height)||0]),c("uBlurSize",d.blurSize);let R=l(w);const U=d.blurPower;for(let H=0;H<U;H++)c("uTexture",R),R=l(w);return M(C),R},[l,c,u,d,M]),u,{scene:i,mesh:g,material:v,camera:x,renderTarget:p,output:p.read.texture}]};var dt=`precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,gt=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform vec2 uBegin;
uniform vec2 uEnd;
uniform float uStrength;

void main() {
	vec2 uv = vUv;	
	vec4 current = texture2D(uTexture, uv + uBegin*.1);
	vec4 back = texture2D(uBackbuffer, uv + uEnd*.1);
	vec4 mixed = mix(current,back,uStrength);
	gl_FragColor = mixed;
}`;const ht=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uBegin:{value:me.begin},uEnd:{value:me.end},uStrength:{value:me.strength},...n},vertexShader:dt,fragmentShader:gt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},me=Object.freeze({texture:T,begin:new a.Vector2(0,0),end:new a.Vector2(0,0),strength:.9}),xt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=ht({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),h=m.useMemo(()=>({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[i,x,e,s.fbo,t,o]),[p,l]=ne(h),[d,u]=k(me),c=A(v),M=V(v);return[m.useCallback((y,b,C)=>{const{gl:w}=y;return b&&u(b),c("uTexture",d.texture),c("uBegin",d.begin),c("uEnd",d.end),c("uStrength",d.strength),M(C),l(w,({read:R})=>{c("uBackbuffer",R)})},[l,c,u,d,M]),u,{scene:i,mesh:g,material:v,camera:x,renderTarget:p,output:p.read.texture}]};var bt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Mt=`precision highp float;

varying vec2 vUv;
uniform float uProgress;
uniform float uStrength;
uniform float uWidth;
uniform vec2 uEpicenter;
uniform int uMode;

float PI = 3.141592653589;

void main() {

	vec2 uv = vUv;

	float progress = min(uProgress, 1.0);
	float progressFactor = sin(progress * PI);

	float border = progress - progress * progressFactor * uWidth;
	float blur = uStrength * progressFactor;
	
	
	vec2 normalizeCenter = (uEpicenter + 1.0) / 2.0;

	
	float dist = uMode == 0 ? length(uv - normalizeCenter) : uMode == 1 ? length(uv.x - normalizeCenter.x) : length(uv.y - normalizeCenter.y);

	
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
}`;const yt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=m.useMemo(()=>{const s=new a.ShaderMaterial({uniforms:{uEpicenter:{value:ue.epicenter},uProgress:{value:ue.progress},uStrength:{value:ue.strength},uWidth:{value:ue.width},uMode:{value:0},...n},vertexShader:bt,fragmentShader:Mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),f=L(e,o,r,a.Mesh);return{material:r,mesh:f}},ue=Object.freeze({epicenter:new a.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),St=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=yt({scene:i,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(ue),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("uEpicenter",l.epicenter),u("uProgress",l.progress),u("uWidth",l.width),u("uStrength",l.strength),u("uMode",l.mode==="center"?0:l.mode==="horizontal"?1:2),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var _t=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ct=`precision highp float;
varying vec2 vUv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec3 u_keyColor;
uniform float u_similarity;
uniform float u_smoothness;
uniform float u_spill;

uniform vec4 u_color;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_gamma;

vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}
float getChromeDist(vec3 texColor){
	float chromaDist = distance(RGBtoUV(texColor), RGBtoUV(u_keyColor));
	return chromaDist;
}

float getBoxFilteredChromaDist(vec3 rgb, vec2 uv)
{
	vec2 pixel_size = vec2(1.) / u_resolution;
	vec2 h_pixel_size = pixel_size / 2.0;
	vec2 point_0 = vec2(pixel_size.x, h_pixel_size.y);
	vec2 point_1 = vec2(h_pixel_size.x, -pixel_size.y);
	float distVal = getChromeDist(texture2D(u_texture,uv-point_0).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv+point_0).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv-point_1).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv+point_1).rgb);
	distVal *= 2.0;
	distVal += getChromeDist(rgb);
	return distVal / 9.0;
}

vec4 CalcColor(vec4 rgba)
{
	return vec4(pow(rgba.rgb, vec3(u_gamma, u_gamma, u_gamma)) * u_contrast + u_brightness, rgba.a);
}

void main() {

	vec2 uv = vUv;

	vec4 texColor = texture2D(u_texture, uv);
	texColor.rgb *= (texColor.a > 0.) ? (1. / texColor.a) : 0.;

	float chromaDist = getBoxFilteredChromaDist(texColor.rgb,uv);
	
	float baseMask = chromaDist - u_similarity;
	float fullMask = pow(clamp(baseMask / u_smoothness, 0., 1.), 1.5);
	
	texColor.rgba *= u_color;
	texColor.a = fullMask;

	float spillVal = pow(clamp(baseMask / u_spill, 0., 1.), 1.5);
	float desat = clamp(texColor.r * 0.2126 + texColor.g * 0.7152 + texColor.b * 0.0722, 0., 1.);
	texColor.rgb = mix(vec3(desat, desat, desat), texColor.rgb, spillVal);

	vec4 finColor = CalcColor(texColor);

	gl_FragColor = finColor;
}`;const Tt=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:r})=>{const f=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),s=m.useMemo(()=>{const g=new a.ShaderMaterial({uniforms:{u_texture:{value:T},u_resolution:{value:new a.Vector2},u_keyColor:{value:X.color},u_similarity:{value:X.similarity},u_smoothness:{value:X.smoothness},u_spill:{value:X.spill},u_color:{value:X.color},u_contrast:{value:X.contrast},u_brightness:{value:X.brightness},u_gamma:{value:X.gamma},...o},vertexShader:_t,fragmentShader:Ct,...z});return r&&(g.onBeforeCompile=r),g},[r,o]),i=N(n,t);A(s)("u_resolution",i.clone());const v=L(e,f,s,a.Mesh);return{material:s,mesh:v}},X=Object.freeze({texture:T,keyColor:new a.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new a.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),wt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=Tt({scene:i,size:e,dpr:s.shader,uniforms:r,onBeforeCompile:f}),x=W(e),[h,p]=$({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[l,d]=k(X),u=A(v),c=V(v);return[m.useCallback((_,y,b)=>{const{gl:C}=_;return y&&d(y),u("u_texture",l.texture),u("u_keyColor",l.keyColor),u("u_similarity",l.similarity),u("u_smoothness",l.smoothness),u("u_spill",l.spill),u("u_color",l.color),u("u_contrast",l.contrast),u("u_brightness",l.brightness),u("u_gamma",l.gamma),c(b),p(C)},[p,u,d,l,c]),d,{scene:i,mesh:g,material:v,camera:x,renderTarget:h,output:h.texture}]};var Dt=`precision highp float;

varying vec2 vUv;

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	
	
	gl_Position = usf_Position;
}`,Rt=`precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

void main() {
	vec4 usf_FragColor = vec4(1.);

	
	
	gl_FragColor = usf_FragColor;
}`;const At=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:r})=>{const f=m.useMemo(()=>new a.PlaneGeometry(2,2),[]),s=m.useMemo(()=>{const g=new a.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uTime:{value:0},uPointer:{value:new a.Vector2},uResolution:{value:new a.Vector2},...o},vertexShader:Dt,fragmentShader:Rt,...z});return r&&(g.onBeforeCompile=r),g},[r,o]),i=N(n,t);A(s)("uResolution",i.clone());const v=L(e,f,s,a.Mesh);return{material:s,mesh:v}},Ae=Object.freeze({texture:T,beat:!1}),Pt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f})=>{const s=O(n),i=m.useMemo(()=>new a.Scene,[]),{material:v,mesh:g}=At({scene:i,size:e,dpr:s.shader,uniforms:r,onBeforeCompile:f}),x=W(e),h=m.useMemo(()=>({scene:i,camera:x,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[i,x,e,s.fbo,t,o]),[p,l]=ne(h),[d,u]=k(Ae),c=A(v),M=V(v);return[m.useCallback((y,b,C)=>{const{gl:w,clock:R,pointer:U}=y;return b&&u(b),c("uTexture",d.texture),c("uPointer",U),c("uTime",d.beat||R.getElapsedTime()),M(C),l(w,({read:F})=>{c("uBackbuffer",F)})},[l,c,u,d,M]),u,{scene:i,mesh:g,material:v,camera:x,renderTarget:p,output:p.read.texture}]},It=({scene:e,geometry:n,material:t})=>{const o=L(e,n,t,a.Points),r=L(e,m.useMemo(()=>n.clone(),[n]),m.useMemo(()=>t.clone(),[t]),a.Mesh);return r.visible=!1,{points:o,interactiveMesh:r}};var Ft=`uniform vec2 uResolution;
uniform float uMorphProgress;
uniform float uPointSize;

uniform sampler2D uPicture;
uniform bool uIsPicture;
uniform sampler2D uAlphaPicture;
uniform bool uIsAlphaPicture;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

uniform float uTime;

uniform float uWobblePositionFrequency;
uniform float uWobbleTimeFrequency;
uniform float uWobbleStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

uniform sampler2D uDisplacement;
uniform bool uIsDisplacement;
uniform float uDisplacementIntensity;

uniform float uSizeRandomIntensity;
uniform float uSizeRandomTimeFrequency;
uniform float uSizeRandomMin;
uniform float uSizeRandomMax;

uniform float uMapArrayLength;

uniform float uDivergence;
uniform vec3 uDivergencePoint;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;
varying float vMapArrayIndex;

#usf <morphPositions>

#usf <morphUvs>

#usf <getWobble>

float random3D(vec3 co) {
    return fract(sin(dot(co.xyz ,vec3(12.9898, 78.233, 45.764))) * 43758.5453);
}

void main() {
	vec3 newPosition = position;
	vec2 newUv = uv;
	#usf <morphPositionTransition>
	#usf <morphUvTransition>

	
	vec3 displacement = uIsDisplacement ? texture2D(uDisplacement, newUv).rgb : vec3(0.0);
	float displacementIntensity = smoothstep(0., 1., displacement.g);
	vDisplacementColor = displacement;
	vDisplacementIntensity = displacementIntensity;

	
	displacement = displacement * 2.-1.;
	displacement *= displacementIntensity * uDisplacementIntensity;
	newPosition += displacement;

	
	vec3 divergenceDir = newPosition - uDivergencePoint;
	if (uDivergence > 0.0) {
		newPosition += normalize(divergenceDir) * uDivergence;
	} else if (uDivergence < 0.0) {
		newPosition -= normalize(divergenceDir) * abs(uDivergence);
	}

	
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	
	float wobble = uWobbleStrength > 0. ? getWobble(projectedPosition.xyz) : 0.0;

	gl_Position = projectedPosition += wobble;
	
	
	vColor = uIsPicture ? texture2D(uPicture, newUv).rgb : mix(mix(uColor0, uColor1, newPosition.x), mix(uColor2, uColor3, newPosition.y), newPosition.z);

	
	vPictureAlpha = uIsAlphaPicture ? texture2D(uAlphaPicture, newUv).g : 1.;

	
	
	float sizeRand = uSizeRandomIntensity > 0. ? mix(uSizeRandomMin,uSizeRandomMax,(simplexNoise4d(vec4(newPosition,uTime * uSizeRandomTimeFrequency))*.5+.5)) * uSizeRandomIntensity : 1.;
	gl_PointSize = uPointSize * vPictureAlpha * uResolution.y * sizeRand;
	gl_PointSize *= (1.0 / - viewPosition.z);

	
	vMapArrayIndex = uMapArrayLength > 0. ? floor(random3D(position) * uMapArrayLength) : 0.;
}`,Vt=`precision highp float;
precision highp int;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;
varying float vMapArrayIndex;

uniform float uBlurAlpha;
uniform float uBlurRadius;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform sampler2D uAlphaMap;
uniform bool uIsAlphaMap;
uniform float uDisplacementColorIntensity;
uniform float uPointAlpha;

#usf <mapArrayUniforms>

void main() {    
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
   
	
	float distanceToCenter = length(uv - .5);
	float alpha = clamp(uBlurRadius / distanceToCenter - (1.-uBlurAlpha) , 0. , 1.);

	
	vec4 mapArrayColor;
	#usf <mapArraySwitcher>
	vec4 mapColor = isMapArray ? mapArrayColor : uIsMap ? texture2D(uMap,uv) : vec4(1.);
	vec3 finalColor = isMapArray || uIsMap ? mapColor.rgb : vColor;

	
	float mixIntensity = clamp(uDisplacementColorIntensity * vDisplacementIntensity,0.,1.);
	finalColor = vDisplacementIntensity > 0. ? mix(finalColor,vDisplacementColor,mixIntensity) : finalColor;

	
	float alphaMap = uIsAlphaMap ? texture2D(uAlphaMap,uv).g : 1.;

	gl_FragColor = vec4(finalColor,alpha * vPictureAlpha * alphaMap * mapColor.a * uPointAlpha);
}`,Pe=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip)
{
	const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
	vec4 p,s;

	p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
	p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
	s = vec4(lessThan(p, vec4(0.0)));
	p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

	return p;
}

float simplexNoise4d(vec4 v)
{
	const vec2  C = vec2( 0.138196601125010504,  
									0.309016994374947451); 
	
	vec4 i  = floor(v + dot(v, C.yyyy) );
	vec4 x0 = v -   i + dot(i, C.xxxx);

	

	
	vec4 i0;

	vec3 isX = step( x0.yzw, x0.xxx );
	vec3 isYZ = step( x0.zww, x0.yyz );
	
	i0.x = isX.x + isX.y + isX.z;
	i0.yzw = 1.0 - isX;

	
	i0.y += isYZ.x + isYZ.y;
	i0.zw += 1.0 - isYZ.xy;

	i0.z += isYZ.z;
	i0.w += 1.0 - isYZ.z;

	
	vec4 i3 = clamp( i0, 0.0, 1.0 );
	vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
	vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

	
	vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
	vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
	vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
	vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

	
	i = mod(i, 289.0); 
	float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
	vec4 j1 = permute( permute( permute( permute (
					i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
				+ i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
				+ i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
				+ i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
	
	
	

	vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

	vec4 p0 = grad4(j0,   ip);
	vec4 p1 = grad4(j1.x, ip);
	vec4 p2 = grad4(j1.y, ip);
	vec4 p3 = grad4(j1.z, ip);
	vec4 p4 = grad4(j1.w, ip);

	
	vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	p4 *= taylorInvSqrt(dot(p4,p4));

	
	vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
	vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
	m0 = m0 * m0;
	m1 = m1 * m1;
	return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
						+ dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

float getWobble(vec3 position)
{
	vec3 warpedPosition = position;
	warpedPosition += simplexNoise4d(
		vec4(
				position * uWarpPositionFrequency,
				uTime * uWarpTimeFrequency
		)
	) * uWarpStrength;

	return simplexNoise4d(vec4(
		warpedPosition * uWobblePositionFrequency, 
		uTime * uWobbleTimeFrequency          
	)) * uWobbleStrength;
}`;const Ie=(e,n,t,o,r)=>{var x;const f=t==="position"?"positionTarget":"uvTarget",s=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",i=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",v=t==="position"?"positionsList":"uvsList",g=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new a.BufferAttribute(e[0],r));let h="",p="";e.forEach((l,d)=>{n.setAttribute(`${f}${d}`,new a.BufferAttribute(l,r)),h+=`attribute vec${r} ${f}${d};
`,d===0?p+=`${f}${d}`:p+=`,${f}${d}`}),o=o.replace(`${s}`,h),o=o.replace(`${i}`,`vec${r} ${v}[${e.length}] = vec${r}[](${p});
				${g}
			`)}else o=o.replace(`${s}`,""),o=o.replace(`${i}`,""),(x=n==null?void 0:n.attributes[t])!=null&&x.array||Ce&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return o},Fe=(e,n,t,o)=>{var f;let r=[];if(e&&e.length>0){(f=n==null?void 0:n.attributes[t])!=null&&f.array?r=[n.attributes[t].array,...e]:r=e;const s=Math.max(...r.map(i=>i.length));r.forEach((i,v)=>{if(i.length<s){const g=(s-i.length)/o,x=[],h=Array.from(i);for(let p=0;p<g;p++){const l=Math.floor(i.length/o*Math.random())*o;for(let d=0;d<o;d++)x.push(h[l+d])}r[v]=new Float32Array([...h,...x])}})}return r},zt=(e,n)=>{let t="";const o={};let r="mapArrayColor = ";return e&&e.length>0?(e.forEach((s,i)=>{const v=`vMapArrayIndex < ${i}.1`,g=`texture2D(uMapArray${i}, uv)`;r+=`( ${v} ) ? ${g} : `,t+=`
        uniform sampler2D uMapArray${i};
      `,o[`uMapArray${i}`]={value:s}}),r+="vec4(1.);",t+="bool isMapArray = true;",o.uMapArrayLength={value:e.length}):(r+="vec4(1.0);",t+="bool isMapArray = false;",o.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",r).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:o}},Ut=({size:e,dpr:n,geometry:t,positions:o,uvs:r,mapArray:f,uniforms:s,onBeforeCompile:i})=>{const v=m.useMemo(()=>Fe(o,t,"position",3),[o,t]),g=m.useMemo(()=>Fe(r,t,"uv",2),[r,t]),x=m.useMemo(()=>{v.length!==g.length&&Ce&&console.log("use-shader-fx:positions and uvs are not matched");const p=Ie(g,t,"uv",Ie(v,t,"position",Ft,3),2).replace("#usf <getWobble>",Pe),{rewritedFragmentShader:l,mapArrayUniforms:d}=zt(f,Vt),u=new a.ShaderMaterial({vertexShader:p,fragmentShader:l,blending:a.AdditiveBlending,...z,transparent:!0,uniforms:{uResolution:{value:new a.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:T},uIsPicture:{value:!1},uAlphaPicture:{value:T},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:T},uIsMap:{value:!1},uAlphaMap:{value:T},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:T},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...d,...s}});return i&&(u.onBeforeCompile=i),u},[t,v,g,f,i,s]),h=N(e,n);return A(x)("uResolution",h.clone()),{material:x,modifiedPositions:v,modifiedUvs:g}},Ve=({size:e,dpr:n,scene:t=!1,geometry:o,positions:r,uvs:f,mapArray:s,uniforms:i,onBeforeCompile:v})=>{const g=O(n),x=m.useMemo(()=>{const y=o||new a.SphereGeometry(1,32,32);return y.setIndex(null),y.deleteAttribute("normal"),y},[o]),{material:h,modifiedPositions:p,modifiedUvs:l}=Ut({size:e,dpr:g.shader,geometry:x,positions:r,uvs:f,mapArray:s,uniforms:i,onBeforeCompile:v}),{points:d,interactiveMesh:u}=It({scene:t,geometry:x,material:h}),c=A(h),M=V(h);return[m.useCallback((y,b,C)=>{y&&c("uTime",(b==null?void 0:b.beat)||y.clock.getElapsedTime()),b!==void 0&&(c("uMorphProgress",b.morphProgress),c("uBlurAlpha",b.blurAlpha),c("uBlurRadius",b.blurRadius),c("uPointSize",b.pointSize),c("uPointAlpha",b.pointAlpha),b.picture?(c("uPicture",b.picture),c("uIsPicture",!0)):b.picture===!1&&c("uIsPicture",!1),b.alphaPicture?(c("uAlphaPicture",b.alphaPicture),c("uIsAlphaPicture",!0)):b.alphaPicture===!1&&c("uIsAlphaPicture",!1),c("uColor0",b.color0),c("uColor1",b.color1),c("uColor2",b.color2),c("uColor3",b.color3),b.map?(c("uMap",b.map),c("uIsMap",!0)):b.map===!1&&c("uIsMap",!1),b.alphaMap?(c("uAlphaMap",b.alphaMap),c("uIsAlphaMap",!0)):b.alphaMap===!1&&c("uIsAlphaMap",!1),c("uWobbleStrength",b.wobbleStrength),c("uWobblePositionFrequency",b.wobblePositionFrequency),c("uWobbleTimeFrequency",b.wobbleTimeFrequency),c("uWarpStrength",b.warpStrength),c("uWarpPositionFrequency",b.warpPositionFrequency),c("uWarpTimeFrequency",b.warpTimeFrequency),b.displacement?(c("uDisplacement",b.displacement),c("uIsDisplacement",!0)):b.displacement===!1&&c("uIsDisplacement",!1),c("uDisplacementIntensity",b.displacementIntensity),c("uDisplacementColorIntensity",b.displacementColorIntensity),c("uSizeRandomIntensity",b.sizeRandomIntensity),c("uSizeRandomTimeFrequency",b.sizeRandomTimeFrequency),c("uSizeRandomMin",b.sizeRandomMin),c("uSizeRandomMax",b.sizeRandomMax),c("uDivergence",b.divergence),c("uDivergencePoint",b.divergencePoint),M(C))},[c,M]),{points:d,interactiveMesh:u,positions:p,uvs:l}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new a.Vector3(0),beat:!1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:o,camera:r,geometry:f,positions:s,uvs:i,uniforms:v,onBeforeCompile:g})=>{const x=O(n),h=m.useMemo(()=>new a.Scene,[]),[p,{points:l,interactiveMesh:d,positions:u,uvs:c}]=Ve({scene:h,size:e,dpr:n,geometry:f,positions:s,uvs:i,uniforms:v,onBeforeCompile:g}),[M,_]=$({scene:h,camera:r,size:e,dpr:x.fbo,samples:t,isSizeUpdate:o,depthBuffer:!0}),y=m.useCallback((C,w,R)=>(p(C,w,R),_(C.gl)),[_,p]),b=m.useCallback((C,w)=>{p(null,C,w)},[p]);return[y,b,{scene:h,points:l,interactiveMesh:d,renderTarget:M,output:M.texture,positions:u,uvs:c}]};function Et(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},o=e.getIndex(),r=e.getAttribute("position"),f=o?o.count:r.count;let s=0;const i=Object.keys(e.attributes),v={},g={},x=[],h=["getX","getY","getZ","getW"];for(let u=0,c=i.length;u<c;u++){const M=i[u];v[M]=[];const _=e.morphAttributes[M];_&&(g[M]=new Array(_.length).fill(0).map(()=>[]))}const p=Math.log10(1/n),l=Math.pow(10,p);for(let u=0;u<f;u++){const c=o?o.getX(u):u;let M="";for(let _=0,y=i.length;_<y;_++){const b=i[_],C=e.getAttribute(b),w=C.itemSize;for(let R=0;R<w;R++)M+=`${~~(C[h[R]](c)*l)},`}if(M in t)x.push(t[M]);else{for(let _=0,y=i.length;_<y;_++){const b=i[_],C=e.getAttribute(b),w=e.morphAttributes[b],R=C.itemSize,U=v[b],F=g[b];for(let I=0;I<R;I++){const P=h[I];if(U.push(C[P](c)),w)for(let D=0,q=w.length;D<q;D++)F[D].push(w[D][P](c))}}t[M]=s,x.push(s),s++}}const d=e.clone();for(let u=0,c=i.length;u<c;u++){const M=i[u],_=e.getAttribute(M),y=new _.array.constructor(v[M]),b=new re.BufferAttribute(y,_.itemSize,_.normalized);if(d.setAttribute(M,b),M in g)for(let C=0;C<g[M].length;C++){const w=e.morphAttributes[M][C],R=new w.array.constructor(g[M][C]),U=new re.BufferAttribute(R,w.itemSize,w.normalized);d.morphAttributes[M][C]=U}}return d.setIndex(x),d}var Bt=`vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {

	vec3 s = floor(p + dot(p, vec3(F3)));
	vec3 x = p - s + dot(s, vec3(G3));
	
	vec3 e = step(vec3(0.0), x - x.yzx);
	vec3 i1 = e*(1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy*(1.0 - e);
 	
	vec3 x1 = x - i1 + G3;
	vec3 x2 = x - i2 + 2.0*G3;
	vec3 x3 = x - 1.0 + 3.0*G3;
	 
	vec4 w, d;
	 
	w.x = dot(x, x);
	w.y = dot(x1, x1);
	w.z = dot(x2, x2);
	w.w = dot(x3, x3);
	 
	w = max(0.6 - w, 0.0);
	 
	d.x = dot(random3(s), x);
	d.y = dot(random3(s + i1), x1);
	d.z = dot(random3(s + i2), x2);
	d.w = dot(random3(s + 1.0), x3);
	 
	w *= w;
	w *= w;
	d *= w;
	 
	return dot(d, vec4(52.0));
}

float snoiseFractal(vec3 m) {
	return   0.5333333* snoise(m)
				+0.2666667* snoise(2.0*m)
				+0.1333333* snoise(4.0*m)
				+0.0666667* snoise(8.0*m);
}`,Lt=`#ifdef USE_TRANSMISSION

	
	

	uniform float _transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;

	#ifdef USE_TRANSMISSIONMAP

		uniform sampler2D transmissionMap;

	#endif

	#ifdef USE_THICKNESSMAP

		uniform sampler2D thicknessMap;

	#endif

	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;

	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;

	varying vec3 vWorldPosition;

	
	

	float w0( float a ) {

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );

	}

	float w1( float a ) {

		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );

	}

	float w2( float a ){

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );

	}

	float w3( float a ) {

		return ( 1.0 / 6.0 ) * ( a * a * a );

	}

	
	float g0( float a ) {

		return w0( a ) + w1( a );

	}

	float g1( float a ) {

		return w2( a ) + w3( a );

	}

	
	float h0( float a ) {

		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );

	}

	float h1( float a ) {

		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );

	}

	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {

		uv = uv * texelSize.zw + 0.5;

		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );

		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );

		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );

	}

	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {

		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );

	}

	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {

		
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

		
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

		
		return normalize( refractionVector ) * thickness * modelScale;

	}

	float applyIorToRoughness( const in float roughness, const in float ior ) {

		
		
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );

	}

	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {

		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );

	}

	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {

		if ( isinf( attenuationDistance ) ) {

			
			return vec3( 1.0 );

		} else {

			
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); 
			return transmittance;

		}

	}

	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {

		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;

		
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;

		
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );

		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;

		
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );

		
		
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;

		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );

	}
#endif`,Wt=`#ifdef USE_TRANSMISSION

material.transmission = _transmission;
material.transmissionAlpha = 1.0;
material.thickness = thickness;
material.attenuationDistance = attenuationDistance;
material.attenuationColor = attenuationColor;

#ifdef USE_TRANSMISSIONMAP

	material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;

#endif

#ifdef USE_THICKNESSMAP

	material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;

#endif

vec3 pos = vWorldPosition;

vec3 v = normalize( cameraPosition - pos );
vec3 n = inverseTransformDirection( normal, viewMatrix );

vec4 transmitted = getIBLVolumeRefraction(
	n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
	pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
	material.attenuationColor, material.attenuationDistance );

material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );

float runningSeed = 0.0;
vec3 transmission = vec3(0.0);
float transmissionR, transmissionB, transmissionG;
float randomCoords = rand(runningSeed++);
float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), uAnisotropicBlur);
vec3 distortionNormal = vec3(0.0);
vec3 temporalOffset = vec3(uTime, -uTime, -uTime) * uTemporalDistortion;

if (uDistortion > 0.0) {
	distortionNormal = uDistortion * vec3(snoiseFractal(vec3((pos * uDistortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * uDistortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * uDistortionScale + temporalOffset)));
}

for (float i = 0.0; i < uSamples; i ++) {
	vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
	
	transmissionR = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).r;
	transmissionG = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + randomCoords) / uSamples) , material.thickness + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).g;
	transmissionB = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + randomCoords) / uSamples), material.thickness + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).b;
	transmission.r += transmissionR;
	transmission.g += transmissionG;
	transmission.b += transmissionB;
}

transmission /= uSamples;

totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );

#endif`;const ze=e=>{let n=e;return n=n.replace("#include <beginnormal_vertex>",`
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`),n=n.replace("#include <begin_vertex>",`
		vec3 transformed = usf_Position;`),n=n.replace("void main() {",`
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;
		uniform bool uIsWobbleMap;
		uniform sampler2D uWobbleMap;
		uniform float uWobbleMapStrength;
		uniform float uWobbleMapDistortion;
		attribute vec4 tangent;
		varying float vWobble;
		varying vec2 vPosition;
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;
		// #usf <getWobble>
		void main() {`),n=n.replace("// #usf <getWobble>",`${Pe}`),n=n.replace("void main() {",`
		void main() {
		vec3 usf_Position = position;
		vec3 usf_Normal = normal;
		vec3 biTangent = cross(normal, tangent.xyz);
		
		// Neighbours positions
		float shift = 0.01;
		vec3 positionA = usf_Position + tangent.xyz * shift;
		vec3 positionB = usf_Position + biTangent * shift;
		
		// wobbleMap & wobble
		float wobbleMap = uIsWobbleMap ? texture2D(uWobbleMap, uv).g : 0.0;
		vec3 nWobbleMap = wobbleMap * normal * uWobbleMapStrength;
		float wobbleMapDistortion = wobbleMap * uWobbleMapDistortion;

		float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
		float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
		float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
		
		usf_Position += nWobbleMap + (wobble * normal);
		positionA += nWobbleMap + wobbleMapDistortion + (wobblePositionA * normal);
		positionB += nWobbleMap + wobbleMapDistortion + (wobblePositionB * normal);

		// Compute normal
		vec3 toA = normalize(positionA - usf_Position);
		vec3 toB = normalize(positionB - usf_Position);
		usf_Normal = cross(toA, toB);
		
		// Varying
		vPosition = usf_Position.xy;
		vWobble = wobble/uWobbleStrength;
		
		vEdgeNormal = normalize(normalMatrix * usf_Normal);
		vec4 viewPosition = viewMatrix * modelMatrix * vec4(usf_Position, 1.0);
		vEdgeViewPosition = normalize(viewPosition.xyz);
		`),n},kt=({baseMaterial:e,materialParameters:n,onBeforeCompile:t,depthOnBeforeCompile:o,uniforms:r})=>{const{material:f,depthMaterial:s}=m.useMemo(()=>{const i=new(e||a.MeshPhysicalMaterial)(n||{}),v=i.type==="MeshPhysicalMaterial"||i.type==="MeshStandardMaterial",g=i.type==="MeshPhysicalMaterial";Object.assign(i.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:B.wobblePositionFrequency},uWobbleTimeFrequency:{value:B.wobbleTimeFrequency},uWobbleStrength:{value:B.wobbleStrength},uWarpPositionFrequency:{value:B.warpPositionFrequency},uWarpTimeFrequency:{value:B.warpTimeFrequency},uWarpStrength:{value:B.warpStrength},uWobbleShine:{value:B.wobbleShine},uIsWobbleMap:{value:!1},uWobbleMap:{value:T},uWobbleMapStrength:{value:B.wobbleMapStrength},uWobbleMapDistortion:{value:B.wobbleMapDistortion},uColor0:{value:B.color0},uColor1:{value:B.color1},uColor2:{value:B.color2},uColor3:{value:B.color3},uColorMix:{value:B.colorMix},uEdgeThreshold:{value:B.edgeThreshold},uEdgeColor:{value:B.edgeColor},uChromaticAberration:{value:B.chromaticAberration},uAnisotropicBlur:{value:B.anisotropicBlur},uDistortion:{value:B.distortion},uDistortionScale:{value:B.distortionScale},uTemporalDistortion:{value:B.temporalDistortion},uSamples:{value:B.samples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},...r}}),i.onBeforeCompile=(h,p)=>{Object.assign(h.uniforms,i.userData.uniforms),h.vertexShader=ze(h.vertexShader),h.fragmentShader=h.fragmentShader.replace("#include <color_fragment>",`
					#include <color_fragment>

					if (uEdgeThreshold > 0.0) {
						float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
						diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
					} else {
						diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
					}
				`),v&&(h.fragmentShader=h.fragmentShader.replace("#include <roughnessmap_fragment>",`
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`)),h.fragmentShader=h.fragmentShader.replace("void main() {",`
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				uniform float uEdgeThreshold;
				uniform vec3 uEdgeColor;
				uniform float uWobbleShine;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				uniform float uSamples;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				${Bt}

				varying float vWobble;
				varying vec2 vPosition;
				varying vec3 vEdgeNormal;
				varying vec3 vEdgeViewPosition;
				
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${v?"float usf_Roughness = roughness;":""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${v?"usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);":""}`),g&&(h.fragmentShader=h.fragmentShader.replace("#include <transmission_pars_fragment>",`${Lt}`),h.fragmentShader=h.fragmentShader.replace("#include <transmission_fragment>",`${Wt}`)),t&&t(h,p)},i.needsUpdate=!0;const x=new a.MeshDepthMaterial({depthPacking:a.RGBADepthPacking});return x.onBeforeCompile=(h,p)=>{Object.assign(h.uniforms,i.userData.uniforms),h.vertexShader=ze(h.vertexShader),o&&o(h,p)},x.needsUpdate=!0,{material:i,depthMaterial:x}},[n,e,t,o,r]);return{material:f,depthMaterial:s}},Ue=({scene:e=!1,geometry:n,baseMaterial:t,materialParameters:o,onBeforeCompile:r,depthOnBeforeCompile:f,uniforms:s})=>{const i=m.useMemo(()=>{let u=n||new a.IcosahedronGeometry(2,20);return u=Et(u),u.computeTangents(),u},[n]),{material:v,depthMaterial:g}=kt({baseMaterial:t,materialParameters:o,onBeforeCompile:r,depthOnBeforeCompile:f,uniforms:s}),x=L(e,i,v,a.Mesh),h=v.userData,p=A(h),l=V(h);return[m.useCallback((u,c,M)=>{u&&p("uTime",(c==null?void 0:c.beat)||u.clock.getElapsedTime()),c!==void 0&&(p("uWobbleStrength",c.wobbleStrength),p("uWobblePositionFrequency",c.wobblePositionFrequency),p("uWobbleTimeFrequency",c.wobbleTimeFrequency),p("uWarpStrength",c.warpStrength),p("uWarpPositionFrequency",c.warpPositionFrequency),p("uWarpTimeFrequency",c.warpTimeFrequency),p("uWobbleShine",c.wobbleShine),c.wobbleMap?(p("uWobbleMap",c.wobbleMap),p("uIsWobbleMap",!0)):c.wobbleMap===!1&&p("uIsWobbleMap",!1),p("uWobbleMapStrength",c.wobbleMapStrength),p("uWobbleMapDistortion",c.wobbleMapDistortion),p("uSamples",c.samples),p("uColor0",c.color0),p("uColor1",c.color1),p("uColor2",c.color2),p("uColor3",c.color3),p("uColorMix",c.colorMix),p("uEdgeThreshold",c.edgeThreshold),p("uEdgeColor",c.edgeColor),p("uChromaticAberration",c.chromaticAberration),p("uAnisotropicBlur",c.anisotropicBlur),p("uDistortion",c.distortion),p("uDistortionScale",c.distortionScale),p("uTemporalDistortion",c.temporalDistortion),l(M))},[p,l]),{mesh:x,depthMaterial:g}]},B=Object.freeze({beat:!1,wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,wobbleShine:0,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,wobbleMap:!1,wobbleMapStrength:.03,wobbleMapDistortion:0,samples:6,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new a.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0}),$t=({size:e,dpr:n,samples:t,isSizeUpdate:o,camera:r,geometry:f,baseMaterial:s,materialParameters:i,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:x})=>{const h=O(n),p=m.useMemo(()=>new a.Scene,[]),[l,{mesh:d,depthMaterial:u}]=Ue({baseMaterial:s,materialParameters:i,scene:p,geometry:f,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:x}),[c,M]=$({scene:p,camera:r,size:e,dpr:h.fbo,samples:t,isSizeUpdate:o,depthBuffer:!0}),_=m.useCallback((b,C,w)=>(l(b,C,w),M(b.gl)),[M,l]),y=m.useCallback((b,C)=>{l(null,b,C)},[l]);return[_,y,{scene:p,mesh:d,depthMaterial:u,renderTarget:c,output:c.texture}]},jt=(e,n,t)=>{const o=m.useMemo(()=>{const r=new a.Mesh(n,t);return e.add(r),r},[n,t,e]);return m.useEffect(()=>()=>{e.remove(o),n.dispose(),t.dispose()},[e,n,t,o]),o},pe=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-pe.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-pe.easeOutBounce(1-2*e))/2:(1+pe.easeOutBounce(2*e-1))/2}});function qt(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const Nt=(e,n="easeOutQuart")=>{const t=e/60,o=pe[n];return m.useCallback(f=>{let s=f.getElapsedTime()*t;const i=Math.floor(s),v=o(s-i);s=v+i;const g=qt(i);return{beat:s,floor:i,fract:v,hash:g}},[t,o])},Gt=(e=60)=>{const n=m.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=m.useRef(null);return m.useCallback(r=>{const f=r.getElapsedTime();return t.current===null||f-t.current>=n?(t.current=f,!0):!1},[n])},Kt=e=>{var o,r;const n=(o=e.dom)==null?void 0:o.length,t=(r=e.texture)==null?void 0:r.length;return!n||!t||n!==t};var Xt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Ht=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_textureResolution;
uniform vec2 u_resolution;
uniform float u_borderRadius;

void main() {
	
	float screenAspect = u_resolution.x / u_resolution.y;
	float textureAspect = u_textureResolution.x / u_textureResolution.y;
	vec2 ratio = vec2(
		min(screenAspect / textureAspect, 1.0),
		min(textureAspect / screenAspect, 1.0)
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
}`;const Yt=({params:e,scene:n,uniforms:t,onBeforeCompile:o})=>{n.children.length>0&&(n.children.forEach(r=>{r instanceof a.Mesh&&(r.geometry.dispose(),r.material.dispose())}),n.remove(...n.children)),e.texture.forEach((r,f)=>{const s=new a.ShaderMaterial({uniforms:{u_texture:{value:r},u_textureResolution:{value:new a.Vector2(0,0)},u_resolution:{value:new a.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[f]?e.boderRadius[f]:0},...t},vertexShader:Xt,fragmentShader:Ht,...z,transparent:!0});o&&(s.onBeforeCompile=o);const i=new a.Mesh(new a.PlaneGeometry(1,1),s);n.add(i)})},Qt=()=>{const e=m.useRef([]),n=m.useRef([]);return m.useCallback(({isIntersectingRef:o,isIntersectingOnceRef:r,params:f})=>{e.current.length>0&&e.current.forEach((i,v)=>{i.unobserve(n.current[v])}),n.current=[],e.current=[];const s=new Array(f.dom.length).fill(!1);o.current=[...s],r.current=[...s],f.dom.forEach((i,v)=>{const g=h=>{h.forEach(p=>{f.onIntersect[v]&&f.onIntersect[v](p),o.current[v]=p.isIntersecting})},x=new IntersectionObserver(g,{rootMargin:"0px",threshold:0});x.observe(i),e.current.push(x),n.current.push(i)})},[])},Zt=()=>{const e=m.useRef([]),n=m.useCallback(({params:t,customParams:o,size:r,resolutionRef:f,scene:s,isIntersectingRef:i})=>{s.children.length!==e.current.length&&(e.current=new Array(s.children.length)),s.children.forEach((v,g)=>{var p,l,d,u,c,M;const x=t.dom[g];if(!x)return;const h=x.getBoundingClientRect();if(e.current[g]=h,v.scale.set(h.width,h.height,1),v.position.set(h.left+h.width*.5-r.width*.5,-h.top-h.height*.5+r.height*.5,0),i.current[g]&&(t.rotation[g]&&v.rotation.copy(t.rotation[g]),v instanceof a.Mesh)){const _=v.material,y=A(_),b=V(_);y("u_texture",t.texture[g]),y("u_textureResolution",[((d=(l=(p=t.texture[g])==null?void 0:p.source)==null?void 0:l.data)==null?void 0:d.width)||0,((M=(c=(u=t.texture[g])==null?void 0:u.source)==null?void 0:c.data)==null?void 0:M.height)||0]),y("u_resolution",f.current.set(h.width,h.height)),y("u_borderRadius",t.boderRadius[g]?t.boderRadius[g]:0),b(o)}})},[]);return[e.current,n]},Jt=()=>{const e=m.useRef([]),n=m.useRef([]),t=m.useCallback((o,r=!1)=>{e.current.forEach((s,i)=>{s&&(n.current[i]=!0)});const f=r?[...n.current]:[...e.current];return o<0?f:f[o]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},eo=e=>({onView:t,onHidden:o})=>{const r=m.useRef(!1);m.useEffect(()=>{let f;const s=()=>{e.current.some(i=>i)?r.current||(t&&t(),r.current=!0):r.current&&(o&&o(),r.current=!1),f=requestAnimationFrame(s)};return f=requestAnimationFrame(s),()=>{cancelAnimationFrame(f)}},[t,o])},Oe={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},no=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:r,onBeforeCompile:f},s=[])=>{const i=O(n),v=m.useMemo(()=>new a.Scene,[]),g=W(e),[x,h]=$({scene:v,camera:g,size:e,dpr:i.fbo,samples:t,isSizeUpdate:o}),[p,l]=k({...Oe,updateKey:performance.now()}),[d,u]=Zt(),c=m.useRef(new a.Vector2(0,0)),[M,_]=m.useState(!0);m.useMemo(()=>_(!0),s);const y=m.useRef(null),b=m.useMemo(()=>T,[]),C=Qt(),{isIntersectingOnceRef:w,isIntersectingRef:R,isIntersecting:U}=Jt(),F=eo(R);return[m.useCallback((P,D,q)=>{const{gl:oe,size:H}=P;if(D&&l(D),Kt(p))return b;if(M){if(y.current===p.updateKey)return b;y.current=p.updateKey}return M&&(Yt({params:p,size:H,scene:v,uniforms:r,onBeforeCompile:f}),C({isIntersectingRef:R,isIntersectingOnceRef:w,params:p}),_(!1)),u({params:p,customParams:q,size:H,resolutionRef:c,scene:v,isIntersectingRef:R}),h(oe)},[h,r,l,C,u,f,M,v,p,w,R,b]),l,{scene:v,camera:g,renderTarget:x,output:x.texture,isIntersecting:U,DOMRects:d,intersections:R.current,useDomView:F}]},to=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:r=!1,samples:f=0,depthBuffer:s=!1,depthTexture:i=!1},v)=>{const g=m.useRef([]),x=N(t,o);g.current=m.useMemo(()=>Array.from({length:v},()=>{const p=new a.WebGLRenderTarget(x.x,x.y,{...ce,samples:f,depthBuffer:s});return i&&(p.depthTexture=new a.DepthTexture(x.x,x.y,a.FloatType)),p}),[v]),r&&g.current.forEach(p=>p.setSize(x.x,x.y)),m.useEffect(()=>{const p=g.current;return()=>{p.forEach(l=>l.dispose())}},[v]);const h=m.useCallback((p,l,d)=>{const u=g.current[l];return ge({gl:p,scene:e,camera:n,fbo:u,onBeforeRender:()=>d&&d({read:u.texture})}),u.texture},[e,n]);return[g.current,h]};S.ALPHABLENDING_PARAMS=De,S.BLANK_PARAMS=Ae,S.BLENDING_PARAMS=ie,S.BRIGHTNESSPICKER_PARAMS=ve,S.BRUSH_PARAMS=Y,S.CHROMAKEY_PARAMS=X,S.COLORSTRATA_PARAMS=K,S.COSPALETTE_PARAMS=ae,S.COVERTEXTURE_PARAMS=Re,S.DOMSYNCER_PARAMS=Oe,S.DUOTONE_PARAMS=he,S.Easing=pe,S.FBO_OPTION=ce,S.FLUID_PARAMS=Te,S.FXBLENDING_PARAMS=Me,S.FXTEXTURE_PARAMS=ee,S.HSV_PARAMS=xe,S.MARBLE_PARAMS=te,S.MORPHPARTICLES_PARAMS=E,S.MOTIONBLUR_PARAMS=me,S.NOISE_PARAMS=J,S.RIPPLE_PARAMS=we,S.SIMPLEBLUR_PARAMS=ye,S.WAVE_PARAMS=ue,S.WOBBLE3D_PARAMS=B,S.renderFBO=ge,S.setCustomUniform=V,S.setUniform=A,S.useAddMesh=jt,S.useAlphaBlending=tt,S.useBeat=Nt,S.useBlank=Pt,S.useBlending=Wn,S.useBrightnessPicker=Xn,S.useBrush=Ne,S.useCamera=W,S.useChromaKey=wt,S.useColorStrata=Cn,S.useCopyTexture=to,S.useCosPalette=Fn,S.useCoverTexture=ct,S.useCreateMorphParticles=Ve,S.useCreateWobble3D=Ue,S.useDomSyncer=no,S.useDoubleFBO=ne,S.useDuoTone=On,S.useFPSLimiter=Gt,S.useFluid=mn,S.useFxBlending=Zn,S.useFxTexture=qn,S.useHSV=it,S.useMarble=Rn,S.useMorphParticles=Ot,S.useMotionBlur=xt,S.useNoise=Mn,S.useParams=k,S.usePointer=de,S.useResolution=N,S.useRipple=gn,S.useSimpleBlur=ft,S.useSingleFBO=$,S.useWave=St,S.useWobble3D=$t,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
