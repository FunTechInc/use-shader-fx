(function(x,k){typeof exports=="object"&&typeof module<"u"?k(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],k):(x=typeof globalThis<"u"?globalThis:x||self,k(x["use-shader-fx"]={},x.THREE,x.React))})(this,function(x,k,l){"use strict";function De(e){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const r in e)if(r!=="default"){const o=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(i,r,o.get?o:{enumerable:!0,get:()=>e[r]})}}return i.default=e,Object.freeze(i)}const t=De(k);var Re=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ae=`precision highp float;

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
}`;const E=(e,i=!1)=>{const r=i?e.width*i:e.width,o=i?e.height*i:e.height;return l.useMemo(()=>new t.Vector2(r,o),[r,o])},u=(e,i,r)=>{r!==void 0&&e.uniforms&&e.uniforms[i]&&r!==null&&(e.uniforms[i].value=r)},R=(e,i,r,o)=>{const n=l.useMemo(()=>new o(i,r),[i,r,o]);return l.useEffect(()=>{e&&e.add(n)},[e,n]),l.useEffect(()=>()=>{e&&e.remove(n),i.dispose(),r.dispose()},[e,i,r,n]),n},Ie=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uBuffer:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uTexture:{value:new t.Texture},uIsTexture:{value:!1},uMap:{value:new t.Texture},uIsMap:{value:!1},uMapIntensity:{value:0},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(-10,-10)},uPrevMouse:{value:new t.Vector2(-10,-10)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Vector3(1,0,0)},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:Re,fragmentShader:Ae}),[]),m=E(i,r);l.useEffect(()=>{u(n,"uResolution",m.clone())},[m,n]);const f=R(e,o,n,t.Mesh);return{material:n,mesh:f}},Fe=(e,i)=>{const r=i,o=e/i,[n,m]=[r*o/2,r/2];return{width:n,height:m,near:-1e3,far:1e3}},A=(e,i="OrthographicCamera")=>{const r=E(e),{width:o,height:n,near:m,far:f}=Fe(r.x,r.y);return l.useMemo(()=>i==="OrthographicCamera"?new t.OrthographicCamera(-o,o,n,-n,m,f):new t.PerspectiveCamera(50,o/n),[o,n,m,f,i])},X=(e=0)=>{const i=l.useRef(new t.Vector2(0,0)),r=l.useRef(new t.Vector2(0,0)),o=l.useRef(new t.Vector2(0,0)),n=l.useRef(0),m=l.useRef(new t.Vector2(0,0)),f=l.useRef(!1);return l.useCallback(v=>{const a=performance.now();let c;f.current&&e?(o.current=o.current.lerp(v,1-e),c=o.current.clone()):(c=v.clone(),o.current=c),n.current===0&&(n.current=a,i.current=c);const h=Math.max(1,a-n.current);n.current=a,m.current.copy(c).sub(i.current).divideScalar(h);const d=m.current.length()>0,g=f.current?i.current.clone():c;return!f.current&&d&&(f.current=!0),i.current=c,{currentPointer:c,prevPointer:g,diffPointer:r.current.subVectors(c,g),velocity:m.current,isVelocityUpdate:d}},[e])},I=e=>{const i=n=>Object.values(n).some(m=>typeof m=="function"),r=l.useRef(i(e)?e:structuredClone(e)),o=l.useCallback(n=>{for(const m in n){const f=m;f in r.current&&n[f]!==void 0&&n[f]!==null?r.current[f]=n[f]:console.error(`"${String(f)}" does not exist in the params. or "${String(f)}" is null | undefined`)}},[]);return[r.current,o]},G={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,stencilBuffer:!1},H=({gl:e,fbo:i,scene:r,camera:o,onBeforeRender:n,onSwap:m})=>{e.setRenderTarget(i),n(),e.clear(),e.render(r,o),m&&m(),e.setRenderTarget(null),e.clear()},D=({scene:e,camera:i,size:r,dpr:o=!1,isSizeUpdate:n=!1,samples:m=0,depthBuffer:f=!1,depthTexture:s=!1})=>{const v=l.useRef(),a=E(r,o);v.current=l.useMemo(()=>{const h=new t.WebGLRenderTarget(a.x,a.y,{...G,samples:m,depthBuffer:f});return s&&(h.depthTexture=new t.DepthTexture(a.x,a.y,t.FloatType)),h},[]),l.useLayoutEffect(()=>{var h;n&&((h=v.current)==null||h.setSize(a.x,a.y))},[a,n]),l.useEffect(()=>{const h=v.current;return()=>{h==null||h.dispose()}},[]);const c=l.useCallback((h,d)=>{const g=v.current;return H({gl:h,fbo:g,scene:e,camera:i,onBeforeRender:()=>d&&d({read:g.texture})}),g.texture},[e,i]);return[v.current,c]},q=({scene:e,camera:i,size:r,dpr:o=!1,isSizeUpdate:n=!1,samples:m=0,depthBuffer:f=!1,depthTexture:s=!1})=>{const v=l.useRef({read:null,write:null,swap:function(){let d=this.read;this.read=this.write,this.write=d}}),a=E(r,o),c=l.useMemo(()=>{const d=new t.WebGLRenderTarget(a.x,a.y,{...G,samples:m,depthBuffer:f}),g=new t.WebGLRenderTarget(a.x,a.y,{...G,samples:m,depthBuffer:f});return s&&(d.depthTexture=new t.DepthTexture(a.x,a.y,t.FloatType),g.depthTexture=new t.DepthTexture(a.x,a.y,t.FloatType)),{read:d,write:g}},[]);v.current.read=c.read,v.current.write=c.write,l.useLayoutEffect(()=>{var d,g;n&&((d=v.current.read)==null||d.setSize(a.x,a.y),(g=v.current.write)==null||g.setSize(a.x,a.y))},[a,n]),l.useEffect(()=>{const d=v.current;return()=>{var g,p;(g=d.read)==null||g.dispose(),(p=d.write)==null||p.dispose()}},[]);const h=l.useCallback((d,g)=>{var y;const p=v.current;return H({gl:d,scene:e,camera:i,fbo:p.write,onBeforeRender:()=>g&&g({read:p.read.texture,write:p.write.texture}),onSwap:()=>p.swap()}),(y=p.read)==null?void 0:y.texture},[e,i]);return[{read:v.current.read,write:v.current.write},h]},ne=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ue=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Ie({scene:o,size:e,dpr:i}),f=A(e),s=X(),[v,a]=q({scene:o,camera:f,size:e,dpr:i,samples:r}),[c,h]=I(ne),d=l.useRef(null);return[l.useCallback((p,y)=>{const{gl:w,pointer:M}=p;y&&h(y),c.texture?(u(n,"uIsTexture",!0),u(n,"uTexture",c.texture)):u(n,"uIsTexture",!1),c.map?(u(n,"uIsMap",!0),u(n,"uMap",c.map),u(n,"uMapIntensity",c.mapIntensity)):u(n,"uIsMap",!1),u(n,"uRadius",c.radius),u(n,"uSmudge",c.smudge),u(n,"uDissipation",c.dissipation),u(n,"uMotionBlur",c.motionBlur),u(n,"uMotionSample",c.motionSample);const b=c.pointerValues||s(M);b.isVelocityUpdate&&(u(n,"uMouse",b.currentPointer),u(n,"uPrevMouse",b.prevPointer)),u(n,"uVelocity",b.velocity);const T=typeof c.color=="function"?c.color(b.velocity):c.color;return u(n,"uColor",T),u(n,"uIsCursor",c.isCursor),u(n,"uPressureEnd",c.pressure),d.current===null&&(d.current=c.pressure),u(n,"uPressureStart",d.current),d.current=c.pressure,a(w,({read:C})=>{u(n,"uBuffer",C)})},[n,s,a,c,h]),h,{scene:o,mesh:m,material:n,camera:f,renderTarget:v,output:v.read.texture}]};var W=`varying vec2 vUv;
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
}`,Ve=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Be=()=>l.useMemo(()=>new t.ShaderMaterial({vertexShader:W,fragmentShader:Ve,depthTest:!1,depthWrite:!1}),[]);var ze=`precision highp float;

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
}`;const Oe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:W,fragmentShader:ze}),[]);var Ee=`precision highp float;

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
}`;const Le=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:Ee}),[]);var We=`precision highp float;

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
}`;const ke=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:We}),[]);var $e=`precision highp float;

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
}`;const qe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:$e}),[]);var je=`precision highp float;

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
}`;const Ne=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:je}),[]);var Ge=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ke=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:Ge}),[]);var Xe=`precision highp float;

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
}`;const He=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:Xe}),[]);var Ye=`precision highp float;

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
}`;const Qe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:Ye}),[]),Ze=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=Be(),m=n.clone(),f=qe(),s=Ne(),v=Oe(),a=Le(),c=ke(),h=Ke(),d=He(),g=Qe(),p=l.useMemo(()=>({vorticityMaterial:s,curlMaterial:f,advectionMaterial:v,divergenceMaterial:a,pressureMaterial:c,clearMaterial:h,gradientSubtractMaterial:d,splatMaterial:g}),[s,f,v,a,c,h,d,g]),y=E(i,r);l.useEffect(()=>{u(p.splatMaterial,"aspectRatio",y.x/y.y);for(const b of Object.values(p))u(b,"texelSize",new t.Vector2(1/y.x,1/y.y))},[y,p]);const w=R(e,o,n,t.Mesh);l.useEffect(()=>{n.dispose(),w.material=m},[n,w,m]),l.useEffect(()=>()=>{for(const b of Object.values(p))b.dispose()},[p]);const M=l.useCallback(b=>{w.material=b,w.material.needsUpdate=!0},[w]);return{materials:p,setMeshMaterial:M,mesh:w}},te=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1),pointerValues:!1}),Je=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{materials:n,setMeshMaterial:m,mesh:f}=Ze({scene:o,size:e,dpr:i}),s=A(e),v=X(),a=l.useMemo(()=>({scene:o,camera:s,size:e,samples:r}),[o,s,e,r]),[c,h]=q(a),[d,g]=q(a),[p,y]=D(a),[w,M]=D(a),[b,T]=q(a),C=l.useRef(0),P=l.useRef(new t.Vector2(0,0)),S=l.useRef(new t.Vector3(0,0,0)),[_,B]=I(te);return[l.useCallback((O,$)=>{const{gl:z,pointer:Z,clock:J,size:Ce}=O;$&&B($),C.current===0&&(C.current=J.getElapsedTime());const Te=Math.min((J.getElapsedTime()-C.current)/3,.02);C.current=J.getElapsedTime();const ee=h(z,({read:V})=>{m(n.advectionMaterial),u(n.advectionMaterial,"uVelocity",V),u(n.advectionMaterial,"uSource",V),u(n.advectionMaterial,"dt",Te),u(n.advectionMaterial,"dissipation",_.velocity_dissipation)}),Vt=g(z,({read:V})=>{m(n.advectionMaterial),u(n.advectionMaterial,"uVelocity",ee),u(n.advectionMaterial,"uSource",V),u(n.advectionMaterial,"dissipation",_.density_dissipation)}),Y=_.pointerValues||v(Z);Y.isVelocityUpdate&&(h(z,({read:V})=>{m(n.splatMaterial),u(n.splatMaterial,"uTarget",V),u(n.splatMaterial,"point",Y.currentPointer);const N=Y.diffPointer.multiply(P.current.set(Ce.width,Ce.height).multiplyScalar(_.velocity_acceleration));u(n.splatMaterial,"color",S.current.set(N.x,N.y,1)),u(n.splatMaterial,"radius",_.splat_radius)}),g(z,({read:V})=>{m(n.splatMaterial),u(n.splatMaterial,"uTarget",V);const N=typeof _.fluid_color=="function"?_.fluid_color(Y.velocity):_.fluid_color;u(n.splatMaterial,"color",N)}));const Bt=y(z,()=>{m(n.curlMaterial),u(n.curlMaterial,"uVelocity",ee)});h(z,({read:V})=>{m(n.vorticityMaterial),u(n.vorticityMaterial,"uVelocity",V),u(n.vorticityMaterial,"uCurl",Bt),u(n.vorticityMaterial,"curl",_.curl_strength),u(n.vorticityMaterial,"dt",Te)});const zt=M(z,()=>{m(n.divergenceMaterial),u(n.divergenceMaterial,"uVelocity",ee)});T(z,({read:V})=>{m(n.clearMaterial),u(n.clearMaterial,"uTexture",V),u(n.clearMaterial,"value",_.pressure_dissipation)}),m(n.pressureMaterial),u(n.pressureMaterial,"uDivergence",zt);let Pe;for(let V=0;V<_.pressure_iterations;V++)Pe=T(z,({read:N})=>{u(n.pressureMaterial,"uPressure",N)});return h(z,({read:V})=>{m(n.gradientSubtractMaterial),u(n.gradientSubtractMaterial,"uPressure",Pe),u(n.gradientSubtractMaterial,"uVelocity",V)}),Vt},[n,m,y,g,M,v,T,h,B,_]),B,{scene:o,mesh:f,materials:n,camera:s,renderTarget:{velocity:c,density:d,curl:p,divergence:w,pressure:b},output:d.read.texture}]},en=({scale:e,max:i,texture:r,scene:o})=>{const n=l.useRef([]),m=l.useMemo(()=>new t.PlaneGeometry(e,e),[e]),f=l.useMemo(()=>new t.MeshBasicMaterial({map:r,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return l.useEffect(()=>{for(let s=0;s<i;s++){const v=new t.Mesh(m.clone(),f.clone());v.rotateZ(2*Math.PI*Math.random()),v.visible=!1,o.add(v),n.current.push(v)}},[m,f,o,i]),l.useEffect(()=>()=>{n.current.forEach(s=>{s.geometry.dispose(),Array.isArray(s.material)?s.material.forEach(v=>v.dispose()):s.material.dispose(),o.remove(s)}),n.current=[]},[o]),n.current},oe=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),nn=({texture:e=new t.Texture,scale:i=64,max:r=100,size:o,dpr:n,samples:m=0})=>{const f=l.useMemo(()=>new t.Scene,[]),s=en({scale:i,max:r,texture:e,scene:f}),v=A(o),a=X(),[c,h]=D({scene:f,camera:v,size:o,dpr:n,samples:m}),[d,g]=I(oe),p=l.useRef(0);return[l.useCallback((w,M)=>{const{gl:b,pointer:T,size:C}=w;M&&g(M);const P=d.pointerValues||a(T);if(d.frequency<P.diffPointer.length()){const S=s[p.current];S.visible=!0,S.position.set(P.currentPointer.x*(C.width/2),P.currentPointer.y*(C.height/2),0),S.scale.x=S.scale.y=0,S.material.opacity=d.alpha,p.current=(p.current+1)%r}return s.forEach(S=>{if(S.visible){const _=S.material;S.rotation.z+=d.rotation,_.opacity*=d.fadeout_speed,S.scale.x=d.fadeout_speed*S.scale.x+d.scale,S.scale.y=S.scale.x,_.opacity<.002&&(S.visible=!1)}}),h(b)},[h,s,a,r,d,g]),g,{scene:f,camera:v,meshArr:s,renderTarget:c,output:c.texture}]};var tn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,on=`precision highp float;
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
}`;const rn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new t.Vector2},warpStrength:{value:0}},vertexShader:tn,fragmentShader:on}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},re=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new t.Vector2(2,2),warpStrength:8,beat:!1}),an=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=rn(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(re);return[l.useCallback((d,g)=>{const{gl:p,clock:y}=d;return g&&c(g),u(n,"scale",a.scale),u(n,"timeStrength",a.timeStrength),u(n,"noiseOctaves",a.noiseOctaves),u(n,"fbmOctaves",a.fbmOctaves),u(n,"warpOctaves",a.warpOctaves),u(n,"warpDirection",a.warpDirection),u(n,"warpStrength",a.warpStrength),u(n,"uTime",a.beat||y.getElapsedTime()),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var un=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,sn=`precision highp float;
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
}`;const ln=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new t.Texture},noiseStrength:{value:new t.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new t.Vector2(.1,.1)},laminateDetail:{value:new t.Vector2(1,1)},distortion:{value:new t.Vector2(0,0)},colorFactor:{value:new t.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new t.Vector2(0,0)}},vertexShader:un,fragmentShader:sn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},ie=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new t.Vector2(.1,.1),laminateDetail:new t.Vector2(1,1),distortion:new t.Vector2(0,0),colorFactor:new t.Vector3(1,1,1),timeStrength:new t.Vector2(0,0),noise:!1,noiseStrength:new t.Vector2(0,0),beat:!1}),cn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=ln(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(ie);return[l.useCallback((d,g)=>{const{gl:p,clock:y}=d;return g&&c(g),a.texture?(u(n,"uTexture",a.texture),u(n,"isTexture",!0)):(u(n,"isTexture",!1),u(n,"scale",a.scale)),a.noise?(u(n,"noise",a.noise),u(n,"isNoise",!0),u(n,"noiseStrength",a.noiseStrength)):u(n,"isNoise",!1),u(n,"uTime",a.beat||y.getElapsedTime()),u(n,"laminateLayer",a.laminateLayer),u(n,"laminateInterval",a.laminateInterval),u(n,"laminateDetail",a.laminateDetail),u(n,"distortion",a.distortion),u(n,"colorFactor",a.colorFactor),u(n,"timeStrength",a.timeStrength),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,mn=`precision highp float;

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
}`;const fn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:0},u_complexity:{value:0},u_complexityAttenuation:{value:0},u_iterations:{value:0},u_timeStrength:{value:0},u_scale:{value:0}},vertexShader:vn,fragmentShader:mn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},ae=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),pn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=fn(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(ae);return[l.useCallback((d,g)=>{const{gl:p,clock:y}=d;return g&&c(g),u(n,"u_pattern",a.pattern),u(n,"u_complexity",a.complexity),u(n,"u_complexityAttenuation",a.complexityAttenuation),u(n,"u_iterations",a.iterations),u(n,"u_timeStrength",a.timeStrength),u(n,"u_scale",a.scale),u(n,"u_time",a.beat||y.getElapsedTime()),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var dn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,gn=`precision highp float;
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
}`;const hn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uRgbWeight:{value:new t.Vector3(.299,.587,.114)},uColor1:{value:new t.Color().set(.5,.5,.5)},uColor2:{value:new t.Color().set(.5,.5,.5)},uColor3:{value:new t.Color().set(1,1,1)},uColor4:{value:new t.Color().set(0,.1,.2)}},vertexShader:dn,fragmentShader:gn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},ue=Object.freeze({texture:new t.Texture,color1:new t.Color().set(.5,.5,.5),color2:new t.Color().set(.5,.5,.5),color3:new t.Color().set(1,1,1),color4:new t.Color().set(0,.1,.2),rgbWeight:new t.Vector3(.299,.587,.114)}),xn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=hn(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(ue);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"uTexture",a.texture),u(n,"uColor1",a.color1),u(n,"uColor2",a.color2),u(n,"uColor3",a.color3),u(n,"uColor4",a.color4),u(n,"uRgbWeight",a.rgbWeight),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var yn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Mn=`precision highp float;

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
}`;const bn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:yn,fragmentShader:Mn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},se={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},wn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=bn(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(se);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"uTexture",a.texture),u(n,"uColor0",a.color0),u(n,"uColor1",a.color1),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Sn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,_n=`precision highp float;

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
}`;const Cn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_alphaMap:{value:new t.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new t.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:Sn,fragmentShader:_n}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},le={texture:new t.Texture,map:new t.Texture,alphaMap:!1,mapIntensity:.3,brightness:new t.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Tn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Cn(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(le);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"u_texture",a.texture),u(n,"u_map",a.map),u(n,"u_mapIntensity",a.mapIntensity),a.alphaMap?(u(n,"u_alphaMap",a.alphaMap),u(n,"u_isAlphaMap",!0)):u(n,"u_isAlphaMap",!1),u(n,"u_brightness",a.brightness),u(n,"u_min",a.min),u(n,"u_max",a.max),a.dodgeColor?(u(n,"u_dodgeColor",a.dodgeColor),u(n,"u_isDodgeColor",!0)):u(n,"u_isDodgeColor",!1),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Pn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Dn=`precision highp float;

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

}`;const Rn=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Pn,fragmentShader:Dn}),[]),m=E(i,r);l.useEffect(()=>{u(n,"uResolution",m.clone())},[m,n]);const f=R(e,o,n,t.Mesh);return{material:n,mesh:f}},ce={texture0:new t.Texture,texture1:new t.Texture,padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},An=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Rn({scene:o,size:e,dpr:i}),f=A(e),[s,v]=D({scene:o,camera:f,dpr:i,size:e,samples:r,isSizeUpdate:!0}),[a,c]=I(ce);return[l.useCallback((d,g)=>{var b,T,C,P,S,_,B,L;const{gl:p}=d;g&&c(g),u(n,"uTexture0",a.texture0),u(n,"uTexture1",a.texture1),u(n,"progress",a.progress);const y=[((T=(b=a.texture0)==null?void 0:b.image)==null?void 0:T.width)||0,((P=(C=a.texture0)==null?void 0:C.image)==null?void 0:P.height)||0],w=[((_=(S=a.texture1)==null?void 0:S.image)==null?void 0:_.width)||0,((L=(B=a.texture1)==null?void 0:B.image)==null?void 0:L.height)||0],M=y.map((O,$)=>O+(w[$]-O)*a.progress);return u(n,"uTextureResolution",M),u(n,"padding",a.padding),u(n,"uMap",a.map),u(n,"mapIntensity",a.mapIntensity),u(n,"edgeIntensity",a.edgeIntensity),u(n,"epicenter",a.epicenter),u(n,"dirX",a.dir.x),u(n,"dirY",a.dir.y),v(p)},[v,n,a,c]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var In=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Fn=`precision highp float;

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
}`;const Un=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:In,fragmentShader:Fn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},ve={texture:new t.Texture,brightness:new t.Vector3(.5,.5,.5),min:0,max:1},Vn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Un(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(ve);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"u_texture",a.texture),u(n,"u_brightness",a.brightness),u(n,"u_min",a.min),u(n,"u_max",a.max),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Bn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,zn=`precision highp float;

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
}`;const On=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_mapIntensity:{value:0}},vertexShader:Bn,fragmentShader:zn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},me={texture:new t.Texture,map:new t.Texture,mapIntensity:.3},En=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=On(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(me);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"u_texture",a.texture),u(n,"u_map",a.map),u(n,"u_mapIntensity",a.mapIntensity),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Ln=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Wn=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const kn=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uMap:{value:new t.Texture}},vertexShader:Ln,fragmentShader:Wn}),[]),m=R(e,o,n,t.Mesh);return{material:n,mesh:m}},fe={texture:new t.Texture,map:new t.Texture},$n=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=kn({scene:o,size:e,dpr:i}),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(fe);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"uTexture",a.texture),u(n,"uMap",a.map),v(p)},[n,v,a,c]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var qn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,jn=`precision highp float;

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
}`;const Nn=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:1},u_saturation:{value:1}},vertexShader:qn,fragmentShader:jn}),[]),m=R(e,o,n,t.Mesh);return{material:n,mesh:m}},pe={texture:new t.Texture,brightness:1,saturation:1},Gn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Nn({scene:o,size:e,dpr:i}),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(pe);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"u_texture",a.texture),u(n,"u_brightness",a.brightness),u(n,"u_saturation",a.saturation),v(p)},[n,v,a,c]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Kn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Xn=`precision highp float;

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

}`;const Hn=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture:{value:new t.Texture}},vertexShader:Kn,fragmentShader:Xn}),[]),m=E(i,r);l.useEffect(()=>{u(n,"uResolution",m.clone())},[m,n]);const f=R(e,o,n,t.Mesh);return{material:n,mesh:f}},de={texture:new t.Texture},Yn=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Hn({scene:o,size:e,dpr:i}),f=A(e),[s,v]=D({scene:o,camera:f,dpr:i,size:e,samples:r,isSizeUpdate:!0}),[a,c]=I(de);return[l.useCallback((d,g)=>{var y,w,M,b,T,C;const{gl:p}=d;return g&&c(g),u(n,"uTexture",a.texture),u(n,"uTextureResolution",[((M=(w=(y=a.texture)==null?void 0:y.source)==null?void 0:w.data)==null?void 0:M.width)||0,((C=(T=(b=a.texture)==null?void 0:b.source)==null?void 0:T.data)==null?void 0:C.height)||0]),v(p)},[v,n,a,c]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var Qn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Zn=`precision mediump float;

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
}`;const Jn=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:Q.blurSize}},vertexShader:Qn,fragmentShader:Zn}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},Q=Object.freeze({texture:new t.Texture,blurSize:3,blurPower:5}),et=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=Jn(o),f=A(e),s=l.useMemo(()=>({scene:o,camera:f,size:e,dpr:i,samples:r}),[o,f,e,i,r]),[v,a]=D(s),[c,h]=q(s),[d,g]=I(Q);return[l.useCallback((y,w)=>{var C,P,S,_,B,L;const{gl:M}=y;w&&g(w),u(n,"uTexture",d.texture),u(n,"uResolution",[((S=(P=(C=d.texture)==null?void 0:C.source)==null?void 0:P.data)==null?void 0:S.width)||0,((L=(B=(_=d.texture)==null?void 0:_.source)==null?void 0:B.data)==null?void 0:L.height)||0]),u(n,"uBlurSize",d.blurSize);let b=h(M);const T=d.blurPower;for(let O=0;O<T;O++)u(n,"uTexture",b),b=h(M);return a(M)},[a,h,n,g,d]),g,{scene:o,mesh:m,material:n,camera:f,renderTarget:v,output:v.texture}]};var nt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,tt=`precision highp float;

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
}`;const ot=e=>{const i=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),r=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:j.epicenter},uProgress:{value:j.progress},uStrength:{value:j.strength},uWidth:{value:j.width},uMode:{value:0}},vertexShader:nt,fragmentShader:tt}),[]),o=R(e,i,r,t.Mesh);return{material:r,mesh:o}},j=Object.freeze({epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),rt=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=ot(o),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r,isSizeUpdate:!0}),[a,c]=I(j);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"uEpicenter",a.epicenter),u(n,"uProgress",a.progress),u(n,"uWidth",a.width),u(n,"uStrength",a.strength),u(n,"uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]};var it=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,at=`precision highp float;
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
}`;const ut=({scene:e,size:i,dpr:r})=>{const o=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_resolution:{value:new t.Vector2},u_keyColor:{value:new t.Color},u_similarity:{value:0},u_smoothness:{value:0},u_spill:{value:0},u_color:{value:new t.Vector4},u_contrast:{value:0},u_brightness:{value:0},u_gamma:{value:0}},vertexShader:it,fragmentShader:at}),[]),m=E(i,r);l.useEffect(()=>{u(n,"u_resolution",m.clone())},[m,n]);const f=R(e,o,n,t.Mesh);return{material:n,mesh:f}},ge=Object.freeze({texture:new t.Texture,keyColor:new t.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new t.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),st=({size:e,dpr:i,samples:r=0})=>{const o=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:m}=ut({scene:o,size:e,dpr:i}),f=A(e),[s,v]=D({scene:o,camera:f,size:e,dpr:i,samples:r}),[a,c]=I(ge);return[l.useCallback((d,g)=>{const{gl:p}=d;return g&&c(g),u(n,"u_texture",a.texture),u(n,"u_keyColor",a.keyColor),u(n,"u_similarity",a.similarity),u(n,"u_smoothness",a.smoothness),u(n,"u_spill",a.spill),u(n,"u_color",a.color),u(n,"u_contrast",a.contrast),u(n,"u_brightness",a.brightness),u(n,"u_gamma",a.gamma),v(p)},[v,n,c,a]),c,{scene:o,mesh:m,material:n,camera:f,renderTarget:s,output:s.texture}]},lt=({scene:e,geometry:i,material:r})=>{const o=R(e,i,r,t.Points),n=R(e,l.useMemo(()=>i.clone(),[i]),l.useMemo(()=>r.clone(),[r]),t.Mesh);return n.visible=!1,{points:o,interactiveMesh:n}};var ct=`uniform vec2 uResolution;
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

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;

#usf <morphPositions>

#usf <morphUvs>

#usf <getWobble>

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

	
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	
	float wobble = uWobbleStrength > 0. ? getWobble(projectedPosition.xyz) : 0.0;
	gl_Position = projectedPosition += wobble;
	
	
	vColor = uIsPicture ? texture2D(uPicture, newUv).rgb : mix(mix(uColor0, uColor1, newPosition.x), mix(uColor2, uColor3, newPosition.y), newPosition.z);

	
	vPictureAlpha = uIsAlphaPicture ? texture2D(uAlphaPicture, newUv).g : 1.;

	
	gl_PointSize = uPointSize * vPictureAlpha * uResolution.y;
	gl_PointSize *= (1.0 / - viewPosition.z);
}`,vt=`precision highp float;
precision highp int;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;

uniform float uBlurAlpha;
uniform float uBlurRadius;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform sampler2D uAlphaMap;
uniform bool uIsAlphaMap;
uniform float uDisplacementColorIntensity;

void main() {    
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
   
	
	float distanceToCenter = length(uv - .5);
	float alpha = clamp(uBlurRadius / distanceToCenter - (1.-uBlurAlpha) , 0. , 1.);

	
	vec3 finalColor = uIsMap ? texture2D(uMap,uv).rgb : vColor;

	
	float mixIntensity = clamp(uDisplacementColorIntensity * vDisplacementIntensity,0.,1.);
	finalColor = vDisplacementIntensity > 0. ? mix(finalColor,vDisplacementColor,mixIntensity) : finalColor;

	
	float alphaMap = uIsAlphaMap ? texture2D(uAlphaMap,uv).g : 1.;

	gl_FragColor = vec4(finalColor,alpha * vPictureAlpha * alphaMap);
}`,he=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;const xe=process.env.NODE_ENV==="development",ye=(e,i,r,o,n)=>{var c;const m=r==="position"?"positionTarget":"uvTarget",f=r==="position"?"#usf <morphPositions>":"#usf <morphUvs>",s=r==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",v=r==="position"?"positionsList":"uvsList",a=r==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){i.deleteAttribute(r),i.setAttribute(r,new t.BufferAttribute(e[0],n));let h="",d="";e.forEach((g,p)=>{i.setAttribute(`${m}${p}`,new t.BufferAttribute(g,n)),h+=`attribute vec${n} ${m}${p};
`,p===0?d+=`${m}${p}`:d+=`,${m}${p}`}),o=o.replace(`${f}`,h),o=o.replace(`${s}`,`vec${n} ${v}[${e.length}] = vec${n}[](${d});
				${a}
			`)}else o=o.replace(`${f}`,""),o=o.replace(`${s}`,""),(c=i==null?void 0:i.attributes[r])!=null&&c.array||xe&&console.error(`use-shader-fx:geometry.attributes.${r}.array is not found`);return o},Me=(e,i,r,o)=>{var m;let n=[];if(e&&e.length>0){(m=i==null?void 0:i.attributes[r])!=null&&m.array?n=[i.attributes[r].array,...e]:n=e;const f=Math.max(...n.map(s=>s.length));n.forEach((s,v)=>{if(s.length<f){const a=(f-s.length)/o,c=[],h=Array.from(s);for(let d=0;d<a;d++){const g=Math.floor(s.length/o*Math.random())*o;for(let p=0;p<o;p++)c.push(h[g+p])}n[v]=new Float32Array([...h,...c])}})}return n},mt=({size:e,dpr:i,geometry:r,positions:o,uvs:n})=>{const m=l.useMemo(()=>Me(o,r,"position",3),[o,r]),f=l.useMemo(()=>Me(n,r,"uv",2),[n,r]),s=l.useMemo(()=>{m.length!==f.length&&xe&&console.log("use-shader-fx:positions and uvs are not matched");const a=ye(f,r,"uv",ye(m,r,"position",ct,3),2).replace("#usf <getWobble>",he);return new t.ShaderMaterial({vertexShader:a,fragmentShader:vt,depthTest:!1,depthWrite:!1,transparent:!0,blending:t.AdditiveBlending,uniforms:{uResolution:{value:new t.Vector2(0,0)},uMorphProgress:{value:U.morphProgress},uBlurAlpha:{value:U.blurAlpha},uBlurRadius:{value:U.blurRadius},uPointSize:{value:U.pointSize},uPicture:{value:new t.Texture},uIsPicture:{value:!1},uAlphaPicture:{value:new t.Texture},uIsAlphaPicture:{value:!1},uColor0:{value:U.color0},uColor1:{value:U.color1},uColor2:{value:U.color2},uColor3:{value:U.color3},uMap:{value:new t.Texture},uIsMap:{value:!1},uAlphaMap:{value:new t.Texture},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:U.wobblePositionFrequency},uWobbleTimeFrequency:{value:U.wobbleTimeFrequency},uWobbleStrength:{value:U.wobbleStrength},uWarpPositionFrequency:{value:U.warpPositionFrequency},uWarpTimeFrequency:{value:U.warpTimeFrequency},uWarpStrength:{value:U.warpStrength},uDisplacement:{value:new t.Texture},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:U.displacementIntensity},uDisplacementColorIntensity:{value:U.displacementColorIntensity}}})},[r,m,f]),v=E(e,i);return l.useEffect(()=>{u(s,"uResolution",v.clone())},[v,s]),{material:s,modifiedPositions:m,modifiedUvs:f}},be=({size:e,dpr:i,scene:r=!1,geometry:o,positions:n,uvs:m})=>{const f=l.useMemo(()=>{const g=o||new t.SphereGeometry(1,32,32);return g.setIndex(null),g.deleteAttribute("normal"),g},[o]),{material:s,modifiedPositions:v,modifiedUvs:a}=mt({size:e,dpr:i,geometry:f,positions:n,uvs:m}),{points:c,interactiveMesh:h}=lt({scene:r,geometry:f,material:s});return[l.useCallback((g,p)=>{g&&u(s,"uTime",(p==null?void 0:p.beat)||g.clock.getElapsedTime()),p!==void 0&&(u(s,"uMorphProgress",p.morphProgress),u(s,"uBlurAlpha",p.blurAlpha),u(s,"uBlurRadius",p.blurRadius),u(s,"uPointSize",p.pointSize),p.picture?(u(s,"uPicture",p.picture),u(s,"uIsPicture",!0)):u(s,"uIsPicture",!1),p.alphaPicture?(u(s,"uAlphaPicture",p.alphaPicture),u(s,"uIsAlphaPicture",!0)):u(s,"uIsAlphaPicture",!1),u(s,"uColor0",p.color0),u(s,"uColor1",p.color1),u(s,"uColor2",p.color2),u(s,"uColor3",p.color3),p.map?(u(s,"uMap",p.map),u(s,"uIsMap",!0)):u(s,"uIsMap",!1),p.alphaMap?(u(s,"uAlphaMap",p.alphaMap),u(s,"uIsAlphaMap",!0)):u(s,"uIsAlphaMap",!1),u(s,"uWobbleStrength",p.wobbleStrength),u(s,"uWobblePositionFrequency",p.wobblePositionFrequency),u(s,"uWobbleTimeFrequency",p.wobbleTimeFrequency),u(s,"uWarpStrength",p.warpStrength),u(s,"uWarpPositionFrequency",p.warpPositionFrequency),u(s,"uWarpTimeFrequency",p.warpTimeFrequency),p.displacement?(u(s,"uDisplacement",p.displacement),u(s,"uIsDisplacement",!0)):u(s,"uIsDisplacement",!1),u(s,"uDisplacementIntensity",p.displacementIntensity),u(s,"uDisplacementColorIntensity",p.displacementColorIntensity))},[s]),{points:c,interactiveMesh:h,positions:v,uvs:a}]},U=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,picture:!1,alphaPicture:!1,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:.5,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,beat:!1}),ft=({size:e,dpr:i,samples:r=0,camera:o,geometry:n,positions:m,uvs:f})=>{const s=l.useMemo(()=>new t.Scene,[]),[v,{points:a,interactiveMesh:c,positions:h,uvs:d}]=be({scene:s,size:e,dpr:i,geometry:n,positions:m,uvs:f}),[g,p]=D({scene:s,camera:o,size:e,dpr:i,samples:r,depthBuffer:!0}),y=l.useCallback((M,b)=>(v(M,b),p(M.gl)),[p,v]),w=l.useCallback(M=>{v(null,M)},[v]);return[y,w,{scene:s,points:a,interactiveMesh:c,renderTarget:g,output:g.texture,positions:h,uvs:d}]};function pt(e,i=1e-4){i=Math.max(i,Number.EPSILON);const r={},o=e.getIndex(),n=e.getAttribute("position"),m=o?o.count:n.count;let f=0;const s=Object.keys(e.attributes),v={},a={},c=[],h=["getX","getY","getZ","getW"];for(let y=0,w=s.length;y<w;y++){const M=s[y];v[M]=[];const b=e.morphAttributes[M];b&&(a[M]=new Array(b.length).fill(0).map(()=>[]))}const d=Math.log10(1/i),g=Math.pow(10,d);for(let y=0;y<m;y++){const w=o?o.getX(y):y;let M="";for(let b=0,T=s.length;b<T;b++){const C=s[b],P=e.getAttribute(C),S=P.itemSize;for(let _=0;_<S;_++)M+=`${~~(P[h[_]](w)*g)},`}if(M in r)c.push(r[M]);else{for(let b=0,T=s.length;b<T;b++){const C=s[b],P=e.getAttribute(C),S=e.morphAttributes[C],_=P.itemSize,B=v[C],L=a[C];for(let O=0;O<_;O++){const $=h[O];if(B.push(P[$](w)),S)for(let z=0,Z=S.length;z<Z;z++)L[z].push(S[z][$](w))}}r[M]=f,c.push(f),f++}}const p=e.clone();for(let y=0,w=s.length;y<w;y++){const M=s[y],b=e.getAttribute(M),T=new b.array.constructor(v[M]),C=new k.BufferAttribute(T,b.itemSize,b.normalized);if(p.setAttribute(M,C),M in a)for(let P=0;P<a[M].length;P++){const S=e.morphAttributes[M][P],_=new S.array.constructor(a[M][P]),B=new k.BufferAttribute(_,S.itemSize,S.normalized);p.morphAttributes[M][P]=B}}return p.setIndex(c),p}var dt=`vec3 random3(vec3 c) {
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
}`,gt=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,ht=`#ifdef USE_TRANSMISSION

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

#endif`;const we=e=>{let i=e;return i=i.replace("#include <beginnormal_vertex>",`
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
		void main() {`),i=i.replace("// #usf <getWobble>",`${he}`),i=i.replace("void main() {",`
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
		vWobble = wobble / uWobbleStrength;`),i},xt=({baseMaterial:e,materialParameters:i})=>{const{material:r,depthMaterial:o}=l.useMemo(()=>{const n=new(e||t.MeshPhysicalMaterial)(i||{}),m=n.type==="MeshPhysicalMaterial"||n.type==="MeshStandardMaterial",f=n.type==="MeshPhysicalMaterial";Object.assign(n.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:F.wobblePositionFrequency},uWobbleTimeFrequency:{value:F.wobbleTimeFrequency},uWobbleStrength:{value:F.wobbleStrength},uWarpPositionFrequency:{value:F.warpPositionFrequency},uWarpTimeFrequency:{value:F.warpTimeFrequency},uWarpStrength:{value:F.warpStrength},uWobbleShine:{value:F.wobbleShine},uColor0:{value:F.color0},uColor1:{value:F.color1},uColor2:{value:F.color2},uColor3:{value:F.color3},uColorMix:{value:F.colorMix},uChromaticAberration:{value:F.chromaticAberration},uAnisotropicBlur:{value:F.anisotropicBlur},uDistortion:{value:F.distortion},uDistortionScale:{value:F.distortionScale},uTemporalDistortion:{value:F.temporalDistortion},uSamples:{value:F.samples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),n.onBeforeCompile=v=>{Object.assign(v.uniforms,n.userData.uniforms),v.vertexShader=we(v.vertexShader),v.fragmentShader=v.fragmentShader.replace("#include <color_fragment>",`
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`),m&&(v.fragmentShader=v.fragmentShader.replace("#include <roughnessmap_fragment>",`
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`)),v.fragmentShader=v.fragmentShader.replace("void main() {",`
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
				${dt}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${m?"float usf_Roughness = roughness;":""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${m?"usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);":""}`),f&&(v.fragmentShader=v.fragmentShader.replace("#include <transmission_pars_fragment>",`${gt}`),v.fragmentShader=v.fragmentShader.replace("#include <transmission_fragment>",`${ht}`))},n.needsUpdate=!0;const s=new t.MeshDepthMaterial({depthPacking:t.RGBADepthPacking});return s.onBeforeCompile=v=>{Object.assign(v.uniforms,n.userData.uniforms),v.vertexShader=we(v.vertexShader)},s.needsUpdate=!0,{material:n,depthMaterial:s}},[i,e]);return{material:r,depthMaterial:o}},Se=({scene:e=!1,geometry:i,baseMaterial:r,materialParameters:o})=>{const n=l.useMemo(()=>{let a=i||new t.IcosahedronGeometry(2,50);return a=pt(a),a.computeTangents(),a},[i]),{material:m,depthMaterial:f}=xt({baseMaterial:r,materialParameters:o}),s=R(e,n,m,t.Mesh);return[l.useCallback((a,c)=>{const h=m.userData;a&&u(h,"uTime",(c==null?void 0:c.beat)||a.clock.getElapsedTime()),c!==void 0&&(u(h,"uWobbleStrength",c.wobbleStrength),u(h,"uWobblePositionFrequency",c.wobblePositionFrequency),u(h,"uWobbleTimeFrequency",c.wobbleTimeFrequency),u(h,"uWarpStrength",c.warpStrength),u(h,"uWarpPositionFrequency",c.warpPositionFrequency),u(h,"uWarpTimeFrequency",c.warpTimeFrequency),u(h,"uWobbleShine",c.wobbleShine),u(h,"uSamples",c.samples),u(h,"uColor0",c.color0),u(h,"uColor1",c.color1),u(h,"uColor2",c.color2),u(h,"uColor3",c.color3),u(h,"uColorMix",c.colorMix),u(h,"uChromaticAberration",c.chromaticAberration),u(h,"uAnisotropicBlur",c.anisotropicBlur),u(h,"uDistortion",c.distortion),u(h,"uDistortionScale",c.distortionScale),u(h,"uTemporalDistortion",c.temporalDistortion))},[m]),{mesh:s,depthMaterial:f}]},F=Object.freeze({beat:!1,wobbleStrength:.3,wobblePositionFrequency:.5,wobbleTimeFrequency:.4,wobbleShine:0,warpStrength:1.7,warpPositionFrequency:.38,warpTimeFrequency:.12,samples:6,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),colorMix:1,chromaticAberration:.5,anisotropicBlur:.1,distortion:.1,distortionScale:.1,temporalDistortion:.1}),yt=({size:e,dpr:i,samples:r=0,camera:o,geometry:n,baseMaterial:m,materialParameters:f})=>{const s=l.useMemo(()=>new t.Scene,[]),[v,{mesh:a,depthMaterial:c}]=Se({baseMaterial:m,materialParameters:f,scene:s,geometry:n}),[h,d]=D({scene:s,camera:o,size:e,dpr:i,samples:r,depthBuffer:!0}),g=l.useCallback((y,w)=>(v(y,w),d(y.gl)),[d,v]),p=l.useCallback(y=>{v(null,y)},[v]);return[g,p,{scene:s,mesh:a,depthMaterial:c,renderTarget:h,output:h.texture}]},Mt=(e,i,r)=>{const o=l.useMemo(()=>new t.Mesh(i,r),[i,r]);return l.useEffect(()=>{e.add(o)},[e,o]),l.useEffect(()=>()=>{e.remove(o),i.dispose(),r.dispose()},[e,i,r,o]),o},K=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const r=2.5949095;return e<.5?Math.pow(2*e,2)*((r+1)*2*e-r)/2:(Math.pow(2*e-2,2)*((r+1)*(e*2-2)+r)+2)/2},easeInElastic(e){const i=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*i)},easeOutElastic(e){const i=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*i)+1},easeInOutElastic(e){const i=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*i))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*i)/2+1},easeInBounce(e){return 1-K.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-K.easeOutBounce(1-2*e))/2:(1+K.easeOutBounce(2*e-1))/2}});function bt(e){let i=Math.sin(e*12.9898)*43758.5453;return i-Math.floor(i)}const wt=(e,i="easeOutQuart")=>{const r=e/60,o=K[i];return l.useCallback(m=>{let f=m.getElapsedTime()*r;const s=Math.floor(f),v=o(f-s);f=v+s;const a=bt(s);return{beat:f,floor:s,fract:v,hash:a}},[r,o])},St=(e=60)=>{const i=l.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),r=l.useRef(null);return l.useCallback(n=>{const m=n.getElapsedTime();return r.current===null||m-r.current>=i?(r.current=m,!0):!1},[i])},_t=e=>{var o,n;const i=(o=e.dom)==null?void 0:o.length,r=(n=e.texture)==null?void 0:n.length;return!i||!r||i!==r};var Ct=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Tt=`precision highp float;

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
}`;const Pt=({params:e,size:i,scene:r})=>{r.children.length>0&&(r.children.forEach(o=>{o instanceof t.Mesh&&(o.geometry.dispose(),o.material.dispose())}),r.remove(...r.children)),e.texture.forEach((o,n)=>{const m=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:Ct,fragmentShader:Tt,transparent:!0,uniforms:{u_texture:{value:o},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[n]?e.boderRadius[n]:0}}}));r.add(m)})},Dt=()=>{const e=l.useRef([]),i=l.useRef([]);return l.useCallback(({isIntersectingRef:o,isIntersectingOnceRef:n,params:m})=>{e.current.length>0&&e.current.forEach((s,v)=>{s.unobserve(i.current[v])}),i.current=[],e.current=[];const f=new Array(m.dom.length).fill(!1);o.current=[...f],n.current=[...f],m.dom.forEach((s,v)=>{const a=h=>{h.forEach(d=>{m.onIntersect[v]&&m.onIntersect[v](d),o.current[v]=d.isIntersecting})},c=new IntersectionObserver(a,{rootMargin:"0px",threshold:0});c.observe(s),e.current.push(c),i.current.push(s)})},[])},Rt=()=>{const e=l.useRef([]),i=l.useCallback(({params:r,size:o,resolutionRef:n,scene:m,isIntersectingRef:f})=>{m.children.length!==e.current.length&&(e.current=new Array(m.children.length)),m.children.forEach((s,v)=>{var h,d,g,p,y,w;const a=r.dom[v];if(!a)return;const c=a.getBoundingClientRect();if(e.current[v]=c,s.scale.set(c.width,c.height,1),s.position.set(c.left+c.width*.5-o.width*.5,-c.top-c.height*.5+o.height*.5,0),f.current[v]&&(r.rotation[v]&&s.rotation.copy(r.rotation[v]),s instanceof t.Mesh)){const M=s.material;u(M,"u_texture",r.texture[v]),u(M,"u_textureResolution",[((g=(d=(h=r.texture[v])==null?void 0:h.source)==null?void 0:d.data)==null?void 0:g.width)||0,((w=(y=(p=r.texture[v])==null?void 0:p.source)==null?void 0:y.data)==null?void 0:w.height)||0]),u(M,"u_resolution",n.current.set(c.width,c.height)),u(M,"u_borderRadius",r.boderRadius[v]?r.boderRadius[v]:0)}})},[]);return[e.current,i]},At=()=>{const e=l.useRef([]),i=l.useRef([]),r=l.useCallback((o,n=!1)=>{e.current.forEach((f,s)=>{f&&(i.current[s]=!0)});const m=n?[...i.current]:[...e.current];return o<0?m:m[o]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:i,isIntersecting:r}},It=e=>({onView:r,onHidden:o})=>{const n=l.useRef(!1);l.useEffect(()=>{let m;const f=()=>{e.current.some(s=>s)?n.current||(r&&r(),n.current=!0):n.current&&(o&&o(),n.current=!1),m=requestAnimationFrame(f)};return m=requestAnimationFrame(f),()=>{cancelAnimationFrame(m)}},[r,o])},_e={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},Ft=({size:e,dpr:i,samples:r=0},o=[])=>{const n=l.useMemo(()=>new t.Scene,[]),m=A(e),[f,s]=D({scene:n,camera:m,size:e,dpr:i,samples:r,isSizeUpdate:!0}),[v,a]=I({..._e,updateKey:performance.now()}),[c,h]=Rt(),d=l.useRef(new t.Vector2(0,0)),[g,p]=l.useState(!0);l.useEffect(()=>{p(!0)},o);const y=l.useRef(null),w=l.useMemo(()=>new t.Texture,[]),M=Dt(),{isIntersectingOnceRef:b,isIntersectingRef:T,isIntersecting:C}=At(),P=It(T);return[l.useCallback((_,B)=>{const{gl:L,size:O}=_;if(B&&a(B),_t(v))return w;if(g){if(y.current===v.updateKey)return w;y.current=v.updateKey}return g&&(Pt({params:v,size:O,scene:n}),M({isIntersectingRef:T,isIntersectingOnceRef:b,params:v}),p(!1)),h({params:v,size:O,resolutionRef:d,scene:n,isIntersectingRef:T}),s(L)},[s,a,M,h,g,n,v,b,T,w]),a,{scene:n,camera:m,renderTarget:f,output:f.texture,isIntersecting:C,DOMRects:c,intersections:T.current,useDomView:P}]},Ut=({scene:e,camera:i,size:r,dpr:o=!1,isSizeUpdate:n=!1,samples:m=0,depthBuffer:f=!1,depthTexture:s=!1},v)=>{const a=l.useRef([]),c=E(r,o);a.current=l.useMemo(()=>Array.from({length:v},()=>{const d=new t.WebGLRenderTarget(c.x,c.y,{...G,samples:m,depthBuffer:f});return s&&(d.depthTexture=new t.DepthTexture(c.x,c.y,t.FloatType)),d}),[v]),l.useLayoutEffect(()=>{n&&a.current.forEach(d=>d.setSize(c.x,c.y))},[c,n]),l.useEffect(()=>{const d=a.current;return()=>{d.forEach(g=>g.dispose())}},[v]);const h=l.useCallback((d,g,p)=>{const y=a.current[g];return H({gl:d,scene:e,camera:i,fbo:y,onBeforeRender:()=>p&&p({read:y.texture})}),y.texture},[e,i]);return[a.current,h]};x.ALPHABLENDING_PARAMS=fe,x.BLENDING_PARAMS=le,x.BRIGHTNESSPICKER_PARAMS=ve,x.BRUSH_PARAMS=ne,x.CHROMAKEY_PARAMS=ge,x.COLORSTRATA_PARAMS=ie,x.COSPALETTE_PARAMS=ue,x.COVERTEXTURE_PARAMS=de,x.DOMSYNCER_PARAMS=_e,x.DUOTONE_PARAMS=se,x.Easing=K,x.FBO_OPTION=G,x.FLUID_PARAMS=te,x.FXBLENDING_PARAMS=me,x.FXTEXTURE_PARAMS=ce,x.HSV_PARAMS=pe,x.MARBLE_PARAMS=ae,x.MORPHPARTICLES_PARAMS=U,x.NOISE_PARAMS=re,x.RIPPLE_PARAMS=oe,x.SIMPLEBLUR_PARAMS=Q,x.WAVE_PARAMS=j,x.WOBBLE3D_PARAMS=F,x.renderFBO=H,x.setUniform=u,x.useAddMesh=Mt,x.useAlphaBlending=$n,x.useBeat=wt,x.useBlending=Tn,x.useBrightnessPicker=Vn,x.useBrush=Ue,x.useCamera=A,x.useChromaKey=st,x.useColorStrata=cn,x.useCopyTexture=Ut,x.useCosPalette=xn,x.useCoverTexture=Yn,x.useCreateMorphParticles=be,x.useCreateWobble3D=Se,x.useDomSyncer=Ft,x.useDoubleFBO=q,x.useDuoTone=wn,x.useFPSLimiter=St,x.useFluid=Je,x.useFxBlending=En,x.useFxTexture=An,x.useHSV=Gn,x.useMarble=pn,x.useMorphParticles=ft,x.useNoise=an,x.useParams=I,x.usePointer=X,x.useResolution=E,x.useRipple=nn,x.useSimpleBlur=et,x.useSingleFBO=D,x.useWave=rt,x.useWobble3D=yt,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
