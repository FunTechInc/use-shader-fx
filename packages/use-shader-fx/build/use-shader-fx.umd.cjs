(function(y,$){typeof exports=="object"&&typeof module<"u"?$(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],$):(y=typeof globalThis<"u"?globalThis:y||self,$(y["use-shader-fx"]={},y.THREE,y.React))})(this,function(y,$,l){"use strict";function Re(e){const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const o in e)if(o!=="default"){const r=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(a,o,r.get?r:{enumerable:!0,get:()=>e[o]})}}return a.default=e,Object.freeze(a)}const t=Re($);var De=`varying vec2 vUv;

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
}`;const E=(e,a=!1)=>{const o=a?e.width*a:e.width,r=a?e.height*a:e.height;return l.useMemo(()=>new t.Vector2(o,r),[o,r])},i=(e,a,o)=>{o!==void 0&&e.uniforms&&e.uniforms[a]&&o!==null&&(e.uniforms[a].value=o)},A=(e,a,o,r)=>{const n=l.useMemo(()=>new r(a,o),[a,o,r]);return l.useEffect(()=>{e&&e.add(n)},[e,n]),l.useEffect(()=>()=>{e&&e.remove(n),a.dispose(),o.dispose()},[e,a,o,n]),n},Ie=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uBuffer:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uTexture:{value:new t.Texture},uIsTexture:{value:!1},uMap:{value:new t.Texture},uIsMap:{value:!1},uMapIntensity:{value:0},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(-10,-10)},uPrevMouse:{value:new t.Vector2(-10,-10)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Vector3(1,0,0)},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:De,fragmentShader:Ae}),[]),v=E(a,o);l.useEffect(()=>{i(n,"uResolution",v.clone())},[v,n]);const f=A(e,r,n,t.Mesh);return{material:n,mesh:f}},Fe=(e,a)=>{const o=a,r=e/a,[n,v]=[o*r/2,o/2];return{width:n,height:v,near:-1e3,far:1e3}},I=(e,a="OrthographicCamera")=>{const o=E(e),{width:r,height:n,near:v,far:f}=Fe(o.x,o.y);return l.useMemo(()=>a==="OrthographicCamera"?new t.OrthographicCamera(-r,r,n,-n,v,f):new t.PerspectiveCamera(50,r/n),[r,n,v,f,a])},X=(e=0)=>{const a=l.useRef(new t.Vector2(0,0)),o=l.useRef(new t.Vector2(0,0)),r=l.useRef(new t.Vector2(0,0)),n=l.useRef(0),v=l.useRef(new t.Vector2(0,0)),f=l.useRef(!1);return l.useCallback(s=>{const u=performance.now();let c;f.current&&e?(r.current=r.current.lerp(s,1-e),c=r.current.clone()):(c=s.clone(),r.current=c),n.current===0&&(n.current=u,a.current=c);const h=Math.max(1,u-n.current);n.current=u,v.current.copy(c).sub(a.current).divideScalar(h);const p=v.current.length()>0,g=f.current?a.current.clone():c;return!f.current&&p&&(f.current=!0),a.current=c,{currentPointer:c,prevPointer:g,diffPointer:o.current.subVectors(c,g),velocity:v.current,isVelocityUpdate:p}},[e])},F=e=>{const a=n=>Object.values(n).some(v=>typeof v=="function"),o=l.useRef(a(e)?e:structuredClone(e)),r=l.useCallback(n=>{for(const v in n){const f=v;f in o.current&&n[f]!==void 0&&n[f]!==null?o.current[f]=n[f]:console.error(`"${String(f)}" does not exist in the params. or "${String(f)}" is null | undefined`)}},[]);return[o.current,r]},G={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,stencilBuffer:!1},H=({gl:e,fbo:a,scene:o,camera:r,onBeforeRender:n,onSwap:v})=>{e.setRenderTarget(a),n(),e.clear(),e.render(o,r),v&&v(),e.setRenderTarget(null),e.clear()},D=({scene:e,camera:a,size:o,dpr:r=!1,isSizeUpdate:n=!1,samples:v=0,depthBuffer:f=!1,depthTexture:m=!1})=>{const s=l.useRef(),u=E(o,r);s.current=l.useMemo(()=>{const h=new t.WebGLRenderTarget(u.x,u.y,{...G,samples:v,depthBuffer:f});return m&&(h.depthTexture=new t.DepthTexture(u.x,u.y,t.FloatType)),h},[]),l.useLayoutEffect(()=>{var h;n&&((h=s.current)==null||h.setSize(u.x,u.y))},[u,n]),l.useEffect(()=>{const h=s.current;return()=>{h==null||h.dispose()}},[]);const c=l.useCallback((h,p)=>{const g=s.current;return H({gl:h,fbo:g,scene:e,camera:a,onBeforeRender:()=>p&&p({read:g.texture})}),g.texture},[e,a]);return[s.current,c]},q=({scene:e,camera:a,size:o,dpr:r=!1,isSizeUpdate:n=!1,samples:v=0,depthBuffer:f=!1,depthTexture:m=!1})=>{const s=l.useRef({read:null,write:null,swap:function(){let p=this.read;this.read=this.write,this.write=p}}),u=E(o,r),c=l.useMemo(()=>{const p=new t.WebGLRenderTarget(u.x,u.y,{...G,samples:v,depthBuffer:f}),g=new t.WebGLRenderTarget(u.x,u.y,{...G,samples:v,depthBuffer:f});return m&&(p.depthTexture=new t.DepthTexture(u.x,u.y,t.FloatType),g.depthTexture=new t.DepthTexture(u.x,u.y,t.FloatType)),{read:p,write:g}},[]);s.current.read=c.read,s.current.write=c.write,l.useLayoutEffect(()=>{var p,g;n&&((p=s.current.read)==null||p.setSize(u.x,u.y),(g=s.current.write)==null||g.setSize(u.x,u.y))},[u,n]),l.useEffect(()=>{const p=s.current;return()=>{var g,x;(g=p.read)==null||g.dispose(),(x=p.write)==null||x.dispose()}},[]);const h=l.useCallback((p,g)=>{var d;const x=s.current;return H({gl:p,scene:e,camera:a,fbo:x.write,onBeforeRender:()=>g&&g({read:x.read.texture,write:x.write.texture}),onSwap:()=>x.swap()}),(d=x.read)==null?void 0:d.texture},[e,a]);return[{read:s.current.read,write:s.current.write},h]},ne=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),ze=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Ie({scene:r,size:e,dpr:a}),f=I(e),m=X(),[s,u]=q({scene:r,camera:f,size:e,dpr:a,samples:o}),[c,h]=F(ne),p=l.useRef(null);return[l.useCallback((x,d)=>{const{gl:w,pointer:M}=x;d&&h(d),c.texture?(i(n,"uIsTexture",!0),i(n,"uTexture",c.texture)):i(n,"uIsTexture",!1),c.map?(i(n,"uIsMap",!0),i(n,"uMap",c.map),i(n,"uMapIntensity",c.mapIntensity)):i(n,"uIsMap",!1),i(n,"uRadius",c.radius),i(n,"uSmudge",c.smudge),i(n,"uDissipation",c.dissipation),i(n,"uMotionBlur",c.motionBlur),i(n,"uMotionSample",c.motionSample);const b=c.pointerValues||m(M);b.isVelocityUpdate&&(i(n,"uMouse",b.currentPointer),i(n,"uPrevMouse",b.prevPointer)),i(n,"uVelocity",b.velocity);const T=typeof c.color=="function"?c.color(b.velocity):c.color;return i(n,"uColor",T),i(n,"uIsCursor",c.isCursor),i(n,"uPressureEnd",c.pressure),p.current===null&&(p.current=c.pressure),i(n,"uPressureStart",p.current),p.current=c.pressure,u(w,({read:C})=>{i(n,"uBuffer",C)})},[n,m,u,c,h]),h,{scene:r,mesh:v,material:n,camera:f,renderTarget:s,output:s.read.texture}]};var W=`varying vec2 vUv;
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
}`,Ue=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Ve=()=>l.useMemo(()=>new t.ShaderMaterial({vertexShader:W,fragmentShader:Ue,depthTest:!1,depthWrite:!1}),[]);var Be=`precision highp float;

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
}`;const Oe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:W,fragmentShader:Be}),[]);var Ee=`precision highp float;

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
}`;const $e=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:We}),[]);var ke=`precision highp float;

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
}`;const qe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:ke}),[]);var je=`precision highp float;

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
}`;const Qe=()=>l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:W,fragmentShader:Ye}),[]),Ze=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=Ve(),v=n.clone(),f=qe(),m=Ne(),s=Oe(),u=Le(),c=$e(),h=Ke(),p=He(),g=Qe(),x=l.useMemo(()=>({vorticityMaterial:m,curlMaterial:f,advectionMaterial:s,divergenceMaterial:u,pressureMaterial:c,clearMaterial:h,gradientSubtractMaterial:p,splatMaterial:g}),[m,f,s,u,c,h,p,g]),d=E(a,o);l.useEffect(()=>{i(x.splatMaterial,"aspectRatio",d.x/d.y);for(const b of Object.values(x))i(b,"texelSize",new t.Vector2(1/d.x,1/d.y))},[d,x]);const w=A(e,r,n,t.Mesh);l.useEffect(()=>{n.dispose(),w.material=v},[n,w,v]),l.useEffect(()=>()=>{for(const b of Object.values(x))b.dispose()},[x]);const M=l.useCallback(b=>{w.material=b,w.material.needsUpdate=!0},[w]);return{materials:x,setMeshMaterial:M,mesh:w}},te=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1),pointerValues:!1}),Je=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{materials:n,setMeshMaterial:v,mesh:f}=Ze({scene:r,size:e,dpr:a}),m=I(e),s=X(),u=l.useMemo(()=>({scene:r,camera:m,size:e,samples:o}),[r,m,e,o]),[c,h]=q(u),[p,g]=q(u),[x,d]=D(u),[w,M]=D(u),[b,T]=q(u),C=l.useRef(0),P=l.useRef(new t.Vector2(0,0)),S=l.useRef(new t.Vector3(0,0,0)),[_,V]=F(te);return[l.useCallback((O,k)=>{const{gl:B,pointer:Z,clock:J,size:Ce}=O;k&&V(k),C.current===0&&(C.current=J.getElapsedTime());const Te=Math.min((J.getElapsedTime()-C.current)/3,.02);C.current=J.getElapsedTime();const ee=h(B,({read:U})=>{v(n.advectionMaterial),i(n.advectionMaterial,"uVelocity",U),i(n.advectionMaterial,"uSource",U),i(n.advectionMaterial,"dt",Te),i(n.advectionMaterial,"dissipation",_.velocity_dissipation)}),Vt=g(B,({read:U})=>{v(n.advectionMaterial),i(n.advectionMaterial,"uVelocity",ee),i(n.advectionMaterial,"uSource",U),i(n.advectionMaterial,"dissipation",_.density_dissipation)}),Y=_.pointerValues||s(Z);Y.isVelocityUpdate&&(h(B,({read:U})=>{v(n.splatMaterial),i(n.splatMaterial,"uTarget",U),i(n.splatMaterial,"point",Y.currentPointer);const N=Y.diffPointer.multiply(P.current.set(Ce.width,Ce.height).multiplyScalar(_.velocity_acceleration));i(n.splatMaterial,"color",S.current.set(N.x,N.y,1)),i(n.splatMaterial,"radius",_.splat_radius)}),g(B,({read:U})=>{v(n.splatMaterial),i(n.splatMaterial,"uTarget",U);const N=typeof _.fluid_color=="function"?_.fluid_color(Y.velocity):_.fluid_color;i(n.splatMaterial,"color",N)}));const Bt=d(B,()=>{v(n.curlMaterial),i(n.curlMaterial,"uVelocity",ee)});h(B,({read:U})=>{v(n.vorticityMaterial),i(n.vorticityMaterial,"uVelocity",U),i(n.vorticityMaterial,"uCurl",Bt),i(n.vorticityMaterial,"curl",_.curl_strength),i(n.vorticityMaterial,"dt",Te)});const Ot=M(B,()=>{v(n.divergenceMaterial),i(n.divergenceMaterial,"uVelocity",ee)});T(B,({read:U})=>{v(n.clearMaterial),i(n.clearMaterial,"uTexture",U),i(n.clearMaterial,"value",_.pressure_dissipation)}),v(n.pressureMaterial),i(n.pressureMaterial,"uDivergence",Ot);let Pe;for(let U=0;U<_.pressure_iterations;U++)Pe=T(B,({read:N})=>{i(n.pressureMaterial,"uPressure",N)});return h(B,({read:U})=>{v(n.gradientSubtractMaterial),i(n.gradientSubtractMaterial,"uPressure",Pe),i(n.gradientSubtractMaterial,"uVelocity",U)}),Vt},[n,v,d,g,M,s,T,h,V,_]),V,{scene:r,mesh:f,materials:n,camera:m,renderTarget:{velocity:c,density:p,curl:x,divergence:w,pressure:b},output:p.read.texture}]},en=({scale:e,max:a,texture:o,scene:r})=>{const n=l.useRef([]),v=l.useMemo(()=>new t.PlaneGeometry(e,e),[e]),f=l.useMemo(()=>new t.MeshBasicMaterial({map:o,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[o]);return l.useEffect(()=>{for(let m=0;m<a;m++){const s=new t.Mesh(v.clone(),f.clone());s.rotateZ(2*Math.PI*Math.random()),s.visible=!1,r.add(s),n.current.push(s)}},[v,f,r,a]),l.useEffect(()=>()=>{n.current.forEach(m=>{m.geometry.dispose(),Array.isArray(m.material)?m.material.forEach(s=>s.dispose()):m.material.dispose(),r.remove(m)}),n.current=[]},[r]),n.current},re=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),nn=({texture:e=new t.Texture,scale:a=64,max:o=100,size:r,dpr:n,samples:v=0})=>{const f=l.useMemo(()=>new t.Scene,[]),m=en({scale:a,max:o,texture:e,scene:f}),s=I(r),u=X(),[c,h]=D({scene:f,camera:s,size:r,dpr:n,samples:v}),[p,g]=F(re),x=l.useRef(0);return[l.useCallback((w,M)=>{const{gl:b,pointer:T,size:C}=w;M&&g(M);const P=p.pointerValues||u(T);if(p.frequency<P.diffPointer.length()){const S=m[x.current];S.visible=!0,S.position.set(P.currentPointer.x*(C.width/2),P.currentPointer.y*(C.height/2),0),S.scale.x=S.scale.y=0,S.material.opacity=p.alpha,x.current=(x.current+1)%o}return m.forEach(S=>{if(S.visible){const _=S.material;S.rotation.z+=p.rotation,_.opacity*=p.fadeout_speed,S.scale.x=p.fadeout_speed*S.scale.x+p.scale,S.scale.y=S.scale.x,_.opacity<.002&&(S.visible=!1)}}),h(b)},[h,m,u,o,p,g]),g,{scene:f,camera:s,meshArr:m,renderTarget:c,output:c.texture}]};var tn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,rn=`precision highp float;
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
}`;const on=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new t.Vector2},warpStrength:{value:0}},vertexShader:tn,fragmentShader:rn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},oe=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new t.Vector2(2,2),warpStrength:8,beat:!1}),an=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=on(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(oe);return[l.useCallback((p,g)=>{const{gl:x,clock:d}=p;return g&&c(g),i(n,"scale",u.scale),i(n,"timeStrength",u.timeStrength),i(n,"noiseOctaves",u.noiseOctaves),i(n,"fbmOctaves",u.fbmOctaves),i(n,"warpOctaves",u.warpOctaves),i(n,"warpDirection",u.warpDirection),i(n,"warpStrength",u.warpStrength),i(n,"uTime",u.beat||d.getElapsedTime()),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var un=`varying vec2 vUv;

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
}`;const ln=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new t.Texture},noiseStrength:{value:new t.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new t.Vector2(.1,.1)},laminateDetail:{value:new t.Vector2(1,1)},distortion:{value:new t.Vector2(0,0)},colorFactor:{value:new t.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new t.Vector2(0,0)}},vertexShader:un,fragmentShader:sn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},ie=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new t.Vector2(.1,.1),laminateDetail:new t.Vector2(1,1),distortion:new t.Vector2(0,0),colorFactor:new t.Vector3(1,1,1),timeStrength:new t.Vector2(0,0),noise:!1,noiseStrength:new t.Vector2(0,0),beat:!1}),cn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=ln(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(ie);return[l.useCallback((p,g)=>{const{gl:x,clock:d}=p;return g&&c(g),u.texture?(i(n,"uTexture",u.texture),i(n,"isTexture",!0)):(i(n,"isTexture",!1),i(n,"scale",u.scale)),u.noise?(i(n,"noise",u.noise),i(n,"isNoise",!0),i(n,"noiseStrength",u.noiseStrength)):i(n,"isNoise",!1),i(n,"uTime",u.beat||d.getElapsedTime()),i(n,"laminateLayer",u.laminateLayer),i(n,"laminateInterval",u.laminateInterval),i(n,"laminateDetail",u.laminateDetail),i(n,"distortion",u.distortion),i(n,"colorFactor",u.colorFactor),i(n,"timeStrength",u.timeStrength),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var vn=`varying vec2 vUv;

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
}`;const fn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:0},u_complexity:{value:0},u_complexityAttenuation:{value:0},u_iterations:{value:0},u_timeStrength:{value:0},u_scale:{value:0}},vertexShader:vn,fragmentShader:mn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},ae=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),pn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=fn(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(ae);return[l.useCallback((p,g)=>{const{gl:x,clock:d}=p;return g&&c(g),i(n,"u_pattern",u.pattern),i(n,"u_complexity",u.complexity),i(n,"u_complexityAttenuation",u.complexityAttenuation),i(n,"u_iterations",u.iterations),i(n,"u_timeStrength",u.timeStrength),i(n,"u_scale",u.scale),i(n,"u_time",u.beat||d.getElapsedTime()),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var dn=`varying vec2 vUv;

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
}`;const hn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uRgbWeight:{value:new t.Vector3(.299,.587,.114)},uColor1:{value:new t.Color().set(.5,.5,.5)},uColor2:{value:new t.Color().set(.5,.5,.5)},uColor3:{value:new t.Color().set(1,1,1)},uColor4:{value:new t.Color().set(0,.1,.2)}},vertexShader:dn,fragmentShader:gn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},ue=Object.freeze({texture:new t.Texture,color1:new t.Color().set(.5,.5,.5),color2:new t.Color().set(.5,.5,.5),color3:new t.Color().set(1,1,1),color4:new t.Color().set(0,.1,.2),rgbWeight:new t.Vector3(.299,.587,.114)}),xn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=hn(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(ue);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"uTexture",u.texture),i(n,"uColor1",u.color1),i(n,"uColor2",u.color2),i(n,"uColor3",u.color3),i(n,"uColor4",u.color4),i(n,"uRgbWeight",u.rgbWeight),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var yn=`varying vec2 vUv;

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
}`;const bn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:yn,fragmentShader:Mn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},se={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},wn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=bn(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(se);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"uTexture",u.texture),i(n,"uColor0",u.color0),i(n,"uColor1",u.color1),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Sn=`varying vec2 vUv;

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
}`;const Cn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_alphaMap:{value:new t.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new t.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:Sn,fragmentShader:_n}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},le={texture:new t.Texture,map:new t.Texture,alphaMap:!1,mapIntensity:.3,brightness:new t.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Tn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Cn(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(le);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"u_texture",u.texture),i(n,"u_map",u.map),i(n,"u_mapIntensity",u.mapIntensity),u.alphaMap?(i(n,"u_alphaMap",u.alphaMap),i(n,"u_isAlphaMap",!0)):i(n,"u_isAlphaMap",!1),i(n,"u_brightness",u.brightness),i(n,"u_min",u.min),i(n,"u_max",u.max),u.dodgeColor?(i(n,"u_dodgeColor",u.dodgeColor),i(n,"u_isDodgeColor",!0)):i(n,"u_isDodgeColor",!1),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Pn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Rn=`precision highp float;

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

}`;const Dn=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Pn,fragmentShader:Rn}),[]),v=E(a,o);l.useEffect(()=>{i(n,"uResolution",v.clone())},[v,n]);const f=A(e,r,n,t.Mesh);return{material:n,mesh:f}},ce={texture0:new t.Texture,texture1:new t.Texture,padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},An=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Dn({scene:r,size:e,dpr:a}),f=I(e),[m,s]=D({scene:r,camera:f,dpr:a,size:e,samples:o,isSizeUpdate:!0}),[u,c]=F(ce);return[l.useCallback((p,g)=>{var b,T,C,P,S,_,V,L;const{gl:x}=p;g&&c(g),i(n,"uTexture0",u.texture0),i(n,"uTexture1",u.texture1),i(n,"progress",u.progress);const d=[((T=(b=u.texture0)==null?void 0:b.image)==null?void 0:T.width)||0,((P=(C=u.texture0)==null?void 0:C.image)==null?void 0:P.height)||0],w=[((_=(S=u.texture1)==null?void 0:S.image)==null?void 0:_.width)||0,((L=(V=u.texture1)==null?void 0:V.image)==null?void 0:L.height)||0],M=d.map((O,k)=>O+(w[k]-O)*u.progress);return i(n,"uTextureResolution",M),i(n,"padding",u.padding),i(n,"uMap",u.map),i(n,"mapIntensity",u.mapIntensity),i(n,"edgeIntensity",u.edgeIntensity),i(n,"epicenter",u.epicenter),i(n,"dirX",u.dir.x),i(n,"dirY",u.dir.y),s(x)},[s,n,u,c]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var In=`varying vec2 vUv;

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
}`;const zn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:In,fragmentShader:Fn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},ve={texture:new t.Texture,brightness:new t.Vector3(.5,.5,.5),min:0,max:1},Un=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=zn(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(ve);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"u_texture",u.texture),i(n,"u_brightness",u.brightness),i(n,"u_min",u.min),i(n,"u_max",u.max),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Bn=`precision highp float;

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
}`;const On=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_mapIntensity:{value:0}},vertexShader:Vn,fragmentShader:Bn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},me={texture:new t.Texture,map:new t.Texture,mapIntensity:.3},En=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=On(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(me);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"u_texture",u.texture),i(n,"u_map",u.map),i(n,"u_mapIntensity",u.mapIntensity),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Ln=`varying vec2 vUv;

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
}`;const $n=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uMap:{value:new t.Texture}},vertexShader:Ln,fragmentShader:Wn}),[]),v=A(e,r,n,t.Mesh);return{material:n,mesh:v}},fe={texture:new t.Texture,map:new t.Texture},kn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=$n({scene:r,size:e,dpr:a}),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(fe);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"uTexture",u.texture),i(n,"uMap",u.map),s(x)},[n,s,u,c]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var qn=`varying vec2 vUv;

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
}`;const Nn=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:1},u_saturation:{value:1}},vertexShader:qn,fragmentShader:jn}),[]),v=A(e,r,n,t.Mesh);return{material:n,mesh:v}},pe={texture:new t.Texture,brightness:1,saturation:1},Gn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Nn({scene:r,size:e,dpr:a}),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(pe);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"u_texture",u.texture),i(n,"u_brightness",u.brightness),i(n,"u_saturation",u.saturation),s(x)},[n,s,u,c]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Kn=`varying vec2 vUv;

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

}`;const Hn=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture:{value:new t.Texture}},vertexShader:Kn,fragmentShader:Xn}),[]),v=E(a,o);l.useEffect(()=>{i(n,"uResolution",v.clone())},[v,n]);const f=A(e,r,n,t.Mesh);return{material:n,mesh:f}},de={texture:new t.Texture},Yn=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Hn({scene:r,size:e,dpr:a}),f=I(e),[m,s]=D({scene:r,camera:f,dpr:a,size:e,samples:o,isSizeUpdate:!0}),[u,c]=F(de);return[l.useCallback((p,g)=>{var d,w,M,b,T,C;const{gl:x}=p;return g&&c(g),i(n,"uTexture",u.texture),i(n,"uTextureResolution",[((M=(w=(d=u.texture)==null?void 0:d.source)==null?void 0:w.data)==null?void 0:M.width)||0,((C=(T=(b=u.texture)==null?void 0:b.source)==null?void 0:T.data)==null?void 0:C.height)||0]),s(x)},[s,n,u,c]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var Qn=`precision mediump float;

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
}`;const Jn=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:Q.blurSize}},vertexShader:Qn,fragmentShader:Zn}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},Q=Object.freeze({texture:new t.Texture,blurSize:3,blurPower:5}),et=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=Jn(r),f=I(e),m=l.useMemo(()=>({scene:r,camera:f,size:e,dpr:a,samples:o}),[r,f,e,a,o]),[s,u]=D(m),[c,h]=q(m),[p,g]=F(Q);return[l.useCallback((d,w)=>{var C,P,S,_,V,L;const{gl:M}=d;w&&g(w),i(n,"uTexture",p.texture),i(n,"uResolution",[((S=(P=(C=p.texture)==null?void 0:C.source)==null?void 0:P.data)==null?void 0:S.width)||0,((L=(V=(_=p.texture)==null?void 0:_.source)==null?void 0:V.data)==null?void 0:L.height)||0]),i(n,"uBlurSize",p.blurSize);let b=h(M);const T=p.blurPower;for(let O=0;O<T;O++)i(n,"uTexture",b),b=h(M);return u(M)},[u,h,n,g,p]),g,{scene:r,mesh:v,material:n,camera:f,renderTarget:s,output:s.texture}]};var nt=`varying vec2 vUv;

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
}`;const rt=e=>{const a=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=l.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:j.epicenter},uProgress:{value:j.progress},uStrength:{value:j.strength},uWidth:{value:j.width},uMode:{value:0}},vertexShader:nt,fragmentShader:tt}),[]),r=A(e,a,o,t.Mesh);return{material:o,mesh:r}},j=Object.freeze({epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),ot=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=rt(r),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o,isSizeUpdate:!0}),[u,c]=F(j);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"uEpicenter",u.epicenter),i(n,"uProgress",u.progress),i(n,"uWidth",u.width),i(n,"uStrength",u.strength),i(n,"uMode",u.mode==="center"?0:u.mode==="horizontal"?1:2),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]};var it=`varying vec2 vUv;

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
}`;const ut=({scene:e,size:a,dpr:o})=>{const r=l.useMemo(()=>new t.PlaneGeometry(2,2),[]),n=l.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_resolution:{value:new t.Vector2},u_keyColor:{value:new t.Color},u_similarity:{value:0},u_smoothness:{value:0},u_spill:{value:0},u_color:{value:new t.Vector4},u_contrast:{value:0},u_brightness:{value:0},u_gamma:{value:0}},vertexShader:it,fragmentShader:at}),[]),v=E(a,o);l.useEffect(()=>{i(n,"u_resolution",v.clone())},[v,n]);const f=A(e,r,n,t.Mesh);return{material:n,mesh:f}},ge=Object.freeze({texture:new t.Texture,keyColor:new t.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new t.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),st=({size:e,dpr:a,samples:o=0})=>{const r=l.useMemo(()=>new t.Scene,[]),{material:n,mesh:v}=ut({scene:r,size:e,dpr:a}),f=I(e),[m,s]=D({scene:r,camera:f,size:e,dpr:a,samples:o}),[u,c]=F(ge);return[l.useCallback((p,g)=>{const{gl:x}=p;return g&&c(g),i(n,"u_texture",u.texture),i(n,"u_keyColor",u.keyColor),i(n,"u_similarity",u.similarity),i(n,"u_smoothness",u.smoothness),i(n,"u_spill",u.spill),i(n,"u_color",u.color),i(n,"u_contrast",u.contrast),i(n,"u_brightness",u.brightness),i(n,"u_gamma",u.gamma),s(x)},[s,n,c,u]),c,{scene:r,mesh:v,material:n,camera:f,renderTarget:m,output:m.texture}]},lt=({scene:e,geometry:a,material:o})=>{const r=A(e,a,o,t.Points),n=A(e,l.useMemo(()=>a.clone(),[a]),l.useMemo(()=>o.clone(),[o]),t.Mesh);return n.visible=!1,{points:r,interactiveMesh:n}};var ct=`uniform vec2 uResolution;
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
}`,vt=`precision highp float;
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
}`;const xe=process.env.NODE_ENV==="development",ye=(e,a,o,r,n)=>{var c;const v=o==="position"?"positionTarget":"uvTarget",f=o==="position"?"#usf <morphPositions>":"#usf <morphUvs>",m=o==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",s=o==="position"?"positionsList":"uvsList",u=o==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){a.deleteAttribute(o),a.setAttribute(o,new t.BufferAttribute(e[0],n));let h="",p="";e.forEach((g,x)=>{a.setAttribute(`${v}${x}`,new t.BufferAttribute(g,n)),h+=`attribute vec${n} ${v}${x};
`,x===0?p+=`${v}${x}`:p+=`,${v}${x}`}),r=r.replace(`${f}`,h),r=r.replace(`${m}`,`vec${n} ${s}[${e.length}] = vec${n}[](${p});
				${u}
			`)}else r=r.replace(`${f}`,""),r=r.replace(`${m}`,""),(c=a==null?void 0:a.attributes[o])!=null&&c.array||xe&&console.error(`use-shader-fx:geometry.attributes.${o}.array is not found`);return r},Me=(e,a,o,r)=>{var v;let n=[];if(e&&e.length>0){(v=a==null?void 0:a.attributes[o])!=null&&v.array?n=[a.attributes[o].array,...e]:n=e;const f=Math.max(...n.map(m=>m.length));n.forEach((m,s)=>{if(m.length<f){const u=(f-m.length)/r,c=[],h=Array.from(m);for(let p=0;p<u;p++){const g=Math.floor(m.length/r*Math.random())*r;for(let x=0;x<r;x++)c.push(h[g+x])}n[s]=new Float32Array([...h,...c])}})}return n},mt=(e,a)=>{let o="";const r={};let n="";return e&&e.length>0?(n+="if (false) {}",e.forEach((f,m)=>{n+=` else if (vMapArrayIndex == ${m}.0) {
`,n+=`  mapArrayColor = texture2D(uMapArray${m}, uv);
`,n+="}",o+=`
      			uniform sampler2D uMapArray${m};
      		`,r[`uMapArray${m}`]={value:f}}),n+=` else {
`,n+=`  mapArrayColor = vec4(1.0);
`,n+="}",o+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(n+=`mapArrayColor = vec4(1.0);
`,o+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:a.replace("#usf <mapArraySwitcher>",n).replace("#usf <mapArrayUniforms>",o),mapArrayUniforms:r}},ft=({size:e,dpr:a,geometry:o,positions:r,uvs:n,mapArray:v})=>{const f=l.useMemo(()=>Me(r,o,"position",3),[r,o]),m=l.useMemo(()=>Me(n,o,"uv",2),[n,o]),s=l.useMemo(()=>{f.length!==m.length&&xe&&console.log("use-shader-fx:positions and uvs are not matched");const c=ye(m,o,"uv",ye(f,o,"position",ct,3),2).replace("#usf <getWobble>",he),h=mt(v,vt);return new t.ShaderMaterial({vertexShader:c,fragmentShader:h.rewritedFragmentShader,depthTest:!1,depthWrite:!1,transparent:!0,blending:t.AdditiveBlending,uniforms:{uResolution:{value:new t.Vector2(0,0)},uMorphProgress:{value:R.morphProgress},uBlurAlpha:{value:R.blurAlpha},uBlurRadius:{value:R.blurRadius},uPointSize:{value:R.pointSize},uPointAlpha:{value:R.pointAlpha},uPicture:{value:new t.Texture},uIsPicture:{value:!1},uAlphaPicture:{value:new t.Texture},uIsAlphaPicture:{value:!1},uColor0:{value:R.color0},uColor1:{value:R.color1},uColor2:{value:R.color2},uColor3:{value:R.color3},uMap:{value:new t.Texture},uIsMap:{value:!1},uAlphaMap:{value:new t.Texture},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:R.wobblePositionFrequency},uWobbleTimeFrequency:{value:R.wobbleTimeFrequency},uWobbleStrength:{value:R.wobbleStrength},uWarpPositionFrequency:{value:R.warpPositionFrequency},uWarpTimeFrequency:{value:R.warpTimeFrequency},uWarpStrength:{value:R.warpStrength},uDisplacement:{value:new t.Texture},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:R.displacementIntensity},uDisplacementColorIntensity:{value:R.displacementColorIntensity},uSizeRandomIntensity:{value:R.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:R.sizeRandomTimeFrequency},uSizeRandomMin:{value:R.sizeRandomMin},uSizeRandomMax:{value:R.sizeRandomMax},uDivergence:{value:R.divergence},uDivergencePoint:{value:R.divergencePoint},...h.mapArrayUniforms}})},[o,f,m,v]),u=E(e,a);return l.useEffect(()=>{i(s,"uResolution",u.clone())},[u,s]),{material:s,modifiedPositions:f,modifiedUvs:m}},be=({size:e,dpr:a,scene:o=!1,geometry:r,positions:n,uvs:v,mapArray:f})=>{const m=l.useMemo(()=>{const x=r||new t.SphereGeometry(1,32,32);return x.setIndex(null),x.deleteAttribute("normal"),x},[r]),{material:s,modifiedPositions:u,modifiedUvs:c}=ft({size:e,dpr:a,geometry:m,positions:n,uvs:v,mapArray:f}),{points:h,interactiveMesh:p}=lt({scene:o,geometry:m,material:s});return[l.useCallback((x,d)=>{x&&i(s,"uTime",(d==null?void 0:d.beat)||x.clock.getElapsedTime()),d!==void 0&&(i(s,"uMorphProgress",d.morphProgress),i(s,"uBlurAlpha",d.blurAlpha),i(s,"uBlurRadius",d.blurRadius),i(s,"uPointSize",d.pointSize),i(s,"uPointAlpha",d.pointAlpha),d.picture?(i(s,"uPicture",d.picture),i(s,"uIsPicture",!0)):d.picture===!1&&i(s,"uIsPicture",!1),d.alphaPicture?(i(s,"uAlphaPicture",d.alphaPicture),i(s,"uIsAlphaPicture",!0)):d.alphaPicture===!1&&i(s,"uIsAlphaPicture",!1),i(s,"uColor0",d.color0),i(s,"uColor1",d.color1),i(s,"uColor2",d.color2),i(s,"uColor3",d.color3),d.map?(i(s,"uMap",d.map),i(s,"uIsMap",!0)):d.map===!1&&i(s,"uIsMap",!1),d.alphaMap?(i(s,"uAlphaMap",d.alphaMap),i(s,"uIsAlphaMap",!0)):d.alphaMap===!1&&i(s,"uIsAlphaMap",!1),i(s,"uWobbleStrength",d.wobbleStrength),i(s,"uWobblePositionFrequency",d.wobblePositionFrequency),i(s,"uWobbleTimeFrequency",d.wobbleTimeFrequency),i(s,"uWarpStrength",d.warpStrength),i(s,"uWarpPositionFrequency",d.warpPositionFrequency),i(s,"uWarpTimeFrequency",d.warpTimeFrequency),d.displacement?(i(s,"uDisplacement",d.displacement),i(s,"uIsDisplacement",!0)):d.displacement===!1&&i(s,"uIsDisplacement",!1),i(s,"uDisplacementIntensity",d.displacementIntensity),i(s,"uDisplacementColorIntensity",d.displacementColorIntensity),i(s,"uSizeRandomIntensity",d.sizeRandomIntensity),i(s,"uSizeRandomTimeFrequency",d.sizeRandomTimeFrequency),i(s,"uSizeRandomMin",d.sizeRandomMin),i(s,"uSizeRandomMax",d.sizeRandomMax),i(s,"uDivergence",d.divergence),i(s,"uDivergencePoint",d.divergencePoint))},[s]),{points:h,interactiveMesh:p,positions:u,uvs:c}]},R=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new t.Vector3(0),beat:!1}),pt=({size:e,dpr:a,samples:o=0,camera:r,geometry:n,positions:v,uvs:f})=>{const m=l.useMemo(()=>new t.Scene,[]),[s,{points:u,interactiveMesh:c,positions:h,uvs:p}]=be({scene:m,size:e,dpr:a,geometry:n,positions:v,uvs:f}),[g,x]=D({scene:m,camera:r,size:e,dpr:a,samples:o,depthBuffer:!0}),d=l.useCallback((M,b)=>(s(M,b),x(M.gl)),[x,s]),w=l.useCallback(M=>{s(null,M)},[s]);return[d,w,{scene:m,points:u,interactiveMesh:c,renderTarget:g,output:g.texture,positions:h,uvs:p}]};function dt(e,a=1e-4){a=Math.max(a,Number.EPSILON);const o={},r=e.getIndex(),n=e.getAttribute("position"),v=r?r.count:n.count;let f=0;const m=Object.keys(e.attributes),s={},u={},c=[],h=["getX","getY","getZ","getW"];for(let d=0,w=m.length;d<w;d++){const M=m[d];s[M]=[];const b=e.morphAttributes[M];b&&(u[M]=new Array(b.length).fill(0).map(()=>[]))}const p=Math.log10(1/a),g=Math.pow(10,p);for(let d=0;d<v;d++){const w=r?r.getX(d):d;let M="";for(let b=0,T=m.length;b<T;b++){const C=m[b],P=e.getAttribute(C),S=P.itemSize;for(let _=0;_<S;_++)M+=`${~~(P[h[_]](w)*g)},`}if(M in o)c.push(o[M]);else{for(let b=0,T=m.length;b<T;b++){const C=m[b],P=e.getAttribute(C),S=e.morphAttributes[C],_=P.itemSize,V=s[C],L=u[C];for(let O=0;O<_;O++){const k=h[O];if(V.push(P[k](w)),S)for(let B=0,Z=S.length;B<Z;B++)L[B].push(S[B][k](w))}}o[M]=f,c.push(f),f++}}const x=e.clone();for(let d=0,w=m.length;d<w;d++){const M=m[d],b=e.getAttribute(M),T=new b.array.constructor(s[M]),C=new $.BufferAttribute(T,b.itemSize,b.normalized);if(x.setAttribute(M,C),M in u)for(let P=0;P<u[M].length;P++){const S=e.morphAttributes[M][P],_=new S.array.constructor(u[M][P]),V=new $.BufferAttribute(_,S.itemSize,S.normalized);x.morphAttributes[M][P]=V}}return x.setIndex(c),x}var gt=`vec3 random3(vec3 c) {
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
}`,ht=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,xt=`#ifdef USE_TRANSMISSION

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

#endif`;const we=e=>{let a=e;return a=a.replace("#include <beginnormal_vertex>",`
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`),a=a.replace("#include <begin_vertex>",`
		vec3 transformed = usf_Position;`),a=a.replace("void main() {",`
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
		void main() {`),a=a.replace("// #usf <getWobble>",`${he}`),a=a.replace("void main() {",`
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
		vWobble = wobble / uWobbleStrength;`),a},yt=({baseMaterial:e,materialParameters:a})=>{const{material:o,depthMaterial:r}=l.useMemo(()=>{const n=new(e||t.MeshPhysicalMaterial)(a||{}),v=n.type==="MeshPhysicalMaterial"||n.type==="MeshStandardMaterial",f=n.type==="MeshPhysicalMaterial";Object.assign(n.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:z.wobblePositionFrequency},uWobbleTimeFrequency:{value:z.wobbleTimeFrequency},uWobbleStrength:{value:z.wobbleStrength},uWarpPositionFrequency:{value:z.warpPositionFrequency},uWarpTimeFrequency:{value:z.warpTimeFrequency},uWarpStrength:{value:z.warpStrength},uWobbleShine:{value:z.wobbleShine},uColor0:{value:z.color0},uColor1:{value:z.color1},uColor2:{value:z.color2},uColor3:{value:z.color3},uColorMix:{value:z.colorMix},uChromaticAberration:{value:z.chromaticAberration},uAnisotropicBlur:{value:z.anisotropicBlur},uDistortion:{value:z.distortion},uDistortionScale:{value:z.distortionScale},uTemporalDistortion:{value:z.temporalDistortion},uSamples:{value:z.samples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),n.onBeforeCompile=s=>{Object.assign(s.uniforms,n.userData.uniforms),s.vertexShader=we(s.vertexShader),s.fragmentShader=s.fragmentShader.replace("#include <color_fragment>",`
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`),v&&(s.fragmentShader=s.fragmentShader.replace("#include <roughnessmap_fragment>",`
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`)),s.fragmentShader=s.fragmentShader.replace("void main() {",`
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
				${gt}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${v?"float usf_Roughness = roughness;":""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${v?"usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);":""}`),f&&(s.fragmentShader=s.fragmentShader.replace("#include <transmission_pars_fragment>",`${ht}`),s.fragmentShader=s.fragmentShader.replace("#include <transmission_fragment>",`${xt}`))},n.needsUpdate=!0;const m=new t.MeshDepthMaterial({depthPacking:t.RGBADepthPacking});return m.onBeforeCompile=s=>{Object.assign(s.uniforms,n.userData.uniforms),s.vertexShader=we(s.vertexShader)},m.needsUpdate=!0,{material:n,depthMaterial:m}},[a,e]);return{material:o,depthMaterial:r}},Se=({scene:e=!1,geometry:a,baseMaterial:o,materialParameters:r})=>{const n=l.useMemo(()=>{let u=a||new t.IcosahedronGeometry(2,50);return u=dt(u),u.computeTangents(),u},[a]),{material:v,depthMaterial:f}=yt({baseMaterial:o,materialParameters:r}),m=A(e,n,v,t.Mesh);return[l.useCallback((u,c)=>{const h=v.userData;u&&i(h,"uTime",(c==null?void 0:c.beat)||u.clock.getElapsedTime()),c!==void 0&&(i(h,"uWobbleStrength",c.wobbleStrength),i(h,"uWobblePositionFrequency",c.wobblePositionFrequency),i(h,"uWobbleTimeFrequency",c.wobbleTimeFrequency),i(h,"uWarpStrength",c.warpStrength),i(h,"uWarpPositionFrequency",c.warpPositionFrequency),i(h,"uWarpTimeFrequency",c.warpTimeFrequency),i(h,"uWobbleShine",c.wobbleShine),i(h,"uSamples",c.samples),i(h,"uColor0",c.color0),i(h,"uColor1",c.color1),i(h,"uColor2",c.color2),i(h,"uColor3",c.color3),i(h,"uColorMix",c.colorMix),i(h,"uChromaticAberration",c.chromaticAberration),i(h,"uAnisotropicBlur",c.anisotropicBlur),i(h,"uDistortion",c.distortion),i(h,"uDistortionScale",c.distortionScale),i(h,"uTemporalDistortion",c.temporalDistortion))},[v]),{mesh:m,depthMaterial:f}]},z=Object.freeze({beat:!1,wobbleStrength:.3,wobblePositionFrequency:.5,wobbleTimeFrequency:.4,wobbleShine:0,warpStrength:1.7,warpPositionFrequency:.38,warpTimeFrequency:.12,samples:6,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),colorMix:1,chromaticAberration:.5,anisotropicBlur:.1,distortion:.1,distortionScale:.1,temporalDistortion:.1}),Mt=({size:e,dpr:a,samples:o=0,camera:r,geometry:n,baseMaterial:v,materialParameters:f})=>{const m=l.useMemo(()=>new t.Scene,[]),[s,{mesh:u,depthMaterial:c}]=Se({baseMaterial:v,materialParameters:f,scene:m,geometry:n}),[h,p]=D({scene:m,camera:r,size:e,dpr:a,samples:o,depthBuffer:!0}),g=l.useCallback((d,w)=>(s(d,w),p(d.gl)),[p,s]),x=l.useCallback(d=>{s(null,d)},[s]);return[g,x,{scene:m,mesh:u,depthMaterial:c,renderTarget:h,output:h.texture}]},bt=(e,a,o)=>{const r=l.useMemo(()=>new t.Mesh(a,o),[a,o]);return l.useEffect(()=>{e.add(r)},[e,r]),l.useEffect(()=>()=>{e.remove(r),a.dispose(),o.dispose()},[e,a,o,r]),r},K=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const o=2.5949095;return e<.5?Math.pow(2*e,2)*((o+1)*2*e-o)/2:(Math.pow(2*e-2,2)*((o+1)*(e*2-2)+o)+2)/2},easeInElastic(e){const a=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*a)},easeOutElastic(e){const a=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*a)+1},easeInOutElastic(e){const a=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*a))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*a)/2+1},easeInBounce(e){return 1-K.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-K.easeOutBounce(1-2*e))/2:(1+K.easeOutBounce(2*e-1))/2}});function wt(e){let a=Math.sin(e*12.9898)*43758.5453;return a-Math.floor(a)}const St=(e,a="easeOutQuart")=>{const o=e/60,r=K[a];return l.useCallback(v=>{let f=v.getElapsedTime()*o;const m=Math.floor(f),s=r(f-m);f=s+m;const u=wt(m);return{beat:f,floor:m,fract:s,hash:u}},[o,r])},_t=(e=60)=>{const a=l.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),o=l.useRef(null);return l.useCallback(n=>{const v=n.getElapsedTime();return o.current===null||v-o.current>=a?(o.current=v,!0):!1},[a])},Ct=e=>{var r,n;const a=(r=e.dom)==null?void 0:r.length,o=(n=e.texture)==null?void 0:n.length;return!a||!o||a!==o};var Tt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Pt=`precision highp float;

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
}`;const Rt=({params:e,size:a,scene:o})=>{o.children.length>0&&(o.children.forEach(r=>{r instanceof t.Mesh&&(r.geometry.dispose(),r.material.dispose())}),o.remove(...o.children)),e.texture.forEach((r,n)=>{const v=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:Tt,fragmentShader:Pt,transparent:!0,uniforms:{u_texture:{value:r},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[n]?e.boderRadius[n]:0}}}));o.add(v)})},Dt=()=>{const e=l.useRef([]),a=l.useRef([]);return l.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:n,params:v})=>{e.current.length>0&&e.current.forEach((m,s)=>{m.unobserve(a.current[s])}),a.current=[],e.current=[];const f=new Array(v.dom.length).fill(!1);r.current=[...f],n.current=[...f],v.dom.forEach((m,s)=>{const u=h=>{h.forEach(p=>{v.onIntersect[s]&&v.onIntersect[s](p),r.current[s]=p.isIntersecting})},c=new IntersectionObserver(u,{rootMargin:"0px",threshold:0});c.observe(m),e.current.push(c),a.current.push(m)})},[])},At=()=>{const e=l.useRef([]),a=l.useCallback(({params:o,size:r,resolutionRef:n,scene:v,isIntersectingRef:f})=>{v.children.length!==e.current.length&&(e.current=new Array(v.children.length)),v.children.forEach((m,s)=>{var h,p,g,x,d,w;const u=o.dom[s];if(!u)return;const c=u.getBoundingClientRect();if(e.current[s]=c,m.scale.set(c.width,c.height,1),m.position.set(c.left+c.width*.5-r.width*.5,-c.top-c.height*.5+r.height*.5,0),f.current[s]&&(o.rotation[s]&&m.rotation.copy(o.rotation[s]),m instanceof t.Mesh)){const M=m.material;i(M,"u_texture",o.texture[s]),i(M,"u_textureResolution",[((g=(p=(h=o.texture[s])==null?void 0:h.source)==null?void 0:p.data)==null?void 0:g.width)||0,((w=(d=(x=o.texture[s])==null?void 0:x.source)==null?void 0:d.data)==null?void 0:w.height)||0]),i(M,"u_resolution",n.current.set(c.width,c.height)),i(M,"u_borderRadius",o.boderRadius[s]?o.boderRadius[s]:0)}})},[]);return[e.current,a]},It=()=>{const e=l.useRef([]),a=l.useRef([]),o=l.useCallback((r,n=!1)=>{e.current.forEach((f,m)=>{f&&(a.current[m]=!0)});const v=n?[...a.current]:[...e.current];return r<0?v:v[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:a,isIntersecting:o}},Ft=e=>({onView:o,onHidden:r})=>{const n=l.useRef(!1);l.useEffect(()=>{let v;const f=()=>{e.current.some(m=>m)?n.current||(o&&o(),n.current=!0):n.current&&(r&&r(),n.current=!1),v=requestAnimationFrame(f)};return v=requestAnimationFrame(f),()=>{cancelAnimationFrame(v)}},[o,r])},_e={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},zt=({size:e,dpr:a,samples:o=0},r=[])=>{const n=l.useMemo(()=>new t.Scene,[]),v=I(e),[f,m]=D({scene:n,camera:v,size:e,dpr:a,samples:o,isSizeUpdate:!0}),[s,u]=F({..._e,updateKey:performance.now()}),[c,h]=At(),p=l.useRef(new t.Vector2(0,0)),[g,x]=l.useState(!0);l.useEffect(()=>{x(!0)},r);const d=l.useRef(null),w=l.useMemo(()=>new t.Texture,[]),M=Dt(),{isIntersectingOnceRef:b,isIntersectingRef:T,isIntersecting:C}=It(),P=Ft(T);return[l.useCallback((_,V)=>{const{gl:L,size:O}=_;if(V&&u(V),Ct(s))return w;if(g){if(d.current===s.updateKey)return w;d.current=s.updateKey}return g&&(Rt({params:s,size:O,scene:n}),M({isIntersectingRef:T,isIntersectingOnceRef:b,params:s}),x(!1)),h({params:s,size:O,resolutionRef:p,scene:n,isIntersectingRef:T}),m(L)},[m,u,M,h,g,n,s,b,T,w]),u,{scene:n,camera:v,renderTarget:f,output:f.texture,isIntersecting:C,DOMRects:c,intersections:T.current,useDomView:P}]},Ut=({scene:e,camera:a,size:o,dpr:r=!1,isSizeUpdate:n=!1,samples:v=0,depthBuffer:f=!1,depthTexture:m=!1},s)=>{const u=l.useRef([]),c=E(o,r);u.current=l.useMemo(()=>Array.from({length:s},()=>{const p=new t.WebGLRenderTarget(c.x,c.y,{...G,samples:v,depthBuffer:f});return m&&(p.depthTexture=new t.DepthTexture(c.x,c.y,t.FloatType)),p}),[s]),l.useLayoutEffect(()=>{n&&u.current.forEach(p=>p.setSize(c.x,c.y))},[c,n]),l.useEffect(()=>{const p=u.current;return()=>{p.forEach(g=>g.dispose())}},[s]);const h=l.useCallback((p,g,x)=>{const d=u.current[g];return H({gl:p,scene:e,camera:a,fbo:d,onBeforeRender:()=>x&&x({read:d.texture})}),d.texture},[e,a]);return[u.current,h]};y.ALPHABLENDING_PARAMS=fe,y.BLENDING_PARAMS=le,y.BRIGHTNESSPICKER_PARAMS=ve,y.BRUSH_PARAMS=ne,y.CHROMAKEY_PARAMS=ge,y.COLORSTRATA_PARAMS=ie,y.COSPALETTE_PARAMS=ue,y.COVERTEXTURE_PARAMS=de,y.DOMSYNCER_PARAMS=_e,y.DUOTONE_PARAMS=se,y.Easing=K,y.FBO_OPTION=G,y.FLUID_PARAMS=te,y.FXBLENDING_PARAMS=me,y.FXTEXTURE_PARAMS=ce,y.HSV_PARAMS=pe,y.MARBLE_PARAMS=ae,y.MORPHPARTICLES_PARAMS=R,y.NOISE_PARAMS=oe,y.RIPPLE_PARAMS=re,y.SIMPLEBLUR_PARAMS=Q,y.WAVE_PARAMS=j,y.WOBBLE3D_PARAMS=z,y.renderFBO=H,y.setUniform=i,y.useAddMesh=bt,y.useAlphaBlending=kn,y.useBeat=St,y.useBlending=Tn,y.useBrightnessPicker=Un,y.useBrush=ze,y.useCamera=I,y.useChromaKey=st,y.useColorStrata=cn,y.useCopyTexture=Ut,y.useCosPalette=xn,y.useCoverTexture=Yn,y.useCreateMorphParticles=be,y.useCreateWobble3D=Se,y.useDomSyncer=zt,y.useDoubleFBO=q,y.useDuoTone=wn,y.useFPSLimiter=_t,y.useFluid=Je,y.useFxBlending=En,y.useFxTexture=An,y.useHSV=Gn,y.useMarble=pn,y.useMorphParticles=pt,y.useNoise=an,y.useParams=F,y.usePointer=X,y.useResolution=E,y.useRipple=nn,y.useSimpleBlur=et,y.useSingleFBO=D,y.useWave=ot,y.useWobble3D=Mt,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
