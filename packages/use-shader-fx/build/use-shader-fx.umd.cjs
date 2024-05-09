(function(_,ae){typeof exports=="object"&&typeof module<"u"?ae(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],ae):(_=typeof globalThis<"u"?globalThis:_||self,ae(_["use-shader-fx"]={},_.THREE,_.React))})(this,function(_,ae,u){"use strict";function ke(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const i=ke(ae);var $e=`varying vec2 vUv;

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
}`;const K=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return u.useMemo(()=>new i.Vector2(t,r),[t,r])},D=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},B=(e,n,t,r)=>{const o=u.useMemo(()=>{const m=new r(n,t);return e&&e.add(m),m},[n,t,r,e]);return u.useEffect(()=>()=>{e&&e.remove(o),n.dispose(),t.dispose()},[e,n,t,o]),o},Te=process.env.NODE_ENV==="development",U={transparent:!1,depthTest:!1,depthWrite:!1},P=new i.DataTexture(new Uint8Array([0,0,0,0]),1,1,i.RGBAFormat),je=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),l=u.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uBuffer:{value:P},uResolution:{value:new i.Vector2(0,0)},uTexture:{value:P},uIsTexture:{value:!1},uMap:{value:P},uIsMap:{value:!1},uMapIntensity:{value:Q.mapIntensity},uRadius:{value:Q.radius},uSmudge:{value:Q.smudge},uDissipation:{value:Q.dissipation},uMotionBlur:{value:Q.motionBlur},uMotionSample:{value:Q.motionSample},uMouse:{value:new i.Vector2(-10,-10)},uPrevMouse:{value:new i.Vector2(-10,-10)},uVelocity:{value:new i.Vector2(0,0)},uColor:{value:Q.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1},...r},vertexShader:$e,fragmentShader:We,...U,transparent:!0});return o&&(g.onBeforeCompile=o),g},[o,r]),s=K(n,t);D(l)("uResolution",s.clone());const v=B(e,m,l,i.Mesh);return{material:l,mesh:v}},qe=(e,n)=>{const t=n,r=e/n,[o,m]=[t*r/2,t/2];return{width:o,height:m,near:-1e3,far:1e3}},L=(e,n="OrthographicCamera")=>{const t=K(e),{width:r,height:o,near:m,far:l}=qe(t.x,t.y);return u.useMemo(()=>n==="OrthographicCamera"?new i.OrthographicCamera(-r,r,o,-o,m,l):new i.PerspectiveCamera(50,r/o),[r,o,m,l,n])},de=(e=0)=>{const n=u.useRef(new i.Vector2(0,0)),t=u.useRef(new i.Vector2(0,0)),r=u.useRef(new i.Vector2(0,0)),o=u.useRef(0),m=u.useRef(new i.Vector2(0,0)),l=u.useRef(!1);return u.useCallback(v=>{const g=performance.now();let d;l.current&&e?(r.current=r.current.lerp(v,1-e),d=r.current.clone()):(d=v.clone(),r.current=d),o.current===0&&(o.current=g,n.current=d);const M=Math.max(1,g-o.current);o.current=g,m.current.copy(d).sub(n.current).divideScalar(M);const y=m.current.length()>0,a=l.current?n.current.clone():d;return!l.current&&y&&(l.current=!0),n.current=d,{currentPointer:d,prevPointer:a,diffPointer:t.current.subVectors(d,a),velocity:m.current,isVelocityUpdate:y}},[e])},k=e=>{const n=o=>Object.values(o).some(m=>typeof m=="function"),t=u.useRef(n(e)?e:structuredClone(e)),r=u.useCallback(o=>{if(o!==void 0)for(const m in o){const l=m;l in t.current&&o[l]!==void 0&&o[l]!==null?t.current[l]=o[l]:console.error(`"${String(l)}" does not exist in the params. or "${String(l)}" is null | undefined`)}},[]);return[t.current,r]},ve={minFilter:i.LinearFilter,magFilter:i.LinearFilter,type:i.HalfFloatType,stencilBuffer:!1},ge=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:o,onSwap:m})=>{e.setRenderTarget(n),o(),e.clear(),e.render(t,r),m&&m(),e.setRenderTarget(null),e.clear()},$=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1})=>{var M;const v=u.useRef(),g=K(t,r);v.current=u.useMemo(()=>{const y=new i.WebGLRenderTarget(g.x,g.y,{...ve,samples:m,depthBuffer:l});return s&&(y.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),y},[]),o&&((M=v.current)==null||M.setSize(g.x,g.y)),u.useEffect(()=>{const y=v.current;return()=>{y==null||y.dispose()}},[]);const d=u.useCallback((y,a)=>{const h=v.current;return ge({gl:y,fbo:h,scene:e,camera:n,onBeforeRender:()=>a&&a({read:h.texture})}),h.texture},[e,n]);return[v.current,d]},te=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1})=>{var y,a;const v=u.useRef({read:null,write:null,swap:function(){let h=this.read;this.read=this.write,this.write=h}}),g=K(t,r),d=u.useMemo(()=>{const h=new i.WebGLRenderTarget(g.x,g.y,{...ve,samples:m,depthBuffer:l}),c=new i.WebGLRenderTarget(g.x,g.y,{...ve,samples:m,depthBuffer:l});return s&&(h.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType),c.depthTexture=new i.DepthTexture(g.x,g.y,i.FloatType)),{read:h,write:c}},[]);v.current.read=d.read,v.current.write=d.write,o&&((y=v.current.read)==null||y.setSize(g.x,g.y),(a=v.current.write)==null||a.setSize(g.x,g.y)),u.useEffect(()=>{const h=v.current;return()=>{var c,p;(c=h.read)==null||c.dispose(),(p=h.write)==null||p.dispose()}},[]);const M=u.useCallback((h,c)=>{var f;const p=v.current;return ge({gl:h,scene:e,camera:n,fbo:p.write,onBeforeRender:()=>c&&c({read:p.read.texture,write:p.write.texture}),onSwap:()=>p.swap()}),(f=p.read)==null?void 0:f.texture},[e,n]);return[{read:v.current.read,write:v.current.write},M]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Q=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new i.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ne=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=je({scene:s,size:e,dpr:l.shader,uniforms:o,onBeforeCompile:m}),d=L(e),M=de(),[y,a]=te({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[h,c]=k(Q),p=u.useRef(null),f=D(v),T=V(v),b=u.useCallback((S,C)=>{c(S),T(C)},[c,T]);return[u.useCallback((S,C,w)=>{const{gl:I,pointer:A}=S;b(C,w),h.texture?(f("uIsTexture",!0),f("uTexture",h.texture)):f("uIsTexture",!1),h.map?(f("uIsMap",!0),f("uMap",h.map),f("uMapIntensity",h.mapIntensity)):f("uIsMap",!1),f("uRadius",h.radius),f("uSmudge",h.smudge),f("uDissipation",h.dissipation),f("uMotionBlur",h.motionBlur),f("uMotionSample",h.motionSample);const F=h.pointerValues||M(A);F.isVelocityUpdate&&(f("uMouse",F.currentPointer),f("uPrevMouse",F.prevPointer)),f("uVelocity",F.velocity);const R=typeof h.color=="function"?h.color(F.velocity):h.color;return f("uColor",R),f("uIsCursor",h.isCursor),f("uPressureEnd",h.pressure),p.current===null&&(p.current=h.pressure),f("uPressureStart",p.current),p.current=h.pressure,a(I,({read:z})=>{f("uBuffer",z)})},[f,M,a,h,b]),b,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.read.texture}]};var Z=`varying vec2 vUv;
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
}`;const Ke=()=>u.useMemo(()=>new i.ShaderMaterial({vertexShader:Z,fragmentShader:Ge,...U}),[]);var Xe=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const He=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:P},uSource:{value:P},texelSize:{value:new i.Vector2},dt:{value:Me},dissipation:{value:0},...n},vertexShader:Z,fragmentShader:Xe,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var Ye=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

vec2 sampleVelocity(in vec2 uv) {
	vec2 clampedUV = clamp(uv, 0.0, 1.0);
	vec2 multiplier = vec2(1.0, 1.0);
	multiplier.x = uv.x < 0.0 || uv.x > 1.0 ? -1.0 : 1.0;
	multiplier.y = uv.y < 0.0 || uv.y > 1.0 ? -1.0 : 1.0;
	return multiplier * texture2D(uVelocity, clampedUV).xy;
}

void main () {
	float L = sampleVelocity(vL).x;
	float R = sampleVelocity(vR).x;
	float T = sampleVelocity(vT).y;
	float B = sampleVelocity(vB).y;
	float div = 0.5 * (R - L + T - B);
	gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;const Qe=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:Ye,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var Ze=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
	float L = texture2D(uPressure, clamp(vL,0.,1.)).x;
	float R = texture2D(uPressure, clamp(vR,0.,1.)).x;
	float T = texture2D(uPressure, clamp(vT,0.,1.)).x;
	float B = texture2D(uPressure, clamp(vB,0.,1.)).x;
	float C = texture2D(uPressure, vUv).x;
	float divergence = texture2D(uDivergence, vUv).x;
	float pressure = (L + R + B + T - divergence) * 0.25;
	gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;const Je=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:Ze,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var en=`precision highp float;

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
}`;const nn=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:en,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var tn=`precision highp float;

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
}`;const rn=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Me},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:tn,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var on=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const an=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uTexture:{value:P},value:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:on,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var un=`precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uPressure, clamp(vL,0.,1.)).x;
	float R = texture2D(uPressure, clamp(vR,0.,1.)).x;
	float T = texture2D(uPressure, clamp(vT,0.,1.)).x;
	float B = texture2D(uPressure, clamp(vB,0.,1.)).x;
	vec2 velocity = texture2D(uVelocity, vUv).xy;
	velocity.xy -= vec2(R - L, T - B);
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;const sn=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uPressure:{value:P},uVelocity:{value:P},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:un,...U});return e&&(r.onBeforeCompile=e),r},[e,n]);var ln=`precision highp float;

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
}`;const cn=({onBeforeCompile:e,uniforms:n})=>u.useMemo(()=>{const r=new i.ShaderMaterial({uniforms:{uTarget:{value:P},aspectRatio:{value:0},color:{value:new i.Vector3},point:{value:new i.Vector2},radius:{value:0},texelSize:{value:new i.Vector2},...n},vertexShader:Z,fragmentShader:ln,...U});return e&&(r.onBeforeCompile=e),r},[e,n]),J=(e,n)=>e(n??{}),vn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const o=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),{curl:m,vorticity:l,advection:s,divergence:v,pressure:g,clear:d,gradientSubtract:M,splat:y}=r??{},a=J(Ke),h=a.clone(),c=J(nn,m),p=J(rn,l),f=J(He,s),T=J(Qe,v),b=J(Je,g),x=J(an,d),S=J(sn,M),C=J(cn,y),w=u.useMemo(()=>({vorticityMaterial:p,curlMaterial:c,advectionMaterial:f,divergenceMaterial:T,pressureMaterial:b,clearMaterial:x,gradientSubtractMaterial:S,splatMaterial:C}),[p,c,f,T,b,x,S,C]),I=K(n,t);u.useMemo(()=>{D(w.splatMaterial)("aspectRatio",I.x/I.y);for(const R of Object.values(w))D(R)("texelSize",new i.Vector2(1/I.x,1/I.y))},[I,w]);const A=B(e,o,a,i.Mesh);u.useMemo(()=>{a.dispose(),A.material=h},[a,A,h]),u.useEffect(()=>()=>{for(const R of Object.values(w))R.dispose()},[w]);const F=u.useCallback(R=>{A.material=R,A.material.needsUpdate=!0},[A]);return{materials:w,setMeshMaterial:F,mesh:A}},Me=.016,we=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new i.Vector3(1,1,1),pointerValues:!1}),mn=({size:e,dpr:n,samples:t,isSizeUpdate:r,customFluidProps:o})=>{const m=O(n),l=u.useMemo(()=>new i.Scene,[]),{materials:s,setMeshMaterial:v,mesh:g}=vn({scene:l,size:e,dpr:m.shader,customFluidProps:o}),d=L(e),M=de(),y=u.useMemo(()=>({scene:l,camera:d,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[l,d,e,t,m.fbo,r]),[a,h]=te(y),[c,p]=te(y),[f,T]=$(y),[b,x]=$(y),[S,C]=te(y),w=u.useRef(new i.Vector2(0,0)),I=u.useRef(new i.Vector3(0,0,0)),[A,F]=k(we),R=u.useMemo(()=>({advection:D(s.advectionMaterial),splat:D(s.splatMaterial),curl:D(s.curlMaterial),vorticity:D(s.vorticityMaterial),divergence:D(s.divergenceMaterial),clear:D(s.clearMaterial),pressure:D(s.pressureMaterial),gradientSubtract:D(s.gradientSubtractMaterial)}),[s]),z=u.useMemo(()=>({advection:V(s.advectionMaterial),splat:V(s.splatMaterial),curl:V(s.curlMaterial),vorticity:V(s.vorticityMaterial),divergence:V(s.divergenceMaterial),clear:V(s.clearMaterial),pressure:V(s.pressureMaterial),gradientSubtract:V(s.gradientSubtractMaterial)}),[s]),j=u.useCallback((X,N)=>{F(X),N&&Object.keys(N).forEach(se=>{z[se](N[se])})},[F,z]);return[u.useCallback((X,N,se)=>{const{gl:G,pointer:_e,size:Be}=X;j(N,se);const Ce=h(G,({read:q})=>{v(s.advectionMaterial),R.advection("uVelocity",q),R.advection("uSource",q),R.advection("dissipation",A.velocity_dissipation)}),rr=p(G,({read:q})=>{v(s.advectionMaterial),R.advection("uVelocity",Ce),R.advection("uSource",q),R.advection("dissipation",A.density_dissipation)}),ye=A.pointerValues||M(_e);ye.isVelocityUpdate&&(h(G,({read:q})=>{v(s.splatMaterial),R.splat("uTarget",q),R.splat("point",ye.currentPointer);const ce=ye.diffPointer.multiply(w.current.set(Be.width,Be.height).multiplyScalar(A.velocity_acceleration));R.splat("color",I.current.set(ce.x,ce.y,1)),R.splat("radius",A.splat_radius)}),p(G,({read:q})=>{v(s.splatMaterial),R.splat("uTarget",q);const ce=typeof A.fluid_color=="function"?A.fluid_color(ye.velocity):A.fluid_color;R.splat("color",ce)}));const or=T(G,()=>{v(s.curlMaterial),R.curl("uVelocity",Ce)});h(G,({read:q})=>{v(s.vorticityMaterial),R.vorticity("uVelocity",q),R.vorticity("uCurl",or),R.vorticity("curl",A.curl_strength)});const ar=x(G,()=>{v(s.divergenceMaterial),R.divergence("uVelocity",Ce)});C(G,({read:q})=>{v(s.clearMaterial),R.clear("uTexture",q),R.clear("value",A.pressure_dissipation)}),v(s.pressureMaterial),R.pressure("uDivergence",ar);let Le;for(let q=0;q<A.pressure_iterations;q++)Le=C(G,({read:ce})=>{R.pressure("uPressure",ce)});return h(G,({read:q})=>{v(s.gradientSubtractMaterial),R.gradientSubtract("uPressure",Le),R.gradientSubtract("uVelocity",q)}),rr},[s,R,v,T,p,x,M,C,h,A,j]),j,{scene:l,mesh:g,materials:s,camera:d,renderTarget:{velocity:a,density:c,curl:f,divergence:b,pressure:S},output:c.read.texture}]};var pn=`varying vec2 vUv;

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
}`;const dn=({scale:e,max:n,texture:t,scene:r,uniforms:o,onBeforeCompile:m})=>{const l=u.useMemo(()=>new i.PlaneGeometry(e,e),[e]),s=u.useMemo(()=>new i.ShaderMaterial({uniforms:{uOpacity:{value:0},uMap:{value:t||P},...o},blending:i.AdditiveBlending,vertexShader:pn,fragmentShader:fn,...U,transparent:!0}),[t,o]),v=u.useMemo(()=>{const g=[];for(let d=0;d<n;d++){const M=s.clone();m&&(M.onBeforeCompile=m);const y=new i.Mesh(l.clone(),M);y.rotateZ(2*Math.PI*Math.random()),y.visible=!1,r.add(y),g.push(y)}return g},[m,l,s,r,n]);return u.useEffect(()=>()=>{v.forEach(g=>{g.geometry.dispose(),Array.isArray(g.material)?g.material.forEach(d=>d.dispose()):g.material.dispose(),r.remove(g)})},[r,v]),v},Pe=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),gn=({texture:e,scale:n=64,max:t=100,size:r,dpr:o,samples:m,isSizeUpdate:l,uniforms:s,onBeforeCompile:v})=>{const g=O(o),d=u.useMemo(()=>new i.Scene,[]),M=dn({scale:n,max:t,texture:e,scene:d,uniforms:s,onBeforeCompile:v}),y=L(r),a=de(),[h,c]=$({scene:d,camera:y,size:r,dpr:g.fbo,samples:m,isSizeUpdate:l}),[p,f]=k(Pe),T=u.useRef(0),b=u.useMemo(()=>(S,C)=>{f(S),M.forEach(w=>{if(w.visible){const I=w.material;w.rotation.z+=p.rotation,w.scale.x=p.fadeout_speed*w.scale.x+p.scale,w.scale.y=w.scale.x;const A=I.uniforms.uOpacity.value;D(I)("uOpacity",A*p.fadeout_speed),A<.001&&(w.visible=!1)}V(w.material)(C)})},[M,p,f]);return[u.useCallback((S,C,w)=>{const{gl:I,pointer:A,size:F}=S;b(C,w);const R=p.pointerValues||a(A);if(p.frequency<R.diffPointer.length()){const z=M[T.current],j=z.material;z.visible=!0,z.position.set(R.currentPointer.x*(F.width/2),R.currentPointer.y*(F.height/2),0),z.scale.x=z.scale.y=0,D(j)("uOpacity",p.alpha),T.current=(T.current+1)%t}return c(I)},[c,M,a,t,p,b]),b,{scene:d,camera:y,meshArr:M,renderTarget:h,output:h.texture}]};var hn=`varying vec2 vUv;

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
}`;const yn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:ee.scale},timeStrength:{value:ee.timeStrength},noiseOctaves:{value:ee.noiseOctaves},fbmOctaves:{value:ee.fbmOctaves},warpOctaves:{value:ee.warpOctaves},warpDirection:{value:ee.warpDirection},warpStrength:{value:ee.warpStrength},...n},vertexShader:hn,fragmentShader:xn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ee=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new i.Vector2(2,2),warpStrength:8,beat:!1}),Mn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=yn({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(ee),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C,clock:w}=b;return f(x,S),c("scale",a.scale),c("timeStrength",a.timeStrength),c("noiseOctaves",a.noiseOctaves),c("fbmOctaves",a.fbmOctaves),c("warpOctaves",a.warpOctaves),c("warpDirection",a.warpDirection),c("warpStrength",a.warpStrength),c("uTime",a.beat||w.getElapsedTime()),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var bn=`varying vec2 vUv;

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
}`;const _n=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},isTexture:{value:!1},scale:{value:H.scale},noise:{value:P},noiseStrength:{value:H.noiseStrength},isNoise:{value:!1},laminateLayer:{value:H.laminateLayer},laminateInterval:{value:H.laminateInterval},laminateDetail:{value:H.laminateDetail},distortion:{value:H.distortion},colorFactor:{value:H.colorFactor},uTime:{value:0},timeStrength:{value:H.timeStrength},...n},vertexShader:bn,fragmentShader:Sn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},H=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new i.Vector2(.1,.1),laminateDetail:new i.Vector2(1,1),distortion:new i.Vector2(0,0),colorFactor:new i.Vector3(1,1,1),timeStrength:new i.Vector2(0,0),noise:!1,noiseStrength:new i.Vector2(0,0),beat:!1}),Cn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=_n({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(H),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C,clock:w}=b;return f(x,S),a.texture?(c("uTexture",a.texture),c("isTexture",!0)):(c("isTexture",!1),c("scale",a.scale)),a.noise?(c("noise",a.noise),c("isNoise",!0),c("noiseStrength",a.noiseStrength)):c("isNoise",!1),c("uTime",a.beat||w.getElapsedTime()),c("laminateLayer",a.laminateLayer),c("laminateInterval",a.laminateInterval),c("laminateDetail",a.laminateDetail),c("distortion",a.distortion),c("colorFactor",a.colorFactor),c("timeStrength",a.timeStrength),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Tn=`varying vec2 vUv;

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
}`;const Pn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:re.pattern},u_complexity:{value:re.complexity},u_complexityAttenuation:{value:re.complexityAttenuation},u_iterations:{value:re.iterations},u_timeStrength:{value:re.timeStrength},u_scale:{value:re.scale},...n},vertexShader:Tn,fragmentShader:wn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},re=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Rn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Pn({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(re),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C,clock:w}=b;return f(x,S),c("u_pattern",a.pattern),c("u_complexity",a.complexity),c("u_complexityAttenuation",a.complexityAttenuation),c("u_iterations",a.iterations),c("u_timeStrength",a.timeStrength),c("u_scale",a.scale),c("u_time",a.beat||w.getElapsedTime()),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Dn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,An=`precision highp float;
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
}`;const In=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uRgbWeight:{value:ie.rgbWeight},uColor1:{value:ie.color1},uColor2:{value:ie.color2},uColor3:{value:ie.color3},uColor4:{value:ie.color4},...n},vertexShader:Dn,fragmentShader:An,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ie=Object.freeze({texture:P,color1:new i.Color().set(.5,.5,.5),color2:new i.Color().set(.5,.5,.5),color3:new i.Color().set(1,1,1),color4:new i.Color().set(0,.1,.2),rgbWeight:new i.Vector3(.299,.587,.114)}),Fn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=In({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(ie),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("uTexture",a.texture),c("uColor1",a.color1),c("uColor2",a.color2),c("uColor3",a.color3),c("uColor4",a.color4),c("uRgbWeight",a.rgbWeight),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Un=`precision highp float;

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
}`;const zn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uColor0:{value:he.color0},uColor1:{value:he.color1},...n},vertexShader:Vn,fragmentShader:Un,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},he=Object.freeze({texture:P,color0:new i.Color(16777215),color1:new i.Color(0)}),On=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=zn({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(he),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("uTexture",a.texture),c("uColor0",a.color0),c("uColor1",a.color1),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var En=`varying vec2 vUv;

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
}`;const Ln=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{u_texture:{value:P},u_map:{value:P},u_alphaMap:{value:P},u_isAlphaMap:{value:!1},u_mapIntensity:{value:ue.mapIntensity},u_brightness:{value:ue.brightness},u_min:{value:ue.min},u_max:{value:ue.max},u_dodgeColor:{value:ue.dodgeColor},u_isDodgeColor:{value:!1},...n},vertexShader:En,fragmentShader:Bn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},ue=Object.freeze({texture:P,map:P,alphaMap:!1,mapIntensity:.3,brightness:new i.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),kn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Ln({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(ue),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("u_texture",a.texture),c("u_map",a.map),c("u_mapIntensity",a.mapIntensity),a.alphaMap?(c("u_alphaMap",a.alphaMap),c("u_isAlphaMap",!0)):c("u_isAlphaMap",!1),c("u_brightness",a.brightness),c("u_min",a.min),c("u_max",a.max),a.dodgeColor?(c("u_dodgeColor",a.dodgeColor),c("u_isDodgeColor",!0)):c("u_isDodgeColor",!1),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var $n=`varying vec2 vUv;

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

}`;const jn=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),l=u.useMemo(()=>{var d,M;const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture0:{value:P},uTexture1:{value:P},padding:{value:ne.padding},uMap:{value:P},edgeIntensity:{value:ne.edgeIntensity},mapIntensity:{value:ne.mapIntensity},epicenter:{value:ne.epicenter},progress:{value:ne.progress},dirX:{value:(d=ne.dir)==null?void 0:d.x},dirY:{value:(M=ne.dir)==null?void 0:M.y},...r},vertexShader:$n,fragmentShader:Wn,...U});return o&&(g.onBeforeCompile=o),g},[o,r]),s=K(n,t);D(l)("uResolution",s.clone());const v=B(e,m,l,i.Mesh);return{material:l,mesh:v}},ne=Object.freeze({texture0:P,texture1:P,padding:0,map:P,mapIntensity:0,edgeIntensity:0,epicenter:new i.Vector2(0,0),progress:0,dir:new i.Vector2(0,0)}),qn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=jn({scene:s,size:e,dpr:l.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,dpr:l.fbo,size:e,samples:t,isSizeUpdate:r}),[a,h]=k(ne),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{var F,R,z,j,oe,X,N,se;const{gl:C}=b;f(x,S),c("uTexture0",a.texture0),c("uTexture1",a.texture1),c("progress",a.progress);const w=[((R=(F=a.texture0)==null?void 0:F.image)==null?void 0:R.width)||0,((j=(z=a.texture0)==null?void 0:z.image)==null?void 0:j.height)||0],I=[((X=(oe=a.texture1)==null?void 0:oe.image)==null?void 0:X.width)||0,((se=(N=a.texture1)==null?void 0:N.image)==null?void 0:se.height)||0],A=w.map((G,_e)=>G+(I[_e]-G)*a.progress);return c("uTextureResolution",A),c("padding",a.padding),c("uMap",a.map),c("mapIntensity",a.mapIntensity),c("edgeIntensity",a.edgeIntensity),c("epicenter",a.epicenter),c("dirX",a.dir.x),c("dirY",a.dir.y),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Nn=`varying vec2 vUv;

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
}`;const Kn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{u_texture:{value:P},u_brightness:{value:me.brightness},u_min:{value:me.min},u_max:{value:me.max},...n},vertexShader:Nn,fragmentShader:Gn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},me=Object.freeze({texture:P,brightness:new i.Vector3(.5,.5,.5),min:0,max:1}),Xn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Kn({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(me),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("u_texture",a.texture),c("u_brightness",a.brightness),c("u_min",a.min),c("u_max",a.max),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Hn=`varying vec2 vUv;

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
}`;const Qn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{u_texture:{value:P},u_map:{value:P},u_mapIntensity:{value:be.mapIntensity},...n},vertexShader:Hn,fragmentShader:Yn,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},be=Object.freeze({texture:P,map:P,mapIntensity:.3}),Zn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Qn({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(be),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("u_texture",a.texture),c("u_map",a.map),c("u_mapIntensity",a.mapIntensity),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Jn=`varying vec2 vUv;

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
}`;const nt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uMap:{value:P},...n},vertexShader:Jn,fragmentShader:et,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},Re=Object.freeze({texture:P,map:P}),tt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=nt({scene:s,size:e,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(Re),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("uTexture",a.texture),c("uMap",a.map),y(C)},[c,y,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var rt=`varying vec2 vUv;

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
}`;const at=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{u_texture:{value:P},u_brightness:{value:xe.brightness},u_saturation:{value:xe.saturation},...n},vertexShader:rt,fragmentShader:ot,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},xe=Object.freeze({texture:P,brightness:1,saturation:1}),it=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=at({scene:s,size:e,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(xe),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("u_texture",a.texture),c("u_brightness",a.brightness),c("u_saturation",a.saturation),y(C)},[c,y,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var ut=`varying vec2 vUv;

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

}`;const lt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),l=u.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uResolution:{value:new i.Vector2},uTextureResolution:{value:new i.Vector2},uTexture:{value:P},...r},vertexShader:ut,fragmentShader:st,...U});return o&&(g.onBeforeCompile=o),g},[o,r]),s=K(n,t);D(l)("uResolution",s.clone());const v=B(e,m,l,i.Mesh);return{material:l,mesh:v}},De=Object.freeze({texture:P}),ct=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=lt({scene:s,size:e,dpr:l.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,dpr:l.fbo,size:e,samples:t,isSizeUpdate:r}),[a,h]=k(De),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{var w,I,A,F,R,z;const{gl:C}=b;return f(x,S),c("uTexture",a.texture),c("uTextureResolution",[((A=(I=(w=a.texture)==null?void 0:w.source)==null?void 0:I.data)==null?void 0:A.width)||0,((z=(R=(F=a.texture)==null?void 0:F.source)==null?void 0:R.data)==null?void 0:z.height)||0]),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var vt=`precision highp float;

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
}`;const pt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uResolution:{value:new i.Vector2(0,0)},uBlurSize:{value:Se.blurSize},...n},vertexShader:vt,fragmentShader:mt,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},Se=Object.freeze({texture:P,blurSize:3,blurPower:5}),ft=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=pt({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),M=u.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[y,a]=te(M),[h,c]=k(Se),p=D(v),f=V(v),T=u.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[u.useCallback((x,S,C)=>{var F,R,z,j,oe,X;const{gl:w}=x;T(S,C),p("uTexture",h.texture),p("uResolution",[((z=(R=(F=h.texture)==null?void 0:F.source)==null?void 0:R.data)==null?void 0:z.width)||0,((X=(oe=(j=h.texture)==null?void 0:j.source)==null?void 0:oe.data)==null?void 0:X.height)||0]),p("uBlurSize",h.blurSize);let I=a(w);const A=h.blurPower;for(let N=0;N<A;N++)p("uTexture",I),I=a(w);return I},[a,p,h,T]),T,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.read.texture}]};var dt=`precision highp float;

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
}`;const ht=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uBackbuffer:{value:P},uBegin:{value:pe.begin},uEnd:{value:pe.end},uStrength:{value:pe.strength},...n},vertexShader:dt,fragmentShader:gt,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},pe=Object.freeze({texture:P,begin:new i.Vector2(0,0),end:new i.Vector2(0,0),strength:.9}),xt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=ht({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),M=u.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[y,a]=te(M),[h,c]=k(pe),p=D(v),f=V(v),T=u.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[u.useCallback((x,S,C)=>{const{gl:w}=x;return T(S,C),p("uTexture",h.texture),p("uBegin",h.begin),p("uEnd",h.end),p("uStrength",h.strength),a(w,({read:I})=>{p("uBackbuffer",I)})},[a,p,T,h]),T,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.read.texture}]};var yt=`varying vec2 vUv;

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
}`;const bt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),o=u.useMemo(()=>{const l=new i.ShaderMaterial({uniforms:{uEpicenter:{value:le.epicenter},uProgress:{value:le.progress},uStrength:{value:le.strength},uWidth:{value:le.width},uMode:{value:0},...n},vertexShader:yt,fragmentShader:Mt,...U});return t&&(l.onBeforeCompile=t),l},[t,n]),m=B(e,r,o,i.Mesh);return{material:o,mesh:m}},le=Object.freeze({epicenter:new i.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),St=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=bt({scene:s,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(le),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("uEpicenter",a.epicenter),c("uProgress",a.progress),c("uWidth",a.width),c("uStrength",a.strength),c("uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var _t=`varying vec2 vUv;

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
}`;const Tt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),l=u.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{u_texture:{value:P},u_resolution:{value:new i.Vector2},u_keyColor:{value:Y.color},u_similarity:{value:Y.similarity},u_smoothness:{value:Y.smoothness},u_spill:{value:Y.spill},u_color:{value:Y.color},u_contrast:{value:Y.contrast},u_brightness:{value:Y.brightness},u_gamma:{value:Y.gamma},...r},vertexShader:_t,fragmentShader:Ct,...U});return o&&(g.onBeforeCompile=o),g},[o,r]),s=K(n,t);D(l)("u_resolution",s.clone());const v=B(e,m,l,i.Mesh);return{material:l,mesh:v}},Y=Object.freeze({texture:P,keyColor:new i.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new i.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),wt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Tt({scene:s,size:e,dpr:l.shader,uniforms:o,onBeforeCompile:m}),d=L(e),[M,y]=$({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=k(Y),c=D(v),p=V(v),f=u.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[u.useCallback((b,x,S)=>{const{gl:C}=b;return f(x,S),c("u_texture",a.texture),c("u_keyColor",a.keyColor),c("u_similarity",a.similarity),c("u_smoothness",a.smoothness),c("u_spill",a.spill),c("u_color",a.color),c("u_contrast",a.contrast),c("u_brightness",a.brightness),c("u_gamma",a.gamma),y(C)},[y,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.texture}]};var Pt=`precision highp float;

varying vec2 vUv;
#usf varyings

#usf uniforms

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf main
	
	gl_Position = usf_Position;
}`,Rt=`precision highp float;

varying vec2 vUv;
#usf varyings

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

#usf uniforms

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf main
	
	gl_FragColor = usf_FragColor;
}`;const Dt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:o})=>{const m=u.useMemo(()=>new i.PlaneGeometry(2,2),[]),l=u.useMemo(()=>{const g=new i.ShaderMaterial({uniforms:{uTexture:{value:P},uBackbuffer:{value:P},uTime:{value:0},uPointer:{value:new i.Vector2},uResolution:{value:new i.Vector2},...r},vertexShader:Pt,fragmentShader:Rt,...U});return g.onBeforeCompile=(d,M)=>{o&&o(d,M),d.fragmentShader=d.fragmentShader.replace(/#usf[^\n]*\n/g,""),d.vertexShader=d.vertexShader.replace(/#usf[^\n]*\n/g,"")},g},[o,r]),s=K(n,t);D(l)("uResolution",s.clone());const v=B(e,m,l,i.Mesh);return{material:l,mesh:v}},Ae=Object.freeze({texture:P,beat:!1}),At=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m})=>{const l=O(n),s=u.useMemo(()=>new i.Scene,[]),{material:v,mesh:g}=Dt({scene:s,size:e,dpr:l.shader,uniforms:o,onBeforeCompile:m}),d=L(e),M=u.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[y,a]=te(M),[h,c]=k(Ae),p=D(v),f=V(v),T=u.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[u.useCallback((x,S,C)=>{const{gl:w,clock:I,pointer:A}=x;return T(S,C),p("uPointer",A),p("uTexture",h.texture),p("uTime",h.beat||I.getElapsedTime()),a(w,({read:F})=>{p("uBackbuffer",F)})},[a,p,h,T]),T,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.read.texture}]},It=({scene:e,geometry:n,material:t})=>{const r=B(e,n,t,i.Points),o=B(e,u.useMemo(()=>n.clone(),[n]),u.useMemo(()=>t.clone(),[t]),i.Mesh);return o.visible=!1,{points:r,interactiveMesh:o}};var Ft=`uniform vec2 uResolution;
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
}`,Ie=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;const Fe=(e,n,t,r,o)=>{var d;const m=t==="position"?"positionTarget":"uvTarget",l=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",s=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",v=t==="position"?"positionsList":"uvsList",g=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new i.BufferAttribute(e[0],o));let M="",y="";e.forEach((a,h)=>{n.setAttribute(`${m}${h}`,new i.BufferAttribute(a,o)),M+=`attribute vec${o} ${m}${h};
`,h===0?y+=`${m}${h}`:y+=`,${m}${h}`}),r=r.replace(`${l}`,M),r=r.replace(`${s}`,`vec${o} ${v}[${e.length}] = vec${o}[](${y});
				${g}
			`)}else r=r.replace(`${l}`,""),r=r.replace(`${s}`,""),(d=n==null?void 0:n.attributes[t])!=null&&d.array||Te&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},Ve=(e,n,t,r)=>{var m;let o=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?o=[n.attributes[t].array,...e]:o=e;const l=Math.max(...o.map(s=>s.length));o.forEach((s,v)=>{if(s.length<l){const g=(l-s.length)/r,d=[],M=Array.from(s);for(let y=0;y<g;y++){const a=Math.floor(s.length/r*Math.random())*r;for(let h=0;h<r;h++)d.push(M[a+h])}o[v]=new Float32Array([...M,...d])}})}return o},Ut=(e,n)=>{let t="";const r={};let o="mapArrayColor = ";return e&&e.length>0?(e.forEach((l,s)=>{const v=`vMapArrayIndex < ${s}.1`,g=`texture2D(uMapArray${s}, uv)`;o+=`( ${v} ) ? ${g} : `,t+=`
        uniform sampler2D uMapArray${s};
      `,r[`uMapArray${s}`]={value:l}}),o+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(o+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",o).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},zt=({size:e,dpr:n,geometry:t,positions:r,uvs:o,mapArray:m,uniforms:l,onBeforeCompile:s})=>{const v=u.useMemo(()=>Ve(r,t,"position",3),[r,t]),g=u.useMemo(()=>Ve(o,t,"uv",2),[o,t]),d=u.useMemo(()=>{v.length!==g.length&&Te&&console.log("use-shader-fx:positions and uvs are not matched");const y=Fe(g,t,"uv",Fe(v,t,"position",Ft,3),2).replace("#usf <getWobble>",Ie),{rewritedFragmentShader:a,mapArrayUniforms:h}=Ut(m,Vt),c=new i.ShaderMaterial({vertexShader:y,fragmentShader:a,blending:i.AdditiveBlending,...U,transparent:!0,uniforms:{uResolution:{value:new i.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:P},uIsPicture:{value:!1},uAlphaPicture:{value:P},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:P},uIsMap:{value:!1},uAlphaMap:{value:P},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:P},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...h,...l}});return s&&(c.onBeforeCompile=s),c},[t,v,g,m,s,l]),M=K(e,n);return D(d)("uResolution",M.clone()),{material:d,modifiedPositions:v,modifiedUvs:g}},Ue=({size:e,dpr:n,scene:t=!1,geometry:r,positions:o,uvs:m,mapArray:l,uniforms:s,onBeforeCompile:v})=>{const g=O(n),d=u.useMemo(()=>{const b=r||new i.SphereGeometry(1,32,32);return b.setIndex(null),b.deleteAttribute("normal"),b},[r]),{material:M,modifiedPositions:y,modifiedUvs:a}=zt({size:e,dpr:g.shader,geometry:d,positions:o,uvs:m,mapArray:l,uniforms:s,onBeforeCompile:v}),{points:h,interactiveMesh:c}=It({scene:t,geometry:d,material:M}),p=D(M),f=V(M);return[u.useCallback((b,x,S)=>{b&&p("uTime",(x==null?void 0:x.beat)||b.clock.getElapsedTime()),x!==void 0&&(p("uMorphProgress",x.morphProgress),p("uBlurAlpha",x.blurAlpha),p("uBlurRadius",x.blurRadius),p("uPointSize",x.pointSize),p("uPointAlpha",x.pointAlpha),x.picture?(p("uPicture",x.picture),p("uIsPicture",!0)):x.picture===!1&&p("uIsPicture",!1),x.alphaPicture?(p("uAlphaPicture",x.alphaPicture),p("uIsAlphaPicture",!0)):x.alphaPicture===!1&&p("uIsAlphaPicture",!1),p("uColor0",x.color0),p("uColor1",x.color1),p("uColor2",x.color2),p("uColor3",x.color3),x.map?(p("uMap",x.map),p("uIsMap",!0)):x.map===!1&&p("uIsMap",!1),x.alphaMap?(p("uAlphaMap",x.alphaMap),p("uIsAlphaMap",!0)):x.alphaMap===!1&&p("uIsAlphaMap",!1),p("uWobbleStrength",x.wobbleStrength),p("uWobblePositionFrequency",x.wobblePositionFrequency),p("uWobbleTimeFrequency",x.wobbleTimeFrequency),p("uWarpStrength",x.warpStrength),p("uWarpPositionFrequency",x.warpPositionFrequency),p("uWarpTimeFrequency",x.warpTimeFrequency),x.displacement?(p("uDisplacement",x.displacement),p("uIsDisplacement",!0)):x.displacement===!1&&p("uIsDisplacement",!1),p("uDisplacementIntensity",x.displacementIntensity),p("uDisplacementColorIntensity",x.displacementColorIntensity),p("uSizeRandomIntensity",x.sizeRandomIntensity),p("uSizeRandomTimeFrequency",x.sizeRandomTimeFrequency),p("uSizeRandomMin",x.sizeRandomMin),p("uSizeRandomMax",x.sizeRandomMax),p("uDivergence",x.divergence),p("uDivergencePoint",x.divergencePoint),f(S))},[p,f]),{points:h,interactiveMesh:c,positions:y,uvs:a}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new i.Vector3(0),beat:!1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:o,geometry:m,positions:l,uvs:s,uniforms:v,onBeforeCompile:g})=>{const d=O(n),M=u.useMemo(()=>new i.Scene,[]),[y,{points:a,interactiveMesh:h,positions:c,uvs:p}]=Ue({scene:M,size:e,dpr:n,geometry:m,positions:l,uvs:s,uniforms:v,onBeforeCompile:g}),[f,T]=$({scene:M,camera:o,size:e,dpr:d.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=u.useCallback((S,C,w)=>(y(S,C,w),T(S.gl)),[T,y]),x=u.useCallback((S,C)=>{y(null,S,C)},[y]);return[b,x,{scene:M,points:a,interactiveMesh:h,renderTarget:f,output:f.texture,positions:c,uvs:p}]};function Et(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},r=e.getIndex(),o=e.getAttribute("position"),m=r?r.count:o.count;let l=0;const s=Object.keys(e.attributes),v={},g={},d=[],M=["getX","getY","getZ","getW"];for(let c=0,p=s.length;c<p;c++){const f=s[c];v[f]=[];const T=e.morphAttributes[f];T&&(g[f]=new Array(T.length).fill(0).map(()=>[]))}const y=Math.log10(1/n),a=Math.pow(10,y);for(let c=0;c<m;c++){const p=r?r.getX(c):c;let f="";for(let T=0,b=s.length;T<b;T++){const x=s[T],S=e.getAttribute(x),C=S.itemSize;for(let w=0;w<C;w++)f+=`${~~(S[M[w]](p)*a)},`}if(f in t)d.push(t[f]);else{for(let T=0,b=s.length;T<b;T++){const x=s[T],S=e.getAttribute(x),C=e.morphAttributes[x],w=S.itemSize,I=v[x],A=g[x];for(let F=0;F<w;F++){const R=M[F];if(I.push(S[R](p)),C)for(let z=0,j=C.length;z<j;z++)A[z].push(C[z][R](p))}}t[f]=l,d.push(l),l++}}const h=e.clone();for(let c=0,p=s.length;c<p;c++){const f=s[c],T=e.getAttribute(f),b=new T.array.constructor(v[f]),x=new ae.BufferAttribute(b,T.itemSize,T.normalized);if(h.setAttribute(f,x),f in g)for(let S=0;S<g[f].length;S++){const C=e.morphAttributes[f][S],w=new C.array.constructor(g[f][S]),I=new ae.BufferAttribute(w,C.itemSize,C.normalized);h.morphAttributes[f][S]=I}}return h.setIndex(d),h}var Bt=`vec3 random3(vec3 c) {
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
		`),n=n.replace("// #usf <getWobble>",`${Ie}`),n=n.replace("void main() {",`
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
		`),n},$t=({baseMaterial:e,materialParameters:n,onBeforeCompile:t,depthOnBeforeCompile:r,isCustomTransmission:o=!1,uniforms:m})=>{const{material:l,depthMaterial:s}=u.useMemo(()=>{const v=new(e||i.MeshPhysicalMaterial)(n||{});Object.assign(v.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:W.wobblePositionFrequency},uWobbleTimeFrequency:{value:W.wobbleTimeFrequency},uWobbleStrength:{value:W.wobbleStrength},uWarpPositionFrequency:{value:W.warpPositionFrequency},uWarpTimeFrequency:{value:W.warpTimeFrequency},uWarpStrength:{value:W.warpStrength},uColor0:{value:W.color0},uColor1:{value:W.color1},uColor2:{value:W.color2},uColor3:{value:W.color3},uColorMix:{value:W.colorMix},uEdgeThreshold:{value:W.edgeThreshold},uEdgeColor:{value:W.edgeColor},uChromaticAberration:{value:W.chromaticAberration},uAnisotropicBlur:{value:W.anisotropicBlur},uDistortion:{value:W.distortion},uDistortionScale:{value:W.distortionScale},uTemporalDistortion:{value:W.temporalDistortion},uRefractionSamples:{value:W.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},...m}}),v.onBeforeCompile=(d,M)=>{Object.assign(d.uniforms,v.userData.uniforms),d.vertexShader=ze(d.vertexShader),d.fragmentShader=d.fragmentShader.replace("#include <color_fragment>",`
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
				`),v.type==="MeshPhysicalMaterial"&&o&&(d.fragmentShader=d.fragmentShader.replace("#include <transmission_pars_fragment>",`${Lt}`),d.fragmentShader=d.fragmentShader.replace("#include <transmission_fragment>",`${kt}`)),t&&t(d,M)},v.needsUpdate=!0;const g=new i.MeshDepthMaterial({depthPacking:i.RGBADepthPacking});return g.onBeforeCompile=(d,M)=>{Object.assign(d.uniforms,v.userData.uniforms),d.vertexShader=ze(d.vertexShader),r&&r(d,M)},g.needsUpdate=!0,{material:v,depthMaterial:g}},[n,e,t,r,m,o]);return{material:l,depthMaterial:s}},Oe=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:o,onBeforeCompile:m,depthOnBeforeCompile:l,uniforms:s})=>{const v=u.useMemo(()=>{let p=n||new i.IcosahedronGeometry(2,20);return p=Et(p),p.computeTangents(),p},[n]),{material:g,depthMaterial:d}=$t({baseMaterial:r,materialParameters:o,onBeforeCompile:m,depthOnBeforeCompile:l,uniforms:s,isCustomTransmission:t}),M=B(e,v,g,i.Mesh),y=g.userData,a=D(y),h=V(y);return[u.useCallback((p,f,T)=>{p&&a("uTime",(f==null?void 0:f.beat)||p.clock.getElapsedTime()),f!==void 0&&(a("uWobbleStrength",f.wobbleStrength),a("uWobblePositionFrequency",f.wobblePositionFrequency),a("uWobbleTimeFrequency",f.wobbleTimeFrequency),a("uWarpStrength",f.warpStrength),a("uWarpPositionFrequency",f.warpPositionFrequency),a("uWarpTimeFrequency",f.warpTimeFrequency),a("uColor0",f.color0),a("uColor1",f.color1),a("uColor2",f.color2),a("uColor3",f.color3),a("uColorMix",f.colorMix),a("uEdgeThreshold",f.edgeThreshold),a("uEdgeColor",f.edgeColor),a("uChromaticAberration",f.chromaticAberration),a("uAnisotropicBlur",f.anisotropicBlur),a("uDistortion",f.distortion),a("uDistortionScale",f.distortionScale),a("uRefractionSamples",f.refractionSamples),a("uTemporalDistortion",f.temporalDistortion),h(T))},[a,h]),{mesh:M,depthMaterial:d}]},W=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new i.Color(16711680),color1:new i.Color(65280),color2:new i.Color(255),color3:new i.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new i.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),Wt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:o,geometry:m,baseMaterial:l,materialParameters:s,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:M})=>{const y=O(n),a=u.useMemo(()=>new i.Scene,[]),[h,{mesh:c,depthMaterial:p}]=Oe({baseMaterial:l,materialParameters:s,scene:a,geometry:m,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:M}),[f,T]=$({scene:a,camera:o,size:e,dpr:y.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=u.useCallback((S,C,w)=>(h(S,C,w),T(S.gl)),[T,h]),x=u.useCallback((S,C)=>{h(null,S,C)},[h]);return[b,x,{scene:a,mesh:c,depthMaterial:p,renderTarget:f,output:f.texture}]},jt=(e,n,t)=>{const r=u.useMemo(()=>{const o=new i.Mesh(n,t);return e.add(o),o},[n,t,e]);return u.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},fe=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-fe.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-fe.easeOutBounce(1-2*e))/2:(1+fe.easeOutBounce(2*e-1))/2}});function qt(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const Nt=(e,n="easeOutQuart")=>{const t=e/60,r=fe[n];return u.useCallback(m=>{let l=m.getElapsedTime()*t;const s=Math.floor(l),v=r(l-s);l=v+s;const g=qt(s);return{beat:l,floor:s,fract:v,hash:g}},[t,r])},Gt=(e=60)=>{const n=u.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=u.useRef(null);return u.useCallback(o=>{const m=o.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},Kt=e=>{var r,o;const n=(r=e.dom)==null?void 0:r.length,t=(o=e.texture)==null?void 0:o.length;return!n||!t||n!==t};var Xt=`varying vec2 vUv;

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
}`;const Yt=({params:e,scene:n,uniforms:t,onBeforeCompile:r})=>{n.children.length>0&&(n.children.forEach(o=>{o instanceof i.Mesh&&(o.geometry.dispose(),o.material.dispose())}),n.remove(...n.children)),e.texture.forEach((o,m)=>{const l=new i.ShaderMaterial({uniforms:{u_texture:{value:o},u_textureResolution:{value:new i.Vector2(0,0)},u_resolution:{value:new i.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[m]?e.boderRadius[m]:0},...t},vertexShader:Xt,fragmentShader:Ht,...U,transparent:!0});r&&(l.onBeforeCompile=r);const s=new i.Mesh(new i.PlaneGeometry(1,1),l);n.add(s)})},Qt=()=>{const e=u.useRef([]),n=u.useRef([]);return u.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:o,params:m})=>{e.current.length>0&&e.current.forEach((s,v)=>{s.unobserve(n.current[v])}),n.current=[],e.current=[];const l=new Array(m.dom.length).fill(!1);r.current=[...l],o.current=[...l],m.dom.forEach((s,v)=>{const g=M=>{M.forEach(y=>{m.onIntersect[v]&&m.onIntersect[v](y),r.current[v]=y.isIntersecting})},d=new IntersectionObserver(g,{rootMargin:"0px",threshold:0});d.observe(s),e.current.push(d),n.current.push(s)})},[])},Zt=()=>{const e=u.useRef([]),n=u.useCallback(({params:t,customParams:r,size:o,resolutionRef:m,scene:l,isIntersectingRef:s})=>{l.children.length!==e.current.length&&(e.current=new Array(l.children.length)),l.children.forEach((v,g)=>{var y,a,h,c,p,f;const d=t.dom[g];if(!d)return;const M=d.getBoundingClientRect();if(e.current[g]=M,v.scale.set(M.width,M.height,1),v.position.set(M.left+M.width*.5-o.width*.5,-M.top-M.height*.5+o.height*.5,0),s.current[g]&&(t.rotation[g]&&v.rotation.copy(t.rotation[g]),v instanceof i.Mesh)){const T=v.material,b=D(T),x=V(T);b("u_texture",t.texture[g]),b("u_textureResolution",[((h=(a=(y=t.texture[g])==null?void 0:y.source)==null?void 0:a.data)==null?void 0:h.width)||0,((f=(p=(c=t.texture[g])==null?void 0:c.source)==null?void 0:p.data)==null?void 0:f.height)||0]),b("u_resolution",m.current.set(M.width,M.height)),b("u_borderRadius",t.boderRadius[g]?t.boderRadius[g]:0),x(r)}})},[]);return[e.current,n]},Jt=()=>{const e=u.useRef([]),n=u.useRef([]),t=u.useCallback((r,o=!1)=>{e.current.forEach((l,s)=>{l&&(n.current[s]=!0)});const m=o?[...n.current]:[...e.current];return r<0?m:m[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},er=e=>({onView:t,onHidden:r})=>{const o=u.useRef(!1);u.useEffect(()=>{let m;const l=()=>{e.current.some(s=>s)?o.current||(t&&t(),o.current=!0):o.current&&(r&&r(),o.current=!1),m=requestAnimationFrame(l)};return m=requestAnimationFrame(l),()=>{cancelAnimationFrame(m)}},[t,r])},Ee={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},nr=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:o,onBeforeCompile:m},l=[])=>{const s=O(n),v=u.useMemo(()=>new i.Scene,[]),g=L(e),[d,M]=$({scene:v,camera:g,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[y,a]=k({...Ee,updateKey:performance.now()}),[h,c]=Zt(),p=u.useRef(new i.Vector2(0,0)),[f,T]=u.useState(!0);u.useMemo(()=>T(!0),l);const b=u.useRef(null),x=u.useMemo(()=>P,[]),S=Qt(),{isIntersectingOnceRef:C,isIntersectingRef:w,isIntersecting:I}=Jt(),A=er(w),F=u.useMemo(()=>(z,j)=>{a(z),c({params:y,customParams:j,size:e,resolutionRef:p,scene:v,isIntersectingRef:w})},[w,a,c,e,v,y]);return[u.useCallback((z,j,oe)=>{const{gl:X,size:N}=z;if(F(j,oe),Kt(y))return x;if(f){if(b.current===y.updateKey)return x;b.current=y.updateKey}return f&&(Yt({params:y,size:N,scene:v,uniforms:o,onBeforeCompile:m}),S({isIntersectingRef:w,isIntersectingOnceRef:C,params:y}),T(!1)),M(X)},[M,o,S,m,f,v,y,C,w,x,F]),F,{scene:v,camera:g,renderTarget:d,output:d.texture,isIntersecting:I,DOMRects:h,intersections:w.current,useDomView:A}]},tr=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:o=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1},v)=>{const g=u.useRef([]),d=K(t,r);g.current=u.useMemo(()=>Array.from({length:v},()=>{const y=new i.WebGLRenderTarget(d.x,d.y,{...ve,samples:m,depthBuffer:l});return s&&(y.depthTexture=new i.DepthTexture(d.x,d.y,i.FloatType)),y}),[v]),o&&g.current.forEach(y=>y.setSize(d.x,d.y)),u.useEffect(()=>{const y=g.current;return()=>{y.forEach(a=>a.dispose())}},[v]);const M=u.useCallback((y,a,h)=>{const c=g.current[a];return ge({gl:y,scene:e,camera:n,fbo:c,onBeforeRender:()=>h&&h({read:c.texture})}),c.texture},[e,n]);return[g.current,M]};_.ALPHABLENDING_PARAMS=Re,_.BLANK_PARAMS=Ae,_.BLENDING_PARAMS=ue,_.BRIGHTNESSPICKER_PARAMS=me,_.BRUSH_PARAMS=Q,_.CHROMAKEY_PARAMS=Y,_.COLORSTRATA_PARAMS=H,_.COSPALETTE_PARAMS=ie,_.COVERTEXTURE_PARAMS=De,_.DELTA_TIME=Me,_.DOMSYNCER_PARAMS=Ee,_.DUOTONE_PARAMS=he,_.Easing=fe,_.FBO_OPTION=ve,_.FLUID_PARAMS=we,_.FXBLENDING_PARAMS=be,_.FXTEXTURE_PARAMS=ne,_.HSV_PARAMS=xe,_.MARBLE_PARAMS=re,_.MORPHPARTICLES_PARAMS=E,_.MOTIONBLUR_PARAMS=pe,_.NOISE_PARAMS=ee,_.RIPPLE_PARAMS=Pe,_.SIMPLEBLUR_PARAMS=Se,_.WAVE_PARAMS=le,_.WOBBLE3D_PARAMS=W,_.renderFBO=ge,_.setCustomUniform=V,_.setUniform=D,_.useAddMesh=jt,_.useAlphaBlending=tt,_.useBeat=Nt,_.useBlank=At,_.useBlending=kn,_.useBrightnessPicker=Xn,_.useBrush=Ne,_.useCamera=L,_.useChromaKey=wt,_.useColorStrata=Cn,_.useCopyTexture=tr,_.useCosPalette=Fn,_.useCoverTexture=ct,_.useCreateMorphParticles=Ue,_.useCreateWobble3D=Oe,_.useDomSyncer=nr,_.useDoubleFBO=te,_.useDuoTone=On,_.useFPSLimiter=Gt,_.useFluid=mn,_.useFxBlending=Zn,_.useFxTexture=qn,_.useHSV=it,_.useMarble=Rn,_.useMorphParticles=Ot,_.useMotionBlur=xt,_.useNoise=Mn,_.useParams=k,_.usePointer=de,_.useResolution=K,_.useRipple=gn,_.useSimpleBlur=ft,_.useSingleFBO=$,_.useWave=St,_.useWobble3D=Wt,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
