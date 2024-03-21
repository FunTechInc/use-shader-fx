import * as t from "three";
import { BufferAttribute as ae } from "three";
import { useMemo as h, useEffect as F, useRef as D, useCallback as b, useLayoutEffect as J, useState as de } from "react";
var ge = `varying vec2 vUv;

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
const E = (e, u = !1) => {
  const a = u ? e.width * u : e.width, r = u ? e.height * u : e.height;
  return h(
    () => new t.Vector2(a, r),
    [a, r]
  );
}, i = (e, u, a) => {
  a !== void 0 && e.uniforms && e.uniforms[u] && a !== null && (e.uniforms[u].value = a);
}, I = (e, u, a, r) => {
  const n = h(() => new r(u, a), [u, a, r]);
  return F(() => {
    e && e.add(n);
  }, [e, n]), F(() => () => {
    e && e.remove(n), u.dispose(), a.dispose();
  }, [e, u, a, n]), n;
}, he = ({
  scene: e,
  size: u,
  dpr: a
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
      vertexShader: ge,
      fragmentShader: xe
    }),
    []
  ), c = E(u, a);
  F(() => {
    i(n, "uResolution", c.clone());
  }, [c, n]);
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, ye = (e, u) => {
  const a = u, r = e / u, [n, c] = [a * r / 2, a / 2];
  return { width: n, height: c, near: -1e3, far: 1e3 };
}, z = (e, u = "OrthographicCamera") => {
  const a = E(e), { width: r, height: n, near: c, far: m } = ye(
    a.x,
    a.y
  );
  return h(() => u === "OrthographicCamera" ? new t.OrthographicCamera(
    -r,
    r,
    n,
    -n,
    c,
    m
  ) : new t.PerspectiveCamera(50, r / n), [r, n, c, m, u]);
}, ee = (e = 0) => {
  const u = D(new t.Vector2(0, 0)), a = D(new t.Vector2(0, 0)), r = D(new t.Vector2(0, 0)), n = D(0), c = D(new t.Vector2(0, 0)), m = D(!1);
  return b(
    (s) => {
      const o = performance.now();
      let l;
      m.current && e ? (r.current = r.current.lerp(
        s,
        1 - e
      ), l = r.current.clone()) : (l = s.clone(), r.current = l), n.current === 0 && (n.current = o, u.current = l);
      const d = Math.max(1, o - n.current);
      n.current = o, c.current.copy(l).sub(u.current).divideScalar(d);
      const f = c.current.length() > 0, g = m.current ? u.current.clone() : l;
      return !m.current && f && (m.current = !0), u.current = l, {
        currentPointer: l,
        prevPointer: g,
        diffPointer: a.current.subVectors(l, g),
        velocity: c.current,
        isVelocityUpdate: f
      };
    },
    [e]
  );
}, V = (e) => {
  const a = D(
    ((n) => Object.values(n).some((c) => typeof c == "function"))(e) ? e : structuredClone(e)
  ), r = b((n) => {
    for (const c in n) {
      const m = c;
      m in a.current && n[m] !== void 0 && n[m] !== null ? a.current[m] = n[m] : console.error(
        `"${String(
          m
        )}" does not exist in the params. or "${String(
          m
        )}" is null | undefined`
      );
    }
  }, []);
  return [a.current, r];
}, Y = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, ne = ({
  gl: e,
  fbo: u,
  scene: a,
  camera: r,
  onBeforeRender: n,
  onSwap: c
}) => {
  e.setRenderTarget(u), n(), e.clear(), e.render(a, r), c && c(), e.setRenderTarget(null), e.clear();
}, A = ({
  scene: e,
  camera: u,
  size: a,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: c = 0,
  depthBuffer: m = !1,
  depthTexture: v = !1
}) => {
  const s = D(), o = E(a, r);
  s.current = h(
    () => {
      const d = new t.WebGLRenderTarget(
        o.x,
        o.y,
        {
          ...Y,
          samples: c,
          depthBuffer: m
        }
      );
      return v && (d.depthTexture = new t.DepthTexture(
        o.x,
        o.y,
        t.FloatType
      )), d;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), J(() => {
    var d;
    n && ((d = s.current) == null || d.setSize(o.x, o.y));
  }, [o, n]), F(() => {
    const d = s.current;
    return () => {
      d == null || d.dispose();
    };
  }, []);
  const l = b(
    (d, f) => {
      const g = s.current;
      return ne({
        gl: d,
        fbo: g,
        scene: e,
        camera: u,
        onBeforeRender: () => f && f({ read: g.texture })
      }), g.texture;
    },
    [e, u]
  );
  return [s.current, l];
}, G = ({
  scene: e,
  camera: u,
  size: a,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: c = 0,
  depthBuffer: m = !1,
  depthTexture: v = !1
}) => {
  const s = D({
    read: null,
    write: null,
    swap: function() {
      let f = this.read;
      this.read = this.write, this.write = f;
    }
  }), o = E(a, r), l = h(() => {
    const f = new t.WebGLRenderTarget(o.x, o.y, {
      ...Y,
      samples: c,
      depthBuffer: m
    }), g = new t.WebGLRenderTarget(o.x, o.y, {
      ...Y,
      samples: c,
      depthBuffer: m
    });
    return v && (f.depthTexture = new t.DepthTexture(
      o.x,
      o.y,
      t.FloatType
    ), g.depthTexture = new t.DepthTexture(
      o.x,
      o.y,
      t.FloatType
    )), { read: f, write: g };
  }, []);
  s.current.read = l.read, s.current.write = l.write, J(() => {
    var f, g;
    n && ((f = s.current.read) == null || f.setSize(o.x, o.y), (g = s.current.write) == null || g.setSize(o.x, o.y));
  }, [o, n]), F(() => {
    const f = s.current;
    return () => {
      var g, x;
      (g = f.read) == null || g.dispose(), (x = f.write) == null || x.dispose();
    };
  }, []);
  const d = b(
    (f, g) => {
      var p;
      const x = s.current;
      return ne({
        gl: f,
        scene: e,
        camera: u,
        fbo: x.write,
        onBeforeRender: () => g && g({
          read: x.read.texture,
          write: x.write.texture
        }),
        onSwap: () => x.swap()
      }), (p = x.read) == null ? void 0 : p.texture;
    },
    [e, u]
  );
  return [
    { read: s.current.read, write: s.current.write },
    d
  ];
}, we = Object.freeze({
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
}), ht = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = he({ scene: r, size: e, dpr: u }), m = z(e), v = ee(), [s, o] = G({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [l, d] = V(we), f = D(null);
  return [
    b(
      (x, p) => {
        const { gl: M, pointer: y } = x;
        p && d(p), l.texture ? (i(n, "uIsTexture", !0), i(n, "uTexture", l.texture)) : i(n, "uIsTexture", !1), l.map ? (i(n, "uIsMap", !0), i(n, "uMap", l.map), i(n, "uMapIntensity", l.mapIntensity)) : i(n, "uIsMap", !1), i(n, "uRadius", l.radius), i(n, "uSmudge", l.smudge), i(n, "uDissipation", l.dissipation), i(n, "uMotionBlur", l.motionBlur), i(n, "uMotionSample", l.motionSample);
        const w = l.pointerValues || v(y);
        w.isVelocityUpdate && (i(n, "uMouse", w.currentPointer), i(n, "uPrevMouse", w.prevPointer)), i(n, "uVelocity", w.velocity);
        const C = typeof l.color == "function" ? l.color(w.velocity) : l.color;
        return i(n, "uColor", C), i(n, "uIsCursor", l.isCursor), i(n, "uPressureEnd", l.pressure), f.current === null && (f.current = l.pressure), i(n, "uPressureStart", f.current), f.current = l.pressure, o(M, ({ read: T }) => {
          i(n, "uBuffer", T);
        });
      },
      [n, v, o, l, d]
    ),
    d,
    {
      scene: r,
      mesh: c,
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
}`, Me = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const be = () => h(
  () => new t.ShaderMaterial({
    vertexShader: q,
    fragmentShader: Me,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Se = `precision highp float;

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
const _e = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: q,
    fragmentShader: Se
  }),
  []
);
var Te = `precision highp float;

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
const Ce = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Te
  }),
  []
);
var Pe = `precision highp float;

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
const De = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Pe
  }),
  []
);
var Re = `precision highp float;

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
const Ae = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Re
  }),
  []
);
var Ie = `precision highp float;

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
const Fe = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: Ie
  }),
  []
);
var ze = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ve = () => h(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: q,
    fragmentShader: ze
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
const Be = () => h(
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
var Oe = `precision highp float;

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
const Le = () => h(
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
    fragmentShader: Oe
  }),
  []
), We = ({
  scene: e,
  size: u,
  dpr: a
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = be(), c = n.clone(), m = Ae(), v = Fe(), s = _e(), o = Ce(), l = De(), d = Ve(), f = Be(), g = Le(), x = h(
    () => ({
      vorticityMaterial: v,
      curlMaterial: m,
      advectionMaterial: s,
      divergenceMaterial: o,
      pressureMaterial: l,
      clearMaterial: d,
      gradientSubtractMaterial: f,
      splatMaterial: g
    }),
    [
      v,
      m,
      s,
      o,
      l,
      d,
      f,
      g
    ]
  ), p = E(u, a);
  F(() => {
    i(
      x.splatMaterial,
      "aspectRatio",
      p.x / p.y
    );
    for (const w of Object.values(x))
      i(
        w,
        "texelSize",
        new t.Vector2(1 / p.x, 1 / p.y)
      );
  }, [p, x]);
  const M = I(e, r, n, t.Mesh);
  F(() => {
    n.dispose(), M.material = c;
  }, [n, M, c]), F(() => () => {
    for (const w of Object.values(x))
      w.dispose();
  }, [x]);
  const y = b(
    (w) => {
      M.material = w, M.material.needsUpdate = !0;
    },
    [M]
  );
  return { materials: x, setMeshMaterial: y, mesh: M };
}, $e = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1),
  pointerValues: !1
}), yt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { materials: n, setMeshMaterial: c, mesh: m } = We({ scene: r, size: e, dpr: u }), v = z(e), s = ee(), o = h(
    () => ({
      scene: r,
      camera: v,
      size: e,
      samples: a
    }),
    [r, v, e, a]
  ), [l, d] = G(o), [f, g] = G(o), [x, p] = A(o), [M, y] = A(o), [w, C] = G(o), T = D(0), P = D(new t.Vector2(0, 0)), S = D(new t.Vector3(0, 0, 0)), [_, O] = V($e);
  return [
    b(
      (W, j) => {
        const { gl: L, pointer: H, clock: Q, size: te } = W;
        j && O(j), T.current === 0 && (T.current = Q.getElapsedTime());
        const re = Math.min(
          (Q.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = Q.getElapsedTime();
        const Z = d(L, ({ read: B }) => {
          c(n.advectionMaterial), i(n.advectionMaterial, "uVelocity", B), i(n.advectionMaterial, "uSource", B), i(n.advectionMaterial, "dt", re), i(
            n.advectionMaterial,
            "dissipation",
            _.velocity_dissipation
          );
        }), me = g(L, ({ read: B }) => {
          c(n.advectionMaterial), i(n.advectionMaterial, "uVelocity", Z), i(n.advectionMaterial, "uSource", B), i(
            n.advectionMaterial,
            "dissipation",
            _.density_dissipation
          );
        }), K = _.pointerValues || s(H);
        K.isVelocityUpdate && (d(L, ({ read: B }) => {
          c(n.splatMaterial), i(n.splatMaterial, "uTarget", B), i(
            n.splatMaterial,
            "point",
            K.currentPointer
          );
          const N = K.diffPointer.multiply(
            P.current.set(te.width, te.height).multiplyScalar(_.velocity_acceleration)
          );
          i(
            n.splatMaterial,
            "color",
            S.current.set(N.x, N.y, 1)
          ), i(
            n.splatMaterial,
            "radius",
            _.splat_radius
          );
        }), g(L, ({ read: B }) => {
          c(n.splatMaterial), i(n.splatMaterial, "uTarget", B);
          const N = typeof _.fluid_color == "function" ? _.fluid_color(K.velocity) : _.fluid_color;
          i(n.splatMaterial, "color", N);
        }));
        const fe = p(L, () => {
          c(n.curlMaterial), i(n.curlMaterial, "uVelocity", Z);
        });
        d(L, ({ read: B }) => {
          c(n.vorticityMaterial), i(n.vorticityMaterial, "uVelocity", B), i(n.vorticityMaterial, "uCurl", fe), i(
            n.vorticityMaterial,
            "curl",
            _.curl_strength
          ), i(n.vorticityMaterial, "dt", re);
        });
        const pe = y(L, () => {
          c(n.divergenceMaterial), i(n.divergenceMaterial, "uVelocity", Z);
        });
        C(L, ({ read: B }) => {
          c(n.clearMaterial), i(n.clearMaterial, "uTexture", B), i(
            n.clearMaterial,
            "value",
            _.pressure_dissipation
          );
        }), c(n.pressureMaterial), i(n.pressureMaterial, "uDivergence", pe);
        let oe;
        for (let B = 0; B < _.pressure_iterations; B++)
          oe = C(L, ({ read: N }) => {
            i(n.pressureMaterial, "uPressure", N);
          });
        return d(L, ({ read: B }) => {
          c(n.gradientSubtractMaterial), i(
            n.gradientSubtractMaterial,
            "uPressure",
            oe
          ), i(n.gradientSubtractMaterial, "uVelocity", B);
        }), me;
      },
      [
        n,
        c,
        p,
        g,
        y,
        s,
        C,
        d,
        O,
        _
      ]
    ),
    O,
    {
      scene: r,
      mesh: m,
      materials: n,
      camera: v,
      renderTarget: {
        velocity: l,
        density: f,
        curl: x,
        divergence: M,
        pressure: w
      },
      output: f.read.texture
    }
  ];
}, Ee = ({ scale: e, max: u, texture: a, scene: r }) => {
  const n = D([]), c = h(
    () => new t.PlaneGeometry(e, e),
    [e]
  ), m = h(
    () => new t.MeshBasicMaterial({
      map: a,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [a]
  );
  return F(() => {
    for (let v = 0; v < u; v++) {
      const s = new t.Mesh(c.clone(), m.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, r.add(s), n.current.push(s);
    }
  }, [c, m, r, u]), F(() => () => {
    n.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((s) => s.dispose()) : v.material.dispose(), r.remove(v);
    }), n.current = [];
  }, [r]), n.current;
}, qe = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), wt = ({
  texture: e = new t.Texture(),
  scale: u = 64,
  max: a = 100,
  size: r,
  dpr: n,
  samples: c = 0
}) => {
  const m = h(() => new t.Scene(), []), v = Ee({
    scale: u,
    max: a,
    texture: e,
    scene: m
  }), s = z(r), o = ee(), [l, d] = A({
    scene: m,
    camera: s,
    size: r,
    dpr: n,
    samples: c
  }), [f, g] = V(qe), x = D(0);
  return [
    b(
      (M, y) => {
        const { gl: w, pointer: C, size: T } = M;
        y && g(y);
        const P = f.pointerValues || o(C);
        if (f.frequency < P.diffPointer.length()) {
          const S = v[x.current];
          S.visible = !0, S.position.set(
            P.currentPointer.x * (T.width / 2),
            P.currentPointer.y * (T.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = f.alpha, x.current = (x.current + 1) % a;
        }
        return v.forEach((S) => {
          if (S.visible) {
            const _ = S.material;
            S.rotation.z += f.rotation, _.opacity *= f.fadeout_speed, S.scale.x = f.fadeout_speed * S.scale.x + f.scale, S.scale.y = S.scale.x, _.opacity < 2e-3 && (S.visible = !1);
          }
        }), d(w);
      },
      [d, v, o, a, f, g]
    ),
    g,
    {
      scene: m,
      camera: s,
      meshArr: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var je = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ne = `precision highp float;
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
const ke = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
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
      vertexShader: je,
      fragmentShader: Ne
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, Ge = Object.freeze({
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
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = ke(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(Ge);
  return [
    b(
      (f, g) => {
        const { gl: x, clock: p } = f;
        return g && l(g), i(n, "scale", o.scale), i(n, "timeStrength", o.timeStrength), i(n, "noiseOctaves", o.noiseOctaves), i(n, "fbmOctaves", o.fbmOctaves), i(n, "warpOctaves", o.warpOctaves), i(n, "warpDirection", o.warpDirection), i(n, "warpStrength", o.warpStrength), i(n, "uTime", o.beat || p.getElapsedTime()), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Ke = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xe = `precision highp float;
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
const Ye = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
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
      vertexShader: Ke,
      fragmentShader: Xe
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, He = Object.freeze({
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
}), bt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Ye(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(He);
  return [
    b(
      (f, g) => {
        const { gl: x, clock: p } = f;
        return g && l(g), o.texture ? (i(n, "uTexture", o.texture), i(n, "isTexture", !0)) : (i(n, "isTexture", !1), i(n, "scale", o.scale)), o.noise ? (i(n, "noise", o.noise), i(n, "isNoise", !0), i(n, "noiseStrength", o.noiseStrength)) : i(n, "isNoise", !1), i(n, "uTime", o.beat || p.getElapsedTime()), i(n, "laminateLayer", o.laminateLayer), i(n, "laminateInterval", o.laminateInterval), i(n, "laminateDetail", o.laminateDetail), i(n, "distortion", o.distortion), i(n, "colorFactor", o.colorFactor), i(n, "timeStrength", o.timeStrength), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Qe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ze = `precision highp float;

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
const Je = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
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
      vertexShader: Qe,
      fragmentShader: Ze
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, en = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), St = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Je(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(en);
  return [
    b(
      (f, g) => {
        const { gl: x, clock: p } = f;
        return g && l(g), i(n, "u_pattern", o.pattern), i(n, "u_complexity", o.complexity), i(
          n,
          "u_complexityAttenuation",
          o.complexityAttenuation
        ), i(n, "u_iterations", o.iterations), i(n, "u_timeStrength", o.timeStrength), i(n, "u_scale", o.scale), i(n, "u_time", o.beat || p.getElapsedTime()), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var nn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, tn = `precision highp float;
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
const rn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uRgbWeight: { value: new t.Vector3(0.299, 0.587, 0.114) },
        uColor1: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor2: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor3: { value: new t.Color().set(1, 1, 1) },
        uColor4: { value: new t.Color().set(0, 0.1, 0.2) }
      },
      vertexShader: nn,
      fragmentShader: tn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, on = Object.freeze({
  texture: new t.Texture(),
  color1: new t.Color().set(0.5, 0.5, 0.5),
  color2: new t.Color().set(0.5, 0.5, 0.5),
  color3: new t.Color().set(1, 1, 1),
  color4: new t.Color().set(0, 0.1, 0.2),
  rgbWeight: new t.Vector3(0.299, 0.587, 0.114)
}), _t = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = rn(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(on);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "uTexture", o.texture), i(n, "uColor1", o.color1), i(n, "uColor2", o.color2), i(n, "uColor3", o.color3), i(n, "uColor4", o.color4), i(n, "uRgbWeight", o.rgbWeight), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var an = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, un = `precision highp float;

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
const sn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: an,
      fragmentShader: un
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, ln = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Tt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = sn(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(ln);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "uTexture", o.texture), i(n, "uColor0", o.color0), i(n, "uColor1", o.color1), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var cn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, vn = `precision highp float;

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
const mn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
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
      vertexShader: cn,
      fragmentShader: vn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, fn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Ct = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = mn(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(fn);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "u_texture", o.texture), i(n, "u_map", o.map), i(n, "u_mapIntensity", o.mapIntensity), o.alphaMap ? (i(n, "u_alphaMap", o.alphaMap), i(n, "u_isAlphaMap", !0)) : i(n, "u_isAlphaMap", !1), i(n, "u_brightness", o.brightness), i(n, "u_min", o.min), i(n, "u_max", o.max), o.dodgeColor ? (i(n, "u_dodgeColor", o.dodgeColor), i(n, "u_isDodgeColor", !0)) : i(n, "u_isDodgeColor", !1), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var pn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, dn = `precision highp float;

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
const gn = ({
  scene: e,
  size: u,
  dpr: a
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
      fragmentShader: dn
    }),
    []
  ), c = E(u, a);
  F(() => {
    i(n, "uResolution", c.clone());
  }, [c, n]);
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
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
}, Pt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = gn({ scene: r, size: e, dpr: u }), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    dpr: u,
    size: e,
    samples: a,
    isSizeUpdate: !0
  }), [o, l] = V(xn);
  return [
    b(
      (f, g) => {
        var w, C, T, P, S, _, O, $;
        const { gl: x } = f;
        g && l(g), i(n, "uTexture0", o.texture0), i(n, "uTexture1", o.texture1), i(n, "progress", o.progress);
        const p = [
          ((C = (w = o.texture0) == null ? void 0 : w.image) == null ? void 0 : C.width) || 0,
          ((P = (T = o.texture0) == null ? void 0 : T.image) == null ? void 0 : P.height) || 0
        ], M = [
          ((_ = (S = o.texture1) == null ? void 0 : S.image) == null ? void 0 : _.width) || 0,
          (($ = (O = o.texture1) == null ? void 0 : O.image) == null ? void 0 : $.height) || 0
        ], y = p.map((W, j) => W + (M[j] - W) * o.progress);
        return i(n, "uTextureResolution", y), i(n, "padding", o.padding), i(n, "uMap", o.map), i(n, "mapIntensity", o.mapIntensity), i(n, "edgeIntensity", o.edgeIntensity), i(n, "epicenter", o.epicenter), i(n, "dirX", o.dir.x), i(n, "dirY", o.dir.y), s(x);
      },
      [s, n, o, l]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var hn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, yn = `precision highp float;

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
const wn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: hn,
      fragmentShader: yn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, Mn = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Dt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = wn(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(
    Mn
  );
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "u_texture", o.texture), i(n, "u_brightness", o.brightness), i(n, "u_min", o.min), i(n, "u_max", o.max), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var bn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Sn = `precision highp float;

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
const _n = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: bn,
      fragmentShader: Sn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, Tn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Rt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = _n(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(Tn);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "u_texture", o.texture), i(n, "u_map", o.map), i(n, "u_mapIntensity", o.mapIntensity), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Cn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Pn = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Dn = ({
  scene: e,
  size: u,
  dpr: a
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uMap: { value: new t.Texture() }
      },
      vertexShader: Cn,
      fragmentShader: Pn
    }),
    []
  ), c = I(e, r, n, t.Mesh);
  return { material: n, mesh: c };
}, Rn = {
  texture: new t.Texture(),
  map: new t.Texture()
}, At = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Dn({ scene: r, size: e, dpr: u }), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(Rn);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "uTexture", o.texture), i(n, "uMap", o.map), s(x);
      },
      [n, s, o, l]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var An = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, In = `precision highp float;

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
const Fn = ({
  scene: e,
  size: u,
  dpr: a
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: An,
      fragmentShader: In
    }),
    []
  ), c = I(e, r, n, t.Mesh);
  return { material: n, mesh: c };
}, zn = {
  texture: new t.Texture(),
  brightness: 1,
  saturation: 1
}, It = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Fn({ scene: r, size: e, dpr: u }), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(zn);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "u_texture", o.texture), i(n, "u_brightness", o.brightness), i(n, "u_saturation", o.saturation), s(x);
      },
      [n, s, o, l]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Vn = `varying vec2 vUv;

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
const Bn = ({
  scene: e,
  size: u,
  dpr: a
}) => {
  const r = h(() => new t.PlaneGeometry(2, 2), []), n = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uTextureResolution: { value: new t.Vector2() },
        uTexture: { value: new t.Texture() }
      },
      vertexShader: Vn,
      fragmentShader: Un
    }),
    []
  ), c = E(u, a);
  F(() => {
    i(n, "uResolution", c.clone());
  }, [c, n]);
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, On = {
  texture: new t.Texture()
}, Ft = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Bn({ scene: r, size: e, dpr: u }), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    dpr: u,
    size: e,
    samples: a,
    isSizeUpdate: !0
  }), [o, l] = V(On);
  return [
    b(
      (f, g) => {
        var p, M, y, w, C, T;
        const { gl: x } = f;
        return g && l(g), i(n, "uTexture", o.texture), i(n, "uTextureResolution", [
          ((y = (M = (p = o.texture) == null ? void 0 : p.source) == null ? void 0 : M.data) == null ? void 0 : y.width) || 0,
          ((T = (C = (w = o.texture) == null ? void 0 : w.source) == null ? void 0 : C.data) == null ? void 0 : T.height) || 0
        ]), s(x);
      },
      [s, n, o, l]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Ln = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Wn = `precision mediump float;

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
const $n = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: le.blurSize }
      },
      vertexShader: Ln,
      fragmentShader: Wn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, le = Object.freeze({
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}), zt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = $n(r), m = z(e), v = h(
    () => ({
      scene: r,
      camera: m,
      size: e,
      dpr: u,
      samples: a
    }),
    [r, m, e, u, a]
  ), [s, o] = A(v), [l, d] = G(v), [f, g] = V(le);
  return [
    b(
      (p, M) => {
        var T, P, S, _, O, $;
        const { gl: y } = p;
        M && g(M), i(n, "uTexture", f.texture), i(n, "uResolution", [
          ((S = (P = (T = f.texture) == null ? void 0 : T.source) == null ? void 0 : P.data) == null ? void 0 : S.width) || 0,
          (($ = (O = (_ = f.texture) == null ? void 0 : _.source) == null ? void 0 : O.data) == null ? void 0 : $.height) || 0
        ]), i(n, "uBlurSize", f.blurSize);
        let w = d(y);
        const C = f.blurPower;
        for (let W = 0; W < C; W++)
          i(n, "uTexture", w), w = d(y);
        return o(y);
      },
      [o, d, n, g, f]
    ),
    g,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: s,
      output: s.texture
    }
  ];
};
var En = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, qn = `precision highp float;

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
const jn = (e) => {
  const u = h(() => new t.PlaneGeometry(2, 2), []), a = h(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: k.epicenter },
        uProgress: { value: k.progress },
        uStrength: { value: k.strength },
        uWidth: { value: k.width },
        uMode: { value: 0 }
      },
      vertexShader: En,
      fragmentShader: qn
    }),
    []
  ), r = I(e, u, a, t.Mesh);
  return { material: a, mesh: r };
}, k = Object.freeze({
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), Vt = ({
  size: e,
  dpr: u,
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = jn(r), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a,
    isSizeUpdate: !0
  }), [o, l] = V(k);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "uEpicenter", o.epicenter), i(n, "uProgress", o.progress), i(n, "uWidth", o.width), i(n, "uStrength", o.strength), i(
          n,
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Nn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, kn = `precision highp float;
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
const Gn = ({
  scene: e,
  size: u,
  dpr: a
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
      vertexShader: Nn,
      fragmentShader: kn
    }),
    []
  ), c = E(u, a);
  F(() => {
    i(n, "u_resolution", c.clone());
  }, [c, n]);
  const m = I(e, r, n, t.Mesh);
  return { material: n, mesh: m };
}, Kn = Object.freeze({
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
  samples: a = 0
}) => {
  const r = h(() => new t.Scene(), []), { material: n, mesh: c } = Gn({ scene: r, size: e, dpr: u }), m = z(e), [v, s] = A({
    scene: r,
    camera: m,
    size: e,
    dpr: u,
    samples: a
  }), [o, l] = V(Kn);
  return [
    b(
      (f, g) => {
        const { gl: x } = f;
        return g && l(g), i(n, "u_texture", o.texture), i(n, "u_keyColor", o.keyColor), i(n, "u_similarity", o.similarity), i(n, "u_smoothness", o.smoothness), i(n, "u_spill", o.spill), i(n, "u_color", o.color), i(n, "u_contrast", o.contrast), i(n, "u_brightness", o.brightness), i(n, "u_gamma", o.gamma), s(x);
      },
      [s, n, l, o]
    ),
    l,
    {
      scene: r,
      mesh: c,
      material: n,
      camera: m,
      renderTarget: v,
      output: v.texture
    }
  ];
}, Xn = ({
  scene: e,
  geometry: u,
  material: a
}) => {
  const r = I(e, u, a, t.Points), n = I(
    e,
    h(() => u.clone(), [u]),
    h(() => a.clone(), [a]),
    t.Mesh
  );
  return n.visible = !1, {
    points: r,
    interactiveMesh: n
  };
};
var Yn = `uniform vec2 uResolution;
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
}`, Hn = `precision highp float;
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
const ve = process.env.NODE_ENV === "development", ie = (e, u, a, r, n) => {
  var l;
  const c = a === "position" ? "positionTarget" : "uvTarget", m = a === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", v = a === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", s = a === "position" ? "positionsList" : "uvsList", o = a === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    u.deleteAttribute(a), u.setAttribute(
      a,
      new t.BufferAttribute(e[0], n)
    );
    let d = "", f = "";
    e.forEach((g, x) => {
      u.setAttribute(
        `${c}${x}`,
        new t.BufferAttribute(g, n)
      ), d += `attribute vec${n} ${c}${x};
`, x === 0 ? f += `${c}${x}` : f += `,${c}${x}`;
    }), r = r.replace(
      `${m}`,
      d
    ), r = r.replace(
      `${v}`,
      `vec${n} ${s}[${e.length}] = vec${n}[](${f});
				${o}
			`
    );
  } else
    r = r.replace(`${m}`, ""), r = r.replace(`${v}`, ""), (l = u == null ? void 0 : u.attributes[a]) != null && l.array || ve && console.error(
      `use-shader-fx:geometry.attributes.${a}.array is not found`
    );
  return r;
}, ue = (e, u, a, r) => {
  var c;
  let n = [];
  if (e && e.length > 0) {
    (c = u == null ? void 0 : u.attributes[a]) != null && c.array ? n = [
      u.attributes[a].array,
      ...e
    ] : n = e;
    const m = Math.max(...n.map((v) => v.length));
    n.forEach((v, s) => {
      if (v.length < m) {
        const o = (m - v.length) / r, l = [], d = Array.from(v);
        for (let f = 0; f < o; f++) {
          const g = Math.floor(v.length / r * Math.random()) * r;
          for (let x = 0; x < r; x++)
            l.push(d[g + x]);
        }
        n[s] = new Float32Array([...d, ...l]);
      }
    });
  }
  return n;
}, Qn = (e, u) => {
  let a = "";
  const r = {};
  let n = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((m, v) => {
    const s = `vMapArrayIndex < ${v}.1`, o = `texture2D(uMapArray${v}, uv)`;
    n += `( ${s} ) ? ${o} : `, a += `
        uniform sampler2D uMapArray${v};
      `, r[`uMapArray${v}`] = { value: m };
  }), n += "vec4(1.);", a += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (n += "vec4(1.0);", a += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: u.replace("#usf <mapArraySwitcher>", n).replace("#usf <mapArrayUniforms>", a), mapArrayUniforms: r };
}, Zn = ({
  size: e,
  dpr: u,
  geometry: a,
  positions: r,
  uvs: n,
  mapArray: c
}) => {
  const m = h(
    () => ue(r, a, "position", 3),
    [r, a]
  ), v = h(
    () => ue(n, a, "uv", 2),
    [n, a]
  ), s = h(() => {
    m.length !== v.length && ve && console.log("use-shader-fx:positions and uvs are not matched");
    const l = ie(
      v,
      a,
      "uv",
      ie(
        m,
        a,
        "position",
        Yn,
        3
      ),
      2
    ).replace("#usf <getWobble>", ce), d = Qn(c, Hn);
    return console.log(d.rewritedFragmentShader), new t.ShaderMaterial({
      vertexShader: l,
      fragmentShader: d.rewritedFragmentShader,
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
        ...d.mapArrayUniforms
      }
    });
  }, [
    a,
    m,
    v,
    c
  ]), o = E(e, u);
  return F(() => {
    i(s, "uResolution", o.clone());
  }, [o, s]), { material: s, modifiedPositions: m, modifiedUvs: v };
}, Jn = ({
  size: e,
  dpr: u,
  scene: a = !1,
  geometry: r,
  positions: n,
  uvs: c,
  mapArray: m
}) => {
  const v = h(() => {
    const x = r || new t.SphereGeometry(1, 32, 32);
    return x.setIndex(null), x.deleteAttribute("normal"), x;
  }, [r]), { material: s, modifiedPositions: o, modifiedUvs: l } = Zn({
    size: e,
    dpr: u,
    geometry: v,
    positions: n,
    uvs: c,
    mapArray: m
  }), { points: d, interactiveMesh: f } = Xn({
    scene: a,
    geometry: v,
    material: s
  });
  return [
    b(
      (x, p) => {
        x && i(
          s,
          "uTime",
          (p == null ? void 0 : p.beat) || x.clock.getElapsedTime()
        ), p !== void 0 && (i(s, "uMorphProgress", p.morphProgress), i(s, "uBlurAlpha", p.blurAlpha), i(s, "uBlurRadius", p.blurRadius), i(s, "uPointSize", p.pointSize), i(s, "uPointAlpha", p.pointAlpha), p.picture ? (i(s, "uPicture", p.picture), i(s, "uIsPicture", !0)) : p.picture === !1 && i(s, "uIsPicture", !1), p.alphaPicture ? (i(s, "uAlphaPicture", p.alphaPicture), i(s, "uIsAlphaPicture", !0)) : p.alphaPicture === !1 && i(s, "uIsAlphaPicture", !1), i(s, "uColor0", p.color0), i(s, "uColor1", p.color1), i(s, "uColor2", p.color2), i(s, "uColor3", p.color3), p.map ? (i(s, "uMap", p.map), i(s, "uIsMap", !0)) : p.map === !1 && i(s, "uIsMap", !1), p.alphaMap ? (i(s, "uAlphaMap", p.alphaMap), i(s, "uIsAlphaMap", !0)) : p.alphaMap === !1 && i(s, "uIsAlphaMap", !1), i(s, "uWobbleStrength", p.wobbleStrength), i(
          s,
          "uWobblePositionFrequency",
          p.wobblePositionFrequency
        ), i(
          s,
          "uWobbleTimeFrequency",
          p.wobbleTimeFrequency
        ), i(s, "uWarpStrength", p.warpStrength), i(
          s,
          "uWarpPositionFrequency",
          p.warpPositionFrequency
        ), i(s, "uWarpTimeFrequency", p.warpTimeFrequency), p.displacement ? (i(s, "uDisplacement", p.displacement), i(s, "uIsDisplacement", !0)) : p.displacement === !1 && i(s, "uIsDisplacement", !1), i(
          s,
          "uDisplacementIntensity",
          p.displacementIntensity
        ), i(
          s,
          "uDisplacementColorIntensity",
          p.displacementColorIntensity
        ), i(
          s,
          "uSizeRandomIntensity",
          p.sizeRandomIntensity
        ), i(
          s,
          "uSizeRandomTimeFrequency",
          p.sizeRandomTimeFrequency
        ), i(s, "uSizeRandomMin", p.sizeRandomMin), i(s, "uSizeRandomMax", p.sizeRandomMax), i(s, "uDivergence", p.divergence), i(s, "uDivergencePoint", p.divergencePoint));
      },
      [s]
    ),
    {
      points: d,
      interactiveMesh: f,
      positions: o,
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
}), Bt = ({
  size: e,
  dpr: u,
  samples: a = 0,
  camera: r,
  geometry: n,
  positions: c,
  uvs: m
}) => {
  const v = h(() => new t.Scene(), []), [
    s,
    {
      points: o,
      interactiveMesh: l,
      positions: d,
      uvs: f
    }
  ] = Jn({ scene: v, size: e, dpr: u, geometry: n, positions: c, uvs: m }), [g, x] = A({
    scene: v,
    camera: r,
    size: e,
    dpr: u,
    samples: a,
    depthBuffer: !0
  }), p = b(
    (y, w) => (s(y, w), x(y.gl)),
    [x, s]
  ), M = b(
    (y) => {
      s(null, y);
    },
    [s]
  );
  return [
    p,
    M,
    {
      scene: v,
      points: o,
      interactiveMesh: l,
      renderTarget: g,
      output: g.texture,
      positions: d,
      uvs: f
    }
  ];
};
function et(e, u = 1e-4) {
  u = Math.max(u, Number.EPSILON);
  const a = {}, r = e.getIndex(), n = e.getAttribute("position"), c = r ? r.count : n.count;
  let m = 0;
  const v = Object.keys(e.attributes), s = {}, o = {}, l = [], d = ["getX", "getY", "getZ", "getW"];
  for (let p = 0, M = v.length; p < M; p++) {
    const y = v[p];
    s[y] = [];
    const w = e.morphAttributes[y];
    w && (o[y] = new Array(w.length).fill(0).map(() => []));
  }
  const f = Math.log10(1 / u), g = Math.pow(10, f);
  for (let p = 0; p < c; p++) {
    const M = r ? r.getX(p) : p;
    let y = "";
    for (let w = 0, C = v.length; w < C; w++) {
      const T = v[w], P = e.getAttribute(T), S = P.itemSize;
      for (let _ = 0; _ < S; _++)
        y += `${~~(P[d[_]](M) * g)},`;
    }
    if (y in a)
      l.push(a[y]);
    else {
      for (let w = 0, C = v.length; w < C; w++) {
        const T = v[w], P = e.getAttribute(T), S = e.morphAttributes[T], _ = P.itemSize, O = s[T], $ = o[T];
        for (let W = 0; W < _; W++) {
          const j = d[W];
          if (O.push(P[j](M)), S)
            for (let L = 0, H = S.length; L < H; L++)
              $[L].push(S[L][j](M));
        }
      }
      a[y] = m, l.push(m), m++;
    }
  }
  const x = e.clone();
  for (let p = 0, M = v.length; p < M; p++) {
    const y = v[p], w = e.getAttribute(y), C = new w.array.constructor(s[y]), T = new ae(C, w.itemSize, w.normalized);
    if (x.setAttribute(y, T), y in o)
      for (let P = 0; P < o[y].length; P++) {
        const S = e.morphAttributes[y][P], _ = new S.array.constructor(o[y][P]), O = new ae(_, S.itemSize, S.normalized);
        x.morphAttributes[y][P] = O;
      }
  }
  return x.setIndex(l), x;
}
var nt = `vec3 random3(vec3 c) {
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
}`, tt = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, rt = `#ifdef USE_TRANSMISSION

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
}, ot = ({
  baseMaterial: e,
  materialParameters: u
}) => {
  const { material: a, depthMaterial: r } = h(() => {
    const n = new (e || t.MeshPhysicalMaterial)(
      u || {}
    ), c = n.type === "MeshPhysicalMaterial" || n.type === "MeshStandardMaterial", m = n.type === "MeshPhysicalMaterial";
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
      Object.assign(s.uniforms, n.userData.uniforms), s.vertexShader = se(s.vertexShader), s.fragmentShader = s.fragmentShader.replace(
        "#include <color_fragment>",
        `
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
      ), c && (s.fragmentShader = s.fragmentShader.replace(
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
				${nt}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${c ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${c ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), m && (s.fragmentShader = s.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${tt}`
      ), s.fragmentShader = s.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${rt}`
      ));
    }, n.needsUpdate = !0;
    const v = new t.MeshDepthMaterial({
      depthPacking: t.RGBADepthPacking
    });
    return v.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, n.userData.uniforms), s.vertexShader = se(s.vertexShader);
    }, v.needsUpdate = !0, { material: n, depthMaterial: v };
  }, [u, e]);
  return {
    material: a,
    depthMaterial: r
  };
}, at = ({
  scene: e = !1,
  geometry: u,
  baseMaterial: a,
  materialParameters: r
}) => {
  const n = h(() => {
    let o = u || new t.IcosahedronGeometry(2, 50);
    return o = et(o), o.computeTangents(), o;
  }, [u]), { material: c, depthMaterial: m } = ot({
    baseMaterial: a,
    materialParameters: r
  }), v = I(e, n, c, t.Mesh);
  return [
    b(
      (o, l) => {
        const d = c.userData;
        o && i(
          d,
          "uTime",
          (l == null ? void 0 : l.beat) || o.clock.getElapsedTime()
        ), l !== void 0 && (i(d, "uWobbleStrength", l.wobbleStrength), i(
          d,
          "uWobblePositionFrequency",
          l.wobblePositionFrequency
        ), i(
          d,
          "uWobbleTimeFrequency",
          l.wobbleTimeFrequency
        ), i(d, "uWarpStrength", l.warpStrength), i(
          d,
          "uWarpPositionFrequency",
          l.warpPositionFrequency
        ), i(d, "uWarpTimeFrequency", l.warpTimeFrequency), i(d, "uWobbleShine", l.wobbleShine), i(d, "uSamples", l.samples), i(d, "uColor0", l.color0), i(d, "uColor1", l.color1), i(d, "uColor2", l.color2), i(d, "uColor3", l.color3), i(d, "uColorMix", l.colorMix), i(
          d,
          "uChromaticAberration",
          l.chromaticAberration
        ), i(d, "uAnisotropicBlur", l.anisotropicBlur), i(d, "uDistortion", l.distortion), i(d, "uDistortionScale", l.distortionScale), i(d, "uTemporalDistortion", l.temporalDistortion));
      },
      [c]
    ),
    {
      mesh: v,
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
}), Ot = ({
  size: e,
  dpr: u,
  samples: a = 0,
  camera: r,
  geometry: n,
  baseMaterial: c,
  materialParameters: m
}) => {
  const v = h(() => new t.Scene(), []), [s, { mesh: o, depthMaterial: l }] = at({
    baseMaterial: c,
    materialParameters: m,
    scene: v,
    geometry: n
  }), [d, f] = A({
    scene: v,
    camera: r,
    size: e,
    dpr: u,
    samples: a,
    depthBuffer: !0
  }), g = b(
    (p, M) => (s(p, M), f(p.gl)),
    [f, s]
  ), x = b(
    (p) => {
      s(null, p);
    },
    [s]
  );
  return [
    g,
    x,
    {
      scene: v,
      mesh: o,
      depthMaterial: l,
      renderTarget: d,
      output: d.texture
    }
  ];
}, Lt = (e, u, a) => {
  const r = h(
    () => new t.Mesh(u, a),
    [u, a]
  );
  return F(() => {
    e.add(r);
  }, [e, r]), F(() => () => {
    e.remove(r), u.dispose(), a.dispose();
  }, [e, u, a, r]), r;
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
    const a = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((a + 1) * 2 * e - a) / 2 : (Math.pow(2 * e - 2, 2) * ((a + 1) * (e * 2 - 2) + a) + 2) / 2;
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
function it(e) {
  let u = Math.sin(e * 12.9898) * 43758.5453;
  return u - Math.floor(u);
}
const Wt = (e, u = "easeOutQuart") => {
  const a = e / 60, r = X[u];
  return b(
    (c) => {
      let m = c.getElapsedTime() * a;
      const v = Math.floor(m), s = r(m - v);
      m = s + v;
      const o = it(v);
      return {
        beat: m,
        floor: v,
        fract: s,
        hash: o
      };
    },
    [a, r]
  );
}, $t = (e = 60) => {
  const u = h(() => 1 / Math.max(Math.min(e, 60), 1), [e]), a = D(null);
  return b(
    (n) => {
      const c = n.getElapsedTime();
      return a.current === null || c - a.current >= u ? (a.current = c, !0) : !1;
    },
    [u]
  );
}, ut = (e) => {
  var r, n;
  const u = (r = e.dom) == null ? void 0 : r.length, a = (n = e.texture) == null ? void 0 : n.length;
  return !u || !a || u !== a;
};
var st = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, lt = `precision highp float;

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
const ct = ({
  params: e,
  size: u,
  scene: a
}) => {
  a.children.length > 0 && (a.children.forEach((r) => {
    r instanceof t.Mesh && (r.geometry.dispose(), r.material.dispose());
  }), a.remove(...a.children)), e.texture.forEach((r, n) => {
    const c = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: st,
        fragmentShader: lt,
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
    a.add(c);
  });
}, vt = () => {
  const e = D([]), u = D([]);
  return b(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: n,
      params: c
    }) => {
      e.current.length > 0 && e.current.forEach((v, s) => {
        v.unobserve(u.current[s]);
      }), u.current = [], e.current = [];
      const m = new Array(c.dom.length).fill(!1);
      r.current = [...m], n.current = [...m], c.dom.forEach((v, s) => {
        const o = (d) => {
          d.forEach((f) => {
            c.onIntersect[s] && c.onIntersect[s](f), r.current[s] = f.isIntersecting;
          });
        }, l = new IntersectionObserver(o, {
          rootMargin: "0px",
          threshold: 0
        });
        l.observe(v), e.current.push(l), u.current.push(v);
      });
    },
    []
  );
}, mt = () => {
  const e = D([]), u = b(
    ({ params: a, size: r, resolutionRef: n, scene: c, isIntersectingRef: m }) => {
      c.children.length !== e.current.length && (e.current = new Array(c.children.length)), c.children.forEach((v, s) => {
        var d, f, g, x, p, M;
        const o = a.dom[s];
        if (!o)
          return;
        const l = o.getBoundingClientRect();
        if (e.current[s] = l, v.scale.set(l.width, l.height, 1), v.position.set(
          l.left + l.width * 0.5 - r.width * 0.5,
          -l.top - l.height * 0.5 + r.height * 0.5,
          0
        ), m.current[s] && (a.rotation[s] && v.rotation.copy(a.rotation[s]), v instanceof t.Mesh)) {
          const y = v.material;
          i(y, "u_texture", a.texture[s]), i(y, "u_textureResolution", [
            ((g = (f = (d = a.texture[s]) == null ? void 0 : d.source) == null ? void 0 : f.data) == null ? void 0 : g.width) || 0,
            ((M = (p = (x = a.texture[s]) == null ? void 0 : x.source) == null ? void 0 : p.data) == null ? void 0 : M.height) || 0
          ]), i(
            y,
            "u_resolution",
            n.current.set(l.width, l.height)
          ), i(
            y,
            "u_borderRadius",
            a.boderRadius[s] ? a.boderRadius[s] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, u];
}, ft = () => {
  const e = D([]), u = D([]), a = b((r, n = !1) => {
    e.current.forEach((m, v) => {
      m && (u.current[v] = !0);
    });
    const c = n ? [...u.current] : [...e.current];
    return r < 0 ? c : c[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: u,
    isIntersecting: a
  };
}, pt = (e) => ({ onView: a, onHidden: r }) => {
  const n = D(!1);
  F(() => {
    let c;
    const m = () => {
      e.current.some((v) => v) ? n.current || (a && a(), n.current = !0) : n.current && (r && r(), n.current = !1), c = requestAnimationFrame(m);
    };
    return c = requestAnimationFrame(m), () => {
      cancelAnimationFrame(c);
    };
  }, [a, r]);
}, dt = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Et = ({ size: e, dpr: u, samples: a = 0 }, r = []) => {
  const n = h(() => new t.Scene(), []), c = z(e), [m, v] = A({
    scene: n,
    camera: c,
    size: e,
    dpr: u,
    samples: a,
    isSizeUpdate: !0
  }), [s, o] = V({
    ...dt,
    updateKey: performance.now()
  }), [l, d] = mt(), f = D(new t.Vector2(0, 0)), [g, x] = de(!0);
  F(() => {
    x(!0);
  }, r);
  const p = D(null), M = h(() => new t.Texture(), []), y = vt(), { isIntersectingOnceRef: w, isIntersectingRef: C, isIntersecting: T } = ft(), P = pt(C);
  return [
    b(
      (_, O) => {
        const { gl: $, size: W } = _;
        if (O && o(O), ut(s))
          return M;
        if (g) {
          if (p.current === s.updateKey)
            return M;
          p.current = s.updateKey;
        }
        return g && (ct({
          params: s,
          size: W,
          scene: n
        }), y({
          isIntersectingRef: C,
          isIntersectingOnceRef: w,
          params: s
        }), x(!1)), d({
          params: s,
          size: W,
          resolutionRef: f,
          scene: n,
          isIntersectingRef: C
        }), v($);
      },
      [
        v,
        o,
        y,
        d,
        g,
        n,
        s,
        w,
        C,
        M
      ]
    ),
    o,
    {
      scene: n,
      camera: c,
      renderTarget: m,
      output: m.texture,
      isIntersecting: T,
      DOMRects: l,
      intersections: C.current,
      useDomView: P
    }
  ];
}, qt = ({
  scene: e,
  camera: u,
  size: a,
  dpr: r = !1,
  isSizeUpdate: n = !1,
  samples: c = 0,
  depthBuffer: m = !1,
  depthTexture: v = !1
}, s) => {
  const o = D([]), l = E(a, r);
  o.current = h(() => Array.from({ length: s }, () => {
    const f = new t.WebGLRenderTarget(
      l.x,
      l.y,
      {
        ...Y,
        samples: c,
        depthBuffer: m
      }
    );
    return v && (f.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), f;
  }), [s]), J(() => {
    n && o.current.forEach(
      (f) => f.setSize(l.x, l.y)
    );
  }, [l, n]), F(() => {
    const f = o.current;
    return () => {
      f.forEach((g) => g.dispose());
    };
  }, [s]);
  const d = b(
    (f, g, x) => {
      const p = o.current[g];
      return ne({
        gl: f,
        scene: e,
        camera: u,
        fbo: p,
        onBeforeRender: () => x && x({ read: p.texture })
      }), p.texture;
    },
    [e, u]
  );
  return [o.current, d];
};
export {
  Rn as ALPHABLENDING_PARAMS,
  fn as BLENDING_PARAMS,
  Mn as BRIGHTNESSPICKER_PARAMS,
  we as BRUSH_PARAMS,
  Kn as CHROMAKEY_PARAMS,
  He as COLORSTRATA_PARAMS,
  on as COSPALETTE_PARAMS,
  On as COVERTEXTURE_PARAMS,
  dt as DOMSYNCER_PARAMS,
  ln as DUOTONE_PARAMS,
  X as Easing,
  Y as FBO_OPTION,
  $e as FLUID_PARAMS,
  Tn as FXBLENDING_PARAMS,
  xn as FXTEXTURE_PARAMS,
  zn as HSV_PARAMS,
  en as MARBLE_PARAMS,
  R as MORPHPARTICLES_PARAMS,
  Ge as NOISE_PARAMS,
  qe as RIPPLE_PARAMS,
  le as SIMPLEBLUR_PARAMS,
  k as WAVE_PARAMS,
  U as WOBBLE3D_PARAMS,
  ne as renderFBO,
  i as setUniform,
  Lt as useAddMesh,
  At as useAlphaBlending,
  Wt as useBeat,
  Ct as useBlending,
  Dt as useBrightnessPicker,
  ht as useBrush,
  z as useCamera,
  Ut as useChromaKey,
  bt as useColorStrata,
  qt as useCopyTexture,
  _t as useCosPalette,
  Ft as useCoverTexture,
  Jn as useCreateMorphParticles,
  at as useCreateWobble3D,
  Et as useDomSyncer,
  G as useDoubleFBO,
  Tt as useDuoTone,
  $t as useFPSLimiter,
  yt as useFluid,
  Rt as useFxBlending,
  Pt as useFxTexture,
  It as useHSV,
  St as useMarble,
  Bt as useMorphParticles,
  Mt as useNoise,
  V as useParams,
  ee as usePointer,
  E as useResolution,
  wt as useRipple,
  zt as useSimpleBlur,
  A as useSingleFBO,
  Vt as useWave,
  Ot as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
