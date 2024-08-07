(function(S,me){typeof exports=="object"&&typeof module<"u"?me(exports,require("three"),require("react"),require("three-stdlib")):typeof define=="function"&&define.amd?define(["exports","three","react","three-stdlib"],me):(S=typeof globalThis<"u"?globalThis:S||self,me(S["use-shader-fx"]={},S.THREE,S.react,S.threeStdlib))})(this,function(S,me,a,$e){"use strict";function je(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const o=je(me);var We="#usf <planeVertex>",qe=`precision highp float;

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
}`;const N=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return a.useMemo(()=>new o.Vector2(t,r),[t,r])},P=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},A=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},B=(e,n,t,r)=>{const l=a.useMemo(()=>{const c=new r(n,t);return e&&e.add(c),c},[n,t,r,e]);return a.useEffect(()=>()=>{e&&e.remove(l),n.dispose(),t.dispose()},[e,n,t,l]),l},we=process.env.NODE_ENV==="development",I={transparent:!1,depthTest:!1,depthWrite:!1},T=new o.DataTexture(new Uint8Array([0,0,0,0]),1,1,o.RGBAFormat);var Ne=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`,Ge=`vec3 random3(vec3 c) {
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
}`,He=`float screenAspect = uResolution.x / uResolution.y;
float textureAspect = uTextureResolution.x / uTextureResolution.y;
vec2 aspectRatio = vec2(
	min(screenAspect / textureAspect, 1.0),
	min(textureAspect / screenAspect, 1.0)
);
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`,Ke=`vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`,Xe=`precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ye=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,Qe=`vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`,Ze=`vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}`;const De=Object.freeze({wobble3D:Ne,snoise:Ge,coverTexture:He,fxBlending:Ke,planeVertex:Xe,defaultVertex:Ye,hsv2rgb:Qe,rgb2hsv:Ze}),Je=/^[ \t]*#usf +<([\w\d./]+)>/gm;function en(e,n){return be(De[n]||"")}function be(e){return e.replace(Je,en)}const F=(e,n)=>(n&&n(e),e.vertexShader=be(e.vertexShader),e.fragmentShader=be(e.fragmentShader),e),nn=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uBuffer:{value:T},uResolution:{value:new o.Vector2(0,0)},uTexture:{value:T},uIsTexture:{value:!1},uMap:{value:T},uIsMap:{value:!1},uMapIntensity:{value:Y.mapIntensity},uRadius:{value:Y.radius},uSmudge:{value:Y.smudge},uDissipation:{value:Y.dissipation},uMotionBlur:{value:Y.motionBlur},uMotionSample:{value:Y.motionSample},uMouse:{value:new o.Vector2(-10,-10)},uPrevMouse:{value:new o.Vector2(-10,-10)},uVelocity:{value:new o.Vector2(0,0)},uColor:{value:Y.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:We,fragmentShader:qe},r),...I,transparent:!0}),[r]),m=N(n,t);P(c)("uResolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},tn=(e,n)=>{const t=n,r=e/n,[l,c]=[t*r/2,t/2];return{width:l,height:c,near:-1e3,far:1e3}},E=(e,n="OrthographicCamera")=>{const t=N(e),{width:r,height:l,near:c,far:m}=tn(t.x,t.y);return a.useMemo(()=>n==="OrthographicCamera"?new o.OrthographicCamera(-r,r,l,-l,c,m):new o.PerspectiveCamera(50,r/l),[r,l,c,m,n])},ge=(e=0)=>{const n=a.useRef(new o.Vector2(0,0)),t=a.useRef(new o.Vector2(0,0)),r=a.useRef(new o.Vector2(0,0)),l=a.useRef(0),c=a.useRef(new o.Vector2(0,0)),m=a.useRef(!1);return a.useCallback(d=>{const p=performance.now();let g;m.current&&e?(r.current=r.current.lerp(d,1-e),g=r.current.clone()):(g=d.clone(),r.current=g),l.current===0&&(l.current=p,n.current=g);const M=Math.max(1,p-l.current);l.current=p,c.current.copy(g).sub(n.current).divideScalar(M);const u=c.current.length()>0,v=m.current?n.current.clone():g;return!m.current&&u&&(m.current=!0),n.current=g,{currentPointer:g,prevPointer:v,diffPointer:t.current.subVectors(g,v),velocity:c.current,isVelocityUpdate:u}},[e])},L=e=>{const n=l=>Object.values(l).some(c=>typeof c=="function"),t=a.useRef(n(e)?e:structuredClone(e)),r=a.useCallback(l=>{if(l!==void 0)for(const c in l){const m=c;m in t.current&&l[m]!==void 0&&l[m]!==null?t.current[m]=l[m]:console.error(`"${String(m)}" does not exist in the params. or "${String(m)}" is null | undefined`)}},[]);return[t.current,r]},ve={depthBuffer:!1},he=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:l,onSwap:c})=>{e.setRenderTarget(n),l(),e.clear(),e.render(t,r),c&&c(),e.setRenderTarget(null),e.clear()},k=e=>{var M;const{scene:n,camera:t,size:r,dpr:l=!1,isSizeUpdate:c=!1,depth:m=!1,...i}=e,d=a.useRef(),p=N(r,l);d.current=a.useMemo(()=>{const u=new o.WebGLRenderTarget(p.x,p.y,{...ve,...i});return m&&(u.depthTexture=new o.DepthTexture(p.x,p.y,o.FloatType)),u},[]),c&&((M=d.current)==null||M.setSize(p.x,p.y)),a.useEffect(()=>{const u=d.current;return()=>{u==null||u.dispose()}},[]);const g=a.useCallback((u,v)=>{const s=d.current;return he({gl:u,fbo:s,scene:n,camera:t,onBeforeRender:()=>v&&v({read:s.texture})}),s.texture},[n,t]);return[d.current,g]},ne=e=>{var M,u;const{scene:n,camera:t,size:r,dpr:l=!1,isSizeUpdate:c=!1,depth:m=!1,...i}=e,d=N(r,l),p=a.useMemo(()=>{const v=new o.WebGLRenderTarget(d.x,d.y,{...ve,...i}),s=new o.WebGLRenderTarget(d.x,d.y,{...ve,...i});return m&&(v.depthTexture=new o.DepthTexture(d.x,d.y,o.FloatType),s.depthTexture=new o.DepthTexture(d.x,d.y,o.FloatType)),{read:v,write:s,swap:function(){let f=this.read;this.read=this.write,this.write=f}}},[]);c&&((M=p.read)==null||M.setSize(d.x,d.y),(u=p.write)==null||u.setSize(d.x,d.y)),a.useEffect(()=>{const v=p;return()=>{var s,f;(s=v.read)==null||s.dispose(),(f=v.write)==null||f.dispose()}},[p]);const g=a.useCallback((v,s)=>{var x;const f=p;return he({gl:v,scene:n,camera:t,fbo:f.write,onBeforeRender:()=>s&&s({read:f.read.texture,write:f.write.texture}),onSwap:()=>f.swap()}),(x=f.read)==null?void 0:x.texture},[n,t,p]);return[{read:p.read,write:p.write},g]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Y=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new o.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),rn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=nn({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),g=ge(),[M,u]=ne({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[v,s]=L(Y),f=a.useRef(null),x=P(i),b=A(i),y=a.useCallback((C,_)=>{s(C),b(_)},[s,b]);return[a.useCallback((C,_,w)=>{const{gl:V,pointer:z}=C;y(_,w),v.texture?(x("uIsTexture",!0),x("uTexture",v.texture)):x("uIsTexture",!1),v.map?(x("uIsMap",!0),x("uMap",v.map),x("uMapIntensity",v.mapIntensity)):x("uIsMap",!1),x("uRadius",v.radius),x("uSmudge",v.smudge),x("uDissipation",v.dissipation),x("uMotionBlur",v.motionBlur),x("uMotionSample",v.motionSample);const R=v.pointerValues||g(z);R.isVelocityUpdate&&(x("uMouse",R.currentPointer),x("uPrevMouse",R.prevPointer)),x("uVelocity",R.velocity);const j=typeof v.color=="function"?v.color(R.velocity):v.color;return x("uColor",j),x("uIsCursor",v.isCursor),x("uPressureEnd",v.pressure),f.current===null&&(f.current=v.pressure),x("uPressureStart",f.current),f.current=v.pressure,u(V,({read:D})=>{x("uBuffer",D)})},[x,g,u,v,y]),y,{scene:m,mesh:d,material:i,camera:p,renderTarget:M,output:M.read.texture}]};var Q=`varying vec2 vUv;
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
}`,on=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const an=()=>a.useMemo(()=>new o.ShaderMaterial({vertexShader:Q,fragmentShader:on,...I}),[]);var un=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const sn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uVelocity:{value:T},uSource:{value:T},texelSize:{value:new o.Vector2},dt:{value:Se},dissipation:{value:0}},vertexShader:Q,fragmentShader:un},e),...I}),[e]);var ln=`precision highp float;

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
}`;const cn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:ln},e),...I}),[e]);var mn=`precision highp float;

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
}`;const vn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:mn},e),...I}),[e]);var fn=`precision highp float;

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
}`;const pn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:fn},e),...I}),[e]);var dn=`precision highp float;

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
}`;const gn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Se},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:dn},e),...I}),[e]);var hn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const xn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},value:{value:0},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:hn},e),...I}),[e]);var Mn=`precision highp float;

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
}`;const yn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uPressure:{value:T},uVelocity:{value:T},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:Mn},e),...I}),[e]);var bn=`precision highp float;

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
}`;const Sn=({onBeforeInit:e})=>a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTarget:{value:T},aspectRatio:{value:0},color:{value:new o.Vector3},point:{value:new o.Vector2},radius:{value:0},texelSize:{value:new o.Vector2}},vertexShader:Q,fragmentShader:bn},e),...I}),[e]),Z=(e,n)=>e(n??{}),Cn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),{curl:c,vorticity:m,advection:i,divergence:d,pressure:p,clear:g,gradientSubtract:M,splat:u}=r??{},v=Z(an),s=v.clone(),f=Z(pn,c),x=Z(gn,m),b=Z(sn,i),y=Z(cn,d),h=Z(vn,p),C=Z(xn,g),_=Z(yn,M),w=Z(Sn,u),V=a.useMemo(()=>({vorticityMaterial:x,curlMaterial:f,advectionMaterial:b,divergenceMaterial:y,pressureMaterial:h,clearMaterial:C,gradientSubtractMaterial:_,splatMaterial:w}),[x,f,b,y,h,C,_,w]),z=N(n,t);a.useMemo(()=>{P(V.splatMaterial)("aspectRatio",z.x/z.y);for(const D of Object.values(V))P(D)("texelSize",new o.Vector2(1/z.x,1/z.y))},[z,V]);const R=B(e,l,v,o.Mesh);a.useMemo(()=>{v.dispose(),R.material=s},[v,R,s]),a.useEffect(()=>()=>{for(const D of Object.values(V))D.dispose()},[V]);const j=a.useCallback(D=>{R.material=D,R.material.needsUpdate=!0},[R]);return{materials:V,setMeshMaterial:j,mesh:R}},Se=.016,Re=Object.freeze({densityDissipation:.98,velocityDissipation:.99,velocityAcceleration:10,pressureDissipation:.9,pressureIterations:20,curlStrength:35,splatRadius:.002,fluidColor:new o.Vector3(1,1,1),pointerValues:!1}),_n=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,customFluidProps:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{materials:i,setMeshMaterial:d,mesh:p}=Cn({scene:m,size:e,dpr:c.shader,customFluidProps:l}),g=E(e),M=ge(),u=a.useMemo(()=>({scene:m,camera:g,dpr:c.fbo,size:e,isSizeUpdate:r,type:o.HalfFloatType,...t}),[m,g,e,c.fbo,r,t]),[v,s]=ne(u),[f,x]=ne(u),[b,y]=k(u),[h,C]=k(u),[_,w]=ne(u),V=a.useRef(new o.Vector2(0,0)),z=a.useRef(new o.Vector3(0,0,0)),[R,j]=L(Re),D=a.useMemo(()=>({advection:P(i.advectionMaterial),splat:P(i.splatMaterial),curl:P(i.curlMaterial),vorticity:P(i.vorticityMaterial),divergence:P(i.divergenceMaterial),clear:P(i.clearMaterial),pressure:P(i.pressureMaterial),gradientSubtract:P(i.gradientSubtractMaterial)}),[i]),q=a.useMemo(()=>({advection:A(i.advectionMaterial),splat:A(i.splatMaterial),curl:A(i.curlMaterial),vorticity:A(i.vorticityMaterial),divergence:A(i.divergenceMaterial),clear:A(i.clearMaterial),pressure:A(i.pressureMaterial),gradientSubtract:A(i.gradientSubtractMaterial)}),[i]),H=a.useCallback((oe,ae)=>{j(oe),ae&&Object.keys(ae).forEach(ie=>{q[ie](ae[ie])})},[j,q]);return[a.useCallback((oe,ae,ie)=>{const{gl:G,pointer:Cr,size:Le}=oe;H(ae,ie);const Te=s(G,({read:W})=>{d(i.advectionMaterial),D.advection("uVelocity",W),D.advection("uSource",W),D.advection("dissipation",R.velocityDissipation)}),_r=x(G,({read:W})=>{d(i.advectionMaterial),D.advection("uVelocity",Te),D.advection("uSource",W),D.advection("dissipation",R.densityDissipation)}),ye=R.pointerValues||M(Cr);ye.isVelocityUpdate&&(s(G,({read:W})=>{d(i.splatMaterial),D.splat("uTarget",W),D.splat("point",ye.currentPointer);const ce=ye.diffPointer.multiply(V.current.set(Le.width,Le.height).multiplyScalar(R.velocityAcceleration));D.splat("color",z.current.set(ce.x,ce.y,1)),D.splat("radius",R.splatRadius)}),x(G,({read:W})=>{d(i.splatMaterial),D.splat("uTarget",W);const ce=typeof R.fluidColor=="function"?R.fluidColor(ye.velocity):R.fluidColor;D.splat("color",ce)}));const Tr=y(G,()=>{d(i.curlMaterial),D.curl("uVelocity",Te)});s(G,({read:W})=>{d(i.vorticityMaterial),D.vorticity("uVelocity",W),D.vorticity("uCurl",Tr),D.vorticity("curl",R.curlStrength)});const wr=C(G,()=>{d(i.divergenceMaterial),D.divergence("uVelocity",Te)});w(G,({read:W})=>{d(i.clearMaterial),D.clear("uTexture",W),D.clear("value",R.pressureDissipation)}),d(i.pressureMaterial),D.pressure("uDivergence",wr);let ke;for(let W=0;W<R.pressureIterations;W++)ke=w(G,({read:ce})=>{D.pressure("uPressure",ce)});return s(G,({read:W})=>{d(i.gradientSubtractMaterial),D.gradientSubtract("uPressure",ke),D.gradientSubtract("uVelocity",W)}),_r},[i,D,d,y,x,C,M,w,s,R,H]),H,{scene:m,mesh:p,materials:i,camera:g,renderTarget:{velocity:v,density:f,curl:b,divergence:h,pressure:_},output:f.read.texture}]};var Tn="#usf <defaultVertex>",wn=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const Dn=({scale:e,max:n,texture:t,scene:r,onBeforeInit:l})=>{const c=a.useMemo(()=>new o.PlaneGeometry(e,e),[e]),m=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uOpacity:{value:0},uMap:{value:t||T}},vertexShader:Tn,fragmentShader:wn},l),blending:o.AdditiveBlending,...I,transparent:!0}),[t,l]),i=a.useMemo(()=>{const d=[];for(let p=0;p<n;p++){const g=m.clone(),M=new o.Mesh(c.clone(),g);M.rotateZ(2*Math.PI*Math.random()),M.visible=!1,r.add(M),d.push(M)}return d},[c,m,r,n]);return a.useEffect(()=>()=>{i.forEach(d=>{d.geometry.dispose(),Array.isArray(d.material)?d.material.forEach(p=>p.dispose()):d.material.dispose(),r.remove(d)})},[r,i]),i},Pe=Object.freeze({frequency:.01,rotation:.05,fadeoutSpeed:.9,scale:.3,alpha:.6,pointerValues:!1}),Rn=({texture:e,scale:n=64,max:t=100,size:r,dpr:l,renderTargetOptions:c,isSizeUpdate:m,onBeforeInit:i})=>{const d=O(l),p=a.useMemo(()=>new o.Scene,[]),g=Dn({scale:n,max:t,texture:e,scene:p,onBeforeInit:i}),M=E(r),u=ge(),[v,s]=k({scene:p,camera:M,size:r,dpr:d.fbo,isSizeUpdate:m,...c}),[f,x]=L(Pe),b=a.useRef(0),y=a.useMemo(()=>(C,_)=>{x(C),g.forEach(w=>{if(w.visible){const V=w.material;w.rotation.z+=f.rotation,w.scale.x=f.fadeoutSpeed*w.scale.x+f.scale,w.scale.y=w.scale.x;const z=V.uniforms.uOpacity.value;P(V)("uOpacity",z*f.fadeoutSpeed),z<.001&&(w.visible=!1)}A(w.material)(_)})},[g,f,x]);return[a.useCallback((C,_,w)=>{const{gl:V,pointer:z,size:R}=C;y(_,w);const j=f.pointerValues||u(z);if(f.frequency<j.diffPointer.length()){const D=g[b.current],q=D.material;D.visible=!0,D.position.set(j.currentPointer.x*(R.width/2),j.currentPointer.y*(R.height/2),0),D.scale.x=D.scale.y=0,P(q)("uOpacity",f.alpha),b.current=(b.current+1)%t}return s(V)},[s,g,u,t,f,y]),y,{scene:p,camera:M,meshArr:g,renderTarget:v,output:v.texture}]};var Pn="#usf <planeVertex>",An=`precision highp float;
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
}`;const Fn=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTime:{value:0},scale:{value:J.scale},timeStrength:{value:J.timeStrength},noiseOctaves:{value:J.noiseOctaves},fbmOctaves:{value:J.fbmOctaves},warpOctaves:{value:J.warpOctaves},warpDirection:{value:J.warpDirection},warpStrength:{value:J.warpStrength}},vertexShader:Pn,fragmentShader:An},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},J=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new o.Vector2(2,2),warpStrength:8,beat:!1}),Vn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Fn({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(J),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_,clock:w}=y;return x(h,C),s("scale",u.scale),s("timeStrength",u.timeStrength),s("noiseOctaves",u.noiseOctaves),s("fbmOctaves",u.fbmOctaves),s("warpOctaves",u.warpOctaves),s("warpDirection",u.warpDirection),s("warpStrength",u.warpStrength),s("uTime",u.beat||w.getElapsedTime()),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var In="#usf <planeVertex>",zn=`precision highp float;
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
}`;const On=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},isTexture:{value:!1},scale:{value:K.scale},noise:{value:T},noiseStrength:{value:K.noiseStrength},isNoise:{value:!1},laminateLayer:{value:K.laminateLayer},laminateInterval:{value:K.laminateInterval},laminateDetail:{value:K.laminateDetail},distortion:{value:K.distortion},colorFactor:{value:K.colorFactor},uTime:{value:0},timeStrength:{value:K.timeStrength}},vertexShader:In,fragmentShader:zn},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},K=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new o.Vector2(.1,.1),laminateDetail:new o.Vector2(1,1),distortion:new o.Vector2(0,0),colorFactor:new o.Vector3(1,1,1),timeStrength:new o.Vector2(0,0),noise:!1,noiseStrength:new o.Vector2(0,0),beat:!1}),Un=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=On({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(K),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_,clock:w}=y;return x(h,C),u.texture?(s("uTexture",u.texture),s("isTexture",!0)):(s("isTexture",!1),s("scale",u.scale)),u.noise?(s("noise",u.noise),s("isNoise",!0),s("noiseStrength",u.noiseStrength)):s("isNoise",!1),s("uTime",u.beat||w.getElapsedTime()),s("laminateLayer",u.laminateLayer),s("laminateInterval",u.laminateInterval),s("laminateDetail",u.laminateDetail),s("distortion",u.distortion),s("colorFactor",u.colorFactor),s("timeStrength",u.timeStrength),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Bn="#usf <planeVertex>",En=`precision highp float;

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
}`;const Ln=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_time:{value:0},u_pattern:{value:te.pattern},u_complexity:{value:te.complexity},u_complexityAttenuation:{value:te.complexityAttenuation},u_iterations:{value:te.iterations},u_timeStrength:{value:te.timeStrength},u_scale:{value:te.scale}},vertexShader:Bn,fragmentShader:En},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},te=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),kn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Ln({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(te),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_,clock:w}=y;return x(h,C),s("u_pattern",u.pattern),s("u_complexity",u.complexity),s("u_complexityAttenuation",u.complexityAttenuation),s("u_iterations",u.iterations),s("u_timeStrength",u.timeStrength),s("u_scale",u.scale),s("u_time",u.beat||w.getElapsedTime()),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var $n="#usf <planeVertex>",jn=`precision highp float;
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
}`;const Wn=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uRgbWeight:{value:ue.rgbWeight},uColor1:{value:ue.color1},uColor2:{value:ue.color2},uColor3:{value:ue.color3},uColor4:{value:ue.color4}},vertexShader:$n,fragmentShader:jn},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},ue=Object.freeze({texture:T,color1:new o.Color().set(.5,.5,.5),color2:new o.Color().set(.5,.5,.5),color3:new o.Color().set(1,1,1),color4:new o.Color().set(0,.1,.2),rgbWeight:new o.Vector3(.299,.587,.114)}),qn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Wn({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(ue),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("uTexture",u.texture),s("uColor1",u.color1),s("uColor2",u.color2),s("uColor3",u.color3),s("uColor4",u.color4),s("uRgbWeight",u.rgbWeight),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Nn="#usf <planeVertex>",Gn=`precision highp float;

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
}`;const Hn=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uColor0:{value:xe.color0},uColor1:{value:xe.color1}},vertexShader:Nn,fragmentShader:Gn},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},xe=Object.freeze({texture:T,color0:new o.Color(16777215),color1:new o.Color(0)}),Kn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Hn({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(xe),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("uTexture",u.texture),s("uColor0",u.color0),s("uColor1",u.color1),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Xn="#usf <planeVertex>",Yn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform bool u_isAlphaMap;
uniform sampler2D u_alphaMap;
uniform float uMapIntensity;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;
uniform vec3 u_dodgeColor;
uniform bool u_isDodgeColor;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	
	float brightness = dot(mapColor,u_brightness);
	vec4 textureMap = texture2D(u_texture, uv);
	float blendValue = smoothstep(u_min, u_max, brightness);

	
	vec3 dodgeColor = u_isDodgeColor ? u_dodgeColor : mapColor;
	vec3 outputColor = blendValue * dodgeColor + (1.0 - blendValue) * textureMap.rgb;
	
	
	float alpha = u_isAlphaMap ? texture2D(u_alphaMap, uv).a : textureMap.a;
	float mixValue = u_isAlphaMap ? alpha : 0.0;
	vec3 alphaColor = vec3(mix(outputColor,mapColor,mixValue));

	gl_FragColor = vec4(alphaColor,alpha);
}`;const Qn=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_texture:{value:T},uMap:{value:T},u_alphaMap:{value:T},u_isAlphaMap:{value:!1},uMapIntensity:{value:se.mapIntensity},u_brightness:{value:se.brightness},u_min:{value:se.min},u_max:{value:se.max},u_dodgeColor:{value:new o.Color},u_isDodgeColor:{value:!1}},vertexShader:Xn,fragmentShader:Yn},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},se=Object.freeze({texture:T,map:T,alphaMap:!1,mapIntensity:.3,brightness:new o.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Zn=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Qn({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(se),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("u_texture",u.texture),s("uMap",u.map),s("uMapIntensity",u.mapIntensity),u.alphaMap?(s("u_alphaMap",u.alphaMap),s("u_isAlphaMap",!0)):s("u_isAlphaMap",!1),s("u_brightness",u.brightness),s("u_min",u.min),s("u_max",u.max),u.dodgeColor?(s("u_dodgeColor",u.dodgeColor),s("u_isDodgeColor",!0)):s("u_isDodgeColor",!1),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Jn="#usf <planeVertex>",et=`precision highp float;

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
	#usf <coverTexture>

	
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

}`;const nt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>{var p,g;return new o.ShaderMaterial({...F({uniforms:{uResolution:{value:new o.Vector2},uTextureResolution:{value:new o.Vector2},uTexture0:{value:T},uTexture1:{value:T},padding:{value:ee.padding},uMap:{value:T},edgeIntensity:{value:ee.edgeIntensity},mapIntensity:{value:ee.mapIntensity},epicenter:{value:ee.epicenter},progress:{value:ee.progress},dirX:{value:(p=ee.dir)==null?void 0:p.x},dirY:{value:(g=ee.dir)==null?void 0:g.y}},vertexShader:Jn,fragmentShader:et},r),...I})},[r]),m=N(n,t);P(c)("uResolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},ee=Object.freeze({texture0:T,texture1:T,padding:0,map:T,mapIntensity:0,edgeIntensity:0,epicenter:new o.Vector2(0,0),progress:0,dir:new o.Vector2(0,0)}),tt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=nt({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,dpr:c.fbo,size:e,isSizeUpdate:r,...t}),[u,v]=L(ee),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{var R,j,D,q,H,re,oe,ae;const{gl:_}=y;x(h,C),s("uTexture0",u.texture0),s("uTexture1",u.texture1),s("progress",u.progress);const w=[((j=(R=u.texture0)==null?void 0:R.image)==null?void 0:j.width)||0,((q=(D=u.texture0)==null?void 0:D.image)==null?void 0:q.height)||0],V=[((re=(H=u.texture1)==null?void 0:H.image)==null?void 0:re.width)||0,((ae=(oe=u.texture1)==null?void 0:oe.image)==null?void 0:ae.height)||0],z=w.map((ie,G)=>ie+(V[G]-ie)*u.progress);return s("uTextureResolution",z),s("padding",u.padding),s("uMap",u.map),s("mapIntensity",u.mapIntensity),s("edgeIntensity",u.edgeIntensity),s("epicenter",u.epicenter),s("dirX",u.dir.x),s("dirY",u.dir.y),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var rt="#usf <planeVertex>",ot=`precision highp float;

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
}`;const at=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_texture:{value:T},u_brightness:{value:fe.brightness},u_min:{value:fe.min},u_max:{value:fe.max}},vertexShader:rt,fragmentShader:ot},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},fe=Object.freeze({texture:T,brightness:new o.Vector3(.5,.5,.5),min:0,max:1}),ut=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=at({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(fe),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("u_texture",u.texture),s("u_brightness",u.brightness),s("u_min",u.min),s("u_max",u.max),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var it="#usf <planeVertex>",st=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;const lt=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_texture:{value:T},uMap:{value:T},uMapIntensity:{value:Ce.mapIntensity}},vertexShader:it,fragmentShader:st},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},Ce=Object.freeze({texture:T,map:T,mapIntensity:.3}),ct=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=lt({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(Ce),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("u_texture",u.texture),s("uMap",u.map),s("uMapIntensity",u.mapIntensity),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var mt="#usf <planeVertex>",vt=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const ft=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uMap:{value:T}},vertexShader:mt,fragmentShader:vt},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},Ae=Object.freeze({texture:T,map:T}),pt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=ft({scene:m,size:e,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(Ae),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("uTexture",u.texture),s("uMap",u.map),M(_)},[s,M,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var dt="#usf <planeVertex>",gt=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_saturation;

#usf <rgb2hsv>

#usf <hsv2rgb>

void main() {
	vec4 tex = texture2D(u_texture, vUv);
	vec3 hsv = rgb2hsv(tex.rgb);
	hsv.y *= u_saturation;
	hsv.z *= u_brightness;
	vec3 final = hsv2rgb(hsv);
	gl_FragColor = vec4(final, tex.a);
}`;const ht=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_texture:{value:T},u_brightness:{value:Me.brightness},u_saturation:{value:Me.saturation}},vertexShader:dt,fragmentShader:gt},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},Me=Object.freeze({texture:T,brightness:1,saturation:1}),xt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=ht({scene:m,size:e,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(Me),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("u_texture",u.texture),s("u_brightness",u.brightness),s("u_saturation",u.saturation),M(_)},[s,M,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Mt="#usf <planeVertex>",yt=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;const bt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uResolution:{value:new o.Vector2},uTextureResolution:{value:new o.Vector2},uTexture:{value:T}},vertexShader:Mt,fragmentShader:yt},r),...I}),[r]),m=N(n,t);P(c)("uResolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},Fe=Object.freeze({texture:T}),St=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=bt({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,dpr:c.fbo,size:e,isSizeUpdate:r,...t}),[u,v]=L(Fe),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{var w,V,z,R,j,D;const{gl:_}=y;return x(h,C),s("uTexture",u.texture),s("uTextureResolution",[((z=(V=(w=u.texture)==null?void 0:w.source)==null?void 0:V.data)==null?void 0:z.width)||0,((D=(j=(R=u.texture)==null?void 0:R.source)==null?void 0:j.data)==null?void 0:D.height)||0]),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Ct="#usf <planeVertex>",_t=`precision highp float;

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
}`;const Tt=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uResolution:{value:new o.Vector2(0,0)},uBlurSize:{value:_e.blurSize}},vertexShader:Ct,fragmentShader:_t},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},_e=Object.freeze({texture:T,blurSize:3,blurPower:5}),wt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Tt({scene:m,onBeforeInit:l}),p=E(e),g=a.useMemo(()=>({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[m,p,e,c.fbo,r,t]),[M,u]=ne(g),[v,s]=L(_e),f=P(i),x=A(i),b=a.useCallback((h,C)=>{s(h),x(C)},[s,x]);return[a.useCallback((h,C,_)=>{var z,R,j,D,q,H;const{gl:w}=h;b(C,_),f("uTexture",v.texture),f("uResolution",[((j=(R=(z=v.texture)==null?void 0:z.source)==null?void 0:R.data)==null?void 0:j.width)||0,((H=(q=(D=v.texture)==null?void 0:D.source)==null?void 0:q.data)==null?void 0:H.height)||0]),f("uBlurSize",v.blurSize);let V=u(w);for(let re=0;re<v.blurPower;re++)f("uTexture",V),V=u(w);return V},[u,f,v,b]),b,{scene:m,mesh:d,material:i,camera:p,renderTarget:M,output:M.read.texture}]};var Dt="#usf <planeVertex>",Rt=`precision highp float;

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
}`;const Pt=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uBegin:{value:pe.begin},uEnd:{value:pe.end},uStrength:{value:pe.strength}},vertexShader:Dt,fragmentShader:Rt},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},pe=Object.freeze({texture:T,begin:new o.Vector2(0,0),end:new o.Vector2(0,0),strength:.9}),At=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Pt({scene:m,onBeforeInit:l}),p=E(e),g=a.useMemo(()=>({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[m,p,e,c.fbo,r,t]),[M,u]=ne(g),[v,s]=L(pe),f=P(i),x=A(i),b=a.useCallback((h,C)=>{s(h),x(C)},[s,x]);return[a.useCallback((h,C,_)=>{const{gl:w}=h;return b(C,_),f("uTexture",v.texture),f("uBegin",v.begin),f("uEnd",v.end),f("uStrength",v.strength),u(w,({read:V})=>{f("uBackbuffer",V)})},[u,f,b,v]),b,{scene:m,mesh:d,material:i,camera:p,renderTarget:M,output:M.read.texture}]};var Ft="#usf <planeVertex>",Vt=`precision highp float;

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
}`;const It=({scene:e,onBeforeInit:n})=>{const t=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uEpicenter:{value:le.epicenter},uProgress:{value:le.progress},uStrength:{value:le.strength},uWidth:{value:le.width},uMode:{value:0}},vertexShader:Ft,fragmentShader:Vt},n),...I}),[n]),l=B(e,t,r,o.Mesh);return{material:r,mesh:l}},le=Object.freeze({epicenter:new o.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),zt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=It({scene:m,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(le),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("uEpicenter",u.epicenter),s("uProgress",u.progress),s("uWidth",u.width),s("uStrength",u.strength),s("uMode",u.mode==="center"?0:u.mode==="horizontal"?1:2),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Ot="#usf <planeVertex>",Ut=`precision highp float;
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
}`;const Bt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{u_texture:{value:T},u_resolution:{value:new o.Vector2},u_keyColor:{value:X.color},u_similarity:{value:X.similarity},u_smoothness:{value:X.smoothness},u_spill:{value:X.spill},u_color:{value:X.color},u_contrast:{value:X.contrast},u_brightness:{value:X.brightness},u_gamma:{value:X.gamma}},vertexShader:Ot,fragmentShader:Ut},r),...I}),[r]),m=N(n,t);P(c)("u_resolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},X=Object.freeze({texture:T,keyColor:new o.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new o.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),Et=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Bt({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),[g,M]=k({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[u,v]=L(X),s=P(i),f=A(i),x=a.useCallback((y,h)=>{v(y),f(h)},[v,f]);return[a.useCallback((y,h,C)=>{const{gl:_}=y;return x(h,C),s("u_texture",u.texture),s("u_keyColor",u.keyColor),s("u_similarity",u.similarity),s("u_smoothness",u.smoothness),s("u_spill",u.spill),s("u_color",u.color),s("u_contrast",u.contrast),s("u_brightness",u.brightness),s("u_gamma",u.gamma),M(_)},[M,s,u,x]),x,{scene:m,mesh:d,material:i,camera:p,renderTarget:g,output:g.texture}]};var Lt=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,kt=`precision highp float;

varying vec2 vUv;
#usf <varyings>

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

#usf <uniforms>

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf <main>
	
	gl_FragColor = usf_FragColor;
}`;const $t=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uTime:{value:0},uPointer:{value:new o.Vector2},uResolution:{value:new o.Vector2}},vertexShader:Lt,fragmentShader:kt},r),...I}),[r]),m=N(n,t);P(c)("uResolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},Ve=Object.freeze({texture:T,beat:!1}),jt=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=$t({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),g=a.useMemo(()=>({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[m,p,e,c.fbo,r,t]),[M,u]=ne(g),[v,s]=L(Ve),f=P(i),x=A(i),b=a.useCallback((h,C)=>{s(h),x(C)},[s,x]);return[a.useCallback((h,C,_)=>{const{gl:w,clock:V,pointer:z}=h;return b(C,_),f("uPointer",z),f("uTexture",v.texture),f("uTime",v.beat||V.getElapsedTime()),u(w,({read:R})=>{f("uBackbuffer",R)})},[u,f,v,b]),b,{scene:m,mesh:d,material:i,camera:p,renderTarget:M,output:M.read.texture}]};var Wt=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,qt=`precision highp float;

varying vec2 vUv;
#usf <varyings>

uniform vec2 uResolution;

#usf <uniforms>

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf <main>
	
	gl_FragColor = usf_FragColor;
}`;const Nt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=a.useMemo(()=>new o.PlaneGeometry(2,2),[]),c=a.useMemo(()=>new o.ShaderMaterial({...F({uniforms:{uResolution:{value:new o.Vector2}},vertexShader:Wt,fragmentShader:qt},r),...I}),[r]),m=N(n,t);P(c)("uResolution",m.clone());const i=B(e,l,c,o.Mesh);return{material:c,mesh:i}},Gt=Object.freeze({}),Ht=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,onBeforeInit:l})=>{const c=O(n),m=a.useMemo(()=>new o.Scene,[]),{material:i,mesh:d}=Nt({scene:m,size:e,dpr:c.shader,onBeforeInit:l}),p=E(e),g=a.useMemo(()=>({scene:m,camera:p,size:e,dpr:c.fbo,isSizeUpdate:r,...t}),[m,p,e,c.fbo,r,t]),[M,u]=k(g),v=A(i),s=a.useCallback((x,b)=>{v(b)},[v]);return[a.useCallback((x,b,y)=>{const{gl:h}=x;return s(b,y),u(h)},[u,s]),s,{scene:m,mesh:d,material:i,camera:p,renderTarget:M,output:M.texture}]},Kt=({scene:e,geometry:n,material:t})=>{const r=B(e,n,t,o.Points),l=B(e,a.useMemo(()=>n.clone(),[n]),a.useMemo(()=>t.clone(),[t]),o.Mesh);return l.visible=!1,{points:r,interactiveMesh:l}};var Xt=`uniform vec2 uResolution;
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

#usf <wobble3D>

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
}`,Yt=`precision highp float;
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
}`;const Ie=(e,n,t,r,l)=>{var g;const c=t==="position"?"positionTarget":"uvTarget",m=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",i=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",d=t==="position"?"positionsList":"uvsList",p=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new o.BufferAttribute(e[0],l));let M="",u="";e.forEach((v,s)=>{n.setAttribute(`${c}${s}`,new o.BufferAttribute(v,l)),M+=`attribute vec${l} ${c}${s};
`,s===0?u+=`${c}${s}`:u+=`,${c}${s}`}),r=r.replace(`${m}`,M),r=r.replace(`${i}`,`vec${l} ${d}[${e.length}] = vec${l}[](${u});
				${p}
			`)}else r=r.replace(`${m}`,""),r=r.replace(`${i}`,""),(g=n==null?void 0:n.attributes[t])!=null&&g.array||we&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},ze=(e,n,t,r)=>{var c;let l=[];if(e&&e.length>0){(c=n==null?void 0:n.attributes[t])!=null&&c.array?l=[n.attributes[t].array,...e]:l=e;const m=Math.max(...l.map(i=>i.length));l.forEach((i,d)=>{if(i.length<m){const p=(m-i.length)/r,g=[],M=Array.from(i);for(let u=0;u<p;u++){const v=Math.floor(i.length/r*Math.random())*r;for(let s=0;s<r;s++)g.push(M[v+s])}l[d]=new Float32Array([...M,...g])}})}return l},Qt=(e,n)=>{let t="";const r={};let l="mapArrayColor = ";return e&&e.length>0?(e.forEach((m,i)=>{const d=`vMapArrayIndex < ${i}.1`,p=`texture2D(uMapArray${i}, uv)`;l+=`( ${d} ) ? ${p} : `,t+=`
        uniform sampler2D uMapArray${i};
      `,r[`uMapArray${i}`]={value:m}}),l+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(l+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",l).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},Zt=({size:e,dpr:n,geometry:t,positions:r,uvs:l,mapArray:c,onBeforeInit:m})=>{const i=a.useMemo(()=>ze(r,t,"position",3),[r,t]),d=a.useMemo(()=>ze(l,t,"uv",2),[l,t]),p=a.useMemo(()=>{i.length!==d.length&&we&&console.log("use-shader-fx:positions and uvs are not matched");const M=Ie(d,t,"uv",Ie(i,t,"position",Xt,3),2),{rewritedFragmentShader:u,mapArrayUniforms:v}=Qt(c,Yt);return new o.ShaderMaterial({...F({uniforms:{uResolution:{value:new o.Vector2(0,0)},uMorphProgress:{value:U.morphProgress},uBlurAlpha:{value:U.blurAlpha},uBlurRadius:{value:U.blurRadius},uPointSize:{value:U.pointSize},uPointAlpha:{value:U.pointAlpha},uPicture:{value:T},uIsPicture:{value:!1},uAlphaPicture:{value:T},uIsAlphaPicture:{value:!1},uColor0:{value:U.color0},uColor1:{value:U.color1},uColor2:{value:U.color2},uColor3:{value:U.color3},uMap:{value:T},uIsMap:{value:!1},uAlphaMap:{value:T},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:U.wobblePositionFrequency},uWobbleTimeFrequency:{value:U.wobbleTimeFrequency},uWobbleStrength:{value:U.wobbleStrength},uWarpPositionFrequency:{value:U.warpPositionFrequency},uWarpTimeFrequency:{value:U.warpTimeFrequency},uWarpStrength:{value:U.warpStrength},uDisplacement:{value:T},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:U.displacementIntensity},uDisplacementColorIntensity:{value:U.displacementColorIntensity},uSizeRandomIntensity:{value:U.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:U.sizeRandomTimeFrequency},uSizeRandomMin:{value:U.sizeRandomMin},uSizeRandomMax:{value:U.sizeRandomMax},uDivergence:{value:U.divergence},uDivergencePoint:{value:U.divergencePoint},...v},vertexShader:M,fragmentShader:u},m),...I,blending:o.AdditiveBlending,transparent:!0})},[t,i,d,c,m]),g=N(e,n);return P(p)("uResolution",g.clone()),{material:p,modifiedPositions:i,modifiedUvs:d}},Oe=({size:e,dpr:n,scene:t=!1,geometry:r,positions:l,uvs:c,mapArray:m,onBeforeInit:i})=>{const d=O(n),p=a.useMemo(()=>{const y=r||new o.SphereGeometry(1,32,32);return y.setIndex(null),y.deleteAttribute("normal"),y},[r]),{material:g,modifiedPositions:M,modifiedUvs:u}=Zt({size:e,dpr:d.shader,geometry:p,positions:l,uvs:c,mapArray:m,onBeforeInit:i}),{points:v,interactiveMesh:s}=Kt({scene:t,geometry:p,material:g}),f=P(g),x=A(g);return[a.useCallback((y,h,C)=>{y&&f("uTime",(h==null?void 0:h.beat)||y.clock.getElapsedTime()),h!==void 0&&(f("uMorphProgress",h.morphProgress),f("uBlurAlpha",h.blurAlpha),f("uBlurRadius",h.blurRadius),f("uPointSize",h.pointSize),f("uPointAlpha",h.pointAlpha),h.picture?(f("uPicture",h.picture),f("uIsPicture",!0)):h.picture===!1&&f("uIsPicture",!1),h.alphaPicture?(f("uAlphaPicture",h.alphaPicture),f("uIsAlphaPicture",!0)):h.alphaPicture===!1&&f("uIsAlphaPicture",!1),f("uColor0",h.color0),f("uColor1",h.color1),f("uColor2",h.color2),f("uColor3",h.color3),h.map?(f("uMap",h.map),f("uIsMap",!0)):h.map===!1&&f("uIsMap",!1),h.alphaMap?(f("uAlphaMap",h.alphaMap),f("uIsAlphaMap",!0)):h.alphaMap===!1&&f("uIsAlphaMap",!1),f("uWobbleStrength",h.wobbleStrength),f("uWobblePositionFrequency",h.wobblePositionFrequency),f("uWobbleTimeFrequency",h.wobbleTimeFrequency),f("uWarpStrength",h.warpStrength),f("uWarpPositionFrequency",h.warpPositionFrequency),f("uWarpTimeFrequency",h.warpTimeFrequency),h.displacement?(f("uDisplacement",h.displacement),f("uIsDisplacement",!0)):h.displacement===!1&&f("uIsDisplacement",!1),f("uDisplacementIntensity",h.displacementIntensity),f("uDisplacementColorIntensity",h.displacementColorIntensity),f("uSizeRandomIntensity",h.sizeRandomIntensity),f("uSizeRandomTimeFrequency",h.sizeRandomTimeFrequency),f("uSizeRandomMin",h.sizeRandomMin),f("uSizeRandomMax",h.sizeRandomMax),f("uDivergence",h.divergence),f("uDivergencePoint",h.divergencePoint),x(C))},[f,x]),{points:v,interactiveMesh:s,positions:M,uvs:u}]},U=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new o.Color(16711680),color1:new o.Color(65280),color2:new o.Color(255),color3:new o.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new o.Vector3(0),beat:!1}),Jt=({size:e,dpr:n,isSizeUpdate:t,renderTargetOptions:r,camera:l,geometry:c,positions:m,uvs:i,onBeforeInit:d})=>{const p=O(n),g=a.useMemo(()=>new o.Scene,[]),[M,{points:u,interactiveMesh:v,positions:s,uvs:f}]=Oe({scene:g,size:e,dpr:n,geometry:c,positions:m,uvs:i,onBeforeInit:d}),[x,b]=k({scene:g,camera:l,size:e,dpr:p.fbo,isSizeUpdate:t,depthBuffer:!0,...r}),y=a.useCallback((C,_,w)=>(M(C,_,w),b(C.gl)),[b,M]),h=a.useCallback((C,_)=>{M(null,C,_)},[M]);return[y,h,{scene:g,points:u,interactiveMesh:v,renderTarget:x,output:x.texture,positions:s,uvs:f}]},Ue=e=>{const n=e.shaderType==="MeshDepthMaterial";e.vertexShader=e.vertexShader.replace("#include <beginnormal_vertex>",`
			vec3 objectNormal = usf_Normal;
			#ifdef USE_TANGENT
			vec3 objectTangent = vec3( tangent.xyz );
			#endif
		`),e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`
			vec3 transformed = usf_Position;
			#ifdef USE_ALPHAHASH
			vPosition = vec3( position );
			#endif
		`),e.vertexShader=e.vertexShader.replace("void main() {",`
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;

		${n?"attribute vec4 tangent;":""}
		
		varying float vWobble;
		varying vec2 vPosition;
		
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;

		#usf <wobble3D>

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
		`)},er=e=>{e.fragmentShader=e.fragmentShader.replace("#include <color_fragment>",`
			#include <color_fragment>

			if (uEdgeThreshold > 0.0) {
				float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
				diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
			} else {
				diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
			}
		`),e.fragmentShader=e.fragmentShader.replace("void main() {",`
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
			
			#usf <snoise>

			varying float vWobble;
			varying vec2 vPosition;
			varying vec3 vEdgeNormal;
			varying vec3 vEdgeViewPosition;
			
			void main(){
				
				vec4 usf_DiffuseColor = vec4(1.0);
				float colorWobbleMix = smoothstep(-1.,1.,vWobble);
				vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
			
				usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);
		`)};var nr=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,tr=`#ifdef USE_TRANSMISSION

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

#endif`;const rr=({mat:e,isCustomTransmission:n,parameters:t})=>{e.type==="MeshPhysicalMaterial"&&n&&(t.fragmentShader=t.fragmentShader.replace("#include <transmission_pars_fragment>",`${nr}`),t.fragmentShader=t.fragmentShader.replace("#include <transmission_fragment>",`${tr}`)),e.normalMap||(t.vertexShader=t.vertexShader.replace("void main() {",`
				attribute vec4 tangent;
				
				void main() {
			`))},or=({baseMaterial:e,materialParameters:n,isCustomTransmission:t=!1,onBeforeInit:r,depthOnBeforeInit:l,depth:c=!1})=>{const{material:m,depthMaterial:i}=a.useMemo(()=>{const d=new(e||o.MeshPhysicalMaterial)(n||{});Object.assign(d.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:$.wobblePositionFrequency},uWobbleTimeFrequency:{value:$.wobbleTimeFrequency},uWobbleStrength:{value:$.wobbleStrength},uWarpPositionFrequency:{value:$.warpPositionFrequency},uWarpTimeFrequency:{value:$.warpTimeFrequency},uWarpStrength:{value:$.warpStrength},uColor0:{value:$.color0},uColor1:{value:$.color1},uColor2:{value:$.color2},uColor3:{value:$.color3},uColorMix:{value:$.colorMix},uEdgeThreshold:{value:$.edgeThreshold},uEdgeColor:{value:$.edgeColor},uChromaticAberration:{value:$.chromaticAberration},uAnisotropicBlur:{value:$.anisotropicBlur},uDistortion:{value:$.distortion},uDistortionScale:{value:$.distortionScale},uTemporalDistortion:{value:$.temporalDistortion},uRefractionSamples:{value:$.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),d.onBeforeCompile=g=>{Ue(g),er(g),rr({parameters:g,mat:d,isCustomTransmission:t});const M=F({fragmentShader:g.fragmentShader,vertexShader:g.vertexShader,uniforms:d.userData.uniforms},r);g.fragmentShader=M.fragmentShader,g.vertexShader=M.vertexShader,Object.assign(g.uniforms,M.uniforms)},d.needsUpdate=!0;let p=null;return c&&(p=new o.MeshDepthMaterial({depthPacking:o.RGBADepthPacking}),p.onBeforeCompile=g=>{Object.assign(g.uniforms,d.userData.uniforms),Ue(g),F(g,l)},p.needsUpdate=!0),{material:d,depthMaterial:p}},[n,e,r,l,t,c]);return a.useEffect(()=>()=>{i&&i.dispose()},[i]),{material:m,depthMaterial:i}},Be=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:l,depth:c,onBeforeInit:m,depthOnBeforeInit:i})=>{const d=a.useMemo(()=>{let x=n||new o.IcosahedronGeometry(2,20);return x=$e.mergeVertices(x),x.computeTangents(),x},[n]),{material:p,depthMaterial:g}=or({baseMaterial:r,materialParameters:l,isCustomTransmission:t,onBeforeInit:m,depthOnBeforeInit:i,depth:c}),M=B(e,d,p,o.Mesh),u=p.userData,v=P(u),s=A(u);return[a.useCallback((x,b,y)=>{x&&v("uTime",(b==null?void 0:b.beat)||x.clock.getElapsedTime()),b!==void 0&&(v("uWobbleStrength",b.wobbleStrength),v("uWobblePositionFrequency",b.wobblePositionFrequency),v("uWobbleTimeFrequency",b.wobbleTimeFrequency),v("uWarpStrength",b.warpStrength),v("uWarpPositionFrequency",b.warpPositionFrequency),v("uWarpTimeFrequency",b.warpTimeFrequency),v("uColor0",b.color0),v("uColor1",b.color1),v("uColor2",b.color2),v("uColor3",b.color3),v("uColorMix",b.colorMix),v("uEdgeThreshold",b.edgeThreshold),v("uEdgeColor",b.edgeColor),v("uChromaticAberration",b.chromaticAberration),v("uAnisotropicBlur",b.anisotropicBlur),v("uDistortion",b.distortion),v("uDistortionScale",b.distortionScale),v("uRefractionSamples",b.refractionSamples),v("uTemporalDistortion",b.temporalDistortion),s(y))},[v,s]),{mesh:M,depthMaterial:g}]},$=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new o.Color(16711680),color1:new o.Color(65280),color2:new o.Color(255),color3:new o.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new o.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),ar=({size:e,dpr:n,renderTargetOptions:t,isSizeUpdate:r,camera:l,geometry:c,baseMaterial:m,materialParameters:i,isCustomTransmission:d,onBeforeInit:p,depthOnBeforeInit:g,depth:M})=>{const u=O(n),v=a.useMemo(()=>new o.Scene,[]),[s,{mesh:f,depthMaterial:x}]=Be({baseMaterial:m,materialParameters:i,scene:v,geometry:c,isCustomTransmission:d,onBeforeInit:p,depthOnBeforeInit:g,depth:M}),[b,y]=k({scene:v,camera:l,size:e,dpr:u.fbo,isSizeUpdate:r,depthBuffer:!0,...t}),h=a.useCallback((_,w,V)=>(s(_,w,V),y(_.gl)),[y,s]),C=a.useCallback((_,w)=>{s(null,_,w)},[s]);return[h,C,{scene:v,mesh:f,depthMaterial:x,renderTarget:b,output:b.texture}]},ur=(e,n,t)=>{const r=a.useMemo(()=>{const l=new o.Mesh(n,t);return e.add(l),l},[n,t,e]);return a.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},ir=(e,n,t,r,l,c)=>{const m=e<t-l||n<r-l,i=e>t+l||n>r+l;return c==="smaller"&&m||c==="larger"&&i||c==="both"&&(m||i)},sr=({size:e,boundFor:n,threshold:t})=>{const r=a.useRef(e);return a.useMemo(()=>{const{width:c,height:m}=e,{width:i,height:d}=r.current,p=ir(c,m,i,d,t,n);return p&&(r.current=e),p},[e,n,t])},de=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-de.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-de.easeOutBounce(1-2*e))/2:(1+de.easeOutBounce(2*e-1))/2}});function lr(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const cr=(e,n="easeOutQuart")=>{const t=e/60,r=de[n];return a.useCallback(c=>{let m=c.getElapsedTime()*t;const i=Math.floor(m),d=r(m-i);m=d+i;const p=lr(i);return{beat:m,floor:i,fract:d,hash:p}},[t,r])},mr=(e=60)=>{const n=a.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=a.useRef(null);return a.useCallback(l=>{const c=l.getElapsedTime();return t.current===null||c-t.current>=n?(t.current=c,!0):!1},[n])},vr=e=>{var r,l;const n=(r=e.dom)==null?void 0:r.length,t=(l=e.texture)==null?void 0:l.length;return!n||!t||n!==t};var fr=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,pr=`precision highp float;

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
}`;const dr=({params:e,scene:n,onBeforeInit:t})=>{n.children.length>0&&(n.children.forEach(r=>{r instanceof o.Mesh&&(r.geometry.dispose(),r.material.dispose())}),n.remove(...n.children)),e.texture.forEach((r,l)=>{const c=new o.ShaderMaterial({...F({uniforms:{u_texture:{value:r},u_textureResolution:{value:new o.Vector2(0,0)},u_resolution:{value:new o.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[l]?e.boderRadius[l]:0}},vertexShader:fr,fragmentShader:pr},t),...I,transparent:!0}),m=new o.Mesh(new o.PlaneGeometry(1,1),c);n.add(m)})},gr=()=>{const e=a.useRef([]),n=a.useRef([]);return a.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:l,params:c})=>{e.current.length>0&&e.current.forEach((i,d)=>{i.unobserve(n.current[d])}),n.current=[],e.current=[];const m=new Array(c.dom.length).fill(!1);r.current=[...m],l.current=[...m],c.dom.forEach((i,d)=>{const p=M=>{M.forEach(u=>{c.onIntersect[d]&&c.onIntersect[d](u),r.current[d]=u.isIntersecting})},g=new IntersectionObserver(p,{rootMargin:"0px",threshold:0});g.observe(i),e.current.push(g),n.current.push(i)})},[])},hr=()=>{const e=a.useRef([]),n=a.useCallback(({params:t,customParams:r,size:l,resolutionRef:c,scene:m,isIntersectingRef:i})=>{m.children.length!==e.current.length&&(e.current=new Array(m.children.length)),m.children.forEach((d,p)=>{var u,v,s,f,x,b;const g=t.dom[p];if(!g)return;const M=g.getBoundingClientRect();if(e.current[p]=M,d.scale.set(M.width,M.height,1),d.position.set(M.left+M.width*.5-l.width*.5,-M.top-M.height*.5+l.height*.5,0),i.current[p]&&(t.rotation[p]&&d.rotation.copy(t.rotation[p]),d instanceof o.Mesh)){const y=d.material,h=P(y),C=A(y);h("u_texture",t.texture[p]),h("u_textureResolution",[((s=(v=(u=t.texture[p])==null?void 0:u.source)==null?void 0:v.data)==null?void 0:s.width)||0,((b=(x=(f=t.texture[p])==null?void 0:f.source)==null?void 0:x.data)==null?void 0:b.height)||0]),h("u_resolution",c.current.set(M.width,M.height)),h("u_borderRadius",t.boderRadius[p]?t.boderRadius[p]:0),C(r)}})},[]);return[e.current,n]},xr=()=>{const e=a.useRef([]),n=a.useRef([]),t=a.useCallback((r,l=!1)=>{e.current.forEach((m,i)=>{m&&(n.current[i]=!0)});const c=l?[...n.current]:[...e.current];return r<0?c:c[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},Mr=e=>({onView:t,onHidden:r})=>{const l=a.useRef(!1);a.useEffect(()=>{let c;const m=()=>{e.current.some(i=>i)?l.current||(t&&t(),l.current=!0):l.current&&(r&&r(),l.current=!1),c=requestAnimationFrame(m)};return c=requestAnimationFrame(m),()=>{cancelAnimationFrame(c)}},[t,r])},Ee={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},yr=({size:e,dpr:n,isSizeUpdate:t,renderTargetOptions:r,onBeforeInit:l},c=[])=>{const m=O(n),i=a.useMemo(()=>new o.Scene,[]),d=E(e),[p,g]=k({scene:i,camera:d,size:e,dpr:m.fbo,isSizeUpdate:t,...r}),[M,u]=L({...Ee,updateKey:performance.now()}),[v,s]=hr(),f=a.useRef(new o.Vector2(0,0)),[x,b]=a.useState(!0);a.useMemo(()=>b(!0),c);const y=a.useRef(null),h=a.useMemo(()=>T,[]),C=gr(),{isIntersectingOnceRef:_,isIntersectingRef:w,isIntersecting:V}=xr(),z=Mr(w),R=a.useMemo(()=>(D,q)=>{u(D),s({params:M,customParams:q,size:e,resolutionRef:f,scene:i,isIntersectingRef:w})},[w,u,s,e,i,M]);return[a.useCallback((D,q,H)=>{const{gl:re,size:oe}=D;if(R(q,H),vr(M))return h;if(x){if(y.current===M.updateKey)return h;y.current=M.updateKey}return x&&(dr({params:M,size:oe,scene:i,onBeforeInit:l}),C({isIntersectingRef:w,isIntersectingOnceRef:_,params:M}),b(!1)),g(re)},[g,C,l,R,x,i,M,_,w,h]),R,{scene:i,camera:d,renderTarget:p,output:p.texture,isIntersecting:V,DOMRects:v,intersections:w.current,useDomView:z}]},br=(e,n)=>{const{scene:t,camera:r,size:l,dpr:c=!1,isSizeUpdate:m=!1,depth:i=!1,...d}=e,p=a.useRef([]),g=N(l,c);p.current=a.useMemo(()=>Array.from({length:n},()=>{const u=new o.WebGLRenderTarget(g.x,g.y,{...ve,...d});return i&&(u.depthTexture=new o.DepthTexture(g.x,g.y,o.FloatType)),u}),[n]),m&&p.current.forEach(u=>u.setSize(g.x,g.y)),a.useEffect(()=>{const u=p.current;return()=>{u.forEach(v=>v.dispose())}},[n]);const M=a.useCallback((u,v,s)=>{const f=p.current[v];return he({gl:u,scene:t,camera:r,fbo:f,onBeforeRender:()=>s&&s({read:f.texture})}),f.texture},[t,r]);return[p.current,M]},Sr=Object.freeze({interpolate(e,n,t,r=1e-6){const l=e+(n-e)*t;return Math.abs(l)<r?0:l},smoothstep(e,n,t){const r=Math.min(Math.max((t-e)/(n-e),0),1);return r*r*(3-2*r)}});S.ALPHABLENDING_PARAMS=Ae,S.BLANK_PARAMS=Ve,S.BLENDING_PARAMS=se,S.BRIGHTNESSPICKER_PARAMS=fe,S.BRUSH_PARAMS=Y,S.CHROMAKEY_PARAMS=X,S.COLORSTRATA_PARAMS=K,S.COSPALETTE_PARAMS=ue,S.COVERTEXTURE_PARAMS=Fe,S.DELTA_TIME=Se,S.DOMSYNCER_PARAMS=Ee,S.DUOTONE_PARAMS=xe,S.Easing=de,S.FBO_DEFAULT_OPTION=ve,S.FLUID_PARAMS=Re,S.FXBLENDING_PARAMS=Ce,S.FXTEXTURE_PARAMS=ee,S.HSV_PARAMS=Me,S.MARBLE_PARAMS=te,S.MORPHPARTICLES_PARAMS=U,S.MOTIONBLUR_PARAMS=pe,S.NOISE_PARAMS=J,S.RAWBLANK_PARAMS=Gt,S.RIPPLE_PARAMS=Pe,S.SIMPLEBLUR_PARAMS=_e,S.ShaderChunk=De,S.Utils=Sr,S.WAVE_PARAMS=le,S.WOBBLE3D_PARAMS=$,S.renderFBO=he,S.setCustomUniform=A,S.setUniform=P,S.useAddMesh=ur,S.useAlphaBlending=pt,S.useBeat=cr,S.useBlank=jt,S.useBlending=Zn,S.useBrightnessPicker=ut,S.useBrush=rn,S.useCamera=E,S.useChromaKey=Et,S.useColorStrata=Un,S.useCopyTexture=br,S.useCosPalette=qn,S.useCoverTexture=St,S.useCreateMorphParticles=Oe,S.useCreateWobble3D=Be,S.useDomSyncer=yr,S.useDoubleFBO=ne,S.useDuoTone=Kn,S.useFPSLimiter=mr,S.useFluid=_n,S.useFxBlending=ct,S.useFxTexture=tt,S.useHSV=xt,S.useMarble=kn,S.useMorphParticles=Jt,S.useMotionBlur=At,S.useNoise=Vn,S.useParams=L,S.usePointer=ge,S.useRawBlank=Ht,S.useResizeBoundary=sr,S.useResolution=N,S.useRipple=Rn,S.useSimpleBlur=wt,S.useSingleFBO=k,S.useWave=zt,S.useWobble3D=ar,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
