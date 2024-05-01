(function(C,re){typeof exports=="object"&&typeof module<"u"?re(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],re):(C=typeof globalThis<"u"?globalThis:C||self,re(C["use-shader-fx"]={},C.THREE,C.React))})(this,function(C,re,v){"use strict";function We(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const o=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,o.get?o:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const i=We(re);var ke=`varying vec2 vUv;

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
}`;const N=(e,n=!1)=>{const t=n?e.width*n:e.width,o=n?e.height*n:e.height;return v.useMemo(()=>new i.Vector2(t,o),[t,o])},A=e=>(n,t)=>{if(t===void 0)return;const o=e.uniforms;o&&o[n]&&(o[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const o=e.uniforms;o&&o[t]&&(o[t].value=n[t])})},B=(e,n,t,o)=>{const a=v.useMemo(()=>{const m=new o(n,t);return e&&e.add(m),m},[n,t,o,e]);return v.useEffect(()=>()=>{e&&e.remove(a),n.dispose(),t.dispose()},[e,n,t,a]),a},Ce=process.env.NODE_ENV==="development",z={transparent:!1,depthTest:!1,depthWrite:!1},T=new i.DataTexture(new Uint8Array([0,0,0,0]),1,1,i.RGBAFormat),je=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:a})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uBuffer:{value:T},uResolution:{value:new i.Vector2(0,0)},uTexture:{value:T},uIsTexture:{value:!1},uMap:{value:T},uIsMap:{value:!1},uMapIntensity:{value:Y.mapIntensity},uRadius:{value:Y.radius},uSmudge:{value:Y.smudge},uDissipation:{value:Y.dissipation},uMotionBlur:{value:Y.motionBlur},uMotionSample:{value:Y.motionSample},uMouse:{value:new i.Vector2(-10,-10)},uPrevMouse:{value:new i.Vector2(-10,-10)},uVelocity:{value:new i.Vector2(0,0)},uColor:{value:Y.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1},...o},vertexShader:ke,fragmentShader:$e,...z,transparent:!0});return a&&(g.onBeforeCompile=a),g},[a,o]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},qe=(e,n)=>{const t=n,o=e/n,[a,m]=[t*o/2,t/2];return{width:a,height:m,near:-1e3,far:1e3}},L=(e,n="OrthographicCamera")=>{const t=N(e),{width:o,height:a,near:m,far:s}=qe(t.x,t.y);return v.useMemo(()=>n==="OrthographicCamera"?new i.OrthographicCamera(-o,o,a,-a,m,s):new i.PerspectiveCamera(50,o/a),[o,a,m,s,n])},de=(e=0)=>{const n=v.useRef(new i.Vector2(0,0)),t=v.useRef(new i.Vector2(0,0)),o=v.useRef(new i.Vector2(0,0)),a=v.useRef(0),m=v.useRef(new i.Vector2(0,0)),s=v.useRef(!1);return v.useCallback(c=>{const g=performance.now();let d;s.current&&e?(o.current=o.current.lerp(c,1-e),d=o.current.clone()):(d=c.clone(),o.current=d),a.current===0&&(a.current=g,n.current=d);const b=Math.max(1,g-a.current);a.current=g,m.current.copy(d).sub(n.current).divideScalar(b);const h=m.current.length()>0,r=s.current?n.current.clone():d;return!s.current&&h&&(s.current=!0),n.current=d,{currentPointer:d,prevPointer:r,diffPointer:t.current.subVectors(d,r),velocity:m.current,isVelocityUpdate:h}},[e])},W=e=>{const n=a=>Object.values(a).some(m=>typeof m=="function"),t=v.useRef(n(e)?e:structuredClone(e)),o=v.useCallback(a=>{for(const m in a){const s=m;s in t.current&&a[s]!==void 0&&a[s]!==null?t.current[s]=a[s]:console.error(`"${String(s)}" does not exist in the params. or "${String(s)}" is null | undefined`)}},[]);return[t.current,o]},ce={minFilter:i.LinearFilter,magFilter:i.LinearFilter,type:i.HalfFloatType,stencilBuffer:!1},ge=({gl:e,fbo:n,scene:t,camera:o,onBeforeRender:a,onSwap:m})=>{e.setRenderTarget(n),a(),e.clear(),e.render(t,o),m&&m(),e.setRenderTarget(null),e.clear()},$=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:a=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1})=>{var b;const c=v.useRef(),g=N(t,o);c.current=v.useMemo(()=>{const h=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s});return u&&(h.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),h},[]),a&&((b=c.current)==null||b.setSize(g.x,g.y)),v.useEffect(()=>{const h=c.current;return()=>{h==null||h.dispose()}},[]);const d=v.useCallback((h,r)=>{const f=c.current;return ge({gl:h,fbo:f,scene:e,camera:n,onBeforeRender:()=>r&&r({read:f.texture})}),f.texture},[e,n]);return[c.current,d]},ne=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:a=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1})=>{var h,r;const c=v.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),g=N(t,o),d=v.useMemo(()=>{const f=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s}),l=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s});return u&&(f.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType),l.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),{read:f,write:l}},[]);c.current.read=d.read,c.current.write=d.write,a&&((h=c.current.read)==null||h.setSize(g.x,g.y),(r=c.current.write)==null||r.setSize(g.x,g.y)),v.useEffect(()=>{const f=c.current;return()=>{var l,p;(l=f.read)==null||l.dispose(),(p=f.write)==null||p.dispose()}},[]);const b=v.useCallback((f,l)=>{var x;const p=c.current;return ge({gl:f,scene:e,camera:n,fbo:p.write,onBeforeRender:()=>l&&l({read:p.read.texture,write:p.write.texture}),onSwap:()=>p.swap()}),(x=p.read)==null?void 0:x.texture},[e,n]);return[{read:c.current.read,write:c.current.write},b]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Y=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new i.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ne=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=je({scene:u,size:e,dpr:s.shader,uniforms:a,onBeforeCompile:m}),d=L(e),b=de(),[h,r]=ne({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[f,l]=W(Y),p=v.useRef(null),x=A(c),S=V(c);return[v.useCallback((M,_,w)=>{const{gl:D,pointer:U}=M;_&&l(_),f.texture?(x("uIsTexture",!0),x("uTexture",f.texture)):x("uIsTexture",!1),f.map?(x("uIsMap",!0),x("uMap",f.map),x("uMapIntensity",f.mapIntensity)):x("uIsMap",!1),x("uRadius",f.radius),x("uSmudge",f.smudge),x("uDissipation",f.dissipation),x("uMotionBlur",f.motionBlur),x("uMotionSample",f.motionSample);const F=f.pointerValues||b(U);F.isVelocityUpdate&&(x("uMouse",F.currentPointer),x("uPrevMouse",F.prevPointer)),x("uVelocity",F.velocity);const I=typeof f.color=="function"?f.color(F.velocity):f.color;return x("uColor",I),x("uIsCursor",f.isCursor),x("uPressureEnd",f.pressure),p.current===null&&(p.current=f.pressure),x("uPressureStart",p.current),p.current=f.pressure,S(w),r(D,({read:P})=>{x("uBuffer",P)})},[x,b,r,f,l,S]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var Q=`varying vec2 vUv;
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
}`;const Ke=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:n,vertexShader:Q,fragmentShader:Ge,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Xe=`precision highp float;

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
}`;const He=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uVelocity:{value:T},uSource:{value:T},texelSize:{value:new i.Vector2},dt:{value:0},dissipation:{value:0},...n},vertexShader:Q,fragmentShader:Xe,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Ye=`precision highp float;

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
}`;const Qe=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:Ye,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var Ze=`precision highp float;

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
}`;const Je=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:Ze,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var en=`precision highp float;

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
}`;const nn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:en,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var tn=`precision highp float;

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
}`;const on=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:tn,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var rn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const an=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uTexture:{value:T},value:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:rn,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var un=`precision highp float;

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
}`;const sn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uPressure:{value:T},uVelocity:{value:T},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:un,...z});return e&&(o.onBeforeCompile=e),o},[e,n]);var ln=`precision highp float;

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
}`;const cn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const o=new i.ShaderMaterial({uniforms:{uTarget:{value:T},aspectRatio:{value:0},color:{value:new i.Vector3},point:{value:new i.Vector2},radius:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:ln,...z});return e&&(o.onBeforeCompile=e),o},[e,n]),Z=(e,n)=>{const t=n==null?void 0:n.onBeforeCompile;return e({onBeforeCompile:t})},vn=({scene:e,size:n,dpr:t,fluidOnBeforeCompile:o})=>{const a=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),{curl:m,vorticity:s,advection:u,divergence:c,pressure:g,clear:d,gradientSubtract:b,splat:h}=o??{},r=Z(Ke),f=r.clone(),l=Z(nn,m),p=Z(on,s),x=Z(He,u),S=Z(Qe,c),y=Z(Je,g),M=Z(an,d),_=Z(sn,b),w=Z(cn,h),D=v.useMemo(()=>({vorticityMaterial:p,curlMaterial:l,advectionMaterial:x,divergenceMaterial:S,pressureMaterial:y,clearMaterial:M,gradientSubtractMaterial:_,splatMaterial:w}),[p,l,x,S,y,M,_,w]),U=N(n,t);v.useMemo(()=>{A(D.splatMaterial)("aspectRatio",U.x/U.y);for(const P of Object.values(D))A(P)("texelSize",new i.Vector2(1/U.x,1/U.y))},[U,D]);const F=B(e,a,r,i.Mesh);v.useMemo(()=>{r.dispose(),F.material=f},[r,F,f]),v.useEffect(()=>()=>{for(const P of Object.values(D))P.dispose()},[D]);const I=v.useCallback(P=>{F.material=P,F.material.needsUpdate=!0},[F]);return{materials:D,setMeshMaterial:I,mesh:F}},Te=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new i.Vector3(1,1,1),pointerValues:!1}),mn=({size:e,dpr:n,samples:t,isSizeUpdate:o,fluidOnBeforeCompile:a})=>{const m=O(n),s=v.useMemo(()=>new i.Scene,[]),{materials:u,setMeshMaterial:c,mesh:g}=vn({scene:s,size:e,dpr:m.shader,fluidOnBeforeCompile:a}),d=L(e),b=de(),h=v.useMemo(()=>({scene:s,camera:d,dpr:m.fbo,size:e,samples:t,isSizeUpdate:o}),[s,d,e,t,m.fbo,o]),[r,f]=ne(h),[l,p]=ne(h),[x,S]=$(h),[y,M]=$(h),[_,w]=ne(h),D=v.useRef(0),U=v.useRef(new i.Vector2(0,0)),F=v.useRef(new i.Vector3(0,0,0)),[I,P]=W(Te),R=v.useMemo(()=>({advection:A(u.advectionMaterial),splat:A(u.splatMaterial),curl:A(u.curlMaterial),vorticity:A(u.vorticityMaterial),divergence:A(u.divergenceMaterial),clear:A(u.clearMaterial),pressure:A(u.pressureMaterial),gradientSubtract:A(u.gradientSubtractMaterial)}),[u]),q=v.useMemo(()=>({advection:V(u.advectionMaterial),splat:V(u.splatMaterial),curl:V(u.curlMaterial),vorticity:V(u.vorticityMaterial),divergence:V(u.divergenceMaterial),clear:V(u.clearMaterial),pressure:V(u.pressureMaterial),gradientSubtract:V(u.gradientSubtractMaterial)}),[u]);return[v.useCallback((H,fe,se)=>{const{gl:G,pointer:oo,clock:Se,size:Ee}=H;fe&&P(fe),D.current===0&&(D.current=Se.getElapsedTime());const Be=Math.min((Se.getElapsedTime()-D.current)/3,.02);D.current=Se.getElapsedTime();const _e=f(G,({read:j})=>{c(u.advectionMaterial),R.advection("uVelocity",j),R.advection("uSource",j),R.advection("dt",Be),R.advection("dissipation",I.velocity_dissipation)}),ro=p(G,({read:j})=>{c(u.advectionMaterial),R.advection("uVelocity",_e),R.advection("uSource",j),R.advection("dissipation",I.density_dissipation)}),be=I.pointerValues||b(oo);be.isVelocityUpdate&&(f(G,({read:j})=>{c(u.splatMaterial),R.splat("uTarget",j),R.splat("point",be.currentPointer);const le=be.diffPointer.multiply(U.current.set(Ee.width,Ee.height).multiplyScalar(I.velocity_acceleration));R.splat("color",F.current.set(le.x,le.y,1)),R.splat("radius",I.splat_radius)}),p(G,({read:j})=>{c(u.splatMaterial),R.splat("uTarget",j);const le=typeof I.fluid_color=="function"?I.fluid_color(be.velocity):I.fluid_color;R.splat("color",le)}));const ao=S(G,()=>{c(u.curlMaterial),R.curl("uVelocity",_e)});f(G,({read:j})=>{c(u.vorticityMaterial),R.vorticity("uVelocity",j),R.vorticity("uCurl",ao),R.vorticity("curl",I.curl_strength),R.vorticity("dt",Be)});const io=M(G,()=>{c(u.divergenceMaterial),R.divergence("uVelocity",_e)});w(G,({read:j})=>{c(u.clearMaterial),R.clear("uTexture",j),R.clear("value",I.pressure_dissipation)}),c(u.pressureMaterial),R.pressure("uDivergence",io);let Le;for(let j=0;j<I.pressure_iterations;j++)Le=w(G,({read:le})=>{R.pressure("uPressure",le)});return f(G,({read:j})=>{c(u.gradientSubtractMaterial),R.gradientSubtract("uPressure",Le),R.gradientSubtract("uVelocity",j)}),se&&Object.keys(se).forEach(j=>{q[j](se[j])}),ro},[u,R,c,S,p,M,b,w,f,q,P,I]),P,{scene:s,mesh:g,materials:u,camera:d,renderTarget:{velocity:r,density:l,curl:x,divergence:y,pressure:_},output:l.read.texture}]};var pn=`varying vec2 vUv;

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
}`;const dn=({scale:e,max:n,texture:t,scene:o,uniforms:a,onBeforeCompile:m})=>{const s=v.useMemo(()=>new i.PlaneGeometry(e,e),[e]),u=v.useMemo(()=>new i.ShaderMaterial({uniforms:{uOpacity:{value:0},uMap:{value:t||T},...a},blending:i.AdditiveBlending,vertexShader:pn,fragmentShader:fn,...z,transparent:!0}),[t,a]),c=v.useMemo(()=>{const g=[];for(let d=0;d<n;d++){const b=u.clone();m&&(b.onBeforeCompile=m);const h=new i.Mesh(s.clone(),b);h.rotateZ(2*Math.PI*Math.random()),h.visible=!1,o.add(h),g.push(h)}return g},[m,s,u,o,n]);return v.useEffect(()=>()=>{c.forEach(g=>{g.geometry.dispose(),Array.isArray(g.material)?g.material.forEach(d=>d.dispose()):g.material.dispose(),o.remove(g)})},[o,c]),c},we=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),gn=({texture:e,scale:n=64,max:t=100,size:o,dpr:a,samples:m,isSizeUpdate:s,uniforms:u,onBeforeCompile:c})=>{const g=O(a),d=v.useMemo(()=>new i.Scene,[]),b=dn({scale:n,max:t,texture:e,scene:d,uniforms:u,onBeforeCompile:c}),h=L(o),r=de(),[f,l]=$({scene:d,camera:h,size:o,dpr:g.fbo,samples:m,isSizeUpdate:s}),[p,x]=W(we),S=v.useRef(0);return[v.useCallback((M,_,w)=>{const{gl:D,pointer:U,size:F}=M;_&&x(_);const I=p.pointerValues||r(U);if(p.frequency<I.diffPointer.length()){const P=b[S.current],R=P.material;P.visible=!0,P.position.set(I.currentPointer.x*(F.width/2),I.currentPointer.y*(F.height/2),0),P.scale.x=P.scale.y=0,A(R)("uOpacity",p.alpha),S.current=(S.current+1)%t}return b.forEach(P=>{if(P.visible){const R=P.material;P.rotation.z+=p.rotation,P.scale.x=p.fadeout_speed*P.scale.x+p.scale,P.scale.y=P.scale.x;const q=R.uniforms.uOpacity.value;A(R)("uOpacity",q*p.fadeout_speed),q<.001&&(P.visible=!1),V(R)(w)}}),l(D)},[l,b,r,t,p,x]),x,{scene:d,camera:h,meshArr:b,renderTarget:f,output:f.texture}]};var hn=`varying vec2 vUv;

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
}`;const bn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:J.scale},timeStrength:{value:J.timeStrength},noiseOctaves:{value:J.noiseOctaves},fbmOctaves:{value:J.fbmOctaves},warpOctaves:{value:J.warpOctaves},warpDirection:{value:J.warpDirection},warpStrength:{value:J.warpStrength},...n},vertexShader:hn,fragmentShader:xn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},J=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new i.Vector2(2,2),warpStrength:8,beat:!1}),Mn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=bn({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(J),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_,clock:w}=S;return y&&f(y),l("scale",r.scale),l("timeStrength",r.timeStrength),l("noiseOctaves",r.noiseOctaves),l("fbmOctaves",r.fbmOctaves),l("warpOctaves",r.warpOctaves),l("warpDirection",r.warpDirection),l("warpStrength",r.warpStrength),l("uTime",r.beat||w.getElapsedTime()),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var yn=`varying vec2 vUv;

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
}`;const _n=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},isTexture:{value:!1},scale:{value:K.scale},noise:{value:T},noiseStrength:{value:K.noiseStrength},isNoise:{value:!1},laminateLayer:{value:K.laminateLayer},laminateInterval:{value:K.laminateInterval},laminateDetail:{value:K.laminateDetail},distortion:{value:K.distortion},colorFactor:{value:K.colorFactor},uTime:{value:0},timeStrength:{value:K.timeStrength},...n},vertexShader:yn,fragmentShader:Sn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},K=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new i.Vector2(.1,.1),laminateDetail:new i.Vector2(1,1),distortion:new i.Vector2(0,0),colorFactor:new i.Vector3(1,1,1),timeStrength:new i.Vector2(0,0),noise:!1,noiseStrength:new i.Vector2(0,0),beat:!1}),Cn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=_n({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(K),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_,clock:w}=S;return y&&f(y),r.texture?(l("uTexture",r.texture),l("isTexture",!0)):(l("isTexture",!1),l("scale",r.scale)),r.noise?(l("noise",r.noise),l("isNoise",!0),l("noiseStrength",r.noiseStrength)):l("isNoise",!1),l("uTime",r.beat||w.getElapsedTime()),l("laminateLayer",r.laminateLayer),l("laminateInterval",r.laminateInterval),l("laminateDetail",r.laminateDetail),l("distortion",r.distortion),l("colorFactor",r.colorFactor),l("timeStrength",r.timeStrength),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Tn=`varying vec2 vUv;

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
}`;const Dn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:te.pattern},u_complexity:{value:te.complexity},u_complexityAttenuation:{value:te.complexityAttenuation},u_iterations:{value:te.iterations},u_timeStrength:{value:te.timeStrength},u_scale:{value:te.scale},...n},vertexShader:Tn,fragmentShader:wn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},te=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Rn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Dn({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(te),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_,clock:w}=S;return y&&f(y),l("u_pattern",r.pattern),l("u_complexity",r.complexity),l("u_complexityAttenuation",r.complexityAttenuation),l("u_iterations",r.iterations),l("u_timeStrength",r.timeStrength),l("u_scale",r.scale),l("u_time",r.beat||w.getElapsedTime()),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var An=`varying vec2 vUv;

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
}`;const In=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uRgbWeight:{value:ae.rgbWeight},uColor1:{value:ae.color1},uColor2:{value:ae.color2},uColor3:{value:ae.color3},uColor4:{value:ae.color4},...n},vertexShader:An,fragmentShader:Pn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},ae=Object.freeze({texture:T,color1:new i.Color().set(.5,.5,.5),color2:new i.Color().set(.5,.5,.5),color3:new i.Color().set(1,1,1),color4:new i.Color().set(0,.1,.2),rgbWeight:new i.Vector3(.299,.587,.114)}),Fn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=In({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(ae),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("uTexture",r.texture),l("uColor1",r.color1),l("uColor2",r.color2),l("uColor3",r.color3),l("uColor4",r.color4),l("uRgbWeight",r.rgbWeight),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Vn=`varying vec2 vUv;

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
}`;const Un=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uColor0:{value:he.color0},uColor1:{value:he.color1},...n},vertexShader:Vn,fragmentShader:zn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},he=Object.freeze({texture:T,color0:new i.Color(16777215),color1:new i.Color(0)}),On=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Un({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(he),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("uTexture",r.texture),l("uColor0",r.color0),l("uColor1",r.color1),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var En=`varying vec2 vUv;

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
}`;const Ln=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_alphaMap:{value:T},u_isAlphaMap:{value:!1},u_mapIntensity:{value:ie.mapIntensity},u_brightness:{value:ie.brightness},u_min:{value:ie.min},u_max:{value:ie.max},u_dodgeColor:{value:ie.dodgeColor},u_isDodgeColor:{value:!1},...n},vertexShader:En,fragmentShader:Bn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},ie=Object.freeze({texture:T,map:T,alphaMap:!1,mapIntensity:.3,brightness:new i.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Wn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Ln({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(ie),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("u_texture",r.texture),l("u_map",r.map),l("u_mapIntensity",r.mapIntensity),r.alphaMap?(l("u_alphaMap",r.alphaMap),l("u_isAlphaMap",!0)):l("u_isAlphaMap",!1),l("u_brightness",r.brightness),l("u_min",r.min),l("u_max",r.max),r.dodgeColor?(l("u_dodgeColor",r.dodgeColor),l("u_isDodgeColor",!0)):l("u_isDodgeColor",!1),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var kn=`varying vec2 vUv;

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

}`;const jn=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:a})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{var d,b;const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture0:{value:T},uTexture1:{value:T},padding:{value:ee.padding},uMap:{value:T},edgeIntensity:{value:ee.edgeIntensity},mapIntensity:{value:ee.mapIntensity},epicenter:{value:ee.epicenter},progress:{value:ee.progress},dirX:{value:(d=ee.dir)==null?void 0:d.x},dirY:{value:(b=ee.dir)==null?void 0:b.y},...o},vertexShader:kn,fragmentShader:$n,...z});return a&&(g.onBeforeCompile=a),g},[a,o]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},ee=Object.freeze({texture0:T,texture1:T,padding:0,map:T,mapIntensity:0,edgeIntensity:0,epicenter:new i.Vector2(0,0),progress:0,dir:new i.Vector2(0,0)}),qn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=jn({scene:u,size:e,dpr:s.shader,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,dpr:s.fbo,size:e,samples:t,isSizeUpdate:o}),[r,f]=W(ee),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{var F,I,P,R,q,oe,H,fe;const{gl:_}=S;y&&f(y),l("uTexture0",r.texture0),l("uTexture1",r.texture1),l("progress",r.progress);const w=[((I=(F=r.texture0)==null?void 0:F.image)==null?void 0:I.width)||0,((R=(P=r.texture0)==null?void 0:P.image)==null?void 0:R.height)||0],D=[((oe=(q=r.texture1)==null?void 0:q.image)==null?void 0:oe.width)||0,((fe=(H=r.texture1)==null?void 0:H.image)==null?void 0:fe.height)||0],U=w.map((se,G)=>se+(D[G]-se)*r.progress);return l("uTextureResolution",U),l("padding",r.padding),l("uMap",r.map),l("mapIntensity",r.mapIntensity),l("edgeIntensity",r.edgeIntensity),l("epicenter",r.epicenter),l("dirX",r.dir.x),l("dirY",r.dir.y),p(M),h(_)},[h,l,r,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Nn=`varying vec2 vUv;

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
}`;const Kn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:ve.brightness},u_min:{value:ve.min},u_max:{value:ve.max},...n},vertexShader:Nn,fragmentShader:Gn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},ve=Object.freeze({texture:T,brightness:new i.Vector3(.5,.5,.5),min:0,max:1}),Xn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Kn({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(ve),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("u_texture",r.texture),l("u_brightness",r.brightness),l("u_min",r.min),l("u_max",r.max),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Hn=`varying vec2 vUv;

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
}`;const Qn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_mapIntensity:{value:Me.mapIntensity},...n},vertexShader:Hn,fragmentShader:Yn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},Me=Object.freeze({texture:T,map:T,mapIntensity:.3}),Zn=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Qn({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(Me),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("u_texture",r.texture),l("u_map",r.map),l("u_mapIntensity",r.mapIntensity),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Jn=`varying vec2 vUv;

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
}`;const nt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uMap:{value:T},...n},vertexShader:Jn,fragmentShader:et,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},De=Object.freeze({texture:T,map:T}),tt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=nt({scene:u,size:e,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(De),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("uTexture",r.texture),l("uMap",r.map),p(M),h(_)},[l,h,r,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var ot=`varying vec2 vUv;

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
}`;const at=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:xe.brightness},u_saturation:{value:xe.saturation},...n},vertexShader:ot,fragmentShader:rt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},xe=Object.freeze({texture:T,brightness:1,saturation:1}),it=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=at({scene:u,size:e,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(xe),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("u_texture",r.texture),l("u_brightness",r.brightness),l("u_saturation",r.saturation),p(M),h(_)},[l,h,r,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var ut=`varying vec2 vUv;

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

}`;const lt=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:a})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture:{value:T},...o},vertexShader:ut,fragmentShader:st,...z});return a&&(g.onBeforeCompile=a),g},[a,o]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},Re=Object.freeze({texture:T}),ct=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=lt({scene:u,size:e,dpr:s.shader,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,dpr:s.fbo,size:e,samples:t,isSizeUpdate:o}),[r,f]=W(Re),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{var w,D,U,F,I,P;const{gl:_}=S;return y&&f(y),l("uTexture",r.texture),l("uTextureResolution",[((U=(D=(w=r.texture)==null?void 0:w.source)==null?void 0:D.data)==null?void 0:U.width)||0,((P=(I=(F=r.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.height)||0]),p(M),h(_)},[h,l,r,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var vt=`precision highp float;

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
}`;const pt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uResolution:{value:new i.Vector2(0,0)},uBlurSize:{value:ye.blurSize},...n},vertexShader:vt,fragmentShader:mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},ye=Object.freeze({texture:T,blurSize:3,blurPower:5}),ft=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=pt({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),b=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[u,d,e,s.fbo,t,o]),[h,r]=ne(b),[f,l]=W(ye),p=A(c),x=V(c);return[v.useCallback((y,M,_)=>{var F,I,P,R,q,oe;const{gl:w}=y;M&&l(M),p("uTexture",f.texture),p("uResolution",[((P=(I=(F=f.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.width)||0,((oe=(q=(R=f.texture)==null?void 0:R.source)==null?void 0:q.data)==null?void 0:oe.height)||0]),p("uBlurSize",f.blurSize);let D=r(w);const U=f.blurPower;for(let H=0;H<U;H++)p("uTexture",D),D=r(w);return x(_),D},[r,p,l,f,x]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var dt=`precision highp float;

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
}`;const ht=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uBegin:{value:me.begin},uEnd:{value:me.end},uStrength:{value:me.strength},...n},vertexShader:dt,fragmentShader:gt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},me=Object.freeze({texture:T,begin:new i.Vector2(0,0),end:new i.Vector2(0,0),strength:.9}),xt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=ht({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),b=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[u,d,e,s.fbo,t,o]),[h,r]=ne(b),[f,l]=W(me),p=A(c),x=V(c);return[v.useCallback((y,M,_)=>{const{gl:w}=y;return M&&l(M),p("uTexture",f.texture),p("uBegin",f.begin),p("uEnd",f.end),p("uStrength",f.strength),x(_),r(w,({read:D})=>{p("uBackbuffer",D)})},[r,p,l,f,x]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var bt=`varying vec2 vUv;

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
}`;const yt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),a=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uEpicenter:{value:ue.epicenter},uProgress:{value:ue.progress},uStrength:{value:ue.strength},uWidth:{value:ue.width},uMode:{value:0},...n},vertexShader:bt,fragmentShader:Mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,o,a,i.Mesh);return{material:a,mesh:m}},ue=Object.freeze({epicenter:new i.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),St=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=yt({scene:u,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(ue),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("uEpicenter",r.epicenter),l("uProgress",r.progress),l("uWidth",r.width),l("uStrength",r.strength),l("uMode",r.mode==="center"?0:r.mode==="horizontal"?1:2),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var _t=`varying vec2 vUv;

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
}`;const Tt=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:a})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_resolution:{value:new i.Vector2},u_keyColor:{value:X.color},u_similarity:{value:X.similarity},u_smoothness:{value:X.smoothness},u_spill:{value:X.spill},u_color:{value:X.color},u_contrast:{value:X.contrast},u_brightness:{value:X.brightness},u_gamma:{value:X.gamma},...o},vertexShader:_t,fragmentShader:Ct,...z});return a&&(g.onBeforeCompile=a),g},[a,o]),u=N(n,t);A(s)("u_resolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},X=Object.freeze({texture:T,keyColor:new i.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new i.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),wt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Tt({scene:u,size:e,dpr:s.shader,uniforms:a,onBeforeCompile:m}),d=L(e),[b,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[r,f]=W(X),l=A(c),p=V(c);return[v.useCallback((S,y,M)=>{const{gl:_}=S;return y&&f(y),l("u_texture",r.texture),l("u_keyColor",r.keyColor),l("u_similarity",r.similarity),l("u_smoothness",r.smoothness),l("u_spill",r.spill),l("u_color",r.color),l("u_contrast",r.contrast),l("u_brightness",r.brightness),l("u_gamma",r.gamma),p(M),h(_)},[h,l,f,r,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:b,output:b.texture}]};var Dt=`precision highp float;

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
}`;const At=({scene:e,size:n,dpr:t,uniforms:o,onBeforeCompile:a})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uTime:{value:0},uPointer:{value:new i.Vector2},uResolution:{value:new i.Vector2},...o},vertexShader:Dt,fragmentShader:Rt,...z});return a&&(g.onBeforeCompile=a),g},[a,o]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},Ae=Object.freeze({texture:T,beat:!1}),Pt=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=At({scene:u,size:e,dpr:s.shader,uniforms:a,onBeforeCompile:m}),d=L(e),b=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:o}),[u,d,e,s.fbo,t,o]),[h,r]=ne(b),[f,l]=W(Ae),p=A(c),x=V(c);return[v.useCallback((y,M,_)=>{const{gl:w,clock:D,pointer:U}=y;return M&&l(M),p("uTexture",f.texture),p("uPointer",U),p("uTime",f.beat||D.getElapsedTime()),x(_),r(w,({read:F})=>{p("uBackbuffer",F)})},[r,p,l,f,x]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]},It=({scene:e,geometry:n,material:t})=>{const o=B(e,n,t,i.Points),a=B(e,v.useMemo(()=>n.clone(),[n]),v.useMemo(()=>t.clone(),[t]),i.Mesh);return a.visible=!1,{points:o,interactiveMesh:a}};var Ft=`uniform vec2 uResolution;
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
}`;const Ie=(e,n,t,o,a)=>{var d;const m=t==="position"?"positionTarget":"uvTarget",s=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",u=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",c=t==="position"?"positionsList":"uvsList",g=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new i.BufferAttribute(e[0],a));let b="",h="";e.forEach((r,f)=>{n.setAttribute(`${m}${f}`,new i.BufferAttribute(r,a)),b+=`attribute vec${a} ${m}${f};
`,f===0?h+=`${m}${f}`:h+=`,${m}${f}`}),o=o.replace(`${s}`,b),o=o.replace(`${u}`,`vec${a} ${c}[${e.length}] = vec${a}[](${h});
				${g}
			`)}else o=o.replace(`${s}`,""),o=o.replace(`${u}`,""),(d=n==null?void 0:n.attributes[t])!=null&&d.array||Ce&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return o},Fe=(e,n,t,o)=>{var m;let a=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?a=[n.attributes[t].array,...e]:a=e;const s=Math.max(...a.map(u=>u.length));a.forEach((u,c)=>{if(u.length<s){const g=(s-u.length)/o,d=[],b=Array.from(u);for(let h=0;h<g;h++){const r=Math.floor(u.length/o*Math.random())*o;for(let f=0;f<o;f++)d.push(b[r+f])}a[c]=new Float32Array([...b,...d])}})}return a},zt=(e,n)=>{let t="";const o={};let a="mapArrayColor = ";return e&&e.length>0?(e.forEach((s,u)=>{const c=`vMapArrayIndex < ${u}.1`,g=`texture2D(uMapArray${u}, uv)`;a+=`( ${c} ) ? ${g} : `,t+=`
        uniform sampler2D uMapArray${u};
      `,o[`uMapArray${u}`]={value:s}}),a+="vec4(1.);",t+="bool isMapArray = true;",o.uMapArrayLength={value:e.length}):(a+="vec4(1.0);",t+="bool isMapArray = false;",o.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",a).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:o}},Ut=({size:e,dpr:n,geometry:t,positions:o,uvs:a,mapArray:m,uniforms:s,onBeforeCompile:u})=>{const c=v.useMemo(()=>Fe(o,t,"position",3),[o,t]),g=v.useMemo(()=>Fe(a,t,"uv",2),[a,t]),d=v.useMemo(()=>{c.length!==g.length&&Ce&&console.log("use-shader-fx:positions and uvs are not matched");const h=Ie(g,t,"uv",Ie(c,t,"position",Ft,3),2).replace("#usf <getWobble>",Pe),{rewritedFragmentShader:r,mapArrayUniforms:f}=zt(m,Vt),l=new i.ShaderMaterial({vertexShader:h,fragmentShader:r,blending:i.AdditiveBlending,...z,transparent:!0,uniforms:{uResolution:{value:new i.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:T},uIsPicture:{value:!1},uAlphaPicture:{value:T},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:T},uIsMap:{value:!1},uAlphaMap:{value:T},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:T},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...f,...s}});return u&&(l.onBeforeCompile=u),l},[t,c,g,m,u,s]),b=N(e,n);return A(d)("uResolution",b.clone()),{material:d,modifiedPositions:c,modifiedUvs:g}},Ve=({size:e,dpr:n,scene:t=!1,geometry:o,positions:a,uvs:m,mapArray:s,uniforms:u,onBeforeCompile:c})=>{const g=O(n),d=v.useMemo(()=>{const y=o||new i.SphereGeometry(1,32,32);return y.setIndex(null),y.deleteAttribute("normal"),y},[o]),{material:b,modifiedPositions:h,modifiedUvs:r}=Ut({size:e,dpr:g.shader,geometry:d,positions:a,uvs:m,mapArray:s,uniforms:u,onBeforeCompile:c}),{points:f,interactiveMesh:l}=It({scene:t,geometry:d,material:b}),p=A(b),x=V(b);return[v.useCallback((y,M,_)=>{y&&p("uTime",(M==null?void 0:M.beat)||y.clock.getElapsedTime()),M!==void 0&&(p("uMorphProgress",M.morphProgress),p("uBlurAlpha",M.blurAlpha),p("uBlurRadius",M.blurRadius),p("uPointSize",M.pointSize),p("uPointAlpha",M.pointAlpha),M.picture?(p("uPicture",M.picture),p("uIsPicture",!0)):M.picture===!1&&p("uIsPicture",!1),M.alphaPicture?(p("uAlphaPicture",M.alphaPicture),p("uIsAlphaPicture",!0)):M.alphaPicture===!1&&p("uIsAlphaPicture",!1),p("uColor0",M.color0),p("uColor1",M.color1),p("uColor2",M.color2),p("uColor3",M.color3),M.map?(p("uMap",M.map),p("uIsMap",!0)):M.map===!1&&p("uIsMap",!1),M.alphaMap?(p("uAlphaMap",M.alphaMap),p("uIsAlphaMap",!0)):M.alphaMap===!1&&p("uIsAlphaMap",!1),p("uWobbleStrength",M.wobbleStrength),p("uWobblePositionFrequency",M.wobblePositionFrequency),p("uWobbleTimeFrequency",M.wobbleTimeFrequency),p("uWarpStrength",M.warpStrength),p("uWarpPositionFrequency",M.warpPositionFrequency),p("uWarpTimeFrequency",M.warpTimeFrequency),M.displacement?(p("uDisplacement",M.displacement),p("uIsDisplacement",!0)):M.displacement===!1&&p("uIsDisplacement",!1),p("uDisplacementIntensity",M.displacementIntensity),p("uDisplacementColorIntensity",M.displacementColorIntensity),p("uSizeRandomIntensity",M.sizeRandomIntensity),p("uSizeRandomTimeFrequency",M.sizeRandomTimeFrequency),p("uSizeRandomMin",M.sizeRandomMin),p("uSizeRandomMax",M.sizeRandomMax),p("uDivergence",M.divergence),p("uDivergencePoint",M.divergencePoint),x(_))},[p,x]),{points:f,interactiveMesh:l,positions:h,uvs:r}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new i.Vector3(0),beat:!1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:o,camera:a,geometry:m,positions:s,uvs:u,uniforms:c,onBeforeCompile:g})=>{const d=O(n),b=v.useMemo(()=>new i.Scene,[]),[h,{points:r,interactiveMesh:f,positions:l,uvs:p}]=Ve({scene:b,size:e,dpr:n,geometry:m,positions:s,uvs:u,uniforms:c,onBeforeCompile:g}),[x,S]=$({scene:b,camera:a,size:e,dpr:d.fbo,samples:t,isSizeUpdate:o,depthBuffer:!0}),y=v.useCallback((_,w,D)=>(h(_,w,D),S(_.gl)),[S,h]),M=v.useCallback((_,w)=>{h(null,_,w)},[h]);return[y,M,{scene:b,points:r,interactiveMesh:f,renderTarget:x,output:x.texture,positions:l,uvs:p}]};function Et(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},o=e.getIndex(),a=e.getAttribute("position"),m=o?o.count:a.count;let s=0;const u=Object.keys(e.attributes),c={},g={},d=[],b=["getX","getY","getZ","getW"];for(let l=0,p=u.length;l<p;l++){const x=u[l];c[x]=[];const S=e.morphAttributes[x];S&&(g[x]=new Array(S.length).fill(0).map(()=>[]))}const h=Math.log10(1/n),r=Math.pow(10,h);for(let l=0;l<m;l++){const p=o?o.getX(l):l;let x="";for(let S=0,y=u.length;S<y;S++){const M=u[S],_=e.getAttribute(M),w=_.itemSize;for(let D=0;D<w;D++)x+=`${~~(_[b[D]](p)*r)},`}if(x in t)d.push(t[x]);else{for(let S=0,y=u.length;S<y;S++){const M=u[S],_=e.getAttribute(M),w=e.morphAttributes[M],D=_.itemSize,U=c[M],F=g[M];for(let I=0;I<D;I++){const P=b[I];if(U.push(_[P](p)),w)for(let R=0,q=w.length;R<q;R++)F[R].push(w[R][P](p))}}t[x]=s,d.push(s),s++}}const f=e.clone();for(let l=0,p=u.length;l<p;l++){const x=u[l],S=e.getAttribute(x),y=new S.array.constructor(c[x]),M=new re.BufferAttribute(y,S.itemSize,S.normalized);if(f.setAttribute(x,M),x in g)for(let _=0;_<g[x].length;_++){const w=e.morphAttributes[x][_],D=new w.array.constructor(g[x][_]),U=new re.BufferAttribute(D,w.itemSize,w.normalized);f.morphAttributes[x][_]=U}}return f.setIndex(d),f}var Bt=`vec3 random3(vec3 c) {
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

for (float i = 0.0; i < uRefractionSamples; i ++) {
	vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
	
	transmissionR = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).r;
	transmissionG = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + randomCoords) / uRefractionSamples) , material.thickness + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).g;
	transmissionB = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + randomCoords) / uRefractionSamples), material.thickness + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).b;
	transmission.r += transmissionR;
	transmission.g += transmissionG;
	transmission.b += transmissionB;
}

transmission /= uRefractionSamples;

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
		void main() {
		`),n=n.replace("// #usf <getWobble>",`${Pe}`),n=n.replace("void main() {",`
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
		`),n},kt=({baseMaterial:e,materialParameters:n,onBeforeCompile:t,depthOnBeforeCompile:o,isCustomTransmission:a=!1,uniforms:m})=>{const{material:s,depthMaterial:u}=v.useMemo(()=>{const c=new(e||i.MeshPhysicalMaterial)(n||{});Object.assign(c.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:k.wobblePositionFrequency},uWobbleTimeFrequency:{value:k.wobbleTimeFrequency},uWobbleStrength:{value:k.wobbleStrength},uWarpPositionFrequency:{value:k.warpPositionFrequency},uWarpTimeFrequency:{value:k.warpTimeFrequency},uWarpStrength:{value:k.warpStrength},uIsWobbleMap:{value:!1},uWobbleMap:{value:T},uWobbleMapStrength:{value:k.wobbleMapStrength},uWobbleMapDistortion:{value:k.wobbleMapDistortion},uColor0:{value:k.color0},uColor1:{value:k.color1},uColor2:{value:k.color2},uColor3:{value:k.color3},uColorMix:{value:k.colorMix},uEdgeThreshold:{value:k.edgeThreshold},uEdgeColor:{value:k.edgeColor},uChromaticAberration:{value:k.chromaticAberration},uAnisotropicBlur:{value:k.anisotropicBlur},uDistortion:{value:k.distortion},uDistortionScale:{value:k.distortionScale},uTemporalDistortion:{value:k.temporalDistortion},uRefractionSamples:{value:k.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},...m}}),c.onBeforeCompile=(d,b)=>{Object.assign(d.uniforms,c.userData.uniforms),d.vertexShader=ze(d.vertexShader),d.fragmentShader=d.fragmentShader.replace("#include <color_fragment>",`
					#include <color_fragment>

					if (uEdgeThreshold > 0.0) {
						float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
						diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
					} else {
						diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
					}
				`),d.fragmentShader=d.fragmentShader.replace("void main() {",`
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				uniform float uEdgeThreshold;
				uniform vec3 uEdgeColor;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				uniform float uRefractionSamples;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				${Bt}

				varying float vWobble;
				varying vec2 vPosition;
				varying vec3 vEdgeNormal;
				varying vec3 vEdgeViewPosition;
				
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);
				`),c.type==="MeshPhysicalMaterial"&&a&&(d.fragmentShader=d.fragmentShader.replace("#include <transmission_pars_fragment>",`${Lt}`),d.fragmentShader=d.fragmentShader.replace("#include <transmission_fragment>",`${Wt}`)),t&&t(d,b)},c.needsUpdate=!0;const g=new i.MeshDepthMaterial({depthPacking:i.RGBADepthPacking});return g.onBeforeCompile=(d,b)=>{Object.assign(d.uniforms,c.userData.uniforms),d.vertexShader=ze(d.vertexShader),o&&o(d,b)},g.needsUpdate=!0,{material:c,depthMaterial:g}},[n,e,t,o,m,a]);return{material:s,depthMaterial:u}},Ue=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:o,materialParameters:a,onBeforeCompile:m,depthOnBeforeCompile:s,uniforms:u})=>{const c=v.useMemo(()=>{let p=n||new i.IcosahedronGeometry(2,20);return p=Et(p),p.computeTangents(),p},[n]),{material:g,depthMaterial:d}=kt({baseMaterial:o,materialParameters:a,onBeforeCompile:m,depthOnBeforeCompile:s,uniforms:u,isCustomTransmission:t}),b=B(e,c,g,i.Mesh),h=g.userData,r=A(h),f=V(h);return[v.useCallback((p,x,S)=>{p&&r("uTime",(x==null?void 0:x.beat)||p.clock.getElapsedTime()),x!==void 0&&(r("uWobbleStrength",x.wobbleStrength),r("uWobblePositionFrequency",x.wobblePositionFrequency),r("uWobbleTimeFrequency",x.wobbleTimeFrequency),r("uWarpStrength",x.warpStrength),r("uWarpPositionFrequency",x.warpPositionFrequency),r("uWarpTimeFrequency",x.warpTimeFrequency),x.wobbleMap?(r("uWobbleMap",x.wobbleMap),r("uIsWobbleMap",!0)):x.wobbleMap===!1&&r("uIsWobbleMap",!1),r("uWobbleMapStrength",x.wobbleMapStrength),r("uWobbleMapDistortion",x.wobbleMapDistortion),r("uColor0",x.color0),r("uColor1",x.color1),r("uColor2",x.color2),r("uColor3",x.color3),r("uColorMix",x.colorMix),r("uEdgeThreshold",x.edgeThreshold),r("uEdgeColor",x.edgeColor),r("uChromaticAberration",x.chromaticAberration),r("uAnisotropicBlur",x.anisotropicBlur),r("uDistortion",x.distortion),r("uDistortionScale",x.distortionScale),r("uRefractionSamples",x.refractionSamples),r("uTemporalDistortion",x.temporalDistortion),f(S))},[r,f]),{mesh:b,depthMaterial:d}]},k=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,wobbleMap:!1,wobbleMapStrength:.03,wobbleMapDistortion:0,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new i.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),$t=({size:e,dpr:n,samples:t,isSizeUpdate:o,camera:a,geometry:m,baseMaterial:s,materialParameters:u,uniforms:c,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:b})=>{const h=O(n),r=v.useMemo(()=>new i.Scene,[]),[f,{mesh:l,depthMaterial:p}]=Ue({baseMaterial:s,materialParameters:u,scene:r,geometry:m,uniforms:c,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:b}),[x,S]=$({scene:r,camera:a,size:e,dpr:h.fbo,samples:t,isSizeUpdate:o,depthBuffer:!0}),y=v.useCallback((_,w,D)=>(f(_,w,D),S(_.gl)),[S,f]),M=v.useCallback((_,w)=>{f(null,_,w)},[f]);return[y,M,{scene:r,mesh:l,depthMaterial:p,renderTarget:x,output:x.texture}]},jt=(e,n,t)=>{const o=v.useMemo(()=>{const a=new i.Mesh(n,t);return e.add(a),a},[n,t,e]);return v.useEffect(()=>()=>{e.remove(o),n.dispose(),t.dispose()},[e,n,t,o]),o},pe=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-pe.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-pe.easeOutBounce(1-2*e))/2:(1+pe.easeOutBounce(2*e-1))/2}});function qt(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const Nt=(e,n="easeOutQuart")=>{const t=e/60,o=pe[n];return v.useCallback(m=>{let s=m.getElapsedTime()*t;const u=Math.floor(s),c=o(s-u);s=c+u;const g=qt(u);return{beat:s,floor:u,fract:c,hash:g}},[t,o])},Gt=(e=60)=>{const n=v.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=v.useRef(null);return v.useCallback(a=>{const m=a.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},Kt=e=>{var o,a;const n=(o=e.dom)==null?void 0:o.length,t=(a=e.texture)==null?void 0:a.length;return!n||!t||n!==t};var Xt=`varying vec2 vUv;

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
}`;const Yt=({params:e,scene:n,uniforms:t,onBeforeCompile:o})=>{n.children.length>0&&(n.children.forEach(a=>{a instanceof i.Mesh&&(a.geometry.dispose(),a.material.dispose())}),n.remove(...n.children)),e.texture.forEach((a,m)=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:a},u_textureResolution:{value:new i.Vector2(0,0)},u_resolution:{value:new i.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[m]?e.boderRadius[m]:0},...t},vertexShader:Xt,fragmentShader:Ht,...z,transparent:!0});o&&(s.onBeforeCompile=o);const u=new i.Mesh(new i.PlaneGeometry(1,1),s);n.add(u)})},Qt=()=>{const e=v.useRef([]),n=v.useRef([]);return v.useCallback(({isIntersectingRef:o,isIntersectingOnceRef:a,params:m})=>{e.current.length>0&&e.current.forEach((u,c)=>{u.unobserve(n.current[c])}),n.current=[],e.current=[];const s=new Array(m.dom.length).fill(!1);o.current=[...s],a.current=[...s],m.dom.forEach((u,c)=>{const g=b=>{b.forEach(h=>{m.onIntersect[c]&&m.onIntersect[c](h),o.current[c]=h.isIntersecting})},d=new IntersectionObserver(g,{rootMargin:"0px",threshold:0});d.observe(u),e.current.push(d),n.current.push(u)})},[])},Zt=()=>{const e=v.useRef([]),n=v.useCallback(({params:t,customParams:o,size:a,resolutionRef:m,scene:s,isIntersectingRef:u})=>{s.children.length!==e.current.length&&(e.current=new Array(s.children.length)),s.children.forEach((c,g)=>{var h,r,f,l,p,x;const d=t.dom[g];if(!d)return;const b=d.getBoundingClientRect();if(e.current[g]=b,c.scale.set(b.width,b.height,1),c.position.set(b.left+b.width*.5-a.width*.5,-b.top-b.height*.5+a.height*.5,0),u.current[g]&&(t.rotation[g]&&c.rotation.copy(t.rotation[g]),c instanceof i.Mesh)){const S=c.material,y=A(S),M=V(S);y("u_texture",t.texture[g]),y("u_textureResolution",[((f=(r=(h=t.texture[g])==null?void 0:h.source)==null?void 0:r.data)==null?void 0:f.width)||0,((x=(p=(l=t.texture[g])==null?void 0:l.source)==null?void 0:p.data)==null?void 0:x.height)||0]),y("u_resolution",m.current.set(b.width,b.height)),y("u_borderRadius",t.boderRadius[g]?t.boderRadius[g]:0),M(o)}})},[]);return[e.current,n]},Jt=()=>{const e=v.useRef([]),n=v.useRef([]),t=v.useCallback((o,a=!1)=>{e.current.forEach((s,u)=>{s&&(n.current[u]=!0)});const m=a?[...n.current]:[...e.current];return o<0?m:m[o]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},eo=e=>({onView:t,onHidden:o})=>{const a=v.useRef(!1);v.useEffect(()=>{let m;const s=()=>{e.current.some(u=>u)?a.current||(t&&t(),a.current=!0):a.current&&(o&&o(),a.current=!1),m=requestAnimationFrame(s)};return m=requestAnimationFrame(s),()=>{cancelAnimationFrame(m)}},[t,o])},Oe={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},no=({size:e,dpr:n,samples:t,isSizeUpdate:o,uniforms:a,onBeforeCompile:m},s=[])=>{const u=O(n),c=v.useMemo(()=>new i.Scene,[]),g=L(e),[d,b]=$({scene:c,camera:g,size:e,dpr:u.fbo,samples:t,isSizeUpdate:o}),[h,r]=W({...Oe,updateKey:performance.now()}),[f,l]=Zt(),p=v.useRef(new i.Vector2(0,0)),[x,S]=v.useState(!0);v.useMemo(()=>S(!0),s);const y=v.useRef(null),M=v.useMemo(()=>T,[]),_=Qt(),{isIntersectingOnceRef:w,isIntersectingRef:D,isIntersecting:U}=Jt(),F=eo(D);return[v.useCallback((P,R,q)=>{const{gl:oe,size:H}=P;if(R&&r(R),Kt(h))return M;if(x){if(y.current===h.updateKey)return M;y.current=h.updateKey}return x&&(Yt({params:h,size:H,scene:c,uniforms:a,onBeforeCompile:m}),_({isIntersectingRef:D,isIntersectingOnceRef:w,params:h}),S(!1)),l({params:h,customParams:q,size:H,resolutionRef:p,scene:c,isIntersectingRef:D}),b(oe)},[b,a,r,_,l,m,x,c,h,w,D,M]),r,{scene:c,camera:g,renderTarget:d,output:d.texture,isIntersecting:U,DOMRects:f,intersections:D.current,useDomView:F}]},to=({scene:e,camera:n,size:t,dpr:o=!1,isSizeUpdate:a=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1},c)=>{const g=v.useRef([]),d=N(t,o);g.current=v.useMemo(()=>Array.from({length:c},()=>{const h=new i.WebGLRenderTarget(d.x,d.y,{...ce,samples:m,depthBuffer:s});return u&&(h.depthTexture=new i.DepthTexture(d.x,d.y,i.FloatType)),h}),[c]),a&&g.current.forEach(h=>h.setSize(d.x,d.y)),v.useEffect(()=>{const h=g.current;return()=>{h.forEach(r=>r.dispose())}},[c]);const b=v.useCallback((h,r,f)=>{const l=g.current[r];return ge({gl:h,scene:e,camera:n,fbo:l,onBeforeRender:()=>f&&f({read:l.texture})}),l.texture},[e,n]);return[g.current,b]};C.ALPHABLENDING_PARAMS=De,C.BLANK_PARAMS=Ae,C.BLENDING_PARAMS=ie,C.BRIGHTNESSPICKER_PARAMS=ve,C.BRUSH_PARAMS=Y,C.CHROMAKEY_PARAMS=X,C.COLORSTRATA_PARAMS=K,C.COSPALETTE_PARAMS=ae,C.COVERTEXTURE_PARAMS=Re,C.DOMSYNCER_PARAMS=Oe,C.DUOTONE_PARAMS=he,C.Easing=pe,C.FBO_OPTION=ce,C.FLUID_PARAMS=Te,C.FXBLENDING_PARAMS=Me,C.FXTEXTURE_PARAMS=ee,C.HSV_PARAMS=xe,C.MARBLE_PARAMS=te,C.MORPHPARTICLES_PARAMS=E,C.MOTIONBLUR_PARAMS=me,C.NOISE_PARAMS=J,C.RIPPLE_PARAMS=we,C.SIMPLEBLUR_PARAMS=ye,C.WAVE_PARAMS=ue,C.WOBBLE3D_PARAMS=k,C.renderFBO=ge,C.setCustomUniform=V,C.setUniform=A,C.useAddMesh=jt,C.useAlphaBlending=tt,C.useBeat=Nt,C.useBlank=Pt,C.useBlending=Wn,C.useBrightnessPicker=Xn,C.useBrush=Ne,C.useCamera=L,C.useChromaKey=wt,C.useColorStrata=Cn,C.useCopyTexture=to,C.useCosPalette=Fn,C.useCoverTexture=ct,C.useCreateMorphParticles=Ve,C.useCreateWobble3D=Ue,C.useDomSyncer=no,C.useDoubleFBO=ne,C.useDuoTone=On,C.useFPSLimiter=Gt,C.useFluid=mn,C.useFxBlending=Zn,C.useFxTexture=qn,C.useHSV=it,C.useMarble=Rn,C.useMorphParticles=Ot,C.useMotionBlur=xt,C.useNoise=Mn,C.useParams=W,C.usePointer=de,C.useResolution=N,C.useRipple=gn,C.useSimpleBlur=ft,C.useSingleFBO=$,C.useWave=St,C.useWobble3D=$t,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
