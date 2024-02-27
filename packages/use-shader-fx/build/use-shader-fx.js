import * as n from "three";
import { useMemo as d, useEffect as P, useRef as T, useCallback as w, useLayoutEffect as H, useState as oe } from "react";
var ae = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ue = `precision highp float;

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
const L = (e, a = !1) => {
  const o = a ? e.width * a : e.width, u = a ? e.height * a : e.height;
  return d(
    () => new n.Vector2(o, u),
    [o, u]
  );
}, U = (e, a, o) => {
  const u = d(
    () => new n.Mesh(a, o),
    [a, o]
  );
  return P(() => {
    e.add(u);
  }, [e, u]), P(() => () => {
    e.remove(u), a.dispose(), o.dispose();
  }, [e, a, o, u]), u;
}, i = (e, a, o) => {
  e.uniforms && e.uniforms[a] && o !== void 0 && o !== null ? e.uniforms[a].value = o : console.error(
    `Uniform key "${String(
      a
    )}" does not exist in the material. or "${String(
      a
    )}" is null | undefined`
  );
}, ie = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
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
      vertexShader: ae,
      fragmentShader: ue
    }),
    []
  ), s = L(a, o);
  return P(() => {
    i(t, "uResolution", s.clone());
  }, [s, t]), U(e, u, t), t;
}, se = (e, a) => {
  const o = a, u = e / a, [t, s] = [o * u / 2, o / 2];
  return { width: t, height: s, near: -1e3, far: 1e3 };
}, D = (e) => {
  const a = L(e), { width: o, height: u, near: t, far: s } = se(
    a.x,
    a.y
  );
  return d(
    () => new n.OrthographicCamera(
      -o,
      o,
      u,
      -u,
      t,
      s
    ),
    [o, u, t, s]
  );
}, X = (e = 0) => {
  const a = T(new n.Vector2(0, 0)), o = T(new n.Vector2(0, 0)), u = T(new n.Vector2(0, 0)), t = T(0), s = T(new n.Vector2(0, 0)), c = T(!1);
  return w(
    (r) => {
      const l = performance.now();
      let f;
      c.current && e ? (u.current = u.current.lerp(
        r,
        1 - e
      ), f = u.current.clone()) : (f = r.clone(), u.current = f), t.current === 0 && (t.current = l, a.current = f);
      const p = Math.max(1, l - t.current);
      t.current = l, s.current.copy(f).sub(a.current).divideScalar(p);
      const v = s.current.length() > 0, g = c.current ? a.current.clone() : f;
      return !c.current && v && (c.current = !0), a.current = f, {
        currentPointer: f,
        prevPointer: g,
        diffPointer: o.current.subVectors(f, g),
        velocity: s.current,
        isVelocityUpdate: v
      };
    },
    [e]
  );
}, R = (e) => {
  const o = T(
    ((t) => Object.values(t).some((s) => typeof s == "function"))(e) ? e : structuredClone(e)
  ), u = w((t) => {
    for (const s in t) {
      const c = s;
      c in o.current && t[c] !== void 0 && t[c] !== null ? o.current[c] = t[c] : console.error(
        `"${String(
          c
        )}" does not exist in the params. or "${String(
          c
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, u];
}, j = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  stencilBuffer: !1
}, Q = ({
  gl: e,
  fbo: a,
  scene: o,
  camera: u,
  onBeforeRender: t,
  onSwap: s
}) => {
  e.setRenderTarget(a), t(), e.clear(), e.render(o, u), s && s(), e.setRenderTarget(null), e.clear();
}, C = ({
  scene: e,
  camera: a,
  size: o,
  dpr: u = !1,
  isSizeUpdate: t = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: m = !1
}) => {
  const r = T(), l = L(o, u);
  r.current = d(
    () => {
      const p = new n.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...j,
          samples: s,
          depthBuffer: c
        }
      );
      return m && (p.depthTexture = new n.DepthTexture(
        l.x,
        l.y,
        n.FloatType
      )), p;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), H(() => {
    var p;
    t && ((p = r.current) == null || p.setSize(l.x, l.y));
  }, [l, t]), P(() => {
    const p = r.current;
    return () => {
      p == null || p.dispose();
    };
  }, []);
  const f = w(
    (p, v) => {
      const g = r.current;
      return Q({
        gl: p,
        fbo: g,
        scene: e,
        camera: a,
        onBeforeRender: () => v && v({ read: g.texture })
      }), g.texture;
    },
    [e, a]
  );
  return [r.current, f];
}, k = ({
  scene: e,
  camera: a,
  size: o,
  dpr: u = !1,
  isSizeUpdate: t = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: m = !1
}) => {
  const r = T({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), l = L(o, u), f = d(() => {
    const v = new n.WebGLRenderTarget(l.x, l.y, {
      ...j,
      samples: s,
      depthBuffer: c
    }), g = new n.WebGLRenderTarget(l.x, l.y, {
      ...j,
      samples: s,
      depthBuffer: c
    });
    return m && (v.depthTexture = new n.DepthTexture(
      l.x,
      l.y,
      n.FloatType
    ), g.depthTexture = new n.DepthTexture(
      l.x,
      l.y,
      n.FloatType
    )), { read: v, write: g };
  }, []);
  r.current.read = f.read, r.current.write = f.write, H(() => {
    var v, g;
    t && ((v = r.current.read) == null || v.setSize(l.x, l.y), (g = r.current.write) == null || g.setSize(l.x, l.y));
  }, [l, t]), P(() => {
    const v = r.current;
    return () => {
      var g, x;
      (g = v.read) == null || g.dispose(), (x = v.write) == null || x.dispose();
    };
  }, []);
  const p = w(
    (v, g) => {
      var y;
      const x = r.current;
      return Q({
        gl: v,
        scene: e,
        camera: a,
        fbo: x.write,
        onBeforeRender: () => g && g({
          read: x.read.texture,
          write: x.write.texture
        }),
        onSwap: () => x.swap()
      }), (y = x.read) == null ? void 0 : y.texture;
    },
    [e, a]
  );
  return [
    { read: r.current.read, write: r.current.write },
    p
  ];
}, le = {
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
}, jt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = ie({ scene: u, size: e, dpr: a }), s = D(e), c = X(), [m, r] = k({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [l, f] = R(le), p = T(null);
  return [
    w(
      (g, x) => {
        const { gl: y, pointer: M } = g;
        x && f(x), l.texture ? (i(t, "uIsTexture", !0), i(t, "uTexture", l.texture)) : i(t, "uIsTexture", !1), l.map ? (i(t, "uIsMap", !0), i(t, "uMap", l.map), i(t, "uMapIntensity", l.mapIntensity)) : i(t, "uIsMap", !1), i(t, "uRadius", l.radius), i(t, "uSmudge", l.smudge), i(t, "uDissipation", l.dissipation), i(t, "uMotionBlur", l.motionBlur), i(t, "uMotionSample", l.motionSample);
        const _ = l.pointerValues || c(M);
        _.isVelocityUpdate && (i(t, "uMouse", _.currentPointer), i(t, "uPrevMouse", _.prevPointer)), i(t, "uVelocity", _.velocity);
        const S = typeof l.color == "function" ? l.color(_.velocity) : l.color;
        return i(t, "uColor", S), i(t, "uIsCursor", l.isCursor), i(t, "uPressureEnd", l.pressure), p.current === null && (p.current = l.pressure), i(t, "uPressureStart", p.current), p.current = l.pressure, r(y, ({ read: b }) => {
          i(t, "uBuffer", b);
        });
      },
      [t, c, r, l, f]
    ),
    f,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: m,
      output: m.read.texture
    }
  ];
};
var z = `varying vec2 vUv;
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
}`, ce = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const ve = () => d(
  () => new n.ShaderMaterial({
    vertexShader: z,
    fragmentShader: ce,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var me = `precision highp float;

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
const pe = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: z,
    fragmentShader: me
  }),
  []
);
var de = `precision highp float;

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
const fe = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: de
  }),
  []
);
var ge = `precision highp float;

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
const xe = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: ge
  }),
  []
);
var he = `precision highp float;

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
const ye = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: he
  }),
  []
);
var _e = `precision highp float;

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
const we = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: _e
  }),
  []
);
var Me = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Te = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: Me
  }),
  []
);
var Se = `precision highp float;

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
const be = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: Se
  }),
  []
);
var Ce = `precision highp float;

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
const De = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: z,
    fragmentShader: Ce
  }),
  []
), Re = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = ve(), s = t.clone(), c = ye(), m = we(), r = pe(), l = fe(), f = xe(), p = Te(), v = be(), g = De(), x = d(
    () => ({
      vorticityMaterial: m,
      curlMaterial: c,
      advectionMaterial: r,
      divergenceMaterial: l,
      pressureMaterial: f,
      clearMaterial: p,
      gradientSubtractMaterial: v,
      splatMaterial: g
    }),
    [
      m,
      c,
      r,
      l,
      f,
      p,
      v,
      g
    ]
  ), y = L(a, o);
  P(() => {
    i(
      x.splatMaterial,
      "aspectRatio",
      y.x / y.y
    );
    for (const S of Object.values(x))
      i(
        S,
        "texelSize",
        new n.Vector2(1 / y.x, 1 / y.y)
      );
  }, [y, x]);
  const M = U(e, u, t);
  P(() => {
    t.dispose(), M.material = s;
  }, [t, M, s]), P(() => () => {
    for (const S of Object.values(x))
      S.dispose();
  }, [x]);
  const _ = w(
    (S) => {
      M.material = S, M.material.needsUpdate = !0;
    },
    [M]
  );
  return [x, _];
}, Ve = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new n.Vector3(1, 1, 1),
  pointerValues: !1
}, Kt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), [t, s] = Re({ scene: u, size: e, dpr: a }), c = D(e), m = X(), r = d(
    () => ({
      scene: u,
      camera: c,
      size: e,
      samples: o
    }),
    [u, c, e, o]
  ), [l, f] = k(r), [p, v] = k(r), [g, x] = C(r), [y, M] = C(r), [_, S] = k(r), b = T(0), A = T(new n.Vector2(0, 0)), I = T(new n.Vector3(0, 0, 0)), [h, F] = R(Ve);
  return [
    w(
      (E, $) => {
        const { gl: B, pointer: ee, clock: K, size: Y } = E;
        $ && F($), b.current === 0 && (b.current = K.getElapsedTime());
        const Z = Math.min(
          (K.getElapsedTime() - b.current) / 3,
          0.02
        );
        b.current = K.getElapsedTime();
        const W = f(B, ({ read: V }) => {
          s(t.advectionMaterial), i(t.advectionMaterial, "uVelocity", V), i(t.advectionMaterial, "uSource", V), i(t.advectionMaterial, "dt", Z), i(
            t.advectionMaterial,
            "dissipation",
            h.velocity_dissipation
          );
        }), te = v(B, ({ read: V }) => {
          s(t.advectionMaterial), i(t.advectionMaterial, "uVelocity", W), i(t.advectionMaterial, "uSource", V), i(
            t.advectionMaterial,
            "dissipation",
            h.density_dissipation
          );
        }), q = h.pointerValues || m(ee);
        q.isVelocityUpdate && (f(B, ({ read: V }) => {
          s(t.splatMaterial), i(t.splatMaterial, "uTarget", V), i(
            t.splatMaterial,
            "point",
            q.currentPointer
          );
          const G = q.diffPointer.multiply(
            A.current.set(Y.width, Y.height).multiplyScalar(h.velocity_acceleration)
          );
          i(
            t.splatMaterial,
            "color",
            I.current.set(G.x, G.y, 1)
          ), i(
            t.splatMaterial,
            "radius",
            h.splat_radius
          );
        }), v(B, ({ read: V }) => {
          s(t.splatMaterial), i(t.splatMaterial, "uTarget", V);
          const G = typeof h.fluid_color == "function" ? h.fluid_color(q.velocity) : h.fluid_color;
          i(t.splatMaterial, "color", G);
        }));
        const ne = x(B, () => {
          s(t.curlMaterial), i(t.curlMaterial, "uVelocity", W);
        });
        f(B, ({ read: V }) => {
          s(t.vorticityMaterial), i(t.vorticityMaterial, "uVelocity", V), i(t.vorticityMaterial, "uCurl", ne), i(
            t.vorticityMaterial,
            "curl",
            h.curl_strength
          ), i(t.vorticityMaterial, "dt", Z);
        });
        const re = M(B, () => {
          s(t.divergenceMaterial), i(t.divergenceMaterial, "uVelocity", W);
        });
        S(B, ({ read: V }) => {
          s(t.clearMaterial), i(t.clearMaterial, "uTexture", V), i(
            t.clearMaterial,
            "value",
            h.pressure_dissipation
          );
        }), s(t.pressureMaterial), i(t.pressureMaterial, "uDivergence", re);
        let J;
        for (let V = 0; V < h.pressure_iterations; V++)
          J = S(B, ({ read: G }) => {
            i(t.pressureMaterial, "uPressure", G);
          });
        return f(B, ({ read: V }) => {
          s(t.gradientSubtractMaterial), i(
            t.gradientSubtractMaterial,
            "uPressure",
            J
          ), i(t.gradientSubtractMaterial, "uVelocity", V);
        }), te;
      },
      [
        t,
        s,
        x,
        v,
        M,
        m,
        S,
        f,
        F,
        h
      ]
    ),
    F,
    {
      scene: u,
      materials: t,
      camera: c,
      renderTarget: {
        velocity: l,
        density: p,
        curl: g,
        divergence: y,
        pressure: _
      },
      output: p.read.texture
    }
  ];
}, Pe = ({ scale: e, max: a, texture: o, scene: u }) => {
  const t = T([]), s = d(
    () => new n.PlaneGeometry(e, e),
    [e]
  ), c = d(
    () => new n.MeshBasicMaterial({
      map: o,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [o]
  );
  return P(() => {
    for (let m = 0; m < a; m++) {
      const r = new n.Mesh(s.clone(), c.clone());
      r.rotateZ(2 * Math.PI * Math.random()), r.visible = !1, u.add(r), t.current.push(r);
    }
  }, [s, c, u, a]), P(() => () => {
    t.current.forEach((m) => {
      m.geometry.dispose(), Array.isArray(m.material) ? m.material.forEach((r) => r.dispose()) : m.material.dispose(), u.remove(m);
    }), t.current = [];
  }, [u]), t.current;
}, Ue = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}, Wt = ({
  texture: e = new n.Texture(),
  scale: a = 64,
  max: o = 100,
  size: u,
  dpr: t,
  samples: s = 0
}) => {
  const c = d(() => new n.Scene(), []), m = Pe({
    scale: a,
    max: o,
    texture: e,
    scene: c
  }), r = D(u), l = X(), [f, p] = C({
    scene: c,
    camera: r,
    size: u,
    dpr: t,
    samples: s
  }), [v, g] = R(Ue), x = T(0);
  return [
    w(
      (M, _) => {
        const { gl: S, pointer: b, size: A } = M;
        _ && g(_);
        const I = v.pointerValues || l(b);
        if (v.frequency < I.diffPointer.length()) {
          const h = m[x.current];
          h.visible = !0, h.position.set(
            I.currentPointer.x * (A.width / 2),
            I.currentPointer.y * (A.height / 2),
            0
          ), h.scale.x = h.scale.y = 0, h.material.opacity = v.alpha, x.current = (x.current + 1) % o;
        }
        return m.forEach((h) => {
          if (h.visible) {
            const F = h.material;
            h.rotation.z += v.rotation, F.opacity *= v.fadeout_speed, h.scale.x = v.fadeout_speed * h.scale.x + v.scale, h.scale.y = h.scale.x, F.opacity < 2e-3 && (h.visible = !1);
          }
        }), p(S);
      },
      [p, m, l, o, v, g]
    ),
    g,
    {
      scene: c,
      camera: r,
      meshArr: m,
      renderTarget: f,
      output: f.texture
    }
  ];
};
var Fe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ie = `precision highp float;
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
const Ae = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
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
      vertexShader: Fe,
      fragmentShader: Ie
    }),
    []
  );
  return U(e, a, o), o;
}, Be = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new n.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}, Ht = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Ae(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(Be);
  return [
    w(
      (p, v) => {
        const { gl: g, clock: x } = p;
        return v && l(v), i(t, "scale", r.scale), i(t, "timeStrength", r.timeStrength), i(t, "noiseOctaves", r.noiseOctaves), i(t, "fbmOctaves", r.fbmOctaves), i(t, "warpOctaves", r.warpOctaves), i(t, "warpDirection", r.warpDirection), i(t, "warpStrength", r.warpStrength), i(t, "uTime", r.beat || x.getElapsedTime()), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Oe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ee = `precision highp float;
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
const Le = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
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
      vertexShader: Oe,
      fragmentShader: Ee
    }),
    []
  );
  return U(e, a, o), o;
}, ze = {
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
}, Xt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Le(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(ze);
  return [
    w(
      (p, v) => {
        const { gl: g, clock: x } = p;
        return v && l(v), r.texture ? (i(t, "uTexture", r.texture), i(t, "isTexture", !0)) : (i(t, "isTexture", !1), i(t, "scale", r.scale)), r.noise ? (i(t, "noise", r.noise), i(t, "isNoise", !0), i(t, "noiseStrength", r.noiseStrength)) : i(t, "isNoise", !1), i(t, "uTime", r.beat || x.getElapsedTime()), i(t, "laminateLayer", r.laminateLayer), i(t, "laminateInterval", r.laminateInterval), i(t, "laminateDetail", r.laminateDetail), i(t, "distortion", r.distortion), i(t, "colorFactor", r.colorFactor), i(t, "timeStrength", r.timeStrength), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var $e = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ge = `precision highp float;

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
const ke = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: 0 },
        u_complexity: { value: 0 },
        u_complexityAttenuation: { value: 0 },
        u_iterations: { value: 0 },
        u_timeStrength: { value: 0 },
        u_scale: { value: 0 }
      },
      vertexShader: $e,
      fragmentShader: Ge
    }),
    []
  );
  return U(e, a, o), o;
}, qe = {
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}, Qt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = ke(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(qe);
  return [
    w(
      (p, v) => {
        const { gl: g, clock: x } = p;
        return v && l(v), i(t, "u_pattern", r.pattern), i(t, "u_complexity", r.complexity), i(
          t,
          "u_complexityAttenuation",
          r.complexityAttenuation
        ), i(t, "u_iterations", r.iterations), i(t, "u_timeStrength", r.timeStrength), i(t, "u_scale", r.scale), i(t, "u_time", r.beat || x.getElapsedTime()), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Ne = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, je = `precision highp float;

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
const Ke = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uColor0: { value: new n.Color(16777215) },
        uColor1: { value: new n.Color(0) }
      },
      vertexShader: Ne,
      fragmentShader: je
    }),
    []
  );
  return U(e, a, o), o;
}, We = {
  texture: new n.Texture(),
  color0: new n.Color(16777215),
  color1: new n.Color(0)
}, Yt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Ke(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(We);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "uTexture", r.texture), i(t, "uColor0", r.color0), i(t, "uColor1", r.color1), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var He = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xe = `precision highp float;

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
const Qe = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
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
      vertexShader: He,
      fragmentShader: Xe
    }),
    []
  );
  return U(e, a, o), o;
}, Ye = {
  texture: new n.Texture(),
  map: new n.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new n.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Zt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Qe(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(Ye);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "u_texture", r.texture), i(t, "u_map", r.map), i(t, "u_mapIntensity", r.mapIntensity), r.alphaMap ? (i(t, "u_alphaMap", r.alphaMap), i(t, "u_isAlphaMap", !0)) : i(t, "u_isAlphaMap", !1), i(t, "u_brightness", r.brightness), i(t, "u_min", r.min), i(t, "u_max", r.max), r.dodgeColor ? (i(t, "u_dodgeColor", r.dodgeColor), i(t, "u_isDodgeColor", !0)) : i(t, "u_isDodgeColor", !1), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
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
const et = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
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
      vertexShader: Ze,
      fragmentShader: Je
    }),
    []
  ), s = L(a, o);
  return P(() => {
    i(t, "uResolution", s.clone());
  }, [s, t]), U(e, u, t), t;
}, tt = {
  texture0: new n.Texture(),
  texture1: new n.Texture(),
  padding: 0,
  map: new n.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  dir: new n.Vector2(0, 0)
}, Jt = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = et({ scene: u, size: e, dpr: a }), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    dpr: a,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = R(tt);
  return [
    w(
      (p, v) => {
        var _, S, b, A, I, h, F, O;
        const { gl: g } = p;
        v && l(v), i(t, "uTexture0", r.texture0), i(t, "uTexture1", r.texture1), i(t, "progress", r.progress);
        const x = [
          ((S = (_ = r.texture0) == null ? void 0 : _.image) == null ? void 0 : S.width) || 0,
          ((A = (b = r.texture0) == null ? void 0 : b.image) == null ? void 0 : A.height) || 0
        ], y = [
          ((h = (I = r.texture1) == null ? void 0 : I.image) == null ? void 0 : h.width) || 0,
          ((O = (F = r.texture1) == null ? void 0 : F.image) == null ? void 0 : O.height) || 0
        ], M = x.map((E, $) => E + (y[$] - E) * r.progress);
        return i(t, "uTextureResolution", M), i(t, "padding", r.padding), i(t, "uMap", r.map), i(t, "mapIntensity", r.mapIntensity), i(t, "edgeIntensity", r.edgeIntensity), i(t, "epicenter", r.epicenter), i(t, "dirX", r.dir.x), i(t, "dirY", r.dir.y), m(g);
      },
      [m, t, r, l]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var nt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, rt = `precision highp float;

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
const ot = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_brightness: { value: new n.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: nt,
      fragmentShader: rt
    }),
    []
  );
  return U(e, a, o), o;
}, at = {
  texture: new n.Texture(),
  brightness: new n.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, en = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = ot(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(
    at
  );
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "u_texture", r.texture), i(t, "u_brightness", r.brightness), i(t, "u_min", r.min), i(t, "u_max", r.max), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var ut = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, it = `precision highp float;

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
const st = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_map: { value: new n.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: ut,
      fragmentShader: it
    }),
    []
  );
  return U(e, a, o), o;
}, lt = {
  texture: new n.Texture(),
  map: new n.Texture(),
  mapIntensity: 0.3
}, tn = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = st(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(lt);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "u_texture", r.texture), i(t, "u_map", r.map), i(t, "u_mapIntensity", r.mapIntensity), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var ct = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, vt = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const mt = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uMap: { value: new n.Texture() }
      },
      vertexShader: ct,
      fragmentShader: vt
    }),
    []
  );
  return U(e, u, t), t;
}, pt = {
  texture: new n.Texture(),
  map: new n.Texture()
}, nn = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = mt({ scene: u, size: e, dpr: a }), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(pt);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "uTexture", r.texture), i(t, "uMap", r.map), m(g);
      },
      [t, m, r, l]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var dt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ft = `precision highp float;

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
const gt = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_brightness: { value: 1 },
        u_saturation: { value: 1 }
      },
      vertexShader: dt,
      fragmentShader: ft
    }),
    []
  );
  return U(e, u, t), t;
}, xt = {
  texture: new n.Texture(),
  brightness: 1,
  saturation: 1
}, rn = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = gt({ scene: u, size: e, dpr: a }), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(xt);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "u_texture", r.texture), i(t, "u_brightness", r.brightness), i(t, "u_saturation", r.saturation), m(g);
      },
      [t, m, r, l]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var ht = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, yt = `precision highp float;

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
const _t = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uResolution: { value: new n.Vector2() },
        uTextureResolution: { value: new n.Vector2() },
        uTexture: { value: new n.Texture() }
      },
      vertexShader: ht,
      fragmentShader: yt
    }),
    []
  ), s = L(a, o);
  return P(() => {
    i(t, "uResolution", s.clone());
  }, [s, t]), U(e, u, t), t;
}, wt = {
  texture: new n.Texture()
}, on = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = _t({ scene: u, size: e, dpr: a }), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    dpr: a,
    size: e,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = R(wt);
  return [
    w(
      (p, v) => {
        var x, y, M, _, S, b;
        const { gl: g } = p;
        return v && l(v), i(t, "uTexture", r.texture), i(t, "uTextureResolution", [
          ((M = (y = (x = r.texture) == null ? void 0 : x.source) == null ? void 0 : y.data) == null ? void 0 : M.width) || 0,
          ((b = (S = (_ = r.texture) == null ? void 0 : _.source) == null ? void 0 : S.data) == null ? void 0 : b.height) || 0
        ]), m(g);
      },
      [m, t, r, l]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Mt = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Tt = `precision mediump float;

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
const St = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uResolution: { value: new n.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: Mt,
      fragmentShader: Tt
    }),
    []
  );
  return U(e, a, o), o;
}, bt = {
  texture: new n.Texture(),
  blurSize: 3,
  blurPower: 5
}, an = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = St(u), s = D(e), c = d(
    () => ({
      scene: u,
      camera: s,
      size: e,
      dpr: a,
      samples: o
    }),
    [u, s, e, a, o]
  ), [m, r] = C(c), [l, f] = k(c), [p, v] = R(bt);
  return [
    w(
      (x, y) => {
        var b, A, I, h, F, O;
        const { gl: M } = x;
        y && v(y), i(t, "uTexture", p.texture), i(t, "uResolution", [
          ((I = (A = (b = p.texture) == null ? void 0 : b.source) == null ? void 0 : A.data) == null ? void 0 : I.width) || 0,
          ((O = (F = (h = p.texture) == null ? void 0 : h.source) == null ? void 0 : F.data) == null ? void 0 : O.height) || 0
        ]), i(t, "uBlurSize", p.blurSize);
        let _ = f(M);
        const S = p.blurPower;
        for (let E = 0; E < S; E++)
          i(t, "uTexture", _), _ = f(M);
        return r(M);
      },
      [r, f, t, v, p]
    ),
    v,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: m,
      output: m.texture
    }
  ];
};
var Ct = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Dt = `precision highp float;

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
const Rt = (e) => {
  const a = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new n.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uMode: { value: 0 }
      },
      vertexShader: Ct,
      fragmentShader: Dt
    }),
    []
  );
  return U(e, a, o), o;
}, Vt = {
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, un = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Rt(u), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = R(Vt);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "uEpicenter", r.epicenter), i(t, "uProgress", r.progress), i(t, "uWidth", r.width), i(t, "uStrength", r.strength), i(
          t,
          "uMode",
          r.mode === "center" ? 0 : r.mode === "horizontal" ? 1 : 2
        ), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var Pt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ut = `precision highp float;
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
const Ft = ({
  scene: e,
  size: a,
  dpr: o
}) => {
  const u = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
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
      vertexShader: Pt,
      fragmentShader: Ut
    }),
    []
  ), s = L(a, o);
  return P(() => {
    i(t, "u_resolution", s.clone());
  }, [s, t]), U(e, u, t), t;
}, It = {
  texture: new n.Texture(),
  keyColor: new n.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new n.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}, sn = ({
  size: e,
  dpr: a,
  samples: o = 0
}) => {
  const u = d(() => new n.Scene(), []), t = Ft({ scene: u, size: e, dpr: a }), s = D(e), [c, m] = C({
    scene: u,
    camera: s,
    size: e,
    dpr: a,
    samples: o
  }), [r, l] = R(It);
  return [
    w(
      (p, v) => {
        const { gl: g } = p;
        return v && l(v), i(t, "u_texture", r.texture), i(t, "u_keyColor", r.keyColor), i(t, "u_similarity", r.similarity), i(t, "u_smoothness", r.smoothness), i(t, "u_spill", r.spill), i(t, "u_color", r.color), i(t, "u_contrast", r.contrast), i(t, "u_brightness", r.brightness), i(t, "u_gamma", r.gamma), m(g);
      },
      [m, t, l, r]
    ),
    l,
    {
      scene: u,
      material: t,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
}, ln = ({
  scene: e,
  camera: a,
  size: o,
  dpr: u = !1,
  isSizeUpdate: t = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: m = !1
}, r) => {
  const l = T([]), f = L(o, u);
  l.current = d(() => Array.from({ length: r }, () => {
    const v = new n.WebGLRenderTarget(
      f.x,
      f.y,
      {
        ...j,
        samples: s,
        depthBuffer: c
      }
    );
    return m && (v.depthTexture = new n.DepthTexture(
      f.x,
      f.y,
      n.FloatType
    )), v;
  }), [r]), H(() => {
    t && l.current.forEach(
      (v) => v.setSize(f.x, f.y)
    );
  }, [f, t]), P(() => {
    const v = l.current;
    return () => {
      v.forEach((g) => g.dispose());
    };
  }, [r]);
  const p = w(
    (v, g, x) => {
      const y = l.current[g];
      return Q({
        gl: v,
        scene: e,
        camera: a,
        fbo: y,
        onBeforeRender: () => x && x({ read: y.texture })
      }), y.texture;
    },
    [e, a]
  );
  return [l.current, p];
}, N = Object.freeze({
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
    return 1 - N.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - N.easeOutBounce(1 - 2 * e)) / 2 : (1 + N.easeOutBounce(2 * e - 1)) / 2;
  }
});
function At(e) {
  let a = Math.sin(e * 12.9898) * 43758.5453;
  return a - Math.floor(a);
}
const cn = (e, a = "easeOutQuart") => {
  const o = e / 60, u = N[a];
  return w(
    (s) => {
      let c = s.getElapsedTime() * o;
      const m = Math.floor(c), r = u(c - m);
      c = r + m;
      const l = At(m);
      return {
        beat: c,
        floor: m,
        fract: r,
        hash: l
      };
    },
    [o, u]
  );
}, vn = (e = 60) => {
  const a = d(() => 1 / Math.max(Math.min(e, 60), 1), [e]), o = T(null);
  return w(
    (t) => {
      const s = t.getElapsedTime();
      return o.current === null || s - o.current >= a ? (o.current = s, !0) : !1;
    },
    [a]
  );
}, Bt = (e) => {
  var u, t;
  const a = (u = e.dom) == null ? void 0 : u.length, o = (t = e.texture) == null ? void 0 : t.length;
  return !a || !o || a !== o;
};
var Ot = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Et = `precision highp float;

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
const Lt = ({
  params: e,
  size: a,
  scene: o
}) => {
  o.children.length > 0 && (o.children.forEach((u) => {
    u instanceof n.Mesh && (u.geometry.dispose(), u.material.dispose());
  }), o.remove(...o.children)), e.texture.forEach((u, t) => {
    const s = new n.Mesh(
      new n.PlaneGeometry(1, 1),
      new n.ShaderMaterial({
        vertexShader: Ot,
        fragmentShader: Et,
        transparent: !0,
        uniforms: {
          u_texture: { value: u },
          u_textureResolution: {
            value: new n.Vector2(0, 0)
          },
          u_resolution: { value: new n.Vector2(0, 0) },
          u_borderRadius: {
            value: e.boderRadius[t] ? e.boderRadius[t] : 0
          }
        }
      })
    );
    o.add(s);
  });
}, zt = () => {
  const e = T([]), a = T([]);
  return w(
    ({
      isIntersectingRef: u,
      isIntersectingOnceRef: t,
      params: s
    }) => {
      e.current.length > 0 && e.current.forEach((m, r) => {
        m.unobserve(a.current[r]);
      }), a.current = [], e.current = [];
      const c = new Array(s.dom.length).fill(!1);
      u.current = [...c], t.current = [...c], s.dom.forEach((m, r) => {
        const l = (p) => {
          p.forEach((v) => {
            s.onIntersect[r] && s.onIntersect[r](v), u.current[r] = v.isIntersecting;
          });
        }, f = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        f.observe(m), e.current.push(f), a.current.push(m);
      });
    },
    []
  );
}, $t = () => {
  const e = T([]), a = w(
    ({ params: o, size: u, resolutionRef: t, scene: s, isIntersectingRef: c }) => {
      s.children.length !== e.current.length && (e.current = new Array(s.children.length)), s.children.forEach((m, r) => {
        var p, v, g, x, y, M;
        const l = o.dom[r];
        if (!l)
          return;
        const f = l.getBoundingClientRect();
        if (e.current[r] = f, m.scale.set(f.width, f.height, 1), m.position.set(
          f.left + f.width * 0.5 - u.width * 0.5,
          -f.top - f.height * 0.5 + u.height * 0.5,
          0
        ), c.current[r] && (o.rotation[r] && m.rotation.copy(o.rotation[r]), m instanceof n.Mesh)) {
          const _ = m.material;
          i(_, "u_texture", o.texture[r]), i(_, "u_textureResolution", [
            ((g = (v = (p = o.texture[r]) == null ? void 0 : p.source) == null ? void 0 : v.data) == null ? void 0 : g.width) || 0,
            ((M = (y = (x = o.texture[r]) == null ? void 0 : x.source) == null ? void 0 : y.data) == null ? void 0 : M.height) || 0
          ]), i(
            _,
            "u_resolution",
            t.current.set(f.width, f.height)
          ), i(
            _,
            "u_borderRadius",
            o.boderRadius[r] ? o.boderRadius[r] : 0
          );
        }
      });
    },
    []
  );
  return [e.current, a];
}, Gt = () => {
  const e = T([]), a = T([]), o = w((u, t = !1) => {
    e.current.forEach((c, m) => {
      c && (a.current[m] = !0);
    });
    const s = t ? [...a.current] : [...e.current];
    return u < 0 ? s : s[u];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: a,
    isIntersecting: o
  };
}, kt = (e) => ({ onView: o, onHidden: u }) => {
  const t = T(!1);
  P(() => {
    let s;
    const c = () => {
      e.current.some((m) => m) ? t.current || (o && o(), t.current = !0) : t.current && (u && u(), t.current = !1), s = requestAnimationFrame(c);
    };
    return s = requestAnimationFrame(c), () => {
      cancelAnimationFrame(s);
    };
  }, [o, u]);
}, qt = {
  texture: [],
  dom: [],
  // resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, mn = ({ size: e, dpr: a, samples: o = 0 }, u = []) => {
  const t = d(() => new n.Scene(), []), s = D(e), [c, m] = C({
    scene: t,
    camera: s,
    size: e,
    dpr: a,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = R({
    ...qt,
    updateKey: performance.now()
  }), [f, p] = $t(), v = T(new n.Vector2(0, 0)), [g, x] = oe(!0);
  P(() => {
    x(!0);
  }, u);
  const y = T(null), M = d(() => new n.Texture(), []), _ = zt(), { isIntersectingOnceRef: S, isIntersectingRef: b, isIntersecting: A } = Gt(), I = kt(b);
  return [
    w(
      (F, O) => {
        const { gl: E, size: $ } = F;
        if (O && l(O), Bt(r))
          return M;
        if (g) {
          if (y.current === r.updateKey)
            return M;
          y.current = r.updateKey;
        }
        return g && (Lt({
          params: r,
          size: $,
          scene: t
        }), _({
          isIntersectingRef: b,
          isIntersectingOnceRef: S,
          params: r
        }), x(!1)), p({
          params: r,
          size: $,
          resolutionRef: v,
          scene: t,
          isIntersectingRef: b
        }), m(E);
      },
      [
        m,
        l,
        _,
        p,
        g,
        t,
        r,
        S,
        b,
        M
      ]
    ),
    l,
    {
      scene: t,
      camera: s,
      renderTarget: c,
      output: c.texture,
      isIntersecting: A,
      DOMRects: f,
      intersections: b.current,
      useDomView: I
    }
  ];
};
export {
  pt as ALPHABLENDING_PARAMS,
  Ye as BLENDING_PARAMS,
  at as BRIGHTNESSPICKER_PARAMS,
  le as BRUSH_PARAMS,
  It as CHROMAKEY_PARAMS,
  ze as COLORSTRATA_PARAMS,
  wt as COVERTEXTURE_PARAMS,
  qt as DOMSYNCER_PARAMS,
  We as DUOTONE_PARAMS,
  N as Easing,
  j as FBO_OPTION,
  Ve as FLUID_PARAMS,
  lt as FXBLENDING_PARAMS,
  tt as FXTEXTURE_PARAMS,
  xt as HSV_PARAMS,
  qe as MARBLE_PARAMS,
  Be as NOISE_PARAMS,
  Ue as RIPPLE_PARAMS,
  bt as SIMPLEBLUR_PARAMS,
  Vt as WAVE_PARAMS,
  Q as renderFBO,
  i as setUniform,
  U as useAddMesh,
  nn as useAlphaBlending,
  cn as useBeat,
  Zt as useBlending,
  en as useBrightnessPicker,
  jt as useBrush,
  D as useCamera,
  sn as useChromaKey,
  Xt as useColorStrata,
  ln as useCopyTexture,
  on as useCoverTexture,
  mn as useDomSyncer,
  k as useDoubleFBO,
  Yt as useDuoTone,
  vn as useFPSLimiter,
  Kt as useFluid,
  tn as useFxBlending,
  Jt as useFxTexture,
  rn as useHSV,
  Qt as useMarble,
  Ht as useNoise,
  R as useParams,
  X as usePointer,
  L as useResolution,
  Wt as useRipple,
  an as useSimpleBlur,
  C as useSingleFBO,
  un as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
