import * as a from "three";
import { BufferAttribute as Te } from "three";
import { useMemo as b, useEffect as ae, useRef as E, useCallback as T, useState as Ee } from "react";
var Le = "#usf <planeVertex>", $e = `precision highp float;

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
}`;
const Y = (e, t = !1) => {
  const n = t ? e.width * t : e.width, o = t ? e.height * t : e.height;
  return b(
    () => new a.Vector2(n, o),
    [n, o]
  );
}, R = (e) => (t, n) => {
  if (n === void 0)
    return;
  const o = e.uniforms;
  o && o[t] && (o[t].value = n);
}, F = (e) => (t) => {
  t !== void 0 && Object.keys(t).forEach((n) => {
    const o = e.uniforms;
    o && o[n] && (o[n].value = t[n]);
  });
}, L = (e, t, n, o) => {
  const s = b(() => {
    const v = new o(t, n);
    return e && e.add(v), v;
  }, [t, n, o, e]);
  return ae(() => () => {
    e && e.remove(s), t.dispose(), n.dispose();
  }, [e, t, n, s]), s;
}, Ae = process.env.NODE_ENV === "development", I = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, w = new a.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  a.RGBAFormat
);
var je = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`, qe = `vec3 random3(vec3 c) {
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
}`, We = `float screenAspect = uResolution.x / uResolution.y;
float textureAspect = uTextureResolution.x / uTextureResolution.y;
vec2 aspectRatio = vec2(
	min(screenAspect / textureAspect, 1.0),
	min(textureAspect / screenAspect, 1.0)
);
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`, Ne = `vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`, ke = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ge = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const Ke = Object.freeze({
  wobble3D: je,
  snoise: qe,
  coverTexture: We,
  fxBlending: Ne,
  planeVertex: ke,
  defaultVertex: Ge
}), Xe = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function Ye(e, t) {
  return ye(Ke[t] || "");
}
function ye(e) {
  return e.replace(Xe, Ye);
}
const V = (e, t) => (t && t(e), e.vertexShader = ye(e.vertexShader), e.fragmentShader = ye(e.fragmentShader), e), He = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), v = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uBuffer: { value: w },
          uResolution: { value: new a.Vector2(0, 0) },
          uTexture: { value: w },
          uIsTexture: { value: !1 },
          uMap: { value: w },
          uIsMap: { value: !1 },
          uMapIntensity: { value: ne.mapIntensity },
          uRadius: { value: ne.radius },
          uSmudge: { value: ne.smudge },
          uDissipation: { value: ne.dissipation },
          uMotionBlur: { value: ne.motionBlur },
          uMotionSample: { value: ne.motionSample },
          uMouse: { value: new a.Vector2(-10, -10) },
          uPrevMouse: { value: new a.Vector2(-10, -10) },
          uVelocity: { value: new a.Vector2(0, 0) },
          uColor: { value: ne.color },
          uIsCursor: { value: !1 },
          uPressureStart: { value: 1 },
          uPressureEnd: { value: 1 }
        },
        vertexShader: Le,
        fragmentShader: $e
      },
      o
    ),
    ...I,
    // Must be transparent
    transparent: !0
  }), [o]), l = Y(t, n);
  R(v)("uResolution", l.clone());
  const i = L(e, s, v, a.Mesh);
  return { material: v, mesh: i };
}, Qe = (e, t) => {
  const n = t, o = e / t, [s, v] = [n * o / 2, n / 2];
  return { width: s, height: v, near: -1e3, far: 1e3 };
}, $ = (e, t = "OrthographicCamera") => {
  const n = Y(e), { width: o, height: s, near: v, far: l } = Qe(
    n.x,
    n.y
  );
  return b(() => t === "OrthographicCamera" ? new a.OrthographicCamera(
    -o,
    o,
    s,
    -s,
    v,
    l
  ) : new a.PerspectiveCamera(50, o / s), [o, s, v, l, t]);
}, Se = (e = 0) => {
  const t = E(new a.Vector2(0, 0)), n = E(new a.Vector2(0, 0)), o = E(new a.Vector2(0, 0)), s = E(0), v = E(new a.Vector2(0, 0)), l = E(!1);
  return T(
    (d) => {
      const m = performance.now();
      let h;
      l.current && e ? (o.current = o.current.lerp(
        d,
        1 - e
      ), h = o.current.clone()) : (h = d.clone(), o.current = h), s.current === 0 && (s.current = m, t.current = h);
      const x = Math.max(1, m - s.current);
      s.current = m, v.current.copy(h).sub(t.current).divideScalar(x);
      const r = v.current.length() > 0, g = l.current ? t.current.clone() : h;
      return !l.current && r && (l.current = !0), t.current = h, {
        currentPointer: h,
        prevPointer: g,
        diffPointer: n.current.subVectors(h, g),
        velocity: v.current,
        isVelocityUpdate: r
      };
    },
    [e]
  );
}, j = (e) => {
  const n = E(
    ((s) => Object.values(s).some((v) => typeof v == "function"))(e) ? e : structuredClone(e)
  ), o = T((s) => {
    if (s !== void 0)
      for (const v in s) {
        const l = v;
        l in n.current && s[l] !== void 0 && s[l] !== null ? n.current[l] = s[l] : console.error(
          `"${String(
            l
          )}" does not exist in the params. or "${String(
            l
          )}" is null | undefined`
        );
      }
  }, []);
  return [n.current, o];
}, he = {
  minFilter: a.LinearFilter,
  magFilter: a.LinearFilter,
  type: a.HalfFloatType,
  stencilBuffer: !1
}, Ce = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: o,
  onBeforeRender: s,
  onSwap: v
}) => {
  e.setRenderTarget(t), s(), e.clear(), e.render(n, o), v && v(), e.setRenderTarget(null), e.clear();
}, q = ({
  scene: e,
  camera: t,
  size: n,
  dpr: o = !1,
  isSizeUpdate: s = !1,
  samples: v = 0,
  depthBuffer: l = !1,
  depthTexture: i = !1
}) => {
  var x;
  const d = E(), m = Y(n, o);
  d.current = b(
    () => {
      const r = new a.WebGLRenderTarget(
        m.x,
        m.y,
        {
          ...he,
          samples: v,
          depthBuffer: l
        }
      );
      return i && (r.depthTexture = new a.DepthTexture(
        m.x,
        m.y,
        a.FloatType
      )), r;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), s && ((x = d.current) == null || x.setSize(m.x, m.y)), ae(() => {
    const r = d.current;
    return () => {
      r == null || r.dispose();
    };
  }, []);
  const h = T(
    (r, g) => {
      const u = d.current;
      return Ce({
        gl: r,
        fbo: u,
        scene: e,
        camera: t,
        onBeforeRender: () => g && g({ read: u.texture })
      }), u.texture;
    },
    [e, t]
  );
  return [d.current, h];
}, se = ({
  scene: e,
  camera: t,
  size: n,
  dpr: o = !1,
  isSizeUpdate: s = !1,
  samples: v = 0,
  depthBuffer: l = !1,
  depthTexture: i = !1
}) => {
  var x, r;
  const d = Y(n, o), m = b(() => {
    const g = new a.WebGLRenderTarget(d.x, d.y, {
      ...he,
      samples: v,
      depthBuffer: l
    }), u = new a.WebGLRenderTarget(d.x, d.y, {
      ...he,
      samples: v,
      depthBuffer: l
    });
    return i && (g.depthTexture = new a.DepthTexture(
      d.x,
      d.y,
      a.FloatType
    ), u.depthTexture = new a.DepthTexture(
      d.x,
      d.y,
      a.FloatType
    )), {
      read: g,
      write: u,
      swap: function() {
        let c = this.read;
        this.read = this.write, this.write = c;
      }
    };
  }, [v, l, i]);
  s && ((x = m.read) == null || x.setSize(d.x, d.y), (r = m.write) == null || r.setSize(d.x, d.y)), ae(() => {
    const g = m;
    return () => {
      var u, c;
      (u = g.read) == null || u.dispose(), (c = g.write) == null || c.dispose();
    };
  }, [m]);
  const h = T(
    (g, u) => {
      var p;
      const c = m;
      return Ce({
        gl: g,
        scene: e,
        camera: t,
        fbo: c.write,
        onBeforeRender: () => u && u({
          read: c.read.texture,
          write: c.write.texture
        }),
        onSwap: () => c.swap()
      }), (p = c.read) == null ? void 0 : p.texture;
    },
    [e, t, m]
  );
  return [
    { read: m.read, write: m.write },
    h
  ];
}, U = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, ne = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new a.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), Xn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = He({
    scene: l,
    size: e,
    dpr: v.shader,
    onBeforeInit: s
  }), m = $(e), h = Se(), [x, r] = se({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [g, u] = j(ne), c = E(null), p = R(i), S = F(i), y = T(
    (M, C) => {
      u(M), S(C);
    },
    [u, S]
  );
  return [
    T(
      (M, C, _) => {
        const { gl: A, pointer: z } = M;
        y(C, _), g.texture ? (p("uIsTexture", !0), p("uTexture", g.texture)) : p("uIsTexture", !1), g.map ? (p("uIsMap", !0), p("uMap", g.map), p("uMapIntensity", g.mapIntensity)) : p("uIsMap", !1), p("uRadius", g.radius), p("uSmudge", g.smudge), p("uDissipation", g.dissipation), p("uMotionBlur", g.motionBlur), p("uMotionSample", g.motionSample);
        const P = g.pointerValues || h(z);
        P.isVelocityUpdate && (p("uMouse", P.currentPointer), p("uPrevMouse", P.prevPointer)), p("uVelocity", P.velocity);
        const O = typeof g.color == "function" ? g.color(P.velocity) : g.color;
        return p("uColor", O), p("uIsCursor", g.isCursor), p("uPressureEnd", g.pressure), c.current === null && (c.current = g.pressure), p("uPressureStart", c.current), c.current = g.pressure, r(A, ({ read: D }) => {
          p("uBuffer", D);
        });
      },
      [p, h, r, g, y]
    ),
    y,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var J = `varying vec2 vUv;
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
}`, Ze = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Je = () => b(() => new a.ShaderMaterial({
  vertexShader: J,
  fragmentShader: Ze,
  ...I
}), []);
var et = `precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;
const tt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: w },
        uSource: { value: w },
        texelSize: { value: new a.Vector2() },
        dt: { value: Ve },
        dissipation: { value: 0 }
      },
      vertexShader: J,
      fragmentShader: et
    },
    e
  ),
  ...I
}), [e]);
var nt = `precision highp float;

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
}`;
const rt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: nt
    },
    e
  ),
  ...I
}), [e]);
var ot = `precision highp float;

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
}`;
const at = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: ot
    },
    e
  ),
  ...I
}), [e]);
var it = `precision highp float;

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
}`;
const ut = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: it
    },
    e
  ),
  ...I
}), [e]);
var st = `precision highp float;

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
}`;
const lt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: 0 },
        dt: { value: Ve },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: st
    },
    e
  ),
  ...I
}), [e]);
var ct = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const vt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTexture: { value: w },
        value: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: ct
    },
    e
  ),
  ...I
}), [e]);
var mt = `precision highp float;

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
}`;
const pt = ({
  onBeforeInit: e
}) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: w },
        uVelocity: { value: w },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: mt
    },
    e
  ),
  ...I
}), [e]);
var dt = `precision highp float;

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
}`;
const ft = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTarget: { value: w },
        aspectRatio: { value: 0 },
        color: { value: new a.Vector3() },
        point: { value: new a.Vector2() },
        radius: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: dt
    },
    e
  ),
  ...I
}), [e]), H = (e, t) => e(t ?? {}), gt = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), {
    curl: v,
    vorticity: l,
    advection: i,
    divergence: d,
    pressure: m,
    clear: h,
    gradientSubtract: x,
    splat: r
  } = o ?? {}, g = H(Je), u = g.clone(), c = H(ut, v), p = H(lt, l), S = H(tt, i), y = H(
    rt,
    d
  ), f = H(at, m), M = H(vt, h), C = H(
    pt,
    x
  ), _ = H(ft, r), A = b(
    () => ({
      vorticityMaterial: p,
      curlMaterial: c,
      advectionMaterial: S,
      divergenceMaterial: y,
      pressureMaterial: f,
      clearMaterial: M,
      gradientSubtractMaterial: C,
      splatMaterial: _
    }),
    [
      p,
      c,
      S,
      y,
      f,
      M,
      C,
      _
    ]
  ), z = Y(t, n);
  b(() => {
    R(A.splatMaterial)(
      "aspectRatio",
      z.x / z.y
    );
    for (const D of Object.values(A))
      R(D)(
        "texelSize",
        new a.Vector2(1 / z.x, 1 / z.y)
      );
  }, [z, A]);
  const P = L(e, s, g, a.Mesh);
  b(() => {
    g.dispose(), P.material = u;
  }, [g, P, u]), ae(() => () => {
    for (const D of Object.values(A))
      D.dispose();
  }, [A]);
  const O = T(
    (D) => {
      P.material = D, P.material.needsUpdate = !0;
    },
    [P]
  );
  return { materials: A, setMeshMaterial: O, mesh: P };
}, Ve = 0.016, ht = Object.freeze({
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  velocityAcceleration: 10,
  pressureDissipation: 0.9,
  pressureIterations: 20,
  curlStrength: 35,
  splatRadius: 2e-3,
  fluidColor: new a.Vector3(1, 1, 1),
  pointerValues: !1
}), Yn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  customFluidProps: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { materials: i, setMeshMaterial: d, mesh: m } = gt({
    scene: l,
    size: e,
    dpr: v.shader,
    customFluidProps: s
  }), h = $(e), x = Se(), r = b(
    () => ({
      scene: l,
      camera: h,
      dpr: v.fbo,
      size: e,
      samples: n,
      isSizeUpdate: o
    }),
    [l, h, e, n, v.fbo, o]
  ), [g, u] = se(r), [c, p] = se(r), [S, y] = q(r), [f, M] = q(r), [C, _] = se(r), A = E(new a.Vector2(0, 0)), z = E(new a.Vector3(0, 0, 0)), [P, O] = j(ht), D = b(
    () => ({
      advection: R(i.advectionMaterial),
      splat: R(i.splatMaterial),
      curl: R(i.curlMaterial),
      vorticity: R(i.vorticityMaterial),
      divergence: R(i.divergenceMaterial),
      clear: R(i.clearMaterial),
      pressure: R(i.pressureMaterial),
      gradientSubtract: R(i.gradientSubtractMaterial)
    }),
    [i]
  ), W = b(
    () => ({
      advection: F(i.advectionMaterial),
      splat: F(i.splatMaterial),
      curl: F(i.curlMaterial),
      vorticity: F(i.vorticityMaterial),
      divergence: F(i.divergenceMaterial),
      clear: F(i.clearMaterial),
      pressure: F(i.pressureMaterial),
      gradientSubtract: F(i.gradientSubtractMaterial)
    }),
    [i]
  ), G = T(
    (X, te) => {
      O(X), te && Object.keys(te).forEach((ie) => {
        W[ie](
          te[ie]
        );
      });
    },
    [O, W]
  );
  return [
    T(
      (X, te, ie) => {
        const { gl: K, pointer: ze, size: _e } = X;
        G(te, ie);
        const xe = u(K, ({ read: k }) => {
          d(i.advectionMaterial), D.advection("uVelocity", k), D.advection("uSource", k), D.advection(
            "dissipation",
            P.velocityDissipation
          );
        }), Oe = p(K, ({ read: k }) => {
          d(i.advectionMaterial), D.advection("uVelocity", xe), D.advection("uSource", k), D.advection(
            "dissipation",
            P.densityDissipation
          );
        }), pe = P.pointerValues || x(ze);
        pe.isVelocityUpdate && (u(K, ({ read: k }) => {
          d(i.splatMaterial), D.splat("uTarget", k), D.splat("point", pe.currentPointer);
          const le = pe.diffPointer.multiply(
            A.current.set(_e.width, _e.height).multiplyScalar(P.velocityAcceleration)
          );
          D.splat(
            "color",
            z.current.set(le.x, le.y, 1)
          ), D.splat("radius", P.splatRadius);
        }), p(K, ({ read: k }) => {
          d(i.splatMaterial), D.splat("uTarget", k);
          const le = typeof P.fluidColor == "function" ? P.fluidColor(pe.velocity) : P.fluidColor;
          D.splat("color", le);
        }));
        const Ue = y(K, () => {
          d(i.curlMaterial), D.curl("uVelocity", xe);
        });
        u(K, ({ read: k }) => {
          d(i.vorticityMaterial), D.vorticity("uVelocity", k), D.vorticity("uCurl", Ue), D.vorticity("curl", P.curlStrength);
        });
        const Be = M(K, () => {
          d(i.divergenceMaterial), D.divergence("uVelocity", xe);
        });
        _(K, ({ read: k }) => {
          d(i.clearMaterial), D.clear("uTexture", k), D.clear("value", P.pressureDissipation);
        }), d(i.pressureMaterial), D.pressure("uDivergence", Be);
        let we;
        for (let k = 0; k < P.pressureIterations; k++)
          we = _(K, ({ read: le }) => {
            D.pressure("uPressure", le);
          });
        return u(K, ({ read: k }) => {
          d(i.gradientSubtractMaterial), D.gradientSubtract("uPressure", we), D.gradientSubtract("uVelocity", k);
        }), Oe;
      },
      [
        i,
        D,
        d,
        y,
        p,
        M,
        x,
        _,
        u,
        P,
        G
      ]
    ),
    G,
    {
      scene: l,
      mesh: m,
      materials: i,
      camera: h,
      renderTarget: {
        velocity: g,
        density: c,
        curl: S,
        divergence: f,
        pressure: C
      },
      output: c.read.texture
    }
  ];
};
var xt = "#usf <defaultVertex>", yt = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const bt = ({
  scale: e,
  max: t,
  texture: n,
  scene: o,
  onBeforeInit: s
}) => {
  const v = b(
    () => new a.PlaneGeometry(e, e),
    [e]
  ), l = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uOpacity: { value: 0 },
          uMap: { value: n || w }
        },
        vertexShader: xt,
        fragmentShader: yt
      },
      s
    ),
    blending: a.AdditiveBlending,
    ...I,
    // Must be transparent.
    transparent: !0
  }), [n, s]), i = b(() => {
    const d = [];
    for (let m = 0; m < t; m++) {
      const h = l.clone(), x = new a.Mesh(v.clone(), h);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, o.add(x), d.push(x);
    }
    return d;
  }, [v, l, o, t]);
  return ae(() => () => {
    i.forEach((d) => {
      d.geometry.dispose(), Array.isArray(d.material) ? d.material.forEach((m) => m.dispose()) : d.material.dispose(), o.remove(d);
    });
  }, [o, i]), i;
}, Mt = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeoutSpeed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), Hn = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: o,
  dpr: s,
  samples: v,
  isSizeUpdate: l,
  onBeforeInit: i
}) => {
  const d = U(s), m = b(() => new a.Scene(), []), h = bt({
    scale: t,
    max: n,
    texture: e,
    scene: m,
    onBeforeInit: i
  }), x = $(o), r = Se(), [g, u] = q({
    scene: m,
    camera: x,
    size: o,
    dpr: d.fbo,
    samples: v,
    isSizeUpdate: l
  }), [c, p] = j(Mt), S = E(0), y = b(() => (M, C) => {
    p(M), h.forEach((_) => {
      if (_.visible) {
        const A = _.material;
        _.rotation.z += c.rotation, _.scale.x = c.fadeoutSpeed * _.scale.x + c.scale, _.scale.y = _.scale.x;
        const z = A.uniforms.uOpacity.value;
        R(A)("uOpacity", z * c.fadeoutSpeed), z < 1e-3 && (_.visible = !1);
      }
      F(_.material)(C);
    });
  }, [h, c, p]);
  return [
    T(
      (M, C, _) => {
        const { gl: A, pointer: z, size: P } = M;
        y(C, _);
        const O = c.pointerValues || r(z);
        if (c.frequency < O.diffPointer.length()) {
          const D = h[S.current], W = D.material;
          D.visible = !0, D.position.set(
            O.currentPointer.x * (P.width / 2),
            O.currentPointer.y * (P.height / 2),
            0
          ), D.scale.x = D.scale.y = 0, R(W)("uOpacity", c.alpha), S.current = (S.current + 1) % n;
        }
        return u(A);
      },
      [u, h, r, n, c, y]
    ),
    y,
    {
      scene: m,
      camera: x,
      meshArr: h,
      renderTarget: g,
      output: g.texture
    }
  ];
};
var St = "#usf <planeVertex>", Ct = `precision highp float;
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
}`;
const _t = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTime: { value: 0 },
          scale: { value: re.scale },
          timeStrength: { value: re.timeStrength },
          noiseOctaves: { value: re.noiseOctaves },
          fbmOctaves: { value: re.fbmOctaves },
          warpOctaves: { value: re.warpOctaves },
          warpDirection: { value: re.warpDirection },
          warpStrength: { value: re.warpStrength }
        },
        vertexShader: St,
        fragmentShader: Ct
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, re = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new a.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = _t({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(re), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C, clock: _ } = y;
        return p(f, M), u("scale", r.scale), u("timeStrength", r.timeStrength), u("noiseOctaves", r.noiseOctaves), u("fbmOctaves", r.fbmOctaves), u("warpOctaves", r.warpOctaves), u("warpDirection", r.warpDirection), u("warpStrength", r.warpStrength), u("uTime", r.beat || _.getElapsedTime()), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var wt = "#usf <planeVertex>", Tt = `precision highp float;
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
}`;
const Dt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          isTexture: { value: !1 },
          scale: { value: Q.scale },
          noise: { value: w },
          noiseStrength: { value: Q.noiseStrength },
          isNoise: { value: !1 },
          laminateLayer: { value: Q.laminateLayer },
          laminateInterval: {
            value: Q.laminateInterval
          },
          laminateDetail: { value: Q.laminateDetail },
          distortion: { value: Q.distortion },
          colorFactor: { value: Q.colorFactor },
          uTime: { value: 0 },
          timeStrength: { value: Q.timeStrength }
        },
        vertexShader: wt,
        fragmentShader: Tt
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, Q = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new a.Vector2(0.1, 0.1),
  laminateDetail: new a.Vector2(1, 1),
  distortion: new a.Vector2(0, 0),
  colorFactor: new a.Vector3(1, 1, 1),
  timeStrength: new a.Vector2(0, 0),
  noise: !1,
  noiseStrength: new a.Vector2(0, 0),
  beat: !1
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Dt({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(Q), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C, clock: _ } = y;
        return p(f, M), r.texture ? (u("uTexture", r.texture), u("isTexture", !0)) : (u("isTexture", !1), u("scale", r.scale)), r.noise ? (u("noise", r.noise), u("isNoise", !0), u("noiseStrength", r.noiseStrength)) : u("isNoise", !1), u("uTime", r.beat || _.getElapsedTime()), u("laminateLayer", r.laminateLayer), u("laminateInterval", r.laminateInterval), u("laminateDetail", r.laminateDetail), u("distortion", r.distortion), u("colorFactor", r.colorFactor), u("timeStrength", r.timeStrength), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Pt = "#usf <planeVertex>", Rt = `precision highp float;

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
}`;
const At = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_time: { value: 0 },
          u_pattern: { value: ue.pattern },
          u_complexity: { value: ue.complexity },
          u_complexityAttenuation: {
            value: ue.complexityAttenuation
          },
          u_iterations: { value: ue.iterations },
          u_timeStrength: { value: ue.timeStrength },
          u_scale: { value: ue.scale }
        },
        vertexShader: Pt,
        fragmentShader: Rt
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, ue = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = At({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(ue), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C, clock: _ } = y;
        return p(f, M), u("u_pattern", r.pattern), u("u_complexity", r.complexity), u("u_complexityAttenuation", r.complexityAttenuation), u("u_iterations", r.iterations), u("u_timeStrength", r.timeStrength), u("u_scale", r.scale), u("u_time", r.beat || _.getElapsedTime()), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Vt = "#usf <planeVertex>", Ft = `precision highp float;
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
}`;
const It = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uRgbWeight: { value: ce.rgbWeight },
          uColor1: { value: ce.color1 },
          uColor2: { value: ce.color2 },
          uColor3: { value: ce.color3 },
          uColor4: { value: ce.color4 }
        },
        vertexShader: Vt,
        fragmentShader: Ft
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, ce = Object.freeze({
  texture: w,
  color1: new a.Color().set(0.5, 0.5, 0.5),
  color2: new a.Color().set(0.5, 0.5, 0.5),
  color3: new a.Color().set(1, 1, 1),
  color4: new a.Color().set(0, 0.1, 0.2),
  rgbWeight: new a.Vector3(0.299, 0.587, 0.114)
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = It({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(ce), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("uTexture", r.texture), u("uColor1", r.color1), u("uColor2", r.color2), u("uColor3", r.color3), u("uColor4", r.color4), u("uRgbWeight", r.rgbWeight), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var zt = "#usf <planeVertex>", Ot = `precision highp float;

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
}`;
const Ut = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uColor0: { value: be.color0 },
          uColor1: { value: be.color1 }
        },
        vertexShader: zt,
        fragmentShader: Ot
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, be = Object.freeze({
  texture: w,
  color0: new a.Color(16777215),
  color1: new a.Color(0)
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Ut({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(be), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("uTexture", r.texture), u("uColor0", r.color0), u("uColor1", r.color1), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Bt = "#usf <planeVertex>", Et = `precision highp float;

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
}`;
const Lt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          uMap: { value: w },
          u_alphaMap: { value: w },
          u_isAlphaMap: { value: !1 },
          uMapIntensity: { value: ve.mapIntensity },
          u_brightness: { value: ve.brightness },
          u_min: { value: ve.min },
          u_max: { value: ve.max },
          u_dodgeColor: { value: new a.Color() },
          u_isDodgeColor: { value: !1 }
        },
        vertexShader: Bt,
        fragmentShader: Et
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, ve = Object.freeze({
  texture: w,
  map: w,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Lt({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(ve), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("u_texture", r.texture), u("uMap", r.map), u("uMapIntensity", r.mapIntensity), r.alphaMap ? (u("u_alphaMap", r.alphaMap), u("u_isAlphaMap", !0)) : u("u_isAlphaMap", !1), u("u_brightness", r.brightness), u("u_min", r.min), u("u_max", r.max), r.dodgeColor ? (u("u_dodgeColor", r.dodgeColor), u("u_isDodgeColor", !0)) : u("u_isDodgeColor", !1), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var $t = "#usf <planeVertex>", jt = `precision highp float;

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

}`;
const qt = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), v = b(() => {
    var m, h;
    return new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new a.Vector2() },
            uTextureResolution: { value: new a.Vector2() },
            uTexture0: { value: w },
            uTexture1: { value: w },
            padding: { value: oe.padding },
            uMap: { value: w },
            edgeIntensity: { value: oe.edgeIntensity },
            mapIntensity: { value: oe.mapIntensity },
            epicenter: { value: oe.epicenter },
            progress: { value: oe.progress },
            dirX: { value: (m = oe.dir) == null ? void 0 : m.x },
            dirY: { value: (h = oe.dir) == null ? void 0 : h.y }
          },
          vertexShader: $t,
          fragmentShader: jt
        },
        o
      ),
      ...I
    });
  }, [o]), l = Y(t, n);
  R(v)("uResolution", l.clone());
  const i = L(e, s, v, a.Mesh);
  return { material: v, mesh: i };
}, oe = Object.freeze({
  texture0: w,
  texture1: w,
  padding: 0,
  map: w,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  dir: new a.Vector2(0, 0)
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = qt({
    scene: l,
    size: e,
    dpr: v.shader,
    onBeforeInit: s
  }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    dpr: v.fbo,
    size: e,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(oe), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        var P, O, D, W, G, ee, X, te;
        const { gl: C } = y;
        p(f, M), u("uTexture0", r.texture0), u("uTexture1", r.texture1), u("progress", r.progress);
        const _ = [
          ((O = (P = r.texture0) == null ? void 0 : P.image) == null ? void 0 : O.width) || 0,
          ((W = (D = r.texture0) == null ? void 0 : D.image) == null ? void 0 : W.height) || 0
        ], A = [
          ((ee = (G = r.texture1) == null ? void 0 : G.image) == null ? void 0 : ee.width) || 0,
          ((te = (X = r.texture1) == null ? void 0 : X.image) == null ? void 0 : te.height) || 0
        ], z = _.map((ie, K) => ie + (A[K] - ie) * r.progress);
        return u("uTextureResolution", z), u("padding", r.padding), u("uMap", r.map), u("mapIntensity", r.mapIntensity), u("edgeIntensity", r.edgeIntensity), u("epicenter", r.epicenter), u("dirX", r.dir.x), u("dirY", r.dir.y), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Wt = "#usf <planeVertex>", Nt = `precision highp float;

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
}`;
const kt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          u_brightness: { value: de.brightness },
          u_min: { value: de.min },
          u_max: { value: de.max }
        },
        vertexShader: Wt,
        fragmentShader: Nt
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, de = Object.freeze({
  texture: w,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = kt({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(
    de
  ), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("u_texture", r.texture), u("u_brightness", r.brightness), u("u_min", r.min), u("u_max", r.max), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Gt = "#usf <planeVertex>", Kt = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;
const Xt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          uMap: { value: w },
          uMapIntensity: { value: Fe.mapIntensity }
        },
        vertexShader: Gt,
        fragmentShader: Kt
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, Fe = Object.freeze({
  texture: w,
  map: w,
  mapIntensity: 0.3
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Xt({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(Fe), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("u_texture", r.texture), u("uMap", r.map), u("uMapIntensity", r.mapIntensity), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Yt = "#usf <planeVertex>", Ht = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Qt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uMap: { value: w }
        },
        vertexShader: Yt,
        fragmentShader: Ht
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, Zt = Object.freeze({
  texture: w,
  map: w
}), ir = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Qt({
    scene: l,
    size: e,
    onBeforeInit: s
  }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(Zt), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("uTexture", r.texture), u("uMap", r.map), x(C);
      },
      [u, x, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var Jt = "#usf <planeVertex>", en = `precision highp float;

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
}`;
const tn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          u_brightness: { value: Me.brightness },
          u_saturation: { value: Me.saturation }
        },
        vertexShader: Jt,
        fragmentShader: en
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, Me = Object.freeze({
  texture: w,
  brightness: 1,
  saturation: 1
}), ur = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = tn({
    scene: l,
    size: e,
    onBeforeInit: s
  }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(Me), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("u_texture", r.texture), u("u_brightness", r.brightness), u("u_saturation", r.saturation), x(C);
      },
      [u, x, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var nn = "#usf <planeVertex>", rn = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;
const on = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), v = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uResolution: { value: new a.Vector2() },
          uTextureResolution: { value: new a.Vector2() },
          uTexture: { value: w }
        },
        vertexShader: nn,
        fragmentShader: rn
      },
      o
    ),
    ...I
  }), [o]), l = Y(t, n);
  R(v)("uResolution", l.clone());
  const i = L(e, s, v, a.Mesh);
  return { material: v, mesh: i };
}, an = Object.freeze({
  texture: w
}), sr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = on({
    scene: l,
    size: e,
    dpr: v.shader,
    onBeforeInit: s
  }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    dpr: v.fbo,
    size: e,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(an), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        var _, A, z, P, O, D;
        const { gl: C } = y;
        return p(f, M), u("uTexture", r.texture), u("uTextureResolution", [
          ((z = (A = (_ = r.texture) == null ? void 0 : _.source) == null ? void 0 : A.data) == null ? void 0 : z.width) || 0,
          ((D = (O = (P = r.texture) == null ? void 0 : P.source) == null ? void 0 : O.data) == null ? void 0 : D.height) || 0
        ]), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var un = "#usf <planeVertex>", sn = `precision highp float;

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
}`;
const ln = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uResolution: { value: new a.Vector2(0, 0) },
          uBlurSize: { value: Ie.blurSize }
        },
        vertexShader: un,
        fragmentShader: sn
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, Ie = Object.freeze({
  texture: w,
  blurSize: 3,
  blurPower: 5
}), lr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = ln({ scene: l, onBeforeInit: s }), m = $(e), h = b(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: v.fbo,
      samples: n,
      isSizeUpdate: o
    }),
    [l, m, e, v.fbo, n, o]
  ), [x, r] = se(h), [g, u] = j(Ie), c = R(i), p = F(i), S = T(
    (f, M) => {
      u(f), p(M);
    },
    [u, p]
  );
  return [
    T(
      (f, M, C) => {
        var P, O, D, W, G, ee;
        const { gl: _ } = f;
        S(M, C), c("uTexture", g.texture), c("uResolution", [
          ((D = (O = (P = g.texture) == null ? void 0 : P.source) == null ? void 0 : O.data) == null ? void 0 : D.width) || 0,
          ((ee = (G = (W = g.texture) == null ? void 0 : W.source) == null ? void 0 : G.data) == null ? void 0 : ee.height) || 0
        ]), c("uBlurSize", g.blurSize);
        let A = r(_);
        const z = g.blurPower;
        for (let X = 0; X < z; X++)
          c("uTexture", A), A = r(_);
        return A;
      },
      [r, c, g, S]
    ),
    S,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var cn = "#usf <planeVertex>", vn = `precision highp float;

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
}`;
const mn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uBackbuffer: { value: w },
          uBegin: { value: fe.begin },
          uEnd: { value: fe.end },
          uStrength: { value: fe.strength }
        },
        vertexShader: cn,
        fragmentShader: vn
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, fe = Object.freeze({
  texture: w,
  begin: new a.Vector2(0, 0),
  end: new a.Vector2(0, 0),
  strength: 0.9
}), cr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = mn({ scene: l, onBeforeInit: s }), m = $(e), h = b(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: v.fbo,
      samples: n,
      isSizeUpdate: o
    }),
    [l, m, e, v.fbo, n, o]
  ), [x, r] = se(h), [g, u] = j(fe), c = R(i), p = F(i), S = T(
    (f, M) => {
      u(f), p(M);
    },
    [u, p]
  );
  return [
    T(
      (f, M, C) => {
        const { gl: _ } = f;
        return S(M, C), c("uTexture", g.texture), c("uBegin", g.begin), c("uEnd", g.end), c("uStrength", g.strength), r(_, ({ read: A }) => {
          c("uBackbuffer", A);
        });
      },
      [r, c, S, g]
    ),
    S,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var pn = "#usf <planeVertex>", dn = `precision highp float;

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
}`;
const fn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), o = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uEpicenter: { value: me.epicenter },
          uProgress: { value: me.progress },
          uStrength: { value: me.strength },
          uWidth: { value: me.width },
          uMode: { value: 0 }
        },
        vertexShader: pn,
        fragmentShader: dn
      },
      t
    ),
    ...I
  }), [t]), s = L(e, n, o, a.Mesh);
  return { material: o, mesh: s };
}, me = Object.freeze({
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), vr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = fn({ scene: l, onBeforeInit: s }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(me), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("uEpicenter", r.epicenter), u("uProgress", r.progress), u("uWidth", r.width), u("uStrength", r.strength), u(
          "uMode",
          r.mode === "center" ? 0 : r.mode === "horizontal" ? 1 : 2
        ), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var gn = "#usf <planeVertex>", hn = `precision highp float;
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
}`;
const xn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), v = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          u_resolution: { value: new a.Vector2() },
          u_keyColor: { value: Z.color },
          u_similarity: { value: Z.similarity },
          u_smoothness: { value: Z.smoothness },
          u_spill: { value: Z.spill },
          u_color: { value: Z.color },
          u_contrast: { value: Z.contrast },
          u_brightness: { value: Z.brightness },
          u_gamma: { value: Z.gamma }
        },
        vertexShader: gn,
        fragmentShader: hn
      },
      o
    ),
    ...I
  }), [o]), l = Y(t, n);
  R(v)("u_resolution", l.clone());
  const i = L(e, s, v, a.Mesh);
  return { material: v, mesh: i };
}, Z = Object.freeze({
  texture: w,
  keyColor: new a.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new a.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), mr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = xn({
    scene: l,
    size: e,
    dpr: v.shader,
    onBeforeInit: s
  }), m = $(e), [h, x] = q({
    scene: l,
    camera: m,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: o
  }), [r, g] = j(Z), u = R(i), c = F(i), p = T(
    (y, f) => {
      g(y), c(f);
    },
    [g, c]
  );
  return [
    T(
      (y, f, M) => {
        const { gl: C } = y;
        return p(f, M), u("u_texture", r.texture), u("u_keyColor", r.keyColor), u("u_similarity", r.similarity), u("u_smoothness", r.smoothness), u("u_spill", r.spill), u("u_color", r.color), u("u_contrast", r.contrast), u("u_brightness", r.brightness), u("u_gamma", r.gamma), x(C);
      },
      [x, u, r, p]
    ),
    p,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: h,
      output: h.texture
    }
  ];
};
var yn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`, bn = `precision highp float;

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
}`;
const Mn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: o
}) => {
  const s = b(() => new a.PlaneGeometry(2, 2), []), v = b(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uBackbuffer: { value: w },
          uTime: { value: 0 },
          uPointer: { value: new a.Vector2() },
          uResolution: { value: new a.Vector2() }
        },
        vertexShader: yn,
        fragmentShader: bn
      },
      o
    ),
    ...I
  }), [o]), l = Y(t, n);
  R(v)("uResolution", l.clone());
  const i = L(e, s, v, a.Mesh);
  return { material: v, mesh: i };
}, Sn = Object.freeze({
  texture: w,
  beat: !1
}), pr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  onBeforeInit: s
}) => {
  const v = U(t), l = b(() => new a.Scene(), []), { material: i, mesh: d } = Mn({
    scene: l,
    size: e,
    dpr: v.shader,
    onBeforeInit: s
  }), m = $(e), h = b(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: v.fbo,
      samples: n,
      isSizeUpdate: o
    }),
    [l, m, e, v.fbo, n, o]
  ), [x, r] = se(h), [g, u] = j(Sn), c = R(i), p = F(i), S = T(
    (f, M) => {
      u(f), p(M);
    },
    [u, p]
  );
  return [
    T(
      (f, M, C) => {
        const { gl: _, clock: A, pointer: z } = f;
        return S(M, C), c("uPointer", z), c("uTexture", g.texture), c("uTime", g.beat || A.getElapsedTime()), r(_, ({ read: P }) => {
          c("uBackbuffer", P);
        });
      },
      [r, c, g, S]
    ),
    S,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: x,
      output: x.read.texture
    }
  ];
}, Cn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const o = L(
    e,
    t,
    n,
    a.Points
  ), s = L(
    e,
    b(() => t.clone(), [t]),
    b(() => n.clone(), [n]),
    a.Mesh
  );
  return s.visible = !1, {
    points: o,
    interactiveMesh: s
  };
};
var _n = `uniform vec2 uResolution;
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
}`, wn = `precision highp float;
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
}`;
const De = (e, t, n, o, s) => {
  var h;
  const v = n === "position" ? "positionTarget" : "uvTarget", l = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", i = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", d = n === "position" ? "positionsList" : "uvsList", m = n === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    t.deleteAttribute(n), t.setAttribute(
      n,
      new a.BufferAttribute(e[0], s)
    );
    let x = "", r = "";
    e.forEach((g, u) => {
      t.setAttribute(
        `${v}${u}`,
        new a.BufferAttribute(g, s)
      ), x += `attribute vec${s} ${v}${u};
`, u === 0 ? r += `${v}${u}` : r += `,${v}${u}`;
    }), o = o.replace(
      `${l}`,
      x
    ), o = o.replace(
      `${i}`,
      `vec${s} ${d}[${e.length}] = vec${s}[](${r});
				${m}
			`
    );
  } else
    o = o.replace(`${l}`, ""), o = o.replace(`${i}`, ""), (h = t == null ? void 0 : t.attributes[n]) != null && h.array || Ae && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return o;
}, Pe = (e, t, n, o) => {
  var v;
  let s = [];
  if (e && e.length > 0) {
    (v = t == null ? void 0 : t.attributes[n]) != null && v.array ? s = [
      t.attributes[n].array,
      ...e
    ] : s = e;
    const l = Math.max(...s.map((i) => i.length));
    s.forEach((i, d) => {
      if (i.length < l) {
        const m = (l - i.length) / o, h = [], x = Array.from(i);
        for (let r = 0; r < m; r++) {
          const g = Math.floor(i.length / o * Math.random()) * o;
          for (let u = 0; u < o; u++)
            h.push(x[g + u]);
        }
        s[d] = new Float32Array([...x, ...h]);
      }
    });
  }
  return s;
}, Tn = (e, t) => {
  let n = "";
  const o = {};
  let s = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((l, i) => {
    const d = `vMapArrayIndex < ${i}.1`, m = `texture2D(uMapArray${i}, uv)`;
    s += `( ${d} ) ? ${m} : `, n += `
        uniform sampler2D uMapArray${i};
      `, o[`uMapArray${i}`] = { value: l };
  }), s += "vec4(1.);", n += "bool isMapArray = true;", o.uMapArrayLength = { value: e.length }) : (s += "vec4(1.0);", n += "bool isMapArray = false;", o.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", s).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: o };
}, Dn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: o,
  uvs: s,
  mapArray: v,
  onBeforeInit: l
}) => {
  const i = b(
    () => Pe(o, n, "position", 3),
    [o, n]
  ), d = b(
    () => Pe(s, n, "uv", 2),
    [s, n]
  ), m = b(() => {
    i.length !== d.length && Ae && console.log("use-shader-fx:positions and uvs are not matched");
    const x = De(
      d,
      n,
      "uv",
      De(
        i,
        n,
        "position",
        _n,
        3
      ),
      2
    ), { rewritedFragmentShader: r, mapArrayUniforms: g } = Tn(v, wn);
    return new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new a.Vector2(0, 0) },
            uMorphProgress: {
              value: B.morphProgress
            },
            uBlurAlpha: { value: B.blurAlpha },
            uBlurRadius: { value: B.blurRadius },
            uPointSize: { value: B.pointSize },
            uPointAlpha: { value: B.pointAlpha },
            uPicture: { value: w },
            uIsPicture: { value: !1 },
            uAlphaPicture: { value: w },
            uIsAlphaPicture: { value: !1 },
            uColor0: { value: B.color0 },
            uColor1: { value: B.color1 },
            uColor2: { value: B.color2 },
            uColor3: { value: B.color3 },
            uMap: { value: w },
            uIsMap: { value: !1 },
            uAlphaMap: { value: w },
            uIsAlphaMap: { value: !1 },
            uTime: { value: 0 },
            uWobblePositionFrequency: {
              value: B.wobblePositionFrequency
            },
            uWobbleTimeFrequency: {
              value: B.wobbleTimeFrequency
            },
            uWobbleStrength: {
              value: B.wobbleStrength
            },
            uWarpPositionFrequency: {
              value: B.warpPositionFrequency
            },
            uWarpTimeFrequency: {
              value: B.warpTimeFrequency
            },
            uWarpStrength: { value: B.warpStrength },
            uDisplacement: { value: w },
            uIsDisplacement: { value: !1 },
            uDisplacementIntensity: {
              value: B.displacementIntensity
            },
            uDisplacementColorIntensity: {
              value: B.displacementColorIntensity
            },
            uSizeRandomIntensity: {
              value: B.sizeRandomIntensity
            },
            uSizeRandomTimeFrequency: {
              value: B.sizeRandomTimeFrequency
            },
            uSizeRandomMin: {
              value: B.sizeRandomMin
            },
            uSizeRandomMax: {
              value: B.sizeRandomMax
            },
            uDivergence: { value: B.divergence },
            uDivergencePoint: {
              value: B.divergencePoint
            },
            ...g
          },
          vertexShader: x,
          fragmentShader: r
        },
        l
      ),
      ...I,
      blending: a.AdditiveBlending,
      // Must be transparent
      transparent: !0
    });
  }, [
    n,
    i,
    d,
    v,
    l
  ]), h = Y(e, t);
  return R(m)("uResolution", h.clone()), { material: m, modifiedPositions: i, modifiedUvs: d };
}, Pn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: o,
  positions: s,
  uvs: v,
  mapArray: l,
  onBeforeInit: i
}) => {
  const d = U(t), m = b(() => {
    const y = o || new a.SphereGeometry(1, 32, 32);
    return y.setIndex(null), y.deleteAttribute("normal"), y;
  }, [o]), { material: h, modifiedPositions: x, modifiedUvs: r } = Dn({
    size: e,
    dpr: d.shader,
    geometry: m,
    positions: s,
    uvs: v,
    mapArray: l,
    onBeforeInit: i
  }), { points: g, interactiveMesh: u } = Cn({
    scene: n,
    geometry: m,
    material: h
  }), c = R(h), p = F(h);
  return [
    T(
      (y, f, M) => {
        y && c(
          "uTime",
          (f == null ? void 0 : f.beat) || y.clock.getElapsedTime()
        ), f !== void 0 && (c("uMorphProgress", f.morphProgress), c("uBlurAlpha", f.blurAlpha), c("uBlurRadius", f.blurRadius), c("uPointSize", f.pointSize), c("uPointAlpha", f.pointAlpha), f.picture ? (c("uPicture", f.picture), c("uIsPicture", !0)) : f.picture === !1 && c("uIsPicture", !1), f.alphaPicture ? (c("uAlphaPicture", f.alphaPicture), c("uIsAlphaPicture", !0)) : f.alphaPicture === !1 && c("uIsAlphaPicture", !1), c("uColor0", f.color0), c("uColor1", f.color1), c("uColor2", f.color2), c("uColor3", f.color3), f.map ? (c("uMap", f.map), c("uIsMap", !0)) : f.map === !1 && c("uIsMap", !1), f.alphaMap ? (c("uAlphaMap", f.alphaMap), c("uIsAlphaMap", !0)) : f.alphaMap === !1 && c("uIsAlphaMap", !1), c("uWobbleStrength", f.wobbleStrength), c(
          "uWobblePositionFrequency",
          f.wobblePositionFrequency
        ), c("uWobbleTimeFrequency", f.wobbleTimeFrequency), c("uWarpStrength", f.warpStrength), c("uWarpPositionFrequency", f.warpPositionFrequency), c("uWarpTimeFrequency", f.warpTimeFrequency), f.displacement ? (c("uDisplacement", f.displacement), c("uIsDisplacement", !0)) : f.displacement === !1 && c("uIsDisplacement", !1), c("uDisplacementIntensity", f.displacementIntensity), c(
          "uDisplacementColorIntensity",
          f.displacementColorIntensity
        ), c("uSizeRandomIntensity", f.sizeRandomIntensity), c(
          "uSizeRandomTimeFrequency",
          f.sizeRandomTimeFrequency
        ), c("uSizeRandomMin", f.sizeRandomMin), c("uSizeRandomMax", f.sizeRandomMax), c("uDivergence", f.divergence), c("uDivergencePoint", f.divergencePoint), p(M));
      },
      [c, p]
    ),
    {
      points: g,
      interactiveMesh: u,
      positions: x,
      uvs: r
    }
  ];
}, B = Object.freeze({
  morphProgress: 0,
  blurAlpha: 0.9,
  blurRadius: 0.05,
  pointSize: 0.05,
  pointAlpha: 1,
  picture: !1,
  alphaPicture: !1,
  color0: new a.Color(16711680),
  color1: new a.Color(65280),
  color2: new a.Color(255),
  color3: new a.Color(16776960),
  map: !1,
  alphaMap: !1,
  wobbleStrength: 0,
  wobblePositionFrequency: 0.5,
  wobbleTimeFrequency: 0.5,
  warpStrength: 0,
  warpPositionFrequency: 0.5,
  warpTimeFrequency: 0.5,
  displacement: !1,
  displacementIntensity: 1,
  displacementColorIntensity: 0,
  sizeRandomIntensity: 0,
  sizeRandomTimeFrequency: 0.2,
  sizeRandomMin: 0.5,
  sizeRandomMax: 1.5,
  divergence: 0,
  divergencePoint: new a.Vector3(0),
  beat: !1
}), dr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  camera: s,
  geometry: v,
  positions: l,
  uvs: i,
  onBeforeInit: d
}) => {
  const m = U(t), h = b(() => new a.Scene(), []), [
    x,
    {
      points: r,
      interactiveMesh: g,
      positions: u,
      uvs: c
    }
  ] = Pn({
    scene: h,
    size: e,
    dpr: t,
    geometry: v,
    positions: l,
    uvs: i,
    onBeforeInit: d
  }), [p, S] = q({
    scene: h,
    camera: s,
    size: e,
    dpr: m.fbo,
    samples: n,
    isSizeUpdate: o,
    depthBuffer: !0
  }), y = T(
    (M, C, _) => (x(M, C, _), S(M.gl)),
    [S, x]
  ), f = T(
    (M, C) => {
      x(null, M, C);
    },
    [x]
  );
  return [
    y,
    f,
    {
      scene: h,
      points: r,
      interactiveMesh: g,
      renderTarget: p,
      output: p.texture,
      positions: u,
      uvs: c
    }
  ];
};
function Rn(e, t = 1e-4) {
  t = Math.max(t, Number.EPSILON);
  const n = {}, o = e.getIndex(), s = e.getAttribute("position"), v = o ? o.count : s.count;
  let l = 0;
  const i = Object.keys(e.attributes), d = {}, m = {}, h = [], x = ["getX", "getY", "getZ", "getW"];
  for (let c = 0, p = i.length; c < p; c++) {
    const S = i[c];
    d[S] = [];
    const y = e.morphAttributes[S];
    y && (m[S] = new Array(y.length).fill(0).map(() => []));
  }
  const r = Math.log10(1 / t), g = Math.pow(10, r);
  for (let c = 0; c < v; c++) {
    const p = o ? o.getX(c) : c;
    let S = "";
    for (let y = 0, f = i.length; y < f; y++) {
      const M = i[y], C = e.getAttribute(M), _ = C.itemSize;
      for (let A = 0; A < _; A++)
        S += `${~~(C[x[A]](p) * g)},`;
    }
    if (S in n)
      h.push(n[S]);
    else {
      for (let y = 0, f = i.length; y < f; y++) {
        const M = i[y], C = e.getAttribute(M), _ = e.morphAttributes[M], A = C.itemSize, z = d[M], P = m[M];
        for (let O = 0; O < A; O++) {
          const D = x[O];
          if (z.push(C[D](p)), _)
            for (let W = 0, G = _.length; W < G; W++)
              P[W].push(_[W][D](p));
        }
      }
      n[S] = l, h.push(l), l++;
    }
  }
  const u = e.clone();
  for (let c = 0, p = i.length; c < p; c++) {
    const S = i[c], y = e.getAttribute(S), f = new y.array.constructor(d[S]), M = new Te(f, y.itemSize, y.normalized);
    if (u.setAttribute(S, M), S in m)
      for (let C = 0; C < m[S].length; C++) {
        const _ = e.morphAttributes[S][C], A = new _.array.constructor(m[S][C]), z = new Te(A, _.itemSize, _.normalized);
        u.morphAttributes[S][C] = z;
      }
  }
  return u.setIndex(h), u;
}
const Re = (e) => {
  e.vertexShader = e.vertexShader.replace(
    "void main() {",
    `
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
		`
  ), e.vertexShader = e.vertexShader.replace(
    "#include <beginnormal_vertex>",
    `
			vec3 objectNormal = usf_Normal;
			#ifdef USE_TANGENT
			vec3 objectTangent = vec3( tangent.xyz );
			#endif
		`
  ), e.vertexShader = e.vertexShader.replace(
    "#include <begin_vertex>",
    `
			vec3 transformed = usf_Position;
		`
  ), e.vertexShader = e.vertexShader.replace(
    "void main() {",
    `
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
		`
  );
}, An = (e) => {
  e.fragmentShader = e.fragmentShader.replace(
    "#include <color_fragment>",
    `
			#include <color_fragment>

			if (uEdgeThreshold > 0.0) {
				float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
				diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
			} else {
				diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
			}
		`
  ), e.fragmentShader = e.fragmentShader.replace(
    "void main() {",
    `
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
		`
  );
};
var Vn = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, Fn = `#ifdef USE_TRANSMISSION

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

#endif`;
const In = ({
  mat: e,
  isCustomTransmission: t,
  parameters: n
}) => {
  e.type === "MeshPhysicalMaterial" && t && (n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_pars_fragment>",
    `${Vn}`
  ), n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_fragment>",
    `${Fn}`
  )), e.normalMap || (n.vertexShader = n.vertexShader.replace(
    "void main() {",
    `
				attribute vec4 tangent;
				
				void main() {
			`
  ));
}, zn = ({
  baseMaterial: e,
  materialParameters: t,
  isCustomTransmission: n = !1,
  onBeforeInit: o,
  depthOnBeforeInit: s
}) => {
  const { material: v, depthMaterial: l } = b(() => {
    const i = new (e || a.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(i.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: N.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: N.wobbleTimeFrequency
        },
        uWobbleStrength: { value: N.wobbleStrength },
        uWarpPositionFrequency: {
          value: N.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: N.warpTimeFrequency },
        uWarpStrength: { value: N.warpStrength },
        uColor0: { value: N.color0 },
        uColor1: { value: N.color1 },
        uColor2: { value: N.color2 },
        uColor3: { value: N.color3 },
        uColorMix: { value: N.colorMix },
        uEdgeThreshold: { value: N.edgeThreshold },
        uEdgeColor: { value: N.edgeColor },
        uChromaticAberration: {
          value: N.chromaticAberration
        },
        uAnisotropicBlur: { value: N.anisotropicBlur },
        uDistortion: { value: N.distortion },
        uDistortionScale: { value: N.distortionScale },
        uTemporalDistortion: { value: N.temporalDistortion },
        uRefractionSamples: { value: N.refractionSamples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null }
      }
    }), i.onBeforeCompile = (m) => {
      Re(m), An(m), In({
        parameters: m,
        mat: i,
        isCustomTransmission: n
      });
      const h = V(
        {
          fragmentShader: m.fragmentShader,
          vertexShader: m.vertexShader,
          // Because wobble3D uses userData to update uniforms.
          uniforms: i.userData.uniforms
        },
        o
      );
      m.fragmentShader = h.fragmentShader, m.vertexShader = h.vertexShader, Object.assign(m.uniforms, h.uniforms);
    }, i.needsUpdate = !0;
    const d = new a.MeshDepthMaterial({
      depthPacking: a.RGBADepthPacking
    });
    return d.onBeforeCompile = (m) => {
      Object.assign(m.uniforms, i.userData.uniforms), Re(m), V(m, s);
    }, d.needsUpdate = !0, { material: i, depthMaterial: d };
  }, [
    t,
    e,
    o,
    s,
    n
  ]);
  return {
    material: v,
    depthMaterial: l
  };
}, On = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: o,
  materialParameters: s,
  onBeforeInit: v,
  depthOnBeforeInit: l
}) => {
  const i = b(() => {
    let c = t || new a.IcosahedronGeometry(2, 20);
    return c = Rn(c), c.computeTangents(), c;
  }, [t]), { material: d, depthMaterial: m } = zn({
    baseMaterial: o,
    materialParameters: s,
    isCustomTransmission: n,
    onBeforeInit: v,
    depthOnBeforeInit: l
  }), h = L(e, i, d, a.Mesh), x = d.userData, r = R(x), g = F(x);
  return [
    T(
      (c, p, S) => {
        c && r(
          "uTime",
          (p == null ? void 0 : p.beat) || c.clock.getElapsedTime()
        ), p !== void 0 && (r("uWobbleStrength", p.wobbleStrength), r(
          "uWobblePositionFrequency",
          p.wobblePositionFrequency
        ), r("uWobbleTimeFrequency", p.wobbleTimeFrequency), r("uWarpStrength", p.warpStrength), r("uWarpPositionFrequency", p.warpPositionFrequency), r("uWarpTimeFrequency", p.warpTimeFrequency), r("uColor0", p.color0), r("uColor1", p.color1), r("uColor2", p.color2), r("uColor3", p.color3), r("uColorMix", p.colorMix), r("uEdgeThreshold", p.edgeThreshold), r("uEdgeColor", p.edgeColor), r("uChromaticAberration", p.chromaticAberration), r("uAnisotropicBlur", p.anisotropicBlur), r("uDistortion", p.distortion), r("uDistortionScale", p.distortionScale), r("uRefractionSamples", p.refractionSamples), r("uTemporalDistortion", p.temporalDistortion), g(S));
      },
      [r, g]
    ),
    {
      mesh: h,
      depthMaterial: m
    }
  ];
}, N = Object.freeze({
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
  color0: new a.Color(16711680),
  color1: new a.Color(65280),
  color2: new a.Color(255),
  color3: new a.Color(16776960),
  colorMix: 1,
  edgeThreshold: 0,
  edgeColor: new a.Color(0),
  chromaticAberration: 0.1,
  anisotropicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.1,
  temporalDistortion: 0,
  refractionSamples: 6,
  beat: !1
}), fr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: o,
  camera: s,
  geometry: v,
  baseMaterial: l,
  materialParameters: i,
  isCustomTransmission: d,
  onBeforeInit: m,
  depthOnBeforeInit: h
}) => {
  const x = U(t), r = b(() => new a.Scene(), []), [g, { mesh: u, depthMaterial: c }] = On({
    baseMaterial: l,
    materialParameters: i,
    scene: r,
    geometry: v,
    isCustomTransmission: d,
    onBeforeInit: m,
    depthOnBeforeInit: h
  }), [p, S] = q({
    scene: r,
    camera: s,
    size: e,
    dpr: x.fbo,
    samples: n,
    isSizeUpdate: o,
    depthBuffer: !0
  }), y = T(
    (M, C, _) => (g(M, C, _), S(M.gl)),
    [S, g]
  ), f = T(
    (M, C) => {
      g(null, M, C);
    },
    [g]
  );
  return [
    y,
    f,
    {
      scene: r,
      mesh: u,
      depthMaterial: c,
      renderTarget: p,
      output: p.texture
    }
  ];
}, gr = (e, t, n) => {
  const o = b(() => {
    const s = new a.Mesh(t, n);
    return e.add(s), s;
  }, [t, n, e]);
  return ae(() => () => {
    e.remove(o), t.dispose(), n.dispose();
  }, [e, t, n, o]), o;
}, ge = Object.freeze({
  easeInSine(e) {
    return 1 - Math.cos(e * Math.PI / 2);
  },
  easeOutSine(e) {
    return Math.sin(e * Math.PI / 2);
  },
  easeInOutSine(e) {
    return -(Math.cos(Math.PI * e) - 1) / 2;
  },
  easeInQuad(e) {
    return e * e;
  },
  easeOutQuad(e) {
    return 1 - (1 - e) * (1 - e);
  },
  easeInOutQuad(e) {
    return e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
  },
  easeInCubic(e) {
    return e * e * e;
  },
  easeOutCubic(e) {
    return 1 - Math.pow(1 - e, 3);
  },
  easeInOutCubic(e) {
    return e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  },
  easeInQuart(e) {
    return e * e * e * e;
  },
  easeOutQuart(e) {
    return 1 - Math.pow(1 - e, 4);
  },
  easeInOutQuart(e) {
    return e < 0.5 ? 8 * e * e * e * e : 1 - Math.pow(-2 * e + 2, 4) / 2;
  },
  easeInQuint(e) {
    return e * e * e * e * e;
  },
  easeOutQuint(e) {
    return 1 - Math.pow(1 - e, 5);
  },
  easeInOutQuint(e) {
    return e < 0.5 ? 16 * e * e * e * e * e : 1 - Math.pow(-2 * e + 2, 5) / 2;
  },
  easeInExpo(e) {
    return e === 0 ? 0 : Math.pow(2, 10 * e - 10);
  },
  easeOutExpo(e) {
    return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
  },
  easeInOutExpo(e) {
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2;
  },
  easeInCirc(e) {
    return 1 - Math.sqrt(1 - Math.pow(e, 2));
  },
  easeOutCirc(e) {
    return Math.sqrt(1 - Math.pow(e - 1, 2));
  },
  easeInOutCirc(e) {
    return e < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * e, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * e + 2, 2)) + 1) / 2;
  },
  easeInBack(e) {
    return 2.70158 * e * e * e - 1.70158 * e * e;
  },
  easeOutBack(e) {
    return 1 + 2.70158 * Math.pow(e - 1, 3) + 1.70158 * Math.pow(e - 1, 2);
  },
  easeInOutBack(e) {
    const n = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((n + 1) * 2 * e - n) / 2 : (Math.pow(2 * e - 2, 2) * ((n + 1) * (e * 2 - 2) + n) + 2) / 2;
  },
  easeInElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * t);
  },
  easeOutElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * t) + 1;
  },
  easeInOutElastic(e) {
    const t = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * t)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * t) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - ge.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - ge.easeOutBounce(1 - 2 * e)) / 2 : (1 + ge.easeOutBounce(2 * e - 1)) / 2;
  }
});
function Un(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const hr = (e, t = "easeOutQuart") => {
  const n = e / 60, o = ge[t];
  return T(
    (v) => {
      let l = v.getElapsedTime() * n;
      const i = Math.floor(l), d = o(l - i);
      l = d + i;
      const m = Un(i);
      return {
        beat: l,
        floor: i,
        fract: d,
        hash: m
      };
    },
    [n, o]
  );
}, xr = (e = 60) => {
  const t = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = E(null);
  return T(
    (s) => {
      const v = s.getElapsedTime();
      return n.current === null || v - n.current >= t ? (n.current = v, !0) : !1;
    },
    [t]
  );
}, Bn = (e) => {
  var o, s;
  const t = (o = e.dom) == null ? void 0 : o.length, n = (s = e.texture) == null ? void 0 : s.length;
  return !t || !n || t !== n;
};
var En = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Ln = `precision highp float;

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
}`;
const $n = ({
  params: e,
  scene: t,
  onBeforeInit: n
}) => {
  t.children.length > 0 && (t.children.forEach((o) => {
    o instanceof a.Mesh && (o.geometry.dispose(), o.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((o, s) => {
    const v = new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            u_texture: { value: o },
            u_textureResolution: {
              value: new a.Vector2(0, 0)
            },
            u_resolution: { value: new a.Vector2(0, 0) },
            u_borderRadius: {
              value: e.boderRadius[s] ? e.boderRadius[s] : 0
            }
          },
          vertexShader: En,
          fragmentShader: Ln
        },
        n
      ),
      ...I,
      // Must be transparent.
      transparent: !0
    }), l = new a.Mesh(new a.PlaneGeometry(1, 1), v);
    t.add(l);
  });
}, jn = () => {
  const e = E([]), t = E([]);
  return T(
    ({
      isIntersectingRef: o,
      isIntersectingOnceRef: s,
      params: v
    }) => {
      e.current.length > 0 && e.current.forEach((i, d) => {
        i.unobserve(t.current[d]);
      }), t.current = [], e.current = [];
      const l = new Array(v.dom.length).fill(!1);
      o.current = [...l], s.current = [...l], v.dom.forEach((i, d) => {
        const m = (x) => {
          x.forEach((r) => {
            v.onIntersect[d] && v.onIntersect[d](r), o.current[d] = r.isIntersecting;
          });
        }, h = new IntersectionObserver(m, {
          rootMargin: "0px",
          threshold: 0
        });
        h.observe(i), e.current.push(h), t.current.push(i);
      });
    },
    []
  );
}, qn = () => {
  const e = E([]), t = T(
    ({
      params: n,
      customParams: o,
      size: s,
      resolutionRef: v,
      scene: l,
      isIntersectingRef: i
    }) => {
      l.children.length !== e.current.length && (e.current = new Array(l.children.length)), l.children.forEach((d, m) => {
        var r, g, u, c, p, S;
        const h = n.dom[m];
        if (!h)
          return;
        const x = h.getBoundingClientRect();
        if (e.current[m] = x, d.scale.set(x.width, x.height, 1), d.position.set(
          x.left + x.width * 0.5 - s.width * 0.5,
          -x.top - x.height * 0.5 + s.height * 0.5,
          0
        ), i.current[m] && (n.rotation[m] && d.rotation.copy(n.rotation[m]), d instanceof a.Mesh)) {
          const y = d.material, f = R(y), M = F(y);
          f("u_texture", n.texture[m]), f("u_textureResolution", [
            ((u = (g = (r = n.texture[m]) == null ? void 0 : r.source) == null ? void 0 : g.data) == null ? void 0 : u.width) || 0,
            ((S = (p = (c = n.texture[m]) == null ? void 0 : c.source) == null ? void 0 : p.data) == null ? void 0 : S.height) || 0
          ]), f(
            "u_resolution",
            v.current.set(x.width, x.height)
          ), f(
            "u_borderRadius",
            n.boderRadius[m] ? n.boderRadius[m] : 0
          ), M(o);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Wn = () => {
  const e = E([]), t = E([]), n = T((o, s = !1) => {
    e.current.forEach((l, i) => {
      l && (t.current[i] = !0);
    });
    const v = s ? [...t.current] : [...e.current];
    return o < 0 ? v : v[o];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, Nn = (e) => ({ onView: n, onHidden: o }) => {
  const s = E(!1);
  ae(() => {
    let v;
    const l = () => {
      e.current.some((i) => i) ? s.current || (n && n(), s.current = !0) : s.current && (o && o(), s.current = !1), v = requestAnimationFrame(l);
    };
    return v = requestAnimationFrame(l), () => {
      cancelAnimationFrame(v);
    };
  }, [n, o]);
}, kn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, yr = ({ size: e, dpr: t, samples: n, isSizeUpdate: o, onBeforeInit: s }, v = []) => {
  const l = U(t), i = b(() => new a.Scene(), []), d = $(e), [m, h] = q({
    scene: i,
    camera: d,
    size: e,
    dpr: l.fbo,
    samples: n,
    isSizeUpdate: o
  }), [x, r] = j({
    ...kn,
    updateKey: performance.now()
  }), [g, u] = qn(), c = E(new a.Vector2(0, 0)), [p, S] = Ee(!0);
  b(
    () => S(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    v
  );
  const y = E(null), f = b(() => w, []), M = jn(), { isIntersectingOnceRef: C, isIntersectingRef: _, isIntersecting: A } = Wn(), z = Nn(_), P = b(() => (D, W) => {
    r(D), u({
      params: x,
      customParams: W,
      size: e,
      resolutionRef: c,
      scene: i,
      isIntersectingRef: _
    });
  }, [_, r, u, e, i, x]);
  return [
    T(
      (D, W, G) => {
        const { gl: ee, size: X } = D;
        if (P(W, G), Bn(x))
          return f;
        if (p) {
          if (y.current === x.updateKey)
            return f;
          y.current = x.updateKey;
        }
        return p && ($n({
          params: x,
          size: X,
          scene: i,
          onBeforeInit: s
        }), M({
          isIntersectingRef: _,
          isIntersectingOnceRef: C,
          params: x
        }), S(!1)), h(ee);
      },
      [
        h,
        M,
        s,
        P,
        p,
        i,
        x,
        C,
        _,
        f
      ]
    ),
    P,
    {
      scene: i,
      camera: d,
      renderTarget: m,
      output: m.texture,
      isIntersecting: A,
      DOMRects: g,
      intersections: _.current,
      useDomView: z
    }
  ];
}, br = ({
  scene: e,
  camera: t,
  size: n,
  dpr: o = !1,
  isSizeUpdate: s = !1,
  samples: v = 0,
  depthBuffer: l = !1,
  depthTexture: i = !1
}, d) => {
  const m = E([]), h = Y(n, o);
  m.current = b(() => Array.from({ length: d }, () => {
    const r = new a.WebGLRenderTarget(
      h.x,
      h.y,
      {
        ...he,
        samples: v,
        depthBuffer: l
      }
    );
    return i && (r.depthTexture = new a.DepthTexture(
      h.x,
      h.y,
      a.FloatType
    )), r;
  }), [d]), s && m.current.forEach(
    (r) => r.setSize(h.x, h.y)
  ), ae(() => {
    const r = m.current;
    return () => {
      r.forEach((g) => g.dispose());
    };
  }, [d]);
  const x = T(
    (r, g, u) => {
      const c = m.current[g];
      return Ce({
        gl: r,
        scene: e,
        camera: t,
        fbo: c,
        onBeforeRender: () => u && u({ read: c.texture })
      }), c.texture;
    },
    [e, t]
  );
  return [m.current, x];
}, Mr = Object.freeze({
  interpolate(e, t, n) {
    return e + (t - e) * n;
  }
});
export {
  Zt as ALPHABLENDING_PARAMS,
  Sn as BLANK_PARAMS,
  ve as BLENDING_PARAMS,
  de as BRIGHTNESSPICKER_PARAMS,
  ne as BRUSH_PARAMS,
  Z as CHROMAKEY_PARAMS,
  Q as COLORSTRATA_PARAMS,
  ce as COSPALETTE_PARAMS,
  an as COVERTEXTURE_PARAMS,
  Ve as DELTA_TIME,
  kn as DOMSYNCER_PARAMS,
  be as DUOTONE_PARAMS,
  ge as Easing,
  he as FBO_OPTION,
  ht as FLUID_PARAMS,
  Fe as FXBLENDING_PARAMS,
  oe as FXTEXTURE_PARAMS,
  Me as HSV_PARAMS,
  ue as MARBLE_PARAMS,
  B as MORPHPARTICLES_PARAMS,
  fe as MOTIONBLUR_PARAMS,
  re as NOISE_PARAMS,
  Mt as RIPPLE_PARAMS,
  Ie as SIMPLEBLUR_PARAMS,
  Ke as ShaderChunk,
  Mr as Utils,
  me as WAVE_PARAMS,
  N as WOBBLE3D_PARAMS,
  Ce as renderFBO,
  F as setCustomUniform,
  R as setUniform,
  gr as useAddMesh,
  ir as useAlphaBlending,
  hr as useBeat,
  pr as useBlank,
  nr as useBlending,
  or as useBrightnessPicker,
  Xn as useBrush,
  $ as useCamera,
  mr as useChromaKey,
  Zn as useColorStrata,
  br as useCopyTexture,
  er as useCosPalette,
  sr as useCoverTexture,
  Pn as useCreateMorphParticles,
  On as useCreateWobble3D,
  yr as useDomSyncer,
  se as useDoubleFBO,
  tr as useDuoTone,
  xr as useFPSLimiter,
  Yn as useFluid,
  ar as useFxBlending,
  rr as useFxTexture,
  ur as useHSV,
  Jn as useMarble,
  dr as useMorphParticles,
  cr as useMotionBlur,
  Qn as useNoise,
  j as useParams,
  Se as usePointer,
  Y as useResolution,
  Hn as useRipple,
  lr as useSimpleBlur,
  q as useSingleFBO,
  vr as useWave,
  fr as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
