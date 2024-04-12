(function(M,j){typeof exports=="object"&&typeof module<"u"?j(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],j):(M=typeof globalThis<"u"?globalThis:M||self,j(M["use-shader-fx"]={},M.THREE,M.React))})(this,function(M,j,v){"use strict";function Ie(e){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const r in e)if(r!=="default"){const u=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(i,r,u.get?u:{enumerable:!0,get:()=>e[r]})}}return i.default=e,Object.freeze(i)}const t=Ie(j);var Fe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ze=`precision highp float;

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
}`;const W=(e,i=!1)=>{const r=i?e.width*i:e.width,u=i?e.height*i:e.height;return v.useMemo(()=>new t.Vector2(r,u),[r,u])},o=(e,i,r)=>{r!==void 0&&e.uniforms&&e.uniforms[i]&&r!==null&&(e.uniforms[i].value=r)},I=(e,i,r,u)=>{const s=v.useMemo(()=>{const c=new u(i,r);return e&&e.add(c),c},[i,r,u,e]);return v.useEffect(()=>()=>{e&&e.remove(s),i.dispose(),r.dispose()},[e,i,r,s]),s},Ue=({scene:e,size:i,dpr:r})=>{const u=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),s=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uBuffer:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uTexture:{value:new t.Texture},uIsTexture:{value:!1},uMap:{value:new t.Texture},uIsMap:{value:!1},uMapIntensity:{value:0},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(-10,-10)},uPrevMouse:{value:new t.Vector2(-10,-10)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Vector3(1,0,0)},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:Fe,fragmentShader:ze}),[]),c=W(i,r);o(s,"uResolution",c.clone());const n=I(e,u,s,t.Mesh);return{material:s,mesh:n}},Be=(e,i)=>{const r=i,u=e/i,[s,c]=[r*u/2,r/2];return{width:s,height:c,near:-1e3,far:1e3}},F=(e,i="OrthographicCamera")=>{const r=W(e),{width:u,height:s,near:c,far:n}=Be(r.x,r.y);return v.useMemo(()=>i==="OrthographicCamera"?new t.OrthographicCamera(-u,u,s,-s,c,n):new t.PerspectiveCamera(50,u/s),[u,s,c,n,i])},Z=(e=0)=>{const i=v.useRef(new t.Vector2(0,0)),r=v.useRef(new t.Vector2(0,0)),u=v.useRef(new t.Vector2(0,0)),s=v.useRef(0),c=v.useRef(new t.Vector2(0,0)),n=v.useRef(!1);return v.useCallback(m=>{const l=performance.now();let f;n.current&&e?(u.current=u.current.lerp(m,1-e),f=u.current.clone()):(f=m.clone(),u.current=f),s.current===0&&(s.current=l,i.current=f);const a=Math.max(1,l-s.current);s.current=l,c.current.copy(f).sub(i.current).divideScalar(a);const p=c.current.length()>0,y=n.current?i.current.clone():f;return!n.current&&p&&(n.current=!0),i.current=f,{currentPointer:f,prevPointer:y,diffPointer:r.current.subVectors(f,y),velocity:c.current,isVelocityUpdate:p}},[e])},z=e=>{const i=s=>Object.values(s).some(c=>typeof c=="function"),r=v.useRef(i(e)?e:structuredClone(e)),u=v.useCallback(s=>{for(const c in s){const n=c;n in r.current&&s[n]!==void 0&&s[n]!==null?r.current[n]=s[n]:console.error(`"${String(n)}" does not exist in the params. or "${String(n)}" is null | undefined`)}},[]);return[r.current,u]},Y={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,stencilBuffer:!1},J=({gl:e,fbo:i,scene:r,camera:u,onBeforeRender:s,onSwap:c})=>{e.setRenderTarget(i),s(),e.clear(),e.render(r,u),c&&c(),e.setRenderTarget(null),e.clear()},U=({scene:e,camera:i,size:r,dpr:u=!1,isSizeUpdate:s=!1,samples:c=0,depthBuffer:n=!1,depthTexture:d=!1})=>{var a;const m=v.useRef(),l=W(r,u);m.current=v.useMemo(()=>{const p=new t.WebGLRenderTarget(l.x,l.y,{...Y,samples:c,depthBuffer:n});return d&&(p.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType)),p},[]),s&&((a=m.current)==null||a.setSize(l.x,l.y)),v.useEffect(()=>{const p=m.current;return()=>{p==null||p.dispose()}},[]);const f=v.useCallback((p,y)=>{const x=m.current;return J({gl:p,fbo:x,scene:e,camera:i,onBeforeRender:()=>y&&y({read:x.texture})}),x.texture},[e,i]);return[m.current,f]},N=({scene:e,camera:i,size:r,dpr:u=!1,isSizeUpdate:s=!1,samples:c=0,depthBuffer:n=!1,depthTexture:d=!1})=>{var p,y;const m=v.useRef({read:null,write:null,swap:function(){let x=this.read;this.read=this.write,this.write=x}}),l=W(r,u),f=v.useMemo(()=>{const x=new t.WebGLRenderTarget(l.x,l.y,{...Y,samples:c,depthBuffer:n}),h=new t.WebGLRenderTarget(l.x,l.y,{...Y,samples:c,depthBuffer:n});return d&&(x.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType),h.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType)),{read:x,write:h}},[]);m.current.read=f.read,m.current.write=f.write,s&&((p=m.current.read)==null||p.setSize(l.x,l.y),(y=m.current.write)==null||y.setSize(l.x,l.y)),v.useEffect(()=>{const x=m.current;return()=>{var h,g;(h=x.read)==null||h.dispose(),(g=x.write)==null||g.dispose()}},[]);const a=v.useCallback((x,h)=>{var b;const g=m.current;return J({gl:x,scene:e,camera:i,fbo:g.write,onBeforeRender:()=>h&&h({read:g.read.texture,write:g.write.texture}),onSwap:()=>g.swap()}),(b=g.read)==null?void 0:b.texture},[e,i]);return[{read:m.current.read,write:m.current.write},a]},A=e=>{var i,r;return typeof e=="number"?{shader:e,fbo:e}:{shader:(((i=e.effect)==null?void 0:i.shader)??!0)&&e.dpr,fbo:(((r=e.effect)==null?void 0:r.fbo)??!0)&&e.dpr}},oe=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ve=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Ue({scene:c,size:e,dpr:s.shader}),m=F(e),l=Z(),[f,a]=N({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[p,y]=z(oe),x=v.useRef(null);return[v.useCallback((g,b)=>{const{gl:w,pointer:T}=g;b&&y(b),p.texture?(o(n,"uIsTexture",!0),o(n,"uTexture",p.texture)):o(n,"uIsTexture",!1),p.map?(o(n,"uIsMap",!0),o(n,"uMap",p.map),o(n,"uMapIntensity",p.mapIntensity)):o(n,"uIsMap",!1),o(n,"uRadius",p.radius),o(n,"uSmudge",p.smudge),o(n,"uDissipation",p.dissipation),o(n,"uMotionBlur",p.motionBlur),o(n,"uMotionSample",p.motionSample);const _=p.pointerValues||l(T);_.isVelocityUpdate&&(o(n,"uMouse",_.currentPointer),o(n,"uPrevMouse",_.prevPointer)),o(n,"uVelocity",_.velocity);const S=typeof p.color=="function"?p.color(_.velocity):p.color;return o(n,"uColor",S),o(n,"uIsCursor",p.isCursor),o(n,"uPressureEnd",p.pressure),x.current===null&&(x.current=p.pressure),o(n,"uPressureStart",x.current),x.current=p.pressure,a(w,({read:C})=>{o(n,"uBuffer",C)})},[n,l,a,p,y]),y,{scene:c,mesh:d,material:n,camera:m,renderTarget:f,output:f.read.texture}]};var $=`varying vec2 vUv;
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
}`,Oe=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Ee=()=>v.useMemo(()=>new t.ShaderMaterial({vertexShader:$,fragmentShader:Oe,depthTest:!1,depthWrite:!1}),[]);var Le=`precision highp float;

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
}`;const We=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:$,fragmentShader:Le}),[]);var ke=`precision highp float;

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
}`;const $e=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:ke}),[]);var qe=`precision highp float;

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
}`;const je=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:qe}),[]);var Ne=`precision highp float;

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
}`;const Ge=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:Ne}),[]);var Ke=`precision highp float;

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
}`;const Xe=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:Ke}),[]);var He=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ye=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:He}),[]);var Qe=`precision highp float;

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
}`;const Ze=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:Qe}),[]);var Je=`precision highp float;

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
}`;const en=()=>v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:$,fragmentShader:Je}),[]),nn=({scene:e,size:i,dpr:r})=>{const u=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),s=Ee(),c=s.clone(),n=Ge(),d=Xe(),m=We(),l=$e(),f=je(),a=Ye(),p=Ze(),y=en(),x=v.useMemo(()=>({vorticityMaterial:d,curlMaterial:n,advectionMaterial:m,divergenceMaterial:l,pressureMaterial:f,clearMaterial:a,gradientSubtractMaterial:p,splatMaterial:y}),[d,n,m,l,f,a,p,y]),h=W(i,r);v.useMemo(()=>{o(x.splatMaterial,"aspectRatio",h.x/h.y);for(const w of Object.values(x))o(w,"texelSize",new t.Vector2(1/h.x,1/h.y))},[h,x]);const g=I(e,u,s,t.Mesh);v.useMemo(()=>{s.dispose(),g.material=c},[s,g,c]),v.useEffect(()=>()=>{for(const w of Object.values(x))w.dispose()},[x]);const b=v.useCallback(w=>{g.material=w,g.material.needsUpdate=!0},[g]);return{materials:x,setMeshMaterial:b,mesh:g}},ie=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1),pointerValues:!1}),tn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{materials:n,setMeshMaterial:d,mesh:m}=nn({scene:c,size:e,dpr:s.shader}),l=F(e),f=Z(),a=v.useMemo(()=>({scene:c,camera:l,dpr:s.fbo,size:e,samples:r,isSizeUpdate:u}),[c,l,e,r,s.fbo,u]),[p,y]=N(a),[x,h]=N(a),[g,b]=U(a),[w,T]=U(a),[_,S]=N(a),C=v.useRef(0),B=v.useRef(new t.Vector2(0,0)),P=v.useRef(new t.Vector3(0,0,0)),[R,E]=z(ie);return[v.useCallback((L,X)=>{const{gl:k,pointer:$t,clock:te,size:Re}=L;X&&E(X),C.current===0&&(C.current=te.getElapsedTime());const De=Math.min((te.getElapsedTime()-C.current)/3,.02);C.current=te.getElapsedTime();const re=y(k,({read:O})=>{d(n.advectionMaterial),o(n.advectionMaterial,"uVelocity",O),o(n.advectionMaterial,"uSource",O),o(n.advectionMaterial,"dt",De),o(n.advectionMaterial,"dissipation",R.velocity_dissipation)}),qt=h(k,({read:O})=>{d(n.advectionMaterial),o(n.advectionMaterial,"uVelocity",re),o(n.advectionMaterial,"uSource",O),o(n.advectionMaterial,"dissipation",R.density_dissipation)}),ee=R.pointerValues||f($t);ee.isVelocityUpdate&&(y(k,({read:O})=>{d(n.splatMaterial),o(n.splatMaterial,"uTarget",O),o(n.splatMaterial,"point",ee.currentPointer);const H=ee.diffPointer.multiply(B.current.set(Re.width,Re.height).multiplyScalar(R.velocity_acceleration));o(n.splatMaterial,"color",P.current.set(H.x,H.y,1)),o(n.splatMaterial,"radius",R.splat_radius)}),h(k,({read:O})=>{d(n.splatMaterial),o(n.splatMaterial,"uTarget",O);const H=typeof R.fluid_color=="function"?R.fluid_color(ee.velocity):R.fluid_color;o(n.splatMaterial,"color",H)}));const jt=b(k,()=>{d(n.curlMaterial),o(n.curlMaterial,"uVelocity",re)});y(k,({read:O})=>{d(n.vorticityMaterial),o(n.vorticityMaterial,"uVelocity",O),o(n.vorticityMaterial,"uCurl",jt),o(n.vorticityMaterial,"curl",R.curl_strength),o(n.vorticityMaterial,"dt",De)});const Nt=T(k,()=>{d(n.divergenceMaterial),o(n.divergenceMaterial,"uVelocity",re)});S(k,({read:O})=>{d(n.clearMaterial),o(n.clearMaterial,"uTexture",O),o(n.clearMaterial,"value",R.pressure_dissipation)}),d(n.pressureMaterial),o(n.pressureMaterial,"uDivergence",Nt);let Ae;for(let O=0;O<R.pressure_iterations;O++)Ae=S(k,({read:H})=>{o(n.pressureMaterial,"uPressure",H)});return y(k,({read:O})=>{d(n.gradientSubtractMaterial),o(n.gradientSubtractMaterial,"uPressure",Ae),o(n.gradientSubtractMaterial,"uVelocity",O)}),qt},[n,d,b,h,T,f,S,y,E,R]),E,{scene:c,mesh:m,materials:n,camera:l,renderTarget:{velocity:p,density:x,curl:g,divergence:w,pressure:_},output:x.read.texture}]},rn=({scale:e,max:i,texture:r,scene:u})=>{const s=v.useRef([]),c=v.useMemo(()=>new t.PlaneGeometry(e,e),[e]),n=v.useMemo(()=>new t.MeshBasicMaterial({map:r,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return v.useEffect(()=>{for(let d=0;d<i;d++){const m=new t.Mesh(c.clone(),n.clone());m.rotateZ(2*Math.PI*Math.random()),m.visible=!1,u.add(m),s.current.push(m)}},[c,n,u,i]),v.useEffect(()=>()=>{s.current.forEach(d=>{d.geometry.dispose(),Array.isArray(d.material)?d.material.forEach(m=>m.dispose()):d.material.dispose(),u.remove(d)}),s.current=[]},[u]),s.current},ae=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),on=({texture:e=new t.Texture,scale:i=64,max:r=100,size:u,dpr:s,samples:c,isSizeUpdate:n})=>{const d=A(s),m=v.useMemo(()=>new t.Scene,[]),l=rn({scale:i,max:r,texture:e,scene:m}),f=F(u),a=Z(),[p,y]=U({scene:m,camera:f,size:u,dpr:d.fbo,samples:c,isSizeUpdate:n}),[x,h]=z(ae),g=v.useRef(0);return[v.useCallback((w,T)=>{const{gl:_,pointer:S,size:C}=w;T&&h(T);const B=x.pointerValues||a(S);if(x.frequency<B.diffPointer.length()){const P=l[g.current];P.visible=!0,P.position.set(B.currentPointer.x*(C.width/2),B.currentPointer.y*(C.height/2),0),P.scale.x=P.scale.y=0,P.material.opacity=x.alpha,g.current=(g.current+1)%r}return l.forEach(P=>{if(P.visible){const R=P.material;P.rotation.z+=x.rotation,R.opacity*=x.fadeout_speed,P.scale.x=x.fadeout_speed*P.scale.x+x.scale,P.scale.y=P.scale.x,R.opacity<.002&&(P.visible=!1)}}),y(_)},[y,l,a,r,x,h]),h,{scene:m,camera:f,meshArr:l,renderTarget:p,output:p.texture}]};var an=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,un=`precision highp float;
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
}`;const sn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new t.Vector2},warpStrength:{value:0}},vertexShader:an,fragmentShader:un}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},ue=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new t.Vector2(2,2),warpStrength:8,beat:!1}),ln=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=sn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(ue);return[v.useCallback((x,h)=>{const{gl:g,clock:b}=x;return h&&p(h),o(n,"scale",a.scale),o(n,"timeStrength",a.timeStrength),o(n,"noiseOctaves",a.noiseOctaves),o(n,"fbmOctaves",a.fbmOctaves),o(n,"warpOctaves",a.warpOctaves),o(n,"warpDirection",a.warpDirection),o(n,"warpStrength",a.warpStrength),o(n,"uTime",a.beat||b.getElapsedTime()),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var cn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,vn=`precision highp float;
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
}`;const mn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new t.Texture},noiseStrength:{value:new t.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new t.Vector2(.1,.1)},laminateDetail:{value:new t.Vector2(1,1)},distortion:{value:new t.Vector2(0,0)},colorFactor:{value:new t.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new t.Vector2(0,0)}},vertexShader:cn,fragmentShader:vn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},se=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new t.Vector2(.1,.1),laminateDetail:new t.Vector2(1,1),distortion:new t.Vector2(0,0),colorFactor:new t.Vector3(1,1,1),timeStrength:new t.Vector2(0,0),noise:!1,noiseStrength:new t.Vector2(0,0),beat:!1}),fn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=mn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(se);return[v.useCallback((x,h)=>{const{gl:g,clock:b}=x;return h&&p(h),a.texture?(o(n,"uTexture",a.texture),o(n,"isTexture",!0)):(o(n,"isTexture",!1),o(n,"scale",a.scale)),a.noise?(o(n,"noise",a.noise),o(n,"isNoise",!0),o(n,"noiseStrength",a.noiseStrength)):o(n,"isNoise",!1),o(n,"uTime",a.beat||b.getElapsedTime()),o(n,"laminateLayer",a.laminateLayer),o(n,"laminateInterval",a.laminateInterval),o(n,"laminateDetail",a.laminateDetail),o(n,"distortion",a.distortion),o(n,"colorFactor",a.colorFactor),o(n,"timeStrength",a.timeStrength),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var pn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,dn=`precision highp float;

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
}`;const gn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:0},u_complexity:{value:0},u_complexityAttenuation:{value:0},u_iterations:{value:0},u_timeStrength:{value:0},u_scale:{value:0}},vertexShader:pn,fragmentShader:dn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},le=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),hn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=gn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(le);return[v.useCallback((x,h)=>{const{gl:g,clock:b}=x;return h&&p(h),o(n,"u_pattern",a.pattern),o(n,"u_complexity",a.complexity),o(n,"u_complexityAttenuation",a.complexityAttenuation),o(n,"u_iterations",a.iterations),o(n,"u_timeStrength",a.timeStrength),o(n,"u_scale",a.scale),o(n,"u_time",a.beat||b.getElapsedTime()),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var xn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,yn=`precision highp float;
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
}`;const Mn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uRgbWeight:{value:new t.Vector3(.299,.587,.114)},uColor1:{value:new t.Color().set(.5,.5,.5)},uColor2:{value:new t.Color().set(.5,.5,.5)},uColor3:{value:new t.Color().set(1,1,1)},uColor4:{value:new t.Color().set(0,.1,.2)}},vertexShader:xn,fragmentShader:yn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},ce=Object.freeze({texture:new t.Texture,color1:new t.Color().set(.5,.5,.5),color2:new t.Color().set(.5,.5,.5),color3:new t.Color().set(1,1,1),color4:new t.Color().set(0,.1,.2),rgbWeight:new t.Vector3(.299,.587,.114)}),bn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Mn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(ce);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"uTexture",a.texture),o(n,"uColor1",a.color1),o(n,"uColor2",a.color2),o(n,"uColor3",a.color3),o(n,"uColor4",a.color4),o(n,"uRgbWeight",a.rgbWeight),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var wn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Sn=`precision highp float;

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
}`;const _n=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:wn,fragmentShader:Sn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},ve={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},Cn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=_n(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(ve);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"uTexture",a.texture),o(n,"uColor0",a.color0),o(n,"uColor1",a.color1),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var Tn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Pn=`precision highp float;

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
}`;const Rn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_alphaMap:{value:new t.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new t.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:Tn,fragmentShader:Pn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},me={texture:new t.Texture,map:new t.Texture,alphaMap:!1,mapIntensity:.3,brightness:new t.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Dn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Rn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(me);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"u_texture",a.texture),o(n,"u_map",a.map),o(n,"u_mapIntensity",a.mapIntensity),a.alphaMap?(o(n,"u_alphaMap",a.alphaMap),o(n,"u_isAlphaMap",!0)):o(n,"u_isAlphaMap",!1),o(n,"u_brightness",a.brightness),o(n,"u_min",a.min),o(n,"u_max",a.max),a.dodgeColor?(o(n,"u_dodgeColor",a.dodgeColor),o(n,"u_isDodgeColor",!0)):o(n,"u_isDodgeColor",!1),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var An=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,In=`precision highp float;

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

}`;const Fn=({scene:e,size:i,dpr:r})=>{const u=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),s=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:An,fragmentShader:In}),[]),c=W(i,r);o(s,"uResolution",c.clone());const n=I(e,u,s,t.Mesh);return{material:s,mesh:n}},fe={texture0:new t.Texture,texture1:new t.Texture,padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},zn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Fn({scene:c,size:e,dpr:s.shader}),m=F(e),[l,f]=U({scene:c,camera:m,dpr:s.fbo,size:e,samples:r,isSizeUpdate:u}),[a,p]=z(fe);return[v.useCallback((x,h)=>{var _,S,C,B,P,R,E,q;const{gl:g}=x;h&&p(h),o(n,"uTexture0",a.texture0),o(n,"uTexture1",a.texture1),o(n,"progress",a.progress);const b=[((S=(_=a.texture0)==null?void 0:_.image)==null?void 0:S.width)||0,((B=(C=a.texture0)==null?void 0:C.image)==null?void 0:B.height)||0],w=[((R=(P=a.texture1)==null?void 0:P.image)==null?void 0:R.width)||0,((q=(E=a.texture1)==null?void 0:E.image)==null?void 0:q.height)||0],T=b.map((L,X)=>L+(w[X]-L)*a.progress);return o(n,"uTextureResolution",T),o(n,"padding",a.padding),o(n,"uMap",a.map),o(n,"mapIntensity",a.mapIntensity),o(n,"edgeIntensity",a.edgeIntensity),o(n,"epicenter",a.epicenter),o(n,"dirX",a.dir.x),o(n,"dirY",a.dir.y),f(g)},[f,n,a,p]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var Un=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Bn=`precision highp float;

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
}`;const Vn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:Un,fragmentShader:Bn}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},pe={texture:new t.Texture,brightness:new t.Vector3(.5,.5,.5),min:0,max:1},On=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Vn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(pe);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"u_texture",a.texture),o(n,"u_brightness",a.brightness),o(n,"u_min",a.min),o(n,"u_max",a.max),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var En=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ln=`precision highp float;

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
}`;const Wn=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_mapIntensity:{value:0}},vertexShader:En,fragmentShader:Ln}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},de={texture:new t.Texture,map:new t.Texture,mapIntensity:.3},kn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Wn(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(de);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"u_texture",a.texture),o(n,"u_map",a.map),o(n,"u_mapIntensity",a.mapIntensity),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var $n=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,qn=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const jn=({scene:e,size:i})=>{const r=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uMap:{value:new t.Texture}},vertexShader:$n,fragmentShader:qn}),[]),s=I(e,r,u,t.Mesh);return{material:u,mesh:s}},ge={texture:new t.Texture,map:new t.Texture},Nn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=jn({scene:c,size:e}),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(ge);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"uTexture",a.texture),o(n,"uMap",a.map),f(g)},[n,f,a,p]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var Gn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Kn=`precision highp float;

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
}`;const Xn=({scene:e,size:i})=>{const r=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:1},u_saturation:{value:1}},vertexShader:Gn,fragmentShader:Kn}),[]),s=I(e,r,u,t.Mesh);return{material:u,mesh:s}},he={texture:new t.Texture,brightness:1,saturation:1},Hn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Xn({scene:c,size:e}),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(he);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"u_texture",a.texture),o(n,"u_brightness",a.brightness),o(n,"u_saturation",a.saturation),f(g)},[n,f,a,p]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var Yn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Qn=`precision highp float;

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

}`;const Zn=({scene:e,size:i,dpr:r})=>{const u=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),s=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture:{value:new t.Texture}},vertexShader:Yn,fragmentShader:Qn}),[]),c=W(i,r);o(s,"uResolution",c.clone());const n=I(e,u,s,t.Mesh);return{material:s,mesh:n}},xe={texture:new t.Texture},Jn=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=Zn({scene:c,size:e,dpr:s.shader}),m=F(e),[l,f]=U({scene:c,camera:m,dpr:s.fbo,size:e,samples:r,isSizeUpdate:u}),[a,p]=z(xe);return[v.useCallback((x,h)=>{var b,w,T,_,S,C;const{gl:g}=x;return h&&p(h),o(n,"uTexture",a.texture),o(n,"uTextureResolution",[((T=(w=(b=a.texture)==null?void 0:b.source)==null?void 0:w.data)==null?void 0:T.width)||0,((C=(S=(_=a.texture)==null?void 0:_.source)==null?void 0:S.data)==null?void 0:C.height)||0]),f(g)},[f,n,a,p]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var et=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,nt=`precision mediump float;

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
}`;const tt=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:ne.blurSize}},vertexShader:et,fragmentShader:nt}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},ne=Object.freeze({texture:new t.Texture,blurSize:3,blurPower:5}),rt=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=tt(c),m=F(e),l=v.useMemo(()=>({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[c,m,e,s.fbo,r,u]),[f,a]=N(l),[p,y]=z(ne);return[v.useCallback((h,g)=>{var _,S,C,B,P,R;const{gl:b}=h;g&&y(g),o(n,"uTexture",p.texture),o(n,"uResolution",[((C=(S=(_=p.texture)==null?void 0:_.source)==null?void 0:S.data)==null?void 0:C.width)||0,((R=(P=(B=p.texture)==null?void 0:B.source)==null?void 0:P.data)==null?void 0:R.height)||0]),o(n,"uBlurSize",p.blurSize);let w=a(b);const T=p.blurPower;for(let E=0;E<T;E++)o(n,"uTexture",w),w=a(b);return w},[a,n,y,p]),y,{scene:c,mesh:d,material:n,camera:m,renderTarget:f,output:f.read.texture}]};var ot=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,it=`precision mediump float;

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
}`;const at=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:G.texture},uBackbuffer:{value:new t.Texture},uBegin:{value:G.begin},uEnd:{value:G.end},uStrength:{value:G.strength}},vertexShader:ot,fragmentShader:it}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},G=Object.freeze({texture:new t.Texture,begin:new t.Vector2(0,0),end:new t.Vector2(0,0),strength:.9}),ut=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=at(c),m=F(e),l=v.useMemo(()=>({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[c,m,e,s.fbo,r,u]),[f,a]=N(l),[p,y]=z(G);return[v.useCallback((h,g)=>{const{gl:b}=h;return g&&y(g),o(n,"uTexture",p.texture),o(n,"uBegin",p.begin),o(n,"uEnd",p.end),o(n,"uStrength",p.strength),a(b,({read:w})=>{o(n,"uBackbuffer",w)})},[a,n,y,p]),y,{scene:c,mesh:d,material:n,camera:m,renderTarget:f,output:f.read.texture}]};var st=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,lt=`precision highp float;

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
}`;const ct=e=>{const i=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=v.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:K.epicenter},uProgress:{value:K.progress},uStrength:{value:K.strength},uWidth:{value:K.width},uMode:{value:0}},vertexShader:st,fragmentShader:lt}),[]),u=I(e,i,r,t.Mesh);return{material:r,mesh:u}},K=Object.freeze({epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),vt=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=ct(c),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(K);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"uEpicenter",a.epicenter),o(n,"uProgress",a.progress),o(n,"uWidth",a.width),o(n,"uStrength",a.strength),o(n,"uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]};var mt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ft=`precision highp float;
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
}`;const pt=({scene:e,size:i,dpr:r})=>{const u=v.useMemo(()=>new t.PlaneGeometry(2,2),[]),s=v.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_resolution:{value:new t.Vector2},u_keyColor:{value:new t.Color},u_similarity:{value:0},u_smoothness:{value:0},u_spill:{value:0},u_color:{value:new t.Vector4},u_contrast:{value:0},u_brightness:{value:0},u_gamma:{value:0}},vertexShader:mt,fragmentShader:ft}),[]),c=W(i,r);o(s,"u_resolution",c.clone());const n=I(e,u,s,t.Mesh);return{material:s,mesh:n}},ye=Object.freeze({texture:new t.Texture,keyColor:new t.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new t.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),dt=({size:e,dpr:i,samples:r,isSizeUpdate:u})=>{const s=A(i),c=v.useMemo(()=>new t.Scene,[]),{material:n,mesh:d}=pt({scene:c,size:e,dpr:s.shader}),m=F(e),[l,f]=U({scene:c,camera:m,size:e,dpr:s.fbo,samples:r,isSizeUpdate:u}),[a,p]=z(ye);return[v.useCallback((x,h)=>{const{gl:g}=x;return h&&p(h),o(n,"u_texture",a.texture),o(n,"u_keyColor",a.keyColor),o(n,"u_similarity",a.similarity),o(n,"u_smoothness",a.smoothness),o(n,"u_spill",a.spill),o(n,"u_color",a.color),o(n,"u_contrast",a.contrast),o(n,"u_brightness",a.brightness),o(n,"u_gamma",a.gamma),f(g)},[f,n,p,a]),p,{scene:c,mesh:d,material:n,camera:m,renderTarget:l,output:l.texture}]},gt=({scene:e,geometry:i,material:r})=>{const u=I(e,i,r,t.Points),s=I(e,v.useMemo(()=>i.clone(),[i]),v.useMemo(()=>r.clone(),[r]),t.Mesh);return s.visible=!1,{points:u,interactiveMesh:s}};var ht=`uniform vec2 uResolution;
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
}`,xt=`precision highp float;
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
}`,Me=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;const be=process.env.NODE_ENV==="development",we=(e,i,r,u,s)=>{var f;const c=r==="position"?"positionTarget":"uvTarget",n=r==="position"?"#usf <morphPositions>":"#usf <morphUvs>",d=r==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",m=r==="position"?"positionsList":"uvsList",l=r==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){i.deleteAttribute(r),i.setAttribute(r,new t.BufferAttribute(e[0],s));let a="",p="";e.forEach((y,x)=>{i.setAttribute(`${c}${x}`,new t.BufferAttribute(y,s)),a+=`attribute vec${s} ${c}${x};
`,x===0?p+=`${c}${x}`:p+=`,${c}${x}`}),u=u.replace(`${n}`,a),u=u.replace(`${d}`,`vec${s} ${m}[${e.length}] = vec${s}[](${p});
				${l}
			`)}else u=u.replace(`${n}`,""),u=u.replace(`${d}`,""),(f=i==null?void 0:i.attributes[r])!=null&&f.array||be&&console.error(`use-shader-fx:geometry.attributes.${r}.array is not found`);return u},Se=(e,i,r,u)=>{var c;let s=[];if(e&&e.length>0){(c=i==null?void 0:i.attributes[r])!=null&&c.array?s=[i.attributes[r].array,...e]:s=e;const n=Math.max(...s.map(d=>d.length));s.forEach((d,m)=>{if(d.length<n){const l=(n-d.length)/u,f=[],a=Array.from(d);for(let p=0;p<l;p++){const y=Math.floor(d.length/u*Math.random())*u;for(let x=0;x<u;x++)f.push(a[y+x])}s[m]=new Float32Array([...a,...f])}})}return s},yt=(e,i)=>{let r="";const u={};let s="mapArrayColor = ";return e&&e.length>0?(e.forEach((n,d)=>{const m=`vMapArrayIndex < ${d}.1`,l=`texture2D(uMapArray${d}, uv)`;s+=`( ${m} ) ? ${l} : `,r+=`
        uniform sampler2D uMapArray${d};
      `,u[`uMapArray${d}`]={value:n}}),s+="vec4(1.);",r+="bool isMapArray = true;",u.uMapArrayLength={value:e.length}):(s+="vec4(1.0);",r+="bool isMapArray = false;",u.uMapArrayLength={value:0}),{rewritedFragmentShader:i.replace("#usf <mapArraySwitcher>",s).replace("#usf <mapArrayUniforms>",r),mapArrayUniforms:u}},Mt=({size:e,dpr:i,geometry:r,positions:u,uvs:s,mapArray:c})=>{const n=v.useMemo(()=>Se(u,r,"position",3),[u,r]),d=v.useMemo(()=>Se(s,r,"uv",2),[s,r]),m=v.useMemo(()=>{n.length!==d.length&&be&&console.log("use-shader-fx:positions and uvs are not matched");const f=we(d,r,"uv",we(n,r,"position",ht,3),2).replace("#usf <getWobble>",Me),a=yt(c,xt);return new t.ShaderMaterial({vertexShader:f,fragmentShader:a.rewritedFragmentShader,depthTest:!1,depthWrite:!1,transparent:!0,blending:t.AdditiveBlending,uniforms:{uResolution:{value:new t.Vector2(0,0)},uMorphProgress:{value:D.morphProgress},uBlurAlpha:{value:D.blurAlpha},uBlurRadius:{value:D.blurRadius},uPointSize:{value:D.pointSize},uPointAlpha:{value:D.pointAlpha},uPicture:{value:new t.Texture},uIsPicture:{value:!1},uAlphaPicture:{value:new t.Texture},uIsAlphaPicture:{value:!1},uColor0:{value:D.color0},uColor1:{value:D.color1},uColor2:{value:D.color2},uColor3:{value:D.color3},uMap:{value:new t.Texture},uIsMap:{value:!1},uAlphaMap:{value:new t.Texture},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:D.wobblePositionFrequency},uWobbleTimeFrequency:{value:D.wobbleTimeFrequency},uWobbleStrength:{value:D.wobbleStrength},uWarpPositionFrequency:{value:D.warpPositionFrequency},uWarpTimeFrequency:{value:D.warpTimeFrequency},uWarpStrength:{value:D.warpStrength},uDisplacement:{value:new t.Texture},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:D.displacementIntensity},uDisplacementColorIntensity:{value:D.displacementColorIntensity},uSizeRandomIntensity:{value:D.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:D.sizeRandomTimeFrequency},uSizeRandomMin:{value:D.sizeRandomMin},uSizeRandomMax:{value:D.sizeRandomMax},uDivergence:{value:D.divergence},uDivergencePoint:{value:D.divergencePoint},...a.mapArrayUniforms}})},[r,n,d,c]),l=W(e,i);return o(m,"uResolution",l.clone()),{material:m,modifiedPositions:n,modifiedUvs:d}},_e=({size:e,dpr:i,scene:r=!1,geometry:u,positions:s,uvs:c,mapArray:n})=>{const d=A(i),m=v.useMemo(()=>{const h=u||new t.SphereGeometry(1,32,32);return h.setIndex(null),h.deleteAttribute("normal"),h},[u]),{material:l,modifiedPositions:f,modifiedUvs:a}=Mt({size:e,dpr:d.shader,geometry:m,positions:s,uvs:c,mapArray:n}),{points:p,interactiveMesh:y}=gt({scene:r,geometry:m,material:l});return[v.useCallback((h,g)=>{h&&o(l,"uTime",(g==null?void 0:g.beat)||h.clock.getElapsedTime()),g!==void 0&&(o(l,"uMorphProgress",g.morphProgress),o(l,"uBlurAlpha",g.blurAlpha),o(l,"uBlurRadius",g.blurRadius),o(l,"uPointSize",g.pointSize),o(l,"uPointAlpha",g.pointAlpha),g.picture?(o(l,"uPicture",g.picture),o(l,"uIsPicture",!0)):g.picture===!1&&o(l,"uIsPicture",!1),g.alphaPicture?(o(l,"uAlphaPicture",g.alphaPicture),o(l,"uIsAlphaPicture",!0)):g.alphaPicture===!1&&o(l,"uIsAlphaPicture",!1),o(l,"uColor0",g.color0),o(l,"uColor1",g.color1),o(l,"uColor2",g.color2),o(l,"uColor3",g.color3),g.map?(o(l,"uMap",g.map),o(l,"uIsMap",!0)):g.map===!1&&o(l,"uIsMap",!1),g.alphaMap?(o(l,"uAlphaMap",g.alphaMap),o(l,"uIsAlphaMap",!0)):g.alphaMap===!1&&o(l,"uIsAlphaMap",!1),o(l,"uWobbleStrength",g.wobbleStrength),o(l,"uWobblePositionFrequency",g.wobblePositionFrequency),o(l,"uWobbleTimeFrequency",g.wobbleTimeFrequency),o(l,"uWarpStrength",g.warpStrength),o(l,"uWarpPositionFrequency",g.warpPositionFrequency),o(l,"uWarpTimeFrequency",g.warpTimeFrequency),g.displacement?(o(l,"uDisplacement",g.displacement),o(l,"uIsDisplacement",!0)):g.displacement===!1&&o(l,"uIsDisplacement",!1),o(l,"uDisplacementIntensity",g.displacementIntensity),o(l,"uDisplacementColorIntensity",g.displacementColorIntensity),o(l,"uSizeRandomIntensity",g.sizeRandomIntensity),o(l,"uSizeRandomTimeFrequency",g.sizeRandomTimeFrequency),o(l,"uSizeRandomMin",g.sizeRandomMin),o(l,"uSizeRandomMax",g.sizeRandomMax),o(l,"uDivergence",g.divergence),o(l,"uDivergencePoint",g.divergencePoint))},[l]),{points:p,interactiveMesh:y,positions:f,uvs:a}]},D=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new t.Vector3(0),beat:!1}),bt=({size:e,dpr:i,samples:r,isSizeUpdate:u,camera:s,geometry:c,positions:n,uvs:d})=>{const m=A(i),l=v.useMemo(()=>new t.Scene,[]),[f,{points:a,interactiveMesh:p,positions:y,uvs:x}]=_e({scene:l,size:e,dpr:i,geometry:c,positions:n,uvs:d}),[h,g]=U({scene:l,camera:s,size:e,dpr:m.fbo,samples:r,isSizeUpdate:u,depthBuffer:!0}),b=v.useCallback((T,_)=>(f(T,_),g(T.gl)),[g,f]),w=v.useCallback(T=>{f(null,T)},[f]);return[b,w,{scene:l,points:a,interactiveMesh:p,renderTarget:h,output:h.texture,positions:y,uvs:x}]};function wt(e,i=1e-4){i=Math.max(i,Number.EPSILON);const r={},u=e.getIndex(),s=e.getAttribute("position"),c=u?u.count:s.count;let n=0;const d=Object.keys(e.attributes),m={},l={},f=[],a=["getX","getY","getZ","getW"];for(let h=0,g=d.length;h<g;h++){const b=d[h];m[b]=[];const w=e.morphAttributes[b];w&&(l[b]=new Array(w.length).fill(0).map(()=>[]))}const p=Math.log10(1/i),y=Math.pow(10,p);for(let h=0;h<c;h++){const g=u?u.getX(h):h;let b="";for(let w=0,T=d.length;w<T;w++){const _=d[w],S=e.getAttribute(_),C=S.itemSize;for(let B=0;B<C;B++)b+=`${~~(S[a[B]](g)*y)},`}if(b in r)f.push(r[b]);else{for(let w=0,T=d.length;w<T;w++){const _=d[w],S=e.getAttribute(_),C=e.morphAttributes[_],B=S.itemSize,P=m[_],R=l[_];for(let E=0;E<B;E++){const q=a[E];if(P.push(S[q](g)),C)for(let L=0,X=C.length;L<X;L++)R[L].push(C[L][q](g))}}r[b]=n,f.push(n),n++}}const x=e.clone();for(let h=0,g=d.length;h<g;h++){const b=d[h],w=e.getAttribute(b),T=new w.array.constructor(m[b]),_=new j.BufferAttribute(T,w.itemSize,w.normalized);if(x.setAttribute(b,_),b in l)for(let S=0;S<l[b].length;S++){const C=e.morphAttributes[b][S],B=new C.array.constructor(l[b][S]),P=new j.BufferAttribute(B,C.itemSize,C.normalized);x.morphAttributes[b][S]=P}}return x.setIndex(f),x}var St=`vec3 random3(vec3 c) {
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
}`,_t=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,Ct=`#ifdef USE_TRANSMISSION

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

#endif`;const Ce=e=>{let i=e;return i=i.replace("#include <beginnormal_vertex>",`
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`),i=i.replace("#include <begin_vertex>",`
		vec3 transformed = usf_Position;`),i=i.replace("void main() {",`
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
		// #usf <getWobble>
		void main() {`),i=i.replace("// #usf <getWobble>",`${Me}`),i=i.replace("void main() {",`
		void main() {
		vec3 usf_Position = position;
		vec3 usf_Normal = normal;
		vec3 biTangent = cross(normal, tangent.xyz);
		
		// Neighbours positions
		float shift = 0.01;
		vec3 positionA = usf_Position + tangent.xyz * shift;
		vec3 positionB = usf_Position + biTangent * shift;
		// Wobble
		float wobble = getWobble(usf_Position);
		usf_Position += wobble * normal;
		positionA    += getWobble(positionA) * normal;
		positionB    += getWobble(positionB) * normal;
		// Compute normal
		vec3 toA = normalize(positionA - usf_Position);
		vec3 toB = normalize(positionB - usf_Position);
		usf_Normal = cross(toA, toB);
		// Varying
		vPosition = usf_Position.xy;
		vWobble = wobble / uWobbleStrength;`),i},Tt=({baseMaterial:e,materialParameters:i})=>{const{material:r,depthMaterial:u}=v.useMemo(()=>{const s=new(e||t.MeshPhysicalMaterial)(i||{}),c=s.type==="MeshPhysicalMaterial"||s.type==="MeshStandardMaterial",n=s.type==="MeshPhysicalMaterial";Object.assign(s.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:V.wobblePositionFrequency},uWobbleTimeFrequency:{value:V.wobbleTimeFrequency},uWobbleStrength:{value:V.wobbleStrength},uWarpPositionFrequency:{value:V.warpPositionFrequency},uWarpTimeFrequency:{value:V.warpTimeFrequency},uWarpStrength:{value:V.warpStrength},uWobbleShine:{value:V.wobbleShine},uColor0:{value:V.color0},uColor1:{value:V.color1},uColor2:{value:V.color2},uColor3:{value:V.color3},uColorMix:{value:V.colorMix},uChromaticAberration:{value:V.chromaticAberration},uAnisotropicBlur:{value:V.anisotropicBlur},uDistortion:{value:V.distortion},uDistortionScale:{value:V.distortionScale},uTemporalDistortion:{value:V.temporalDistortion},uSamples:{value:V.samples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),s.onBeforeCompile=m=>{Object.assign(m.uniforms,s.userData.uniforms),m.vertexShader=Ce(m.vertexShader),m.fragmentShader=m.fragmentShader.replace("#include <color_fragment>",`
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`),c&&(m.fragmentShader=m.fragmentShader.replace("#include <roughnessmap_fragment>",`
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`)),m.fragmentShader=m.fragmentShader.replace("void main() {",`
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
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
				${St}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${c?"float usf_Roughness = roughness;":""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${c?"usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);":""}`),n&&(m.fragmentShader=m.fragmentShader.replace("#include <transmission_pars_fragment>",`${_t}`),m.fragmentShader=m.fragmentShader.replace("#include <transmission_fragment>",`${Ct}`))},s.needsUpdate=!0;const d=new t.MeshDepthMaterial({depthPacking:t.RGBADepthPacking});return d.onBeforeCompile=m=>{Object.assign(m.uniforms,s.userData.uniforms),m.vertexShader=Ce(m.vertexShader)},d.needsUpdate=!0,{material:s,depthMaterial:d}},[i,e]);return{material:r,depthMaterial:u}},Te=({scene:e=!1,geometry:i,baseMaterial:r,materialParameters:u})=>{const s=v.useMemo(()=>{let l=i||new t.IcosahedronGeometry(2,20);return l=wt(l),l.computeTangents(),l},[i]),{material:c,depthMaterial:n}=Tt({baseMaterial:r,materialParameters:u}),d=I(e,s,c,t.Mesh);return[v.useCallback((l,f)=>{const a=c.userData;l&&o(a,"uTime",(f==null?void 0:f.beat)||l.clock.getElapsedTime()),f!==void 0&&(o(a,"uWobbleStrength",f.wobbleStrength),o(a,"uWobblePositionFrequency",f.wobblePositionFrequency),o(a,"uWobbleTimeFrequency",f.wobbleTimeFrequency),o(a,"uWarpStrength",f.warpStrength),o(a,"uWarpPositionFrequency",f.warpPositionFrequency),o(a,"uWarpTimeFrequency",f.warpTimeFrequency),o(a,"uWobbleShine",f.wobbleShine),o(a,"uSamples",f.samples),o(a,"uColor0",f.color0),o(a,"uColor1",f.color1),o(a,"uColor2",f.color2),o(a,"uColor3",f.color3),o(a,"uColorMix",f.colorMix),o(a,"uChromaticAberration",f.chromaticAberration),o(a,"uAnisotropicBlur",f.anisotropicBlur),o(a,"uDistortion",f.distortion),o(a,"uDistortionScale",f.distortionScale),o(a,"uTemporalDistortion",f.temporalDistortion))},[c]),{mesh:d,depthMaterial:n}]},V=Object.freeze({beat:!1,wobbleStrength:.3,wobblePositionFrequency:.5,wobbleTimeFrequency:.4,wobbleShine:0,warpStrength:1.7,warpPositionFrequency:.38,warpTimeFrequency:.12,samples:6,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),colorMix:1,chromaticAberration:.5,anisotropicBlur:.1,distortion:.1,distortionScale:.1,temporalDistortion:.1}),Pt=({size:e,dpr:i,samples:r,isSizeUpdate:u,camera:s,geometry:c,baseMaterial:n,materialParameters:d})=>{const m=A(i),l=v.useMemo(()=>new t.Scene,[]),[f,{mesh:a,depthMaterial:p}]=Te({baseMaterial:n,materialParameters:d,scene:l,geometry:c}),[y,x]=U({scene:l,camera:s,size:e,dpr:m.fbo,samples:r,isSizeUpdate:u,depthBuffer:!0}),h=v.useCallback((b,w)=>(f(b,w),x(b.gl)),[x,f]),g=v.useCallback(b=>{f(null,b)},[f]);return[h,g,{scene:l,mesh:a,depthMaterial:p,renderTarget:y,output:y.texture}]},Rt=(e,i,r)=>{const u=v.useMemo(()=>{const s=new t.Mesh(i,r);return e.add(s),s},[i,r,e]);return v.useEffect(()=>()=>{e.remove(u),i.dispose(),r.dispose()},[e,i,r,u]),u},Q=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const r=2.5949095;return e<.5?Math.pow(2*e,2)*((r+1)*2*e-r)/2:(Math.pow(2*e-2,2)*((r+1)*(e*2-2)+r)+2)/2},easeInElastic(e){const i=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*i)},easeOutElastic(e){const i=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*i)+1},easeInOutElastic(e){const i=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*i))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*i)/2+1},easeInBounce(e){return 1-Q.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-Q.easeOutBounce(1-2*e))/2:(1+Q.easeOutBounce(2*e-1))/2}});function Dt(e){let i=Math.sin(e*12.9898)*43758.5453;return i-Math.floor(i)}const At=(e,i="easeOutQuart")=>{const r=e/60,u=Q[i];return v.useCallback(c=>{let n=c.getElapsedTime()*r;const d=Math.floor(n),m=u(n-d);n=m+d;const l=Dt(d);return{beat:n,floor:d,fract:m,hash:l}},[r,u])},It=(e=60)=>{const i=v.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),r=v.useRef(null);return v.useCallback(s=>{const c=s.getElapsedTime();return r.current===null||c-r.current>=i?(r.current=c,!0):!1},[i])},Ft=e=>{var u,s;const i=(u=e.dom)==null?void 0:u.length,r=(s=e.texture)==null?void 0:s.length;return!i||!r||i!==r};var zt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Ut=`precision highp float;

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
}`;const Bt=({params:e,size:i,scene:r})=>{r.children.length>0&&(r.children.forEach(u=>{u instanceof t.Mesh&&(u.geometry.dispose(),u.material.dispose())}),r.remove(...r.children)),e.texture.forEach((u,s)=>{const c=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:zt,fragmentShader:Ut,transparent:!0,uniforms:{u_texture:{value:u},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[s]?e.boderRadius[s]:0}}}));r.add(c)})},Vt=()=>{const e=v.useRef([]),i=v.useRef([]);return v.useCallback(({isIntersectingRef:u,isIntersectingOnceRef:s,params:c})=>{e.current.length>0&&e.current.forEach((d,m)=>{d.unobserve(i.current[m])}),i.current=[],e.current=[];const n=new Array(c.dom.length).fill(!1);u.current=[...n],s.current=[...n],c.dom.forEach((d,m)=>{const l=a=>{a.forEach(p=>{c.onIntersect[m]&&c.onIntersect[m](p),u.current[m]=p.isIntersecting})},f=new IntersectionObserver(l,{rootMargin:"0px",threshold:0});f.observe(d),e.current.push(f),i.current.push(d)})},[])},Ot=()=>{const e=v.useRef([]),i=v.useCallback(({params:r,size:u,resolutionRef:s,scene:c,isIntersectingRef:n})=>{c.children.length!==e.current.length&&(e.current=new Array(c.children.length)),c.children.forEach((d,m)=>{var a,p,y,x,h,g;const l=r.dom[m];if(!l)return;const f=l.getBoundingClientRect();if(e.current[m]=f,d.scale.set(f.width,f.height,1),d.position.set(f.left+f.width*.5-u.width*.5,-f.top-f.height*.5+u.height*.5,0),n.current[m]&&(r.rotation[m]&&d.rotation.copy(r.rotation[m]),d instanceof t.Mesh)){const b=d.material;o(b,"u_texture",r.texture[m]),o(b,"u_textureResolution",[((y=(p=(a=r.texture[m])==null?void 0:a.source)==null?void 0:p.data)==null?void 0:y.width)||0,((g=(h=(x=r.texture[m])==null?void 0:x.source)==null?void 0:h.data)==null?void 0:g.height)||0]),o(b,"u_resolution",s.current.set(f.width,f.height)),o(b,"u_borderRadius",r.boderRadius[m]?r.boderRadius[m]:0)}})},[]);return[e.current,i]},Et=()=>{const e=v.useRef([]),i=v.useRef([]),r=v.useCallback((u,s=!1)=>{e.current.forEach((n,d)=>{n&&(i.current[d]=!0)});const c=s?[...i.current]:[...e.current];return u<0?c:c[u]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:i,isIntersecting:r}},Lt=e=>({onView:r,onHidden:u})=>{const s=v.useRef(!1);v.useEffect(()=>{let c;const n=()=>{e.current.some(d=>d)?s.current||(r&&r(),s.current=!0):s.current&&(u&&u(),s.current=!1),c=requestAnimationFrame(n)};return c=requestAnimationFrame(n),()=>{cancelAnimationFrame(c)}},[r,u])},Pe={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},Wt=({size:e,dpr:i,samples:r,isSizeUpdate:u},s=[])=>{const c=A(i),n=v.useMemo(()=>new t.Scene,[]),d=F(e),[m,l]=U({scene:n,camera:d,size:e,dpr:c.fbo,samples:r,isSizeUpdate:u}),[f,a]=z({...Pe,updateKey:performance.now()}),[p,y]=Ot(),x=v.useRef(new t.Vector2(0,0)),[h,g]=v.useState(!0);v.useMemo(()=>g(!0),s);const b=v.useRef(null),w=v.useMemo(()=>new t.Texture,[]),T=Vt(),{isIntersectingOnceRef:_,isIntersectingRef:S,isIntersecting:C}=Et(),B=Lt(S);return[v.useCallback((R,E)=>{const{gl:q,size:L}=R;if(E&&a(E),Ft(f))return w;if(h){if(b.current===f.updateKey)return w;b.current=f.updateKey}return h&&(Bt({params:f,size:L,scene:n}),T({isIntersectingRef:S,isIntersectingOnceRef:_,params:f}),g(!1)),y({params:f,size:L,resolutionRef:x,scene:n,isIntersectingRef:S}),l(q)},[l,a,T,y,h,n,f,_,S,w]),a,{scene:n,camera:d,renderTarget:m,output:m.texture,isIntersecting:C,DOMRects:p,intersections:S.current,useDomView:B}]},kt=({scene:e,camera:i,size:r,dpr:u=!1,isSizeUpdate:s=!1,samples:c=0,depthBuffer:n=!1,depthTexture:d=!1},m)=>{const l=v.useRef([]),f=W(r,u);l.current=v.useMemo(()=>Array.from({length:m},()=>{const p=new t.WebGLRenderTarget(f.x,f.y,{...Y,samples:c,depthBuffer:n});return d&&(p.depthTexture=new t.DepthTexture(f.x,f.y,t.FloatType)),p}),[m]),s&&l.current.forEach(p=>p.setSize(f.x,f.y)),v.useEffect(()=>{const p=l.current;return()=>{p.forEach(y=>y.dispose())}},[m]);const a=v.useCallback((p,y,x)=>{const h=l.current[y];return J({gl:p,scene:e,camera:i,fbo:h,onBeforeRender:()=>x&&x({read:h.texture})}),h.texture},[e,i]);return[l.current,a]};M.ALPHABLENDING_PARAMS=ge,M.BLENDING_PARAMS=me,M.BRIGHTNESSPICKER_PARAMS=pe,M.BRUSH_PARAMS=oe,M.CHROMAKEY_PARAMS=ye,M.COLORSTRATA_PARAMS=se,M.COSPALETTE_PARAMS=ce,M.COVERTEXTURE_PARAMS=xe,M.DOMSYNCER_PARAMS=Pe,M.DUOTONE_PARAMS=ve,M.Easing=Q,M.FBO_OPTION=Y,M.FLUID_PARAMS=ie,M.FXBLENDING_PARAMS=de,M.FXTEXTURE_PARAMS=fe,M.HSV_PARAMS=he,M.MARBLE_PARAMS=le,M.MORPHPARTICLES_PARAMS=D,M.MOTIONBLUR_PARAMS=G,M.NOISE_PARAMS=ue,M.RIPPLE_PARAMS=ae,M.SIMPLEBLUR_PARAMS=ne,M.WAVE_PARAMS=K,M.WOBBLE3D_PARAMS=V,M.renderFBO=J,M.setUniform=o,M.useAddMesh=Rt,M.useAlphaBlending=Nn,M.useBeat=At,M.useBlending=Dn,M.useBrightnessPicker=On,M.useBrush=Ve,M.useCamera=F,M.useChromaKey=dt,M.useColorStrata=fn,M.useCopyTexture=kt,M.useCosPalette=bn,M.useCoverTexture=Jn,M.useCreateMorphParticles=_e,M.useCreateWobble3D=Te,M.useDomSyncer=Wt,M.useDoubleFBO=N,M.useDuoTone=Cn,M.useFPSLimiter=It,M.useFluid=tn,M.useFxBlending=kn,M.useFxTexture=zn,M.useHSV=Hn,M.useMarble=hn,M.useMorphParticles=bt,M.useMotionBlur=ut,M.useNoise=ln,M.useParams=z,M.usePointer=Z,M.useResolution=W,M.useRipple=on,M.useSimpleBlur=rt,M.useSingleFBO=U,M.useWave=vt,M.useWobble3D=Pt,Object.defineProperty(M,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
