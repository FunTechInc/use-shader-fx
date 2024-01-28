(function(x,z){typeof exports=="object"&&typeof module<"u"?z(exports,require("three"),require("react")):typeof define=="function"&&define.amd?define(["exports","three","react"],z):(x=typeof globalThis<"u"?globalThis:x||self,z(x["use-shader-fx"]={},x.THREE,x.React))})(this,function(x,z,u){"use strict";function ce(t){const s=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(t){for(const o in t)if(o!=="default"){const a=Object.getOwnPropertyDescriptor(t,o);Object.defineProperty(s,o,a.get?a:{enumerable:!0,get:()=>t[o]})}}return s.default=t,Object.freeze(s)}const n=ce(z);var ve=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,fe=`precision highp float;

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
}`;const F=(t,s=!1)=>{const o=s?t.width*s:t.width,a=s?t.height*s:t.height;return u.useMemo(()=>new n.Vector2(o,a),[o,a])},V=(t,s,o)=>{const a=u.useMemo(()=>new n.Mesh(s,o),[s,o]);return u.useEffect(()=>{t.add(a)},[t,a]),u.useEffect(()=>()=>{t.remove(a),s.dispose(),o.dispose()},[t,s,o,a]),a},i=(t,s,o)=>{t.uniforms&&t.uniforms[s]&&o!==void 0&&o!==null?t.uniforms[s].value=o:console.error(`Uniform key "${String(s)}" does not exist in the material. or "${String(s)}" is null | undefined`)},de=({scene:t,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uMap:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uAspect:{value:0},uTexture:{value:new n.Texture},uRadius:{value:0},uSmudge:{value:0},uDissipation:{value:0},uMotionBlur:{value:0},uMotionSample:{value:0},uMouse:{value:new n.Vector2(0,0)},uPrevMouse:{value:new n.Vector2(0,0)},uVelocity:{value:new n.Vector2(0,0)},uColor:{value:new n.Color(16777215)}},vertexShader:ve,fragmentShader:fe}),[]),l=F(s,o);return u.useEffect(()=>{i(e,"uAspect",l.width/l.height),i(e,"uResolution",l.clone())},[l,e]),V(t,a,e),e},me=(t,s)=>{const o=s,a=t/s,[e,l]=[o*a/2,o/2];return{width:e,height:l,near:-1e3,far:1e3}},R=t=>{const s=F(t),{width:o,height:a,near:e,far:l}=me(s.x,s.y);return u.useMemo(()=>new n.OrthographicCamera(-o,o,a,-a,e,l),[o,a,e,l])},N=()=>{const t=u.useRef(new n.Vector2(0,0)),s=u.useRef(new n.Vector2(0,0)),o=u.useRef(0),a=u.useRef(new n.Vector2(0,0)),e=u.useRef(!1);return u.useCallback(v=>{const f=performance.now(),r=v.clone();o.current===0&&(o.current=f,t.current=r);const c=Math.max(1,f-o.current);o.current=f,a.current.copy(r).sub(t.current).divideScalar(c);const p=a.current.length()>0,m=e.current?t.current.clone():r;return!e.current&&p&&(e.current=!0),t.current=r,{currentPointer:r,prevPointer:m,diffPointer:s.current.subVectors(r,m),velocity:a.current,isVelocityUpdate:p}},[])},b=t=>{const s=e=>Object.values(e).some(l=>typeof l=="function"),o=u.useRef(s(t)?t:structuredClone(t)),a=u.useCallback(e=>{for(const l in e){const v=l;v in o.current&&e[v]!==void 0&&e[v]!==null?o.current[v]=e[v]:console.error(`"${String(v)}" does not exist in the params. or "${String(v)}" is null | undefined`)}},[]);return[o.current,a]},k={minFilter:n.LinearFilter,magFilter:n.LinearFilter,type:n.HalfFloatType,stencilBuffer:!1},j=({gl:t,fbo:s,scene:o,camera:a,onBeforeRender:e,onSwap:l})=>{t.setRenderTarget(s),e(),t.clear(),t.render(o,a),l&&l(),t.setRenderTarget(null),t.clear()},D=({scene:t,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1})=>{const r=u.useRef(),c=F(o,a);r.current=u.useMemo(()=>{const m=new n.WebGLRenderTarget(c.x,c.y,{...k,samples:l,depthBuffer:v});return f&&(m.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),m},[]),u.useLayoutEffect(()=>{var m;e&&((m=r.current)==null||m.setSize(c.x,c.y))},[c,e]),u.useEffect(()=>{const m=r.current;return()=>{m==null||m.dispose()}},[]);const p=u.useCallback((m,d)=>{const g=r.current;return j({gl:m,fbo:g,scene:t,camera:s,onBeforeRender:()=>d&&d({read:g.texture})}),g.texture},[t,s]);return[r.current,p]},B=({scene:t,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1})=>{const r=u.useRef({read:null,write:null,swap:function(){let d=this.read;this.read=this.write,this.write=d}}),c=F(o,a),p=u.useMemo(()=>{const d=new n.WebGLRenderTarget(c.x,c.y,{...k,samples:l,depthBuffer:v}),g=new n.WebGLRenderTarget(c.x,c.y,{...k,samples:l,depthBuffer:v});return f&&(d.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType),g.depthTexture=new n.DepthTexture(c.x,c.y,n.FloatType)),{read:d,write:g}},[]);r.current.read=p.read,r.current.write=p.write,u.useLayoutEffect(()=>{var d,g;e&&((d=r.current.read)==null||d.setSize(c.x,c.y),(g=r.current.write)==null||g.setSize(c.x,c.y))},[c,e]),u.useEffect(()=>{const d=r.current;return()=>{var g,h;(g=d.read)==null||g.dispose(),(h=d.write)==null||h.dispose()}},[]);const m=u.useCallback((d,g)=>{var y;const h=r.current;return j({gl:d,scene:t,camera:s,fbo:h.write,onBeforeRender:()=>g&&g({read:h.read.texture,write:h.write.texture}),onSwap:()=>h.swap()}),(y=h.read)==null?void 0:y.texture},[t,s]);return[{read:r.current.read,write:r.current.write},m]},Y={texture:new n.Texture,radius:.05,smudge:0,dissipation:1,motionBlur:0,motionSample:5,color:new n.Color(16777215)},pe=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=de({scene:a,size:t,dpr:s}),l=R(t),v=N(),[f,r]=B({scene:a,camera:l,size:t,dpr:s,samples:o}),[c,p]=b(Y);return[u.useCallback((d,g)=>{const{gl:h,pointer:y}=d;g&&p(g),i(e,"uTexture",c.texture),i(e,"uRadius",c.radius),i(e,"uSmudge",c.smudge),i(e,"uDissipation",c.dissipation),i(e,"uMotionBlur",c.motionBlur),i(e,"uMotionSample",c.motionSample),i(e,"uColor",c.color);const{currentPointer:M,prevPointer:C,velocity:w}=v(y);return i(e,"uMouse",M),i(e,"uPrevMouse",C),i(e,"uVelocity",w),r(h,({read:T})=>{i(e,"uMap",T)})},[e,v,r,c,p]),p,{scene:a,material:e,camera:l,renderTarget:f,output:f.read.texture}]};var ge=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,xe=`precision highp float;

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
}`;const he=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uColor0:{value:new n.Color(16777215)},uColor1:{value:new n.Color(0)}},vertexShader:ge,fragmentShader:xe}),[]);return V(t,s,o),o},q={texture:new n.Texture,color0:new n.Color(16777215),color1:new n.Color(0)},ye=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=he(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(q);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"uTexture",r.texture),i(e,"uColor0",r.color0),i(e,"uColor1",r.color1),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var Me=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Se=`precision highp float;

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
}`;const we=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_alphaMap:{value:new n.Texture},u_isAlphaMap:{value:!1},u_mapIntensity:{value:0},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:.9},u_dodgeColor:{value:new n.Color(16777215)},u_isDodgeColor:{value:!1}},vertexShader:Me,fragmentShader:Se}),[]);return V(t,s,o),o},K={texture:new n.Texture,map:new n.Texture,alphaMap:!1,mapIntensity:.3,brightness:new n.Vector3(.5,.5,.5),min:0,max:1,dodgeColor:!1},Te=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=we(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(K);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"u_texture",r.texture),i(e,"u_map",r.map),i(e,"u_mapIntensity",r.mapIntensity),r.alphaMap?(i(e,"u_alphaMap",r.alphaMap),i(e,"u_isAlphaMap",!0)):i(e,"u_isAlphaMap",!1),i(e,"u_brightness",r.brightness),i(e,"u_min",r.min),i(e,"u_max",r.max),r.dodgeColor?(i(e,"u_dodgeColor",r.dodgeColor),i(e,"u_isDodgeColor",!0)):i(e,"u_isDodgeColor",!1),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var A=`varying vec2 vUv;
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
}`,_e=`precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;const Re=()=>u.useMemo(()=>new n.ShaderMaterial({vertexShader:A,fragmentShader:_e,depthTest:!1,depthWrite:!1}),[]);var be=`precision highp float;

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
}`;const De=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:new n.Texture},uSource:{value:new n.Texture},texelSize:{value:new n.Vector2},dt:{value:0},dissipation:{value:0}},vertexShader:A,fragmentShader:be}),[]);var Ce=`precision highp float;

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
}`;const Pe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ce}),[]);var Ve=`precision highp float;

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
}`;const Ue=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:null},uDivergence:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ve}),[]);var Ae=`precision highp float;

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
}`;const Fe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ae}),[]);var Be=`precision highp float;

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
}`;const Oe=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uVelocity:{value:null},uCurl:{value:null},curl:{value:0},dt:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Be}),[]);var Ee=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;const Ie=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},value:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Ee}),[]);var Le=`precision highp float;

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
}`;const ze=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uPressure:{value:new n.Texture},uVelocity:{value:new n.Texture},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:Le}),[]);var $e=`precision highp float;

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
}`;const Ne=()=>u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTarget:{value:new n.Texture},aspectRatio:{value:0},color:{value:new n.Vector3},point:{value:new n.Vector2},radius:{value:0},texelSize:{value:new n.Vector2}},vertexShader:A,fragmentShader:$e}),[]),ke=({scene:t,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=Re(),l=e.clone(),v=Fe(),f=Oe(),r=De(),c=Pe(),p=Ue(),m=Ie(),d=ze(),g=Ne(),h=u.useMemo(()=>({vorticityMaterial:f,curlMaterial:v,advectionMaterial:r,divergenceMaterial:c,pressureMaterial:p,clearMaterial:m,gradientSubtractMaterial:d,splatMaterial:g}),[f,v,r,c,p,m,d,g]),y=F(s,o);u.useEffect(()=>{i(h.splatMaterial,"aspectRatio",y.x/y.y);for(const w of Object.values(h))i(w,"texelSize",new n.Vector2(1/y.x,1/y.y))},[y,h]);const M=V(t,a,e);u.useEffect(()=>{e.dispose(),M.material=l},[e,M,l]),u.useEffect(()=>()=>{for(const w of Object.values(h))w.dispose()},[h]);const C=u.useCallback(w=>{M.material=w,M.material.needsUpdate=!0},[M]);return[h,C]},Z={density_dissipation:.98,velocity_dissipation:.99,velocity_acceleration:10,pressure_dissipation:.9,pressure_iterations:20,curl_strength:35,splat_radius:.002,fluid_color:new n.Vector3(1,1,1)},je=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),[e,l]=ke({scene:a,size:t,dpr:s}),v=R(t),f=N(),r=u.useMemo(()=>({scene:a,camera:v,size:t,samples:o}),[a,v,t,o]),[c,p]=B(r),[m,d]=B(r),[g,h]=D(r),[y,M]=D(r),[C,w]=B(r),T=u.useRef(0),O=u.useRef(new n.Vector2(0,0)),E=u.useRef(new n.Vector3(0,0,0)),[P,S]=b(Z);return[u.useCallback((W,$)=>{const{gl:U,pointer:Un,clock:X,size:ie}=W;$&&S($),T.current===0&&(T.current=X.getElapsedTime());const se=Math.min((X.getElapsedTime()-T.current)/3,.02);T.current=X.getElapsedTime();const H=p(U,({read:_})=>{l(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",_),i(e.advectionMaterial,"uSource",_),i(e.advectionMaterial,"dt",se),i(e.advectionMaterial,"dissipation",P.velocity_dissipation)}),An=d(U,({read:_})=>{l(e.advectionMaterial),i(e.advectionMaterial,"uVelocity",H),i(e.advectionMaterial,"uSource",_),i(e.advectionMaterial,"dissipation",P.density_dissipation)}),{currentPointer:Fn,diffPointer:Bn,isVelocityUpdate:On,velocity:En}=f(Un);On&&(p(U,({read:_})=>{l(e.splatMaterial),i(e.splatMaterial,"uTarget",_),i(e.splatMaterial,"point",Fn);const L=Bn.multiply(O.current.set(ie.width,ie.height).multiplyScalar(P.velocity_acceleration));i(e.splatMaterial,"color",E.current.set(L.x,L.y,1)),i(e.splatMaterial,"radius",P.splat_radius)}),d(U,({read:_})=>{l(e.splatMaterial),i(e.splatMaterial,"uTarget",_);const L=typeof P.fluid_color=="function"?P.fluid_color(En):P.fluid_color;i(e.splatMaterial,"color",L)}));const In=h(U,()=>{l(e.curlMaterial),i(e.curlMaterial,"uVelocity",H)});p(U,({read:_})=>{l(e.vorticityMaterial),i(e.vorticityMaterial,"uVelocity",_),i(e.vorticityMaterial,"uCurl",In),i(e.vorticityMaterial,"curl",P.curl_strength),i(e.vorticityMaterial,"dt",se)});const Ln=M(U,()=>{l(e.divergenceMaterial),i(e.divergenceMaterial,"uVelocity",H)});w(U,({read:_})=>{l(e.clearMaterial),i(e.clearMaterial,"uTexture",_),i(e.clearMaterial,"value",P.pressure_dissipation)}),l(e.pressureMaterial),i(e.pressureMaterial,"uDivergence",Ln);let le;for(let _=0;_<P.pressure_iterations;_++)le=w(U,({read:L})=>{i(e.pressureMaterial,"uPressure",L)});return p(U,({read:_})=>{l(e.gradientSubtractMaterial),i(e.gradientSubtractMaterial,"uPressure",le),i(e.gradientSubtractMaterial,"uVelocity",_)}),An},[e,l,h,d,M,f,w,p,S,P]),S,{scene:a,materials:e,camera:v,renderTarget:{velocity:c,density:m,curl:g,divergence:y,pressure:C},output:m.read.texture}]},Ge=({scale:t,max:s,texture:o,scene:a})=>{const e=u.useRef([]),l=u.useMemo(()=>new n.PlaneGeometry(t,t),[t]),v=u.useMemo(()=>new n.MeshBasicMaterial({map:o??null,transparent:!0,blending:n.AdditiveBlending,depthTest:!1,depthWrite:!1}),[o]);return u.useEffect(()=>{for(let f=0;f<s;f++){const r=new n.Mesh(l.clone(),v.clone());r.rotateZ(2*Math.PI*Math.random()),r.visible=!1,a.add(r),e.current.push(r)}},[l,v,a,s]),u.useEffect(()=>()=>{e.current.forEach(f=>{f.geometry.dispose(),Array.isArray(f.material)?f.material.forEach(r=>r.dispose()):f.material.dispose(),a.remove(f)}),e.current=[]},[a]),e.current},J={frequency:.01,rotation:.05,fadeout_speed:.9,scale:.3,alpha:.6},We=({texture:t,scale:s=64,max:o=100,size:a,dpr:e,samples:l=0})=>{const v=u.useMemo(()=>new n.Scene,[]),f=Ge({scale:s,max:o,texture:t,scene:v}),r=R(a),c=N(),[p,m]=D({scene:v,camera:r,size:a,dpr:e,samples:l}),[d,g]=b(J),h=u.useRef(0);return[u.useCallback((M,C)=>{const{gl:w,pointer:T,size:O}=M;C&&g(C);const{currentPointer:E,diffPointer:P}=c(T);if(d.frequency<P.length()){const S=f[h.current];S.visible=!0,S.position.set(E.x*(O.width/2),E.y*(O.height/2),0),S.scale.x=S.scale.y=0,S.material.opacity=d.alpha,h.current=(h.current+1)%o}return f.forEach(S=>{if(S.visible){const I=S.material;S.rotation.z+=d.rotation,I.opacity*=d.fadeout_speed,S.scale.x=d.fadeout_speed*S.scale.x+d.scale,S.scale.y=S.scale.x,I.opacity<.002&&(S.visible=!1)}}),m(w)},[m,f,c,o,d,g]),g,{scene:v,camera:r,meshArr:f,renderTarget:p,output:p.texture}]};var Xe=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,He=`precision highp float;

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

}`;const Ye=({scene:t,size:s,dpr:o})=>{const a=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),e=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uResolution:{value:new n.Vector2},uTextureResolution:{value:new n.Vector2},uTexture0:{value:new n.Texture},uTexture1:{value:new n.Texture},padding:{value:0},uMap:{value:new n.Texture},edgeIntensity:{value:0},mapIntensity:{value:0},epicenter:{value:new n.Vector2(0,0)},progress:{value:0},dirX:{value:0},dirY:{value:0}},vertexShader:Xe,fragmentShader:He}),[]),l=F(s,o);return u.useEffect(()=>{e.uniforms.uResolution.value=l.clone()},[l,e]),V(t,a,e),e},Q={texture0:new n.Texture,texture1:new n.Texture,textureResolution:new n.Vector2(0,0),padding:0,map:new n.Texture,mapIntensity:0,edgeIntensity:0,epicenter:new n.Vector2(0,0),progress:0,dir:new n.Vector2(0,0)},qe=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Ye({scene:a,size:t,dpr:s}),l=R(t),[v,f]=D({scene:a,camera:l,dpr:s,size:t,samples:o,isSizeUpdate:!0}),[r,c]=b(Q);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"uTexture0",r.texture0),i(e,"uTexture1",r.texture1),i(e,"uTextureResolution",r.textureResolution),i(e,"padding",r.padding),i(e,"uMap",r.map),i(e,"mapIntensity",r.mapIntensity),i(e,"edgeIntensity",r.edgeIntensity),i(e,"epicenter",r.epicenter),i(e,"progress",r.progress),i(e,"dirX",r.dir.x),i(e,"dirY",r.dir.y),f(g)},[f,e,r,c]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var Ke=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Ze=`precision highp float;
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
}`;const Je=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTime:{value:0},scale:{value:0},timeStrength:{value:0},noiseOctaves:{value:0},fbmOctaves:{value:0},warpOctaves:{value:0},warpDirection:{value:new n.Vector2},warpStrength:{value:0}},vertexShader:Ke,fragmentShader:Ze}),[]);return V(t,s,o),o},ee={scale:.004,timeStrength:.3,noiseOctaves:2,fbmOctaves:2,warpOctaves:2,warpDirection:new n.Vector2(2,2),warpStrength:8},Qe=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Je(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(ee);return[u.useCallback((m,d)=>{const{gl:g,clock:h}=m;return d&&c(d),i(e,"scale",r.scale),i(e,"timeStrength",r.timeStrength),i(e,"noiseOctaves",r.noiseOctaves),i(e,"fbmOctaves",r.fbmOctaves),i(e,"warpOctaves",r.warpOctaves),i(e,"warpDirection",r.warpDirection),i(e,"warpStrength",r.warpStrength),i(e,"uTime",h.getElapsedTime()),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]},G=process.env.NODE_ENV==="development",en=t=>{var e,l,v;const s=(e=t.dom)==null?void 0:e.length,o=(l=t.texture)==null?void 0:l.length,a=(v=t.resolution)==null?void 0:v.length;return!s||!o||!a?(G&&console.warn("No dom or texture or resolution is set"),!0):s!==o||s!==a?(G&&console.warn("not Match dom , texture and resolution length"),!0):!1};var nn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`,tn=`precision highp float;

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
}`;const rn=({params:t,size:s,scene:o})=>{o.children.length>0&&(o.children.forEach(a=>{a instanceof n.Mesh&&(a.geometry.dispose(),a.material.dispose())}),o.remove(...o.children)),t.texture.forEach((a,e)=>{const l=new n.Mesh(new n.PlaneGeometry(1,1),new n.ShaderMaterial({vertexShader:nn,fragmentShader:tn,transparent:!0,uniforms:{u_texture:{value:a},u_textureResolution:{value:new n.Vector2(0,0)},u_resolution:{value:new n.Vector2(0,0)},u_borderRadius:{value:t.boderRadius[e]?t.boderRadius[e]:0}}}));o.add(l)})},on=()=>{const t=u.useRef([]),s=u.useRef([]);return u.useCallback(({isIntersectingRef:a,isIntersectingOnceRef:e,params:l})=>{t.current.length>0&&t.current.forEach((f,r)=>{f.unobserve(s.current[r])}),s.current=[],t.current=[];const v=new Array(l.dom.length).fill(!1);a.current=[...v],e.current=[...v],l.dom.forEach((f,r)=>{const c=m=>{m.forEach(d=>{l.onIntersect[r]&&l.onIntersect[r](d),a.current[r]=d.isIntersecting})},p=new IntersectionObserver(c,{rootMargin:"0px",threshold:0});p.observe(f),t.current.push(p),s.current.push(f)})},[])},un=()=>{const t=u.useRef([]),s=u.useCallback(({params:o,size:a,resolutionRef:e,scene:l,isIntersectingRef:v})=>{l.children.length!==t.current.length&&(t.current=new Array(l.children.length)),l.children.forEach((f,r)=>{const c=o.dom[r];if(!c){G&&console.warn("DOM is null.");return}const p=c.getBoundingClientRect();if(t.current[r]=p,f.scale.set(p.width,p.height,1),f.position.set(p.left+p.width*.5-a.width*.5,-p.top-p.height*.5+a.height*.5,0),v.current[r]&&(o.rotation[r]&&f.rotation.copy(o.rotation[r]),f instanceof n.Mesh)){const m=f.material;i(m,"u_texture",o.texture[r]),i(m,"u_textureResolution",o.resolution[r]),i(m,"u_resolution",e.current.set(p.width,p.height)),i(m,"u_borderRadius",o.boderRadius[r]?o.boderRadius[r]:0)}})},[]);return[t.current,s]},an=()=>{const t=u.useRef([]),s=u.useRef([]),o=u.useCallback((a,e=!1)=>{t.current.forEach((v,f)=>{v&&(s.current[f]=!0)});const l=e?[...s.current]:[...t.current];return a<0?l:l[a]},[]);return{isIntersectingRef:t,isIntersectingOnceRef:s,isIntersecting:o}},sn=t=>({onView:o,onHidden:a})=>{const e=u.useRef(!1);u.useEffect(()=>{let l;const v=()=>{t.current.some(f=>f)?e.current||(o&&o(),e.current=!0):e.current&&(a&&a(),e.current=!1),l=requestAnimationFrame(v)};return l=requestAnimationFrame(v),()=>{cancelAnimationFrame(l)}},[o,a])},ne={texture:[],dom:[],resolution:[],boderRadius:[],rotation:[],onIntersect:[]},ln=({size:t,dpr:s,samples:o=0},a=[])=>{const e=u.useMemo(()=>new n.Scene,[]),l=R(t),[v,f]=D({scene:e,camera:l,size:t,dpr:s,samples:o,isSizeUpdate:!0}),[r,c]=b({...ne,updateKey:performance.now()}),[p,m]=un(),d=u.useRef(new n.Vector2(0,0)),[g,h]=u.useState(!0);u.useEffect(()=>{h(!0)},a);const y=u.useRef(null),M=u.useMemo(()=>new n.Texture,[]),C=on(),{isIntersectingOnceRef:w,isIntersectingRef:T,isIntersecting:O}=an(),E=sn(T);return[u.useCallback((S,I)=>{const{gl:W,size:$}=S;if(I&&c(I),en(r))return M;if(g){if(y.current===r.updateKey)return M;y.current=r.updateKey}return g&&(rn({params:r,size:$,scene:e}),C({isIntersectingRef:T,isIntersectingOnceRef:w,params:r}),h(!1)),m({params:r,size:$,resolutionRef:d,scene:e,isIntersectingRef:T}),f(W)},[f,c,C,m,g,e,r,w,T,M]),c,{scene:e,camera:l,renderTarget:v,output:v.texture,isIntersecting:O,DOMRects:p,intersections:T.current,useDomView:E}]};var cn=`precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,vn=`precision mediump float;

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
}`;const fn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},uResolution:{value:new n.Vector2(0,0)},uBlurSize:{value:1}},vertexShader:cn,fragmentShader:vn}),[]);return V(t,s,o),o},te={texture:new n.Texture,blurSize:3,blurPower:5},dn=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=fn(a),l=R(t),v=u.useMemo(()=>({scene:a,camera:l,size:t,dpr:s,samples:o}),[a,l,t,s,o]),[f,r]=D(v),[c,p]=B(v),[m,d]=b(te);return[u.useCallback((h,y)=>{const{gl:M}=h;y&&d(y),i(e,"uTexture",m.texture),i(e,"uResolution",[m.texture.source.data.width,m.texture.source.data.height]),i(e,"uBlurSize",m.blurSize);let C=p(M);const w=m.blurPower;for(let T=0;T<w;T++)i(e,"uTexture",C),C=p(M);return r(M)},[r,p,e,d,m]),d,{scene:a,material:e,camera:l,renderTarget:f,output:f.texture}]};var mn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,pn=`precision highp float;

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
}`;const gn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uEpicenter:{value:new n.Vector2(0,0)},uProgress:{value:0},uStrength:{value:0},uWidth:{value:0},uMode:{value:0}},vertexShader:mn,fragmentShader:pn}),[]);return V(t,s,o),o},re={epicenter:new n.Vector2(0,0),progress:0,width:0,strength:0,mode:"center"},xn=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=gn(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o,isSizeUpdate:!0}),[r,c]=b(re);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"uEpicenter",r.epicenter),i(e,"uProgress",r.progress),i(e,"uWidth",r.width),i(e,"uStrength",r.strength),i(e,"uMode",r.mode==="center"?0:r.mode==="horizontal"?1:2),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var hn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,yn=`precision highp float;

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
}`;const Mn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_brightness:{value:new n.Vector3},u_min:{value:0},u_max:{value:1}},vertexShader:hn,fragmentShader:yn}),[]);return V(t,s,o),o},oe={texture:new n.Texture,brightness:new n.Vector3(.5,.5,.5),min:0,max:1},Sn=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Mn(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(oe);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"u_texture",r.texture),i(e,"u_brightness",r.brightness),i(e,"u_min",r.min),i(e,"u_max",r.max),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var wn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Tn=`precision highp float;
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
}`;const _n=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{uTexture:{value:new n.Texture},isTexture:{value:!1},scale:{value:1},noise:{value:new n.Texture},noiseStrength:{value:new n.Vector2(0,0)},isNoise:{value:!1},laminateLayer:{value:1},laminateInterval:{value:new n.Vector2(.1,.1)},laminateDetail:{value:new n.Vector2(1,1)},distortion:{value:new n.Vector2(0,0)},colorFactor:{value:new n.Vector3(1,1,1)},uTime:{value:0},timeStrength:{value:new n.Vector2(0,0)}},vertexShader:wn,fragmentShader:Tn}),[]);return V(t,s,o),o},ue={texture:!1,scale:1,laminateLayer:1,laminateInterval:new n.Vector2(.1,.1),laminateDetail:new n.Vector2(1,1),distortion:new n.Vector2(0,0),colorFactor:new n.Vector3(1,1,1),timeStrength:new n.Vector2(0,0),noise:!1,noiseStrength:new n.Vector2(0,0)},Rn=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=_n(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(ue);return[u.useCallback((m,d)=>{const{gl:g,clock:h}=m;return d&&c(d),r.texture?(i(e,"uTexture",r.texture),i(e,"isTexture",!0)):(i(e,"isTexture",!1),i(e,"scale",r.scale)),r.noise?(i(e,"noise",r.noise),i(e,"isNoise",!0),i(e,"noiseStrength",r.noiseStrength)):i(e,"isNoise",!1),i(e,"uTime",h.getElapsedTime()),i(e,"laminateLayer",r.laminateLayer),i(e,"laminateInterval",r.laminateInterval),i(e,"laminateDetail",r.laminateDetail),i(e,"distortion",r.distortion),i(e,"colorFactor",r.colorFactor),i(e,"timeStrength",r.timeStrength),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]};var bn=`varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`,Dn=`precision highp float;

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
}`;const Cn=t=>{const s=u.useMemo(()=>new n.PlaneGeometry(2,2),[]),o=u.useMemo(()=>new n.ShaderMaterial({uniforms:{u_texture:{value:new n.Texture},u_map:{value:new n.Texture},u_mapIntensity:{value:0}},vertexShader:bn,fragmentShader:Dn}),[]);return V(t,s,o),o},ae={texture:new n.Texture,map:new n.Texture,mapIntensity:.3},Pn=({size:t,dpr:s,samples:o=0})=>{const a=u.useMemo(()=>new n.Scene,[]),e=Cn(a),l=R(t),[v,f]=D({scene:a,camera:l,size:t,dpr:s,samples:o}),[r,c]=b(ae);return[u.useCallback((m,d)=>{const{gl:g}=m;return d&&c(d),i(e,"u_texture",r.texture),i(e,"u_map",r.map),i(e,"u_mapIntensity",r.mapIntensity),f(g)},[f,e,c,r]),c,{scene:a,material:e,camera:l,renderTarget:v,output:v.texture}]},Vn=({scene:t,camera:s,size:o,dpr:a=!1,isSizeUpdate:e=!1,samples:l=0,depthBuffer:v=!1,depthTexture:f=!1},r)=>{const c=u.useRef([]),p=F(o,a);c.current=u.useMemo(()=>Array.from({length:r},()=>{const d=new n.WebGLRenderTarget(p.x,p.y,{...k,samples:l,depthBuffer:v});return f&&(d.depthTexture=new n.DepthTexture(p.x,p.y,n.FloatType)),d}),[r]),u.useLayoutEffect(()=>{e&&c.current.forEach(d=>d.setSize(p.x,p.y))},[p,e]),u.useEffect(()=>{const d=c.current;return()=>{d.forEach(g=>g.dispose())}},[r]);const m=u.useCallback((d,g,h)=>{const y=c.current[g];return j({gl:d,scene:t,camera:s,fbo:y,onBeforeRender:()=>h&&h({read:y.texture})}),y.texture},[t,s]);return[c.current,m]};x.BLENDING_PARAMS=K,x.BRIGHTNESSPICKER_PARAMS=oe,x.BRUSH_PARAMS=Y,x.COLORSTRATA_PARAMS=ue,x.DOMSYNCER_PARAMS=ne,x.DUOTONE_PARAMS=q,x.FLUID_PARAMS=Z,x.FXBLENDING_PARAMS=ae,x.FXTEXTURE_PARAMS=Q,x.NOISE_PARAMS=ee,x.RIPPLE_PARAMS=J,x.SIMPLEBLUR_PARAMS=te,x.WAVE_PARAMS=re,x.setUniform=i,x.useAddMesh=V,x.useBlending=Te,x.useBrightnessPicker=Sn,x.useBrush=pe,x.useCamera=R,x.useColorStrata=Rn,x.useCopyTexture=Vn,x.useDomSyncer=ln,x.useDoubleFBO=B,x.useDuoTone=ye,x.useFluid=je,x.useFxBlending=Pn,x.useFxTexture=qe,x.useNoise=Qe,x.useParams=b,x.usePointer=N,x.useResolution=F,x.useRipple=We,x.useSimpleBlur=dn,x.useSingleFBO=D,x.useWave=xn,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=use-shader-fx.umd.cjs.map
