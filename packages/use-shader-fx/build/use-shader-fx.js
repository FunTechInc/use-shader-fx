import * as n from "three";
import { useMemo as p, useEffect as b, useRef as M, useLayoutEffect as q, useCallback as w, useState as oe } from "react";
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
const E = (t, i = !1) => {
  const r = i ? t.width * i : t.width, e = i ? t.height * i : t.height;
  return p(
    () => new n.Vector2(r, e),
    [r, e]
  );
}, O = (t, i, r) => {
  const e = p(
    () => new n.Mesh(i, r),
    [i, r]
  );
  return b(() => {
    t.add(e);
  }, [t, e]), b(() => () => {
    t.remove(e), i.dispose(), r.dispose();
  }, [t, i, r, e]), e;
}, l = (t, i, r) => {
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
  const e = p(() => new n.PlaneGeometry(2, 2), []), o = p(
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
  ), u = E(i, r);
  return b(() => {
    l(o, "uAspect", u.width / u.height), l(o, "uResolution", u.clone());
  }, [u, o]), O(t, e, o), o;
}, se = (t, i) => {
  const r = i, e = t / i, [o, u] = [r * e / 2, r / 2];
  return { width: o, height: u, near: -1e3, far: 1e3 };
}, V = (t) => {
  const i = E(t), { width: r, height: e, near: o, far: u } = se(
    i.x,
    i.y
  );
  return p(
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
}, W = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, U = ({
  scene: t,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = M(), c = E(r, e);
  u.current = p(
    () => new n.WebGLRenderTarget(c.x, c.y, W),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), q(() => {
    var s;
    o && ((s = u.current) == null || s.setSize(c.x, c.y));
  }, [c, o]), b(() => {
    const s = u.current;
    return () => {
      s == null || s.dispose();
    };
  }, []);
  const a = w(
    (s, d) => {
      const v = u.current;
      return s.setRenderTarget(v), d && d({ read: v.texture }), s.render(t, i), s.setRenderTarget(null), s.clear(), v.texture;
    },
    [t, i]
  );
  return [u.current, a];
}, A = ({
  scene: t,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = M({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), c = E(r, e), a = p(() => {
    const d = new n.WebGLRenderTarget(
      c.x,
      c.y,
      W
    ), v = new n.WebGLRenderTarget(
      c.x,
      c.y,
      W
    );
    return { read: d, write: v };
  }, []);
  u.current.read = a.read, u.current.write = a.write, q(() => {
    var d, v;
    o && ((d = u.current.read) == null || d.setSize(c.x, c.y), (v = u.current.write) == null || v.setSize(c.x, c.y));
  }, [c, o]), b(() => {
    const d = u.current;
    return () => {
      var v, f;
      (v = d.read) == null || v.dispose(), (f = d.write) == null || f.dispose();
    };
  }, []);
  const s = w(
    (d, v) => {
      var m;
      const f = u.current;
      return d.setRenderTarget(f.write), v && v({
        read: f.read.texture,
        write: f.write.texture
      }), d.render(t, i), f.swap(), d.setRenderTarget(null), d.clear(), (m = f.read) == null ? void 0 : m.texture;
    },
    [t, i]
  );
  return [
    { read: u.current.read, write: u.current.write },
    s
  ];
}, N = () => {
  const t = M(new n.Vector2(0, 0)), i = M(new n.Vector2(0, 0)), r = M(0), e = M(new n.Vector2(0, 0)), o = M(!1);
  return w((c) => {
    const a = performance.now(), s = c.clone();
    r.current === 0 && (r.current = a, t.current = s);
    const d = Math.max(1, a - r.current);
    r.current = a, e.current.copy(s).sub(t.current).divideScalar(d);
    const v = e.current.length() > 0, f = o.current ? t.current.clone() : s;
    return !o.current && v && (o.current = !0), t.current = s, {
      currentPointer: s,
      prevPointer: f,
      diffPointer: i.current.subVectors(s, f),
      velocity: e.current,
      isVelocityUpdate: v
    };
  }, []);
}, F = (t) => {
  const r = M(
    ((o) => Object.values(o).some((u) => typeof u == "function"))(t) ? t : structuredClone(t)
  ), e = w((o) => {
    for (const u in o) {
      const c = u;
      c in r.current && o[c] !== void 0 && o[c] !== null ? r.current[c] = o[c] : console.error(
        `"${String(
          c
        )}" does not exist in the params. or "${String(
          c
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
}, vt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = ue({ scene: r, size: t, dpr: i }), o = V(t), u = N(), [c, a] = A({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [s, d] = F(le);
  return [
    w(
      (f, m) => {
        const { gl: x, pointer: g } = f;
        m && d(m), l(e, "uTexture", s.texture), l(e, "uRadius", s.radius), l(e, "uSmudge", s.smudge), l(e, "uDissipation", s.dissipation), l(e, "uMotionBlur", s.motionBlur), l(e, "uMotionSample", s.motionSample), l(e, "uColor", s.color);
        const { currentPointer: h, prevPointer: R, velocity: _ } = u(g);
        return l(e, "uMouse", h), l(e, "uPrevMouse", R), l(e, "uVelocity", _), a(x, ({ read: D }) => {
          l(e, "uMap", D);
        });
      },
      [e, u, a, s, d]
    ),
    d,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: c
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
  const i = p(() => new n.PlaneGeometry(2, 2), []), r = p(
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
  return O(t, i, r), r;
}, fe = {
  texture: new n.Texture(),
  color0: new n.Color(16777215),
  color1: new n.Color(0)
}, dt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = de(r), o = V(t), [u, c] = U({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = F(fe);
  return [
    w(
      (v, f) => {
        const { gl: m } = v;
        return f && s(f), l(e, "uTexture", a.texture), l(e, "uColor0", a.color0), l(e, "uColor1", a.color1), c(m);
      },
      [c, e, s, a]
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
var pe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, me = `precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uNoiseMap;
uniform float distortionStrength;
uniform float fogEdge0;
uniform float fogEdge1;
uniform vec3 fogColor;

void main() {
	vec2 uv = vUv;

	float noiseMap = texture2D(uNoiseMap,uv).r;
	
	float noiseTextureMap = noiseMap*2.0-1.0;
	uv += noiseTextureMap * distortionStrength;
	vec3 textureMap = texture2D(uTexture, uv).rgb;

	float edge0 = fogEdge0;
	float edge1 = fogEdge1;
	float blendValue = smoothstep(edge0, edge1, noiseMap);

	vec3 outputColor = blendValue * fogColor + (1.0 - blendValue) * textureMap;
	gl_FragColor = vec4(outputColor, 1.0);
}`;
const ge = (t) => {
  const i = p(() => new n.PlaneGeometry(2, 2), []), r = p(
    () => new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new n.Texture() },
        uNoiseMap: { value: new n.Texture() },
        distortionStrength: { value: 0 },
        fogEdge0: { value: 0 },
        fogEdge1: { value: 0.9 },
        fogColor: { value: new n.Color(16777215) }
      },
      vertexShader: pe,
      fragmentShader: me
    }),
    []
  );
  return O(t, i, r), r;
}, xe = {
  texture: new n.Texture(),
  noiseMap: new n.Texture(),
  distortionStrength: 0.03,
  fogEdge0: 0,
  fogEdge1: 0.9,
  fogColor: new n.Color(16777215)
}, ft = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = ge(r), o = V(t), [u, c] = U({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = F(xe);
  return [
    w(
      (v, f) => {
        const { gl: m, clock: x } = v;
        return f && s(f), l(e, "uTime", x.getElapsedTime()), l(e, "uTexture", a.texture), l(e, "uNoiseMap", a.noiseMap), l(e, "distortionStrength", a.distortionStrength), l(e, "fogEdge0", a.fogEdge0), l(e, "fogEdge1", a.fogEdge1), l(e, "fogColor", a.fogColor), c(m);
      },
      [c, e, s, a]
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
var B = `varying vec2 vUv;
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
const ye = () => p(
  () => new n.ShaderMaterial({
    vertexShader: B,
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
const Me = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: B,
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
const we = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
    fragmentShader: Se
  }),
  []
);
var Re = `precision highp float;

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
const _e = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
    fragmentShader: Re
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
const Ce = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
    fragmentShader: be
  }),
  []
);
var De = `precision highp float;

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
const Pe = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
    fragmentShader: De
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
const Ve = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
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
const Be = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
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
const Ee = () => p(
  () => new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: B,
    fragmentShader: Oe
  }),
  []
), Le = ({
  scene: t,
  size: i,
  dpr: r
}) => {
  const e = p(() => new n.PlaneGeometry(2, 2), []), o = ye(), u = o.clone(), c = Ce(), a = Pe(), s = Me(), d = we(), v = _e(), f = Ve(), m = Be(), x = Ee(), g = p(
    () => ({
      vorticityMaterial: a,
      curlMaterial: c,
      advectionMaterial: s,
      divergenceMaterial: d,
      pressureMaterial: v,
      clearMaterial: f,
      gradientSubtractMaterial: m,
      splatMaterial: x
    }),
    [
      a,
      c,
      s,
      d,
      v,
      f,
      m,
      x
    ]
  ), h = E(i, r);
  b(() => {
    l(
      g.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const y of Object.values(g))
      l(
        y,
        "texelSize",
        new n.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, g]);
  const R = O(t, e, o);
  b(() => {
    o.dispose(), R.material = u;
  }, [o, R, u]), b(() => () => {
    for (const y of Object.values(g))
      y.dispose();
  }, [g]);
  const _ = w(
    (y) => {
      R.material = y, R.material.needsUpdate = !0;
    },
    [R]
  );
  return [g, _];
}, ze = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new n.Vector3(1, 1, 1)
}, pt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), [e, o] = Le({ scene: r, size: t, dpr: i }), u = V(t), c = N(), a = p(
    () => ({
      scene: r,
      camera: u,
      size: t
    }),
    [r, u, t]
  ), [s, d] = A(a), [v, f] = A(a), [m, x] = U(a), [g, h] = U(a), [R, _] = A(a), y = M(0), D = M(new n.Vector2(0, 0)), L = M(new n.Vector3(0, 0, 0)), [C, T] = F(ze);
  return [
    w(
      (k, X) => {
        const { gl: P, pointer: J, clock: $, size: Y } = k;
        X && T(X), y.current === 0 && (y.current = $.getElapsedTime());
        const j = Math.min(
          ($.getElapsedTime() - y.current) / 3,
          0.02
        );
        y.current = $.getElapsedTime();
        const G = d(P, ({ read: S }) => {
          o(e.advectionMaterial), l(e.advectionMaterial, "uVelocity", S), l(e.advectionMaterial, "uSource", S), l(e.advectionMaterial, "dt", j), l(
            e.advectionMaterial,
            "dissipation",
            C.velocity_dissipation
          );
        }), K = f(P, ({ read: S }) => {
          o(e.advectionMaterial), l(e.advectionMaterial, "uVelocity", G), l(e.advectionMaterial, "uSource", S), l(
            e.advectionMaterial,
            "dissipation",
            C.density_dissipation
          );
        }), { currentPointer: Z, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = c(J);
        ee && (d(P, ({ read: S }) => {
          o(e.splatMaterial), l(e.splatMaterial, "uTarget", S), l(e.splatMaterial, "point", Z);
          const z = Q.multiply(
            D.current.set(Y.width, Y.height).multiplyScalar(C.velocity_acceleration)
          );
          l(
            e.splatMaterial,
            "color",
            L.current.set(z.x, z.y, 1)
          ), l(
            e.splatMaterial,
            "radius",
            C.splat_radius
          );
        }), f(P, ({ read: S }) => {
          o(e.splatMaterial), l(e.splatMaterial, "uTarget", S);
          const z = typeof C.fluid_color == "function" ? C.fluid_color(te) : C.fluid_color;
          l(e.splatMaterial, "color", z);
        }));
        const ne = x(P, () => {
          o(e.curlMaterial), l(e.curlMaterial, "uVelocity", G);
        });
        d(P, ({ read: S }) => {
          o(e.vorticityMaterial), l(e.vorticityMaterial, "uVelocity", S), l(e.vorticityMaterial, "uCurl", ne), l(
            e.vorticityMaterial,
            "curl",
            C.curl_strength
          ), l(e.vorticityMaterial, "dt", j);
        });
        const re = h(P, () => {
          o(e.divergenceMaterial), l(e.divergenceMaterial, "uVelocity", G);
        });
        _(P, ({ read: S }) => {
          o(e.clearMaterial), l(e.clearMaterial, "uTexture", S), l(
            e.clearMaterial,
            "value",
            C.pressure_dissipation
          );
        }), o(e.pressureMaterial), l(e.pressureMaterial, "uDivergence", re);
        let H;
        for (let S = 0; S < C.pressure_iterations; S++)
          H = _(P, ({ read: z }) => {
            l(e.pressureMaterial, "uPressure", z);
          });
        return d(P, ({ read: S }) => {
          o(e.gradientSubtractMaterial), l(
            e.gradientSubtractMaterial,
            "uPressure",
            H
          ), l(e.gradientSubtractMaterial, "uVelocity", S);
        }), K;
      },
      [
        e,
        o,
        x,
        f,
        h,
        c,
        _,
        d,
        T,
        C
      ]
    ),
    T,
    {
      scene: r,
      materials: e,
      camera: u,
      renderTarget: {
        velocity: s,
        density: v,
        curl: m,
        divergence: g,
        pressure: R
      }
    }
  ];
}, Ae = ({ scale: t, max: i, texture: r, scene: e }) => {
  const o = M([]), u = p(
    () => new n.PlaneGeometry(t, t),
    [t]
  ), c = p(
    () => new n.MeshBasicMaterial({
      map: r ?? null,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return b(() => {
    for (let a = 0; a < i; a++) {
      const s = new n.Mesh(u.clone(), c.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, e.add(s), o.current.push(s);
    }
  }, [u, c, e, i]), b(() => () => {
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
}, mt = ({
  texture: t,
  scale: i = 64,
  max: r = 100,
  size: e
}) => {
  const o = p(() => new n.Scene(), []), u = Ae({
    scale: i,
    max: r,
    texture: t,
    scene: o
  }), c = V(e), a = N(), [s, d] = U({
    scene: o,
    camera: c,
    size: e
  }), [v, f] = F(Ie), m = M(0);
  return [
    w(
      (g, h) => {
        const { gl: R, pointer: _, size: y } = g;
        h && f(h);
        const { currentPointer: D, diffPointer: L } = a(_);
        if (v.frequency < L.length()) {
          const T = u[m.current];
          T.visible = !0, T.position.set(
            D.x * (y.width / 2),
            D.y * (y.height / 2),
            0
          ), T.scale.x = T.scale.y = 0, T.material.opacity = v.alpha, m.current = (m.current + 1) % r;
        }
        return u.forEach((T) => {
          if (T.visible) {
            const I = T.material;
            T.rotation.z += v.rotation, I.opacity *= v.fadeout_speed, T.scale.x = v.fadeout_speed * T.scale.x + v.scale, T.scale.y = T.scale.x, I.opacity < 2e-3 && (T.visible = !1);
          }
        }), d(R);
      },
      [d, u, a, r, v, f]
    ),
    f,
    {
      scene: o,
      camera: c,
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
  const e = p(() => new n.PlaneGeometry(2, 2), []), o = p(
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
  ), u = E(i, r);
  return b(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), O(t, e, o), o;
}, Ne = {
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
}, gt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = We({ scene: r, size: t, dpr: i }), o = V(t), [u, c] = U({
    scene: r,
    camera: o,
    dpr: i,
    size: t,
    isSizeUpdate: !0
  }), [a, s] = F(Ne);
  return [
    w(
      (v, f) => {
        const { gl: m } = v;
        return f && s(f), l(e, "uTexture0", a.texture0), l(e, "uTexture1", a.texture1), l(e, "uTextureResolution", a.textureResolution), l(e, "padding", a.padding), l(e, "uMap", a.map), l(e, "mapIntensity", a.mapIntensity), l(e, "edgeIntensity", a.edgeIntensity), l(e, "epicenter", a.epicenter), l(e, "progress", a.progress), l(e, "dirX", a.dir.x), l(e, "dirY", a.dir.y), c(m);
      },
      [c, e, a, s]
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
var Xe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ye = `precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float timeStrength;
uniform int noiseOctaves;
uniform int fbmOctaves;

const float per  = 0.5;
const float PI   = 3.14159265359;

float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

float rnd(vec2 p){
	vec3 p3 = fract(vec3(p.xyx) * .1995);
	p3 += dot(p3, p3.yzx + 11.28);
	return fract((p3.x + p3.y) * p3.z);
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

void main() {
	float noiseMap = fbm(gl_FragCoord.xy ,uTime * timeStrength);
	gl_FragColor = vec4(noiseMap,noiseMap,noiseMap,1.0);
}`;
const je = (t) => {
  const i = p(() => new n.PlaneGeometry(2, 2), []), r = p(
    () => new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        timeStrength: { value: 0 },
        noiseOctaves: { value: 0 },
        fbmOctaves: { value: 0 }
      },
      vertexShader: Xe,
      fragmentShader: Ye
    }),
    []
  );
  return O(t, i, r), r;
}, He = {
  timeStrength: 0.3,
  noiseOctaves: 8,
  fbmOctaves: 3
}, xt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = je(r), o = V(t), [u, c] = U({
    scene: r,
    camera: o,
    size: t,
    dpr: i
  }), [a, s] = F(He);
  return [
    w(
      (v, f) => {
        const { gl: m, clock: x } = v;
        return f && s(f), l(e, "timeStrength", a.timeStrength), l(e, "noiseOctaves", a.noiseOctaves), l(e, "fbmOctaves", a.fbmOctaves), l(e, "uTime", x.getElapsedTime()), c(m);
      },
      [c, e, s, a]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
}, qe = (t) => {
  var o, u, c;
  const i = (o = t.dom) == null ? void 0 : o.length, r = (u = t.texture) == null ? void 0 : u.length, e = (c = t.resolution) == null ? void 0 : c.length;
  if (!i || !r || !e)
    throw new Error("No dom or texture or resolution is set");
  if (i !== r || i !== e)
    throw new Error("Match dom, texture and resolution length");
};
var ke = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Je = `precision highp float;

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
const Ke = ({
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
        vertexShader: ke,
        fragmentShader: Je,
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
}, Ze = () => {
  const t = M([]), i = M([]);
  return w(
    ({
      isIntersectingRef: e,
      isIntersectingOnceRef: o,
      params: u
    }) => {
      t.current.length > 0 && t.current.forEach((a, s) => {
        a.unobserve(i.current[s]);
      }), i.current = [], t.current = [];
      const c = new Array(u.dom.length).fill(!1);
      e.current = [...c], o.current = [...c], u.dom.forEach((a, s) => {
        const d = (f) => {
          f.forEach((m) => {
            u.onIntersect[s] && u.onIntersect[s](m), e.current[s] = m.isIntersecting;
          });
        }, v = new IntersectionObserver(d, {
          rootMargin: "0px",
          threshold: 0
        });
        v.observe(a), t.current.push(v), i.current.push(a);
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
  e.children.forEach((u, c) => {
    const a = t.dom[c];
    if (!a)
      throw new Error("DOM is null.");
    if (o.current[c]) {
      const s = a.getBoundingClientRect();
      if (u.scale.set(s.width, s.height, 1), u.position.set(
        s.left + s.width * 0.5 - i.width * 0.5,
        -s.top - s.height * 0.5 + i.height * 0.5,
        0
      ), u instanceof n.Mesh) {
        const d = u.material;
        l(d, "u_texture", t.texture[c]), l(d, "u_textureResolution", t.resolution[c]), l(
          d,
          "u_resolution",
          r.current.set(s.width, s.height)
        ), l(
          d,
          "u_borderRadius",
          t.boderRadius[c] ? t.boderRadius[c] : 0
        );
      }
    }
  });
}, et = () => {
  const t = M([]), i = M([]), r = w((e, o = !1) => {
    t.current.forEach((c, a) => {
      c && (i.current[a] = !0);
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
  onIntersect: []
}, ht = ({
  size: t,
  dpr: i
}, r = []) => {
  const e = p(() => new n.Scene(), []), o = V(t), [u, c] = U({
    scene: e,
    camera: o,
    size: t,
    dpr: i,
    isSizeUpdate: !0
  }), [a, s] = F(tt), d = M(new n.Vector2(0, 0)), [v, f] = oe(!0);
  b(() => {
    f(!0);
  }, r);
  const m = Ze(), { isIntersectingOnceRef: x, isIntersectingRef: g, isIntersecting: h } = et();
  return [
    w(
      (_, y) => {
        const { gl: D, size: L } = _;
        return y && s(y), qe(a), v && (Ke({
          params: a,
          size: L,
          scene: e
        }), m({
          isIntersectingRef: g,
          isIntersectingOnceRef: x,
          params: a
        }), f(!1)), Qe({
          params: a,
          size: L,
          resolutionRef: d,
          scene: e,
          isIntersectingRef: g
        }), c(D);
      },
      [
        c,
        s,
        m,
        v,
        e,
        a,
        x,
        g
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
  const i = p(() => new n.PlaneGeometry(2, 2), []), r = p(
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
  return O(t, i, r), r;
}, at = {
  texture: new n.Texture(),
  blurSize: 3,
  blurPower: 5
}, yt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = ot(r), o = V(t), u = p(
    () => ({
      scene: r,
      camera: o,
      size: t,
      dpr: i
    }),
    [r, o, t, i]
  ), [c, a] = U(u), [s, d] = A(u), [v, f] = F(at);
  return [
    w(
      (x, g) => {
        const { gl: h } = x;
        g && f(g), l(e, "uTexture", v.texture), l(e, "uResolution", [v.texture.source.data.width, v.texture.source.data.height]), l(e, "uBlurSize", v.blurSize);
        let R = d(h);
        const _ = v.blurPower;
        for (let D = 0; D < _; D++)
          l(e, "uTexture", R), R = d(h);
        return a(h);
      },
      [a, d, e, f, v]
    ),
    f,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: c
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
  const e = p(() => new n.PlaneGeometry(2, 2), []), o = p(
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
  ), u = E(i, r);
  return b(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), O(t, e, o), o;
}, lt = {
  epicenter: new n.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Tt = ({
  size: t,
  dpr: i
}) => {
  const r = p(() => new n.Scene(), []), e = st({ scene: r, size: t, dpr: i }), o = V(t), [u, c] = U({
    scene: r,
    camera: o,
    size: t,
    dpr: i,
    isSizeUpdate: !0
  }), [a, s] = F(lt);
  return [
    w(
      (v, f) => {
        const { gl: m } = v;
        return f && s(f), l(e, "uEpicenter", a.epicenter), l(e, "uProgress", a.progress), l(e, "uWidth", a.width), l(e, "uStrength", a.strength), l(
          e,
          "uMode",
          a.mode === "center" ? 0 : a.mode === "horizontal" ? 1 : 2
        ), c(m);
      },
      [c, e, s, a]
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
export {
  le as BRUSH_PARAMS,
  tt as DOMSYNCER_PARAMS,
  fe as DUOTONE_PARAMS,
  ze as FLUID_PARAMS,
  xe as FOGPROJECTION_PARAMS,
  Ne as FXTEXTURE_PARAMS,
  He as NOISE_PARAMS,
  Ie as RIPPLE_PARAMS,
  at as SIMPLEBLUR_PARAMS,
  lt as WAVE_PARAMS,
  l as setUniform,
  O as useAddMesh,
  vt as useBrush,
  V as useCamera,
  ht as useDomSyncer,
  A as useDoubleFBO,
  dt as useDuoTone,
  pt as useFluid,
  ft as useFogProjection,
  gt as useFxTexture,
  xt as useNoise,
  F as useParams,
  N as usePointer,
  E as useResolution,
  mt as useRipple,
  yt as useSimpleBlur,
  U as useSingleFBO,
  Tt as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
