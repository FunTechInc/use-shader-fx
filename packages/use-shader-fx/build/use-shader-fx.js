import * as n from "three";
import { useMemo as m, useEffect as R, useRef as y, useLayoutEffect as X, useCallback as T, useState as oe } from "react";
var ae = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ie = `precision highp float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float width, float aspect) {
	
	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	
	vec2 dir = normalize(end - start);
	
	
	vec2 n = vec2(dir.y, -dir.x);

	vec2 p0 = point - start;
	
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	
	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < width && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < width || distFromEnd < width;

	return float(withinLine);
}

vec4 createSmudge(){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);
	
	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.0);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uMap, vUv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

vec4 createMotionBlur(vec4 baseColor, vec2 velocity, float motion, int samples) {
	vec4 motionBlurredColor = baseColor;
	vec2 scaledVelocity = velocity * motion;
	for(int i = 1; i < samples; i++) {
		float t = float(i) / float(samples - 1);
		vec2 offset = t * scaledVelocity / uResolution;
		motionBlurredColor += texture2D(uMap, vUv + offset);
	}
	return motionBlurredColor / float(samples);
}

void main() {
	
	vec2 st = vUv * 2.0 - 1.0;
	
	
	vec2 velocity = uVelocity * uResolution;

	
	vec4 smudgedColor = createSmudge();
	
	
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, velocity, uMotionBlur,uMotionSample);

	vec4 bufferColor = motionBlurredColor * uDissipation;

	
	float modifiedRadius = max(0.0,uRadius);

	
	vec3 color = uColor;

	
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	float onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect);
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);
	
	gl_FragColor = vec4(bufferColor.rgb,1.0);
}`;
const A = (t, i = !1) => {
  const r = i ? t.width * i : t.width, e = i ? t.height * i : t.height;
  return m(
    () => new n.Vector2(r, e),
    [r, e]
  );
}, B = (t, i, r) => {
  const e = m(
    () => new n.Mesh(i, r),
    [i, r]
  );
  return R(() => {
    t.add(e);
  }, [t, e]), R(() => () => {
    t.remove(e), i.dispose(), r.dispose();
  }, [t, i, r, e]), e;
}, c = (t, i, r) => {
  t.uniforms && t.uniforms[i] && r !== void 0 && r !== null ? t.uniforms[i].value = r : console.error(
    `Uniform key "${String(
      i
    )}" does not exist in the material. or "${String(
      i
    )}" is null | undefined`
  );
}, ue = ({
  scene: t,
  size: i,
  dpr: r
}) => {
  const e = m(() => new n.PlaneGeometry(2, 2), []), o = m(
    () => new n.ShaderMaterial({
      uniforms: {
        uMap: { value: new n.Texture() },
        uResolution: { value: new n.Vector2(0, 0) },
        uAspect: { value: 0 },
        uTexture: { value: new n.Texture() },
        uRadius: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 0 },
        uMouse: { value: new n.Vector2(0, 0) },
        uPrevMouse: { value: new n.Vector2(0, 0) },
        uVelocity: { value: new n.Vector2(0, 0) },
        uColor: { value: new n.Color(16777215) }
      },
      vertexShader: ae,
      fragmentShader: ie
    }),
    []
  ), u = A(i, r);
  return R(() => {
    c(o, "uAspect", u.width / u.height), c(o, "uResolution", u.clone());
  }, [u, o]), B(t, e, o), o;
}, se = (t, i) => {
  const r = i, e = t / i, [o, u] = [r * e / 2, r / 2];
  return { width: o, height: u, near: -1e3, far: 1e3 };
}, U = (t) => {
  const i = A(t), { width: r, height: e, near: o, far: u } = se(
    i.x,
    i.y
  );
  return m(
    () => new n.OrthographicCamera(
      -r,
      r,
      e,
      -e,
      o,
      u
    ),
    [r, e, o, u]
  );
}, I = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, P = ({
  scene: t,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = y(), l = A(r, e);
  u.current = m(
    () => new n.WebGLRenderTarget(l.x, l.y, I),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), X(() => {
    var s;
    o && ((s = u.current) == null || s.setSize(l.x, l.y));
  }, [l, o]), R(() => {
    const s = u.current;
    return () => {
      s == null || s.dispose();
    };
  }, []);
  const a = T(
    (s, v) => {
      const d = u.current;
      return s.setRenderTarget(d), v && v({ read: d.texture }), s.render(t, i), s.setRenderTarget(null), s.clear(), d.texture;
    },
    [t, i]
  );
  return [u.current, a];
}, E = ({
  scene: t,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = y({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), l = A(r, e), a = m(() => {
    const v = new n.WebGLRenderTarget(
      l.x,
      l.y,
      I
    ), d = new n.WebGLRenderTarget(
      l.x,
      l.y,
      I
    );
    return { read: v, write: d };
  }, []);
  u.current.read = a.read, u.current.write = a.write, X(() => {
    var v, d;
    o && ((v = u.current.read) == null || v.setSize(l.x, l.y), (d = u.current.write) == null || d.setSize(l.x, l.y));
  }, [l, o]), R(() => {
    const v = u.current;
    return () => {
      var d, f;
      (d = v.read) == null || d.dispose(), (f = v.write) == null || f.dispose();
    };
  }, []);
  const s = T(
    (v, d) => {
      var p;
      const f = u.current;
      return v.setRenderTarget(f.write), d && d({
        read: f.read.texture,
        write: f.write.texture
      }), v.render(t, i), f.swap(), v.setRenderTarget(null), v.clear(), (p = f.read) == null ? void 0 : p.texture;
    },
    [t, i]
  );
  return [
    { read: u.current.read, write: u.current.write },
    s
  ];
}, H = () => {
  const t = y(new n.Vector2(0, 0)), i = y(new n.Vector2(0, 0)), r = y(0), e = y(new n.Vector2(0, 0)), o = y(!1);
  return T((l) => {
    const a = performance.now(), s = l.clone();
    r.current === 0 && (r.current = a, t.current = s);
    const v = Math.max(1, a - r.current);
    r.current = a, e.current.copy(s).sub(t.current).divideScalar(v);
    const d = e.current.length() > 0, f = o.current ? t.current.clone() : s;
    return !o.current && d && (o.current = !0), t.current = s, {
      currentPointer: s,
      prevPointer: f,
      diffPointer: i.current.subVectors(s, f),
      velocity: e.current,
      isVelocityUpdate: d
    };
  }, []);
}, V = (t) => {
  const r = y(
    ((o) => Object.values(o).some((u) => typeof u == "function"))(t) ? t : structuredClone(t)
  ), e = T((o) => {
    for (const u in o) {
      const l = u;
      l in r.current && o[l] !== void 0 && o[l] !== null ? r.current[l] = o[l] : console.error(
        `"${String(
          l
        )}" does not exist in the params. or "${String(
          l
        )}" is null | undefined`
      );
    }
  }, []);
  return [r.current, e];
}, le = {
  texture: new n.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new n.Color(16777215)
}, pt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = ue({ scene: r, size: t, dpr: i }), o = U(t), u = H(), [l, a] = E({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [s, v] = V(le);
  return [
    T(
      (f, p) => {
        const { gl: g, pointer: x } = f;
        p && v(p), c(e, "uTexture", s.texture), c(e, "uRadius", s.radius), c(e, "uSmudge", s.smudge), c(e, "uDissipation", s.dissipation), c(e, "uMotionBlur", s.motionBlur), c(e, "uMotionSample", s.motionSample), c(e, "uColor", s.color);
        const { currentPointer: h, prevPointer: _, velocity: b } = u(x);
        return c(e, "uMouse", h), c(e, "uPrevMouse", _), c(e, "uVelocity", b), a(g, ({ read: C }) => {
          c(e, "uMap", C);
        });
      },
      [e, u, a, s, v]
    ),
    v,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
    }
  ];
};
var ce = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ve = `precision highp float;

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
const de = (t) => {
  const i = m(() => new n.PlaneGeometry(2, 2), []), r = m(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uColor0: { value: new n.Color(16777215) },
        uColor1: { value: new n.Color(0) }
      },
      vertexShader: ce,
      fragmentShader: ve
    }),
    []
  );
  return B(t, i, r), r;
}, fe = {
  texture: new n.Texture(),
  color0: new n.Color(16777215),
  color1: new n.Color(0)
}, gt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = de(r), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = V(fe);
  return [
    T(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), c(e, "uTexture", a.texture), c(e, "uColor0", a.color0), c(e, "uColor1", a.color1), l(p);
      },
      [l, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var me = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, pe = `precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uMap;
uniform float distortionStrength;
uniform float edge0;
uniform float edge1;
uniform vec3 color;

void main() {
	vec2 uv = vUv;

	vec2 map = texture2D(uMap, uv).rg;
	vec2 normalizedMap = map * 2.0 - 1.0;
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap), distortionStrength);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(uTexture, uv);

	float blendValue = smoothstep(edge0, edge1, map.r);

	vec3 outputColor = blendValue * color + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;
const ge = (t) => {
  const i = m(() => new n.PlaneGeometry(2, 2), []), r = m(
    () => new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new n.Texture() },
        uMap: { value: new n.Texture() },
        distortionStrength: { value: 0 },
        edge0: { value: 0 },
        edge1: { value: 0.9 },
        color: { value: new n.Color(16777215) }
      },
      vertexShader: me,
      fragmentShader: pe
    }),
    []
  );
  return B(t, i, r), r;
}, xe = {
  texture: new n.Texture(),
  map: new n.Texture(),
  distortionStrength: 0.3,
  edge0: 0,
  edge1: 0.9,
  color: new n.Color(16777215)
}, xt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = ge(r), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = V(xe);
  return [
    T(
      (d, f) => {
        const { gl: p, clock: g } = d;
        return f && s(f), c(e, "uTime", g.getElapsedTime()), c(e, "uTexture", a.texture), c(e, "uMap", a.map), c(e, "distortionStrength", a.distortionStrength), c(e, "edge0", a.edge0), c(e, "edge1", a.edge1), c(e, "color", a.color), l(p);
      },
      [l, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var O = `varying vec2 vUv;
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
}`, he = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const ye = () => m(
  () => new n.ShaderMaterial({
    vertexShader: O,
    fragmentShader: he,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Te = `precision highp float;

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
const we = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: O,
    fragmentShader: Te
  }),
  []
);
var Se = `precision highp float;

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
const Me = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: Se
  }),
  []
);
var _e = `precision highp float;

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
const Re = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: _e
  }),
  []
);
var be = `precision highp float;

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
const De = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: be
  }),
  []
);
var Ce = `precision highp float;

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
const Pe = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: Ce
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
const Ve = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: Ue
  }),
  []
);
var Fe = `precision highp float;

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
const Be = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: Fe
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
const Ae = () => m(
  () => new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: O,
    fragmentShader: Oe
  }),
  []
), Le = ({
  scene: t,
  size: i,
  dpr: r
}) => {
  const e = m(() => new n.PlaneGeometry(2, 2), []), o = ye(), u = o.clone(), l = De(), a = Pe(), s = we(), v = Me(), d = Re(), f = Ve(), p = Be(), g = Ae(), x = m(
    () => ({
      vorticityMaterial: a,
      curlMaterial: l,
      advectionMaterial: s,
      divergenceMaterial: v,
      pressureMaterial: d,
      clearMaterial: f,
      gradientSubtractMaterial: p,
      splatMaterial: g
    }),
    [
      a,
      l,
      s,
      v,
      d,
      f,
      p,
      g
    ]
  ), h = A(i, r);
  R(() => {
    c(
      x.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const w of Object.values(x))
      c(
        w,
        "texelSize",
        new n.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, x]);
  const _ = B(t, e, o);
  R(() => {
    o.dispose(), _.material = u;
  }, [o, _, u]), R(() => () => {
    for (const w of Object.values(x))
      w.dispose();
  }, [x]);
  const b = T(
    (w) => {
      _.material = w, _.material.needsUpdate = !0;
    },
    [_]
  );
  return [x, b];
}, ze = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new n.Vector3(1, 1, 1)
}, ht = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), [e, o] = Le({ scene: r, size: t, dpr: i }), u = U(t), l = H(), a = m(
    () => ({
      scene: r,
      camera: u,
      size: t
    }),
    [r, u, t]
  ), [s, v] = E(a), [d, f] = E(a), [p, g] = P(a), [x, h] = P(a), [_, b] = E(a), w = y(0), C = y(new n.Vector2(0, 0)), L = y(new n.Vector3(0, 0, 0)), [D, S] = V(ze);
  return [
    T(
      (q, N) => {
        const { gl: F, pointer: K, clock: G, size: Y } = q;
        N && S(N), w.current === 0 && (w.current = G.getElapsedTime());
        const j = Math.min(
          (G.getElapsedTime() - w.current) / 3,
          0.02
        );
        w.current = G.getElapsedTime();
        const W = v(F, ({ read: M }) => {
          o(e.advectionMaterial), c(e.advectionMaterial, "uVelocity", M), c(e.advectionMaterial, "uSource", M), c(e.advectionMaterial, "dt", j), c(
            e.advectionMaterial,
            "dissipation",
            D.velocity_dissipation
          );
        }), Z = f(F, ({ read: M }) => {
          o(e.advectionMaterial), c(e.advectionMaterial, "uVelocity", W), c(e.advectionMaterial, "uSource", M), c(
            e.advectionMaterial,
            "dissipation",
            D.density_dissipation
          );
        }), { currentPointer: J, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = l(K);
        ee && (v(F, ({ read: M }) => {
          o(e.splatMaterial), c(e.splatMaterial, "uTarget", M), c(e.splatMaterial, "point", J);
          const z = Q.multiply(
            C.current.set(Y.width, Y.height).multiplyScalar(D.velocity_acceleration)
          );
          c(
            e.splatMaterial,
            "color",
            L.current.set(z.x, z.y, 1)
          ), c(
            e.splatMaterial,
            "radius",
            D.splat_radius
          );
        }), f(F, ({ read: M }) => {
          o(e.splatMaterial), c(e.splatMaterial, "uTarget", M);
          const z = typeof D.fluid_color == "function" ? D.fluid_color(te) : D.fluid_color;
          c(e.splatMaterial, "color", z);
        }));
        const ne = g(F, () => {
          o(e.curlMaterial), c(e.curlMaterial, "uVelocity", W);
        });
        v(F, ({ read: M }) => {
          o(e.vorticityMaterial), c(e.vorticityMaterial, "uVelocity", M), c(e.vorticityMaterial, "uCurl", ne), c(
            e.vorticityMaterial,
            "curl",
            D.curl_strength
          ), c(e.vorticityMaterial, "dt", j);
        });
        const re = h(F, () => {
          o(e.divergenceMaterial), c(e.divergenceMaterial, "uVelocity", W);
        });
        b(F, ({ read: M }) => {
          o(e.clearMaterial), c(e.clearMaterial, "uTexture", M), c(
            e.clearMaterial,
            "value",
            D.pressure_dissipation
          );
        }), o(e.pressureMaterial), c(e.pressureMaterial, "uDivergence", re);
        let k;
        for (let M = 0; M < D.pressure_iterations; M++)
          k = b(F, ({ read: z }) => {
            c(e.pressureMaterial, "uPressure", z);
          });
        return v(F, ({ read: M }) => {
          o(e.gradientSubtractMaterial), c(
            e.gradientSubtractMaterial,
            "uPressure",
            k
          ), c(e.gradientSubtractMaterial, "uVelocity", M);
        }), Z;
      },
      [
        e,
        o,
        g,
        f,
        h,
        l,
        b,
        v,
        S,
        D
      ]
    ),
    S,
    {
      scene: r,
      materials: e,
      camera: u,
      renderTarget: {
        velocity: s,
        density: d,
        curl: p,
        divergence: x,
        pressure: _
      }
    }
  ];
}, Ee = ({ scale: t, max: i, texture: r, scene: e }) => {
  const o = y([]), u = m(
    () => new n.PlaneGeometry(t, t),
    [t]
  ), l = m(
    () => new n.MeshBasicMaterial({
      map: r ?? null,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return R(() => {
    for (let a = 0; a < i; a++) {
      const s = new n.Mesh(u.clone(), l.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, e.add(s), o.current.push(s);
    }
  }, [u, l, e, i]), R(() => () => {
    o.current.forEach((a) => {
      a.geometry.dispose(), Array.isArray(a.material) ? a.material.forEach((s) => s.dispose()) : a.material.dispose(), e.remove(a);
    }), o.current = [];
  }, [e]), o.current;
}, Ie = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, yt = ({
  texture: t,
  scale: i = 64,
  max: r = 100,
  size: e
}) => {
  const o = m(() => new n.Scene(), []), u = Ee({
    scale: i,
    max: r,
    texture: t,
    scene: o
  }), l = U(e), a = H(), [s, v] = P({
    scene: o,
    camera: l,
    size: e
  }), [d, f] = V(Ie), p = y(0);
  return [
    T(
      (x, h) => {
        const { gl: _, pointer: b, size: w } = x;
        h && f(h);
        const { currentPointer: C, diffPointer: L } = a(b);
        if (d.frequency < L.length()) {
          const S = u[p.current];
          S.visible = !0, S.position.set(
            C.x * (w.width / 2),
            C.y * (w.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = d.alpha, p.current = (p.current + 1) % r;
        }
        return u.forEach((S) => {
          if (S.visible) {
            const $ = S.material;
            S.rotation.z += d.rotation, $.opacity *= d.fadeout_speed, S.scale.x = d.fadeout_speed * S.scale.x + d.scale, S.scale.y = S.scale.x, $.opacity < 2e-3 && (S.visible = !1);
          }
        }), v(_);
      },
      [v, u, a, r, d, f]
    ),
    f,
    {
      scene: o,
      camera: l,
      meshArr: u,
      renderTarget: s
    }
  ];
};
var $e = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ge = `precision highp float;

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
	vec2 bgRatio=vec2(
		min((uResolution.x/uResolution.y)/(uTextureResolution.x/uTextureResolution.y),1.),
		min((uResolution.y/uResolution.x)/(uTextureResolution.y/uTextureResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	
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
const We = ({
  scene: t,
  size: i,
  dpr: r
}) => {
  const e = m(() => new n.PlaneGeometry(2, 2), []), o = m(
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
      vertexShader: $e,
      fragmentShader: Ge
    }),
    []
  ), u = A(i, r);
  return R(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), B(t, e, o), o;
}, Xe = {
  texture0: new n.Texture(),
  texture1: new n.Texture(),
  textureResolution: new n.Vector2(0, 0),
  padding: 0,
  map: new n.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  dir: new n.Vector2(0, 0)
}, Tt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = We({ scene: r, size: t, dpr: i }), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    dpr: i,
    size: t,
    isSizeUpdate: !0
  }), [a, s] = V(Xe);
  return [
    T(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), c(e, "uTexture0", a.texture0), c(e, "uTexture1", a.texture1), c(e, "uTextureResolution", a.textureResolution), c(e, "padding", a.padding), c(e, "uMap", a.map), c(e, "mapIntensity", a.mapIntensity), c(e, "edgeIntensity", a.edgeIntensity), c(e, "epicenter", a.epicenter), c(e, "progress", a.progress), c(e, "dirX", a.dir.x), c(e, "dirY", a.dir.y), l(p);
      },
      [l, e, a, s]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var He = `varying vec2 vUv;

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
const Ye = (t) => {
  const i = m(() => new n.PlaneGeometry(2, 2), []), r = m(
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
      vertexShader: He,
      fragmentShader: Ne
    }),
    []
  );
  return B(t, i, r), r;
}, je = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new n.Vector2(2, 2),
  warpStrength: 8
}, wt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = Ye(r), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = V(je);
  return [
    T(
      (d, f) => {
        const { gl: p, clock: g } = d;
        return f && s(f), c(e, "scale", a.scale), c(e, "timeStrength", a.timeStrength), c(e, "noiseOctaves", a.noiseOctaves), c(e, "fbmOctaves", a.fbmOctaves), c(e, "warpOctaves", a.warpOctaves), c(e, "warpDirection", a.warpDirection), c(e, "warpStrength", a.warpStrength), c(e, "uTime", g.getElapsedTime()), l(p);
      },
      [l, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
}, ke = (t) => {
  var o, u, l;
  const i = (o = t.dom) == null ? void 0 : o.length, r = (u = t.texture) == null ? void 0 : u.length, e = (l = t.resolution) == null ? void 0 : l.length;
  if (!i || !r || !e)
    throw new Error("No dom or texture or resolution is set");
  if (i !== r || i !== e)
    throw new Error("Match dom, texture and resolution length");
};
var qe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Ke = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_textureResolution;
uniform vec2 u_resolution;
uniform float u_borderRadius;

void main() {
	
	vec2 ratio = vec2(
		min((u_resolution.x / u_resolution.y) / (u_textureResolution.x / u_textureResolution.y), 1.0),
		min((u_resolution.y / u_resolution.x) / (u_textureResolution.y / u_textureResolution.x), 1.0)
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
const Ze = ({
  params: t,
  size: i,
  scene: r
}) => {
  r.children.length > 0 && (r.children.forEach((e) => {
    e instanceof n.Mesh && (e.geometry.dispose(), e.material.dispose());
  }), r.remove(...r.children)), t.texture.forEach((e, o) => {
    const u = new n.Mesh(
      new n.PlaneGeometry(1, 1),
      new n.ShaderMaterial({
        vertexShader: qe,
        fragmentShader: Ke,
        transparent: !0,
        uniforms: {
          u_texture: { value: e },
          u_textureResolution: { value: new n.Vector2(0, 0) },
          u_resolution: { value: new n.Vector2(0, 0) },
          u_borderRadius: {
            value: t.boderRadius[o] ? t.boderRadius[o] : 0
          }
        }
      })
    );
    r.add(u);
  });
}, Je = () => {
  const t = y([]), i = y([]);
  return T(
    ({
      isIntersectingRef: e,
      isIntersectingOnceRef: o,
      params: u
    }) => {
      t.current.length > 0 && t.current.forEach((a, s) => {
        a.unobserve(i.current[s]);
      }), i.current = [], t.current = [];
      const l = new Array(u.dom.length).fill(!1);
      e.current = [...l], o.current = [...l], u.dom.forEach((a, s) => {
        const v = (f) => {
          f.forEach((p) => {
            u.onIntersect[s] && u.onIntersect[s](p), e.current[s] = p.isIntersecting;
          });
        }, d = new IntersectionObserver(v, {
          rootMargin: "0px",
          threshold: 0
        });
        d.observe(a), t.current.push(d), i.current.push(a);
      });
    },
    []
  );
}, Qe = ({
  params: t,
  size: i,
  resolutionRef: r,
  scene: e,
  isIntersectingRef: o
}) => {
  e.children.forEach((u, l) => {
    const a = t.dom[l];
    if (!a)
      throw new Error("DOM is null.");
    if (o.current[l]) {
      const s = a.getBoundingClientRect();
      if (u.scale.set(s.width, s.height, 1), u.position.set(
        s.left + s.width * 0.5 - i.width * 0.5,
        -s.top - s.height * 0.5 + i.height * 0.5,
        0
      ), t.rotation[l] && u.rotation.copy(t.rotation[l]), u instanceof n.Mesh) {
        const v = u.material;
        c(v, "u_texture", t.texture[l]), c(v, "u_textureResolution", t.resolution[l]), c(
          v,
          "u_resolution",
          r.current.set(s.width, s.height)
        ), c(
          v,
          "u_borderRadius",
          t.boderRadius[l] ? t.boderRadius[l] : 0
        );
      }
    }
  });
}, et = () => {
  const t = y([]), i = y([]), r = T((e, o = !1) => {
    t.current.forEach((l, a) => {
      l && (i.current[a] = !0);
    });
    const u = o ? [...i.current] : [...t.current];
    return e < 0 ? u : u[e];
  }, []);
  return {
    isIntersectingRef: t,
    isIntersectingOnceRef: i,
    isIntersecting: r
  };
}, tt = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, St = ({
  size: t,
  dpr: i
}, r = []) => {
  const e = m(() => new n.Scene(), []), o = U(t), [u, l] = P({
    scene: e,
    camera: o,
    size: t,
    dpr: i,
    isSizeUpdate: !0
  }), [a, s] = V(tt), v = y(new n.Vector2(0, 0)), [d, f] = oe(!0);
  R(() => {
    f(!0);
  }, r);
  const p = Je(), { isIntersectingOnceRef: g, isIntersectingRef: x, isIntersecting: h } = et();
  return [
    T(
      (b, w) => {
        const { gl: C, size: L } = b;
        return w && s(w), ke(a), d && (Ze({
          params: a,
          size: L,
          scene: e
        }), p({
          isIntersectingRef: x,
          isIntersectingOnceRef: g,
          params: a
        }), f(!1)), Qe({
          params: a,
          size: L,
          resolutionRef: v,
          scene: e,
          isIntersectingRef: x
        }), l(C);
      },
      [
        l,
        s,
        p,
        d,
        e,
        a,
        g,
        x
      ]
    ),
    s,
    {
      scene: e,
      camera: o,
      renderTarget: u,
      isIntersecting: h
    }
  ];
};
var nt = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, rt = `precision mediump float;

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
const ot = (t) => {
  const i = m(() => new n.PlaneGeometry(2, 2), []), r = m(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uResolution: { value: new n.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: nt,
      fragmentShader: rt
    }),
    []
  );
  return B(t, i, r), r;
}, at = {
  texture: new n.Texture(),
  blurSize: 3,
  blurPower: 5
}, Mt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = ot(r), o = U(t), u = m(
    () => ({
      scene: r,
      camera: o,
      size: t,
      dpr: i
    }),
    [r, o, t, i]
  ), [l, a] = P(u), [s, v] = E(u), [d, f] = V(at);
  return [
    T(
      (g, x) => {
        const { gl: h } = g;
        x && f(x), c(e, "uTexture", d.texture), c(e, "uResolution", [
          d.texture.source.data.width,
          d.texture.source.data.height
        ]), c(e, "uBlurSize", d.blurSize);
        let _ = v(h);
        const b = d.blurPower;
        for (let C = 0; C < b; C++)
          c(e, "uTexture", _), _ = v(h);
        return a(h);
      },
      [a, v, e, f, d]
    ),
    f,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
    }
  ];
};
var it = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ut = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uStrength;
uniform float uWidth;
uniform vec2 uEpicenter;
uniform int uMode;

float PI = 3.141592653589;

void main() {
	float progress = min(uProgress, 1.0);
	float progressFactor = sin(progress * PI);

	float border = progress - progress * progressFactor * uWidth;
	float blur = uStrength * progressFactor;
	
	
	vec2 normalizeCenter = (uEpicenter + 1.0) / 2.0;

	
	float dist = uMode == 0 ? length(vUv - normalizeCenter) : uMode == 1 ? length(vUv.x - normalizeCenter.x) : length(vUv.y - normalizeCenter.y);

	
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
const st = ({
  scene: t,
  size: i,
  dpr: r
}) => {
  const e = m(() => new n.PlaneGeometry(2, 2), []), o = m(
    () => new n.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new n.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uResolution: { value: new n.Vector2() },
        uMode: { value: 0 }
      },
      vertexShader: it,
      fragmentShader: ut
    }),
    []
  ), u = A(i, r);
  return R(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), B(t, e, o), o;
}, lt = {
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, _t = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = st({ scene: r, size: t, dpr: i }), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    size: t,
    dpr: i,
    isSizeUpdate: !0
  }), [a, s] = V(lt);
  return [
    T(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), c(e, "uEpicenter", a.epicenter), c(e, "uProgress", a.progress), c(e, "uWidth", a.width), c(e, "uStrength", a.strength), c(
          e,
          "uMode",
          a.mode === "center" ? 0 : a.mode === "horizontal" ? 1 : 2
        ), l(p);
      },
      [l, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var ct = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, vt = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(u_texture, uv).rgb;
	float brightness = dot(color,u_brightness);
	float alpha = smoothstep(u_min, u_max, brightness);
	gl_FragColor = vec4(color, alpha);
}`;
const dt = (t) => {
  const i = m(() => new n.PlaneGeometry(2, 2), []), r = m(
    () => new n.ShaderMaterial({
      uniforms: {
        u_texture: { value: new n.Texture() },
        u_brightness: { value: new n.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: ct,
      fragmentShader: vt
    }),
    []
  );
  return B(t, i, r), r;
}, ft = {
  texture: new n.Texture(),
  brightness: new n.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Rt = ({
  size: t,
  dpr: i
}) => {
  const r = m(() => new n.Scene(), []), e = dt(r), o = U(t), [u, l] = P({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = V(
    ft
  );
  return [
    T(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), c(e, "u_texture", a.texture), c(e, "u_brightness", a.brightness), c(e, "u_min", a.min), c(e, "u_max", a.max), l(p);
      },
      [l, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
}, bt = ({ scene: t, camera: i, size: r, dpr: e = !1, isSizeUpdate: o = !1 }, u) => {
  const l = y([]), a = A(r, e);
  l.current = m(() => Array.from(
    { length: u },
    () => new n.WebGLRenderTarget(a.x, a.y, I)
  ), [u]), X(() => {
    o && l.current.forEach(
      (v) => v.setSize(a.x, a.y)
    );
  }, [a, o]), R(() => {
    const v = l.current;
    return () => {
      v.forEach((d) => d.dispose());
    };
  }, [u]);
  const s = T(
    (v, d, f) => {
      const p = l.current[d];
      return v.setRenderTarget(p), f && f({ read: p.texture }), v.render(t, i), v.setRenderTarget(null), v.clear(), p.texture;
    },
    [t, i]
  );
  return [l.current, s];
};
export {
  xe as BLENDING_PARAMS,
  ft as BRIGHTNESSPICKER_PARAMS,
  le as BRUSH_PARAMS,
  tt as DOMSYNCER_PARAMS,
  fe as DUOTONE_PARAMS,
  ze as FLUID_PARAMS,
  Xe as FXTEXTURE_PARAMS,
  je as NOISE_PARAMS,
  Ie as RIPPLE_PARAMS,
  at as SIMPLEBLUR_PARAMS,
  lt as WAVE_PARAMS,
  c as setUniform,
  B as useAddMesh,
  xt as useBlending,
  Rt as useBrightnessPicker,
  pt as useBrush,
  U as useCamera,
  bt as useCopyTexture,
  St as useDomSyncer,
  E as useDoubleFBO,
  gt as useDuoTone,
  ht as useFluid,
  Tt as useFxTexture,
  wt as useNoise,
  V as useParams,
  H as usePointer,
  A as useResolution,
  yt as useRipple,
  Mt as useSimpleBlur,
  P as useSingleFBO,
  _t as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
