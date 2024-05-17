(function(S,ue){typeof exports=="object"&&typeof module<"u"?ue(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],ue):(S=typeof globalThis<"u"?globalThis:S||self,ue(S["use-shader-fx"]={},S.THREE,S.React))})(this,function(S,ue,i){"use strict";function $e(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const a=$e(ue);var je="#usf <planeVertex>",We=`precision highp float;

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
}`;const G=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return i.useMemo(()=>new a.Vector2(t,r),[t,r])},R=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},F=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},E=(e,n,t,r)=>{const l=i.useMemo(()=>{const v=new r(n,t);return e&&e.add(v),v},[n,t,r,e]);return i.useEffect(()=>()=>{e&&e.remove(l),n.dispose(),t.dispose()},[e,n,t,l]),l},Te=process.env.NODE_ENV==="development",I={transparent:!1,depthTest:!1,depthWrite:!1},T=new a.DataTexture(new Uint8Array([0,0,0,0]),1,1,a.RGBAFormat);var qe=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`,Ne=`vec3 random3(vec3 c) {
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
}`,Ge=`float screenAspect = uResolution.x / uResolution.y;
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
}`,He=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;const De=Object.freeze({wobble3D:qe,snoise:Ne,coverTexture:Ge,fxBlending:Ke,planeVertex:Xe,defaultVertex:He}),Ye=/^[ \t]*#usf +<([\w\d./]+)>/gm;function Qe(e,n){return be(De[n]||"")}function be(e){return e.replace(Ye,Qe)}const V=(e,n)=>(n&&n(e),e.vertexShader=be(e.vertexShader),e.fragmentShader=be(e.fragmentShader),e),Ze=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),v=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uBuffer:{value:T},uResolution:{value:new a.Vector2(0,0)},uTexture:{value:T},uIsTexture:{value:!1},uMap:{value:T},uIsMap:{value:!1},uMapIntensity:{value:Q.mapIntensity},uRadius:{value:Q.radius},uSmudge:{value:Q.smudge},uDissipation:{value:Q.dissipation},uMotionBlur:{value:Q.motionBlur},uMotionSample:{value:Q.motionSample},uMouse:{value:new a.Vector2(-10,-10)},uPrevMouse:{value:new a.Vector2(-10,-10)},uVelocity:{value:new a.Vector2(0,0)},uColor:{value:Q.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:je,fragmentShader:We},r),...I,transparent:!0}),[r]),c=G(n,t);R(v)("uResolution",c.clone());const u=E(e,l,v,a.Mesh);return{material:v,mesh:u}},Je=(e,n)=>{const t=n,r=e/n,[l,v]=[t*r/2,t/2];return{width:l,height:v,near:-1e3,far:1e3}},L=(e,n="OrthographicCamera")=>{const t=G(e),{width:r,height:l,near:v,far:c}=Je(t.x,t.y);return i.useMemo(()=>n==="OrthographicCamera"?new a.OrthographicCamera(-r,r,l,-l,v,c):new a.PerspectiveCamera(50,r/l),[r,l,v,c,n])},he=(e=0)=>{const n=i.useRef(new a.Vector2(0,0)),t=i.useRef(new a.Vector2(0,0)),r=i.useRef(new a.Vector2(0,0)),l=i.useRef(0),v=i.useRef(new a.Vector2(0,0)),c=i.useRef(!1);return i.useCallback(d=>{const f=performance.now();let x;c.current&&e?(r.current=r.current.lerp(d,1-e),x=r.current.clone()):(x=d.clone(),r.current=x),l.current===0&&(l.current=f,n.current=x);const M=Math.max(1,f-l.current);l.current=f,v.current.copy(x).sub(n.current).divideScalar(M);const o=v.current.length()>0,g=c.current?n.current.clone():x;return!c.current&&o&&(c.current=!0),n.current=x,{currentPointer:x,prevPointer:g,diffPointer:t.current.subVectors(x,g),velocity:v.current,isVelocityUpdate:o}},[e])},k=e=>{const n=l=>Object.values(l).some(v=>typeof v=="function"),t=i.useRef(n(e)?e:structuredClone(e)),r=i.useCallback(l=>{if(l!==void 0)for(const v in l){const c=v;c in t.current&&l[c]!==void 0&&l[c]!==null?t.current[c]=l[c]:console.error(`"${String(c)}" does not exist in the params. or "${String(c)}" is null | undefined`)}},[]);return[t.current,r]},ve={minFilter:a.LinearFilter,magFilter:a.LinearFilter,type:a.HalfFloatType,stencilBuffer:!1},ge=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:l,onSwap:v})=>{e.setRenderTarget(n),l(),e.clear(),e.render(t,r),v&&v(),e.setRenderTarget(null),e.clear()},$=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:l=!1,samples:v=0,depthBuffer:c=!1,depthTexture:u=!1})=>{var M;const d=i.useRef(),f=G(t,r);d.current=i.useMemo(()=>{const o=new a.WebGLRenderTarget(f.x,f.y,{...ve,samples:v,depthBuffer:c});return u&&(o.depthTexture=new a.DepthTexture(f.x,f.y,a.FloatType)),o},[]),l&&((M=d.current)==null||M.setSize(f.x,f.y)),i.useEffect(()=>{const o=d.current;return()=>{o==null||o.dispose()}},[]);const x=i.useCallback((o,g)=>{const s=d.current;return ge({gl:o,fbo:s,scene:e,camera:n,onBeforeRender:()=>g&&g({read:s.texture})}),s.texture},[e,n]);return[d.current,x]},te=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:l=!1,samples:v=0,depthBuffer:c=!1,depthTexture:u=!1})=>{var M,o;const d=G(t,r),f=i.useMemo(()=>{const g=new a.WebGLRenderTarget(d.x,d.y,{...ve,samples:v,depthBuffer:c}),s=new a.WebGLRenderTarget(d.x,d.y,{...ve,samples:v,depthBuffer:c});return u&&(g.depthTexture=new a.DepthTexture(d.x,d.y,a.FloatType),s.depthTexture=new a.DepthTexture(d.x,d.y,a.FloatType)),{read:g,write:s,swap:function(){let m=this.read;this.read=this.write,this.write=m}}},[v,c,u]);l&&((M=f.read)==null||M.setSize(d.x,d.y),(o=f.write)==null||o.setSize(d.x,d.y)),i.useEffect(()=>{const g=f;return()=>{var s,m;(s=g.read)==null||s.dispose(),(m=g.write)==null||m.dispose()}},[f]);const x=i.useCallback((g,s)=>{var p;const m=f;return ge({gl:g,scene:e,camera:n,fbo:m.write,onBeforeRender:()=>s&&s({read:m.read.texture,write:m.write.texture}),onSwap:()=>m.swap()}),(p=m.read)==null?void 0:p.texture},[e,n,f]);return[{read:f.read,write:f.write},x]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Q=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new a.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),en=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Ze({scene:c,size:e,dpr:v.shader,onBeforeInit:l}),f=L(e),x=he(),[M,o]=te({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[g,s]=k(Q),m=i.useRef(null),p=R(u),C=F(u),y=i.useCallback((b,_)=>{s(b),C(_)},[s,C]);return[i.useCallback((b,_,w)=>{const{gl:A,pointer:z}=b;y(_,w),g.texture?(p("uIsTexture",!0),p("uTexture",g.texture)):p("uIsTexture",!1),g.map?(p("uIsMap",!0),p("uMap",g.map),p("uMapIntensity",g.mapIntensity)):p("uIsMap",!1),p("uRadius",g.radius),p("uSmudge",g.smudge),p("uDissipation",g.dissipation),p("uMotionBlur",g.motionBlur),p("uMotionSample",g.motionSample);const P=g.pointerValues||x(z);P.isVelocityUpdate&&(p("uMouse",P.currentPointer),p("uPrevMouse",P.prevPointer)),p("uVelocity",P.velocity);const B=typeof g.color=="function"?g.color(P.velocity):g.color;return p("uColor",B),p("uIsCursor",g.isCursor),p("uPressureEnd",g.pressure),m.current===null&&(m.current=g.pressure),p("uPressureStart",m.current),m.current=g.pressure,o(A,({read:D})=>{p("uBuffer",D)})},[p,x,o,g,y]),y,{scene:c,mesh:d,material:u,camera:f,renderTarget:M,output:M.read.texture}]};var Z=`varying vec2 vUv;
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
}`,nn=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const tn=()=>i.useMemo(()=>new a.ShaderMaterial({vertexShader:Z,fragmentShader:nn,...I}),[]);var rn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const on=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uVelocity:{value:T},uSource:{value:T},texelSize:{value:new a.Vector2},dt:{value:Se},dissipation:{value:0}},vertexShader:Z,fragmentShader:rn},e),...I}),[e]);var an=`precision highp float;

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
}`;const un=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:an},e),...I}),[e]);var sn=`precision highp float;

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
}`;const ln=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:sn},e),...I}),[e]);var cn=`precision highp float;

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
}`;const mn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:cn},e),...I}),[e]);var vn=`precision highp float;

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
}`;const fn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Se},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:vn},e),...I}),[e]);var pn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const dn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},value:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:pn},e),...I}),[e]);var hn=`precision highp float;

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
}`;const gn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uPressure:{value:T},uVelocity:{value:T},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:hn},e),...I}),[e]);var xn=`precision highp float;

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
}`;const Mn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTarget:{value:T},aspectRatio:{value:0},color:{value:new a.Vector3},point:{value:new a.Vector2},radius:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Z,fragmentShader:xn},e),...I}),[e]),J=(e,n)=>e(n??{}),yn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),{curl:v,vorticity:c,advection:u,divergence:d,pressure:f,clear:x,gradientSubtract:M,splat:o}=r??{},g=J(tn),s=g.clone(),m=J(mn,v),p=J(fn,c),C=J(on,u),y=J(un,d),h=J(ln,f),b=J(dn,x),_=J(gn,M),w=J(Mn,o),A=i.useMemo(()=>({vorticityMaterial:p,curlMaterial:m,advectionMaterial:C,divergenceMaterial:y,pressureMaterial:h,clearMaterial:b,gradientSubtractMaterial:_,splatMaterial:w}),[p,m,C,y,h,b,_,w]),z=G(n,t);i.useMemo(()=>{R(A.splatMaterial)("aspectRatio",z.x/z.y);for(const D of Object.values(A))R(D)("texelSize",new a.Vector2(1/z.x,1/z.y))},[z,A]);const P=E(e,l,g,a.Mesh);i.useMemo(()=>{g.dispose(),P.material=s},[g,P,s]),i.useEffect(()=>()=>{for(const D of Object.values(A))D.dispose()},[A]);const B=i.useCallback(D=>{P.material=D,P.material.needsUpdate=!0},[P]);return{materials:A,setMeshMaterial:B,mesh:P}},Se=.016,Pe=Object.freeze({densityDissipation:.98,velocityDissipation:.99,velocityAcceleration:10,pressureDissipation:.9,pressureIterations:20,curlStrength:35,splatRadius:.002,fluidColor:new a.Vector3(1,1,1),pointerValues:!1}),bn=({size:e,dpr:n,samples:t,isSizeUpdate:r,customFluidProps:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{materials:u,setMeshMaterial:d,mesh:f}=yn({scene:c,size:e,dpr:v.shader,customFluidProps:l}),x=L(e),M=he(),o=i.useMemo(()=>({scene:c,camera:x,dpr:v.fbo,size:e,samples:t,isSizeUpdate:r}),[c,x,e,t,v.fbo,r]),[g,s]=te(o),[m,p]=te(o),[C,y]=$(o),[h,b]=$(o),[_,w]=te(o),A=i.useRef(new a.Vector2(0,0)),z=i.useRef(new a.Vector3(0,0,0)),[P,B]=k(Pe),D=i.useMemo(()=>({advection:R(u.advectionMaterial),splat:R(u.splatMaterial),curl:R(u.curlMaterial),vorticity:R(u.vorticityMaterial),divergence:R(u.divergenceMaterial),clear:R(u.clearMaterial),pressure:R(u.pressureMaterial),gradientSubtract:R(u.gradientSubtractMaterial)}),[u]),W=i.useMemo(()=>({advection:F(u.advectionMaterial),splat:F(u.splatMaterial),curl:F(u.curlMaterial),vorticity:F(u.vorticityMaterial),divergence:F(u.divergenceMaterial),clear:F(u.clearMaterial),pressure:F(u.pressureMaterial),gradientSubtract:F(u.gradientSubtractMaterial)}),[u]),N=i.useCallback((X,ae)=>{B(X),ae&&Object.keys(ae).forEach(se=>{W[se](ae[se])})},[B,W]);return[i.useCallback((X,ae,se)=>{const{gl:K,pointer:pr,size:Le}=X;N(ae,se);const we=s(K,({read:q})=>{d(u.advectionMaterial),D.advection("uVelocity",q),D.advection("uSource",q),D.advection("dissipation",P.velocityDissipation)}),dr=p(K,({read:q})=>{d(u.advectionMaterial),D.advection("uVelocity",we),D.advection("uSource",q),D.advection("dissipation",P.densityDissipation)}),ye=P.pointerValues||M(pr);ye.isVelocityUpdate&&(s(K,({read:q})=>{d(u.splatMaterial),D.splat("uTarget",q),D.splat("point",ye.currentPointer);const me=ye.diffPointer.multiply(A.current.set(Le.width,Le.height).multiplyScalar(P.velocityAcceleration));D.splat("color",z.current.set(me.x,me.y,1)),D.splat("radius",P.splatRadius)}),p(K,({read:q})=>{d(u.splatMaterial),D.splat("uTarget",q);const me=typeof P.fluidColor=="function"?P.fluidColor(ye.velocity):P.fluidColor;D.splat("color",me)}));const hr=y(K,()=>{d(u.curlMaterial),D.curl("uVelocity",we)});s(K,({read:q})=>{d(u.vorticityMaterial),D.vorticity("uVelocity",q),D.vorticity("uCurl",hr),D.vorticity("curl",P.curlStrength)});const gr=b(K,()=>{d(u.divergenceMaterial),D.divergence("uVelocity",we)});w(K,({read:q})=>{d(u.clearMaterial),D.clear("uTexture",q),D.clear("value",P.pressureDissipation)}),d(u.pressureMaterial),D.pressure("uDivergence",gr);let ke;for(let q=0;q<P.pressureIterations;q++)ke=w(K,({read:me})=>{D.pressure("uPressure",me)});return s(K,({read:q})=>{d(u.gradientSubtractMaterial),D.gradientSubtract("uPressure",ke),D.gradientSubtract("uVelocity",q)}),dr},[u,D,d,y,p,b,M,w,s,P,N]),N,{scene:c,mesh:f,materials:u,camera:x,renderTarget:{velocity:g,density:m,curl:C,divergence:h,pressure:_},output:m.read.texture}]};var Sn="#usf <defaultVertex>",Cn=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const _n=({scale:e,max:n,texture:t,scene:r,onBeforeInit:l})=>{const v=i.useMemo(()=>new a.PlaneGeometry(e,e),[e]),c=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uOpacity:{value:0},uMap:{value:t||T}},vertexShader:Sn,fragmentShader:Cn},l),blending:a.AdditiveBlending,...I,transparent:!0}),[t,l]),u=i.useMemo(()=>{const d=[];for(let f=0;f<n;f++){const x=c.clone(),M=new a.Mesh(v.clone(),x);M.rotateZ(2*Math.PI*Math.random()),M.visible=!1,r.add(M),d.push(M)}return d},[v,c,r,n]);return i.useEffect(()=>()=>{u.forEach(d=>{d.geometry.dispose(),Array.isArray(d.material)?d.material.forEach(f=>f.dispose()):d.material.dispose(),r.remove(d)})},[r,u]),u},Re=Object.freeze({frequency:.01,rotation:.05,fadeoutSpeed:.9,scale:.3,alpha:.6,pointerValues:!1}),wn=({texture:e,scale:n=64,max:t=100,size:r,dpr:l,samples:v,isSizeUpdate:c,onBeforeInit:u})=>{const d=O(l),f=i.useMemo(()=>new a.Scene,[]),x=_n({scale:n,max:t,texture:e,scene:f,onBeforeInit:u}),M=L(r),o=he(),[g,s]=$({scene:f,camera:M,size:r,dpr:d.fbo,samples:v,isSizeUpdate:c}),[m,p]=k(Re),C=i.useRef(0),y=i.useMemo(()=>(b,_)=>{p(b),x.forEach(w=>{if(w.visible){const A=w.material;w.rotation.z+=m.rotation,w.scale.x=m.fadeoutSpeed*w.scale.x+m.scale,w.scale.y=w.scale.x;const z=A.uniforms.uOpacity.value;R(A)("uOpacity",z*m.fadeoutSpeed),z<.001&&(w.visible=!1)}F(w.material)(_)})},[x,m,p]);return[i.useCallback((b,_,w)=>{const{gl:A,pointer:z,size:P}=b;y(_,w);const B=m.pointerValues||o(z);if(m.frequency<B.diffPointer.length()){const D=x[C.current],W=D.material;D.visible=!0,D.position.set(B.currentPointer.x*(P.width/2),B.currentPointer.y*(P.height/2),0),D.scale.x=D.scale.y=0,R(W)("uOpacity",m.alpha),C.current=(C.current+1)%t}return s(A)},[s,x,o,t,m,y]),y,{scene:f,camera:M,meshArr:x,renderTarget:g,output:g.texture}]};var Tn="#usf <planeVertex>",Dn=`precision highp float;
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
}`;const Pn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTime:{value:0},scale:{value:ee.scale},timeStrength:{value:ee.timeStrength},noiseOctaves:{value:ee.noiseOctaves},fbmOctaves:{value:ee.fbmOctaves},warpOctaves:{value:ee.warpOctaves},warpDirection:{value:ee.warpDirection},warpStrength:{value:ee.warpStrength}},vertexShader:Tn,fragmentShader:Dn},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},ee=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new a.Vector2(2,2),warpStrength:8,beat:!1}),Rn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Pn({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(ee),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_,clock:w}=y;return p(h,b),s("scale",o.scale),s("timeStrength",o.timeStrength),s("noiseOctaves",o.noiseOctaves),s("fbmOctaves",o.fbmOctaves),s("warpOctaves",o.warpOctaves),s("warpDirection",o.warpDirection),s("warpStrength",o.warpStrength),s("uTime",o.beat||w.getElapsedTime()),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var An="#usf <planeVertex>",Fn=`precision highp float;
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
}`;const Vn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},isTexture:{value:!1},scale:{value:H.scale},noise:{value:T},noiseStrength:{value:H.noiseStrength},isNoise:{value:!1},laminateLayer:{value:H.laminateLayer},laminateInterval:{value:H.laminateInterval},laminateDetail:{value:H.laminateDetail},distortion:{value:H.distortion},colorFactor:{value:H.colorFactor},uTime:{value:0},timeStrength:{value:H.timeStrength}},vertexShader:An,fragmentShader:Fn},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},H=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new a.Vector2(.1,.1),laminateDetail:new a.Vector2(1,1),distortion:new a.Vector2(0,0),colorFactor:new a.Vector3(1,1,1),timeStrength:new a.Vector2(0,0),noise:!1,noiseStrength:new a.Vector2(0,0),beat:!1}),In=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Vn({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(H),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_,clock:w}=y;return p(h,b),o.texture?(s("uTexture",o.texture),s("isTexture",!0)):(s("isTexture",!1),s("scale",o.scale)),o.noise?(s("noise",o.noise),s("isNoise",!0),s("noiseStrength",o.noiseStrength)):s("isNoise",!1),s("uTime",o.beat||w.getElapsedTime()),s("laminateLayer",o.laminateLayer),s("laminateInterval",o.laminateInterval),s("laminateDetail",o.laminateDetail),s("distortion",o.distortion),s("colorFactor",o.colorFactor),s("timeStrength",o.timeStrength),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var zn="#usf <planeVertex>",On=`precision highp float;

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
}`;const Un=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_time:{value:0},u_pattern:{value:re.pattern},u_complexity:{value:re.complexity},u_complexityAttenuation:{value:re.complexityAttenuation},u_iterations:{value:re.iterations},u_timeStrength:{value:re.timeStrength},u_scale:{value:re.scale}},vertexShader:zn,fragmentShader:On},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},re=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Bn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Un({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(re),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_,clock:w}=y;return p(h,b),s("u_pattern",o.pattern),s("u_complexity",o.complexity),s("u_complexityAttenuation",o.complexityAttenuation),s("u_iterations",o.iterations),s("u_timeStrength",o.timeStrength),s("u_scale",o.scale),s("u_time",o.beat||w.getElapsedTime()),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var En="#usf <planeVertex>",Ln=`precision highp float;
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
}`;const kn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uRgbWeight:{value:ie.rgbWeight},uColor1:{value:ie.color1},uColor2:{value:ie.color2},uColor3:{value:ie.color3},uColor4:{value:ie.color4}},vertexShader:En,fragmentShader:Ln},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},ie=Object.freeze({texture:T,color1:new a.Color().set(.5,.5,.5),color2:new a.Color().set(.5,.5,.5),color3:new a.Color().set(1,1,1),color4:new a.Color().set(0,.1,.2),rgbWeight:new a.Vector3(.299,.587,.114)}),$n=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=kn({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(ie),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("uTexture",o.texture),s("uColor1",o.color1),s("uColor2",o.color2),s("uColor3",o.color3),s("uColor4",o.color4),s("uRgbWeight",o.rgbWeight),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var jn="#usf <planeVertex>",Wn=`precision highp float;

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
}`;const qn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uColor0:{value:xe.color0},uColor1:{value:xe.color1}},vertexShader:jn,fragmentShader:Wn},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},xe=Object.freeze({texture:T,color0:new a.Color(16777215),color1:new a.Color(0)}),Nn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=qn({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(xe),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("uTexture",o.texture),s("uColor0",o.color0),s("uColor1",o.color1),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var Gn="#usf <planeVertex>",Kn=`precision highp float;

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
}`;const Xn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_texture:{value:T},uMap:{value:T},u_alphaMap:{value:T},u_isAlphaMap:{value:!1},uMapIntensity:{value:le.mapIntensity},u_brightness:{value:le.brightness},u_min:{value:le.min},u_max:{value:le.max},u_dodgeColor:{value:new a.Color},u_isDodgeColor:{value:!1}},vertexShader:Gn,fragmentShader:Kn},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},le=Object.freeze({texture:T,map:T,alphaMap:!1,mapIntensity:.3,brightness:new a.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Hn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Xn({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(le),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("u_texture",o.texture),s("uMap",o.map),s("uMapIntensity",o.mapIntensity),o.alphaMap?(s("u_alphaMap",o.alphaMap),s("u_isAlphaMap",!0)):s("u_isAlphaMap",!1),s("u_brightness",o.brightness),s("u_min",o.min),s("u_max",o.max),o.dodgeColor?(s("u_dodgeColor",o.dodgeColor),s("u_isDodgeColor",!0)):s("u_isDodgeColor",!1),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var Yn="#usf <planeVertex>",Qn=`precision highp float;

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

}`;const Zn=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),v=i.useMemo(()=>{var f,x;return new a.ShaderMaterial({...V({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture0:{value:T},uTexture1:{value:T},padding:{value:ne.padding},uMap:{value:T},edgeIntensity:{value:ne.edgeIntensity},mapIntensity:{value:ne.mapIntensity},epicenter:{value:ne.epicenter},progress:{value:ne.progress},dirX:{value:(f=ne.dir)==null?void 0:f.x},dirY:{value:(x=ne.dir)==null?void 0:x.y}},vertexShader:Yn,fragmentShader:Qn},r),...I})},[r]),c=G(n,t);R(v)("uResolution",c.clone());const u=E(e,l,v,a.Mesh);return{material:v,mesh:u}},ne=Object.freeze({texture0:T,texture1:T,padding:0,map:T,mapIntensity:0,edgeIntensity:0,epicenter:new a.Vector2(0,0),progress:0,dir:new a.Vector2(0,0)}),Jn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Zn({scene:c,size:e,dpr:v.shader,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,dpr:v.fbo,size:e,samples:t,isSizeUpdate:r}),[o,g]=k(ne),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{var P,B,D,W,N,oe,X,ae;const{gl:_}=y;p(h,b),s("uTexture0",o.texture0),s("uTexture1",o.texture1),s("progress",o.progress);const w=[((B=(P=o.texture0)==null?void 0:P.image)==null?void 0:B.width)||0,((W=(D=o.texture0)==null?void 0:D.image)==null?void 0:W.height)||0],A=[((oe=(N=o.texture1)==null?void 0:N.image)==null?void 0:oe.width)||0,((ae=(X=o.texture1)==null?void 0:X.image)==null?void 0:ae.height)||0],z=w.map((se,K)=>se+(A[K]-se)*o.progress);return s("uTextureResolution",z),s("padding",o.padding),s("uMap",o.map),s("mapIntensity",o.mapIntensity),s("edgeIntensity",o.edgeIntensity),s("epicenter",o.epicenter),s("dirX",o.dir.x),s("dirY",o.dir.y),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var et="#usf <planeVertex>",nt=`precision highp float;

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
}`;const tt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_texture:{value:T},u_brightness:{value:fe.brightness},u_min:{value:fe.min},u_max:{value:fe.max}},vertexShader:et,fragmentShader:nt},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},fe=Object.freeze({texture:T,brightness:new a.Vector3(.5,.5,.5),min:0,max:1}),rt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=tt({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(fe),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("u_texture",o.texture),s("u_brightness",o.brightness),s("u_min",o.min),s("u_max",o.max),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var ot="#usf <planeVertex>",at=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;const ut=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_texture:{value:T},uMap:{value:T},uMapIntensity:{value:Ce.mapIntensity}},vertexShader:ot,fragmentShader:at},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},Ce=Object.freeze({texture:T,map:T,mapIntensity:.3}),it=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=ut({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(Ce),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("u_texture",o.texture),s("uMap",o.map),s("uMapIntensity",o.mapIntensity),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var st="#usf <planeVertex>",lt=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const ct=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uMap:{value:T}},vertexShader:st,fragmentShader:lt},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},Ae=Object.freeze({texture:T,map:T}),mt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=ct({scene:c,size:e,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(Ae),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("uTexture",o.texture),s("uMap",o.map),M(_)},[s,M,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var vt="#usf <planeVertex>",ft=`precision highp float;

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
}`;const pt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_texture:{value:T},u_brightness:{value:Me.brightness},u_saturation:{value:Me.saturation}},vertexShader:vt,fragmentShader:ft},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},Me=Object.freeze({texture:T,brightness:1,saturation:1}),dt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=pt({scene:c,size:e,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(Me),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("u_texture",o.texture),s("u_brightness",o.brightness),s("u_saturation",o.saturation),M(_)},[s,M,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var ht="#usf <planeVertex>",gt=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;const xt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),v=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture:{value:T}},vertexShader:ht,fragmentShader:gt},r),...I}),[r]),c=G(n,t);R(v)("uResolution",c.clone());const u=E(e,l,v,a.Mesh);return{material:v,mesh:u}},Fe=Object.freeze({texture:T}),Mt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=xt({scene:c,size:e,dpr:v.shader,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,dpr:v.fbo,size:e,samples:t,isSizeUpdate:r}),[o,g]=k(Fe),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{var w,A,z,P,B,D;const{gl:_}=y;return p(h,b),s("uTexture",o.texture),s("uTextureResolution",[((z=(A=(w=o.texture)==null?void 0:w.source)==null?void 0:A.data)==null?void 0:z.width)||0,((D=(B=(P=o.texture)==null?void 0:P.source)==null?void 0:B.data)==null?void 0:D.height)||0]),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var yt="#usf <planeVertex>",bt=`precision highp float;

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
}`;const St=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uResolution:{value:new a.Vector2(0,0)},uBlurSize:{value:_e.blurSize}},vertexShader:yt,fragmentShader:bt},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},_e=Object.freeze({texture:T,blurSize:3,blurPower:5}),Ct=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=St({scene:c,onBeforeInit:l}),f=L(e),x=i.useMemo(()=>({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[c,f,e,v.fbo,t,r]),[M,o]=te(x),[g,s]=k(_e),m=R(u),p=F(u),C=i.useCallback((h,b)=>{s(h),p(b)},[s,p]);return[i.useCallback((h,b,_)=>{var P,B,D,W,N,oe;const{gl:w}=h;C(b,_),m("uTexture",g.texture),m("uResolution",[((D=(B=(P=g.texture)==null?void 0:P.source)==null?void 0:B.data)==null?void 0:D.width)||0,((oe=(N=(W=g.texture)==null?void 0:W.source)==null?void 0:N.data)==null?void 0:oe.height)||0]),m("uBlurSize",g.blurSize);let A=o(w);const z=g.blurPower;for(let X=0;X<z;X++)m("uTexture",A),A=o(w);return A},[o,m,g,C]),C,{scene:c,mesh:d,material:u,camera:f,renderTarget:M,output:M.read.texture}]};var _t="#usf <planeVertex>",wt=`precision highp float;

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
}`;const Tt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uBegin:{value:pe.begin},uEnd:{value:pe.end},uStrength:{value:pe.strength}},vertexShader:_t,fragmentShader:wt},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},pe=Object.freeze({texture:T,begin:new a.Vector2(0,0),end:new a.Vector2(0,0),strength:.9}),Dt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Tt({scene:c,onBeforeInit:l}),f=L(e),x=i.useMemo(()=>({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[c,f,e,v.fbo,t,r]),[M,o]=te(x),[g,s]=k(pe),m=R(u),p=F(u),C=i.useCallback((h,b)=>{s(h),p(b)},[s,p]);return[i.useCallback((h,b,_)=>{const{gl:w}=h;return C(b,_),m("uTexture",g.texture),m("uBegin",g.begin),m("uEnd",g.end),m("uStrength",g.strength),o(w,({read:A})=>{m("uBackbuffer",A)})},[o,m,C,g]),C,{scene:c,mesh:d,material:u,camera:f,renderTarget:M,output:M.read.texture}]};var Pt="#usf <planeVertex>",Rt=`precision highp float;

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
}`;const At=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uEpicenter:{value:ce.epicenter},uProgress:{value:ce.progress},uStrength:{value:ce.strength},uWidth:{value:ce.width},uMode:{value:0}},vertexShader:Pt,fragmentShader:Rt},n),...I}),[n]),l=E(e,t,r,a.Mesh);return{material:r,mesh:l}},ce=Object.freeze({epicenter:new a.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),Ft=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=At({scene:c,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(ce),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("uEpicenter",o.epicenter),s("uProgress",o.progress),s("uWidth",o.width),s("uStrength",o.strength),s("uMode",o.mode==="center"?0:o.mode==="horizontal"?1:2),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var Vt="#usf <planeVertex>",It=`precision highp float;
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
}`;const zt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),v=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{u_texture:{value:T},u_resolution:{value:new a.Vector2},u_keyColor:{value:Y.color},u_similarity:{value:Y.similarity},u_smoothness:{value:Y.smoothness},u_spill:{value:Y.spill},u_color:{value:Y.color},u_contrast:{value:Y.contrast},u_brightness:{value:Y.brightness},u_gamma:{value:Y.gamma}},vertexShader:Vt,fragmentShader:It},r),...I}),[r]),c=G(n,t);R(v)("u_resolution",c.clone());const u=E(e,l,v,a.Mesh);return{material:v,mesh:u}},Y=Object.freeze({texture:T,keyColor:new a.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new a.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=zt({scene:c,size:e,dpr:v.shader,onBeforeInit:l}),f=L(e),[x,M]=$({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[o,g]=k(Y),s=R(u),m=F(u),p=i.useCallback((y,h)=>{g(y),m(h)},[g,m]);return[i.useCallback((y,h,b)=>{const{gl:_}=y;return p(h,b),s("u_texture",o.texture),s("u_keyColor",o.keyColor),s("u_similarity",o.similarity),s("u_smoothness",o.smoothness),s("u_spill",o.spill),s("u_color",o.color),s("u_contrast",o.contrast),s("u_brightness",o.brightness),s("u_gamma",o.gamma),M(_)},[M,s,o,p]),p,{scene:c,mesh:d,material:u,camera:f,renderTarget:x,output:x.texture}]};var Ut=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,Bt=`precision highp float;

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
}`;const Et=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const l=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),v=i.useMemo(()=>new a.ShaderMaterial({...V({uniforms:{uTexture:{value:T},uBackbuffer:{value:T},uTime:{value:0},uPointer:{value:new a.Vector2},uResolution:{value:new a.Vector2}},vertexShader:Ut,fragmentShader:Bt},r),...I}),[r]),c=G(n,t);R(v)("uResolution",c.clone());const u=E(e,l,v,a.Mesh);return{material:v,mesh:u}},Ve=Object.freeze({texture:T,beat:!1}),Lt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l})=>{const v=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Et({scene:c,size:e,dpr:v.shader,onBeforeInit:l}),f=L(e),x=i.useMemo(()=>({scene:c,camera:f,size:e,dpr:v.fbo,samples:t,isSizeUpdate:r}),[c,f,e,v.fbo,t,r]),[M,o]=te(x),[g,s]=k(Ve),m=R(u),p=F(u),C=i.useCallback((h,b)=>{s(h),p(b)},[s,p]);return[i.useCallback((h,b,_)=>{const{gl:w,clock:A,pointer:z}=h;return C(b,_),m("uPointer",z),m("uTexture",g.texture),m("uTime",g.beat||A.getElapsedTime()),o(w,({read:P})=>{m("uBackbuffer",P)})},[o,m,g,C]),C,{scene:c,mesh:d,material:u,camera:f,renderTarget:M,output:M.read.texture}]},kt=({scene:e,geometry:n,material:t})=>{const r=E(e,n,t,a.Points),l=E(e,i.useMemo(()=>n.clone(),[n]),i.useMemo(()=>t.clone(),[t]),a.Mesh);return l.visible=!1,{points:r,interactiveMesh:l}};var $t=`uniform vec2 uResolution;
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
}`,jt=`precision highp float;
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
}`;const Ie=(e,n,t,r,l)=>{var x;const v=t==="position"?"positionTarget":"uvTarget",c=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",u=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",d=t==="position"?"positionsList":"uvsList",f=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new a.BufferAttribute(e[0],l));let M="",o="";e.forEach((g,s)=>{n.setAttribute(`${v}${s}`,new a.BufferAttribute(g,l)),M+=`attribute vec${l} ${v}${s};
`,s===0?o+=`${v}${s}`:o+=`,${v}${s}`}),r=r.replace(`${c}`,M),r=r.replace(`${u}`,`vec${l} ${d}[${e.length}] = vec${l}[](${o});
				${f}
			`)}else r=r.replace(`${c}`,""),r=r.replace(`${u}`,""),(x=n==null?void 0:n.attributes[t])!=null&&x.array||Te&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},ze=(e,n,t,r)=>{var v;let l=[];if(e&&e.length>0){(v=n==null?void 0:n.attributes[t])!=null&&v.array?l=[n.attributes[t].array,...e]:l=e;const c=Math.max(...l.map(u=>u.length));l.forEach((u,d)=>{if(u.length<c){const f=(c-u.length)/r,x=[],M=Array.from(u);for(let o=0;o<f;o++){const g=Math.floor(u.length/r*Math.random())*r;for(let s=0;s<r;s++)x.push(M[g+s])}l[d]=new Float32Array([...M,...x])}})}return l},Wt=(e,n)=>{let t="";const r={};let l="mapArrayColor = ";return e&&e.length>0?(e.forEach((c,u)=>{const d=`vMapArrayIndex < ${u}.1`,f=`texture2D(uMapArray${u}, uv)`;l+=`( ${d} ) ? ${f} : `,t+=`
        uniform sampler2D uMapArray${u};
      `,r[`uMapArray${u}`]={value:c}}),l+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(l+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",l).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},qt=({size:e,dpr:n,geometry:t,positions:r,uvs:l,mapArray:v,onBeforeInit:c})=>{const u=i.useMemo(()=>ze(r,t,"position",3),[r,t]),d=i.useMemo(()=>ze(l,t,"uv",2),[l,t]),f=i.useMemo(()=>{u.length!==d.length&&Te&&console.log("use-shader-fx:positions and uvs are not matched");const M=Ie(d,t,"uv",Ie(u,t,"position",$t,3),2),{rewritedFragmentShader:o,mapArrayUniforms:g}=Wt(v,jt);return new a.ShaderMaterial({...V({uniforms:{uResolution:{value:new a.Vector2(0,0)},uMorphProgress:{value:U.morphProgress},uBlurAlpha:{value:U.blurAlpha},uBlurRadius:{value:U.blurRadius},uPointSize:{value:U.pointSize},uPointAlpha:{value:U.pointAlpha},uPicture:{value:T},uIsPicture:{value:!1},uAlphaPicture:{value:T},uIsAlphaPicture:{value:!1},uColor0:{value:U.color0},uColor1:{value:U.color1},uColor2:{value:U.color2},uColor3:{value:U.color3},uMap:{value:T},uIsMap:{value:!1},uAlphaMap:{value:T},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:U.wobblePositionFrequency},uWobbleTimeFrequency:{value:U.wobbleTimeFrequency},uWobbleStrength:{value:U.wobbleStrength},uWarpPositionFrequency:{value:U.warpPositionFrequency},uWarpTimeFrequency:{value:U.warpTimeFrequency},uWarpStrength:{value:U.warpStrength},uDisplacement:{value:T},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:U.displacementIntensity},uDisplacementColorIntensity:{value:U.displacementColorIntensity},uSizeRandomIntensity:{value:U.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:U.sizeRandomTimeFrequency},uSizeRandomMin:{value:U.sizeRandomMin},uSizeRandomMax:{value:U.sizeRandomMax},uDivergence:{value:U.divergence},uDivergencePoint:{value:U.divergencePoint},...g},vertexShader:M,fragmentShader:o},c),...I,blending:a.AdditiveBlending,transparent:!0})},[t,u,d,v,c]),x=G(e,n);return R(f)("uResolution",x.clone()),{material:f,modifiedPositions:u,modifiedUvs:d}},Oe=({size:e,dpr:n,scene:t=!1,geometry:r,positions:l,uvs:v,mapArray:c,onBeforeInit:u})=>{const d=O(n),f=i.useMemo(()=>{const y=r||new a.SphereGeometry(1,32,32);return y.setIndex(null),y.deleteAttribute("normal"),y},[r]),{material:x,modifiedPositions:M,modifiedUvs:o}=qt({size:e,dpr:d.shader,geometry:f,positions:l,uvs:v,mapArray:c,onBeforeInit:u}),{points:g,interactiveMesh:s}=kt({scene:t,geometry:f,material:x}),m=R(x),p=F(x);return[i.useCallback((y,h,b)=>{y&&m("uTime",(h==null?void 0:h.beat)||y.clock.getElapsedTime()),h!==void 0&&(m("uMorphProgress",h.morphProgress),m("uBlurAlpha",h.blurAlpha),m("uBlurRadius",h.blurRadius),m("uPointSize",h.pointSize),m("uPointAlpha",h.pointAlpha),h.picture?(m("uPicture",h.picture),m("uIsPicture",!0)):h.picture===!1&&m("uIsPicture",!1),h.alphaPicture?(m("uAlphaPicture",h.alphaPicture),m("uIsAlphaPicture",!0)):h.alphaPicture===!1&&m("uIsAlphaPicture",!1),m("uColor0",h.color0),m("uColor1",h.color1),m("uColor2",h.color2),m("uColor3",h.color3),h.map?(m("uMap",h.map),m("uIsMap",!0)):h.map===!1&&m("uIsMap",!1),h.alphaMap?(m("uAlphaMap",h.alphaMap),m("uIsAlphaMap",!0)):h.alphaMap===!1&&m("uIsAlphaMap",!1),m("uWobbleStrength",h.wobbleStrength),m("uWobblePositionFrequency",h.wobblePositionFrequency),m("uWobbleTimeFrequency",h.wobbleTimeFrequency),m("uWarpStrength",h.warpStrength),m("uWarpPositionFrequency",h.warpPositionFrequency),m("uWarpTimeFrequency",h.warpTimeFrequency),h.displacement?(m("uDisplacement",h.displacement),m("uIsDisplacement",!0)):h.displacement===!1&&m("uIsDisplacement",!1),m("uDisplacementIntensity",h.displacementIntensity),m("uDisplacementColorIntensity",h.displacementColorIntensity),m("uSizeRandomIntensity",h.sizeRandomIntensity),m("uSizeRandomTimeFrequency",h.sizeRandomTimeFrequency),m("uSizeRandomMin",h.sizeRandomMin),m("uSizeRandomMax",h.sizeRandomMax),m("uDivergence",h.divergence),m("uDivergencePoint",h.divergencePoint),p(b))},[m,p]),{points:g,interactiveMesh:s,positions:M,uvs:o}]},U=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new a.Vector3(0),beat:!1}),Nt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:l,geometry:v,positions:c,uvs:u,onBeforeInit:d})=>{const f=O(n),x=i.useMemo(()=>new a.Scene,[]),[M,{points:o,interactiveMesh:g,positions:s,uvs:m}]=Oe({scene:x,size:e,dpr:n,geometry:v,positions:c,uvs:u,onBeforeInit:d}),[p,C]=$({scene:x,camera:l,size:e,dpr:f.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),y=i.useCallback((b,_,w)=>(M(b,_,w),C(b.gl)),[C,M]),h=i.useCallback((b,_)=>{M(null,b,_)},[M]);return[y,h,{scene:x,points:o,interactiveMesh:g,renderTarget:p,output:p.texture,positions:s,uvs:m}]};function Gt(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},r=e.getIndex(),l=e.getAttribute("position"),v=r?r.count:l.count;let c=0;const u=Object.keys(e.attributes),d={},f={},x=[],M=["getX","getY","getZ","getW"];for(let m=0,p=u.length;m<p;m++){const C=u[m];d[C]=[];const y=e.morphAttributes[C];y&&(f[C]=new Array(y.length).fill(0).map(()=>[]))}const o=Math.log10(1/n),g=Math.pow(10,o);for(let m=0;m<v;m++){const p=r?r.getX(m):m;let C="";for(let y=0,h=u.length;y<h;y++){const b=u[y],_=e.getAttribute(b),w=_.itemSize;for(let A=0;A<w;A++)C+=`${~~(_[M[A]](p)*g)},`}if(C in t)x.push(t[C]);else{for(let y=0,h=u.length;y<h;y++){const b=u[y],_=e.getAttribute(b),w=e.morphAttributes[b],A=_.itemSize,z=d[b],P=f[b];for(let B=0;B<A;B++){const D=M[B];if(z.push(_[D](p)),w)for(let W=0,N=w.length;W<N;W++)P[W].push(w[W][D](p))}}t[C]=c,x.push(c),c++}}const s=e.clone();for(let m=0,p=u.length;m<p;m++){const C=u[m],y=e.getAttribute(C),h=new y.array.constructor(d[C]),b=new ue.BufferAttribute(h,y.itemSize,y.normalized);if(s.setAttribute(C,b),C in f)for(let _=0;_<f[C].length;_++){const w=e.morphAttributes[C][_],A=new w.array.constructor(f[C][_]),z=new ue.BufferAttribute(A,w.itemSize,w.normalized);s.morphAttributes[C][_]=z}}return s.setIndex(x),s}const Ue=e=>{e.vertexShader=e.vertexShader.replace("void main() {",`
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
		`)},Kt=e=>{e.fragmentShader=e.fragmentShader.replace("#include <color_fragment>",`
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
		`)};var Xt=`#ifdef USE_TRANSMISSION

	
	

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
#endif`,Ht=`#ifdef USE_TRANSMISSION

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

#endif`;const Yt=({mat:e,isCustomTransmission:n,parameters:t})=>{e.type==="MeshPhysicalMaterial"&&n&&(t.fragmentShader=t.fragmentShader.replace("#include <transmission_pars_fragment>",`${Xt}`),t.fragmentShader=t.fragmentShader.replace("#include <transmission_fragment>",`${Ht}`)),e.normalMap||(t.vertexShader=t.vertexShader.replace("void main() {",`
				attribute vec4 tangent;
				
				void main() {
			`))},Qt=({baseMaterial:e,materialParameters:n,isCustomTransmission:t=!1,onBeforeInit:r,depthOnBeforeInit:l})=>{const{material:v,depthMaterial:c}=i.useMemo(()=>{const u=new(e||a.MeshPhysicalMaterial)(n||{});Object.assign(u.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:j.wobblePositionFrequency},uWobbleTimeFrequency:{value:j.wobbleTimeFrequency},uWobbleStrength:{value:j.wobbleStrength},uWarpPositionFrequency:{value:j.warpPositionFrequency},uWarpTimeFrequency:{value:j.warpTimeFrequency},uWarpStrength:{value:j.warpStrength},uColor0:{value:j.color0},uColor1:{value:j.color1},uColor2:{value:j.color2},uColor3:{value:j.color3},uColorMix:{value:j.colorMix},uEdgeThreshold:{value:j.edgeThreshold},uEdgeColor:{value:j.edgeColor},uChromaticAberration:{value:j.chromaticAberration},uAnisotropicBlur:{value:j.anisotropicBlur},uDistortion:{value:j.distortion},uDistortionScale:{value:j.distortionScale},uTemporalDistortion:{value:j.temporalDistortion},uRefractionSamples:{value:j.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),u.onBeforeCompile=f=>{Ue(f),Kt(f),Yt({parameters:f,mat:u,isCustomTransmission:t});const x=V({fragmentShader:f.fragmentShader,vertexShader:f.vertexShader,uniforms:u.userData.uniforms},r);f.fragmentShader=x.fragmentShader,f.vertexShader=x.vertexShader,Object.assign(f.uniforms,x.uniforms)},u.needsUpdate=!0;const d=new a.MeshDepthMaterial({depthPacking:a.RGBADepthPacking});return d.onBeforeCompile=f=>{Object.assign(f.uniforms,u.userData.uniforms),Ue(f),V(f,l)},d.needsUpdate=!0,{material:u,depthMaterial:d}},[n,e,r,l,t]);return{material:v,depthMaterial:c}},Be=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:l,onBeforeInit:v,depthOnBeforeInit:c})=>{const u=i.useMemo(()=>{let m=n||new a.IcosahedronGeometry(2,20);return m=Gt(m),m.computeTangents(),m},[n]),{material:d,depthMaterial:f}=Qt({baseMaterial:r,materialParameters:l,isCustomTransmission:t,onBeforeInit:v,depthOnBeforeInit:c}),x=E(e,u,d,a.Mesh),M=d.userData,o=R(M),g=F(M);return[i.useCallback((m,p,C)=>{m&&o("uTime",(p==null?void 0:p.beat)||m.clock.getElapsedTime()),p!==void 0&&(o("uWobbleStrength",p.wobbleStrength),o("uWobblePositionFrequency",p.wobblePositionFrequency),o("uWobbleTimeFrequency",p.wobbleTimeFrequency),o("uWarpStrength",p.warpStrength),o("uWarpPositionFrequency",p.warpPositionFrequency),o("uWarpTimeFrequency",p.warpTimeFrequency),o("uColor0",p.color0),o("uColor1",p.color1),o("uColor2",p.color2),o("uColor3",p.color3),o("uColorMix",p.colorMix),o("uEdgeThreshold",p.edgeThreshold),o("uEdgeColor",p.edgeColor),o("uChromaticAberration",p.chromaticAberration),o("uAnisotropicBlur",p.anisotropicBlur),o("uDistortion",p.distortion),o("uDistortionScale",p.distortionScale),o("uRefractionSamples",p.refractionSamples),o("uTemporalDistortion",p.temporalDistortion),g(C))},[o,g]),{mesh:x,depthMaterial:f}]},j=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new a.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),Zt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:l,geometry:v,baseMaterial:c,materialParameters:u,isCustomTransmission:d,onBeforeInit:f,depthOnBeforeInit:x})=>{const M=O(n),o=i.useMemo(()=>new a.Scene,[]),[g,{mesh:s,depthMaterial:m}]=Be({baseMaterial:c,materialParameters:u,scene:o,geometry:v,isCustomTransmission:d,onBeforeInit:f,depthOnBeforeInit:x}),[p,C]=$({scene:o,camera:l,size:e,dpr:M.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),y=i.useCallback((b,_,w)=>(g(b,_,w),C(b.gl)),[C,g]),h=i.useCallback((b,_)=>{g(null,b,_)},[g]);return[y,h,{scene:o,mesh:s,depthMaterial:m,renderTarget:p,output:p.texture}]},Jt=(e,n,t)=>{const r=i.useMemo(()=>{const l=new a.Mesh(n,t);return e.add(l),l},[n,t,e]);return i.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},de=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-de.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-de.easeOutBounce(1-2*e))/2:(1+de.easeOutBounce(2*e-1))/2}});function er(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const nr=(e,n="easeOutQuart")=>{const t=e/60,r=de[n];return i.useCallback(v=>{let c=v.getElapsedTime()*t;const u=Math.floor(c),d=r(c-u);c=d+u;const f=er(u);return{beat:c,floor:u,fract:d,hash:f}},[t,r])},tr=(e=60)=>{const n=i.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=i.useRef(null);return i.useCallback(l=>{const v=l.getElapsedTime();return t.current===null||v-t.current>=n?(t.current=v,!0):!1},[n])},rr=e=>{var r,l;const n=(r=e.dom)==null?void 0:r.length,t=(l=e.texture)==null?void 0:l.length;return!n||!t||n!==t};var or=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,ar=`precision highp float;

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
}`;const ur=({params:e,scene:n,onBeforeInit:t})=>{n.children.length>0&&(n.children.forEach(r=>{r instanceof a.Mesh&&(r.geometry.dispose(),r.material.dispose())}),n.remove(...n.children)),e.texture.forEach((r,l)=>{const v=new a.ShaderMaterial({...V({uniforms:{u_texture:{value:r},u_textureResolution:{value:new a.Vector2(0,0)},u_resolution:{value:new a.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[l]?e.boderRadius[l]:0}},vertexShader:or,fragmentShader:ar},t),...I,transparent:!0}),c=new a.Mesh(new a.PlaneGeometry(1,1),v);n.add(c)})},ir=()=>{const e=i.useRef([]),n=i.useRef([]);return i.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:l,params:v})=>{e.current.length>0&&e.current.forEach((u,d)=>{u.unobserve(n.current[d])}),n.current=[],e.current=[];const c=new Array(v.dom.length).fill(!1);r.current=[...c],l.current=[...c],v.dom.forEach((u,d)=>{const f=M=>{M.forEach(o=>{v.onIntersect[d]&&v.onIntersect[d](o),r.current[d]=o.isIntersecting})},x=new IntersectionObserver(f,{rootMargin:"0px",threshold:0});x.observe(u),e.current.push(x),n.current.push(u)})},[])},sr=()=>{const e=i.useRef([]),n=i.useCallback(({params:t,customParams:r,size:l,resolutionRef:v,scene:c,isIntersectingRef:u})=>{c.children.length!==e.current.length&&(e.current=new Array(c.children.length)),c.children.forEach((d,f)=>{var o,g,s,m,p,C;const x=t.dom[f];if(!x)return;const M=x.getBoundingClientRect();if(e.current[f]=M,d.scale.set(M.width,M.height,1),d.position.set(M.left+M.width*.5-l.width*.5,-M.top-M.height*.5+l.height*.5,0),u.current[f]&&(t.rotation[f]&&d.rotation.copy(t.rotation[f]),d instanceof a.Mesh)){const y=d.material,h=R(y),b=F(y);h("u_texture",t.texture[f]),h("u_textureResolution",[((s=(g=(o=t.texture[f])==null?void 0:o.source)==null?void 0:g.data)==null?void 0:s.width)||0,((C=(p=(m=t.texture[f])==null?void 0:m.source)==null?void 0:p.data)==null?void 0:C.height)||0]),h("u_resolution",v.current.set(M.width,M.height)),h("u_borderRadius",t.boderRadius[f]?t.boderRadius[f]:0),b(r)}})},[]);return[e.current,n]},lr=()=>{const e=i.useRef([]),n=i.useRef([]),t=i.useCallback((r,l=!1)=>{e.current.forEach((c,u)=>{c&&(n.current[u]=!0)});const v=l?[...n.current]:[...e.current];return r<0?v:v[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},cr=e=>({onView:t,onHidden:r})=>{const l=i.useRef(!1);i.useEffect(()=>{let v;const c=()=>{e.current.some(u=>u)?l.current||(t&&t(),l.current=!0):l.current&&(r&&r(),l.current=!1),v=requestAnimationFrame(c)};return v=requestAnimationFrame(c),()=>{cancelAnimationFrame(v)}},[t,r])},Ee={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},mr=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:l},v=[])=>{const c=O(n),u=i.useMemo(()=>new a.Scene,[]),d=L(e),[f,x]=$({scene:u,camera:d,size:e,dpr:c.fbo,samples:t,isSizeUpdate:r}),[M,o]=k({...Ee,updateKey:performance.now()}),[g,s]=sr(),m=i.useRef(new a.Vector2(0,0)),[p,C]=i.useState(!0);i.useMemo(()=>C(!0),v);const y=i.useRef(null),h=i.useMemo(()=>T,[]),b=ir(),{isIntersectingOnceRef:_,isIntersectingRef:w,isIntersecting:A}=lr(),z=cr(w),P=i.useMemo(()=>(D,W)=>{o(D),s({params:M,customParams:W,size:e,resolutionRef:m,scene:u,isIntersectingRef:w})},[w,o,s,e,u,M]);return[i.useCallback((D,W,N)=>{const{gl:oe,size:X}=D;if(P(W,N),rr(M))return h;if(p){if(y.current===M.updateKey)return h;y.current=M.updateKey}return p&&(ur({params:M,size:X,scene:u,onBeforeInit:l}),b({isIntersectingRef:w,isIntersectingOnceRef:_,params:M}),C(!1)),x(oe)},[x,b,l,P,p,u,M,_,w,h]),P,{scene:u,camera:d,renderTarget:f,output:f.texture,isIntersecting:A,DOMRects:g,intersections:w.current,useDomView:z}]},vr=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:l=!1,samples:v=0,depthBuffer:c=!1,depthTexture:u=!1},d)=>{const f=i.useRef([]),x=G(t,r);f.current=i.useMemo(()=>Array.from({length:d},()=>{const o=new a.WebGLRenderTarget(x.x,x.y,{...ve,samples:v,depthBuffer:c});return u&&(o.depthTexture=new a.DepthTexture(x.x,x.y,a.FloatType)),o}),[d]),l&&f.current.forEach(o=>o.setSize(x.x,x.y)),i.useEffect(()=>{const o=f.current;return()=>{o.forEach(g=>g.dispose())}},[d]);const M=i.useCallback((o,g,s)=>{const m=f.current[g];return ge({gl:o,scene:e,camera:n,fbo:m,onBeforeRender:()=>s&&s({read:m.texture})}),m.texture},[e,n]);return[f.current,M]},fr=Object.freeze({interpolate(e,n,t,r=1e-6){const l=e+(n-e)*t;return Math.abs(l)<r?0:l}});S.ALPHABLENDING_PARAMS=Ae,S.BLANK_PARAMS=Ve,S.BLENDING_PARAMS=le,S.BRIGHTNESSPICKER_PARAMS=fe,S.BRUSH_PARAMS=Q,S.CHROMAKEY_PARAMS=Y,S.COLORSTRATA_PARAMS=H,S.COSPALETTE_PARAMS=ie,S.COVERTEXTURE_PARAMS=Fe,S.DELTA_TIME=Se,S.DOMSYNCER_PARAMS=Ee,S.DUOTONE_PARAMS=xe,S.Easing=de,S.FBO_OPTION=ve,S.FLUID_PARAMS=Pe,S.FXBLENDING_PARAMS=Ce,S.FXTEXTURE_PARAMS=ne,S.HSV_PARAMS=Me,S.MARBLE_PARAMS=re,S.MORPHPARTICLES_PARAMS=U,S.MOTIONBLUR_PARAMS=pe,S.NOISE_PARAMS=ee,S.RIPPLE_PARAMS=Re,S.SIMPLEBLUR_PARAMS=_e,S.ShaderChunk=De,S.Utils=fr,S.WAVE_PARAMS=ce,S.WOBBLE3D_PARAMS=j,S.renderFBO=ge,S.setCustomUniform=F,S.setUniform=R,S.useAddMesh=Jt,S.useAlphaBlending=mt,S.useBeat=nr,S.useBlank=Lt,S.useBlending=Hn,S.useBrightnessPicker=rt,S.useBrush=en,S.useCamera=L,S.useChromaKey=Ot,S.useColorStrata=In,S.useCopyTexture=vr,S.useCosPalette=$n,S.useCoverTexture=Mt,S.useCreateMorphParticles=Oe,S.useCreateWobble3D=Be,S.useDomSyncer=mr,S.useDoubleFBO=te,S.useDuoTone=Nn,S.useFPSLimiter=tr,S.useFluid=bn,S.useFxBlending=it,S.useFxTexture=Jn,S.useHSV=dt,S.useMarble=Bn,S.useMorphParticles=Nt,S.useMotionBlur=Dt,S.useNoise=Rn,S.useParams=k,S.usePointer=he,S.useResolution=G,S.useRipple=wn,S.useSimpleBlur=Ct,S.useSingleFBO=$,S.useWave=Ft,S.useWobble3D=Zt,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
