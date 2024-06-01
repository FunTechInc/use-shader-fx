import * as a from "three";
import { useMemo as y, useEffect as ae, useRef as B, useCallback as _, useState as Be } from "react";
import { mergeVertices as Ee } from "three-stdlib";
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
const X = (e, t = !1) => {
  const n = t ? e.width * t : e.width, r = t ? e.height * t : e.height;
  return y(
    () => new a.Vector2(n, r),
    [n, r]
  );
}, R = (e) => (t, n) => {
  if (n === void 0)
    return;
  const r = e.uniforms;
  r && r[t] && (r[t].value = n);
}, F = (e) => (t) => {
  t !== void 0 && Object.keys(t).forEach((n) => {
    const r = e.uniforms;
    r && r[n] && (r[n].value = t[n]);
  });
}, E = (e, t, n, r) => {
  const u = y(() => {
    const c = new r(t, n);
    return e && e.add(c), c;
  }, [t, n, r, e]);
  return ae(() => () => {
    e && e.remove(u), t.dispose(), n.dispose();
  }, [e, t, n, u]), u;
}, Re = process.env.NODE_ENV === "development", I = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, C = new a.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  a.RGBAFormat
);
var qe = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`, je = `vec3 random3(vec3 c) {
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
}`, Ke = `vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`, Xe = `vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}`;
const Ye = Object.freeze({
  wobble3D: qe,
  snoise: je,
  coverTexture: We,
  fxBlending: Ne,
  planeVertex: ke,
  defaultVertex: Ge,
  hsv2rgb: Ke,
  rgb2hsv: Xe
}), He = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function Qe(e, t) {
  return ye(Ye[t] || "");
}
function ye(e) {
  return e.replace(He, Qe);
}
const V = (e, t) => (t && t(e), e.vertexShader = ye(e.vertexShader), e.fragmentShader = ye(e.fragmentShader), e), Ze = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), c = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uBuffer: { value: C },
          uResolution: { value: new a.Vector2(0, 0) },
          uTexture: { value: C },
          uIsTexture: { value: !1 },
          uMap: { value: C },
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
      r
    ),
    ...I,
    // Must be transparent
    transparent: !0
  }), [r]), l = X(t, n);
  R(c)("uResolution", l.clone());
  const i = E(e, u, c, a.Mesh);
  return { material: c, mesh: i };
}, Je = (e, t) => {
  const n = t, r = e / t, [u, c] = [n * r / 2, n / 2];
  return { width: u, height: c, near: -1e3, far: 1e3 };
}, L = (e, t = "OrthographicCamera") => {
  const n = X(e), { width: r, height: u, near: c, far: l } = Je(
    n.x,
    n.y
  );
  return y(() => t === "OrthographicCamera" ? new a.OrthographicCamera(
    -r,
    r,
    u,
    -u,
    c,
    l
  ) : new a.PerspectiveCamera(50, r / u), [r, u, c, l, t]);
}, Se = (e = 0) => {
  const t = B(new a.Vector2(0, 0)), n = B(new a.Vector2(0, 0)), r = B(new a.Vector2(0, 0)), u = B(0), c = B(new a.Vector2(0, 0)), l = B(!1);
  return _(
    (d) => {
      const m = performance.now();
      let h;
      l.current && e ? (r.current = r.current.lerp(
        d,
        1 - e
      ), h = r.current.clone()) : (h = d.clone(), r.current = h), u.current === 0 && (u.current = m, t.current = h);
      const x = Math.max(1, m - u.current);
      u.current = m, c.current.copy(h).sub(t.current).divideScalar(x);
      const o = c.current.length() > 0, g = l.current ? t.current.clone() : h;
      return !l.current && o && (l.current = !0), t.current = h, {
        currentPointer: h,
        prevPointer: g,
        diffPointer: n.current.subVectors(h, g),
        velocity: c.current,
        isVelocityUpdate: o
      };
    },
    [e]
  );
}, $ = (e) => {
  const n = B(
    ((u) => Object.values(u).some((c) => typeof c == "function"))(e) ? e : structuredClone(e)
  ), r = _((u) => {
    if (u !== void 0)
      for (const c in u) {
        const l = c;
        l in n.current && u[l] !== void 0 && u[l] !== null ? n.current[l] = u[l] : console.error(
          `"${String(
            l
          )}" does not exist in the params. or "${String(
            l
          )}" is null | undefined`
        );
      }
  }, []);
  return [n.current, r];
}, he = {
  minFilter: a.LinearFilter,
  magFilter: a.LinearFilter,
  type: a.HalfFloatType,
  stencilBuffer: !1,
  depthBuffer: !1,
  samples: 0
}, Ce = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: u,
  onSwap: c
}) => {
  e.setRenderTarget(t), u(), e.clear(), e.render(n, r), c && c(), e.setRenderTarget(null), e.clear();
}, j = (e) => {
  var x;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: u = !1,
    isSizeUpdate: c = !1,
    depth: l = !1,
    ...i
  } = e, d = B(), m = X(r, u);
  d.current = y(
    () => {
      const o = new a.WebGLRenderTarget(
        m.x,
        m.y,
        {
          ...he,
          ...i
        }
      );
      return l && (o.depthTexture = new a.DepthTexture(
        m.x,
        m.y,
        a.FloatType
      )), o;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), c && ((x = d.current) == null || x.setSize(m.x, m.y)), ae(() => {
    const o = d.current;
    return () => {
      o == null || o.dispose();
    };
  }, []);
  const h = _(
    (o, g) => {
      const s = d.current;
      return Ce({
        gl: o,
        fbo: s,
        scene: t,
        camera: n,
        onBeforeRender: () => g && g({ read: s.texture })
      }), s.texture;
    },
    [t, n]
  );
  return [d.current, h];
}, se = (e) => {
  var x, o;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: u = !1,
    isSizeUpdate: c = !1,
    depth: l = !1,
    ...i
  } = e, d = X(r, u), m = y(() => {
    const g = new a.WebGLRenderTarget(d.x, d.y, {
      ...he,
      ...i
    }), s = new a.WebGLRenderTarget(d.x, d.y, {
      ...he,
      ...i
    });
    return l && (g.depthTexture = new a.DepthTexture(
      d.x,
      d.y,
      a.FloatType
    ), s.depthTexture = new a.DepthTexture(
      d.x,
      d.y,
      a.FloatType
    )), {
      read: g,
      write: s,
      swap: function() {
        let v = this.read;
        this.read = this.write, this.write = v;
      }
    };
  }, []);
  c && ((x = m.read) == null || x.setSize(d.x, d.y), (o = m.write) == null || o.setSize(d.x, d.y)), ae(() => {
    const g = m;
    return () => {
      var s, v;
      (s = g.read) == null || s.dispose(), (v = g.write) == null || v.dispose();
    };
  }, [m]);
  const h = _(
    (g, s) => {
      var p;
      const v = m;
      return Ce({
        gl: g,
        scene: t,
        camera: n,
        fbo: v.write,
        onBeforeRender: () => s && s({
          read: v.read.texture,
          write: v.write.texture
        }),
        onSwap: () => v.swap()
      }), (p = v.read) == null ? void 0 : p.texture;
    },
    [t, n, m]
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
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Ze({
    scene: l,
    size: e,
    dpr: c.shader,
    onBeforeInit: u
  }), m = L(e), h = Se(), [x, o] = se({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [g, s] = $(ne), v = B(null), p = R(i), w = F(i), b = _(
    (M, S) => {
      s(M), w(S);
    },
    [s, w]
  );
  return [
    _(
      (M, S, D) => {
        const { gl: A, pointer: z } = M;
        b(S, D), g.texture ? (p("uIsTexture", !0), p("uTexture", g.texture)) : p("uIsTexture", !1), g.map ? (p("uIsMap", !0), p("uMap", g.map), p("uMapIntensity", g.mapIntensity)) : p("uIsMap", !1), p("uRadius", g.radius), p("uSmudge", g.smudge), p("uDissipation", g.dissipation), p("uMotionBlur", g.motionBlur), p("uMotionSample", g.motionSample);
        const P = g.pointerValues || h(z);
        P.isVelocityUpdate && (p("uMouse", P.currentPointer), p("uPrevMouse", P.prevPointer)), p("uVelocity", P.velocity);
        const q = typeof g.color == "function" ? g.color(P.velocity) : g.color;
        return p("uColor", q), p("uIsCursor", g.isCursor), p("uPressureEnd", g.pressure), v.current === null && (v.current = g.pressure), p("uPressureStart", v.current), v.current = g.pressure, o(A, ({ read: T }) => {
          p("uBuffer", T);
        });
      },
      [p, h, o, g, b]
    ),
    b,
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
var Z = `varying vec2 vUv;
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
}`, et = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const tt = () => y(() => new a.ShaderMaterial({
  vertexShader: Z,
  fragmentShader: et,
  ...I
}), []);
var nt = `precision highp float;

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
const rt = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: C },
        uSource: { value: C },
        texelSize: { value: new a.Vector2() },
        dt: { value: Ve },
        dissipation: { value: 0 }
      },
      vertexShader: Z,
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
const at = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
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
const ut = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: it
    },
    e
  ),
  ...I
}), [e]);
var st = `precision highp float;

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
const lt = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: st
    },
    e
  ),
  ...I
}), [e]);
var ct = `precision highp float;

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
const vt = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: 0 },
        dt: { value: Ve },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: ct
    },
    e
  ),
  ...I
}), [e]);
var mt = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const pt = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTexture: { value: C },
        value: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: mt
    },
    e
  ),
  ...I
}), [e]);
var dt = `precision highp float;

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
const ft = ({
  onBeforeInit: e
}) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: C },
        uVelocity: { value: C },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: dt
    },
    e
  ),
  ...I
}), [e]);
var gt = `precision highp float;

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
const ht = ({ onBeforeInit: e }) => y(() => new a.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTarget: { value: C },
        aspectRatio: { value: 0 },
        color: { value: new a.Vector3() },
        point: { value: new a.Vector2() },
        radius: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: Z,
      fragmentShader: gt
    },
    e
  ),
  ...I
}), [e]), Y = (e, t) => e(t ?? {}), xt = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), {
    curl: c,
    vorticity: l,
    advection: i,
    divergence: d,
    pressure: m,
    clear: h,
    gradientSubtract: x,
    splat: o
  } = r ?? {}, g = Y(tt), s = g.clone(), v = Y(lt, c), p = Y(vt, l), w = Y(rt, i), b = Y(
    at,
    d
  ), f = Y(ut, m), M = Y(pt, h), S = Y(
    ft,
    x
  ), D = Y(ht, o), A = y(
    () => ({
      vorticityMaterial: p,
      curlMaterial: v,
      advectionMaterial: w,
      divergenceMaterial: b,
      pressureMaterial: f,
      clearMaterial: M,
      gradientSubtractMaterial: S,
      splatMaterial: D
    }),
    [
      p,
      v,
      w,
      b,
      f,
      M,
      S,
      D
    ]
  ), z = X(t, n);
  y(() => {
    R(A.splatMaterial)(
      "aspectRatio",
      z.x / z.y
    );
    for (const T of Object.values(A))
      R(T)(
        "texelSize",
        new a.Vector2(1 / z.x, 1 / z.y)
      );
  }, [z, A]);
  const P = E(e, u, g, a.Mesh);
  y(() => {
    g.dispose(), P.material = s;
  }, [g, P, s]), ae(() => () => {
    for (const T of Object.values(A))
      T.dispose();
  }, [A]);
  const q = _(
    (T) => {
      P.material = T, P.material.needsUpdate = !0;
    },
    [P]
  );
  return { materials: A, setMeshMaterial: q, mesh: P };
}, Ve = 0.016, yt = Object.freeze({
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  velocityAcceleration: 10,
  pressureDissipation: 0.9,
  pressureIterations: 20,
  curlStrength: 35,
  splatRadius: 2e-3,
  fluidColor: new a.Vector3(1, 1, 1),
  pointerValues: !1
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  customFluidProps: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { materials: i, setMeshMaterial: d, mesh: m } = xt({
    scene: l,
    size: e,
    dpr: c.shader,
    customFluidProps: u
  }), h = L(e), x = Se(), o = y(
    () => ({
      scene: l,
      camera: h,
      dpr: c.fbo,
      size: e,
      samples: n,
      isSizeUpdate: r
    }),
    [l, h, e, n, c.fbo, r]
  ), [g, s] = se(o), [v, p] = se(o), [w, b] = j(o), [f, M] = j(o), [S, D] = se(o), A = B(new a.Vector2(0, 0)), z = B(new a.Vector3(0, 0, 0)), [P, q] = $(yt), T = y(
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
  ), k = y(
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
  ), K = _(
    (ee, te) => {
      q(ee), te && Object.keys(te).forEach((ie) => {
        k[ie](
          te[ie]
        );
      });
    },
    [q, k]
  );
  return [
    _(
      (ee, te, ie) => {
        const { gl: G, pointer: Ie, size: _e } = ee;
        K(te, ie);
        const xe = s(G, ({ read: N }) => {
          d(i.advectionMaterial), T.advection("uVelocity", N), T.advection("uSource", N), T.advection(
            "dissipation",
            P.velocityDissipation
          );
        }), ze = p(G, ({ read: N }) => {
          d(i.advectionMaterial), T.advection("uVelocity", xe), T.advection("uSource", N), T.advection(
            "dissipation",
            P.densityDissipation
          );
        }), pe = P.pointerValues || x(Ie);
        pe.isVelocityUpdate && (s(G, ({ read: N }) => {
          d(i.splatMaterial), T.splat("uTarget", N), T.splat("point", pe.currentPointer);
          const le = pe.diffPointer.multiply(
            A.current.set(_e.width, _e.height).multiplyScalar(P.velocityAcceleration)
          );
          T.splat(
            "color",
            z.current.set(le.x, le.y, 1)
          ), T.splat("radius", P.splatRadius);
        }), p(G, ({ read: N }) => {
          d(i.splatMaterial), T.splat("uTarget", N);
          const le = typeof P.fluidColor == "function" ? P.fluidColor(pe.velocity) : P.fluidColor;
          T.splat("color", le);
        }));
        const Ue = b(G, () => {
          d(i.curlMaterial), T.curl("uVelocity", xe);
        });
        s(G, ({ read: N }) => {
          d(i.vorticityMaterial), T.vorticity("uVelocity", N), T.vorticity("uCurl", Ue), T.vorticity("curl", P.curlStrength);
        });
        const Oe = M(G, () => {
          d(i.divergenceMaterial), T.divergence("uVelocity", xe);
        });
        D(G, ({ read: N }) => {
          d(i.clearMaterial), T.clear("uTexture", N), T.clear("value", P.pressureDissipation);
        }), d(i.pressureMaterial), T.pressure("uDivergence", Oe);
        let we;
        for (let N = 0; N < P.pressureIterations; N++)
          we = D(G, ({ read: le }) => {
            T.pressure("uPressure", le);
          });
        return s(G, ({ read: N }) => {
          d(i.gradientSubtractMaterial), T.gradientSubtract("uPressure", we), T.gradientSubtract("uVelocity", N);
        }), ze;
      },
      [
        i,
        T,
        d,
        b,
        p,
        M,
        x,
        D,
        s,
        P,
        K
      ]
    ),
    K,
    {
      scene: l,
      mesh: m,
      materials: i,
      camera: h,
      renderTarget: {
        velocity: g,
        density: v,
        curl: w,
        divergence: f,
        pressure: S
      },
      output: v.read.texture
    }
  ];
};
var bt = "#usf <defaultVertex>", Mt = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const St = ({
  scale: e,
  max: t,
  texture: n,
  scene: r,
  onBeforeInit: u
}) => {
  const c = y(
    () => new a.PlaneGeometry(e, e),
    [e]
  ), l = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uOpacity: { value: 0 },
          uMap: { value: n || C }
        },
        vertexShader: bt,
        fragmentShader: Mt
      },
      u
    ),
    blending: a.AdditiveBlending,
    ...I,
    // Must be transparent.
    transparent: !0
  }), [n, u]), i = y(() => {
    const d = [];
    for (let m = 0; m < t; m++) {
      const h = l.clone(), x = new a.Mesh(c.clone(), h);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, r.add(x), d.push(x);
    }
    return d;
  }, [c, l, r, t]);
  return ae(() => () => {
    i.forEach((d) => {
      d.geometry.dispose(), Array.isArray(d.material) ? d.material.forEach((m) => m.dispose()) : d.material.dispose(), r.remove(d);
    });
  }, [r, i]), i;
}, Ct = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeoutSpeed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), Jn = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: r,
  dpr: u,
  samples: c,
  isSizeUpdate: l,
  onBeforeInit: i
}) => {
  const d = U(u), m = y(() => new a.Scene(), []), h = St({
    scale: t,
    max: n,
    texture: e,
    scene: m,
    onBeforeInit: i
  }), x = L(r), o = Se(), [g, s] = j({
    scene: m,
    camera: x,
    size: r,
    dpr: d.fbo,
    samples: c,
    isSizeUpdate: l
  }), [v, p] = $(Ct), w = B(0), b = y(() => (M, S) => {
    p(M), h.forEach((D) => {
      if (D.visible) {
        const A = D.material;
        D.rotation.z += v.rotation, D.scale.x = v.fadeoutSpeed * D.scale.x + v.scale, D.scale.y = D.scale.x;
        const z = A.uniforms.uOpacity.value;
        R(A)("uOpacity", z * v.fadeoutSpeed), z < 1e-3 && (D.visible = !1);
      }
      F(D.material)(S);
    });
  }, [h, v, p]);
  return [
    _(
      (M, S, D) => {
        const { gl: A, pointer: z, size: P } = M;
        b(S, D);
        const q = v.pointerValues || o(z);
        if (v.frequency < q.diffPointer.length()) {
          const T = h[w.current], k = T.material;
          T.visible = !0, T.position.set(
            q.currentPointer.x * (P.width / 2),
            q.currentPointer.y * (P.height / 2),
            0
          ), T.scale.x = T.scale.y = 0, R(k)("uOpacity", v.alpha), w.current = (w.current + 1) % n;
        }
        return s(A);
      },
      [s, h, o, n, v, b]
    ),
    b,
    {
      scene: m,
      camera: x,
      meshArr: h,
      renderTarget: g,
      output: g.texture
    }
  ];
};
var _t = "#usf <planeVertex>", wt = `precision highp float;
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
const Tt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
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
        vertexShader: _t,
        fragmentShader: wt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, re = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new a.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Tt({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(re), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S, clock: D } = b;
        return p(f, M), s("scale", o.scale), s("timeStrength", o.timeStrength), s("noiseOctaves", o.noiseOctaves), s("fbmOctaves", o.fbmOctaves), s("warpOctaves", o.warpOctaves), s("warpDirection", o.warpDirection), s("warpStrength", o.warpStrength), s("uTime", o.beat || D.getElapsedTime()), x(S);
      },
      [x, s, o, p]
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
var Dt = "#usf <planeVertex>", Pt = `precision highp float;
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
const Rt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          isTexture: { value: !1 },
          scale: { value: H.scale },
          noise: { value: C },
          noiseStrength: { value: H.noiseStrength },
          isNoise: { value: !1 },
          laminateLayer: { value: H.laminateLayer },
          laminateInterval: {
            value: H.laminateInterval
          },
          laminateDetail: { value: H.laminateDetail },
          distortion: { value: H.distortion },
          colorFactor: { value: H.colorFactor },
          uTime: { value: 0 },
          timeStrength: { value: H.timeStrength }
        },
        vertexShader: Dt,
        fragmentShader: Pt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, H = Object.freeze({
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
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Rt({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(H), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S, clock: D } = b;
        return p(f, M), o.texture ? (s("uTexture", o.texture), s("isTexture", !0)) : (s("isTexture", !1), s("scale", o.scale)), o.noise ? (s("noise", o.noise), s("isNoise", !0), s("noiseStrength", o.noiseStrength)) : s("isNoise", !1), s("uTime", o.beat || D.getElapsedTime()), s("laminateLayer", o.laminateLayer), s("laminateInterval", o.laminateInterval), s("laminateDetail", o.laminateDetail), s("distortion", o.distortion), s("colorFactor", o.colorFactor), s("timeStrength", o.timeStrength), x(S);
      },
      [x, s, o, p]
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
var Vt = "#usf <planeVertex>", At = `precision highp float;

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
const Ft = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
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
        vertexShader: Vt,
        fragmentShader: At
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, ue = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Ft({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(ue), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S, clock: D } = b;
        return p(f, M), s("u_pattern", o.pattern), s("u_complexity", o.complexity), s("u_complexityAttenuation", o.complexityAttenuation), s("u_iterations", o.iterations), s("u_timeStrength", o.timeStrength), s("u_scale", o.scale), s("u_time", o.beat || D.getElapsedTime()), x(S);
      },
      [x, s, o, p]
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
var It = "#usf <planeVertex>", zt = `precision highp float;
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
const Ut = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uRgbWeight: { value: ce.rgbWeight },
          uColor1: { value: ce.color1 },
          uColor2: { value: ce.color2 },
          uColor3: { value: ce.color3 },
          uColor4: { value: ce.color4 }
        },
        vertexShader: It,
        fragmentShader: zt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, ce = Object.freeze({
  texture: C,
  color1: new a.Color().set(0.5, 0.5, 0.5),
  color2: new a.Color().set(0.5, 0.5, 0.5),
  color3: new a.Color().set(1, 1, 1),
  color4: new a.Color().set(0, 0.1, 0.2),
  rgbWeight: new a.Vector3(0.299, 0.587, 0.114)
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Ut({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(ce), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("uTexture", o.texture), s("uColor1", o.color1), s("uColor2", o.color2), s("uColor3", o.color3), s("uColor4", o.color4), s("uRgbWeight", o.rgbWeight), x(S);
      },
      [x, s, o, p]
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
var Ot = "#usf <planeVertex>", Bt = `precision highp float;

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
const Et = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uColor0: { value: be.color0 },
          uColor1: { value: be.color1 }
        },
        vertexShader: Ot,
        fragmentShader: Bt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, be = Object.freeze({
  texture: C,
  color0: new a.Color(16777215),
  color1: new a.Color(0)
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Et({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(be), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("uTexture", o.texture), s("uColor0", o.color0), s("uColor1", o.color1), x(S);
      },
      [x, s, o, p]
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
var Lt = "#usf <planeVertex>", $t = `precision highp float;

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
const qt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: C },
          uMap: { value: C },
          u_alphaMap: { value: C },
          u_isAlphaMap: { value: !1 },
          uMapIntensity: { value: ve.mapIntensity },
          u_brightness: { value: ve.brightness },
          u_min: { value: ve.min },
          u_max: { value: ve.max },
          u_dodgeColor: { value: new a.Color() },
          u_isDodgeColor: { value: !1 }
        },
        vertexShader: Lt,
        fragmentShader: $t
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, ve = Object.freeze({
  texture: C,
  map: C,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = qt({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(ve), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("u_texture", o.texture), s("uMap", o.map), s("uMapIntensity", o.mapIntensity), o.alphaMap ? (s("u_alphaMap", o.alphaMap), s("u_isAlphaMap", !0)) : s("u_isAlphaMap", !1), s("u_brightness", o.brightness), s("u_min", o.min), s("u_max", o.max), o.dodgeColor ? (s("u_dodgeColor", o.dodgeColor), s("u_isDodgeColor", !0)) : s("u_isDodgeColor", !1), x(S);
      },
      [x, s, o, p]
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
var jt = "#usf <planeVertex>", Wt = `precision highp float;

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
const Nt = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), c = y(() => {
    var m, h;
    return new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new a.Vector2() },
            uTextureResolution: { value: new a.Vector2() },
            uTexture0: { value: C },
            uTexture1: { value: C },
            padding: { value: oe.padding },
            uMap: { value: C },
            edgeIntensity: { value: oe.edgeIntensity },
            mapIntensity: { value: oe.mapIntensity },
            epicenter: { value: oe.epicenter },
            progress: { value: oe.progress },
            dirX: { value: (m = oe.dir) == null ? void 0 : m.x },
            dirY: { value: (h = oe.dir) == null ? void 0 : h.y }
          },
          vertexShader: jt,
          fragmentShader: Wt
        },
        r
      ),
      ...I
    });
  }, [r]), l = X(t, n);
  R(c)("uResolution", l.clone());
  const i = E(e, u, c, a.Mesh);
  return { material: c, mesh: i };
}, oe = Object.freeze({
  texture0: C,
  texture1: C,
  padding: 0,
  map: C,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  dir: new a.Vector2(0, 0)
}), ir = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Nt({
    scene: l,
    size: e,
    dpr: c.shader,
    onBeforeInit: u
  }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    dpr: c.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(oe), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        var P, q, T, k, K, J, ee, te;
        const { gl: S } = b;
        p(f, M), s("uTexture0", o.texture0), s("uTexture1", o.texture1), s("progress", o.progress);
        const D = [
          ((q = (P = o.texture0) == null ? void 0 : P.image) == null ? void 0 : q.width) || 0,
          ((k = (T = o.texture0) == null ? void 0 : T.image) == null ? void 0 : k.height) || 0
        ], A = [
          ((J = (K = o.texture1) == null ? void 0 : K.image) == null ? void 0 : J.width) || 0,
          ((te = (ee = o.texture1) == null ? void 0 : ee.image) == null ? void 0 : te.height) || 0
        ], z = D.map((ie, G) => ie + (A[G] - ie) * o.progress);
        return s("uTextureResolution", z), s("padding", o.padding), s("uMap", o.map), s("mapIntensity", o.mapIntensity), s("edgeIntensity", o.edgeIntensity), s("epicenter", o.epicenter), s("dirX", o.dir.x), s("dirY", o.dir.y), x(S);
      },
      [x, s, o, p]
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
var kt = "#usf <planeVertex>", Gt = `precision highp float;

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
const Kt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: C },
          u_brightness: { value: de.brightness },
          u_min: { value: de.min },
          u_max: { value: de.max }
        },
        vertexShader: kt,
        fragmentShader: Gt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, de = Object.freeze({
  texture: C,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), ur = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Kt({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(
    de
  ), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("u_texture", o.texture), s("u_brightness", o.brightness), s("u_min", o.min), s("u_max", o.max), x(S);
      },
      [x, s, o, p]
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
var Xt = "#usf <planeVertex>", Yt = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;
const Ht = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: C },
          uMap: { value: C },
          uMapIntensity: { value: Ae.mapIntensity }
        },
        vertexShader: Xt,
        fragmentShader: Yt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Ae = Object.freeze({
  texture: C,
  map: C,
  mapIntensity: 0.3
}), sr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Ht({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(Ae), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("u_texture", o.texture), s("uMap", o.map), s("uMapIntensity", o.mapIntensity), x(S);
      },
      [x, s, o, p]
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
var Qt = "#usf <planeVertex>", Zt = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Jt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uMap: { value: C }
        },
        vertexShader: Qt,
        fragmentShader: Zt
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, en = Object.freeze({
  texture: C,
  map: C
}), lr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Jt({
    scene: l,
    size: e,
    onBeforeInit: u
  }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(en), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("uTexture", o.texture), s("uMap", o.map), x(S);
      },
      [s, x, o, p]
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
var tn = "#usf <planeVertex>", nn = `precision highp float;

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
}`;
const rn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: C },
          u_brightness: { value: Me.brightness },
          u_saturation: { value: Me.saturation }
        },
        vertexShader: tn,
        fragmentShader: nn
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Me = Object.freeze({
  texture: C,
  brightness: 1,
  saturation: 1
}), cr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = rn({
    scene: l,
    size: e,
    onBeforeInit: u
  }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(Me), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("u_texture", o.texture), s("u_brightness", o.brightness), s("u_saturation", o.saturation), x(S);
      },
      [s, x, o, p]
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
var on = "#usf <planeVertex>", an = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;
const un = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), c = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uResolution: { value: new a.Vector2() },
          uTextureResolution: { value: new a.Vector2() },
          uTexture: { value: C }
        },
        vertexShader: on,
        fragmentShader: an
      },
      r
    ),
    ...I
  }), [r]), l = X(t, n);
  R(c)("uResolution", l.clone());
  const i = E(e, u, c, a.Mesh);
  return { material: c, mesh: i };
}, sn = Object.freeze({
  texture: C
}), vr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = un({
    scene: l,
    size: e,
    dpr: c.shader,
    onBeforeInit: u
  }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    dpr: c.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(sn), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        var D, A, z, P, q, T;
        const { gl: S } = b;
        return p(f, M), s("uTexture", o.texture), s("uTextureResolution", [
          ((z = (A = (D = o.texture) == null ? void 0 : D.source) == null ? void 0 : A.data) == null ? void 0 : z.width) || 0,
          ((T = (q = (P = o.texture) == null ? void 0 : P.source) == null ? void 0 : q.data) == null ? void 0 : T.height) || 0
        ]), x(S);
      },
      [x, s, o, p]
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
var ln = "#usf <planeVertex>", cn = `precision highp float;

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
const vn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uResolution: { value: new a.Vector2(0, 0) },
          uBlurSize: { value: Fe.blurSize }
        },
        vertexShader: ln,
        fragmentShader: cn
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Fe = Object.freeze({
  texture: C,
  blurSize: 3,
  blurPower: 5
}), mr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = vn({ scene: l, onBeforeInit: u }), m = L(e), h = y(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: c.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [l, m, e, c.fbo, n, r]
  ), [x, o] = se(h), [g, s] = $(Fe), v = R(i), p = F(i), w = _(
    (f, M) => {
      s(f), p(M);
    },
    [s, p]
  );
  return [
    _(
      (f, M, S) => {
        var z, P, q, T, k, K;
        const { gl: D } = f;
        w(M, S), v("uTexture", g.texture), v("uResolution", [
          ((q = (P = (z = g.texture) == null ? void 0 : z.source) == null ? void 0 : P.data) == null ? void 0 : q.width) || 0,
          ((K = (k = (T = g.texture) == null ? void 0 : T.source) == null ? void 0 : k.data) == null ? void 0 : K.height) || 0
        ]), v("uBlurSize", g.blurSize);
        let A = o(D);
        for (let J = 0; J < g.blurPower; J++)
          v("uTexture", A), A = o(D);
        return A;
      },
      [o, v, g, w]
    ),
    w,
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
var mn = "#usf <planeVertex>", pn = `precision highp float;

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
const dn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uBackbuffer: { value: C },
          uBegin: { value: fe.begin },
          uEnd: { value: fe.end },
          uStrength: { value: fe.strength }
        },
        vertexShader: mn,
        fragmentShader: pn
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, fe = Object.freeze({
  texture: C,
  begin: new a.Vector2(0, 0),
  end: new a.Vector2(0, 0),
  strength: 0.9
}), pr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = dn({ scene: l, onBeforeInit: u }), m = L(e), h = y(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: c.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [l, m, e, c.fbo, n, r]
  ), [x, o] = se(h), [g, s] = $(fe), v = R(i), p = F(i), w = _(
    (f, M) => {
      s(f), p(M);
    },
    [s, p]
  );
  return [
    _(
      (f, M, S) => {
        const { gl: D } = f;
        return w(M, S), v("uTexture", g.texture), v("uBegin", g.begin), v("uEnd", g.end), v("uStrength", g.strength), o(D, ({ read: A }) => {
          v("uBackbuffer", A);
        });
      },
      [o, v, w, g]
    ),
    w,
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
var fn = "#usf <planeVertex>", gn = `precision highp float;

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
const hn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new a.PlaneGeometry(2, 2), []), r = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uEpicenter: { value: me.epicenter },
          uProgress: { value: me.progress },
          uStrength: { value: me.strength },
          uWidth: { value: me.width },
          uMode: { value: 0 }
        },
        vertexShader: fn,
        fragmentShader: gn
      },
      t
    ),
    ...I
  }), [t]), u = E(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, me = Object.freeze({
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), dr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = hn({ scene: l, onBeforeInit: u }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(me), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("uEpicenter", o.epicenter), s("uProgress", o.progress), s("uWidth", o.width), s("uStrength", o.strength), s(
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), x(S);
      },
      [x, s, o, p]
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
var xn = "#usf <planeVertex>", yn = `precision highp float;
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
const bn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), c = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: C },
          u_resolution: { value: new a.Vector2() },
          u_keyColor: { value: Q.color },
          u_similarity: { value: Q.similarity },
          u_smoothness: { value: Q.smoothness },
          u_spill: { value: Q.spill },
          u_color: { value: Q.color },
          u_contrast: { value: Q.contrast },
          u_brightness: { value: Q.brightness },
          u_gamma: { value: Q.gamma }
        },
        vertexShader: xn,
        fragmentShader: yn
      },
      r
    ),
    ...I
  }), [r]), l = X(t, n);
  R(c)("u_resolution", l.clone());
  const i = E(e, u, c, a.Mesh);
  return { material: c, mesh: i };
}, Q = Object.freeze({
  texture: C,
  keyColor: new a.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new a.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), fr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = bn({
    scene: l,
    size: e,
    dpr: c.shader,
    onBeforeInit: u
  }), m = L(e), [h, x] = j({
    scene: l,
    camera: m,
    size: e,
    dpr: c.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = $(Q), s = R(i), v = F(i), p = _(
    (b, f) => {
      g(b), v(f);
    },
    [g, v]
  );
  return [
    _(
      (b, f, M) => {
        const { gl: S } = b;
        return p(f, M), s("u_texture", o.texture), s("u_keyColor", o.keyColor), s("u_similarity", o.similarity), s("u_smoothness", o.smoothness), s("u_spill", o.spill), s("u_color", o.color), s("u_contrast", o.contrast), s("u_brightness", o.brightness), s("u_gamma", o.gamma), x(S);
      },
      [x, s, o, p]
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
var Mn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`, Sn = `precision highp float;

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
const Cn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = y(() => new a.PlaneGeometry(2, 2), []), c = y(() => new a.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: C },
          uBackbuffer: { value: C },
          uTime: { value: 0 },
          uPointer: { value: new a.Vector2() },
          uResolution: { value: new a.Vector2() }
        },
        vertexShader: Mn,
        fragmentShader: Sn
      },
      r
    ),
    ...I
  }), [r]), l = X(t, n);
  R(c)("uResolution", l.clone());
  const i = E(e, u, c, a.Mesh);
  return { material: c, mesh: i };
}, _n = Object.freeze({
  texture: C,
  beat: !1
}), gr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  onBeforeInit: u
}) => {
  const c = U(t), l = y(() => new a.Scene(), []), { material: i, mesh: d } = Cn({
    scene: l,
    size: e,
    dpr: c.shader,
    onBeforeInit: u
  }), m = L(e), h = y(
    () => ({
      scene: l,
      camera: m,
      size: e,
      dpr: c.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [l, m, e, c.fbo, n, r]
  ), [x, o] = se(h), [g, s] = $(_n), v = R(i), p = F(i), w = _(
    (f, M) => {
      s(f), p(M);
    },
    [s, p]
  );
  return [
    _(
      (f, M, S) => {
        const { gl: D, clock: A, pointer: z } = f;
        return w(M, S), v("uPointer", z), v("uTexture", g.texture), v("uTime", g.beat || A.getElapsedTime()), o(D, ({ read: P }) => {
          v("uBackbuffer", P);
        });
      },
      [o, v, g, w]
    ),
    w,
    {
      scene: l,
      mesh: d,
      material: i,
      camera: m,
      renderTarget: x,
      output: x.read.texture
    }
  ];
}, wn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = E(
    e,
    t,
    n,
    a.Points
  ), u = E(
    e,
    y(() => t.clone(), [t]),
    y(() => n.clone(), [n]),
    a.Mesh
  );
  return u.visible = !1, {
    points: r,
    interactiveMesh: u
  };
};
var Tn = `uniform vec2 uResolution;
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
}`, Dn = `precision highp float;
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
const Te = (e, t, n, r, u) => {
  var h;
  const c = n === "position" ? "positionTarget" : "uvTarget", l = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", i = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", d = n === "position" ? "positionsList" : "uvsList", m = n === "position" ? `
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
      new a.BufferAttribute(e[0], u)
    );
    let x = "", o = "";
    e.forEach((g, s) => {
      t.setAttribute(
        `${c}${s}`,
        new a.BufferAttribute(g, u)
      ), x += `attribute vec${u} ${c}${s};
`, s === 0 ? o += `${c}${s}` : o += `,${c}${s}`;
    }), r = r.replace(
      `${l}`,
      x
    ), r = r.replace(
      `${i}`,
      `vec${u} ${d}[${e.length}] = vec${u}[](${o});
				${m}
			`
    );
  } else
    r = r.replace(`${l}`, ""), r = r.replace(`${i}`, ""), (h = t == null ? void 0 : t.attributes[n]) != null && h.array || Re && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, De = (e, t, n, r) => {
  var c;
  let u = [];
  if (e && e.length > 0) {
    (c = t == null ? void 0 : t.attributes[n]) != null && c.array ? u = [
      t.attributes[n].array,
      ...e
    ] : u = e;
    const l = Math.max(...u.map((i) => i.length));
    u.forEach((i, d) => {
      if (i.length < l) {
        const m = (l - i.length) / r, h = [], x = Array.from(i);
        for (let o = 0; o < m; o++) {
          const g = Math.floor(i.length / r * Math.random()) * r;
          for (let s = 0; s < r; s++)
            h.push(x[g + s]);
        }
        u[d] = new Float32Array([...x, ...h]);
      }
    });
  }
  return u;
}, Pn = (e, t) => {
  let n = "";
  const r = {};
  let u = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((l, i) => {
    const d = `vMapArrayIndex < ${i}.1`, m = `texture2D(uMapArray${i}, uv)`;
    u += `( ${d} ) ? ${m} : `, n += `
        uniform sampler2D uMapArray${i};
      `, r[`uMapArray${i}`] = { value: l };
  }), u += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (u += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", u).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, Rn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: u,
  mapArray: c,
  onBeforeInit: l
}) => {
  const i = y(
    () => De(r, n, "position", 3),
    [r, n]
  ), d = y(
    () => De(u, n, "uv", 2),
    [u, n]
  ), m = y(() => {
    i.length !== d.length && Re && console.log("use-shader-fx:positions and uvs are not matched");
    const x = Te(
      d,
      n,
      "uv",
      Te(
        i,
        n,
        "position",
        Tn,
        3
      ),
      2
    ), { rewritedFragmentShader: o, mapArrayUniforms: g } = Pn(c, Dn);
    return new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new a.Vector2(0, 0) },
            uMorphProgress: {
              value: O.morphProgress
            },
            uBlurAlpha: { value: O.blurAlpha },
            uBlurRadius: { value: O.blurRadius },
            uPointSize: { value: O.pointSize },
            uPointAlpha: { value: O.pointAlpha },
            uPicture: { value: C },
            uIsPicture: { value: !1 },
            uAlphaPicture: { value: C },
            uIsAlphaPicture: { value: !1 },
            uColor0: { value: O.color0 },
            uColor1: { value: O.color1 },
            uColor2: { value: O.color2 },
            uColor3: { value: O.color3 },
            uMap: { value: C },
            uIsMap: { value: !1 },
            uAlphaMap: { value: C },
            uIsAlphaMap: { value: !1 },
            uTime: { value: 0 },
            uWobblePositionFrequency: {
              value: O.wobblePositionFrequency
            },
            uWobbleTimeFrequency: {
              value: O.wobbleTimeFrequency
            },
            uWobbleStrength: {
              value: O.wobbleStrength
            },
            uWarpPositionFrequency: {
              value: O.warpPositionFrequency
            },
            uWarpTimeFrequency: {
              value: O.warpTimeFrequency
            },
            uWarpStrength: { value: O.warpStrength },
            uDisplacement: { value: C },
            uIsDisplacement: { value: !1 },
            uDisplacementIntensity: {
              value: O.displacementIntensity
            },
            uDisplacementColorIntensity: {
              value: O.displacementColorIntensity
            },
            uSizeRandomIntensity: {
              value: O.sizeRandomIntensity
            },
            uSizeRandomTimeFrequency: {
              value: O.sizeRandomTimeFrequency
            },
            uSizeRandomMin: {
              value: O.sizeRandomMin
            },
            uSizeRandomMax: {
              value: O.sizeRandomMax
            },
            uDivergence: { value: O.divergence },
            uDivergencePoint: {
              value: O.divergencePoint
            },
            ...g
          },
          vertexShader: x,
          fragmentShader: o
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
    c,
    l
  ]), h = X(e, t);
  return R(m)("uResolution", h.clone()), { material: m, modifiedPositions: i, modifiedUvs: d };
}, Vn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: u,
  uvs: c,
  mapArray: l,
  onBeforeInit: i
}) => {
  const d = U(t), m = y(() => {
    const b = r || new a.SphereGeometry(1, 32, 32);
    return b.setIndex(null), b.deleteAttribute("normal"), b;
  }, [r]), { material: h, modifiedPositions: x, modifiedUvs: o } = Rn({
    size: e,
    dpr: d.shader,
    geometry: m,
    positions: u,
    uvs: c,
    mapArray: l,
    onBeforeInit: i
  }), { points: g, interactiveMesh: s } = wn({
    scene: n,
    geometry: m,
    material: h
  }), v = R(h), p = F(h);
  return [
    _(
      (b, f, M) => {
        b && v(
          "uTime",
          (f == null ? void 0 : f.beat) || b.clock.getElapsedTime()
        ), f !== void 0 && (v("uMorphProgress", f.morphProgress), v("uBlurAlpha", f.blurAlpha), v("uBlurRadius", f.blurRadius), v("uPointSize", f.pointSize), v("uPointAlpha", f.pointAlpha), f.picture ? (v("uPicture", f.picture), v("uIsPicture", !0)) : f.picture === !1 && v("uIsPicture", !1), f.alphaPicture ? (v("uAlphaPicture", f.alphaPicture), v("uIsAlphaPicture", !0)) : f.alphaPicture === !1 && v("uIsAlphaPicture", !1), v("uColor0", f.color0), v("uColor1", f.color1), v("uColor2", f.color2), v("uColor3", f.color3), f.map ? (v("uMap", f.map), v("uIsMap", !0)) : f.map === !1 && v("uIsMap", !1), f.alphaMap ? (v("uAlphaMap", f.alphaMap), v("uIsAlphaMap", !0)) : f.alphaMap === !1 && v("uIsAlphaMap", !1), v("uWobbleStrength", f.wobbleStrength), v(
          "uWobblePositionFrequency",
          f.wobblePositionFrequency
        ), v("uWobbleTimeFrequency", f.wobbleTimeFrequency), v("uWarpStrength", f.warpStrength), v("uWarpPositionFrequency", f.warpPositionFrequency), v("uWarpTimeFrequency", f.warpTimeFrequency), f.displacement ? (v("uDisplacement", f.displacement), v("uIsDisplacement", !0)) : f.displacement === !1 && v("uIsDisplacement", !1), v("uDisplacementIntensity", f.displacementIntensity), v(
          "uDisplacementColorIntensity",
          f.displacementColorIntensity
        ), v("uSizeRandomIntensity", f.sizeRandomIntensity), v(
          "uSizeRandomTimeFrequency",
          f.sizeRandomTimeFrequency
        ), v("uSizeRandomMin", f.sizeRandomMin), v("uSizeRandomMax", f.sizeRandomMax), v("uDivergence", f.divergence), v("uDivergencePoint", f.divergencePoint), p(M));
      },
      [v, p]
    ),
    {
      points: g,
      interactiveMesh: s,
      positions: x,
      uvs: o
    }
  ];
}, O = Object.freeze({
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
}), hr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: u,
  geometry: c,
  positions: l,
  uvs: i,
  onBeforeInit: d
}) => {
  const m = U(t), h = y(() => new a.Scene(), []), [
    x,
    {
      points: o,
      interactiveMesh: g,
      positions: s,
      uvs: v
    }
  ] = Vn({
    scene: h,
    size: e,
    dpr: t,
    geometry: c,
    positions: l,
    uvs: i,
    onBeforeInit: d
  }), [p, w] = j({
    scene: h,
    camera: u,
    size: e,
    dpr: m.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), b = _(
    (M, S, D) => (x(M, S, D), w(M.gl)),
    [w, x]
  ), f = _(
    (M, S) => {
      x(null, M, S);
    },
    [x]
  );
  return [
    b,
    f,
    {
      scene: h,
      points: o,
      interactiveMesh: g,
      renderTarget: p,
      output: p.texture,
      positions: s,
      uvs: v
    }
  ];
}, Pe = (e) => {
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
var Fn = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, In = `#ifdef USE_TRANSMISSION

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
const zn = ({
  mat: e,
  isCustomTransmission: t,
  parameters: n
}) => {
  e.type === "MeshPhysicalMaterial" && t && (n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_pars_fragment>",
    `${Fn}`
  ), n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_fragment>",
    `${In}`
  )), e.normalMap || (n.vertexShader = n.vertexShader.replace(
    "void main() {",
    `
				attribute vec4 tangent;
				
				void main() {
			`
  ));
}, Un = ({
  baseMaterial: e,
  materialParameters: t,
  isCustomTransmission: n = !1,
  onBeforeInit: r,
  depthOnBeforeInit: u
}) => {
  const { material: c, depthMaterial: l } = y(() => {
    const i = new (e || a.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(i.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: W.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: W.wobbleTimeFrequency
        },
        uWobbleStrength: { value: W.wobbleStrength },
        uWarpPositionFrequency: {
          value: W.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: W.warpTimeFrequency },
        uWarpStrength: { value: W.warpStrength },
        uColor0: { value: W.color0 },
        uColor1: { value: W.color1 },
        uColor2: { value: W.color2 },
        uColor3: { value: W.color3 },
        uColorMix: { value: W.colorMix },
        uEdgeThreshold: { value: W.edgeThreshold },
        uEdgeColor: { value: W.edgeColor },
        uChromaticAberration: {
          value: W.chromaticAberration
        },
        uAnisotropicBlur: { value: W.anisotropicBlur },
        uDistortion: { value: W.distortion },
        uDistortionScale: { value: W.distortionScale },
        uTemporalDistortion: { value: W.temporalDistortion },
        uRefractionSamples: { value: W.refractionSamples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null }
      }
    }), i.onBeforeCompile = (m) => {
      Pe(m), An(m), zn({
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
        r
      );
      m.fragmentShader = h.fragmentShader, m.vertexShader = h.vertexShader, Object.assign(m.uniforms, h.uniforms);
    }, i.needsUpdate = !0;
    const d = new a.MeshDepthMaterial({
      depthPacking: a.RGBADepthPacking
    });
    return d.onBeforeCompile = (m) => {
      Object.assign(m.uniforms, i.userData.uniforms), Pe(m), V(m, u);
    }, d.needsUpdate = !0, { material: i, depthMaterial: d };
  }, [
    t,
    e,
    r,
    u,
    n
  ]);
  return {
    material: c,
    depthMaterial: l
  };
}, On = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: u,
  onBeforeInit: c,
  depthOnBeforeInit: l
}) => {
  const i = y(() => {
    let v = t || new a.IcosahedronGeometry(2, 20);
    return v = Ee(v), v.computeTangents(), v;
  }, [t]), { material: d, depthMaterial: m } = Un({
    baseMaterial: r,
    materialParameters: u,
    isCustomTransmission: n,
    onBeforeInit: c,
    depthOnBeforeInit: l
  }), h = E(e, i, d, a.Mesh), x = d.userData, o = R(x), g = F(x);
  return [
    _(
      (v, p, w) => {
        v && o(
          "uTime",
          (p == null ? void 0 : p.beat) || v.clock.getElapsedTime()
        ), p !== void 0 && (o("uWobbleStrength", p.wobbleStrength), o(
          "uWobblePositionFrequency",
          p.wobblePositionFrequency
        ), o("uWobbleTimeFrequency", p.wobbleTimeFrequency), o("uWarpStrength", p.warpStrength), o("uWarpPositionFrequency", p.warpPositionFrequency), o("uWarpTimeFrequency", p.warpTimeFrequency), o("uColor0", p.color0), o("uColor1", p.color1), o("uColor2", p.color2), o("uColor3", p.color3), o("uColorMix", p.colorMix), o("uEdgeThreshold", p.edgeThreshold), o("uEdgeColor", p.edgeColor), o("uChromaticAberration", p.chromaticAberration), o("uAnisotropicBlur", p.anisotropicBlur), o("uDistortion", p.distortion), o("uDistortionScale", p.distortionScale), o("uRefractionSamples", p.refractionSamples), o("uTemporalDistortion", p.temporalDistortion), g(w));
      },
      [o, g]
    ),
    {
      mesh: h,
      depthMaterial: m
    }
  ];
}, W = Object.freeze({
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
}), xr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: u,
  geometry: c,
  baseMaterial: l,
  materialParameters: i,
  isCustomTransmission: d,
  onBeforeInit: m,
  depthOnBeforeInit: h
}) => {
  const x = U(t), o = y(() => new a.Scene(), []), [g, { mesh: s, depthMaterial: v }] = On({
    baseMaterial: l,
    materialParameters: i,
    scene: o,
    geometry: c,
    isCustomTransmission: d,
    onBeforeInit: m,
    depthOnBeforeInit: h
  }), [p, w] = j({
    scene: o,
    camera: u,
    size: e,
    dpr: x.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), b = _(
    (M, S, D) => (g(M, S, D), w(M.gl)),
    [w, g]
  ), f = _(
    (M, S) => {
      g(null, M, S);
    },
    [g]
  );
  return [
    b,
    f,
    {
      scene: o,
      mesh: s,
      depthMaterial: v,
      renderTarget: p,
      output: p.texture
    }
  ];
}, yr = (e, t, n) => {
  const r = y(() => {
    const u = new a.Mesh(t, n);
    return e.add(u), u;
  }, [t, n, e]);
  return ae(() => () => {
    e.remove(r), t.dispose(), n.dispose();
  }, [e, t, n, r]), r;
}, Bn = (e, t, n, r, u, c) => {
  const l = e < n - u || t < r - u, i = e > n + u || t > r + u;
  return c === "smaller" && l || c === "larger" && i || c === "both" && (l || i);
}, br = ({
  gl: e,
  size: t,
  boundFor: n,
  threshold: r
}) => {
  const u = B(t);
  return y(() => {
    const { width: l, height: i } = t, { width: d, height: m } = u.current, h = Bn(
      l,
      i,
      d,
      m,
      r,
      n
    ), x = Xn.getMaxDpr(e, t);
    return h && (u.current = t), {
      maxDpr: x,
      isUpdate: h
    };
  }, [t, e, n, r]);
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
function En(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const Mr = (e, t = "easeOutQuart") => {
  const n = e / 60, r = ge[t];
  return _(
    (c) => {
      let l = c.getElapsedTime() * n;
      const i = Math.floor(l), d = r(l - i);
      l = d + i;
      const m = En(i);
      return {
        beat: l,
        floor: i,
        fract: d,
        hash: m
      };
    },
    [n, r]
  );
}, Sr = (e = 60) => {
  const t = y(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = B(null);
  return _(
    (u) => {
      const c = u.getElapsedTime();
      return n.current === null || c - n.current >= t ? (n.current = c, !0) : !1;
    },
    [t]
  );
}, Ln = (e) => {
  var r, u;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (u = e.texture) == null ? void 0 : u.length;
  return !t || !n || t !== n;
};
var $n = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, qn = `precision highp float;

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
const jn = ({
  params: e,
  scene: t,
  onBeforeInit: n
}) => {
  t.children.length > 0 && (t.children.forEach((r) => {
    r instanceof a.Mesh && (r.geometry.dispose(), r.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((r, u) => {
    const c = new a.ShaderMaterial({
      ...V(
        {
          uniforms: {
            u_texture: { value: r },
            u_textureResolution: {
              value: new a.Vector2(0, 0)
            },
            u_resolution: { value: new a.Vector2(0, 0) },
            u_borderRadius: {
              value: e.boderRadius[u] ? e.boderRadius[u] : 0
            }
          },
          vertexShader: $n,
          fragmentShader: qn
        },
        n
      ),
      ...I,
      // Must be transparent.
      transparent: !0
    }), l = new a.Mesh(new a.PlaneGeometry(1, 1), c);
    t.add(l);
  });
}, Wn = () => {
  const e = B([]), t = B([]);
  return _(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: u,
      params: c
    }) => {
      e.current.length > 0 && e.current.forEach((i, d) => {
        i.unobserve(t.current[d]);
      }), t.current = [], e.current = [];
      const l = new Array(c.dom.length).fill(!1);
      r.current = [...l], u.current = [...l], c.dom.forEach((i, d) => {
        const m = (x) => {
          x.forEach((o) => {
            c.onIntersect[d] && c.onIntersect[d](o), r.current[d] = o.isIntersecting;
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
}, Nn = () => {
  const e = B([]), t = _(
    ({
      params: n,
      customParams: r,
      size: u,
      resolutionRef: c,
      scene: l,
      isIntersectingRef: i
    }) => {
      l.children.length !== e.current.length && (e.current = new Array(l.children.length)), l.children.forEach((d, m) => {
        var o, g, s, v, p, w;
        const h = n.dom[m];
        if (!h)
          return;
        const x = h.getBoundingClientRect();
        if (e.current[m] = x, d.scale.set(x.width, x.height, 1), d.position.set(
          x.left + x.width * 0.5 - u.width * 0.5,
          -x.top - x.height * 0.5 + u.height * 0.5,
          0
        ), i.current[m] && (n.rotation[m] && d.rotation.copy(n.rotation[m]), d instanceof a.Mesh)) {
          const b = d.material, f = R(b), M = F(b);
          f("u_texture", n.texture[m]), f("u_textureResolution", [
            ((s = (g = (o = n.texture[m]) == null ? void 0 : o.source) == null ? void 0 : g.data) == null ? void 0 : s.width) || 0,
            ((w = (p = (v = n.texture[m]) == null ? void 0 : v.source) == null ? void 0 : p.data) == null ? void 0 : w.height) || 0
          ]), f(
            "u_resolution",
            c.current.set(x.width, x.height)
          ), f(
            "u_borderRadius",
            n.boderRadius[m] ? n.boderRadius[m] : 0
          ), M(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, kn = () => {
  const e = B([]), t = B([]), n = _((r, u = !1) => {
    e.current.forEach((l, i) => {
      l && (t.current[i] = !0);
    });
    const c = u ? [...t.current] : [...e.current];
    return r < 0 ? c : c[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, Gn = (e) => ({ onView: n, onHidden: r }) => {
  const u = B(!1);
  ae(() => {
    let c;
    const l = () => {
      e.current.some((i) => i) ? u.current || (n && n(), u.current = !0) : u.current && (r && r(), u.current = !1), c = requestAnimationFrame(l);
    };
    return c = requestAnimationFrame(l), () => {
      cancelAnimationFrame(c);
    };
  }, [n, r]);
}, Kn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Cr = ({ size: e, dpr: t, samples: n, isSizeUpdate: r, onBeforeInit: u }, c = []) => {
  const l = U(t), i = y(() => new a.Scene(), []), d = L(e), [m, h] = j({
    scene: i,
    camera: d,
    size: e,
    dpr: l.fbo,
    samples: n,
    isSizeUpdate: r
  }), [x, o] = $({
    ...Kn,
    updateKey: performance.now()
  }), [g, s] = Nn(), v = B(new a.Vector2(0, 0)), [p, w] = Be(!0);
  y(
    () => w(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    c
  );
  const b = B(null), f = y(() => C, []), M = Wn(), { isIntersectingOnceRef: S, isIntersectingRef: D, isIntersecting: A } = kn(), z = Gn(D), P = y(() => (T, k) => {
    o(T), s({
      params: x,
      customParams: k,
      size: e,
      resolutionRef: v,
      scene: i,
      isIntersectingRef: D
    });
  }, [D, o, s, e, i, x]);
  return [
    _(
      (T, k, K) => {
        const { gl: J, size: ee } = T;
        if (P(k, K), Ln(x))
          return f;
        if (p) {
          if (b.current === x.updateKey)
            return f;
          b.current = x.updateKey;
        }
        return p && (jn({
          params: x,
          size: ee,
          scene: i,
          onBeforeInit: u
        }), M({
          isIntersectingRef: D,
          isIntersectingOnceRef: S,
          params: x
        }), w(!1)), h(J);
      },
      [
        h,
        M,
        u,
        P,
        p,
        i,
        x,
        S,
        D,
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
      intersections: D.current,
      useDomView: z
    }
  ];
}, _r = (e, t) => {
  const {
    scene: n,
    camera: r,
    size: u,
    dpr: c = !1,
    isSizeUpdate: l = !1,
    depth: i = !1,
    ...d
  } = e, m = B([]), h = X(u, c);
  m.current = y(() => Array.from({ length: t }, () => {
    const o = new a.WebGLRenderTarget(
      h.x,
      h.y,
      {
        ...he,
        ...d
      }
    );
    return i && (o.depthTexture = new a.DepthTexture(
      h.x,
      h.y,
      a.FloatType
    )), o;
  }), [t]), l && m.current.forEach(
    (o) => o.setSize(h.x, h.y)
  ), ae(() => {
    const o = m.current;
    return () => {
      o.forEach((g) => g.dispose());
    };
  }, [t]);
  const x = _(
    (o, g, s) => {
      const v = m.current[g];
      return Ce({
        gl: o,
        scene: n,
        camera: r,
        fbo: v,
        onBeforeRender: () => s && s({ read: v.texture })
      }), v.texture;
    },
    [n, r]
  );
  return [m.current, x];
}, Xn = Object.freeze({
  interpolate(e, t, n, r = 1e-6) {
    const u = e + (t - e) * n;
    return Math.abs(u) < r ? 0 : u;
  },
  getMaxDpr(e, t) {
    return Math.floor(
      e.capabilities.maxTextureSize / Math.max(t.width, t.height)
    );
  }
});
export {
  en as ALPHABLENDING_PARAMS,
  _n as BLANK_PARAMS,
  ve as BLENDING_PARAMS,
  de as BRIGHTNESSPICKER_PARAMS,
  ne as BRUSH_PARAMS,
  Q as CHROMAKEY_PARAMS,
  H as COLORSTRATA_PARAMS,
  ce as COSPALETTE_PARAMS,
  sn as COVERTEXTURE_PARAMS,
  Ve as DELTA_TIME,
  Kn as DOMSYNCER_PARAMS,
  be as DUOTONE_PARAMS,
  ge as Easing,
  he as FBO_DEFAULT_OPTION,
  yt as FLUID_PARAMS,
  Ae as FXBLENDING_PARAMS,
  oe as FXTEXTURE_PARAMS,
  Me as HSV_PARAMS,
  ue as MARBLE_PARAMS,
  O as MORPHPARTICLES_PARAMS,
  fe as MOTIONBLUR_PARAMS,
  re as NOISE_PARAMS,
  Ct as RIPPLE_PARAMS,
  Fe as SIMPLEBLUR_PARAMS,
  Ye as ShaderChunk,
  Xn as Utils,
  me as WAVE_PARAMS,
  W as WOBBLE3D_PARAMS,
  Ce as renderFBO,
  F as setCustomUniform,
  R as setUniform,
  yr as useAddMesh,
  lr as useAlphaBlending,
  Mr as useBeat,
  gr as useBlank,
  ar as useBlending,
  ur as useBrightnessPicker,
  Qn as useBrush,
  L as useCamera,
  fr as useChromaKey,
  tr as useColorStrata,
  _r as useCopyTexture,
  rr as useCosPalette,
  vr as useCoverTexture,
  Vn as useCreateMorphParticles,
  On as useCreateWobble3D,
  Cr as useDomSyncer,
  se as useDoubleFBO,
  or as useDuoTone,
  Sr as useFPSLimiter,
  Zn as useFluid,
  sr as useFxBlending,
  ir as useFxTexture,
  cr as useHSV,
  nr as useMarble,
  hr as useMorphParticles,
  pr as useMotionBlur,
  er as useNoise,
  $ as useParams,
  Se as usePointer,
  br as useResizeBoundary,
  X as useResolution,
  Jn as useRipple,
  mr as useSimpleBlur,
  j as useSingleFBO,
  dr as useWave,
  xr as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
