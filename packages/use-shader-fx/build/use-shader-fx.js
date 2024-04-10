import * as t from "three";
import { BufferAttribute as ae } from "three";
import { useMemo as g, useEffect as N, useRef as D, useCallback as M, useState as ge } from "react";
var he = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, xe = `precision highp float;

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
const q = (e, u = !1) => {
  const o = u ? e.width * u : e.width, s = u ? e.height * u : e.height;
  return g(
    () => new t.Vector2(o, s),
    [o, s]
  );
}, a = (e, u, o) => {
  o !== void 0 && e.uniforms && e.uniforms[u] && o !== null && (e.uniforms[u].value = o);
}, z = (e, u, o, s) => {
  const i = g(() => {
    const n = new s(u, o);
    return e && e.add(n), n;
  }, [u, o, s, e]);
  return N(() => () => {
    e && e.remove(i), u.dispose(), o.dispose();
  }, [e, u, o, i]), i;
}, ye = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const s = g(() => new t.PlaneGeometry(2, 2), []), i = g(
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
      vertexShader: he,
      fragmentShader: xe
    }),
    []
  ), n = q(u, o);
  a(i, "uResolution", n.clone());
  const p = z(e, s, i, t.Mesh);
  return { material: i, mesh: p };
}, we = (e, u) => {
  const o = u, s = e / u, [i, n] = [o * s / 2, o / 2];
  return { width: i, height: n, near: -1e3, far: 1e3 };
}, U = (e, u = "OrthographicCamera") => {
  const o = q(e), { width: s, height: i, near: n, far: p } = we(
    o.x,
    o.y
  );
  return g(() => u === "OrthographicCamera" ? new t.OrthographicCamera(
    -s,
    s,
    i,
    -i,
    n,
    p
  ) : new t.PerspectiveCamera(50, s / i), [s, i, n, p, u]);
}, ee = (e = 0) => {
  const u = D(new t.Vector2(0, 0)), o = D(new t.Vector2(0, 0)), s = D(new t.Vector2(0, 0)), i = D(0), n = D(new t.Vector2(0, 0)), p = D(!1);
  return M(
    (c) => {
      const l = performance.now();
      let r;
      p.current && e ? (s.current = s.current.lerp(
        c,
        1 - e
      ), r = s.current.clone()) : (r = c.clone(), s.current = r), i.current === 0 && (i.current = l, u.current = r);
      const m = Math.max(1, l - i.current);
      i.current = l, n.current.copy(r).sub(u.current).divideScalar(m);
      const y = n.current.length() > 0, x = p.current ? u.current.clone() : r;
      return !p.current && y && (p.current = !0), u.current = r, {
        currentPointer: r,
        prevPointer: x,
        diffPointer: o.current.subVectors(r, x),
        velocity: n.current,
        isVelocityUpdate: y
      };
    },
    [e]
  );
}, V = (e) => {
  const o = D(
    ((i) => Object.values(i).some((n) => typeof n == "function"))(e) ? e : structuredClone(e)
  ), s = M((i) => {
    for (const n in i) {
      const p = n;
      p in o.current && i[p] !== void 0 && i[p] !== null ? o.current[p] = i[p] : console.error(
        `"${String(
          p
        )}" does not exist in the params. or "${String(
          p
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, s];
}, Q = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, ne = ({
  gl: e,
  fbo: u,
  scene: o,
  camera: s,
  onBeforeRender: i,
  onSwap: n
}) => {
  e.setRenderTarget(u), i(), e.clear(), e.render(o, s), n && n(), e.setRenderTarget(null), e.clear();
}, F = ({
  scene: e,
  camera: u,
  size: o,
  dpr: s = !1,
  isSizeUpdate: i = !1,
  samples: n = 0,
  depthBuffer: p = !1,
  depthTexture: v = !1
}) => {
  var m;
  const c = D(), l = q(o, s);
  c.current = g(
    () => {
      const y = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...Q,
          samples: n,
          depthBuffer: p
        }
      );
      return v && (y.depthTexture = new t.DepthTexture(
        l.x,
        l.y,
        t.FloatType
      )), y;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), i && ((m = c.current) == null || m.setSize(l.x, l.y)), N(() => {
    const y = c.current;
    return () => {
      y == null || y.dispose();
    };
  }, []);
  const r = M(
    (y, x) => {
      const f = c.current;
      return ne({
        gl: y,
        fbo: f,
        scene: e,
        camera: u,
        onBeforeRender: () => x && x({ read: f.texture })
      }), f.texture;
    },
    [e, u]
  );
  return [c.current, r];
}, X = ({
  scene: e,
  camera: u,
  size: o,
  dpr: s = !1,
  isSizeUpdate: i = !1,
  samples: n = 0,
  depthBuffer: p = !1,
  depthTexture: v = !1
}) => {
  var y, x;
  const c = D({
    read: null,
    write: null,
    swap: function() {
      let f = this.read;
      this.read = this.write, this.write = f;
    }
  }), l = q(o, s), r = g(() => {
    const f = new t.WebGLRenderTarget(l.x, l.y, {
      ...Q,
      samples: n,
      depthBuffer: p
    }), h = new t.WebGLRenderTarget(l.x, l.y, {
      ...Q,
      samples: n,
      depthBuffer: p
    });
    return v && (f.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    ), h.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), { read: f, write: h };
  }, []);
  c.current.read = r.read, c.current.write = r.write, i && ((y = c.current.read) == null || y.setSize(l.x, l.y), (x = c.current.write) == null || x.setSize(l.x, l.y)), N(() => {
    const f = c.current;
    return () => {
      var h, d;
      (h = f.read) == null || h.dispose(), (d = f.write) == null || d.dispose();
    };
  }, []);
  const m = M(
    (f, h) => {
      var w;
      const d = c.current;
      return ne({
        gl: f,
        scene: e,
        camera: u,
        fbo: d.write,
        onBeforeRender: () => h && h({
          read: d.read.texture,
          write: d.write.texture
        }),
        onSwap: () => d.swap()
      }), (w = d.read) == null ? void 0 : w.texture;
    },
    [e, u]
  );
  return [
    { read: c.current.read, write: c.current.write },
    m
  ];
}, I = (e) => {
  var u, o;
  return typeof e == "number" ? { shader: e, fbo: e } : {
    shader: (((u = e.effect) == null ? void 0 : u.shader) ?? !0) && e.dpr,
    fbo: (((o = e.effect) == null ? void 0 : o.fbo) ?? !0) && e.dpr
  };
}, be = Object.freeze({
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
}), yt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = ye({ scene: i, size: e, dpr: s.shader }), v = U(e), c = ee(), [l, r] = X({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [m, y] = V(be), x = D(null);
  return [
    M(
      (h, d) => {
        const { gl: w, pointer: b } = h;
        d && y(d), m.texture ? (a(n, "uIsTexture", !0), a(n, "uTexture", m.texture)) : a(n, "uIsTexture", !1), m.map ? (a(n, "uIsMap", !0), a(n, "uMap", m.map), a(n, "uMapIntensity", m.mapIntensity)) : a(n, "uIsMap", !1), a(n, "uRadius", m.radius), a(n, "uSmudge", m.smudge), a(n, "uDissipation", m.dissipation), a(n, "uMotionBlur", m.motionBlur), a(n, "uMotionSample", m.motionSample);
        const C = m.pointerValues || c(b);
        C.isVelocityUpdate && (a(n, "uMouse", C.currentPointer), a(n, "uPrevMouse", C.prevPointer)), a(n, "uVelocity", C.velocity);
        const T = typeof m.color == "function" ? m.color(C.velocity) : m.color;
        return a(n, "uColor", T), a(n, "uIsCursor", m.isCursor), a(n, "uPressureEnd", m.pressure), x.current === null && (x.current = m.pressure), a(n, "uPressureStart", x.current), x.current = m.pressure, r(w, ({ read: S }) => {
          a(n, "uBuffer", S);
        });
      },
      [n, c, r, m, y]
    ),
    y,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.read.texture
    }
  ];
};
var k = `varying vec2 vUv;
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
}`, Me = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Se = () => g(
  () => new t.ShaderMaterial({
    vertexShader: k,
    fragmentShader: Me,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var _e = `precision highp float;

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
const Te = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: k,
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
const Pe = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
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
const Re = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: De
  }),
  []
);
var Ae = `precision highp float;

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
const Ie = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: Ae
  }),
  []
);
var Fe = `precision highp float;

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
const ze = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: Fe
  }),
  []
);
var Ue = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ve = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: Ue
  }),
  []
);
var Be = `precision highp float;

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
const Oe = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: Be
  }),
  []
);
var Le = `precision highp float;

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
const We = () => g(
  () => new t.ShaderMaterial({
    uniforms: {
      uTarget: { value: new t.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new t.Vector3() },
      point: { value: new t.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: k,
    fragmentShader: Le
  }),
  []
), $e = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const s = g(() => new t.PlaneGeometry(2, 2), []), i = Se(), n = i.clone(), p = Ie(), v = ze(), c = Te(), l = Pe(), r = Re(), m = Ve(), y = Oe(), x = We(), f = g(
    () => ({
      vorticityMaterial: v,
      curlMaterial: p,
      advectionMaterial: c,
      divergenceMaterial: l,
      pressureMaterial: r,
      clearMaterial: m,
      gradientSubtractMaterial: y,
      splatMaterial: x
    }),
    [
      v,
      p,
      c,
      l,
      r,
      m,
      y,
      x
    ]
  ), h = q(u, o);
  g(() => {
    a(
      f.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const b of Object.values(f))
      a(
        b,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, f]);
  const d = z(e, s, i, t.Mesh);
  g(() => {
    i.dispose(), d.material = n;
  }, [i, d, n]), N(() => () => {
    for (const b of Object.values(f))
      b.dispose();
  }, [f]);
  const w = M(
    (b) => {
      d.material = b, d.material.needsUpdate = !0;
    },
    [d]
  );
  return { materials: f, setMeshMaterial: w, mesh: d };
}, Ee = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1),
  pointerValues: !1
}), wt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { materials: n, setMeshMaterial: p, mesh: v } = $e({
    scene: i,
    size: e,
    dpr: s.shader
  }), c = U(e), l = ee(), r = g(
    () => ({
      scene: i,
      camera: c,
      dpr: s.fbo,
      size: e,
      samples: o
    }),
    [i, c, e, o, s.fbo]
  ), [m, y] = X(r), [x, f] = X(r), [h, d] = F(r), [w, b] = F(r), [C, T] = X(r), S = D(0), R = D(new t.Vector2(0, 0)), _ = D(new t.Vector3(0, 0, 0)), [P, L] = V(Ee);
  return [
    M(
      (W, j) => {
        const { gl: E, pointer: me, clock: Z, size: te } = W;
        j && L(j), S.current === 0 && (S.current = Z.getElapsedTime());
        const re = Math.min(
          (Z.getElapsedTime() - S.current) / 3,
          0.02
        );
        S.current = Z.getElapsedTime();
        const J = y(E, ({ read: O }) => {
          p(n.advectionMaterial), a(n.advectionMaterial, "uVelocity", O), a(n.advectionMaterial, "uSource", O), a(n.advectionMaterial, "dt", re), a(
            n.advectionMaterial,
            "dissipation",
            P.velocity_dissipation
          );
        }), pe = f(E, ({ read: O }) => {
          p(n.advectionMaterial), a(n.advectionMaterial, "uVelocity", J), a(n.advectionMaterial, "uSource", O), a(
            n.advectionMaterial,
            "dissipation",
            P.density_dissipation
          );
        }), Y = P.pointerValues || l(me);
        Y.isVelocityUpdate && (y(E, ({ read: O }) => {
          p(n.splatMaterial), a(n.splatMaterial, "uTarget", O), a(
            n.splatMaterial,
            "point",
            Y.currentPointer
          );
          const G = Y.diffPointer.multiply(
            R.current.set(te.width, te.height).multiplyScalar(P.velocity_acceleration)
          );
          a(
            n.splatMaterial,
            "color",
            _.current.set(G.x, G.y, 1)
          ), a(
            n.splatMaterial,
            "radius",
            P.splat_radius
          );
        }), f(E, ({ read: O }) => {
          p(n.splatMaterial), a(n.splatMaterial, "uTarget", O);
          const G = typeof P.fluid_color == "function" ? P.fluid_color(Y.velocity) : P.fluid_color;
          a(n.splatMaterial, "color", G);
        }));
        const fe = d(E, () => {
          p(n.curlMaterial), a(n.curlMaterial, "uVelocity", J);
        });
        y(E, ({ read: O }) => {
          p(n.vorticityMaterial), a(n.vorticityMaterial, "uVelocity", O), a(n.vorticityMaterial, "uCurl", fe), a(
            n.vorticityMaterial,
            "curl",
            P.curl_strength
          ), a(n.vorticityMaterial, "dt", re);
        });
        const de = b(E, () => {
          p(n.divergenceMaterial), a(n.divergenceMaterial, "uVelocity", J);
        });
        T(E, ({ read: O }) => {
          p(n.clearMaterial), a(n.clearMaterial, "uTexture", O), a(
            n.clearMaterial,
            "value",
            P.pressure_dissipation
          );
        }), p(n.pressureMaterial), a(n.pressureMaterial, "uDivergence", de);
        let oe;
        for (let O = 0; O < P.pressure_iterations; O++)
          oe = T(E, ({ read: G }) => {
            a(n.pressureMaterial, "uPressure", G);
          });
        return y(E, ({ read: O }) => {
          p(n.gradientSubtractMaterial), a(
            n.gradientSubtractMaterial,
            "uPressure",
            oe
          ), a(n.gradientSubtractMaterial, "uVelocity", O);
        }), pe;
      },
      [
        n,
        p,
        d,
        f,
        b,
        l,
        T,
        y,
        L,
        P
      ]
    ),
    L,
    {
      scene: i,
      mesh: v,
      materials: n,
      camera: c,
      renderTarget: {
        velocity: m,
        density: x,
        curl: h,
        divergence: w,
        pressure: C
      },
      output: x.read.texture
    }
  ];
}, qe = ({ scale: e, max: u, texture: o, scene: s }) => {
  const i = D([]), n = g(
    () => new t.PlaneGeometry(e, e),
    [e]
  ), p = g(
    () => new t.MeshBasicMaterial({
      map: o,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [o]
  );
  return N(() => {
    for (let v = 0; v < u; v++) {
      const c = new t.Mesh(n.clone(), p.clone());
      c.rotateZ(2 * Math.PI * Math.random()), c.visible = !1, s.add(c), i.current.push(c);
    }
  }, [n, p, s, u]), N(() => () => {
    i.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((c) => c.dispose()) : v.material.dispose(), s.remove(v);
    }), i.current = [];
  }, [s]), i.current;
}, je = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), bt = ({
  texture: e = new t.Texture(),
  scale: u = 64,
  max: o = 100,
  size: s,
  dpr: i,
  samples: n = 0
}) => {
  const p = I(i), v = g(() => new t.Scene(), []), c = qe({
    scale: u,
    max: o,
    texture: e,
    scene: v
  }), l = U(s), r = ee(), [m, y] = F({
    scene: v,
    camera: l,
    size: s,
    dpr: p.fbo,
    samples: n
  }), [x, f] = V(je), h = D(0);
  return [
    M(
      (w, b) => {
        const { gl: C, pointer: T, size: S } = w;
        b && f(b);
        const R = x.pointerValues || r(T);
        if (x.frequency < R.diffPointer.length()) {
          const _ = c[h.current];
          _.visible = !0, _.position.set(
            R.currentPointer.x * (S.width / 2),
            R.currentPointer.y * (S.height / 2),
            0
          ), _.scale.x = _.scale.y = 0, _.material.opacity = x.alpha, h.current = (h.current + 1) % o;
        }
        return c.forEach((_) => {
          if (_.visible) {
            const P = _.material;
            _.rotation.z += x.rotation, P.opacity *= x.fadeout_speed, _.scale.x = x.fadeout_speed * _.scale.x + x.scale, _.scale.y = _.scale.x, P.opacity < 2e-3 && (_.visible = !1);
          }
        }), y(C);
      },
      [y, c, r, o, x, f]
    ),
    f,
    {
      scene: v,
      camera: l,
      meshArr: c,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Ne = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ke = `precision highp float;
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
const Ge = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
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
      vertexShader: Ne,
      fragmentShader: ke
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, Ke = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), Mt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = Ge(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(Ke);
  return [
    M(
      (x, f) => {
        const { gl: h, clock: d } = x;
        return f && m(f), a(n, "scale", r.scale), a(n, "timeStrength", r.timeStrength), a(n, "noiseOctaves", r.noiseOctaves), a(n, "fbmOctaves", r.fbmOctaves), a(n, "warpOctaves", r.warpOctaves), a(n, "warpDirection", r.warpDirection), a(n, "warpStrength", r.warpStrength), a(n, "uTime", r.beat || d.getElapsedTime()), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Xe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ye = `precision highp float;
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
const He = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
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
      vertexShader: Xe,
      fragmentShader: Ye
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, Qe = Object.freeze({
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
}), St = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = He(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(Qe);
  return [
    M(
      (x, f) => {
        const { gl: h, clock: d } = x;
        return f && m(f), r.texture ? (a(n, "uTexture", r.texture), a(n, "isTexture", !0)) : (a(n, "isTexture", !1), a(n, "scale", r.scale)), r.noise ? (a(n, "noise", r.noise), a(n, "isNoise", !0), a(n, "noiseStrength", r.noiseStrength)) : a(n, "isNoise", !1), a(n, "uTime", r.beat || d.getElapsedTime()), a(n, "laminateLayer", r.laminateLayer), a(n, "laminateInterval", r.laminateInterval), a(n, "laminateDetail", r.laminateDetail), a(n, "distortion", r.distortion), a(n, "colorFactor", r.colorFactor), a(n, "timeStrength", r.timeStrength), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Ze = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Je = `precision highp float;

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
const en = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
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
      vertexShader: Ze,
      fragmentShader: Je
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, nn = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), _t = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = en(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(nn);
  return [
    M(
      (x, f) => {
        const { gl: h, clock: d } = x;
        return f && m(f), a(n, "u_pattern", r.pattern), a(n, "u_complexity", r.complexity), a(
          n,
          "u_complexityAttenuation",
          r.complexityAttenuation
        ), a(n, "u_iterations", r.iterations), a(n, "u_timeStrength", r.timeStrength), a(n, "u_scale", r.scale), a(n, "u_time", r.beat || d.getElapsedTime()), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var tn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, rn = `precision highp float;
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
const on = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uRgbWeight: { value: new t.Vector3(0.299, 0.587, 0.114) },
        uColor1: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor2: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor3: { value: new t.Color().set(1, 1, 1) },
        uColor4: { value: new t.Color().set(0, 0.1, 0.2) }
      },
      vertexShader: tn,
      fragmentShader: rn
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, an = Object.freeze({
  texture: new t.Texture(),
  color1: new t.Color().set(0.5, 0.5, 0.5),
  color2: new t.Color().set(0.5, 0.5, 0.5),
  color3: new t.Color().set(1, 1, 1),
  color4: new t.Color().set(0, 0.1, 0.2),
  rgbWeight: new t.Vector3(0.299, 0.587, 0.114)
}), Tt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = on(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(an);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "uTexture", r.texture), a(n, "uColor1", r.color1), a(n, "uColor2", r.color2), a(n, "uColor3", r.color3), a(n, "uColor4", r.color4), a(n, "uRgbWeight", r.rgbWeight), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var un = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, sn = `precision highp float;

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
const ln = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: un,
      fragmentShader: sn
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, cn = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Ct = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = ln(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(cn);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "uTexture", r.texture), a(n, "uColor0", r.color0), a(n, "uColor1", r.color1), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var vn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, mn = `precision highp float;

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
const pn = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
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
      vertexShader: vn,
      fragmentShader: mn
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, fn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Pt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = pn(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(fn);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "u_texture", r.texture), a(n, "u_map", r.map), a(n, "u_mapIntensity", r.mapIntensity), r.alphaMap ? (a(n, "u_alphaMap", r.alphaMap), a(n, "u_isAlphaMap", !0)) : a(n, "u_isAlphaMap", !1), a(n, "u_brightness", r.brightness), a(n, "u_min", r.min), a(n, "u_max", r.max), r.dodgeColor ? (a(n, "u_dodgeColor", r.dodgeColor), a(n, "u_isDodgeColor", !0)) : a(n, "u_isDodgeColor", !1), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var dn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, gn = `precision highp float;

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
const hn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const s = g(() => new t.PlaneGeometry(2, 2), []), i = g(
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
      vertexShader: dn,
      fragmentShader: gn
    }),
    []
  ), n = q(u, o);
  a(i, "uResolution", n.clone());
  const p = z(e, s, i, t.Mesh);
  return { material: i, mesh: p };
}, xn = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  padding: 0,
  map: new t.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  dir: new t.Vector2(0, 0)
}, Dt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = hn({ scene: i, size: e, dpr: s.shader }), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    dpr: s.fbo,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [r, m] = V(xn);
  return [
    M(
      (x, f) => {
        var C, T, S, R, _, P, L, $;
        const { gl: h } = x;
        f && m(f), a(n, "uTexture0", r.texture0), a(n, "uTexture1", r.texture1), a(n, "progress", r.progress);
        const d = [
          ((T = (C = r.texture0) == null ? void 0 : C.image) == null ? void 0 : T.width) || 0,
          ((R = (S = r.texture0) == null ? void 0 : S.image) == null ? void 0 : R.height) || 0
        ], w = [
          ((P = (_ = r.texture1) == null ? void 0 : _.image) == null ? void 0 : P.width) || 0,
          (($ = (L = r.texture1) == null ? void 0 : L.image) == null ? void 0 : $.height) || 0
        ], b = d.map((W, j) => W + (w[j] - W) * r.progress);
        return a(n, "uTextureResolution", b), a(n, "padding", r.padding), a(n, "uMap", r.map), a(n, "mapIntensity", r.mapIntensity), a(n, "edgeIntensity", r.edgeIntensity), a(n, "epicenter", r.epicenter), a(n, "dirX", r.dir.x), a(n, "dirY", r.dir.y), l(h);
      },
      [l, n, r, m]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var yn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, wn = `precision highp float;

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
const bn = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: yn,
      fragmentShader: wn
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, Mn = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Rt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = bn(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(
    Mn
  );
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "u_texture", r.texture), a(n, "u_brightness", r.brightness), a(n, "u_min", r.min), a(n, "u_max", r.max), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Sn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, _n = `precision highp float;

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
const Tn = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Sn,
      fragmentShader: _n
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, Cn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, At = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = Tn(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(Cn);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "u_texture", r.texture), a(n, "u_map", r.map), a(n, "u_mapIntensity", r.mapIntensity), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Pn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Dn = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Rn = ({
  scene: e,
  size: u
}) => {
  const o = g(() => new t.PlaneGeometry(2, 2), []), s = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uMap: { value: new t.Texture() }
      },
      vertexShader: Pn,
      fragmentShader: Dn
    }),
    []
  ), i = z(e, o, s, t.Mesh);
  return { material: s, mesh: i };
}, An = {
  texture: new t.Texture(),
  map: new t.Texture()
}, It = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = Rn({ scene: i, size: e }), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(An);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "uTexture", r.texture), a(n, "uMap", r.map), l(h);
      },
      [n, l, r, m]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var In = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Fn = `precision highp float;

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
const zn = ({
  scene: e,
  size: u
}) => {
  const o = g(() => new t.PlaneGeometry(2, 2), []), s = g(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: In,
      fragmentShader: Fn
    }),
    []
  ), i = z(e, o, s, t.Mesh);
  return { material: s, mesh: i };
}, Un = {
  texture: new t.Texture(),
  brightness: 1,
  saturation: 1
}, Ft = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = zn({ scene: i, size: e }), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(Un);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "u_texture", r.texture), a(n, "u_brightness", r.brightness), a(n, "u_saturation", r.saturation), l(h);
      },
      [n, l, r, m]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Vn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Bn = `precision highp float;

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
const On = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const s = g(() => new t.PlaneGeometry(2, 2), []), i = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uTextureResolution: { value: new t.Vector2() },
        uTexture: { value: new t.Texture() }
      },
      vertexShader: Vn,
      fragmentShader: Bn
    }),
    []
  ), n = q(u, o);
  a(i, "uResolution", n.clone());
  const p = z(e, s, i, t.Mesh);
  return { material: i, mesh: p };
}, Ln = {
  texture: new t.Texture()
}, zt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = On({ scene: i, size: e, dpr: s.shader }), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    dpr: s.fbo,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [r, m] = V(Ln);
  return [
    M(
      (x, f) => {
        var d, w, b, C, T, S;
        const { gl: h } = x;
        return f && m(f), a(n, "uTexture", r.texture), a(n, "uTextureResolution", [
          ((b = (w = (d = r.texture) == null ? void 0 : d.source) == null ? void 0 : w.data) == null ? void 0 : b.width) || 0,
          ((S = (T = (C = r.texture) == null ? void 0 : C.source) == null ? void 0 : T.data) == null ? void 0 : S.height) || 0
        ]), l(h);
      },
      [l, n, r, m]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Wn = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, $n = `precision mediump float;

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
const En = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: le.blurSize }
      },
      vertexShader: Wn,
      fragmentShader: $n
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, le = Object.freeze({
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}), Ut = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = En(i), v = U(e), c = g(
    () => ({
      scene: i,
      camera: v,
      size: e,
      dpr: s.fbo,
      samples: o
    }),
    [i, v, e, s.fbo, o]
  ), [l, r] = F(c), [m, y] = X(c), [x, f] = V(le);
  return [
    M(
      (d, w) => {
        var S, R, _, P, L, $;
        const { gl: b } = d;
        w && f(w), a(n, "uTexture", x.texture), a(n, "uResolution", [
          ((_ = (R = (S = x.texture) == null ? void 0 : S.source) == null ? void 0 : R.data) == null ? void 0 : _.width) || 0,
          (($ = (L = (P = x.texture) == null ? void 0 : P.source) == null ? void 0 : L.data) == null ? void 0 : $.height) || 0
        ]), a(n, "uBlurSize", x.blurSize);
        let C = y(b);
        const T = x.blurPower;
        for (let W = 0; W < T; W++)
          a(n, "uTexture", C), C = y(b);
        return r(b);
      },
      [r, y, n, f, x]
    ),
    f,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var qn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, jn = `precision highp float;

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
const Nn = (e) => {
  const u = g(() => new t.PlaneGeometry(2, 2), []), o = g(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: K.epicenter },
        uProgress: { value: K.progress },
        uStrength: { value: K.strength },
        uWidth: { value: K.width },
        uMode: { value: 0 }
      },
      vertexShader: qn,
      fragmentShader: jn
    }),
    []
  ), s = z(e, u, o, t.Mesh);
  return { material: o, mesh: s };
}, K = Object.freeze({
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), Vt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = Nn(i), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o,
    isSizeUpdate: !0
  }), [r, m] = V(K);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "uEpicenter", r.epicenter), a(n, "uProgress", r.progress), a(n, "uWidth", r.width), a(n, "uStrength", r.strength), a(
          n,
          "uMode",
          r.mode === "center" ? 0 : r.mode === "horizontal" ? 1 : 2
        ), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var kn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Gn = `precision highp float;
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
const Kn = ({
  scene: e,
  size: u,
  dpr: o
}) => {
  const s = g(() => new t.PlaneGeometry(2, 2), []), i = g(
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
      vertexShader: kn,
      fragmentShader: Gn
    }),
    []
  ), n = q(u, o);
  a(i, "u_resolution", n.clone());
  const p = z(e, s, i, t.Mesh);
  return { material: i, mesh: p };
}, Xn = Object.freeze({
  texture: new t.Texture(),
  keyColor: new t.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new t.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), Bt = ({
  size: e,
  dpr: u,
  samples: o = 0
}) => {
  const s = I(u), i = g(() => new t.Scene(), []), { material: n, mesh: p } = Kn({ scene: i, size: e, dpr: s.shader }), v = U(e), [c, l] = F({
    scene: i,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: o
  }), [r, m] = V(Xn);
  return [
    M(
      (x, f) => {
        const { gl: h } = x;
        return f && m(f), a(n, "u_texture", r.texture), a(n, "u_keyColor", r.keyColor), a(n, "u_similarity", r.similarity), a(n, "u_smoothness", r.smoothness), a(n, "u_spill", r.spill), a(n, "u_color", r.color), a(n, "u_contrast", r.contrast), a(n, "u_brightness", r.brightness), a(n, "u_gamma", r.gamma), l(h);
      },
      [l, n, m, r]
    ),
    m,
    {
      scene: i,
      mesh: p,
      material: n,
      camera: v,
      renderTarget: c,
      output: c.texture
    }
  ];
}, Yn = ({
  scene: e,
  geometry: u,
  material: o
}) => {
  const s = z(
    e,
    u,
    o,
    t.Points
  ), i = z(
    e,
    g(() => u.clone(), [u]),
    g(() => o.clone(), [o]),
    t.Mesh
  );
  return i.visible = !1, {
    points: s,
    interactiveMesh: i
  };
};
var Hn = `uniform vec2 uResolution;
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
}`, Qn = `precision highp float;
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
}`, ce = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
const ve = process.env.NODE_ENV === "development", ie = (e, u, o, s, i) => {
  var r;
  const n = o === "position" ? "positionTarget" : "uvTarget", p = o === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", v = o === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", c = o === "position" ? "positionsList" : "uvsList", l = o === "position" ? `
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
      new t.BufferAttribute(e[0], i)
    );
    let m = "", y = "";
    e.forEach((x, f) => {
      u.setAttribute(
        `${n}${f}`,
        new t.BufferAttribute(x, i)
      ), m += `attribute vec${i} ${n}${f};
`, f === 0 ? y += `${n}${f}` : y += `,${n}${f}`;
    }), s = s.replace(
      `${p}`,
      m
    ), s = s.replace(
      `${v}`,
      `vec${i} ${c}[${e.length}] = vec${i}[](${y});
				${l}
			`
    );
  } else
    s = s.replace(`${p}`, ""), s = s.replace(`${v}`, ""), (r = u == null ? void 0 : u.attributes[o]) != null && r.array || ve && console.error(
      `use-shader-fx:geometry.attributes.${o}.array is not found`
    );
  return s;
}, ue = (e, u, o, s) => {
  var n;
  let i = [];
  if (e && e.length > 0) {
    (n = u == null ? void 0 : u.attributes[o]) != null && n.array ? i = [
      u.attributes[o].array,
      ...e
    ] : i = e;
    const p = Math.max(...i.map((v) => v.length));
    i.forEach((v, c) => {
      if (v.length < p) {
        const l = (p - v.length) / s, r = [], m = Array.from(v);
        for (let y = 0; y < l; y++) {
          const x = Math.floor(v.length / s * Math.random()) * s;
          for (let f = 0; f < s; f++)
            r.push(m[x + f]);
        }
        i[c] = new Float32Array([...m, ...r]);
      }
    });
  }
  return i;
}, Zn = (e, u) => {
  let o = "";
  const s = {};
  let i = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((p, v) => {
    const c = `vMapArrayIndex < ${v}.1`, l = `texture2D(uMapArray${v}, uv)`;
    i += `( ${c} ) ? ${l} : `, o += `
        uniform sampler2D uMapArray${v};
      `, s[`uMapArray${v}`] = { value: p };
  }), i += "vec4(1.);", o += "bool isMapArray = true;", s.uMapArrayLength = { value: e.length }) : (i += "vec4(1.0);", o += "bool isMapArray = false;", s.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: u.replace("#usf <mapArraySwitcher>", i).replace("#usf <mapArrayUniforms>", o), mapArrayUniforms: s };
}, Jn = ({
  size: e,
  dpr: u,
  geometry: o,
  positions: s,
  uvs: i,
  mapArray: n
}) => {
  const p = g(
    () => ue(s, o, "position", 3),
    [s, o]
  ), v = g(
    () => ue(i, o, "uv", 2),
    [i, o]
  ), c = g(() => {
    p.length !== v.length && ve && console.log("use-shader-fx:positions and uvs are not matched");
    const r = ie(
      v,
      o,
      "uv",
      ie(
        p,
        o,
        "position",
        Hn,
        3
      ),
      2
    ).replace("#usf <getWobble>", ce), m = Zn(n, Qn);
    return new t.ShaderMaterial({
      vertexShader: r,
      fragmentShader: m.rewritedFragmentShader,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0,
      blending: t.AdditiveBlending,
      uniforms: {
        uResolution: { value: new t.Vector2(0, 0) },
        uMorphProgress: { value: A.morphProgress },
        uBlurAlpha: { value: A.blurAlpha },
        uBlurRadius: { value: A.blurRadius },
        uPointSize: { value: A.pointSize },
        uPointAlpha: { value: A.pointAlpha },
        uPicture: { value: new t.Texture() },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: new t.Texture() },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: A.color0 },
        uColor1: { value: A.color1 },
        uColor2: { value: A.color2 },
        uColor3: { value: A.color3 },
        uMap: { value: new t.Texture() },
        uIsMap: { value: !1 },
        uAlphaMap: { value: new t.Texture() },
        uIsAlphaMap: { value: !1 },
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: A.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: A.wobbleTimeFrequency
        },
        uWobbleStrength: { value: A.wobbleStrength },
        uWarpPositionFrequency: {
          value: A.warpPositionFrequency
        },
        uWarpTimeFrequency: {
          value: A.warpTimeFrequency
        },
        uWarpStrength: { value: A.warpStrength },
        uDisplacement: { value: new t.Texture() },
        uIsDisplacement: { value: !1 },
        uDisplacementIntensity: {
          value: A.displacementIntensity
        },
        uDisplacementColorIntensity: {
          value: A.displacementColorIntensity
        },
        uSizeRandomIntensity: {
          value: A.sizeRandomIntensity
        },
        uSizeRandomTimeFrequency: {
          value: A.sizeRandomTimeFrequency
        },
        uSizeRandomMin: { value: A.sizeRandomMin },
        uSizeRandomMax: { value: A.sizeRandomMax },
        uDivergence: { value: A.divergence },
        uDivergencePoint: { value: A.divergencePoint },
        ...m.mapArrayUniforms
      }
    });
  }, [
    o,
    p,
    v,
    n
  ]), l = q(e, u);
  return a(c, "uResolution", l.clone()), { material: c, modifiedPositions: p, modifiedUvs: v };
}, et = ({
  size: e,
  dpr: u,
  scene: o = !1,
  geometry: s,
  positions: i,
  uvs: n,
  mapArray: p
}) => {
  const v = I(u), c = g(() => {
    const h = s || new t.SphereGeometry(1, 32, 32);
    return h.setIndex(null), h.deleteAttribute("normal"), h;
  }, [s]), { material: l, modifiedPositions: r, modifiedUvs: m } = Jn({
    size: e,
    dpr: v.shader,
    geometry: c,
    positions: i,
    uvs: n,
    mapArray: p
  }), { points: y, interactiveMesh: x } = Yn({
    scene: o,
    geometry: c,
    material: l
  });
  return [
    M(
      (h, d) => {
        h && a(
          l,
          "uTime",
          (d == null ? void 0 : d.beat) || h.clock.getElapsedTime()
        ), d !== void 0 && (a(l, "uMorphProgress", d.morphProgress), a(l, "uBlurAlpha", d.blurAlpha), a(l, "uBlurRadius", d.blurRadius), a(l, "uPointSize", d.pointSize), a(l, "uPointAlpha", d.pointAlpha), d.picture ? (a(l, "uPicture", d.picture), a(l, "uIsPicture", !0)) : d.picture === !1 && a(l, "uIsPicture", !1), d.alphaPicture ? (a(l, "uAlphaPicture", d.alphaPicture), a(l, "uIsAlphaPicture", !0)) : d.alphaPicture === !1 && a(l, "uIsAlphaPicture", !1), a(l, "uColor0", d.color0), a(l, "uColor1", d.color1), a(l, "uColor2", d.color2), a(l, "uColor3", d.color3), d.map ? (a(l, "uMap", d.map), a(l, "uIsMap", !0)) : d.map === !1 && a(l, "uIsMap", !1), d.alphaMap ? (a(l, "uAlphaMap", d.alphaMap), a(l, "uIsAlphaMap", !0)) : d.alphaMap === !1 && a(l, "uIsAlphaMap", !1), a(l, "uWobbleStrength", d.wobbleStrength), a(
          l,
          "uWobblePositionFrequency",
          d.wobblePositionFrequency
        ), a(
          l,
          "uWobbleTimeFrequency",
          d.wobbleTimeFrequency
        ), a(l, "uWarpStrength", d.warpStrength), a(
          l,
          "uWarpPositionFrequency",
          d.warpPositionFrequency
        ), a(l, "uWarpTimeFrequency", d.warpTimeFrequency), d.displacement ? (a(l, "uDisplacement", d.displacement), a(l, "uIsDisplacement", !0)) : d.displacement === !1 && a(l, "uIsDisplacement", !1), a(
          l,
          "uDisplacementIntensity",
          d.displacementIntensity
        ), a(
          l,
          "uDisplacementColorIntensity",
          d.displacementColorIntensity
        ), a(
          l,
          "uSizeRandomIntensity",
          d.sizeRandomIntensity
        ), a(
          l,
          "uSizeRandomTimeFrequency",
          d.sizeRandomTimeFrequency
        ), a(l, "uSizeRandomMin", d.sizeRandomMin), a(l, "uSizeRandomMax", d.sizeRandomMax), a(l, "uDivergence", d.divergence), a(l, "uDivergencePoint", d.divergencePoint));
      },
      [l]
    ),
    {
      points: y,
      interactiveMesh: x,
      positions: r,
      uvs: m
    }
  ];
}, A = Object.freeze({
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
}), Ot = ({
  size: e,
  dpr: u,
  samples: o = 0,
  camera: s,
  geometry: i,
  positions: n,
  uvs: p
}) => {
  const v = I(u), c = g(() => new t.Scene(), []), [
    l,
    {
      points: r,
      interactiveMesh: m,
      positions: y,
      uvs: x
    }
  ] = et({ scene: c, size: e, dpr: u, geometry: i, positions: n, uvs: p }), [f, h] = F({
    scene: c,
    camera: s,
    size: e,
    dpr: v.fbo,
    samples: o,
    depthBuffer: !0
  }), d = M(
    (b, C) => (l(b, C), h(b.gl)),
    [h, l]
  ), w = M(
    (b) => {
      l(null, b);
    },
    [l]
  );
  return [
    d,
    w,
    {
      scene: c,
      points: r,
      interactiveMesh: m,
      renderTarget: f,
      output: f.texture,
      positions: y,
      uvs: x
    }
  ];
};
function nt(e, u = 1e-4) {
  u = Math.max(u, Number.EPSILON);
  const o = {}, s = e.getIndex(), i = e.getAttribute("position"), n = s ? s.count : i.count;
  let p = 0;
  const v = Object.keys(e.attributes), c = {}, l = {}, r = [], m = ["getX", "getY", "getZ", "getW"];
  for (let h = 0, d = v.length; h < d; h++) {
    const w = v[h];
    c[w] = [];
    const b = e.morphAttributes[w];
    b && (l[w] = new Array(b.length).fill(0).map(() => []));
  }
  const y = Math.log10(1 / u), x = Math.pow(10, y);
  for (let h = 0; h < n; h++) {
    const d = s ? s.getX(h) : h;
    let w = "";
    for (let b = 0, C = v.length; b < C; b++) {
      const T = v[b], S = e.getAttribute(T), R = S.itemSize;
      for (let _ = 0; _ < R; _++)
        w += `${~~(S[m[_]](d) * x)},`;
    }
    if (w in o)
      r.push(o[w]);
    else {
      for (let b = 0, C = v.length; b < C; b++) {
        const T = v[b], S = e.getAttribute(T), R = e.morphAttributes[T], _ = S.itemSize, P = c[T], L = l[T];
        for (let $ = 0; $ < _; $++) {
          const W = m[$];
          if (P.push(S[W](d)), R)
            for (let j = 0, E = R.length; j < E; j++)
              L[j].push(R[j][W](d));
        }
      }
      o[w] = p, r.push(p), p++;
    }
  }
  const f = e.clone();
  for (let h = 0, d = v.length; h < d; h++) {
    const w = v[h], b = e.getAttribute(w), C = new b.array.constructor(c[w]), T = new ae(C, b.itemSize, b.normalized);
    if (f.setAttribute(w, T), w in l)
      for (let S = 0; S < l[w].length; S++) {
        const R = e.morphAttributes[w][S], _ = new R.array.constructor(l[w][S]), P = new ae(_, R.itemSize, R.normalized);
        f.morphAttributes[w][S] = P;
      }
  }
  return f.setIndex(r), f;
}
var tt = `vec3 random3(vec3 c) {
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
}`, rt = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, ot = `#ifdef USE_TRANSMISSION

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
const se = (e) => {
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
  ), u = u.replace("// #usf <getWobble>", `${ce}`), u = u.replace(
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
}, at = ({
  baseMaterial: e,
  materialParameters: u
}) => {
  const { material: o, depthMaterial: s } = g(() => {
    const i = new (e || t.MeshPhysicalMaterial)(
      u || {}
    ), n = i.type === "MeshPhysicalMaterial" || i.type === "MeshStandardMaterial", p = i.type === "MeshPhysicalMaterial";
    Object.assign(i.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: B.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: B.wobbleTimeFrequency
        },
        uWobbleStrength: { value: B.wobbleStrength },
        uWarpPositionFrequency: {
          value: B.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: B.warpTimeFrequency },
        uWarpStrength: { value: B.warpStrength },
        uWobbleShine: { value: B.wobbleShine },
        uColor0: { value: B.color0 },
        uColor1: { value: B.color1 },
        uColor2: { value: B.color2 },
        uColor3: { value: B.color3 },
        uColorMix: { value: B.colorMix },
        uChromaticAberration: {
          value: B.chromaticAberration
        },
        uAnisotropicBlur: { value: B.anisotropicBlur },
        uDistortion: { value: B.distortion },
        uDistortionScale: { value: B.distortionScale },
        uTemporalDistortion: { value: B.temporalDistortion },
        uSamples: { value: B.samples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null }
      }
    }), i.onBeforeCompile = (c) => {
      Object.assign(c.uniforms, i.userData.uniforms), c.vertexShader = se(c.vertexShader), c.fragmentShader = c.fragmentShader.replace(
        "#include <color_fragment>",
        `
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
      ), n && (c.fragmentShader = c.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
      )), c.fragmentShader = c.fragmentShader.replace(
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
				${tt}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${n ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${n ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), p && (c.fragmentShader = c.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${rt}`
      ), c.fragmentShader = c.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${ot}`
      ));
    }, i.needsUpdate = !0;
    const v = new t.MeshDepthMaterial({
      depthPacking: t.RGBADepthPacking
    });
    return v.onBeforeCompile = (c) => {
      Object.assign(c.uniforms, i.userData.uniforms), c.vertexShader = se(c.vertexShader);
    }, v.needsUpdate = !0, { material: i, depthMaterial: v };
  }, [u, e]);
  return {
    material: o,
    depthMaterial: s
  };
}, it = ({
  scene: e = !1,
  geometry: u,
  baseMaterial: o,
  materialParameters: s
}) => {
  const i = g(() => {
    let l = u || new t.IcosahedronGeometry(2, 20);
    return l = nt(l), l.computeTangents(), l;
  }, [u]), { material: n, depthMaterial: p } = at({
    baseMaterial: o,
    materialParameters: s
  }), v = z(e, i, n, t.Mesh);
  return [
    M(
      (l, r) => {
        const m = n.userData;
        l && a(
          m,
          "uTime",
          (r == null ? void 0 : r.beat) || l.clock.getElapsedTime()
        ), r !== void 0 && (a(m, "uWobbleStrength", r.wobbleStrength), a(
          m,
          "uWobblePositionFrequency",
          r.wobblePositionFrequency
        ), a(
          m,
          "uWobbleTimeFrequency",
          r.wobbleTimeFrequency
        ), a(m, "uWarpStrength", r.warpStrength), a(
          m,
          "uWarpPositionFrequency",
          r.warpPositionFrequency
        ), a(m, "uWarpTimeFrequency", r.warpTimeFrequency), a(m, "uWobbleShine", r.wobbleShine), a(m, "uSamples", r.samples), a(m, "uColor0", r.color0), a(m, "uColor1", r.color1), a(m, "uColor2", r.color2), a(m, "uColor3", r.color3), a(m, "uColorMix", r.colorMix), a(
          m,
          "uChromaticAberration",
          r.chromaticAberration
        ), a(m, "uAnisotropicBlur", r.anisotropicBlur), a(m, "uDistortion", r.distortion), a(m, "uDistortionScale", r.distortionScale), a(m, "uTemporalDistortion", r.temporalDistortion));
      },
      [n]
    ),
    {
      mesh: v,
      depthMaterial: p
    }
  ];
}, B = Object.freeze({
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
}), Lt = ({
  size: e,
  dpr: u,
  samples: o = 0,
  camera: s,
  geometry: i,
  baseMaterial: n,
  materialParameters: p
}) => {
  const v = I(u), c = g(() => new t.Scene(), []), [l, { mesh: r, depthMaterial: m }] = it({
    baseMaterial: n,
    materialParameters: p,
    scene: c,
    geometry: i
  }), [y, x] = F({
    scene: c,
    camera: s,
    size: e,
    dpr: v.fbo,
    samples: o,
    depthBuffer: !0
  }), f = M(
    (d, w) => (l(d, w), x(d.gl)),
    [x, l]
  ), h = M(
    (d) => {
      l(null, d);
    },
    [l]
  );
  return [
    f,
    h,
    {
      scene: c,
      mesh: r,
      depthMaterial: m,
      renderTarget: y,
      output: y.texture
    }
  ];
}, Wt = (e, u, o) => {
  const s = g(() => {
    const i = new t.Mesh(u, o);
    return e.add(i), i;
  }, [u, o, e]);
  return N(() => () => {
    e.remove(s), u.dispose(), o.dispose();
  }, [e, u, o, s]), s;
}, H = Object.freeze({
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
    return 1 - H.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - H.easeOutBounce(1 - 2 * e)) / 2 : (1 + H.easeOutBounce(2 * e - 1)) / 2;
  }
});
function ut(e) {
  let u = Math.sin(e * 12.9898) * 43758.5453;
  return u - Math.floor(u);
}
const $t = (e, u = "easeOutQuart") => {
  const o = e / 60, s = H[u];
  return M(
    (n) => {
      let p = n.getElapsedTime() * o;
      const v = Math.floor(p), c = s(p - v);
      p = c + v;
      const l = ut(v);
      return {
        beat: p,
        floor: v,
        fract: c,
        hash: l
      };
    },
    [o, s]
  );
}, Et = (e = 60) => {
  const u = g(() => 1 / Math.max(Math.min(e, 60), 1), [e]), o = D(null);
  return M(
    (i) => {
      const n = i.getElapsedTime();
      return o.current === null || n - o.current >= u ? (o.current = n, !0) : !1;
    },
    [u]
  );
}, st = (e) => {
  var s, i;
  const u = (s = e.dom) == null ? void 0 : s.length, o = (i = e.texture) == null ? void 0 : i.length;
  return !u || !o || u !== o;
};
var lt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, ct = `precision highp float;

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
const vt = ({
  params: e,
  size: u,
  scene: o
}) => {
  o.children.length > 0 && (o.children.forEach((s) => {
    s instanceof t.Mesh && (s.geometry.dispose(), s.material.dispose());
  }), o.remove(...o.children)), e.texture.forEach((s, i) => {
    const n = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: lt,
        fragmentShader: ct,
        transparent: !0,
        uniforms: {
          u_texture: { value: s },
          u_textureResolution: {
            value: new t.Vector2(0, 0)
          },
          u_resolution: { value: new t.Vector2(0, 0) },
          u_borderRadius: {
            value: e.boderRadius[i] ? e.boderRadius[i] : 0
          }
        }
      })
    );
    o.add(n);
  });
}, mt = () => {
  const e = D([]), u = D([]);
  return M(
    ({
      isIntersectingRef: s,
      isIntersectingOnceRef: i,
      params: n
    }) => {
      e.current.length > 0 && e.current.forEach((v, c) => {
        v.unobserve(u.current[c]);
      }), u.current = [], e.current = [];
      const p = new Array(n.dom.length).fill(!1);
      s.current = [...p], i.current = [...p], n.dom.forEach((v, c) => {
        const l = (m) => {
          m.forEach((y) => {
            n.onIntersect[c] && n.onIntersect[c](y), s.current[c] = y.isIntersecting;
          });
        }, r = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        r.observe(v), e.current.push(r), u.current.push(v);
      });
    },
    []
  );
}, pt = () => {
  const e = D([]), u = M(
    ({ params: o, size: s, resolutionRef: i, scene: n, isIntersectingRef: p }) => {
      n.children.length !== e.current.length && (e.current = new Array(n.children.length)), n.children.forEach((v, c) => {
        var m, y, x, f, h, d;
        const l = o.dom[c];
        if (!l)
          return;
        const r = l.getBoundingClientRect();
        if (e.current[c] = r, v.scale.set(r.width, r.height, 1), v.position.set(
          r.left + r.width * 0.5 - s.width * 0.5,
          -r.top - r.height * 0.5 + s.height * 0.5,
          0
        ), p.current[c] && (o.rotation[c] && v.rotation.copy(o.rotation[c]), v instanceof t.Mesh)) {
          const w = v.material;
          a(w, "u_texture", o.texture[c]), a(w, "u_textureResolution", [
            ((x = (y = (m = o.texture[c]) == null ? void 0 : m.source) == null ? void 0 : y.data) == null ? void 0 : x.width) || 0,
            ((d = (h = (f = o.texture[c]) == null ? void 0 : f.source) == null ? void 0 : h.data) == null ? void 0 : d.height) || 0
          ]), a(
            w,
            "u_resolution",
            i.current.set(r.width, r.height)
          ), a(
            w,
            "u_borderRadius",
            o.boderRadius[c] ? o.boderRadius[c] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, u];
}, ft = () => {
  const e = D([]), u = D([]), o = M((s, i = !1) => {
    e.current.forEach((p, v) => {
      p && (u.current[v] = !0);
    });
    const n = i ? [...u.current] : [...e.current];
    return s < 0 ? n : n[s];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: u,
    isIntersecting: o
  };
}, dt = (e) => ({ onView: o, onHidden: s }) => {
  const i = D(!1);
  N(() => {
    let n;
    const p = () => {
      e.current.some((v) => v) ? i.current || (o && o(), i.current = !0) : i.current && (s && s(), i.current = !1), n = requestAnimationFrame(p);
    };
    return n = requestAnimationFrame(p), () => {
      cancelAnimationFrame(n);
    };
  }, [o, s]);
}, gt = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, qt = ({ size: e, dpr: u, samples: o = 0 }, s = []) => {
  const i = I(u), n = g(() => new t.Scene(), []), p = U(e), [v, c] = F({
    scene: n,
    camera: p,
    size: e,
    dpr: i.fbo,
    samples: o,
    isSizeUpdate: !0
  }), [l, r] = V({
    ...gt,
    updateKey: performance.now()
  }), [m, y] = pt(), x = D(new t.Vector2(0, 0)), [f, h] = ge(!0);
  g(
    () => h(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const d = D(null), w = g(() => new t.Texture(), []), b = mt(), { isIntersectingOnceRef: C, isIntersectingRef: T, isIntersecting: S } = ft(), R = dt(T);
  return [
    M(
      (P, L) => {
        const { gl: $, size: W } = P;
        if (L && r(L), st(l))
          return w;
        if (f) {
          if (d.current === l.updateKey)
            return w;
          d.current = l.updateKey;
        }
        return f && (vt({
          params: l,
          size: W,
          scene: n
        }), b({
          isIntersectingRef: T,
          isIntersectingOnceRef: C,
          params: l
        }), h(!1)), y({
          params: l,
          size: W,
          resolutionRef: x,
          scene: n,
          isIntersectingRef: T
        }), c($);
      },
      [
        c,
        r,
        b,
        y,
        f,
        n,
        l,
        C,
        T,
        w
      ]
    ),
    r,
    {
      scene: n,
      camera: p,
      renderTarget: v,
      output: v.texture,
      isIntersecting: S,
      DOMRects: m,
      intersections: T.current,
      useDomView: R
    }
  ];
}, jt = ({
  scene: e,
  camera: u,
  size: o,
  dpr: s = !1,
  isSizeUpdate: i = !1,
  samples: n = 0,
  depthBuffer: p = !1,
  depthTexture: v = !1
}, c) => {
  const l = D([]), r = q(o, s);
  l.current = g(() => Array.from({ length: c }, () => {
    const y = new t.WebGLRenderTarget(
      r.x,
      r.y,
      {
        ...Q,
        samples: n,
        depthBuffer: p
      }
    );
    return v && (y.depthTexture = new t.DepthTexture(
      r.x,
      r.y,
      t.FloatType
    )), y;
  }), [c]), i && l.current.forEach(
    (y) => y.setSize(r.x, r.y)
  ), N(() => {
    const y = l.current;
    return () => {
      y.forEach((x) => x.dispose());
    };
  }, [c]);
  const m = M(
    (y, x, f) => {
      const h = l.current[x];
      return ne({
        gl: y,
        scene: e,
        camera: u,
        fbo: h,
        onBeforeRender: () => f && f({ read: h.texture })
      }), h.texture;
    },
    [e, u]
  );
  return [l.current, m];
};
export {
  An as ALPHABLENDING_PARAMS,
  fn as BLENDING_PARAMS,
  Mn as BRIGHTNESSPICKER_PARAMS,
  be as BRUSH_PARAMS,
  Xn as CHROMAKEY_PARAMS,
  Qe as COLORSTRATA_PARAMS,
  an as COSPALETTE_PARAMS,
  Ln as COVERTEXTURE_PARAMS,
  gt as DOMSYNCER_PARAMS,
  cn as DUOTONE_PARAMS,
  H as Easing,
  Q as FBO_OPTION,
  Ee as FLUID_PARAMS,
  Cn as FXBLENDING_PARAMS,
  xn as FXTEXTURE_PARAMS,
  Un as HSV_PARAMS,
  nn as MARBLE_PARAMS,
  A as MORPHPARTICLES_PARAMS,
  Ke as NOISE_PARAMS,
  je as RIPPLE_PARAMS,
  le as SIMPLEBLUR_PARAMS,
  K as WAVE_PARAMS,
  B as WOBBLE3D_PARAMS,
  ne as renderFBO,
  a as setUniform,
  Wt as useAddMesh,
  It as useAlphaBlending,
  $t as useBeat,
  Pt as useBlending,
  Rt as useBrightnessPicker,
  yt as useBrush,
  U as useCamera,
  Bt as useChromaKey,
  St as useColorStrata,
  jt as useCopyTexture,
  Tt as useCosPalette,
  zt as useCoverTexture,
  et as useCreateMorphParticles,
  it as useCreateWobble3D,
  qt as useDomSyncer,
  X as useDoubleFBO,
  Ct as useDuoTone,
  Et as useFPSLimiter,
  wt as useFluid,
  At as useFxBlending,
  Dt as useFxTexture,
  Ft as useHSV,
  _t as useMarble,
  Ot as useMorphParticles,
  Mt as useNoise,
  V as useParams,
  ee as usePointer,
  q as useResolution,
  bt as useRipple,
  Ut as useSimpleBlur,
  F as useSingleFBO,
  Vt as useWave,
  Lt as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
