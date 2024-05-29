(function(b,me){typeof exports=="object"&&typeof module<"u"?me(exports,require("three"),require("react"),require("three-stdlib")):typeof define=="function"&&define.amd?define(["exports","three","react","three-stdlib"],me):(b=typeof globalThis<"u"?globalThis:b||self,me(b["use-shader-fx"]={},b.THREE,b.React,b.THREEStdlib))})(this,function(b,me,i,je){"use strict";function qe(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const a=qe(me);var We="#usf <planeVertex>",Ne=`precision highp float;

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
}`;const N=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return i.useMemo(()=>new a.Vector2(t,r),[t,r])},P=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},A=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},B=(e,n,t,r)=>{const s=i.useMemo(()=>{const m=new r(n,t);return e&&e.add(m),m},[n,t,r,e]);return i.useEffect(()=>()=>{e&&e.remove(s),n.dispose(),t.dispose()},[e,n,t,s]),s},we=process.env.NODE_ENV==="development",V={transparent:!1,depthTest:!1,depthWrite:!1},C=new a.DataTexture(new Uint8Array([0,0,0,0]),1,1,a.RGBAFormat);var Ge=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`,Ke=`vec3 random3(vec3 c) {
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
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`,Xe=`vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`,Ye=`precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Qe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;const De=Object.freeze({wobble3D:Ge,snoise:Ke,coverTexture:He,fxBlending:Xe,planeVertex:Ye,defaultVertex:Qe}),Ze=/^[ \t]*#usf +<([\w\d./]+)>/gm;function Je(e,n){return be(De[n]||"")}function be(e){return e.replace(Ze,Je)}const F=(e,n)=>(n&&n(e),e.vertexShader=be(e.vertexShader),e.fragmentShader=be(e.fragmentShader),e),en=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uBuffer:{value:C},uResolution:{value:new a.Vector2(0,0)},uTexture:{value:C},uIsTexture:{value:!1},uMap:{value:C},uIsMap:{value:!1},uMapIntensity:{value:Y.mapIntensity},uRadius:{value:Y.radius},uSmudge:{value:Y.smudge},uDissipation:{value:Y.dissipation},uMotionBlur:{value:Y.motionBlur},uMotionSample:{value:Y.motionSample},uMouse:{value:new a.Vector2(-10,-10)},uPrevMouse:{value:new a.Vector2(-10,-10)},uVelocity:{value:new a.Vector2(0,0)},uColor:{value:Y.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1}},vertexShader:We,fragmentShader:Ne},r),...V,transparent:!0}),[r]),c=N(n,t);P(m)("uResolution",c.clone());const u=B(e,s,m,a.Mesh);return{material:m,mesh:u}},nn=(e,n)=>{const t=n,r=e/n,[s,m]=[t*r/2,t/2];return{width:s,height:m,near:-1e3,far:1e3}},E=(e,n="OrthographicCamera")=>{const t=N(e),{width:r,height:s,near:m,far:c}=nn(t.x,t.y);return i.useMemo(()=>n==="OrthographicCamera"?new a.OrthographicCamera(-r,r,s,-s,m,c):new a.PerspectiveCamera(50,r/s),[r,s,m,c,n])},ge=(e=0)=>{const n=i.useRef(new a.Vector2(0,0)),t=i.useRef(new a.Vector2(0,0)),r=i.useRef(new a.Vector2(0,0)),s=i.useRef(0),m=i.useRef(new a.Vector2(0,0)),c=i.useRef(!1);return i.useCallback(d=>{const p=performance.now();let x;c.current&&e?(r.current=r.current.lerp(d,1-e),x=r.current.clone()):(x=d.clone(),r.current=x),s.current===0&&(s.current=p,n.current=x);const M=Math.max(1,p-s.current);s.current=p,m.current.copy(x).sub(n.current).divideScalar(M);const o=m.current.length()>0,h=c.current?n.current.clone():x;return!c.current&&o&&(c.current=!0),n.current=x,{currentPointer:x,prevPointer:h,diffPointer:t.current.subVectors(x,h),velocity:m.current,isVelocityUpdate:o}},[e])},L=e=>{const n=s=>Object.values(s).some(m=>typeof m=="function"),t=i.useRef(n(e)?e:structuredClone(e)),r=i.useCallback(s=>{if(s!==void 0)for(const m in s){const c=m;c in t.current&&s[c]!==void 0&&s[c]!==null?t.current[c]=s[c]:console.error(`"${String(c)}" does not exist in the params. or "${String(c)}" is null | undefined`)}},[]);return[t.current,r]},ve={minFilter:a.LinearFilter,magFilter:a.LinearFilter,type:a.HalfFloatType,stencilBuffer:!1,depthBuffer:!1,samples:0},he=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:s,onSwap:m})=>{e.setRenderTarget(n),s(),e.clear(),e.render(t,r),m&&m(),e.setRenderTarget(null),e.clear()},k=e=>{var M;const{scene:n,camera:t,size:r,dpr:s=!1,isSizeUpdate:m=!1,depth:c=!1,...u}=e,d=i.useRef(),p=N(r,s);d.current=i.useMemo(()=>{const o=new a.WebGLRenderTarget(p.x,p.y,{...ve,...u});return c&&(o.depthTexture=new a.DepthTexture(p.x,p.y,a.FloatType)),o},[]),m&&((M=d.current)==null||M.setSize(p.x,p.y)),i.useEffect(()=>{const o=d.current;return()=>{o==null||o.dispose()}},[]);const x=i.useCallback((o,h)=>{const l=d.current;return he({gl:o,fbo:l,scene:n,camera:t,onBeforeRender:()=>h&&h({read:l.texture})}),l.texture},[n,t]);return[d.current,x]},ne=e=>{var M,o;const{scene:n,camera:t,size:r,dpr:s=!1,isSizeUpdate:m=!1,depth:c=!1,...u}=e,d=N(r,s),p=i.useMemo(()=>{const h=new a.WebGLRenderTarget(d.x,d.y,{...ve,...u}),l=new a.WebGLRenderTarget(d.x,d.y,{...ve,...u});return c&&(h.depthTexture=new a.DepthTexture(d.x,d.y,a.FloatType),l.depthTexture=new a.DepthTexture(d.x,d.y,a.FloatType)),{read:h,write:l,swap:function(){let v=this.read;this.read=this.write,this.write=v}}},[]);m&&((M=p.read)==null||M.setSize(d.x,d.y),(o=p.write)==null||o.setSize(d.x,d.y)),i.useEffect(()=>{const h=p;return()=>{var l,v;(l=h.read)==null||l.dispose(),(v=h.write)==null||v.dispose()}},[p]);const x=i.useCallback((h,l)=>{var f;const v=p;return he({gl:h,scene:n,camera:t,fbo:v.write,onBeforeRender:()=>l&&l({read:v.read.texture,write:v.write.texture}),onSwap:()=>v.swap()}),(f=v.read)==null?void 0:f.texture},[n,t,p]);return[{read:p.read,write:p.write},x]},O=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Y=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new a.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),tn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=en({scene:c,size:e,dpr:m.shader,onBeforeInit:s}),p=E(e),x=ge(),[M,o]=ne({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[h,l]=L(Y),v=i.useRef(null),f=P(u),T=A(u),y=i.useCallback((S,_)=>{l(S),T(_)},[l,T]);return[i.useCallback((S,_,D)=>{const{gl:I,pointer:z}=S;y(_,D),h.texture?(f("uIsTexture",!0),f("uTexture",h.texture)):f("uIsTexture",!1),h.map?(f("uIsMap",!0),f("uMap",h.map),f("uMapIntensity",h.mapIntensity)):f("uIsMap",!1),f("uRadius",h.radius),f("uSmudge",h.smudge),f("uDissipation",h.dissipation),f("uMotionBlur",h.motionBlur),f("uMotionSample",h.motionSample);const R=h.pointerValues||x(z);R.isVelocityUpdate&&(f("uMouse",R.currentPointer),f("uPrevMouse",R.prevPointer)),f("uVelocity",R.velocity);const j=typeof h.color=="function"?h.color(R.velocity):h.color;return f("uColor",j),f("uIsCursor",h.isCursor),f("uPressureEnd",h.pressure),v.current===null&&(v.current=h.pressure),f("uPressureStart",v.current),v.current=h.pressure,o(I,({read:w})=>{f("uBuffer",w)})},[f,x,o,h,y]),y,{scene:c,mesh:d,material:u,camera:p,renderTarget:M,output:M.read.texture}]};var Q=`varying vec2 vUv;
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
}`,rn=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const on=()=>i.useMemo(()=>new a.ShaderMaterial({vertexShader:Q,fragmentShader:rn,...V}),[]);var an=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const un=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:C},uSource:{value:C},texelSize:{value:new a.Vector2},dt:{value:Se},dissipation:{value:0}},vertexShader:Q,fragmentShader:an},e),...V}),[e]);var sn=`precision highp float;

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
}`;const ln=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:sn},e),...V}),[e]);var cn=`precision highp float;

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
}`;const mn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:cn},e),...V}),[e]);var vn=`precision highp float;

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
}`;const pn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:vn},e),...V}),[e]);var fn=`precision highp float;

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
}`;const dn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Se},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:fn},e),...V}),[e]);var gn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const hn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},value:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:gn},e),...V}),[e]);var xn=`precision highp float;

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
}`;const Mn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uPressure:{value:C},uVelocity:{value:C},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:xn},e),...V}),[e]);var yn=`precision highp float;

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
}`;const bn=({onBeforeInit:e})=>i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTarget:{value:C},aspectRatio:{value:0},color:{value:new a.Vector3},point:{value:new a.Vector2},radius:{value:0},texelSize:{value:new a.Vector2}},vertexShader:Q,fragmentShader:yn},e),...V}),[e]),Z=(e,n)=>e(n??{}),Sn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),{curl:m,vorticity:c,advection:u,divergence:d,pressure:p,clear:x,gradientSubtract:M,splat:o}=r??{},h=Z(on),l=h.clone(),v=Z(pn,m),f=Z(dn,c),T=Z(un,u),y=Z(ln,d),g=Z(mn,p),S=Z(hn,x),_=Z(Mn,M),D=Z(bn,o),I=i.useMemo(()=>({vorticityMaterial:f,curlMaterial:v,advectionMaterial:T,divergenceMaterial:y,pressureMaterial:g,clearMaterial:S,gradientSubtractMaterial:_,splatMaterial:D}),[f,v,T,y,g,S,_,D]),z=N(n,t);i.useMemo(()=>{P(I.splatMaterial)("aspectRatio",z.x/z.y);for(const w of Object.values(I))P(w)("texelSize",new a.Vector2(1/z.x,1/z.y))},[z,I]);const R=B(e,s,h,a.Mesh);i.useMemo(()=>{h.dispose(),R.material=l},[h,R,l]),i.useEffect(()=>()=>{for(const w of Object.values(I))w.dispose()},[I]);const j=i.useCallback(w=>{R.material=w,R.material.needsUpdate=!0},[R]);return{materials:I,setMeshMaterial:j,mesh:R}},Se=.016,Re=Object.freeze({densityDissipation:.98,velocityDissipation:.99,velocityAcceleration:10,pressureDissipation:.9,pressureIterations:20,curlStrength:35,splatRadius:.002,fluidColor:new a.Vector3(1,1,1),pointerValues:!1}),Cn=({size:e,dpr:n,samples:t,isSizeUpdate:r,customFluidProps:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{materials:u,setMeshMaterial:d,mesh:p}=Sn({scene:c,size:e,dpr:m.shader,customFluidProps:s}),x=E(e),M=ge(),o=i.useMemo(()=>({scene:c,camera:x,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[c,x,e,t,m.fbo,r]),[h,l]=ne(o),[v,f]=ne(o),[T,y]=k(o),[g,S]=k(o),[_,D]=ne(o),I=i.useRef(new a.Vector2(0,0)),z=i.useRef(new a.Vector3(0,0,0)),[R,j]=L(Re),w=i.useMemo(()=>({advection:P(u.advectionMaterial),splat:P(u.splatMaterial),curl:P(u.curlMaterial),vorticity:P(u.vorticityMaterial),divergence:P(u.divergenceMaterial),clear:P(u.clearMaterial),pressure:P(u.pressureMaterial),gradientSubtract:P(u.gradientSubtractMaterial)}),[u]),W=i.useMemo(()=>({advection:A(u.advectionMaterial),splat:A(u.splatMaterial),curl:A(u.curlMaterial),vorticity:A(u.vorticityMaterial),divergence:A(u.divergenceMaterial),clear:A(u.clearMaterial),pressure:A(u.pressureMaterial),gradientSubtract:A(u.gradientSubtractMaterial)}),[u]),K=i.useCallback((oe,ae)=>{j(oe),ae&&Object.keys(ae).forEach(ie=>{W[ie](ae[ie])})},[j,W]);return[i.useCallback((oe,ae,ie)=>{const{gl:G,pointer:gr,size:ke}=oe;K(ae,ie);const Te=l(G,({read:q})=>{d(u.advectionMaterial),w.advection("uVelocity",q),w.advection("uSource",q),w.advection("dissipation",R.velocityDissipation)}),hr=f(G,({read:q})=>{d(u.advectionMaterial),w.advection("uVelocity",Te),w.advection("uSource",q),w.advection("dissipation",R.densityDissipation)}),ye=R.pointerValues||M(gr);ye.isVelocityUpdate&&(l(G,({read:q})=>{d(u.splatMaterial),w.splat("uTarget",q),w.splat("point",ye.currentPointer);const ce=ye.diffPointer.multiply(I.current.set(ke.width,ke.height).multiplyScalar(R.velocityAcceleration));w.splat("color",z.current.set(ce.x,ce.y,1)),w.splat("radius",R.splatRadius)}),f(G,({read:q})=>{d(u.splatMaterial),w.splat("uTarget",q);const ce=typeof R.fluidColor=="function"?R.fluidColor(ye.velocity):R.fluidColor;w.splat("color",ce)}));const xr=y(G,()=>{d(u.curlMaterial),w.curl("uVelocity",Te)});l(G,({read:q})=>{d(u.vorticityMaterial),w.vorticity("uVelocity",q),w.vorticity("uCurl",xr),w.vorticity("curl",R.curlStrength)});const Mr=S(G,()=>{d(u.divergenceMaterial),w.divergence("uVelocity",Te)});D(G,({read:q})=>{d(u.clearMaterial),w.clear("uTexture",q),w.clear("value",R.pressureDissipation)}),d(u.pressureMaterial),w.pressure("uDivergence",Mr);let $e;for(let q=0;q<R.pressureIterations;q++)$e=D(G,({read:ce})=>{w.pressure("uPressure",ce)});return l(G,({read:q})=>{d(u.gradientSubtractMaterial),w.gradientSubtract("uPressure",$e),w.gradientSubtract("uVelocity",q)}),hr},[u,w,d,y,f,S,M,D,l,R,K]),K,{scene:c,mesh:p,materials:u,camera:x,renderTarget:{velocity:h,density:v,curl:T,divergence:g,pressure:_},output:v.read.texture}]};var _n="#usf <defaultVertex>",Tn=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const wn=({scale:e,max:n,texture:t,scene:r,onBeforeInit:s})=>{const m=i.useMemo(()=>new a.PlaneGeometry(e,e),[e]),c=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uOpacity:{value:0},uMap:{value:t||C}},vertexShader:_n,fragmentShader:Tn},s),blending:a.AdditiveBlending,...V,transparent:!0}),[t,s]),u=i.useMemo(()=>{const d=[];for(let p=0;p<n;p++){const x=c.clone(),M=new a.Mesh(m.clone(),x);M.rotateZ(2*Math.PI*Math.random()),M.visible=!1,r.add(M),d.push(M)}return d},[m,c,r,n]);return i.useEffect(()=>()=>{u.forEach(d=>{d.geometry.dispose(),Array.isArray(d.material)?d.material.forEach(p=>p.dispose()):d.material.dispose(),r.remove(d)})},[r,u]),u},Pe=Object.freeze({frequency:.01,rotation:.05,fadeoutSpeed:.9,scale:.3,alpha:.6,pointerValues:!1}),Dn=({texture:e,scale:n=64,max:t=100,size:r,dpr:s,samples:m,isSizeUpdate:c,onBeforeInit:u})=>{const d=O(s),p=i.useMemo(()=>new a.Scene,[]),x=wn({scale:n,max:t,texture:e,scene:p,onBeforeInit:u}),M=E(r),o=ge(),[h,l]=k({scene:p,camera:M,size:r,dpr:d.fbo,samples:m,isSizeUpdate:c}),[v,f]=L(Pe),T=i.useRef(0),y=i.useMemo(()=>(S,_)=>{f(S),x.forEach(D=>{if(D.visible){const I=D.material;D.rotation.z+=v.rotation,D.scale.x=v.fadeoutSpeed*D.scale.x+v.scale,D.scale.y=D.scale.x;const z=I.uniforms.uOpacity.value;P(I)("uOpacity",z*v.fadeoutSpeed),z<.001&&(D.visible=!1)}A(D.material)(_)})},[x,v,f]);return[i.useCallback((S,_,D)=>{const{gl:I,pointer:z,size:R}=S;y(_,D);const j=v.pointerValues||o(z);if(v.frequency<j.diffPointer.length()){const w=x[T.current],W=w.material;w.visible=!0,w.position.set(j.currentPointer.x*(R.width/2),j.currentPointer.y*(R.height/2),0),w.scale.x=w.scale.y=0,P(W)("uOpacity",v.alpha),T.current=(T.current+1)%t}return l(I)},[l,x,o,t,v,y]),y,{scene:p,camera:M,meshArr:x,renderTarget:h,output:h.texture}]};var Rn="#usf <planeVertex>",Pn=`precision highp float;
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
}`;const An=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTime:{value:0},scale:{value:J.scale},timeStrength:{value:J.timeStrength},noiseOctaves:{value:J.noiseOctaves},fbmOctaves:{value:J.fbmOctaves},warpOctaves:{value:J.warpOctaves},warpDirection:{value:J.warpDirection},warpStrength:{value:J.warpStrength}},vertexShader:Rn,fragmentShader:Pn},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},J=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new a.Vector2(2,2),warpStrength:8,beat:!1}),Fn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=An({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(J),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_,clock:D}=y;return f(g,S),l("scale",o.scale),l("timeStrength",o.timeStrength),l("noiseOctaves",o.noiseOctaves),l("fbmOctaves",o.fbmOctaves),l("warpOctaves",o.warpOctaves),l("warpDirection",o.warpDirection),l("warpStrength",o.warpStrength),l("uTime",o.beat||D.getElapsedTime()),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Vn="#usf <planeVertex>",In=`precision highp float;
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
}`;const zn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},isTexture:{value:!1},scale:{value:H.scale},noise:{value:C},noiseStrength:{value:H.noiseStrength},isNoise:{value:!1},laminateLayer:{value:H.laminateLayer},laminateInterval:{value:H.laminateInterval},laminateDetail:{value:H.laminateDetail},distortion:{value:H.distortion},colorFactor:{value:H.colorFactor},uTime:{value:0},timeStrength:{value:H.timeStrength}},vertexShader:Vn,fragmentShader:In},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},H=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new a.Vector2(.1,.1),laminateDetail:new a.Vector2(1,1),distortion:new a.Vector2(0,0),colorFactor:new a.Vector3(1,1,1),timeStrength:new a.Vector2(0,0),noise:!1,noiseStrength:new a.Vector2(0,0),beat:!1}),On=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=zn({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(H),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_,clock:D}=y;return f(g,S),o.texture?(l("uTexture",o.texture),l("isTexture",!0)):(l("isTexture",!1),l("scale",o.scale)),o.noise?(l("noise",o.noise),l("isNoise",!0),l("noiseStrength",o.noiseStrength)):l("isNoise",!1),l("uTime",o.beat||D.getElapsedTime()),l("laminateLayer",o.laminateLayer),l("laminateInterval",o.laminateInterval),l("laminateDetail",o.laminateDetail),l("distortion",o.distortion),l("colorFactor",o.colorFactor),l("timeStrength",o.timeStrength),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Un="#usf <planeVertex>",Bn=`precision highp float;

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
}`;const En=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_time:{value:0},u_pattern:{value:te.pattern},u_complexity:{value:te.complexity},u_complexityAttenuation:{value:te.complexityAttenuation},u_iterations:{value:te.iterations},u_timeStrength:{value:te.timeStrength},u_scale:{value:te.scale}},vertexShader:Un,fragmentShader:Bn},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},te=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),Ln=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=En({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(te),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_,clock:D}=y;return f(g,S),l("u_pattern",o.pattern),l("u_complexity",o.complexity),l("u_complexityAttenuation",o.complexityAttenuation),l("u_iterations",o.iterations),l("u_timeStrength",o.timeStrength),l("u_scale",o.scale),l("u_time",o.beat||D.getElapsedTime()),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var kn="#usf <planeVertex>",$n=`precision highp float;
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
}`;const jn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uRgbWeight:{value:ue.rgbWeight},uColor1:{value:ue.color1},uColor2:{value:ue.color2},uColor3:{value:ue.color3},uColor4:{value:ue.color4}},vertexShader:kn,fragmentShader:$n},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},ue=Object.freeze({texture:C,color1:new a.Color().set(.5,.5,.5),color2:new a.Color().set(.5,.5,.5),color3:new a.Color().set(1,1,1),color4:new a.Color().set(0,.1,.2),rgbWeight:new a.Vector3(.299,.587,.114)}),qn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=jn({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(ue),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("uTexture",o.texture),l("uColor1",o.color1),l("uColor2",o.color2),l("uColor3",o.color3),l("uColor4",o.color4),l("uRgbWeight",o.rgbWeight),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Wn="#usf <planeVertex>",Nn=`precision highp float;

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
}`;const Gn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uColor0:{value:xe.color0},uColor1:{value:xe.color1}},vertexShader:Wn,fragmentShader:Nn},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},xe=Object.freeze({texture:C,color0:new a.Color(16777215),color1:new a.Color(0)}),Kn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Gn({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(xe),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("uTexture",o.texture),l("uColor0",o.color0),l("uColor1",o.color1),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Hn="#usf <planeVertex>",Xn=`precision highp float;

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
}`;const Yn=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:C},uMap:{value:C},u_alphaMap:{value:C},u_isAlphaMap:{value:!1},uMapIntensity:{value:se.mapIntensity},u_brightness:{value:se.brightness},u_min:{value:se.min},u_max:{value:se.max},u_dodgeColor:{value:new a.Color},u_isDodgeColor:{value:!1}},vertexShader:Hn,fragmentShader:Xn},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},se=Object.freeze({texture:C,map:C,alphaMap:!1,mapIntensity:.3,brightness:new a.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Qn=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Yn({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(se),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("u_texture",o.texture),l("uMap",o.map),l("uMapIntensity",o.mapIntensity),o.alphaMap?(l("u_alphaMap",o.alphaMap),l("u_isAlphaMap",!0)):l("u_isAlphaMap",!1),l("u_brightness",o.brightness),l("u_min",o.min),l("u_max",o.max),o.dodgeColor?(l("u_dodgeColor",o.dodgeColor),l("u_isDodgeColor",!0)):l("u_isDodgeColor",!1),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Zn="#usf <planeVertex>",Jn=`precision highp float;

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

}`;const et=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>{var p,x;return new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture0:{value:C},uTexture1:{value:C},padding:{value:ee.padding},uMap:{value:C},edgeIntensity:{value:ee.edgeIntensity},mapIntensity:{value:ee.mapIntensity},epicenter:{value:ee.epicenter},progress:{value:ee.progress},dirX:{value:(p=ee.dir)==null?void 0:p.x},dirY:{value:(x=ee.dir)==null?void 0:x.y}},vertexShader:Zn,fragmentShader:Jn},r),...V})},[r]),c=N(n,t);P(m)("uResolution",c.clone());const u=B(e,s,m,a.Mesh);return{material:m,mesh:u}},ee=Object.freeze({texture0:C,texture1:C,padding:0,map:C,mapIntensity:0,edgeIntensity:0,epicenter:new a.Vector2(0,0),progress:0,dir:new a.Vector2(0,0)}),nt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=et({scene:c,size:e,dpr:m.shader,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[o,h]=L(ee),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{var R,j,w,W,K,re,oe,ae;const{gl:_}=y;f(g,S),l("uTexture0",o.texture0),l("uTexture1",o.texture1),l("progress",o.progress);const D=[((j=(R=o.texture0)==null?void 0:R.image)==null?void 0:j.width)||0,((W=(w=o.texture0)==null?void 0:w.image)==null?void 0:W.height)||0],I=[((re=(K=o.texture1)==null?void 0:K.image)==null?void 0:re.width)||0,((ae=(oe=o.texture1)==null?void 0:oe.image)==null?void 0:ae.height)||0],z=D.map((ie,G)=>ie+(I[G]-ie)*o.progress);return l("uTextureResolution",z),l("padding",o.padding),l("uMap",o.map),l("mapIntensity",o.mapIntensity),l("edgeIntensity",o.edgeIntensity),l("epicenter",o.epicenter),l("dirX",o.dir.x),l("dirY",o.dir.y),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var tt="#usf <planeVertex>",rt=`precision highp float;

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
}`;const ot=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:C},u_brightness:{value:pe.brightness},u_min:{value:pe.min},u_max:{value:pe.max}},vertexShader:tt,fragmentShader:rt},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},pe=Object.freeze({texture:C,brightness:new a.Vector3(.5,.5,.5),min:0,max:1}),at=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=ot({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(pe),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("u_texture",o.texture),l("u_brightness",o.brightness),l("u_min",o.min),l("u_max",o.max),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var ut="#usf <planeVertex>",it=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;const st=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:C},uMap:{value:C},uMapIntensity:{value:Ce.mapIntensity}},vertexShader:ut,fragmentShader:it},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},Ce=Object.freeze({texture:C,map:C,mapIntensity:.3}),lt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=st({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(Ce),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("u_texture",o.texture),l("uMap",o.map),l("uMapIntensity",o.mapIntensity),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var ct="#usf <planeVertex>",mt=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const vt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uMap:{value:C}},vertexShader:ct,fragmentShader:mt},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},Ae=Object.freeze({texture:C,map:C}),pt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=vt({scene:c,size:e,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(Ae),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("uTexture",o.texture),l("uMap",o.map),M(_)},[l,M,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var ft="#usf <planeVertex>",dt=`precision highp float;

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
}`;const gt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:C},u_brightness:{value:Me.brightness},u_saturation:{value:Me.saturation}},vertexShader:ft,fragmentShader:dt},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},Me=Object.freeze({texture:C,brightness:1,saturation:1}),ht=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=gt({scene:c,size:e,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(Me),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("u_texture",o.texture),l("u_brightness",o.brightness),l("u_saturation",o.saturation),M(_)},[l,M,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var xt="#usf <planeVertex>",Mt=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;const yt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2},uTextureResolution:{value:new a.Vector2},uTexture:{value:C}},vertexShader:xt,fragmentShader:Mt},r),...V}),[r]),c=N(n,t);P(m)("uResolution",c.clone());const u=B(e,s,m,a.Mesh);return{material:m,mesh:u}},Fe=Object.freeze({texture:C}),bt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=yt({scene:c,size:e,dpr:m.shader,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[o,h]=L(Fe),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{var D,I,z,R,j,w;const{gl:_}=y;return f(g,S),l("uTexture",o.texture),l("uTextureResolution",[((z=(I=(D=o.texture)==null?void 0:D.source)==null?void 0:I.data)==null?void 0:z.width)||0,((w=(j=(R=o.texture)==null?void 0:R.source)==null?void 0:j.data)==null?void 0:w.height)||0]),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var St="#usf <planeVertex>",Ct=`precision highp float;

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
}`;const _t=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uResolution:{value:new a.Vector2(0,0)},uBlurSize:{value:_e.blurSize}},vertexShader:St,fragmentShader:Ct},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},_e=Object.freeze({texture:C,blurSize:3,blurPower:5}),Tt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=_t({scene:c,onBeforeInit:s}),p=E(e),x=i.useMemo(()=>({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[c,p,e,m.fbo,t,r]),[M,o]=ne(x),[h,l]=L(_e),v=P(u),f=A(u),T=i.useCallback((g,S)=>{l(g),f(S)},[l,f]);return[i.useCallback((g,S,_)=>{var z,R,j,w,W,K;const{gl:D}=g;T(S,_),v("uTexture",h.texture),v("uResolution",[((j=(R=(z=h.texture)==null?void 0:z.source)==null?void 0:R.data)==null?void 0:j.width)||0,((K=(W=(w=h.texture)==null?void 0:w.source)==null?void 0:W.data)==null?void 0:K.height)||0]),v("uBlurSize",h.blurSize);let I=o(D);for(let re=0;re<h.blurPower;re++)v("uTexture",I),I=o(D);return I},[o,v,h,T]),T,{scene:c,mesh:d,material:u,camera:p,renderTarget:M,output:M.read.texture}]};var wt="#usf <planeVertex>",Dt=`precision highp float;

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
}`;const Rt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uBackbuffer:{value:C},uBegin:{value:fe.begin},uEnd:{value:fe.end},uStrength:{value:fe.strength}},vertexShader:wt,fragmentShader:Dt},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},fe=Object.freeze({texture:C,begin:new a.Vector2(0,0),end:new a.Vector2(0,0),strength:.9}),Pt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Rt({scene:c,onBeforeInit:s}),p=E(e),x=i.useMemo(()=>({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[c,p,e,m.fbo,t,r]),[M,o]=ne(x),[h,l]=L(fe),v=P(u),f=A(u),T=i.useCallback((g,S)=>{l(g),f(S)},[l,f]);return[i.useCallback((g,S,_)=>{const{gl:D}=g;return T(S,_),v("uTexture",h.texture),v("uBegin",h.begin),v("uEnd",h.end),v("uStrength",h.strength),o(D,({read:I})=>{v("uBackbuffer",I)})},[o,v,T,h]),T,{scene:c,mesh:d,material:u,camera:p,renderTarget:M,output:M.read.texture}]};var At="#usf <planeVertex>",Ft=`precision highp float;

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
}`;const Vt=({scene:e,onBeforeInit:n})=>{const t=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),r=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uEpicenter:{value:le.epicenter},uProgress:{value:le.progress},uStrength:{value:le.strength},uWidth:{value:le.width},uMode:{value:0}},vertexShader:At,fragmentShader:Ft},n),...V}),[n]),s=B(e,t,r,a.Mesh);return{material:r,mesh:s}},le=Object.freeze({epicenter:new a.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),It=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Vt({scene:c,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(le),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("uEpicenter",o.epicenter),l("uProgress",o.progress),l("uWidth",o.width),l("uStrength",o.strength),l("uMode",o.mode==="center"?0:o.mode==="horizontal"?1:2),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var zt="#usf <planeVertex>",Ot=`precision highp float;
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
}`;const Ut=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{u_texture:{value:C},u_resolution:{value:new a.Vector2},u_keyColor:{value:X.color},u_similarity:{value:X.similarity},u_smoothness:{value:X.smoothness},u_spill:{value:X.spill},u_color:{value:X.color},u_contrast:{value:X.contrast},u_brightness:{value:X.brightness},u_gamma:{value:X.gamma}},vertexShader:zt,fragmentShader:Ot},r),...V}),[r]),c=N(n,t);P(m)("u_resolution",c.clone());const u=B(e,s,m,a.Mesh);return{material:m,mesh:u}},X=Object.freeze({texture:C,keyColor:new a.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new a.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),Bt=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=Ut({scene:c,size:e,dpr:m.shader,onBeforeInit:s}),p=E(e),[x,M]=k({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[o,h]=L(X),l=P(u),v=A(u),f=i.useCallback((y,g)=>{h(y),v(g)},[h,v]);return[i.useCallback((y,g,S)=>{const{gl:_}=y;return f(g,S),l("u_texture",o.texture),l("u_keyColor",o.keyColor),l("u_similarity",o.similarity),l("u_smoothness",o.smoothness),l("u_spill",o.spill),l("u_color",o.color),l("u_contrast",o.contrast),l("u_brightness",o.brightness),l("u_gamma",o.gamma),M(_)},[M,l,o,f]),f,{scene:c,mesh:d,material:u,camera:p,renderTarget:x,output:x.texture}]};var Et=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,Lt=`precision highp float;

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
}`;const kt=({scene:e,size:n,dpr:t,onBeforeInit:r})=>{const s=i.useMemo(()=>new a.PlaneGeometry(2,2),[]),m=i.useMemo(()=>new a.ShaderMaterial({...F({uniforms:{uTexture:{value:C},uBackbuffer:{value:C},uTime:{value:0},uPointer:{value:new a.Vector2},uResolution:{value:new a.Vector2}},vertexShader:Et,fragmentShader:Lt},r),...V}),[r]),c=N(n,t);P(m)("uResolution",c.clone());const u=B(e,s,m,a.Mesh);return{material:m,mesh:u}},Ve=Object.freeze({texture:C,beat:!1}),$t=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s})=>{const m=O(n),c=i.useMemo(()=>new a.Scene,[]),{material:u,mesh:d}=kt({scene:c,size:e,dpr:m.shader,onBeforeInit:s}),p=E(e),x=i.useMemo(()=>({scene:c,camera:p,size:e,dpr:m.fbo,samples:t,isSizeUpdate:r}),[c,p,e,m.fbo,t,r]),[M,o]=ne(x),[h,l]=L(Ve),v=P(u),f=A(u),T=i.useCallback((g,S)=>{l(g),f(S)},[l,f]);return[i.useCallback((g,S,_)=>{const{gl:D,clock:I,pointer:z}=g;return T(S,_),v("uPointer",z),v("uTexture",h.texture),v("uTime",h.beat||I.getElapsedTime()),o(D,({read:R})=>{v("uBackbuffer",R)})},[o,v,h,T]),T,{scene:c,mesh:d,material:u,camera:p,renderTarget:M,output:M.read.texture}]},jt=({scene:e,geometry:n,material:t})=>{const r=B(e,n,t,a.Points),s=B(e,i.useMemo(()=>n.clone(),[n]),i.useMemo(()=>t.clone(),[t]),a.Mesh);return s.visible=!1,{points:r,interactiveMesh:s}};var qt=`uniform vec2 uResolution;
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
}`,Wt=`precision highp float;
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
}`;const Ie=(e,n,t,r,s)=>{var x;const m=t==="position"?"positionTarget":"uvTarget",c=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",u=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",d=t==="position"?"positionsList":"uvsList",p=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new a.BufferAttribute(e[0],s));let M="",o="";e.forEach((h,l)=>{n.setAttribute(`${m}${l}`,new a.BufferAttribute(h,s)),M+=`attribute vec${s} ${m}${l};
`,l===0?o+=`${m}${l}`:o+=`,${m}${l}`}),r=r.replace(`${c}`,M),r=r.replace(`${u}`,`vec${s} ${d}[${e.length}] = vec${s}[](${o});
				${p}
			`)}else r=r.replace(`${c}`,""),r=r.replace(`${u}`,""),(x=n==null?void 0:n.attributes[t])!=null&&x.array||we&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},ze=(e,n,t,r)=>{var m;let s=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?s=[n.attributes[t].array,...e]:s=e;const c=Math.max(...s.map(u=>u.length));s.forEach((u,d)=>{if(u.length<c){const p=(c-u.length)/r,x=[],M=Array.from(u);for(let o=0;o<p;o++){const h=Math.floor(u.length/r*Math.random())*r;for(let l=0;l<r;l++)x.push(M[h+l])}s[d]=new Float32Array([...M,...x])}})}return s},Nt=(e,n)=>{let t="";const r={};let s="mapArrayColor = ";return e&&e.length>0?(e.forEach((c,u)=>{const d=`vMapArrayIndex < ${u}.1`,p=`texture2D(uMapArray${u}, uv)`;s+=`( ${d} ) ? ${p} : `,t+=`
        uniform sampler2D uMapArray${u};
      `,r[`uMapArray${u}`]={value:c}}),s+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(s+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",s).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},Gt=({size:e,dpr:n,geometry:t,positions:r,uvs:s,mapArray:m,onBeforeInit:c})=>{const u=i.useMemo(()=>ze(r,t,"position",3),[r,t]),d=i.useMemo(()=>ze(s,t,"uv",2),[s,t]),p=i.useMemo(()=>{u.length!==d.length&&we&&console.log("use-shader-fx:positions and uvs are not matched");const M=Ie(d,t,"uv",Ie(u,t,"position",qt,3),2),{rewritedFragmentShader:o,mapArrayUniforms:h}=Nt(m,Wt);return new a.ShaderMaterial({...F({uniforms:{uResolution:{value:new a.Vector2(0,0)},uMorphProgress:{value:U.morphProgress},uBlurAlpha:{value:U.blurAlpha},uBlurRadius:{value:U.blurRadius},uPointSize:{value:U.pointSize},uPointAlpha:{value:U.pointAlpha},uPicture:{value:C},uIsPicture:{value:!1},uAlphaPicture:{value:C},uIsAlphaPicture:{value:!1},uColor0:{value:U.color0},uColor1:{value:U.color1},uColor2:{value:U.color2},uColor3:{value:U.color3},uMap:{value:C},uIsMap:{value:!1},uAlphaMap:{value:C},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:U.wobblePositionFrequency},uWobbleTimeFrequency:{value:U.wobbleTimeFrequency},uWobbleStrength:{value:U.wobbleStrength},uWarpPositionFrequency:{value:U.warpPositionFrequency},uWarpTimeFrequency:{value:U.warpTimeFrequency},uWarpStrength:{value:U.warpStrength},uDisplacement:{value:C},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:U.displacementIntensity},uDisplacementColorIntensity:{value:U.displacementColorIntensity},uSizeRandomIntensity:{value:U.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:U.sizeRandomTimeFrequency},uSizeRandomMin:{value:U.sizeRandomMin},uSizeRandomMax:{value:U.sizeRandomMax},uDivergence:{value:U.divergence},uDivergencePoint:{value:U.divergencePoint},...h},vertexShader:M,fragmentShader:o},c),...V,blending:a.AdditiveBlending,transparent:!0})},[t,u,d,m,c]),x=N(e,n);return P(p)("uResolution",x.clone()),{material:p,modifiedPositions:u,modifiedUvs:d}},Oe=({size:e,dpr:n,scene:t=!1,geometry:r,positions:s,uvs:m,mapArray:c,onBeforeInit:u})=>{const d=O(n),p=i.useMemo(()=>{const y=r||new a.SphereGeometry(1,32,32);return y.setIndex(null),y.deleteAttribute("normal"),y},[r]),{material:x,modifiedPositions:M,modifiedUvs:o}=Gt({size:e,dpr:d.shader,geometry:p,positions:s,uvs:m,mapArray:c,onBeforeInit:u}),{points:h,interactiveMesh:l}=jt({scene:t,geometry:p,material:x}),v=P(x),f=A(x);return[i.useCallback((y,g,S)=>{y&&v("uTime",(g==null?void 0:g.beat)||y.clock.getElapsedTime()),g!==void 0&&(v("uMorphProgress",g.morphProgress),v("uBlurAlpha",g.blurAlpha),v("uBlurRadius",g.blurRadius),v("uPointSize",g.pointSize),v("uPointAlpha",g.pointAlpha),g.picture?(v("uPicture",g.picture),v("uIsPicture",!0)):g.picture===!1&&v("uIsPicture",!1),g.alphaPicture?(v("uAlphaPicture",g.alphaPicture),v("uIsAlphaPicture",!0)):g.alphaPicture===!1&&v("uIsAlphaPicture",!1),v("uColor0",g.color0),v("uColor1",g.color1),v("uColor2",g.color2),v("uColor3",g.color3),g.map?(v("uMap",g.map),v("uIsMap",!0)):g.map===!1&&v("uIsMap",!1),g.alphaMap?(v("uAlphaMap",g.alphaMap),v("uIsAlphaMap",!0)):g.alphaMap===!1&&v("uIsAlphaMap",!1),v("uWobbleStrength",g.wobbleStrength),v("uWobblePositionFrequency",g.wobblePositionFrequency),v("uWobbleTimeFrequency",g.wobbleTimeFrequency),v("uWarpStrength",g.warpStrength),v("uWarpPositionFrequency",g.warpPositionFrequency),v("uWarpTimeFrequency",g.warpTimeFrequency),g.displacement?(v("uDisplacement",g.displacement),v("uIsDisplacement",!0)):g.displacement===!1&&v("uIsDisplacement",!1),v("uDisplacementIntensity",g.displacementIntensity),v("uDisplacementColorIntensity",g.displacementColorIntensity),v("uSizeRandomIntensity",g.sizeRandomIntensity),v("uSizeRandomTimeFrequency",g.sizeRandomTimeFrequency),v("uSizeRandomMin",g.sizeRandomMin),v("uSizeRandomMax",g.sizeRandomMax),v("uDivergence",g.divergence),v("uDivergencePoint",g.divergencePoint),f(S))},[v,f]),{points:h,interactiveMesh:l,positions:M,uvs:o}]},U=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new a.Vector3(0),beat:!1}),Kt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:s,geometry:m,positions:c,uvs:u,onBeforeInit:d})=>{const p=O(n),x=i.useMemo(()=>new a.Scene,[]),[M,{points:o,interactiveMesh:h,positions:l,uvs:v}]=Oe({scene:x,size:e,dpr:n,geometry:m,positions:c,uvs:u,onBeforeInit:d}),[f,T]=k({scene:x,camera:s,size:e,dpr:p.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),y=i.useCallback((S,_,D)=>(M(S,_,D),T(S.gl)),[T,M]),g=i.useCallback((S,_)=>{M(null,S,_)},[M]);return[y,g,{scene:x,points:o,interactiveMesh:h,renderTarget:f,output:f.texture,positions:l,uvs:v}]},Ue=e=>{e.vertexShader=e.vertexShader.replace("void main() {",`
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
		`)},Ht=e=>{e.fragmentShader=e.fragmentShader.replace("#include <color_fragment>",`
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
#endif`,Yt=`#ifdef USE_TRANSMISSION

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

#endif`;const Qt=({mat:e,isCustomTransmission:n,parameters:t})=>{e.type==="MeshPhysicalMaterial"&&n&&(t.fragmentShader=t.fragmentShader.replace("#include <transmission_pars_fragment>",`${Xt}`),t.fragmentShader=t.fragmentShader.replace("#include <transmission_fragment>",`${Yt}`)),e.normalMap||(t.vertexShader=t.vertexShader.replace("void main() {",`
				attribute vec4 tangent;
				
				void main() {
			`))},Zt=({baseMaterial:e,materialParameters:n,isCustomTransmission:t=!1,onBeforeInit:r,depthOnBeforeInit:s})=>{const{material:m,depthMaterial:c}=i.useMemo(()=>{const u=new(e||a.MeshPhysicalMaterial)(n||{});Object.assign(u.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:$.wobblePositionFrequency},uWobbleTimeFrequency:{value:$.wobbleTimeFrequency},uWobbleStrength:{value:$.wobbleStrength},uWarpPositionFrequency:{value:$.warpPositionFrequency},uWarpTimeFrequency:{value:$.warpTimeFrequency},uWarpStrength:{value:$.warpStrength},uColor0:{value:$.color0},uColor1:{value:$.color1},uColor2:{value:$.color2},uColor3:{value:$.color3},uColorMix:{value:$.colorMix},uEdgeThreshold:{value:$.edgeThreshold},uEdgeColor:{value:$.edgeColor},uChromaticAberration:{value:$.chromaticAberration},uAnisotropicBlur:{value:$.anisotropicBlur},uDistortion:{value:$.distortion},uDistortionScale:{value:$.distortionScale},uTemporalDistortion:{value:$.temporalDistortion},uRefractionSamples:{value:$.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null}}}),u.onBeforeCompile=p=>{Ue(p),Ht(p),Qt({parameters:p,mat:u,isCustomTransmission:t});const x=F({fragmentShader:p.fragmentShader,vertexShader:p.vertexShader,uniforms:u.userData.uniforms},r);p.fragmentShader=x.fragmentShader,p.vertexShader=x.vertexShader,Object.assign(p.uniforms,x.uniforms)},u.needsUpdate=!0;const d=new a.MeshDepthMaterial({depthPacking:a.RGBADepthPacking});return d.onBeforeCompile=p=>{Object.assign(p.uniforms,u.userData.uniforms),Ue(p),F(p,s)},d.needsUpdate=!0,{material:u,depthMaterial:d}},[n,e,r,s,t]);return{material:m,depthMaterial:c}},Be=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:s,onBeforeInit:m,depthOnBeforeInit:c})=>{const u=i.useMemo(()=>{let v=n||new a.IcosahedronGeometry(2,20);return v=je.mergeVertices(v),v.computeTangents(),v},[n]),{material:d,depthMaterial:p}=Zt({baseMaterial:r,materialParameters:s,isCustomTransmission:t,onBeforeInit:m,depthOnBeforeInit:c}),x=B(e,u,d,a.Mesh),M=d.userData,o=P(M),h=A(M);return[i.useCallback((v,f,T)=>{v&&o("uTime",(f==null?void 0:f.beat)||v.clock.getElapsedTime()),f!==void 0&&(o("uWobbleStrength",f.wobbleStrength),o("uWobblePositionFrequency",f.wobblePositionFrequency),o("uWobbleTimeFrequency",f.wobbleTimeFrequency),o("uWarpStrength",f.warpStrength),o("uWarpPositionFrequency",f.warpPositionFrequency),o("uWarpTimeFrequency",f.warpTimeFrequency),o("uColor0",f.color0),o("uColor1",f.color1),o("uColor2",f.color2),o("uColor3",f.color3),o("uColorMix",f.colorMix),o("uEdgeThreshold",f.edgeThreshold),o("uEdgeColor",f.edgeColor),o("uChromaticAberration",f.chromaticAberration),o("uAnisotropicBlur",f.anisotropicBlur),o("uDistortion",f.distortion),o("uDistortionScale",f.distortionScale),o("uRefractionSamples",f.refractionSamples),o("uTemporalDistortion",f.temporalDistortion),h(T))},[o,h]),{mesh:x,depthMaterial:p}]},$=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new a.Color(16711680),color1:new a.Color(65280),color2:new a.Color(255),color3:new a.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new a.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),Jt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:s,geometry:m,baseMaterial:c,materialParameters:u,isCustomTransmission:d,onBeforeInit:p,depthOnBeforeInit:x})=>{const M=O(n),o=i.useMemo(()=>new a.Scene,[]),[h,{mesh:l,depthMaterial:v}]=Be({baseMaterial:c,materialParameters:u,scene:o,geometry:m,isCustomTransmission:d,onBeforeInit:p,depthOnBeforeInit:x}),[f,T]=k({scene:o,camera:s,size:e,dpr:M.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),y=i.useCallback((S,_,D)=>(h(S,_,D),T(S.gl)),[T,h]),g=i.useCallback((S,_)=>{h(null,S,_)},[h]);return[y,g,{scene:o,mesh:l,depthMaterial:v,renderTarget:f,output:f.texture}]},er=(e,n,t)=>{const r=i.useMemo(()=>{const s=new a.Mesh(n,t);return e.add(s),s},[n,t,e]);return i.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},nr=(e,n,t,r,s,m)=>{const c=e<t-s||n<r-s,u=e>t+s||n>r+s;return m==="smaller"&&c||m==="larger"&&u||m==="both"&&(c||u)},tr=({gl:e,size:n,boundFor:t,threshold:r})=>{const s=i.useRef(n);return i.useMemo(()=>{const{width:c,height:u}=n,{width:d,height:p}=s.current,x=nr(c,u,d,p,r,t),M=Le.getMaxDpr(e,n);return x&&(s.current=n),{maxDpr:M,isUpdate:x}},[n,e,t,r])},de=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-de.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-de.easeOutBounce(1-2*e))/2:(1+de.easeOutBounce(2*e-1))/2}});function rr(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const or=(e,n="easeOutQuart")=>{const t=e/60,r=de[n];return i.useCallback(m=>{let c=m.getElapsedTime()*t;const u=Math.floor(c),d=r(c-u);c=d+u;const p=rr(u);return{beat:c,floor:u,fract:d,hash:p}},[t,r])},ar=(e=60)=>{const n=i.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=i.useRef(null);return i.useCallback(s=>{const m=s.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},ur=e=>{var r,s;const n=(r=e.dom)==null?void 0:r.length,t=(s=e.texture)==null?void 0:s.length;return!n||!t||n!==t};var ir=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,sr=`precision highp float;

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
}`;const lr=({params:e,scene:n,onBeforeInit:t})=>{n.children.length>0&&(n.children.forEach(r=>{r instanceof a.Mesh&&(r.geometry.dispose(),r.material.dispose())}),n.remove(...n.children)),e.texture.forEach((r,s)=>{const m=new a.ShaderMaterial({...F({uniforms:{u_texture:{value:r},u_textureResolution:{value:new a.Vector2(0,0)},u_resolution:{value:new a.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[s]?e.boderRadius[s]:0}},vertexShader:ir,fragmentShader:sr},t),...V,transparent:!0}),c=new a.Mesh(new a.PlaneGeometry(1,1),m);n.add(c)})},cr=()=>{const e=i.useRef([]),n=i.useRef([]);return i.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:s,params:m})=>{e.current.length>0&&e.current.forEach((u,d)=>{u.unobserve(n.current[d])}),n.current=[],e.current=[];const c=new Array(m.dom.length).fill(!1);r.current=[...c],s.current=[...c],m.dom.forEach((u,d)=>{const p=M=>{M.forEach(o=>{m.onIntersect[d]&&m.onIntersect[d](o),r.current[d]=o.isIntersecting})},x=new IntersectionObserver(p,{rootMargin:"0px",threshold:0});x.observe(u),e.current.push(x),n.current.push(u)})},[])},mr=()=>{const e=i.useRef([]),n=i.useCallback(({params:t,customParams:r,size:s,resolutionRef:m,scene:c,isIntersectingRef:u})=>{c.children.length!==e.current.length&&(e.current=new Array(c.children.length)),c.children.forEach((d,p)=>{var o,h,l,v,f,T;const x=t.dom[p];if(!x)return;const M=x.getBoundingClientRect();if(e.current[p]=M,d.scale.set(M.width,M.height,1),d.position.set(M.left+M.width*.5-s.width*.5,-M.top-M.height*.5+s.height*.5,0),u.current[p]&&(t.rotation[p]&&d.rotation.copy(t.rotation[p]),d instanceof a.Mesh)){const y=d.material,g=P(y),S=A(y);g("u_texture",t.texture[p]),g("u_textureResolution",[((l=(h=(o=t.texture[p])==null?void 0:o.source)==null?void 0:h.data)==null?void 0:l.width)||0,((T=(f=(v=t.texture[p])==null?void 0:v.source)==null?void 0:f.data)==null?void 0:T.height)||0]),g("u_resolution",m.current.set(M.width,M.height)),g("u_borderRadius",t.boderRadius[p]?t.boderRadius[p]:0),S(r)}})},[]);return[e.current,n]},vr=()=>{const e=i.useRef([]),n=i.useRef([]),t=i.useCallback((r,s=!1)=>{e.current.forEach((c,u)=>{c&&(n.current[u]=!0)});const m=s?[...n.current]:[...e.current];return r<0?m:m[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},pr=e=>({onView:t,onHidden:r})=>{const s=i.useRef(!1);i.useEffect(()=>{let m;const c=()=>{e.current.some(u=>u)?s.current||(t&&t(),s.current=!0):s.current&&(r&&r(),s.current=!1),m=requestAnimationFrame(c)};return m=requestAnimationFrame(c),()=>{cancelAnimationFrame(m)}},[t,r])},Ee={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},fr=({size:e,dpr:n,samples:t,isSizeUpdate:r,onBeforeInit:s},m=[])=>{const c=O(n),u=i.useMemo(()=>new a.Scene,[]),d=E(e),[p,x]=k({scene:u,camera:d,size:e,dpr:c.fbo,samples:t,isSizeUpdate:r}),[M,o]=L({...Ee,updateKey:performance.now()}),[h,l]=mr(),v=i.useRef(new a.Vector2(0,0)),[f,T]=i.useState(!0);i.useMemo(()=>T(!0),m);const y=i.useRef(null),g=i.useMemo(()=>C,[]),S=cr(),{isIntersectingOnceRef:_,isIntersectingRef:D,isIntersecting:I}=vr(),z=pr(D),R=i.useMemo(()=>(w,W)=>{o(w),l({params:M,customParams:W,size:e,resolutionRef:v,scene:u,isIntersectingRef:D})},[D,o,l,e,u,M]);return[i.useCallback((w,W,K)=>{const{gl:re,size:oe}=w;if(R(W,K),ur(M))return g;if(f){if(y.current===M.updateKey)return g;y.current=M.updateKey}return f&&(lr({params:M,size:oe,scene:u,onBeforeInit:s}),S({isIntersectingRef:D,isIntersectingOnceRef:_,params:M}),T(!1)),x(re)},[x,S,s,R,f,u,M,_,D,g]),R,{scene:u,camera:d,renderTarget:p,output:p.texture,isIntersecting:I,DOMRects:h,intersections:D.current,useDomView:z}]},dr=(e,n)=>{const{scene:t,camera:r,size:s,dpr:m=!1,isSizeUpdate:c=!1,depth:u=!1,...d}=e,p=i.useRef([]),x=N(s,m);p.current=i.useMemo(()=>Array.from({length:n},()=>{const o=new a.WebGLRenderTarget(x.x,x.y,{...ve,...d});return u&&(o.depthTexture=new a.DepthTexture(x.x,x.y,a.FloatType)),o}),[n]),c&&p.current.forEach(o=>o.setSize(x.x,x.y)),i.useEffect(()=>{const o=p.current;return()=>{o.forEach(h=>h.dispose())}},[n]);const M=i.useCallback((o,h,l)=>{const v=p.current[h];return he({gl:o,scene:t,camera:r,fbo:v,onBeforeRender:()=>l&&l({read:v.texture})}),v.texture},[t,r]);return[p.current,M]},Le=Object.freeze({interpolate(e,n,t,r=1e-6){const s=e+(n-e)*t;return Math.abs(s)<r?0:s},getMaxDpr(e,n){return Math.floor(e.capabilities.maxTextureSize/Math.max(n.width,n.height))}});b.ALPHABLENDING_PARAMS=Ae,b.BLANK_PARAMS=Ve,b.BLENDING_PARAMS=se,b.BRIGHTNESSPICKER_PARAMS=pe,b.BRUSH_PARAMS=Y,b.CHROMAKEY_PARAMS=X,b.COLORSTRATA_PARAMS=H,b.COSPALETTE_PARAMS=ue,b.COVERTEXTURE_PARAMS=Fe,b.DELTA_TIME=Se,b.DOMSYNCER_PARAMS=Ee,b.DUOTONE_PARAMS=xe,b.Easing=de,b.FBO_DEFAULT_OPTION=ve,b.FLUID_PARAMS=Re,b.FXBLENDING_PARAMS=Ce,b.FXTEXTURE_PARAMS=ee,b.HSV_PARAMS=Me,b.MARBLE_PARAMS=te,b.MORPHPARTICLES_PARAMS=U,b.MOTIONBLUR_PARAMS=fe,b.NOISE_PARAMS=J,b.RIPPLE_PARAMS=Pe,b.SIMPLEBLUR_PARAMS=_e,b.ShaderChunk=De,b.Utils=Le,b.WAVE_PARAMS=le,b.WOBBLE3D_PARAMS=$,b.renderFBO=he,b.setCustomUniform=A,b.setUniform=P,b.useAddMesh=er,b.useAlphaBlending=pt,b.useBeat=or,b.useBlank=$t,b.useBlending=Qn,b.useBrightnessPicker=at,b.useBrush=tn,b.useCamera=E,b.useChromaKey=Bt,b.useColorStrata=On,b.useCopyTexture=dr,b.useCosPalette=qn,b.useCoverTexture=bt,b.useCreateMorphParticles=Oe,b.useCreateWobble3D=Be,b.useDomSyncer=fr,b.useDoubleFBO=ne,b.useDuoTone=Kn,b.useFPSLimiter=ar,b.useFluid=Cn,b.useFxBlending=lt,b.useFxTexture=nt,b.useHSV=ht,b.useMarble=Ln,b.useMorphParticles=Kt,b.useMotionBlur=Pt,b.useNoise=Fn,b.useParams=L,b.usePointer=ge,b.useResizeBoundary=tr,b.useResolution=N,b.useRipple=Dn,b.useSimpleBlur=Tt,b.useSingleFBO=k,b.useWave=It,b.useWobble3D=Jt,Object.defineProperty(b,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
