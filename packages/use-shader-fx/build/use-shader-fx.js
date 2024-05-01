import * as i from "three";
import { BufferAttribute as Te } from "three";
import { useMemo as b, useEffect as re, useRef as O, useCallback as A, useState as Ee } from "react";
var We = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Le = `precision highp float;

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
  return b(
    () => new i.Vector2(n, r),
    [n, r]
  );
}, P = (e) => (t, n) => {
  if (n === void 0)
    return;
  const r = e.uniforms;
  r && r[t] && (r[t].value = n);
}, V = (e) => (t) => {
  t !== void 0 && Object.keys(t).forEach((n) => {
    const r = e.uniforms;
    r && r[n] && (r[n].value = t[n]);
  });
}, W = (e, t, n, r) => {
  const a = b(() => {
    const v = new r(t, n);
    return e && e.add(v), v;
  }, [t, n, r, e]);
  return re(() => () => {
    e && e.remove(a), t.dispose(), n.dispose();
  }, [e, t, n, a]), a;
}, Ae = process.env.NODE_ENV === "development", z = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, w = new i.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  i.RGBAFormat
), $e = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: a
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uBuffer: { value: w },
        uResolution: { value: new i.Vector2(0, 0) },
        uTexture: { value: w },
        uIsTexture: { value: !1 },
        uMap: { value: w },
        uIsMap: { value: !1 },
        uMapIntensity: { value: ee.mapIntensity },
        uRadius: { value: ee.radius },
        uSmudge: { value: ee.smudge },
        uDissipation: { value: ee.dissipation },
        uMotionBlur: { value: ee.motionBlur },
        uMotionSample: { value: ee.motionSample },
        uMouse: { value: new i.Vector2(-10, -10) },
        uPrevMouse: { value: new i.Vector2(-10, -10) },
        uVelocity: { value: new i.Vector2(0, 0) },
        uColor: { value: ee.color },
        uIsCursor: { value: !1 },
        uPressureStart: { value: 1 },
        uPressureEnd: { value: 1 },
        ...r
      },
      vertexShader: We,
      fragmentShader: Le,
      ...z,
      // Must be transparent
      transparent: !0
    });
    return a && (f.onBeforeCompile = a), f;
  }, [a, r]), u = K(t, n);
  P(s)("uResolution", u.clone());
  const c = W(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, qe = (e, t) => {
  const n = t, r = e / t, [a, v] = [n * r / 2, n / 2];
  return { width: a, height: v, near: -1e3, far: 1e3 };
}, $ = (e, t = "OrthographicCamera") => {
  const n = K(e), { width: r, height: a, near: v, far: s } = qe(
    n.x,
    n.y
  );
  return b(() => t === "OrthographicCamera" ? new i.OrthographicCamera(
    -r,
    r,
    a,
    -a,
    v,
    s
  ) : new i.PerspectiveCamera(50, r / a), [r, a, v, s, t]);
}, Me = (e = 0) => {
  const t = O(new i.Vector2(0, 0)), n = O(new i.Vector2(0, 0)), r = O(new i.Vector2(0, 0)), a = O(0), v = O(new i.Vector2(0, 0)), s = O(!1);
  return A(
    (c) => {
      const f = performance.now();
      let d;
      s.current && e ? (r.current = r.current.lerp(
        c,
        1 - e
      ), d = r.current.clone()) : (d = c.clone(), r.current = d), a.current === 0 && (a.current = f, t.current = d);
      const x = Math.max(1, f - a.current);
      a.current = f, v.current.copy(d).sub(t.current).divideScalar(x);
      const g = v.current.length() > 0, o = s.current ? t.current.clone() : d;
      return !s.current && g && (s.current = !0), t.current = d, {
        currentPointer: d,
        prevPointer: o,
        diffPointer: n.current.subVectors(d, o),
        velocity: v.current,
        isVelocityUpdate: g
      };
    },
    [e]
  );
}, q = (e) => {
  const n = O(
    ((a) => Object.values(a).some((v) => typeof v == "function"))(e) ? e : structuredClone(e)
  ), r = A((a) => {
    for (const v in a) {
      const s = v;
      s in n.current && a[s] !== void 0 && a[s] !== null ? n.current[s] = a[s] : console.error(
        `"${String(
          s
        )}" does not exist in the params. or "${String(
          s
        )}" is null | undefined`
      );
    }
  }, []);
  return [n.current, r];
}, ge = {
  minFilter: i.LinearFilter,
  magFilter: i.LinearFilter,
  type: i.HalfFloatType,
  stencilBuffer: !1
}, Se = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: a,
  onSwap: v
}) => {
  e.setRenderTarget(t), a(), e.clear(), e.render(n, r), v && v(), e.setRenderTarget(null), e.clear();
}, N = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: a = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var x;
  const c = O(), f = K(n, r);
  c.current = b(
    () => {
      const g = new i.WebGLRenderTarget(
        f.x,
        f.y,
        {
          ...ge,
          samples: v,
          depthBuffer: s
        }
      );
      return u && (g.depthTexture = new i.DepthTexture(
        f.x,
        f.y,
        i.FloatType
      )), g;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), a && ((x = c.current) == null || x.setSize(f.x, f.y)), re(() => {
    const g = c.current;
    return () => {
      g == null || g.dispose();
    };
  }, []);
  const d = A(
    (g, o) => {
      const m = c.current;
      return Se({
        gl: g,
        fbo: m,
        scene: e,
        camera: t,
        onBeforeRender: () => o && o({ read: m.texture })
      }), m.texture;
    },
    [e, t]
  );
  return [c.current, d];
}, ae = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: a = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var g, o;
  const c = O({
    read: null,
    write: null,
    swap: function() {
      let m = this.read;
      this.read = this.write, this.write = m;
    }
  }), f = K(n, r), d = b(() => {
    const m = new i.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: v,
      depthBuffer: s
    }), l = new i.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: v,
      depthBuffer: s
    });
    return u && (m.depthTexture = new i.DepthTexture(
      f.x,
      f.y,
      i.FloatType
    ), l.depthTexture = new i.DepthTexture(
      f.x,
      f.y,
      i.FloatType
    )), { read: m, write: l };
  }, []);
  c.current.read = d.read, c.current.write = d.write, a && ((g = c.current.read) == null || g.setSize(f.x, f.y), (o = c.current.write) == null || o.setSize(f.x, f.y)), re(() => {
    const m = c.current;
    return () => {
      var l, p;
      (l = m.read) == null || l.dispose(), (p = m.write) == null || p.dispose();
    };
  }, []);
  const x = A(
    (m, l) => {
      var h;
      const p = c.current;
      return Se({
        gl: m,
        scene: e,
        camera: t,
        fbo: p.write,
        onBeforeRender: () => l && l({
          read: p.read.texture,
          write: p.write.texture
        }),
        onSwap: () => p.swap()
      }), (h = p.read) == null ? void 0 : h.texture;
    },
    [e, t]
  );
  return [
    { read: c.current.read, write: c.current.write },
    x
  ];
}, B = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, ee = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new i.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), En = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = $e({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), x = Me(), [g, o] = ae({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [m, l] = q(ee), p = O(null), h = P(c), S = V(c);
  return [
    A(
      (y, _, C) => {
        const { gl: T, pointer: U } = y;
        _ && l(_), m.texture ? (h("uIsTexture", !0), h("uTexture", m.texture)) : h("uIsTexture", !1), m.map ? (h("uIsMap", !0), h("uMap", m.map), h("uMapIntensity", m.mapIntensity)) : h("uIsMap", !1), h("uRadius", m.radius), h("uSmudge", m.smudge), h("uDissipation", m.dissipation), h("uMotionBlur", m.motionBlur), h("uMotionSample", m.motionSample);
        const F = m.pointerValues || x(U);
        F.isVelocityUpdate && (h("uMouse", F.currentPointer), h("uPrevMouse", F.prevPointer)), h("uVelocity", F.velocity);
        const I = typeof m.color == "function" ? m.color(F.velocity) : m.color;
        return h("uColor", I), h("uIsCursor", m.isCursor), h("uPressureEnd", m.pressure), p.current === null && (p.current = m.pressure), h("uPressureStart", p.current), p.current = m.pressure, S(C), o(T, ({ read: R }) => {
          h("uBuffer", R);
        });
      },
      [
        h,
        x,
        o,
        m,
        l,
        S
      ]
    ),
    l,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: g,
      output: g.read.texture
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
}`, je = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Ne = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: t,
    vertexShader: Z,
    fragmentShader: je,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var ke = `precision highp float;

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
}`;
const Ge = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: w },
      uSource: { value: w },
      texelSize: { value: new i.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 },
      ...t
    },
    vertexShader: Z,
    fragmentShader: ke,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Ke = `precision highp float;

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
}`;
const Xe = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: Ke,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Ye = `precision highp float;

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
}`;
const He = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: Ye,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Qe = `precision highp float;

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
const Ze = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: Qe,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Je = `precision highp float;

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
const et = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: Je,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var tt = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const nt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uTexture: { value: w },
      value: { value: 0 },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: tt,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var rt = `precision highp float;

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
}`;
const ot = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uPressure: { value: w },
      uVelocity: { value: w },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: rt,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var at = `precision highp float;

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
const it = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uTarget: { value: w },
      aspectRatio: { value: 0 },
      color: { value: new i.Vector3() },
      point: { value: new i.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: Z,
    fragmentShader: at,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]), Y = (e, t) => {
  const n = t == null ? void 0 : t.onBeforeCompile;
  return e({
    onBeforeCompile: n
  });
}, ut = ({
  scene: e,
  size: t,
  dpr: n,
  fluidOnBeforeCompile: r
}) => {
  const a = b(() => new i.PlaneGeometry(2, 2), []), {
    curl: v,
    vorticity: s,
    advection: u,
    divergence: c,
    pressure: f,
    clear: d,
    gradientSubtract: x,
    splat: g
  } = r ?? {}, o = Y(Ne), m = o.clone(), l = Y(Ze, v), p = Y(et, s), h = Y(Ge, u), S = Y(
    Xe,
    c
  ), M = Y(He, f), y = Y(nt, d), _ = Y(
    ot,
    x
  ), C = Y(it, g), T = b(
    () => ({
      vorticityMaterial: p,
      curlMaterial: l,
      advectionMaterial: h,
      divergenceMaterial: S,
      pressureMaterial: M,
      clearMaterial: y,
      gradientSubtractMaterial: _,
      splatMaterial: C
    }),
    [
      p,
      l,
      h,
      S,
      M,
      y,
      _,
      C
    ]
  ), U = K(t, n);
  b(() => {
    P(T.splatMaterial)(
      "aspectRatio",
      U.x / U.y
    );
    for (const R of Object.values(T))
      P(R)(
        "texelSize",
        new i.Vector2(1 / U.x, 1 / U.y)
      );
  }, [U, T]);
  const F = W(e, a, o, i.Mesh);
  b(() => {
    o.dispose(), F.material = m;
  }, [o, F, m]), re(() => () => {
    for (const R of Object.values(T))
      R.dispose();
  }, [T]);
  const I = A(
    (R) => {
      F.material = R, F.material.needsUpdate = !0;
    },
    [F]
  );
  return { materials: T, setMeshMaterial: I, mesh: F };
}, st = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new i.Vector3(1, 1, 1),
  pointerValues: !1
}), Wn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  fluidOnBeforeCompile: a
}) => {
  const v = B(t), s = b(() => new i.Scene(), []), { materials: u, setMeshMaterial: c, mesh: f } = ut({
    scene: s,
    size: e,
    dpr: v.shader,
    fluidOnBeforeCompile: a
  }), d = $(e), x = Me(), g = b(
    () => ({
      scene: s,
      camera: d,
      dpr: v.fbo,
      size: e,
      samples: n,
      isSizeUpdate: r
    }),
    [s, d, e, n, v.fbo, r]
  ), [o, m] = ae(g), [l, p] = ae(g), [h, S] = N(g), [M, y] = N(g), [_, C] = ae(g), T = O(0), U = O(new i.Vector2(0, 0)), F = O(new i.Vector3(0, 0, 0)), [I, R] = q(st), D = b(
    () => ({
      advection: P(u.advectionMaterial),
      splat: P(u.splatMaterial),
      curl: P(u.curlMaterial),
      vorticity: P(u.vorticityMaterial),
      divergence: P(u.divergenceMaterial),
      clear: P(u.clearMaterial),
      pressure: P(u.pressureMaterial),
      gradientSubtract: P(u.gradientSubtractMaterial)
    }),
    [u]
  ), k = b(
    () => ({
      advection: V(u.advectionMaterial),
      splat: V(u.splatMaterial),
      curl: V(u.curlMaterial),
      vorticity: V(u.vorticityMaterial),
      divergence: V(u.divergenceMaterial),
      clear: V(u.clearMaterial),
      pressure: V(u.pressureMaterial),
      gradientSubtract: V(u.gradientSubtractMaterial)
    }),
    [u]
  );
  return [
    A(
      (X, ce, ie) => {
        const { gl: G, pointer: ze, clock: he, size: _e } = X;
        ce && R(ce), T.current === 0 && (T.current = he.getElapsedTime());
        const we = Math.min(
          (he.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = he.getElapsedTime();
        const xe = m(G, ({ read: j }) => {
          c(u.advectionMaterial), D.advection("uVelocity", j), D.advection("uSource", j), D.advection("dt", we), D.advection("dissipation", I.velocity_dissipation);
        }), Ue = p(G, ({ read: j }) => {
          c(u.advectionMaterial), D.advection("uVelocity", xe), D.advection("uSource", j), D.advection("dissipation", I.density_dissipation);
        }), pe = I.pointerValues || x(ze);
        pe.isVelocityUpdate && (m(G, ({ read: j }) => {
          c(u.splatMaterial), D.splat("uTarget", j), D.splat("point", pe.currentPointer);
          const ue = pe.diffPointer.multiply(
            U.current.set(_e.width, _e.height).multiplyScalar(I.velocity_acceleration)
          );
          D.splat(
            "color",
            F.current.set(ue.x, ue.y, 1)
          ), D.splat("radius", I.splat_radius);
        }), p(G, ({ read: j }) => {
          c(u.splatMaterial), D.splat("uTarget", j);
          const ue = typeof I.fluid_color == "function" ? I.fluid_color(pe.velocity) : I.fluid_color;
          D.splat("color", ue);
        }));
        const Oe = S(G, () => {
          c(u.curlMaterial), D.curl("uVelocity", xe);
        });
        m(G, ({ read: j }) => {
          c(u.vorticityMaterial), D.vorticity("uVelocity", j), D.vorticity("uCurl", Oe), D.vorticity("curl", I.curl_strength), D.vorticity("dt", we);
        });
        const Be = y(G, () => {
          c(u.divergenceMaterial), D.divergence("uVelocity", xe);
        });
        C(G, ({ read: j }) => {
          c(u.clearMaterial), D.clear("uTexture", j), D.clear("value", I.pressure_dissipation);
        }), c(u.pressureMaterial), D.pressure("uDivergence", Be);
        let Ce;
        for (let j = 0; j < I.pressure_iterations; j++)
          Ce = C(G, ({ read: ue }) => {
            D.pressure("uPressure", ue);
          });
        return m(G, ({ read: j }) => {
          c(u.gradientSubtractMaterial), D.gradientSubtract("uPressure", Ce), D.gradientSubtract("uVelocity", j);
        }), ie && Object.keys(ie).forEach((j) => {
          k[j](
            ie[j]
          );
        }), Ue;
      },
      [
        u,
        D,
        c,
        S,
        p,
        y,
        x,
        C,
        m,
        k,
        R,
        I
      ]
    ),
    R,
    {
      scene: s,
      mesh: f,
      materials: u,
      camera: d,
      renderTarget: {
        velocity: o,
        density: l,
        curl: h,
        divergence: M,
        pressure: _
      },
      output: l.read.texture
    }
  ];
};
var lt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`, ct = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const vt = ({
  scale: e,
  max: t,
  texture: n,
  scene: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = b(
    () => new i.PlaneGeometry(e, e),
    [e]
  ), u = b(() => new i.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uMap: { value: n || w },
      ...a
    },
    blending: i.AdditiveBlending,
    vertexShader: lt,
    fragmentShader: ct,
    ...z,
    // Must be transparent.
    transparent: !0
  }), [n, a]), c = b(() => {
    const f = [];
    for (let d = 0; d < t; d++) {
      const x = u.clone();
      v && (x.onBeforeCompile = v);
      const g = new i.Mesh(s.clone(), x);
      g.rotateZ(2 * Math.PI * Math.random()), g.visible = !1, r.add(g), f.push(g);
    }
    return f;
  }, [v, s, u, r, t]);
  return re(() => () => {
    c.forEach((f) => {
      f.geometry.dispose(), Array.isArray(f.material) ? f.material.forEach((d) => d.dispose()) : f.material.dispose(), r.remove(f);
    });
  }, [r, c]), c;
}, pt = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), Ln = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: r,
  dpr: a,
  samples: v,
  isSizeUpdate: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = B(a), d = b(() => new i.Scene(), []), x = vt({
    scale: t,
    max: n,
    texture: e,
    scene: d,
    uniforms: u,
    onBeforeCompile: c
  }), g = $(r), o = Me(), [m, l] = N({
    scene: d,
    camera: g,
    size: r,
    dpr: f.fbo,
    samples: v,
    isSizeUpdate: s
  }), [p, h] = q(pt), S = O(0);
  return [
    A(
      (y, _, C) => {
        const { gl: T, pointer: U, size: F } = y;
        _ && h(_);
        const I = p.pointerValues || o(U);
        if (p.frequency < I.diffPointer.length()) {
          const R = x[S.current], D = R.material;
          R.visible = !0, R.position.set(
            I.currentPointer.x * (F.width / 2),
            I.currentPointer.y * (F.height / 2),
            0
          ), R.scale.x = R.scale.y = 0, P(D)("uOpacity", p.alpha), S.current = (S.current + 1) % n;
        }
        return x.forEach((R) => {
          if (R.visible) {
            const D = R.material;
            R.rotation.z += p.rotation, R.scale.x = p.fadeout_speed * R.scale.x + p.scale, R.scale.y = R.scale.x;
            const k = D.uniforms.uOpacity.value;
            P(D)(
              "uOpacity",
              k * p.fadeout_speed
            ), k < 1e-3 && (R.visible = !1), V(D)(C);
          }
        }), l(T);
      },
      [l, x, o, n, p, h]
    ),
    h,
    {
      scene: d,
      camera: g,
      meshArr: x,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var mt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, dt = `precision highp float;
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
const ft = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        scale: { value: te.scale },
        timeStrength: { value: te.timeStrength },
        noiseOctaves: { value: te.noiseOctaves },
        fbmOctaves: { value: te.fbmOctaves },
        warpOctaves: { value: te.warpOctaves },
        warpDirection: { value: te.warpDirection },
        warpStrength: { value: te.warpStrength },
        ...t
      },
      vertexShader: mt,
      fragmentShader: dt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, te = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new i.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), $n = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = ft({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(te), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _, clock: C } = S;
        return M && m(M), l("scale", o.scale), l("timeStrength", o.timeStrength), l("noiseOctaves", o.noiseOctaves), l("fbmOctaves", o.fbmOctaves), l("warpOctaves", o.warpOctaves), l("warpDirection", o.warpDirection), l("warpStrength", o.warpStrength), l("uTime", o.beat || C.getElapsedTime()), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var gt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ht = `precision highp float;
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
const xt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        isTexture: { value: !1 },
        scale: { value: H.scale },
        noise: { value: w },
        noiseStrength: { value: H.noiseStrength },
        isNoise: { value: !1 },
        laminateLayer: { value: H.laminateLayer },
        laminateInterval: { value: H.laminateInterval },
        laminateDetail: { value: H.laminateDetail },
        distortion: { value: H.distortion },
        colorFactor: { value: H.colorFactor },
        uTime: { value: 0 },
        timeStrength: { value: H.timeStrength },
        ...t
      },
      vertexShader: gt,
      fragmentShader: ht,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, H = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new i.Vector2(0.1, 0.1),
  laminateDetail: new i.Vector2(1, 1),
  distortion: new i.Vector2(0, 0),
  colorFactor: new i.Vector3(1, 1, 1),
  timeStrength: new i.Vector2(0, 0),
  noise: !1,
  noiseStrength: new i.Vector2(0, 0),
  beat: !1
}), qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = xt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(H), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _, clock: C } = S;
        return M && m(M), o.texture ? (l("uTexture", o.texture), l("isTexture", !0)) : (l("isTexture", !1), l("scale", o.scale)), o.noise ? (l("noise", o.noise), l("isNoise", !0), l("noiseStrength", o.noiseStrength)) : l("isNoise", !1), l("uTime", o.beat || C.getElapsedTime()), l("laminateLayer", o.laminateLayer), l("laminateInterval", o.laminateInterval), l("laminateDetail", o.laminateDetail), l("distortion", o.distortion), l("colorFactor", o.colorFactor), l("timeStrength", o.timeStrength), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var yt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, bt = `precision highp float;

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
const Mt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: oe.pattern },
        u_complexity: { value: oe.complexity },
        u_complexityAttenuation: {
          value: oe.complexityAttenuation
        },
        u_iterations: { value: oe.iterations },
        u_timeStrength: { value: oe.timeStrength },
        u_scale: { value: oe.scale },
        ...t
      },
      vertexShader: yt,
      fragmentShader: bt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, oe = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Mt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(oe), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _, clock: C } = S;
        return M && m(M), l("u_pattern", o.pattern), l("u_complexity", o.complexity), l("u_complexityAttenuation", o.complexityAttenuation), l("u_iterations", o.iterations), l("u_timeStrength", o.timeStrength), l("u_scale", o.scale), l("u_time", o.beat || C.getElapsedTime()), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var St = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, _t = `precision highp float;
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
const wt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uRgbWeight: { value: se.rgbWeight },
        uColor1: { value: se.color1 },
        uColor2: { value: se.color2 },
        uColor3: { value: se.color3 },
        uColor4: { value: se.color4 },
        ...t
      },
      vertexShader: St,
      fragmentShader: _t,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, se = Object.freeze({
  texture: w,
  color1: new i.Color().set(0.5, 0.5, 0.5),
  color2: new i.Color().set(0.5, 0.5, 0.5),
  color3: new i.Color().set(1, 1, 1),
  color4: new i.Color().set(0, 0.1, 0.2),
  rgbWeight: new i.Vector3(0.299, 0.587, 0.114)
}), Nn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = wt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(se), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("uTexture", o.texture), l("uColor1", o.color1), l("uColor2", o.color2), l("uColor3", o.color3), l("uColor4", o.color4), l("uRgbWeight", o.rgbWeight), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Ct = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Tt = `precision highp float;

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
const Dt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uColor0: { value: ye.color0 },
        uColor1: { value: ye.color1 },
        ...t
      },
      vertexShader: Ct,
      fragmentShader: Tt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, ye = Object.freeze({
  texture: w,
  color0: new i.Color(16777215),
  color1: new i.Color(0)
}), kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Dt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(ye), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("uTexture", o.texture), l("uColor0", o.color0), l("uColor1", o.color1), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Rt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Pt = `precision highp float;

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
}`;
const At = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_map: { value: w },
        u_alphaMap: { value: w },
        u_isAlphaMap: { value: !1 },
        u_mapIntensity: { value: le.mapIntensity },
        u_brightness: { value: le.brightness },
        u_min: { value: le.min },
        u_max: { value: le.max },
        u_dodgeColor: { value: le.dodgeColor },
        u_isDodgeColor: { value: !1 },
        ...t
      },
      vertexShader: Rt,
      fragmentShader: Pt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, le = Object.freeze({
  texture: w,
  map: w,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new i.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), Gn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = At({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(le), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("u_texture", o.texture), l("u_map", o.map), l("u_mapIntensity", o.mapIntensity), o.alphaMap ? (l("u_alphaMap", o.alphaMap), l("u_isAlphaMap", !0)) : l("u_isAlphaMap", !1), l("u_brightness", o.brightness), l("u_min", o.min), l("u_max", o.max), o.dodgeColor ? (l("u_dodgeColor", o.dodgeColor), l("u_isDodgeColor", !0)) : l("u_isDodgeColor", !1), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var It = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ft = `precision highp float;

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

}`;
const Vt = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: a
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    var d, x;
    const f = new i.ShaderMaterial({
      uniforms: {
        uResolution: { value: new i.Vector2() },
        uTextureResolution: { value: new i.Vector2() },
        uTexture0: { value: w },
        uTexture1: { value: w },
        padding: { value: ne.padding },
        uMap: { value: w },
        edgeIntensity: { value: ne.edgeIntensity },
        mapIntensity: { value: ne.mapIntensity },
        epicenter: { value: ne.epicenter },
        progress: { value: ne.progress },
        dirX: { value: (d = ne.dir) == null ? void 0 : d.x },
        dirY: { value: (x = ne.dir) == null ? void 0 : x.y },
        ...r
      },
      vertexShader: It,
      fragmentShader: Ft,
      ...z
    });
    return a && (f.onBeforeCompile = a), f;
  }, [a, r]), u = K(t, n);
  P(s)("uResolution", u.clone());
  const c = W(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, ne = Object.freeze({
  texture0: w,
  texture1: w,
  padding: 0,
  map: w,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new i.Vector2(0, 0),
  progress: 0,
  dir: new i.Vector2(0, 0)
}), Kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Vt({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(ne), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        var F, I, R, D, k, J, X, ce;
        const { gl: _ } = S;
        M && m(M), l("uTexture0", o.texture0), l("uTexture1", o.texture1), l("progress", o.progress);
        const C = [
          ((I = (F = o.texture0) == null ? void 0 : F.image) == null ? void 0 : I.width) || 0,
          ((D = (R = o.texture0) == null ? void 0 : R.image) == null ? void 0 : D.height) || 0
        ], T = [
          ((J = (k = o.texture1) == null ? void 0 : k.image) == null ? void 0 : J.width) || 0,
          ((ce = (X = o.texture1) == null ? void 0 : X.image) == null ? void 0 : ce.height) || 0
        ], U = C.map((ie, G) => ie + (T[G] - ie) * o.progress);
        return l("uTextureResolution", U), l("padding", o.padding), l("uMap", o.map), l("mapIntensity", o.mapIntensity), l("edgeIntensity", o.edgeIntensity), l("epicenter", o.epicenter), l("dirX", o.dir.x), l("dirY", o.dir.y), p(y), g(_);
      },
      [g, l, o, m, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var zt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ut = `precision highp float;

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
const Ot = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_brightness: { value: me.brightness },
        u_min: { value: me.min },
        u_max: { value: me.max },
        ...t
      },
      vertexShader: zt,
      fragmentShader: Ut,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, me = Object.freeze({
  texture: w,
  brightness: new i.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), Xn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Ot({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(
    me
  ), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("u_texture", o.texture), l("u_brightness", o.brightness), l("u_min", o.min), l("u_max", o.max), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Bt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Et = `precision highp float;

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
}`;
const Wt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_map: { value: w },
        u_mapIntensity: { value: Ie.mapIntensity },
        ...t
      },
      vertexShader: Bt,
      fragmentShader: Et,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, Ie = Object.freeze({
  texture: w,
  map: w,
  mapIntensity: 0.3
}), Yn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Wt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(Ie), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("u_texture", o.texture), l("u_map", o.map), l("u_mapIntensity", o.mapIntensity), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Lt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, $t = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const qt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uMap: { value: w },
        ...t
      },
      vertexShader: Lt,
      fragmentShader: $t,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, jt = Object.freeze({
  texture: w,
  map: w
}), Hn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = qt({
    scene: u,
    size: e,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(jt), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("uTexture", o.texture), l("uMap", o.map), p(y), g(_);
      },
      [l, g, o, m, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Nt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, kt = `precision highp float;

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
const Gt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_brightness: { value: be.brightness },
        u_saturation: { value: be.saturation },
        ...t
      },
      vertexShader: Nt,
      fragmentShader: kt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, be = Object.freeze({
  texture: w,
  brightness: 1,
  saturation: 1
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Gt({
    scene: u,
    size: e,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(be), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("u_texture", o.texture), l("u_brightness", o.brightness), l("u_saturation", o.saturation), p(y), g(_);
      },
      [l, g, o, m, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Kt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xt = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	float screenAspect = uResolution.x / uResolution.y;
	float textureAspect = uTextureResolution.x / uTextureResolution.y;
	vec2 aspectRatio = vec2(
		min(screenAspect / textureAspect, 1.0),
		min(textureAspect / screenAspect, 1.0)
	);
	vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;
	
	gl_FragColor = texture2D(uTexture, uv);

}`;
const Yt = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: a
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uResolution: { value: new i.Vector2() },
        uTextureResolution: { value: new i.Vector2() },
        uTexture: { value: w },
        ...r
      },
      vertexShader: Kt,
      fragmentShader: Xt,
      ...z
    });
    return a && (f.onBeforeCompile = a), f;
  }, [a, r]), u = K(t, n);
  P(s)("uResolution", u.clone());
  const c = W(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, Ht = Object.freeze({
  texture: w
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Yt({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(Ht), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        var C, T, U, F, I, R;
        const { gl: _ } = S;
        return M && m(M), l("uTexture", o.texture), l("uTextureResolution", [
          ((U = (T = (C = o.texture) == null ? void 0 : C.source) == null ? void 0 : T.data) == null ? void 0 : U.width) || 0,
          ((R = (I = (F = o.texture) == null ? void 0 : F.source) == null ? void 0 : I.data) == null ? void 0 : R.height) || 0
        ]), p(y), g(_);
      },
      [g, l, o, m, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Qt = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Zt = `precision highp float;

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
const Jt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uResolution: { value: new i.Vector2(0, 0) },
        uBlurSize: { value: Fe.blurSize },
        ...t
      },
      vertexShader: Qt,
      fragmentShader: Zt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, Fe = Object.freeze({
  texture: w,
  blurSize: 3,
  blurPower: 5
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Jt({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), x = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [g, o] = ae(x), [m, l] = q(Fe), p = P(c), h = V(c);
  return [
    A(
      (M, y, _) => {
        var F, I, R, D, k, J;
        const { gl: C } = M;
        y && l(y), p("uTexture", m.texture), p("uResolution", [
          ((R = (I = (F = m.texture) == null ? void 0 : F.source) == null ? void 0 : I.data) == null ? void 0 : R.width) || 0,
          ((J = (k = (D = m.texture) == null ? void 0 : D.source) == null ? void 0 : k.data) == null ? void 0 : J.height) || 0
        ]), p("uBlurSize", m.blurSize);
        let T = o(C);
        const U = m.blurPower;
        for (let X = 0; X < U; X++)
          p("uTexture", T), T = o(C);
        return h(_), T;
      },
      [o, p, l, m, h]
    ),
    l,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: g,
      output: g.read.texture
    }
  ];
};
var en = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, tn = `precision highp float;

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
const nn = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uBackbuffer: { value: w },
        uBegin: { value: de.begin },
        uEnd: { value: de.end },
        uStrength: { value: de.strength },
        ...t
      },
      vertexShader: en,
      fragmentShader: tn,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, de = Object.freeze({
  texture: w,
  begin: new i.Vector2(0, 0),
  end: new i.Vector2(0, 0),
  strength: 0.9
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = nn({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), x = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [g, o] = ae(x), [m, l] = q(de), p = P(c), h = V(c);
  return [
    A(
      (M, y, _) => {
        const { gl: C } = M;
        return y && l(y), p("uTexture", m.texture), p("uBegin", m.begin), p("uEnd", m.end), p("uStrength", m.strength), h(_), o(C, ({ read: T }) => {
          p("uBackbuffer", T);
        });
      },
      [o, p, l, m, h]
    ),
    l,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: g,
      output: g.read.texture
    }
  ];
};
var rn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, on = `precision highp float;

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
const an = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), a = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: ve.epicenter },
        uProgress: { value: ve.progress },
        uStrength: { value: ve.strength },
        uWidth: { value: ve.width },
        uMode: { value: 0 },
        ...t
      },
      vertexShader: rn,
      fragmentShader: on,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = W(e, r, a, i.Mesh);
  return { material: a, mesh: v };
}, ve = Object.freeze({
  epicenter: new i.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = an({ scene: u, uniforms: a, onBeforeCompile: v }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(ve), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("uEpicenter", o.epicenter), l("uProgress", o.progress), l("uWidth", o.width), l("uStrength", o.strength), l(
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var un = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, sn = `precision highp float;
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
const ln = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: a
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_resolution: { value: new i.Vector2() },
        u_keyColor: { value: Q.color },
        u_similarity: { value: Q.similarity },
        u_smoothness: { value: Q.smoothness },
        u_spill: { value: Q.spill },
        u_color: { value: Q.color },
        u_contrast: { value: Q.contrast },
        u_brightness: { value: Q.brightness },
        u_gamma: { value: Q.gamma },
        ...r
      },
      vertexShader: un,
      fragmentShader: sn,
      ...z
    });
    return a && (f.onBeforeCompile = a), f;
  }, [a, r]), u = K(t, n);
  P(s)("u_resolution", u.clone());
  const c = W(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, Q = Object.freeze({
  texture: w,
  keyColor: new i.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new i.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = ln({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), [x, g] = N({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, m] = q(Q), l = P(c), p = V(c);
  return [
    A(
      (S, M, y) => {
        const { gl: _ } = S;
        return M && m(M), l("u_texture", o.texture), l("u_keyColor", o.keyColor), l("u_similarity", o.similarity), l("u_smoothness", o.smoothness), l("u_spill", o.spill), l("u_color", o.color), l("u_contrast", o.contrast), l("u_brightness", o.brightness), l("u_gamma", o.gamma), p(y), g(_);
      },
      [g, l, m, o, p]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var cn = `precision highp float;

varying vec2 vUv;

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	
	
	gl_Position = usf_Position;
}`, vn = `precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

void main() {
	vec4 usf_FragColor = vec4(1.);

	
	
	gl_FragColor = usf_FragColor;
}`;
const pn = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: a
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uBackbuffer: { value: w },
        uTime: { value: 0 },
        uPointer: { value: new i.Vector2() },
        uResolution: { value: new i.Vector2() },
        ...r
      },
      vertexShader: cn,
      fragmentShader: vn,
      ...z
    });
    return a && (f.onBeforeCompile = a), f;
  }, [a, r]), u = K(t, n);
  P(s)("uResolution", u.clone());
  const c = W(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, mn = Object.freeze({
  texture: w,
  beat: !1
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: a,
  onBeforeCompile: v
}) => {
  const s = B(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = pn({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: a,
    onBeforeCompile: v
  }), d = $(e), x = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [g, o] = ae(x), [m, l] = q(mn), p = P(c), h = V(c);
  return [
    A(
      (M, y, _) => {
        const { gl: C, clock: T, pointer: U } = M;
        return y && l(y), p("uTexture", m.texture), p("uPointer", U), p("uTime", m.beat || T.getElapsedTime()), h(_), o(C, ({ read: F }) => {
          p("uBackbuffer", F);
        });
      },
      [o, p, l, m, h]
    ),
    l,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: g,
      output: g.read.texture
    }
  ];
}, dn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = W(
    e,
    t,
    n,
    i.Points
  ), a = W(
    e,
    b(() => t.clone(), [t]),
    b(() => n.clone(), [n]),
    i.Mesh
  );
  return a.visible = !1, {
    points: r,
    interactiveMesh: a
  };
};
var fn = `uniform vec2 uResolution;
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

#usf <getWobble>

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
}`, gn = `precision highp float;
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
}`, Ve = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
}`;
const De = (e, t, n, r, a) => {
  var d;
  const v = n === "position" ? "positionTarget" : "uvTarget", s = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", u = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", c = n === "position" ? "positionsList" : "uvsList", f = n === "position" ? `
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
      new i.BufferAttribute(e[0], a)
    );
    let x = "", g = "";
    e.forEach((o, m) => {
      t.setAttribute(
        `${v}${m}`,
        new i.BufferAttribute(o, a)
      ), x += `attribute vec${a} ${v}${m};
`, m === 0 ? g += `${v}${m}` : g += `,${v}${m}`;
    }), r = r.replace(
      `${s}`,
      x
    ), r = r.replace(
      `${u}`,
      `vec${a} ${c}[${e.length}] = vec${a}[](${g});
				${f}
			`
    );
  } else
    r = r.replace(`${s}`, ""), r = r.replace(`${u}`, ""), (d = t == null ? void 0 : t.attributes[n]) != null && d.array || Ae && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, Re = (e, t, n, r) => {
  var v;
  let a = [];
  if (e && e.length > 0) {
    (v = t == null ? void 0 : t.attributes[n]) != null && v.array ? a = [
      t.attributes[n].array,
      ...e
    ] : a = e;
    const s = Math.max(...a.map((u) => u.length));
    a.forEach((u, c) => {
      if (u.length < s) {
        const f = (s - u.length) / r, d = [], x = Array.from(u);
        for (let g = 0; g < f; g++) {
          const o = Math.floor(u.length / r * Math.random()) * r;
          for (let m = 0; m < r; m++)
            d.push(x[o + m]);
        }
        a[c] = new Float32Array([...x, ...d]);
      }
    });
  }
  return a;
}, hn = (e, t) => {
  let n = "";
  const r = {};
  let a = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((s, u) => {
    const c = `vMapArrayIndex < ${u}.1`, f = `texture2D(uMapArray${u}, uv)`;
    a += `( ${c} ) ? ${f} : `, n += `
        uniform sampler2D uMapArray${u};
      `, r[`uMapArray${u}`] = { value: s };
  }), a += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (a += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", a).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, xn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: a,
  mapArray: v,
  uniforms: s,
  onBeforeCompile: u
}) => {
  const c = b(
    () => Re(r, n, "position", 3),
    [r, n]
  ), f = b(
    () => Re(a, n, "uv", 2),
    [a, n]
  ), d = b(() => {
    c.length !== f.length && Ae && console.log("use-shader-fx:positions and uvs are not matched");
    const g = De(
      f,
      n,
      "uv",
      De(
        c,
        n,
        "position",
        fn,
        3
      ),
      2
    ).replace("#usf <getWobble>", Ve), { rewritedFragmentShader: o, mapArrayUniforms: m } = hn(v, gn), l = new i.ShaderMaterial({
      vertexShader: g,
      fragmentShader: o,
      blending: i.AdditiveBlending,
      ...z,
      // Must be transparent
      transparent: !0,
      uniforms: {
        uResolution: { value: new i.Vector2(0, 0) },
        uMorphProgress: { value: E.morphProgress },
        uBlurAlpha: { value: E.blurAlpha },
        uBlurRadius: { value: E.blurRadius },
        uPointSize: { value: E.pointSize },
        uPointAlpha: { value: E.pointAlpha },
        uPicture: { value: w },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: w },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: E.color0 },
        uColor1: { value: E.color1 },
        uColor2: { value: E.color2 },
        uColor3: { value: E.color3 },
        uMap: { value: w },
        uIsMap: { value: !1 },
        uAlphaMap: { value: w },
        uIsAlphaMap: { value: !1 },
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: E.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: E.wobbleTimeFrequency
        },
        uWobbleStrength: { value: E.wobbleStrength },
        uWarpPositionFrequency: {
          value: E.warpPositionFrequency
        },
        uWarpTimeFrequency: {
          value: E.warpTimeFrequency
        },
        uWarpStrength: { value: E.warpStrength },
        uDisplacement: { value: w },
        uIsDisplacement: { value: !1 },
        uDisplacementIntensity: {
          value: E.displacementIntensity
        },
        uDisplacementColorIntensity: {
          value: E.displacementColorIntensity
        },
        uSizeRandomIntensity: {
          value: E.sizeRandomIntensity
        },
        uSizeRandomTimeFrequency: {
          value: E.sizeRandomTimeFrequency
        },
        uSizeRandomMin: { value: E.sizeRandomMin },
        uSizeRandomMax: { value: E.sizeRandomMax },
        uDivergence: { value: E.divergence },
        uDivergencePoint: { value: E.divergencePoint },
        ...m,
        ...s
      }
    });
    return u && (l.onBeforeCompile = u), l;
  }, [
    n,
    c,
    f,
    v,
    u,
    s
  ]), x = K(e, t);
  return P(d)("uResolution", x.clone()), { material: d, modifiedPositions: c, modifiedUvs: f };
}, yn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: a,
  uvs: v,
  mapArray: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = B(t), d = b(() => {
    const M = r || new i.SphereGeometry(1, 32, 32);
    return M.setIndex(null), M.deleteAttribute("normal"), M;
  }, [r]), { material: x, modifiedPositions: g, modifiedUvs: o } = xn({
    size: e,
    dpr: f.shader,
    geometry: d,
    positions: a,
    uvs: v,
    mapArray: s,
    uniforms: u,
    onBeforeCompile: c
  }), { points: m, interactiveMesh: l } = dn({
    scene: n,
    geometry: d,
    material: x
  }), p = P(x), h = V(x);
  return [
    A(
      (M, y, _) => {
        M && p(
          "uTime",
          (y == null ? void 0 : y.beat) || M.clock.getElapsedTime()
        ), y !== void 0 && (p("uMorphProgress", y.morphProgress), p("uBlurAlpha", y.blurAlpha), p("uBlurRadius", y.blurRadius), p("uPointSize", y.pointSize), p("uPointAlpha", y.pointAlpha), y.picture ? (p("uPicture", y.picture), p("uIsPicture", !0)) : y.picture === !1 && p("uIsPicture", !1), y.alphaPicture ? (p("uAlphaPicture", y.alphaPicture), p("uIsAlphaPicture", !0)) : y.alphaPicture === !1 && p("uIsAlphaPicture", !1), p("uColor0", y.color0), p("uColor1", y.color1), p("uColor2", y.color2), p("uColor3", y.color3), y.map ? (p("uMap", y.map), p("uIsMap", !0)) : y.map === !1 && p("uIsMap", !1), y.alphaMap ? (p("uAlphaMap", y.alphaMap), p("uIsAlphaMap", !0)) : y.alphaMap === !1 && p("uIsAlphaMap", !1), p("uWobbleStrength", y.wobbleStrength), p(
          "uWobblePositionFrequency",
          y.wobblePositionFrequency
        ), p("uWobbleTimeFrequency", y.wobbleTimeFrequency), p("uWarpStrength", y.warpStrength), p("uWarpPositionFrequency", y.warpPositionFrequency), p("uWarpTimeFrequency", y.warpTimeFrequency), y.displacement ? (p("uDisplacement", y.displacement), p("uIsDisplacement", !0)) : y.displacement === !1 && p("uIsDisplacement", !1), p("uDisplacementIntensity", y.displacementIntensity), p(
          "uDisplacementColorIntensity",
          y.displacementColorIntensity
        ), p("uSizeRandomIntensity", y.sizeRandomIntensity), p(
          "uSizeRandomTimeFrequency",
          y.sizeRandomTimeFrequency
        ), p("uSizeRandomMin", y.sizeRandomMin), p("uSizeRandomMax", y.sizeRandomMax), p("uDivergence", y.divergence), p("uDivergencePoint", y.divergencePoint), h(_));
      },
      [p, h]
    ),
    {
      points: m,
      interactiveMesh: l,
      positions: g,
      uvs: o
    }
  ];
}, E = Object.freeze({
  morphProgress: 0,
  blurAlpha: 0.9,
  blurRadius: 0.05,
  pointSize: 0.05,
  pointAlpha: 1,
  picture: !1,
  alphaPicture: !1,
  color0: new i.Color(16711680),
  color1: new i.Color(65280),
  color2: new i.Color(255),
  color3: new i.Color(16776960),
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
  divergencePoint: new i.Vector3(0),
  beat: !1
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: a,
  geometry: v,
  positions: s,
  uvs: u,
  uniforms: c,
  onBeforeCompile: f
}) => {
  const d = B(t), x = b(() => new i.Scene(), []), [
    g,
    {
      points: o,
      interactiveMesh: m,
      positions: l,
      uvs: p
    }
  ] = yn({
    scene: x,
    size: e,
    dpr: t,
    geometry: v,
    positions: s,
    uvs: u,
    uniforms: c,
    onBeforeCompile: f
  }), [h, S] = N({
    scene: x,
    camera: a,
    size: e,
    dpr: d.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = A(
    (_, C, T) => (g(_, C, T), S(_.gl)),
    [S, g]
  ), y = A(
    (_, C) => {
      g(null, _, C);
    },
    [g]
  );
  return [
    M,
    y,
    {
      scene: x,
      points: o,
      interactiveMesh: m,
      renderTarget: h,
      output: h.texture,
      positions: l,
      uvs: p
    }
  ];
};
function bn(e, t = 1e-4) {
  t = Math.max(t, Number.EPSILON);
  const n = {}, r = e.getIndex(), a = e.getAttribute("position"), v = r ? r.count : a.count;
  let s = 0;
  const u = Object.keys(e.attributes), c = {}, f = {}, d = [], x = ["getX", "getY", "getZ", "getW"];
  for (let l = 0, p = u.length; l < p; l++) {
    const h = u[l];
    c[h] = [];
    const S = e.morphAttributes[h];
    S && (f[h] = new Array(S.length).fill(0).map(() => []));
  }
  const g = Math.log10(1 / t), o = Math.pow(10, g);
  for (let l = 0; l < v; l++) {
    const p = r ? r.getX(l) : l;
    let h = "";
    for (let S = 0, M = u.length; S < M; S++) {
      const y = u[S], _ = e.getAttribute(y), C = _.itemSize;
      for (let T = 0; T < C; T++)
        h += `${~~(_[x[T]](p) * o)},`;
    }
    if (h in n)
      d.push(n[h]);
    else {
      for (let S = 0, M = u.length; S < M; S++) {
        const y = u[S], _ = e.getAttribute(y), C = e.morphAttributes[y], T = _.itemSize, U = c[y], F = f[y];
        for (let I = 0; I < T; I++) {
          const R = x[I];
          if (U.push(_[R](p)), C)
            for (let D = 0, k = C.length; D < k; D++)
              F[D].push(C[D][R](p));
        }
      }
      n[h] = s, d.push(s), s++;
    }
  }
  const m = e.clone();
  for (let l = 0, p = u.length; l < p; l++) {
    const h = u[l], S = e.getAttribute(h), M = new S.array.constructor(c[h]), y = new Te(M, S.itemSize, S.normalized);
    if (m.setAttribute(h, y), h in f)
      for (let _ = 0; _ < f[h].length; _++) {
        const C = e.morphAttributes[h][_], T = new C.array.constructor(f[h][_]), U = new Te(T, C.itemSize, C.normalized);
        m.morphAttributes[h][_] = U;
      }
  }
  return m.setIndex(d), m;
}
var Mn = `vec3 random3(vec3 c) {
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
}`, Sn = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, _n = `#ifdef USE_TRANSMISSION

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
const Pe = (e) => {
  let t = e;
  return t = t.replace(
    "#include <beginnormal_vertex>",
    `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
  ), t = t.replace(
    "#include <begin_vertex>",
    `
		vec3 transformed = usf_Position;`
  ), t = t.replace(
    "void main() {",
    `
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;
		uniform bool uIsWobbleMap;
		uniform sampler2D uWobbleMap;
		uniform float uWobbleMapStrength;
		uniform float uWobbleMapDistortion;
		attribute vec4 tangent;
		varying float vWobble;
		varying vec2 vPosition;
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;
		// #usf <getWobble>
		void main() {
		`
  ), t = t.replace("// #usf <getWobble>", `${Ve}`), t = t.replace(
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
		
		// wobbleMap & wobble
		float wobbleMap = uIsWobbleMap ? texture2D(uWobbleMap, uv).g : 0.0;
		vec3 nWobbleMap = wobbleMap * normal * uWobbleMapStrength;
		float wobbleMapDistortion = wobbleMap * uWobbleMapDistortion;

		float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
		float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
		float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
		
		usf_Position += nWobbleMap + (wobble * normal);
		positionA += nWobbleMap + wobbleMapDistortion + (wobblePositionA * normal);
		positionB += nWobbleMap + wobbleMapDistortion + (wobblePositionB * normal);

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
  ), t;
}, wn = ({
  baseMaterial: e,
  materialParameters: t,
  onBeforeCompile: n,
  depthOnBeforeCompile: r,
  isCustomTransmission: a = !1,
  uniforms: v
}) => {
  const { material: s, depthMaterial: u } = b(() => {
    const c = new (e || i.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(c.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: L.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: L.wobbleTimeFrequency
        },
        uWobbleStrength: { value: L.wobbleStrength },
        uWarpPositionFrequency: {
          value: L.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: L.warpTimeFrequency },
        uWarpStrength: { value: L.warpStrength },
        uIsWobbleMap: { value: !1 },
        uWobbleMap: { value: w },
        uWobbleMapStrength: { value: L.wobbleMapStrength },
        uWobbleMapDistortion: {
          value: L.wobbleMapDistortion
        },
        uColor0: { value: L.color0 },
        uColor1: { value: L.color1 },
        uColor2: { value: L.color2 },
        uColor3: { value: L.color3 },
        uColorMix: { value: L.colorMix },
        uEdgeThreshold: { value: L.edgeThreshold },
        uEdgeColor: { value: L.edgeColor },
        uChromaticAberration: {
          value: L.chromaticAberration
        },
        uAnisotropicBlur: { value: L.anisotropicBlur },
        uDistortion: { value: L.distortion },
        uDistortionScale: { value: L.distortionScale },
        uTemporalDistortion: { value: L.temporalDistortion },
        uRefractionSamples: { value: L.refractionSamples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null },
        ...v
      }
    }), c.onBeforeCompile = (d, x) => {
      Object.assign(d.uniforms, c.userData.uniforms), d.vertexShader = Pe(d.vertexShader), d.fragmentShader = d.fragmentShader.replace(
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
      ), d.fragmentShader = d.fragmentShader.replace(
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
				${Mn}

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
      ), c.type === "MeshPhysicalMaterial" && a && (d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${Sn}`
      ), d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${_n}`
      )), n && n(d, x);
    }, c.needsUpdate = !0;
    const f = new i.MeshDepthMaterial({
      depthPacking: i.RGBADepthPacking
    });
    return f.onBeforeCompile = (d, x) => {
      Object.assign(d.uniforms, c.userData.uniforms), d.vertexShader = Pe(d.vertexShader), r && r(d, x);
    }, f.needsUpdate = !0, { material: c, depthMaterial: f };
  }, [
    t,
    e,
    n,
    r,
    v,
    a
  ]);
  return {
    material: s,
    depthMaterial: u
  };
}, Cn = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: a,
  onBeforeCompile: v,
  depthOnBeforeCompile: s,
  uniforms: u
}) => {
  const c = b(() => {
    let p = t || new i.IcosahedronGeometry(2, 20);
    return p = bn(p), p.computeTangents(), p;
  }, [t]), { material: f, depthMaterial: d } = wn({
    baseMaterial: r,
    materialParameters: a,
    onBeforeCompile: v,
    depthOnBeforeCompile: s,
    uniforms: u,
    isCustomTransmission: n
  }), x = W(e, c, f, i.Mesh), g = f.userData, o = P(g), m = V(g);
  return [
    A(
      (p, h, S) => {
        p && o(
          "uTime",
          (h == null ? void 0 : h.beat) || p.clock.getElapsedTime()
        ), h !== void 0 && (o("uWobbleStrength", h.wobbleStrength), o(
          "uWobblePositionFrequency",
          h.wobblePositionFrequency
        ), o("uWobbleTimeFrequency", h.wobbleTimeFrequency), o("uWarpStrength", h.warpStrength), o("uWarpPositionFrequency", h.warpPositionFrequency), o("uWarpTimeFrequency", h.warpTimeFrequency), h.wobbleMap ? (o("uWobbleMap", h.wobbleMap), o("uIsWobbleMap", !0)) : h.wobbleMap === !1 && o("uIsWobbleMap", !1), o("uWobbleMapStrength", h.wobbleMapStrength), o("uWobbleMapDistortion", h.wobbleMapDistortion), o("uColor0", h.color0), o("uColor1", h.color1), o("uColor2", h.color2), o("uColor3", h.color3), o("uColorMix", h.colorMix), o("uEdgeThreshold", h.edgeThreshold), o("uEdgeColor", h.edgeColor), o("uChromaticAberration", h.chromaticAberration), o("uAnisotropicBlur", h.anisotropicBlur), o("uDistortion", h.distortion), o("uDistortionScale", h.distortionScale), o("uRefractionSamples", h.refractionSamples), o("uTemporalDistortion", h.temporalDistortion), m(S));
      },
      [o, m]
    ),
    {
      mesh: x,
      depthMaterial: d
    }
  ];
}, L = Object.freeze({
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
  wobbleMap: !1,
  wobbleMapStrength: 0.03,
  wobbleMapDistortion: 0,
  color0: new i.Color(16711680),
  color1: new i.Color(65280),
  color2: new i.Color(255),
  color3: new i.Color(16776960),
  colorMix: 1,
  edgeThreshold: 0,
  edgeColor: new i.Color(0),
  chromaticAberration: 0.1,
  anisotropicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.1,
  temporalDistortion: 0,
  refractionSamples: 6,
  beat: !1
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: a,
  geometry: v,
  baseMaterial: s,
  materialParameters: u,
  uniforms: c,
  onBeforeCompile: f,
  depthOnBeforeCompile: d,
  isCustomTransmission: x
}) => {
  const g = B(t), o = b(() => new i.Scene(), []), [m, { mesh: l, depthMaterial: p }] = Cn({
    baseMaterial: s,
    materialParameters: u,
    scene: o,
    geometry: v,
    uniforms: c,
    onBeforeCompile: f,
    depthOnBeforeCompile: d,
    isCustomTransmission: x
  }), [h, S] = N({
    scene: o,
    camera: a,
    size: e,
    dpr: g.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = A(
    (_, C, T) => (m(_, C, T), S(_.gl)),
    [S, m]
  ), y = A(
    (_, C) => {
      m(null, _, C);
    },
    [m]
  );
  return [
    M,
    y,
    {
      scene: o,
      mesh: l,
      depthMaterial: p,
      renderTarget: h,
      output: h.texture
    }
  ];
}, ir = (e, t, n) => {
  const r = b(() => {
    const a = new i.Mesh(t, n);
    return e.add(a), a;
  }, [t, n, e]);
  return re(() => () => {
    e.remove(r), t.dispose(), n.dispose();
  }, [e, t, n, r]), r;
}, fe = Object.freeze({
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
    return 1 - fe.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - fe.easeOutBounce(1 - 2 * e)) / 2 : (1 + fe.easeOutBounce(2 * e - 1)) / 2;
  }
});
function Tn(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const ur = (e, t = "easeOutQuart") => {
  const n = e / 60, r = fe[t];
  return A(
    (v) => {
      let s = v.getElapsedTime() * n;
      const u = Math.floor(s), c = r(s - u);
      s = c + u;
      const f = Tn(u);
      return {
        beat: s,
        floor: u,
        fract: c,
        hash: f
      };
    },
    [n, r]
  );
}, sr = (e = 60) => {
  const t = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = O(null);
  return A(
    (a) => {
      const v = a.getElapsedTime();
      return n.current === null || v - n.current >= t ? (n.current = v, !0) : !1;
    },
    [t]
  );
}, Dn = (e) => {
  var r, a;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (a = e.texture) == null ? void 0 : a.length;
  return !t || !n || t !== n;
};
var Rn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Pn = `precision highp float;

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
const An = ({
  params: e,
  scene: t,
  uniforms: n,
  onBeforeCompile: r
}) => {
  t.children.length > 0 && (t.children.forEach((a) => {
    a instanceof i.Mesh && (a.geometry.dispose(), a.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((a, v) => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: a },
        u_textureResolution: {
          value: new i.Vector2(0, 0)
        },
        u_resolution: { value: new i.Vector2(0, 0) },
        u_borderRadius: {
          value: e.boderRadius[v] ? e.boderRadius[v] : 0
        },
        ...n
      },
      vertexShader: Rn,
      fragmentShader: Pn,
      ...z,
      // Must be transparent.
      transparent: !0
    });
    r && (s.onBeforeCompile = r);
    const u = new i.Mesh(new i.PlaneGeometry(1, 1), s);
    t.add(u);
  });
}, In = () => {
  const e = O([]), t = O([]);
  return A(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: a,
      params: v
    }) => {
      e.current.length > 0 && e.current.forEach((u, c) => {
        u.unobserve(t.current[c]);
      }), t.current = [], e.current = [];
      const s = new Array(v.dom.length).fill(!1);
      r.current = [...s], a.current = [...s], v.dom.forEach((u, c) => {
        const f = (x) => {
          x.forEach((g) => {
            v.onIntersect[c] && v.onIntersect[c](g), r.current[c] = g.isIntersecting;
          });
        }, d = new IntersectionObserver(f, {
          rootMargin: "0px",
          threshold: 0
        });
        d.observe(u), e.current.push(d), t.current.push(u);
      });
    },
    []
  );
}, Fn = () => {
  const e = O([]), t = A(
    ({
      params: n,
      customParams: r,
      size: a,
      resolutionRef: v,
      scene: s,
      isIntersectingRef: u
    }) => {
      s.children.length !== e.current.length && (e.current = new Array(s.children.length)), s.children.forEach((c, f) => {
        var g, o, m, l, p, h;
        const d = n.dom[f];
        if (!d)
          return;
        const x = d.getBoundingClientRect();
        if (e.current[f] = x, c.scale.set(x.width, x.height, 1), c.position.set(
          x.left + x.width * 0.5 - a.width * 0.5,
          -x.top - x.height * 0.5 + a.height * 0.5,
          0
        ), u.current[f] && (n.rotation[f] && c.rotation.copy(n.rotation[f]), c instanceof i.Mesh)) {
          const S = c.material, M = P(S), y = V(S);
          M("u_texture", n.texture[f]), M("u_textureResolution", [
            ((m = (o = (g = n.texture[f]) == null ? void 0 : g.source) == null ? void 0 : o.data) == null ? void 0 : m.width) || 0,
            ((h = (p = (l = n.texture[f]) == null ? void 0 : l.source) == null ? void 0 : p.data) == null ? void 0 : h.height) || 0
          ]), M(
            "u_resolution",
            v.current.set(x.width, x.height)
          ), M(
            "u_borderRadius",
            n.boderRadius[f] ? n.boderRadius[f] : 0
          ), y(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Vn = () => {
  const e = O([]), t = O([]), n = A((r, a = !1) => {
    e.current.forEach((s, u) => {
      s && (t.current[u] = !0);
    });
    const v = a ? [...t.current] : [...e.current];
    return r < 0 ? v : v[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, zn = (e) => ({ onView: n, onHidden: r }) => {
  const a = O(!1);
  re(() => {
    let v;
    const s = () => {
      e.current.some((u) => u) ? a.current || (n && n(), a.current = !0) : a.current && (r && r(), a.current = !1), v = requestAnimationFrame(s);
    };
    return v = requestAnimationFrame(s), () => {
      cancelAnimationFrame(v);
    };
  }, [n, r]);
}, Un = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, lr = ({ size: e, dpr: t, samples: n, isSizeUpdate: r, uniforms: a, onBeforeCompile: v }, s = []) => {
  const u = B(t), c = b(() => new i.Scene(), []), f = $(e), [d, x] = N({
    scene: c,
    camera: f,
    size: e,
    dpr: u.fbo,
    samples: n,
    isSizeUpdate: r
  }), [g, o] = q({
    ...Un,
    updateKey: performance.now()
  }), [m, l] = Fn(), p = O(new i.Vector2(0, 0)), [h, S] = Ee(!0);
  b(
    () => S(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const M = O(null), y = b(() => w, []), _ = In(), { isIntersectingOnceRef: C, isIntersectingRef: T, isIntersecting: U } = Vn(), F = zn(T);
  return [
    A(
      (R, D, k) => {
        const { gl: J, size: X } = R;
        if (D && o(D), Dn(g))
          return y;
        if (h) {
          if (M.current === g.updateKey)
            return y;
          M.current = g.updateKey;
        }
        return h && (An({
          params: g,
          size: X,
          scene: c,
          uniforms: a,
          onBeforeCompile: v
        }), _({
          isIntersectingRef: T,
          isIntersectingOnceRef: C,
          params: g
        }), S(!1)), l({
          params: g,
          customParams: k,
          size: X,
          resolutionRef: p,
          scene: c,
          isIntersectingRef: T
        }), x(J);
      },
      [
        x,
        a,
        o,
        _,
        l,
        v,
        h,
        c,
        g,
        C,
        T,
        y
      ]
    ),
    o,
    {
      scene: c,
      camera: f,
      renderTarget: d,
      output: d.texture,
      isIntersecting: U,
      DOMRects: m,
      intersections: T.current,
      useDomView: F
    }
  ];
}, cr = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: a = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}, c) => {
  const f = O([]), d = K(n, r);
  f.current = b(() => Array.from({ length: c }, () => {
    const g = new i.WebGLRenderTarget(
      d.x,
      d.y,
      {
        ...ge,
        samples: v,
        depthBuffer: s
      }
    );
    return u && (g.depthTexture = new i.DepthTexture(
      d.x,
      d.y,
      i.FloatType
    )), g;
  }), [c]), a && f.current.forEach(
    (g) => g.setSize(d.x, d.y)
  ), re(() => {
    const g = f.current;
    return () => {
      g.forEach((o) => o.dispose());
    };
  }, [c]);
  const x = A(
    (g, o, m) => {
      const l = f.current[o];
      return Se({
        gl: g,
        scene: e,
        camera: t,
        fbo: l,
        onBeforeRender: () => m && m({ read: l.texture })
      }), l.texture;
    },
    [e, t]
  );
  return [f.current, x];
};
export {
  jt as ALPHABLENDING_PARAMS,
  mn as BLANK_PARAMS,
  le as BLENDING_PARAMS,
  me as BRIGHTNESSPICKER_PARAMS,
  ee as BRUSH_PARAMS,
  Q as CHROMAKEY_PARAMS,
  H as COLORSTRATA_PARAMS,
  se as COSPALETTE_PARAMS,
  Ht as COVERTEXTURE_PARAMS,
  Un as DOMSYNCER_PARAMS,
  ye as DUOTONE_PARAMS,
  fe as Easing,
  ge as FBO_OPTION,
  st as FLUID_PARAMS,
  Ie as FXBLENDING_PARAMS,
  ne as FXTEXTURE_PARAMS,
  be as HSV_PARAMS,
  oe as MARBLE_PARAMS,
  E as MORPHPARTICLES_PARAMS,
  de as MOTIONBLUR_PARAMS,
  te as NOISE_PARAMS,
  pt as RIPPLE_PARAMS,
  Fe as SIMPLEBLUR_PARAMS,
  ve as WAVE_PARAMS,
  L as WOBBLE3D_PARAMS,
  Se as renderFBO,
  V as setCustomUniform,
  P as setUniform,
  ir as useAddMesh,
  Hn as useAlphaBlending,
  ur as useBeat,
  rr as useBlank,
  Gn as useBlending,
  Xn as useBrightnessPicker,
  En as useBrush,
  $ as useCamera,
  nr as useChromaKey,
  qn as useColorStrata,
  cr as useCopyTexture,
  Nn as useCosPalette,
  Zn as useCoverTexture,
  yn as useCreateMorphParticles,
  Cn as useCreateWobble3D,
  lr as useDomSyncer,
  ae as useDoubleFBO,
  kn as useDuoTone,
  sr as useFPSLimiter,
  Wn as useFluid,
  Yn as useFxBlending,
  Kn as useFxTexture,
  Qn as useHSV,
  jn as useMarble,
  or as useMorphParticles,
  er as useMotionBlur,
  $n as useNoise,
  q as useParams,
  Me as usePointer,
  K as useResolution,
  Ln as useRipple,
  Jn as useSimpleBlur,
  N as useSingleFBO,
  tr as useWave,
  ar as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
