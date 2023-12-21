(function(p,I){typeof exports=="object"&&typeof module<"u"?I(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],I):(p=typeof globalThis<"u"?globalThis:p||self,I(p["use-shader-fx"]={},p.THREE,p.React))})(this,function(p,I,a){"use strict";function ue(t){const i=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(t){for(const r in t)if(r!=="default"){const e=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(i,r,e.get?e:{enumerable:!0,get:()=>t[r]})}}return i.default=t,Object.freeze(i)}const n=ue(I);var ae=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ie=`precision highp float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float width, float aspect) {
	
	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	
	vec2 dir = normalize(end - start);
	
	
	vec2 n = vec2(dir.y, -dir.x);

	vec2 p0 = point - start;
	
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	
	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < width && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < width || distFromEnd < width;

	return float(withinLine);
}

vec4 createSmudge(){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);
	
	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.0);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uMap, vUv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

vec4 createMotionBlur(vec4 baseColor, vec2 velocity, float motion, int samples) {
	vec4 motionBlurredColor = baseColor;
	vec2 scaledVelocity = velocity * motion;
	for(int i = 1; i < samples; i++) {
		float t = float(i) / float(samples - 1);
		vec2 offset = t * scaledVelocity / uResolution;
		motionBlurredColor += texture2D(uMap, vUv + offset);
	}
	return motionBlurredColor / float(samples);
}

void main() {
	
	vec2 st = vUv * 2.0 - 1.0;
	
	
	vec2 velocity = uVelocity * uResolution;

	
	vec4 smudgedColor = createSmudge();
	
	
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, velocity, uMotionBlur,uMotionSample);

	vec4 bufferColor = motionBlurredColor * uDissipation;

	
	float modifiedRadius = max(0.0,uRadius);

	
	vec3 color = uColor;

	
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	float onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect);
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);
	
	gl_FragColor = vec4(bufferColor.rgb,1.0);
}`;const F=(t,i=!1)=>{const r=i?t.width*i:t.width,e=i?t.height*i:t.height;return a.useMemo(()=>new n.Vector2(r,e),[r,e])},P=(t,i,r)=>{const e=a.useMemo(()=>new n.Mesh(i,r),[i,r]);return a.useEffect(()=>{t.add(e)},[t,e]),a.useEffect(()=>()=>{t.remove(e),i.dispose(),r.dispose()},[t,i,r,e]),e},s=(t,i,r)=>{t.uniforms&&t.uniforms[i]&&r!==void 0&&r!==null?t.uniforms[i].value=r:console.error(`Uniform key "${String(i)}" does not exist in the material. or "${String(i)}" is null | undefined`)},se=({scene:t,size:i,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:ae,fragmentShader:ie}),[]),l=F(i,r);return a.useEffect(()=>{s(u,"uAspect",l.width/l.height),s(u,"uResolution",l.clone())},[l,u]),P(t,e,u),u},le=(t,i)=>{const r=i,e=t/i,[u,l]=[r*e/2,r/2];return{width:u,height:l,near:-1e3,far:1e3}},_=t=>{const i=F(t),{width:r,height:e,near:u,far:l}=le(i.x,i.y);return a.useMemo(()=>new n.OrthographicCamera(-r,r,e,-e,u,l),[r,e,u,l])},L={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,depthBuffer:!1,stencilBuffer:!1},R=({scene:t,camera:i,size:r,dpr:e=!1,isSizeUpdate:u=!1})=>{const l=a.useRef(),v=F(r,e);l.current=a.useMemo(()=>new n.WebGLRenderTarget(v.x,v.y,L),[]),a.useLayoutEffect(()=>{var c;u&&((c=l.current)==null||c.setSize(v.x,v.y))},[v,u]),a.useEffect(()=>{const c=l.current;return()=>{c==null||c.dispose()}},[]);const o=a.useCallback((c,f)=>{const d=l.current;return c.setRenderTarget(d),f&&f({read:d.texture}),c.render(t,i),c.setRenderTarget(null),c.clear(),d.texture},[t,i]);return[l.current,o]},O=({scene:t,camera:i,size:r,dpr:e=!1,isSizeUpdate:u=!1})=>{const l=a.useRef({read:null,write:null,swap:function(){let f=this.read;this.read=this.write,this.write=f}}),v=F(r,e),o=a.useMemo(()=>{const f=new n.WebGLRenderTarget(v.x,v.y,L),d=new n.WebGLRenderTarget(v.x,v.y,L);return{read:f,write:d}},[]);l.current.read=o.read,l.current.write=o.write,a.useLayoutEffect(()=>{var f,d;u&&((f=l.current.read)==null||f.setSize(v.x,v.y),(d=l.current.write)==null||d.setSize(v.x,v.y))},[v,u]),a.useEffect(()=>{const f=l.current;return()=>{var d,m;(d=f.read)==null||d.dispose(),(m=f.write)==null||m.dispose()}},[]);const c=a.useCallback((f,d)=>{var g;const m=l.current;return f.setRenderTarget(m.write),d&&d({read:m.read.texture,write:m.write.texture}),f.render(t,i),m.swap(),f.setRenderTarget(null),f.clear(),(g=m.read)==null?void 0:g.texture},[t,i]);return[{read:l.current.read,write:l.current.write},c]},z=()=>{const t=a.useRef(new n.Vector2(0,0)),i=a.useRef(new n.Vector2(0,0)),r=a.useRef(0),e=a.useRef(new n.Vector2(0,0)),u=a.useRef(!1);return a.useCallback(v=>{const o=performance.now(),c=v.clone();r.current===0&&(r.current=o,t.current=c);const f=Math.max(1,o-r.current);r.current=o,e.current.copy(c).sub(t.current).divideScalar(f);const d=e.current.length()>0,m=u.current?t.current.clone():c;return!u.current&&d&&(u.current=!0),t.current=c,{currentPointer:c,prevPointer:m,diffPointer:i.current.subVectors(c,m),velocity:e.current,isVelocityUpdate:d}},[])},b=t=>{const i=u=>Object.values(u).some(l=>typeof l=="function"),r=a.useRef(i(t)?t:structuredClone(t)),e=a.useCallback(u=>{for(const l in u){const v=l;v in r.current&&u[v]!==void 0&&u[v]!==null?r.current[v]=u[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[r.current,e]},G={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},ce=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=se({scene:r,size:t,dpr:i}),u=_(t),l=z(),[v,o]=O({scene:r,camera:u,size:t,dpr:i}),[c,f]=b(G);return[a.useCallback((m,g)=>{const{gl:x,pointer:h}=m;g&&f(g),s(e,"uTexture",c.texture),s(e,"uRadius",c.radius),s(e,"uSmudge",c.smudge),s(e,"uDissipation",c.dissipation),s(e,"uMotionBlur",c.motionBlur),s(e,"uMotionSample",c.motionSample),s(e,"uColor",c.color);const{currentPointer:y,prevPointer:w,velocity:C}=l(h);return s(e,"uMouse",y),s(e,"uPrevMouse",w),s(e,"uVelocity",C),o(x,({read:U})=>{s(e,"uMap",U)})},[e,l,o,c,f]),f,{scene:r,material:e,camera:u,renderTarget:v}]};var ve=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,fe=`precision highp float;

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
}`;const de=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:ve,fragmentShader:fe}),[]);return P(t,i,r),r},N={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},me=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=de(r),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i}),[o,c]=b(N);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),s(e,"uTexture",o.texture),s(e,"uColor0",o.color0),s(e,"uColor1",o.color1),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]};var pe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ge=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D u_map;
uniform float u_mapIntensity;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;
uniform vec3 u_color;

void main() {
	vec2 uv = vUv;

	vec3 mapColor = texture2D(u_map, uv).rgb;
	vec3 normalizedMap = mapColor * 2.0 - 1.0;

	float brightness = dot(mapColor,u_brightness);
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(u_texture, uv);

	float blendValue = smoothstep(u_min, u_max, brightness);

	vec3 outputColor = blendValue * u_color + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;const xe=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:.9},u_color:{value:new n.Color(16777215)}},vertexShader:pe,fragmentShader:ge}),[]);return P(t,i,r),r},W={texture:new n.Texture,map:new n.Texture,mapIntensity:.3,brightness:new n.Vector3(.5,.5,.5),min:0,max:1,color:new n.Color(16777215)},he=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=xe(r),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i}),[o,c]=b(W);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),s(e,"u_texture",o.texture),s(e,"u_map",o.map),s(e,"u_mapIntensity",o.mapIntensity),s(e,"u_brightness",o.brightness),s(e,"u_min",o.min),s(e,"u_max",o.max),s(e,"u_color",o.color),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]};var A=`varying vec2 vUv;
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
}`,ye=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Me=()=>a.useMemo(()=>new n.ShaderMaterial({vertexShader:A,fragmentShader:ye,depthTest:!1,depthWrite:!1}),[]);var Te=`precision highp float;

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
}`;const Se=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:A,fragmentShader:Te}),[]);var we=`precision highp float;

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
}`;const _e=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:we}),[]);var Re=`precision highp float;

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
}`;const be=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Re}),[]);var Ce=`precision highp float;

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
}`;const De=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ce}),[]);var Pe=`precision highp float;

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
}`;const Ue=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Pe}),[]);var Ve=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Fe=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ve}),[]);var Ae=`precision highp float;

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
}`;const Oe=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ae}),[]);var Be=`precision highp float;

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
}`;const Ee=()=>a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Be}),[]),Ie=({scene:t,size:i,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=Me(),l=u.clone(),v=De(),o=Ue(),c=Se(),f=_e(),d=be(),m=Fe(),g=Oe(),x=Ee(),h=a.useMemo(()=>({vorticityMaterial:o,curlMaterial:v,advectionMaterial:c,divergenceMaterial:f,pressureMaterial:d,clearMaterial:m,gradientSubtractMaterial:g,splatMaterial:x}),[o,v,c,f,d,m,g,x]),y=F(i,r);a.useEffect(()=>{s(h.splatMaterial,"aspectRatio",y.x/y.y);for(const M of Object.values(h))s(M,"texelSize",new n.Vector2(1/y.x,1/y.y))},[y,h]);const w=P(t,e,u);a.useEffect(()=>{u.dispose(),w.material=l},[u,w,l]),a.useEffect(()=>()=>{for(const M of Object.values(h))M.dispose()},[h]);const C=a.useCallback(M=>{w.material=M,w.material.needsUpdate=!0},[w]);return[h,C]},H={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new n.Vector3(1,1,1)},Le=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),[e,u]=Ie({scene:r,size:t,dpr:i}),l=_(t),v=z(),o=a.useMemo(()=>({scene:r,camera:l,size:t}),[r,l,t]),[c,f]=O(o),[d,m]=O(o),[g,x]=R(o),[h,y]=R(o),[w,C]=O(o),M=a.useRef(0),U=a.useRef(new n.Vector2(0,0)),B=a.useRef(new n.Vector3(0,0,0)),[D,T]=b(H);return[a.useCallback((Tn,ne)=>{const{gl:V,pointer:Sn,clock:k,size:te}=Tn;ne&&T(ne),M.current===0&&(M.current=k.getElapsedTime());const re=Math.min((k.getElapsedTime()-M.current)/3,.02);M.current=k.getElapsedTime();const j=f(V,({read:S})=>{u(e.advectionMaterial),s(e.advectionMaterial,"uVelocity",S),s(e.advectionMaterial,"uSource",S),s(e.advectionMaterial,"dt",re),s(e.advectionMaterial,"dissipation",D.velocity_dissipation)}),wn=m(V,({read:S})=>{u(e.advectionMaterial),s(e.advectionMaterial,"uVelocity",j),s(e.advectionMaterial,"uSource",S),s(e.advectionMaterial,"dissipation",D.density_dissipation)}),{currentPointer:_n,diffPointer:Rn,isVelocityUpdate:bn,velocity:Cn}=v(Sn);bn&&(f(V,({read:S})=>{u(e.splatMaterial),s(e.splatMaterial,"uTarget",S),s(e.splatMaterial,"point",_n);const E=Rn.multiply(U.current.set(te.width,te.height).multiplyScalar(D.velocity_acceleration));s(e.splatMaterial,"color",B.current.set(E.x,E.y,1)),s(e.splatMaterial,"radius",D.splat_radius)}),m(V,({read:S})=>{u(e.splatMaterial),s(e.splatMaterial,"uTarget",S);const E=typeof D.fluid_color=="function"?D.fluid_color(Cn):D.fluid_color;s(e.splatMaterial,"color",E)}));const Dn=x(V,()=>{u(e.curlMaterial),s(e.curlMaterial,"uVelocity",j)});f(V,({read:S})=>{u(e.vorticityMaterial),s(e.vorticityMaterial,"uVelocity",S),s(e.vorticityMaterial,"uCurl",Dn),s(e.vorticityMaterial,"curl",D.curl_strength),s(e.vorticityMaterial,"dt",re)});const Pn=y(V,()=>{u(e.divergenceMaterial),s(e.divergenceMaterial,"uVelocity",j)});C(V,({read:S})=>{u(e.clearMaterial),s(e.clearMaterial,"uTexture",S),s(e.clearMaterial,"value",D.pressure_dissipation)}),u(e.pressureMaterial),s(e.pressureMaterial,"uDivergence",Pn);let oe;for(let S=0;S<D.pressure_iterations;S++)oe=C(V,({read:E})=>{s(e.pressureMaterial,"uPressure",E)});return f(V,({read:S})=>{u(e.gradientSubtractMaterial),s(e.gradientSubtractMaterial,"uPressure",oe),s(e.gradientSubtractMaterial,"uVelocity",S)}),wn},[e,u,x,m,y,v,C,f,T,D]),T,{scene:r,materials:e,camera:l,renderTarget:{velocity:c,density:d,curl:g,divergence:h,pressure:w}}]},ze=({scale:t,max:i,texture:r,scene:e})=>{const u=a.useRef([]),l=a.useMemo(()=>new n.PlaneGeometry(t,t),[t]),v=a.useMemo(()=>new n.MeshBasicMaterial({map:r??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[r]);return a.useEffect(()=>{for(let o=0;o<i;o++){const c=new n.Mesh(l.clone(),v.clone());c.rotateZ(2*Math.PI*Math.random()),c.visible=!1,e.add(c),u.current.push(c)}},[l,v,e,i]),a.useEffect(()=>()=>{u.current.forEach(o=>{o.geometry.dispose(),Array.isArray(o.material)?o.material.forEach(c=>c.dispose()):o.material.dispose(),e.remove(o)}),u.current=[]},[e]),u.current},X={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},$e=({texture:t,scale:i=64,max:r=100,size:e})=>{const u=a.useMemo(()=>new n.Scene,[]),l=ze({scale:i,max:r,texture:t,scene:u}),v=_(e),o=z(),[c,f]=R({scene:u,camera:v,size:e}),[d,m]=b(X),g=a.useRef(0);return[a.useCallback((h,y)=>{const{gl:w,pointer:C,size:M}=h;y&&m(y);const{currentPointer:U,diffPointer:B}=o(C);if(d.frequency<B.length()){const T=l[g.current];T.visible=!0,T.position.set(U.x*(M.width/2),U.y*(M.height/2),0),T.scale.x=T.scale.y=0,T.material.opacity=d.alpha,g.current=(g.current+1)%r}return l.forEach(T=>{if(T.visible){const $=T.material;T.rotation.z+=d.rotation,$.opacity*=d.fadeout_speed,T.scale.x=d.fadeout_speed*T.scale.x+d.scale,T.scale.y=T.scale.x,$.opacity<.002&&(T.visible=!1)}}),f(w)},[f,l,o,r,d,m]),m,{scene:u,camera:v,meshArr:l,renderTarget:c}]};var ke=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,je=`precision highp float;

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
	vec2 bgRatio=vec2(
		min((uResolution.x/uResolution.y)/(uTextureResolution.x/uTextureResolution.y),1.),
		min((uResolution.y/uResolution.x)/(uTextureResolution.y/uTextureResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	
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

}`;const Ge=({scene:t,size:i,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},padding:{value:0},uMap:{value:new n.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new n.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:ke,fragmentShader:je}),[]),l=F(i,r);return a.useEffect(()=>{u.uniforms.uResolution.value=l.clone()},[l,u]),P(t,e,u),u},Y={texture0:new n.Texture,texture1:new n.Texture,textureResolution:new n.Vector2(0,0),padding:0,map:new n.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new n.Vector2(0,0),progress:0,dir:new n.Vector2(0,0)},Ne=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=Ge({scene:r,size:t,dpr:i}),u=_(t),[l,v]=R({scene:r,camera:u,dpr:i,size:t,isSizeUpdate:!0}),[o,c]=b(Y);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),s(e,"uTexture0",o.texture0),s(e,"uTexture1",o.texture1),s(e,"uTextureResolution",o.textureResolution),s(e,"padding",o.padding),s(e,"uMap",o.map),s(e,"mapIntensity",o.mapIntensity),s(e,"edgeIntensity",o.edgeIntensity),s(e,"epicenter",o.epicenter),s(e,"progress",o.progress),s(e,"dirX",o.dir.x),s(e,"dirY",o.dir.y),v(g)},[v,e,o,c]),c,{scene:r,material:e,camera:u,renderTarget:l}]};var We=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,He=`precision highp float;
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
}`;const Xe=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new n.Vector2},warpStrength:{value:0}},vertexShader:We,fragmentShader:He}),[]);return P(t,i,r),r},q={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new n.Vector2(2,2),warpStrength:8},Ye=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=Xe(r),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i}),[o,c]=b(q);return[a.useCallback((d,m)=>{const{gl:g,clock:x}=d;return m&&c(m),s(e,"scale",o.scale),s(e,"timeStrength",o.timeStrength),s(e,"noiseOctaves",o.noiseOctaves),s(e,"fbmOctaves",o.fbmOctaves),s(e,"warpOctaves",o.warpOctaves),s(e,"warpDirection",o.warpDirection),s(e,"warpStrength",o.warpStrength),s(e,"uTime",x.getElapsedTime()),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]},qe=t=>{var u,l,v;const i=(u=t.dom)==null?void 0:u.length,r=(l=t.texture)==null?void 0:l.length,e=(v=t.resolution)==null?void 0:v.length;if(!i||!r||!e)throw new Error("No dom or texture or resolution is set");if(i!==r||i!==e)throw new Error("Match dom, texture and resolution length")};var Ke=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,Ze=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_textureResolution;
uniform vec2 u_resolution;
uniform float u_borderRadius;

void main() {
	
	vec2 ratio = vec2(
		min((u_resolution.x / u_resolution.y) / (u_textureResolution.x / u_textureResolution.y), 1.0),
		min((u_resolution.y / u_resolution.x) / (u_textureResolution.y / u_textureResolution.x), 1.0)
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
}`;const Je=({params:t,size:i,scene:r})=>{r.children.length>0&&(r.children.forEach(e=>{e instanceof n.Mesh&&(e.geometry.dispose(),e.material.dispose())}),r.remove(...r.children)),t.texture.forEach((e,u)=>{const l=new n.Mesh(new n.PlaneGeometry(1,1),new n.ShaderMaterial({vertexShader:Ke,fragmentShader:Ze,transparent:!0,uniforms:{u_texture:{value:e},u_textureResolution:{value:new n.Vector2(0,0)},u_resolution:{value:new n.Vector2(0,0)},u_borderRadius:{value:t.boderRadius[u]?t.boderRadius[u]:0}}}));r.add(l)})},Qe=()=>{const t=a.useRef([]),i=a.useRef([]);return a.useCallback(({isIntersectingRef:e,isIntersectingOnceRef:u,params:l})=>{t.current.length>0&&t.current.forEach((o,c)=>{o.unobserve(i.current[c])}),i.current=[],t.current=[];const v=new Array(l.dom.length).fill(!1);e.current=[...v],u.current=[...v],l.dom.forEach((o,c)=>{const f=m=>{m.forEach(g=>{l.onIntersect[c]&&l.onIntersect[c](g),e.current[c]=g.isIntersecting})},d=new IntersectionObserver(f,{rootMargin:"0px",threshold:0});d.observe(o),t.current.push(d),i.current.push(o)})},[])},en=({params:t,size:i,resolutionRef:r,scene:e,isIntersectingRef:u})=>{e.children.forEach((l,v)=>{const o=t.dom[v];if(!o)throw new Error("DOM is null.");if(u.current[v]){const c=o.getBoundingClientRect();if(l.scale.set(c.width,c.height,1),l.position.set(c.left+c.width*.5-i.width*.5,-c.top-c.height*.5+i.height*.5,0),t.rotation[v]&&l.rotation.copy(t.rotation[v]),l instanceof n.Mesh){const f=l.material;s(f,"u_texture",t.texture[v]),s(f,"u_textureResolution",t.resolution[v]),s(f,"u_resolution",r.current.set(c.width,c.height)),s(f,"u_borderRadius",t.boderRadius[v]?t.boderRadius[v]:0)}}})},nn=()=>{const t=a.useRef([]),i=a.useRef([]),r=a.useCallback((e,u=!1)=>{t.current.forEach((v,o)=>{v&&(i.current[o]=!0)});const l=u?[...i.current]:[...t.current];return e<0?l:l[e]},[]);return{isIntersectingRef:t,isIntersectingOnceRef:i,isIntersecting:r}},K={texture:[],dom:[],resolution:[],boderRadius:[],rotation:[],onIntersect:[]},tn=({size:t,dpr:i},r=[])=>{const e=a.useMemo(()=>new n.Scene,[]),u=_(t),[l,v]=R({scene:e,camera:u,size:t,dpr:i,isSizeUpdate:!0}),[o,c]=b(K),f=a.useRef(new n.Vector2(0,0)),[d,m]=a.useState(!0);a.useEffect(()=>{m(!0)},r);const g=Qe(),{isIntersectingOnceRef:x,isIntersectingRef:h,isIntersecting:y}=nn();return[a.useCallback((C,M)=>{const{gl:U,size:B}=C;return M&&c(M),qe(o),d&&(Je({params:o,size:B,scene:e}),g({isIntersectingRef:h,isIntersectingOnceRef:x,params:o}),m(!1)),en({params:o,size:B,resolutionRef:f,scene:e,isIntersectingRef:h}),v(U)},[v,c,g,d,e,o,x,h]),c,{scene:e,camera:u,renderTarget:l,isIntersecting:y}]};var rn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,on=`precision mediump float;

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
}`;const un=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:rn,fragmentShader:on}),[]);return P(t,i,r),r},Z={texture:new n.Texture,blurSize:3,blurPower:5},an=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=un(r),u=_(t),l=a.useMemo(()=>({scene:r,camera:u,size:t,dpr:i}),[r,u,t,i]),[v,o]=R(l),[c,f]=O(l),[d,m]=b(Z);return[a.useCallback((x,h)=>{const{gl:y}=x;h&&m(h),s(e,"uTexture",d.texture),s(e,"uResolution",[d.texture.source.data.width,d.texture.source.data.height]),s(e,"uBlurSize",d.blurSize);let w=f(y);const C=d.blurPower;for(let U=0;U<C;U++)s(e,"uTexture",w),w=f(y);return o(y)},[o,f,e,m,d]),m,{scene:r,material:e,camera:u,renderTarget:v}]};var sn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ln=`precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uStrength;
uniform float uWidth;
uniform vec2 uEpicenter;
uniform int uMode;

float PI = 3.141592653589;

void main() {
	float progress = min(uProgress, 1.0);
	float progressFactor = sin(progress * PI);

	float border = progress - progress * progressFactor * uWidth;
	float blur = uStrength * progressFactor;
	
	
	vec2 normalizeCenter = (uEpicenter + 1.0) / 2.0;

	
	float dist = uMode == 0 ? length(vUv - normalizeCenter) : uMode == 1 ? length(vUv.x - normalizeCenter.x) : length(vUv.y - normalizeCenter.y);

	
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
}`;const cn=({scene:t,size:i,dpr:r})=>{const e=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),u=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uEpicenter:{value:new n.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uResolution:{value:new n.Vector2},uMode:{value:0}},vertexShader:sn,fragmentShader:ln}),[]),l=F(i,r);return a.useEffect(()=>{u.uniforms.uResolution.value=l.clone()},[l,u]),P(t,e,u),u},J={epicenter:new n.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},vn=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=cn({scene:r,size:t,dpr:i}),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i,isSizeUpdate:!0}),[o,c]=b(J);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),s(e,"uEpicenter",o.epicenter),s(e,"uProgress",o.progress),s(e,"uWidth",o.width),s(e,"uStrength",o.strength),s(e,"uMode",o.mode==="center"?0:o.mode==="horizontal"?1:2),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]};var fn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,dn=`precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(u_texture, uv).rgb;
	float brightness = dot(color,u_brightness);
	float alpha = smoothstep(u_min, u_max, brightness);
	gl_FragColor = vec4(color, alpha);
}`;const mn=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:fn,fragmentShader:dn}),[]);return P(t,i,r),r},Q={texture:new n.Texture,brightness:new n.Vector3(.5,.5,.5),min:0,max:1},pn=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=mn(r),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i}),[o,c]=b(Q);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),s(e,"u_texture",o.texture),s(e,"u_brightness",o.brightness),s(e,"u_min",o.min),s(e,"u_max",o.max),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]};var gn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,xn=`precision highp float;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform bool isTexture;
uniform float laminateLayer;
uniform vec2 laminateInterval;
uniform vec2 laminateDetail;
uniform vec2 distortion;
uniform vec3 colorFactor;

void main() {
	vec2 uv = vUv;
	vec2 p = isTexture ? texture2D(uTexture, uv).rg : uv;
	float alpha = isTexture ? texture2D(uTexture, uv).a : 1.0;
	vec3 col;
	for(float j = 0.0; j < 3.0; j++){		
		for(float i = 1.0; i < laminateLayer; i++){
			p.x += laminateInterval.x / (i + j) * cos(i * distortion.x * p.y + sin(i + j));
			p.y += laminateInterval.y / (i + j) * cos(i * distortion.y * p.x + sin(i + j));
		}
		col[int(j)] = fract(p.x * laminateDetail.x + p.y * laminateDetail.y);
	}
	col *= colorFactor;
	col = clamp(col, 0.0, 1.0);
	gl_FragColor = vec4(col, alpha);
}`;const hn=t=>{const i=a.useMemo(()=>new n.PlaneGeometry(2,2),[]),r=a.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},isTexture:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new n.Vector2(.1,.1)},laminateDetail:{value:new n.Vector2(1,1)},distortion:{value:new n.Vector2(0,0)},colorFactor:{value:new n.Vector3(1,1,1)}},vertexShader:gn,fragmentShader:xn}),[]);return P(t,i,r),r},ee={texture:!1,laminateLayer:1,laminateInterval:new n.Vector2(.1,.1),laminateDetail:new n.Vector2(1,1),distortion:new n.Vector2(0,0),colorFactor:new n.Vector3(1,1,1)},yn=({size:t,dpr:i})=>{const r=a.useMemo(()=>new n.Scene,[]),e=hn(r),u=_(t),[l,v]=R({scene:r,camera:u,size:t,dpr:i}),[o,c]=b(ee);return[a.useCallback((d,m)=>{const{gl:g}=d;return m&&c(m),o.texture?(s(e,"uTexture",o.texture),s(e,"isTexture",!0)):s(e,"isTexture",!1),s(e,"laminateLayer",o.laminateLayer),s(e,"laminateInterval",o.laminateInterval),s(e,"laminateDetail",o.laminateDetail),s(e,"distortion",o.distortion),s(e,"colorFactor",o.colorFactor),v(g)},[v,e,c,o]),c,{scene:r,material:e,camera:u,renderTarget:l}]},Mn=({scene:t,camera:i,size:r,dpr:e=!1,isSizeUpdate:u=!1},l)=>{const v=a.useRef([]),o=F(r,e);v.current=a.useMemo(()=>Array.from({length:l},()=>new n.WebGLRenderTarget(o.x,o.y,L)),[l]),a.useLayoutEffect(()=>{u&&v.current.forEach(f=>f.setSize(o.x,o.y))},[o,u]),a.useEffect(()=>{const f=v.current;return()=>{f.forEach(d=>d.dispose())}},[l]);const c=a.useCallback((f,d,m)=>{const g=v.current[d];return f.setRenderTarget(g),m&&m({read:g.texture}),f.render(t,i),f.setRenderTarget(null),f.clear(),g.texture},[t,i]);return[v.current,c]};p.BLENDING_PARAMS=W,p.BRIGHTNESSPICKER_PARAMS=Q,p.BRUSH_PARAMS=G,p.COLORSTRATA_PARAMS=ee,p.DOMSYNCER_PARAMS=K,p.DUOTONE_PARAMS=N,p.FLUID_PARAMS=H,p.FXTEXTURE_PARAMS=Y,p.NOISE_PARAMS=q,p.RIPPLE_PARAMS=X,p.SIMPLEBLUR_PARAMS=Z,p.WAVE_PARAMS=J,p.setUniform=s,p.useAddMesh=P,p.useBlending=he,p.useBrightnessPicker=pn,p.useBrush=ce,p.useCamera=_,p.useColorStrata=yn,p.useCopyTexture=Mn,p.useDomSyncer=tn,p.useDoubleFBO=O,p.useDuoTone=me,p.useFluid=Le,p.useFxTexture=Ne,p.useNoise=Ye,p.useParams=b,p.usePointer=z,p.useResolution=F,p.useRipple=$e,p.useSimpleBlur=an,p.useSingleFBO=R,p.useWave=vn,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
