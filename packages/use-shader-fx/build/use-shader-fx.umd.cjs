(function(C,oe){typeof exports=="object"&&typeof module<"u"?oe(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],oe):(C=typeof globalThis<"u"?globalThis:C||self,oe(C["use-shader-fx"]={},C.THREE,C.React))})(this,function(C,oe,v){"use strict";function ke(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const i=ke(oe);var $e=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,We=`precision highp float;

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
}`;const N=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return v.useMemo(()=>new i.Vector2(t,r),[t,r])},A=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},B=(e,n,t,r)=>{const o=v.useMemo(()=>{const m=new r(n,t);return e&&e.add(m),m},[n,t,r,e]);return v.useEffect(()=>()=>{e&&e.remove(o),n.dispose(),t.dispose()},[e,n,t,o]),o},Ce=process.env.NODE_ENV==="development",z={transparent:!1,depthTest:!1,depthWrite:!1},T=new i.DataTexture(new Uint8Array([0,0,0,0]),1,1,i.RGBAFormat),je=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uBuffer:{value:T},uResolution:{value:new i.Vector2(0,0)},uTexture:{value:T},uIsTexture:{value:!1},uMap:{value:T},uIsMap:{value:!1},uMapIntensity:{value:Y.mapIntensity},uRadius:{value:Y.radius},uSmudge:{value:Y.smudge},uDissipation:{value:Y.dissipation},uMotionBlur:{value:Y.motionBlur},uMotionSample:{value:Y.motionSample},uMouse:{value:new i.Vector2(-10,-10)},uPrevMouse:{value:new i.Vector2(-10,-10)},uVelocity:{value:new i.Vector2(0,0)},uColor:{value:Y.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1},...r},vertexShader:$e,fragmentShader:We,...z,transparent:!0});return o&&(g.onBeforeCompile=o),g},[o,r]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},qe=(e,n)=>{const t=n,r=e/n,[o,m]=[t*r/2,t/2];return{width:o,height:m,near:-1e3,far:1e3}},L=(e,n="OrthographicCamera")=>{const t=N(e),{width:r,height:o,near:m,far:s}=qe(t.x,t.y);return v.useMemo(()=>n==="OrthographicCamera"?new i.OrthographicCamera(-r,r,o,-o,m,s):new i.PerspectiveCamera(50,r/o),[r,o,m,s,n])},de=(e=0)=>{const n=v.useRef(new i.Vector2(0,0)),t=v.useRef(new i.Vector2(0,0)),r=v.useRef(new i.Vector2(0,0)),o=v.useRef(0),m=v.useRef(new i.Vector2(0,0)),s=v.useRef(!1);return v.useCallback(c=>{const g=performance.now();let d;s.current&&e?(r.current=r.current.lerp(c,1-e),d=r.current.clone()):(d=c.clone(),r.current=d),o.current===0&&(o.current=g,n.current=d);const x=Math.max(1,g-o.current);o.current=g,m.current.copy(d).sub(n.current).divideScalar(x);const h=m.current.length()>0,a=s.current?n.current.clone():d;return!s.current&&h&&(s.current=!0),n.current=d,{currentPointer:d,prevPointer:a,diffPointer:t.current.subVectors(d,a),velocity:m.current,isVelocityUpdate:h}},[e])},k=e=>{const n=o=>Object.values(o).some(m=>typeof m=="function"),t=v.useRef(n(e)?e:structuredClone(e)),r=v.useCallback(o=>{for(const m in o){const s=m;s in t.current&&o[s]!==void 0&&o[s]!==null?t.current[s]=o[s]:console.error(`"${String(s)}" does not exist in the params. or "${String(s)}" is null | undefined`)}},[]);return[t.current,r]},ce={minFilter:i.LinearFilter,magFilter:i.LinearFilter,type:i.HalfFloatType,stencilBuffer:!1},ge=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:o,onSwap:m})=>{e.setRenderTarget(n),o(),e.clear(),e.render(t,r),m&&m(),e.setRenderTarget(null),e.clear()},$=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1})=>{var x;const c=v.useRef(),g=N(t,r);c.current=v.useMemo(()=>{const h=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s});return u&&(h.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),h},[]),o&&((x=c.current)==null||x.setSize(g.x,g.y)),v.useEffect(()=>{const h=c.current;return()=>{h==null||h.dispose()}},[]);const d=v.useCallback((h,a)=>{const f=c.current;return ge({gl:h,fbo:f,scene:e,camera:n,onBeforeRender:()=>a&&a({read:f.texture})}),f.texture},[e,n]);return[c.current,d]},ne=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1})=>{var h,a;const c=v.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),g=N(t,r),d=v.useMemo(()=>{const f=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s}),l=new i.WebGLRenderTarget(g.x,g.y,{...ce,samples:m,depthBuffer:s});return u&&(f.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType),l.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),{read:f,write:l}},[]);c.current.read=d.read,c.current.write=d.write,o&&((h=c.current.read)==null||h.setSize(g.x,g.y),(a=c.current.write)==null||a.setSize(g.x,g.y)),v.useEffect(()=>{const f=c.current;return()=>{var l,p;(l=f.read)==null||l.dispose(),(p=f.write)==null||p.dispose()}},[]);const x=v.useCallback((f,l)=>{var y;const p=c.current;return ge({gl:f,scene:e,camera:n,fbo:p.write,onBeforeRender:()=>l&&l({read:p.read.texture,write:p.write.texture}),onSwap:()=>p.swap()}),(y=p.read)==null?void 0:y.texture},[e,n]);return[{read:c.current.read,write:c.current.write},x]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Y=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new i.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ne=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=je({scene:u,size:e,dpr:s.shader,uniforms:o,onBeforeCompile:m}),d=L(e),x=de(),[h,a]=ne({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[f,l]=k(Y),p=v.useRef(null),y=A(c),S=V(c);return[v.useCallback((M,_,w)=>{const{gl:R,pointer:U}=M;_&&l(_),f.texture?(y("uIsTexture",!0),y("uTexture",f.texture)):y("uIsTexture",!1),f.map?(y("uIsMap",!0),y("uMap",f.map),y("uMapIntensity",f.mapIntensity)):y("uIsMap",!1),y("uRadius",f.radius),y("uSmudge",f.smudge),y("uDissipation",f.dissipation),y("uMotionBlur",f.motionBlur),y("uMotionSample",f.motionSample);const F=f.pointerValues||x(U);F.isVelocityUpdate&&(y("uMouse",F.currentPointer),y("uPrevMouse",F.prevPointer)),y("uVelocity",F.velocity);const I=typeof f.color=="function"?f.color(F.velocity):f.color;return y("uColor",I),y("uIsCursor",f.isCursor),y("uPressureEnd",f.pressure),p.current===null&&(p.current=f.pressure),y("uPressureStart",p.current),p.current=f.pressure,S(w),a(R,({read:P})=>{y("uBuffer",P)})},[y,x,a,f,l,S]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var Q=`varying vec2 vUv;
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
}`;const Ke=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:n,vertexShader:Q,fragmentShader:Ge,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var Xe=`precision highp float;

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
}`;const He=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:T},uSource:{value:T},texelSize:{value:new i.Vector2},dt:{value:0},dissipation:{value:0},...n},vertexShader:Q,fragmentShader:Xe,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var Ye=`precision highp float;

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
}`;const Qe=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:Ye,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var Ze=`precision highp float;

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
}`;const Je=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:Ze,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var en=`precision highp float;

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
}`;const nn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:en,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var tn=`precision highp float;

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
}`;const rn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:tn,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var on=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const an=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uTexture:{value:T},value:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:on,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var un=`precision highp float;

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
}`;const sn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uPressure:{value:T},uVelocity:{value:T},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:un,...z});return e&&(r.onBeforeCompile=e),r},[e,n]);var ln=`precision highp float;

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
}`;const cn=({onBeforeCompile:e,uniforms:n})=>v.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uTarget:{value:T},aspectRatio:{value:0},color:{value:new i.Vector3},point:{value:new i.Vector2},radius:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Q,fragmentShader:ln,...z});return e&&(r.onBeforeCompile=e),r},[e,n]),Z=(e,n)=>{const t=n==null?void 0:n.onBeforeCompile;return e({onBeforeCompile:t})},vn=({scene:e,size:n,dpr:t,fluidOnBeforeCompile:r})=>{const o=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),{curl:m,vorticity:s,advection:u,divergence:c,pressure:g,clear:d,gradientSubtract:x,splat:h}=r??{},a=Z(Ke),f=a.clone(),l=Z(nn,m),p=Z(rn,s),y=Z(He,u),S=Z(Qe,c),b=Z(Je,g),M=Z(an,d),_=Z(sn,x),w=Z(cn,h),R=v.useMemo(()=>({vorticityMaterial:p,curlMaterial:l,advectionMaterial:y,divergenceMaterial:S,pressureMaterial:b,clearMaterial:M,gradientSubtractMaterial:_,splatMaterial:w}),[p,l,y,S,b,M,_,w]),U=N(n,t);v.useMemo(()=>{A(R.splatMaterial)("aspectRatio",U.x/U.y);for(const P of Object.values(R))A(P)("texelSize",new i.Vector2(1/U.x,1/U.y))},[U,R]);const F=B(e,o,a,i.Mesh);v.useMemo(()=>{a.dispose(),F.material=f},[a,F,f]),v.useEffect(()=>()=>{for(const P of Object.values(R))P.dispose()},[R]);const I=v.useCallback(P=>{F.material=P,F.material.needsUpdate=!0},[F]);return{materials:R,setMeshMaterial:I,mesh:F}},Te=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new i.Vector3(1,1,1),pointerValues:!1}),mn=({size:e,dpr:n,samples:t,isSizeUpdate:r,fluidOnBeforeCompile:o})=>{const m=O(n),s=v.useMemo(()=>new i.Scene,[]),{materials:u,setMeshMaterial:c,mesh:g}=vn({scene:s,size:e,dpr:m.shader,fluidOnBeforeCompile:o}),d=L(e),x=de(),h=v.useMemo(()=>({scene:s,camera:d,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[s,d,e,t,m.fbo,r]),[a,f]=ne(h),[l,p]=ne(h),[y,S]=$(h),[b,M]=$(h),[_,w]=ne(h),R=v.useRef(0),U=v.useRef(new i.Vector2(0,0)),F=v.useRef(new i.Vector3(0,0,0)),[I,P]=k(Te),D=v.useMemo(()=>({advection:A(u.advectionMaterial),splat:A(u.splatMaterial),curl:A(u.curlMaterial),vorticity:A(u.vorticityMaterial),divergence:A(u.divergenceMaterial),clear:A(u.clearMaterial),pressure:A(u.pressureMaterial),gradientSubtract:A(u.gradientSubtractMaterial)}),[u]),q=v.useMemo(()=>({advection:V(u.advectionMaterial),splat:V(u.splatMaterial),curl:V(u.curlMaterial),vorticity:V(u.vorticityMaterial),divergence:V(u.divergenceMaterial),clear:V(u.clearMaterial),pressure:V(u.pressureMaterial),gradientSubtract:V(u.gradientSubtractMaterial)}),[u]);return[v.useCallback((H,fe,se)=>{const{gl:G,pointer:rr,clock:Se,size:Ee}=H;fe&&P(fe),R.current===0&&(R.current=Se.getElapsedTime());const Be=Math.min((Se.getElapsedTime()-R.current)/3,.02);R.current=Se.getElapsedTime();const _e=f(G,({read:j})=>{c(u.advectionMaterial),D.advection("uVelocity",j),D.advection("uSource",j),D.advection("dt",Be),D.advection("dissipation",I.velocity_dissipation)}),or=p(G,({read:j})=>{c(u.advectionMaterial),D.advection("uVelocity",_e),D.advection("uSource",j),D.advection("dissipation",I.density_dissipation)}),ye=I.pointerValues||x(rr);ye.isVelocityUpdate&&(f(G,({read:j})=>{c(u.splatMaterial),D.splat("uTarget",j),D.splat("point",ye.currentPointer);const le=ye.diffPointer.multiply(U.current.set(Ee.width,Ee.height).multiplyScalar(I.velocity_acceleration));D.splat("color",F.current.set(le.x,le.y,1)),D.splat("radius",I.splat_radius)}),p(G,({read:j})=>{c(u.splatMaterial),D.splat("uTarget",j);const le=typeof I.fluid_color=="function"?I.fluid_color(ye.velocity):I.fluid_color;D.splat("color",le)}));const ar=S(G,()=>{c(u.curlMaterial),D.curl("uVelocity",_e)});f(G,({read:j})=>{c(u.vorticityMaterial),D.vorticity("uVelocity",j),D.vorticity("uCurl",ar),D.vorticity("curl",I.curl_strength),D.vorticity("dt",Be)});const ir=M(G,()=>{c(u.divergenceMaterial),D.divergence("uVelocity",_e)});w(G,({read:j})=>{c(u.clearMaterial),D.clear("uTexture",j),D.clear("value",I.pressure_dissipation)}),c(u.pressureMaterial),D.pressure("uDivergence",ir);let Le;for(let j=0;j<I.pressure_iterations;j++)Le=w(G,({read:le})=>{D.pressure("uPressure",le)});return f(G,({read:j})=>{c(u.gradientSubtractMaterial),D.gradientSubtract("uPressure",Le),D.gradientSubtract("uVelocity",j)}),se&&Object.keys(se).forEach(j=>{q[j](se[j])}),or},[u,D,c,S,p,M,x,w,f,q,P,I]),P,{scene:s,mesh:g,materials:u,camera:d,renderTarget:{velocity:a,density:l,curl:y,divergence:b,pressure:_},output:l.read.texture}]};var pn=`varying vec2 vUv;

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
}`;const dn=({scale:e,max:n,texture:t,scene:r,uniforms:o,onBeforeCompile:m})=>{const s=v.useMemo(()=>new i.PlaneGeometry(e,e),[e]),u=v.useMemo(()=>new i.ShaderMaterial({uniforms:{uOpacity:{value:0},uMap:{value:t||T},...o},blending:i.AdditiveBlending,vertexShader:pn,fragmentShader:fn,...z,transparent:!0}),[t,o]),c=v.useMemo(()=>{const g=[];for(let d=0;d<n;d++){const x=u.clone();m&&(x.onBeforeCompile=m);const h=new i.Mesh(s.clone(),x);h.rotateZ(2*Math.PI*Math.random()),h.visible=!1,r.add(h),g.push(h)}return g},[m,s,u,r,n]);return v.useEffect(()=>()=>{c.forEach(g=>{g.geometry.dispose(),Array.isArray(g.material)?g.material.forEach(d=>d.dispose()):g.material.dispose(),r.remove(g)})},[r,c]),c},we=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),gn=({texture:e,scale:n=64,max:t=100,size:r,dpr:o,samples:m,isSizeUpdate:s,uniforms:u,onBeforeCompile:c})=>{const g=O(o),d=v.useMemo(()=>new i.Scene,[]),x=dn({scale:n,max:t,texture:e,scene:d,uniforms:u,onBeforeCompile:c}),h=L(r),a=de(),[f,l]=$({scene:d,camera:h,size:r,dpr:g.fbo,samples:m,isSizeUpdate:s}),[p,y]=k(we),S=v.useRef(0);return[v.useCallback((M,_,w)=>{const{gl:R,pointer:U,size:F}=M;_&&y(_);const I=p.pointerValues||a(U);if(p.frequency<I.diffPointer.length()){const P=x[S.current],D=P.material;P.visible=!0,P.position.set(I.currentPointer.x*(F.width/2),I.currentPointer.y*(F.height/2),0),P.scale.x=P.scale.y=0,A(D)("uOpacity",p.alpha),S.current=(S.current+1)%t}return x.forEach(P=>{if(P.visible){const D=P.material;P.rotation.z+=p.rotation,P.scale.x=p.fadeout_speed*P.scale.x+p.scale,P.scale.y=P.scale.x;const q=D.uniforms.uOpacity.value;A(D)("uOpacity",q*p.fadeout_speed),q<.001&&(P.visible=!1),V(D)(w)}}),l(R)},[l,x,a,t,p,y]),y,{scene:d,camera:h,meshArr:x,renderTarget:f,output:f.texture}]};var hn=`varying vec2 vUv;

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
}`;const yn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:J.scale},timeStrength:{value:J.timeStrength},noiseOctaves:{value:J.noiseOctaves},fbmOctaves:{value:J.fbmOctaves},warpOctaves:{value:J.warpOctaves},warpDirection:{value:J.warpDirection},warpStrength:{value:J.warpStrength},...n},vertexShader:hn,fragmentShader:xn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},J=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new i.Vector2(2,2),warpStrength:8,beat:!1}),Mn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=yn({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(J),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_,clock:w}=S;return b&&f(b),l("scale",a.scale),l("timeStrength",a.timeStrength),l("noiseOctaves",a.noiseOctaves),l("fbmOctaves",a.fbmOctaves),l("warpOctaves",a.warpOctaves),l("warpDirection",a.warpDirection),l("warpStrength",a.warpStrength),l("uTime",a.beat||w.getElapsedTime()),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var bn=`varying vec2 vUv;

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
}`;const _n=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},isTexture:{value:!1},scale:{value:K.scale},noise:{value:T},noiseStrength:{value:K.noiseStrength},isNoise:{value:!1},laminateLayer:{value:K.laminateLayer},laminateInterval:{value:K.laminateInterval},laminateDetail:{value:K.laminateDetail},distortion:{value:K.distortion},colorFactor:{value:K.colorFactor},uTime:{value:0},timeStrength:{value:K.timeStrength},...n},vertexShader:bn,fragmentShader:Sn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},K=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new i.Vector2(.1,.1),laminateDetail:new i.Vector2(1,1),distortion:new i.Vector2(0,0),colorFactor:new i.Vector3(1,1,1),timeStrength:new i.Vector2(0,0),noise:!1,noiseStrength:new i.Vector2(0,0),beat:!1}),Cn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=_n({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(K),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_,clock:w}=S;return b&&f(b),a.texture?(l("uTexture",a.texture),l("isTexture",!0)):(l("isTexture",!1),l("scale",a.scale)),a.noise?(l("noise",a.noise),l("isNoise",!0),l("noiseStrength",a.noiseStrength)):l("isNoise",!1),l("uTime",a.beat||w.getElapsedTime()),l("laminateLayer",a.laminateLayer),l("laminateInterval",a.laminateInterval),l("laminateDetail",a.laminateDetail),l("distortion",a.distortion),l("colorFactor",a.colorFactor),l("timeStrength",a.timeStrength),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Tn=`varying vec2 vUv;

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
}`;const Rn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:te.pattern},u_complexity:{value:te.complexity},u_complexityAttenuation:{value:te.complexityAttenuation},u_iterations:{value:te.iterations},u_timeStrength:{value:te.timeStrength},u_scale:{value:te.scale},...n},vertexShader:Tn,fragmentShader:wn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},te=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Dn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Rn({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(te),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_,clock:w}=S;return b&&f(b),l("u_pattern",a.pattern),l("u_complexity",a.complexity),l("u_complexityAttenuation",a.complexityAttenuation),l("u_iterations",a.iterations),l("u_timeStrength",a.timeStrength),l("u_scale",a.scale),l("u_time",a.beat||w.getElapsedTime()),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var An=`varying vec2 vUv;

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
}`;const In=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uRgbWeight:{value:ae.rgbWeight},uColor1:{value:ae.color1},uColor2:{value:ae.color2},uColor3:{value:ae.color3},uColor4:{value:ae.color4},...n},vertexShader:An,fragmentShader:Pn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ae=Object.freeze({texture:T,color1:new i.Color().set(.5,.5,.5),color2:new i.Color().set(.5,.5,.5),color3:new i.Color().set(1,1,1),color4:new i.Color().set(0,.1,.2),rgbWeight:new i.Vector3(.299,.587,.114)}),Fn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=In({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(ae),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("uTexture",a.texture),l("uColor1",a.color1),l("uColor2",a.color2),l("uColor3",a.color3),l("uColor4",a.color4),l("uRgbWeight",a.rgbWeight),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Vn=`varying vec2 vUv;

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
}`;const Un=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uColor0:{value:he.color0},uColor1:{value:he.color1},...n},vertexShader:Vn,fragmentShader:zn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},he=Object.freeze({texture:T,color0:new i.Color(16777215),color1:new i.Color(0)}),On=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Un({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(he),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("uTexture",a.texture),l("uColor0",a.color0),l("uColor1",a.color1),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var En=`varying vec2 vUv;

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
}`;const Ln=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_alphaMap:{value:T},u_isAlphaMap:{value:!1},u_mapIntensity:{value:ie.mapIntensity},u_brightness:{value:ie.brightness},u_min:{value:ie.min},u_max:{value:ie.max},u_dodgeColor:{value:ie.dodgeColor},u_isDodgeColor:{value:!1},...n},vertexShader:En,fragmentShader:Bn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ie=Object.freeze({texture:T,map:T,alphaMap:!1,mapIntensity:.3,brightness:new i.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),kn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Ln({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(ie),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("u_texture",a.texture),l("u_map",a.map),l("u_mapIntensity",a.mapIntensity),a.alphaMap?(l("u_alphaMap",a.alphaMap),l("u_isAlphaMap",!0)):l("u_isAlphaMap",!1),l("u_brightness",a.brightness),l("u_min",a.min),l("u_max",a.max),a.dodgeColor?(l("u_dodgeColor",a.dodgeColor),l("u_isDodgeColor",!0)):l("u_isDodgeColor",!1),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var $n=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Wn=`precision highp float;

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

}`;const jn=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{var d,x;const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture0:{value:T},uTexture1:{value:T},padding:{value:ee.padding},uMap:{value:T},edgeIntensity:{value:ee.edgeIntensity},mapIntensity:{value:ee.mapIntensity},epicenter:{value:ee.epicenter},progress:{value:ee.progress},dirX:{value:(d=ee.dir)==null?void 0:d.x},dirY:{value:(x=ee.dir)==null?void 0:x.y},...r},vertexShader:$n,fragmentShader:Wn,...z});return o&&(g.onBeforeCompile=o),g},[o,r]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},ee=Object.freeze({texture0:T,texture1:T,padding:0,map:T,mapIntensity:0,edgeIntensity:0,epicenter:new i.Vector2(0,0),progress:0,dir:new i.Vector2(0,0)}),qn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=jn({scene:u,size:e,dpr:s.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,dpr:s.fbo,size:e,samples:t,isSizeUpdate:r}),[a,f]=k(ee),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{var F,I,P,D,q,re,H,fe;const{gl:_}=S;b&&f(b),l("uTexture0",a.texture0),l("uTexture1",a.texture1),l("progress",a.progress);const w=[((I=(F=a.texture0)==null?void 0:F.image)==null?void 0:I.width)||0,((D=(P=a.texture0)==null?void 0:P.image)==null?void 0:D.height)||0],R=[((re=(q=a.texture1)==null?void 0:q.image)==null?void 0:re.width)||0,((fe=(H=a.texture1)==null?void 0:H.image)==null?void 0:fe.height)||0],U=w.map((se,G)=>se+(R[G]-se)*a.progress);return l("uTextureResolution",U),l("padding",a.padding),l("uMap",a.map),l("mapIntensity",a.mapIntensity),l("edgeIntensity",a.edgeIntensity),l("epicenter",a.epicenter),l("dirX",a.dir.x),l("dirY",a.dir.y),p(M),h(_)},[h,l,a,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Nn=`varying vec2 vUv;

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
}`;const Kn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:ve.brightness},u_min:{value:ve.min},u_max:{value:ve.max},...n},vertexShader:Nn,fragmentShader:Gn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ve=Object.freeze({texture:T,brightness:new i.Vector3(.5,.5,.5),min:0,max:1}),Xn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Kn({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(ve),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("u_texture",a.texture),l("u_brightness",a.brightness),l("u_min",a.min),l("u_max",a.max),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Hn=`varying vec2 vUv;

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
}`;const Qn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_map:{value:T},u_mapIntensity:{value:Me.mapIntensity},...n},vertexShader:Hn,fragmentShader:Yn,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},Me=Object.freeze({texture:T,map:T,mapIntensity:.3}),Zn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Qn({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(Me),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("u_texture",a.texture),l("u_map",a.map),l("u_mapIntensity",a.mapIntensity),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Jn=`varying vec2 vUv;

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
}`;const nt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uMap:{value:T},...n},vertexShader:Jn,fragmentShader:et,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},Re=Object.freeze({texture:T,map:T}),tt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=nt({scene:u,size:e,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(Re),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("uTexture",a.texture),l("uMap",a.map),p(M),h(_)},[l,h,a,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var rt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ot=`precision highp float;

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
}`;const at=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_brightness:{value:xe.brightness},u_saturation:{value:xe.saturation},...n},vertexShader:rt,fragmentShader:ot,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},xe=Object.freeze({texture:T,brightness:1,saturation:1}),it=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=at({scene:u,size:e,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(xe),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("u_texture",a.texture),l("u_brightness",a.brightness),l("u_saturation",a.saturation),p(M),h(_)},[l,h,a,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var ut=`varying vec2 vUv;

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

}`;const lt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture:{value:T},...r},vertexShader:ut,fragmentShader:st,...z});return o&&(g.onBeforeCompile=o),g},[o,r]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},De=Object.freeze({texture:T}),ct=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=lt({scene:u,size:e,dpr:s.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,dpr:s.fbo,size:e,samples:t,isSizeUpdate:r}),[a,f]=k(De),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{var w,R,U,F,I,P;const{gl:_}=S;return b&&f(b),l("uTexture",a.texture),l("uTextureResolution",[((U=(R=(w=a.texture)==null?void 0:w.source)==null?void 0:R.data)==null?void 0:U.width)||0,((P=(I=(F=a.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.height)||0]),p(M),h(_)},[h,l,a,f,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var vt=`precision highp float;

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
}`;const pt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uResolution:{value:new i.Vector2(0,0)},uBlurSize:{value:be.blurSize},...n},vertexShader:vt,fragmentShader:mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},be=Object.freeze({texture:T,blurSize:3,blurPower:5}),ft=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=pt({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),x=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[u,d,e,s.fbo,t,r]),[h,a]=ne(x),[f,l]=k(be),p=A(c),y=V(c);return[v.useCallback((b,M,_)=>{var F,I,P,D,q,re;const{gl:w}=b;M&&l(M),p("uTexture",f.texture),p("uResolution",[((P=(I=(F=f.texture)==null?void 0:F.source)==null?void 0:I.data)==null?void 0:P.width)||0,((re=(q=(D=f.texture)==null?void 0:D.source)==null?void 0:q.data)==null?void 0:re.height)||0]),p("uBlurSize",f.blurSize);let R=a(w);const U=f.blurPower;for(let H=0;H<U;H++)p("uTexture",R),R=a(w);return y(_),R},[a,p,l,f,y]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var dt=`precision highp float;

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
}`;const ht=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uBegin:{value:me.begin},uEnd:{value:me.end},uStrength:{value:me.strength},...n},vertexShader:dt,fragmentShader:gt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},me=Object.freeze({texture:T,begin:new i.Vector2(0,0),end:new i.Vector2(0,0),strength:.9}),xt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=ht({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),x=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[u,d,e,s.fbo,t,r]),[h,a]=ne(x),[f,l]=k(me),p=A(c),y=V(c);return[v.useCallback((b,M,_)=>{const{gl:w}=b;return M&&l(M),p("uTexture",f.texture),p("uBegin",f.begin),p("uEnd",f.end),p("uStrength",f.strength),y(_),a(w,({read:R})=>{p("uBackbuffer",R)})},[a,p,l,f,y]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]};var yt=`varying vec2 vUv;

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
}`;const bt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=v.useMemo(()=>{const s=new i.ShaderMaterial({uniforms:{uEpicenter:{value:ue.epicenter},uProgress:{value:ue.progress},uStrength:{value:ue.strength},uWidth:{value:ue.width},uMode:{value:0},...n},vertexShader:yt,fragmentShader:Mt,...z});return t&&(s.onBeforeCompile=t),s},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ue=Object.freeze({epicenter:new i.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),St=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=bt({scene:u,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(ue),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("uEpicenter",a.epicenter),l("uProgress",a.progress),l("uWidth",a.width),l("uStrength",a.strength),l("uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var _t=`varying vec2 vUv;

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
}`;const Tt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{u_texture:{value:T},u_resolution:{value:new i.Vector2},u_keyColor:{value:X.color},u_similarity:{value:X.similarity},u_smoothness:{value:X.smoothness},u_spill:{value:X.spill},u_color:{value:X.color},u_contrast:{value:X.contrast},u_brightness:{value:X.brightness},u_gamma:{value:X.gamma},...r},vertexShader:_t,fragmentShader:Ct,...z});return o&&(g.onBeforeCompile=o),g},[o,r]),u=N(n,t);A(s)("u_resolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},X=Object.freeze({texture:T,keyColor:new i.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new i.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),wt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=Tt({scene:u,size:e,dpr:s.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[x,h]=$({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[a,f]=k(X),l=A(c),p=V(c);return[v.useCallback((S,b,M)=>{const{gl:_}=S;return b&&f(b),l("u_texture",a.texture),l("u_keyColor",a.keyColor),l("u_similarity",a.similarity),l("u_smoothness",a.smoothness),l("u_spill",a.spill),l("u_color",a.color),l("u_contrast",a.contrast),l("u_brightness",a.brightness),l("u_gamma",a.gamma),p(M),h(_)},[h,l,f,a,p]),f,{scene:u,mesh:g,material:c,camera:d,renderTarget:x,output:x.texture}]};var Rt=`precision highp float;

varying vec2 vUv;

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	
	
	gl_Position = usf_Position;
}`,Dt=`precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

void main() {
	vec4 usf_FragColor = vec4(1.);

	
	
	gl_FragColor = usf_FragColor;
}`;const At=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=v.useMemo(()=>new i.PlaneGeometry(2,2),[]),s=v.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uTime:{value:0},uPointer:{value:new i.Vector2},uResolution:{value:new i.Vector2},...r},vertexShader:Rt,fragmentShader:Dt,...z});return o&&(g.onBeforeCompile=o),g},[o,r]),u=N(n,t);A(s)("uResolution",u.clone());const c=B(e,m,s,i.Mesh);return{material:s,mesh:c}},Ae=Object.freeze({texture:T,beat:!1}),Pt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const s=O(n),u=v.useMemo(()=>new i.Scene,[]),{material:c,mesh:g}=At({scene:u,size:e,dpr:s.shader,uniforms:o,onBeforeCompile:m}),d=L(e),x=v.useMemo(()=>({scene:u,camera:d,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[u,d,e,s.fbo,t,r]),[h,a]=ne(x),[f,l]=k(Ae),p=A(c),y=V(c);return[v.useCallback((b,M,_)=>{const{gl:w,clock:R,pointer:U}=b;return M&&l(M),p("uTexture",f.texture),p("uPointer",U),p("uTime",f.beat||R.getElapsedTime()),y(_),a(w,({read:F})=>{p("uBackbuffer",F)})},[a,p,l,f,y]),l,{scene:u,mesh:g,material:c,camera:d,renderTarget:h,output:h.read.texture}]},It=({scene:e,geometry:n,material:t})=>{const r=B(e,n,t,i.Points),o=B(e,v.useMemo(()=>n.clone(),[n]),v.useMemo(()=>t.clone(),[t]),i.Mesh);return o.visible=!1,{points:r,interactiveMesh:o}};var Ft=`uniform vec2 uResolution;
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
}`;const Ie=(e,n,t,r,o)=>{var d;const m=t==="position"?"positionTarget":"uvTarget",s=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",u=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",c=t==="position"?"positionsList":"uvsList",g=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new i.BufferAttribute(e[0],o));let x="",h="";e.forEach((a,f)=>{n.setAttribute(`${m}${f}`,new i.BufferAttribute(a,o)),x+=`attribute vec${o} ${m}${f};
`,f===0?h+=`${m}${f}`:h+=`,${m}${f}`}),r=r.replace(`${s}`,x),r=r.replace(`${u}`,`vec${o} ${c}[${e.length}] = vec${o}[](${h});
				${g}
			`)}else r=r.replace(`${s}`,""),r=r.replace(`${u}`,""),(d=n==null?void 0:n.attributes[t])!=null&&d.array||Ce&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},Fe=(e,n,t,r)=>{var m;let o=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?o=[n.attributes[t].array,...e]:o=e;const s=Math.max(...o.map(u=>u.length));o.forEach((u,c)=>{if(u.length<s){const g=(s-u.length)/r,d=[],x=Array.from(u);for(let h=0;h<g;h++){const a=Math.floor(u.length/r*Math.random())*r;for(let f=0;f<r;f++)d.push(x[a+f])}o[c]=new Float32Array([...x,...d])}})}return o},zt=(e,n)=>{let t="";const r={};let o="mapArrayColor = ";return e&&e.length>0?(e.forEach((s,u)=>{const c=`vMapArrayIndex < ${u}.1`,g=`texture2D(uMapArray${u}, uv)`;o+=`( ${c} ) ? ${g} : `,t+=`
        uniform sampler2D uMapArray${u};
      `,r[`uMapArray${u}`]={value:s}}),o+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(o+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",o).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},Ut=({size:e,dpr:n,geometry:t,positions:r,uvs:o,mapArray:m,uniforms:s,onBeforeCompile:u})=>{const c=v.useMemo(()=>Fe(r,t,"position",3),[r,t]),g=v.useMemo(()=>Fe(o,t,"uv",2),[o,t]),d=v.useMemo(()=>{c.length!==g.length&&Ce&&console.log("use-shader-fx:positions and uvs are not matched");const h=Ie(g,t,"uv",Ie(c,t,"position",Ft,3),2).replace("#usf <getWobble>",Pe),{rewritedFragmentShader:a,mapArrayUniforms:f}=zt(m,Vt),l=new i.ShaderMaterial({vertexShader:h,fragmentShader:a,blending:i.AdditiveBlending,...z,transparent:!0,uniforms:{uResolution:{value:new i.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:T},uIsPicture:{value:!1},uAlphaPicture:{value:T},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:T},uIsMap:{value:!1},uAlphaMap:{value:T},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:T},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...f,...s}});return u&&(l.onBeforeCompile=u),l},[t,c,g,m,u,s]),x=N(e,n);return A(d)("uResolution",x.clone()),{material:d,modifiedPositions:c,modifiedUvs:g}},Ve=({size:e,dpr:n,scene:t=!1,geometry:r,positions:o,uvs:m,mapArray:s,uniforms:u,onBeforeCompile:c})=>{const g=O(n),d=v.useMemo(()=>{const b=r||new i.SphereGeometry(1,32,32);return b.setIndex(null),b.deleteAttribute("normal"),b},[r]),{material:x,modifiedPositions:h,modifiedUvs:a}=Ut({size:e,dpr:g.shader,geometry:d,positions:o,uvs:m,mapArray:s,uniforms:u,onBeforeCompile:c}),{points:f,interactiveMesh:l}=It({scene:t,geometry:d,material:x}),p=A(x),y=V(x);return[v.useCallback((b,M,_)=>{b&&p("uTime",(M==null?void 0:M.beat)||b.clock.getElapsedTime()),M!==void 0&&(p("uMorphProgress",M.morphProgress),p("uBlurAlpha",M.blurAlpha),p("uBlurRadius",M.blurRadius),p("uPointSize",M.pointSize),p("uPointAlpha",M.pointAlpha),M.picture?(p("uPicture",M.picture),p("uIsPicture",!0)):M.picture===!1&&p("uIsPicture",!1),M.alphaPicture?(p("uAlphaPicture",M.alphaPicture),p("uIsAlphaPicture",!0)):M.alphaPicture===!1&&p("uIsAlphaPicture",!1),p("uColor0",M.color0),p("uColor1",M.color1),p("uColor2",M.color2),p("uColor3",M.color3),M.map?(p("uMap",M.map),p("uIsMap",!0)):M.map===!1&&p("uIsMap",!1),M.alphaMap?(p("uAlphaMap",M.alphaMap),p("uIsAlphaMap",!0)):M.alphaMap===!1&&p("uIsAlphaMap",!1),p("uWobbleStrength",M.wobbleStrength),p("uWobblePositionFrequency",M.wobblePositionFrequency),p("uWobbleTimeFrequency",M.wobbleTimeFrequency),p("uWarpStrength",M.warpStrength),p("uWarpPositionFrequency",M.warpPositionFrequency),p("uWarpTimeFrequency",M.warpTimeFrequency),M.displacement?(p("uDisplacement",M.displacement),p("uIsDisplacement",!0)):M.displacement===!1&&p("uIsDisplacement",!1),p("uDisplacementIntensity",M.displacementIntensity),p("uDisplacementColorIntensity",M.displacementColorIntensity),p("uSizeRandomIntensity",M.sizeRandomIntensity),p("uSizeRandomTimeFrequency",M.sizeRandomTimeFrequency),p("uSizeRandomMin",M.sizeRandomMin),p("uSizeRandomMax",M.sizeRandomMax),p("uDivergence",M.divergence),p("uDivergencePoint",M.divergencePoint),y(_))},[p,y]),{points:f,interactiveMesh:l,positions:h,uvs:a}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new i.Vector3(0),beat:!1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:o,geometry:m,positions:s,uvs:u,uniforms:c,onBeforeCompile:g})=>{const d=O(n),x=v.useMemo(()=>new i.Scene,[]),[h,{points:a,interactiveMesh:f,positions:l,uvs:p}]=Ve({scene:x,size:e,dpr:n,geometry:m,positions:s,uvs:u,uniforms:c,onBeforeCompile:g}),[y,S]=$({scene:x,camera:o,size:e,dpr:d.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=v.useCallback((_,w,R)=>(h(_,w,R),S(_.gl)),[S,h]),M=v.useCallback((_,w)=>{h(null,_,w)},[h]);return[b,M,{scene:x,points:a,interactiveMesh:f,renderTarget:y,output:y.texture,positions:l,uvs:p}]};function Et(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},r=e.getIndex(),o=e.getAttribute("position"),m=r?r.count:o.count;let s=0;const u=Object.keys(e.attributes),c={},g={},d=[],x=["getX","getY","getZ","getW"];for(let l=0,p=u.length;l<p;l++){const y=u[l];c[y]=[];const S=e.morphAttributes[y];S&&(g[y]=new Array(S.length).fill(0).map(()=>[]))}const h=Math.log10(1/n),a=Math.pow(10,h);for(let l=0;l<m;l++){const p=r?r.getX(l):l;let y="";for(let S=0,b=u.length;S<b;S++){const M=u[S],_=e.getAttribute(M),w=_.itemSize;for(let R=0;R<w;R++)y+=`${~~(_[x[R]](p)*a)},`}if(y in t)d.push(t[y]);else{for(let S=0,b=u.length;S<b;S++){const M=u[S],_=e.getAttribute(M),w=e.morphAttributes[M],R=_.itemSize,U=c[M],F=g[M];for(let I=0;I<R;I++){const P=x[I];if(U.push(_[P](p)),w)for(let D=0,q=w.length;D<q;D++)F[D].push(w[D][P](p))}}t[y]=s,d.push(s),s++}}const f=e.clone();for(let l=0,p=u.length;l<p;l++){const y=u[l],S=e.getAttribute(y),b=new S.array.constructor(c[y]),M=new oe.BufferAttribute(b,S.itemSize,S.normalized);if(f.setAttribute(y,M),y in g)for(let _=0;_<g[y].length;_++){const w=e.morphAttributes[y][_],R=new w.array.constructor(g[y][_]),U=new oe.BufferAttribute(R,w.itemSize,w.normalized);f.morphAttributes[y][_]=U}}return f.setIndex(d),f}var Bt=`vec3 random3(vec3 c) {
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
#endif`,kt=`#ifdef USE_TRANSMISSION

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
		
		// wobble
		float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
		float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
		float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
		
		usf_Position += wobble * normal;
		positionA += wobblePositionA * normal;
		positionB += wobblePositionB * normal;

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
		`),n},$t=({baseMaterial:e,materialParameters:n,onBeforeCompile:t,depthOnBeforeCompile:r,isCustomTransmission:o=!1,uniforms:m})=>{const{material:s,depthMaterial:u}=v.useMemo(()=>{const c=new(e||i.MeshPhysicalMaterial)(n||{});Object.assign(c.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:W.wobblePositionFrequency},uWobbleTimeFrequency:{value:W.wobbleTimeFrequency},uWobbleStrength:{value:W.wobbleStrength},uWarpPositionFrequency:{value:W.warpPositionFrequency},uWarpTimeFrequency:{value:W.warpTimeFrequency},uWarpStrength:{value:W.warpStrength},uColor0:{value:W.color0},uColor1:{value:W.color1},uColor2:{value:W.color2},uColor3:{value:W.color3},uColorMix:{value:W.colorMix},uEdgeThreshold:{value:W.edgeThreshold},uEdgeColor:{value:W.edgeColor},uChromaticAberration:{value:W.chromaticAberration},uAnisotropicBlur:{value:W.anisotropicBlur},uDistortion:{value:W.distortion},uDistortionScale:{value:W.distortionScale},uTemporalDistortion:{value:W.temporalDistortion},uRefractionSamples:{value:W.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},...m}}),c.onBeforeCompile=(d,x)=>{Object.assign(d.uniforms,c.userData.uniforms),d.vertexShader=ze(d.vertexShader),d.fragmentShader=d.fragmentShader.replace("#include <color_fragment>",`
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
				`),c.type==="MeshPhysicalMaterial"&&o&&(d.fragmentShader=d.fragmentShader.replace("#include <transmission_pars_fragment>",`${Lt}`),d.fragmentShader=d.fragmentShader.replace("#include <transmission_fragment>",`${kt}`)),t&&t(d,x)},c.needsUpdate=!0;const g=new i.MeshDepthMaterial({depthPacking:i.RGBADepthPacking});return g.onBeforeCompile=(d,x)=>{Object.assign(d.uniforms,c.userData.uniforms),d.vertexShader=ze(d.vertexShader),r&&r(d,x)},g.needsUpdate=!0,{material:c,depthMaterial:g}},[n,e,t,r,m,o]);return{material:s,depthMaterial:u}},Ue=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:o,onBeforeCompile:m,depthOnBeforeCompile:s,uniforms:u})=>{const c=v.useMemo(()=>{let p=n||new i.IcosahedronGeometry(2,20);return p=Et(p),p.computeTangents(),p},[n]),{material:g,depthMaterial:d}=$t({baseMaterial:r,materialParameters:o,onBeforeCompile:m,depthOnBeforeCompile:s,uniforms:u,isCustomTransmission:t}),x=B(e,c,g,i.Mesh),h=g.userData,a=A(h),f=V(h);return[v.useCallback((p,y,S)=>{p&&a("uTime",(y==null?void 0:y.beat)||p.clock.getElapsedTime()),y!==void 0&&(a("uWobbleStrength",y.wobbleStrength),a("uWobblePositionFrequency",y.wobblePositionFrequency),a("uWobbleTimeFrequency",y.wobbleTimeFrequency),a("uWarpStrength",y.warpStrength),a("uWarpPositionFrequency",y.warpPositionFrequency),a("uWarpTimeFrequency",y.warpTimeFrequency),a("uColor0",y.color0),a("uColor1",y.color1),a("uColor2",y.color2),a("uColor3",y.color3),a("uColorMix",y.colorMix),a("uEdgeThreshold",y.edgeThreshold),a("uEdgeColor",y.edgeColor),a("uChromaticAberration",y.chromaticAberration),a("uAnisotropicBlur",y.anisotropicBlur),a("uDistortion",y.distortion),a("uDistortionScale",y.distortionScale),a("uRefractionSamples",y.refractionSamples),a("uTemporalDistortion",y.temporalDistortion),f(S))},[a,f]),{mesh:x,depthMaterial:d}]},W=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new i.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),Wt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:o,geometry:m,baseMaterial:s,materialParameters:u,uniforms:c,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:x})=>{const h=O(n),a=v.useMemo(()=>new i.Scene,[]),[f,{mesh:l,depthMaterial:p}]=Ue({baseMaterial:s,materialParameters:u,scene:a,geometry:m,uniforms:c,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:x}),[y,S]=$({scene:a,camera:o,size:e,dpr:h.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=v.useCallback((_,w,R)=>(f(_,w,R),S(_.gl)),[S,f]),M=v.useCallback((_,w)=>{f(null,_,w)},[f]);return[b,M,{scene:a,mesh:l,depthMaterial:p,renderTarget:y,output:y.texture}]},jt=(e,n,t)=>{const r=v.useMemo(()=>{const o=new i.Mesh(n,t);return e.add(o),o},[n,t,e]);return v.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},pe=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-pe.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-pe.easeOutBounce(1-2*e))/2:(1+pe.easeOutBounce(2*e-1))/2}});function qt(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const Nt=(e,n="easeOutQuart")=>{const t=e/60,r=pe[n];return v.useCallback(m=>{let s=m.getElapsedTime()*t;const u=Math.floor(s),c=r(s-u);s=c+u;const g=qt(u);return{beat:s,floor:u,fract:c,hash:g}},[t,r])},Gt=(e=60)=>{const n=v.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=v.useRef(null);return v.useCallback(o=>{const m=o.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},Kt=e=>{var r,o;const n=(r=e.dom)==null?void 0:r.length,t=(o=e.texture)==null?void 0:o.length;return!n||!t||n!==t};var Xt=`varying vec2 vUv;

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
}`;const Yt=({params:e,scene:n,uniforms:t,onBeforeCompile:r})=>{n.children.length>0&&(n.children.forEach(o=>{o instanceof i.Mesh&&(o.geometry.dispose(),o.material.dispose())}),n.remove(...n.children)),e.texture.forEach((o,m)=>{const s=new i.ShaderMaterial({uniforms:{u_texture:{value:o},u_textureResolution:{value:new i.Vector2(0,0)},u_resolution:{value:new i.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[m]?e.boderRadius[m]:0},...t},vertexShader:Xt,fragmentShader:Ht,...z,transparent:!0});r&&(s.onBeforeCompile=r);const u=new i.Mesh(new i.PlaneGeometry(1,1),s);n.add(u)})},Qt=()=>{const e=v.useRef([]),n=v.useRef([]);return v.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:o,params:m})=>{e.current.length>0&&e.current.forEach((u,c)=>{u.unobserve(n.current[c])}),n.current=[],e.current=[];const s=new Array(m.dom.length).fill(!1);r.current=[...s],o.current=[...s],m.dom.forEach((u,c)=>{const g=x=>{x.forEach(h=>{m.onIntersect[c]&&m.onIntersect[c](h),r.current[c]=h.isIntersecting})},d=new IntersectionObserver(g,{rootMargin:"0px",threshold:0});d.observe(u),e.current.push(d),n.current.push(u)})},[])},Zt=()=>{const e=v.useRef([]),n=v.useCallback(({params:t,customParams:r,size:o,resolutionRef:m,scene:s,isIntersectingRef:u})=>{s.children.length!==e.current.length&&(e.current=new Array(s.children.length)),s.children.forEach((c,g)=>{var h,a,f,l,p,y;const d=t.dom[g];if(!d)return;const x=d.getBoundingClientRect();if(e.current[g]=x,c.scale.set(x.width,x.height,1),c.position.set(x.left+x.width*.5-o.width*.5,-x.top-x.height*.5+o.height*.5,0),u.current[g]&&(t.rotation[g]&&c.rotation.copy(t.rotation[g]),c instanceof i.Mesh)){const S=c.material,b=A(S),M=V(S);b("u_texture",t.texture[g]),b("u_textureResolution",[((f=(a=(h=t.texture[g])==null?void 0:h.source)==null?void 0:a.data)==null?void 0:f.width)||0,((y=(p=(l=t.texture[g])==null?void 0:l.source)==null?void 0:p.data)==null?void 0:y.height)||0]),b("u_resolution",m.current.set(x.width,x.height)),b("u_borderRadius",t.boderRadius[g]?t.boderRadius[g]:0),M(r)}})},[]);return[e.current,n]},Jt=()=>{const e=v.useRef([]),n=v.useRef([]),t=v.useCallback((r,o=!1)=>{e.current.forEach((s,u)=>{s&&(n.current[u]=!0)});const m=o?[...n.current]:[...e.current];return r<0?m:m[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},er=e=>({onView:t,onHidden:r})=>{const o=v.useRef(!1);v.useEffect(()=>{let m;const s=()=>{e.current.some(u=>u)?o.current||(t&&t(),o.current=!0):o.current&&(r&&r(),o.current=!1),m=requestAnimationFrame(s)};return m=requestAnimationFrame(s),()=>{cancelAnimationFrame(m)}},[t,r])},Oe={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},nr=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m},s=[])=>{const u=O(n),c=v.useMemo(()=>new i.Scene,[]),g=L(e),[d,x]=$({scene:c,camera:g,size:e,dpr:u.fbo,samples:t,isSizeUpdate:r}),[h,a]=k({...Oe,updateKey:performance.now()}),[f,l]=Zt(),p=v.useRef(new i.Vector2(0,0)),[y,S]=v.useState(!0);v.useMemo(()=>S(!0),s);const b=v.useRef(null),M=v.useMemo(()=>T,[]),_=Qt(),{isIntersectingOnceRef:w,isIntersectingRef:R,isIntersecting:U}=Jt(),F=er(R);return[v.useCallback((P,D,q)=>{const{gl:re,size:H}=P;if(D&&a(D),Kt(h))return M;if(y){if(b.current===h.updateKey)return M;b.current=h.updateKey}return y&&(Yt({params:h,size:H,scene:c,uniforms:o,onBeforeCompile:m}),_({isIntersectingRef:R,isIntersectingOnceRef:w,params:h}),S(!1)),l({params:h,customParams:q,size:H,resolutionRef:p,scene:c,isIntersectingRef:R}),x(re)},[x,o,a,_,l,m,y,c,h,w,R,M]),a,{scene:c,camera:g,renderTarget:d,output:d.texture,isIntersecting:U,DOMRects:f,intersections:R.current,useDomView:F}]},tr=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:s=!1,depthTexture:u=!1},c)=>{const g=v.useRef([]),d=N(t,r);g.current=v.useMemo(()=>Array.from({length:c},()=>{const h=new i.WebGLRenderTarget(d.x,d.y,{...ce,samples:m,depthBuffer:s});return u&&(h.depthTexture=new i.DepthTexture(d.x,d.y,i.FloatType)),h}),[c]),o&&g.current.forEach(h=>h.setSize(d.x,d.y)),v.useEffect(()=>{const h=g.current;return()=>{h.forEach(a=>a.dispose())}},[c]);const x=v.useCallback((h,a,f)=>{const l=g.current[a];return ge({gl:h,scene:e,camera:n,fbo:l,onBeforeRender:()=>f&&f({read:l.texture})}),l.texture},[e,n]);return[g.current,x]};C.ALPHABLENDING_PARAMS=Re,C.BLANK_PARAMS=Ae,C.BLENDING_PARAMS=ie,C.BRIGHTNESSPICKER_PARAMS=ve,C.BRUSH_PARAMS=Y,C.CHROMAKEY_PARAMS=X,C.COLORSTRATA_PARAMS=K,C.COSPALETTE_PARAMS=ae,C.COVERTEXTURE_PARAMS=De,C.DOMSYNCER_PARAMS=Oe,C.DUOTONE_PARAMS=he,C.Easing=pe,C.FBO_OPTION=ce,C.FLUID_PARAMS=Te,C.FXBLENDING_PARAMS=Me,C.FXTEXTURE_PARAMS=ee,C.HSV_PARAMS=xe,C.MARBLE_PARAMS=te,C.MORPHPARTICLES_PARAMS=E,C.MOTIONBLUR_PARAMS=me,C.NOISE_PARAMS=J,C.RIPPLE_PARAMS=we,C.SIMPLEBLUR_PARAMS=be,C.WAVE_PARAMS=ue,C.WOBBLE3D_PARAMS=W,C.renderFBO=ge,C.setCustomUniform=V,C.setUniform=A,C.useAddMesh=jt,C.useAlphaBlending=tt,C.useBeat=Nt,C.useBlank=Pt,C.useBlending=kn,C.useBrightnessPicker=Xn,C.useBrush=Ne,C.useCamera=L,C.useChromaKey=wt,C.useColorStrata=Cn,C.useCopyTexture=tr,C.useCosPalette=Fn,C.useCoverTexture=ct,C.useCreateMorphParticles=Ve,C.useCreateWobble3D=Ue,C.useDomSyncer=nr,C.useDoubleFBO=ne,C.useDuoTone=On,C.useFPSLimiter=Gt,C.useFluid=mn,C.useFxBlending=Zn,C.useFxTexture=qn,C.useHSV=it,C.useMarble=Dn,C.useMorphParticles=Ot,C.useMotionBlur=xt,C.useNoise=Mn,C.useParams=k,C.usePointer=de,C.useResolution=N,C.useRipple=gn,C.useSimpleBlur=ft,C.useSingleFBO=$,C.useWave=St,C.useWobble3D=Wt,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
