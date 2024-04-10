(function(M,j){typeof exports=="object"&&typeof module<"u"?j(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],j):(M=typeof globalThis<"u"?globalThis:M||self,j(M["use-shader-fx"]={},M.THREE,M.React))})(this,function(M,j,c){"use strict";function De(e){const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const o in e)if(o!=="default"){const s=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(a,o,s.get?s:{enumerable:!0,get:()=>e[o]})}}return a.default=e,Object.freeze(a)}const t=De(j);var Ae=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ie=`precision highp float;

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
}`;const $=(e,a=!1)=>{const o=a?e.width*a:e.width,s=a?e.height*a:e.height;return c.useMemo(()=>new t.Vector2(o,s),[o,s])},i=(e,a,o)=>{o!==void 0&&e.uniforms&&e.uniforms[a]&&o!==null&&(e.uniforms[a].value=o)},F=(e,a,o,s)=>{const u=c.useMemo(()=>{const n=new s(a,o);return e&&e.add(n),n},[a,o,s,e]);return c.useEffect(()=>()=>{e&&e.remove(u),a.dispose(),o.dispose()},[e,a,o,u]),u},Fe=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uBuffer:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uTexture:{value:new t.Texture},uIsTexture:{value:!1},uMap:{value:new t.Texture},uIsMap:{value:!1},uMapIntensity:{value:0},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new t.Vector2(-10,-10)},uPrevMouse:{value:new t.Vector2(-10,-10)},uVelocity:{value:new t.Vector2(0,0)},uColor:{value:new t.Vector3(1,0,0)},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:Ae,fragmentShader:Ie}),[]),n=$(a,o);i(u,"uResolution",n.clone());const p=F(e,s,u,t.Mesh);return{material:u,mesh:p}},ze=(e,a)=>{const o=a,s=e/a,[u,n]=[o*s/2,o/2];return{width:u,height:n,near:-1e3,far:1e3}},z=(e,a="OrthographicCamera")=>{const o=$(e),{width:s,height:u,near:n,far:p}=ze(o.x,o.y);return c.useMemo(()=>a==="OrthographicCamera"?new t.OrthographicCamera(-s,s,u,-u,n,p):new t.PerspectiveCamera(50,s/u),[s,u,n,p,a])},Y=(e=0)=>{const a=c.useRef(new t.Vector2(0,0)),o=c.useRef(new t.Vector2(0,0)),s=c.useRef(new t.Vector2(0,0)),u=c.useRef(0),n=c.useRef(new t.Vector2(0,0)),p=c.useRef(!1);return c.useCallback(v=>{const l=performance.now();let r;p.current&&e?(s.current=s.current.lerp(v,1-e),r=s.current.clone()):(r=v.clone(),s.current=r),u.current===0&&(u.current=l,a.current=r);const f=Math.max(1,l-u.current);u.current=l,n.current.copy(r).sub(a.current).divideScalar(f);const y=n.current.length()>0,x=p.current?a.current.clone():r;return!p.current&&y&&(p.current=!0),a.current=r,{currentPointer:r,prevPointer:x,diffPointer:o.current.subVectors(r,x),velocity:n.current,isVelocityUpdate:y}},[e])},U=e=>{const a=u=>Object.values(u).some(n=>typeof n=="function"),o=c.useRef(a(e)?e:structuredClone(e)),s=c.useCallback(u=>{for(const n in u){const p=n;p in o.current&&u[p]!==void 0&&u[p]!==null?o.current[p]=u[p]:console.error(`"${String(p)}" does not exist in the params. or "${String(p)}" is null | undefined`)}},[]);return[o.current,s]},X={minFilter:t.LinearFilter,magFilter:t.LinearFilter,type:t.HalfFloatType,stencilBuffer:!1},Q=({gl:e,fbo:a,scene:o,camera:s,onBeforeRender:u,onSwap:n})=>{e.setRenderTarget(a),u(),e.clear(),e.render(o,s),n&&n(),e.setRenderTarget(null),e.clear()},A=({scene:e,camera:a,size:o,dpr:s=!1,isSizeUpdate:u=!1,samples:n=0,depthBuffer:p=!1,depthTexture:m=!1})=>{var f;const v=c.useRef(),l=$(o,s);v.current=c.useMemo(()=>{const y=new t.WebGLRenderTarget(l.x,l.y,{...X,samples:n,depthBuffer:p});return m&&(y.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType)),y},[]),u&&((f=v.current)==null||f.setSize(l.x,l.y)),c.useEffect(()=>{const y=v.current;return()=>{y==null||y.dispose()}},[]);const r=c.useCallback((y,x)=>{const d=v.current;return Q({gl:y,fbo:d,scene:e,camera:a,onBeforeRender:()=>x&&x({read:d.texture})}),d.texture},[e,a]);return[v.current,r]},N=({scene:e,camera:a,size:o,dpr:s=!1,isSizeUpdate:u=!1,samples:n=0,depthBuffer:p=!1,depthTexture:m=!1})=>{var y,x;const v=c.useRef({read:null,write:null,swap:function(){let d=this.read;this.read=this.write,this.write=d}}),l=$(o,s),r=c.useMemo(()=>{const d=new t.WebGLRenderTarget(l.x,l.y,{...X,samples:n,depthBuffer:p}),h=new t.WebGLRenderTarget(l.x,l.y,{...X,samples:n,depthBuffer:p});return m&&(d.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType),h.depthTexture=new t.DepthTexture(l.x,l.y,t.FloatType)),{read:d,write:h}},[]);v.current.read=r.read,v.current.write=r.write,u&&((y=v.current.read)==null||y.setSize(l.x,l.y),(x=v.current.write)==null||x.setSize(l.x,l.y)),c.useEffect(()=>{const d=v.current;return()=>{var h,g;(h=d.read)==null||h.dispose(),(g=d.write)==null||g.dispose()}},[]);const f=c.useCallback((d,h)=>{var b;const g=v.current;return Q({gl:d,scene:e,camera:a,fbo:g.write,onBeforeRender:()=>h&&h({read:g.read.texture,write:g.write.texture}),onSwap:()=>g.swap()}),(b=g.read)==null?void 0:b.texture},[e,a]);return[{read:v.current.read,write:v.current.write},f]},I=e=>{var a,o;return typeof e=="number"?{shader:e,fbo:e}:{shader:(((a=e.effect)==null?void 0:a.shader)??!0)&&e.dpr,fbo:(((o=e.effect)==null?void 0:o.fbo)??!0)&&e.dpr}},te=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new t.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),Ue=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=Fe({scene:u,size:e,dpr:s.shader}),m=z(e),v=Y(),[l,r]=N({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[f,y]=U(te),x=c.useRef(null);return[c.useCallback((h,g)=>{const{gl:b,pointer:w}=h;g&&y(g),f.texture?(i(n,"uIsTexture",!0),i(n,"uTexture",f.texture)):i(n,"uIsTexture",!1),f.map?(i(n,"uIsMap",!0),i(n,"uMap",f.map),i(n,"uMapIntensity",f.mapIntensity)):i(n,"uIsMap",!1),i(n,"uRadius",f.radius),i(n,"uSmudge",f.smudge),i(n,"uDissipation",f.dissipation),i(n,"uMotionBlur",f.motionBlur),i(n,"uMotionSample",f.motionSample);const T=f.pointerValues||v(w);T.isVelocityUpdate&&(i(n,"uMouse",T.currentPointer),i(n,"uPrevMouse",T.prevPointer)),i(n,"uVelocity",T.velocity);const C=typeof f.color=="function"?f.color(T.velocity):f.color;return i(n,"uColor",C),i(n,"uIsCursor",f.isCursor),i(n,"uPressureEnd",f.pressure),x.current===null&&(x.current=f.pressure),i(n,"uPressureStart",x.current),x.current=f.pressure,r(b,({read:S})=>{i(n,"uBuffer",S)})},[n,v,r,f,y]),y,{scene:u,mesh:p,material:n,camera:m,renderTarget:l,output:l.read.texture}]};var k=`varying vec2 vUv;
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
}`;const Be=()=>c.useMemo(()=>new t.ShaderMaterial({vertexShader:k,fragmentShader:Ve,depthTest:!1,depthWrite:!1}),[]);var Oe=`precision highp float;

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
}`;const Ee=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:new t.Texture},uSource:{value:new t.Texture},texelSize:{value:new t.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:k,fragmentShader:Oe}),[]);var Le=`precision highp float;

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
}`;const We=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:Le}),[]);var $e=`precision highp float;

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
}`;const ke=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:$e}),[]);var qe=`precision highp float;

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
}`;const je=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:qe}),[]);var Ne=`precision highp float;

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
}`;const Ge=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:Ne}),[]);var Ke=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Xe=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},value:{value:0},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:Ke}),[]);var He=`precision highp float;

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
}`;const Ye=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uPressure:{value:new t.Texture},uVelocity:{value:new t.Texture},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:He}),[]);var Qe=`precision highp float;

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
}`;const Ze=()=>c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTarget:{value:new t.Texture},aspectRatio:{value:0},color:{value:new t.Vector3},point:{value:new t.Vector2},radius:{value:0},texelSize:{value:new t.Vector2}},vertexShader:k,fragmentShader:Qe}),[]),Je=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=Be(),n=u.clone(),p=je(),m=Ge(),v=Ee(),l=We(),r=ke(),f=Xe(),y=Ye(),x=Ze(),d=c.useMemo(()=>({vorticityMaterial:m,curlMaterial:p,advectionMaterial:v,divergenceMaterial:l,pressureMaterial:r,clearMaterial:f,gradientSubtractMaterial:y,splatMaterial:x}),[m,p,v,l,r,f,y,x]),h=$(a,o);c.useMemo(()=>{i(d.splatMaterial,"aspectRatio",h.x/h.y);for(const w of Object.values(d))i(w,"texelSize",new t.Vector2(1/h.x,1/h.y))},[h,d]);const g=F(e,s,u,t.Mesh);c.useMemo(()=>{u.dispose(),g.material=n},[u,g,n]),c.useEffect(()=>()=>{for(const w of Object.values(d))w.dispose()},[d]);const b=c.useCallback(w=>{g.material=w,g.material.needsUpdate=!0},[g]);return{materials:d,setMeshMaterial:b,mesh:g}},re=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new t.Vector3(1,1,1),pointerValues:!1}),en=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{materials:n,setMeshMaterial:p,mesh:m}=Je({scene:u,size:e,dpr:s.shader}),v=z(e),l=Y(),r=c.useMemo(()=>({scene:u,camera:v,dpr:s.fbo,size:e,samples:o}),[u,v,e,o,s.fbo]),[f,y]=N(r),[x,d]=N(r),[h,g]=A(r),[b,w]=A(r),[T,C]=N(r),S=c.useRef(0),D=c.useRef(new t.Vector2(0,0)),_=c.useRef(new t.Vector3(0,0,0)),[P,O]=U(re);return[c.useCallback((E,q)=>{const{gl:W,pointer:Bt,clock:ee,size:Te}=E;q&&O(q),S.current===0&&(S.current=ee.getElapsedTime());const Pe=Math.min((ee.getElapsedTime()-S.current)/3,.02);S.current=ee.getElapsedTime();const ne=y(W,({read:B})=>{p(n.advectionMaterial),i(n.advectionMaterial,"uVelocity",B),i(n.advectionMaterial,"uSource",B),i(n.advectionMaterial,"dt",Pe),i(n.advectionMaterial,"dissipation",P.velocity_dissipation)}),Ot=d(W,({read:B})=>{p(n.advectionMaterial),i(n.advectionMaterial,"uVelocity",ne),i(n.advectionMaterial,"uSource",B),i(n.advectionMaterial,"dissipation",P.density_dissipation)}),Z=P.pointerValues||l(Bt);Z.isVelocityUpdate&&(y(W,({read:B})=>{p(n.splatMaterial),i(n.splatMaterial,"uTarget",B),i(n.splatMaterial,"point",Z.currentPointer);const K=Z.diffPointer.multiply(D.current.set(Te.width,Te.height).multiplyScalar(P.velocity_acceleration));i(n.splatMaterial,"color",_.current.set(K.x,K.y,1)),i(n.splatMaterial,"radius",P.splat_radius)}),d(W,({read:B})=>{p(n.splatMaterial),i(n.splatMaterial,"uTarget",B);const K=typeof P.fluid_color=="function"?P.fluid_color(Z.velocity):P.fluid_color;i(n.splatMaterial,"color",K)}));const Et=g(W,()=>{p(n.curlMaterial),i(n.curlMaterial,"uVelocity",ne)});y(W,({read:B})=>{p(n.vorticityMaterial),i(n.vorticityMaterial,"uVelocity",B),i(n.vorticityMaterial,"uCurl",Et),i(n.vorticityMaterial,"curl",P.curl_strength),i(n.vorticityMaterial,"dt",Pe)});const Lt=w(W,()=>{p(n.divergenceMaterial),i(n.divergenceMaterial,"uVelocity",ne)});C(W,({read:B})=>{p(n.clearMaterial),i(n.clearMaterial,"uTexture",B),i(n.clearMaterial,"value",P.pressure_dissipation)}),p(n.pressureMaterial),i(n.pressureMaterial,"uDivergence",Lt);let Re;for(let B=0;B<P.pressure_iterations;B++)Re=C(W,({read:K})=>{i(n.pressureMaterial,"uPressure",K)});return y(W,({read:B})=>{p(n.gradientSubtractMaterial),i(n.gradientSubtractMaterial,"uPressure",Re),i(n.gradientSubtractMaterial,"uVelocity",B)}),Ot},[n,p,g,d,w,l,C,y,O,P]),O,{scene:u,mesh:m,materials:n,camera:v,renderTarget:{velocity:f,density:x,curl:h,divergence:b,pressure:T},output:x.read.texture}]},nn=({scale:e,max:a,texture:o,scene:s})=>{const u=c.useRef([]),n=c.useMemo(()=>new t.PlaneGeometry(e,e),[e]),p=c.useMemo(()=>new t.MeshBasicMaterial({map:o,transparent:!0,blending:t.AdditiveBlending,depthTest:!1,depthWrite:!1}),[o]);return c.useEffect(()=>{for(let m=0;m<a;m++){const v=new t.Mesh(n.clone(),p.clone());v.rotateZ(2*Math.PI*Math.random()),v.visible=!1,s.add(v),u.current.push(v)}},[n,p,s,a]),c.useEffect(()=>()=>{u.current.forEach(m=>{m.geometry.dispose(),Array.isArray(m.material)?m.material.forEach(v=>v.dispose()):m.material.dispose(),s.remove(m)}),u.current=[]},[s]),u.current},oe=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),tn=({texture:e=new t.Texture,scale:a=64,max:o=100,size:s,dpr:u,samples:n=0})=>{const p=I(u),m=c.useMemo(()=>new t.Scene,[]),v=nn({scale:a,max:o,texture:e,scene:m}),l=z(s),r=Y(),[f,y]=A({scene:m,camera:l,size:s,dpr:p.fbo,samples:n}),[x,d]=U(oe),h=c.useRef(0);return[c.useCallback((b,w)=>{const{gl:T,pointer:C,size:S}=b;w&&d(w);const D=x.pointerValues||r(C);if(x.frequency<D.diffPointer.length()){const _=v[h.current];_.visible=!0,_.position.set(D.currentPointer.x*(S.width/2),D.currentPointer.y*(S.height/2),0),_.scale.x=_.scale.y=0,_.material.opacity=x.alpha,h.current=(h.current+1)%o}return v.forEach(_=>{if(_.visible){const P=_.material;_.rotation.z+=x.rotation,P.opacity*=x.fadeout_speed,_.scale.x=x.fadeout_speed*_.scale.x+x.scale,_.scale.y=_.scale.x,P.opacity<.002&&(_.visible=!1)}}),y(T)},[y,v,r,o,x,d]),d,{scene:m,camera:l,meshArr:v,renderTarget:f,output:f.texture}]};var rn=`varying vec2 vUv;

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
}`;const an=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new t.Vector2},warpStrength:{value:0}},vertexShader:rn,fragmentShader:on}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},ie=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new t.Vector2(2,2),warpStrength:8,beat:!1}),un=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=an(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(ie);return[c.useCallback((x,d)=>{const{gl:h,clock:g}=x;return d&&f(d),i(n,"scale",r.scale),i(n,"timeStrength",r.timeStrength),i(n,"noiseOctaves",r.noiseOctaves),i(n,"fbmOctaves",r.fbmOctaves),i(n,"warpOctaves",r.warpOctaves),i(n,"warpDirection",r.warpDirection),i(n,"warpStrength",r.warpStrength),i(n,"uTime",r.beat||g.getElapsedTime()),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var sn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ln=`precision highp float;
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
}`;const cn=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new t.Texture},noiseStrength:{value:new t.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new t.Vector2(.1,.1)},laminateDetail:{value:new t.Vector2(1,1)},distortion:{value:new t.Vector2(0,0)},colorFactor:{value:new t.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new t.Vector2(0,0)}},vertexShader:sn,fragmentShader:ln}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},ae=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new t.Vector2(.1,.1),laminateDetail:new t.Vector2(1,1),distortion:new t.Vector2(0,0),colorFactor:new t.Vector3(1,1,1),timeStrength:new t.Vector2(0,0),noise:!1,noiseStrength:new t.Vector2(0,0),beat:!1}),vn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=cn(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(ae);return[c.useCallback((x,d)=>{const{gl:h,clock:g}=x;return d&&f(d),r.texture?(i(n,"uTexture",r.texture),i(n,"isTexture",!0)):(i(n,"isTexture",!1),i(n,"scale",r.scale)),r.noise?(i(n,"noise",r.noise),i(n,"isNoise",!0),i(n,"noiseStrength",r.noiseStrength)):i(n,"isNoise",!1),i(n,"uTime",r.beat||g.getElapsedTime()),i(n,"laminateLayer",r.laminateLayer),i(n,"laminateInterval",r.laminateInterval),i(n,"laminateDetail",r.laminateDetail),i(n,"distortion",r.distortion),i(n,"colorFactor",r.colorFactor),i(n,"timeStrength",r.timeStrength),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var mn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,fn=`precision highp float;

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
}`;const pn=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:0},u_complexity:{value:0},u_complexityAttenuation:{value:0},u_iterations:{value:0},u_timeStrength:{value:0},u_scale:{value:0}},vertexShader:mn,fragmentShader:fn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},ue=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),dn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=pn(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(ue);return[c.useCallback((x,d)=>{const{gl:h,clock:g}=x;return d&&f(d),i(n,"u_pattern",r.pattern),i(n,"u_complexity",r.complexity),i(n,"u_complexityAttenuation",r.complexityAttenuation),i(n,"u_iterations",r.iterations),i(n,"u_timeStrength",r.timeStrength),i(n,"u_scale",r.scale),i(n,"u_time",r.beat||g.getElapsedTime()),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var gn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,hn=`precision highp float;
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
}`;const xn=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uRgbWeight:{value:new t.Vector3(.299,.587,.114)},uColor1:{value:new t.Color().set(.5,.5,.5)},uColor2:{value:new t.Color().set(.5,.5,.5)},uColor3:{value:new t.Color().set(1,1,1)},uColor4:{value:new t.Color().set(0,.1,.2)}},vertexShader:gn,fragmentShader:hn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},se=Object.freeze({texture:new t.Texture,color1:new t.Color().set(.5,.5,.5),color2:new t.Color().set(.5,.5,.5),color3:new t.Color().set(1,1,1),color4:new t.Color().set(0,.1,.2),rgbWeight:new t.Vector3(.299,.587,.114)}),yn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=xn(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(se);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"uTexture",r.texture),i(n,"uColor1",r.color1),i(n,"uColor2",r.color2),i(n,"uColor3",r.color3),i(n,"uColor4",r.color4),i(n,"uRgbWeight",r.rgbWeight),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Mn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,bn=`precision highp float;

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
}`;const wn=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uColor0:{value:new t.Color(16777215)},uColor1:{value:new t.Color(0)}},vertexShader:Mn,fragmentShader:bn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},le={texture:new t.Texture,color0:new t.Color(16777215),color1:new t.Color(0)},Sn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=wn(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(le);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"uTexture",r.texture),i(n,"uColor0",r.color0),i(n,"uColor1",r.color1),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var _n=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Cn=`precision highp float;

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
}`;const Tn=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_alphaMap:{value:new t.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new t.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:_n,fragmentShader:Cn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},ce={texture:new t.Texture,map:new t.Texture,alphaMap:!1,mapIntensity:.3,brightness:new t.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Pn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=Tn(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(ce);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"u_texture",r.texture),i(n,"u_map",r.map),i(n,"u_mapIntensity",r.mapIntensity),r.alphaMap?(i(n,"u_alphaMap",r.alphaMap),i(n,"u_isAlphaMap",!0)):i(n,"u_isAlphaMap",!1),i(n,"u_brightness",r.brightness),i(n,"u_min",r.min),i(n,"u_max",r.max),r.dodgeColor?(i(n,"u_dodgeColor",r.dodgeColor),i(n,"u_isDodgeColor",!0)):i(n,"u_isDodgeColor",!1),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Rn=`varying vec2 vUv;

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

}`;const An=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture0:{value:new t.Texture},uTexture1:{value:new t.Texture},padding:{value:0},uMap:{value:new t.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new t.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Rn,fragmentShader:Dn}),[]),n=$(a,o);i(u,"uResolution",n.clone());const p=F(e,s,u,t.Mesh);return{material:u,mesh:p}},ve={texture0:new t.Texture,texture1:new t.Texture,padding:0,map:new t.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new t.Vector2(0,0),progress:0,dir:new t.Vector2(0,0)},In=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=An({scene:u,size:e,dpr:s.shader}),m=z(e),[v,l]=A({scene:u,camera:m,dpr:s.fbo,size:e,samples:o,isSizeUpdate:!0}),[r,f]=U(ve);return[c.useCallback((x,d)=>{var T,C,S,D,_,P,O,L;const{gl:h}=x;d&&f(d),i(n,"uTexture0",r.texture0),i(n,"uTexture1",r.texture1),i(n,"progress",r.progress);const g=[((C=(T=r.texture0)==null?void 0:T.image)==null?void 0:C.width)||0,((D=(S=r.texture0)==null?void 0:S.image)==null?void 0:D.height)||0],b=[((P=(_=r.texture1)==null?void 0:_.image)==null?void 0:P.width)||0,((L=(O=r.texture1)==null?void 0:O.image)==null?void 0:L.height)||0],w=g.map((E,q)=>E+(b[q]-E)*r.progress);return i(n,"uTextureResolution",w),i(n,"padding",r.padding),i(n,"uMap",r.map),i(n,"mapIntensity",r.mapIntensity),i(n,"edgeIntensity",r.edgeIntensity),i(n,"epicenter",r.epicenter),i(n,"dirX",r.dir.x),i(n,"dirY",r.dir.y),l(h)},[l,n,r,f]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Fn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,zn=`precision highp float;

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
}`;const Un=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:new t.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:Fn,fragmentShader:zn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},me={texture:new t.Texture,brightness:new t.Vector3(.5,.5,.5),min:0,max:1},Vn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=Un(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(me);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"u_texture",r.texture),i(n,"u_brightness",r.brightness),i(n,"u_min",r.min),i(n,"u_max",r.max),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Bn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,On=`precision highp float;

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
}`;const En=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_map:{value:new t.Texture},u_mapIntensity:{value:0}},vertexShader:Bn,fragmentShader:On}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},fe={texture:new t.Texture,map:new t.Texture,mapIntensity:.3},Ln=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=En(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(fe);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"u_texture",r.texture),i(n,"u_map",r.map),i(n,"u_mapIntensity",r.mapIntensity),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Wn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,$n=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const kn=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uMap:{value:new t.Texture}},vertexShader:Wn,fragmentShader:$n}),[]),n=F(e,s,u,t.Mesh);return{material:u,mesh:n}},pe={texture:new t.Texture,map:new t.Texture},qn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=kn({scene:u,size:e,dpr:s.shader}),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(pe);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"uTexture",r.texture),i(n,"uMap",r.map),l(h)},[n,l,r,f]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var jn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Nn=`precision highp float;

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
}`;const Gn=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_brightness:{value:1},u_saturation:{value:1}},vertexShader:jn,fragmentShader:Nn}),[]),n=F(e,s,u,t.Mesh);return{material:u,mesh:n}},de={texture:new t.Texture,brightness:1,saturation:1},Kn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=Gn({scene:u,size:e,dpr:s.shader}),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(de);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"u_texture",r.texture),i(n,"u_brightness",r.brightness),i(n,"u_saturation",r.saturation),l(h)},[n,l,r,f]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Xn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Hn=`precision highp float;

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

}`;const Yn=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uResolution:{value:new t.Vector2},uTextureResolution:{value:new t.Vector2},uTexture:{value:new t.Texture}},vertexShader:Xn,fragmentShader:Hn}),[]),n=$(a,o);i(u,"uResolution",n.clone());const p=F(e,s,u,t.Mesh);return{material:u,mesh:p}},ge={texture:new t.Texture},Qn=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=Yn({scene:u,size:e,dpr:s.shader}),m=z(e),[v,l]=A({scene:u,camera:m,dpr:s.fbo,size:e,samples:o,isSizeUpdate:!0}),[r,f]=U(ge);return[c.useCallback((x,d)=>{var g,b,w,T,C,S;const{gl:h}=x;return d&&f(d),i(n,"uTexture",r.texture),i(n,"uTextureResolution",[((w=(b=(g=r.texture)==null?void 0:g.source)==null?void 0:b.data)==null?void 0:w.width)||0,((S=(C=(T=r.texture)==null?void 0:T.source)==null?void 0:C.data)==null?void 0:S.height)||0]),l(h)},[l,n,r,f]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var Zn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Jn=`precision mediump float;

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
}`;const et=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uTexture:{value:new t.Texture},uResolution:{value:new t.Vector2(0,0)},uBlurSize:{value:J.blurSize}},vertexShader:Zn,fragmentShader:Jn}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},J=Object.freeze({texture:new t.Texture,blurSize:3,blurPower:5}),nt=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=et(u),m=z(e),v=c.useMemo(()=>({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[u,m,e,s.fbo,o]),[l,r]=A(v),[f,y]=N(v),[x,d]=U(J);return[c.useCallback((g,b)=>{var S,D,_,P,O,L;const{gl:w}=g;b&&d(b),i(n,"uTexture",x.texture),i(n,"uResolution",[((_=(D=(S=x.texture)==null?void 0:S.source)==null?void 0:D.data)==null?void 0:_.width)||0,((L=(O=(P=x.texture)==null?void 0:P.source)==null?void 0:O.data)==null?void 0:L.height)||0]),i(n,"uBlurSize",x.blurSize);let T=y(w);const C=x.blurPower;for(let E=0;E<C;E++)i(n,"uTexture",T),T=y(w);return r(w)},[r,y,n,d,x]),d,{scene:u,mesh:p,material:n,camera:m,renderTarget:l,output:l.texture}]};var tt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,rt=`precision highp float;

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
}`;const ot=e=>{const a=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),o=c.useMemo(()=>new t.ShaderMaterial({uniforms:{uEpicenter:{value:G.epicenter},uProgress:{value:G.progress},uStrength:{value:G.strength},uWidth:{value:G.width},uMode:{value:0}},vertexShader:tt,fragmentShader:rt}),[]),s=F(e,a,o,t.Mesh);return{material:o,mesh:s}},G=Object.freeze({epicenter:new t.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),it=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=ot(u),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o,isSizeUpdate:!0}),[r,f]=U(G);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"uEpicenter",r.epicenter),i(n,"uProgress",r.progress),i(n,"uWidth",r.width),i(n,"uStrength",r.strength),i(n,"uMode",r.mode==="center"?0:r.mode==="horizontal"?1:2),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]};var at=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ut=`precision highp float;
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
}`;const st=({scene:e,size:a,dpr:o})=>{const s=c.useMemo(()=>new t.PlaneGeometry(2,2),[]),u=c.useMemo(()=>new t.ShaderMaterial({uniforms:{u_texture:{value:new t.Texture},u_resolution:{value:new t.Vector2},u_keyColor:{value:new t.Color},u_similarity:{value:0},u_smoothness:{value:0},u_spill:{value:0},u_color:{value:new t.Vector4},u_contrast:{value:0},u_brightness:{value:0},u_gamma:{value:0}},vertexShader:at,fragmentShader:ut}),[]),n=$(a,o);i(u,"u_resolution",n.clone());const p=F(e,s,u,t.Mesh);return{material:u,mesh:p}},he=Object.freeze({texture:new t.Texture,keyColor:new t.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new t.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),lt=({size:e,dpr:a,samples:o=0})=>{const s=I(a),u=c.useMemo(()=>new t.Scene,[]),{material:n,mesh:p}=st({scene:u,size:e,dpr:s.shader}),m=z(e),[v,l]=A({scene:u,camera:m,size:e,dpr:s.fbo,samples:o}),[r,f]=U(he);return[c.useCallback((x,d)=>{const{gl:h}=x;return d&&f(d),i(n,"u_texture",r.texture),i(n,"u_keyColor",r.keyColor),i(n,"u_similarity",r.similarity),i(n,"u_smoothness",r.smoothness),i(n,"u_spill",r.spill),i(n,"u_color",r.color),i(n,"u_contrast",r.contrast),i(n,"u_brightness",r.brightness),i(n,"u_gamma",r.gamma),l(h)},[l,n,f,r]),f,{scene:u,mesh:p,material:n,camera:m,renderTarget:v,output:v.texture}]},ct=({scene:e,geometry:a,material:o})=>{const s=F(e,a,o,t.Points),u=F(e,c.useMemo(()=>a.clone(),[a]),c.useMemo(()=>o.clone(),[o]),t.Mesh);return u.visible=!1,{points:s,interactiveMesh:u}};var vt=`uniform vec2 uResolution;
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
}`,mt=`precision highp float;
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
}`,xe=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;const ye=process.env.NODE_ENV==="development",Me=(e,a,o,s,u)=>{var r;const n=o==="position"?"positionTarget":"uvTarget",p=o==="position"?"#usf <morphPositions>":"#usf <morphUvs>",m=o==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",v=o==="position"?"positionsList":"uvsList",l=o==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){a.deleteAttribute(o),a.setAttribute(o,new t.BufferAttribute(e[0],u));let f="",y="";e.forEach((x,d)=>{a.setAttribute(`${n}${d}`,new t.BufferAttribute(x,u)),f+=`attribute vec${u} ${n}${d};
`,d===0?y+=`${n}${d}`:y+=`,${n}${d}`}),s=s.replace(`${p}`,f),s=s.replace(`${m}`,`vec${u} ${v}[${e.length}] = vec${u}[](${y});
				${l}
			`)}else s=s.replace(`${p}`,""),s=s.replace(`${m}`,""),(r=a==null?void 0:a.attributes[o])!=null&&r.array||ye&&console.error(`use-shader-fx:geometry.attributes.${o}.array is not found`);return s},be=(e,a,o,s)=>{var n;let u=[];if(e&&e.length>0){(n=a==null?void 0:a.attributes[o])!=null&&n.array?u=[a.attributes[o].array,...e]:u=e;const p=Math.max(...u.map(m=>m.length));u.forEach((m,v)=>{if(m.length<p){const l=(p-m.length)/s,r=[],f=Array.from(m);for(let y=0;y<l;y++){const x=Math.floor(m.length/s*Math.random())*s;for(let d=0;d<s;d++)r.push(f[x+d])}u[v]=new Float32Array([...f,...r])}})}return u},ft=(e,a)=>{let o="";const s={};let u="mapArrayColor = ";return e&&e.length>0?(e.forEach((p,m)=>{const v=`vMapArrayIndex < ${m}.1`,l=`texture2D(uMapArray${m}, uv)`;u+=`( ${v} ) ? ${l} : `,o+=`
        uniform sampler2D uMapArray${m};
      `,s[`uMapArray${m}`]={value:p}}),u+="vec4(1.);",o+="bool isMapArray = true;",s.uMapArrayLength={value:e.length}):(u+="vec4(1.0);",o+="bool isMapArray = false;",s.uMapArrayLength={value:0}),{rewritedFragmentShader:a.replace("#usf <mapArraySwitcher>",u).replace("#usf <mapArrayUniforms>",o),mapArrayUniforms:s}},pt=({size:e,dpr:a,geometry:o,positions:s,uvs:u,mapArray:n})=>{const p=c.useMemo(()=>be(s,o,"position",3),[s,o]),m=c.useMemo(()=>be(u,o,"uv",2),[u,o]),v=c.useMemo(()=>{p.length!==m.length&&ye&&console.log("use-shader-fx:positions and uvs are not matched");const r=Me(m,o,"uv",Me(p,o,"position",vt,3),2).replace("#usf <getWobble>",xe),f=ft(n,mt);return new t.ShaderMaterial({vertexShader:r,fragmentShader:f.rewritedFragmentShader,depthTest:!1,depthWrite:!1,transparent:!0,blending:t.AdditiveBlending,uniforms:{uResolution:{value:new t.Vector2(0,0)},uMorphProgress:{value:R.morphProgress},uBlurAlpha:{value:R.blurAlpha},uBlurRadius:{value:R.blurRadius},uPointSize:{value:R.pointSize},uPointAlpha:{value:R.pointAlpha},uPicture:{value:new t.Texture},uIsPicture:{value:!1},uAlphaPicture:{value:new t.Texture},uIsAlphaPicture:{value:!1},uColor0:{value:R.color0},uColor1:{value:R.color1},uColor2:{value:R.color2},uColor3:{value:R.color3},uMap:{value:new t.Texture},uIsMap:{value:!1},uAlphaMap:{value:new t.Texture},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:R.wobblePositionFrequency},uWobbleTimeFrequency:{value:R.wobbleTimeFrequency},uWobbleStrength:{value:R.wobbleStrength},uWarpPositionFrequency:{value:R.warpPositionFrequency},uWarpTimeFrequency:{value:R.warpTimeFrequency},uWarpStrength:{value:R.warpStrength},uDisplacement:{value:new t.Texture},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:R.displacementIntensity},uDisplacementColorIntensity:{value:R.displacementColorIntensity},uSizeRandomIntensity:{value:R.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:R.sizeRandomTimeFrequency},uSizeRandomMin:{value:R.sizeRandomMin},uSizeRandomMax:{value:R.sizeRandomMax},uDivergence:{value:R.divergence},uDivergencePoint:{value:R.divergencePoint},...f.mapArrayUniforms}})},[o,p,m,n]),l=$(e,a);return i(v,"uResolution",l.clone()),{material:v,modifiedPositions:p,modifiedUvs:m}},we=({size:e,dpr:a,scene:o=!1,geometry:s,positions:u,uvs:n,mapArray:p})=>{const m=I(a),v=c.useMemo(()=>{const h=s||new t.SphereGeometry(1,32,32);return h.setIndex(null),h.deleteAttribute("normal"),h},[s]),{material:l,modifiedPositions:r,modifiedUvs:f}=pt({size:e,dpr:m.shader,geometry:v,positions:u,uvs:n,mapArray:p}),{points:y,interactiveMesh:x}=ct({scene:o,geometry:v,material:l});return[c.useCallback((h,g)=>{h&&i(l,"uTime",(g==null?void 0:g.beat)||h.clock.getElapsedTime()),g!==void 0&&(i(l,"uMorphProgress",g.morphProgress),i(l,"uBlurAlpha",g.blurAlpha),i(l,"uBlurRadius",g.blurRadius),i(l,"uPointSize",g.pointSize),i(l,"uPointAlpha",g.pointAlpha),g.picture?(i(l,"uPicture",g.picture),i(l,"uIsPicture",!0)):g.picture===!1&&i(l,"uIsPicture",!1),g.alphaPicture?(i(l,"uAlphaPicture",g.alphaPicture),i(l,"uIsAlphaPicture",!0)):g.alphaPicture===!1&&i(l,"uIsAlphaPicture",!1),i(l,"uColor0",g.color0),i(l,"uColor1",g.color1),i(l,"uColor2",g.color2),i(l,"uColor3",g.color3),g.map?(i(l,"uMap",g.map),i(l,"uIsMap",!0)):g.map===!1&&i(l,"uIsMap",!1),g.alphaMap?(i(l,"uAlphaMap",g.alphaMap),i(l,"uIsAlphaMap",!0)):g.alphaMap===!1&&i(l,"uIsAlphaMap",!1),i(l,"uWobbleStrength",g.wobbleStrength),i(l,"uWobblePositionFrequency",g.wobblePositionFrequency),i(l,"uWobbleTimeFrequency",g.wobbleTimeFrequency),i(l,"uWarpStrength",g.warpStrength),i(l,"uWarpPositionFrequency",g.warpPositionFrequency),i(l,"uWarpTimeFrequency",g.warpTimeFrequency),g.displacement?(i(l,"uDisplacement",g.displacement),i(l,"uIsDisplacement",!0)):g.displacement===!1&&i(l,"uIsDisplacement",!1),i(l,"uDisplacementIntensity",g.displacementIntensity),i(l,"uDisplacementColorIntensity",g.displacementColorIntensity),i(l,"uSizeRandomIntensity",g.sizeRandomIntensity),i(l,"uSizeRandomTimeFrequency",g.sizeRandomTimeFrequency),i(l,"uSizeRandomMin",g.sizeRandomMin),i(l,"uSizeRandomMax",g.sizeRandomMax),i(l,"uDivergence",g.divergence),i(l,"uDivergencePoint",g.divergencePoint))},[l]),{points:y,interactiveMesh:x,positions:r,uvs:f}]},R=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new t.Vector3(0),beat:!1}),dt=({size:e,dpr:a,samples:o=0,camera:s,geometry:u,positions:n,uvs:p})=>{const m=I(a),v=c.useMemo(()=>new t.Scene,[]),[l,{points:r,interactiveMesh:f,positions:y,uvs:x}]=we({scene:v,size:e,dpr:a,geometry:u,positions:n,uvs:p}),[d,h]=A({scene:v,camera:s,size:e,dpr:m.fbo,samples:o,depthBuffer:!0}),g=c.useCallback((w,T)=>(l(w,T),h(w.gl)),[h,l]),b=c.useCallback(w=>{l(null,w)},[l]);return[g,b,{scene:v,points:r,interactiveMesh:f,renderTarget:d,output:d.texture,positions:y,uvs:x}]};function gt(e,a=1e-4){a=Math.max(a,Number.EPSILON);const o={},s=e.getIndex(),u=e.getAttribute("position"),n=s?s.count:u.count;let p=0;const m=Object.keys(e.attributes),v={},l={},r=[],f=["getX","getY","getZ","getW"];for(let h=0,g=m.length;h<g;h++){const b=m[h];v[b]=[];const w=e.morphAttributes[b];w&&(l[b]=new Array(w.length).fill(0).map(()=>[]))}const y=Math.log10(1/a),x=Math.pow(10,y);for(let h=0;h<n;h++){const g=s?s.getX(h):h;let b="";for(let w=0,T=m.length;w<T;w++){const C=m[w],S=e.getAttribute(C),D=S.itemSize;for(let _=0;_<D;_++)b+=`${~~(S[f[_]](g)*x)},`}if(b in o)r.push(o[b]);else{for(let w=0,T=m.length;w<T;w++){const C=m[w],S=e.getAttribute(C),D=e.morphAttributes[C],_=S.itemSize,P=v[C],O=l[C];for(let L=0;L<_;L++){const E=f[L];if(P.push(S[E](g)),D)for(let q=0,W=D.length;q<W;q++)O[q].push(D[q][E](g))}}o[b]=p,r.push(p),p++}}const d=e.clone();for(let h=0,g=m.length;h<g;h++){const b=m[h],w=e.getAttribute(b),T=new w.array.constructor(v[b]),C=new j.BufferAttribute(T,w.itemSize,w.normalized);if(d.setAttribute(b,C),b in l)for(let S=0;S<l[b].length;S++){const D=e.morphAttributes[b][S],_=new D.array.constructor(l[b][S]),P=new j.BufferAttribute(_,D.itemSize,D.normalized);d.morphAttributes[b][S]=P}}return d.setIndex(r),d}var ht=`vec3 random3(vec3 c) {
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
}`,xt=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,yt=`#ifdef USE_TRANSMISSION

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

#endif`;const Se=e=>{let a=e;return a=a.replace("#include <beginnormal_vertex>",`
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
		void main() {`),a=a.replace("// #usf <getWobble>",`${xe}`),a=a.replace("void main() {",`
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
		vWobble = wobble / uWobbleStrength;`),a},Mt=({baseMaterial:e,materialParameters:a})=>{const{material:o,depthMaterial:s}=c.useMemo(()=>{const u=new(e||t.MeshPhysicalMaterial)(a||{}),n=u.type==="MeshPhysicalMaterial"||u.type==="MeshStandardMaterial",p=u.type==="MeshPhysicalMaterial";Object.assign(u.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:V.wobblePositionFrequency},uWobbleTimeFrequency:{value:V.wobbleTimeFrequency},uWobbleStrength:{value:V.wobbleStrength},uWarpPositionFrequency:{value:V.warpPositionFrequency},uWarpTimeFrequency:{value:V.warpTimeFrequency},uWarpStrength:{value:V.warpStrength},uWobbleShine:{value:V.wobbleShine},uColor0:{value:V.color0},uColor1:{value:V.color1},uColor2:{value:V.color2},uColor3:{value:V.color3},uColorMix:{value:V.colorMix},uChromaticAberration:{value:V.chromaticAberration},uAnisotropicBlur:{value:V.anisotropicBlur},uDistortion:{value:V.distortion},uDistortionScale:{value:V.distortionScale},uTemporalDistortion:{value:V.temporalDistortion},uSamples:{value:V.samples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),u.onBeforeCompile=v=>{Object.assign(v.uniforms,u.userData.uniforms),v.vertexShader=Se(v.vertexShader),v.fragmentShader=v.fragmentShader.replace("#include <color_fragment>",`
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`),n&&(v.fragmentShader=v.fragmentShader.replace("#include <roughnessmap_fragment>",`
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
				${ht}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${n?"float usf_Roughness = roughness;":""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${n?"usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);":""}`),p&&(v.fragmentShader=v.fragmentShader.replace("#include <transmission_pars_fragment>",`${xt}`),v.fragmentShader=v.fragmentShader.replace("#include <transmission_fragment>",`${yt}`))},u.needsUpdate=!0;const m=new t.MeshDepthMaterial({depthPacking:t.RGBADepthPacking});return m.onBeforeCompile=v=>{Object.assign(v.uniforms,u.userData.uniforms),v.vertexShader=Se(v.vertexShader)},m.needsUpdate=!0,{material:u,depthMaterial:m}},[a,e]);return{material:o,depthMaterial:s}},_e=({scene:e=!1,geometry:a,baseMaterial:o,materialParameters:s})=>{const u=c.useMemo(()=>{let l=a||new t.IcosahedronGeometry(2,20);return l=gt(l),l.computeTangents(),l},[a]),{material:n,depthMaterial:p}=Mt({baseMaterial:o,materialParameters:s}),m=F(e,u,n,t.Mesh);return[c.useCallback((l,r)=>{const f=n.userData;l&&i(f,"uTime",(r==null?void 0:r.beat)||l.clock.getElapsedTime()),r!==void 0&&(i(f,"uWobbleStrength",r.wobbleStrength),i(f,"uWobblePositionFrequency",r.wobblePositionFrequency),i(f,"uWobbleTimeFrequency",r.wobbleTimeFrequency),i(f,"uWarpStrength",r.warpStrength),i(f,"uWarpPositionFrequency",r.warpPositionFrequency),i(f,"uWarpTimeFrequency",r.warpTimeFrequency),i(f,"uWobbleShine",r.wobbleShine),i(f,"uSamples",r.samples),i(f,"uColor0",r.color0),i(f,"uColor1",r.color1),i(f,"uColor2",r.color2),i(f,"uColor3",r.color3),i(f,"uColorMix",r.colorMix),i(f,"uChromaticAberration",r.chromaticAberration),i(f,"uAnisotropicBlur",r.anisotropicBlur),i(f,"uDistortion",r.distortion),i(f,"uDistortionScale",r.distortionScale),i(f,"uTemporalDistortion",r.temporalDistortion))},[n]),{mesh:m,depthMaterial:p}]},V=Object.freeze({beat:!1,wobbleStrength:.3,wobblePositionFrequency:.5,wobbleTimeFrequency:.4,wobbleShine:0,warpStrength:1.7,warpPositionFrequency:.38,warpTimeFrequency:.12,samples:6,color0:new t.Color(16711680),color1:new t.Color(65280),color2:new t.Color(255),color3:new t.Color(16776960),colorMix:1,chromaticAberration:.5,anisotropicBlur:.1,distortion:.1,distortionScale:.1,temporalDistortion:.1}),bt=({size:e,dpr:a,samples:o=0,camera:s,geometry:u,baseMaterial:n,materialParameters:p})=>{const m=I(a),v=c.useMemo(()=>new t.Scene,[]),[l,{mesh:r,depthMaterial:f}]=_e({baseMaterial:n,materialParameters:p,scene:v,geometry:u}),[y,x]=A({scene:v,camera:s,size:e,dpr:m.fbo,samples:o,depthBuffer:!0}),d=c.useCallback((g,b)=>(l(g,b),x(g.gl)),[x,l]),h=c.useCallback(g=>{l(null,g)},[l]);return[d,h,{scene:v,mesh:r,depthMaterial:f,renderTarget:y,output:y.texture}]},wt=(e,a,o)=>{const s=c.useMemo(()=>{const u=new t.Mesh(a,o);return e.add(u),u},[a,o,e]);return c.useEffect(()=>()=>{e.remove(s),a.dispose(),o.dispose()},[e,a,o,s]),s},H=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const o=2.5949095;return e<.5?Math.pow(2*e,2)*((o+1)*2*e-o)/2:(Math.pow(2*e-2,2)*((o+1)*(e*2-2)+o)+2)/2},easeInElastic(e){const a=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*a)},easeOutElastic(e){const a=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*a)+1},easeInOutElastic(e){const a=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*a))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*a)/2+1},easeInBounce(e){return 1-H.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-H.easeOutBounce(1-2*e))/2:(1+H.easeOutBounce(2*e-1))/2}});function St(e){let a=Math.sin(e*12.9898)*43758.5453;return a-Math.floor(a)}const _t=(e,a="easeOutQuart")=>{const o=e/60,s=H[a];return c.useCallback(n=>{let p=n.getElapsedTime()*o;const m=Math.floor(p),v=s(p-m);p=v+m;const l=St(m);return{beat:p,floor:m,fract:v,hash:l}},[o,s])},Ct=(e=60)=>{const a=c.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),o=c.useRef(null);return c.useCallback(u=>{const n=u.getElapsedTime();return o.current===null||n-o.current>=a?(o.current=n,!0):!1},[a])},Tt=e=>{var s,u;const a=(s=e.dom)==null?void 0:s.length,o=(u=e.texture)==null?void 0:u.length;return!a||!o||a!==o};var Pt=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Rt=`precision highp float;

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
}`;const Dt=({params:e,size:a,scene:o})=>{o.children.length>0&&(o.children.forEach(s=>{s instanceof t.Mesh&&(s.geometry.dispose(),s.material.dispose())}),o.remove(...o.children)),e.texture.forEach((s,u)=>{const n=new t.Mesh(new t.PlaneGeometry(1,1),new t.ShaderMaterial({vertexShader:Pt,fragmentShader:Rt,transparent:!0,uniforms:{u_texture:{value:s},u_textureResolution:{value:new t.Vector2(0,0)},u_resolution:{value:new t.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[u]?e.boderRadius[u]:0}}}));o.add(n)})},At=()=>{const e=c.useRef([]),a=c.useRef([]);return c.useCallback(({isIntersectingRef:s,isIntersectingOnceRef:u,params:n})=>{e.current.length>0&&e.current.forEach((m,v)=>{m.unobserve(a.current[v])}),a.current=[],e.current=[];const p=new Array(n.dom.length).fill(!1);s.current=[...p],u.current=[...p],n.dom.forEach((m,v)=>{const l=f=>{f.forEach(y=>{n.onIntersect[v]&&n.onIntersect[v](y),s.current[v]=y.isIntersecting})},r=new IntersectionObserver(l,{rootMargin:"0px",threshold:0});r.observe(m),e.current.push(r),a.current.push(m)})},[])},It=()=>{const e=c.useRef([]),a=c.useCallback(({params:o,size:s,resolutionRef:u,scene:n,isIntersectingRef:p})=>{n.children.length!==e.current.length&&(e.current=new Array(n.children.length)),n.children.forEach((m,v)=>{var f,y,x,d,h,g;const l=o.dom[v];if(!l)return;const r=l.getBoundingClientRect();if(e.current[v]=r,m.scale.set(r.width,r.height,1),m.position.set(r.left+r.width*.5-s.width*.5,-r.top-r.height*.5+s.height*.5,0),p.current[v]&&(o.rotation[v]&&m.rotation.copy(o.rotation[v]),m instanceof t.Mesh)){const b=m.material;i(b,"u_texture",o.texture[v]),i(b,"u_textureResolution",[((x=(y=(f=o.texture[v])==null?void 0:f.source)==null?void 0:y.data)==null?void 0:x.width)||0,((g=(h=(d=o.texture[v])==null?void 0:d.source)==null?void 0:h.data)==null?void 0:g.height)||0]),i(b,"u_resolution",u.current.set(r.width,r.height)),i(b,"u_borderRadius",o.boderRadius[v]?o.boderRadius[v]:0)}})},[]);return[e.current,a]},Ft=()=>{const e=c.useRef([]),a=c.useRef([]),o=c.useCallback((s,u=!1)=>{e.current.forEach((p,m)=>{p&&(a.current[m]=!0)});const n=u?[...a.current]:[...e.current];return s<0?n:n[s]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:a,isIntersecting:o}},zt=e=>({onView:o,onHidden:s})=>{const u=c.useRef(!1);c.useEffect(()=>{let n;const p=()=>{e.current.some(m=>m)?u.current||(o&&o(),u.current=!0):u.current&&(s&&s(),u.current=!1),n=requestAnimationFrame(p)};return n=requestAnimationFrame(p),()=>{cancelAnimationFrame(n)}},[o,s])},Ce={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},Ut=({size:e,dpr:a,samples:o=0},s=[])=>{const u=I(a),n=c.useMemo(()=>new t.Scene,[]),p=z(e),[m,v]=A({scene:n,camera:p,size:e,dpr:u.fbo,samples:o,isSizeUpdate:!0}),[l,r]=U({...Ce,updateKey:performance.now()}),[f,y]=It(),x=c.useRef(new t.Vector2(0,0)),[d,h]=c.useState(!0);c.useMemo(()=>h(!0),s);const g=c.useRef(null),b=c.useMemo(()=>new t.Texture,[]),w=At(),{isIntersectingOnceRef:T,isIntersectingRef:C,isIntersecting:S}=Ft(),D=zt(C);return[c.useCallback((P,O)=>{const{gl:L,size:E}=P;if(O&&r(O),Tt(l))return b;if(d){if(g.current===l.updateKey)return b;g.current=l.updateKey}return d&&(Dt({params:l,size:E,scene:n}),w({isIntersectingRef:C,isIntersectingOnceRef:T,params:l}),h(!1)),y({params:l,size:E,resolutionRef:x,scene:n,isIntersectingRef:C}),v(L)},[v,r,w,y,d,n,l,T,C,b]),r,{scene:n,camera:p,renderTarget:m,output:m.texture,isIntersecting:S,DOMRects:f,intersections:C.current,useDomView:D}]},Vt=({scene:e,camera:a,size:o,dpr:s=!1,isSizeUpdate:u=!1,samples:n=0,depthBuffer:p=!1,depthTexture:m=!1},v)=>{const l=c.useRef([]),r=$(o,s);l.current=c.useMemo(()=>Array.from({length:v},()=>{const y=new t.WebGLRenderTarget(r.x,r.y,{...X,samples:n,depthBuffer:p});return m&&(y.depthTexture=new t.DepthTexture(r.x,r.y,t.FloatType)),y}),[v]),u&&l.current.forEach(y=>y.setSize(r.x,r.y)),c.useEffect(()=>{const y=l.current;return()=>{y.forEach(x=>x.dispose())}},[v]);const f=c.useCallback((y,x,d)=>{const h=l.current[x];return Q({gl:y,scene:e,camera:a,fbo:h,onBeforeRender:()=>d&&d({read:h.texture})}),h.texture},[e,a]);return[l.current,f]};M.ALPHABLENDING_PARAMS=pe,M.BLENDING_PARAMS=ce,M.BRIGHTNESSPICKER_PARAMS=me,M.BRUSH_PARAMS=te,M.CHROMAKEY_PARAMS=he,M.COLORSTRATA_PARAMS=ae,M.COSPALETTE_PARAMS=se,M.COVERTEXTURE_PARAMS=ge,M.DOMSYNCER_PARAMS=Ce,M.DUOTONE_PARAMS=le,M.Easing=H,M.FBO_OPTION=X,M.FLUID_PARAMS=re,M.FXBLENDING_PARAMS=fe,M.FXTEXTURE_PARAMS=ve,M.HSV_PARAMS=de,M.MARBLE_PARAMS=ue,M.MORPHPARTICLES_PARAMS=R,M.NOISE_PARAMS=ie,M.RIPPLE_PARAMS=oe,M.SIMPLEBLUR_PARAMS=J,M.WAVE_PARAMS=G,M.WOBBLE3D_PARAMS=V,M.renderFBO=Q,M.setUniform=i,M.useAddMesh=wt,M.useAlphaBlending=qn,M.useBeat=_t,M.useBlending=Pn,M.useBrightnessPicker=Vn,M.useBrush=Ue,M.useCamera=z,M.useChromaKey=lt,M.useColorStrata=vn,M.useCopyTexture=Vt,M.useCosPalette=yn,M.useCoverTexture=Qn,M.useCreateMorphParticles=we,M.useCreateWobble3D=_e,M.useDomSyncer=Ut,M.useDoubleFBO=N,M.useDuoTone=Sn,M.useFPSLimiter=Ct,M.useFluid=en,M.useFxBlending=Ln,M.useFxTexture=In,M.useHSV=Kn,M.useMarble=dn,M.useMorphParticles=dt,M.useNoise=un,M.useParams=U,M.usePointer=Y,M.useResolution=$,M.useRipple=tn,M.useSimpleBlur=nt,M.useSingleFBO=A,M.useWave=it,M.useWobble3D=bt,Object.defineProperty(M,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
