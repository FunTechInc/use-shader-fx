import * as t from "three";
import { BufferAttribute as oe } from "three";
import { useMemo as h, useEffect as E, useRef as D, useCallback as b, useState as fe } from "react";
var de = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ge = `precision highp float;

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
const $ = (e, u = !1) => {
  const o = u ? e.width * u : e.width, r = u ? e.height * u : e.height;
  return h(
    () => new t.Vector2(o, r),
    [o, r]
  );
}, a = (e, u, o) => {
  o !== void 0 && e.uniforms && e.uniforms[u] && o !== null && (e.uniforms[u].value = o);
}, I = (e, u, o, r) => {
  const n = h(() => {
    const v = new r(u, o);
    return e && e.add(v), v;
  }, [u, o, r, e]);
  return E(() => () => {
    e && e.remove(n), u.dispose(), o.dispose();
  }, [e, u, o, n]), n;
}, xe = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uBuffer: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uTexture: { value: new t.Texture() },
        uIsTexture: { value: !1 },
        uMap: { value: new t.Texture() },
        uIsMap: { value: !1 },
        uMapIntensity: { value: 0 },
        uRadius: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 0 },
        uMouse: { value: new t.Vector2(-10, -10) },
        uPrevMouse: { value: new t.Vector2(-10, -10) },
        uVelocity: { value: new t.Vector2(0, 0) },
        uColor: { value: new t.Vector3(1, 0, 0) },
        uIsCursor: { value: !1 },
        uPressureStart: { value: 1 },
        uPressureEnd: { value: 1 }
      },
      vertexShader: de,
      fragmentShader: ge
    }),
    []
  ), v = $(u, o);
  a(n, "uResolution", v.clone());
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, he = (e, u) => {
  const o = u, r = e / u, [n, v] = [o * r / 2, o / 2];
  return { width: n, height: v, near: -1e3, far: 1e3 };
}, F = (e, u = "OrthographicCamera") => {
  const o = $(e), { width: r, height: n, near: v, far: m } = he(
    o.x,
    o.y
  );
  return h(() => u === "OrthographicCamera" ? new t.OrthographicCamera(
    -r,
    r,
    n,
    -n,
    v,
    m
  ) : new t.PerspectiveCamera(50, r / n), [r, n, v, m, u]);
}, J = (e = 0) => {
  const u = D(new t.Vector2(0, 0)), o = D(new t.Vector2(0, 0)), r = D(new t.Vector2(0, 0)), n = D(0), v = D(new t.Vector2(0, 0)), m = D(!1);
  return b(
    (s) => {
      const i = performance.now();
      let l;
      m.current && e ? (r.current = r.current.lerp(
        s,
        1 - e
      ), l = r.current.clone()) : (l = s.clone(), r.current = l), n.current === 0 && (n.current = i, u.current = l);
      const g = Math.max(1, i - n.current);
      n.current = i, v.current.copy(l).sub(u.current).divideScalar(g);
      const f = v.current.length() > 0, x = m.current ? u.current.clone() : l;
      return !m.current && f && (m.current = !0), u.current = l, {
        currentPointer: l,
        prevPointer: x,
        diffPointer: o.current.subVectors(l, x),
        velocity: v.current,
        isVelocityUpdate: f
      };
    },
    [e]
  );
}, z = (e) => {
  const o = D(
    ((n) => Object.values(n).some((v) => typeof v == "function"))(e) ? e : structuredClone(e)
  ), r = b((n) => {
    for (const v in n) {
      const m = v;
      m in o.current && n[m] !== void 0 && n[m] !== null ? o.current[m] = n[m] : console.error(
        `"${String(
          m
        )}" does not exist in the params. or "${String(
          m
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, r];
}, Y = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, ee = ({
  gl: e,
  fbo: u,
  scene: o,
  camera: r,
  onBeforeRender: n,
  onSwap: v
}) => {
  e.setRenderTarget(u), n(), e.clear(), e.render(o, r), v && v(), e.setRenderTarget(null), e.clear();
}, A = ({
  scene: e,
  camera: u,
  size: o,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: v = 0,
  depthBuffer: m = !1,
  depthTexture: c = !1
}) => {
  var g;
  const s = D(), i = $(o, r);
  s.current = h(
    () => {
      const f = new t.WebGLRenderTarget(
        i.x,
        i.y,
        {
          ...Y,
          samples: v,
          depthBuffer: m
        }
      );
      return c && (f.depthTexture = new t.DepthTexture(
        i.x,
        i.y,
        t.FloatType
      )), f;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), n && ((g = s.current) == null || g.setSize(i.x, i.y)), E(() => {
    const f = s.current;
    return () => {
      f == null || f.dispose();
    };
  }, []);
  const l = b(
    (f, x) => {
      const d = s.current;
      return ee({
        gl: f,
        fbo: d,
        scene: e,
        camera: u,
        onBeforeRender: () => x && x({ read: d.texture })
      }), d.texture;
    },
    [e, u]
  );
  return [s.current, l];
}, G = ({
  scene: e,
  camera: u,
  size: o,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: v = 0,
  depthBuffer: m = !1,
  depthTexture: c = !1
}) => {
  var f, x;
  const s = D({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), i = $(o, r), l = h(() => {
    const d = new t.WebGLRenderTarget(i.x, i.y, {
      ...Y,
      samples: v,
      depthBuffer: m
    }), p = new t.WebGLRenderTarget(i.x, i.y, {
      ...Y,
      samples: v,
      depthBuffer: m
    });
    return c && (d.depthTexture = new t.DepthTexture(
      i.x,
      i.y,
      t.FloatType
    ), p.depthTexture = new t.DepthTexture(
      i.x,
      i.y,
      t.FloatType
    )), { read: d, write: p };
  }, []);
  s.current.read = l.read, s.current.write = l.write, n && ((f = s.current.read) == null || f.setSize(i.x, i.y), (x = s.current.write) == null || x.setSize(i.x, i.y)), E(() => {
    const d = s.current;
    return () => {
      var p, w;
      (p = d.read) == null || p.dispose(), (w = d.write) == null || w.dispose();
    };
  }, []);
  const g = b(
    (d, p) => {
      var y;
      const w = s.current;
      return ee({
        gl: d,
        scene: e,
        camera: u,
        fbo: w.write,
        onBeforeRender: () => p && p({
          read: w.read.texture,
          write: w.write.texture
        }),
        onSwap: () => w.swap()
      }), (y = w.read) == null ? void 0 : y.texture;
    },
    [e, u]
  );
  return [
    { read: s.current.read, write: s.current.write },
    g
  ];
}, ye = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), xt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = xe({ scene: r, size: e, dpr: u }), m = F(e), c = J(), [s, i] = G({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [l, g] = z(ye), f = D(null);
  return [
    b(
      (d, p) => {
        const { gl: w, pointer: y } = d;
        p && g(p), l.texture ? (a(n, "uIsTexture", !0), a(n, "uTexture", l.texture)) : a(n, "uIsTexture", !1), l.map ? (a(n, "uIsMap", !0), a(n, "uMap", l.map), a(n, "uMapIntensity", l.mapIntensity)) : a(n, "uIsMap", !1), a(n, "uRadius", l.radius), a(n, "uSmudge", l.smudge), a(n, "uDissipation", l.dissipation), a(n, "uMotionBlur", l.motionBlur), a(n, "uMotionSample", l.motionSample);
        const M = l.pointerValues || c(y);
        M.isVelocityUpdate && (a(n, "uMouse", M.currentPointer), a(n, "uPrevMouse", M.prevPointer)), a(n, "uVelocity", M.velocity);
        const C = typeof l.color == "function" ? l.color(M.velocity) : l.color;
        return a(n, "uColor", C), a(n, "uIsCursor", l.isCursor), a(n, "uPressureEnd", l.pressure), f.current === null && (f.current = l.pressure), a(n, "uPressureStart", f.current), f.current = l.pressure, i(w, ({ read: T }) => {
          a(n, "uBuffer", T);
        });
      },
      [n, c, i, l, g]
    ),
    g,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: s,
      output: s.read.texture
    }
  ];
};
var q = `varying vec2 vUv;
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
}`, we = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Me = () => h(
  () => new t.ShaderMaterial({
    vertexShader: q,
    fragmentShader: we,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var be = `precision highp float;

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
const Se = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: q,
    fragmentShader: be
  }),
  []
);
var _e = `precision highp float;

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
const Te = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: _e
  }),
  []
);
var Ce = `precision highp float;

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
const Pe = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Ce
  }),
  []
);
var De = `precision highp float;

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
const Re = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: De
  }),
  []
);
var Ae = `precision highp float;

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
const Ie = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Ae
  }),
  []
);
var Fe = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const ze = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Fe
  }),
  []
);
var Ue = `precision highp float;

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
const Ve = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Ue
  }),
  []
);
var Be = `precision highp float;

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
const Oe = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uTarget: { value: new t.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new t.Vector3() },
      point: { value: new t.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Be
  }),
  []
), Le = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = Me(), v = n.clone(), m = Re(), c = Ie(), s = Se(), i = Te(), l = Pe(), g = ze(), f = Ve(), x = Oe(), d = h(
    () => ({
      vorticityMaterial: c,
      curlMaterial: m,
      advectionMaterial: s,
      divergenceMaterial: i,
      pressureMaterial: l,
      clearMaterial: g,
      gradientSubtractMaterial: f,
      splatMaterial: x
    }),
    [
      c,
      m,
      s,
      i,
      l,
      g,
      f,
      x
    ]
  ), p = $(u, o);
  h(() => {
    a(
      d.splatMaterial,
      "aspectRatio",
      p.x / p.y
    );
    for (const M of Object.values(d))
      a(
        M,
        "texelSize",
        new t.Vector2(1 / p.x, 1 / p.y)
      );
  }, [p, d]);
  const w = I(e, r, n, t.Mesh);
  h(() => {
    n.dispose(), w.material = v;
  }, [n, w, v]), E(() => () => {
    for (const M of Object.values(d))
      M.dispose();
  }, [d]);
  const y = b(
    (M) => {
      w.material = M, w.material.needsUpdate = !0;
    },
    [w]
  );
  return { materials: d, setMeshMaterial: y, mesh: w };
}, We = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1),
  pointerValues: !1
}), ht = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { materials: n, setMeshMaterial: v, mesh: m } = Le({ scene: r, size: e, dpr: u }), c = F(e), s = J(), i = h(
    () => ({
      scene: r,
      camera: c,
      size: e,
      samples: o
    }),
    [r, c, e, o]
  ), [l, g] = G(i), [f, x] = G(i), [d, p] = A(i), [w, y] = A(i), [M, C] = G(i), T = D(0), P = D(new t.Vector2(0, 0)), S = D(new t.Vector3(0, 0, 0)), [_, B] = z(We);
  return [
    b(
      (L, j) => {
        const { gl: O, pointer: H, clock: Q, size: ne } = L;
        j && B(j), T.current === 0 && (T.current = Q.getElapsedTime());
        const te = Math.min(
          (Q.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = Q.getElapsedTime();
        const Z = g(O, ({ read: V }) => {
          v(n.advectionMaterial), a(n.advectionMaterial, "uVelocity", V), a(n.advectionMaterial, "uSource", V), a(n.advectionMaterial, "dt", te), a(
            n.advectionMaterial,
            "dissipation",
            _.velocity_dissipation
          );
        }), ve = x(O, ({ read: V }) => {
          v(n.advectionMaterial), a(n.advectionMaterial, "uVelocity", Z), a(n.advectionMaterial, "uSource", V), a(
            n.advectionMaterial,
            "dissipation",
            _.density_dissipation
          );
        }), K = _.pointerValues || s(H);
        K.isVelocityUpdate && (g(O, ({ read: V }) => {
          v(n.splatMaterial), a(n.splatMaterial, "uTarget", V), a(
            n.splatMaterial,
            "point",
            K.currentPointer
          );
          const N = K.diffPointer.multiply(
            P.current.set(ne.width, ne.height).multiplyScalar(_.velocity_acceleration)
          );
          a(
            n.splatMaterial,
            "color",
            S.current.set(N.x, N.y, 1)
          ), a(
            n.splatMaterial,
            "radius",
            _.splat_radius
          );
        }), x(O, ({ read: V }) => {
          v(n.splatMaterial), a(n.splatMaterial, "uTarget", V);
          const N = typeof _.fluid_color == "function" ? _.fluid_color(K.velocity) : _.fluid_color;
          a(n.splatMaterial, "color", N);
        }));
        const me = p(O, () => {
          v(n.curlMaterial), a(n.curlMaterial, "uVelocity", Z);
        });
        g(O, ({ read: V }) => {
          v(n.vorticityMaterial), a(n.vorticityMaterial, "uVelocity", V), a(n.vorticityMaterial, "uCurl", me), a(
            n.vorticityMaterial,
            "curl",
            _.curl_strength
          ), a(n.vorticityMaterial, "dt", te);
        });
        const pe = y(O, () => {
          v(n.divergenceMaterial), a(n.divergenceMaterial, "uVelocity", Z);
        });
        C(O, ({ read: V }) => {
          v(n.clearMaterial), a(n.clearMaterial, "uTexture", V), a(
            n.clearMaterial,
            "value",
            _.pressure_dissipation
          );
        }), v(n.pressureMaterial), a(n.pressureMaterial, "uDivergence", pe);
        let re;
        for (let V = 0; V < _.pressure_iterations; V++)
          re = C(O, ({ read: N }) => {
            a(n.pressureMaterial, "uPressure", N);
          });
        return g(O, ({ read: V }) => {
          v(n.gradientSubtractMaterial), a(
            n.gradientSubtractMaterial,
            "uPressure",
            re
          ), a(n.gradientSubtractMaterial, "uVelocity", V);
        }), ve;
      },
      [
        n,
        v,
        p,
        x,
        y,
        s,
        C,
        g,
        B,
        _
      ]
    ),
    B,
    {
      scene: r,
      mesh: m,
      materials: n,
      camera: c,
      renderTarget: {
        velocity: l,
        density: f,
        curl: d,
        divergence: w,
        pressure: M
      },
      output: f.read.texture
    }
  ];
}, $e = ({ scale: e, max: u, texture: o, scene: r }) => {
  const n = D([]), v = h(
    () => new t.PlaneGeometry(e, e),
    [e]
  ), m = h(
    () => new t.MeshBasicMaterial({
      map: o,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [o]
  );
  return E(() => {
    for (let c = 0; c < u; c++) {
      const s = new t.Mesh(v.clone(), m.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, r.add(s), n.current.push(s);
    }
  }, [v, m, r, u]), E(() => () => {
    n.current.forEach((c) => {
      c.geometry.dispose(), Array.isArray(c.material) ? c.material.forEach((s) => s.dispose()) : c.material.dispose(), r.remove(c);
    }), n.current = [];
  }, [r]), n.current;
}, Ee = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), yt = ({
  texture: e = new t.Texture(),
  scale: u = 64,
  max: o = 100,
  size: r,
  dpr: n,
  samples: v = 0
}) => {
  const m = h(() => new t.Scene(), []), c = $e({
    scale: u,
    max: o,
    texture: e,
    scene: m
  }), s = F(r), i = J(), [l, g] = A({
    scene: m,
    camera: s,
    size: r,
    dpr: n,
    samples: v
  }), [f, x] = z(Ee), d = D(0);
  return [
    b(
      (w, y) => {
        const { gl: M, pointer: C, size: T } = w;
        y && x(y);
        const P = f.pointerValues || i(C);
        if (f.frequency < P.diffPointer.length()) {
          const S = c[d.current];
          S.visible = !0, S.position.set(
            P.currentPointer.x * (T.width / 2),
            P.currentPointer.y * (T.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = f.alpha, d.current = (d.current + 1) % o;
        }
        return c.forEach((S) => {
          if (S.visible) {
            const _ = S.material;
            S.rotation.z += f.rotation, _.opacity *= f.fadeout_speed, S.scale.x = f.fadeout_speed * S.scale.x + f.scale, S.scale.y = S.scale.x, _.opacity < 2e-3 && (S.visible = !1);
          }
        }), g(M);
      },
      [g, c, i, o, f, x]
    ),
    x,
    {
      scene: m,
      camera: s,
      meshArr: c,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var qe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, je = `precision highp float;
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
const Ne = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        scale: { value: 0 },
        timeStrength: { value: 0 },
        noiseOctaves: { value: 0 },
        fbmOctaves: { value: 0 },
        warpOctaves: { value: 0 },
        warpDirection: { value: new t.Vector2() },
        warpStrength: { value: 0 }
      },
      vertexShader: qe,
      fragmentShader: je
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, ke = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), wt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Ne(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(ke);
  return [
    b(
      (f, x) => {
        const { gl: d, clock: p } = f;
        return x && l(x), a(n, "scale", i.scale), a(n, "timeStrength", i.timeStrength), a(n, "noiseOctaves", i.noiseOctaves), a(n, "fbmOctaves", i.fbmOctaves), a(n, "warpOctaves", i.warpOctaves), a(n, "warpDirection", i.warpDirection), a(n, "warpStrength", i.warpStrength), a(n, "uTime", i.beat || p.getElapsedTime()), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Ge = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ke = `precision highp float;
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
const Xe = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        isTexture: { value: !1 },
        scale: { value: 1 },
        noise: { value: new t.Texture() },
        noiseStrength: { value: new t.Vector2(0, 0) },
        isNoise: { value: !1 },
        laminateLayer: { value: 1 },
        laminateInterval: { value: new t.Vector2(0.1, 0.1) },
        laminateDetail: { value: new t.Vector2(1, 1) },
        distortion: { value: new t.Vector2(0, 0) },
        colorFactor: { value: new t.Vector3(1, 1, 1) },
        uTime: { value: 0 },
        timeStrength: { value: new t.Vector2(0, 0) }
      },
      vertexShader: Ge,
      fragmentShader: Ke
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, Ye = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new t.Vector2(0.1, 0.1),
  laminateDetail: new t.Vector2(1, 1),
  distortion: new t.Vector2(0, 0),
  colorFactor: new t.Vector3(1, 1, 1),
  timeStrength: new t.Vector2(0, 0),
  noise: !1,
  noiseStrength: new t.Vector2(0, 0),
  beat: !1
}), Mt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Xe(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(Ye);
  return [
    b(
      (f, x) => {
        const { gl: d, clock: p } = f;
        return x && l(x), i.texture ? (a(n, "uTexture", i.texture), a(n, "isTexture", !0)) : (a(n, "isTexture", !1), a(n, "scale", i.scale)), i.noise ? (a(n, "noise", i.noise), a(n, "isNoise", !0), a(n, "noiseStrength", i.noiseStrength)) : a(n, "isNoise", !1), a(n, "uTime", i.beat || p.getElapsedTime()), a(n, "laminateLayer", i.laminateLayer), a(n, "laminateInterval", i.laminateInterval), a(n, "laminateDetail", i.laminateDetail), a(n, "distortion", i.distortion), a(n, "colorFactor", i.colorFactor), a(n, "timeStrength", i.timeStrength), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var He = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Qe = `precision highp float;

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
const Ze = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: 0 },
        u_complexity: { value: 0 },
        u_complexityAttenuation: { value: 0 },
        u_iterations: { value: 0 },
        u_timeStrength: { value: 0 },
        u_scale: { value: 0 }
      },
      vertexShader: He,
      fragmentShader: Qe
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, Je = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), bt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Ze(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(Je);
  return [
    b(
      (f, x) => {
        const { gl: d, clock: p } = f;
        return x && l(x), a(n, "u_pattern", i.pattern), a(n, "u_complexity", i.complexity), a(
          n,
          "u_complexityAttenuation",
          i.complexityAttenuation
        ), a(n, "u_iterations", i.iterations), a(n, "u_timeStrength", i.timeStrength), a(n, "u_scale", i.scale), a(n, "u_time", i.beat || p.getElapsedTime()), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var en = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, nn = `precision highp float;
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
const tn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uRgbWeight: { value: new t.Vector3(0.299, 0.587, 0.114) },
        uColor1: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor2: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor3: { value: new t.Color().set(1, 1, 1) },
        uColor4: { value: new t.Color().set(0, 0.1, 0.2) }
      },
      vertexShader: en,
      fragmentShader: nn
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, rn = Object.freeze({
  texture: new t.Texture(),
  color1: new t.Color().set(0.5, 0.5, 0.5),
  color2: new t.Color().set(0.5, 0.5, 0.5),
  color3: new t.Color().set(1, 1, 1),
  color4: new t.Color().set(0, 0.1, 0.2),
  rgbWeight: new t.Vector3(0.299, 0.587, 0.114)
}), St = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = tn(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(rn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "uTexture", i.texture), a(n, "uColor1", i.color1), a(n, "uColor2", i.color2), a(n, "uColor3", i.color3), a(n, "uColor4", i.color4), a(n, "uRgbWeight", i.rgbWeight), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var on = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, an = `precision highp float;

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
const un = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: on,
      fragmentShader: an
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, sn = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, _t = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = un(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(sn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "uTexture", i.texture), a(n, "uColor0", i.color0), a(n, "uColor1", i.color1), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var ln = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, cn = `precision highp float;

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
const vn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_alphaMap: { value: new t.Texture() },
        u_isAlphaMap: { value: !1 },
        u_mapIntensity: { value: 0 },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 0.9 },
        u_dodgeColor: { value: new t.Color(16777215) },
        u_isDodgeColor: { value: !1 }
      },
      vertexShader: ln,
      fragmentShader: cn
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, mn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Tt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = vn(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(mn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "u_texture", i.texture), a(n, "u_map", i.map), a(n, "u_mapIntensity", i.mapIntensity), i.alphaMap ? (a(n, "u_alphaMap", i.alphaMap), a(n, "u_isAlphaMap", !0)) : a(n, "u_isAlphaMap", !1), a(n, "u_brightness", i.brightness), a(n, "u_min", i.min), a(n, "u_max", i.max), i.dodgeColor ? (a(n, "u_dodgeColor", i.dodgeColor), a(n, "u_isDodgeColor", !0)) : a(n, "u_isDodgeColor", !1), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var pn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, fn = `precision highp float;

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
const dn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uTextureResolution: { value: new t.Vector2() },
        uTexture0: { value: new t.Texture() },
        uTexture1: { value: new t.Texture() },
        padding: { value: 0 },
        uMap: { value: new t.Texture() },
        edgeIntensity: { value: 0 },
        mapIntensity: { value: 0 },
        epicenter: { value: new t.Vector2(0, 0) },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: pn,
      fragmentShader: fn
    }),
    []
  ), v = $(u, o);
  a(n, "uResolution", v.clone());
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, gn = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  padding: 0,
  map: new t.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  dir: new t.Vector2(0, 0)
}, Ct = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = dn({ scene: r, size: e, dpr: u }), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    dpr: u,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [i, l] = z(gn);
  return [
    b(
      (f, x) => {
        var M, C, T, P, S, _, B, W;
        const { gl: d } = f;
        x && l(x), a(n, "uTexture0", i.texture0), a(n, "uTexture1", i.texture1), a(n, "progress", i.progress);
        const p = [
          ((C = (M = i.texture0) == null ? void 0 : M.image) == null ? void 0 : C.width) || 0,
          ((P = (T = i.texture0) == null ? void 0 : T.image) == null ? void 0 : P.height) || 0
        ], w = [
          ((_ = (S = i.texture1) == null ? void 0 : S.image) == null ? void 0 : _.width) || 0,
          ((W = (B = i.texture1) == null ? void 0 : B.image) == null ? void 0 : W.height) || 0
        ], y = p.map((L, j) => L + (w[j] - L) * i.progress);
        return a(n, "uTextureResolution", y), a(n, "padding", i.padding), a(n, "uMap", i.map), a(n, "mapIntensity", i.mapIntensity), a(n, "edgeIntensity", i.edgeIntensity), a(n, "epicenter", i.epicenter), a(n, "dirX", i.dir.x), a(n, "dirY", i.dir.y), s(d);
      },
      [s, n, i, l]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var xn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, hn = `precision highp float;

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
const yn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: xn,
      fragmentShader: hn
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, wn = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Pt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = yn(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(
    wn
  );
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "u_texture", i.texture), a(n, "u_brightness", i.brightness), a(n, "u_min", i.min), a(n, "u_max", i.max), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Mn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, bn = `precision highp float;

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
const Sn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Mn,
      fragmentShader: bn
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, _n = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Dt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Sn(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(_n);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "u_texture", i.texture), a(n, "u_map", i.map), a(n, "u_mapIntensity", i.mapIntensity), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Tn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Cn = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Pn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uMap: { value: new t.Texture() }
      },
      vertexShader: Tn,
      fragmentShader: Cn
    }),
    []
  ), v = I(e, r, n, t.Mesh);
  return { material: n, mesh: v };
}, Dn = {
  texture: new t.Texture(),
  map: new t.Texture()
}, Rt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Pn({ scene: r, size: e, dpr: u }), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(Dn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "uTexture", i.texture), a(n, "uMap", i.map), s(d);
      },
      [n, s, i, l]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Rn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, An = `precision highp float;

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
const In = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: Rn,
      fragmentShader: An
    }),
    []
  ), v = I(e, r, n, t.Mesh);
  return { material: n, mesh: v };
}, Fn = {
  texture: new t.Texture(),
  brightness: 1,
  saturation: 1
}, At = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = In({ scene: r, size: e, dpr: u }), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(Fn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "u_texture", i.texture), a(n, "u_brightness", i.brightness), a(n, "u_saturation", i.saturation), s(d);
      },
      [n, s, i, l]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var zn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Un = `precision highp float;

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
const Vn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uTextureResolution: { value: new t.Vector2() },
        uTexture: { value: new t.Texture() }
      },
      vertexShader: zn,
      fragmentShader: Un
    }),
    []
  ), v = $(u, o);
  a(n, "uResolution", v.clone());
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, Bn = {
  texture: new t.Texture()
}, It = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Vn({ scene: r, size: e, dpr: u }), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    dpr: u,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [i, l] = z(Bn);
  return [
    b(
      (f, x) => {
        var p, w, y, M, C, T;
        const { gl: d } = f;
        return x && l(x), a(n, "uTexture", i.texture), a(n, "uTextureResolution", [
          ((y = (w = (p = i.texture) == null ? void 0 : p.source) == null ? void 0 : w.data) == null ? void 0 : y.width) || 0,
          ((T = (C = (M = i.texture) == null ? void 0 : M.source) == null ? void 0 : C.data) == null ? void 0 : T.height) || 0
        ]), s(d);
      },
      [s, n, i, l]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var On = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ln = `precision mediump float;

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
const Wn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: se.blurSize }
      },
      vertexShader: On,
      fragmentShader: Ln
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, se = Object.freeze({
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}), Ft = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = Wn(r), m = F(e), c = h(
    () => ({
      scene: r,
      camera: m,
      size: e,
      dpr: u,
      samples: o
    }),
    [r, m, e, u, o]
  ), [s, i] = A(c), [l, g] = G(c), [f, x] = z(se);
  return [
    b(
      (p, w) => {
        var T, P, S, _, B, W;
        const { gl: y } = p;
        w && x(w), a(n, "uTexture", f.texture), a(n, "uResolution", [
          ((S = (P = (T = f.texture) == null ? void 0 : T.source) == null ? void 0 : P.data) == null ? void 0 : S.width) || 0,
          ((W = (B = (_ = f.texture) == null ? void 0 : _.source) == null ? void 0 : B.data) == null ? void 0 : W.height) || 0
        ]), a(n, "uBlurSize", f.blurSize);
        let M = g(y);
        const C = f.blurPower;
        for (let L = 0; L < C; L++)
          a(n, "uTexture", M), M = g(y);
        return i(y);
      },
      [i, g, n, x, f]
    ),
    x,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: s,
      output: s.texture
    }
  ];
};
var $n = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, En = `precision highp float;

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
const qn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), o = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: k.epicenter },
        uProgress: { value: k.progress },
        uStrength: { value: k.strength },
        uWidth: { value: k.width },
        uMode: { value: 0 }
      },
      vertexShader: $n,
      fragmentShader: En
    }),
    []
  ), r = I(e, u, o, t.Mesh);
  return { material: o, mesh: r };
}, k = Object.freeze({
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), zt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = qn(r), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [i, l] = z(k);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "uEpicenter", i.epicenter), a(n, "uProgress", i.progress), a(n, "uWidth", i.width), a(n, "uStrength", i.strength), a(
          n,
          "uMode",
          i.mode === "center" ? 0 : i.mode === "horizontal" ? 1 : 2
        ), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var jn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Nn = `precision highp float;
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
const kn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_resolution: { value: new t.Vector2() },
        u_keyColor: { value: new t.Color() },
        u_similarity: { value: 0 },
        u_smoothness: { value: 0 },
        u_spill: { value: 0 },
        u_color: { value: new t.Vector4() },
        u_contrast: { value: 0 },
        u_brightness: { value: 0 },
        u_gamma: { value: 0 }
      },
      vertexShader: jn,
      fragmentShader: Nn
    }),
    []
  ), v = $(u, o);
  a(n, "u_resolution", v.clone());
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, Gn = Object.freeze({
  texture: new t.Texture(),
  keyColor: new t.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new t.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), Ut = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: v } = kn({ scene: r, size: e, dpr: u }), m = F(e), [c, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: o
  }), [i, l] = z(Gn);
  return [
    b(
      (f, x) => {
        const { gl: d } = f;
        return x && l(x), a(n, "u_texture", i.texture), a(n, "u_keyColor", i.keyColor), a(n, "u_similarity", i.similarity), a(n, "u_smoothness", i.smoothness), a(n, "u_spill", i.spill), a(n, "u_color", i.color), a(n, "u_contrast", i.contrast), a(n, "u_brightness", i.brightness), a(n, "u_gamma", i.gamma), s(d);
      },
      [s, n, l, i]
    ),
    l,
    {
      scene: r,
      mesh: v,
      material: n,
      camera: m,
      renderTarget: c,
      output: c.texture
    }
  ];
}, Kn = ({
  scene: e,
  geometry: u,
  material: o
}) => {
  const r = I(
    e,
    u,
    o,
    t.Points
  ), n = I(
    e,
    h(() => u.clone(), [u]),
    h(() => o.clone(), [o]),
    t.Mesh
  );
  return n.visible = !1, {
    points: r,
    interactiveMesh: n
  };
};
var Xn = `uniform vec2 uResolution;
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
}`, Yn = `precision highp float;
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
}`, le = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
const ce = process.env.NODE_ENV === "development", ae = (e, u, o, r, n) => {
  var l;
  const v = o === "position" ? "positionTarget" : "uvTarget", m = o === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", c = o === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", s = o === "position" ? "positionsList" : "uvsList", i = o === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    u.deleteAttribute(o), u.setAttribute(
      o,
      new t.BufferAttribute(e[0], n)
    );
    let g = "", f = "";
    e.forEach((x, d) => {
      u.setAttribute(
        `${v}${d}`,
        new t.BufferAttribute(x, n)
      ), g += `attribute vec${n} ${v}${d};
`, d === 0 ? f += `${v}${d}` : f += `,${v}${d}`;
    }), r = r.replace(
      `${m}`,
      g
    ), r = r.replace(
      `${c}`,
      `vec${n} ${s}[${e.length}] = vec${n}[](${f});
				${i}
			`
    );
  } else
    r = r.replace(`${m}`, ""), r = r.replace(`${c}`, ""), (l = u == null ? void 0 : u.attributes[o]) != null && l.array || ce && console.error(
      `use-shader-fx:geometry.attributes.${o}.array is not found`
    );
  return r;
}, ie = (e, u, o, r) => {
  var v;
  let n = [];
  if (e && e.length > 0) {
    (v = u == null ? void 0 : u.attributes[o]) != null && v.array ? n = [
      u.attributes[o].array,
      ...e
    ] : n = e;
    const m = Math.max(...n.map((c) => c.length));
    n.forEach((c, s) => {
      if (c.length < m) {
        const i = (m - c.length) / r, l = [], g = Array.from(c);
        for (let f = 0; f < i; f++) {
          const x = Math.floor(c.length / r * Math.random()) * r;
          for (let d = 0; d < r; d++)
            l.push(g[x + d]);
        }
        n[s] = new Float32Array([...g, ...l]);
      }
    });
  }
  return n;
}, Hn = (e, u) => {
  let o = "";
  const r = {};
  let n = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((m, c) => {
    const s = `vMapArrayIndex < ${c}.1`, i = `texture2D(uMapArray${c}, uv)`;
    n += `( ${s} ) ? ${i} : `, o += `
        uniform sampler2D uMapArray${c};
      `, r[`uMapArray${c}`] = { value: m };
  }), n += "vec4(1.);", o += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (n += "vec4(1.0);", o += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: u.replace("#usf <mapArraySwitcher>", n).replace("#usf <mapArrayUniforms>", o), mapArrayUniforms: r };
}, Qn = ({
  size: e,
  dpr: u,
  geometry: o,
  positions: r,
  uvs: n,
  mapArray: v
}) => {
  const m = h(
    () => ie(r, o, "position", 3),
    [r, o]
  ), c = h(
    () => ie(n, o, "uv", 2),
    [n, o]
  ), s = h(() => {
    m.length !== c.length && ce && console.log("use-shader-fx:positions and uvs are not matched");
    const l = ae(
      c,
      o,
      "uv",
      ae(
        m,
        o,
        "position",
        Xn,
        3
      ),
      2
    ).replace("#usf <getWobble>", le), g = Hn(v, Yn);
    return new t.ShaderMaterial({
      vertexShader: l,
      fragmentShader: g.rewritedFragmentShader,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0,
      blending: t.AdditiveBlending,
      uniforms: {
        uResolution: { value: new t.Vector2(0, 0) },
        uMorphProgress: { value: R.morphProgress },
        uBlurAlpha: { value: R.blurAlpha },
        uBlurRadius: { value: R.blurRadius },
        uPointSize: { value: R.pointSize },
        uPointAlpha: { value: R.pointAlpha },
        uPicture: { value: new t.Texture() },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: new t.Texture() },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: R.color0 },
        uColor1: { value: R.color1 },
        uColor2: { value: R.color2 },
        uColor3: { value: R.color3 },
        uMap: { value: new t.Texture() },
        uIsMap: { value: !1 },
        uAlphaMap: { value: new t.Texture() },
        uIsAlphaMap: { value: !1 },
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: R.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: R.wobbleTimeFrequency
        },
        uWobbleStrength: { value: R.wobbleStrength },
        uWarpPositionFrequency: {
          value: R.warpPositionFrequency
        },
        uWarpTimeFrequency: {
          value: R.warpTimeFrequency
        },
        uWarpStrength: { value: R.warpStrength },
        uDisplacement: { value: new t.Texture() },
        uIsDisplacement: { value: !1 },
        uDisplacementIntensity: {
          value: R.displacementIntensity
        },
        uDisplacementColorIntensity: {
          value: R.displacementColorIntensity
        },
        uSizeRandomIntensity: {
          value: R.sizeRandomIntensity
        },
        uSizeRandomTimeFrequency: {
          value: R.sizeRandomTimeFrequency
        },
        uSizeRandomMin: { value: R.sizeRandomMin },
        uSizeRandomMax: { value: R.sizeRandomMax },
        uDivergence: { value: R.divergence },
        uDivergencePoint: { value: R.divergencePoint },
        ...g.mapArrayUniforms
      }
    });
  }, [
    o,
    m,
    c,
    v
  ]), i = $(e, u);
  return a(s, "uResolution", i.clone()), { material: s, modifiedPositions: m, modifiedUvs: c };
}, Zn = ({
  size: e,
  dpr: u,
  scene: o = !1,
  geometry: r,
  positions: n,
  uvs: v,
  mapArray: m
}) => {
  const c = h(() => {
    const d = r || new t.SphereGeometry(1, 32, 32);
    return d.setIndex(null), d.deleteAttribute("normal"), d;
  }, [r]), { material: s, modifiedPositions: i, modifiedUvs: l } = Qn({
    size: e,
    dpr: u,
    geometry: c,
    positions: n,
    uvs: v,
    mapArray: m
  }), { points: g, interactiveMesh: f } = Kn({
    scene: o,
    geometry: c,
    material: s
  });
  return [
    b(
      (d, p) => {
        d && a(
          s,
          "uTime",
          (p == null ? void 0 : p.beat) || d.clock.getElapsedTime()
        ), p !== void 0 && (a(s, "uMorphProgress", p.morphProgress), a(s, "uBlurAlpha", p.blurAlpha), a(s, "uBlurRadius", p.blurRadius), a(s, "uPointSize", p.pointSize), a(s, "uPointAlpha", p.pointAlpha), p.picture ? (a(s, "uPicture", p.picture), a(s, "uIsPicture", !0)) : p.picture === !1 && a(s, "uIsPicture", !1), p.alphaPicture ? (a(s, "uAlphaPicture", p.alphaPicture), a(s, "uIsAlphaPicture", !0)) : p.alphaPicture === !1 && a(s, "uIsAlphaPicture", !1), a(s, "uColor0", p.color0), a(s, "uColor1", p.color1), a(s, "uColor2", p.color2), a(s, "uColor3", p.color3), p.map ? (a(s, "uMap", p.map), a(s, "uIsMap", !0)) : p.map === !1 && a(s, "uIsMap", !1), p.alphaMap ? (a(s, "uAlphaMap", p.alphaMap), a(s, "uIsAlphaMap", !0)) : p.alphaMap === !1 && a(s, "uIsAlphaMap", !1), a(s, "uWobbleStrength", p.wobbleStrength), a(
          s,
          "uWobblePositionFrequency",
          p.wobblePositionFrequency
        ), a(
          s,
          "uWobbleTimeFrequency",
          p.wobbleTimeFrequency
        ), a(s, "uWarpStrength", p.warpStrength), a(
          s,
          "uWarpPositionFrequency",
          p.warpPositionFrequency
        ), a(s, "uWarpTimeFrequency", p.warpTimeFrequency), p.displacement ? (a(s, "uDisplacement", p.displacement), a(s, "uIsDisplacement", !0)) : p.displacement === !1 && a(s, "uIsDisplacement", !1), a(
          s,
          "uDisplacementIntensity",
          p.displacementIntensity
        ), a(
          s,
          "uDisplacementColorIntensity",
          p.displacementColorIntensity
        ), a(
          s,
          "uSizeRandomIntensity",
          p.sizeRandomIntensity
        ), a(
          s,
          "uSizeRandomTimeFrequency",
          p.sizeRandomTimeFrequency
        ), a(s, "uSizeRandomMin", p.sizeRandomMin), a(s, "uSizeRandomMax", p.sizeRandomMax), a(s, "uDivergence", p.divergence), a(s, "uDivergencePoint", p.divergencePoint));
      },
      [s]
    ),
    {
      points: g,
      interactiveMesh: f,
      positions: i,
      uvs: l
    }
  ];
}, R = Object.freeze({
  morphProgress: 0,
  blurAlpha: 0.9,
  blurRadius: 0.05,
  pointSize: 0.05,
  pointAlpha: 1,
  picture: !1,
  alphaPicture: !1,
  color0: new t.Color(16711680),
  color1: new t.Color(65280),
  color2: new t.Color(255),
  color3: new t.Color(16776960),
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
  divergencePoint: new t.Vector3(0),
  beat: !1
}), Vt = ({
  size: e,
  dpr: u,
  samples: o = 0,
  camera: r,
  geometry: n,
  positions: v,
  uvs: m
}) => {
  const c = h(() => new t.Scene(), []), [
    s,
    {
      points: i,
      interactiveMesh: l,
      positions: g,
      uvs: f
    }
  ] = Zn({ scene: c, size: e, dpr: u, geometry: n, positions: v, uvs: m }), [x, d] = A({
    scene: c,
    camera: r,
    size: e,
    dpr: u,
    samples: o,
    depthBuffer: !0
  }), p = b(
    (y, M) => (s(y, M), d(y.gl)),
    [d, s]
  ), w = b(
    (y) => {
      s(null, y);
    },
    [s]
  );
  return [
    p,
    w,
    {
      scene: c,
      points: i,
      interactiveMesh: l,
      renderTarget: x,
      output: x.texture,
      positions: g,
      uvs: f
    }
  ];
};
function Jn(e, u = 1e-4) {
  u = Math.max(u, Number.EPSILON);
  const o = {}, r = e.getIndex(), n = e.getAttribute("position"), v = r ? r.count : n.count;
  let m = 0;
  const c = Object.keys(e.attributes), s = {}, i = {}, l = [], g = ["getX", "getY", "getZ", "getW"];
  for (let p = 0, w = c.length; p < w; p++) {
    const y = c[p];
    s[y] = [];
    const M = e.morphAttributes[y];
    M && (i[y] = new Array(M.length).fill(0).map(() => []));
  }
  const f = Math.log10(1 / u), x = Math.pow(10, f);
  for (let p = 0; p < v; p++) {
    const w = r ? r.getX(p) : p;
    let y = "";
    for (let M = 0, C = c.length; M < C; M++) {
      const T = c[M], P = e.getAttribute(T), S = P.itemSize;
      for (let _ = 0; _ < S; _++)
        y += `${~~(P[g[_]](w) * x)},`;
    }
    if (y in o)
      l.push(o[y]);
    else {
      for (let M = 0, C = c.length; M < C; M++) {
        const T = c[M], P = e.getAttribute(T), S = e.morphAttributes[T], _ = P.itemSize, B = s[T], W = i[T];
        for (let L = 0; L < _; L++) {
          const j = g[L];
          if (B.push(P[j](w)), S)
            for (let O = 0, H = S.length; O < H; O++)
              W[O].push(S[O][j](w));
        }
      }
      o[y] = m, l.push(m), m++;
    }
  }
  const d = e.clone();
  for (let p = 0, w = c.length; p < w; p++) {
    const y = c[p], M = e.getAttribute(y), C = new M.array.constructor(s[y]), T = new oe(C, M.itemSize, M.normalized);
    if (d.setAttribute(y, T), y in i)
      for (let P = 0; P < i[y].length; P++) {
        const S = e.morphAttributes[y][P], _ = new S.array.constructor(i[y][P]), B = new oe(_, S.itemSize, S.normalized);
        d.morphAttributes[y][P] = B;
      }
  }
  return d.setIndex(l), d;
}
var et = `vec3 random3(vec3 c) {
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
}`, nt = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, tt = `#ifdef USE_TRANSMISSION

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
const ue = (e) => {
  let u = e;
  return u = u.replace(
    "#include <beginnormal_vertex>",
    `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
  ), u = u.replace(
    "#include <begin_vertex>",
    `
		vec3 transformed = usf_Position;`
  ), u = u.replace(
    "void main() {",
    `
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
		// #usf <getWobble>
		void main() {`
  ), u = u.replace("// #usf <getWobble>", `${le}`), u = u.replace(
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
		// Wobble
		float wobble = getWobble(usf_Position);
		usf_Position += wobble * normal;
		positionA    += getWobble(positionA) * normal;
		positionB    += getWobble(positionB) * normal;
		// Compute normal
		vec3 toA = normalize(positionA - usf_Position);
		vec3 toB = normalize(positionB - usf_Position);
		usf_Normal = cross(toA, toB);
		// Varying
		vPosition = usf_Position.xy;
		vWobble = wobble / uWobbleStrength;`
  ), u;
}, rt = ({
  baseMaterial: e,
  materialParameters: u
}) => {
  const { material: o, depthMaterial: r } = h(() => {
    const n = new (e || t.MeshPhysicalMaterial)(
      u || {}
    ), v = n.type === "MeshPhysicalMaterial" || n.type === "MeshStandardMaterial", m = n.type === "MeshPhysicalMaterial";
    Object.assign(n.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: U.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: U.wobbleTimeFrequency
        },
        uWobbleStrength: { value: U.wobbleStrength },
        uWarpPositionFrequency: {
          value: U.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: U.warpTimeFrequency },
        uWarpStrength: { value: U.warpStrength },
        uWobbleShine: { value: U.wobbleShine },
        uColor0: { value: U.color0 },
        uColor1: { value: U.color1 },
        uColor2: { value: U.color2 },
        uColor3: { value: U.color3 },
        uColorMix: { value: U.colorMix },
        uChromaticAberration: {
          value: U.chromaticAberration
        },
        uAnisotropicBlur: { value: U.anisotropicBlur },
        uDistortion: { value: U.distortion },
        uDistortionScale: { value: U.distortionScale },
        uTemporalDistortion: { value: U.temporalDistortion },
        uSamples: { value: U.samples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null }
      }
    }), n.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, n.userData.uniforms), s.vertexShader = ue(s.vertexShader), s.fragmentShader = s.fragmentShader.replace(
        "#include <color_fragment>",
        `
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
      ), v && (s.fragmentShader = s.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
      )), s.fragmentShader = s.fragmentShader.replace(
        "void main() {",
        `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
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
				${et}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${v ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${v ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), m && (s.fragmentShader = s.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${nt}`
      ), s.fragmentShader = s.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${tt}`
      ));
    }, n.needsUpdate = !0;
    const c = new t.MeshDepthMaterial({
      depthPacking: t.RGBADepthPacking
    });
    return c.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, n.userData.uniforms), s.vertexShader = ue(s.vertexShader);
    }, c.needsUpdate = !0, { material: n, depthMaterial: c };
  }, [u, e]);
  return {
    material: o,
    depthMaterial: r
  };
}, ot = ({
  scene: e = !1,
  geometry: u,
  baseMaterial: o,
  materialParameters: r
}) => {
  const n = h(() => {
    let i = u || new t.IcosahedronGeometry(2, 20);
    return i = Jn(i), i.computeTangents(), i;
  }, [u]), { material: v, depthMaterial: m } = rt({
    baseMaterial: o,
    materialParameters: r
  }), c = I(e, n, v, t.Mesh);
  return [
    b(
      (i, l) => {
        const g = v.userData;
        i && a(
          g,
          "uTime",
          (l == null ? void 0 : l.beat) || i.clock.getElapsedTime()
        ), l !== void 0 && (a(g, "uWobbleStrength", l.wobbleStrength), a(
          g,
          "uWobblePositionFrequency",
          l.wobblePositionFrequency
        ), a(
          g,
          "uWobbleTimeFrequency",
          l.wobbleTimeFrequency
        ), a(g, "uWarpStrength", l.warpStrength), a(
          g,
          "uWarpPositionFrequency",
          l.warpPositionFrequency
        ), a(g, "uWarpTimeFrequency", l.warpTimeFrequency), a(g, "uWobbleShine", l.wobbleShine), a(g, "uSamples", l.samples), a(g, "uColor0", l.color0), a(g, "uColor1", l.color1), a(g, "uColor2", l.color2), a(g, "uColor3", l.color3), a(g, "uColorMix", l.colorMix), a(
          g,
          "uChromaticAberration",
          l.chromaticAberration
        ), a(g, "uAnisotropicBlur", l.anisotropicBlur), a(g, "uDistortion", l.distortion), a(g, "uDistortionScale", l.distortionScale), a(g, "uTemporalDistortion", l.temporalDistortion));
      },
      [v]
    ),
    {
      mesh: c,
      depthMaterial: m
    }
  ];
}, U = Object.freeze({
  beat: !1,
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.5,
  wobbleTimeFrequency: 0.4,
  wobbleShine: 0,
  warpStrength: 1.7,
  warpPositionFrequency: 0.38,
  warpTimeFrequency: 0.12,
  samples: 6,
  color0: new t.Color(16711680),
  color1: new t.Color(65280),
  color2: new t.Color(255),
  color3: new t.Color(16776960),
  colorMix: 1,
  chromaticAberration: 0.5,
  anisotropicBlur: 0.1,
  distortion: 0.1,
  distortionScale: 0.1,
  temporalDistortion: 0.1
}), Bt = ({
  size: e,
  dpr: u,
  samples: o = 0,
  camera: r,
  geometry: n,
  baseMaterial: v,
  materialParameters: m
}) => {
  const c = h(() => new t.Scene(), []), [s, { mesh: i, depthMaterial: l }] = ot({
    baseMaterial: v,
    materialParameters: m,
    scene: c,
    geometry: n
  }), [g, f] = A({
    scene: c,
    camera: r,
    size: e,
    dpr: u,
    samples: o,
    depthBuffer: !0
  }), x = b(
    (p, w) => (s(p, w), f(p.gl)),
    [f, s]
  ), d = b(
    (p) => {
      s(null, p);
    },
    [s]
  );
  return [
    x,
    d,
    {
      scene: c,
      mesh: i,
      depthMaterial: l,
      renderTarget: g,
      output: g.texture
    }
  ];
}, Ot = (e, u, o) => {
  const r = h(() => {
    const n = new t.Mesh(u, o);
    return e.add(n), n;
  }, [u, o, e]);
  return E(() => () => {
    e.remove(r), u.dispose(), o.dispose();
  }, [e, u, o, r]), r;
}, X = Object.freeze({
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
    const o = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((o + 1) * 2 * e - o) / 2 : (Math.pow(2 * e - 2, 2) * ((o + 1) * (e * 2 - 2) + o) + 2) / 2;
  },
  easeInElastic(e) {
    const u = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * u);
  },
  easeOutElastic(e) {
    const u = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * u) + 1;
  },
  easeInOutElastic(e) {
    const u = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * u)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * u) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - X.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - X.easeOutBounce(1 - 2 * e)) / 2 : (1 + X.easeOutBounce(2 * e - 1)) / 2;
  }
});
function at(e) {
  let u = Math.sin(e * 12.9898) * 43758.5453;
  return u - Math.floor(u);
}
const Lt = (e, u = "easeOutQuart") => {
  const o = e / 60, r = X[u];
  return b(
    (v) => {
      let m = v.getElapsedTime() * o;
      const c = Math.floor(m), s = r(m - c);
      m = s + c;
      const i = at(c);
      return {
        beat: m,
        floor: c,
        fract: s,
        hash: i
      };
    },
    [o, r]
  );
}, Wt = (e = 60) => {
  const u = h(() => 1 / Math.max(Math.min(e, 60), 1), [e]), o = D(null);
  return b(
    (n) => {
      const v = n.getElapsedTime();
      return o.current === null || v - o.current >= u ? (o.current = v, !0) : !1;
    },
    [u]
  );
}, it = (e) => {
  var r, n;
  const u = (r = e.dom) == null ? void 0 : r.length, o = (n = e.texture) == null ? void 0 : n.length;
  return !u || !o || u !== o;
};
var ut = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, st = `precision highp float;

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
const lt = ({
  params: e,
  size: u,
  scene: o
}) => {
  o.children.length > 0 && (o.children.forEach((r) => {
    r instanceof t.Mesh && (r.geometry.dispose(), r.material.dispose());
  }), o.remove(...o.children)), e.texture.forEach((r, n) => {
    const v = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: ut,
        fragmentShader: st,
        transparent: !0,
        uniforms: {
          u_texture: { value: r },
          u_textureResolution: {
            value: new t.Vector2(0, 0)
          },
          u_resolution: { value: new t.Vector2(0, 0) },
          u_borderRadius: {
            value: e.boderRadius[n] ? e.boderRadius[n] : 0
          }
        }
      })
    );
    o.add(v);
  });
}, ct = () => {
  const e = D([]), u = D([]);
  return b(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: n,
      params: v
    }) => {
      e.current.length > 0 && e.current.forEach((c, s) => {
        c.unobserve(u.current[s]);
      }), u.current = [], e.current = [];
      const m = new Array(v.dom.length).fill(!1);
      r.current = [...m], n.current = [...m], v.dom.forEach((c, s) => {
        const i = (g) => {
          g.forEach((f) => {
            v.onIntersect[s] && v.onIntersect[s](f), r.current[s] = f.isIntersecting;
          });
        }, l = new IntersectionObserver(i, {
          rootMargin: "0px",
          threshold: 0
        });
        l.observe(c), e.current.push(l), u.current.push(c);
      });
    },
    []
  );
}, vt = () => {
  const e = D([]), u = b(
    ({ params: o, size: r, resolutionRef: n, scene: v, isIntersectingRef: m }) => {
      v.children.length !== e.current.length && (e.current = new Array(v.children.length)), v.children.forEach((c, s) => {
        var g, f, x, d, p, w;
        const i = o.dom[s];
        if (!i)
          return;
        const l = i.getBoundingClientRect();
        if (e.current[s] = l, c.scale.set(l.width, l.height, 1), c.position.set(
          l.left + l.width * 0.5 - r.width * 0.5,
          -l.top - l.height * 0.5 + r.height * 0.5,
          0
        ), m.current[s] && (o.rotation[s] && c.rotation.copy(o.rotation[s]), c instanceof t.Mesh)) {
          const y = c.material;
          a(y, "u_texture", o.texture[s]), a(y, "u_textureResolution", [
            ((x = (f = (g = o.texture[s]) == null ? void 0 : g.source) == null ? void 0 : f.data) == null ? void 0 : x.width) || 0,
            ((w = (p = (d = o.texture[s]) == null ? void 0 : d.source) == null ? void 0 : p.data) == null ? void 0 : w.height) || 0
          ]), a(
            y,
            "u_resolution",
            n.current.set(l.width, l.height)
          ), a(
            y,
            "u_borderRadius",
            o.boderRadius[s] ? o.boderRadius[s] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, u];
}, mt = () => {
  const e = D([]), u = D([]), o = b((r, n = !1) => {
    e.current.forEach((m, c) => {
      m && (u.current[c] = !0);
    });
    const v = n ? [...u.current] : [...e.current];
    return r < 0 ? v : v[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: u,
    isIntersecting: o
  };
}, pt = (e) => ({ onView: o, onHidden: r }) => {
  const n = D(!1);
  E(() => {
    let v;
    const m = () => {
      e.current.some((c) => c) ? n.current || (o && o(), n.current = !0) : n.current && (r && r(), n.current = !1), v = requestAnimationFrame(m);
    };
    return v = requestAnimationFrame(m), () => {
      cancelAnimationFrame(v);
    };
  }, [o, r]);
}, ft = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, $t = ({ size: e, dpr: u, samples: o = 0 }, r = []) => {
  const n = h(() => new t.Scene(), []), v = F(e), [m, c] = A({
    scene: n,
    camera: v,
    size: e,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [s, i] = z({
    ...ft,
    updateKey: performance.now()
  }), [l, g] = vt(), f = D(new t.Vector2(0, 0)), [x, d] = fe(!0);
  h(
    () => d(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    r
  );
  const p = D(null), w = h(() => new t.Texture(), []), y = ct(), { isIntersectingOnceRef: M, isIntersectingRef: C, isIntersecting: T } = mt(), P = pt(C);
  return [
    b(
      (_, B) => {
        const { gl: W, size: L } = _;
        if (B && i(B), it(s))
          return w;
        if (x) {
          if (p.current === s.updateKey)
            return w;
          p.current = s.updateKey;
        }
        return x && (lt({
          params: s,
          size: L,
          scene: n
        }), y({
          isIntersectingRef: C,
          isIntersectingOnceRef: M,
          params: s
        }), d(!1)), g({
          params: s,
          size: L,
          resolutionRef: f,
          scene: n,
          isIntersectingRef: C
        }), c(W);
      },
      [
        c,
        i,
        y,
        g,
        x,
        n,
        s,
        M,
        C,
        w
      ]
    ),
    i,
    {
      scene: n,
      camera: v,
      renderTarget: m,
      output: m.texture,
      isIntersecting: T,
      DOMRects: l,
      intersections: C.current,
      useDomView: P
    }
  ];
}, Et = ({
  scene: e,
  camera: u,
  size: o,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: v = 0,
  depthBuffer: m = !1,
  depthTexture: c = !1
}, s) => {
  const i = D([]), l = $(o, r);
  i.current = h(() => Array.from({ length: s }, () => {
    const f = new t.WebGLRenderTarget(
      l.x,
      l.y,
      {
        ...Y,
        samples: v,
        depthBuffer: m
      }
    );
    return c && (f.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), f;
  }), [s]), n && i.current.forEach(
    (f) => f.setSize(l.x, l.y)
  ), E(() => {
    const f = i.current;
    return () => {
      f.forEach((x) => x.dispose());
    };
  }, [s]);
  const g = b(
    (f, x, d) => {
      const p = i.current[x];
      return ee({
        gl: f,
        scene: e,
        camera: u,
        fbo: p,
        onBeforeRender: () => d && d({ read: p.texture })
      }), p.texture;
    },
    [e, u]
  );
  return [i.current, g];
};
export {
  Dn as ALPHABLENDING_PARAMS,
  mn as BLENDING_PARAMS,
  wn as BRIGHTNESSPICKER_PARAMS,
  ye as BRUSH_PARAMS,
  Gn as CHROMAKEY_PARAMS,
  Ye as COLORSTRATA_PARAMS,
  rn as COSPALETTE_PARAMS,
  Bn as COVERTEXTURE_PARAMS,
  ft as DOMSYNCER_PARAMS,
  sn as DUOTONE_PARAMS,
  X as Easing,
  Y as FBO_OPTION,
  We as FLUID_PARAMS,
  _n as FXBLENDING_PARAMS,
  gn as FXTEXTURE_PARAMS,
  Fn as HSV_PARAMS,
  Je as MARBLE_PARAMS,
  R as MORPHPARTICLES_PARAMS,
  ke as NOISE_PARAMS,
  Ee as RIPPLE_PARAMS,
  se as SIMPLEBLUR_PARAMS,
  k as WAVE_PARAMS,
  U as WOBBLE3D_PARAMS,
  ee as renderFBO,
  a as setUniform,
  Ot as useAddMesh,
  Rt as useAlphaBlending,
  Lt as useBeat,
  Tt as useBlending,
  Pt as useBrightnessPicker,
  xt as useBrush,
  F as useCamera,
  Ut as useChromaKey,
  Mt as useColorStrata,
  Et as useCopyTexture,
  St as useCosPalette,
  It as useCoverTexture,
  Zn as useCreateMorphParticles,
  ot as useCreateWobble3D,
  $t as useDomSyncer,
  G as useDoubleFBO,
  _t as useDuoTone,
  Wt as useFPSLimiter,
  ht as useFluid,
  Dt as useFxBlending,
  Ct as useFxTexture,
  At as useHSV,
  bt as useMarble,
  Vt as useMorphParticles,
  wt as useNoise,
  z as useParams,
  J as usePointer,
  $ as useResolution,
  yt as useRipple,
  Ft as useSimpleBlur,
  A as useSingleFBO,
  zt as useWave,
  Bt as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
