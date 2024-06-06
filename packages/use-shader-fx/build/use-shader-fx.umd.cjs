(function(S,ve){typeof exports=="object"&&typeof module<"u"?ve(exports,require("three"),require("react"),require("three-stdlib")):typeof define=="function"&&define.amd?define(["exports","three","react","three-stdlib"],ve):(S=typeof globalThis<"u"?globalThis:S||self,ve(S["use-shader-fx"]={},S.THREE,S.React,S.THREEStdlib))})(this,function(S,ve,i,qe){"use strict";function We(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const a=We(ve);var Ne="#usf <planeVertex>",Ge=`precision highp float;

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
}`;const G=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return i.useMemo(()=>new a.Vector2(t,r),[t,r])},P=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},L=(e,n,t,r)=>{const s=i.useMemo(()=>{const m=new r(n,t);return e&&e.add(m),m},[n,t,r,e]);return i.useEffect(()=>()=>{e&&e.remove(s),n.dispose(),t.dispose()},[e,n,t,s]),s},De=process.env.NODE_ENV==="development",I={transparent:!1,depthTest:!1,depthWrite:!1},_=new a.DataTexture(new Uint8Array([0,0,0,0]),1,1,a.RGBAFormat);var Ke=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`,He=`vec3 random3(vec3 c) {
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
}`,Xe=`float screenAspect = uResolution.x / uResolution.y;
float textureAspect = uTextureResolution.x / uTextureResolution.y;
vec2 aspectRatio = vec2(
	min(screenAspect / textureAspect, 1.0),
	min(textureAspect / screenAspect, 1.0)
);
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`,Ye=`vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`,Qe=`precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ze=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,Je=`vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`,en=`vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}`;const Re=Object.freeze({wobble3D:Ke,snoise:He,coverTexture:Xe,fxBlending:Ye,planeVertex:Qe,defaultVertex:Ze,hsv2rgb:Je,rgb2hsv:en}),nn=/^[ \t]*#usf +<([\w\d./]+)>/gm;function tn(e,n){return Se(Re[n]||"")}function Se(e){return e.replace(nn,tn)}const F=(e,n)=>(n&&n(e),e.vertexShader=Se(e.vertexShader),e.fragmentShader=Se(e.fragmentShader),e),rn=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uBuffer:{value:_},uResolution:{value:new a.Vector2(0,0)},uTexture:{value:_},uIsTexture:{value:!1},uMap:{value:_},uIsMap:{value:!1},uMapIntensity:{value:Q.mapIntensity},uRadius:{value:Q.radius},uSmudge:{value:Q.smudge},uDissipation:{value:Q.dissipation},uMotionBlur:{value:Q.motionBlur},uMotionSample:{value:Q.motionSample},uMouse:{value:new a.Vector2(-10,-10)},uPrevMouse:{value:new a.Vector2(-10,-10)},uVelocity:{value:new a.Vector2(0,0)},uColor:{value:Q.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:Ne,fragmentShader:Ge},r),...I,transparent:!0}),[r]),f=G(n,t);P(m)("uResolution",f.clone());const c=L(e,s,m,a.Mesh);return{material:m,mesh:c}},on=(e,n)=>{const t=n,r=e/n,[s,m]=[t*r/2,t/2];return{width:s,height:m,near:-1e3,far:1e3}},k=(e,n="OrthographicCamera")=>{const t=G(e),{width:r,height:s,near:m,far:f}=on(t.x,t.y);return i.useMemo(()=>n==="OrthographicCamera"?new a.OrthographicCamera(-r,r,s,-s,m,f):new a.PerspectiveCamera(50,r/s),[r,s,m,f,n])},he=(e=0)=>{const n=i.useRef(new a.Vector2(0,0)),t=i.useRef(new a.Vector2(0,0)),r=i.useRef(new a.Vector2(0,0)),s=i.useRef(0),m=i.useRef(new a.Vector2(0,0)),f=i.useRef(!1);return i.useCallback(u=>{const p=performance.now();let h;f.current&&e?(r.current=r.current.lerp(u,1-e),h=r.current.clone()):(h=u.clone(),r.current=h),s.current===0&&(s.current=p,n.current=h);const M=Math.max(1,p-s.current);s.current=p,m.current.copy(h).sub(n.current).divideScalar(M);const v=m.current.length()>0,l=f.current?n.current.clone():h;return!f.current&&v&&(f.current=!0),n.current=h,{currentPointer:h,prevPointer:l,diffPointer:t.current.subVectors(h,l),velocity:m.current,isVelocityUpdate:v}},[e])},$=e=>{const n=s=>Object.values(s).some(m=>typeof m=="function"),t=i.useRef(n(e)?e:structuredClone(e)),r=i.useCallback(s=>{if(s!==void 0)for(const m in s){const f=m;f in t.current&&s[f]!==void 0&&s[f]!==null?t.current[f]=s[f]:console.error(`"${String(f)}" does not exist in the params. or "${String(f)}" is null | undefined`)}},[]);return[t.current,r]},pe={depthBuffer:!1},xe=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:s,onSwap:m})=>{e.setRenderTarget(n),s(),e.clear(),e.render(t,r),m&&m(),e.setRenderTarget(null),e.clear()},j=e=>{var M;const{scene:n,camera:t,size:r,dpr:s=!1,isSizeUpdate:m=!1,depth:f=!1,...c}=e,u=i.useRef(),p=G(r,s);u.current=i.useMemo(()=>{const v=new a.WebGLRenderTarget(p.x,p.y,{...pe,...c});return f&&(v.depthTexture=new a.DepthTexture(p.x,p.y,a.FloatType)),v},[]),m&&((M=u.current)==null||M.setSize(p.x,p.y)),i.useEffect(()=>{const v=u.current;return()=>{v==null||v.dispose()}},[]);const h=i.useCallback((v,l)=>{const d=u.current;return xe({gl:v,fbo:d,scene:n,camera:t,onBeforeRender:()=>l&&l({read:d.texture})}),d.texture},[n,t]);return[u.current,h]},te=e=>{var M,v;const{scene:n,camera:t,size:r,dpr:s=!1,isSizeUpdate:m=!1,depth:f=!1,...c}=e,u=G(r,s),p=i.useMemo(()=>{const l=new a.WebGLRenderTarget(u.x,u.y,{...pe,...c}),d=new a.WebGLRenderTarget(u.x,u.y,{...pe,...c});return f&&(l.depthTexture=new a.DepthTexture(u.x,u.y,a.FloatType),d.depthTexture=new a.DepthTexture(u.x,u.y,a.FloatType)),{read:l,write:d,swap:function(){let o=this.read;this.read=this.write,this.write=o}}},[]);m&&((M=p.read)==null||M.setSize(u.x,u.y),(v=p.write)==null||v.setSize(u.x,u.y)),i.useEffect(()=>{const l=p;return()=>{var d,o;(d=l.read)==null||d.dispose(),(o=l.write)==null||o.dispose()}},[p]);const h=i.useCallback((l,d)=>{var x;const o=p;return xe({gl:l,scene:n,camera:t,fbo:o.write,onBeforeRender:()=>d&&d({read:o.read.texture,write:o.write.texture}),onSwap:()=>o.swap()}),(x=o.read)==null?void 0:x.texture},[n,t,p]);return[{read:p.read,write:p.write},h]},U=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Q=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new a.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),an=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=rn({scene:c,size:e,dpr:f.shader,onBeforeInit:m}),h=k(e),M=he(),[v,l]=te({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[d,o]=$(Q),x=i.useRef(null),y=P(u),w=V(u),g=i.useCallback((C,T)=>{o(C),w(T)},[o,w]);return[i.useCallback((C,T,D)=>{const{gl:z,pointer:O}=C;g(T,D),d.texture?(y("uIsTexture",!0),y("uTexture",d.texture)):y("uIsTexture",!1),d.map?(y("uIsMap",!0),y("uMap",d.map),y("uMapIntensity",d.mapIntensity)):y("uIsMap",!1),y("uRadius",d.radius),y("uSmudge",d.smudge),y("uDissipation",d.dissipation),y("uMotionBlur",d.motionBlur),y("uMotionSample",d.motionSample);const A=d.pointerValues||M(O);A.isVelocityUpdate&&(y("uMouse",A.currentPointer),y("uPrevMouse",A.prevPointer)),y("uVelocity",A.velocity);const B=typeof d.color=="function"?d.color(A.velocity):d.color;return y("uColor",B),y("uIsCursor",d.isCursor),y("uPressureEnd",d.pressure),x.current===null&&(x.current=d.pressure),y("uPressureStart",x.current),x.current=d.pressure,l(z,({read:R})=>{y("uBuffer",R)})},[y,M,l,d,g]),g,{scene:c,mesh:p,material:u,camera:h,renderTarget:v,output:v.read.texture}]};var Z=`varying vec2 vUv;
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
}`,un=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const sn=()=>i.useMemo(()=>new a.ShaderMaterial({vertexShader:Z,fragmentShader:un,...I}),[]);var ln=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const cn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:_},uSource:{value:_},texelSize:{value:new a.Vector2},dt:{value:Ce},dissipation:{value:0}},vertexShader:Z,fragmentShader:ln},e),...I}),[e]);var mn=`precision highp float;

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
}`;const vn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:mn},e),...I}),[e]);var pn=`precision highp float;

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
}`;const fn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:pn},e),...I}),[e]);var dn=`precision highp float;

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
}`;const gn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:dn},e),...I}),[e]);var hn=`precision highp float;

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
}`;const xn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Ce},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:hn},e),...I}),[e]);var Mn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const yn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},value:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:Mn},e),...I}),[e]);var bn=`precision highp float;

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
}`;const Sn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uPressure:{value:_},uVelocity:{value:_},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:bn},e),...I}),[e]);var Cn=`precision highp float;

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
}`;const _n=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTarget:{value:_},aspectRatio:{value:0},color:{value:new a.Vector3},point:{value:new a.Vector2},radius:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:Cn},e),...I}),[e]),J=(e,n)=>e(n??{}),Tn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),{curl:m,vorticity:f,advection:c,divergence:u,pressure:p,clear:h,gradientSubtract:M,splat:v}=r??{},l=J(sn),d=l.clone(),o=J(gn,m),x=J(xn,f),y=J(cn,c),w=J(vn,u),g=J(fn,p),b=J(yn,h),C=J(Sn,M),T=J(_n,v),D=i.useMemo(()=>({vorticityMaterial:x,curlMaterial:o,advectionMaterial:y,divergenceMaterial:w,pressureMaterial:g,clearMaterial:b,gradientSubtractMaterial:C,splatMaterial:T}),[x,o,y,w,g,b,C,T]),z=G(n,t);i.useMemo(()=>{P(D.splatMaterial)("aspectRatio",z.x/z.y);for(const B of Object.values(D))P(B)("texelSize",new a.Vector2(1/z.x,1/z.y))},[z,D]);const O=L(e,s,l,a.Mesh);i.useMemo(()=>{l.dispose(),O.material=d},[l,O,d]),i.useEffect(()=>()=>{for(const B of Object.values(D))B.dispose()},[D]);const A=i.useCallback(B=>{O.material=B,O.material.needsUpdate=!0},[O]);return{materials:D,setMeshMaterial:A,mesh:O}},Ce=.016,Pe=Object.freeze({densityDissipation:.98,velocityDissipation:.99,velocityAcceleration:10,pressureDissipation:.9,pressureIterations:20,curlStrength:35,splatRadius:.002,fluidColor:new a.Vector3(1,1,1),pointerValues:!1}),wn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,customFluidProps:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{materials:u,setMeshMaterial:p,mesh:h}=Tn({scene:c,size:e,dpr:f.shader,customFluidProps:m}),M=k(e),v=he(),l=i.useMemo(()=>({scene:c,camera:M,dpr:f.fbo,size:e,samples:t,isSizeUpdate:s,type:a.HalfFloatType,...r}),[c,M,e,t,f.fbo,s,r]),[d,o]=te(l),[x,y]=te(l),[w,g]=j(l),[b,C]=j(l),[T,D]=te(l),z=i.useRef(new a.Vector2(0,0)),O=i.useRef(new a.Vector3(0,0,0)),[A,B]=$(Pe),R=i.useMemo(()=>({advection:P(u.advectionMaterial),splat:P(u.splatMaterial),curl:P(u.curlMaterial),vorticity:P(u.vorticityMaterial),divergence:P(u.divergenceMaterial),clear:P(u.clearMaterial),pressure:P(u.pressureMaterial),gradientSubtract:P(u.gradientSubtractMaterial)}),[u]),N=i.useMemo(()=>({advection:V(u.advectionMaterial),splat:V(u.splatMaterial),curl:V(u.curlMaterial),vorticity:V(u.vorticityMaterial),divergence:V(u.divergenceMaterial),clear:V(u.clearMaterial),pressure:V(u.pressureMaterial),gradientSubtract:V(u.gradientSubtractMaterial)}),[u]),H=i.useCallback((ae,ue)=>{B(ae),ue&&Object.keys(ue).forEach(se=>{N[se](ue[se])})},[B,N]);return[i.useCallback((ae,ue,se)=>{const{gl:K,pointer:Mr,size:$e}=ae;H(ue,se);const we=o(K,({read:W})=>{p(u.advectionMaterial),R.advection("uVelocity",W),R.advection("uSource",W),R.advection("dissipation",A.velocityDissipation)}),yr=y(K,({read:W})=>{p(u.advectionMaterial),R.advection("uVelocity",we),R.advection("uSource",W),R.advection("dissipation",A.densityDissipation)}),be=A.pointerValues||v(Mr);be.isVelocityUpdate&&(o(K,({read:W})=>{p(u.splatMaterial),R.splat("uTarget",W),R.splat("point",be.currentPointer);const me=be.diffPointer.multiply(z.current.set($e.width,$e.height).multiplyScalar(A.velocityAcceleration));R.splat("color",O.current.set(me.x,me.y,1)),R.splat("radius",A.splatRadius)}),y(K,({read:W})=>{p(u.splatMaterial),R.splat("uTarget",W);const me=typeof A.fluidColor=="function"?A.fluidColor(be.velocity):A.fluidColor;R.splat("color",me)}));const br=g(K,()=>{p(u.curlMaterial),R.curl("uVelocity",we)});o(K,({read:W})=>{p(u.vorticityMaterial),R.vorticity("uVelocity",W),R.vorticity("uCurl",br),R.vorticity("curl",A.curlStrength)});const Sr=C(K,()=>{p(u.divergenceMaterial),R.divergence("uVelocity",we)});D(K,({read:W})=>{p(u.clearMaterial),R.clear("uTexture",W),R.clear("value",A.pressureDissipation)}),p(u.pressureMaterial),R.pressure("uDivergence",Sr);let je;for(let W=0;W<A.pressureIterations;W++)je=D(K,({read:me})=>{R.pressure("uPressure",me)});return o(K,({read:W})=>{p(u.gradientSubtractMaterial),R.gradientSubtract("uPressure",je),R.gradientSubtract("uVelocity",W)}),yr},[u,R,p,g,y,C,v,D,o,A,H]),H,{scene:c,mesh:h,materials:u,camera:M,renderTarget:{velocity:d,density:x,curl:w,divergence:b,pressure:T},output:x.read.texture}]};var Dn="#usf <defaultVertex>",Rn=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const Pn=({scale:e,max:n,texture:t,scene:r,onBeforeInit:s})=>{const m=i.useMemo(()=>new a.PlaneGeometry(e,e),[e]),f=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uOpacity:{value:0},uMap:{value:t||_}},vertexShader:Dn,fragmentShader:Rn},s),blending:a.AdditiveBlending,...I,transparent:!0}),[t,s]),c=i.useMemo(()=>{const u=[];for(let p=0;p<n;p++){const h=f.clone(),M=new a.Mesh(m.clone(),h);M.rotateZ(2*Math.PI*Math.random()),M.visible=!1,r.add(M),u.push(M)}return u},[m,f,r,n]);return i.useEffect(()=>()=>{c.forEach(u=>{u.geometry.dispose(),Array.isArray(u.material)?u.material.forEach(p=>p.dispose()):u.material.dispose(),r.remove(u)})},[r,c]),c},Ae=Object.freeze({frequency:.01,rotation:.05,fadeoutSpeed:.9,scale:.3,alpha:.6,pointerValues:!1}),An=({texture:e,scale:n=64,max:t=100,size:r,dpr:s,renderTargetOptions:m,samples:f,isSizeUpdate:c,onBeforeInit:u})=>{const p=U(s),h=i.useMemo(()=>new a.Scene,[]),M=Pn({scale:n,max:t,texture:e,scene:h,onBeforeInit:u}),v=k(r),l=he(),[d,o]=j({scene:h,camera:v,size:r,dpr:p.fbo,samples:f,isSizeUpdate:c,...m}),[x,y]=$(Ae),w=i.useRef(0),g=i.useMemo(()=>(C,T)=>{y(C),M.forEach(D=>{if(D.visible){const z=D.material;D.rotation.z+=x.rotation,D.scale.x=x.fadeoutSpeed*D.scale.x+x.scale,D.scale.y=D.scale.x;const O=z.uniforms.uOpacity.value;P(z)("uOpacity",O*x.fadeoutSpeed),O<.001&&(D.visible=!1)}V(D.material)(T)})},[M,x,y]);return[i.useCallback((C,T,D)=>{const{gl:z,pointer:O,size:A}=C;g(T,D);const B=x.pointerValues||l(O);if(x.frequency<B.diffPointer.length()){const R=M[w.current],N=R.material;R.visible=!0,R.position.set(B.currentPointer.x*(A.width/2),B.currentPointer.y*(A.height/2),0),R.scale.x=R.scale.y=0,P(N)("uOpacity",x.alpha),w.current=(w.current+1)%t}return o(z)},[o,M,l,t,x,g]),g,{scene:h,camera:v,meshArr:M,renderTarget:d,output:d.texture}]};var Vn="#usf <planeVertex>",Fn=`precision highp float;
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
}`;const In=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTime:{value:0},scale:{value:ee.scale},timeStrength:{value:ee.timeStrength},noiseOctaves:{value:ee.noiseOctaves},fbmOctaves:{value:ee.fbmOctaves},warpOctaves:{value:ee.warpOctaves},warpDirection:{value:ee.warpDirection},warpStrength:{value:ee.warpStrength}},vertexShader:Vn,fragmentShader:Fn},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},ee=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new a.Vector2(2,2),warpStrength:8,beat:!1}),zn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=In({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(ee),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T,clock:D}=g;return y(b,C),o("scale",l.scale),o("timeStrength",l.timeStrength),o("noiseOctaves",l.noiseOctaves),o("fbmOctaves",l.fbmOctaves),o("warpOctaves",l.warpOctaves),o("warpDirection",l.warpDirection),o("warpStrength",l.warpStrength),o("uTime",l.beat||D.getElapsedTime()),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var On="#usf <planeVertex>",Un=`precision highp float;
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
}`;const En=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},isTexture:{value:!1},scale:{value:X.scale},noise:{value:_},noiseStrength:{value:X.noiseStrength},isNoise:{value:!1},laminateLayer:{value:X.laminateLayer},laminateInterval:{value:X.laminateInterval},laminateDetail:{value:X.laminateDetail},distortion:{value:X.distortion},colorFactor:{value:X.colorFactor},uTime:{value:0},timeStrength:{value:X.timeStrength}},vertexShader:On,fragmentShader:Un},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},X=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new a.Vector2(.1,.1),laminateDetail:new a.Vector2(1,1),distortion:new a.Vector2(0,0),colorFactor:new a.Vector3(1,1,1),timeStrength:new a.Vector2(0,0),noise:!1,noiseStrength:new a.Vector2(0,0),beat:!1}),Bn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=En({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(X),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T,clock:D}=g;return y(b,C),l.texture?(o("uTexture",l.texture),o("isTexture",!0)):(o("isTexture",!1),o("scale",l.scale)),l.noise?(o("noise",l.noise),o("isNoise",!0),o("noiseStrength",l.noiseStrength)):o("isNoise",!1),o("uTime",l.beat||D.getElapsedTime()),o("laminateLayer",l.laminateLayer),o("laminateInterval",l.laminateInterval),o("laminateDetail",l.laminateDetail),o("distortion",l.distortion),o("colorFactor",l.colorFactor),o("timeStrength",l.timeStrength),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var Ln="#usf <planeVertex>",kn=`precision highp float;

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
}`;const $n=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_time:{value:0},u_pattern:{value:re.pattern},u_complexity:{value:re.complexity},u_complexityAttenuation:{value:re.complexityAttenuation},u_iterations:{value:re.iterations},u_timeStrength:{value:re.timeStrength},u_scale:{value:re.scale}},vertexShader:Ln,fragmentShader:kn},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},re=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),jn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=$n({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(re),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T,clock:D}=g;return y(b,C),o("u_pattern",l.pattern),o("u_complexity",l.complexity),o("u_complexityAttenuation",l.complexityAttenuation),o("u_iterations",l.iterations),o("u_timeStrength",l.timeStrength),o("u_scale",l.scale),o("u_time",l.beat||D.getElapsedTime()),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var qn="#usf <planeVertex>",Wn=`precision highp float;
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
}`;const Nn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uRgbWeight:{value:ie.rgbWeight},uColor1:{value:ie.color1},uColor2:{value:ie.color2},uColor3:{value:ie.color3},uColor4:{value:ie.color4}},vertexShader:qn,fragmentShader:Wn},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},ie=Object.freeze({texture:_,color1:new a.Color().set(.5,.5,.5),color2:new a.Color().set(.5,.5,.5),color3:new a.Color().set(1,1,1),color4:new a.Color().set(0,.1,.2),rgbWeight:new a.Vector3(.299,.587,.114)}),Gn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Nn({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(ie),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("uTexture",l.texture),o("uColor1",l.color1),o("uColor2",l.color2),o("uColor3",l.color3),o("uColor4",l.color4),o("uRgbWeight",l.rgbWeight),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var Kn="#usf <planeVertex>",Hn=`precision highp float;

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
}`;const Xn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uColor0:{value:Me.color0},uColor1:{value:Me.color1}},vertexShader:Kn,fragmentShader:Hn},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},Me=Object.freeze({texture:_,color0:new a.Color(16777215),color1:new a.Color(0)}),Yn=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Xn({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(Me),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("uTexture",l.texture),o("uColor0",l.color0),o("uColor1",l.color1),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var Qn="#usf <planeVertex>",Zn=`precision highp float;

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
}`;const Jn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:_},uMap:{value:_},u_alphaMap:{value:_},u_isAlphaMap:{value:!1},uMapIntensity:{value:le.mapIntensity},u_brightness:{value:le.brightness},u_min:{value:le.min},u_max:{value:le.max},u_dodgeColor:{value:new a.Color},u_isDodgeColor:{value:!1}},vertexShader:Qn,fragmentShader:Zn},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},le=Object.freeze({texture:_,map:_,alphaMap:!1,mapIntensity:.3,brightness:new a.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),et=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Jn({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(le),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("u_texture",l.texture),o("uMap",l.map),o("uMapIntensity",l.mapIntensity),l.alphaMap?(o("u_alphaMap",l.alphaMap),o("u_isAlphaMap",!0)):o("u_isAlphaMap",!1),o("u_brightness",l.brightness),o("u_min",l.min),o("u_max",l.max),l.dodgeColor?(o("u_dodgeColor",l.dodgeColor),o("u_isDodgeColor",!0)):o("u_isDodgeColor",!1),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var nt="#usf <planeVertex>",tt=`precision highp float;

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

}`;const rt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>{var p,h;return new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture0:{value:_},uTexture1:{value:_},padding:{value:ne.padding},uMap:{value:_},edgeIntensity:{value:ne.edgeIntensity},mapIntensity:{value:ne.mapIntensity},epicenter:{value:ne.epicenter},progress:{value:ne.progress},dirX:{value:(p=ne.dir)==null?void 0:p.x},dirY:{value:(h=ne.dir)==null?void 0:h.y}},vertexShader:nt,fragmentShader:tt},r),...I})},[r]),f=G(n,t);P(m)("uResolution",f.clone());const c=L(e,s,m,a.Mesh);return{material:m,mesh:c}},ne=Object.freeze({texture0:_,texture1:_,padding:0,map:_,mapIntensity:0,edgeIntensity:0,epicenter:new a.Vector2(0,0),progress:0,dir:new a.Vector2(0,0)}),ot=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=rt({scene:c,size:e,dpr:f.shader,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,dpr:f.fbo,size:e,samples:t,isSizeUpdate:s,...r}),[l,d]=$(ne),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{var A,B,R,N,H,oe,ae,ue;const{gl:T}=g;y(b,C),o("uTexture0",l.texture0),o("uTexture1",l.texture1),o("progress",l.progress);const D=[((B=(A=l.texture0)==null?void 0:A.image)==null?void 0:B.width)||0,((N=(R=l.texture0)==null?void 0:R.image)==null?void 0:N.height)||0],z=[((oe=(H=l.texture1)==null?void 0:H.image)==null?void 0:oe.width)||0,((ue=(ae=l.texture1)==null?void 0:ae.image)==null?void 0:ue.height)||0],O=D.map((se,K)=>se+(z[K]-se)*l.progress);return o("uTextureResolution",O),o("padding",l.padding),o("uMap",l.map),o("mapIntensity",l.mapIntensity),o("edgeIntensity",l.edgeIntensity),o("epicenter",l.epicenter),o("dirX",l.dir.x),o("dirY",l.dir.y),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var at="#usf <planeVertex>",ut=`precision highp float;

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
}`;const it=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:_},u_brightness:{value:fe.brightness},u_min:{value:fe.min},u_max:{value:fe.max}},vertexShader:at,fragmentShader:ut},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},fe=Object.freeze({texture:_,brightness:new a.Vector3(.5,.5,.5),min:0,max:1}),st=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=it({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(fe),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("u_texture",l.texture),o("u_brightness",l.brightness),o("u_min",l.min),o("u_max",l.max),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var lt="#usf <planeVertex>",ct=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;const mt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:_},uMap:{value:_},uMapIntensity:{value:_e.mapIntensity}},vertexShader:lt,fragmentShader:ct},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},_e=Object.freeze({texture:_,map:_,mapIntensity:.3}),vt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=mt({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(_e),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("u_texture",l.texture),o("uMap",l.map),o("uMapIntensity",l.mapIntensity),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var pt="#usf <planeVertex>",ft=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const dt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uMap:{value:_}},vertexShader:pt,fragmentShader:ft},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},Ve=Object.freeze({texture:_,map:_}),gt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=dt({scene:c,size:e,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(Ve),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("uTexture",l.texture),o("uMap",l.map),v(T)},[o,v,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var ht="#usf <planeVertex>",xt=`precision highp float;

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
}`;const Mt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:_},u_brightness:{value:ye.brightness},u_saturation:{value:ye.saturation}},vertexShader:ht,fragmentShader:xt},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},ye=Object.freeze({texture:_,brightness:1,saturation:1}),yt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Mt({scene:c,size:e,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(ye),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("u_texture",l.texture),o("u_brightness",l.brightness),o("u_saturation",l.saturation),v(T)},[o,v,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var bt="#usf <planeVertex>",St=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;const Ct=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture:{value:_}},vertexShader:bt,fragmentShader:St},r),...I}),[r]),f=G(n,t);P(m)("uResolution",f.clone());const c=L(e,s,m,a.Mesh);return{material:m,mesh:c}},Fe=Object.freeze({texture:_}),_t=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Ct({scene:c,size:e,dpr:f.shader,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,dpr:f.fbo,size:e,samples:t,isSizeUpdate:s,...r}),[l,d]=$(Fe),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{var D,z,O,A,B,R;const{gl:T}=g;return y(b,C),o("uTexture",l.texture),o("uTextureResolution",[((O=(z=(D=l.texture)==null?void 0:D.source)==null?void 0:z.data)==null?void 0:O.width)||0,((R=(B=(A=l.texture)==null?void 0:A.source)==null?void 0:B.data)==null?void 0:R.height)||0]),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var Tt="#usf <planeVertex>",wt=`precision highp float;

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
}`;const Dt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uResolution:{value:new a.Vector2(0,0)},uBlurSize:{value:Te.blurSize}},vertexShader:Tt,fragmentShader:wt},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},Te=Object.freeze({texture:_,blurSize:3,blurPower:5}),Rt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Dt({scene:c,onBeforeInit:m}),h=k(e),M=i.useMemo(()=>({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[c,h,e,f.fbo,t,s,r]),[v,l]=te(M),[d,o]=$(Te),x=P(u),y=V(u),w=i.useCallback((b,C)=>{o(b),y(C)},[o,y]);return[i.useCallback((b,C,T)=>{var O,A,B,R,N,H;const{gl:D}=b;w(C,T),x("uTexture",d.texture),x("uResolution",[((B=(A=(O=d.texture)==null?void 0:O.source)==null?void 0:A.data)==null?void 0:B.width)||0,((H=(N=(R=d.texture)==null?void 0:R.source)==null?void 0:N.data)==null?void 0:H.height)||0]),x("uBlurSize",d.blurSize);let z=l(D);for(let oe=0;oe<d.blurPower;oe++)x("uTexture",z),z=l(D);return z},[l,x,d,w]),w,{scene:c,mesh:p,material:u,camera:h,renderTarget:v,output:v.read.texture}]};var Pt="#usf <planeVertex>",At=`precision highp float;

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
}`;const Vt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uBackbuffer:{value:_},uBegin:{value:de.begin},uEnd:{value:de.end},uStrength:{value:de.strength}},vertexShader:Pt,fragmentShader:At},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},de=Object.freeze({texture:_,begin:new a.Vector2(0,0),end:new a.Vector2(0,0),strength:.9}),Ft=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Vt({scene:c,onBeforeInit:m}),h=k(e),M=i.useMemo(()=>({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[c,h,e,f.fbo,t,s,r]),[v,l]=te(M),[d,o]=$(de),x=P(u),y=V(u),w=i.useCallback((b,C)=>{o(b),y(C)},[o,y]);return[i.useCallback((b,C,T)=>{const{gl:D}=b;return w(C,T),x("uTexture",d.texture),x("uBegin",d.begin),x("uEnd",d.end),x("uStrength",d.strength),l(D,({read:z})=>{x("uBackbuffer",z)})},[l,x,w,d]),w,{scene:c,mesh:p,material:u,camera:h,renderTarget:v,output:v.read.texture}]};var It="#usf <planeVertex>",zt=`precision highp float;

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
}`;const Ot=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uEpicenter:{value:ce.epicenter},uProgress:{value:ce.progress},uStrength:{value:ce.strength},uWidth:{value:ce.width},uMode:{value:0}},vertexShader:It,fragmentShader:zt},n),...I}),[n]),s=L(e,t,r,a.Mesh);return{material:r,mesh:s}},ce=Object.freeze({epicenter:new a.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),Ut=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Ot({scene:c,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(ce),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("uEpicenter",l.epicenter),o("uProgress",l.progress),o("uWidth",l.width),o("uStrength",l.strength),o("uMode",l.mode==="center"?0:l.mode==="horizontal"?1:2),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var Et="#usf <planeVertex>",Bt=`precision highp float;
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
}`;const Lt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:_},u_resolution:{value:new a.Vector2},u_keyColor:{value:Y.color},u_similarity:{value:Y.similarity},u_smoothness:{value:Y.smoothness},u_spill:{value:Y.spill},u_color:{value:Y.color},u_contrast:{value:Y.contrast},u_brightness:{value:Y.brightness},u_gamma:{value:Y.gamma}},vertexShader:Et,fragmentShader:Bt},r),...I}),[r]),f=G(n,t);P(m)("u_resolution",f.clone());const c=L(e,s,m,a.Mesh);return{material:m,mesh:c}},Y=Object.freeze({texture:_,keyColor:new a.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new a.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),kt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=Lt({scene:c,size:e,dpr:f.shader,onBeforeInit:m}),h=k(e),[M,v]=j({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[l,d]=$(Y),o=P(u),x=V(u),y=i.useCallback((g,b)=>{d(g),x(b)},[d,x]);return[i.useCallback((g,b,C)=>{const{gl:T}=g;return y(b,C),o("u_texture",l.texture),o("u_keyColor",l.keyColor),o("u_similarity",l.similarity),o("u_smoothness",l.smoothness),o("u_spill",l.spill),o("u_color",l.color),o("u_contrast",l.contrast),o("u_brightness",l.brightness),o("u_gamma",l.gamma),v(T)},[v,o,l,y]),y,{scene:c,mesh:p,material:u,camera:h,renderTarget:M,output:M.texture}]};var $t=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,jt=`precision highp float;

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
}`;const qt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:_},uBackbuffer:{value:_},uTime:{value:0},uPointer:{value:new a.Vector2},uResolution:{value:new a.Vector2}},vertexShader:$t,fragmentShader:jt},r),...I}),[r]),f=G(n,t);P(m)("uResolution",f.clone());const c=L(e,s,m,a.Mesh);return{material:m,mesh:c}},Ie=Object.freeze({texture:_,beat:!1}),Wt=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,onBeforeInit:m})=>{const f=U(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:p}=qt({scene:c,size:e,dpr:f.shader,onBeforeInit:m}),h=k(e),M=i.useMemo(()=>({scene:c,camera:h,size:e,dpr:f.fbo,samples:t,isSizeUpdate:s,...r}),[c,h,e,f.fbo,t,s,r]),[v,l]=te(M),[d,o]=$(Ie),x=P(u),y=V(u),w=i.useCallback((b,C)=>{o(b),y(C)},[o,y]);return[i.useCallback((b,C,T)=>{const{gl:D,clock:z,pointer:O}=b;return w(C,T),x("uPointer",O),x("uTexture",d.texture),x("uTime",d.beat||z.getElapsedTime()),l(D,({read:A})=>{x("uBackbuffer",A)})},[l,x,d,w]),w,{scene:c,mesh:p,material:u,camera:h,renderTarget:v,output:v.read.texture}]},Nt=({scene:e,geometry:n,material:t})=>{const r=L(e,n,t,a.Points),s=L(e,i.useMemo(()=>n.clone(),[n]),i.useMemo(()=>t.clone(),[t]),a.Mesh);return s.visible=!1,{points:r,interactiveMesh:s}};var Gt=`uniform vec2 uResolution;
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
}`,Kt=`precision highp float;
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
}`;const ze=(e,n,t,r,s)=>{var h;const m=t==="position"?"positionTarget":"uvTarget",f=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",c=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",u=t==="position"?"positionsList":"uvsList",p=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new a.BufferAttribute(e[0],s));let M="",v="";e.forEach((l,d)=>{n.setAttribute(`${m}${d}`,new a.BufferAttribute(l,s)),M+=`attribute vec${s} ${m}${d};
`,d===0?v+=`${m}${d}`:v+=`,${m}${d}`}),r=r.replace(`${f}`,M),r=r.replace(`${c}`,`vec${s} ${u}[${e.length}] = vec${s}[](${v});
				${p}
			`)}else r=r.replace(`${f}`,""),r=r.replace(`${c}`,""),(h=n==null?void 0:n.attributes[t])!=null&&h.array||De&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},Oe=(e,n,t,r)=>{var m;let s=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?s=[n.attributes[t].array,...e]:s=e;const f=Math.max(...s.map(c=>c.length));s.forEach((c,u)=>{if(c.length<f){const p=(f-c.length)/r,h=[],M=Array.from(c);for(let v=0;v<p;v++){const l=Math.floor(c.length/r*Math.random())*r;for(let d=0;d<r;d++)h.push(M[l+d])}s[u]=new Float32Array([...M,...h])}})}return s},Ht=(e,n)=>{let t="";const r={};let s="mapArrayColor = ";return e&&e.length>0?(e.forEach((f,c)=>{const u=`vMapArrayIndex < ${c}.1`,p=`texture2D(uMapArray${c}, uv)`;s+=`( ${u} ) ? ${p} : `,t+=`
        uniform sampler2D uMapArray${c};
      `,r[`uMapArray${c}`]={value:f}}),s+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(s+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",s).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},Xt=({size:e,dpr:n,geometry:t,positions:r,uvs:s,mapArray:m,onBeforeInit:f})=>{const c=i.useMemo(()=>Oe(r,t,"position",3),[r,t]),u=i.useMemo(()=>Oe(s,t,"uv",2),[s,t]),p=i.useMemo(()=>{c.length!==u.length&&De&&console.log("use-shader-fx:positions and uvs are not matched");const M=ze(u,t,"uv",ze(c,t,"position",Gt,3),2),{rewritedFragmentShader:v,mapArrayUniforms:l}=Ht(m,Kt);return new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:_},uIsPicture:{value:!1},uAlphaPicture:{value:_},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:_},uIsMap:{value:!1},uAlphaMap:{value:_},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:_},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...l},vertexShader:M,fragmentShader:v},f),...I,blending:a.AdditiveBlending,transparent:!0})},[t,c,u,m,f]),h=G(e,n);return P(p)("uResolution",h.clone()),{material:p,modifiedPositions:c,modifiedUvs:u}},Ue=({size:e,dpr:n,scene:t=!1,geometry:r,positions:s,uvs:m,mapArray:f,onBeforeInit:c})=>{const u=U(n),p=i.useMemo(()=>{const w=r||new a.SphereGeometry(1,32,32);return w.setIndex(null),w.deleteAttribute("normal"),w},[r]),{material:h,modifiedPositions:M,modifiedUvs:v}=Xt({size:e,dpr:u.shader,geometry:p,positions:s,uvs:m,mapArray:f,onBeforeInit:c}),{points:l,interactiveMesh:d}=Nt({scene:t,geometry:p,material:h}),o=P(h),x=V(h);return[i.useCallback((w,g,b)=>{w&&o("uTime",(g==null?void 0:g.beat)||w.clock.getElapsedTime()),g!==void 0&&(o("uMorphProgress",g.morphProgress),o("uBlurAlpha",g.blurAlpha),o("uBlurRadius",g.blurRadius),o("uPointSize",g.pointSize),o("uPointAlpha",g.pointAlpha),g.picture?(o("uPicture",g.picture),o("uIsPicture",!0)):g.picture===!1&&o("uIsPicture",!1),g.alphaPicture?(o("uAlphaPicture",g.alphaPicture),o("uIsAlphaPicture",!0)):g.alphaPicture===!1&&o("uIsAlphaPicture",!1),o("uColor0",g.color0),o("uColor1",g.color1),o("uColor2",g.color2),o("uColor3",g.color3),g.map?(o("uMap",g.map),o("uIsMap",!0)):g.map===!1&&o("uIsMap",!1),g.alphaMap?(o("uAlphaMap",g.alphaMap),o("uIsAlphaMap",!0)):g.alphaMap===!1&&o("uIsAlphaMap",!1),o("uWobbleStrength",g.wobbleStrength),o("uWobblePositionFrequency",g.wobblePositionFrequency),o("uWobbleTimeFrequency",g.wobbleTimeFrequency),o("uWarpStrength",g.warpStrength),o("uWarpPositionFrequency",g.warpPositionFrequency),o("uWarpTimeFrequency",g.warpTimeFrequency),g.displacement?(o("uDisplacement",g.displacement),o("uIsDisplacement",!0)):g.displacement===!1&&o("uIsDisplacement",!1),o("uDisplacementIntensity",g.displacementIntensity),o("uDisplacementColorIntensity",g.displacementColorIntensity),o("uSizeRandomIntensity",g.sizeRandomIntensity),o("uSizeRandomTimeFrequency",g.sizeRandomTimeFrequency),o("uSizeRandomMin",g.sizeRandomMin),o("uSizeRandomMax",g.sizeRandomMax),o("uDivergence",g.divergence),o("uDivergencePoint",g.divergencePoint),x(b))},[o,x]),{points:l,interactiveMesh:d,positions:M,uvs:v}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new a.Vector3(0),beat:!1}),Yt=({size:e,dpr:n,samples:t,isSizeUpdate:r,renderTargetOptions:s,camera:m,geometry:f,positions:c,uvs:u,onBeforeInit:p})=>{const h=U(n),M=i.useMemo(()=>new a.Scene,[]),[v,{points:l,interactiveMesh:d,positions:o,uvs:x}]=Ue({scene:M,size:e,dpr:n,geometry:f,positions:c,uvs:u,onBeforeInit:p}),[y,w]=j({scene:M,camera:m,size:e,dpr:h.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0,...s}),g=i.useCallback((C,T,D)=>(v(C,T,D),w(C.gl)),[w,v]),b=i.useCallback((C,T)=>{v(null,C,T)},[v]);return[g,b,{scene:M,points:l,interactiveMesh:d,renderTarget:y,output:y.texture,positions:o,uvs:x}]},Ee=e=>{e.vertexShader=e.vertexShader.replace("void main() {",`
			uniform float uTime;
			uniform float uWobblePositionFrequency;
			uniform float uWobbleTimeFrequency;
			uniform float uWobbleStrength;
			uniform float uWarpPositionFrequency;
			uniform float uWarpTimeFrequency;
			uniform float uWarpStrength;
			varying float vWobble;
			varying vec2 vPosition;
			
			// edge
			varying vec3 vEdgeNormal;
			varying vec3 vEdgeViewPosition;

			#usf <wobble3D>

			void main() {
		`),e.vertexShader=e.vertexShader.replace("#include <beginnormal_vertex>",`
			vec3 objectNormal = usf_Normal;
			#ifdef USE_TANGENT
			vec3 objectTangent = vec3( tangent.xyz );
			#endif
		`),e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`
			vec3 transformed = usf_Position;
		`),e.vertexShader=e.vertexShader.replace("void main() {",`
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
		`)},Qt=e=>{e.fragmentShader=e.fragmentShader.replace("#include <color_fragment>",`
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
		`)};var Zt=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,Jt=`#ifdef USE_TRANSMISSION

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

#endif`;const er=({mat:e,isCustomTransmission:n,parameters:t})=>{e.type==="MeshPhysicalMaterial"&&n&&(t.fragmentShader=t.fragmentShader.replace("#include <transmission_pars_fragment>",`${Zt}`),t.fragmentShader=t.fragmentShader.replace("#include <transmission_fragment>",`${Jt}`)),e.normalMap||(t.vertexShader=t.vertexShader.replace("void main() {",`
				attribute vec4 tangent;
				
				void main() {
			`))},nr=({baseMaterial:e,materialParameters:n,isCustomTransmission:t=!1,onBeforeInit:r,depthOnBeforeInit:s})=>{const{material:m,depthMaterial:f}=i.useMemo(()=>{const c=new(e||a.MeshPhysicalMaterial)(n||{});Object.assign(c.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:q.wobblePositionFrequency},uWobbleTimeFrequency:{value:q.wobbleTimeFrequency},uWobbleStrength:{value:q.wobbleStrength},uWarpPositionFrequency:{value:q.warpPositionFrequency},uWarpTimeFrequency:{value:q.warpTimeFrequency},uWarpStrength:{value:q.warpStrength},uColor0:{value:q.color0},uColor1:{value:q.color1},uColor2:{value:q.color2},uColor3:{value:q.color3},uColorMix:{value:q.colorMix},uEdgeThreshold:{value:q.edgeThreshold},uEdgeColor:{value:q.edgeColor},uChromaticAberration:{value:q.chromaticAberration},uAnisotropicBlur:{value:q.anisotropicBlur},uDistortion:{value:q.distortion},uDistortionScale:{value:q.distortionScale},uTemporalDistortion:{value:q.temporalDistortion},uRefractionSamples:{value:q.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),c.onBeforeCompile=p=>{Ee(p),Qt(p),er({parameters:p,mat:c,isCustomTransmission:t});const h=F({fragmentShader:p.fragmentShader,vertexShader:p.vertexShader,uniforms:c.userData.uniforms},r);p.fragmentShader=h.fragmentShader,p.vertexShader=h.vertexShader,Object.assign(p.uniforms,h.uniforms)},c.needsUpdate=!0;const u=new a.MeshDepthMaterial({depthPacking:a.RGBADepthPacking});return u.onBeforeCompile=p=>{Object.assign(p.uniforms,c.userData.uniforms),Ee(p),F(p,s)},u.needsUpdate=!0,{material:c,depthMaterial:u}},[n,e,r,s,t]);return{material:m,depthMaterial:f}},Be=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:s,onBeforeInit:m,depthOnBeforeInit:f})=>{const c=i.useMemo(()=>{let o=n||new a.IcosahedronGeometry(2,20);return o=qe.mergeVertices(o),o.computeTangents(),o},[n]),{material:u,depthMaterial:p}=nr({baseMaterial:r,materialParameters:s,isCustomTransmission:t,onBeforeInit:m,depthOnBeforeInit:f}),h=L(e,c,u,a.Mesh),M=u.userData,v=P(M),l=V(M);return[i.useCallback((o,x,y)=>{o&&v("uTime",(x==null?void 0:x.beat)||o.clock.getElapsedTime()),x!==void 0&&(v("uWobbleStrength",x.wobbleStrength),v("uWobblePositionFrequency",x.wobblePositionFrequency),v("uWobbleTimeFrequency",x.wobbleTimeFrequency),v("uWarpStrength",x.warpStrength),v("uWarpPositionFrequency",x.warpPositionFrequency),v("uWarpTimeFrequency",x.warpTimeFrequency),v("uColor0",x.color0),v("uColor1",x.color1),v("uColor2",x.color2),v("uColor3",x.color3),v("uColorMix",x.colorMix),v("uEdgeThreshold",x.edgeThreshold),v("uEdgeColor",x.edgeColor),v("uChromaticAberration",x.chromaticAberration),v("uAnisotropicBlur",x.anisotropicBlur),v("uDistortion",x.distortion),v("uDistortionScale",x.distortionScale),v("uRefractionSamples",x.refractionSamples),v("uTemporalDistortion",x.temporalDistortion),l(y))},[v,l]),{mesh:h,depthMaterial:p}]},q=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new a.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),tr=({size:e,dpr:n,samples:t,renderTargetOptions:r,isSizeUpdate:s,camera:m,geometry:f,baseMaterial:c,materialParameters:u,isCustomTransmission:p,onBeforeInit:h,depthOnBeforeInit:M})=>{const v=U(n),l=i.useMemo(()=>new a.Scene,[]),[d,{mesh:o,depthMaterial:x}]=Be({baseMaterial:c,materialParameters:u,scene:l,geometry:f,isCustomTransmission:p,onBeforeInit:h,depthOnBeforeInit:M}),[y,w]=j({scene:l,camera:m,size:e,dpr:v.fbo,samples:t,isSizeUpdate:s,depthBuffer:!0,...r}),g=i.useCallback((C,T,D)=>(d(C,T,D),w(C.gl)),[w,d]),b=i.useCallback((C,T)=>{d(null,C,T)},[d]);return[g,b,{scene:l,mesh:o,depthMaterial:x,renderTarget:y,output:y.texture}]},rr=(e,n,t)=>{const r=i.useMemo(()=>{const s=new a.Mesh(n,t);return e.add(s),s},[n,t,e]);return i.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},or=(e,n,t,r,s,m)=>{const f=e<t-s||n<r-s,c=e>t+s||n>r+s;return m==="smaller"&&f||m==="larger"&&c||m==="both"&&(f||c)},ar=({gl:e,size:n,boundFor:t,threshold:r})=>{const s=i.useRef(n);return i.useMemo(()=>{const{width:f,height:c}=n,{width:u,height:p}=s.current,h=or(f,c,u,p,r,t),M=ke.getMaxDpr(e,n);return h&&(s.current=n),{maxDpr:M,isUpdate:h}},[n,e,t,r])},ge=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-ge.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-ge.easeOutBounce(1-2*e))/2:(1+ge.easeOutBounce(2*e-1))/2}});function ur(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const ir=(e,n="easeOutQuart")=>{const t=e/60,r=ge[n];return i.useCallback(m=>{let f=m.getElapsedTime()*t;const c=Math.floor(f),u=r(f-c);f=u+c;const p=ur(c);return{beat:f,floor:c,fract:u,hash:p}},[t,r])},sr=(e=60)=>{const n=i.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=i.useRef(null);return i.useCallback(s=>{const m=s.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},lr=e=>{var r,s;const n=(r=e.dom)==null?void 0:r.length,t=(s=e.texture)==null?void 0:s.length;return!n||!t||n!==t};var cr=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,mr=`precision highp float;

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
}`;const vr=({params:e,scene:n,onBeforeInit:t})=>{n.children.length>0&&(n.children.forEach(r=>{r instanceof a.Mesh&&(r.geometry.dispose(),r.material.dispose())}),n.remove(...n.children)),e.texture.forEach((r,s)=>{const m=new a.ShaderMaterial({...F({uniforms:{u_texture:{value:r},u_textureResolution:{value:new a.Vector2(0,0)},u_resolution:{value:new a.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[s]?e.boderRadius[s]:0}},vertexShader:cr,fragmentShader:mr},t),...I,transparent:!0}),f=new a.Mesh(new a.PlaneGeometry(1,1),m);n.add(f)})},pr=()=>{const e=i.useRef([]),n=i.useRef([]);return i.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:s,params:m})=>{e.current.length>0&&e.current.forEach((c,u)=>{c.unobserve(n.current[u])}),n.current=[],e.current=[];const f=new Array(m.dom.length).fill(!1);r.current=[...f],s.current=[...f],m.dom.forEach((c,u)=>{const p=M=>{M.forEach(v=>{m.onIntersect[u]&&m.onIntersect[u](v),r.current[u]=v.isIntersecting})},h=new IntersectionObserver(p,{rootMargin:"0px",threshold:0});h.observe(c),e.current.push(h),n.current.push(c)})},[])},fr=()=>{const e=i.useRef([]),n=i.useCallback(({params:t,customParams:r,size:s,resolutionRef:m,scene:f,isIntersectingRef:c})=>{f.children.length!==e.current.length&&(e.current=new Array(f.children.length)),f.children.forEach((u,p)=>{var v,l,d,o,x,y;const h=t.dom[p];if(!h)return;const M=h.getBoundingClientRect();if(e.current[p]=M,u.scale.set(M.width,M.height,1),u.position.set(M.left+M.width*.5-s.width*.5,-M.top-M.height*.5+s.height*.5,0),c.current[p]&&(t.rotation[p]&&u.rotation.copy(t.rotation[p]),u instanceof a.Mesh)){const w=u.material,g=P(w),b=V(w);g("u_texture",t.texture[p]),g("u_textureResolution",[((d=(l=(v=t.texture[p])==null?void 0:v.source)==null?void 0:l.data)==null?void 0:d.width)||0,((y=(x=(o=t.texture[p])==null?void 0:o.source)==null?void 0:x.data)==null?void 0:y.height)||0]),g("u_resolution",m.current.set(M.width,M.height)),g("u_borderRadius",t.boderRadius[p]?t.boderRadius[p]:0),b(r)}})},[]);return[e.current,n]},dr=()=>{const e=i.useRef([]),n=i.useRef([]),t=i.useCallback((r,s=!1)=>{e.current.forEach((f,c)=>{f&&(n.current[c]=!0)});const m=s?[...n.current]:[...e.current];return r<0?m:m[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},gr=e=>({onView:t,onHidden:r})=>{const s=i.useRef(!1);i.useEffect(()=>{let m;const f=()=>{e.current.some(c=>c)?s.current||(t&&t(),s.current=!0):s.current&&(r&&r(),s.current=!1),m=requestAnimationFrame(f)};return m=requestAnimationFrame(f),()=>{cancelAnimationFrame(m)}},[t,r])},Le={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},hr=({size:e,dpr:n,samples:t,isSizeUpdate:r,renderTargetOptions:s,onBeforeInit:m},f=[])=>{const c=U(n),u=i.useMemo(()=>new a.Scene,[]),p=k(e),[h,M]=j({scene:u,camera:p,size:e,dpr:c.fbo,samples:t,isSizeUpdate:r,...s}),[v,l]=$({...Le,updateKey:performance.now()}),[d,o]=fr(),x=i.useRef(new a.Vector2(0,0)),[y,w]=i.useState(!0);i.useMemo(()=>w(!0),f);const g=i.useRef(null),b=i.useMemo(()=>_,[]),C=pr(),{isIntersectingOnceRef:T,isIntersectingRef:D,isIntersecting:z}=dr(),O=gr(D),A=i.useMemo(()=>(R,N)=>{l(R),o({params:v,customParams:N,size:e,resolutionRef:x,scene:u,isIntersectingRef:D})},[D,l,o,e,u,v]);return[i.useCallback((R,N,H)=>{const{gl:oe,size:ae}=R;if(A(N,H),lr(v))return b;if(y){if(g.current===v.updateKey)return b;g.current=v.updateKey}return y&&(vr({params:v,size:ae,scene:u,onBeforeInit:m}),C({isIntersectingRef:D,isIntersectingOnceRef:T,params:v}),w(!1)),M(oe)},[M,C,m,A,y,u,v,T,D,b]),A,{scene:u,camera:p,renderTarget:h,output:h.texture,isIntersecting:z,DOMRects:d,intersections:D.current,useDomView:O}]},xr=(e,n)=>{const{scene:t,camera:r,size:s,dpr:m=!1,isSizeUpdate:f=!1,depth:c=!1,...u}=e,p=i.useRef([]),h=G(s,m);p.current=i.useMemo(()=>Array.from({length:n},()=>{const v=new a.WebGLRenderTarget(h.x,h.y,{...pe,...u});return c&&(v.depthTexture=new a.DepthTexture(h.x,h.y,a.FloatType)),v}),[n]),f&&p.current.forEach(v=>v.setSize(h.x,h.y)),i.useEffect(()=>{const v=p.current;return()=>{v.forEach(l=>l.dispose())}},[n]);const M=i.useCallback((v,l,d)=>{const o=p.current[l];return xe({gl:v,scene:t,camera:r,fbo:o,onBeforeRender:()=>d&&d({read:o.texture})}),o.texture},[t,r]);return[p.current,M]},ke=Object.freeze({interpolate(e,n,t,r=1e-6){const s=e+(n-e)*t;return Math.abs(s)<r?0:s},getMaxDpr(e,n){return Math.floor(e.capabilities.maxTextureSize/Math.max(n.width,n.height))}});S.ALPHABLENDING_PARAMS=Ve,S.BLANK_PARAMS=Ie,S.BLENDING_PARAMS=le,S.BRIGHTNESSPICKER_PARAMS=fe,S.BRUSH_PARAMS=Q,S.CHROMAKEY_PARAMS=Y,S.COLORSTRATA_PARAMS=X,S.COSPALETTE_PARAMS=ie,S.COVERTEXTURE_PARAMS=Fe,S.DELTA_TIME=Ce,S.DOMSYNCER_PARAMS=Le,S.DUOTONE_PARAMS=Me,S.Easing=ge,S.FBO_DEFAULT_OPTION=pe,S.FLUID_PARAMS=Pe,S.FXBLENDING_PARAMS=_e,S.FXTEXTURE_PARAMS=ne,S.HSV_PARAMS=ye,S.MARBLE_PARAMS=re,S.MORPHPARTICLES_PARAMS=E,S.MOTIONBLUR_PARAMS=de,S.NOISE_PARAMS=ee,S.RIPPLE_PARAMS=Ae,S.SIMPLEBLUR_PARAMS=Te,S.ShaderChunk=Re,S.Utils=ke,S.WAVE_PARAMS=ce,S.WOBBLE3D_PARAMS=q,S.renderFBO=xe,S.setCustomUniform=V,S.setUniform=P,S.useAddMesh=rr,S.useAlphaBlending=gt,S.useBeat=ir,S.useBlank=Wt,S.useBlending=et,S.useBrightnessPicker=st,S.useBrush=an,S.useCamera=k,S.useChromaKey=kt,S.useColorStrata=Bn,S.useCopyTexture=xr,S.useCosPalette=Gn,S.useCoverTexture=_t,S.useCreateMorphParticles=Ue,S.useCreateWobble3D=Be,S.useDomSyncer=hr,S.useDoubleFBO=te,S.useDuoTone=Yn,S.useFPSLimiter=sr,S.useFluid=wn,S.useFxBlending=vt,S.useFxTexture=ot,S.useHSV=yt,S.useMarble=jn,S.useMorphParticles=Yt,S.useMotionBlur=Ft,S.useNoise=zn,S.useParams=$,S.usePointer=he,S.useResizeBoundary=ar,S.useResolution=G,S.useRipple=An,S.useSimpleBlur=Rt,S.useSingleFBO=j,S.useWave=Ut,S.useWobble3D=tr,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
