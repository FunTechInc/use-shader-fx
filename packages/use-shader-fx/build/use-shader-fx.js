import * as t from "three";
import { BufferAttribute as ue } from "three";
import { useMemo as x, useEffect as j, useRef as R, useCallback as M, useState as xe } from "react";
var ye = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, be = `precision highp float;

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
const q = (e, a = !1) => {
  const r = a ? e.width * a : e.width, u = a ? e.height * a : e.height;
  return x(
    () => new t.Vector2(r, u),
    [r, u]
  );
}, o = (e, a, r) => {
  r !== void 0 && e.uniforms && e.uniforms[a] && r !== null && (e.uniforms[a].value = r);
}, z = (e, a, r, u) => {
  const s = x(() => {
    const c = new u(a, r);
    return e && e.add(c), c;
  }, [a, r, u, e]);
  return j(() => () => {
    e && e.remove(s), a.dispose(), r.dispose();
  }, [e, a, r, s]), s;
}, we = ({
  scene: e,
  size: a,
  dpr: r
}) => {
  const u = x(() => new t.PlaneGeometry(2, 2), []), s = x(
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
      vertexShader: ye,
      fragmentShader: be
    }),
    []
  ), c = q(a, r);
  o(s, "uResolution", c.clone());
  const n = z(e, u, s, t.Mesh);
  return { material: s, mesh: n };
}, Me = (e, a) => {
  const r = a, u = e / a, [s, c] = [r * u / 2, r / 2];
  return { width: s, height: c, near: -1e3, far: 1e3 };
}, U = (e, a = "OrthographicCamera") => {
  const r = q(e), { width: u, height: s, near: c, far: n } = Me(
    r.x,
    r.y
  );
  return x(() => a === "OrthographicCamera" ? new t.OrthographicCamera(
    -u,
    u,
    s,
    -s,
    c,
    n
  ) : new t.PerspectiveCamera(50, u / s), [u, s, c, n, a]);
}, te = (e = 0) => {
  const a = R(new t.Vector2(0, 0)), r = R(new t.Vector2(0, 0)), u = R(new t.Vector2(0, 0)), s = R(0), c = R(new t.Vector2(0, 0)), n = R(!1);
  return M(
    (v) => {
      const l = performance.now();
      let m;
      n.current && e ? (u.current = u.current.lerp(
        v,
        1 - e
      ), m = u.current.clone()) : (m = v.clone(), u.current = m), s.current === 0 && (s.current = l, a.current = m);
      const i = Math.max(1, l - s.current);
      s.current = l, c.current.copy(m).sub(a.current).divideScalar(i);
      const p = c.current.length() > 0, y = n.current ? a.current.clone() : m;
      return !n.current && p && (n.current = !0), a.current = m, {
        currentPointer: m,
        prevPointer: y,
        diffPointer: r.current.subVectors(m, y),
        velocity: c.current,
        isVelocityUpdate: p
      };
    },
    [e]
  );
}, B = (e) => {
  const r = R(
    ((s) => Object.values(s).some((c) => typeof c == "function"))(e) ? e : structuredClone(e)
  ), u = M((s) => {
    for (const c in s) {
      const n = c;
      n in r.current && s[n] !== void 0 && s[n] !== null ? r.current[n] = s[n] : console.error(
        `"${String(
          n
        )}" does not exist in the params. or "${String(
          n
        )}" is null | undefined`
      );
    }
  }, []);
  return [r.current, u];
}, J = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, re = ({
  gl: e,
  fbo: a,
  scene: r,
  camera: u,
  onBeforeRender: s,
  onSwap: c
}) => {
  e.setRenderTarget(a), s(), e.clear(), e.render(r, u), c && c(), e.setRenderTarget(null), e.clear();
}, V = ({
  scene: e,
  camera: a,
  size: r,
  dpr: u = !1,
  isSizeUpdate: s = !1,
  samples: c = 0,
  depthBuffer: n = !1,
  depthTexture: f = !1
}) => {
  var i;
  const v = R(), l = q(r, u);
  v.current = x(
    () => {
      const p = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...J,
          samples: c,
          depthBuffer: n
        }
      );
      return f && (p.depthTexture = new t.DepthTexture(
        l.x,
        l.y,
        t.FloatType
      )), p;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), s && ((i = v.current) == null || i.setSize(l.x, l.y)), j(() => {
    const p = v.current;
    return () => {
      p == null || p.dispose();
    };
  }, []);
  const m = M(
    (p, y) => {
      const h = v.current;
      return re({
        gl: p,
        fbo: h,
        scene: e,
        camera: a,
        onBeforeRender: () => y && y({ read: h.texture })
      }), h.texture;
    },
    [e, a]
  );
  return [v.current, m];
}, X = ({
  scene: e,
  camera: a,
  size: r,
  dpr: u = !1,
  isSizeUpdate: s = !1,
  samples: c = 0,
  depthBuffer: n = !1,
  depthTexture: f = !1
}) => {
  var p, y;
  const v = R({
    read: null,
    write: null,
    swap: function() {
      let h = this.read;
      this.read = this.write, this.write = h;
    }
  }), l = q(r, u), m = x(() => {
    const h = new t.WebGLRenderTarget(l.x, l.y, {
      ...J,
      samples: c,
      depthBuffer: n
    }), g = new t.WebGLRenderTarget(l.x, l.y, {
      ...J,
      samples: c,
      depthBuffer: n
    });
    return f && (h.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    ), g.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), { read: h, write: g };
  }, []);
  v.current.read = m.read, v.current.write = m.write, s && ((p = v.current.read) == null || p.setSize(l.x, l.y), (y = v.current.write) == null || y.setSize(l.x, l.y)), j(() => {
    const h = v.current;
    return () => {
      var g, d;
      (g = h.read) == null || g.dispose(), (d = h.write) == null || d.dispose();
    };
  }, []);
  const i = M(
    (h, g) => {
      var b;
      const d = v.current;
      return re({
        gl: h,
        scene: e,
        camera: a,
        fbo: d.write,
        onBeforeRender: () => g && g({
          read: d.read.texture,
          write: d.write.texture
        }),
        onSwap: () => d.swap()
      }), (b = d.read) == null ? void 0 : b.texture;
    },
    [e, a]
  );
  return [
    { read: v.current.read, write: v.current.write },
    i
  ];
}, I = (e) => {
  var a, r;
  return typeof e == "number" ? { shader: e, fbo: e } : {
    shader: (((a = e.effect) == null ? void 0 : a.shader) ?? !0) && e.dpr,
    fbo: (((r = e.effect) == null ? void 0 : r.fbo) ?? !0) && e.dpr
  };
}, Se = Object.freeze({
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
}), _t = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = we({ scene: c, size: e, dpr: s.shader }), v = U(e), l = te(), [m, i] = X({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [p, y] = B(Se), h = R(null);
  return [
    M(
      (d, b) => {
        const { gl: w, pointer: C } = d;
        b && y(b), p.texture ? (o(n, "uIsTexture", !0), o(n, "uTexture", p.texture)) : o(n, "uIsTexture", !1), p.map ? (o(n, "uIsMap", !0), o(n, "uMap", p.map), o(n, "uMapIntensity", p.mapIntensity)) : o(n, "uIsMap", !1), o(n, "uRadius", p.radius), o(n, "uSmudge", p.smudge), o(n, "uDissipation", p.dissipation), o(n, "uMotionBlur", p.motionBlur), o(n, "uMotionSample", p.motionSample);
        const _ = p.pointerValues || l(C);
        _.isVelocityUpdate && (o(n, "uMouse", _.currentPointer), o(n, "uPrevMouse", _.prevPointer)), o(n, "uVelocity", _.velocity);
        const S = typeof p.color == "function" ? p.color(_.velocity) : p.color;
        return o(n, "uColor", S), o(n, "uIsCursor", p.isCursor), o(n, "uPressureEnd", p.pressure), h.current === null && (h.current = p.pressure), o(n, "uPressureStart", h.current), h.current = p.pressure, i(w, ({ read: T }) => {
          o(n, "uBuffer", T);
        });
      },
      [n, l, i, p, y]
    ),
    y,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: m,
      output: m.read.texture
    }
  ];
};
var N = `varying vec2 vUv;
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
}`, _e = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Te = () => x(
  () => new t.ShaderMaterial({
    vertexShader: N,
    fragmentShader: _e,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Ce = `precision highp float;

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
const Pe = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: N,
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
const Re = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
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
const Ie = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Ae
  }),
  []
);
var Fe = `precision highp float;

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
const ze = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Fe
  }),
  []
);
var Ve = `precision highp float;

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
const Ue = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Ve
  }),
  []
);
var Be = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Oe = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Be
  }),
  []
);
var Le = `precision highp float;

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
const $e = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Le
  }),
  []
);
var Ee = `precision highp float;

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
const We = () => x(
  () => new t.ShaderMaterial({
    uniforms: {
      uTarget: { value: new t.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new t.Vector3() },
      point: { value: new t.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: N,
    fragmentShader: Ee
  }),
  []
), qe = ({
  scene: e,
  size: a,
  dpr: r
}) => {
  const u = x(() => new t.PlaneGeometry(2, 2), []), s = Te(), c = s.clone(), n = ze(), f = Ue(), v = Pe(), l = Re(), m = Ie(), i = Oe(), p = $e(), y = We(), h = x(
    () => ({
      vorticityMaterial: f,
      curlMaterial: n,
      advectionMaterial: v,
      divergenceMaterial: l,
      pressureMaterial: m,
      clearMaterial: i,
      gradientSubtractMaterial: p,
      splatMaterial: y
    }),
    [
      f,
      n,
      v,
      l,
      m,
      i,
      p,
      y
    ]
  ), g = q(a, r);
  x(() => {
    o(
      h.splatMaterial,
      "aspectRatio",
      g.x / g.y
    );
    for (const w of Object.values(h))
      o(
        w,
        "texelSize",
        new t.Vector2(1 / g.x, 1 / g.y)
      );
  }, [g, h]);
  const d = z(e, u, s, t.Mesh);
  x(() => {
    s.dispose(), d.material = c;
  }, [s, d, c]), j(() => () => {
    for (const w of Object.values(h))
      w.dispose();
  }, [h]);
  const b = M(
    (w) => {
      d.material = w, d.material.needsUpdate = !0;
    },
    [d]
  );
  return { materials: h, setMeshMaterial: b, mesh: d };
}, je = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1),
  pointerValues: !1
}), Tt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { materials: n, setMeshMaterial: f, mesh: v } = qe({
    scene: c,
    size: e,
    dpr: s.shader
  }), l = U(e), m = te(), i = x(
    () => ({
      scene: c,
      camera: l,
      dpr: s.fbo,
      size: e,
      samples: r,
      isSizeUpdate: u
    }),
    [c, l, e, r, s.fbo, u]
  ), [p, y] = X(i), [h, g] = X(i), [d, b] = V(i), [w, C] = V(i), [_, S] = X(i), T = R(0), F = R(new t.Vector2(0, 0)), P = R(new t.Vector3(0, 0, 0)), [D, $] = B(je);
  return [
    M(
      (E, G) => {
        const { gl: W, pointer: fe, clock: ee, size: oe } = E;
        G && $(G), T.current === 0 && (T.current = ee.getElapsedTime());
        const ae = Math.min(
          (ee.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = ee.getElapsedTime();
        const ne = y(W, ({ read: L }) => {
          f(n.advectionMaterial), o(n.advectionMaterial, "uVelocity", L), o(n.advectionMaterial, "uSource", L), o(n.advectionMaterial, "dt", ae), o(
            n.advectionMaterial,
            "dissipation",
            D.velocity_dissipation
          );
        }), de = g(W, ({ read: L }) => {
          f(n.advectionMaterial), o(n.advectionMaterial, "uVelocity", ne), o(n.advectionMaterial, "uSource", L), o(
            n.advectionMaterial,
            "dissipation",
            D.density_dissipation
          );
        }), Q = D.pointerValues || m(fe);
        Q.isVelocityUpdate && (y(W, ({ read: L }) => {
          f(n.splatMaterial), o(n.splatMaterial, "uTarget", L), o(
            n.splatMaterial,
            "point",
            Q.currentPointer
          );
          const K = Q.diffPointer.multiply(
            F.current.set(oe.width, oe.height).multiplyScalar(D.velocity_acceleration)
          );
          o(
            n.splatMaterial,
            "color",
            P.current.set(K.x, K.y, 1)
          ), o(
            n.splatMaterial,
            "radius",
            D.splat_radius
          );
        }), g(W, ({ read: L }) => {
          f(n.splatMaterial), o(n.splatMaterial, "uTarget", L);
          const K = typeof D.fluid_color == "function" ? D.fluid_color(Q.velocity) : D.fluid_color;
          o(n.splatMaterial, "color", K);
        }));
        const ge = b(W, () => {
          f(n.curlMaterial), o(n.curlMaterial, "uVelocity", ne);
        });
        y(W, ({ read: L }) => {
          f(n.vorticityMaterial), o(n.vorticityMaterial, "uVelocity", L), o(n.vorticityMaterial, "uCurl", ge), o(
            n.vorticityMaterial,
            "curl",
            D.curl_strength
          ), o(n.vorticityMaterial, "dt", ae);
        });
        const he = C(W, () => {
          f(n.divergenceMaterial), o(n.divergenceMaterial, "uVelocity", ne);
        });
        S(W, ({ read: L }) => {
          f(n.clearMaterial), o(n.clearMaterial, "uTexture", L), o(
            n.clearMaterial,
            "value",
            D.pressure_dissipation
          );
        }), f(n.pressureMaterial), o(n.pressureMaterial, "uDivergence", he);
        let ie;
        for (let L = 0; L < D.pressure_iterations; L++)
          ie = S(W, ({ read: K }) => {
            o(n.pressureMaterial, "uPressure", K);
          });
        return y(W, ({ read: L }) => {
          f(n.gradientSubtractMaterial), o(
            n.gradientSubtractMaterial,
            "uPressure",
            ie
          ), o(n.gradientSubtractMaterial, "uVelocity", L);
        }), de;
      },
      [
        n,
        f,
        b,
        g,
        C,
        m,
        S,
        y,
        $,
        D
      ]
    ),
    $,
    {
      scene: c,
      mesh: v,
      materials: n,
      camera: l,
      renderTarget: {
        velocity: p,
        density: h,
        curl: d,
        divergence: w,
        pressure: _
      },
      output: h.read.texture
    }
  ];
}, Ne = ({ scale: e, max: a, texture: r, scene: u }) => {
  const s = R([]), c = x(
    () => new t.PlaneGeometry(e, e),
    [e]
  ), n = x(
    () => new t.MeshBasicMaterial({
      map: r,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return j(() => {
    for (let f = 0; f < a; f++) {
      const v = new t.Mesh(c.clone(), n.clone());
      v.rotateZ(2 * Math.PI * Math.random()), v.visible = !1, u.add(v), s.current.push(v);
    }
  }, [c, n, u, a]), j(() => () => {
    s.current.forEach((f) => {
      f.geometry.dispose(), Array.isArray(f.material) ? f.material.forEach((v) => v.dispose()) : f.material.dispose(), u.remove(f);
    }), s.current = [];
  }, [u]), s.current;
}, ke = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), Ct = ({
  texture: e = new t.Texture(),
  scale: a = 64,
  max: r = 100,
  size: u,
  dpr: s,
  samples: c,
  isSizeUpdate: n
}) => {
  const f = I(s), v = x(() => new t.Scene(), []), l = Ne({
    scale: a,
    max: r,
    texture: e,
    scene: v
  }), m = U(u), i = te(), [p, y] = V({
    scene: v,
    camera: m,
    size: u,
    dpr: f.fbo,
    samples: c,
    isSizeUpdate: n
  }), [h, g] = B(ke), d = R(0);
  return [
    M(
      (w, C) => {
        const { gl: _, pointer: S, size: T } = w;
        C && g(C);
        const F = h.pointerValues || i(S);
        if (h.frequency < F.diffPointer.length()) {
          const P = l[d.current];
          P.visible = !0, P.position.set(
            F.currentPointer.x * (T.width / 2),
            F.currentPointer.y * (T.height / 2),
            0
          ), P.scale.x = P.scale.y = 0, P.material.opacity = h.alpha, d.current = (d.current + 1) % r;
        }
        return l.forEach((P) => {
          if (P.visible) {
            const D = P.material;
            P.rotation.z += h.rotation, D.opacity *= h.fadeout_speed, P.scale.x = h.fadeout_speed * P.scale.x + h.scale, P.scale.y = P.scale.x, D.opacity < 2e-3 && (P.visible = !1);
          }
        }), y(_);
      },
      [y, l, i, r, h, g]
    ),
    g,
    {
      scene: v,
      camera: m,
      meshArr: l,
      renderTarget: p,
      output: p.texture
    }
  ];
};
var Ge = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ke = `precision highp float;
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
const Xe = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
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
      vertexShader: Ge,
      fragmentShader: Ke
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, Ye = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), Pt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Xe(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Ye);
  return [
    M(
      (h, g) => {
        const { gl: d, clock: b } = h;
        return g && p(g), o(n, "scale", i.scale), o(n, "timeStrength", i.timeStrength), o(n, "noiseOctaves", i.noiseOctaves), o(n, "fbmOctaves", i.fbmOctaves), o(n, "warpOctaves", i.warpOctaves), o(n, "warpDirection", i.warpDirection), o(n, "warpStrength", i.warpStrength), o(n, "uTime", i.beat || b.getElapsedTime()), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var He = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Qe = `precision highp float;
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
const Ze = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
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
      vertexShader: He,
      fragmentShader: Qe
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, Je = Object.freeze({
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
}), Dt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Ze(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Je);
  return [
    M(
      (h, g) => {
        const { gl: d, clock: b } = h;
        return g && p(g), i.texture ? (o(n, "uTexture", i.texture), o(n, "isTexture", !0)) : (o(n, "isTexture", !1), o(n, "scale", i.scale)), i.noise ? (o(n, "noise", i.noise), o(n, "isNoise", !0), o(n, "noiseStrength", i.noiseStrength)) : o(n, "isNoise", !1), o(n, "uTime", i.beat || b.getElapsedTime()), o(n, "laminateLayer", i.laminateLayer), o(n, "laminateInterval", i.laminateInterval), o(n, "laminateDetail", i.laminateDetail), o(n, "distortion", i.distortion), o(n, "colorFactor", i.colorFactor), o(n, "timeStrength", i.timeStrength), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var en = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, nn = `precision highp float;

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
const tn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
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
      vertexShader: en,
      fragmentShader: nn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, rn = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), Rt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = tn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(rn);
  return [
    M(
      (h, g) => {
        const { gl: d, clock: b } = h;
        return g && p(g), o(n, "u_pattern", i.pattern), o(n, "u_complexity", i.complexity), o(
          n,
          "u_complexityAttenuation",
          i.complexityAttenuation
        ), o(n, "u_iterations", i.iterations), o(n, "u_timeStrength", i.timeStrength), o(n, "u_scale", i.scale), o(n, "u_time", i.beat || b.getElapsedTime()), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var on = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, an = `precision highp float;
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
const un = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uRgbWeight: { value: new t.Vector3(0.299, 0.587, 0.114) },
        uColor1: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor2: { value: new t.Color().set(0.5, 0.5, 0.5) },
        uColor3: { value: new t.Color().set(1, 1, 1) },
        uColor4: { value: new t.Color().set(0, 0.1, 0.2) }
      },
      vertexShader: on,
      fragmentShader: an
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, sn = Object.freeze({
  texture: new t.Texture(),
  color1: new t.Color().set(0.5, 0.5, 0.5),
  color2: new t.Color().set(0.5, 0.5, 0.5),
  color3: new t.Color().set(1, 1, 1),
  color4: new t.Color().set(0, 0.1, 0.2),
  rgbWeight: new t.Vector3(0.299, 0.587, 0.114)
}), At = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = un(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(sn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "uTexture", i.texture), o(n, "uColor1", i.color1), o(n, "uColor2", i.color2), o(n, "uColor3", i.color3), o(n, "uColor4", i.color4), o(n, "uRgbWeight", i.rgbWeight), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var ln = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, cn = `precision highp float;

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
const vn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: ln,
      fragmentShader: cn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, mn = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, It = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = vn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(mn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "uTexture", i.texture), o(n, "uColor0", i.color0), o(n, "uColor1", i.color1), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var pn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, fn = `precision highp float;

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
const dn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
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
      vertexShader: pn,
      fragmentShader: fn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, gn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Ft = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = dn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(gn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "u_texture", i.texture), o(n, "u_map", i.map), o(n, "u_mapIntensity", i.mapIntensity), i.alphaMap ? (o(n, "u_alphaMap", i.alphaMap), o(n, "u_isAlphaMap", !0)) : o(n, "u_isAlphaMap", !1), o(n, "u_brightness", i.brightness), o(n, "u_min", i.min), o(n, "u_max", i.max), i.dodgeColor ? (o(n, "u_dodgeColor", i.dodgeColor), o(n, "u_isDodgeColor", !0)) : o(n, "u_isDodgeColor", !1), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var hn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, xn = `precision highp float;

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
const yn = ({
  scene: e,
  size: a,
  dpr: r
}) => {
  const u = x(() => new t.PlaneGeometry(2, 2), []), s = x(
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
      vertexShader: hn,
      fragmentShader: xn
    }),
    []
  ), c = q(a, r);
  o(s, "uResolution", c.clone());
  const n = z(e, u, s, t.Mesh);
  return { material: s, mesh: n };
}, bn = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  padding: 0,
  map: new t.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  dir: new t.Vector2(0, 0)
}, zt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = yn({ scene: c, size: e, dpr: s.shader }), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    dpr: s.fbo,
    size: e,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(bn);
  return [
    M(
      (h, g) => {
        var _, S, T, F, P, D, $, k;
        const { gl: d } = h;
        g && p(g), o(n, "uTexture0", i.texture0), o(n, "uTexture1", i.texture1), o(n, "progress", i.progress);
        const b = [
          ((S = (_ = i.texture0) == null ? void 0 : _.image) == null ? void 0 : S.width) || 0,
          ((F = (T = i.texture0) == null ? void 0 : T.image) == null ? void 0 : F.height) || 0
        ], w = [
          ((D = (P = i.texture1) == null ? void 0 : P.image) == null ? void 0 : D.width) || 0,
          ((k = ($ = i.texture1) == null ? void 0 : $.image) == null ? void 0 : k.height) || 0
        ], C = b.map((E, G) => E + (w[G] - E) * i.progress);
        return o(n, "uTextureResolution", C), o(n, "padding", i.padding), o(n, "uMap", i.map), o(n, "mapIntensity", i.mapIntensity), o(n, "edgeIntensity", i.edgeIntensity), o(n, "epicenter", i.epicenter), o(n, "dirX", i.dir.x), o(n, "dirY", i.dir.y), m(d);
      },
      [m, n, i, p]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var wn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Mn = `precision highp float;

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
const Sn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: wn,
      fragmentShader: Mn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, _n = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Vt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Sn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(
    _n
  );
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "u_texture", i.texture), o(n, "u_brightness", i.brightness), o(n, "u_min", i.min), o(n, "u_max", i.max), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var Tn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Cn = `precision highp float;

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
const Pn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Tn,
      fragmentShader: Cn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, Dn = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Ut = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Pn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Dn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "u_texture", i.texture), o(n, "u_map", i.map), o(n, "u_mapIntensity", i.mapIntensity), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var Rn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, An = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const In = ({
  scene: e,
  size: a
}) => {
  const r = x(() => new t.PlaneGeometry(2, 2), []), u = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uMap: { value: new t.Texture() }
      },
      vertexShader: Rn,
      fragmentShader: An
    }),
    []
  ), s = z(e, r, u, t.Mesh);
  return { material: u, mesh: s };
}, Fn = {
  texture: new t.Texture(),
  map: new t.Texture()
}, Bt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = In({ scene: c, size: e }), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Fn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "uTexture", i.texture), o(n, "uMap", i.map), m(d);
      },
      [n, m, i, p]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var zn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Vn = `precision highp float;

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
const Un = ({
  scene: e,
  size: a
}) => {
  const r = x(() => new t.PlaneGeometry(2, 2), []), u = x(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: zn,
      fragmentShader: Vn
    }),
    []
  ), s = z(e, r, u, t.Mesh);
  return { material: u, mesh: s };
}, Bn = {
  texture: new t.Texture(),
  brightness: 1,
  saturation: 1
}, Ot = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Un({ scene: c, size: e }), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Bn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "u_texture", i.texture), o(n, "u_brightness", i.brightness), o(n, "u_saturation", i.saturation), m(d);
      },
      [n, m, i, p]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var On = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ln = `precision highp float;

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
const $n = ({
  scene: e,
  size: a,
  dpr: r
}) => {
  const u = x(() => new t.PlaneGeometry(2, 2), []), s = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uTextureResolution: { value: new t.Vector2() },
        uTexture: { value: new t.Texture() }
      },
      vertexShader: On,
      fragmentShader: Ln
    }),
    []
  ), c = q(a, r);
  o(s, "uResolution", c.clone());
  const n = z(e, u, s, t.Mesh);
  return { material: s, mesh: n };
}, En = {
  texture: new t.Texture()
}, Lt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = $n({ scene: c, size: e, dpr: s.shader }), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    dpr: s.fbo,
    size: e,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(En);
  return [
    M(
      (h, g) => {
        var b, w, C, _, S, T;
        const { gl: d } = h;
        return g && p(g), o(n, "uTexture", i.texture), o(n, "uTextureResolution", [
          ((C = (w = (b = i.texture) == null ? void 0 : b.source) == null ? void 0 : w.data) == null ? void 0 : C.width) || 0,
          ((T = (S = (_ = i.texture) == null ? void 0 : _.source) == null ? void 0 : S.data) == null ? void 0 : T.height) || 0
        ]), m(d);
      },
      [m, n, i, p]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var Wn = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, qn = `precision mediump float;

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
const jn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: ve.blurSize }
      },
      vertexShader: Wn,
      fragmentShader: qn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, ve = Object.freeze({
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}), $t = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = jn(c), v = U(e), l = x(
    () => ({
      scene: c,
      camera: v,
      size: e,
      dpr: s.fbo,
      samples: r,
      isSizeUpdate: u
    }),
    [c, v, e, s.fbo, r, u]
  ), [m, i] = X(l), [p, y] = B(ve);
  return [
    M(
      (g, d) => {
        var _, S, T, F, P, D;
        const { gl: b } = g;
        d && y(d), o(n, "uTexture", p.texture), o(n, "uResolution", [
          ((T = (S = (_ = p.texture) == null ? void 0 : _.source) == null ? void 0 : S.data) == null ? void 0 : T.width) || 0,
          ((D = (P = (F = p.texture) == null ? void 0 : F.source) == null ? void 0 : P.data) == null ? void 0 : D.height) || 0
        ]), o(n, "uBlurSize", p.blurSize);
        let w = i(b);
        const C = p.blurPower;
        for (let $ = 0; $ < C; $++)
          o(n, "uTexture", w), w = i(b);
        return w;
      },
      [i, n, y, p]
    ),
    y,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: m,
      output: m.read.texture
    }
  ];
};
var Nn = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, kn = `precision mediump float;

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
const Gn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: Y.texture },
        uBackbuffer: { value: new t.Texture() },
        uBegin: { value: Y.begin },
        uEnd: { value: Y.end },
        uStrength: { value: Y.strength }
      },
      vertexShader: Nn,
      fragmentShader: kn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, Y = Object.freeze({
  texture: new t.Texture(),
  begin: new t.Vector2(0, 0),
  end: new t.Vector2(0, 0),
  strength: 0.9
}), Et = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Gn(c), v = U(e), l = x(
    () => ({
      scene: c,
      camera: v,
      size: e,
      dpr: s.fbo,
      samples: r,
      isSizeUpdate: u
    }),
    [c, v, e, s.fbo, r, u]
  ), [m, i] = X(l), [p, y] = B(Y);
  return [
    M(
      (g, d) => {
        const { gl: b } = g;
        return d && y(d), o(n, "uTexture", p.texture), o(n, "uBegin", p.begin), o(n, "uEnd", p.end), o(n, "uStrength", p.strength), i(b, ({ read: w }) => {
          o(n, "uBackbuffer", w);
        });
      },
      [i, n, y, p]
    ),
    y,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: m,
      output: m.read.texture
    }
  ];
};
var Kn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xn = `precision highp float;

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
const Yn = (e) => {
  const a = x(() => new t.PlaneGeometry(2, 2), []), r = x(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: H.epicenter },
        uProgress: { value: H.progress },
        uStrength: { value: H.strength },
        uWidth: { value: H.width },
        uMode: { value: 0 }
      },
      vertexShader: Kn,
      fragmentShader: Xn
    }),
    []
  ), u = z(e, a, r, t.Mesh);
  return { material: r, mesh: u };
}, H = Object.freeze({
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), Wt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Yn(c), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(H);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "uEpicenter", i.epicenter), o(n, "uProgress", i.progress), o(n, "uWidth", i.width), o(n, "uStrength", i.strength), o(
          n,
          "uMode",
          i.mode === "center" ? 0 : i.mode === "horizontal" ? 1 : 2
        ), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
};
var Hn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Qn = `precision highp float;
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
const Zn = ({
  scene: e,
  size: a,
  dpr: r
}) => {
  const u = x(() => new t.PlaneGeometry(2, 2), []), s = x(
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
      vertexShader: Hn,
      fragmentShader: Qn
    }),
    []
  ), c = q(a, r);
  o(s, "u_resolution", c.clone());
  const n = z(e, u, s, t.Mesh);
  return { material: s, mesh: n };
}, Jn = Object.freeze({
  texture: new t.Texture(),
  keyColor: new t.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new t.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), qt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u
}) => {
  const s = I(a), c = x(() => new t.Scene(), []), { material: n, mesh: f } = Zn({ scene: c, size: e, dpr: s.shader }), v = U(e), [l, m] = V({
    scene: c,
    camera: v,
    size: e,
    dpr: s.fbo,
    samples: r,
    isSizeUpdate: u
  }), [i, p] = B(Jn);
  return [
    M(
      (h, g) => {
        const { gl: d } = h;
        return g && p(g), o(n, "u_texture", i.texture), o(n, "u_keyColor", i.keyColor), o(n, "u_similarity", i.similarity), o(n, "u_smoothness", i.smoothness), o(n, "u_spill", i.spill), o(n, "u_color", i.color), o(n, "u_contrast", i.contrast), o(n, "u_brightness", i.brightness), o(n, "u_gamma", i.gamma), m(d);
      },
      [m, n, p, i]
    ),
    p,
    {
      scene: c,
      mesh: f,
      material: n,
      camera: v,
      renderTarget: l,
      output: l.texture
    }
  ];
}, et = ({
  scene: e,
  geometry: a,
  material: r
}) => {
  const u = z(
    e,
    a,
    r,
    t.Points
  ), s = z(
    e,
    x(() => a.clone(), [a]),
    x(() => r.clone(), [r]),
    t.Mesh
  );
  return s.visible = !1, {
    points: u,
    interactiveMesh: s
  };
};
var nt = `uniform vec2 uResolution;
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
}`, tt = `precision highp float;
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
}`, me = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
const pe = process.env.NODE_ENV === "development", se = (e, a, r, u, s) => {
  var m;
  const c = r === "position" ? "positionTarget" : "uvTarget", n = r === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", f = r === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", v = r === "position" ? "positionsList" : "uvsList", l = r === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    a.deleteAttribute(r), a.setAttribute(
      r,
      new t.BufferAttribute(e[0], s)
    );
    let i = "", p = "";
    e.forEach((y, h) => {
      a.setAttribute(
        `${c}${h}`,
        new t.BufferAttribute(y, s)
      ), i += `attribute vec${s} ${c}${h};
`, h === 0 ? p += `${c}${h}` : p += `,${c}${h}`;
    }), u = u.replace(
      `${n}`,
      i
    ), u = u.replace(
      `${f}`,
      `vec${s} ${v}[${e.length}] = vec${s}[](${p});
				${l}
			`
    );
  } else
    u = u.replace(`${n}`, ""), u = u.replace(`${f}`, ""), (m = a == null ? void 0 : a.attributes[r]) != null && m.array || pe && console.error(
      `use-shader-fx:geometry.attributes.${r}.array is not found`
    );
  return u;
}, le = (e, a, r, u) => {
  var c;
  let s = [];
  if (e && e.length > 0) {
    (c = a == null ? void 0 : a.attributes[r]) != null && c.array ? s = [
      a.attributes[r].array,
      ...e
    ] : s = e;
    const n = Math.max(...s.map((f) => f.length));
    s.forEach((f, v) => {
      if (f.length < n) {
        const l = (n - f.length) / u, m = [], i = Array.from(f);
        for (let p = 0; p < l; p++) {
          const y = Math.floor(f.length / u * Math.random()) * u;
          for (let h = 0; h < u; h++)
            m.push(i[y + h]);
        }
        s[v] = new Float32Array([...i, ...m]);
      }
    });
  }
  return s;
}, rt = (e, a) => {
  let r = "";
  const u = {};
  let s = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((n, f) => {
    const v = `vMapArrayIndex < ${f}.1`, l = `texture2D(uMapArray${f}, uv)`;
    s += `( ${v} ) ? ${l} : `, r += `
        uniform sampler2D uMapArray${f};
      `, u[`uMapArray${f}`] = { value: n };
  }), s += "vec4(1.);", r += "bool isMapArray = true;", u.uMapArrayLength = { value: e.length }) : (s += "vec4(1.0);", r += "bool isMapArray = false;", u.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: a.replace("#usf <mapArraySwitcher>", s).replace("#usf <mapArrayUniforms>", r), mapArrayUniforms: u };
}, ot = ({
  size: e,
  dpr: a,
  geometry: r,
  positions: u,
  uvs: s,
  mapArray: c
}) => {
  const n = x(
    () => le(u, r, "position", 3),
    [u, r]
  ), f = x(
    () => le(s, r, "uv", 2),
    [s, r]
  ), v = x(() => {
    n.length !== f.length && pe && console.log("use-shader-fx:positions and uvs are not matched");
    const m = se(
      f,
      r,
      "uv",
      se(
        n,
        r,
        "position",
        nt,
        3
      ),
      2
    ).replace("#usf <getWobble>", me), i = rt(c, tt);
    return new t.ShaderMaterial({
      vertexShader: m,
      fragmentShader: i.rewritedFragmentShader,
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
        ...i.mapArrayUniforms
      }
    });
  }, [
    r,
    n,
    f,
    c
  ]), l = q(e, a);
  return o(v, "uResolution", l.clone()), { material: v, modifiedPositions: n, modifiedUvs: f };
}, at = ({
  size: e,
  dpr: a,
  scene: r = !1,
  geometry: u,
  positions: s,
  uvs: c,
  mapArray: n
}) => {
  const f = I(a), v = x(() => {
    const g = u || new t.SphereGeometry(1, 32, 32);
    return g.setIndex(null), g.deleteAttribute("normal"), g;
  }, [u]), { material: l, modifiedPositions: m, modifiedUvs: i } = ot({
    size: e,
    dpr: f.shader,
    geometry: v,
    positions: s,
    uvs: c,
    mapArray: n
  }), { points: p, interactiveMesh: y } = et({
    scene: r,
    geometry: v,
    material: l
  });
  return [
    M(
      (g, d) => {
        g && o(
          l,
          "uTime",
          (d == null ? void 0 : d.beat) || g.clock.getElapsedTime()
        ), d !== void 0 && (o(l, "uMorphProgress", d.morphProgress), o(l, "uBlurAlpha", d.blurAlpha), o(l, "uBlurRadius", d.blurRadius), o(l, "uPointSize", d.pointSize), o(l, "uPointAlpha", d.pointAlpha), d.picture ? (o(l, "uPicture", d.picture), o(l, "uIsPicture", !0)) : d.picture === !1 && o(l, "uIsPicture", !1), d.alphaPicture ? (o(l, "uAlphaPicture", d.alphaPicture), o(l, "uIsAlphaPicture", !0)) : d.alphaPicture === !1 && o(l, "uIsAlphaPicture", !1), o(l, "uColor0", d.color0), o(l, "uColor1", d.color1), o(l, "uColor2", d.color2), o(l, "uColor3", d.color3), d.map ? (o(l, "uMap", d.map), o(l, "uIsMap", !0)) : d.map === !1 && o(l, "uIsMap", !1), d.alphaMap ? (o(l, "uAlphaMap", d.alphaMap), o(l, "uIsAlphaMap", !0)) : d.alphaMap === !1 && o(l, "uIsAlphaMap", !1), o(l, "uWobbleStrength", d.wobbleStrength), o(
          l,
          "uWobblePositionFrequency",
          d.wobblePositionFrequency
        ), o(
          l,
          "uWobbleTimeFrequency",
          d.wobbleTimeFrequency
        ), o(l, "uWarpStrength", d.warpStrength), o(
          l,
          "uWarpPositionFrequency",
          d.warpPositionFrequency
        ), o(l, "uWarpTimeFrequency", d.warpTimeFrequency), d.displacement ? (o(l, "uDisplacement", d.displacement), o(l, "uIsDisplacement", !0)) : d.displacement === !1 && o(l, "uIsDisplacement", !1), o(
          l,
          "uDisplacementIntensity",
          d.displacementIntensity
        ), o(
          l,
          "uDisplacementColorIntensity",
          d.displacementColorIntensity
        ), o(
          l,
          "uSizeRandomIntensity",
          d.sizeRandomIntensity
        ), o(
          l,
          "uSizeRandomTimeFrequency",
          d.sizeRandomTimeFrequency
        ), o(l, "uSizeRandomMin", d.sizeRandomMin), o(l, "uSizeRandomMax", d.sizeRandomMax), o(l, "uDivergence", d.divergence), o(l, "uDivergencePoint", d.divergencePoint));
      },
      [l]
    ),
    {
      points: p,
      interactiveMesh: y,
      positions: m,
      uvs: i
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
}), jt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u,
  camera: s,
  geometry: c,
  positions: n,
  uvs: f
}) => {
  const v = I(a), l = x(() => new t.Scene(), []), [
    m,
    {
      points: i,
      interactiveMesh: p,
      positions: y,
      uvs: h
    }
  ] = at({ scene: l, size: e, dpr: a, geometry: c, positions: n, uvs: f }), [g, d] = V({
    scene: l,
    camera: s,
    size: e,
    dpr: v.fbo,
    samples: r,
    isSizeUpdate: u,
    depthBuffer: !0
  }), b = M(
    (C, _) => (m(C, _), d(C.gl)),
    [d, m]
  ), w = M(
    (C) => {
      m(null, C);
    },
    [m]
  );
  return [
    b,
    w,
    {
      scene: l,
      points: i,
      interactiveMesh: p,
      renderTarget: g,
      output: g.texture,
      positions: y,
      uvs: h
    }
  ];
};
function it(e, a = 1e-4) {
  a = Math.max(a, Number.EPSILON);
  const r = {}, u = e.getIndex(), s = e.getAttribute("position"), c = u ? u.count : s.count;
  let n = 0;
  const f = Object.keys(e.attributes), v = {}, l = {}, m = [], i = ["getX", "getY", "getZ", "getW"];
  for (let g = 0, d = f.length; g < d; g++) {
    const b = f[g];
    v[b] = [];
    const w = e.morphAttributes[b];
    w && (l[b] = new Array(w.length).fill(0).map(() => []));
  }
  const p = Math.log10(1 / a), y = Math.pow(10, p);
  for (let g = 0; g < c; g++) {
    const d = u ? u.getX(g) : g;
    let b = "";
    for (let w = 0, C = f.length; w < C; w++) {
      const _ = f[w], S = e.getAttribute(_), T = S.itemSize;
      for (let F = 0; F < T; F++)
        b += `${~~(S[i[F]](d) * y)},`;
    }
    if (b in r)
      m.push(r[b]);
    else {
      for (let w = 0, C = f.length; w < C; w++) {
        const _ = f[w], S = e.getAttribute(_), T = e.morphAttributes[_], F = S.itemSize, P = v[_], D = l[_];
        for (let $ = 0; $ < F; $++) {
          const k = i[$];
          if (P.push(S[k](d)), T)
            for (let E = 0, G = T.length; E < G; E++)
              D[E].push(T[E][k](d));
        }
      }
      r[b] = n, m.push(n), n++;
    }
  }
  const h = e.clone();
  for (let g = 0, d = f.length; g < d; g++) {
    const b = f[g], w = e.getAttribute(b), C = new w.array.constructor(v[b]), _ = new ue(C, w.itemSize, w.normalized);
    if (h.setAttribute(b, _), b in l)
      for (let S = 0; S < l[b].length; S++) {
        const T = e.morphAttributes[b][S], F = new T.array.constructor(l[b][S]), P = new ue(F, T.itemSize, T.normalized);
        h.morphAttributes[b][S] = P;
      }
  }
  return h.setIndex(m), h;
}
var ut = `vec3 random3(vec3 c) {
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
}`, st = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, lt = `#ifdef USE_TRANSMISSION

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
const ce = (e) => {
  let a = e;
  return a = a.replace(
    "#include <beginnormal_vertex>",
    `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
  ), a = a.replace(
    "#include <begin_vertex>",
    `
		vec3 transformed = usf_Position;`
  ), a = a.replace(
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
  ), a = a.replace("// #usf <getWobble>", `${me}`), a = a.replace(
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
  ), a;
}, ct = ({
  baseMaterial: e,
  materialParameters: a
}) => {
  const { material: r, depthMaterial: u } = x(() => {
    const s = new (e || t.MeshPhysicalMaterial)(
      a || {}
    ), c = s.type === "MeshPhysicalMaterial" || s.type === "MeshStandardMaterial", n = s.type === "MeshPhysicalMaterial";
    Object.assign(s.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: O.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: O.wobbleTimeFrequency
        },
        uWobbleStrength: { value: O.wobbleStrength },
        uWarpPositionFrequency: {
          value: O.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: O.warpTimeFrequency },
        uWarpStrength: { value: O.warpStrength },
        uWobbleShine: { value: O.wobbleShine },
        uColor0: { value: O.color0 },
        uColor1: { value: O.color1 },
        uColor2: { value: O.color2 },
        uColor3: { value: O.color3 },
        uColorMix: { value: O.colorMix },
        uChromaticAberration: {
          value: O.chromaticAberration
        },
        uAnisotropicBlur: { value: O.anisotropicBlur },
        uDistortion: { value: O.distortion },
        uDistortionScale: { value: O.distortionScale },
        uTemporalDistortion: { value: O.temporalDistortion },
        uSamples: { value: O.samples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null }
      }
    }), s.onBeforeCompile = (v) => {
      Object.assign(v.uniforms, s.userData.uniforms), v.vertexShader = ce(v.vertexShader), v.fragmentShader = v.fragmentShader.replace(
        "#include <color_fragment>",
        `
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
      ), c && (v.fragmentShader = v.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
      )), v.fragmentShader = v.fragmentShader.replace(
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
				${ut}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${c ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${c ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), n && (v.fragmentShader = v.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${st}`
      ), v.fragmentShader = v.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${lt}`
      ));
    }, s.needsUpdate = !0;
    const f = new t.MeshDepthMaterial({
      depthPacking: t.RGBADepthPacking
    });
    return f.onBeforeCompile = (v) => {
      Object.assign(v.uniforms, s.userData.uniforms), v.vertexShader = ce(v.vertexShader);
    }, f.needsUpdate = !0, { material: s, depthMaterial: f };
  }, [a, e]);
  return {
    material: r,
    depthMaterial: u
  };
}, vt = ({
  scene: e = !1,
  geometry: a,
  baseMaterial: r,
  materialParameters: u
}) => {
  const s = x(() => {
    let l = a || new t.IcosahedronGeometry(2, 20);
    return l = it(l), l.computeTangents(), l;
  }, [a]), { material: c, depthMaterial: n } = ct({
    baseMaterial: r,
    materialParameters: u
  }), f = z(e, s, c, t.Mesh);
  return [
    M(
      (l, m) => {
        const i = c.userData;
        l && o(
          i,
          "uTime",
          (m == null ? void 0 : m.beat) || l.clock.getElapsedTime()
        ), m !== void 0 && (o(i, "uWobbleStrength", m.wobbleStrength), o(
          i,
          "uWobblePositionFrequency",
          m.wobblePositionFrequency
        ), o(
          i,
          "uWobbleTimeFrequency",
          m.wobbleTimeFrequency
        ), o(i, "uWarpStrength", m.warpStrength), o(
          i,
          "uWarpPositionFrequency",
          m.warpPositionFrequency
        ), o(i, "uWarpTimeFrequency", m.warpTimeFrequency), o(i, "uWobbleShine", m.wobbleShine), o(i, "uSamples", m.samples), o(i, "uColor0", m.color0), o(i, "uColor1", m.color1), o(i, "uColor2", m.color2), o(i, "uColor3", m.color3), o(i, "uColorMix", m.colorMix), o(
          i,
          "uChromaticAberration",
          m.chromaticAberration
        ), o(i, "uAnisotropicBlur", m.anisotropicBlur), o(i, "uDistortion", m.distortion), o(i, "uDistortionScale", m.distortionScale), o(i, "uTemporalDistortion", m.temporalDistortion));
      },
      [c]
    ),
    {
      mesh: f,
      depthMaterial: n
    }
  ];
}, O = Object.freeze({
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
}), Nt = ({
  size: e,
  dpr: a,
  samples: r,
  isSizeUpdate: u,
  camera: s,
  geometry: c,
  baseMaterial: n,
  materialParameters: f
}) => {
  const v = I(a), l = x(() => new t.Scene(), []), [m, { mesh: i, depthMaterial: p }] = vt({
    baseMaterial: n,
    materialParameters: f,
    scene: l,
    geometry: c
  }), [y, h] = V({
    scene: l,
    camera: s,
    size: e,
    dpr: v.fbo,
    samples: r,
    isSizeUpdate: u,
    depthBuffer: !0
  }), g = M(
    (b, w) => (m(b, w), h(b.gl)),
    [h, m]
  ), d = M(
    (b) => {
      m(null, b);
    },
    [m]
  );
  return [
    g,
    d,
    {
      scene: l,
      mesh: i,
      depthMaterial: p,
      renderTarget: y,
      output: y.texture
    }
  ];
}, kt = (e, a, r) => {
  const u = x(() => {
    const s = new t.Mesh(a, r);
    return e.add(s), s;
  }, [a, r, e]);
  return j(() => () => {
    e.remove(u), a.dispose(), r.dispose();
  }, [e, a, r, u]), u;
}, Z = Object.freeze({
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
    const r = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((r + 1) * 2 * e - r) / 2 : (Math.pow(2 * e - 2, 2) * ((r + 1) * (e * 2 - 2) + r) + 2) / 2;
  },
  easeInElastic(e) {
    const a = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * a);
  },
  easeOutElastic(e) {
    const a = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * a) + 1;
  },
  easeInOutElastic(e) {
    const a = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * a)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * a) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - Z.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - Z.easeOutBounce(1 - 2 * e)) / 2 : (1 + Z.easeOutBounce(2 * e - 1)) / 2;
  }
});
function mt(e) {
  let a = Math.sin(e * 12.9898) * 43758.5453;
  return a - Math.floor(a);
}
const Gt = (e, a = "easeOutQuart") => {
  const r = e / 60, u = Z[a];
  return M(
    (c) => {
      let n = c.getElapsedTime() * r;
      const f = Math.floor(n), v = u(n - f);
      n = v + f;
      const l = mt(f);
      return {
        beat: n,
        floor: f,
        fract: v,
        hash: l
      };
    },
    [r, u]
  );
}, Kt = (e = 60) => {
  const a = x(() => 1 / Math.max(Math.min(e, 60), 1), [e]), r = R(null);
  return M(
    (s) => {
      const c = s.getElapsedTime();
      return r.current === null || c - r.current >= a ? (r.current = c, !0) : !1;
    },
    [a]
  );
}, pt = (e) => {
  var u, s;
  const a = (u = e.dom) == null ? void 0 : u.length, r = (s = e.texture) == null ? void 0 : s.length;
  return !a || !r || a !== r;
};
var ft = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, dt = `precision highp float;

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
const gt = ({
  params: e,
  size: a,
  scene: r
}) => {
  r.children.length > 0 && (r.children.forEach((u) => {
    u instanceof t.Mesh && (u.geometry.dispose(), u.material.dispose());
  }), r.remove(...r.children)), e.texture.forEach((u, s) => {
    const c = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: ft,
        fragmentShader: dt,
        transparent: !0,
        uniforms: {
          u_texture: { value: u },
          u_textureResolution: {
            value: new t.Vector2(0, 0)
          },
          u_resolution: { value: new t.Vector2(0, 0) },
          u_borderRadius: {
            value: e.boderRadius[s] ? e.boderRadius[s] : 0
          }
        }
      })
    );
    r.add(c);
  });
}, ht = () => {
  const e = R([]), a = R([]);
  return M(
    ({
      isIntersectingRef: u,
      isIntersectingOnceRef: s,
      params: c
    }) => {
      e.current.length > 0 && e.current.forEach((f, v) => {
        f.unobserve(a.current[v]);
      }), a.current = [], e.current = [];
      const n = new Array(c.dom.length).fill(!1);
      u.current = [...n], s.current = [...n], c.dom.forEach((f, v) => {
        const l = (i) => {
          i.forEach((p) => {
            c.onIntersect[v] && c.onIntersect[v](p), u.current[v] = p.isIntersecting;
          });
        }, m = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        m.observe(f), e.current.push(m), a.current.push(f);
      });
    },
    []
  );
}, xt = () => {
  const e = R([]), a = M(
    ({ params: r, size: u, resolutionRef: s, scene: c, isIntersectingRef: n }) => {
      c.children.length !== e.current.length && (e.current = new Array(c.children.length)), c.children.forEach((f, v) => {
        var i, p, y, h, g, d;
        const l = r.dom[v];
        if (!l)
          return;
        const m = l.getBoundingClientRect();
        if (e.current[v] = m, f.scale.set(m.width, m.height, 1), f.position.set(
          m.left + m.width * 0.5 - u.width * 0.5,
          -m.top - m.height * 0.5 + u.height * 0.5,
          0
        ), n.current[v] && (r.rotation[v] && f.rotation.copy(r.rotation[v]), f instanceof t.Mesh)) {
          const b = f.material;
          o(b, "u_texture", r.texture[v]), o(b, "u_textureResolution", [
            ((y = (p = (i = r.texture[v]) == null ? void 0 : i.source) == null ? void 0 : p.data) == null ? void 0 : y.width) || 0,
            ((d = (g = (h = r.texture[v]) == null ? void 0 : h.source) == null ? void 0 : g.data) == null ? void 0 : d.height) || 0
          ]), o(
            b,
            "u_resolution",
            s.current.set(m.width, m.height)
          ), o(
            b,
            "u_borderRadius",
            r.boderRadius[v] ? r.boderRadius[v] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, a];
}, yt = () => {
  const e = R([]), a = R([]), r = M((u, s = !1) => {
    e.current.forEach((n, f) => {
      n && (a.current[f] = !0);
    });
    const c = s ? [...a.current] : [...e.current];
    return u < 0 ? c : c[u];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: a,
    isIntersecting: r
  };
}, bt = (e) => ({ onView: r, onHidden: u }) => {
  const s = R(!1);
  j(() => {
    let c;
    const n = () => {
      e.current.some((f) => f) ? s.current || (r && r(), s.current = !0) : s.current && (u && u(), s.current = !1), c = requestAnimationFrame(n);
    };
    return c = requestAnimationFrame(n), () => {
      cancelAnimationFrame(c);
    };
  }, [r, u]);
}, wt = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Xt = ({ size: e, dpr: a, samples: r, isSizeUpdate: u }, s = []) => {
  const c = I(a), n = x(() => new t.Scene(), []), f = U(e), [v, l] = V({
    scene: n,
    camera: f,
    size: e,
    dpr: c.fbo,
    samples: r,
    isSizeUpdate: u
  }), [m, i] = B({
    ...wt,
    updateKey: performance.now()
  }), [p, y] = xt(), h = R(new t.Vector2(0, 0)), [g, d] = xe(!0);
  x(
    () => d(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const b = R(null), w = x(() => new t.Texture(), []), C = ht(), { isIntersectingOnceRef: _, isIntersectingRef: S, isIntersecting: T } = yt(), F = bt(S);
  return [
    M(
      (D, $) => {
        const { gl: k, size: E } = D;
        if ($ && i($), pt(m))
          return w;
        if (g) {
          if (b.current === m.updateKey)
            return w;
          b.current = m.updateKey;
        }
        return g && (gt({
          params: m,
          size: E,
          scene: n
        }), C({
          isIntersectingRef: S,
          isIntersectingOnceRef: _,
          params: m
        }), d(!1)), y({
          params: m,
          size: E,
          resolutionRef: h,
          scene: n,
          isIntersectingRef: S
        }), l(k);
      },
      [
        l,
        i,
        C,
        y,
        g,
        n,
        m,
        _,
        S,
        w
      ]
    ),
    i,
    {
      scene: n,
      camera: f,
      renderTarget: v,
      output: v.texture,
      isIntersecting: T,
      DOMRects: p,
      intersections: S.current,
      useDomView: F
    }
  ];
}, Yt = ({
  scene: e,
  camera: a,
  size: r,
  dpr: u = !1,
  isSizeUpdate: s = !1,
  samples: c = 0,
  depthBuffer: n = !1,
  depthTexture: f = !1
}, v) => {
  const l = R([]), m = q(r, u);
  l.current = x(() => Array.from({ length: v }, () => {
    const p = new t.WebGLRenderTarget(
      m.x,
      m.y,
      {
        ...J,
        samples: c,
        depthBuffer: n
      }
    );
    return f && (p.depthTexture = new t.DepthTexture(
      m.x,
      m.y,
      t.FloatType
    )), p;
  }), [v]), s && l.current.forEach(
    (p) => p.setSize(m.x, m.y)
  ), j(() => {
    const p = l.current;
    return () => {
      p.forEach((y) => y.dispose());
    };
  }, [v]);
  const i = M(
    (p, y, h) => {
      const g = l.current[y];
      return re({
        gl: p,
        scene: e,
        camera: a,
        fbo: g,
        onBeforeRender: () => h && h({ read: g.texture })
      }), g.texture;
    },
    [e, a]
  );
  return [l.current, i];
};
export {
  Fn as ALPHABLENDING_PARAMS,
  gn as BLENDING_PARAMS,
  _n as BRIGHTNESSPICKER_PARAMS,
  Se as BRUSH_PARAMS,
  Jn as CHROMAKEY_PARAMS,
  Je as COLORSTRATA_PARAMS,
  sn as COSPALETTE_PARAMS,
  En as COVERTEXTURE_PARAMS,
  wt as DOMSYNCER_PARAMS,
  mn as DUOTONE_PARAMS,
  Z as Easing,
  J as FBO_OPTION,
  je as FLUID_PARAMS,
  Dn as FXBLENDING_PARAMS,
  bn as FXTEXTURE_PARAMS,
  Bn as HSV_PARAMS,
  rn as MARBLE_PARAMS,
  A as MORPHPARTICLES_PARAMS,
  Y as MOTIONBLUR_PARAMS,
  Ye as NOISE_PARAMS,
  ke as RIPPLE_PARAMS,
  ve as SIMPLEBLUR_PARAMS,
  H as WAVE_PARAMS,
  O as WOBBLE3D_PARAMS,
  re as renderFBO,
  o as setUniform,
  kt as useAddMesh,
  Bt as useAlphaBlending,
  Gt as useBeat,
  Ft as useBlending,
  Vt as useBrightnessPicker,
  _t as useBrush,
  U as useCamera,
  qt as useChromaKey,
  Dt as useColorStrata,
  Yt as useCopyTexture,
  At as useCosPalette,
  Lt as useCoverTexture,
  at as useCreateMorphParticles,
  vt as useCreateWobble3D,
  Xt as useDomSyncer,
  X as useDoubleFBO,
  It as useDuoTone,
  Kt as useFPSLimiter,
  Tt as useFluid,
  Ut as useFxBlending,
  zt as useFxTexture,
  Ot as useHSV,
  Rt as useMarble,
  jt as useMorphParticles,
  Et as useMotionBlur,
  Pt as useNoise,
  B as useParams,
  te as usePointer,
  q as useResolution,
  Ct as useRipple,
  $t as useSimpleBlur,
  V as useSingleFBO,
  Wt as useWave,
  Nt as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
