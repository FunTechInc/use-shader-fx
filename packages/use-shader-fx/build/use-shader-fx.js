import * as t from "three";
import { useMemo as d, useEffect as b, useRef as T, useLayoutEffect as k, useCallback as C } from "react";
var oe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ae = `precision mediump float;

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
const L = (r, a = !1) => {
  const n = a ? r.width * a : r.width, e = a ? r.height * a : r.height;
  return d(
    () => new t.Vector2(n, e),
    [n, e]
  );
}, E = (r, a, n) => {
  const e = d(
    () => new t.Mesh(a, n),
    [a, n]
  );
  return b(() => {
    r.add(e);
  }, [r, e]), b(() => () => {
    r.remove(e), a.dispose(), n.dispose();
  }, [r, a, n, e]), e;
}, i = (r, a, n) => {
  r.uniforms && r.uniforms[a] && n !== void 0 && n !== null ? r.uniforms[a].value = n : console.error(
    `Uniform key "${String(
      a
    )}" does not exist in the material. or "${String(
      a
    )}" is null | undefined`
  );
}, ie = ({
  scene: r,
  size: a,
  dpr: n
}) => {
  const e = d(() => new t.PlaneGeometry(2, 2), []), o = d(
    () => new t.ShaderMaterial({
      uniforms: {
        uMap: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uAspect: { value: 0 },
        uTexture: { value: new t.Texture() },
        uRadius: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 0 },
        uMouse: { value: new t.Vector2(0, 0) },
        uPrevMouse: { value: new t.Vector2(0, 0) },
        uVelocity: { value: new t.Vector2(0, 0) },
        uColor: { value: new t.Color(16777215) }
      },
      vertexShader: oe,
      fragmentShader: ae
    }),
    []
  ), u = L(a, n);
  return b(() => {
    i(o, "uAspect", u.width / u.height), i(o, "uResolution", u.clone());
  }, [u, o]), E(r, e, o), o;
}, ue = (r, a) => {
  const n = a, e = r / a, [o, u] = [n * e / 2, n / 2];
  return { width: o, height: u, near: -1e3, far: 1e3 };
}, U = (r) => {
  const a = L(r), { width: n, height: e, near: o, far: u } = ue(
    a.x,
    a.y
  );
  return d(
    () => new t.OrthographicCamera(
      -n,
      n,
      e,
      -e,
      o,
      u
    ),
    [n, e, o, u]
  );
}, G = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, _ = ({
  scene: r,
  camera: a,
  size: n,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = T(), s = L(n, e);
  u.current = d(
    () => new t.WebGLRenderTarget(s.x, s.y, G),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), k(() => {
    var c;
    o && ((c = u.current) == null || c.setSize(s.x, s.y));
  }, [s, o]), b(() => {
    const c = u.current;
    return () => {
      c == null || c.dispose();
    };
  }, []);
  const l = C(
    (c, v) => {
      const f = u.current;
      return c.setRenderTarget(f), v && v({ read: f.texture }), c.render(r, a), c.setRenderTarget(null), c.clear(), f.texture;
    },
    [r, a]
  );
  return [u.current, l];
}, A = ({
  scene: r,
  camera: a,
  size: n,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = T({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), s = L(n, e), l = d(() => {
    const v = new t.WebGLRenderTarget(
      s.x,
      s.y,
      G
    ), f = new t.WebGLRenderTarget(
      s.x,
      s.y,
      G
    );
    return { read: v, write: f };
  }, []);
  u.current.read = l.read, u.current.write = l.write, k(() => {
    var v, f;
    o && ((v = u.current.read) == null || v.setSize(s.x, s.y), (f = u.current.write) == null || f.setSize(s.x, s.y));
  }, [s, o]), b(() => {
    const v = u.current;
    return () => {
      var f, m;
      (f = v.read) == null || f.dispose(), (m = v.write) == null || m.dispose();
    };
  }, []);
  const c = C(
    (v, f) => {
      var p;
      const m = u.current;
      return v.setRenderTarget(m.write), f && f({
        read: m.read.texture,
        write: m.write.texture
      }), v.render(r, a), m.swap(), v.setRenderTarget(null), v.clear(), (p = m.read) == null ? void 0 : p.texture;
    },
    [r, a]
  );
  return [
    { read: u.current.read, write: u.current.write },
    c
  ];
}, W = () => {
  const r = T(new t.Vector2(0, 0)), a = T(new t.Vector2(0, 0)), n = T(0), e = T(new t.Vector2(0, 0)), o = T(!1);
  return C((s) => {
    const l = performance.now(), c = s.clone();
    n.current === 0 && (n.current = l, r.current = c);
    const v = Math.max(1, l - n.current);
    n.current = l, e.current.copy(c).sub(r.current).divideScalar(v);
    const f = e.current.length() > 0, m = o.current ? r.current.clone() : c;
    return !o.current && f && (o.current = !0), r.current = c, {
      currentPointer: c,
      prevPointer: m,
      diffPointer: a.current.subVectors(c, m),
      velocity: e.current,
      isVelocityUpdate: f
    };
  }, []);
}, F = (r) => {
  const n = T(
    ((o) => Object.values(o).some((u) => typeof u == "function"))(r) ? r : structuredClone(r)
  ), e = C((o) => {
    for (const u in o) {
      const s = u;
      s in n.current && o[s] !== void 0 && o[s] !== null ? n.current[s] = o[s] : console.error(
        `"${String(
          s
        )}" does not exist in the params. or "${String(
          s
        )}" is null | undefined`
      );
    }
  }, []);
  return [n.current, e];
}, se = {
  texture: new t.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Color(16777215)
}, ke = ({
  size: r,
  dpr: a
}) => {
  const n = d(() => new t.Scene(), []), e = ie({ scene: n, size: r, dpr: a }), o = U(r), u = W(), [s, l] = A({
    scene: n,
    camera: o,
    size: r
  }), [c, v] = F(se);
  return [
    C(
      (m, p) => {
        const { gl: h, pointer: S } = m;
        p && v(p), i(e, "uTexture", c.texture), i(e, "uRadius", c.radius), i(e, "uSmudge", c.smudge), i(e, "uDissipation", c.dissipation), i(e, "uMotionBlur", c.motionBlur), i(e, "uMotionSample", c.motionSample), i(e, "uColor", c.color);
        const { currentPointer: M, prevPointer: R, velocity: V } = u(S);
        return i(e, "uMouse", M), i(e, "uPrevMouse", R), i(e, "uVelocity", V), l(h, ({ read: B }) => {
          i(e, "uMap", B);
        });
      },
      [e, u, l, c, v]
    ),
    v,
    {
      scene: n,
      material: e,
      camera: o,
      renderTarget: s
    }
  ];
};
var le = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ce = `precision mediump float;

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
const ve = (r) => {
  const a = d(() => new t.PlaneGeometry(2, 2), []), n = d(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: le,
      fragmentShader: ce
    }),
    []
  );
  return E(r, a, n), n;
}, fe = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, He = ({
  size: r
}) => {
  const a = d(() => new t.Scene(), []), n = ve(a), e = U(r), [o, u] = _({
    scene: a,
    camera: e,
    size: r
  }), [s, l] = F(fe);
  return [
    C(
      (v, f) => {
        const { gl: m } = v;
        return f && l(f), i(n, "uTexture", s.texture), i(n, "uColor0", s.color0), i(n, "uColor1", s.color1), u(m);
      },
      [u, n, l, s]
    ),
    l,
    {
      scene: a,
      material: n,
      camera: e,
      renderTarget: o
    }
  ];
};
var de = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, me = `precision mediump float;

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
const pe = (r) => {
  const a = d(() => new t.PlaneGeometry(2, 2), []), n = d(
    () => new t.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new t.Texture() },
        uNoiseMap: { value: new t.Texture() },
        distortionStrength: { value: 0 },
        fogEdge0: { value: 0 },
        fogEdge1: { value: 0.9 },
        fogColor: { value: new t.Color(16777215) }
      },
      vertexShader: de,
      fragmentShader: me
    }),
    []
  );
  return E(r, a, n), n;
}, ge = {
  texture: new t.Texture(),
  noiseMap: new t.Texture(),
  distortionStrength: 0.03,
  fogEdge0: 0,
  fogEdge1: 0.9,
  fogColor: new t.Color(16777215)
}, Je = ({
  size: r
}) => {
  const a = d(() => new t.Scene(), []), n = pe(a), e = U(r), [o, u] = _({
    scene: a,
    camera: e,
    size: r
  }), [s, l] = F(ge);
  return [
    C(
      (v, f) => {
        const { gl: m, clock: p } = v;
        return f && l(f), i(n, "uTime", p.getElapsedTime()), i(n, "uTexture", s.texture), i(n, "uNoiseMap", s.noiseMap), i(n, "distortionStrength", s.distortionStrength), i(n, "fogEdge0", s.fogEdge0), i(n, "fogEdge1", s.fogEdge1), i(n, "fogColor", s.fogColor), u(m);
      },
      [u, n, l, s]
    ),
    l,
    {
      scene: a,
      material: n,
      camera: e,
      renderTarget: o
    }
  ];
};
var P = `precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
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
}`, xe = `precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const ye = () => d(
  () => new t.ShaderMaterial({
    vertexShader: P,
    fragmentShader: xe,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Me = `precision mediump float;
precision mediump sampler2D;

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
const Te = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: P,
    fragmentShader: Me
  }),
  []
);
var he = `precision mediump float;
precision mediump sampler2D;

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
const Se = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: he
  }),
  []
);
var we = `precision mediump float;
precision mediump sampler2D;

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
const Ce = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: we
  }),
  []
);
var Re = `precision mediump float;
precision mediump sampler2D;

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
const be = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: Re
  }),
  []
);
var De = `precision mediump float;
precision mediump sampler2D;

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
const Ve = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: De
  }),
  []
);
var Pe = `precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const _e = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: Pe
  }),
  []
);
var Ue = `precision mediump float;
precision mediump sampler2D;

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
const Fe = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: Ue
  }),
  []
);
var Be = `precision mediump float;
precision mediump sampler2D;

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
const Oe = () => d(
  () => new t.ShaderMaterial({
    uniforms: {
      uTarget: { value: new t.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new t.Vector3() },
      point: { value: new t.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: P,
    fragmentShader: Be
  }),
  []
), Le = ({
  scene: r,
  size: a,
  dpr: n
}) => {
  const e = d(() => new t.PlaneGeometry(2, 2), []), o = ye(), u = o.clone(), s = be(), l = Ve(), c = Te(), v = Se(), f = Ce(), m = _e(), p = Fe(), h = Oe(), S = d(
    () => ({
      vorticityMaterial: l,
      curlMaterial: s,
      advectionMaterial: c,
      divergenceMaterial: v,
      pressureMaterial: f,
      clearMaterial: m,
      gradientSubtractMaterial: p,
      splatMaterial: h
    }),
    [
      l,
      s,
      c,
      v,
      f,
      m,
      p,
      h
    ]
  ), M = L(a, n);
  b(() => {
    i(
      S.splatMaterial,
      "aspectRatio",
      M.x / M.y
    );
    for (const y of Object.values(S))
      i(
        y,
        "texelSize",
        new t.Vector2(1 / M.x, 1 / M.y)
      );
  }, [M, S]);
  const R = E(r, e, o);
  b(() => {
    o.dispose(), R.material = u;
  }, [o, R, u]), b(() => () => {
    for (const y of Object.values(S))
      y.dispose();
  }, [S]);
  const V = C(
    (y) => {
      R.material = y, R.material.needsUpdate = !0;
    },
    [R]
  );
  return [S, V];
}, Ee = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fruid_color: new t.Vector3(1, 1, 1)
}, Ke = ({
  size: r,
  dpr: a
}) => {
  const n = d(() => new t.Scene(), []), [e, o] = Le({ scene: n, size: r, dpr: a }), u = U(r), s = W(), l = d(
    () => ({
      scene: n,
      camera: u,
      size: r,
      dpr: a
    }),
    [n, u, r, a]
  ), [c, v] = A(l), [f, m] = A(l), [p, h] = _(l), [S, M] = _(l), [R, V] = A(l), y = T(0), B = T(new t.Vector2(0, 0)), $ = T(new t.Vector3(0, 0, 0)), [w, g] = F(Ee);
  return [
    C(
      (H, q) => {
        const { gl: D, pointer: J, clock: N, size: X } = H;
        q && g(q), y.current === 0 && (y.current = N.getElapsedTime());
        const Y = Math.min(
          (N.getElapsedTime() - y.current) / 3,
          0.02
        );
        y.current = N.getElapsedTime();
        const z = v(D, ({ read: x }) => {
          o(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", x), i(e.advectionMaterial, "uSource", x), i(e.advectionMaterial, "dt", Y), i(
            e.advectionMaterial,
            "dissipation",
            w.velocity_dissipation
          );
        }), K = m(D, ({ read: x }) => {
          o(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", z), i(e.advectionMaterial, "uSource", x), i(
            e.advectionMaterial,
            "dissipation",
            w.density_dissipation
          );
        }), { currentPointer: Z, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = s(J);
        ee && (v(D, ({ read: x }) => {
          o(e.splatMaterial), i(e.splatMaterial, "uTarget", x), i(e.splatMaterial, "point", Z);
          const O = Q.multiply(
            B.current.set(X.width, X.height).multiplyScalar(w.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            $.current.set(O.x, O.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            w.splat_radius
          );
        }), m(D, ({ read: x }) => {
          o(e.splatMaterial), i(e.splatMaterial, "uTarget", x);
          const O = typeof w.fruid_color == "function" ? w.fruid_color(te) : w.fruid_color;
          i(e.splatMaterial, "color", O);
        }));
        const ne = h(D, () => {
          o(e.curlMaterial), i(e.curlMaterial, "uVelocity", z);
        });
        v(D, ({ read: x }) => {
          o(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", x), i(e.vorticityMaterial, "uCurl", ne), i(
            e.vorticityMaterial,
            "curl",
            w.curl_strength
          ), i(e.vorticityMaterial, "dt", Y);
        });
        const re = M(D, () => {
          o(e.divergenceMaterial), i(e.divergenceMaterial, "uVelocity", z);
        });
        V(D, ({ read: x }) => {
          o(e.clearMaterial), i(e.clearMaterial, "uTexture", x), i(
            e.clearMaterial,
            "value",
            w.pressure_dissipation
          );
        }), o(e.pressureMaterial), i(e.pressureMaterial, "uDivergence", re);
        let j;
        for (let x = 0; x < w.pressure_iterations; x++)
          j = V(D, ({ read: O }) => {
            i(e.pressureMaterial, "uPressure", O);
          });
        return v(D, ({ read: x }) => {
          o(e.gradientSubtractMaterial), i(
            e.gradientSubtractMaterial,
            "uPressure",
            j
          ), i(e.gradientSubtractMaterial, "uVelocity", x);
        }), K;
      },
      [
        e,
        o,
        h,
        m,
        M,
        s,
        V,
        v,
        g,
        w
      ]
    ),
    g,
    {
      scene: n,
      materials: e,
      camera: u,
      renderTarget: {
        velocity: c,
        density: f,
        curl: p,
        divergence: S,
        pressure: R
      }
    }
  ];
}, Ae = ({ scale: r, max: a, texture: n, scene: e }) => {
  const o = T([]), u = d(
    () => new t.PlaneGeometry(r, r),
    [r]
  ), s = d(
    () => new t.MeshBasicMaterial({
      map: n ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [n]
  );
  return b(() => {
    for (let l = 0; l < a; l++) {
      const c = new t.Mesh(u.clone(), s.clone());
      c.rotateZ(2 * Math.PI * Math.random()), c.visible = !1, e.add(c), o.current.push(c);
    }
  }, [u, s, e, a]), b(() => () => {
    o.current.forEach((l) => {
      l.geometry.dispose(), Array.isArray(l.material) ? l.material.forEach((c) => c.dispose()) : l.material.dispose(), e.remove(l);
    }), o.current = [];
  }, [e]), o.current;
}, $e = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Ze = ({
  texture: r,
  scale: a = 64,
  max: n = 100,
  size: e
}) => {
  const o = d(() => new t.Scene(), []), u = Ae({
    scale: a,
    max: n,
    texture: r,
    scene: o
  }), s = U(e), l = W(), [c, v] = _({
    scene: o,
    camera: s,
    size: e
  }), [f, m] = F($e), p = T(0);
  return [
    C(
      (S, M) => {
        const { gl: R, pointer: V, size: y } = S;
        M && m(M);
        const { currentPointer: B, diffPointer: $ } = l(V);
        if (f.frequency < $.length()) {
          const g = u[p.current];
          g.visible = !0, g.position.set(
            B.x * (y.width / 2),
            B.y * (y.height / 2),
            0
          ), g.scale.x = g.scale.y = 0, g.material.opacity = f.alpha, p.current = (p.current + 1) % n;
        }
        return u.forEach((g) => {
          if (g.visible) {
            const I = g.material;
            g.rotation.z += f.rotation, I.opacity *= f.fadeout_speed, g.scale.x = f.fadeout_speed * g.scale.x + f.scale, g.scale.y = g.scale.x, I.opacity < 2e-3 && (g.visible = !1);
          }
        }), v(R);
      },
      [v, u, l, n, f, m]
    ),
    m,
    {
      scene: o,
      camera: s,
      meshArr: u,
      renderTarget: c
    }
  ];
};
var Ie = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ne = `precision mediump float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uNoiseMap;
uniform float noiseStrength;
uniform float progress;
uniform float dirX;
uniform float dirY;

void main() {
	vec2 bgRatio=vec2(
		min((uResolution.x/uResolution.y)/(uImageResolution.x/uImageResolution.y),1.),
		min((uResolution.y/uResolution.x)/(uImageResolution.y/uImageResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	
	vec2 noiseMap = texture2D(uNoiseMap, uv).rg;
	noiseMap=noiseMap*2.0-1.0;
	uv += noiseMap * noiseStrength;

	
	vec2 centeredUV = uv - vec2(0.5);
	
	
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
const ze = ({
  scene: r,
  size: a,
  dpr: n
}) => {
  const e = d(() => new t.PlaneGeometry(2, 2), []), o = d(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uImageResolution: { value: new t.Vector2() },
        uTexture0: { value: new t.Texture() },
        uTexture1: { value: new t.Texture() },
        uNoiseMap: { value: new t.Texture() },
        noiseStrength: { value: 0 },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: Ie,
      fragmentShader: Ne
    }),
    []
  ), u = L(a, n);
  return b(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), E(r, e, o), o;
}, Ge = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  imageResolution: new t.Vector2(0, 0),
  noiseMap: new t.Texture(),
  noiseStrength: 0,
  progress: 0,
  dir: new t.Vector2(0, 0)
}, Qe = ({
  size: r,
  dpr: a
}) => {
  const n = d(() => new t.Scene(), []), e = ze({ scene: n, size: r, dpr: a }), o = U(r), [u, s] = _({
    scene: n,
    camera: o,
    dpr: a,
    size: r,
    isSizeUpdate: !0
  }), [l, c] = F(Ge);
  return [
    C(
      (f, m) => {
        const { gl: p } = f;
        return m && c(m), i(e, "uTexture0", l.texture0), i(e, "uTexture1", l.texture1), i(e, "uImageResolution", l.imageResolution), i(e, "uNoiseMap", l.noiseMap), i(e, "noiseStrength", l.noiseStrength), i(e, "progress", l.progress), i(e, "dirX", l.dir.x), i(e, "dirY", l.dir.y), s(p);
      },
      [s, e, l, c]
    ),
    c,
    {
      scene: n,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var We = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, qe = `precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float timeStrength;
uniform int noiseOctaves;
uniform int fbmOctaves;

const float per  = 0.5;
const float PI   = 3.1415926;

float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
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
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
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
	vec2 uv = vUv;
	float noiseMap = fbm(gl_FragCoord.xy ,uTime * timeStrength);
	gl_FragColor = vec4(noiseMap,noiseMap,noiseMap,1.0);
}`;
const Xe = (r) => {
  const a = d(() => new t.PlaneGeometry(2, 2), []), n = d(
    () => new t.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        timeStrength: { value: 0 },
        noiseOctaves: { value: 0 },
        fbmOctaves: { value: 0 }
      },
      vertexShader: We,
      fragmentShader: qe
    }),
    []
  );
  return E(r, a, n), n;
}, Ye = {
  timeStrength: 0.3,
  noiseOctaves: 8,
  fbmOctaves: 3
}, et = ({
  size: r,
  dpr: a
}) => {
  const n = d(() => new t.Scene(), []), e = Xe(n), o = U(r), [u, s] = _({
    scene: n,
    camera: o,
    size: r,
    dpr: a
  }), [l, c] = F(Ye);
  return [
    C(
      (f, m) => {
        const { gl: p, clock: h } = f;
        return m && c(m), i(e, "timeStrength", l.timeStrength), i(e, "noiseOctaves", l.noiseOctaves), i(e, "fbmOctaves", l.fbmOctaves), i(e, "uTime", h.getElapsedTime()), s(p);
      },
      [s, e, c, l]
    ),
    c,
    {
      scene: n,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
export {
  i as setUniform,
  E as useAddMesh,
  ke as useBrush,
  U as useCamera,
  A as useDoubleFBO,
  He as useDuoTone,
  Je as useFogProjection,
  Ke as useFruid,
  et as useNoise,
  F as useParams,
  W as usePointer,
  L as useResolution,
  Ze as useRipple,
  _ as useSingleFBO,
  Qe as useTransitionBg
};
//# sourceMappingURL=use-shader-fx.js.map
