import * as i from "three";
import { BufferAttribute as Ce } from "three";
import { useMemo as b, useEffect as oe, useRef as E, useCallback as D, useState as Be } from "react";
var Ee = `varying vec2 vUv;

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
const Y = (e, t = !1) => {
  const n = t ? e.width * t : e.width, r = t ? e.height * t : e.height;
  return b(
    () => new i.Vector2(n, r),
    [n, r]
  );
}, A = (e) => (t, n) => {
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
  const o = b(() => {
    const v = new r(t, n);
    return e && e.add(v), v;
  }, [t, n, r, e]);
  return oe(() => () => {
    e && e.remove(o), t.dispose(), n.dispose();
  }, [e, t, n, o]), o;
}, Re = process.env.NODE_ENV === "development", z = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, T = new i.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  i.RGBAFormat
), $e = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uBuffer: { value: T },
        uResolution: { value: new i.Vector2(0, 0) },
        uTexture: { value: T },
        uIsTexture: { value: !1 },
        uMap: { value: T },
        uIsMap: { value: !1 },
        uMapIntensity: { value: te.mapIntensity },
        uRadius: { value: te.radius },
        uSmudge: { value: te.smudge },
        uDissipation: { value: te.dissipation },
        uMotionBlur: { value: te.motionBlur },
        uMotionSample: { value: te.motionSample },
        uMouse: { value: new i.Vector2(-10, -10) },
        uPrevMouse: { value: new i.Vector2(-10, -10) },
        uVelocity: { value: new i.Vector2(0, 0) },
        uColor: { value: te.color },
        uIsCursor: { value: !1 },
        uPressureStart: { value: 1 },
        uPressureEnd: { value: 1 },
        ...r
      },
      vertexShader: Ee,
      fragmentShader: Le,
      ...z,
      // Must be transparent
      transparent: !0
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = L(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, We = (e, t) => {
  const n = t, r = e / t, [o, v] = [n * r / 2, n / 2];
  return { width: o, height: v, near: -1e3, far: 1e3 };
}, $ = (e, t = "OrthographicCamera") => {
  const n = Y(e), { width: r, height: o, near: v, far: s } = We(
    n.x,
    n.y
  );
  return b(() => t === "OrthographicCamera" ? new i.OrthographicCamera(
    -r,
    r,
    o,
    -o,
    v,
    s
  ) : new i.PerspectiveCamera(50, r / o), [r, o, v, s, t]);
}, Me = (e = 0) => {
  const t = E(new i.Vector2(0, 0)), n = E(new i.Vector2(0, 0)), r = E(new i.Vector2(0, 0)), o = E(0), v = E(new i.Vector2(0, 0)), s = E(!1);
  return D(
    (c) => {
      const f = performance.now();
      let d;
      s.current && e ? (r.current = r.current.lerp(
        c,
        1 - e
      ), d = r.current.clone()) : (d = c.clone(), r.current = d), o.current === 0 && (o.current = f, t.current = d);
      const y = Math.max(1, f - o.current);
      o.current = f, v.current.copy(d).sub(t.current).divideScalar(y);
      const x = v.current.length() > 0, a = s.current ? t.current.clone() : d;
      return !s.current && x && (s.current = !0), t.current = d, {
        currentPointer: d,
        prevPointer: a,
        diffPointer: n.current.subVectors(d, a),
        velocity: v.current,
        isVelocityUpdate: x
      };
    },
    [e]
  );
}, W = (e) => {
  const n = E(
    ((o) => Object.values(o).some((v) => typeof v == "function"))(e) ? e : structuredClone(e)
  ), r = D((o) => {
    if (o !== void 0)
      for (const v in o) {
        const s = v;
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
  minFilter: i.LinearFilter,
  magFilter: i.LinearFilter,
  type: i.HalfFloatType,
  stencilBuffer: !1
}, Se = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: o,
  onSwap: v
}) => {
  e.setRenderTarget(t), o(), e.clear(), e.render(n, r), v && v(), e.setRenderTarget(null), e.clear();
}, j = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var y;
  const c = E(), f = Y(n, r);
  c.current = b(
    () => {
      const x = new i.WebGLRenderTarget(
        f.x,
        f.y,
        {
          ...ge,
          samples: v,
          depthBuffer: s
        }
      );
      return u && (x.depthTexture = new i.DepthTexture(
        f.x,
        f.y,
        i.FloatType
      )), x;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), o && ((y = c.current) == null || y.setSize(f.x, f.y)), oe(() => {
    const x = c.current;
    return () => {
      x == null || x.dispose();
    };
  }, []);
  const d = D(
    (x, a) => {
      const g = c.current;
      return Se({
        gl: x,
        fbo: g,
        scene: e,
        camera: t,
        onBeforeRender: () => a && a({ read: g.texture })
      }), g.texture;
    },
    [e, t]
  );
  return [c.current, d];
}, ue = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var x, a;
  const c = E({
    read: null,
    write: null,
    swap: function() {
      let g = this.read;
      this.read = this.write, this.write = g;
    }
  }), f = Y(n, r), d = b(() => {
    const g = new i.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: v,
      depthBuffer: s
    }), l = new i.WebGLRenderTarget(f.x, f.y, {
      ...ge,
      samples: v,
      depthBuffer: s
    });
    return u && (g.depthTexture = new i.DepthTexture(
      f.x,
      f.y,
      i.FloatType
    ), l.depthTexture = new i.DepthTexture(
      f.x,
      f.y,
      i.FloatType
    )), { read: g, write: l };
  }, []);
  c.current.read = d.read, c.current.write = d.write, o && ((x = c.current.read) == null || x.setSize(f.x, f.y), (a = c.current.write) == null || a.setSize(f.x, f.y)), oe(() => {
    const g = c.current;
    return () => {
      var l, m;
      (l = g.read) == null || l.dispose(), (m = g.write) == null || m.dispose();
    };
  }, []);
  const y = D(
    (g, l) => {
      var p;
      const m = c.current;
      return Se({
        gl: g,
        scene: e,
        camera: t,
        fbo: m.write,
        onBeforeRender: () => l && l({
          read: m.read.texture,
          write: m.write.texture
        }),
        onSwap: () => m.swap()
      }), (p = m.read) == null ? void 0 : p.texture;
    },
    [e, t]
  );
  return [
    { read: c.current.read, write: c.current.write },
    y
  ];
}, O = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, te = Object.freeze({
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
}), Bn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = $e({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), y = Me(), [x, a] = ue({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [g, l] = W(te), m = E(null), p = A(c), w = V(c), M = D(
    (S, _) => {
      l(S), w(_);
    },
    [l, w]
  );
  return [
    D(
      (S, _, C) => {
        const { gl: I, pointer: R } = S;
        M(_, C), g.texture ? (p("uIsTexture", !0), p("uTexture", g.texture)) : p("uIsTexture", !1), g.map ? (p("uIsMap", !0), p("uMap", g.map), p("uMapIntensity", g.mapIntensity)) : p("uIsMap", !1), p("uRadius", g.radius), p("uSmudge", g.smudge), p("uDissipation", g.dissipation), p("uMotionBlur", g.motionBlur), p("uMotionSample", g.motionSample);
        const F = g.pointerValues || y(R);
        F.isVelocityUpdate && (p("uMouse", F.currentPointer), p("uPrevMouse", F.prevPointer)), p("uVelocity", F.velocity);
        const P = typeof g.color == "function" ? g.color(F.velocity) : g.color;
        return p("uColor", P), p("uIsCursor", g.isCursor), p("uPressureEnd", g.pressure), m.current === null && (m.current = g.pressure), p("uPressureStart", m.current), m.current = g.pressure, a(I, ({ read: U }) => {
          p("uBuffer", U);
        });
      },
      [p, y, a, g, M]
    ),
    M,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
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
}`, je = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const qe = () => b(() => new i.ShaderMaterial({
  vertexShader: J,
  fragmentShader: je,
  ...z
}), []);
var Ne = `precision highp float;

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
const ke = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: T },
      uSource: { value: T },
      texelSize: { value: new i.Vector2() },
      dt: { value: Ae },
      dissipation: { value: 0 },
      ...t
    },
    vertexShader: J,
    fragmentShader: Ne,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Ge = `precision highp float;

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
const Ke = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: Ge,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Xe = `precision highp float;

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
const Ye = ({
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
    vertexShader: J,
    fragmentShader: Xe,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var He = `precision highp float;

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
const Qe = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: He,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var Ze = `precision highp float;

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
const Je = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: Ae },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: Ze,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var et = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const tt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uTexture: { value: T },
      value: { value: 0 },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: et,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var nt = `precision highp float;

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
const rt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uPressure: { value: T },
      uVelocity: { value: T },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: nt,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]);
var ot = `precision highp float;

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
const at = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new i.ShaderMaterial({
    uniforms: {
      uTarget: { value: T },
      aspectRatio: { value: 0 },
      color: { value: new i.Vector3() },
      point: { value: new i.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new i.Vector2() },
      ...t
    },
    vertexShader: J,
    fragmentShader: ot,
    ...z
  });
  return e && (r.onBeforeCompile = e), r;
}, [e, t]), H = (e, t) => e(t ?? {}), it = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: r
}) => {
  const o = b(() => new i.PlaneGeometry(2, 2), []), {
    curl: v,
    vorticity: s,
    advection: u,
    divergence: c,
    pressure: f,
    clear: d,
    gradientSubtract: y,
    splat: x
  } = r ?? {}, a = H(qe), g = a.clone(), l = H(Qe, v), m = H(Je, s), p = H(ke, u), w = H(
    Ke,
    c
  ), M = H(Ye, f), h = H(tt, d), S = H(
    rt,
    y
  ), _ = H(at, x), C = b(
    () => ({
      vorticityMaterial: m,
      curlMaterial: l,
      advectionMaterial: p,
      divergenceMaterial: w,
      pressureMaterial: M,
      clearMaterial: h,
      gradientSubtractMaterial: S,
      splatMaterial: _
    }),
    [
      m,
      l,
      p,
      w,
      M,
      h,
      S,
      _
    ]
  ), I = Y(t, n);
  b(() => {
    A(C.splatMaterial)(
      "aspectRatio",
      I.x / I.y
    );
    for (const P of Object.values(C))
      A(P)(
        "texelSize",
        new i.Vector2(1 / I.x, 1 / I.y)
      );
  }, [I, C]);
  const R = L(e, o, a, i.Mesh);
  b(() => {
    a.dispose(), R.material = g;
  }, [a, R, g]), oe(() => () => {
    for (const P of Object.values(C))
      P.dispose();
  }, [C]);
  const F = D(
    (P) => {
      R.material = P, R.material.needsUpdate = !0;
    },
    [R]
  );
  return { materials: C, setMeshMaterial: F, mesh: R };
}, Ae = 0.016, ut = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new i.Vector3(1, 1, 1),
  pointerValues: !1
}), En = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  customFluidProps: o
}) => {
  const v = O(t), s = b(() => new i.Scene(), []), { materials: u, setMeshMaterial: c, mesh: f } = it({
    scene: s,
    size: e,
    dpr: v.shader,
    customFluidProps: o
  }), d = $(e), y = Me(), x = b(
    () => ({
      scene: s,
      camera: d,
      dpr: v.fbo,
      size: e,
      samples: n,
      isSizeUpdate: r
    }),
    [s, d, e, n, v.fbo, r]
  ), [a, g] = ue(x), [l, m] = ue(x), [p, w] = j(x), [M, h] = j(x), [S, _] = ue(x), C = E(new i.Vector2(0, 0)), I = E(new i.Vector3(0, 0, 0)), [R, F] = W(ut), P = b(
    () => ({
      advection: A(u.advectionMaterial),
      splat: A(u.splatMaterial),
      curl: A(u.curlMaterial),
      vorticity: A(u.vorticityMaterial),
      divergence: A(u.divergenceMaterial),
      clear: A(u.clearMaterial),
      pressure: A(u.pressureMaterial),
      gradientSubtract: A(u.gradientSubtractMaterial)
    }),
    [u]
  ), U = b(
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
  ), N = D(
    (X, G) => {
      F(X), G && Object.keys(G).forEach((ae) => {
        U[ae](
          G[ae]
        );
      });
    },
    [F, U]
  );
  return [
    D(
      (X, G, ae) => {
        const { gl: K, pointer: he, size: _e } = X;
        N(G, ae);
        const xe = g(K, ({ read: k }) => {
          c(u.advectionMaterial), P.advection("uVelocity", k), P.advection("uSource", k), P.advection(
            "dissipation",
            R.velocity_dissipation
          );
        }), ze = m(K, ({ read: k }) => {
          c(u.advectionMaterial), P.advection("uVelocity", xe), P.advection("uSource", k), P.advection(
            "dissipation",
            R.density_dissipation
          );
        }), me = R.pointerValues || y(he);
        me.isVelocityUpdate && (g(K, ({ read: k }) => {
          c(u.splatMaterial), P.splat("uTarget", k), P.splat("point", me.currentPointer);
          const se = me.diffPointer.multiply(
            C.current.set(_e.width, _e.height).multiplyScalar(R.velocity_acceleration)
          );
          P.splat(
            "color",
            I.current.set(se.x, se.y, 1)
          ), P.splat("radius", R.splat_radius);
        }), m(K, ({ read: k }) => {
          c(u.splatMaterial), P.splat("uTarget", k);
          const se = typeof R.fluid_color == "function" ? R.fluid_color(me.velocity) : R.fluid_color;
          P.splat("color", se);
        }));
        const Ue = w(K, () => {
          c(u.curlMaterial), P.curl("uVelocity", xe);
        });
        g(K, ({ read: k }) => {
          c(u.vorticityMaterial), P.vorticity("uVelocity", k), P.vorticity("uCurl", Ue), P.vorticity("curl", R.curl_strength);
        });
        const Oe = h(K, () => {
          c(u.divergenceMaterial), P.divergence("uVelocity", xe);
        });
        _(K, ({ read: k }) => {
          c(u.clearMaterial), P.clear("uTexture", k), P.clear("value", R.pressure_dissipation);
        }), c(u.pressureMaterial), P.pressure("uDivergence", Oe);
        let we;
        for (let k = 0; k < R.pressure_iterations; k++)
          we = _(K, ({ read: se }) => {
            P.pressure("uPressure", se);
          });
        return g(K, ({ read: k }) => {
          c(u.gradientSubtractMaterial), P.gradientSubtract("uPressure", we), P.gradientSubtract("uVelocity", k);
        }), ze;
      },
      [
        u,
        P,
        c,
        w,
        m,
        h,
        y,
        _,
        g,
        R,
        N
      ]
    ),
    N,
    {
      scene: s,
      mesh: f,
      materials: u,
      camera: d,
      renderTarget: {
        velocity: a,
        density: l,
        curl: p,
        divergence: M,
        pressure: S
      },
      output: l.read.texture
    }
  ];
};
var st = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`, lt = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const ct = ({
  scale: e,
  max: t,
  texture: n,
  scene: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = b(
    () => new i.PlaneGeometry(e, e),
    [e]
  ), u = b(() => new i.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uMap: { value: n || T },
      ...o
    },
    blending: i.AdditiveBlending,
    vertexShader: st,
    fragmentShader: lt,
    ...z,
    // Must be transparent.
    transparent: !0
  }), [n, o]), c = b(() => {
    const f = [];
    for (let d = 0; d < t; d++) {
      const y = u.clone();
      v && (y.onBeforeCompile = v);
      const x = new i.Mesh(s.clone(), y);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, r.add(x), f.push(x);
    }
    return f;
  }, [v, s, u, r, t]);
  return oe(() => () => {
    c.forEach((f) => {
      f.geometry.dispose(), Array.isArray(f.material) ? f.material.forEach((d) => d.dispose()) : f.material.dispose(), r.remove(f);
    });
  }, [r, c]), c;
}, vt = Object.freeze({
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
  samples: v,
  isSizeUpdate: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = O(o), d = b(() => new i.Scene(), []), y = ct({
    scale: t,
    max: n,
    texture: e,
    scene: d,
    uniforms: u,
    onBeforeCompile: c
  }), x = $(r), a = Me(), [g, l] = j({
    scene: d,
    camera: x,
    size: r,
    dpr: f.fbo,
    samples: v,
    isSizeUpdate: s
  }), [m, p] = W(vt), w = E(0), M = b(() => (S, _) => {
    p(S), y.forEach((C) => {
      if (C.visible) {
        const I = C.material;
        C.rotation.z += m.rotation, C.scale.x = m.fadeout_speed * C.scale.x + m.scale, C.scale.y = C.scale.x;
        const R = I.uniforms.uOpacity.value;
        A(I)(
          "uOpacity",
          R * m.fadeout_speed
        ), R < 1e-3 && (C.visible = !1);
      }
      V(C.material)(_);
    });
  }, [y, m, p]);
  return [
    D(
      (S, _, C) => {
        const { gl: I, pointer: R, size: F } = S;
        M(_, C);
        const P = m.pointerValues || a(R);
        if (m.frequency < P.diffPointer.length()) {
          const U = y[w.current], N = U.material;
          U.visible = !0, U.position.set(
            P.currentPointer.x * (F.width / 2),
            P.currentPointer.y * (F.height / 2),
            0
          ), U.scale.x = U.scale.y = 0, A(N)("uOpacity", m.alpha), w.current = (w.current + 1) % n;
        }
        return l(I);
      },
      [l, y, a, n, m, M]
    ),
    M,
    {
      scene: d,
      camera: x,
      meshArr: y,
      renderTarget: g,
      output: g.texture
    }
  ];
};
var mt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, pt = `precision highp float;
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
const dt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        scale: { value: ne.scale },
        timeStrength: { value: ne.timeStrength },
        noiseOctaves: { value: ne.noiseOctaves },
        fbmOctaves: { value: ne.fbmOctaves },
        warpOctaves: { value: ne.warpOctaves },
        warpDirection: { value: ne.warpDirection },
        warpStrength: { value: ne.warpStrength },
        ...t
      },
      vertexShader: mt,
      fragmentShader: pt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, ne = Object.freeze({
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
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = dt({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(ne), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: C } = M;
        return p(h, S), l("scale", a.scale), l("timeStrength", a.timeStrength), l("noiseOctaves", a.noiseOctaves), l("fbmOctaves", a.fbmOctaves), l("warpOctaves", a.warpOctaves), l("warpDirection", a.warpDirection), l("warpStrength", a.warpStrength), l("uTime", a.beat || C.getElapsedTime()), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var ft = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, gt = `precision highp float;
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
const ht = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        isTexture: { value: !1 },
        scale: { value: Q.scale },
        noise: { value: T },
        noiseStrength: { value: Q.noiseStrength },
        isNoise: { value: !1 },
        laminateLayer: { value: Q.laminateLayer },
        laminateInterval: { value: Q.laminateInterval },
        laminateDetail: { value: Q.laminateDetail },
        distortion: { value: Q.distortion },
        colorFactor: { value: Q.colorFactor },
        uTime: { value: 0 },
        timeStrength: { value: Q.timeStrength },
        ...t
      },
      vertexShader: ft,
      fragmentShader: gt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, Q = Object.freeze({
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
}), Wn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = ht({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(Q), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: C } = M;
        return p(h, S), a.texture ? (l("uTexture", a.texture), l("isTexture", !0)) : (l("isTexture", !1), l("scale", a.scale)), a.noise ? (l("noise", a.noise), l("isNoise", !0), l("noiseStrength", a.noiseStrength)) : l("isNoise", !1), l("uTime", a.beat || C.getElapsedTime()), l("laminateLayer", a.laminateLayer), l("laminateInterval", a.laminateInterval), l("laminateDetail", a.laminateDetail), l("distortion", a.distortion), l("colorFactor", a.colorFactor), l("timeStrength", a.timeStrength), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var xt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, yt = `precision highp float;

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
const bt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: ie.pattern },
        u_complexity: { value: ie.complexity },
        u_complexityAttenuation: {
          value: ie.complexityAttenuation
        },
        u_iterations: { value: ie.iterations },
        u_timeStrength: { value: ie.timeStrength },
        u_scale: { value: ie.scale },
        ...t
      },
      vertexShader: xt,
      fragmentShader: yt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, ie = Object.freeze({
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
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = bt({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(ie), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: C } = M;
        return p(h, S), l("u_pattern", a.pattern), l("u_complexity", a.complexity), l("u_complexityAttenuation", a.complexityAttenuation), l("u_iterations", a.iterations), l("u_timeStrength", a.timeStrength), l("u_scale", a.scale), l("u_time", a.beat || C.getElapsedTime()), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Mt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, St = `precision highp float;
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
const _t = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uRgbWeight: { value: le.rgbWeight },
        uColor1: { value: le.color1 },
        uColor2: { value: le.color2 },
        uColor3: { value: le.color3 },
        uColor4: { value: le.color4 },
        ...t
      },
      vertexShader: Mt,
      fragmentShader: St,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, le = Object.freeze({
  texture: T,
  color1: new i.Color().set(0.5, 0.5, 0.5),
  color2: new i.Color().set(0.5, 0.5, 0.5),
  color3: new i.Color().set(1, 1, 1),
  color4: new i.Color().set(0, 0.1, 0.2),
  rgbWeight: new i.Vector3(0.299, 0.587, 0.114)
}), qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = _t({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(le), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("uTexture", a.texture), l("uColor1", a.color1), l("uColor2", a.color2), l("uColor3", a.color3), l("uColor4", a.color4), l("uRgbWeight", a.rgbWeight), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var wt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ct = `precision highp float;

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
const Tt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uColor0: { value: ye.color0 },
        uColor1: { value: ye.color1 },
        ...t
      },
      vertexShader: wt,
      fragmentShader: Ct,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, ye = Object.freeze({
  texture: T,
  color0: new i.Color(16777215),
  color1: new i.Color(0)
}), Nn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Tt({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(ye), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("uTexture", a.texture), l("uColor0", a.color0), l("uColor1", a.color1), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Dt = `varying vec2 vUv;

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
const Rt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_map: { value: T },
        u_alphaMap: { value: T },
        u_isAlphaMap: { value: !1 },
        u_mapIntensity: { value: ce.mapIntensity },
        u_brightness: { value: ce.brightness },
        u_min: { value: ce.min },
        u_max: { value: ce.max },
        u_dodgeColor: { value: ce.dodgeColor },
        u_isDodgeColor: { value: !1 },
        ...t
      },
      vertexShader: Dt,
      fragmentShader: Pt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, ce = Object.freeze({
  texture: T,
  map: T,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new i.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Rt({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(ce), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("u_texture", a.texture), l("u_map", a.map), l("u_mapIntensity", a.mapIntensity), a.alphaMap ? (l("u_alphaMap", a.alphaMap), l("u_isAlphaMap", !0)) : l("u_isAlphaMap", !1), l("u_brightness", a.brightness), l("u_min", a.min), l("u_max", a.max), a.dodgeColor ? (l("u_dodgeColor", a.dodgeColor), l("u_isDodgeColor", !0)) : l("u_isDodgeColor", !1), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var At = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, It = `precision highp float;

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
const Ft = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    var d, y;
    const f = new i.ShaderMaterial({
      uniforms: {
        uResolution: { value: new i.Vector2() },
        uTextureResolution: { value: new i.Vector2() },
        uTexture0: { value: T },
        uTexture1: { value: T },
        padding: { value: re.padding },
        uMap: { value: T },
        edgeIntensity: { value: re.edgeIntensity },
        mapIntensity: { value: re.mapIntensity },
        epicenter: { value: re.epicenter },
        progress: { value: re.progress },
        dirX: { value: (d = re.dir) == null ? void 0 : d.x },
        dirY: { value: (y = re.dir) == null ? void 0 : y.y },
        ...r
      },
      vertexShader: At,
      fragmentShader: It,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = L(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, re = Object.freeze({
  texture0: T,
  texture1: T,
  padding: 0,
  map: T,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new i.Vector2(0, 0),
  progress: 0,
  dir: new i.Vector2(0, 0)
}), Gn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Ft({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(re), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        var F, P, U, N, ee, X, G, ae;
        const { gl: _ } = M;
        p(h, S), l("uTexture0", a.texture0), l("uTexture1", a.texture1), l("progress", a.progress);
        const C = [
          ((P = (F = a.texture0) == null ? void 0 : F.image) == null ? void 0 : P.width) || 0,
          ((N = (U = a.texture0) == null ? void 0 : U.image) == null ? void 0 : N.height) || 0
        ], I = [
          ((X = (ee = a.texture1) == null ? void 0 : ee.image) == null ? void 0 : X.width) || 0,
          ((ae = (G = a.texture1) == null ? void 0 : G.image) == null ? void 0 : ae.height) || 0
        ], R = C.map((K, he) => K + (I[he] - K) * a.progress);
        return l("uTextureResolution", R), l("padding", a.padding), l("uMap", a.map), l("mapIntensity", a.mapIntensity), l("edgeIntensity", a.edgeIntensity), l("epicenter", a.epicenter), l("dirX", a.dir.x), l("dirY", a.dir.y), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Vt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, zt = `precision highp float;

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
const Ut = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_brightness: { value: pe.brightness },
        u_min: { value: pe.min },
        u_max: { value: pe.max },
        ...t
      },
      vertexShader: Vt,
      fragmentShader: zt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, pe = Object.freeze({
  texture: T,
  brightness: new i.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), Kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Ut({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(
    pe
  ), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("u_texture", a.texture), l("u_brightness", a.brightness), l("u_min", a.min), l("u_max", a.max), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Ot = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Bt = `precision highp float;

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
const Et = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_map: { value: T },
        u_mapIntensity: { value: Ie.mapIntensity },
        ...t
      },
      vertexShader: Ot,
      fragmentShader: Bt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, Ie = Object.freeze({
  texture: T,
  map: T,
  mapIntensity: 0.3
}), Xn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Et({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(Ie), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("u_texture", a.texture), l("u_map", a.map), l("u_mapIntensity", a.mapIntensity), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
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
const Wt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uMap: { value: T },
        ...t
      },
      vertexShader: Lt,
      fragmentShader: $t,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, jt = Object.freeze({
  texture: T,
  map: T
}), Yn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Wt({
    scene: u,
    size: e,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(jt), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("uTexture", a.texture), l("uMap", a.map), x(_);
      },
      [l, x, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var qt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Nt = `precision highp float;

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
const kt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_brightness: { value: be.brightness },
        u_saturation: { value: be.saturation },
        ...t
      },
      vertexShader: qt,
      fragmentShader: Nt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, be = Object.freeze({
  texture: T,
  brightness: 1,
  saturation: 1
}), Hn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = kt({
    scene: u,
    size: e,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(be), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("u_texture", a.texture), l("u_brightness", a.brightness), l("u_saturation", a.saturation), x(_);
      },
      [l, x, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Gt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Kt = `precision highp float;

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
const Xt = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uResolution: { value: new i.Vector2() },
        uTextureResolution: { value: new i.Vector2() },
        uTexture: { value: T },
        ...r
      },
      vertexShader: Gt,
      fragmentShader: Kt,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = L(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, Yt = Object.freeze({
  texture: T
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Xt({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(Yt), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        var C, I, R, F, P, U;
        const { gl: _ } = M;
        return p(h, S), l("uTexture", a.texture), l("uTextureResolution", [
          ((R = (I = (C = a.texture) == null ? void 0 : C.source) == null ? void 0 : I.data) == null ? void 0 : R.width) || 0,
          ((U = (P = (F = a.texture) == null ? void 0 : F.source) == null ? void 0 : P.data) == null ? void 0 : U.height) || 0
        ]), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Ht = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Qt = `precision highp float;

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
const Zt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uResolution: { value: new i.Vector2(0, 0) },
        uBlurSize: { value: Fe.blurSize },
        ...t
      },
      vertexShader: Ht,
      fragmentShader: Qt,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, Fe = Object.freeze({
  texture: T,
  blurSize: 3,
  blurPower: 5
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = Zt({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, a] = ue(y), [g, l] = W(Fe), m = A(c), p = V(c), w = D(
    (h, S) => {
      l(h), p(S);
    },
    [l, p]
  );
  return [
    D(
      (h, S, _) => {
        var F, P, U, N, ee, X;
        const { gl: C } = h;
        w(S, _), m("uTexture", g.texture), m("uResolution", [
          ((U = (P = (F = g.texture) == null ? void 0 : F.source) == null ? void 0 : P.data) == null ? void 0 : U.width) || 0,
          ((X = (ee = (N = g.texture) == null ? void 0 : N.source) == null ? void 0 : ee.data) == null ? void 0 : X.height) || 0
        ]), m("uBlurSize", g.blurSize);
        let I = a(C);
        const R = g.blurPower;
        for (let G = 0; G < R; G++)
          m("uTexture", I), I = a(C);
        return I;
      },
      [a, m, g, w]
    ),
    w,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var Jt = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, en = `precision highp float;

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
const tn = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uBackbuffer: { value: T },
        uBegin: { value: de.begin },
        uEnd: { value: de.end },
        uStrength: { value: de.strength },
        ...t
      },
      vertexShader: Jt,
      fragmentShader: en,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, de = Object.freeze({
  texture: T,
  begin: new i.Vector2(0, 0),
  end: new i.Vector2(0, 0),
  strength: 0.9
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = tn({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, a] = ue(y), [g, l] = W(de), m = A(c), p = V(c), w = D(
    (h, S) => {
      l(h), p(S);
    },
    [l, p]
  );
  return [
    D(
      (h, S, _) => {
        const { gl: C } = h;
        return w(S, _), m("uTexture", g.texture), m("uBegin", g.begin), m("uEnd", g.end), m("uStrength", g.strength), a(C, ({ read: I }) => {
          m("uBackbuffer", I);
        });
      },
      [a, m, w, g]
    ),
    w,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var nn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, rn = `precision highp float;

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
const on = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new i.PlaneGeometry(2, 2), []), o = b(() => {
    const s = new i.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: ve.epicenter },
        uProgress: { value: ve.progress },
        uStrength: { value: ve.strength },
        uWidth: { value: ve.width },
        uMode: { value: 0 },
        ...t
      },
      vertexShader: nn,
      fragmentShader: rn,
      ...z
    });
    return n && (s.onBeforeCompile = n), s;
  }, [n, t]), v = L(e, r, o, i.Mesh);
  return { material: o, mesh: v };
}, ve = Object.freeze({
  epicenter: new i.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = on({ scene: u, uniforms: o, onBeforeCompile: v }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(ve), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("uEpicenter", a.epicenter), l("uProgress", a.progress), l("uWidth", a.width), l("uStrength", a.strength), l(
          "uMode",
          a.mode === "center" ? 0 : a.mode === "horizontal" ? 1 : 2
        ), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var an = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, un = `precision highp float;
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
const sn = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_resolution: { value: new i.Vector2() },
        u_keyColor: { value: Z.color },
        u_similarity: { value: Z.similarity },
        u_smoothness: { value: Z.smoothness },
        u_spill: { value: Z.spill },
        u_color: { value: Z.color },
        u_contrast: { value: Z.contrast },
        u_brightness: { value: Z.brightness },
        u_gamma: { value: Z.gamma },
        ...r
      },
      vertexShader: an,
      fragmentShader: un,
      ...z
    });
    return o && (f.onBeforeCompile = o), f;
  }, [o, r]), u = Y(t, n);
  A(s)("u_resolution", u.clone());
  const c = L(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, Z = Object.freeze({
  texture: T,
  keyColor: new i.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new i.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = sn({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), [y, x] = j({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [a, g] = W(Z), l = A(c), m = V(c), p = D(
    (M, h) => {
      g(M), m(h);
    },
    [g, m]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return p(h, S), l("u_texture", a.texture), l("u_keyColor", a.keyColor), l("u_similarity", a.similarity), l("u_smoothness", a.smoothness), l("u_spill", a.spill), l("u_color", a.color), l("u_contrast", a.contrast), l("u_brightness", a.brightness), l("u_gamma", a.gamma), x(_);
      },
      [x, l, a, p]
    ),
    p,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var ln = `precision highp float;

varying vec2 vUv;
#usf varyings

#usf uniforms

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf main
	
	gl_Position = usf_Position;
}`, cn = `precision highp float;

varying vec2 vUv;
#usf varyings

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

#usf uniforms

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf main
	
	gl_FragColor = usf_FragColor;
}`;
const vn = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: o
}) => {
  const v = b(() => new i.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new i.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uBackbuffer: { value: T },
        uTime: { value: 0 },
        uPointer: { value: new i.Vector2() },
        uResolution: { value: new i.Vector2() },
        ...r
      },
      vertexShader: ln,
      fragmentShader: cn,
      ...z
    });
    return f.onBeforeCompile = (d, y) => {
      o && o(d, y), d.fragmentShader = d.fragmentShader.replace(
        /#usf[^\n]*\n/g,
        ""
      ), d.vertexShader = d.vertexShader.replace(/#usf[^\n]*\n/g, "");
    }, f;
  }, [o, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = L(e, v, s, i.Mesh);
  return { material: s, mesh: c };
}, mn = Object.freeze({
  texture: T,
  beat: !1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: o,
  onBeforeCompile: v
}) => {
  const s = O(t), u = b(() => new i.Scene(), []), { material: c, mesh: f } = vn({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: o,
    onBeforeCompile: v
  }), d = $(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, a] = ue(y), [g, l] = W(mn), m = A(c), p = V(c), w = D(
    (h, S) => {
      l(h), p(S);
    },
    [l, p]
  );
  return [
    D(
      (h, S, _) => {
        const { gl: C, clock: I, pointer: R } = h;
        return w(S, _), m("uPointer", R), m("uTexture", g.texture), m("uTime", g.beat || I.getElapsedTime()), a(C, ({ read: F }) => {
          m("uBackbuffer", F);
        });
      },
      [a, m, g, w]
    ),
    w,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
}, pn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = L(
    e,
    t,
    n,
    i.Points
  ), o = L(
    e,
    b(() => t.clone(), [t]),
    b(() => n.clone(), [n]),
    i.Mesh
  );
  return o.visible = !1, {
    points: r,
    interactiveMesh: o
  };
};
var dn = `uniform vec2 uResolution;
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
}`, fn = `precision highp float;
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
const Te = (e, t, n, r, o) => {
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
      new i.BufferAttribute(e[0], o)
    );
    let y = "", x = "";
    e.forEach((a, g) => {
      t.setAttribute(
        `${v}${g}`,
        new i.BufferAttribute(a, o)
      ), y += `attribute vec${o} ${v}${g};
`, g === 0 ? x += `${v}${g}` : x += `,${v}${g}`;
    }), r = r.replace(
      `${s}`,
      y
    ), r = r.replace(
      `${u}`,
      `vec${o} ${c}[${e.length}] = vec${o}[](${x});
				${f}
			`
    );
  } else
    r = r.replace(`${s}`, ""), r = r.replace(`${u}`, ""), (d = t == null ? void 0 : t.attributes[n]) != null && d.array || Re && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, De = (e, t, n, r) => {
  var v;
  let o = [];
  if (e && e.length > 0) {
    (v = t == null ? void 0 : t.attributes[n]) != null && v.array ? o = [
      t.attributes[n].array,
      ...e
    ] : o = e;
    const s = Math.max(...o.map((u) => u.length));
    o.forEach((u, c) => {
      if (u.length < s) {
        const f = (s - u.length) / r, d = [], y = Array.from(u);
        for (let x = 0; x < f; x++) {
          const a = Math.floor(u.length / r * Math.random()) * r;
          for (let g = 0; g < r; g++)
            d.push(y[a + g]);
        }
        o[c] = new Float32Array([...y, ...d]);
      }
    });
  }
  return o;
}, gn = (e, t) => {
  let n = "";
  const r = {};
  let o = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((s, u) => {
    const c = `vMapArrayIndex < ${u}.1`, f = `texture2D(uMapArray${u}, uv)`;
    o += `( ${c} ) ? ${f} : `, n += `
        uniform sampler2D uMapArray${u};
      `, r[`uMapArray${u}`] = { value: s };
  }), o += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (o += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", o).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, hn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: o,
  mapArray: v,
  uniforms: s,
  onBeforeCompile: u
}) => {
  const c = b(
    () => De(r, n, "position", 3),
    [r, n]
  ), f = b(
    () => De(o, n, "uv", 2),
    [o, n]
  ), d = b(() => {
    c.length !== f.length && Re && console.log("use-shader-fx:positions and uvs are not matched");
    const x = Te(
      f,
      n,
      "uv",
      Te(
        c,
        n,
        "position",
        dn,
        3
      ),
      2
    ).replace("#usf <getWobble>", Ve), { rewritedFragmentShader: a, mapArrayUniforms: g } = gn(v, fn), l = new i.ShaderMaterial({
      vertexShader: x,
      fragmentShader: a,
      blending: i.AdditiveBlending,
      ...z,
      // Must be transparent
      transparent: !0,
      uniforms: {
        uResolution: { value: new i.Vector2(0, 0) },
        uMorphProgress: { value: B.morphProgress },
        uBlurAlpha: { value: B.blurAlpha },
        uBlurRadius: { value: B.blurRadius },
        uPointSize: { value: B.pointSize },
        uPointAlpha: { value: B.pointAlpha },
        uPicture: { value: T },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: T },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: B.color0 },
        uColor1: { value: B.color1 },
        uColor2: { value: B.color2 },
        uColor3: { value: B.color3 },
        uMap: { value: T },
        uIsMap: { value: !1 },
        uAlphaMap: { value: T },
        uIsAlphaMap: { value: !1 },
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
        uWarpTimeFrequency: {
          value: B.warpTimeFrequency
        },
        uWarpStrength: { value: B.warpStrength },
        uDisplacement: { value: T },
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
        uSizeRandomMin: { value: B.sizeRandomMin },
        uSizeRandomMax: { value: B.sizeRandomMax },
        uDivergence: { value: B.divergence },
        uDivergencePoint: { value: B.divergencePoint },
        ...g,
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
  ]), y = Y(e, t);
  return A(d)("uResolution", y.clone()), { material: d, modifiedPositions: c, modifiedUvs: f };
}, xn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: o,
  uvs: v,
  mapArray: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = O(t), d = b(() => {
    const M = r || new i.SphereGeometry(1, 32, 32);
    return M.setIndex(null), M.deleteAttribute("normal"), M;
  }, [r]), { material: y, modifiedPositions: x, modifiedUvs: a } = hn({
    size: e,
    dpr: f.shader,
    geometry: d,
    positions: o,
    uvs: v,
    mapArray: s,
    uniforms: u,
    onBeforeCompile: c
  }), { points: g, interactiveMesh: l } = pn({
    scene: n,
    geometry: d,
    material: y
  }), m = A(y), p = V(y);
  return [
    D(
      (M, h, S) => {
        M && m(
          "uTime",
          (h == null ? void 0 : h.beat) || M.clock.getElapsedTime()
        ), h !== void 0 && (m("uMorphProgress", h.morphProgress), m("uBlurAlpha", h.blurAlpha), m("uBlurRadius", h.blurRadius), m("uPointSize", h.pointSize), m("uPointAlpha", h.pointAlpha), h.picture ? (m("uPicture", h.picture), m("uIsPicture", !0)) : h.picture === !1 && m("uIsPicture", !1), h.alphaPicture ? (m("uAlphaPicture", h.alphaPicture), m("uIsAlphaPicture", !0)) : h.alphaPicture === !1 && m("uIsAlphaPicture", !1), m("uColor0", h.color0), m("uColor1", h.color1), m("uColor2", h.color2), m("uColor3", h.color3), h.map ? (m("uMap", h.map), m("uIsMap", !0)) : h.map === !1 && m("uIsMap", !1), h.alphaMap ? (m("uAlphaMap", h.alphaMap), m("uIsAlphaMap", !0)) : h.alphaMap === !1 && m("uIsAlphaMap", !1), m("uWobbleStrength", h.wobbleStrength), m(
          "uWobblePositionFrequency",
          h.wobblePositionFrequency
        ), m("uWobbleTimeFrequency", h.wobbleTimeFrequency), m("uWarpStrength", h.warpStrength), m("uWarpPositionFrequency", h.warpPositionFrequency), m("uWarpTimeFrequency", h.warpTimeFrequency), h.displacement ? (m("uDisplacement", h.displacement), m("uIsDisplacement", !0)) : h.displacement === !1 && m("uIsDisplacement", !1), m("uDisplacementIntensity", h.displacementIntensity), m(
          "uDisplacementColorIntensity",
          h.displacementColorIntensity
        ), m("uSizeRandomIntensity", h.sizeRandomIntensity), m(
          "uSizeRandomTimeFrequency",
          h.sizeRandomTimeFrequency
        ), m("uSizeRandomMin", h.sizeRandomMin), m("uSizeRandomMax", h.sizeRandomMax), m("uDivergence", h.divergence), m("uDivergencePoint", h.divergencePoint), p(S));
      },
      [m, p]
    ),
    {
      points: g,
      interactiveMesh: l,
      positions: x,
      uvs: a
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
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: o,
  geometry: v,
  positions: s,
  uvs: u,
  uniforms: c,
  onBeforeCompile: f
}) => {
  const d = O(t), y = b(() => new i.Scene(), []), [
    x,
    {
      points: a,
      interactiveMesh: g,
      positions: l,
      uvs: m
    }
  ] = xn({
    scene: y,
    size: e,
    dpr: t,
    geometry: v,
    positions: s,
    uvs: u,
    uniforms: c,
    onBeforeCompile: f
  }), [p, w] = j({
    scene: y,
    camera: o,
    size: e,
    dpr: d.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = D(
    (S, _, C) => (x(S, _, C), w(S.gl)),
    [w, x]
  ), h = D(
    (S, _) => {
      x(null, S, _);
    },
    [x]
  );
  return [
    M,
    h,
    {
      scene: y,
      points: a,
      interactiveMesh: g,
      renderTarget: p,
      output: p.texture,
      positions: l,
      uvs: m
    }
  ];
};
function yn(e, t = 1e-4) {
  t = Math.max(t, Number.EPSILON);
  const n = {}, r = e.getIndex(), o = e.getAttribute("position"), v = r ? r.count : o.count;
  let s = 0;
  const u = Object.keys(e.attributes), c = {}, f = {}, d = [], y = ["getX", "getY", "getZ", "getW"];
  for (let l = 0, m = u.length; l < m; l++) {
    const p = u[l];
    c[p] = [];
    const w = e.morphAttributes[p];
    w && (f[p] = new Array(w.length).fill(0).map(() => []));
  }
  const x = Math.log10(1 / t), a = Math.pow(10, x);
  for (let l = 0; l < v; l++) {
    const m = r ? r.getX(l) : l;
    let p = "";
    for (let w = 0, M = u.length; w < M; w++) {
      const h = u[w], S = e.getAttribute(h), _ = S.itemSize;
      for (let C = 0; C < _; C++)
        p += `${~~(S[y[C]](m) * a)},`;
    }
    if (p in n)
      d.push(n[p]);
    else {
      for (let w = 0, M = u.length; w < M; w++) {
        const h = u[w], S = e.getAttribute(h), _ = e.morphAttributes[h], C = S.itemSize, I = c[h], R = f[h];
        for (let F = 0; F < C; F++) {
          const P = y[F];
          if (I.push(S[P](m)), _)
            for (let U = 0, N = _.length; U < N; U++)
              R[U].push(_[U][P](m));
        }
      }
      n[p] = s, d.push(s), s++;
    }
  }
  const g = e.clone();
  for (let l = 0, m = u.length; l < m; l++) {
    const p = u[l], w = e.getAttribute(p), M = new w.array.constructor(c[p]), h = new Ce(M, w.itemSize, w.normalized);
    if (g.setAttribute(p, h), p in f)
      for (let S = 0; S < f[p].length; S++) {
        const _ = e.morphAttributes[p][S], C = new _.array.constructor(f[p][S]), I = new Ce(C, _.itemSize, _.normalized);
        g.morphAttributes[p][S] = I;
      }
  }
  return g.setIndex(d), g;
}
var bn = `vec3 random3(vec3 c) {
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
}`, Mn = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, Sn = `#ifdef USE_TRANSMISSION

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
  ), t;
}, _n = ({
  baseMaterial: e,
  materialParameters: t,
  onBeforeCompile: n,
  depthOnBeforeCompile: r,
  isCustomTransmission: o = !1,
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
          value: q.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: q.wobbleTimeFrequency
        },
        uWobbleStrength: { value: q.wobbleStrength },
        uWarpPositionFrequency: {
          value: q.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: q.warpTimeFrequency },
        uWarpStrength: { value: q.warpStrength },
        uColor0: { value: q.color0 },
        uColor1: { value: q.color1 },
        uColor2: { value: q.color2 },
        uColor3: { value: q.color3 },
        uColorMix: { value: q.colorMix },
        uEdgeThreshold: { value: q.edgeThreshold },
        uEdgeColor: { value: q.edgeColor },
        uChromaticAberration: {
          value: q.chromaticAberration
        },
        uAnisotropicBlur: { value: q.anisotropicBlur },
        uDistortion: { value: q.distortion },
        uDistortionScale: { value: q.distortionScale },
        uTemporalDistortion: { value: q.temporalDistortion },
        uRefractionSamples: { value: q.refractionSamples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null },
        ...v
      }
    }), c.onBeforeCompile = (d, y) => {
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
				${bn}

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
      ), c.type === "MeshPhysicalMaterial" && o && (d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${Mn}`
      ), d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${Sn}`
      )), n && n(d, y);
    }, c.needsUpdate = !0;
    const f = new i.MeshDepthMaterial({
      depthPacking: i.RGBADepthPacking
    });
    return f.onBeforeCompile = (d, y) => {
      Object.assign(d.uniforms, c.userData.uniforms), d.vertexShader = Pe(d.vertexShader), r && r(d, y);
    }, f.needsUpdate = !0, { material: c, depthMaterial: f };
  }, [
    t,
    e,
    n,
    r,
    v,
    o
  ]);
  return {
    material: s,
    depthMaterial: u
  };
}, wn = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: o,
  onBeforeCompile: v,
  depthOnBeforeCompile: s,
  uniforms: u
}) => {
  const c = b(() => {
    let m = t || new i.IcosahedronGeometry(2, 20);
    return m = yn(m), m.computeTangents(), m;
  }, [t]), { material: f, depthMaterial: d } = _n({
    baseMaterial: r,
    materialParameters: o,
    onBeforeCompile: v,
    depthOnBeforeCompile: s,
    uniforms: u,
    isCustomTransmission: n
  }), y = L(e, c, f, i.Mesh), x = f.userData, a = A(x), g = V(x);
  return [
    D(
      (m, p, w) => {
        m && a(
          "uTime",
          (p == null ? void 0 : p.beat) || m.clock.getElapsedTime()
        ), p !== void 0 && (a("uWobbleStrength", p.wobbleStrength), a(
          "uWobblePositionFrequency",
          p.wobblePositionFrequency
        ), a("uWobbleTimeFrequency", p.wobbleTimeFrequency), a("uWarpStrength", p.warpStrength), a("uWarpPositionFrequency", p.warpPositionFrequency), a("uWarpTimeFrequency", p.warpTimeFrequency), a("uColor0", p.color0), a("uColor1", p.color1), a("uColor2", p.color2), a("uColor3", p.color3), a("uColorMix", p.colorMix), a("uEdgeThreshold", p.edgeThreshold), a("uEdgeColor", p.edgeColor), a("uChromaticAberration", p.chromaticAberration), a("uAnisotropicBlur", p.anisotropicBlur), a("uDistortion", p.distortion), a("uDistortionScale", p.distortionScale), a("uRefractionSamples", p.refractionSamples), a("uTemporalDistortion", p.temporalDistortion), g(w));
      },
      [a, g]
    ),
    {
      mesh: y,
      depthMaterial: d
    }
  ];
}, q = Object.freeze({
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
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
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: o,
  geometry: v,
  baseMaterial: s,
  materialParameters: u,
  uniforms: c,
  onBeforeCompile: f,
  depthOnBeforeCompile: d,
  isCustomTransmission: y
}) => {
  const x = O(t), a = b(() => new i.Scene(), []), [g, { mesh: l, depthMaterial: m }] = wn({
    baseMaterial: s,
    materialParameters: u,
    scene: a,
    geometry: v,
    uniforms: c,
    onBeforeCompile: f,
    depthOnBeforeCompile: d,
    isCustomTransmission: y
  }), [p, w] = j({
    scene: a,
    camera: o,
    size: e,
    dpr: x.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = D(
    (S, _, C) => (g(S, _, C), w(S.gl)),
    [w, g]
  ), h = D(
    (S, _) => {
      g(null, S, _);
    },
    [g]
  );
  return [
    M,
    h,
    {
      scene: a,
      mesh: l,
      depthMaterial: m,
      renderTarget: p,
      output: p.texture
    }
  ];
}, ar = (e, t, n) => {
  const r = b(() => {
    const o = new i.Mesh(t, n);
    return e.add(o), o;
  }, [t, n, e]);
  return oe(() => () => {
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
function Cn(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const ir = (e, t = "easeOutQuart") => {
  const n = e / 60, r = fe[t];
  return D(
    (v) => {
      let s = v.getElapsedTime() * n;
      const u = Math.floor(s), c = r(s - u);
      s = c + u;
      const f = Cn(u);
      return {
        beat: s,
        floor: u,
        fract: c,
        hash: f
      };
    },
    [n, r]
  );
}, ur = (e = 60) => {
  const t = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = E(null);
  return D(
    (o) => {
      const v = o.getElapsedTime();
      return n.current === null || v - n.current >= t ? (n.current = v, !0) : !1;
    },
    [t]
  );
}, Tn = (e) => {
  var r, o;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (o = e.texture) == null ? void 0 : o.length;
  return !t || !n || t !== n;
};
var Dn = `varying vec2 vUv;

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
const Rn = ({
  params: e,
  scene: t,
  uniforms: n,
  onBeforeCompile: r
}) => {
  t.children.length > 0 && (t.children.forEach((o) => {
    o instanceof i.Mesh && (o.geometry.dispose(), o.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((o, v) => {
    const s = new i.ShaderMaterial({
      uniforms: {
        u_texture: { value: o },
        u_textureResolution: {
          value: new i.Vector2(0, 0)
        },
        u_resolution: { value: new i.Vector2(0, 0) },
        u_borderRadius: {
          value: e.boderRadius[v] ? e.boderRadius[v] : 0
        },
        ...n
      },
      vertexShader: Dn,
      fragmentShader: Pn,
      ...z,
      // Must be transparent.
      transparent: !0
    });
    r && (s.onBeforeCompile = r);
    const u = new i.Mesh(new i.PlaneGeometry(1, 1), s);
    t.add(u);
  });
}, An = () => {
  const e = E([]), t = E([]);
  return D(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: o,
      params: v
    }) => {
      e.current.length > 0 && e.current.forEach((u, c) => {
        u.unobserve(t.current[c]);
      }), t.current = [], e.current = [];
      const s = new Array(v.dom.length).fill(!1);
      r.current = [...s], o.current = [...s], v.dom.forEach((u, c) => {
        const f = (y) => {
          y.forEach((x) => {
            v.onIntersect[c] && v.onIntersect[c](x), r.current[c] = x.isIntersecting;
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
}, In = () => {
  const e = E([]), t = D(
    ({
      params: n,
      customParams: r,
      size: o,
      resolutionRef: v,
      scene: s,
      isIntersectingRef: u
    }) => {
      s.children.length !== e.current.length && (e.current = new Array(s.children.length)), s.children.forEach((c, f) => {
        var x, a, g, l, m, p;
        const d = n.dom[f];
        if (!d)
          return;
        const y = d.getBoundingClientRect();
        if (e.current[f] = y, c.scale.set(y.width, y.height, 1), c.position.set(
          y.left + y.width * 0.5 - o.width * 0.5,
          -y.top - y.height * 0.5 + o.height * 0.5,
          0
        ), u.current[f] && (n.rotation[f] && c.rotation.copy(n.rotation[f]), c instanceof i.Mesh)) {
          const w = c.material, M = A(w), h = V(w);
          M("u_texture", n.texture[f]), M("u_textureResolution", [
            ((g = (a = (x = n.texture[f]) == null ? void 0 : x.source) == null ? void 0 : a.data) == null ? void 0 : g.width) || 0,
            ((p = (m = (l = n.texture[f]) == null ? void 0 : l.source) == null ? void 0 : m.data) == null ? void 0 : p.height) || 0
          ]), M(
            "u_resolution",
            v.current.set(y.width, y.height)
          ), M(
            "u_borderRadius",
            n.boderRadius[f] ? n.boderRadius[f] : 0
          ), h(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Fn = () => {
  const e = E([]), t = E([]), n = D((r, o = !1) => {
    e.current.forEach((s, u) => {
      s && (t.current[u] = !0);
    });
    const v = o ? [...t.current] : [...e.current];
    return r < 0 ? v : v[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, Vn = (e) => ({ onView: n, onHidden: r }) => {
  const o = E(!1);
  oe(() => {
    let v;
    const s = () => {
      e.current.some((u) => u) ? o.current || (n && n(), o.current = !0) : o.current && (r && r(), o.current = !1), v = requestAnimationFrame(s);
    };
    return v = requestAnimationFrame(s), () => {
      cancelAnimationFrame(v);
    };
  }, [n, r]);
}, zn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, sr = ({ size: e, dpr: t, samples: n, isSizeUpdate: r, uniforms: o, onBeforeCompile: v }, s = []) => {
  const u = O(t), c = b(() => new i.Scene(), []), f = $(e), [d, y] = j({
    scene: c,
    camera: f,
    size: e,
    dpr: u.fbo,
    samples: n,
    isSizeUpdate: r
  }), [x, a] = W({
    ...zn,
    updateKey: performance.now()
  }), [g, l] = In(), m = E(new i.Vector2(0, 0)), [p, w] = Be(!0);
  b(
    () => w(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const M = E(null), h = b(() => T, []), S = An(), { isIntersectingOnceRef: _, isIntersectingRef: C, isIntersecting: I } = Fn(), R = Vn(C), F = b(() => (U, N) => {
    a(U), l({
      params: x,
      customParams: N,
      size: e,
      resolutionRef: m,
      scene: c,
      isIntersectingRef: C
    });
  }, [C, a, l, e, c, x]);
  return [
    D(
      (U, N, ee) => {
        const { gl: X, size: G } = U;
        if (F(N, ee), Tn(x))
          return h;
        if (p) {
          if (M.current === x.updateKey)
            return h;
          M.current = x.updateKey;
        }
        return p && (Rn({
          params: x,
          size: G,
          scene: c,
          uniforms: o,
          onBeforeCompile: v
        }), S({
          isIntersectingRef: C,
          isIntersectingOnceRef: _,
          params: x
        }), w(!1)), y(X);
      },
      [
        y,
        o,
        S,
        v,
        p,
        c,
        x,
        _,
        C,
        h,
        F
      ]
    ),
    F,
    {
      scene: c,
      camera: f,
      renderTarget: d,
      output: d.texture,
      isIntersecting: I,
      DOMRects: g,
      intersections: C.current,
      useDomView: R
    }
  ];
}, lr = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: o = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}, c) => {
  const f = E([]), d = Y(n, r);
  f.current = b(() => Array.from({ length: c }, () => {
    const x = new i.WebGLRenderTarget(
      d.x,
      d.y,
      {
        ...ge,
        samples: v,
        depthBuffer: s
      }
    );
    return u && (x.depthTexture = new i.DepthTexture(
      d.x,
      d.y,
      i.FloatType
    )), x;
  }), [c]), o && f.current.forEach(
    (x) => x.setSize(d.x, d.y)
  ), oe(() => {
    const x = f.current;
    return () => {
      x.forEach((a) => a.dispose());
    };
  }, [c]);
  const y = D(
    (x, a, g) => {
      const l = f.current[a];
      return Se({
        gl: x,
        scene: e,
        camera: t,
        fbo: l,
        onBeforeRender: () => g && g({ read: l.texture })
      }), l.texture;
    },
    [e, t]
  );
  return [f.current, y];
};
export {
  jt as ALPHABLENDING_PARAMS,
  mn as BLANK_PARAMS,
  ce as BLENDING_PARAMS,
  pe as BRIGHTNESSPICKER_PARAMS,
  te as BRUSH_PARAMS,
  Z as CHROMAKEY_PARAMS,
  Q as COLORSTRATA_PARAMS,
  le as COSPALETTE_PARAMS,
  Yt as COVERTEXTURE_PARAMS,
  Ae as DELTA_TIME,
  zn as DOMSYNCER_PARAMS,
  ye as DUOTONE_PARAMS,
  fe as Easing,
  ge as FBO_OPTION,
  ut as FLUID_PARAMS,
  Ie as FXBLENDING_PARAMS,
  re as FXTEXTURE_PARAMS,
  be as HSV_PARAMS,
  ie as MARBLE_PARAMS,
  B as MORPHPARTICLES_PARAMS,
  de as MOTIONBLUR_PARAMS,
  ne as NOISE_PARAMS,
  vt as RIPPLE_PARAMS,
  Fe as SIMPLEBLUR_PARAMS,
  ve as WAVE_PARAMS,
  q as WOBBLE3D_PARAMS,
  Se as renderFBO,
  V as setCustomUniform,
  A as setUniform,
  ar as useAddMesh,
  Yn as useAlphaBlending,
  ir as useBeat,
  nr as useBlank,
  kn as useBlending,
  Kn as useBrightnessPicker,
  Bn as useBrush,
  $ as useCamera,
  tr as useChromaKey,
  Wn as useColorStrata,
  lr as useCopyTexture,
  qn as useCosPalette,
  Qn as useCoverTexture,
  xn as useCreateMorphParticles,
  wn as useCreateWobble3D,
  sr as useDomSyncer,
  ue as useDoubleFBO,
  Nn as useDuoTone,
  ur as useFPSLimiter,
  En as useFluid,
  Xn as useFxBlending,
  Gn as useFxTexture,
  Hn as useHSV,
  jn as useMarble,
  rr as useMorphParticles,
  Jn as useMotionBlur,
  $n as useNoise,
  W as useParams,
  Me as usePointer,
  Y as useResolution,
  Ln as useRipple,
  Zn as useSimpleBlur,
  j as useSingleFBO,
  er as useWave,
  or as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
