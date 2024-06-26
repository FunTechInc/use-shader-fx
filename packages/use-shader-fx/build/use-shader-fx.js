import * as o from "three";
import { useMemo as y, useEffect as Z, useRef as B, useCallback as _, useState as Be } from "react";
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
const K = (e, t = !1) => {
  const n = t ? e.width * t : e.width, r = t ? e.height * t : e.height;
  return y(
    () => new o.Vector2(n, r),
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
  const s = y(() => {
    const l = new r(t, n);
    return e && e.add(l), l;
  }, [t, n, r, e]);
  return Z(() => () => {
    e && e.remove(s), t.dispose(), n.dispose();
  }, [e, t, n, s]), s;
}, Re = process.env.NODE_ENV === "development", I = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, w = new o.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  o.RGBAFormat
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
}`, Ke = `vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`, He = `vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}`;
const Xe = Object.freeze({
  wobble3D: je,
  snoise: qe,
  coverTexture: We,
  fxBlending: Ne,
  planeVertex: ke,
  defaultVertex: Ge,
  hsv2rgb: Ke,
  rgb2hsv: He
}), Ye = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function Qe(e, t) {
  return ye(Xe[t] || "");
}
function ye(e) {
  return e.replace(Ye, Qe);
}
const V = (e, t) => (t && t(e), e.vertexShader = ye(e.vertexShader), e.fragmentShader = ye(e.fragmentShader), e), Ze = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uBuffer: { value: w },
          uResolution: { value: new o.Vector2(0, 0) },
          uTexture: { value: w },
          uIsTexture: { value: !1 },
          uMap: { value: w },
          uIsMap: { value: !1 },
          uMapIntensity: { value: re.mapIntensity },
          uRadius: { value: re.radius },
          uSmudge: { value: re.smudge },
          uDissipation: { value: re.dissipation },
          uMotionBlur: { value: re.motionBlur },
          uMotionSample: { value: re.motionSample },
          uMouse: { value: new o.Vector2(-10, -10) },
          uPrevMouse: { value: new o.Vector2(-10, -10) },
          uVelocity: { value: new o.Vector2(0, 0) },
          uColor: { value: re.color },
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
  }), [r]), c = K(t, n);
  R(l)("uResolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, Je = (e, t) => {
  const n = t, r = e / t, [s, l] = [n * r / 2, n / 2];
  return { width: s, height: l, near: -1e3, far: 1e3 };
}, L = (e, t = "OrthographicCamera") => {
  const n = K(e), { width: r, height: s, near: l, far: c } = Je(
    n.x,
    n.y
  );
  return y(() => t === "OrthographicCamera" ? new o.OrthographicCamera(
    -r,
    r,
    s,
    -s,
    l,
    c
  ) : new o.PerspectiveCamera(50, r / s), [r, s, l, c, t]);
}, Se = (e = 0) => {
  const t = B(new o.Vector2(0, 0)), n = B(new o.Vector2(0, 0)), r = B(new o.Vector2(0, 0)), s = B(0), l = B(new o.Vector2(0, 0)), c = B(!1);
  return _(
    (d) => {
      const p = performance.now();
      let f;
      c.current && e ? (r.current = r.current.lerp(
        d,
        1 - e
      ), f = r.current.clone()) : (f = d.clone(), r.current = f), s.current === 0 && (s.current = p, t.current = f);
      const x = Math.max(1, p - s.current);
      s.current = p, l.current.copy(f).sub(t.current).divideScalar(x);
      const a = l.current.length() > 0, v = c.current ? t.current.clone() : f;
      return !c.current && a && (c.current = !0), t.current = f, {
        currentPointer: f,
        prevPointer: v,
        diffPointer: n.current.subVectors(f, v),
        velocity: l.current,
        isVelocityUpdate: a
      };
    },
    [e]
  );
}, j = (e) => {
  const n = B(
    ((s) => Object.values(s).some((l) => typeof l == "function"))(e) ? e : structuredClone(e)
  ), r = _((s) => {
    if (s !== void 0)
      for (const l in s) {
        const c = l;
        c in n.current && s[c] !== void 0 && s[c] !== null ? n.current[c] = s[c] : console.error(
          `"${String(
            c
          )}" does not exist in the params. or "${String(
            c
          )}" is null | undefined`
        );
      }
  }, []);
  return [n.current, r];
}, he = {
  depthBuffer: !1
}, _e = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: s,
  onSwap: l
}) => {
  e.setRenderTarget(t), s(), e.clear(), e.render(n, r), l && l(), e.setRenderTarget(null), e.clear();
}, $ = (e) => {
  var x;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: s = !1,
    isSizeUpdate: l = !1,
    depth: c = !1,
    ...i
  } = e, d = B(), p = K(r, s);
  d.current = y(
    () => {
      const a = new o.WebGLRenderTarget(
        p.x,
        p.y,
        {
          ...he,
          ...i
        }
      );
      return c && (a.depthTexture = new o.DepthTexture(
        p.x,
        p.y,
        o.FloatType
      )), a;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), l && ((x = d.current) == null || x.setSize(p.x, p.y)), Z(() => {
    const a = d.current;
    return () => {
      a == null || a.dispose();
    };
  }, []);
  const f = _(
    (a, v) => {
      const u = d.current;
      return _e({
        gl: a,
        fbo: u,
        scene: t,
        camera: n,
        onBeforeRender: () => v && v({ read: u.texture })
      }), u.texture;
    },
    [t, n]
  );
  return [d.current, f];
}, se = (e) => {
  var x, a;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: s = !1,
    isSizeUpdate: l = !1,
    depth: c = !1,
    ...i
  } = e, d = K(r, s), p = y(() => {
    const v = new o.WebGLRenderTarget(d.x, d.y, {
      ...he,
      ...i
    }), u = new o.WebGLRenderTarget(d.x, d.y, {
      ...he,
      ...i
    });
    return c && (v.depthTexture = new o.DepthTexture(
      d.x,
      d.y,
      o.FloatType
    ), u.depthTexture = new o.DepthTexture(
      d.x,
      d.y,
      o.FloatType
    )), {
      read: v,
      write: u,
      swap: function() {
        let m = this.read;
        this.read = this.write, this.write = m;
      }
    };
  }, []);
  l && ((x = p.read) == null || x.setSize(d.x, d.y), (a = p.write) == null || a.setSize(d.x, d.y)), Z(() => {
    const v = p;
    return () => {
      var u, m;
      (u = v.read) == null || u.dispose(), (m = v.write) == null || m.dispose();
    };
  }, [p]);
  const f = _(
    (v, u) => {
      var h;
      const m = p;
      return _e({
        gl: v,
        scene: t,
        camera: n,
        fbo: m.write,
        onBeforeRender: () => u && u({
          read: m.read.texture,
          write: m.write.texture
        }),
        onSwap: () => m.swap()
      }), (h = m.read) == null ? void 0 : h.texture;
    },
    [t, n, p]
  );
  return [
    { read: p.read, write: p.write },
    f
  ];
}, U = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, re = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new o.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), Jn = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Ze({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), f = Se(), [x, a] = se({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [v, u] = j(re), m = B(null), h = R(i), M = F(i), b = _(
    (S, C) => {
      u(S), M(C);
    },
    [u, M]
  );
  return [
    _(
      (S, C, T) => {
        const { gl: A, pointer: z } = S;
        b(C, T), v.texture ? (h("uIsTexture", !0), h("uTexture", v.texture)) : h("uIsTexture", !1), v.map ? (h("uIsMap", !0), h("uMap", v.map), h("uMapIntensity", v.mapIntensity)) : h("uIsMap", !1), h("uRadius", v.radius), h("uSmudge", v.smudge), h("uDissipation", v.dissipation), h("uMotionBlur", v.motionBlur), h("uMotionSample", v.motionSample);
        const P = v.pointerValues || f(z);
        P.isVelocityUpdate && (h("uMouse", P.currentPointer), h("uPrevMouse", P.prevPointer)), h("uVelocity", P.velocity);
        const q = typeof v.color == "function" ? v.color(P.velocity) : v.color;
        return h("uColor", q), h("uIsCursor", v.isCursor), h("uPressureEnd", v.pressure), m.current === null && (m.current = v.pressure), h("uPressureStart", m.current), m.current = v.pressure, a(A, ({ read: D }) => {
          h("uBuffer", D);
        });
      },
      [h, f, a, v, b]
    ),
    b,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
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
}`, et = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const tt = () => y(() => new o.ShaderMaterial({
  vertexShader: J,
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
const rt = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: w },
        uSource: { value: w },
        texelSize: { value: new o.Vector2() },
        dt: { value: Ae },
        dissipation: { value: 0 }
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
const at = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new o.Vector2() }
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
const ut = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: new o.Vector2() }
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
const lt = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new o.Vector2() }
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
const vt = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: 0 },
        dt: { value: Ae },
        texelSize: { value: new o.Vector2() }
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
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const pt = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTexture: { value: w },
        value: { value: 0 },
        texelSize: { value: new o.Vector2() }
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
}) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uPressure: { value: w },
        uVelocity: { value: w },
        texelSize: { value: new o.Vector2() }
      },
      vertexShader: J,
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
const ht = ({ onBeforeInit: e }) => y(() => new o.ShaderMaterial({
  ...V(
    {
      uniforms: {
        uTarget: { value: w },
        aspectRatio: { value: 0 },
        color: { value: new o.Vector3() },
        point: { value: new o.Vector2() },
        radius: { value: 0 },
        texelSize: { value: new o.Vector2() }
      },
      vertexShader: J,
      fragmentShader: gt
    },
    e
  ),
  ...I
}), [e]), X = (e, t) => e(t ?? {}), xt = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: r
}) => {
  const s = y(() => new o.PlaneGeometry(2, 2), []), {
    curl: l,
    vorticity: c,
    advection: i,
    divergence: d,
    pressure: p,
    clear: f,
    gradientSubtract: x,
    splat: a
  } = r ?? {}, v = X(tt), u = v.clone(), m = X(lt, l), h = X(vt, c), M = X(rt, i), b = X(
    at,
    d
  ), g = X(ut, p), S = X(pt, f), C = X(
    ft,
    x
  ), T = X(ht, a), A = y(
    () => ({
      vorticityMaterial: h,
      curlMaterial: m,
      advectionMaterial: M,
      divergenceMaterial: b,
      pressureMaterial: g,
      clearMaterial: S,
      gradientSubtractMaterial: C,
      splatMaterial: T
    }),
    [
      h,
      m,
      M,
      b,
      g,
      S,
      C,
      T
    ]
  ), z = K(t, n);
  y(() => {
    R(A.splatMaterial)(
      "aspectRatio",
      z.x / z.y
    );
    for (const D of Object.values(A))
      R(D)(
        "texelSize",
        new o.Vector2(1 / z.x, 1 / z.y)
      );
  }, [z, A]);
  const P = E(e, s, v, o.Mesh);
  y(() => {
    v.dispose(), P.material = u;
  }, [v, P, u]), Z(() => () => {
    for (const D of Object.values(A))
      D.dispose();
  }, [A]);
  const q = _(
    (D) => {
      P.material = D, P.material.needsUpdate = !0;
    },
    [P]
  );
  return { materials: A, setMeshMaterial: q, mesh: P };
}, Ae = 0.016, yt = Object.freeze({
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  velocityAcceleration: 10,
  pressureDissipation: 0.9,
  pressureIterations: 20,
  curlStrength: 35,
  splatRadius: 2e-3,
  fluidColor: new o.Vector3(1, 1, 1),
  pointerValues: !1
}), er = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  customFluidProps: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { materials: i, setMeshMaterial: d, mesh: p } = xt({
    scene: c,
    size: e,
    dpr: l.shader,
    customFluidProps: s
  }), f = L(e), x = Se(), a = y(
    () => ({
      scene: c,
      camera: f,
      dpr: l.fbo,
      size: e,
      isSizeUpdate: r,
      type: o.HalfFloatType,
      ...n
    }),
    [c, f, e, l.fbo, r, n]
  ), [v, u] = se(a), [m, h] = se(a), [M, b] = $(a), [g, S] = $(a), [C, T] = se(a), A = B(new o.Vector2(0, 0)), z = B(new o.Vector3(0, 0, 0)), [P, q] = j(yt), D = y(
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
  ), H = _(
    (te, ne) => {
      q(te), ne && Object.keys(ne).forEach((ie) => {
        k[ie](
          ne[ie]
        );
      });
    },
    [q, k]
  );
  return [
    _(
      (te, ne, ie) => {
        const { gl: G, pointer: Ie, size: Ce } = te;
        H(ne, ie);
        const xe = u(G, ({ read: N }) => {
          d(i.advectionMaterial), D.advection("uVelocity", N), D.advection("uSource", N), D.advection(
            "dissipation",
            P.velocityDissipation
          );
        }), ze = h(G, ({ read: N }) => {
          d(i.advectionMaterial), D.advection("uVelocity", xe), D.advection("uSource", N), D.advection(
            "dissipation",
            P.densityDissipation
          );
        }), pe = P.pointerValues || x(Ie);
        pe.isVelocityUpdate && (u(G, ({ read: N }) => {
          d(i.splatMaterial), D.splat("uTarget", N), D.splat("point", pe.currentPointer);
          const le = pe.diffPointer.multiply(
            A.current.set(Ce.width, Ce.height).multiplyScalar(P.velocityAcceleration)
          );
          D.splat(
            "color",
            z.current.set(le.x, le.y, 1)
          ), D.splat("radius", P.splatRadius);
        }), h(G, ({ read: N }) => {
          d(i.splatMaterial), D.splat("uTarget", N);
          const le = typeof P.fluidColor == "function" ? P.fluidColor(pe.velocity) : P.fluidColor;
          D.splat("color", le);
        }));
        const Ue = b(G, () => {
          d(i.curlMaterial), D.curl("uVelocity", xe);
        });
        u(G, ({ read: N }) => {
          d(i.vorticityMaterial), D.vorticity("uVelocity", N), D.vorticity("uCurl", Ue), D.vorticity("curl", P.curlStrength);
        });
        const Oe = S(G, () => {
          d(i.divergenceMaterial), D.divergence("uVelocity", xe);
        });
        T(G, ({ read: N }) => {
          d(i.clearMaterial), D.clear("uTexture", N), D.clear("value", P.pressureDissipation);
        }), d(i.pressureMaterial), D.pressure("uDivergence", Oe);
        let we;
        for (let N = 0; N < P.pressureIterations; N++)
          we = T(G, ({ read: le }) => {
            D.pressure("uPressure", le);
          });
        return u(G, ({ read: N }) => {
          d(i.gradientSubtractMaterial), D.gradientSubtract("uPressure", we), D.gradientSubtract("uVelocity", N);
        }), ze;
      },
      [
        i,
        D,
        d,
        b,
        h,
        S,
        x,
        T,
        u,
        P,
        H
      ]
    ),
    H,
    {
      scene: c,
      mesh: p,
      materials: i,
      camera: f,
      renderTarget: {
        velocity: v,
        density: m,
        curl: M,
        divergence: g,
        pressure: C
      },
      output: m.read.texture
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
  onBeforeInit: s
}) => {
  const l = y(
    () => new o.PlaneGeometry(e, e),
    [e]
  ), c = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uOpacity: { value: 0 },
          uMap: { value: n || w }
        },
        vertexShader: bt,
        fragmentShader: Mt
      },
      s
    ),
    blending: o.AdditiveBlending,
    ...I,
    // Must be transparent.
    transparent: !0
  }), [n, s]), i = y(() => {
    const d = [];
    for (let p = 0; p < t; p++) {
      const f = c.clone(), x = new o.Mesh(l.clone(), f);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, r.add(x), d.push(x);
    }
    return d;
  }, [l, c, r, t]);
  return Z(() => () => {
    i.forEach((d) => {
      d.geometry.dispose(), Array.isArray(d.material) ? d.material.forEach((p) => p.dispose()) : d.material.dispose(), r.remove(d);
    });
  }, [r, i]), i;
}, _t = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeoutSpeed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), tr = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: r,
  dpr: s,
  renderTargetOptions: l,
  isSizeUpdate: c,
  onBeforeInit: i
}) => {
  const d = U(s), p = y(() => new o.Scene(), []), f = St({
    scale: t,
    max: n,
    texture: e,
    scene: p,
    onBeforeInit: i
  }), x = L(r), a = Se(), [v, u] = $({
    scene: p,
    camera: x,
    size: r,
    dpr: d.fbo,
    isSizeUpdate: c,
    ...l
  }), [m, h] = j(_t), M = B(0), b = y(() => (S, C) => {
    h(S), f.forEach((T) => {
      if (T.visible) {
        const A = T.material;
        T.rotation.z += m.rotation, T.scale.x = m.fadeoutSpeed * T.scale.x + m.scale, T.scale.y = T.scale.x;
        const z = A.uniforms.uOpacity.value;
        R(A)("uOpacity", z * m.fadeoutSpeed), z < 1e-3 && (T.visible = !1);
      }
      F(T.material)(C);
    });
  }, [f, m, h]);
  return [
    _(
      (S, C, T) => {
        const { gl: A, pointer: z, size: P } = S;
        b(C, T);
        const q = m.pointerValues || a(z);
        if (m.frequency < q.diffPointer.length()) {
          const D = f[M.current], k = D.material;
          D.visible = !0, D.position.set(
            q.currentPointer.x * (P.width / 2),
            q.currentPointer.y * (P.height / 2),
            0
          ), D.scale.x = D.scale.y = 0, R(k)("uOpacity", m.alpha), M.current = (M.current + 1) % n;
        }
        return u(A);
      },
      [u, f, a, n, m, b]
    ),
    b,
    {
      scene: p,
      camera: x,
      meshArr: f,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Ct = "#usf <planeVertex>", wt = `precision highp float;
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTime: { value: 0 },
          scale: { value: oe.scale },
          timeStrength: { value: oe.timeStrength },
          noiseOctaves: { value: oe.noiseOctaves },
          fbmOctaves: { value: oe.fbmOctaves },
          warpOctaves: { value: oe.warpOctaves },
          warpDirection: { value: oe.warpDirection },
          warpStrength: { value: oe.warpStrength }
        },
        vertexShader: Ct,
        fragmentShader: wt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, oe = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new o.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), nr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Tt({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(oe), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C, clock: T } = b;
        return h(g, S), u("scale", a.scale), u("timeStrength", a.timeStrength), u("noiseOctaves", a.noiseOctaves), u("fbmOctaves", a.fbmOctaves), u("warpOctaves", a.warpOctaves), u("warpDirection", a.warpDirection), u("warpStrength", a.warpStrength), u("uTime", a.beat || T.getElapsedTime()), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          isTexture: { value: !1 },
          scale: { value: Y.scale },
          noise: { value: w },
          noiseStrength: { value: Y.noiseStrength },
          isNoise: { value: !1 },
          laminateLayer: { value: Y.laminateLayer },
          laminateInterval: {
            value: Y.laminateInterval
          },
          laminateDetail: { value: Y.laminateDetail },
          distortion: { value: Y.distortion },
          colorFactor: { value: Y.colorFactor },
          uTime: { value: 0 },
          timeStrength: { value: Y.timeStrength }
        },
        vertexShader: Dt,
        fragmentShader: Pt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, Y = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new o.Vector2(0.1, 0.1),
  laminateDetail: new o.Vector2(1, 1),
  distortion: new o.Vector2(0, 0),
  colorFactor: new o.Vector3(1, 1, 1),
  timeStrength: new o.Vector2(0, 0),
  noise: !1,
  noiseStrength: new o.Vector2(0, 0),
  beat: !1
}), rr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Rt({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(Y), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C, clock: T } = b;
        return h(g, S), a.texture ? (u("uTexture", a.texture), u("isTexture", !0)) : (u("isTexture", !1), u("scale", a.scale)), a.noise ? (u("noise", a.noise), u("isNoise", !0), u("noiseStrength", a.noiseStrength)) : u("isNoise", !1), u("uTime", a.beat || T.getElapsedTime()), u("laminateLayer", a.laminateLayer), u("laminateInterval", a.laminateInterval), u("laminateDetail", a.laminateDetail), u("distortion", a.distortion), u("colorFactor", a.colorFactor), u("timeStrength", a.timeStrength), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
    }
  ];
};
var At = "#usf <planeVertex>", Vt = `precision highp float;

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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
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
        vertexShader: At,
        fragmentShader: Vt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, ue = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), or = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Ft({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(ue), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C, clock: T } = b;
        return h(g, S), u("u_pattern", a.pattern), u("u_complexity", a.complexity), u("u_complexityAttenuation", a.complexityAttenuation), u("u_iterations", a.iterations), u("u_timeStrength", a.timeStrength), u("u_scale", a.scale), u("u_time", a.beat || T.getElapsedTime()), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
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
        vertexShader: It,
        fragmentShader: zt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, ce = Object.freeze({
  texture: w,
  color1: new o.Color().set(0.5, 0.5, 0.5),
  color2: new o.Color().set(0.5, 0.5, 0.5),
  color3: new o.Color().set(1, 1, 1),
  color4: new o.Color().set(0, 0.1, 0.2),
  rgbWeight: new o.Vector3(0.299, 0.587, 0.114)
}), ar = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Ut({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(ce), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("uTexture", a.texture), u("uColor1", a.color1), u("uColor2", a.color2), u("uColor3", a.color3), u("uColor4", a.color4), u("uRgbWeight", a.rgbWeight), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uColor0: { value: be.color0 },
          uColor1: { value: be.color1 }
        },
        vertexShader: Ot,
        fragmentShader: Bt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, be = Object.freeze({
  texture: w,
  color0: new o.Color(16777215),
  color1: new o.Color(0)
}), ir = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Et({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(be), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("uTexture", a.texture), u("uColor0", a.color0), u("uColor1", a.color1), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
const jt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
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
          u_dodgeColor: { value: new o.Color() },
          u_isDodgeColor: { value: !1 }
        },
        vertexShader: Lt,
        fragmentShader: $t
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, ve = Object.freeze({
  texture: w,
  map: w,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new o.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), ur = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = jt({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(ve), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("u_texture", a.texture), u("uMap", a.map), u("uMapIntensity", a.mapIntensity), a.alphaMap ? (u("u_alphaMap", a.alphaMap), u("u_isAlphaMap", !0)) : u("u_isAlphaMap", !1), u("u_brightness", a.brightness), u("u_min", a.min), u("u_max", a.max), a.dodgeColor ? (u("u_dodgeColor", a.dodgeColor), u("u_isDodgeColor", !0)) : u("u_isDodgeColor", !1), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
    }
  ];
};
var qt = "#usf <planeVertex>", Wt = `precision highp float;

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
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => {
    var p, f;
    return new o.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new o.Vector2() },
            uTextureResolution: { value: new o.Vector2() },
            uTexture0: { value: w },
            uTexture1: { value: w },
            padding: { value: ae.padding },
            uMap: { value: w },
            edgeIntensity: { value: ae.edgeIntensity },
            mapIntensity: { value: ae.mapIntensity },
            epicenter: { value: ae.epicenter },
            progress: { value: ae.progress },
            dirX: { value: (p = ae.dir) == null ? void 0 : p.x },
            dirY: { value: (f = ae.dir) == null ? void 0 : f.y }
          },
          vertexShader: qt,
          fragmentShader: Wt
        },
        r
      ),
      ...I
    });
  }, [r]), c = K(t, n);
  R(l)("uResolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, ae = Object.freeze({
  texture0: w,
  texture1: w,
  padding: 0,
  map: w,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new o.Vector2(0, 0),
  progress: 0,
  dir: new o.Vector2(0, 0)
}), sr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Nt({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    dpr: l.fbo,
    size: e,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(ae), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        var P, q, D, k, H, ee, te, ne;
        const { gl: C } = b;
        h(g, S), u("uTexture0", a.texture0), u("uTexture1", a.texture1), u("progress", a.progress);
        const T = [
          ((q = (P = a.texture0) == null ? void 0 : P.image) == null ? void 0 : q.width) || 0,
          ((k = (D = a.texture0) == null ? void 0 : D.image) == null ? void 0 : k.height) || 0
        ], A = [
          ((ee = (H = a.texture1) == null ? void 0 : H.image) == null ? void 0 : ee.width) || 0,
          ((ne = (te = a.texture1) == null ? void 0 : te.image) == null ? void 0 : ne.height) || 0
        ], z = T.map((ie, G) => ie + (A[G] - ie) * a.progress);
        return u("uTextureResolution", z), u("padding", a.padding), u("uMap", a.map), u("mapIntensity", a.mapIntensity), u("edgeIntensity", a.edgeIntensity), u("epicenter", a.epicenter), u("dirX", a.dir.x), u("dirY", a.dir.y), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
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
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, de = Object.freeze({
  texture: w,
  brightness: new o.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), lr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Kt({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(
    de
  ), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("u_texture", a.texture), u("u_brightness", a.brightness), u("u_min", a.min), u("u_max", a.max), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
    }
  ];
};
var Ht = "#usf <planeVertex>", Xt = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;
const Yt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          uMap: { value: w },
          uMapIntensity: { value: Ve.mapIntensity }
        },
        vertexShader: Ht,
        fragmentShader: Xt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, Ve = Object.freeze({
  texture: w,
  map: w,
  mapIntensity: 0.3
}), cr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Yt({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(Ve), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("u_texture", a.texture), u("uMap", a.map), u("uMapIntensity", a.mapIntensity), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uMap: { value: w }
        },
        vertexShader: Qt,
        fragmentShader: Zt
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, en = Object.freeze({
  texture: w,
  map: w
}), vr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Jt({
    scene: c,
    size: e,
    onBeforeInit: s
  }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(en), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("uTexture", a.texture), u("uMap", a.map), x(C);
      },
      [u, x, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          u_brightness: { value: Me.brightness },
          u_saturation: { value: Me.saturation }
        },
        vertexShader: tn,
        fragmentShader: nn
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, Me = Object.freeze({
  texture: w,
  brightness: 1,
  saturation: 1
}), mr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = rn({
    scene: c,
    size: e,
    onBeforeInit: s
  }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(Me), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("u_texture", a.texture), u("u_brightness", a.brightness), u("u_saturation", a.saturation), x(C);
      },
      [u, x, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uResolution: { value: new o.Vector2() },
          uTextureResolution: { value: new o.Vector2() },
          uTexture: { value: w }
        },
        vertexShader: on,
        fragmentShader: an
      },
      r
    ),
    ...I
  }), [r]), c = K(t, n);
  R(l)("uResolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, sn = Object.freeze({
  texture: w
}), pr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = un({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    dpr: l.fbo,
    size: e,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(sn), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        var T, A, z, P, q, D;
        const { gl: C } = b;
        return h(g, S), u("uTexture", a.texture), u("uTextureResolution", [
          ((z = (A = (T = a.texture) == null ? void 0 : T.source) == null ? void 0 : A.data) == null ? void 0 : z.width) || 0,
          ((D = (q = (P = a.texture) == null ? void 0 : P.source) == null ? void 0 : q.data) == null ? void 0 : D.height) || 0
        ]), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uResolution: { value: new o.Vector2(0, 0) },
          uBlurSize: { value: Fe.blurSize }
        },
        vertexShader: ln,
        fragmentShader: cn
      },
      t
    ),
    ...I
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, Fe = Object.freeze({
  texture: w,
  blurSize: 3,
  blurPower: 5
}), dr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = vn({ scene: c, onBeforeInit: s }), p = L(e), f = y(
    () => ({
      scene: c,
      camera: p,
      size: e,
      dpr: l.fbo,
      isSizeUpdate: r,
      ...n
    }),
    [c, p, e, l.fbo, r, n]
  ), [x, a] = se(f), [v, u] = j(Fe), m = R(i), h = F(i), M = _(
    (g, S) => {
      u(g), h(S);
    },
    [u, h]
  );
  return [
    _(
      (g, S, C) => {
        var z, P, q, D, k, H;
        const { gl: T } = g;
        M(S, C), m("uTexture", v.texture), m("uResolution", [
          ((q = (P = (z = v.texture) == null ? void 0 : z.source) == null ? void 0 : P.data) == null ? void 0 : q.width) || 0,
          ((H = (k = (D = v.texture) == null ? void 0 : D.source) == null ? void 0 : k.data) == null ? void 0 : H.height) || 0
        ]), m("uBlurSize", v.blurSize);
        let A = a(T);
        for (let ee = 0; ee < v.blurPower; ee++)
          m("uTexture", A), A = a(T);
        return A;
      },
      [a, m, v, M]
    ),
    M,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uBackbuffer: { value: w },
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
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, fe = Object.freeze({
  texture: w,
  begin: new o.Vector2(0, 0),
  end: new o.Vector2(0, 0),
  strength: 0.9
}), fr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = dn({ scene: c, onBeforeInit: s }), p = L(e), f = y(
    () => ({
      scene: c,
      camera: p,
      size: e,
      dpr: l.fbo,
      isSizeUpdate: r,
      ...n
    }),
    [c, p, e, l.fbo, r, n]
  ), [x, a] = se(f), [v, u] = j(fe), m = R(i), h = F(i), M = _(
    (g, S) => {
      u(g), h(S);
    },
    [u, h]
  );
  return [
    _(
      (g, S, C) => {
        const { gl: T } = g;
        return M(S, C), m("uTexture", v.texture), m("uBegin", v.begin), m("uEnd", v.end), m("uStrength", v.strength), a(T, ({ read: A }) => {
          m("uBackbuffer", A);
        });
      },
      [a, m, M, v]
    ),
    M,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
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
  const n = y(() => new o.PlaneGeometry(2, 2), []), r = y(() => new o.ShaderMaterial({
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
  }), [t]), s = E(e, n, r, o.Mesh);
  return { material: r, mesh: s };
}, me = Object.freeze({
  epicenter: new o.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), gr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = hn({ scene: c, onBeforeInit: s }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(me), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("uEpicenter", a.epicenter), u("uProgress", a.progress), u("uWidth", a.width), u("uStrength", a.strength), u(
          "uMode",
          a.mode === "center" ? 0 : a.mode === "horizontal" ? 1 : 2
        ), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          u_texture: { value: w },
          u_resolution: { value: new o.Vector2() },
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
  }), [r]), c = K(t, n);
  R(l)("u_resolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, Q = Object.freeze({
  texture: w,
  keyColor: new o.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new o.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), hr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = bn({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), [f, x] = $({
    scene: c,
    camera: p,
    size: e,
    dpr: l.fbo,
    isSizeUpdate: r,
    ...n
  }), [a, v] = j(Q), u = R(i), m = F(i), h = _(
    (b, g) => {
      v(b), m(g);
    },
    [v, m]
  );
  return [
    _(
      (b, g, S) => {
        const { gl: C } = b;
        return h(g, S), u("u_texture", a.texture), u("u_keyColor", a.keyColor), u("u_similarity", a.similarity), u("u_smoothness", a.smoothness), u("u_spill", a.spill), u("u_color", a.color), u("u_contrast", a.contrast), u("u_brightness", a.brightness), u("u_gamma", a.gamma), x(C);
      },
      [x, u, a, h]
    ),
    h,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: f,
      output: f.texture
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
const _n = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uTexture: { value: w },
          uBackbuffer: { value: w },
          uTime: { value: 0 },
          uPointer: { value: new o.Vector2() },
          uResolution: { value: new o.Vector2() }
        },
        vertexShader: Mn,
        fragmentShader: Sn
      },
      r
    ),
    ...I
  }), [r]), c = K(t, n);
  R(l)("uResolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, Cn = Object.freeze({
  texture: w,
  beat: !1
}), xr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = _n({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), f = y(
    () => ({
      scene: c,
      camera: p,
      size: e,
      dpr: l.fbo,
      isSizeUpdate: r,
      ...n
    }),
    [c, p, e, l.fbo, r, n]
  ), [x, a] = se(f), [v, u] = j(Cn), m = R(i), h = F(i), M = _(
    (g, S) => {
      u(g), h(S);
    },
    [u, h]
  );
  return [
    _(
      (g, S, C) => {
        const { gl: T, clock: A, pointer: z } = g;
        return M(S, C), m("uPointer", z), m("uTexture", v.texture), m("uTime", v.beat || A.getElapsedTime()), a(T, ({ read: P }) => {
          m("uBackbuffer", P);
        });
      },
      [a, m, v, M]
    ),
    M,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var wn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`, Tn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

uniform vec2 uResolution;

#usf <uniforms>

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf <main>
	
	gl_FragColor = usf_FragColor;
}`;
const Dn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const s = y(() => new o.PlaneGeometry(2, 2), []), l = y(() => new o.ShaderMaterial({
    ...V(
      {
        uniforms: {
          uResolution: { value: new o.Vector2() }
        },
        vertexShader: wn,
        fragmentShader: Tn
      },
      r
    ),
    ...I
  }), [r]), c = K(t, n);
  R(l)("uResolution", c.clone());
  const i = E(e, s, l, o.Mesh);
  return { material: l, mesh: i };
}, yr = Object.freeze({}), br = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  onBeforeInit: s
}) => {
  const l = U(t), c = y(() => new o.Scene(), []), { material: i, mesh: d } = Dn({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeInit: s
  }), p = L(e), f = y(
    () => ({
      scene: c,
      camera: p,
      size: e,
      dpr: l.fbo,
      isSizeUpdate: r,
      ...n
    }),
    [c, p, e, l.fbo, r, n]
  ), [x, a] = $(f), v = F(i), u = _(
    (h, M) => {
      v(M);
    },
    [v]
  );
  return [
    _(
      (h, M, b) => {
        const { gl: g } = h;
        return u(M, b), a(g);
      },
      [a, u]
    ),
    u,
    {
      scene: c,
      mesh: d,
      material: i,
      camera: p,
      renderTarget: x,
      output: x.texture
    }
  ];
}, Pn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = E(
    e,
    t,
    n,
    o.Points
  ), s = E(
    e,
    y(() => t.clone(), [t]),
    y(() => n.clone(), [n]),
    o.Mesh
  );
  return s.visible = !1, {
    points: r,
    interactiveMesh: s
  };
};
var Rn = `uniform vec2 uResolution;
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
}`, An = `precision highp float;
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
const Te = (e, t, n, r, s) => {
  var f;
  const l = n === "position" ? "positionTarget" : "uvTarget", c = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", i = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", d = n === "position" ? "positionsList" : "uvsList", p = n === "position" ? `
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
      new o.BufferAttribute(e[0], s)
    );
    let x = "", a = "";
    e.forEach((v, u) => {
      t.setAttribute(
        `${l}${u}`,
        new o.BufferAttribute(v, s)
      ), x += `attribute vec${s} ${l}${u};
`, u === 0 ? a += `${l}${u}` : a += `,${l}${u}`;
    }), r = r.replace(
      `${c}`,
      x
    ), r = r.replace(
      `${i}`,
      `vec${s} ${d}[${e.length}] = vec${s}[](${a});
				${p}
			`
    );
  } else
    r = r.replace(`${c}`, ""), r = r.replace(`${i}`, ""), (f = t == null ? void 0 : t.attributes[n]) != null && f.array || Re && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, De = (e, t, n, r) => {
  var l;
  let s = [];
  if (e && e.length > 0) {
    (l = t == null ? void 0 : t.attributes[n]) != null && l.array ? s = [
      t.attributes[n].array,
      ...e
    ] : s = e;
    const c = Math.max(...s.map((i) => i.length));
    s.forEach((i, d) => {
      if (i.length < c) {
        const p = (c - i.length) / r, f = [], x = Array.from(i);
        for (let a = 0; a < p; a++) {
          const v = Math.floor(i.length / r * Math.random()) * r;
          for (let u = 0; u < r; u++)
            f.push(x[v + u]);
        }
        s[d] = new Float32Array([...x, ...f]);
      }
    });
  }
  return s;
}, Vn = (e, t) => {
  let n = "";
  const r = {};
  let s = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((c, i) => {
    const d = `vMapArrayIndex < ${i}.1`, p = `texture2D(uMapArray${i}, uv)`;
    s += `( ${d} ) ? ${p} : `, n += `
        uniform sampler2D uMapArray${i};
      `, r[`uMapArray${i}`] = { value: c };
  }), s += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (s += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", s).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, Fn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: s,
  mapArray: l,
  onBeforeInit: c
}) => {
  const i = y(
    () => De(r, n, "position", 3),
    [r, n]
  ), d = y(
    () => De(s, n, "uv", 2),
    [s, n]
  ), p = y(() => {
    i.length !== d.length && Re && console.log("use-shader-fx:positions and uvs are not matched");
    const x = Te(
      d,
      n,
      "uv",
      Te(
        i,
        n,
        "position",
        Rn,
        3
      ),
      2
    ), { rewritedFragmentShader: a, mapArrayUniforms: v } = Vn(l, An);
    return new o.ShaderMaterial({
      ...V(
        {
          uniforms: {
            uResolution: { value: new o.Vector2(0, 0) },
            uMorphProgress: {
              value: O.morphProgress
            },
            uBlurAlpha: { value: O.blurAlpha },
            uBlurRadius: { value: O.blurRadius },
            uPointSize: { value: O.pointSize },
            uPointAlpha: { value: O.pointAlpha },
            uPicture: { value: w },
            uIsPicture: { value: !1 },
            uAlphaPicture: { value: w },
            uIsAlphaPicture: { value: !1 },
            uColor0: { value: O.color0 },
            uColor1: { value: O.color1 },
            uColor2: { value: O.color2 },
            uColor3: { value: O.color3 },
            uMap: { value: w },
            uIsMap: { value: !1 },
            uAlphaMap: { value: w },
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
            uDisplacement: { value: w },
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
            ...v
          },
          vertexShader: x,
          fragmentShader: a
        },
        c
      ),
      ...I,
      blending: o.AdditiveBlending,
      // Must be transparent
      transparent: !0
    });
  }, [
    n,
    i,
    d,
    l,
    c
  ]), f = K(e, t);
  return R(p)("uResolution", f.clone()), { material: p, modifiedPositions: i, modifiedUvs: d };
}, In = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: s,
  uvs: l,
  mapArray: c,
  onBeforeInit: i
}) => {
  const d = U(t), p = y(() => {
    const b = r || new o.SphereGeometry(1, 32, 32);
    return b.setIndex(null), b.deleteAttribute("normal"), b;
  }, [r]), { material: f, modifiedPositions: x, modifiedUvs: a } = Fn({
    size: e,
    dpr: d.shader,
    geometry: p,
    positions: s,
    uvs: l,
    mapArray: c,
    onBeforeInit: i
  }), { points: v, interactiveMesh: u } = Pn({
    scene: n,
    geometry: p,
    material: f
  }), m = R(f), h = F(f);
  return [
    _(
      (b, g, S) => {
        b && m(
          "uTime",
          (g == null ? void 0 : g.beat) || b.clock.getElapsedTime()
        ), g !== void 0 && (m("uMorphProgress", g.morphProgress), m("uBlurAlpha", g.blurAlpha), m("uBlurRadius", g.blurRadius), m("uPointSize", g.pointSize), m("uPointAlpha", g.pointAlpha), g.picture ? (m("uPicture", g.picture), m("uIsPicture", !0)) : g.picture === !1 && m("uIsPicture", !1), g.alphaPicture ? (m("uAlphaPicture", g.alphaPicture), m("uIsAlphaPicture", !0)) : g.alphaPicture === !1 && m("uIsAlphaPicture", !1), m("uColor0", g.color0), m("uColor1", g.color1), m("uColor2", g.color2), m("uColor3", g.color3), g.map ? (m("uMap", g.map), m("uIsMap", !0)) : g.map === !1 && m("uIsMap", !1), g.alphaMap ? (m("uAlphaMap", g.alphaMap), m("uIsAlphaMap", !0)) : g.alphaMap === !1 && m("uIsAlphaMap", !1), m("uWobbleStrength", g.wobbleStrength), m(
          "uWobblePositionFrequency",
          g.wobblePositionFrequency
        ), m("uWobbleTimeFrequency", g.wobbleTimeFrequency), m("uWarpStrength", g.warpStrength), m("uWarpPositionFrequency", g.warpPositionFrequency), m("uWarpTimeFrequency", g.warpTimeFrequency), g.displacement ? (m("uDisplacement", g.displacement), m("uIsDisplacement", !0)) : g.displacement === !1 && m("uIsDisplacement", !1), m("uDisplacementIntensity", g.displacementIntensity), m(
          "uDisplacementColorIntensity",
          g.displacementColorIntensity
        ), m("uSizeRandomIntensity", g.sizeRandomIntensity), m(
          "uSizeRandomTimeFrequency",
          g.sizeRandomTimeFrequency
        ), m("uSizeRandomMin", g.sizeRandomMin), m("uSizeRandomMax", g.sizeRandomMax), m("uDivergence", g.divergence), m("uDivergencePoint", g.divergencePoint), h(S));
      },
      [m, h]
    ),
    {
      points: v,
      interactiveMesh: u,
      positions: x,
      uvs: a
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
  color0: new o.Color(16711680),
  color1: new o.Color(65280),
  color2: new o.Color(255),
  color3: new o.Color(16776960),
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
  divergencePoint: new o.Vector3(0),
  beat: !1
}), Mr = ({
  size: e,
  dpr: t,
  isSizeUpdate: n,
  renderTargetOptions: r,
  camera: s,
  geometry: l,
  positions: c,
  uvs: i,
  onBeforeInit: d
}) => {
  const p = U(t), f = y(() => new o.Scene(), []), [
    x,
    {
      points: a,
      interactiveMesh: v,
      positions: u,
      uvs: m
    }
  ] = In({
    scene: f,
    size: e,
    dpr: t,
    geometry: l,
    positions: c,
    uvs: i,
    onBeforeInit: d
  }), [h, M] = $({
    scene: f,
    camera: s,
    size: e,
    dpr: p.fbo,
    isSizeUpdate: n,
    depthBuffer: !0,
    ...r
  }), b = _(
    (S, C, T) => (x(S, C, T), M(S.gl)),
    [M, x]
  ), g = _(
    (S, C) => {
      x(null, S, C);
    },
    [x]
  );
  return [
    b,
    g,
    {
      scene: f,
      points: a,
      interactiveMesh: v,
      renderTarget: h,
      output: h.texture,
      positions: u,
      uvs: m
    }
  ];
}, Pe = (e) => {
  const t = e.shaderType === "MeshDepthMaterial";
  e.vertexShader = e.vertexShader.replace(
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
			#ifdef USE_ALPHAHASH
			vPosition = vec3( position );
			#endif
		`
  ), e.vertexShader = e.vertexShader.replace(
    "void main() {",
    `
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;

		${t ? "attribute vec4 tangent;" : ""}
		
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
		`
  );
}, zn = (e) => {
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
var Un = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, On = `#ifdef USE_TRANSMISSION

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
const Bn = ({
  mat: e,
  isCustomTransmission: t,
  parameters: n
}) => {
  e.type === "MeshPhysicalMaterial" && t && (n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_pars_fragment>",
    `${Un}`
  ), n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_fragment>",
    `${On}`
  )), e.normalMap || (n.vertexShader = n.vertexShader.replace(
    "void main() {",
    `
				attribute vec4 tangent;
				
				void main() {
			`
  ));
}, En = ({
  baseMaterial: e,
  materialParameters: t,
  isCustomTransmission: n = !1,
  onBeforeInit: r,
  depthOnBeforeInit: s,
  depth: l = !1
}) => {
  const { material: c, depthMaterial: i } = y(() => {
    const d = new (e || o.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(d.userData, {
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
    }), d.onBeforeCompile = (f) => {
      Pe(f), zn(f), Bn({
        parameters: f,
        mat: d,
        isCustomTransmission: n
      });
      const x = V(
        {
          fragmentShader: f.fragmentShader,
          vertexShader: f.vertexShader,
          // Because wobble3D uses userData to update uniforms.
          uniforms: d.userData.uniforms
        },
        r
      );
      f.fragmentShader = x.fragmentShader, f.vertexShader = x.vertexShader, Object.assign(f.uniforms, x.uniforms);
    }, d.needsUpdate = !0;
    let p = null;
    return l && (p = new o.MeshDepthMaterial({
      depthPacking: o.RGBADepthPacking
    }), p.onBeforeCompile = (f) => {
      Object.assign(f.uniforms, d.userData.uniforms), Pe(f), V(f, s);
    }, p.needsUpdate = !0), { material: d, depthMaterial: p };
  }, [
    t,
    e,
    r,
    s,
    n,
    l
  ]);
  return Z(() => () => {
    i && i.dispose();
  }, [i]), {
    material: c,
    depthMaterial: i
  };
}, Ln = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: s,
  depth: l,
  onBeforeInit: c,
  depthOnBeforeInit: i
}) => {
  const d = y(() => {
    let h = t || new o.IcosahedronGeometry(2, 20);
    return h = Ee(h), h.computeTangents(), h;
  }, [t]), { material: p, depthMaterial: f } = En({
    baseMaterial: r,
    materialParameters: s,
    isCustomTransmission: n,
    onBeforeInit: c,
    depthOnBeforeInit: i,
    depth: l
  }), x = E(e, d, p, o.Mesh), a = p.userData, v = R(a), u = F(a);
  return [
    _(
      (h, M, b) => {
        h && v(
          "uTime",
          (M == null ? void 0 : M.beat) || h.clock.getElapsedTime()
        ), M !== void 0 && (v("uWobbleStrength", M.wobbleStrength), v(
          "uWobblePositionFrequency",
          M.wobblePositionFrequency
        ), v("uWobbleTimeFrequency", M.wobbleTimeFrequency), v("uWarpStrength", M.warpStrength), v("uWarpPositionFrequency", M.warpPositionFrequency), v("uWarpTimeFrequency", M.warpTimeFrequency), v("uColor0", M.color0), v("uColor1", M.color1), v("uColor2", M.color2), v("uColor3", M.color3), v("uColorMix", M.colorMix), v("uEdgeThreshold", M.edgeThreshold), v("uEdgeColor", M.edgeColor), v("uChromaticAberration", M.chromaticAberration), v("uAnisotropicBlur", M.anisotropicBlur), v("uDistortion", M.distortion), v("uDistortionScale", M.distortionScale), v("uRefractionSamples", M.refractionSamples), v("uTemporalDistortion", M.temporalDistortion), u(b));
      },
      [v, u]
    ),
    {
      mesh: x,
      depthMaterial: f
    }
  ];
}, W = Object.freeze({
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
  color0: new o.Color(16711680),
  color1: new o.Color(65280),
  color2: new o.Color(255),
  color3: new o.Color(16776960),
  colorMix: 1,
  edgeThreshold: 0,
  edgeColor: new o.Color(0),
  chromaticAberration: 0.1,
  anisotropicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.1,
  temporalDistortion: 0,
  refractionSamples: 6,
  beat: !1
}), Sr = ({
  size: e,
  dpr: t,
  renderTargetOptions: n,
  isSizeUpdate: r,
  camera: s,
  geometry: l,
  baseMaterial: c,
  materialParameters: i,
  isCustomTransmission: d,
  onBeforeInit: p,
  depthOnBeforeInit: f,
  depth: x
}) => {
  const a = U(t), v = y(() => new o.Scene(), []), [u, { mesh: m, depthMaterial: h }] = Ln({
    baseMaterial: c,
    materialParameters: i,
    scene: v,
    geometry: l,
    isCustomTransmission: d,
    onBeforeInit: p,
    depthOnBeforeInit: f,
    depth: x
  }), [M, b] = $({
    scene: v,
    camera: s,
    size: e,
    dpr: a.fbo,
    isSizeUpdate: r,
    depthBuffer: !0,
    ...n
  }), g = _(
    (C, T, A) => (u(C, T, A), b(C.gl)),
    [b, u]
  ), S = _(
    (C, T) => {
      u(null, C, T);
    },
    [u]
  );
  return [
    g,
    S,
    {
      scene: v,
      mesh: m,
      depthMaterial: h,
      renderTarget: M,
      output: M.texture
    }
  ];
}, _r = (e, t, n) => {
  const r = y(() => {
    const s = new o.Mesh(t, n);
    return e.add(s), s;
  }, [t, n, e]);
  return Z(() => () => {
    e.remove(r), t.dispose(), n.dispose();
  }, [e, t, n, r]), r;
}, $n = (e, t, n, r, s, l) => {
  const c = e < n - s || t < r - s, i = e > n + s || t > r + s;
  return l === "smaller" && c || l === "larger" && i || l === "both" && (c || i);
}, Cr = ({
  size: e,
  boundFor: t,
  threshold: n
}) => {
  const r = B(e);
  return y(() => {
    const { width: l, height: c } = e, { width: i, height: d } = r.current, p = $n(
      l,
      c,
      i,
      d,
      n,
      t
    );
    return p && (r.current = e), p;
  }, [e, t, n]);
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
function jn(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const wr = (e, t = "easeOutQuart") => {
  const n = e / 60, r = ge[t];
  return _(
    (l) => {
      let c = l.getElapsedTime() * n;
      const i = Math.floor(c), d = r(c - i);
      c = d + i;
      const p = jn(i);
      return {
        beat: c,
        floor: i,
        fract: d,
        hash: p
      };
    },
    [n, r]
  );
}, Tr = (e = 60) => {
  const t = y(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = B(null);
  return _(
    (s) => {
      const l = s.getElapsedTime();
      return n.current === null || l - n.current >= t ? (n.current = l, !0) : !1;
    },
    [t]
  );
}, qn = (e) => {
  var r, s;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (s = e.texture) == null ? void 0 : s.length;
  return !t || !n || t !== n;
};
var Wn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Nn = `precision highp float;

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
const kn = ({
  params: e,
  scene: t,
  onBeforeInit: n
}) => {
  t.children.length > 0 && (t.children.forEach((r) => {
    r instanceof o.Mesh && (r.geometry.dispose(), r.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((r, s) => {
    const l = new o.ShaderMaterial({
      ...V(
        {
          uniforms: {
            u_texture: { value: r },
            u_textureResolution: {
              value: new o.Vector2(0, 0)
            },
            u_resolution: { value: new o.Vector2(0, 0) },
            u_borderRadius: {
              value: e.boderRadius[s] ? e.boderRadius[s] : 0
            }
          },
          vertexShader: Wn,
          fragmentShader: Nn
        },
        n
      ),
      ...I,
      // Must be transparent.
      transparent: !0
    }), c = new o.Mesh(new o.PlaneGeometry(1, 1), l);
    t.add(c);
  });
}, Gn = () => {
  const e = B([]), t = B([]);
  return _(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: s,
      params: l
    }) => {
      e.current.length > 0 && e.current.forEach((i, d) => {
        i.unobserve(t.current[d]);
      }), t.current = [], e.current = [];
      const c = new Array(l.dom.length).fill(!1);
      r.current = [...c], s.current = [...c], l.dom.forEach((i, d) => {
        const p = (x) => {
          x.forEach((a) => {
            l.onIntersect[d] && l.onIntersect[d](a), r.current[d] = a.isIntersecting;
          });
        }, f = new IntersectionObserver(p, {
          rootMargin: "0px",
          threshold: 0
        });
        f.observe(i), e.current.push(f), t.current.push(i);
      });
    },
    []
  );
}, Kn = () => {
  const e = B([]), t = _(
    ({
      params: n,
      customParams: r,
      size: s,
      resolutionRef: l,
      scene: c,
      isIntersectingRef: i
    }) => {
      c.children.length !== e.current.length && (e.current = new Array(c.children.length)), c.children.forEach((d, p) => {
        var a, v, u, m, h, M;
        const f = n.dom[p];
        if (!f)
          return;
        const x = f.getBoundingClientRect();
        if (e.current[p] = x, d.scale.set(x.width, x.height, 1), d.position.set(
          x.left + x.width * 0.5 - s.width * 0.5,
          -x.top - x.height * 0.5 + s.height * 0.5,
          0
        ), i.current[p] && (n.rotation[p] && d.rotation.copy(n.rotation[p]), d instanceof o.Mesh)) {
          const b = d.material, g = R(b), S = F(b);
          g("u_texture", n.texture[p]), g("u_textureResolution", [
            ((u = (v = (a = n.texture[p]) == null ? void 0 : a.source) == null ? void 0 : v.data) == null ? void 0 : u.width) || 0,
            ((M = (h = (m = n.texture[p]) == null ? void 0 : m.source) == null ? void 0 : h.data) == null ? void 0 : M.height) || 0
          ]), g(
            "u_resolution",
            l.current.set(x.width, x.height)
          ), g(
            "u_borderRadius",
            n.boderRadius[p] ? n.boderRadius[p] : 0
          ), S(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Hn = () => {
  const e = B([]), t = B([]), n = _((r, s = !1) => {
    e.current.forEach((c, i) => {
      c && (t.current[i] = !0);
    });
    const l = s ? [...t.current] : [...e.current];
    return r < 0 ? l : l[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, Xn = (e) => ({ onView: n, onHidden: r }) => {
  const s = B(!1);
  Z(() => {
    let l;
    const c = () => {
      e.current.some((i) => i) ? s.current || (n && n(), s.current = !0) : s.current && (r && r(), s.current = !1), l = requestAnimationFrame(c);
    };
    return l = requestAnimationFrame(c), () => {
      cancelAnimationFrame(l);
    };
  }, [n, r]);
}, Yn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Dr = ({ size: e, dpr: t, isSizeUpdate: n, renderTargetOptions: r, onBeforeInit: s }, l = []) => {
  const c = U(t), i = y(() => new o.Scene(), []), d = L(e), [p, f] = $({
    scene: i,
    camera: d,
    size: e,
    dpr: c.fbo,
    isSizeUpdate: n,
    ...r
  }), [x, a] = j({
    ...Yn,
    updateKey: performance.now()
  }), [v, u] = Kn(), m = B(new o.Vector2(0, 0)), [h, M] = Be(!0);
  y(
    () => M(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    l
  );
  const b = B(null), g = y(() => w, []), S = Gn(), { isIntersectingOnceRef: C, isIntersectingRef: T, isIntersecting: A } = Hn(), z = Xn(T), P = y(() => (D, k) => {
    a(D), u({
      params: x,
      customParams: k,
      size: e,
      resolutionRef: m,
      scene: i,
      isIntersectingRef: T
    });
  }, [T, a, u, e, i, x]);
  return [
    _(
      (D, k, H) => {
        const { gl: ee, size: te } = D;
        if (P(k, H), qn(x))
          return g;
        if (h) {
          if (b.current === x.updateKey)
            return g;
          b.current = x.updateKey;
        }
        return h && (kn({
          params: x,
          size: te,
          scene: i,
          onBeforeInit: s
        }), S({
          isIntersectingRef: T,
          isIntersectingOnceRef: C,
          params: x
        }), M(!1)), f(ee);
      },
      [
        f,
        S,
        s,
        P,
        h,
        i,
        x,
        C,
        T,
        g
      ]
    ),
    P,
    {
      scene: i,
      camera: d,
      renderTarget: p,
      output: p.texture,
      isIntersecting: A,
      DOMRects: v,
      intersections: T.current,
      useDomView: z
    }
  ];
}, Pr = (e, t) => {
  const {
    scene: n,
    camera: r,
    size: s,
    dpr: l = !1,
    isSizeUpdate: c = !1,
    depth: i = !1,
    ...d
  } = e, p = B([]), f = K(s, l);
  p.current = y(() => Array.from({ length: t }, () => {
    const a = new o.WebGLRenderTarget(
      f.x,
      f.y,
      {
        ...he,
        ...d
      }
    );
    return i && (a.depthTexture = new o.DepthTexture(
      f.x,
      f.y,
      o.FloatType
    )), a;
  }), [t]), c && p.current.forEach(
    (a) => a.setSize(f.x, f.y)
  ), Z(() => {
    const a = p.current;
    return () => {
      a.forEach((v) => v.dispose());
    };
  }, [t]);
  const x = _(
    (a, v, u) => {
      const m = p.current[v];
      return _e({
        gl: a,
        scene: n,
        camera: r,
        fbo: m,
        onBeforeRender: () => u && u({ read: m.texture })
      }), m.texture;
    },
    [n, r]
  );
  return [p.current, x];
}, Rr = Object.freeze({
  interpolate(e, t, n, r = 1e-6) {
    const s = e + (t - e) * n;
    return Math.abs(s) < r ? 0 : s;
  },
  smoothstep(e, t, n) {
    const r = Math.min(Math.max((n - e) / (t - e), 0), 1);
    return r * r * (3 - 2 * r);
  }
});
export {
  en as ALPHABLENDING_PARAMS,
  Cn as BLANK_PARAMS,
  ve as BLENDING_PARAMS,
  de as BRIGHTNESSPICKER_PARAMS,
  re as BRUSH_PARAMS,
  Q as CHROMAKEY_PARAMS,
  Y as COLORSTRATA_PARAMS,
  ce as COSPALETTE_PARAMS,
  sn as COVERTEXTURE_PARAMS,
  Ae as DELTA_TIME,
  Yn as DOMSYNCER_PARAMS,
  be as DUOTONE_PARAMS,
  ge as Easing,
  he as FBO_DEFAULT_OPTION,
  yt as FLUID_PARAMS,
  Ve as FXBLENDING_PARAMS,
  ae as FXTEXTURE_PARAMS,
  Me as HSV_PARAMS,
  ue as MARBLE_PARAMS,
  O as MORPHPARTICLES_PARAMS,
  fe as MOTIONBLUR_PARAMS,
  oe as NOISE_PARAMS,
  yr as RAWBLANK_PARAMS,
  _t as RIPPLE_PARAMS,
  Fe as SIMPLEBLUR_PARAMS,
  Xe as ShaderChunk,
  Rr as Utils,
  me as WAVE_PARAMS,
  W as WOBBLE3D_PARAMS,
  _e as renderFBO,
  F as setCustomUniform,
  R as setUniform,
  _r as useAddMesh,
  vr as useAlphaBlending,
  wr as useBeat,
  xr as useBlank,
  ur as useBlending,
  lr as useBrightnessPicker,
  Jn as useBrush,
  L as useCamera,
  hr as useChromaKey,
  rr as useColorStrata,
  Pr as useCopyTexture,
  ar as useCosPalette,
  pr as useCoverTexture,
  In as useCreateMorphParticles,
  Ln as useCreateWobble3D,
  Dr as useDomSyncer,
  se as useDoubleFBO,
  ir as useDuoTone,
  Tr as useFPSLimiter,
  er as useFluid,
  cr as useFxBlending,
  sr as useFxTexture,
  mr as useHSV,
  or as useMarble,
  Mr as useMorphParticles,
  fr as useMotionBlur,
  nr as useNoise,
  j as useParams,
  Se as usePointer,
  br as useRawBlank,
  Cr as useResizeBoundary,
  K as useResolution,
  tr as useRipple,
  dr as useSimpleBlur,
  $ as useSingleFBO,
  gr as useWave,
  Sr as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
