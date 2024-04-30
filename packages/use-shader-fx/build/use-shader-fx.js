import * as a from "three";
import { BufferAttribute as Te } from "three";
import { useMemo as y, useEffect as re, useRef as O, useCallback as A, useState as Ee } from "react";
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
  return y(
    () => new a.Vector2(n, r),
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
}, L = (e, t, n, r) => {
  const o = y(() => {
    const m = new r(t, n);
    return e && e.add(m), m;
  }, [t, n, r, e]);
  return re(() => () => {
    e && e.remove(o), t.dispose(), n.dispose();
  }, [e, t, n, o]), o;
}, Ae = process.env.NODE_ENV === "development", z = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, w = new a.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  a.RGBAFormat
), $e = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const m = y(() => new a.PlaneGeometry(2, 2), []), s = y(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uBuffer: { value: w },
        uResolution: { value: new a.Vector2(0, 0) },
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
        uMouse: { value: new a.Vector2(-10, -10) },
        uPrevMouse: { value: new a.Vector2(-10, -10) },
        uVelocity: { value: new a.Vector2(0, 0) },
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
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), i = K(t, n);
  P(s)("uResolution", i.clone());
  const v = L(e, m, s, a.Mesh);
  return { material: s, mesh: v };
}, qe = (e, t) => {
  const n = t, r = e / t, [o, m] = [n * r / 2, n / 2];
  return { width: o, height: m, near: -1e3, far: 1e3 };
}, $ = (e, t = "OrthographicCamera") => {
  const n = K(e), { width: r, height: o, near: m, far: s } = qe(
    n.x,
    n.y
  );
  return y(() => t === "OrthographicCamera" ? new a.OrthographicCamera(
    -r,
    r,
    o,
    -o,
    m,
    s
  ) : new a.PerspectiveCamera(50, r / o), [r, o, m, s, t]);
}, Me = (e = 0) => {
  const t = O(new a.Vector2(0, 0)), n = O(new a.Vector2(0, 0)), r = O(new a.Vector2(0, 0)), o = O(0), m = O(new a.Vector2(0, 0)), s = O(!1);
  return A(
    (v) => {
      const f = performance.now();
      let h;
      s.current && e ? (r.current = r.current.lerp(
        v,
        1 - e
      ), h = r.current.clone()) : (h = v.clone(), r.current = h), o.current === 0 && (o.current = f, t.current = h);
      const g = Math.max(1, f - o.current);
      o.current = f, m.current.copy(h).sub(t.current).divideScalar(g);
      const p = m.current.length() > 0, l = s.current ? t.current.clone() : h;
      return !s.current && p && (s.current = !0), t.current = h, {
        currentPointer: h,
        prevPointer: l,
        diffPointer: n.current.subVectors(h, l),
        velocity: m.current,
        isVelocityUpdate: p
      };
    },
    [e]
  );
}, q = (e) => {
  const n = O(
    ((o) => Object.values(o).some((m) => typeof m == "function"))(e) ? e : structuredClone(e)
  ), r = A((o) => {
    for (const m in o) {
      const s = m;
      s in n.current && o[s] !== void 0 && o[s] !== null ? n.current[s] = o[s] : console.error(
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
  minFilter: a.LinearFilter,
  magFilter: a.LinearFilter,
  type: a.HalfFloatType,
  stencilBuffer: !1
}, Se = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: o,
  onSwap: m
}) => {
  e.setRenderTarget(t), o(), e.clear(), e.render(n, r), m && m(), e.setRenderTarget(null), e.clear();
}, N = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: m = 0,
  depthBuffer: s = !1,
  depthTexture: i = !1
}) => {
  var g;
  const v = O(), f = K(n, r);
  v.current = y(
    () => {
      const p = new a.WebGLRenderTarget(
        f.x,
        f.y,
        {
          ...ge,
          samples: m,
          depthBuffer: s
        }
      );
      return i && (p.depthTexture = new a.DepthTexture(
        f.x,
        f.y,
        a.FloatType
      )), p;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), o && ((g = v.current) == null || g.setSize(f.x, f.y)), re(() => {
    const p = v.current;
    return () => {
      p == null || p.dispose();
    };
  }, []);
  const h = A(
    (p, l) => {
      const d = v.current;
      return Se({
        gl: p,
        fbo: d,
        scene: e,
        camera: t,
        onBeforeRender: () => l && l({ read: d.texture })
      }), d.texture;
    },
    [e, t]
  );
  return [v.current, h];
}, ae = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: m = 0,
  depthBuffer: s = !1,
  depthTexture: i = !1
}) => {
  var p, l;
  const v = O({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), f = K(n, r), h = y(() => {
    const d = new a.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: m,
      depthBuffer: s
    }), u = new a.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: m,
      depthBuffer: s
    });
    return i && (d.depthTexture = new a.DepthTexture(
      f.x,
      f.y,
      a.FloatType
    ), u.depthTexture = new a.DepthTexture(
      f.x,
      f.y,
      a.FloatType
    )), { read: d, write: u };
  }, []);
  v.current.read = h.read, v.current.write = h.write, o && ((p = v.current.read) == null || p.setSize(f.x, f.y), (l = v.current.write) == null || l.setSize(f.x, f.y)), re(() => {
    const d = v.current;
    return () => {
      var u, c;
      (u = d.read) == null || u.dispose(), (c = d.write) == null || c.dispose();
    };
  }, []);
  const g = A(
    (d, u) => {
      var b;
      const c = v.current;
      return Se({
        gl: d,
        scene: e,
        camera: t,
        fbo: c.write,
        onBeforeRender: () => u && u({
          read: c.read.texture,
          write: c.write.texture
        }),
        onSwap: () => c.swap()
      }), (b = c.read) == null ? void 0 : b.texture;
    },
    [e, t]
  );
  return [
    { read: v.current.read, write: v.current.write },
    g
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
  color: new a.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), En = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = $e({
    scene: i,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), g = Me(), [p, l] = ae({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [d, u] = q(ee), c = O(null), b = P(v), S = V(v);
  return [
    A(
      (x, _, C) => {
        const { gl: D, pointer: U } = x;
        _ && u(_), d.texture ? (b("uIsTexture", !0), b("uTexture", d.texture)) : b("uIsTexture", !1), d.map ? (b("uIsMap", !0), b("uMap", d.map), b("uMapIntensity", d.mapIntensity)) : b("uIsMap", !1), b("uRadius", d.radius), b("uSmudge", d.smudge), b("uDissipation", d.dissipation), b("uMotionBlur", d.motionBlur), b("uMotionSample", d.motionSample);
        const F = d.pointerValues || g(U);
        F.isVelocityUpdate && (b("uMouse", F.currentPointer), b("uPrevMouse", F.prevPointer)), b("uVelocity", F.velocity);
        const I = typeof d.color == "function" ? d.color(F.velocity) : d.color;
        return b("uColor", I), b("uIsCursor", d.isCursor), b("uPressureEnd", d.pressure), c.current === null && (c.current = d.pressure), b("uPressureStart", c.current), c.current = d.pressure, S(C), l(D, ({ read: R }) => {
          b("uBuffer", R);
        });
      },
      [
        b,
        g,
        l,
        d,
        u,
        S
      ]
    ),
    u,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: p,
      output: p.read.texture
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
}) => y(() => {
  const r = new a.ShaderMaterial({
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: w },
      uSource: { value: w },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uTexture: { value: w },
      value: { value: 0 },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uPressure: { value: w },
      uVelocity: { value: w },
      texelSize: { value: new a.Vector2() },
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
}) => y(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uTarget: { value: w },
      aspectRatio: { value: 0 },
      color: { value: new a.Vector3() },
      point: { value: new a.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new a.Vector2() },
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
  const o = y(() => new a.PlaneGeometry(2, 2), []), {
    curl: m,
    vorticity: s,
    advection: i,
    divergence: v,
    pressure: f,
    clear: h,
    gradientSubtract: g,
    splat: p
  } = r ?? {}, l = Y(Ne), d = l.clone(), u = Y(Ze, m), c = Y(et, s), b = Y(Ge, i), S = Y(
    Xe,
    v
  ), M = Y(He, f), x = Y(nt, h), _ = Y(
    ot,
    g
  ), C = Y(it, p), D = y(
    () => ({
      vorticityMaterial: c,
      curlMaterial: u,
      advectionMaterial: b,
      divergenceMaterial: S,
      pressureMaterial: M,
      clearMaterial: x,
      gradientSubtractMaterial: _,
      splatMaterial: C
    }),
    [
      c,
      u,
      b,
      S,
      M,
      x,
      _,
      C
    ]
  ), U = K(t, n);
  y(() => {
    P(D.splatMaterial)(
      "aspectRatio",
      U.x / U.y
    );
    for (const R of Object.values(D))
      P(R)(
        "texelSize",
        new a.Vector2(1 / U.x, 1 / U.y)
      );
  }, [U, D]);
  const F = L(e, o, l, a.Mesh);
  y(() => {
    l.dispose(), F.material = d;
  }, [l, F, d]), re(() => () => {
    for (const R of Object.values(D))
      R.dispose();
  }, [D]);
  const I = A(
    (R) => {
      F.material = R, F.material.needsUpdate = !0;
    },
    [F]
  );
  return { materials: D, setMeshMaterial: I, mesh: F };
}, st = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new a.Vector3(1, 1, 1),
  pointerValues: !1
}), Wn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  fluidOnBeforeCompile: o
}) => {
  const m = B(t), s = y(() => new a.Scene(), []), { materials: i, setMeshMaterial: v, mesh: f } = ut({
    scene: s,
    size: e,
    dpr: m.shader,
    fluidOnBeforeCompile: o
  }), h = $(e), g = Me(), p = y(
    () => ({
      scene: s,
      camera: h,
      dpr: m.fbo,
      size: e,
      samples: n,
      isSizeUpdate: r
    }),
    [s, h, e, n, m.fbo, r]
  ), [l, d] = ae(p), [u, c] = ae(p), [b, S] = N(p), [M, x] = N(p), [_, C] = ae(p), D = O(0), U = O(new a.Vector2(0, 0)), F = O(new a.Vector3(0, 0, 0)), [I, R] = q(st), T = y(
    () => ({
      advection: P(i.advectionMaterial),
      splat: P(i.splatMaterial),
      curl: P(i.curlMaterial),
      vorticity: P(i.vorticityMaterial),
      divergence: P(i.divergenceMaterial),
      clear: P(i.clearMaterial),
      pressure: P(i.pressureMaterial),
      gradientSubtract: P(i.gradientSubtractMaterial)
    }),
    [i]
  ), k = y(
    () => ({
      advection: V(i.advectionMaterial),
      splat: V(i.splatMaterial),
      curl: V(i.curlMaterial),
      vorticity: V(i.vorticityMaterial),
      divergence: V(i.divergenceMaterial),
      clear: V(i.clearMaterial),
      pressure: V(i.pressureMaterial),
      gradientSubtract: V(i.gradientSubtractMaterial)
    }),
    [i]
  );
  return [
    A(
      (X, ce, ie) => {
        const { gl: G, pointer: ze, clock: he, size: _e } = X;
        ce && R(ce), D.current === 0 && (D.current = he.getElapsedTime());
        const we = Math.min(
          (he.getElapsedTime() - D.current) / 3,
          0.02
        );
        D.current = he.getElapsedTime();
        const xe = d(G, ({ read: j }) => {
          v(i.advectionMaterial), T.advection("uVelocity", j), T.advection("uSource", j), T.advection("dt", we), T.advection("dissipation", I.velocity_dissipation);
        }), Ue = c(G, ({ read: j }) => {
          v(i.advectionMaterial), T.advection("uVelocity", xe), T.advection("uSource", j), T.advection("dissipation", I.density_dissipation);
        }), pe = I.pointerValues || g(ze);
        pe.isVelocityUpdate && (d(G, ({ read: j }) => {
          v(i.splatMaterial), T.splat("uTarget", j), T.splat("point", pe.currentPointer);
          const ue = pe.diffPointer.multiply(
            U.current.set(_e.width, _e.height).multiplyScalar(I.velocity_acceleration)
          );
          T.splat(
            "color",
            F.current.set(ue.x, ue.y, 1)
          ), T.splat("radius", I.splat_radius);
        }), c(G, ({ read: j }) => {
          v(i.splatMaterial), T.splat("uTarget", j);
          const ue = typeof I.fluid_color == "function" ? I.fluid_color(pe.velocity) : I.fluid_color;
          T.splat("color", ue);
        }));
        const Oe = S(G, () => {
          v(i.curlMaterial), T.curl("uVelocity", xe);
        });
        d(G, ({ read: j }) => {
          v(i.vorticityMaterial), T.vorticity("uVelocity", j), T.vorticity("uCurl", Oe), T.vorticity("curl", I.curl_strength), T.vorticity("dt", we);
        });
        const Be = x(G, () => {
          v(i.divergenceMaterial), T.divergence("uVelocity", xe);
        });
        C(G, ({ read: j }) => {
          v(i.clearMaterial), T.clear("uTexture", j), T.clear("value", I.pressure_dissipation);
        }), v(i.pressureMaterial), T.pressure("uDivergence", Be);
        let Ce;
        for (let j = 0; j < I.pressure_iterations; j++)
          Ce = C(G, ({ read: ue }) => {
            T.pressure("uPressure", ue);
          });
        return d(G, ({ read: j }) => {
          v(i.gradientSubtractMaterial), T.gradientSubtract("uPressure", Ce), T.gradientSubtract("uVelocity", j);
        }), ie && Object.keys(ie).forEach((j) => {
          k[j](
            ie[j]
          );
        }), Ue;
      },
      [
        i,
        T,
        v,
        S,
        c,
        x,
        g,
        C,
        d,
        k,
        R,
        I
      ]
    ),
    R,
    {
      scene: s,
      mesh: f,
      materials: i,
      camera: h,
      renderTarget: {
        velocity: l,
        density: u,
        curl: b,
        divergence: M,
        pressure: _
      },
      output: u.read.texture
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
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = y(
    () => new a.PlaneGeometry(e, e),
    [e]
  ), i = y(() => new a.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uMap: { value: n || w },
      ...o
    },
    blending: a.AdditiveBlending,
    vertexShader: lt,
    fragmentShader: ct,
    ...z,
    // Must be transparent.
    transparent: !0
  }), [n, o]), v = y(() => {
    const f = [];
    for (let h = 0; h < t; h++) {
      const g = i.clone();
      m && (g.onBeforeCompile = m);
      const p = new a.Mesh(s.clone(), g);
      p.rotateZ(2 * Math.PI * Math.random()), p.visible = !1, r.add(p), f.push(p);
    }
    return f;
  }, [m, s, i, r, t]);
  return re(() => () => {
    v.forEach((f) => {
      f.geometry.dispose(), Array.isArray(f.material) ? f.material.forEach((h) => h.dispose()) : f.material.dispose(), r.remove(f);
    });
  }, [r, v]), v;
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
  dpr: o,
  samples: m,
  isSizeUpdate: s,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const f = B(o), h = y(() => new a.Scene(), []), g = vt({
    scale: t,
    max: n,
    texture: e,
    scene: h,
    uniforms: i,
    onBeforeCompile: v
  }), p = $(r), l = Me(), [d, u] = N({
    scene: h,
    camera: p,
    size: r,
    dpr: f.fbo,
    samples: m,
    isSizeUpdate: s
  }), [c, b] = q(pt), S = O(0);
  return [
    A(
      (x, _, C) => {
        const { gl: D, pointer: U, size: F } = x;
        _ && b(_);
        const I = c.pointerValues || l(U);
        if (c.frequency < I.diffPointer.length()) {
          const R = g[S.current], T = R.material;
          R.visible = !0, R.position.set(
            I.currentPointer.x * (F.width / 2),
            I.currentPointer.y * (F.height / 2),
            0
          ), R.scale.x = R.scale.y = 0, P(T)("uOpacity", c.alpha), S.current = (S.current + 1) % n;
        }
        return g.forEach((R) => {
          if (R.visible) {
            const T = R.material;
            R.rotation.z += c.rotation, R.scale.x = c.fadeout_speed * R.scale.x + c.scale, R.scale.y = R.scale.x;
            const k = T.uniforms.uOpacity.value;
            P(T)(
              "uOpacity",
              k * c.fadeout_speed
            ), k < 1e-3 && (R.visible = !1), V(T)(C);
          }
        }), u(D);
      },
      [u, g, l, n, c, b]
    ),
    b,
    {
      scene: h,
      camera: p,
      meshArr: g,
      renderTarget: d,
      output: d.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, te = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new a.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), $n = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = ft({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(te), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _, clock: C } = S;
        return M && d(M), u("scale", l.scale), u("timeStrength", l.timeStrength), u("noiseOctaves", l.noiseOctaves), u("fbmOctaves", l.fbmOctaves), u("warpOctaves", l.warpOctaves), u("warpDirection", l.warpDirection), u("warpStrength", l.warpStrength), u("uTime", l.beat || C.getElapsedTime()), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
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
}), qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = xt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(H), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _, clock: C } = S;
        return M && d(M), l.texture ? (u("uTexture", l.texture), u("isTexture", !0)) : (u("isTexture", !1), u("scale", l.scale)), l.noise ? (u("noise", l.noise), u("isNoise", !0), u("noiseStrength", l.noiseStrength)) : u("isNoise", !1), u("uTime", l.beat || C.getElapsedTime()), u("laminateLayer", l.laminateLayer), u("laminateInterval", l.laminateInterval), u("laminateDetail", l.laminateDetail), u("distortion", l.distortion), u("colorFactor", l.colorFactor), u("timeStrength", l.timeStrength), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
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
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Mt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(oe), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _, clock: C } = S;
        return M && d(M), u("u_pattern", l.pattern), u("u_complexity", l.complexity), u("u_complexityAttenuation", l.complexityAttenuation), u("u_iterations", l.iterations), u("u_timeStrength", l.timeStrength), u("u_scale", l.scale), u("u_time", l.beat || C.getElapsedTime()), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, se = Object.freeze({
  texture: w,
  color1: new a.Color().set(0.5, 0.5, 0.5),
  color2: new a.Color().set(0.5, 0.5, 0.5),
  color3: new a.Color().set(1, 1, 1),
  color4: new a.Color().set(0, 0.1, 0.2),
  rgbWeight: new a.Vector3(0.299, 0.587, 0.114)
}), Nn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = wt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(se), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("uTexture", l.texture), u("uColor1", l.color1), u("uColor2", l.color2), u("uColor3", l.color3), u("uColor4", l.color4), u("uRgbWeight", l.rgbWeight), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, ye = Object.freeze({
  texture: w,
  color0: new a.Color(16777215),
  color1: new a.Color(0)
}), kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Dt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(ye), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("uTexture", l.texture), u("uColor0", l.color0), u("uColor1", l.color1), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, le = Object.freeze({
  texture: w,
  map: w,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), Gn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = At({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(le), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("u_texture", l.texture), u("u_map", l.map), u("u_mapIntensity", l.mapIntensity), l.alphaMap ? (u("u_alphaMap", l.alphaMap), u("u_isAlphaMap", !0)) : u("u_isAlphaMap", !1), u("u_brightness", l.brightness), u("u_min", l.min), u("u_max", l.max), l.dodgeColor ? (u("u_dodgeColor", l.dodgeColor), u("u_isDodgeColor", !0)) : u("u_isDodgeColor", !1), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  onBeforeCompile: o
}) => {
  const m = y(() => new a.PlaneGeometry(2, 2), []), s = y(() => {
    var h, g;
    const f = new a.ShaderMaterial({
      uniforms: {
        uResolution: { value: new a.Vector2() },
        uTextureResolution: { value: new a.Vector2() },
        uTexture0: { value: w },
        uTexture1: { value: w },
        padding: { value: ne.padding },
        uMap: { value: w },
        edgeIntensity: { value: ne.edgeIntensity },
        mapIntensity: { value: ne.mapIntensity },
        epicenter: { value: ne.epicenter },
        progress: { value: ne.progress },
        dirX: { value: (h = ne.dir) == null ? void 0 : h.x },
        dirY: { value: (g = ne.dir) == null ? void 0 : g.y },
        ...r
      },
      vertexShader: It,
      fragmentShader: Ft,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), i = K(t, n);
  P(s)("uResolution", i.clone());
  const v = L(e, m, s, a.Mesh);
  return { material: s, mesh: v };
}, ne = Object.freeze({
  texture0: w,
  texture1: w,
  padding: 0,
  map: w,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  dir: new a.Vector2(0, 0)
}), Kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Vt({
    scene: i,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(ne), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        var F, I, R, T, k, J, X, ce;
        const { gl: _ } = S;
        M && d(M), u("uTexture0", l.texture0), u("uTexture1", l.texture1), u("progress", l.progress);
        const C = [
          ((I = (F = l.texture0) == null ? void 0 : F.image) == null ? void 0 : I.width) || 0,
          ((T = (R = l.texture0) == null ? void 0 : R.image) == null ? void 0 : T.height) || 0
        ], D = [
          ((J = (k = l.texture1) == null ? void 0 : k.image) == null ? void 0 : J.width) || 0,
          ((ce = (X = l.texture1) == null ? void 0 : X.image) == null ? void 0 : ce.height) || 0
        ], U = C.map((ie, G) => ie + (D[G] - ie) * l.progress);
        return u("uTextureResolution", U), u("padding", l.padding), u("uMap", l.map), u("mapIntensity", l.mapIntensity), u("edgeIntensity", l.edgeIntensity), u("epicenter", l.epicenter), u("dirX", l.dir.x), u("dirY", l.dir.y), c(x), p(_);
      },
      [p, u, l, d, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, me = Object.freeze({
  texture: w,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), Xn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Ot({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(
    me
  ), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("u_texture", l.texture), u("u_brightness", l.brightness), u("u_min", l.min), u("u_max", l.max), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, Ie = Object.freeze({
  texture: w,
  map: w,
  mapIntensity: 0.3
}), Yn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Wt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(Ie), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("u_texture", l.texture), u("u_map", l.map), u("u_mapIntensity", l.mapIntensity), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, jt = Object.freeze({
  texture: w,
  map: w
}), Hn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = qt({
    scene: i,
    size: e,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(jt), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("uTexture", l.texture), u("uMap", l.map), c(x), p(_);
      },
      [u, p, l, d, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, be = Object.freeze({
  texture: w,
  brightness: 1,
  saturation: 1
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Gt({
    scene: i,
    size: e,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(be), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("u_texture", l.texture), u("u_brightness", l.brightness), u("u_saturation", l.saturation), c(x), p(_);
      },
      [u, p, l, d, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  onBeforeCompile: o
}) => {
  const m = y(() => new a.PlaneGeometry(2, 2), []), s = y(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uResolution: { value: new a.Vector2() },
        uTextureResolution: { value: new a.Vector2() },
        uTexture: { value: w },
        ...r
      },
      vertexShader: Kt,
      fragmentShader: Xt,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), i = K(t, n);
  P(s)("uResolution", i.clone());
  const v = L(e, m, s, a.Mesh);
  return { material: s, mesh: v };
}, Ht = Object.freeze({
  texture: w
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Yt({
    scene: i,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(Ht), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        var C, D, U, F, I, R;
        const { gl: _ } = S;
        return M && d(M), u("uTexture", l.texture), u("uTextureResolution", [
          ((U = (D = (C = l.texture) == null ? void 0 : C.source) == null ? void 0 : D.data) == null ? void 0 : U.width) || 0,
          ((R = (I = (F = l.texture) == null ? void 0 : F.source) == null ? void 0 : I.data) == null ? void 0 : R.height) || 0
        ]), c(x), p(_);
      },
      [p, u, l, d, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uResolution: { value: new a.Vector2(0, 0) },
        uBlurSize: { value: Fe.blurSize },
        ...t
      },
      vertexShader: Qt,
      fragmentShader: Zt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, Fe = Object.freeze({
  texture: w,
  blurSize: 3,
  blurPower: 5
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = Jt({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), g = y(
    () => ({
      scene: i,
      camera: h,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [i, h, e, s.fbo, n, r]
  ), [p, l] = ae(g), [d, u] = q(Fe), c = P(v), b = V(v);
  return [
    A(
      (M, x, _) => {
        var F, I, R, T, k, J;
        const { gl: C } = M;
        x && u(x), c("uTexture", d.texture), c("uResolution", [
          ((R = (I = (F = d.texture) == null ? void 0 : F.source) == null ? void 0 : I.data) == null ? void 0 : R.width) || 0,
          ((J = (k = (T = d.texture) == null ? void 0 : T.source) == null ? void 0 : k.data) == null ? void 0 : J.height) || 0
        ]), c("uBlurSize", d.blurSize);
        let D = l(C);
        const U = d.blurPower;
        for (let X = 0; X < U; X++)
          c("uTexture", D), D = l(C);
        return b(_), D;
      },
      [l, c, u, d, b]
    ),
    u,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: p,
      output: p.read.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, de = Object.freeze({
  texture: w,
  begin: new a.Vector2(0, 0),
  end: new a.Vector2(0, 0),
  strength: 0.9
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = nn({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), g = y(
    () => ({
      scene: i,
      camera: h,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [i, h, e, s.fbo, n, r]
  ), [p, l] = ae(g), [d, u] = q(de), c = P(v), b = V(v);
  return [
    A(
      (M, x, _) => {
        const { gl: C } = M;
        return x && u(x), c("uTexture", d.texture), c("uBegin", d.begin), c("uEnd", d.end), c("uStrength", d.strength), b(_), l(C, ({ read: D }) => {
          c("uBackbuffer", D);
        });
      },
      [l, c, u, d, b]
    ),
    u,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: p,
      output: p.read.texture
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
  const r = y(() => new a.PlaneGeometry(2, 2), []), o = y(() => {
    const s = new a.ShaderMaterial({
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
  }, [n, t]), m = L(e, r, o, a.Mesh);
  return { material: o, mesh: m };
}, ve = Object.freeze({
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = an({ scene: i, uniforms: o, onBeforeCompile: m }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(ve), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("uEpicenter", l.epicenter), u("uProgress", l.progress), u("uWidth", l.width), u("uStrength", l.strength), u(
          "uMode",
          l.mode === "center" ? 0 : l.mode === "horizontal" ? 1 : 2
        ), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  onBeforeCompile: o
}) => {
  const m = y(() => new a.PlaneGeometry(2, 2), []), s = y(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: w },
        u_resolution: { value: new a.Vector2() },
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
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), i = K(t, n);
  P(s)("u_resolution", i.clone());
  const v = L(e, m, s, a.Mesh);
  return { material: s, mesh: v };
}, Q = Object.freeze({
  texture: w,
  keyColor: new a.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new a.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = ln({
    scene: i,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), [g, p] = N({
    scene: i,
    camera: h,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [l, d] = q(Q), u = P(v), c = V(v);
  return [
    A(
      (S, M, x) => {
        const { gl: _ } = S;
        return M && d(M), u("u_texture", l.texture), u("u_keyColor", l.keyColor), u("u_similarity", l.similarity), u("u_smoothness", l.smoothness), u("u_spill", l.spill), u("u_color", l.color), u("u_contrast", l.contrast), u("u_brightness", l.brightness), u("u_gamma", l.gamma), c(x), p(_);
      },
      [p, u, d, l, c]
    ),
    d,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: g,
      output: g.texture
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
  onBeforeCompile: o
}) => {
  const m = y(() => new a.PlaneGeometry(2, 2), []), s = y(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: w },
        uBackbuffer: { value: w },
        uTime: { value: 0 },
        uPointer: { value: new a.Vector2() },
        uResolution: { value: new a.Vector2() },
        ...r
      },
      vertexShader: cn,
      fragmentShader: vn,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), i = K(t, n);
  P(s)("uResolution", i.clone());
  const v = L(e, m, s, a.Mesh);
  return { material: s, mesh: v };
}, mn = Object.freeze({
  texture: w,
  beat: !1
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: m
}) => {
  const s = B(t), i = y(() => new a.Scene(), []), { material: v, mesh: f } = pn({
    scene: i,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: m
  }), h = $(e), g = y(
    () => ({
      scene: i,
      camera: h,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [i, h, e, s.fbo, n, r]
  ), [p, l] = ae(g), [d, u] = q(mn), c = P(v), b = V(v);
  return [
    A(
      (M, x, _) => {
        const { gl: C, clock: D, pointer: U } = M;
        return x && u(x), c("uTexture", d.texture), c("uPointer", U), c("uTime", d.beat || D.getElapsedTime()), b(_), l(C, ({ read: F }) => {
          c("uBackbuffer", F);
        });
      },
      [l, c, u, d, b]
    ),
    u,
    {
      scene: i,
      mesh: f,
      material: v,
      camera: h,
      renderTarget: p,
      output: p.read.texture
    }
  ];
}, dn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = L(
    e,
    t,
    n,
    a.Points
  ), o = L(
    e,
    y(() => t.clone(), [t]),
    y(() => n.clone(), [n]),
    a.Mesh
  );
  return o.visible = !1, {
    points: r,
    interactiveMesh: o
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
const De = (e, t, n, r, o) => {
  var h;
  const m = n === "position" ? "positionTarget" : "uvTarget", s = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", i = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", v = n === "position" ? "positionsList" : "uvsList", f = n === "position" ? `
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
      new a.BufferAttribute(e[0], o)
    );
    let g = "", p = "";
    e.forEach((l, d) => {
      t.setAttribute(
        `${m}${d}`,
        new a.BufferAttribute(l, o)
      ), g += `attribute vec${o} ${m}${d};
`, d === 0 ? p += `${m}${d}` : p += `,${m}${d}`;
    }), r = r.replace(
      `${s}`,
      g
    ), r = r.replace(
      `${i}`,
      `vec${o} ${v}[${e.length}] = vec${o}[](${p});
				${f}
			`
    );
  } else
    r = r.replace(`${s}`, ""), r = r.replace(`${i}`, ""), (h = t == null ? void 0 : t.attributes[n]) != null && h.array || Ae && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, Re = (e, t, n, r) => {
  var m;
  let o = [];
  if (e && e.length > 0) {
    (m = t == null ? void 0 : t.attributes[n]) != null && m.array ? o = [
      t.attributes[n].array,
      ...e
    ] : o = e;
    const s = Math.max(...o.map((i) => i.length));
    o.forEach((i, v) => {
      if (i.length < s) {
        const f = (s - i.length) / r, h = [], g = Array.from(i);
        for (let p = 0; p < f; p++) {
          const l = Math.floor(i.length / r * Math.random()) * r;
          for (let d = 0; d < r; d++)
            h.push(g[l + d]);
        }
        o[v] = new Float32Array([...g, ...h]);
      }
    });
  }
  return o;
}, hn = (e, t) => {
  let n = "";
  const r = {};
  let o = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((s, i) => {
    const v = `vMapArrayIndex < ${i}.1`, f = `texture2D(uMapArray${i}, uv)`;
    o += `( ${v} ) ? ${f} : `, n += `
        uniform sampler2D uMapArray${i};
      `, r[`uMapArray${i}`] = { value: s };
  }), o += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (o += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", o).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, xn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: o,
  mapArray: m,
  uniforms: s,
  onBeforeCompile: i
}) => {
  const v = y(
    () => Re(r, n, "position", 3),
    [r, n]
  ), f = y(
    () => Re(o, n, "uv", 2),
    [o, n]
  ), h = y(() => {
    v.length !== f.length && Ae && console.log("use-shader-fx:positions and uvs are not matched");
    const p = De(
      f,
      n,
      "uv",
      De(
        v,
        n,
        "position",
        fn,
        3
      ),
      2
    ).replace("#usf <getWobble>", Ve), { rewritedFragmentShader: l, mapArrayUniforms: d } = hn(m, gn), u = new a.ShaderMaterial({
      vertexShader: p,
      fragmentShader: l,
      blending: a.AdditiveBlending,
      ...z,
      // Must be transparent
      transparent: !0,
      uniforms: {
        uResolution: { value: new a.Vector2(0, 0) },
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
        ...d,
        ...s
      }
    });
    return i && (u.onBeforeCompile = i), u;
  }, [
    n,
    v,
    f,
    m,
    i,
    s
  ]), g = K(e, t);
  return P(h)("uResolution", g.clone()), { material: h, modifiedPositions: v, modifiedUvs: f };
}, yn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: o,
  uvs: m,
  mapArray: s,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const f = B(t), h = y(() => {
    const M = r || new a.SphereGeometry(1, 32, 32);
    return M.setIndex(null), M.deleteAttribute("normal"), M;
  }, [r]), { material: g, modifiedPositions: p, modifiedUvs: l } = xn({
    size: e,
    dpr: f.shader,
    geometry: h,
    positions: o,
    uvs: m,
    mapArray: s,
    uniforms: i,
    onBeforeCompile: v
  }), { points: d, interactiveMesh: u } = dn({
    scene: n,
    geometry: h,
    material: g
  }), c = P(g), b = V(g);
  return [
    A(
      (M, x, _) => {
        M && c(
          "uTime",
          (x == null ? void 0 : x.beat) || M.clock.getElapsedTime()
        ), x !== void 0 && (c("uMorphProgress", x.morphProgress), c("uBlurAlpha", x.blurAlpha), c("uBlurRadius", x.blurRadius), c("uPointSize", x.pointSize), c("uPointAlpha", x.pointAlpha), x.picture ? (c("uPicture", x.picture), c("uIsPicture", !0)) : x.picture === !1 && c("uIsPicture", !1), x.alphaPicture ? (c("uAlphaPicture", x.alphaPicture), c("uIsAlphaPicture", !0)) : x.alphaPicture === !1 && c("uIsAlphaPicture", !1), c("uColor0", x.color0), c("uColor1", x.color1), c("uColor2", x.color2), c("uColor3", x.color3), x.map ? (c("uMap", x.map), c("uIsMap", !0)) : x.map === !1 && c("uIsMap", !1), x.alphaMap ? (c("uAlphaMap", x.alphaMap), c("uIsAlphaMap", !0)) : x.alphaMap === !1 && c("uIsAlphaMap", !1), c("uWobbleStrength", x.wobbleStrength), c(
          "uWobblePositionFrequency",
          x.wobblePositionFrequency
        ), c("uWobbleTimeFrequency", x.wobbleTimeFrequency), c("uWarpStrength", x.warpStrength), c("uWarpPositionFrequency", x.warpPositionFrequency), c("uWarpTimeFrequency", x.warpTimeFrequency), x.displacement ? (c("uDisplacement", x.displacement), c("uIsDisplacement", !0)) : x.displacement === !1 && c("uIsDisplacement", !1), c("uDisplacementIntensity", x.displacementIntensity), c(
          "uDisplacementColorIntensity",
          x.displacementColorIntensity
        ), c("uSizeRandomIntensity", x.sizeRandomIntensity), c(
          "uSizeRandomTimeFrequency",
          x.sizeRandomTimeFrequency
        ), c("uSizeRandomMin", x.sizeRandomMin), c("uSizeRandomMax", x.sizeRandomMax), c("uDivergence", x.divergence), c("uDivergencePoint", x.divergencePoint), b(_));
      },
      [c, b]
    ),
    {
      points: d,
      interactiveMesh: u,
      positions: p,
      uvs: l
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
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: o,
  geometry: m,
  positions: s,
  uvs: i,
  uniforms: v,
  onBeforeCompile: f
}) => {
  const h = B(t), g = y(() => new a.Scene(), []), [
    p,
    {
      points: l,
      interactiveMesh: d,
      positions: u,
      uvs: c
    }
  ] = yn({
    scene: g,
    size: e,
    dpr: t,
    geometry: m,
    positions: s,
    uvs: i,
    uniforms: v,
    onBeforeCompile: f
  }), [b, S] = N({
    scene: g,
    camera: o,
    size: e,
    dpr: h.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = A(
    (_, C, D) => (p(_, C, D), S(_.gl)),
    [S, p]
  ), x = A(
    (_, C) => {
      p(null, _, C);
    },
    [p]
  );
  return [
    M,
    x,
    {
      scene: g,
      points: l,
      interactiveMesh: d,
      renderTarget: b,
      output: b.texture,
      positions: u,
      uvs: c
    }
  ];
};
function bn(e, t = 1e-4) {
  t = Math.max(t, Number.EPSILON);
  const n = {}, r = e.getIndex(), o = e.getAttribute("position"), m = r ? r.count : o.count;
  let s = 0;
  const i = Object.keys(e.attributes), v = {}, f = {}, h = [], g = ["getX", "getY", "getZ", "getW"];
  for (let u = 0, c = i.length; u < c; u++) {
    const b = i[u];
    v[b] = [];
    const S = e.morphAttributes[b];
    S && (f[b] = new Array(S.length).fill(0).map(() => []));
  }
  const p = Math.log10(1 / t), l = Math.pow(10, p);
  for (let u = 0; u < m; u++) {
    const c = r ? r.getX(u) : u;
    let b = "";
    for (let S = 0, M = i.length; S < M; S++) {
      const x = i[S], _ = e.getAttribute(x), C = _.itemSize;
      for (let D = 0; D < C; D++)
        b += `${~~(_[g[D]](c) * l)},`;
    }
    if (b in n)
      h.push(n[b]);
    else {
      for (let S = 0, M = i.length; S < M; S++) {
        const x = i[S], _ = e.getAttribute(x), C = e.morphAttributes[x], D = _.itemSize, U = v[x], F = f[x];
        for (let I = 0; I < D; I++) {
          const R = g[I];
          if (U.push(_[R](c)), C)
            for (let T = 0, k = C.length; T < k; T++)
              F[T].push(C[T][R](c));
        }
      }
      n[b] = s, h.push(s), s++;
    }
  }
  const d = e.clone();
  for (let u = 0, c = i.length; u < c; u++) {
    const b = i[u], S = e.getAttribute(b), M = new S.array.constructor(v[b]), x = new Te(M, S.itemSize, S.normalized);
    if (d.setAttribute(b, x), b in f)
      for (let _ = 0; _ < f[b].length; _++) {
        const C = e.morphAttributes[b][_], D = new C.array.constructor(f[b][_]), U = new Te(D, C.itemSize, C.normalized);
        d.morphAttributes[b][_] = U;
      }
  }
  return d.setIndex(h), d;
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

for (float i = 0.0; i < uSamples; i ++) {
	vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
	
	transmissionR = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).r;
	transmissionG = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + randomCoords) / uSamples) , material.thickness + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).g;
	transmissionB = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + randomCoords) / uSamples), material.thickness + thickness_smear * (i + randomCoords) / uSamples,
		material.attenuationColor, material.attenuationDistance
	).b;
	transmission.r += transmissionR;
	transmission.g += transmissionG;
	transmission.b += transmissionB;
}

transmission /= uSamples;

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
		void main() {`
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
  uniforms: o
}) => {
  const { material: m, depthMaterial: s } = y(() => {
    const i = new (e || a.MeshPhysicalMaterial)(
      t || {}
    ), v = i.type === "MeshPhysicalMaterial" || i.type === "MeshStandardMaterial", f = i.type === "MeshPhysicalMaterial";
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
        uWobbleShine: { value: W.wobbleShine },
        uIsWobbleMap: { value: !1 },
        uWobbleMap: { value: w },
        uWobbleMapStrength: { value: W.wobbleMapStrength },
        uWobbleMapDistortion: {
          value: W.wobbleMapDistortion
        },
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
        uSamples: { value: W.samples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null },
        ...o
      }
    }), i.onBeforeCompile = (g, p) => {
      Object.assign(g.uniforms, i.userData.uniforms), g.vertexShader = Pe(g.vertexShader), g.fragmentShader = g.fragmentShader.replace(
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
      ), v && (g.fragmentShader = g.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
      )), g.fragmentShader = g.fragmentShader.replace(
        "void main() {",
        `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				uniform float uEdgeThreshold;
				uniform vec3 uEdgeColor;
				uniform float uWobbleShine;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				uniform float uSamples;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				${Mn}

				varying float vWobble;
				varying vec2 vPosition;
				varying vec3 vEdgeNormal;
				varying vec3 vEdgeViewPosition;
				
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${v ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${v ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), f && (g.fragmentShader = g.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${Sn}`
      ), g.fragmentShader = g.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${_n}`
      )), n && n(g, p);
    }, i.needsUpdate = !0;
    const h = new a.MeshDepthMaterial({
      depthPacking: a.RGBADepthPacking
    });
    return h.onBeforeCompile = (g, p) => {
      Object.assign(g.uniforms, i.userData.uniforms), g.vertexShader = Pe(g.vertexShader), r && r(g, p);
    }, h.needsUpdate = !0, { material: i, depthMaterial: h };
  }, [
    t,
    e,
    n,
    r,
    o
  ]);
  return {
    material: m,
    depthMaterial: s
  };
}, Cn = ({
  scene: e = !1,
  geometry: t,
  baseMaterial: n,
  materialParameters: r,
  onBeforeCompile: o,
  depthOnBeforeCompile: m,
  uniforms: s
}) => {
  const i = y(() => {
    let u = t || new a.IcosahedronGeometry(2, 20);
    return u = bn(u), u.computeTangents(), u;
  }, [t]), { material: v, depthMaterial: f } = wn({
    baseMaterial: n,
    materialParameters: r,
    onBeforeCompile: o,
    depthOnBeforeCompile: m,
    uniforms: s
  }), h = L(e, i, v, a.Mesh), g = v.userData, p = P(g), l = V(g);
  return [
    A(
      (u, c, b) => {
        u && p(
          "uTime",
          (c == null ? void 0 : c.beat) || u.clock.getElapsedTime()
        ), c !== void 0 && (p("uWobbleStrength", c.wobbleStrength), p(
          "uWobblePositionFrequency",
          c.wobblePositionFrequency
        ), p("uWobbleTimeFrequency", c.wobbleTimeFrequency), p("uWarpStrength", c.warpStrength), p("uWarpPositionFrequency", c.warpPositionFrequency), p("uWarpTimeFrequency", c.warpTimeFrequency), p("uWobbleShine", c.wobbleShine), c.wobbleMap ? (p("uWobbleMap", c.wobbleMap), p("uIsWobbleMap", !0)) : c.wobbleMap === !1 && p("uIsWobbleMap", !1), p("uWobbleMapStrength", c.wobbleMapStrength), p("uWobbleMapDistortion", c.wobbleMapDistortion), p("uSamples", c.samples), p("uColor0", c.color0), p("uColor1", c.color1), p("uColor2", c.color2), p("uColor3", c.color3), p("uColorMix", c.colorMix), p("uEdgeThreshold", c.edgeThreshold), p("uEdgeColor", c.edgeColor), p("uChromaticAberration", c.chromaticAberration), p("uAnisotropicBlur", c.anisotropicBlur), p("uDistortion", c.distortion), p("uDistortionScale", c.distortionScale), p("uTemporalDistortion", c.temporalDistortion), l(b));
      },
      [p, l]
    ),
    {
      mesh: h,
      depthMaterial: f
    }
  ];
}, W = Object.freeze({
  beat: !1,
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  wobbleShine: 0,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
  wobbleMap: !1,
  wobbleMapStrength: 0.03,
  wobbleMapDistortion: 0,
  samples: 6,
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
  temporalDistortion: 0
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: o,
  geometry: m,
  baseMaterial: s,
  materialParameters: i,
  uniforms: v,
  onBeforeCompile: f,
  depthOnBeforeCompile: h
}) => {
  const g = B(t), p = y(() => new a.Scene(), []), [l, { mesh: d, depthMaterial: u }] = Cn({
    baseMaterial: s,
    materialParameters: i,
    scene: p,
    geometry: m,
    uniforms: v,
    onBeforeCompile: f,
    depthOnBeforeCompile: h
  }), [c, b] = N({
    scene: p,
    camera: o,
    size: e,
    dpr: g.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), S = A(
    (x, _, C) => (l(x, _, C), b(x.gl)),
    [b, l]
  ), M = A(
    (x, _) => {
      l(null, x, _);
    },
    [l]
  );
  return [
    S,
    M,
    {
      scene: p,
      mesh: d,
      depthMaterial: u,
      renderTarget: c,
      output: c.texture
    }
  ];
}, ir = (e, t, n) => {
  const r = y(() => {
    const o = new a.Mesh(t, n);
    return e.add(o), o;
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
    (m) => {
      let s = m.getElapsedTime() * n;
      const i = Math.floor(s), v = r(s - i);
      s = v + i;
      const f = Tn(i);
      return {
        beat: s,
        floor: i,
        fract: v,
        hash: f
      };
    },
    [n, r]
  );
}, sr = (e = 60) => {
  const t = y(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = O(null);
  return A(
    (o) => {
      const m = o.getElapsedTime();
      return n.current === null || m - n.current >= t ? (n.current = m, !0) : !1;
    },
    [t]
  );
}, Dn = (e) => {
  var r, o;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (o = e.texture) == null ? void 0 : o.length;
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
  t.children.length > 0 && (t.children.forEach((o) => {
    o instanceof a.Mesh && (o.geometry.dispose(), o.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((o, m) => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: o },
        u_textureResolution: {
          value: new a.Vector2(0, 0)
        },
        u_resolution: { value: new a.Vector2(0, 0) },
        u_borderRadius: {
          value: e.boderRadius[m] ? e.boderRadius[m] : 0
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
    const i = new a.Mesh(new a.PlaneGeometry(1, 1), s);
    t.add(i);
  });
}, In = () => {
  const e = O([]), t = O([]);
  return A(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: o,
      params: m
    }) => {
      e.current.length > 0 && e.current.forEach((i, v) => {
        i.unobserve(t.current[v]);
      }), t.current = [], e.current = [];
      const s = new Array(m.dom.length).fill(!1);
      r.current = [...s], o.current = [...s], m.dom.forEach((i, v) => {
        const f = (g) => {
          g.forEach((p) => {
            m.onIntersect[v] && m.onIntersect[v](p), r.current[v] = p.isIntersecting;
          });
        }, h = new IntersectionObserver(f, {
          rootMargin: "0px",
          threshold: 0
        });
        h.observe(i), e.current.push(h), t.current.push(i);
      });
    },
    []
  );
}, Fn = () => {
  const e = O([]), t = A(
    ({
      params: n,
      customParams: r,
      size: o,
      resolutionRef: m,
      scene: s,
      isIntersectingRef: i
    }) => {
      s.children.length !== e.current.length && (e.current = new Array(s.children.length)), s.children.forEach((v, f) => {
        var p, l, d, u, c, b;
        const h = n.dom[f];
        if (!h)
          return;
        const g = h.getBoundingClientRect();
        if (e.current[f] = g, v.scale.set(g.width, g.height, 1), v.position.set(
          g.left + g.width * 0.5 - o.width * 0.5,
          -g.top - g.height * 0.5 + o.height * 0.5,
          0
        ), i.current[f] && (n.rotation[f] && v.rotation.copy(n.rotation[f]), v instanceof a.Mesh)) {
          const S = v.material, M = P(S), x = V(S);
          M("u_texture", n.texture[f]), M("u_textureResolution", [
            ((d = (l = (p = n.texture[f]) == null ? void 0 : p.source) == null ? void 0 : l.data) == null ? void 0 : d.width) || 0,
            ((b = (c = (u = n.texture[f]) == null ? void 0 : u.source) == null ? void 0 : c.data) == null ? void 0 : b.height) || 0
          ]), M(
            "u_resolution",
            m.current.set(g.width, g.height)
          ), M(
            "u_borderRadius",
            n.boderRadius[f] ? n.boderRadius[f] : 0
          ), x(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Vn = () => {
  const e = O([]), t = O([]), n = A((r, o = !1) => {
    e.current.forEach((s, i) => {
      s && (t.current[i] = !0);
    });
    const m = o ? [...t.current] : [...e.current];
    return r < 0 ? m : m[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, zn = (e) => ({ onView: n, onHidden: r }) => {
  const o = O(!1);
  re(() => {
    let m;
    const s = () => {
      e.current.some((i) => i) ? o.current || (n && n(), o.current = !0) : o.current && (r && r(), o.current = !1), m = requestAnimationFrame(s);
    };
    return m = requestAnimationFrame(s), () => {
      cancelAnimationFrame(m);
    };
  }, [n, r]);
}, Un = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, lr = ({ size: e, dpr: t, samples: n, isSizeUpdate: r, uniforms: o, onBeforeCompile: m }, s = []) => {
  const i = B(t), v = y(() => new a.Scene(), []), f = $(e), [h, g] = N({
    scene: v,
    camera: f,
    size: e,
    dpr: i.fbo,
    samples: n,
    isSizeUpdate: r
  }), [p, l] = q({
    ...Un,
    updateKey: performance.now()
  }), [d, u] = Fn(), c = O(new a.Vector2(0, 0)), [b, S] = Ee(!0);
  y(
    () => S(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const M = O(null), x = y(() => w, []), _ = In(), { isIntersectingOnceRef: C, isIntersectingRef: D, isIntersecting: U } = Vn(), F = zn(D);
  return [
    A(
      (R, T, k) => {
        const { gl: J, size: X } = R;
        if (T && l(T), Dn(p))
          return x;
        if (b) {
          if (M.current === p.updateKey)
            return x;
          M.current = p.updateKey;
        }
        return b && (An({
          params: p,
          size: X,
          scene: v,
          uniforms: o,
          onBeforeCompile: m
        }), _({
          isIntersectingRef: D,
          isIntersectingOnceRef: C,
          params: p
        }), S(!1)), u({
          params: p,
          customParams: k,
          size: X,
          resolutionRef: c,
          scene: v,
          isIntersectingRef: D
        }), g(J);
      },
      [
        g,
        o,
        l,
        _,
        u,
        m,
        b,
        v,
        p,
        C,
        D,
        x
      ]
    ),
    l,
    {
      scene: v,
      camera: f,
      renderTarget: h,
      output: h.texture,
      isIntersecting: U,
      DOMRects: d,
      intersections: D.current,
      useDomView: F
    }
  ];
}, cr = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: m = 0,
  depthBuffer: s = !1,
  depthTexture: i = !1
}, v) => {
  const f = O([]), h = K(n, r);
  f.current = y(() => Array.from({ length: v }, () => {
    const p = new a.WebGLRenderTarget(
      h.x,
      h.y,
      {
        ...ge,
        samples: m,
        depthBuffer: s
      }
    );
    return i && (p.depthTexture = new a.DepthTexture(
      h.x,
      h.y,
      a.FloatType
    )), p;
  }), [v]), o && f.current.forEach(
    (p) => p.setSize(h.x, h.y)
  ), re(() => {
    const p = f.current;
    return () => {
      p.forEach((l) => l.dispose());
    };
  }, [v]);
  const g = A(
    (p, l, d) => {
      const u = f.current[l];
      return Se({
        gl: p,
        scene: e,
        camera: t,
        fbo: u,
        onBeforeRender: () => d && d({ read: u.texture })
      }), u.texture;
    },
    [e, t]
  );
  return [f.current, g];
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
  W as WOBBLE3D_PARAMS,
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
