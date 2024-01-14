(function(x,z){typeof exports=="object"&&typeof module<"u"?z(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],z):(x=typeof globalThis<"u"?globalThis:x||self,z(x["use-shader-fx"]={},x.THREE,x.React))})(this,function(x,z,u){"use strict";function se(r){const s=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(r){for(const o in r)if(o!=="default"){const a=Object.getOwnPropertyDescriptor(r,o);Object.defineProperty(s,o,a.get?a:{enumerable:!0,get:()=>r[o]})}}return s.default=r,Object.freeze(s)}const n=se(z);var le=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ce=`precision highp float;

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
}`;const F=(r,s=!1)=>{const o=s?r.width*s:r.width,a=s?r.height*s:r.height;return u.useMemo(()=>new n.Vector2(o,a),[o,a])},P=(r,s,o)=>{const a=u.useMemo(()=>new n.Mesh(s,o),[s,o]);return u.useEffect(()=>{r.add(a)},[r,a]),u.useEffect(()=>()=>{r.remove(a),s.dispose(),o.dispose()},[r,s,o,a]),a},i=(r,s,o)=>{r.uniforms&&r.uniforms[s]&&o!==void 0&&o!==null?r.uniforms[s].value=o:console.error(`Uniform key "${String(s)}" does not exist in the material. or "${String(s)}" is null | undefined`)},ve=({scene:r,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:le,fragmentShader:ce}),[]),l=F(s,o);return u.useEffect(()=>{i(e,"uAspect",l.width/l.height),i(e,"uResolution",l.clone())},[l,e]),P(r,a,e),e},fe=(r,s)=>{const o=s,a=r/s,[e,l]=[o*a/2,o/2];return{width:e,height:l,near:-1e3,far:1e3}},b=r=>{const s=F(r),{width:o,height:a,near:e,far:l}=fe(s.x,s.y);return u.useMemo(()=>new n.OrthographicCamera(-o,o,a,-a,e,l),[o,a,e,l])},$=()=>{const r=u.useRef(new n.Vector2(0,0)),s=u.useRef(new n.Vector2(0,0)),o=u.useRef(0),a=u.useRef(new n.Vector2(0,0)),e=u.useRef(!1);return u.useCallback(d=>{const f=performance.now(),t=d.clone();o.current===0&&(o.current=f,r.current=t);const c=Math.max(1,f-o.current);o.current=f,a.current.copy(t).sub(r.current).divideScalar(c);const p=a.current.length()>0,m=e.current?r.current.clone():t;return!e.current&&p&&(e.current=!0),r.current=t,{currentPointer:t,prevPointer:m,diffPointer:s.current.subVectors(t,m),velocity:a.current,isVelocityUpdate:p}},[])},C=r=>{const s=e=>Object.values(e).some(l=>typeof l=="function"),o=u.useRef(s(r)?r:structuredClone(r)),a=u.useCallback(e=>{for(const l in e){const d=l;d in o.current&&e[d]!==void 0&&e[d]!==null?o.current[d]=e[d]:console.error(`"${String(d)}" does not exist in the params. or "${String(d)}" is null | undefined`)}},[]);return[o.current,a]},N={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,stencilBuffer:!1},D=({scene:r,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:d=!1,depthTexture:f=!1})=>{const t=u.useRef(),c=F(o,a);t.current=u.useMemo(()=>{const m=new n.WebGLRenderTarget(c.x,c.y,{...N,samples:l,depthBuffer:d});return f&&(m.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),m},[]),u.useLayoutEffect(()=>{var m;e&&((m=t.current)==null||m.setSize(c.x,c.y))},[c,e]),u.useEffect(()=>{const m=t.current;return()=>{m==null||m.dispose()}},[]);const p=u.useCallback((m,v)=>{const g=t.current;return m.setRenderTarget(g),v&&v({read:g.texture}),m.clear(),m.render(r,s),m.setRenderTarget(null),m.clear(),g.texture},[r,s]);return[t.current,p]},I=({scene:r,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:d=!1,depthTexture:f=!1})=>{const t=u.useRef({read:null,write:null,swap:function(){let v=this.read;this.read=this.write,this.write=v}}),c=F(o,a),p=u.useMemo(()=>{const v=new n.WebGLRenderTarget(c.x,c.y,{...N,samples:l,depthBuffer:d}),g=new n.WebGLRenderTarget(c.x,c.y,{...N,samples:l,depthBuffer:d});return f&&(v.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType),g.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),{read:v,write:g}},[]);t.current.read=p.read,t.current.write=p.write,u.useLayoutEffect(()=>{var v,g;e&&((v=t.current.read)==null||v.setSize(c.x,c.y),(g=t.current.write)==null||g.setSize(c.x,c.y))},[c,e]),u.useEffect(()=>{const v=t.current;return()=>{var g,h;(g=v.read)==null||g.dispose(),(h=v.write)==null||h.dispose()}},[]);const m=u.useCallback((v,g)=>{var y;const h=t.current;return v.setRenderTarget(h.write),g&&g({read:h.read.texture,write:h.write.texture}),v.clear(),v.render(r,s),h.swap(),v.setRenderTarget(null),v.clear(),(y=h.read)==null?void 0:y.texture},[r,s]);return[{read:t.current.read,write:t.current.write},m]},W={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},de=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=ve({scene:a,size:r,dpr:s}),l=b(r),d=$(),[f,t]=I({scene:a,camera:l,size:r,dpr:s,samples:o}),[c,p]=C(W);return[u.useCallback((v,g)=>{const{gl:h,pointer:y}=v;g&&p(g),i(e,"uTexture",c.texture),i(e,"uRadius",c.radius),i(e,"uSmudge",c.smudge),i(e,"uDissipation",c.dissipation),i(e,"uMotionBlur",c.motionBlur),i(e,"uMotionSample",c.motionSample),i(e,"uColor",c.color);const{currentPointer:M,prevPointer:w,velocity:T}=d(y);return i(e,"uMouse",M),i(e,"uPrevMouse",w),i(e,"uVelocity",T),t(h,({read:U})=>{i(e,"uMap",U)})},[e,d,t,c,p]),p,{scene:a,material:e,camera:l,renderTarget:f}]};var me=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,pe=`precision highp float;

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
}`;const ge=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:me,fragmentShader:pe}),[]);return P(r,s,o),o},X={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},xe=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=ge(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(X);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"uTexture",t.texture),i(e,"uColor0",t.color0),i(e,"uColor1",t.color1),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var he=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,ye=`precision highp float;

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
}`;const Me=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_alphaMap:{value:new n.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new n.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:he,fragmentShader:ye}),[]);return P(r,s,o),o},H={texture:new n.Texture,map:new n.Texture,alphaMap:!1,mapIntensity:.3,brightness:new n.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Te=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Me(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(H);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"u_texture",t.texture),i(e,"u_map",t.map),i(e,"u_mapIntensity",t.mapIntensity),t.alphaMap?(i(e,"u_alphaMap",t.alphaMap),i(e,"u_isAlphaMap",!0)):i(e,"u_isAlphaMap",!1),i(e,"u_brightness",t.brightness),i(e,"u_min",t.min),i(e,"u_max",t.max),t.dodgeColor?(i(e,"u_dodgeColor",t.dodgeColor),i(e,"u_isDodgeColor",!0)):i(e,"u_isDodgeColor",!1),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var A=`varying vec2 vUv;
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
}`,Se=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const we=()=>u.useMemo(()=>new n.ShaderMaterial({vertexShader:A,fragmentShader:Se,depthTest:!1,depthWrite:!1}),[]);var _e=`precision highp float;

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
}`;const Re=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:A,fragmentShader:_e}),[]);var be=`precision highp float;

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
}`;const Ce=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:be}),[]);var De=`precision highp float;

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
}`;const Pe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:De}),[]);var Ue=`precision highp float;

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
}`;const Ve=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ue}),[]);var Fe=`precision highp float;

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
}`;const Ae=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Fe}),[]);var Be=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Oe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Be}),[]);var Ee=`precision highp float;

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
}`;const Ie=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ee}),[]);var Le=`precision highp float;

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
}`;const ze=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Le}),[]),$e=({scene:r,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=we(),l=e.clone(),d=Ve(),f=Ae(),t=Re(),c=Ce(),p=Pe(),m=Oe(),v=Ie(),g=ze(),h=u.useMemo(()=>({vorticityMaterial:f,curlMaterial:d,advectionMaterial:t,divergenceMaterial:c,pressureMaterial:p,clearMaterial:m,gradientSubtractMaterial:v,splatMaterial:g}),[f,d,t,c,p,m,v,g]),y=F(s,o);u.useEffect(()=>{i(h.splatMaterial,"aspectRatio",y.x/y.y);for(const T of Object.values(h))i(T,"texelSize",new n.Vector2(1/y.x,1/y.y))},[y,h]);const M=P(r,a,e);u.useEffect(()=>{e.dispose(),M.material=l},[e,M,l]),u.useEffect(()=>()=>{for(const T of Object.values(h))T.dispose()},[h]);const w=u.useCallback(T=>{M.material=T,M.material.needsUpdate=!0},[M]);return[h,w]},Y={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new n.Vector3(1,1,1)},Ne=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),[e,l]=$e({scene:a,size:r,dpr:s}),d=b(r),f=$(),t=u.useMemo(()=>({scene:a,camera:d,size:r,samples:o}),[a,d,r,o]),[c,p]=I(t),[m,v]=I(t),[g,h]=D(t),[y,M]=D(t),[w,T]=I(t),B=u.useRef(0),U=u.useRef(new n.Vector2(0,0)),O=u.useRef(new n.Vector3(0,0,0)),[_,E]=C(Y);return[u.useCallback((k,oe)=>{const{gl:V,pointer:Dn,clock:j,size:ue}=k;oe&&E(oe),B.current===0&&(B.current=j.getElapsedTime());const ae=Math.min((j.getElapsedTime()-B.current)/3,.02);B.current=j.getElapsedTime();const G=p(V,({read:S})=>{l(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",S),i(e.advectionMaterial,"uSource",S),i(e.advectionMaterial,"dt",ae),i(e.advectionMaterial,"dissipation",_.velocity_dissipation)}),Pn=v(V,({read:S})=>{l(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",G),i(e.advectionMaterial,"uSource",S),i(e.advectionMaterial,"dissipation",_.density_dissipation)}),{currentPointer:Un,diffPointer:Vn,isVelocityUpdate:Fn,velocity:An}=f(Dn);Fn&&(p(V,({read:S})=>{l(e.splatMaterial),i(e.splatMaterial,"uTarget",S),i(e.splatMaterial,"point",Un);const L=Vn.multiply(U.current.set(ue.width,ue.height).multiplyScalar(_.velocity_acceleration));i(e.splatMaterial,"color",O.current.set(L.x,L.y,1)),i(e.splatMaterial,"radius",_.splat_radius)}),v(V,({read:S})=>{l(e.splatMaterial),i(e.splatMaterial,"uTarget",S);const L=typeof _.fluid_color=="function"?_.fluid_color(An):_.fluid_color;i(e.splatMaterial,"color",L)}));const Bn=h(V,()=>{l(e.curlMaterial),i(e.curlMaterial,"uVelocity",G)});p(V,({read:S})=>{l(e.vorticityMaterial),i(e.vorticityMaterial,"uVelocity",S),i(e.vorticityMaterial,"uCurl",Bn),i(e.vorticityMaterial,"curl",_.curl_strength),i(e.vorticityMaterial,"dt",ae)});const On=M(V,()=>{l(e.divergenceMaterial),i(e.divergenceMaterial,"uVelocity",G)});T(V,({read:S})=>{l(e.clearMaterial),i(e.clearMaterial,"uTexture",S),i(e.clearMaterial,"value",_.pressure_dissipation)}),l(e.pressureMaterial),i(e.pressureMaterial,"uDivergence",On);let ie;for(let S=0;S<_.pressure_iterations;S++)ie=T(V,({read:L})=>{i(e.pressureMaterial,"uPressure",L)});return p(V,({read:S})=>{l(e.gradientSubtractMaterial),i(e.gradientSubtractMaterial,"uPressure",ie),i(e.gradientSubtractMaterial,"uVelocity",S)}),Pn},[e,l,h,v,M,f,T,p,E,_]),E,{scene:a,materials:e,camera:d,renderTarget:{velocity:c,density:m,curl:g,divergence:y,pressure:w}}]},ke=({scale:r,max:s,texture:o,scene:a})=>{const e=u.useRef([]),l=u.useMemo(()=>new n.PlaneGeometry(r,r),[r]),d=u.useMemo(()=>new n.MeshBasicMaterial({map:o??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[o]);return u.useEffect(()=>{for(let f=0;f<s;f++){const t=new n.Mesh(l.clone(),d.clone());t.rotateZ(2*Math.PI*Math.random()),t.visible=!1,a.add(t),e.current.push(t)}},[l,d,a,s]),u.useEffect(()=>()=>{e.current.forEach(f=>{f.geometry.dispose(),Array.isArray(f.material)?f.material.forEach(t=>t.dispose()):f.material.dispose(),a.remove(f)}),e.current=[]},[a]),e.current},q={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},je=({texture:r,scale:s=64,max:o=100,size:a,dpr:e,samples:l=0})=>{const d=u.useMemo(()=>new n.Scene,[]),f=ke({scale:s,max:o,texture:r,scene:d}),t=b(a),c=$(),[p,m]=D({scene:d,camera:t,size:a,dpr:e,samples:l}),[v,g]=C(q),h=u.useRef(0);return[u.useCallback((M,w)=>{const{gl:T,pointer:B,size:U}=M;w&&g(w);const{currentPointer:O,diffPointer:_}=c(B);if(v.frequency<_.length()){const R=f[h.current];R.visible=!0,R.position.set(O.x*(U.width/2),O.y*(U.height/2),0),R.scale.x=R.scale.y=0,R.material.opacity=v.alpha,h.current=(h.current+1)%o}return f.forEach(R=>{if(R.visible){const k=R.material;R.rotation.z+=v.rotation,k.opacity*=v.fadeout_speed,R.scale.x=v.fadeout_speed*R.scale.x+v.scale,R.scale.y=R.scale.x,k.opacity<.002&&(R.visible=!1)}}),m(T)},[m,f,c,o,v,g]),g,{scene:d,camera:t,meshArr:f,renderTarget:p}]};var Ge=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,We=`precision highp float;

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

}`;const Xe=({scene:r,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},padding:{value:0},uMap:{value:new n.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new n.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Ge,fragmentShader:We}),[]),l=F(s,o);return u.useEffect(()=>{e.uniforms.uResolution.value=l.clone()},[l,e]),P(r,a,e),e},K={texture0:new n.Texture,texture1:new n.Texture,textureResolution:new n.Vector2(0,0),padding:0,map:new n.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new n.Vector2(0,0),progress:0,dir:new n.Vector2(0,0)},He=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Xe({scene:a,size:r,dpr:s}),l=b(r),[d,f]=D({scene:a,camera:l,dpr:s,size:r,samples:o,isSizeUpdate:!0}),[t,c]=C(K);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"uTexture0",t.texture0),i(e,"uTexture1",t.texture1),i(e,"uTextureResolution",t.textureResolution),i(e,"padding",t.padding),i(e,"uMap",t.map),i(e,"mapIntensity",t.mapIntensity),i(e,"edgeIntensity",t.edgeIntensity),i(e,"epicenter",t.epicenter),i(e,"progress",t.progress),i(e,"dirX",t.dir.x),i(e,"dirY",t.dir.y),f(g)},[f,e,t,c]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var Ye=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,qe=`precision highp float;
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
}`;const Ke=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new n.Vector2},warpStrength:{value:0}},vertexShader:Ye,fragmentShader:qe}),[]);return P(r,s,o),o},Z={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new n.Vector2(2,2),warpStrength:8},Ze=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Ke(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(Z);return[u.useCallback((m,v)=>{const{gl:g,clock:h}=m;return v&&c(v),i(e,"scale",t.scale),i(e,"timeStrength",t.timeStrength),i(e,"noiseOctaves",t.noiseOctaves),i(e,"fbmOctaves",t.fbmOctaves),i(e,"warpOctaves",t.warpOctaves),i(e,"warpDirection",t.warpDirection),i(e,"warpStrength",t.warpStrength),i(e,"uTime",h.getElapsedTime()),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]},Je=r=>{var e,l,d;const s=(e=r.dom)==null?void 0:e.length,o=(l=r.texture)==null?void 0:l.length,a=(d=r.resolution)==null?void 0:d.length;if(!s||!o||!a)throw new Error("No dom or texture or resolution is set");if(s!==o||s!==a)throw new Error("Match dom, texture and resolution length")};var Qe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,en=`precision highp float;

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
}`;const nn=({params:r,size:s,scene:o})=>{o.children.length>0&&(o.children.forEach(a=>{a instanceof n.Mesh&&(a.geometry.dispose(),a.material.dispose())}),o.remove(...o.children)),r.texture.forEach((a,e)=>{const l=new n.Mesh(new n.PlaneGeometry(1,1),new n.ShaderMaterial({vertexShader:Qe,fragmentShader:en,transparent:!0,uniforms:{u_texture:{value:a},u_textureResolution:{value:new n.Vector2(0,0)},u_resolution:{value:new n.Vector2(0,0)},u_borderRadius:{value:r.boderRadius[e]?r.boderRadius[e]:0}}}));o.add(l)})},tn=()=>{const r=u.useRef([]),s=u.useRef([]);return u.useCallback(({isIntersectingRef:a,isIntersectingOnceRef:e,params:l})=>{r.current.length>0&&r.current.forEach((f,t)=>{f.unobserve(s.current[t])}),s.current=[],r.current=[];const d=new Array(l.dom.length).fill(!1);a.current=[...d],e.current=[...d],l.dom.forEach((f,t)=>{const c=m=>{m.forEach(v=>{l.onIntersect[t]&&l.onIntersect[t](v),a.current[t]=v.isIntersecting})},p=new IntersectionObserver(c,{rootMargin:"0px",threshold:0});p.observe(f),r.current.push(p),s.current.push(f)})},[])},rn=()=>{const r=u.useRef([]),s=u.useCallback(({params:o,size:a,resolutionRef:e,scene:l,isIntersectingRef:d})=>{l.children.length!==r.current.length&&(r.current=new Array(l.children.length)),l.children.forEach((f,t)=>{const c=o.dom[t];if(!c)throw new Error("DOM is null.");const p=c.getBoundingClientRect();if(r.current[t]=p,f.scale.set(p.width,p.height,1),f.position.set(p.left+p.width*.5-a.width*.5,-p.top-p.height*.5+a.height*.5,0),d.current[t]&&(o.rotation[t]&&f.rotation.copy(o.rotation[t]),f instanceof n.Mesh)){const m=f.material;i(m,"u_texture",o.texture[t]),i(m,"u_textureResolution",o.resolution[t]),i(m,"u_resolution",e.current.set(p.width,p.height)),i(m,"u_borderRadius",o.boderRadius[t]?o.boderRadius[t]:0)}})},[]);return[r.current,s]},on=()=>{const r=u.useRef([]),s=u.useRef([]),o=u.useCallback((a,e=!1)=>{r.current.forEach((d,f)=>{d&&(s.current[f]=!0)});const l=e?[...s.current]:[...r.current];return a<0?l:l[a]},[]);return{isIntersectingRef:r,isIntersectingOnceRef:s,isIntersecting:o}},J={texture:[],dom:[],resolution:[],boderRadius:[],rotation:[],onIntersect:[]},un=({size:r,dpr:s,samples:o=0},a=[])=>{const e=u.useMemo(()=>new n.Scene,[]),l=b(r),[d,f]=D({scene:e,camera:l,size:r,dpr:s,samples:o,isSizeUpdate:!0}),[t,c]=C(J),[p,m]=rn(),v=u.useRef(new n.Vector2(0,0)),[g,h]=u.useState(!0);u.useEffect(()=>{h(!0)},a);const y=tn(),{isIntersectingOnceRef:M,isIntersectingRef:w,isIntersecting:T}=on();return[u.useCallback((U,O)=>{const{gl:_,size:E}=U;return O&&c(O),Je(t),g&&(nn({params:t,size:E,scene:e}),y({isIntersectingRef:w,isIntersectingOnceRef:M,params:t}),h(!1)),m({params:t,size:E,resolutionRef:v,scene:e,isIntersectingRef:w}),f(_)},[f,c,y,m,g,e,t,M,w]),c,{scene:e,camera:l,renderTarget:d,isIntersecting:T,DOMRects:p}]};var an=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,sn=`precision mediump float;

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
}`;const ln=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:an,fragmentShader:sn}),[]);return P(r,s,o),o},Q={texture:new n.Texture,blurSize:3,blurPower:5},cn=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=ln(a),l=b(r),d=u.useMemo(()=>({scene:a,camera:l,size:r,dpr:s,samples:o}),[a,l,r,s,o]),[f,t]=D(d),[c,p]=I(d),[m,v]=C(Q);return[u.useCallback((h,y)=>{const{gl:M}=h;y&&v(y),i(e,"uTexture",m.texture),i(e,"uResolution",[m.texture.source.data.width,m.texture.source.data.height]),i(e,"uBlurSize",m.blurSize);let w=p(M);const T=m.blurPower;for(let U=0;U<T;U++)i(e,"uTexture",w),w=p(M);return t(M)},[t,p,e,v,m]),v,{scene:a,material:e,camera:l,renderTarget:f}]};var vn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,fn=`precision highp float;

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
}`;const dn=({scene:r,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uEpicenter:{value:new n.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uResolution:{value:new n.Vector2},uMode:{value:0}},vertexShader:vn,fragmentShader:fn}),[]),l=F(s,o);return u.useEffect(()=>{e.uniforms.uResolution.value=l.clone()},[l,e]),P(r,a,e),e},ee={epicenter:new n.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},mn=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=dn({scene:a,size:r,dpr:s}),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o,isSizeUpdate:!0}),[t,c]=C(ee);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"uEpicenter",t.epicenter),i(e,"uProgress",t.progress),i(e,"uWidth",t.width),i(e,"uStrength",t.strength),i(e,"uMode",t.mode==="center"?0:t.mode==="horizontal"?1:2),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var pn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,gn=`precision highp float;

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
}`;const xn=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:pn,fragmentShader:gn}),[]);return P(r,s,o),o},ne={texture:new n.Texture,brightness:new n.Vector3(.5,.5,.5),min:0,max:1},hn=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=xn(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(ne);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"u_texture",t.texture),i(e,"u_brightness",t.brightness),i(e,"u_min",t.min),i(e,"u_max",t.max),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var yn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Mn=`precision highp float;
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
}`;const Tn=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new n.Texture},noiseStrength:{value:new n.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new n.Vector2(.1,.1)},laminateDetail:{value:new n.Vector2(1,1)},distortion:{value:new n.Vector2(0,0)},colorFactor:{value:new n.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new n.Vector2(0,0)}},vertexShader:yn,fragmentShader:Mn}),[]);return P(r,s,o),o},te={texture:!1,scale:1,laminateLayer:1,laminateInterval:new n.Vector2(.1,.1),laminateDetail:new n.Vector2(1,1),distortion:new n.Vector2(0,0),colorFactor:new n.Vector3(1,1,1),timeStrength:new n.Vector2(0,0),noise:!1,noiseStrength:new n.Vector2(0,0)},Sn=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Tn(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(te);return[u.useCallback((m,v)=>{const{gl:g,clock:h}=m;return v&&c(v),t.texture?(i(e,"uTexture",t.texture),i(e,"isTexture",!0)):(i(e,"isTexture",!1),i(e,"scale",t.scale)),t.noise?(i(e,"noise",t.noise),i(e,"isNoise",!0),i(e,"noiseStrength",t.noiseStrength)):i(e,"isNoise",!1),i(e,"uTime",h.getElapsedTime()),i(e,"laminateLayer",t.laminateLayer),i(e,"laminateInterval",t.laminateInterval),i(e,"laminateDetail",t.laminateDetail),i(e,"distortion",t.distortion),i(e,"colorFactor",t.colorFactor),i(e,"timeStrength",t.timeStrength),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]};var wn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,_n=`precision highp float;

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
}`;const Rn=r=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0}},vertexShader:wn,fragmentShader:_n}),[]);return P(r,s,o),o},re={texture:new n.Texture,map:new n.Texture,mapIntensity:.3},bn=({size:r,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Rn(a),l=b(r),[d,f]=D({scene:a,camera:l,size:r,dpr:s,samples:o}),[t,c]=C(re);return[u.useCallback((m,v)=>{const{gl:g}=m;return v&&c(v),i(e,"u_texture",t.texture),i(e,"u_map",t.map),i(e,"u_mapIntensity",t.mapIntensity),f(g)},[f,e,c,t]),c,{scene:a,material:e,camera:l,renderTarget:d}]},Cn=({scene:r,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:d=!1,depthTexture:f=!1},t)=>{const c=u.useRef([]),p=F(o,a);c.current=u.useMemo(()=>Array.from({length:t},()=>{const v=new n.WebGLRenderTarget(p.x,p.y,{...N,samples:l,depthBuffer:d});return f&&(v.depthTexture=new n.DepthTexture(p.x,p.y,n.FloatType)),v}),[t]),u.useLayoutEffect(()=>{e&&c.current.forEach(v=>v.setSize(p.x,p.y))},[p,e]),u.useEffect(()=>{const v=c.current;return()=>{v.forEach(g=>g.dispose())}},[t]);const m=u.useCallback((v,g,h)=>{const y=c.current[g];return v.setRenderTarget(y),h&&h({read:y.texture}),v.clear(),v.render(r,s),v.setRenderTarget(null),v.clear(),y.texture},[r,s]);return[c.current,m]};x.BLENDING_PARAMS=H,x.BRIGHTNESSPICKER_PARAMS=ne,x.BRUSH_PARAMS=W,x.COLORSTRATA_PARAMS=te,x.DOMSYNCER_PARAMS=J,x.DUOTONE_PARAMS=X,x.FLUID_PARAMS=Y,x.FXBLENDING_PARAMS=re,x.FXTEXTURE_PARAMS=K,x.NOISE_PARAMS=Z,x.RIPPLE_PARAMS=q,x.SIMPLEBLUR_PARAMS=Q,x.WAVE_PARAMS=ee,x.setUniform=i,x.useAddMesh=P,x.useBlending=Te,x.useBrightnessPicker=hn,x.useBrush=de,x.useCamera=b,x.useColorStrata=Sn,x.useCopyTexture=Cn,x.useDomSyncer=un,x.useDoubleFBO=I,x.useDuoTone=xe,x.useFluid=Ne,x.useFxBlending=bn,x.useFxTexture=He,x.useNoise=Ze,x.useParams=C,x.usePointer=$,x.useResolution=F,x.useRipple=je,x.useSimpleBlur=cn,x.useSingleFBO=D,x.useWave=mn,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
