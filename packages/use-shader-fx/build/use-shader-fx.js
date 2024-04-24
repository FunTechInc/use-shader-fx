import * as n from "three";
import { BufferAttribute as de } from "three";
import { useMemo as b, useEffect as G, useRef as F, useCallback as _, useState as De } from "react";
var Re = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ae = `precision highp float;

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
const j = (e, r = !1) => {
  const t = r ? e.width * r : e.width, a = r ? e.height * r : e.height;
  return b(
    () => new n.Vector2(t, a),
    [t, a]
  );
}, T = (e) => (r, t) => {
  t !== void 0 && e.uniforms[r] && t !== null && (e.uniforms[r].value = t);
}, U = (e, r, t, a) => {
  const s = b(() => {
    const u = new a(r, t);
    return e && e.add(u), u;
  }, [r, t, a, e]);
  return G(() => () => {
    e && e.remove(s), r.dispose(), t.dispose();
  }, [e, r, t, s]), s;
}, Ie = ({
  scene: e,
  size: r,
  dpr: t,
  onBeforeCompile: a
}) => {
  const s = b(() => new n.PlaneGeometry(2, 2), []), u = b(() => {
    const v = new n.ShaderMaterial({
      uniforms: {
        uBuffer: { value: new n.Texture() },
        uResolution: { value: new n.Vector2(0, 0) },
        uTexture: { value: new n.Texture() },
        uIsTexture: { value: !1 },
        uMap: { value: new n.Texture() },
        uIsMap: { value: !1 },
        uMapIntensity: { value: 0 },
        uRadius: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 0 },
        uMouse: { value: new n.Vector2(-10, -10) },
        uPrevMouse: { value: new n.Vector2(-10, -10) },
        uVelocity: { value: new n.Vector2(0, 0) },
        uColor: { value: new n.Vector3(1, 0, 0) },
        uIsCursor: { value: !1 },
        uPressureStart: { value: 1 },
        uPressureEnd: { value: 1 }
      },
      vertexShader: Re,
      fragmentShader: Ae
    });
    return a && (v.onBeforeCompile = a), v;
  }, [a]), l = j(r, t);
  T(u)("uResolution", l.clone());
  const c = U(e, s, u, n.Mesh);
  return { material: u, mesh: c };
}, Fe = (e, r) => {
  const t = r, a = e / r, [s, u] = [t * a / 2, t / 2];
  return { width: s, height: u, near: -1e3, far: 1e3 };
}, O = (e, r = "OrthographicCamera") => {
  const t = j(e), { width: a, height: s, near: u, far: l } = Fe(
    t.x,
    t.y
  );
  return b(() => r === "OrthographicCamera" ? new n.OrthographicCamera(
    -a,
    a,
    s,
    -s,
    u,
    l
  ) : new n.PerspectiveCamera(50, a / s), [a, s, u, l, r]);
}, se = (e = 0) => {
  const r = F(new n.Vector2(0, 0)), t = F(new n.Vector2(0, 0)), a = F(new n.Vector2(0, 0)), s = F(0), u = F(new n.Vector2(0, 0)), l = F(!1);
  return _(
    (v) => {
      const p = performance.now();
      let m;
      l.current && e ? (a.current = a.current.lerp(
        v,
        1 - e
      ), m = a.current.clone()) : (m = v.clone(), a.current = m), s.current === 0 && (s.current = p, r.current = m);
      const d = Math.max(1, p - s.current);
      s.current = p, u.current.copy(m).sub(r.current).divideScalar(d);
      const i = u.current.length() > 0, f = l.current ? r.current.clone() : m;
      return !l.current && i && (l.current = !0), r.current = m, {
        currentPointer: m,
        prevPointer: f,
        diffPointer: t.current.subVectors(m, f),
        velocity: u.current,
        isVelocityUpdate: i
      };
    },
    [e]
  );
}, B = (e) => {
  const t = F(
    ((s) => Object.values(s).some((u) => typeof u == "function"))(e) ? e : structuredClone(e)
  ), a = _((s) => {
    for (const u in s) {
      const l = u;
      l in t.current && s[l] !== void 0 && s[l] !== null ? t.current[l] = s[l] : console.error(
        `"${String(
          l
        )}" does not exist in the params. or "${String(
          l
        )}" is null | undefined`
      );
    }
  }, []);
  return [t.current, a];
}, te = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  stencilBuffer: !1
}, le = ({
  gl: e,
  fbo: r,
  scene: t,
  camera: a,
  onBeforeRender: s,
  onSwap: u
}) => {
  e.setRenderTarget(r), s(), e.clear(), e.render(t, a), u && u(), e.setRenderTarget(null), e.clear();
}, L = ({
  scene: e,
  camera: r,
  size: t,
  dpr: a = !1,
  isSizeUpdate: s = !1,
  samples: u = 0,
  depthBuffer: l = !1,
  depthTexture: c = !1
}) => {
  var d;
  const v = F(), p = j(t, a);
  v.current = b(
    () => {
      const i = new n.WebGLRenderTarget(
        p.x,
        p.y,
        {
          ...te,
          samples: u,
          depthBuffer: l
        }
      );
      return c && (i.depthTexture = new n.DepthTexture(
        p.x,
        p.y,
        n.FloatType
      )), i;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), s && ((d = v.current) == null || d.setSize(p.x, p.y)), G(() => {
    const i = v.current;
    return () => {
      i == null || i.dispose();
    };
  }, []);
  const m = _(
    (i, f) => {
      const o = v.current;
      return le({
        gl: i,
        fbo: o,
        scene: e,
        camera: r,
        onBeforeRender: () => f && f({ read: o.texture })
      }), o.texture;
    },
    [e, r]
  );
  return [v.current, m];
}, Y = ({
  scene: e,
  camera: r,
  size: t,
  dpr: a = !1,
  isSizeUpdate: s = !1,
  samples: u = 0,
  depthBuffer: l = !1,
  depthTexture: c = !1
}) => {
  var i, f;
  const v = F({
    read: null,
    write: null,
    swap: function() {
      let o = this.read;
      this.read = this.write, this.write = o;
    }
  }), p = j(t, a), m = b(() => {
    const o = new n.WebGLRenderTarget(p.x, p.y, {
      ...te,
      samples: u,
      depthBuffer: l
    }), g = new n.WebGLRenderTarget(p.x, p.y, {
      ...te,
      samples: u,
      depthBuffer: l
    });
    return c && (o.depthTexture = new n.DepthTexture(
      p.x,
      p.y,
      n.FloatType
    ), g.depthTexture = new n.DepthTexture(
      p.x,
      p.y,
      n.FloatType
    )), { read: o, write: g };
  }, []);
  v.current.read = m.read, v.current.write = m.write, s && ((i = v.current.read) == null || i.setSize(p.x, p.y), (f = v.current.write) == null || f.setSize(p.x, p.y)), G(() => {
    const o = v.current;
    return () => {
      var g, x;
      (g = o.read) == null || g.dispose(), (x = o.write) == null || x.dispose();
    };
  }, []);
  const d = _(
    (o, g) => {
      var y;
      const x = v.current;
      return le({
        gl: o,
        scene: e,
        camera: r,
        fbo: x.write,
        onBeforeRender: () => g && g({
          read: x.read.texture,
          write: x.write.texture
        }),
        onSwap: () => x.swap()
      }), (y = x.read) == null ? void 0 : y.texture;
    },
    [e, r]
  );
  return [
    { read: v.current.read, write: v.current.write },
    d
  ];
}, V = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, Ve = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new n.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), Wt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Ie({
    scene: l,
    size: e,
    dpr: u.shader,
    onBeforeCompile: s
  }), p = O(e), m = se(), [d, i] = Y({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [f, o] = B(Ve), g = F(null), x = T(c);
  return [
    _(
      (h, w) => {
        const { gl: M, pointer: C } = h;
        w && o(w), f.texture ? (x("uIsTexture", !0), x("uTexture", f.texture)) : x("uIsTexture", !1), f.map ? (x("uIsMap", !0), x("uMap", f.map), x("uMapIntensity", f.mapIntensity)) : x("uIsMap", !1), x("uRadius", f.radius), x("uSmudge", f.smudge), x("uDissipation", f.dissipation), x("uMotionBlur", f.motionBlur), x("uMotionSample", f.motionSample);
        const S = f.pointerValues || m(C);
        S.isVelocityUpdate && (x("uMouse", S.currentPointer), x("uPrevMouse", S.prevPointer)), x("uVelocity", S.velocity);
        const D = typeof f.color == "function" ? f.color(S.velocity) : f.color;
        return x("uColor", D), x("uIsCursor", f.isCursor), x("uPressureEnd", f.pressure), g.current === null && (g.current = f.pressure), x("uPressureStart", g.current), g.current = f.pressure, i(M, ({ read: A }) => {
          x("uBuffer", A);
        });
      },
      [x, m, i, f, o]
    ),
    o,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: d,
      output: d.read.texture
    }
  ];
};
var K = `varying vec2 vUv;
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
}`, ze = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Ue = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    vertexShader: K,
    fragmentShader: ze,
    depthTest: !1,
    depthWrite: !1
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var Oe = `precision highp float;

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
const Be = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: K,
    fragmentShader: Oe
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var We = `precision highp float;

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
const Le = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: We
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var $e = `precision highp float;

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
const Ee = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: $e
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var qe = `precision highp float;

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
const je = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: qe
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var ke = `precision highp float;

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
const Ne = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: ke
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var Ge = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ke = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: Ge
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var Xe = `precision highp float;

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
const Ye = ({
  onBeforeCompile: e
}) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: Xe
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]);
var He = `precision highp float;

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
const Qe = ({ onBeforeCompile: e }) => b(() => {
  const t = new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: K,
    fragmentShader: He
  });
  return e && (t.onBeforeCompile = e), t;
}, [e]), N = (e, r) => {
  const t = r == null ? void 0 : r.onBeforeCompile;
  return e({
    onBeforeCompile: t
  });
}, Ze = ({
  scene: e,
  size: r,
  dpr: t,
  fluidOnBeforeCompile: a
}) => {
  const s = b(() => new n.PlaneGeometry(2, 2), []), {
    initial: u,
    curl: l,
    vorticity: c,
    advection: v,
    divergence: p,
    pressure: m,
    clear: d,
    gradientSubtract: i,
    splat: f
  } = a ?? {}, o = N(Ue, u), g = o.clone(), x = N(je, l), y = N(Ne, c), h = N(Be, v), w = N(
    Le,
    p
  ), M = N(Ee, m), C = N(Ke, d), S = N(
    Ye,
    i
  ), D = N(Qe, f), A = b(
    () => ({
      vorticityMaterial: y,
      curlMaterial: x,
      advectionMaterial: h,
      divergenceMaterial: w,
      pressureMaterial: M,
      clearMaterial: C,
      gradientSubtractMaterial: S,
      splatMaterial: D
    }),
    [
      y,
      x,
      h,
      w,
      M,
      C,
      S,
      D
    ]
  ), R = j(r, t);
  b(() => {
    T(A.splatMaterial)(
      "aspectRatio",
      R.x / R.y
    );
    for (const I of Object.values(A))
      T(I)(
        "texelSize",
        new n.Vector2(1 / R.x, 1 / R.y)
      );
  }, [R, A]);
  const P = U(e, s, o, n.Mesh);
  b(() => {
    o.dispose(), P.material = g;
  }, [o, P, g]), G(() => () => {
    for (const I of Object.values(A))
      I.dispose();
  }, [A]);
  const $ = _(
    (I) => {
      P.material = I, P.material.needsUpdate = !0;
    },
    [P]
  );
  return { materials: A, setMeshMaterial: $, mesh: P };
}, Je = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new n.Vector3(1, 1, 1),
  pointerValues: !1
}), Lt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  fluidOnBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { materials: c, setMeshMaterial: v, mesh: p } = Ze({
    scene: l,
    size: e,
    dpr: u.shader,
    fluidOnBeforeCompile: s
  }), m = O(e), d = se(), i = b(
    () => ({
      scene: l,
      camera: m,
      dpr: u.fbo,
      size: e,
      samples: t,
      isSizeUpdate: a
    }),
    [l, m, e, t, u.fbo, a]
  ), [f, o] = Y(i), [g, x] = Y(i), [y, h] = L(i), [w, M] = L(i), [C, S] = Y(i), D = F(0), A = F(new n.Vector2(0, 0)), R = F(new n.Vector3(0, 0, 0)), [P, $] = B(Je), I = T(c.advectionMaterial), q = T(c.splatMaterial), Q = T(c.curlMaterial), X = T(c.vorticityMaterial), ce = T(c.divergenceMaterial), re = T(c.clearMaterial), oe = T(c.pressureMaterial), ae = T(
    c.gradientSubtractMaterial
  );
  return [
    _(
      (Se, ve) => {
        const { gl: k, pointer: _e, clock: ie, size: me } = Se;
        ve && $(ve), D.current === 0 && (D.current = ie.getElapsedTime());
        const pe = Math.min(
          (ie.getElapsedTime() - D.current) / 3,
          0.02
        );
        D.current = ie.getElapsedTime();
        const ue = o(k, ({ read: E }) => {
          v(c.advectionMaterial), I("uVelocity", E), I("uSource", E), I("dt", pe), I("dissipation", P.velocity_dissipation);
        }), Te = x(k, ({ read: E }) => {
          v(c.advectionMaterial), I("uVelocity", ue), I("uSource", E), I("dissipation", P.density_dissipation);
        }), ee = P.pointerValues || d(_e);
        ee.isVelocityUpdate && (o(k, ({ read: E }) => {
          v(c.splatMaterial), q("uTarget", E), q("point", ee.currentPointer);
          const H = ee.diffPointer.multiply(
            A.current.set(me.width, me.height).multiplyScalar(P.velocity_acceleration)
          );
          q(
            "color",
            R.current.set(H.x, H.y, 1)
          ), q("radius", P.splat_radius);
        }), x(k, ({ read: E }) => {
          v(c.splatMaterial), q("uTarget", E);
          const H = typeof P.fluid_color == "function" ? P.fluid_color(ee.velocity) : P.fluid_color;
          q("color", H);
        }));
        const Ce = h(k, () => {
          v(c.curlMaterial), Q("uVelocity", ue);
        });
        o(k, ({ read: E }) => {
          v(c.vorticityMaterial), X("uVelocity", E), X("uCurl", Ce), X("curl", P.curl_strength), X("dt", pe);
        });
        const Pe = M(k, () => {
          v(c.divergenceMaterial), ce("uVelocity", ue);
        });
        S(k, ({ read: E }) => {
          v(c.clearMaterial), re("uTexture", E), re("value", P.pressure_dissipation);
        }), v(c.pressureMaterial), oe("uDivergence", Pe);
        let fe;
        for (let E = 0; E < P.pressure_iterations; E++)
          fe = S(k, ({ read: H }) => {
            oe("uPressure", H);
          });
        return o(k, ({ read: E }) => {
          v(c.gradientSubtractMaterial), ae("uPressure", fe), ae("uVelocity", E);
        }), Te;
      },
      [
        c,
        I,
        re,
        Q,
        ce,
        ae,
        oe,
        q,
        X,
        v,
        h,
        x,
        M,
        d,
        S,
        o,
        $,
        P
      ]
    ),
    $,
    {
      scene: l,
      mesh: p,
      materials: c,
      camera: m,
      renderTarget: {
        velocity: f,
        density: g,
        curl: y,
        divergence: w,
        pressure: C
      },
      output: g.read.texture
    }
  ];
}, en = ({
  scale: e,
  max: r,
  texture: t,
  scene: a,
  onBeforeCompile: s
}) => {
  const u = F([]), l = b(
    () => new n.PlaneGeometry(e, e),
    [e]
  ), c = b(() => {
    const v = new n.MeshBasicMaterial({
      map: t,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    });
    return s && (v.onBeforeCompile = s), v;
  }, [t, s]);
  return G(() => {
    for (let v = 0; v < r; v++) {
      const p = new n.Mesh(l.clone(), c.clone());
      p.rotateZ(2 * Math.PI * Math.random()), p.visible = !1, a.add(p), u.current.push(p);
    }
  }, [l, c, a, r]), G(() => () => {
    u.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((p) => p.dispose()) : v.material.dispose(), a.remove(v);
    }), u.current = [];
  }, [a]), u.current;
}, nn = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), $t = ({
  texture: e = new n.Texture(),
  scale: r = 64,
  max: t = 100,
  size: a,
  dpr: s,
  samples: u,
  isSizeUpdate: l,
  onBeforeCompile: c
}) => {
  const v = V(s), p = b(() => new n.Scene(), []), m = en({
    scale: r,
    max: t,
    texture: e,
    scene: p,
    onBeforeCompile: c
  }), d = O(a), i = se(), [f, o] = L({
    scene: p,
    camera: d,
    size: a,
    dpr: v.fbo,
    samples: u,
    isSizeUpdate: l
  }), [g, x] = B(nn), y = F(0);
  return [
    _(
      (w, M) => {
        const { gl: C, pointer: S, size: D } = w;
        M && x(M);
        const A = g.pointerValues || i(S);
        if (g.frequency < A.diffPointer.length()) {
          const R = m[y.current];
          R.visible = !0, R.position.set(
            A.currentPointer.x * (D.width / 2),
            A.currentPointer.y * (D.height / 2),
            0
          ), R.scale.x = R.scale.y = 0, R.material.opacity = g.alpha, y.current = (y.current + 1) % t;
        }
        return m.forEach((R) => {
          if (R.visible) {
            const P = R.material;
            R.rotation.z += g.rotation, P.opacity *= g.fadeout_speed, R.scale.x = g.fadeout_speed * R.scale.x + g.scale, R.scale.y = R.scale.x, P.opacity < 2e-3 && (R.visible = !1);
          }
        }), o(C);
      },
      [o, m, i, t, g, x]
    ),
    x,
    {
      scene: p,
      camera: d,
      meshArr: m,
      renderTarget: f,
      output: f.texture
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
const on = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        scale: { value: 0 },
        timeStrength: { value: 0 },
        noiseOctaves: { value: 0 },
        fbmOctaves: { value: 0 },
        warpOctaves: { value: 0 },
        warpDirection: { value: new n.Vector2() },
        warpStrength: { value: 0 }
      },
      vertexShader: tn,
      fragmentShader: rn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, an = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new n.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), Et = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = on({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(an), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h, clock: w } = x;
        return y && f(y), o("scale", i.scale), o("timeStrength", i.timeStrength), o("noiseOctaves", i.noiseOctaves), o("fbmOctaves", i.fbmOctaves), o("warpOctaves", i.warpOctaves), o("warpDirection", i.warpDirection), o("warpStrength", i.warpStrength), o("uTime", i.beat || w.getElapsedTime()), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
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
const ln = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        isTexture: { value: !1 },
        scale: { value: 1 },
        noise: { value: new n.Texture() },
        noiseStrength: { value: new n.Vector2(0, 0) },
        isNoise: { value: !1 },
        laminateLayer: { value: 1 },
        laminateInterval: { value: new n.Vector2(0.1, 0.1) },
        laminateDetail: { value: new n.Vector2(1, 1) },
        distortion: { value: new n.Vector2(0, 0) },
        colorFactor: { value: new n.Vector3(1, 1, 1) },
        uTime: { value: 0 },
        timeStrength: { value: new n.Vector2(0, 0) }
      },
      vertexShader: un,
      fragmentShader: sn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, cn = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new n.Vector2(0.1, 0.1),
  laminateDetail: new n.Vector2(1, 1),
  distortion: new n.Vector2(0, 0),
  colorFactor: new n.Vector3(1, 1, 1),
  timeStrength: new n.Vector2(0, 0),
  noise: !1,
  noiseStrength: new n.Vector2(0, 0),
  beat: !1
}), qt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = ln({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(cn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h, clock: w } = x;
        return y && f(y), i.texture ? (o("uTexture", i.texture), o("isTexture", !0)) : (o("isTexture", !1), o("scale", i.scale)), i.noise ? (o("noise", i.noise), o("isNoise", !0), o("noiseStrength", i.noiseStrength)) : o("isNoise", !1), o("uTime", i.beat || w.getElapsedTime()), o("laminateLayer", i.laminateLayer), o("laminateInterval", i.laminateInterval), o("laminateDetail", i.laminateDetail), o("distortion", i.distortion), o("colorFactor", i.colorFactor), o("timeStrength", i.timeStrength), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var vn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, mn = `precision highp float;

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
const pn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: 0 },
        u_complexity: { value: 0 },
        u_complexityAttenuation: { value: 0 },
        u_iterations: { value: 0 },
        u_timeStrength: { value: 0 },
        u_scale: { value: 0 }
      },
      vertexShader: vn,
      fragmentShader: mn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, fn = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), jt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = pn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(fn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h, clock: w } = x;
        return y && f(y), o("u_pattern", i.pattern), o("u_complexity", i.complexity), o("u_complexityAttenuation", i.complexityAttenuation), o("u_iterations", i.iterations), o("u_timeStrength", i.timeStrength), o("u_scale", i.scale), o("u_time", i.beat || w.getElapsedTime()), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var dn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, gn = `precision highp float;
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
const hn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uRgbWeight: { value: new n.Vector3(0.299, 0.587, 0.114) },
        uColor1: { value: new n.Color().set(0.5, 0.5, 0.5) },
        uColor2: { value: new n.Color().set(0.5, 0.5, 0.5) },
        uColor3: { value: new n.Color().set(1, 1, 1) },
        uColor4: { value: new n.Color().set(0, 0.1, 0.2) }
      },
      vertexShader: dn,
      fragmentShader: gn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, xn = Object.freeze({
  texture: new n.Texture(),
  color1: new n.Color().set(0.5, 0.5, 0.5),
  color2: new n.Color().set(0.5, 0.5, 0.5),
  color3: new n.Color().set(1, 1, 1),
  color4: new n.Color().set(0, 0.1, 0.2),
  rgbWeight: new n.Vector3(0.299, 0.587, 0.114)
}), kt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = hn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(xn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("uTexture", i.texture), o("uColor1", i.color1), o("uColor2", i.color2), o("uColor3", i.color3), o("uColor4", i.color4), o("uRgbWeight", i.rgbWeight), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var bn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, yn = `precision highp float;

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
const wn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uColor0: { value: new n.Color(16777215) },
        uColor1: { value: new n.Color(0) }
      },
      vertexShader: bn,
      fragmentShader: yn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, Mn = {
  texture: new n.Texture(),
  color0: new n.Color(16777215),
  color1: new n.Color(0)
}, Nt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = wn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(Mn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("uTexture", i.texture), o("uColor0", i.color0), o("uColor1", i.color1), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
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
const Tn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_map: { value: new n.Texture() },
        u_alphaMap: { value: new n.Texture() },
        u_isAlphaMap: { value: !1 },
        u_mapIntensity: { value: 0 },
        u_brightness: { value: new n.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 0.9 },
        u_dodgeColor: { value: new n.Color(16777215) },
        u_isDodgeColor: { value: !1 }
      },
      vertexShader: Sn,
      fragmentShader: _n
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, Cn = {
  texture: new n.Texture(),
  map: new n.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new n.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Gt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Tn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(Cn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("u_texture", i.texture), o("u_map", i.map), o("u_mapIntensity", i.mapIntensity), i.alphaMap ? (o("u_alphaMap", i.alphaMap), o("u_isAlphaMap", !0)) : o("u_isAlphaMap", !1), o("u_brightness", i.brightness), o("u_min", i.min), o("u_max", i.max), i.dodgeColor ? (o("u_dodgeColor", i.dodgeColor), o("u_isDodgeColor", !0)) : o("u_isDodgeColor", !1), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Pn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Dn = `precision highp float;

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
const Rn = ({
  scene: e,
  size: r,
  dpr: t,
  onBeforeCompile: a
}) => {
  const s = b(() => new n.PlaneGeometry(2, 2), []), u = b(() => {
    const v = new n.ShaderMaterial({
      uniforms: {
        uResolution: { value: new n.Vector2() },
        uTextureResolution: { value: new n.Vector2() },
        uTexture0: { value: new n.Texture() },
        uTexture1: { value: new n.Texture() },
        padding: { value: 0 },
        uMap: { value: new n.Texture() },
        edgeIntensity: { value: 0 },
        mapIntensity: { value: 0 },
        epicenter: { value: new n.Vector2(0, 0) },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: Pn,
      fragmentShader: Dn
    });
    return a && (v.onBeforeCompile = a), v;
  }, [a]), l = j(r, t);
  T(u)("uResolution", l.clone());
  const c = U(e, s, u, n.Mesh);
  return { material: u, mesh: c };
}, An = {
  texture0: new n.Texture(),
  texture1: new n.Texture(),
  padding: 0,
  map: new n.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  dir: new n.Vector2(0, 0)
}, Kt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Rn({
    scene: l,
    size: e,
    dpr: u.shader,
    onBeforeCompile: s
  }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    dpr: u.fbo,
    size: e,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(An), o = T(c);
  return [
    _(
      (x, y) => {
        var S, D, A, R, P, $, I, q;
        const { gl: h } = x;
        y && f(y), o("uTexture0", i.texture0), o("uTexture1", i.texture1), o("progress", i.progress);
        const w = [
          ((D = (S = i.texture0) == null ? void 0 : S.image) == null ? void 0 : D.width) || 0,
          ((R = (A = i.texture0) == null ? void 0 : A.image) == null ? void 0 : R.height) || 0
        ], M = [
          (($ = (P = i.texture1) == null ? void 0 : P.image) == null ? void 0 : $.width) || 0,
          ((q = (I = i.texture1) == null ? void 0 : I.image) == null ? void 0 : q.height) || 0
        ], C = w.map((Q, X) => Q + (M[X] - Q) * i.progress);
        return o("uTextureResolution", C), o("padding", i.padding), o("uMap", i.map), o("mapIntensity", i.mapIntensity), o("edgeIntensity", i.edgeIntensity), o("epicenter", i.epicenter), o("dirX", i.dir.x), o("dirY", i.dir.y), d(h);
      },
      [d, o, i, f]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
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
const Vn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_brightness: { value: new n.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: In,
      fragmentShader: Fn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, zn = {
  texture: new n.Texture(),
  brightness: new n.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Xt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Vn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(
    zn
  ), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("u_texture", i.texture), o("u_brightness", i.brightness), o("u_min", i.min), o("u_max", i.max), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Un = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, On = `precision highp float;

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
const Bn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_map: { value: new n.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Un,
      fragmentShader: On
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, Wn = {
  texture: new n.Texture(),
  map: new n.Texture(),
  mapIntensity: 0.3
}, Yt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Bn({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(Wn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("u_texture", i.texture), o("u_map", i.map), o("u_mapIntensity", i.mapIntensity), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Ln = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, $n = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const En = ({
  scene: e,
  size: r,
  onBeforeCompile: t
}) => {
  const a = b(() => new n.PlaneGeometry(2, 2), []), s = b(() => {
    const l = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uMap: { value: new n.Texture() }
      },
      vertexShader: Ln,
      fragmentShader: $n
    });
    return t && (l.onBeforeCompile = t), l;
  }, [t]), u = U(e, a, s, n.Mesh);
  return { material: s, mesh: u };
}, qn = {
  texture: new n.Texture(),
  map: new n.Texture()
}, Ht = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = En({ scene: l, size: e, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(qn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("uTexture", i.texture), o("uMap", i.map), d(h);
      },
      [o, d, i, f]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var jn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, kn = `precision highp float;

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
const Nn = ({
  scene: e,
  size: r,
  onBeforeCompile: t
}) => {
  const a = b(() => new n.PlaneGeometry(2, 2), []), s = b(() => {
    const l = new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: jn,
      fragmentShader: kn
    });
    return t && (l.onBeforeCompile = t), l;
  }, [t]), u = U(e, a, s, n.Mesh);
  return { material: s, mesh: u };
}, Gn = {
  texture: new n.Texture(),
  brightness: 1,
  saturation: 1
}, Qt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Nn({ scene: l, size: e, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(Gn), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("u_texture", i.texture), o("u_brightness", i.brightness), o("u_saturation", i.saturation), d(h);
      },
      [o, d, i, f]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Kn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xn = `precision highp float;

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
const Yn = ({
  scene: e,
  size: r,
  dpr: t,
  onBeforeCompile: a
}) => {
  const s = b(() => new n.PlaneGeometry(2, 2), []), u = b(() => {
    const v = new n.ShaderMaterial({
      uniforms: {
        uResolution: { value: new n.Vector2() },
        uTextureResolution: { value: new n.Vector2() },
        uTexture: { value: new n.Texture() }
      },
      vertexShader: Kn,
      fragmentShader: Xn
    });
    return a && (v.onBeforeCompile = a), v;
  }, [a]), l = j(r, t);
  T(u)("uResolution", l.clone());
  const c = U(e, s, u, n.Mesh);
  return { material: u, mesh: c };
}, Hn = {
  texture: new n.Texture()
}, Zt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Yn({
    scene: l,
    size: e,
    dpr: u.shader,
    onBeforeCompile: s
  }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    dpr: u.fbo,
    size: e,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(Hn), o = T(c);
  return [
    _(
      (x, y) => {
        var w, M, C, S, D, A;
        const { gl: h } = x;
        return y && f(y), o("uTexture", i.texture), o("uTextureResolution", [
          ((C = (M = (w = i.texture) == null ? void 0 : w.source) == null ? void 0 : M.data) == null ? void 0 : C.width) || 0,
          ((A = (D = (S = i.texture) == null ? void 0 : S.source) == null ? void 0 : D.data) == null ? void 0 : A.height) || 0
        ]), d(h);
      },
      [d, o, i, f]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Qn = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Zn = `precision highp float;

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
const Jn = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uResolution: { value: new n.Vector2(0, 0) },
        uBlurSize: { value: be.blurSize }
      },
      vertexShader: Qn,
      fragmentShader: Zn
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, be = Object.freeze({
  texture: new n.Texture(),
  blurSize: 3,
  blurPower: 5
}), Jt = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = Jn({ scene: l, onBeforeCompile: s }), p = O(e), m = b(
    () => ({
      scene: l,
      camera: p,
      size: e,
      dpr: u.fbo,
      samples: t,
      isSizeUpdate: a
    }),
    [l, p, e, u.fbo, t, a]
  ), [d, i] = Y(m), [f, o] = B(be), g = T(c);
  return [
    _(
      (y, h) => {
        var S, D, A, R, P, $;
        const { gl: w } = y;
        h && o(h), g("uTexture", f.texture), g("uResolution", [
          ((A = (D = (S = f.texture) == null ? void 0 : S.source) == null ? void 0 : D.data) == null ? void 0 : A.width) || 0,
          (($ = (P = (R = f.texture) == null ? void 0 : R.source) == null ? void 0 : P.data) == null ? void 0 : $.height) || 0
        ]), g("uBlurSize", f.blurSize);
        let M = i(w);
        const C = f.blurPower;
        for (let I = 0; I < C; I++)
          g("uTexture", M), M = i(w);
        return M;
      },
      [i, g, o, f]
    ),
    o,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: d,
      output: d.read.texture
    }
  ];
};
var et = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, nt = `precision highp float;

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
const tt = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: Z.texture },
        uBackbuffer: { value: new n.Texture() },
        uBegin: { value: Z.begin },
        uEnd: { value: Z.end },
        uStrength: { value: Z.strength }
      },
      vertexShader: et,
      fragmentShader: nt
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, Z = Object.freeze({
  texture: new n.Texture(),
  begin: new n.Vector2(0, 0),
  end: new n.Vector2(0, 0),
  strength: 0.9
}), er = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = tt({ scene: l, onBeforeCompile: s }), p = O(e), m = b(
    () => ({
      scene: l,
      camera: p,
      size: e,
      dpr: u.fbo,
      samples: t,
      isSizeUpdate: a
    }),
    [l, p, e, u.fbo, t, a]
  ), [d, i] = Y(m), [f, o] = B(Z), g = T(c);
  return [
    _(
      (y, h) => {
        const { gl: w } = y;
        return h && o(h), g("uTexture", f.texture), g("uBegin", f.begin), g("uEnd", f.end), g("uStrength", f.strength), i(w, ({ read: M }) => {
          g("uBackbuffer", M);
        });
      },
      [i, g, o, f]
    ),
    o,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: d,
      output: d.read.texture
    }
  ];
};
var rt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ot = `precision highp float;

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
const at = ({
  scene: e,
  onBeforeCompile: r
}) => {
  const t = b(() => new n.PlaneGeometry(2, 2), []), a = b(() => {
    const u = new n.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: J.epicenter },
        uProgress: { value: J.progress },
        uStrength: { value: J.strength },
        uWidth: { value: J.width },
        uMode: { value: 0 }
      },
      vertexShader: rt,
      fragmentShader: ot
    });
    return r && (u.onBeforeCompile = r), u;
  }, [r]), s = U(e, t, a, n.Mesh);
  return { material: a, mesh: s };
}, J = Object.freeze({
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), nr = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = at({ scene: l, onBeforeCompile: s }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(J), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("uEpicenter", i.epicenter), o("uProgress", i.progress), o("uWidth", i.width), o("uStrength", i.strength), o(
          "uMode",
          i.mode === "center" ? 0 : i.mode === "horizontal" ? 1 : 2
        ), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var it = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ut = `precision highp float;
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
const st = ({
  scene: e,
  size: r,
  dpr: t,
  onBeforeCompile: a
}) => {
  const s = b(() => new n.PlaneGeometry(2, 2), []), u = b(() => {
    const v = new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_resolution: { value: new n.Vector2() },
        u_keyColor: { value: new n.Color() },
        u_similarity: { value: 0 },
        u_smoothness: { value: 0 },
        u_spill: { value: 0 },
        u_color: { value: new n.Vector4() },
        u_contrast: { value: 0 },
        u_brightness: { value: 0 },
        u_gamma: { value: 0 }
      },
      vertexShader: it,
      fragmentShader: ut
    });
    return a && (v.onBeforeCompile = a), v;
  }, [a]), l = j(r, t);
  T(u)("u_resolution", l.clone());
  const c = U(e, s, u, n.Mesh);
  return { material: u, mesh: c };
}, lt = Object.freeze({
  texture: new n.Texture(),
  keyColor: new n.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new n.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), tr = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s
}) => {
  const u = V(r), l = b(() => new n.Scene(), []), { material: c, mesh: v } = st({
    scene: l,
    size: e,
    dpr: u.shader,
    onBeforeCompile: s
  }), p = O(e), [m, d] = L({
    scene: l,
    camera: p,
    size: e,
    dpr: u.fbo,
    samples: t,
    isSizeUpdate: a
  }), [i, f] = B(lt), o = T(c);
  return [
    _(
      (x, y) => {
        const { gl: h } = x;
        return y && f(y), o("u_texture", i.texture), o("u_keyColor", i.keyColor), o("u_similarity", i.similarity), o("u_smoothness", i.smoothness), o("u_spill", i.spill), o("u_color", i.color), o("u_contrast", i.contrast), o("u_brightness", i.brightness), o("u_gamma", i.gamma), d(h);
      },
      [d, o, f, i]
    ),
    f,
    {
      scene: l,
      mesh: v,
      material: c,
      camera: p,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var ct = `precision highp float;

varying vec2 vUv;

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	
	
	gl_Position = usf_Position;
}`, vt = `precision highp float;

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
const mt = ({
  scene: e,
  size: r,
  dpr: t,
  onBeforeCompile: a,
  uniforms: s
}) => {
  const u = b(() => new n.PlaneGeometry(2, 2), []), l = b(() => {
    const p = new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: ye.texture },
        uBackbuffer: { value: new n.Texture() },
        uTime: { value: 0 },
        uPointer: { value: new n.Vector2() },
        uResolution: { value: new n.Vector2() },
        ...s
      },
      vertexShader: ct,
      fragmentShader: vt
    });
    return a && (p.onBeforeCompile = a), p;
  }, [a, s]), c = j(r, t);
  T(l)("uResolution", c.clone());
  const v = U(e, u, l, n.Mesh);
  return { material: l, mesh: v };
}, ye = Object.freeze({
  texture: new n.Texture(),
  beat: !1
}), rr = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  onBeforeCompile: s,
  uniforms: u
}) => {
  const l = V(r), c = b(() => new n.Scene(), []), { material: v, mesh: p } = mt({
    scene: c,
    size: e,
    dpr: l.shader,
    onBeforeCompile: s,
    uniforms: u
  }), m = O(e), d = b(
    () => ({
      scene: c,
      camera: m,
      size: e,
      dpr: l.fbo,
      samples: t,
      isSizeUpdate: a
    }),
    [c, m, e, l.fbo, t, a]
  ), [i, f] = Y(d), [o, g] = B(ye), x = T(v);
  return [
    _(
      (h, w) => {
        const { gl: M, clock: C, pointer: S } = h;
        return w && g(w), x("uTexture", o.texture), x("uPointer", S), x("uTime", o.beat || C.getElapsedTime()), f(M, ({ read: D }) => {
          x("uBackbuffer", D);
        });
      },
      [f, x, g, o]
    ),
    g,
    {
      scene: c,
      mesh: p,
      material: v,
      camera: m,
      renderTarget: i,
      output: i.read.texture
    }
  ];
}, pt = ({
  scene: e,
  geometry: r,
  material: t
}) => {
  const a = U(
    e,
    r,
    t,
    n.Points
  ), s = U(
    e,
    b(() => r.clone(), [r]),
    b(() => t.clone(), [t]),
    n.Mesh
  );
  return s.visible = !1, {
    points: a,
    interactiveMesh: s
  };
};
var ft = `uniform vec2 uResolution;
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
}`, dt = `precision highp float;
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
}`, we = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
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
const Me = process.env.NODE_ENV === "development", ge = (e, r, t, a, s) => {
  var m;
  const u = t === "position" ? "positionTarget" : "uvTarget", l = t === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", c = t === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", v = t === "position" ? "positionsList" : "uvsList", p = t === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    r.deleteAttribute(t), r.setAttribute(
      t,
      new n.BufferAttribute(e[0], s)
    );
    let d = "", i = "";
    e.forEach((f, o) => {
      r.setAttribute(
        `${u}${o}`,
        new n.BufferAttribute(f, s)
      ), d += `attribute vec${s} ${u}${o};
`, o === 0 ? i += `${u}${o}` : i += `,${u}${o}`;
    }), a = a.replace(
      `${l}`,
      d
    ), a = a.replace(
      `${c}`,
      `vec${s} ${v}[${e.length}] = vec${s}[](${i});
				${p}
			`
    );
  } else
    a = a.replace(`${l}`, ""), a = a.replace(`${c}`, ""), (m = r == null ? void 0 : r.attributes[t]) != null && m.array || Me && console.error(
      `use-shader-fx:geometry.attributes.${t}.array is not found`
    );
  return a;
}, he = (e, r, t, a) => {
  var u;
  let s = [];
  if (e && e.length > 0) {
    (u = r == null ? void 0 : r.attributes[t]) != null && u.array ? s = [
      r.attributes[t].array,
      ...e
    ] : s = e;
    const l = Math.max(...s.map((c) => c.length));
    s.forEach((c, v) => {
      if (c.length < l) {
        const p = (l - c.length) / a, m = [], d = Array.from(c);
        for (let i = 0; i < p; i++) {
          const f = Math.floor(c.length / a * Math.random()) * a;
          for (let o = 0; o < a; o++)
            m.push(d[f + o]);
        }
        s[v] = new Float32Array([...d, ...m]);
      }
    });
  }
  return s;
}, gt = (e, r) => {
  let t = "";
  const a = {};
  let s = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((l, c) => {
    const v = `vMapArrayIndex < ${c}.1`, p = `texture2D(uMapArray${c}, uv)`;
    s += `( ${v} ) ? ${p} : `, t += `
        uniform sampler2D uMapArray${c};
      `, a[`uMapArray${c}`] = { value: l };
  }), s += "vec4(1.);", t += "bool isMapArray = true;", a.uMapArrayLength = { value: e.length }) : (s += "vec4(1.0);", t += "bool isMapArray = false;", a.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: r.replace("#usf <mapArraySwitcher>", s).replace("#usf <mapArrayUniforms>", t), mapArrayUniforms: a };
}, ht = ({
  size: e,
  dpr: r,
  geometry: t,
  positions: a,
  uvs: s,
  mapArray: u,
  onBeforeCompile: l
}) => {
  const c = b(
    () => he(a, t, "position", 3),
    [a, t]
  ), v = b(
    () => he(s, t, "uv", 2),
    [s, t]
  ), p = b(() => {
    c.length !== v.length && Me && console.log("use-shader-fx:positions and uvs are not matched");
    const d = ge(
      v,
      t,
      "uv",
      ge(
        c,
        t,
        "position",
        ft,
        3
      ),
      2
    ).replace("#usf <getWobble>", we), { rewritedFragmentShader: i, mapArrayUniforms: f } = gt(u, dt), o = new n.ShaderMaterial({
      vertexShader: d,
      fragmentShader: i,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0,
      blending: n.AdditiveBlending,
      uniforms: {
        uResolution: { value: new n.Vector2(0, 0) },
        uMorphProgress: { value: z.morphProgress },
        uBlurAlpha: { value: z.blurAlpha },
        uBlurRadius: { value: z.blurRadius },
        uPointSize: { value: z.pointSize },
        uPointAlpha: { value: z.pointAlpha },
        uPicture: { value: new n.Texture() },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: new n.Texture() },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: z.color0 },
        uColor1: { value: z.color1 },
        uColor2: { value: z.color2 },
        uColor3: { value: z.color3 },
        uMap: { value: new n.Texture() },
        uIsMap: { value: !1 },
        uAlphaMap: { value: new n.Texture() },
        uIsAlphaMap: { value: !1 },
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: z.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: z.wobbleTimeFrequency
        },
        uWobbleStrength: { value: z.wobbleStrength },
        uWarpPositionFrequency: {
          value: z.warpPositionFrequency
        },
        uWarpTimeFrequency: {
          value: z.warpTimeFrequency
        },
        uWarpStrength: { value: z.warpStrength },
        uDisplacement: { value: new n.Texture() },
        uIsDisplacement: { value: !1 },
        uDisplacementIntensity: {
          value: z.displacementIntensity
        },
        uDisplacementColorIntensity: {
          value: z.displacementColorIntensity
        },
        uSizeRandomIntensity: {
          value: z.sizeRandomIntensity
        },
        uSizeRandomTimeFrequency: {
          value: z.sizeRandomTimeFrequency
        },
        uSizeRandomMin: { value: z.sizeRandomMin },
        uSizeRandomMax: { value: z.sizeRandomMax },
        uDivergence: { value: z.divergence },
        uDivergencePoint: { value: z.divergencePoint },
        ...f
      }
    });
    return l && (o.onBeforeCompile = l), o;
  }, [
    t,
    c,
    v,
    u,
    l
  ]), m = j(e, r);
  return T(p)("uResolution", m.clone()), { material: p, modifiedPositions: c, modifiedUvs: v };
}, xt = ({
  size: e,
  dpr: r,
  scene: t = !1,
  geometry: a,
  positions: s,
  uvs: u,
  mapArray: l,
  onBeforeCompile: c
}) => {
  const v = V(r), p = b(() => {
    const y = a || new n.SphereGeometry(1, 32, 32);
    return y.setIndex(null), y.deleteAttribute("normal"), y;
  }, [a]), { material: m, modifiedPositions: d, modifiedUvs: i } = ht({
    size: e,
    dpr: v.shader,
    geometry: p,
    positions: s,
    uvs: u,
    mapArray: l,
    onBeforeCompile: c
  }), { points: f, interactiveMesh: o } = pt({
    scene: t,
    geometry: p,
    material: m
  }), g = T(m);
  return [
    _(
      (y, h) => {
        y && g("uTime", (h == null ? void 0 : h.beat) || y.clock.getElapsedTime()), h !== void 0 && (g("uMorphProgress", h.morphProgress), g("uBlurAlpha", h.blurAlpha), g("uBlurRadius", h.blurRadius), g("uPointSize", h.pointSize), g("uPointAlpha", h.pointAlpha), h.picture ? (g("uPicture", h.picture), g("uIsPicture", !0)) : h.picture === !1 && g("uIsPicture", !1), h.alphaPicture ? (g("uAlphaPicture", h.alphaPicture), g("uIsAlphaPicture", !0)) : h.alphaPicture === !1 && g("uIsAlphaPicture", !1), g("uColor0", h.color0), g("uColor1", h.color1), g("uColor2", h.color2), g("uColor3", h.color3), h.map ? (g("uMap", h.map), g("uIsMap", !0)) : h.map === !1 && g("uIsMap", !1), h.alphaMap ? (g("uAlphaMap", h.alphaMap), g("uIsAlphaMap", !0)) : h.alphaMap === !1 && g("uIsAlphaMap", !1), g("uWobbleStrength", h.wobbleStrength), g(
          "uWobblePositionFrequency",
          h.wobblePositionFrequency
        ), g("uWobbleTimeFrequency", h.wobbleTimeFrequency), g("uWarpStrength", h.warpStrength), g("uWarpPositionFrequency", h.warpPositionFrequency), g("uWarpTimeFrequency", h.warpTimeFrequency), h.displacement ? (g("uDisplacement", h.displacement), g("uIsDisplacement", !0)) : h.displacement === !1 && g("uIsDisplacement", !1), g("uDisplacementIntensity", h.displacementIntensity), g(
          "uDisplacementColorIntensity",
          h.displacementColorIntensity
        ), g("uSizeRandomIntensity", h.sizeRandomIntensity), g(
          "uSizeRandomTimeFrequency",
          h.sizeRandomTimeFrequency
        ), g("uSizeRandomMin", h.sizeRandomMin), g("uSizeRandomMax", h.sizeRandomMax), g("uDivergence", h.divergence), g("uDivergencePoint", h.divergencePoint));
      },
      [g]
    ),
    {
      points: f,
      interactiveMesh: o,
      positions: d,
      uvs: i
    }
  ];
}, z = Object.freeze({
  morphProgress: 0,
  blurAlpha: 0.9,
  blurRadius: 0.05,
  pointSize: 0.05,
  pointAlpha: 1,
  picture: !1,
  alphaPicture: !1,
  color0: new n.Color(16711680),
  color1: new n.Color(65280),
  color2: new n.Color(255),
  color3: new n.Color(16776960),
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
  divergencePoint: new n.Vector3(0),
  beat: !1
}), or = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  camera: s,
  geometry: u,
  positions: l,
  uvs: c,
  onBeforeCompile: v
}) => {
  const p = V(r), m = b(() => new n.Scene(), []), [
    d,
    {
      points: i,
      interactiveMesh: f,
      positions: o,
      uvs: g
    }
  ] = xt({
    scene: m,
    size: e,
    dpr: r,
    geometry: u,
    positions: l,
    uvs: c,
    onBeforeCompile: v
  }), [x, y] = L({
    scene: m,
    camera: s,
    size: e,
    dpr: p.fbo,
    samples: t,
    isSizeUpdate: a,
    depthBuffer: !0
  }), h = _(
    (M, C) => (d(M, C), y(M.gl)),
    [y, d]
  ), w = _(
    (M) => {
      d(null, M);
    },
    [d]
  );
  return [
    h,
    w,
    {
      scene: m,
      points: i,
      interactiveMesh: f,
      renderTarget: x,
      output: x.texture,
      positions: o,
      uvs: g
    }
  ];
};
function bt(e, r = 1e-4) {
  r = Math.max(r, Number.EPSILON);
  const t = {}, a = e.getIndex(), s = e.getAttribute("position"), u = a ? a.count : s.count;
  let l = 0;
  const c = Object.keys(e.attributes), v = {}, p = {}, m = [], d = ["getX", "getY", "getZ", "getW"];
  for (let g = 0, x = c.length; g < x; g++) {
    const y = c[g];
    v[y] = [];
    const h = e.morphAttributes[y];
    h && (p[y] = new Array(h.length).fill(0).map(() => []));
  }
  const i = Math.log10(1 / r), f = Math.pow(10, i);
  for (let g = 0; g < u; g++) {
    const x = a ? a.getX(g) : g;
    let y = "";
    for (let h = 0, w = c.length; h < w; h++) {
      const M = c[h], C = e.getAttribute(M), S = C.itemSize;
      for (let D = 0; D < S; D++)
        y += `${~~(C[d[D]](x) * f)},`;
    }
    if (y in t)
      m.push(t[y]);
    else {
      for (let h = 0, w = c.length; h < w; h++) {
        const M = c[h], C = e.getAttribute(M), S = e.morphAttributes[M], D = C.itemSize, A = v[M], R = p[M];
        for (let P = 0; P < D; P++) {
          const $ = d[P];
          if (A.push(C[$](x)), S)
            for (let I = 0, q = S.length; I < q; I++)
              R[I].push(S[I][$](x));
        }
      }
      t[y] = l, m.push(l), l++;
    }
  }
  const o = e.clone();
  for (let g = 0, x = c.length; g < x; g++) {
    const y = c[g], h = e.getAttribute(y), w = new h.array.constructor(v[y]), M = new de(w, h.itemSize, h.normalized);
    if (o.setAttribute(y, M), y in p)
      for (let C = 0; C < p[y].length; C++) {
        const S = e.morphAttributes[y][C], D = new S.array.constructor(p[y][C]), A = new de(D, S.itemSize, S.normalized);
        o.morphAttributes[y][C] = A;
      }
  }
  return o.setIndex(m), o;
}
var yt = `vec3 random3(vec3 c) {
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
}`, wt = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, Mt = `#ifdef USE_TRANSMISSION

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
const xe = (e) => {
  let r = e;
  return r = r.replace(
    "#include <beginnormal_vertex>",
    `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
  ), r = r.replace(
    "#include <begin_vertex>",
    `
		vec3 transformed = usf_Position;`
  ), r = r.replace(
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
		// #usf <getWobble>
		void main() {`
  ), r = r.replace("// #usf <getWobble>", `${we}`), r = r.replace(
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
		`
  ), r;
}, St = ({
  baseMaterial: e,
  materialParameters: r,
  onBeforeCompile: t,
  depthOnBeforeCompile: a
}) => {
  const { material: s, depthMaterial: u } = b(() => {
    const l = new (e || n.MeshPhysicalMaterial)(
      r || {}
    ), c = l.type === "MeshPhysicalMaterial" || l.type === "MeshStandardMaterial", v = l.type === "MeshPhysicalMaterial";
    Object.assign(l.userData, {
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
        uWobbleMap: { value: new n.Texture() },
        uWobbleMapStrength: { value: W.wobbleMapStrength },
        uWobbleMapDistortion: {
          value: W.wobbleMapDistortion
        },
        uColor0: { value: W.color0 },
        uColor1: { value: W.color1 },
        uColor2: { value: W.color2 },
        uColor3: { value: W.color3 },
        uColorMix: { value: W.colorMix },
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
        transmissionMap: { value: null }
      }
    }), l.onBeforeCompile = (m, d) => {
      Object.assign(m.uniforms, l.userData.uniforms), m.vertexShader = xe(m.vertexShader), m.fragmentShader = m.fragmentShader.replace(
        "#include <color_fragment>",
        `
				#include <color_fragment>
				diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
      ), c && (m.fragmentShader = m.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
      )), m.fragmentShader = m.fragmentShader.replace(
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
				${yt}

				varying float vWobble;
				varying vec2 vPosition;

				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${c ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${c ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);" : ""}`
      ), v && (m.fragmentShader = m.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${wt}`
      ), m.fragmentShader = m.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${Mt}`
      )), t && t(m, d);
    }, l.needsUpdate = !0;
    const p = new n.MeshDepthMaterial({
      depthPacking: n.RGBADepthPacking
    });
    return p.onBeforeCompile = (m, d) => {
      Object.assign(m.uniforms, l.userData.uniforms), m.vertexShader = xe(m.vertexShader), a && a(m, d);
    }, p.needsUpdate = !0, { material: l, depthMaterial: p };
  }, [
    r,
    e,
    t,
    a
  ]);
  return {
    material: s,
    depthMaterial: u
  };
}, _t = ({
  scene: e = !1,
  geometry: r,
  baseMaterial: t,
  materialParameters: a,
  onBeforeCompile: s,
  depthOnBeforeCompile: u
}) => {
  const l = b(() => {
    let f = r || new n.IcosahedronGeometry(2, 20);
    return f = bt(f), f.computeTangents(), f;
  }, [r]), { material: c, depthMaterial: v } = St({
    baseMaterial: t,
    materialParameters: a,
    onBeforeCompile: s,
    depthOnBeforeCompile: u
  }), p = U(e, l, c, n.Mesh), m = c.userData, d = T(m);
  return [
    _(
      (f, o) => {
        f && d("uTime", (o == null ? void 0 : o.beat) || f.clock.getElapsedTime()), o !== void 0 && (d("uWobbleStrength", o.wobbleStrength), d(
          "uWobblePositionFrequency",
          o.wobblePositionFrequency
        ), d("uWobbleTimeFrequency", o.wobbleTimeFrequency), d("uWarpStrength", o.warpStrength), d("uWarpPositionFrequency", o.warpPositionFrequency), d("uWarpTimeFrequency", o.warpTimeFrequency), d("uWobbleShine", o.wobbleShine), o.wobbleMap ? (d("uWobbleMap", o.wobbleMap), d("uIsWobbleMap", !0)) : o.wobbleMap === !1 && d("uIsWobbleMap", !1), d("uWobbleMapStrength", o.wobbleMapStrength), d("uWobbleMapDistortion", o.wobbleMapDistortion), d("uSamples", o.samples), d("uColor0", o.color0), d("uColor1", o.color1), d("uColor2", o.color2), d("uColor3", o.color3), d("uColorMix", o.colorMix), d("uChromaticAberration", o.chromaticAberration), d("uAnisotropicBlur", o.anisotropicBlur), d("uDistortion", o.distortion), d("uDistortionScale", o.distortionScale), d("uTemporalDistortion", o.temporalDistortion));
      },
      [d]
    ),
    {
      mesh: p,
      depthMaterial: v
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
  color0: new n.Color(16711680),
  color1: new n.Color(65280),
  color2: new n.Color(255),
  color3: new n.Color(16776960),
  colorMix: 1,
  chromaticAberration: 0.1,
  anisotropicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.1,
  temporalDistortion: 0
}), ar = ({
  size: e,
  dpr: r,
  samples: t,
  isSizeUpdate: a,
  camera: s,
  geometry: u,
  baseMaterial: l,
  materialParameters: c,
  onBeforeCompile: v,
  depthOnBeforeCompile: p
}) => {
  const m = V(r), d = b(() => new n.Scene(), []), [i, { mesh: f, depthMaterial: o }] = _t({
    baseMaterial: l,
    materialParameters: c,
    scene: d,
    geometry: u,
    onBeforeCompile: v,
    depthOnBeforeCompile: p
  }), [g, x] = L({
    scene: d,
    camera: s,
    size: e,
    dpr: m.fbo,
    samples: t,
    isSizeUpdate: a,
    depthBuffer: !0
  }), y = _(
    (w, M) => (i(w, M), x(w.gl)),
    [x, i]
  ), h = _(
    (w) => {
      i(null, w);
    },
    [i]
  );
  return [
    y,
    h,
    {
      scene: d,
      mesh: f,
      depthMaterial: o,
      renderTarget: g,
      output: g.texture
    }
  ];
}, ir = (e, r, t) => {
  const a = b(() => {
    const s = new n.Mesh(r, t);
    return e.add(s), s;
  }, [r, t, e]);
  return G(() => () => {
    e.remove(a), r.dispose(), t.dispose();
  }, [e, r, t, a]), a;
}, ne = Object.freeze({
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
    const t = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((t + 1) * 2 * e - t) / 2 : (Math.pow(2 * e - 2, 2) * ((t + 1) * (e * 2 - 2) + t) + 2) / 2;
  },
  easeInElastic(e) {
    const r = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * r);
  },
  easeOutElastic(e) {
    const r = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * r) + 1;
  },
  easeInOutElastic(e) {
    const r = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * r)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * r) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - ne.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - ne.easeOutBounce(1 - 2 * e)) / 2 : (1 + ne.easeOutBounce(2 * e - 1)) / 2;
  }
});
function Tt(e) {
  let r = Math.sin(e * 12.9898) * 43758.5453;
  return r - Math.floor(r);
}
const ur = (e, r = "easeOutQuart") => {
  const t = e / 60, a = ne[r];
  return _(
    (u) => {
      let l = u.getElapsedTime() * t;
      const c = Math.floor(l), v = a(l - c);
      l = v + c;
      const p = Tt(c);
      return {
        beat: l,
        floor: c,
        fract: v,
        hash: p
      };
    },
    [t, a]
  );
}, sr = (e = 60) => {
  const r = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), t = F(null);
  return _(
    (s) => {
      const u = s.getElapsedTime();
      return t.current === null || u - t.current >= r ? (t.current = u, !0) : !1;
    },
    [r]
  );
}, Ct = (e) => {
  var a, s;
  const r = (a = e.dom) == null ? void 0 : a.length, t = (s = e.texture) == null ? void 0 : s.length;
  return !r || !t || r !== t;
};
var Pt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Dt = `precision highp float;

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
const Rt = ({
  params: e,
  size: r,
  scene: t,
  onBeforeCompile: a
}) => {
  t.children.length > 0 && (t.children.forEach((s) => {
    s instanceof n.Mesh && (s.geometry.dispose(), s.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((s, u) => {
    const l = new n.ShaderMaterial({
      vertexShader: Pt,
      fragmentShader: Dt,
      transparent: !0,
      uniforms: {
        u_texture: { value: s },
        u_textureResolution: {
          value: new n.Vector2(0, 0)
        },
        u_resolution: { value: new n.Vector2(0, 0) },
        u_borderRadius: {
          value: e.boderRadius[u] ? e.boderRadius[u] : 0
        }
      }
    });
    a && (l.onBeforeCompile = a);
    const c = new n.Mesh(new n.PlaneGeometry(1, 1), l);
    t.add(c);
  });
}, At = () => {
  const e = F([]), r = F([]);
  return _(
    ({
      isIntersectingRef: a,
      isIntersectingOnceRef: s,
      params: u
    }) => {
      e.current.length > 0 && e.current.forEach((c, v) => {
        c.unobserve(r.current[v]);
      }), r.current = [], e.current = [];
      const l = new Array(u.dom.length).fill(!1);
      a.current = [...l], s.current = [...l], u.dom.forEach((c, v) => {
        const p = (d) => {
          d.forEach((i) => {
            u.onIntersect[v] && u.onIntersect[v](i), a.current[v] = i.isIntersecting;
          });
        }, m = new IntersectionObserver(p, {
          rootMargin: "0px",
          threshold: 0
        });
        m.observe(c), e.current.push(m), r.current.push(c);
      });
    },
    []
  );
}, It = () => {
  const e = F([]), r = _(
    ({ params: t, size: a, resolutionRef: s, scene: u, isIntersectingRef: l }) => {
      u.children.length !== e.current.length && (e.current = new Array(u.children.length)), u.children.forEach((c, v) => {
        var d, i, f, o, g, x;
        const p = t.dom[v];
        if (!p)
          return;
        const m = p.getBoundingClientRect();
        if (e.current[v] = m, c.scale.set(m.width, m.height, 1), c.position.set(
          m.left + m.width * 0.5 - a.width * 0.5,
          -m.top - m.height * 0.5 + a.height * 0.5,
          0
        ), l.current[v] && (t.rotation[v] && c.rotation.copy(t.rotation[v]), c instanceof n.Mesh)) {
          const y = c.material, h = T(y);
          h("u_texture", t.texture[v]), h("u_textureResolution", [
            ((f = (i = (d = t.texture[v]) == null ? void 0 : d.source) == null ? void 0 : i.data) == null ? void 0 : f.width) || 0,
            ((x = (g = (o = t.texture[v]) == null ? void 0 : o.source) == null ? void 0 : g.data) == null ? void 0 : x.height) || 0
          ]), h(
            "u_resolution",
            s.current.set(m.width, m.height)
          ), h(
            "u_borderRadius",
            t.boderRadius[v] ? t.boderRadius[v] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, r];
}, Ft = () => {
  const e = F([]), r = F([]), t = _((a, s = !1) => {
    e.current.forEach((l, c) => {
      l && (r.current[c] = !0);
    });
    const u = s ? [...r.current] : [...e.current];
    return a < 0 ? u : u[a];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: r,
    isIntersecting: t
  };
}, Vt = (e) => ({ onView: t, onHidden: a }) => {
  const s = F(!1);
  G(() => {
    let u;
    const l = () => {
      e.current.some((c) => c) ? s.current || (t && t(), s.current = !0) : s.current && (a && a(), s.current = !1), u = requestAnimationFrame(l);
    };
    return u = requestAnimationFrame(l), () => {
      cancelAnimationFrame(u);
    };
  }, [t, a]);
}, zt = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, lr = ({ size: e, dpr: r, samples: t, isSizeUpdate: a, onBeforeCompile: s }, u = []) => {
  const l = V(r), c = b(() => new n.Scene(), []), v = O(e), [p, m] = L({
    scene: c,
    camera: v,
    size: e,
    dpr: l.fbo,
    samples: t,
    isSizeUpdate: a
  }), [d, i] = B({
    ...zt,
    updateKey: performance.now()
  }), [f, o] = It(), g = F(new n.Vector2(0, 0)), [x, y] = De(!0);
  b(
    () => y(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    u
  );
  const h = F(null), w = b(() => new n.Texture(), []), M = At(), { isIntersectingOnceRef: C, isIntersectingRef: S, isIntersecting: D } = Ft(), A = Vt(S);
  return [
    _(
      (P, $) => {
        const { gl: I, size: q } = P;
        if ($ && i($), Ct(d))
          return w;
        if (x) {
          if (h.current === d.updateKey)
            return w;
          h.current = d.updateKey;
        }
        return x && (Rt({
          params: d,
          size: q,
          scene: c,
          onBeforeCompile: s
        }), M({
          isIntersectingRef: S,
          isIntersectingOnceRef: C,
          params: d
        }), y(!1)), o({
          params: d,
          size: q,
          resolutionRef: g,
          scene: c,
          isIntersectingRef: S
        }), m(I);
      },
      [
        m,
        i,
        M,
        o,
        s,
        x,
        c,
        d,
        C,
        S,
        w
      ]
    ),
    i,
    {
      scene: c,
      camera: v,
      renderTarget: p,
      output: p.texture,
      isIntersecting: D,
      DOMRects: f,
      intersections: S.current,
      useDomView: A
    }
  ];
}, cr = ({
  scene: e,
  camera: r,
  size: t,
  dpr: a = !1,
  isSizeUpdate: s = !1,
  samples: u = 0,
  depthBuffer: l = !1,
  depthTexture: c = !1
}, v) => {
  const p = F([]), m = j(t, a);
  p.current = b(() => Array.from({ length: v }, () => {
    const i = new n.WebGLRenderTarget(
      m.x,
      m.y,
      {
        ...te,
        samples: u,
        depthBuffer: l
      }
    );
    return c && (i.depthTexture = new n.DepthTexture(
      m.x,
      m.y,
      n.FloatType
    )), i;
  }), [v]), s && p.current.forEach(
    (i) => i.setSize(m.x, m.y)
  ), G(() => {
    const i = p.current;
    return () => {
      i.forEach((f) => f.dispose());
    };
  }, [v]);
  const d = _(
    (i, f, o) => {
      const g = p.current[f];
      return le({
        gl: i,
        scene: e,
        camera: r,
        fbo: g,
        onBeforeRender: () => o && o({ read: g.texture })
      }), g.texture;
    },
    [e, r]
  );
  return [p.current, d];
};
export {
  qn as ALPHABLENDING_PARAMS,
  ye as BLANK_PARAMS,
  Cn as BLENDING_PARAMS,
  zn as BRIGHTNESSPICKER_PARAMS,
  Ve as BRUSH_PARAMS,
  lt as CHROMAKEY_PARAMS,
  cn as COLORSTRATA_PARAMS,
  xn as COSPALETTE_PARAMS,
  Hn as COVERTEXTURE_PARAMS,
  zt as DOMSYNCER_PARAMS,
  Mn as DUOTONE_PARAMS,
  ne as Easing,
  te as FBO_OPTION,
  Je as FLUID_PARAMS,
  Wn as FXBLENDING_PARAMS,
  An as FXTEXTURE_PARAMS,
  Gn as HSV_PARAMS,
  fn as MARBLE_PARAMS,
  z as MORPHPARTICLES_PARAMS,
  Z as MOTIONBLUR_PARAMS,
  an as NOISE_PARAMS,
  nn as RIPPLE_PARAMS,
  be as SIMPLEBLUR_PARAMS,
  J as WAVE_PARAMS,
  W as WOBBLE3D_PARAMS,
  le as renderFBO,
  T as setUniform,
  ir as useAddMesh,
  Ht as useAlphaBlending,
  ur as useBeat,
  rr as useBlank,
  Gt as useBlending,
  Xt as useBrightnessPicker,
  Wt as useBrush,
  O as useCamera,
  tr as useChromaKey,
  qt as useColorStrata,
  cr as useCopyTexture,
  kt as useCosPalette,
  Zt as useCoverTexture,
  xt as useCreateMorphParticles,
  _t as useCreateWobble3D,
  lr as useDomSyncer,
  Y as useDoubleFBO,
  Nt as useDuoTone,
  sr as useFPSLimiter,
  Lt as useFluid,
  Yt as useFxBlending,
  Kt as useFxTexture,
  Qt as useHSV,
  jt as useMarble,
  or as useMorphParticles,
  er as useMotionBlur,
  Et as useNoise,
  B as useParams,
  se as usePointer,
  j as useResolution,
  $t as useRipple,
  Jt as useSimpleBlur,
  L as useSingleFBO,
  nr as useWave,
  ar as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
