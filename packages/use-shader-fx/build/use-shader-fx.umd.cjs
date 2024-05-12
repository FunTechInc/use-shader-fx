(function(C,ue){typeof exports=="object"&&typeof module<"u"?ue(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],ue):(C=typeof globalThis<"u"?globalThis:C||self,ue(C["use-shader-fx"]={},C.THREE,C.React))})(this,function(C,ue,i){"use strict";function $e(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const o=$e(ue);var je="#usf <planeVert>",We=`precision highp float;

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
}`;const X=(e,n=!1)=>{const t=n?e.width*n:e.width,r=n?e.height*n:e.height;return i.useMemo(()=>new o.Vector2(t,r),[t,r])},R=e=>(n,t)=>{if(t===void 0)return;const r=e.uniforms;r&&r[n]&&(r[n].value=t)},V=e=>n=>{n!==void 0&&Object.keys(n).forEach(t=>{const r=e.uniforms;r&&r[t]&&(r[t].value=n[t])})},L=(e,n,t,r)=>{const u=i.useMemo(()=>{const m=new r(n,t);return e&&e.add(m),m},[n,t,r,e]);return i.useEffect(()=>()=>{e&&e.remove(u),n.dispose(),t.dispose()},[e,n,t,u]),u},De=process.env.NODE_ENV==="development",z={transparent:!1,depthTest:!1,depthWrite:!1},D=new o.DataTexture(new Uint8Array([0,0,0,0]),1,1,o.RGBAFormat);var qe=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;const He={wobble3D:qe,snoise:Ne,coverTexture:Ge,fxBlending:Ke,planeVert:Xe},Ye=/^[ \t]*#usf +<([\w\d./]+)>/gm;function Qe(e,n){let t=He[n]||"";return be(t)}function be(e){return e.replace(Ye,Qe)}const Ze=e=>{e.vertexShader=be(e.vertexShader),e.fragmentShader=be(e.fragmentShader)},B=e=>(n,t)=>{e&&e(n,t),Ze(n)},Je=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:u})=>{const m=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),l=i.useMemo(()=>{const g=new o.ShaderMaterial({uniforms:{uBuffer:{value:D},uResolution:{value:new o.Vector2(0,0)},uTexture:{value:D},uIsTexture:{value:!1},uMap:{value:D},uIsMap:{value:!1},uMapIntensity:{value:Z.mapIntensity},uRadius:{value:Z.radius},uSmudge:{value:Z.smudge},uDissipation:{value:Z.dissipation},uMotionBlur:{value:Z.motionBlur},uMotionSample:{value:Z.motionSample},uMouse:{value:new o.Vector2(-10,-10)},uPrevMouse:{value:new o.Vector2(-10,-10)},uVelocity:{value:new o.Vector2(0,0)},uColor:{value:Z.color},uIsCursor:{value:!1},uPressureStart:{value:1},uPressureEnd:{value:1},...r},vertexShader:je,fragmentShader:We,...z,transparent:!0});return g.onBeforeCompile=B(u),g},[u,r]),s=X(n,t);R(l)("uResolution",s.clone());const v=L(e,m,l,o.Mesh);return{material:l,mesh:v}},en=(e,n)=>{const t=n,r=e/n,[u,m]=[t*r/2,t/2];return{width:u,height:m,near:-1e3,far:1e3}},k=(e,n="OrthographicCamera")=>{const t=X(e),{width:r,height:u,near:m,far:l}=en(t.x,t.y);return i.useMemo(()=>n==="OrthographicCamera"?new o.OrthographicCamera(-r,r,u,-u,m,l):new o.PerspectiveCamera(50,r/u),[r,u,m,l,n])},ge=(e=0)=>{const n=i.useRef(new o.Vector2(0,0)),t=i.useRef(new o.Vector2(0,0)),r=i.useRef(new o.Vector2(0,0)),u=i.useRef(0),m=i.useRef(new o.Vector2(0,0)),l=i.useRef(!1);return i.useCallback(v=>{const g=performance.now();let d;l.current&&e?(r.current=r.current.lerp(v,1-e),d=r.current.clone()):(d=v.clone(),r.current=d),u.current===0&&(u.current=g,n.current=d);const y=Math.max(1,g-u.current);u.current=g,m.current.copy(d).sub(n.current).divideScalar(y);const M=m.current.length()>0,a=l.current?n.current.clone():d;return!l.current&&M&&(l.current=!0),n.current=d,{currentPointer:d,prevPointer:a,diffPointer:t.current.subVectors(d,a),velocity:m.current,isVelocityUpdate:M}},[e])},$=e=>{const n=u=>Object.values(u).some(m=>typeof m=="function"),t=i.useRef(n(e)?e:structuredClone(e)),r=i.useCallback(u=>{if(u!==void 0)for(const m in u){const l=m;l in t.current&&u[l]!==void 0&&u[l]!==null?t.current[l]=u[l]:console.error(`"${String(l)}" does not exist in the params. or "${String(l)}" is null | undefined`)}},[]);return[t.current,r]},me={minFilter:o.LinearFilter,magFilter:o.LinearFilter,type:o.HalfFloatType,stencilBuffer:!1},he=({gl:e,fbo:n,scene:t,camera:r,onBeforeRender:u,onSwap:m})=>{e.setRenderTarget(n),u(),e.clear(),e.render(t,r),m&&m(),e.setRenderTarget(null),e.clear()},j=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:u=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1})=>{var y;const v=i.useRef(),g=X(t,r);v.current=i.useMemo(()=>{const M=new o.WebGLRenderTarget(g.x,g.y,{...me,samples:m,depthBuffer:l});return s&&(M.depthTexture=new o.DepthTexture(g.x,g.y,o.FloatType)),M},[]),u&&((y=v.current)==null||y.setSize(g.x,g.y)),i.useEffect(()=>{const M=v.current;return()=>{M==null||M.dispose()}},[]);const d=i.useCallback((M,a)=>{const h=v.current;return he({gl:M,fbo:h,scene:e,camera:n,onBeforeRender:()=>a&&a({read:h.texture})}),h.texture},[e,n]);return[v.current,d]},re=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:u=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1})=>{var M,a;const v=i.useRef({read:null,write:null,swap:function(){let h=this.read;this.read=this.write,this.write=h}}),g=X(t,r),d=i.useMemo(()=>{const h=new o.WebGLRenderTarget(g.x,g.y,{...me,samples:m,depthBuffer:l}),c=new o.WebGLRenderTarget(g.x,g.y,{...me,samples:m,depthBuffer:l});return s&&(h.depthTexture=new o.DepthTexture(g.x,g.y,o.FloatType),c.depthTexture=new o.DepthTexture(g.x,g.y,o.FloatType)),{read:h,write:c}},[]);v.current.read=d.read,v.current.write=d.write,u&&((M=v.current.read)==null||M.setSize(g.x,g.y),(a=v.current.write)==null||a.setSize(g.x,g.y)),i.useEffect(()=>{const h=v.current;return()=>{var c,p;(c=h.read)==null||c.dispose(),(p=h.write)==null||p.dispose()}},[]);const y=i.useCallback((h,c)=>{var f;const p=v.current;return he({gl:h,scene:e,camera:n,fbo:p.write,onBeforeRender:()=>c&&c({read:p.read.texture,write:p.write.texture}),onSwap:()=>p.swap()}),(f=p.read)==null?void 0:f.texture},[e,n]);return[{read:v.current.read,write:v.current.write},y]},U=e=>typeof e=="number"?{shader:e,fbo:e}:{shader:e.shader??!1,fbo:e.fbo??!1},Z=Object.freeze({texture:!1,map:!1,mapIntensity:.1,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new o.Vector3(1,0,0),isCursor:!1,pressure:1,pointerValues:!1}),nn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Je({scene:s,size:e,dpr:l.shader,uniforms:u,onBeforeCompile:m}),d=k(e),y=ge(),[M,a]=re({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[h,c]=$(Z),p=i.useRef(null),f=R(v),w=V(v),b=i.useCallback((S,_)=>{c(S),w(_)},[c,w]);return[i.useCallback((S,_,T)=>{const{gl:I,pointer:A}=S;b(_,T),h.texture?(f("uIsTexture",!0),f("uTexture",h.texture)):f("uIsTexture",!1),h.map?(f("uIsMap",!0),f("uMap",h.map),f("uMapIntensity",h.mapIntensity)):f("uIsMap",!1),f("uRadius",h.radius),f("uSmudge",h.smudge),f("uDissipation",h.dissipation),f("uMotionBlur",h.motionBlur),f("uMotionSample",h.motionSample);const F=h.pointerValues||y(A);F.isVelocityUpdate&&(f("uMouse",F.currentPointer),f("uPrevMouse",F.prevPointer)),f("uVelocity",F.velocity);const P=typeof h.color=="function"?h.color(F.velocity):h.color;return f("uColor",P),f("uIsCursor",h.isCursor),f("uPressureEnd",h.pressure),p.current===null&&(p.current=h.pressure),f("uPressureStart",p.current),p.current=h.pressure,a(I,({read:O})=>{f("uBuffer",O)})},[f,y,a,h,b]),b,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.read.texture}]};var J=`varying vec2 vUv;
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
}`,tn=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const rn=()=>i.useMemo(()=>new o.ShaderMaterial({vertexShader:J,fragmentShader:tn,...z}),[]);var on=`precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;const an=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uVelocity:{value:D},uSource:{value:D},texelSize:{value:new o.Vector2},dt:{value:Se},dissipation:{value:0},...n},vertexShader:J,fragmentShader:on,...z});return r.onBeforeCompile=B(e),r},[e,n]);var un=`precision highp float;

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
}`;const sn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:un,...z});return r.onBeforeCompile=B(e),r},[e,n]);var ln=`precision highp float;

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
}`;const cn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:ln,...z});return r.onBeforeCompile=B(e),r},[e,n]);var vn=`precision highp float;

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
}`;const mn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:vn,...z});return r.onBeforeCompile=B(e),r},[e,n]);var pn=`precision highp float;

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
}`;const fn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:Se},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:pn,...z});return r.onBeforeCompile=B(e),r},[e,n]);var dn=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const gn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uTexture:{value:D},value:{value:0},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:dn,...z});return r.onBeforeCompile=B(e),r},[e,n]);var hn=`precision highp float;

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
}`;const xn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uPressure:{value:D},uVelocity:{value:D},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:hn,...z});return r.onBeforeCompile=B(e),r},[e,n]);var Mn=`precision highp float;

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
}`;const yn=({onBeforeCompile:e,uniforms:n})=>i.useMemo(()=>{const r=new o.ShaderMaterial({uniforms:{uTarget:{value:D},aspectRatio:{value:0},color:{value:new o.Vector3},point:{value:new o.Vector2},radius:{value:0},texelSize:{value:new o.Vector2},...n},vertexShader:J,fragmentShader:Mn,...z});return r.onBeforeCompile=B(e),r},[e,n]),ee=(e,n)=>e(n??{}),bn=({scene:e,size:n,dpr:t,customFluidProps:r})=>{const u=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),{curl:m,vorticity:l,advection:s,divergence:v,pressure:g,clear:d,gradientSubtract:y,splat:M}=r??{},a=ee(rn),h=a.clone(),c=ee(mn,m),p=ee(fn,l),f=ee(an,s),w=ee(sn,v),b=ee(cn,g),x=ee(gn,d),S=ee(xn,y),_=ee(yn,M),T=i.useMemo(()=>({vorticityMaterial:p,curlMaterial:c,advectionMaterial:f,divergenceMaterial:w,pressureMaterial:b,clearMaterial:x,gradientSubtractMaterial:S,splatMaterial:_}),[p,c,f,w,b,x,S,_]),I=X(n,t);i.useMemo(()=>{R(T.splatMaterial)("aspectRatio",I.x/I.y);for(const P of Object.values(T))R(P)("texelSize",new o.Vector2(1/I.x,1/I.y))},[I,T]);const A=L(e,u,a,o.Mesh);i.useMemo(()=>{a.dispose(),A.material=h},[a,A,h]),i.useEffect(()=>()=>{for(const P of Object.values(T))P.dispose()},[T]);const F=i.useCallback(P=>{A.material=P,A.material.needsUpdate=!0},[A]);return{materials:T,setMeshMaterial:F,mesh:A}},Se=.016,Pe=Object.freeze({density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new o.Vector3(1,1,1),pointerValues:!1}),Sn=({size:e,dpr:n,samples:t,isSizeUpdate:r,customFluidProps:u})=>{const m=U(n),l=i.useMemo(()=>new o.Scene,[]),{materials:s,setMeshMaterial:v,mesh:g}=bn({scene:l,size:e,dpr:m.shader,customFluidProps:u}),d=k(e),y=ge(),M=i.useMemo(()=>({scene:l,camera:d,dpr:m.fbo,size:e,samples:t,isSizeUpdate:r}),[l,d,e,t,m.fbo,r]),[a,h]=re(M),[c,p]=re(M),[f,w]=j(M),[b,x]=j(M),[S,_]=re(M),T=i.useRef(new o.Vector2(0,0)),I=i.useRef(new o.Vector3(0,0,0)),[A,F]=$(Pe),P=i.useMemo(()=>({advection:R(s.advectionMaterial),splat:R(s.splatMaterial),curl:R(s.curlMaterial),vorticity:R(s.vorticityMaterial),divergence:R(s.divergenceMaterial),clear:R(s.clearMaterial),pressure:R(s.pressureMaterial),gradientSubtract:R(s.gradientSubtractMaterial)}),[s]),O=i.useMemo(()=>({advection:V(s.advectionMaterial),splat:V(s.splatMaterial),curl:V(s.curlMaterial),vorticity:V(s.vorticityMaterial),divergence:V(s.divergenceMaterial),clear:V(s.clearMaterial),pressure:V(s.pressureMaterial),gradientSubtract:V(s.gradientSubtractMaterial)}),[s]),q=i.useCallback((H,G)=>{F(H),G&&Object.keys(G).forEach(se=>{O[se](G[se])})},[F,O]);return[i.useCallback((H,G,se)=>{const{gl:K,pointer:we,size:Le}=H;q(G,se);const Te=h(K,({read:N})=>{v(s.advectionMaterial),P.advection("uVelocity",N),P.advection("uSource",N),P.advection("dissipation",A.velocity_dissipation)}),mr=p(K,({read:N})=>{v(s.advectionMaterial),P.advection("uVelocity",Te),P.advection("uSource",N),P.advection("dissipation",A.density_dissipation)}),ye=A.pointerValues||y(we);ye.isVelocityUpdate&&(h(K,({read:N})=>{v(s.splatMaterial),P.splat("uTarget",N),P.splat("point",ye.currentPointer);const ve=ye.diffPointer.multiply(T.current.set(Le.width,Le.height).multiplyScalar(A.velocity_acceleration));P.splat("color",I.current.set(ve.x,ve.y,1)),P.splat("radius",A.splat_radius)}),p(K,({read:N})=>{v(s.splatMaterial),P.splat("uTarget",N);const ve=typeof A.fluid_color=="function"?A.fluid_color(ye.velocity):A.fluid_color;P.splat("color",ve)}));const pr=w(K,()=>{v(s.curlMaterial),P.curl("uVelocity",Te)});h(K,({read:N})=>{v(s.vorticityMaterial),P.vorticity("uVelocity",N),P.vorticity("uCurl",pr),P.vorticity("curl",A.curl_strength)});const fr=x(K,()=>{v(s.divergenceMaterial),P.divergence("uVelocity",Te)});_(K,({read:N})=>{v(s.clearMaterial),P.clear("uTexture",N),P.clear("value",A.pressure_dissipation)}),v(s.pressureMaterial),P.pressure("uDivergence",fr);let ke;for(let N=0;N<A.pressure_iterations;N++)ke=_(K,({read:ve})=>{P.pressure("uPressure",ve)});return h(K,({read:N})=>{v(s.gradientSubtractMaterial),P.gradientSubtract("uPressure",ke),P.gradientSubtract("uVelocity",N)}),mr},[s,P,v,w,p,x,y,_,h,A,q]),q,{scene:l,mesh:g,materials:s,camera:d,renderTarget:{velocity:a,density:c,curl:f,divergence:b,pressure:S},output:c.read.texture}]};var Cn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,_n=`precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;const wn=({scale:e,max:n,texture:t,scene:r,uniforms:u,onBeforeCompile:m})=>{const l=i.useMemo(()=>new o.PlaneGeometry(e,e),[e]),s=i.useMemo(()=>new o.ShaderMaterial({uniforms:{uOpacity:{value:0},uMap:{value:t||D},...u},blending:o.AdditiveBlending,vertexShader:Cn,fragmentShader:_n,...z,transparent:!0}),[t,u]),v=i.useMemo(()=>{const g=[];for(let d=0;d<n;d++){const y=s.clone();y.onBeforeCompile=B(m);const M=new o.Mesh(l.clone(),y);M.rotateZ(2*Math.PI*Math.random()),M.visible=!1,r.add(M),g.push(M)}return g},[m,l,s,r,n]);return i.useEffect(()=>()=>{v.forEach(g=>{g.geometry.dispose(),Array.isArray(g.material)?g.material.forEach(d=>d.dispose()):g.material.dispose(),r.remove(g)})},[r,v]),v},Re=Object.freeze({frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6,pointerValues:!1}),Tn=({texture:e,scale:n=64,max:t=100,size:r,dpr:u,samples:m,isSizeUpdate:l,uniforms:s,onBeforeCompile:v})=>{const g=U(u),d=i.useMemo(()=>new o.Scene,[]),y=wn({scale:n,max:t,texture:e,scene:d,uniforms:s,onBeforeCompile:v}),M=k(r),a=ge(),[h,c]=j({scene:d,camera:M,size:r,dpr:g.fbo,samples:m,isSizeUpdate:l}),[p,f]=$(Re),w=i.useRef(0),b=i.useMemo(()=>(S,_)=>{f(S),y.forEach(T=>{if(T.visible){const I=T.material;T.rotation.z+=p.rotation,T.scale.x=p.fadeout_speed*T.scale.x+p.scale,T.scale.y=T.scale.x;const A=I.uniforms.uOpacity.value;R(I)("uOpacity",A*p.fadeout_speed),A<.001&&(T.visible=!1)}V(T.material)(_)})},[y,p,f]);return[i.useCallback((S,_,T)=>{const{gl:I,pointer:A,size:F}=S;b(_,T);const P=p.pointerValues||a(A);if(p.frequency<P.diffPointer.length()){const O=y[w.current],q=O.material;O.visible=!0,O.position.set(P.currentPointer.x*(F.width/2),P.currentPointer.y*(F.height/2),0),O.scale.x=O.scale.y=0,R(q)("uOpacity",p.alpha),w.current=(w.current+1)%t}return c(I)},[c,y,a,t,p,b]),b,{scene:d,camera:M,meshArr:y,renderTarget:h,output:h.texture}]};var Dn="#usf <planeVert>",Pn=`precision highp float;
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
}`;const Rn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:ne.scale},timeStrength:{value:ne.timeStrength},noiseOctaves:{value:ne.noiseOctaves},fbmOctaves:{value:ne.fbmOctaves},warpOctaves:{value:ne.warpOctaves},warpDirection:{value:ne.warpDirection},warpStrength:{value:ne.warpStrength},...n},vertexShader:Dn,fragmentShader:Pn,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},ne=Object.freeze({scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new o.Vector2(2,2),warpStrength:8,beat:!1}),An=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Rn({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(ne),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_,clock:T}=b;return f(x,S),c("scale",a.scale),c("timeStrength",a.timeStrength),c("noiseOctaves",a.noiseOctaves),c("fbmOctaves",a.fbmOctaves),c("warpOctaves",a.warpOctaves),c("warpDirection",a.warpDirection),c("warpStrength",a.warpStrength),c("uTime",a.beat||T.getElapsedTime()),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var In="#usf <planeVert>",Fn=`precision highp float;
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
}`;const Vn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},isTexture:{value:!1},scale:{value:Y.scale},noise:{value:D},noiseStrength:{value:Y.noiseStrength},isNoise:{value:!1},laminateLayer:{value:Y.laminateLayer},laminateInterval:{value:Y.laminateInterval},laminateDetail:{value:Y.laminateDetail},distortion:{value:Y.distortion},colorFactor:{value:Y.colorFactor},uTime:{value:0},timeStrength:{value:Y.timeStrength},...n},vertexShader:In,fragmentShader:Fn,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},Y=Object.freeze({texture:!1,scale:1,laminateLayer:1,laminateInterval:new o.Vector2(.1,.1),laminateDetail:new o.Vector2(1,1),distortion:new o.Vector2(0,0),colorFactor:new o.Vector3(1,1,1),timeStrength:new o.Vector2(0,0),noise:!1,noiseStrength:new o.Vector2(0,0),beat:!1}),Bn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Vn({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(Y),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_,clock:T}=b;return f(x,S),a.texture?(c("uTexture",a.texture),c("isTexture",!0)):(c("isTexture",!1),c("scale",a.scale)),a.noise?(c("noise",a.noise),c("isNoise",!0),c("noiseStrength",a.noiseStrength)):c("isNoise",!1),c("uTime",a.beat||T.getElapsedTime()),c("laminateLayer",a.laminateLayer),c("laminateInterval",a.laminateInterval),c("laminateDetail",a.laminateDetail),c("distortion",a.distortion),c("colorFactor",a.colorFactor),c("timeStrength",a.timeStrength),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var zn="#usf <planeVert>",On=`precision highp float;

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
}`;const Un=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{u_time:{value:0},u_pattern:{value:oe.pattern},u_complexity:{value:oe.complexity},u_complexityAttenuation:{value:oe.complexityAttenuation},u_iterations:{value:oe.iterations},u_timeStrength:{value:oe.timeStrength},u_scale:{value:oe.scale},...n},vertexShader:zn,fragmentShader:On,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},oe=Object.freeze({pattern:0,complexity:2,complexityAttenuation:.2,iterations:8,timeStrength:.2,scale:.002,beat:!1}),En=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Un({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(oe),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_,clock:T}=b;return f(x,S),c("u_pattern",a.pattern),c("u_complexity",a.complexity),c("u_complexityAttenuation",a.complexityAttenuation),c("u_iterations",a.iterations),c("u_timeStrength",a.timeStrength),c("u_scale",a.scale),c("u_time",a.beat||T.getElapsedTime()),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Ln="#usf <planeVert>",kn=`precision highp float;
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
}`;const $n=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uRgbWeight:{value:ie.rgbWeight},uColor1:{value:ie.color1},uColor2:{value:ie.color2},uColor3:{value:ie.color3},uColor4:{value:ie.color4},...n},vertexShader:Ln,fragmentShader:kn,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},ie=Object.freeze({texture:D,color1:new o.Color().set(.5,.5,.5),color2:new o.Color().set(.5,.5,.5),color3:new o.Color().set(1,1,1),color4:new o.Color().set(0,.1,.2),rgbWeight:new o.Vector3(.299,.587,.114)}),jn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=$n({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(ie),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("uTexture",a.texture),c("uColor1",a.color1),c("uColor2",a.color2),c("uColor3",a.color3),c("uColor4",a.color4),c("uRgbWeight",a.rgbWeight),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Wn="#usf <planeVert>",qn=`precision highp float;

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
}`;const Nn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uColor0:{value:xe.color0},uColor1:{value:xe.color1},...n},vertexShader:Wn,fragmentShader:qn,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},xe=Object.freeze({texture:D,color0:new o.Color(16777215),color1:new o.Color(0)}),Gn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Nn({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(xe),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("uTexture",a.texture),c("uColor0",a.color0),c("uColor1",a.color1),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Kn="#usf <planeVert>",Xn=`precision highp float;

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
}`;const Hn=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{u_texture:{value:D},uMap:{value:D},u_alphaMap:{value:D},u_isAlphaMap:{value:!1},uMapIntensity:{value:le.mapIntensity},u_brightness:{value:le.brightness},u_min:{value:le.min},u_max:{value:le.max},u_dodgeColor:{value:new o.Color},u_isDodgeColor:{value:!1},...n},vertexShader:Kn,fragmentShader:Xn,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},le=Object.freeze({texture:D,map:D,alphaMap:!1,mapIntensity:.3,brightness:new o.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1}),Yn=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Hn({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(le),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("u_texture",a.texture),c("uMap",a.map),c("uMapIntensity",a.mapIntensity),a.alphaMap?(c("u_alphaMap",a.alphaMap),c("u_isAlphaMap",!0)):c("u_isAlphaMap",!1),c("u_brightness",a.brightness),c("u_min",a.min),c("u_max",a.max),a.dodgeColor?(c("u_dodgeColor",a.dodgeColor),c("u_isDodgeColor",!0)):c("u_isDodgeColor",!1),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Qn="#usf <planeVert>",Zn=`precision highp float;

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

}`;const Jn=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:u})=>{const m=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),l=i.useMemo(()=>{var d,y;const g=new o.ShaderMaterial({uniforms:{uResolution:{value:new o.Vector2},uTextureResolution:{value:new o.Vector2},uTexture0:{value:D},uTexture1:{value:D},padding:{value:te.padding},uMap:{value:D},edgeIntensity:{value:te.edgeIntensity},mapIntensity:{value:te.mapIntensity},epicenter:{value:te.epicenter},progress:{value:te.progress},dirX:{value:(d=te.dir)==null?void 0:d.x},dirY:{value:(y=te.dir)==null?void 0:y.y},...r},vertexShader:Qn,fragmentShader:Zn,...z});return g.onBeforeCompile=B(u),g},[u,r]),s=X(n,t);R(l)("uResolution",s.clone());const v=L(e,m,l,o.Mesh);return{material:l,mesh:v}},te=Object.freeze({texture0:D,texture1:D,padding:0,map:D,mapIntensity:0,edgeIntensity:0,epicenter:new o.Vector2(0,0),progress:0,dir:new o.Vector2(0,0)}),et=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Jn({scene:s,size:e,dpr:l.shader,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,dpr:l.fbo,size:e,samples:t,isSizeUpdate:r}),[a,h]=$(te),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{var F,P,O,q,ae,H,G,se;const{gl:_}=b;f(x,S),c("uTexture0",a.texture0),c("uTexture1",a.texture1),c("progress",a.progress);const T=[((P=(F=a.texture0)==null?void 0:F.image)==null?void 0:P.width)||0,((q=(O=a.texture0)==null?void 0:O.image)==null?void 0:q.height)||0],I=[((H=(ae=a.texture1)==null?void 0:ae.image)==null?void 0:H.width)||0,((se=(G=a.texture1)==null?void 0:G.image)==null?void 0:se.height)||0],A=T.map((K,we)=>K+(I[we]-K)*a.progress);return c("uTextureResolution",A),c("padding",a.padding),c("uMap",a.map),c("mapIntensity",a.mapIntensity),c("edgeIntensity",a.edgeIntensity),c("epicenter",a.epicenter),c("dirX",a.dir.x),c("dirY",a.dir.y),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var nt="#usf <planeVert>",tt=`precision highp float;

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
}`;const rt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{u_texture:{value:D},u_brightness:{value:pe.brightness},u_min:{value:pe.min},u_max:{value:pe.max},...n},vertexShader:nt,fragmentShader:tt,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},pe=Object.freeze({texture:D,brightness:new o.Vector3(.5,.5,.5),min:0,max:1}),ot=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=rt({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(pe),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("u_texture",a.texture),c("u_brightness",a.brightness),c("u_min",a.min),c("u_max",a.max),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var at="#usf <planeVert>",ut=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;const it=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{u_texture:{value:D},uMap:{value:D},uMapIntensity:{value:Ce.mapIntensity},...n},vertexShader:at,fragmentShader:ut,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},Ce=Object.freeze({texture:D,map:D,mapIntensity:.3}),st=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=it({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(Ce),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("u_texture",a.texture),c("uMap",a.map),c("uMapIntensity",a.mapIntensity),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var lt="#usf <planeVert>",ct=`precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;const vt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uMap:{value:D},...n},vertexShader:lt,fragmentShader:ct,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},Ae=Object.freeze({texture:D,map:D}),mt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=vt({scene:s,size:e,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(Ae),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("uTexture",a.texture),c("uMap",a.map),M(_)},[c,M,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var pt="#usf <planeVert>",ft=`precision highp float;

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
}`;const dt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{u_texture:{value:D},u_brightness:{value:Me.brightness},u_saturation:{value:Me.saturation},...n},vertexShader:pt,fragmentShader:ft,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},Me=Object.freeze({texture:D,brightness:1,saturation:1}),gt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=dt({scene:s,size:e,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(Me),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("u_texture",a.texture),c("u_brightness",a.brightness),c("u_saturation",a.saturation),M(_)},[c,M,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var ht="#usf <planeVert>",xt=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;const Mt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:u})=>{const m=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),l=i.useMemo(()=>{const g=new o.ShaderMaterial({uniforms:{uResolution:{value:new o.Vector2},uTextureResolution:{value:new o.Vector2},uTexture:{value:D},...r},vertexShader:ht,fragmentShader:xt,...z});return g.onBeforeCompile=B(u),g},[u,r]),s=X(n,t);R(l)("uResolution",s.clone());const v=L(e,m,l,o.Mesh);return{material:l,mesh:v}},Ie=Object.freeze({texture:D}),yt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Mt({scene:s,size:e,dpr:l.shader,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,dpr:l.fbo,size:e,samples:t,isSizeUpdate:r}),[a,h]=$(Ie),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{var T,I,A,F,P,O;const{gl:_}=b;return f(x,S),c("uTexture",a.texture),c("uTextureResolution",[((A=(I=(T=a.texture)==null?void 0:T.source)==null?void 0:I.data)==null?void 0:A.width)||0,((O=(P=(F=a.texture)==null?void 0:F.source)==null?void 0:P.data)==null?void 0:O.height)||0]),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var bt="#usf <planeVert>",St=`precision highp float;

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
}`;const Ct=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uResolution:{value:new o.Vector2(0,0)},uBlurSize:{value:_e.blurSize},...n},vertexShader:bt,fragmentShader:St,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},_e=Object.freeze({texture:D,blurSize:3,blurPower:5}),_t=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Ct({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),y=i.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[M,a]=re(y),[h,c]=$(_e),p=R(v),f=V(v),w=i.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[i.useCallback((x,S,_)=>{var F,P,O,q,ae,H;const{gl:T}=x;w(S,_),p("uTexture",h.texture),p("uResolution",[((O=(P=(F=h.texture)==null?void 0:F.source)==null?void 0:P.data)==null?void 0:O.width)||0,((H=(ae=(q=h.texture)==null?void 0:q.source)==null?void 0:ae.data)==null?void 0:H.height)||0]),p("uBlurSize",h.blurSize);let I=a(T);const A=h.blurPower;for(let G=0;G<A;G++)p("uTexture",I),I=a(T);return I},[a,p,h,w]),w,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.read.texture}]};var wt="#usf <planeVert>",Tt=`precision highp float;

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
}`;const Dt=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uBackbuffer:{value:D},uBegin:{value:fe.begin},uEnd:{value:fe.end},uStrength:{value:fe.strength},...n},vertexShader:wt,fragmentShader:Tt,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},fe=Object.freeze({texture:D,begin:new o.Vector2(0,0),end:new o.Vector2(0,0),strength:.9}),Pt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Dt({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),y=i.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[M,a]=re(y),[h,c]=$(fe),p=R(v),f=V(v),w=i.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[i.useCallback((x,S,_)=>{const{gl:T}=x;return w(S,_),p("uTexture",h.texture),p("uBegin",h.begin),p("uEnd",h.end),p("uStrength",h.strength),a(T,({read:I})=>{p("uBackbuffer",I)})},[a,p,w,h]),w,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.read.texture}]};var Rt="#usf <planeVert>",At=`precision highp float;

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
}`;const It=({scene:e,uniforms:n,onBeforeCompile:t})=>{const r=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),u=i.useMemo(()=>{const l=new o.ShaderMaterial({uniforms:{uEpicenter:{value:ce.epicenter},uProgress:{value:ce.progress},uStrength:{value:ce.strength},uWidth:{value:ce.width},uMode:{value:0},...n},vertexShader:Rt,fragmentShader:At,...z});return l.onBeforeCompile=B(t),l},[t,n]),m=L(e,r,u,o.Mesh);return{material:u,mesh:m}},ce=Object.freeze({epicenter:new o.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"}),Ft=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=It({scene:s,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(ce),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("uEpicenter",a.epicenter),c("uProgress",a.progress),c("uWidth",a.width),c("uStrength",a.strength),c("uMode",a.mode==="center"?0:a.mode==="horizontal"?1:2),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Vt="#usf <planeVert>",Bt=`precision highp float;
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
}`;const zt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:u})=>{const m=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),l=i.useMemo(()=>{const g=new o.ShaderMaterial({uniforms:{u_texture:{value:D},u_resolution:{value:new o.Vector2},u_keyColor:{value:Q.color},u_similarity:{value:Q.similarity},u_smoothness:{value:Q.smoothness},u_spill:{value:Q.spill},u_color:{value:Q.color},u_contrast:{value:Q.contrast},u_brightness:{value:Q.brightness},u_gamma:{value:Q.gamma},...r},vertexShader:Vt,fragmentShader:Bt,...z});return g.onBeforeCompile=B(u),g},[u,r]),s=X(n,t);R(l)("u_resolution",s.clone());const v=L(e,m,l,o.Mesh);return{material:l,mesh:v}},Q=Object.freeze({texture:D,keyColor:new o.Color(65280),similarity:.2,smoothness:.1,spill:.2,color:new o.Vector4(1,1,1,1),contrast:1,brightness:0,gamma:1}),Ot=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=zt({scene:s,size:e,dpr:l.shader,uniforms:u,onBeforeCompile:m}),d=k(e),[y,M]=j({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[a,h]=$(Q),c=R(v),p=V(v),f=i.useCallback((b,x)=>{h(b),p(x)},[h,p]);return[i.useCallback((b,x,S)=>{const{gl:_}=b;return f(x,S),c("u_texture",a.texture),c("u_keyColor",a.keyColor),c("u_similarity",a.similarity),c("u_smoothness",a.smoothness),c("u_spill",a.spill),c("u_color",a.color),c("u_contrast",a.contrast),c("u_brightness",a.brightness),c("u_gamma",a.gamma),M(_)},[M,c,a,f]),f,{scene:s,mesh:g,material:v,camera:d,renderTarget:y,output:y.texture}]};var Ut=`precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`,Et=`precision highp float;

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
}`;const Lt=({scene:e,size:n,dpr:t,uniforms:r,onBeforeCompile:u})=>{const m=i.useMemo(()=>new o.PlaneGeometry(2,2),[]),l=i.useMemo(()=>{const g=new o.ShaderMaterial({uniforms:{uTexture:{value:D},uBackbuffer:{value:D},uTime:{value:0},uPointer:{value:new o.Vector2},uResolution:{value:new o.Vector2},...r},vertexShader:Ut,fragmentShader:Et,...z});return g.onBeforeCompile=B(u),g},[u,r]),s=X(n,t);R(l)("uResolution",s.clone());const v=L(e,m,l,o.Mesh);return{material:l,mesh:v}},Fe=Object.freeze({texture:D,beat:!1}),kt=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m})=>{const l=U(n),s=i.useMemo(()=>new o.Scene,[]),{material:v,mesh:g}=Lt({scene:s,size:e,dpr:l.shader,uniforms:u,onBeforeCompile:m}),d=k(e),y=i.useMemo(()=>({scene:s,camera:d,size:e,dpr:l.fbo,samples:t,isSizeUpdate:r}),[s,d,e,l.fbo,t,r]),[M,a]=re(y),[h,c]=$(Fe),p=R(v),f=V(v),w=i.useCallback((x,S)=>{c(x),f(S)},[c,f]);return[i.useCallback((x,S,_)=>{const{gl:T,clock:I,pointer:A}=x;return w(S,_),p("uPointer",A),p("uTexture",h.texture),p("uTime",h.beat||I.getElapsedTime()),a(T,({read:F})=>{p("uBackbuffer",F)})},[a,p,h,w]),w,{scene:s,mesh:g,material:v,camera:d,renderTarget:M,output:M.read.texture}]},$t=({scene:e,geometry:n,material:t})=>{const r=L(e,n,t,o.Points),u=L(e,i.useMemo(()=>n.clone(),[n]),i.useMemo(()=>t.clone(),[t]),o.Mesh);return u.visible=!1,{points:r,interactiveMesh:u}};var jt=`uniform vec2 uResolution;
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
}`;const Ve=(e,n,t,r,u)=>{var d;const m=t==="position"?"positionTarget":"uvTarget",l=t==="position"?"#usf <morphPositions>":"#usf <morphUvs>",s=t==="position"?"#usf <morphPositionTransition>":"#usf <morphUvTransition>",v=t==="position"?"positionsList":"uvsList",g=t==="position"?`
				float scaledProgress = uMorphProgress * ${e.length-1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length-1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`:"newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";if(e.length>0){n.deleteAttribute(t),n.setAttribute(t,new o.BufferAttribute(e[0],u));let y="",M="";e.forEach((a,h)=>{n.setAttribute(`${m}${h}`,new o.BufferAttribute(a,u)),y+=`attribute vec${u} ${m}${h};
`,h===0?M+=`${m}${h}`:M+=`,${m}${h}`}),r=r.replace(`${l}`,y),r=r.replace(`${s}`,`vec${u} ${v}[${e.length}] = vec${u}[](${M});
				${g}
			`)}else r=r.replace(`${l}`,""),r=r.replace(`${s}`,""),(d=n==null?void 0:n.attributes[t])!=null&&d.array||De&&console.error(`use-shader-fx:geometry.attributes.${t}.array is not found`);return r},Be=(e,n,t,r)=>{var m;let u=[];if(e&&e.length>0){(m=n==null?void 0:n.attributes[t])!=null&&m.array?u=[n.attributes[t].array,...e]:u=e;const l=Math.max(...u.map(s=>s.length));u.forEach((s,v)=>{if(s.length<l){const g=(l-s.length)/r,d=[],y=Array.from(s);for(let M=0;M<g;M++){const a=Math.floor(s.length/r*Math.random())*r;for(let h=0;h<r;h++)d.push(y[a+h])}u[v]=new Float32Array([...y,...d])}})}return u},qt=(e,n)=>{let t="";const r={};let u="mapArrayColor = ";return e&&e.length>0?(e.forEach((l,s)=>{const v=`vMapArrayIndex < ${s}.1`,g=`texture2D(uMapArray${s}, uv)`;u+=`( ${v} ) ? ${g} : `,t+=`
        uniform sampler2D uMapArray${s};
      `,r[`uMapArray${s}`]={value:l}}),u+="vec4(1.);",t+="bool isMapArray = true;",r.uMapArrayLength={value:e.length}):(u+="vec4(1.0);",t+="bool isMapArray = false;",r.uMapArrayLength={value:0}),{rewritedFragmentShader:n.replace("#usf <mapArraySwitcher>",u).replace("#usf <mapArrayUniforms>",t),mapArrayUniforms:r}},Nt=({size:e,dpr:n,geometry:t,positions:r,uvs:u,mapArray:m,uniforms:l,onBeforeCompile:s})=>{const v=i.useMemo(()=>Be(r,t,"position",3),[r,t]),g=i.useMemo(()=>Be(u,t,"uv",2),[u,t]),d=i.useMemo(()=>{v.length!==g.length&&De&&console.log("use-shader-fx:positions and uvs are not matched");const M=Ve(g,t,"uv",Ve(v,t,"position",jt,3),2),{rewritedFragmentShader:a,mapArrayUniforms:h}=qt(m,Wt),c=new o.ShaderMaterial({vertexShader:M,fragmentShader:a,blending:o.AdditiveBlending,...z,transparent:!0,uniforms:{uResolution:{value:new o.Vector2(0,0)},uMorphProgress:{value:E.morphProgress},uBlurAlpha:{value:E.blurAlpha},uBlurRadius:{value:E.blurRadius},uPointSize:{value:E.pointSize},uPointAlpha:{value:E.pointAlpha},uPicture:{value:D},uIsPicture:{value:!1},uAlphaPicture:{value:D},uIsAlphaPicture:{value:!1},uColor0:{value:E.color0},uColor1:{value:E.color1},uColor2:{value:E.color2},uColor3:{value:E.color3},uMap:{value:D},uIsMap:{value:!1},uAlphaMap:{value:D},uIsAlphaMap:{value:!1},uTime:{value:0},uWobblePositionFrequency:{value:E.wobblePositionFrequency},uWobbleTimeFrequency:{value:E.wobbleTimeFrequency},uWobbleStrength:{value:E.wobbleStrength},uWarpPositionFrequency:{value:E.warpPositionFrequency},uWarpTimeFrequency:{value:E.warpTimeFrequency},uWarpStrength:{value:E.warpStrength},uDisplacement:{value:D},uIsDisplacement:{value:!1},uDisplacementIntensity:{value:E.displacementIntensity},uDisplacementColorIntensity:{value:E.displacementColorIntensity},uSizeRandomIntensity:{value:E.sizeRandomIntensity},uSizeRandomTimeFrequency:{value:E.sizeRandomTimeFrequency},uSizeRandomMin:{value:E.sizeRandomMin},uSizeRandomMax:{value:E.sizeRandomMax},uDivergence:{value:E.divergence},uDivergencePoint:{value:E.divergencePoint},...h,...l}});return c.onBeforeCompile=B(s),c},[t,v,g,m,s,l]),y=X(e,n);return R(d)("uResolution",y.clone()),{material:d,modifiedPositions:v,modifiedUvs:g}},ze=({size:e,dpr:n,scene:t=!1,geometry:r,positions:u,uvs:m,mapArray:l,uniforms:s,onBeforeCompile:v})=>{const g=U(n),d=i.useMemo(()=>{const b=r||new o.SphereGeometry(1,32,32);return b.setIndex(null),b.deleteAttribute("normal"),b},[r]),{material:y,modifiedPositions:M,modifiedUvs:a}=Nt({size:e,dpr:g.shader,geometry:d,positions:u,uvs:m,mapArray:l,uniforms:s,onBeforeCompile:v}),{points:h,interactiveMesh:c}=$t({scene:t,geometry:d,material:y}),p=R(y),f=V(y);return[i.useCallback((b,x,S)=>{b&&p("uTime",(x==null?void 0:x.beat)||b.clock.getElapsedTime()),x!==void 0&&(p("uMorphProgress",x.morphProgress),p("uBlurAlpha",x.blurAlpha),p("uBlurRadius",x.blurRadius),p("uPointSize",x.pointSize),p("uPointAlpha",x.pointAlpha),x.picture?(p("uPicture",x.picture),p("uIsPicture",!0)):x.picture===!1&&p("uIsPicture",!1),x.alphaPicture?(p("uAlphaPicture",x.alphaPicture),p("uIsAlphaPicture",!0)):x.alphaPicture===!1&&p("uIsAlphaPicture",!1),p("uColor0",x.color0),p("uColor1",x.color1),p("uColor2",x.color2),p("uColor3",x.color3),x.map?(p("uMap",x.map),p("uIsMap",!0)):x.map===!1&&p("uIsMap",!1),x.alphaMap?(p("uAlphaMap",x.alphaMap),p("uIsAlphaMap",!0)):x.alphaMap===!1&&p("uIsAlphaMap",!1),p("uWobbleStrength",x.wobbleStrength),p("uWobblePositionFrequency",x.wobblePositionFrequency),p("uWobbleTimeFrequency",x.wobbleTimeFrequency),p("uWarpStrength",x.warpStrength),p("uWarpPositionFrequency",x.warpPositionFrequency),p("uWarpTimeFrequency",x.warpTimeFrequency),x.displacement?(p("uDisplacement",x.displacement),p("uIsDisplacement",!0)):x.displacement===!1&&p("uIsDisplacement",!1),p("uDisplacementIntensity",x.displacementIntensity),p("uDisplacementColorIntensity",x.displacementColorIntensity),p("uSizeRandomIntensity",x.sizeRandomIntensity),p("uSizeRandomTimeFrequency",x.sizeRandomTimeFrequency),p("uSizeRandomMin",x.sizeRandomMin),p("uSizeRandomMax",x.sizeRandomMax),p("uDivergence",x.divergence),p("uDivergencePoint",x.divergencePoint),f(S))},[p,f]),{points:h,interactiveMesh:c,positions:M,uvs:a}]},E=Object.freeze({morphProgress:0,blurAlpha:.9,blurRadius:.05,pointSize:.05,pointAlpha:1,picture:!1,alphaPicture:!1,color0:new o.Color(16711680),color1:new o.Color(65280),color2:new o.Color(255),color3:new o.Color(16776960),map:!1,alphaMap:!1,wobbleStrength:0,wobblePositionFrequency:.5,wobbleTimeFrequency:.5,warpStrength:0,warpPositionFrequency:.5,warpTimeFrequency:.5,displacement:!1,displacementIntensity:1,displacementColorIntensity:0,sizeRandomIntensity:0,sizeRandomTimeFrequency:.2,sizeRandomMin:.5,sizeRandomMax:1.5,divergence:0,divergencePoint:new o.Vector3(0),beat:!1}),Gt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:u,geometry:m,positions:l,uvs:s,uniforms:v,onBeforeCompile:g})=>{const d=U(n),y=i.useMemo(()=>new o.Scene,[]),[M,{points:a,interactiveMesh:h,positions:c,uvs:p}]=ze({scene:y,size:e,dpr:n,geometry:m,positions:l,uvs:s,uniforms:v,onBeforeCompile:g}),[f,w]=j({scene:y,camera:u,size:e,dpr:d.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=i.useCallback((S,_,T)=>(M(S,_,T),w(S.gl)),[w,M]),x=i.useCallback((S,_)=>{M(null,S,_)},[M]);return[b,x,{scene:y,points:a,interactiveMesh:h,renderTarget:f,output:f.texture,positions:c,uvs:p}]};function Kt(e,n=1e-4){n=Math.max(n,Number.EPSILON);const t={},r=e.getIndex(),u=e.getAttribute("position"),m=r?r.count:u.count;let l=0;const s=Object.keys(e.attributes),v={},g={},d=[],y=["getX","getY","getZ","getW"];for(let c=0,p=s.length;c<p;c++){const f=s[c];v[f]=[];const w=e.morphAttributes[f];w&&(g[f]=new Array(w.length).fill(0).map(()=>[]))}const M=Math.log10(1/n),a=Math.pow(10,M);for(let c=0;c<m;c++){const p=r?r.getX(c):c;let f="";for(let w=0,b=s.length;w<b;w++){const x=s[w],S=e.getAttribute(x),_=S.itemSize;for(let T=0;T<_;T++)f+=`${~~(S[y[T]](p)*a)},`}if(f in t)d.push(t[f]);else{for(let w=0,b=s.length;w<b;w++){const x=s[w],S=e.getAttribute(x),_=e.morphAttributes[x],T=S.itemSize,I=v[x],A=g[x];for(let F=0;F<T;F++){const P=y[F];if(I.push(S[P](p)),_)for(let O=0,q=_.length;O<q;O++)A[O].push(_[O][P](p))}}t[f]=l,d.push(l),l++}}const h=e.clone();for(let c=0,p=s.length;c<p;c++){const f=s[c],w=e.getAttribute(f),b=new w.array.constructor(v[f]),x=new ue.BufferAttribute(b,w.itemSize,w.normalized);if(h.setAttribute(f,x),f in g)for(let S=0;S<g[f].length;S++){const _=e.morphAttributes[f][S],T=new _.array.constructor(g[f][S]),I=new ue.BufferAttribute(T,_.itemSize,_.normalized);h.morphAttributes[f][S]=I}}return h.setIndex(d),h}var Xt=`#ifdef USE_TRANSMISSION

	
	

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

#endif`;const Oe=e=>{let n=e;return n=n.replace("#include <beginnormal_vertex>",`
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
		#usf <wobble3D>
		void main() {
		`),n=n.replace("void main() {",`
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
		`),n},Yt=({baseMaterial:e,materialParameters:n,onBeforeCompile:t,depthOnBeforeCompile:r,isCustomTransmission:u=!1,uniforms:m})=>{const{material:l,depthMaterial:s}=i.useMemo(()=>{const v=new(e||o.MeshPhysicalMaterial)(n||{});Object.assign(v.userData,{uniforms:{uTime:{value:0},uWobblePositionFrequency:{value:W.wobblePositionFrequency},uWobbleTimeFrequency:{value:W.wobbleTimeFrequency},uWobbleStrength:{value:W.wobbleStrength},uWarpPositionFrequency:{value:W.warpPositionFrequency},uWarpTimeFrequency:{value:W.warpTimeFrequency},uWarpStrength:{value:W.warpStrength},uColor0:{value:W.color0},uColor1:{value:W.color1},uColor2:{value:W.color2},uColor3:{value:W.color3},uColorMix:{value:W.colorMix},uEdgeThreshold:{value:W.edgeThreshold},uEdgeColor:{value:W.edgeColor},uChromaticAberration:{value:W.chromaticAberration},uAnisotropicBlur:{value:W.anisotropicBlur},uDistortion:{value:W.distortion},uDistortionScale:{value:W.distortionScale},uTemporalDistortion:{value:W.temporalDistortion},uRefractionSamples:{value:W.refractionSamples},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},...m}}),v.onBeforeCompile=(d,y)=>{Object.assign(d.uniforms,v.userData.uniforms),d.vertexShader=Oe(d.vertexShader),d.fragmentShader=d.fragmentShader.replace("#include <color_fragment>",`
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
				`),v.type==="MeshPhysicalMaterial"&&u&&(d.fragmentShader=d.fragmentShader.replace("#include <transmission_pars_fragment>",`${Xt}`),d.fragmentShader=d.fragmentShader.replace("#include <transmission_fragment>",`${Ht}`)),B(t)(d,y)},v.needsUpdate=!0;const g=new o.MeshDepthMaterial({depthPacking:o.RGBADepthPacking});return g.onBeforeCompile=(d,y)=>{Object.assign(d.uniforms,v.userData.uniforms),d.vertexShader=Oe(d.vertexShader),B(r)(d,y)},g.needsUpdate=!0,{material:v,depthMaterial:g}},[n,e,t,r,m,u]);return{material:l,depthMaterial:s}},Ue=({scene:e=!1,geometry:n,isCustomTransmission:t,baseMaterial:r,materialParameters:u,onBeforeCompile:m,depthOnBeforeCompile:l,uniforms:s})=>{const v=i.useMemo(()=>{let p=n||new o.IcosahedronGeometry(2,20);return p=Kt(p),p.computeTangents(),p},[n]),{material:g,depthMaterial:d}=Yt({baseMaterial:r,materialParameters:u,onBeforeCompile:m,depthOnBeforeCompile:l,uniforms:s,isCustomTransmission:t}),y=L(e,v,g,o.Mesh),M=g.userData,a=R(M),h=V(M);return[i.useCallback((p,f,w)=>{p&&a("uTime",(f==null?void 0:f.beat)||p.clock.getElapsedTime()),f!==void 0&&(a("uWobbleStrength",f.wobbleStrength),a("uWobblePositionFrequency",f.wobblePositionFrequency),a("uWobbleTimeFrequency",f.wobbleTimeFrequency),a("uWarpStrength",f.warpStrength),a("uWarpPositionFrequency",f.warpPositionFrequency),a("uWarpTimeFrequency",f.warpTimeFrequency),a("uColor0",f.color0),a("uColor1",f.color1),a("uColor2",f.color2),a("uColor3",f.color3),a("uColorMix",f.colorMix),a("uEdgeThreshold",f.edgeThreshold),a("uEdgeColor",f.edgeColor),a("uChromaticAberration",f.chromaticAberration),a("uAnisotropicBlur",f.anisotropicBlur),a("uDistortion",f.distortion),a("uDistortionScale",f.distortionScale),a("uRefractionSamples",f.refractionSamples),a("uTemporalDistortion",f.temporalDistortion),h(w))},[a,h]),{mesh:y,depthMaterial:d}]},W=Object.freeze({wobbleStrength:.3,wobblePositionFrequency:.3,wobbleTimeFrequency:.3,warpStrength:.3,warpPositionFrequency:.3,warpTimeFrequency:.3,color0:new o.Color(16711680),color1:new o.Color(65280),color2:new o.Color(255),color3:new o.Color(16776960),colorMix:1,edgeThreshold:0,edgeColor:new o.Color(0),chromaticAberration:.1,anisotropicBlur:.1,distortion:0,distortionScale:.1,temporalDistortion:0,refractionSamples:6,beat:!1}),Qt=({size:e,dpr:n,samples:t,isSizeUpdate:r,camera:u,geometry:m,baseMaterial:l,materialParameters:s,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:y})=>{const M=U(n),a=i.useMemo(()=>new o.Scene,[]),[h,{mesh:c,depthMaterial:p}]=Ue({baseMaterial:l,materialParameters:s,scene:a,geometry:m,uniforms:v,onBeforeCompile:g,depthOnBeforeCompile:d,isCustomTransmission:y}),[f,w]=j({scene:a,camera:u,size:e,dpr:M.fbo,samples:t,isSizeUpdate:r,depthBuffer:!0}),b=i.useCallback((S,_,T)=>(h(S,_,T),w(S.gl)),[w,h]),x=i.useCallback((S,_)=>{h(null,S,_)},[h]);return[b,x,{scene:a,mesh:c,depthMaterial:p,renderTarget:f,output:f.texture}]},Zt=(e,n,t)=>{const r=i.useMemo(()=>{const u=new o.Mesh(n,t);return e.add(u),u},[n,t,e]);return i.useEffect(()=>()=>{e.remove(r),n.dispose(),t.dispose()},[e,n,t,r]),r},de=Object.freeze({easeInSine(e){return 1-Math.cos(e*Math.PI/2)},easeOutSine(e){return Math.sin(e*Math.PI/2)},easeInOutSine(e){return-(Math.cos(Math.PI*e)-1)/2},easeInQuad(e){return e*e},easeOutQuad(e){return 1-(1-e)*(1-e)},easeInOutQuad(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2},easeInCubic(e){return e*e*e},easeOutCubic(e){return 1-Math.pow(1-e,3)},easeInOutCubic(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2},easeInQuart(e){return e*e*e*e},easeOutQuart(e){return 1-Math.pow(1-e,4)},easeInOutQuart(e){return e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2},easeInQuint(e){return e*e*e*e*e},easeOutQuint(e){return 1-Math.pow(1-e,5)},easeInOutQuint(e){return e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2},easeInExpo(e){return e===0?0:Math.pow(2,10*e-10)},easeOutExpo(e){return e===1?1:1-Math.pow(2,-10*e)},easeInOutExpo(e){return e===0?0:e===1?1:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2},easeInCirc(e){return 1-Math.sqrt(1-Math.pow(e,2))},easeOutCirc(e){return Math.sqrt(1-Math.pow(e-1,2))},easeInOutCirc(e){return e<.5?(1-Math.sqrt(1-Math.pow(2*e,2)))/2:(Math.sqrt(1-Math.pow(-2*e+2,2))+1)/2},easeInBack(e){return 2.70158*e*e*e-1.70158*e*e},easeOutBack(e){return 1+2.70158*Math.pow(e-1,3)+1.70158*Math.pow(e-1,2)},easeInOutBack(e){const t=2.5949095;return e<.5?Math.pow(2*e,2)*((t+1)*2*e-t)/2:(Math.pow(2*e-2,2)*((t+1)*(e*2-2)+t)+2)/2},easeInElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*n)},easeOutElastic(e){const n=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*n)+1},easeInOutElastic(e){const n=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*n))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*n)/2+1},easeInBounce(e){return 1-de.easeOutBounce(1-e)},easeOutBounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},easeInOutBounce(e){return e<.5?(1-de.easeOutBounce(1-2*e))/2:(1+de.easeOutBounce(2*e-1))/2}});function Jt(e){let n=Math.sin(e*12.9898)*43758.5453;return n-Math.floor(n)}const er=(e,n="easeOutQuart")=>{const t=e/60,r=de[n];return i.useCallback(m=>{let l=m.getElapsedTime()*t;const s=Math.floor(l),v=r(l-s);l=v+s;const g=Jt(s);return{beat:l,floor:s,fract:v,hash:g}},[t,r])},nr=(e=60)=>{const n=i.useMemo(()=>1/Math.max(Math.min(e,60),1),[e]),t=i.useRef(null);return i.useCallback(u=>{const m=u.getElapsedTime();return t.current===null||m-t.current>=n?(t.current=m,!0):!1},[n])},tr=e=>{var r,u;const n=(r=e.dom)==null?void 0:r.length,t=(u=e.texture)==null?void 0:u.length;return!n||!t||n!==t};var rr=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,or=`precision highp float;

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
}`;const ar=({params:e,scene:n,uniforms:t,onBeforeCompile:r})=>{n.children.length>0&&(n.children.forEach(u=>{u instanceof o.Mesh&&(u.geometry.dispose(),u.material.dispose())}),n.remove(...n.children)),e.texture.forEach((u,m)=>{const l=new o.ShaderMaterial({uniforms:{u_texture:{value:u},u_textureResolution:{value:new o.Vector2(0,0)},u_resolution:{value:new o.Vector2(0,0)},u_borderRadius:{value:e.boderRadius[m]?e.boderRadius[m]:0},...t},vertexShader:rr,fragmentShader:or,...z,transparent:!0});l.onBeforeCompile=B(r);const s=new o.Mesh(new o.PlaneGeometry(1,1),l);n.add(s)})},ur=()=>{const e=i.useRef([]),n=i.useRef([]);return i.useCallback(({isIntersectingRef:r,isIntersectingOnceRef:u,params:m})=>{e.current.length>0&&e.current.forEach((s,v)=>{s.unobserve(n.current[v])}),n.current=[],e.current=[];const l=new Array(m.dom.length).fill(!1);r.current=[...l],u.current=[...l],m.dom.forEach((s,v)=>{const g=y=>{y.forEach(M=>{m.onIntersect[v]&&m.onIntersect[v](M),r.current[v]=M.isIntersecting})},d=new IntersectionObserver(g,{rootMargin:"0px",threshold:0});d.observe(s),e.current.push(d),n.current.push(s)})},[])},ir=()=>{const e=i.useRef([]),n=i.useCallback(({params:t,customParams:r,size:u,resolutionRef:m,scene:l,isIntersectingRef:s})=>{l.children.length!==e.current.length&&(e.current=new Array(l.children.length)),l.children.forEach((v,g)=>{var M,a,h,c,p,f;const d=t.dom[g];if(!d)return;const y=d.getBoundingClientRect();if(e.current[g]=y,v.scale.set(y.width,y.height,1),v.position.set(y.left+y.width*.5-u.width*.5,-y.top-y.height*.5+u.height*.5,0),s.current[g]&&(t.rotation[g]&&v.rotation.copy(t.rotation[g]),v instanceof o.Mesh)){const w=v.material,b=R(w),x=V(w);b("u_texture",t.texture[g]),b("u_textureResolution",[((h=(a=(M=t.texture[g])==null?void 0:M.source)==null?void 0:a.data)==null?void 0:h.width)||0,((f=(p=(c=t.texture[g])==null?void 0:c.source)==null?void 0:p.data)==null?void 0:f.height)||0]),b("u_resolution",m.current.set(y.width,y.height)),b("u_borderRadius",t.boderRadius[g]?t.boderRadius[g]:0),x(r)}})},[]);return[e.current,n]},sr=()=>{const e=i.useRef([]),n=i.useRef([]),t=i.useCallback((r,u=!1)=>{e.current.forEach((l,s)=>{l&&(n.current[s]=!0)});const m=u?[...n.current]:[...e.current];return r<0?m:m[r]},[]);return{isIntersectingRef:e,isIntersectingOnceRef:n,isIntersecting:t}},lr=e=>({onView:t,onHidden:r})=>{const u=i.useRef(!1);i.useEffect(()=>{let m;const l=()=>{e.current.some(s=>s)?u.current||(t&&t(),u.current=!0):u.current&&(r&&r(),u.current=!1),m=requestAnimationFrame(l)};return m=requestAnimationFrame(l),()=>{cancelAnimationFrame(m)}},[t,r])},Ee={texture:[],dom:[],boderRadius:[],rotation:[],onIntersect:[]},cr=({size:e,dpr:n,samples:t,isSizeUpdate:r,uniforms:u,onBeforeCompile:m},l=[])=>{const s=U(n),v=i.useMemo(()=>new o.Scene,[]),g=k(e),[d,y]=j({scene:v,camera:g,size:e,dpr:s.fbo,samples:t,isSizeUpdate:r}),[M,a]=$({...Ee,updateKey:performance.now()}),[h,c]=ir(),p=i.useRef(new o.Vector2(0,0)),[f,w]=i.useState(!0);i.useMemo(()=>w(!0),l);const b=i.useRef(null),x=i.useMemo(()=>D,[]),S=ur(),{isIntersectingOnceRef:_,isIntersectingRef:T,isIntersecting:I}=sr(),A=lr(T),F=i.useMemo(()=>(O,q)=>{a(O),c({params:M,customParams:q,size:e,resolutionRef:p,scene:v,isIntersectingRef:T})},[T,a,c,e,v,M]);return[i.useCallback((O,q,ae)=>{const{gl:H,size:G}=O;if(F(q,ae),tr(M))return x;if(f){if(b.current===M.updateKey)return x;b.current=M.updateKey}return f&&(ar({params:M,size:G,scene:v,uniforms:u,onBeforeCompile:m}),S({isIntersectingRef:T,isIntersectingOnceRef:_,params:M}),w(!1)),y(H)},[y,u,S,m,f,v,M,_,T,x,F]),F,{scene:v,camera:g,renderTarget:d,output:d.texture,isIntersecting:I,DOMRects:h,intersections:T.current,useDomView:A}]},vr=({scene:e,camera:n,size:t,dpr:r=!1,isSizeUpdate:u=!1,samples:m=0,depthBuffer:l=!1,depthTexture:s=!1},v)=>{const g=i.useRef([]),d=X(t,r);g.current=i.useMemo(()=>Array.from({length:v},()=>{const M=new o.WebGLRenderTarget(d.x,d.y,{...me,samples:m,depthBuffer:l});return s&&(M.depthTexture=new o.DepthTexture(d.x,d.y,o.FloatType)),M}),[v]),u&&g.current.forEach(M=>M.setSize(d.x,d.y)),i.useEffect(()=>{const M=g.current;return()=>{M.forEach(a=>a.dispose())}},[v]);const y=i.useCallback((M,a,h)=>{const c=g.current[a];return he({gl:M,scene:e,camera:n,fbo:c,onBeforeRender:()=>h&&h({read:c.texture})}),c.texture},[e,n]);return[g.current,y]};C.ALPHABLENDING_PARAMS=Ae,C.BLANK_PARAMS=Fe,C.BLENDING_PARAMS=le,C.BRIGHTNESSPICKER_PARAMS=pe,C.BRUSH_PARAMS=Z,C.CHROMAKEY_PARAMS=Q,C.COLORSTRATA_PARAMS=Y,C.COSPALETTE_PARAMS=ie,C.COVERTEXTURE_PARAMS=Ie,C.DELTA_TIME=Se,C.DOMSYNCER_PARAMS=Ee,C.DUOTONE_PARAMS=xe,C.Easing=de,C.FBO_OPTION=me,C.FLUID_PARAMS=Pe,C.FXBLENDING_PARAMS=Ce,C.FXTEXTURE_PARAMS=te,C.HSV_PARAMS=Me,C.MARBLE_PARAMS=oe,C.MORPHPARTICLES_PARAMS=E,C.MOTIONBLUR_PARAMS=fe,C.NOISE_PARAMS=ne,C.RIPPLE_PARAMS=Re,C.SIMPLEBLUR_PARAMS=_e,C.WAVE_PARAMS=ce,C.WOBBLE3D_PARAMS=W,C.renderFBO=he,C.setCustomUniform=V,C.setUniform=R,C.useAddMesh=Zt,C.useAlphaBlending=mt,C.useBeat=er,C.useBlank=kt,C.useBlending=Yn,C.useBrightnessPicker=ot,C.useBrush=nn,C.useCamera=k,C.useChromaKey=Ot,C.useColorStrata=Bn,C.useCopyTexture=vr,C.useCosPalette=jn,C.useCoverTexture=yt,C.useCreateMorphParticles=ze,C.useCreateWobble3D=Ue,C.useDomSyncer=cr,C.useDoubleFBO=re,C.useDuoTone=Gn,C.useFPSLimiter=nr,C.useFluid=Sn,C.useFxBlending=st,C.useFxTexture=et,C.useHSV=gt,C.useMarble=En,C.useMorphParticles=Gt,C.useMotionBlur=Pt,C.useNoise=An,C.useParams=$,C.usePointer=ge,C.useResolution=X,C.useRipple=Tn,C.useSimpleBlur=_t,C.useSingleFBO=j,C.useWave=Ft,C.useWobble3D=Qt,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
