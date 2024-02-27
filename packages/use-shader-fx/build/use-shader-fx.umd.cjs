(function(x,k){typeof exports=="object"&&typeof module<"u"?k(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],k):(x=typeof globalThis<"u"?globalThis:x||self,k(x["use-shader-fx"]={},x.THREE,x.React))})(this,function(x,k,s){"use strict";function xe(e){const u=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const o in e)if(o!=="default"){const a=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(u,o,a.get?a:{enumerable:!0,get:()=>e[o]})}}return u.default=e,Object.freeze(u)}const n=xe(k);var he=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ye=`precision highp float;

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
}`;const F=(e,u=!1)=>{const o=u?e.width*u:e.width,a=u?e.height*u:e.height;return s.useMemo(()=>new n.Vector2(o,a),[o,a])},D=(e,u,o)=>{const a=s.useMemo(()=>new n.Mesh(u,o),[u,o]);return s.useEffect(()=>{e.add(a)},[e,a]),s.useEffect(()=>()=>{e.remove(a),u.dispose(),o.dispose()},[e,u,o,a]),a},i=(e,u,o)=>{e.uniforms&&e.uniforms[u]&&o!==void 0&&o!==null?e.uniforms[u].value=o:console.error(`Uniform key "${String(u)}" does not exist in the material. or "${String(u)}" is null | undefined`)},Me=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uBuffer:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uTexture:{value:new n.Texture},uIsTexture:{value:!1},uMap:{value:new n.Texture},uIsMap:{value:!1},uMapIntensity:{value:0},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(-10,-10)},uPrevMouse:{value:new n.Vector2(-10,-10)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Vector3(1,0,0)},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:he,fragmentShader:ye}),[]),l=F(u,o);return s.useEffect(()=>{i(t,"uResolution",l.clone())},[l,t]),D(e,a,t),t},_e=(e,u)=>{const o=u,a=e/u,[t,l]=[o*a/2,o/2];return{width:t,height:l,near:-1e3,far:1e3}},C=e=>{const u=F(e),{width:o,height:a,near:t,far:l}=_e(u.x,u.y);return s.useMemo(()=>new n.OrthographicCamera(-o,o,a,-a,t,l),[o,a,t,l])},j=(e=0)=>{const u=s.useRef(new n.Vector2(0,0)),o=s.useRef(new n.Vector2(0,0)),a=s.useRef(new n.Vector2(0,0)),t=s.useRef(0),l=s.useRef(new n.Vector2(0,0)),v=s.useRef(!1);return s.useCallback(r=>{const c=performance.now();let p;v.current&&e?(a.current=a.current.lerp(r,1-e),p=a.current.clone()):(p=r.clone(),a.current=p),t.current===0&&(t.current=c,u.current=p);const d=Math.max(1,c-t.current);t.current=c,l.current.copy(p).sub(u.current).divideScalar(d);const m=l.current.length()>0,g=v.current?u.current.clone():p;return!v.current&&m&&(v.current=!0),u.current=p,{currentPointer:p,prevPointer:g,diffPointer:o.current.subVectors(p,g),velocity:l.current,isVelocityUpdate:m}},[e])},b=e=>{const u=t=>Object.values(t).some(l=>typeof l=="function"),o=s.useRef(u(e)?e:structuredClone(e)),a=s.useCallback(t=>{for(const l in t){const v=l;v in o.current&&t[v]!==void 0&&t[v]!==null?o.current[v]=t[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[o.current,a]},G={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,stencilBuffer:!1},q=({gl:e,fbo:u,scene:o,camera:a,onBeforeRender:t,onSwap:l})=>{e.setRenderTarget(u),t(),e.clear(),e.render(o,a),l&&l(),e.setRenderTarget(null),e.clear()},R=({scene:e,camera:u,size:o,dpr:a=!1,isSizeUpdate:t=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1})=>{const r=s.useRef(),c=F(o,a);r.current=s.useMemo(()=>{const d=new n.WebGLRenderTarget(c.x,c.y,{...G,samples:l,depthBuffer:v});return f&&(d.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),d},[]),s.useLayoutEffect(()=>{var d;t&&((d=r.current)==null||d.setSize(c.x,c.y))},[c,t]),s.useEffect(()=>{const d=r.current;return()=>{d==null||d.dispose()}},[]);const p=s.useCallback((d,m)=>{const g=r.current;return q({gl:d,fbo:g,scene:e,camera:u,onBeforeRender:()=>m&&m({read:g.texture})}),g.texture},[e,u]);return[r.current,p]},z=({scene:e,camera:u,size:o,dpr:a=!1,isSizeUpdate:t=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1})=>{const r=s.useRef({read:null,write:null,swap:function(){let m=this.read;this.read=this.write,this.write=m}}),c=F(o,a),p=s.useMemo(()=>{const m=new n.WebGLRenderTarget(c.x,c.y,{...G,samples:l,depthBuffer:v}),g=new n.WebGLRenderTarget(c.x,c.y,{...G,samples:l,depthBuffer:v});return f&&(m.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType),g.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),{read:m,write:g}},[]);r.current.read=p.read,r.current.write=p.write,s.useLayoutEffect(()=>{var m,g;t&&((m=r.current.read)==null||m.setSize(c.x,c.y),(g=r.current.write)==null||g.setSize(c.x,c.y))},[c,t]),s.useEffect(()=>{const m=r.current;return()=>{var g,h;(g=m.read)==null||g.dispose(),(h=m.write)==null||h.dispose()}},[]);const d=s.useCallback((m,g)=>{var M;const h=r.current;return q({gl:m,scene:e,camera:u,fbo:h.write,onBeforeRender:()=>g&&g({read:h.read.texture,write:h.write.texture}),onSwap:()=>h.swap()}),(M=h.read)==null?void 0:M.texture},[e,u]);return[{read:r.current.read,write:r.current.write},d]},X={texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1},we=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Me({scene:a,size:e,dpr:u}),l=C(e),v=j(),[f,r]=z({scene:a,camera:l,size:e,dpr:u,samples:o}),[c,p]=b(X),d=s.useRef(null);return[s.useCallback((g,h)=>{const{gl:M,pointer:w}=g;h&&p(h),c.texture?(i(t,"uIsTexture",!0),i(t,"uTexture",c.texture)):i(t,"uIsTexture",!1),c.map?(i(t,"uIsMap",!0),i(t,"uMap",c.map),i(t,"uMapIntensity",c.mapIntensity)):i(t,"uIsMap",!1),i(t,"uRadius",c.radius),i(t,"uSmudge",c.smudge),i(t,"uDissipation",c.dissipation),i(t,"uMotionBlur",c.motionBlur),i(t,"uMotionSample",c.motionSample);const _=c.pointerValues||v(w);_.isVelocityUpdate&&(i(t,"uMouse",_.currentPointer),i(t,"uPrevMouse",_.prevPointer)),i(t,"uVelocity",_.velocity);const S=typeof c.color=="function"?c.color(_.velocity):c.color;return i(t,"uColor",S),i(t,"uIsCursor",c.isCursor),i(t,"uPressureEnd",c.pressure),d.current===null&&(d.current=c.pressure),i(t,"uPressureStart",d.current),d.current=c.pressure,r(M,({read:T})=>{i(t,"uBuffer",T)})},[t,v,r,c,p]),p,{scene:a,material:t,camera:l,renderTarget:f,output:f.read.texture}]};var O=`varying vec2 vUv;
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
}`,Se=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Te=()=>s.useMemo(()=>new n.ShaderMaterial({vertexShader:O,fragmentShader:Se,depthTest:!1,depthWrite:!1}),[]);var Ce=`precision highp float;

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
}`;const be=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:O,fragmentShader:Ce}),[]);var Re=`precision highp float;

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
}`;const De=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Re}),[]);var Pe=`precision highp float;

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
}`;const Ae=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Pe}),[]);var Ve=`precision highp float;

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
}`;const Ue=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Ve}),[]);var Fe=`precision highp float;

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
}`;const Ie=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Fe}),[]);var Oe=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Be=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Oe}),[]);var Ee=`precision highp float;

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
}`;const Le=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:Ee}),[]);var ze=`precision highp float;

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
}`;const $e=()=>s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:O,fragmentShader:ze}),[]),ke=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=Te(),l=t.clone(),v=Ue(),f=Ie(),r=be(),c=De(),p=Ae(),d=Be(),m=Le(),g=$e(),h=s.useMemo(()=>({vorticityMaterial:f,curlMaterial:v,advectionMaterial:r,divergenceMaterial:c,pressureMaterial:p,clearMaterial:d,gradientSubtractMaterial:m,splatMaterial:g}),[f,v,r,c,p,d,m,g]),M=F(u,o);s.useEffect(()=>{i(h.splatMaterial,"aspectRatio",M.x/M.y);for(const S of Object.values(h))i(S,"texelSize",new n.Vector2(1/M.x,1/M.y))},[M,h]);const w=D(e,a,t);s.useEffect(()=>{t.dispose(),w.material=l},[t,w,l]),s.useEffect(()=>()=>{for(const S of Object.values(h))S.dispose()},[h]);const _=s.useCallback(S=>{w.material=S,w.material.needsUpdate=!0},[w]);return[h,_]},Y={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new n.Vector3(1,1,1),pointerValues:!1},Ge=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),[t,l]=ke({scene:a,size:e,dpr:u}),v=C(e),f=j(),r=s.useMemo(()=>({scene:a,camera:v,size:e,samples:o}),[a,v,e,o]),[c,p]=z(r),[d,m]=z(r),[g,h]=R(r),[M,w]=R(r),[_,S]=z(r),T=s.useRef(0),U=s.useRef(new n.Vector2(0,0)),V=s.useRef(new n.Vector3(0,0,0)),[y,A]=b(Y);return[s.useCallback((E,L)=>{const{gl:I,pointer:vn,clock:H,size:de}=E;L&&A(L),T.current===0&&(T.current=H.getElapsedTime());const pe=Math.min((H.getElapsedTime()-T.current)/3,.02);T.current=H.getElapsedTime();const K=p(I,({read:P})=>{l(t.advectionMaterial),i(t.advectionMaterial,"uVelocity",P),i(t.advectionMaterial,"uSource",P),i(t.advectionMaterial,"dt",pe),i(t.advectionMaterial,"dissipation",y.velocity_dissipation)}),mn=m(I,({read:P})=>{l(t.advectionMaterial),i(t.advectionMaterial,"uVelocity",K),i(t.advectionMaterial,"uSource",P),i(t.advectionMaterial,"dissipation",y.density_dissipation)}),W=y.pointerValues||f(vn);W.isVelocityUpdate&&(p(I,({read:P})=>{l(t.splatMaterial),i(t.splatMaterial,"uTarget",P),i(t.splatMaterial,"point",W.currentPointer);const $=W.diffPointer.multiply(U.current.set(de.width,de.height).multiplyScalar(y.velocity_acceleration));i(t.splatMaterial,"color",V.current.set($.x,$.y,1)),i(t.splatMaterial,"radius",y.splat_radius)}),m(I,({read:P})=>{l(t.splatMaterial),i(t.splatMaterial,"uTarget",P);const $=typeof y.fluid_color=="function"?y.fluid_color(W.velocity):y.fluid_color;i(t.splatMaterial,"color",$)}));const fn=h(I,()=>{l(t.curlMaterial),i(t.curlMaterial,"uVelocity",K)});p(I,({read:P})=>{l(t.vorticityMaterial),i(t.vorticityMaterial,"uVelocity",P),i(t.vorticityMaterial,"uCurl",fn),i(t.vorticityMaterial,"curl",y.curl_strength),i(t.vorticityMaterial,"dt",pe)});const dn=w(I,()=>{l(t.divergenceMaterial),i(t.divergenceMaterial,"uVelocity",K)});S(I,({read:P})=>{l(t.clearMaterial),i(t.clearMaterial,"uTexture",P),i(t.clearMaterial,"value",y.pressure_dissipation)}),l(t.pressureMaterial),i(t.pressureMaterial,"uDivergence",dn);let ge;for(let P=0;P<y.pressure_iterations;P++)ge=S(I,({read:$})=>{i(t.pressureMaterial,"uPressure",$)});return p(I,({read:P})=>{l(t.gradientSubtractMaterial),i(t.gradientSubtractMaterial,"uPressure",ge),i(t.gradientSubtractMaterial,"uVelocity",P)}),mn},[t,l,h,m,w,f,S,p,A,y]),A,{scene:a,materials:t,camera:v,renderTarget:{velocity:c,density:d,curl:g,divergence:M,pressure:_},output:d.read.texture}]},Ne=({scale:e,max:u,texture:o,scene:a})=>{const t=s.useRef([]),l=s.useMemo(()=>new n.PlaneGeometry(e,e),[e]),v=s.useMemo(()=>new n.MeshBasicMaterial({map:o,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[o]);return s.useEffect(()=>{for(let f=0;f<u;f++){const r=new n.Mesh(l.clone(),v.clone());r.rotateZ(2*Math.PI*Math.random()),r.visible=!1,a.add(r),t.current.push(r)}},[l,v,a,u]),s.useEffect(()=>()=>{t.current.forEach(f=>{f.geometry.dispose(),Array.isArray(f.material)?f.material.forEach(r=>r.dispose()):f.material.dispose(),a.remove(f)}),t.current=[]},[a]),t.current},Q={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1},je=({texture:e=new n.Texture,scale:u=64,max:o=100,size:a,dpr:t,samples:l=0})=>{const v=s.useMemo(()=>new n.Scene,[]),f=Ne({scale:u,max:o,texture:e,scene:v}),r=C(a),c=j(),[p,d]=R({scene:v,camera:r,size:a,dpr:t,samples:l}),[m,g]=b(Q),h=s.useRef(0);return[s.useCallback((w,_)=>{const{gl:S,pointer:T,size:U}=w;_&&g(_);const V=m.pointerValues||c(T);if(m.frequency<V.diffPointer.length()){const y=f[h.current];y.visible=!0,y.position.set(V.currentPointer.x*(U.width/2),V.currentPointer.y*(U.height/2),0),y.scale.x=y.scale.y=0,y.material.opacity=m.alpha,h.current=(h.current+1)%o}return f.forEach(y=>{if(y.visible){const A=y.material;y.rotation.z+=m.rotation,A.opacity*=m.fadeout_speed,y.scale.x=m.fadeout_speed*y.scale.x+m.scale,y.scale.y=y.scale.x,A.opacity<.002&&(y.visible=!1)}}),d(S)},[d,f,c,o,m,g]),g,{scene:v,camera:r,meshArr:f,renderTarget:p,output:p.texture}]};var qe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,We=`precision highp float;
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
}`;const He=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new n.Vector2},warpStrength:{value:0}},vertexShader:qe,fragmentShader:We}),[]);return D(e,u,o),o},Z={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new n.Vector2(2,2),warpStrength:8,beat:!1},Ke=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=He(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(Z);return[s.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&c(m),i(t,"scale",r.scale),i(t,"timeStrength",r.timeStrength),i(t,"noiseOctaves",r.noiseOctaves),i(t,"fbmOctaves",r.fbmOctaves),i(t,"warpOctaves",r.warpOctaves),i(t,"warpDirection",r.warpDirection),i(t,"warpStrength",r.warpStrength),i(t,"uTime",r.beat||h.getElapsedTime()),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Xe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ye=`precision highp float;
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
}`;const Qe=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new n.Texture},noiseStrength:{value:new n.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new n.Vector2(.1,.1)},laminateDetail:{value:new n.Vector2(1,1)},distortion:{value:new n.Vector2(0,0)},colorFactor:{value:new n.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new n.Vector2(0,0)}},vertexShader:Xe,fragmentShader:Ye}),[]);return D(e,u,o),o},J={texture:!1,scale:1,laminateLayer:1,laminateInterval:new n.Vector2(.1,.1),laminateDetail:new n.Vector2(1,1),distortion:new n.Vector2(0,0),colorFactor:new n.Vector3(1,1,1),timeStrength:new n.Vector2(0,0),noise:!1,noiseStrength:new n.Vector2(0,0),beat:!1},Ze=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Qe(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(J);return[s.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&c(m),r.texture?(i(t,"uTexture",r.texture),i(t,"isTexture",!0)):(i(t,"isTexture",!1),i(t,"scale",r.scale)),r.noise?(i(t,"noise",r.noise),i(t,"isNoise",!0),i(t,"noiseStrength",r.noiseStrength)):i(t,"isNoise",!1),i(t,"uTime",r.beat||h.getElapsedTime()),i(t,"laminateLayer",r.laminateLayer),i(t,"laminateInterval",r.laminateInterval),i(t,"laminateDetail",r.laminateDetail),i(t,"distortion",r.distortion),i(t,"colorFactor",r.colorFactor),i(t,"timeStrength",r.timeStrength),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Je=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,et=`precision highp float;

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
}`;const tt=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:0},u_complexity:{value:0},u_complexityAttenuation:{value:0},u_iterations:{value:0},u_timeStrength:{value:0},u_scale:{value:0}},vertexShader:Je,fragmentShader:et}),[]);return D(e,u,o),o},ee={pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1},nt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=tt(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(ee);return[s.useCallback((d,m)=>{const{gl:g,clock:h}=d;return m&&c(m),i(t,"u_pattern",r.pattern),i(t,"u_complexity",r.complexity),i(t,"u_complexityAttenuation",r.complexityAttenuation),i(t,"u_iterations",r.iterations),i(t,"u_timeStrength",r.timeStrength),i(t,"u_scale",r.scale),i(t,"u_time",r.beat||h.getElapsedTime()),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var rt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ot=`precision highp float;
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
}`;const ut=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uRgbWeight:{value:new n.Vector3(.299,.587,.114)},uColor1:{value:new n.Color().set(.5,.5,.5)},uColor2:{value:new n.Color().set(.5,.5,.5)},uColor3:{value:new n.Color().set(1,1,1)},uColor4:{value:new n.Color().set(0,.1,.2)}},vertexShader:rt,fragmentShader:ot}),[]);return D(e,u,o),o},te={texture:new n.Texture,color1:new n.Color().set(.5,.5,.5),color2:new n.Color().set(.5,.5,.5),color3:new n.Color().set(1,1,1),color4:new n.Color().set(0,.1,.2),rgbWeight:new n.Vector3(.299,.587,.114)},at=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=ut(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(te);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"uTexture",r.texture),i(t,"uColor1",r.color1),i(t,"uColor2",r.color2),i(t,"uColor3",r.color3),i(t,"uColor4",r.color4),i(t,"uRgbWeight",r.rgbWeight),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var it=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,st=`precision highp float;

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
}`;const lt=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:it,fragmentShader:st}),[]);return D(e,u,o),o},ne={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},ct=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=lt(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(ne);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"uTexture",r.texture),i(t,"uColor0",r.color0),i(t,"uColor1",r.color1),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var vt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,mt=`precision highp float;

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
}`;const ft=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_alphaMap:{value:new n.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new n.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:vt,fragmentShader:mt}),[]);return D(e,u,o),o},re={texture:new n.Texture,map:new n.Texture,alphaMap:!1,mapIntensity:.3,brightness:new n.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},dt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=ft(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(re);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"u_texture",r.texture),i(t,"u_map",r.map),i(t,"u_mapIntensity",r.mapIntensity),r.alphaMap?(i(t,"u_alphaMap",r.alphaMap),i(t,"u_isAlphaMap",!0)):i(t,"u_isAlphaMap",!1),i(t,"u_brightness",r.brightness),i(t,"u_min",r.min),i(t,"u_max",r.max),r.dodgeColor?(i(t,"u_dodgeColor",r.dodgeColor),i(t,"u_isDodgeColor",!0)):i(t,"u_isDodgeColor",!1),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var pt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,gt=`precision highp float;

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

}`;const xt=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},padding:{value:0},uMap:{value:new n.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new n.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:pt,fragmentShader:gt}),[]),l=F(u,o);return s.useEffect(()=>{i(t,"uResolution",l.clone())},[l,t]),D(e,a,t),t},oe={texture0:new n.Texture,texture1:new n.Texture,padding:0,map:new n.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new n.Vector2(0,0),progress:0,dir:new n.Vector2(0,0)},ht=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=xt({scene:a,size:e,dpr:u}),l=C(e),[v,f]=R({scene:a,camera:l,dpr:u,size:e,samples:o,isSizeUpdate:!0}),[r,c]=b(oe);return[s.useCallback((d,m)=>{var _,S,T,U,V,y,A,B;const{gl:g}=d;m&&c(m),i(t,"uTexture0",r.texture0),i(t,"uTexture1",r.texture1),i(t,"progress",r.progress);const h=[((S=(_=r.texture0)==null?void 0:_.image)==null?void 0:S.width)||0,((U=(T=r.texture0)==null?void 0:T.image)==null?void 0:U.height)||0],M=[((y=(V=r.texture1)==null?void 0:V.image)==null?void 0:y.width)||0,((B=(A=r.texture1)==null?void 0:A.image)==null?void 0:B.height)||0],w=h.map((E,L)=>E+(M[L]-E)*r.progress);return i(t,"uTextureResolution",w),i(t,"padding",r.padding),i(t,"uMap",r.map),i(t,"mapIntensity",r.mapIntensity),i(t,"edgeIntensity",r.edgeIntensity),i(t,"epicenter",r.epicenter),i(t,"dirX",r.dir.x),i(t,"dirY",r.dir.y),f(g)},[f,t,r,c]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var yt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Mt=`precision highp float;

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
}`;const _t=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:yt,fragmentShader:Mt}),[]);return D(e,u,o),o},ue={texture:new n.Texture,brightness:new n.Vector3(.5,.5,.5),min:0,max:1},wt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=_t(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(ue);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"u_texture",r.texture),i(t,"u_brightness",r.brightness),i(t,"u_min",r.min),i(t,"u_max",r.max),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var St=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Tt=`precision highp float;

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
}`;const Ct=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0}},vertexShader:St,fragmentShader:Tt}),[]);return D(e,u,o),o},ae={texture:new n.Texture,map:new n.Texture,mapIntensity:.3},bt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Ct(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(ae);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"u_texture",r.texture),i(t,"u_map",r.map),i(t,"u_mapIntensity",r.mapIntensity),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Rt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Dt=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const Pt=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uMap:{value:new n.Texture}},vertexShader:Rt,fragmentShader:Dt}),[]);return D(e,a,t),t},ie={texture:new n.Texture,map:new n.Texture},At=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Pt({scene:a,size:e,dpr:u}),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(ie);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"uTexture",r.texture),i(t,"uMap",r.map),f(g)},[t,f,r,c]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Vt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ut=`precision highp float;

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
}`;const Ft=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:1},u_saturation:{value:1}},vertexShader:Vt,fragmentShader:Ut}),[]);return D(e,a,t),t},se={texture:new n.Texture,brightness:1,saturation:1},It=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Ft({scene:a,size:e,dpr:u}),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(se);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"u_texture",r.texture),i(t,"u_brightness",r.brightness),i(t,"u_saturation",r.saturation),f(g)},[t,f,r,c]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Ot=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Bt=`precision highp float;

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

}`;const Et=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture:{value:new n.Texture}},vertexShader:Ot,fragmentShader:Bt}),[]),l=F(u,o);return s.useEffect(()=>{i(t,"uResolution",l.clone())},[l,t]),D(e,a,t),t},le={texture:new n.Texture},Lt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Et({scene:a,size:e,dpr:u}),l=C(e),[v,f]=R({scene:a,camera:l,dpr:u,size:e,samples:o,isSizeUpdate:!0}),[r,c]=b(le);return[s.useCallback((d,m)=>{var h,M,w,_,S,T;const{gl:g}=d;return m&&c(m),i(t,"uTexture",r.texture),i(t,"uTextureResolution",[((w=(M=(h=r.texture)==null?void 0:h.source)==null?void 0:M.data)==null?void 0:w.width)||0,((T=(S=(_=r.texture)==null?void 0:_.source)==null?void 0:S.data)==null?void 0:T.height)||0]),f(g)},[f,t,r,c]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var zt=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,$t=`precision mediump float;

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
}`;const kt=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:zt,fragmentShader:$t}),[]);return D(e,u,o),o},ce={texture:new n.Texture,blurSize:3,blurPower:5},Gt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=kt(a),l=C(e),v=s.useMemo(()=>({scene:a,camera:l,size:e,dpr:u,samples:o}),[a,l,e,u,o]),[f,r]=R(v),[c,p]=z(v),[d,m]=b(ce);return[s.useCallback((h,M)=>{var T,U,V,y,A,B;const{gl:w}=h;M&&m(M),i(t,"uTexture",d.texture),i(t,"uResolution",[((V=(U=(T=d.texture)==null?void 0:T.source)==null?void 0:U.data)==null?void 0:V.width)||0,((B=(A=(y=d.texture)==null?void 0:y.source)==null?void 0:A.data)==null?void 0:B.height)||0]),i(t,"uBlurSize",d.blurSize);let _=p(w);const S=d.blurPower;for(let E=0;E<S;E++)i(t,"uTexture",_),_=p(w);return r(w)},[r,p,t,m,d]),m,{scene:a,material:t,camera:l,renderTarget:f,output:f.texture}]};var Nt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,jt=`precision highp float;

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
}`;const qt=e=>{const u=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=s.useMemo(()=>new n.ShaderMaterial({uniforms:{uEpicenter:{value:new n.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uMode:{value:0}},vertexShader:Nt,fragmentShader:jt}),[]);return D(e,u,o),o},ve={epicenter:new n.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},Wt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=qt(a),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o,isSizeUpdate:!0}),[r,c]=b(ve);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"uEpicenter",r.epicenter),i(t,"uProgress",r.progress),i(t,"uWidth",r.width),i(t,"uStrength",r.strength),i(t,"uMode",r.mode==="center"?0:r.mode==="horizontal"?1:2),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]};var Ht=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Kt=`precision highp float;
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
}`;const Xt=({scene:e,size:u,dpr:o})=>{const a=s.useMemo(()=>new n.PlaneGeometry(2,2),[]),t=s.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_resolution:{value:new n.Vector2},u_keyColor:{value:new n.Color},u_similarity:{value:0},u_smoothness:{value:0},u_spill:{value:0},u_color:{value:new n.Vector4},u_contrast:{value:0},u_brightness:{value:0},u_gamma:{value:0}},vertexShader:Ht,fragmentShader:Kt}),[]),l=F(u,o);return s.useEffect(()=>{i(t,"u_resolution",l.clone())},[l,t]),D(e,a,t),t},me={texture:new n.Texture,keyColor:new n.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new n.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1},Yt=({size:e,dpr:u,samples:o=0})=>{const a=s.useMemo(()=>new n.Scene,[]),t=Xt({scene:a,size:e,dpr:u}),l=C(e),[v,f]=R({scene:a,camera:l,size:e,dpr:u,samples:o}),[r,c]=b(me);return[s.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),i(t,"u_texture",r.texture),i(t,"u_keyColor",r.keyColor),i(t,"u_similarity",r.similarity),i(t,"u_smoothness",r.smoothness),i(t,"u_spill",r.spill),i(t,"u_color",r.color),i(t,"u_contrast",r.contrast),i(t,"u_brightness",r.brightness),i(t,"u_gamma",r.gamma),f(g)},[f,t,c,r]),c,{scene:a,material:t,camera:l,renderTarget:v,output:v.texture}]},Qt=({scene:e,camera:u,size:o,dpr:a=!1,isSizeUpdate:t=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1},r)=>{const c=s.useRef([]),p=F(o,a);c.current=s.useMemo(()=>Array.from({length:r},()=>{const m=new n.WebGLRenderTarget(p.x,p.y,{...G,samples:l,depthBuffer:v});return f&&(m.depthTexture=new n.DepthTexture(p.x,p.y,n.FloatType)),m}),[r]),s.useLayoutEffect(()=>{t&&c.current.forEach(m=>m.setSize(p.x,p.y))},[p,t]),s.useEffect(()=>{const m=c.current;return()=>{m.forEach(g=>g.dispose())}},[r]);const d=s.useCallback((m,g,h)=>{const M=c.current[g];return q({gl:m,scene:e,camera:u,fbo:M,onBeforeRender:()=>h&&h({read:M.texture})}),M.texture},[e,u]);return[c.current,d]},N=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const o=2.5949095;return e<.5?Math.pow(2*e,2)*((o+1)*2*e-o)/2:(Math.pow(2*e-2,2)*((o+1)*(e*2-2)+o)+2)/2},easeInElastic(e){const u=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*u)},easeOutElastic(e){const u=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*u)+1},easeInOutElastic(e){const u=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*u))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*u)/2+1},easeInBounce(e){return 1-N.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-N.easeOutBounce(1-2*e))/2:(1+N.easeOutBounce(2*e-1))/2}});function Zt(e){let u=Math.sin(e*12.9898)*43758.5453;return u-Math.floor(u)}const Jt=(e,u="easeOutQuart")=>{const o=e/60,a=N[u];return s.useCallback(l=>{let v=l.getElapsedTime()*o;const f=Math.floor(v),r=a(v-f);v=r+f;const c=Zt(f);return{beat:v,floor:f,fract:r,hash:c}},[o,a])},en=(e=60)=>{const u=s.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),o=s.useRef(null);return s.useCallback(t=>{const l=t.getElapsedTime();return o.current===null||l-o.current>=u?(o.current=l,!0):!1},[u])},tn=e=>{var a,t;const u=(a=e.dom)==null?void 0:a.length,o=(t=e.texture)==null?void 0:t.length;return!u||!o||u!==o};var nn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,rn=`precision highp float;

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
}`;const on=({params:e,size:u,scene:o})=>{o.children.length>0&&(o.children.forEach(a=>{a instanceof n.Mesh&&(a.geometry.dispose(),a.material.dispose())}),o.remove(...o.children)),e.texture.forEach((a,t)=>{const l=new n.Mesh(new n.PlaneGeometry(1,1),new n.ShaderMaterial({vertexShader:nn,fragmentShader:rn,transparent:!0,uniforms:{u_texture:{value:a},u_textureResolution:{value:new n.Vector2(0,0)},u_resolution:{value:new n.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[t]?e.boderRadius[t]:0}}}));o.add(l)})},un=()=>{const e=s.useRef([]),u=s.useRef([]);return s.useCallback(({isIntersectingRef:a,isIntersectingOnceRef:t,params:l})=>{e.current.length>0&&e.current.forEach((f,r)=>{f.unobserve(u.current[r])}),u.current=[],e.current=[];const v=new Array(l.dom.length).fill(!1);a.current=[...v],t.current=[...v],l.dom.forEach((f,r)=>{const c=d=>{d.forEach(m=>{l.onIntersect[r]&&l.onIntersect[r](m),a.current[r]=m.isIntersecting})},p=new IntersectionObserver(c,{rootMargin:"0px",threshold:0});p.observe(f),e.current.push(p),u.current.push(f)})},[])},an=()=>{const e=s.useRef([]),u=s.useCallback(({params:o,size:a,resolutionRef:t,scene:l,isIntersectingRef:v})=>{l.children.length!==e.current.length&&(e.current=new Array(l.children.length)),l.children.forEach((f,r)=>{var d,m,g,h,M,w;const c=o.dom[r];if(!c)return;const p=c.getBoundingClientRect();if(e.current[r]=p,f.scale.set(p.width,p.height,1),f.position.set(p.left+p.width*.5-a.width*.5,-p.top-p.height*.5+a.height*.5,0),v.current[r]&&(o.rotation[r]&&f.rotation.copy(o.rotation[r]),f instanceof n.Mesh)){const _=f.material;i(_,"u_texture",o.texture[r]),i(_,"u_textureResolution",[((g=(m=(d=o.texture[r])==null?void 0:d.source)==null?void 0:m.data)==null?void 0:g.width)||0,((w=(M=(h=o.texture[r])==null?void 0:h.source)==null?void 0:M.data)==null?void 0:w.height)||0]),i(_,"u_resolution",t.current.set(p.width,p.height)),i(_,"u_borderRadius",o.boderRadius[r]?o.boderRadius[r]:0)}})},[]);return[e.current,u]},sn=()=>{const e=s.useRef([]),u=s.useRef([]),o=s.useCallback((a,t=!1)=>{e.current.forEach((v,f)=>{v&&(u.current[f]=!0)});const l=t?[...u.current]:[...e.current];return a<0?l:l[a]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:u,isIntersecting:o}},ln=e=>({onView:o,onHidden:a})=>{const t=s.useRef(!1);s.useEffect(()=>{let l;const v=()=>{e.current.some(f=>f)?t.current||(o&&o(),t.current=!0):t.current&&(a&&a(),t.current=!1),l=requestAnimationFrame(v)};return l=requestAnimationFrame(v),()=>{cancelAnimationFrame(l)}},[o,a])},fe={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},cn=({size:e,dpr:u,samples:o=0},a=[])=>{const t=s.useMemo(()=>new n.Scene,[]),l=C(e),[v,f]=R({scene:t,camera:l,size:e,dpr:u,samples:o,isSizeUpdate:!0}),[r,c]=b({...fe,updateKey:performance.now()}),[p,d]=an(),m=s.useRef(new n.Vector2(0,0)),[g,h]=s.useState(!0);s.useEffect(()=>{h(!0)},a);const M=s.useRef(null),w=s.useMemo(()=>new n.Texture,[]),_=un(),{isIntersectingOnceRef:S,isIntersectingRef:T,isIntersecting:U}=sn(),V=ln(T);return[s.useCallback((A,B)=>{const{gl:E,size:L}=A;if(B&&c(B),tn(r))return w;if(g){if(M.current===r.updateKey)return w;M.current=r.updateKey}return g&&(on({params:r,size:L,scene:t}),_({isIntersectingRef:T,isIntersectingOnceRef:S,params:r}),h(!1)),d({params:r,size:L,resolutionRef:m,scene:t,isIntersectingRef:T}),f(E)},[f,c,_,d,g,t,r,S,T,w]),c,{scene:t,camera:l,renderTarget:v,output:v.texture,isIntersecting:U,DOMRects:p,intersections:T.current,useDomView:V}]};x.ALPHABLENDING_PARAMS=ie,x.BLENDING_PARAMS=re,x.BRIGHTNESSPICKER_PARAMS=ue,x.BRUSH_PARAMS=X,x.CHROMAKEY_PARAMS=me,x.COLORSTRATA_PARAMS=J,x.COSPALETTE_PARAMS=te,x.COVERTEXTURE_PARAMS=le,x.DOMSYNCER_PARAMS=fe,x.DUOTONE_PARAMS=ne,x.Easing=N,x.FBO_OPTION=G,x.FLUID_PARAMS=Y,x.FXBLENDING_PARAMS=ae,x.FXTEXTURE_PARAMS=oe,x.HSV_PARAMS=se,x.MARBLE_PARAMS=ee,x.NOISE_PARAMS=Z,x.RIPPLE_PARAMS=Q,x.SIMPLEBLUR_PARAMS=ce,x.WAVE_PARAMS=ve,x.renderFBO=q,x.setUniform=i,x.useAddMesh=D,x.useAlphaBlending=At,x.useBeat=Jt,x.useBlending=dt,x.useBrightnessPicker=wt,x.useBrush=we,x.useCamera=C,x.useChromaKey=Yt,x.useColorStrata=Ze,x.useCopyTexture=Qt,x.useCosPalette=at,x.useCoverTexture=Lt,x.useDomSyncer=cn,x.useDoubleFBO=z,x.useDuoTone=ct,x.useFPSLimiter=en,x.useFluid=Ge,x.useFxBlending=bt,x.useFxTexture=ht,x.useHSV=It,x.useMarble=nt,x.useNoise=Ke,x.useParams=b,x.usePointer=j,x.useResolution=F,x.useRipple=je,x.useSimpleBlur=Gt,x.useSingleFBO=R,x.useWave=Wt,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
