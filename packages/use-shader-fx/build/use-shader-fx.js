import * as t from "three";
import { useMemo as m, useEffect as b, useRef as S, useLayoutEffect as k, useCallback as C } from "react";
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
const L = (n, i = !1) => {
  const r = i ? n.width * i : n.width, e = i ? n.height * i : n.height;
  return m(
    () => new t.Vector2(r, e),
    [r, e]
  );
}, E = (n, i, r) => {
  const e = m(
    () => new t.Mesh(i, r),
    [i, r]
  );
  return b(() => {
    n.add(e);
  }, [n, e]), b(() => () => {
    n.remove(e), i.dispose(), r.dispose();
  }, [n, i, r, e]), e;
}, a = (n, i, r) => {
  n.uniforms && n.uniforms[i] && r !== void 0 && r !== null ? n.uniforms[i].value = r : console.error(
    `Uniform key "${String(
      i
    )}" does not exist in the material. or "${String(
      i
    )}" is null | undefined`
  );
}, ie = ({
  scene: n,
  size: i,
  dpr: r
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), o = m(
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
  ), l = L(i, r);
  return b(() => {
    a(o, "uAspect", l.width / l.height), a(o, "uResolution", l.clone());
  }, [l, o]), E(n, e, o), o;
}, ue = (n, i) => {
  const r = i, e = n / i, [o, l] = [r * e / 2, r / 2];
  return { width: o, height: l, near: -1e3, far: 1e3 };
}, U = (n) => {
  const i = L(n), { width: r, height: e, near: o, far: l } = ue(
    i.x,
    i.y
  );
  return m(
    () => new t.OrthographicCamera(
      -r,
      r,
      e,
      -e,
      o,
      l
    ),
    [r, e, o, l]
  );
}, G = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, _ = ({
  scene: n,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const l = S(), c = L(r, e);
  l.current = m(
    () => new t.WebGLRenderTarget(c.x, c.y, G),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), k(() => {
    var s;
    o && ((s = l.current) == null || s.setSize(c.x, c.y));
  }, [c, o]), b(() => {
    const s = l.current;
    return () => {
      s == null || s.dispose();
    };
  }, []);
  const u = C(
    (s, v) => {
      const d = l.current;
      return s.setRenderTarget(d), v && v({ read: d.texture }), s.render(n, i), s.setRenderTarget(null), s.clear(), d.texture;
    },
    [n, i]
  );
  return [l.current, u];
}, A = ({
  scene: n,
  camera: i,
  size: r,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const l = S({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), c = L(r, e), u = m(() => {
    const v = new t.WebGLRenderTarget(
      c.x,
      c.y,
      G
    ), d = new t.WebGLRenderTarget(
      c.x,
      c.y,
      G
    );
    return { read: v, write: d };
  }, []);
  l.current.read = u.read, l.current.write = u.write, k(() => {
    var v, d;
    o && ((v = l.current.read) == null || v.setSize(c.x, c.y), (d = l.current.write) == null || d.setSize(c.x, c.y));
  }, [c, o]), b(() => {
    const v = l.current;
    return () => {
      var d, f;
      (d = v.read) == null || d.dispose(), (f = v.write) == null || f.dispose();
    };
  }, []);
  const s = C(
    (v, d) => {
      var p;
      const f = l.current;
      return v.setRenderTarget(f.write), d && d({
        read: f.read.texture,
        write: f.write.texture
      }), v.render(n, i), f.swap(), v.setRenderTarget(null), v.clear(), (p = f.read) == null ? void 0 : p.texture;
    },
    [n, i]
  );
  return [
    { read: l.current.read, write: l.current.write },
    s
  ];
}, W = () => {
  const n = S(new t.Vector2(0, 0)), i = S(new t.Vector2(0, 0)), r = S(0), e = S(new t.Vector2(0, 0)), o = S(!1);
  return C((c) => {
    const u = performance.now(), s = c.clone();
    r.current === 0 && (r.current = u, n.current = s);
    const v = Math.max(1, u - r.current);
    r.current = u, e.current.copy(s).sub(n.current).divideScalar(v);
    const d = e.current.length() > 0, f = o.current ? n.current.clone() : s;
    return !o.current && d && (o.current = !0), n.current = s, {
      currentPointer: s,
      prevPointer: f,
      diffPointer: i.current.subVectors(s, f),
      velocity: e.current,
      isVelocityUpdate: d
    };
  }, []);
}, F = (n) => {
  const r = S(
    ((o) => Object.values(o).some((l) => typeof l == "function"))(n) ? n : structuredClone(n)
  ), e = C((o) => {
    for (const l in o) {
      const c = l;
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
}, se = {
  texture: new t.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Color(16777215)
}, ke = ({
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), e = ie({ scene: r, size: n, dpr: i }), o = U(n), l = W(), [c, u] = A({
    scene: r,
    camera: o,
    size: n,
    dpr: i
  }), [s, v] = F(se);
  return [
    C(
      (f, p) => {
        const { gl: y, pointer: T } = f;
        p && v(p), a(e, "uTexture", s.texture), a(e, "uRadius", s.radius), a(e, "uSmudge", s.smudge), a(e, "uDissipation", s.dissipation), a(e, "uMotionBlur", s.motionBlur), a(e, "uMotionSample", s.motionSample), a(e, "uColor", s.color);
        const { currentPointer: h, prevPointer: R, velocity: V } = l(T);
        return a(e, "uMouse", h), a(e, "uPrevMouse", R), a(e, "uVelocity", V), u(y, ({ read: B }) => {
          a(e, "uMap", B);
        });
      },
      [e, l, u, s, v]
    ),
    v,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: c
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
const ve = (n) => {
  const i = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return E(n, i, r), r;
}, de = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, He = ({
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), e = ve(r), o = U(n), [l, c] = _({
    scene: r,
    camera: o,
    size: n,
    dpr: i
  }), [u, s] = F(de);
  return [
    C(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), a(e, "uTexture", u.texture), a(e, "uColor0", u.color0), a(e, "uColor1", u.color1), c(p);
      },
      [c, e, s, u]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
    }
  ];
};
var fe = `varying vec2 vUv;

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
const pe = (n) => {
  const i = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
      vertexShader: fe,
      fragmentShader: me
    }),
    []
  );
  return E(n, i, r), r;
}, ge = {
  texture: new t.Texture(),
  noiseMap: new t.Texture(),
  distortionStrength: 0.03,
  fogEdge0: 0,
  fogEdge1: 0.9,
  fogColor: new t.Color(16777215)
}, Je = ({
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), e = pe(r), o = U(n), [l, c] = _({
    scene: r,
    camera: o,
    size: n,
    dpr: i
  }), [u, s] = F(ge);
  return [
    C(
      (d, f) => {
        const { gl: p, clock: y } = d;
        return f && s(f), a(e, "uTime", y.getElapsedTime()), a(e, "uTexture", u.texture), a(e, "uNoiseMap", u.noiseMap), a(e, "distortionStrength", u.distortionStrength), a(e, "fogEdge0", u.fogEdge0), a(e, "fogEdge1", u.fogEdge1), a(e, "fogColor", u.fogColor), c(p);
      },
      [c, e, s, u]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
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
const ye = () => m(
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
const Te = () => m(
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
const Se = () => m(
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
const Ce = () => m(
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
const be = () => m(
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
const Ve = () => m(
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
const _e = () => m(
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
const Fe = () => m(
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
const Oe = () => m(
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
  scene: n,
  size: i,
  dpr: r
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), o = ye(), l = o.clone(), c = be(), u = Ve(), s = Te(), v = Se(), d = Ce(), f = _e(), p = Fe(), y = Oe(), T = m(
    () => ({
      vorticityMaterial: u,
      curlMaterial: c,
      advectionMaterial: s,
      divergenceMaterial: v,
      pressureMaterial: d,
      clearMaterial: f,
      gradientSubtractMaterial: p,
      splatMaterial: y
    }),
    [
      u,
      c,
      s,
      v,
      d,
      f,
      p,
      y
    ]
  ), h = L(i, r);
  b(() => {
    a(
      T.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const M of Object.values(T))
      a(
        M,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, T]);
  const R = E(n, e, o);
  b(() => {
    o.dispose(), R.material = l;
  }, [o, R, l]), b(() => () => {
    for (const M of Object.values(T))
      M.dispose();
  }, [T]);
  const V = C(
    (M) => {
      R.material = M, R.material.needsUpdate = !0;
    },
    [R]
  );
  return [T, V];
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
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), [e, o] = Le({ scene: r, size: n, dpr: i }), l = U(n), c = W(), u = m(
    () => ({
      scene: r,
      camera: l,
      size: n,
      isSizeUpdate: !0
    }),
    [r, l, n]
  ), [s, v] = A(u), [d, f] = A({
    ...u,
    isSizeUpdate: !1
  }), [p, y] = _(u), [T, h] = _(u), [R, V] = A(u), M = S(0), B = S(new t.Vector2(0, 0)), $ = S(new t.Vector3(0, 0, 0)), [w, g] = F(Ee);
  return [
    C(
      (H, q) => {
        const { gl: D, pointer: J, clock: z, size: X } = H;
        q && g(q), M.current === 0 && (M.current = z.getElapsedTime());
        const Y = Math.min(
          (z.getElapsedTime() - M.current) / 3,
          0.02
        );
        M.current = z.getElapsedTime();
        const N = v(D, ({ read: x }) => {
          o(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", x), a(e.advectionMaterial, "uSource", x), a(e.advectionMaterial, "dt", Y), a(
            e.advectionMaterial,
            "dissipation",
            w.velocity_dissipation
          );
        }), K = f(D, ({ read: x }) => {
          o(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", N), a(e.advectionMaterial, "uSource", x), a(
            e.advectionMaterial,
            "dissipation",
            w.density_dissipation
          );
        }), { currentPointer: Z, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = c(J);
        ee && (v(D, ({ read: x }) => {
          o(e.splatMaterial), a(e.splatMaterial, "uTarget", x), a(e.splatMaterial, "point", Z);
          const O = Q.multiply(
            B.current.set(X.width, X.height).multiplyScalar(w.velocity_acceleration)
          );
          a(
            e.splatMaterial,
            "color",
            $.current.set(O.x, O.y, 1)
          ), a(
            e.splatMaterial,
            "radius",
            w.splat_radius
          );
        }), f(D, ({ read: x }) => {
          o(e.splatMaterial), a(e.splatMaterial, "uTarget", x);
          const O = typeof w.fruid_color == "function" ? w.fruid_color(te) : w.fruid_color;
          a(e.splatMaterial, "color", O);
        }));
        const ne = y(D, () => {
          o(e.curlMaterial), a(e.curlMaterial, "uVelocity", N);
        });
        v(D, ({ read: x }) => {
          o(e.vorticityMaterial), a(e.vorticityMaterial, "uVelocity", x), a(e.vorticityMaterial, "uCurl", ne), a(
            e.vorticityMaterial,
            "curl",
            w.curl_strength
          ), a(e.vorticityMaterial, "dt", Y);
        });
        const re = h(D, () => {
          o(e.divergenceMaterial), a(e.divergenceMaterial, "uVelocity", N);
        });
        V(D, ({ read: x }) => {
          o(e.clearMaterial), a(e.clearMaterial, "uTexture", x), a(
            e.clearMaterial,
            "value",
            w.pressure_dissipation
          );
        }), o(e.pressureMaterial), a(e.pressureMaterial, "uDivergence", re);
        let j;
        for (let x = 0; x < w.pressure_iterations; x++)
          j = V(D, ({ read: O }) => {
            a(e.pressureMaterial, "uPressure", O);
          });
        return v(D, ({ read: x }) => {
          o(e.gradientSubtractMaterial), a(
            e.gradientSubtractMaterial,
            "uPressure",
            j
          ), a(e.gradientSubtractMaterial, "uVelocity", x);
        }), K;
      },
      [
        e,
        o,
        y,
        f,
        h,
        c,
        V,
        v,
        g,
        w
      ]
    ),
    g,
    {
      scene: r,
      materials: e,
      camera: l,
      renderTarget: {
        velocity: s,
        density: d,
        curl: p,
        divergence: T,
        pressure: R
      }
    }
  ];
}, Ae = ({ scale: n, max: i, texture: r, scene: e }) => {
  const o = S([]), l = m(
    () => new t.PlaneGeometry(n, n),
    [n]
  ), c = m(
    () => new t.MeshBasicMaterial({
      map: r ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return b(() => {
    for (let u = 0; u < i; u++) {
      const s = new t.Mesh(l.clone(), c.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, e.add(s), o.current.push(s);
    }
  }, [l, c, e, i]), b(() => () => {
    o.current.forEach((u) => {
      u.geometry.dispose(), Array.isArray(u.material) ? u.material.forEach((s) => s.dispose()) : u.material.dispose(), e.remove(u);
    }), o.current = [];
  }, [e]), o.current;
}, $e = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Ze = ({
  texture: n,
  scale: i = 64,
  max: r = 100,
  size: e
}) => {
  const o = m(() => new t.Scene(), []), l = Ae({
    scale: i,
    max: r,
    texture: n,
    scene: o
  }), c = U(e), u = W(), [s, v] = _({
    scene: o,
    camera: c,
    size: e
  }), [d, f] = F($e), p = S(0);
  return [
    C(
      (T, h) => {
        const { gl: R, pointer: V, size: M } = T;
        h && f(h);
        const { currentPointer: B, diffPointer: $ } = u(V);
        if (d.frequency < $.length()) {
          const g = l[p.current];
          g.visible = !0, g.position.set(
            B.x * (M.width / 2),
            B.y * (M.height / 2),
            0
          ), g.scale.x = g.scale.y = 0, g.material.opacity = d.alpha, p.current = (p.current + 1) % r;
        }
        return l.forEach((g) => {
          if (g.visible) {
            const I = g.material;
            g.rotation.z += d.rotation, I.opacity *= d.fadeout_speed, g.scale.x = d.fadeout_speed * g.scale.x + d.scale, g.scale.y = g.scale.x, I.opacity < 2e-3 && (g.visible = !1);
          }
        }), v(R);
      },
      [v, l, u, r, d, f]
    ),
    f,
    {
      scene: o,
      camera: c,
      meshArr: l,
      renderTarget: s
    }
  ];
};
var Ie = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ze = `precision mediump float;

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
const Ne = ({
  scene: n,
  size: i,
  dpr: r
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), o = m(
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
      fragmentShader: ze
    }),
    []
  ), l = L(i, r);
  return b(() => {
    o.uniforms.uResolution.value = l.clone();
  }, [l, o]), E(n, e, o), o;
}, Ge = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  imageResolution: new t.Vector2(0, 0),
  noiseMap: new t.Texture(),
  noiseStrength: 0,
  progress: 0,
  dir: new t.Vector2(0, 0)
}, Qe = ({
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), e = Ne({ scene: r, size: n, dpr: i }), o = U(n), [l, c] = _({
    scene: r,
    camera: o,
    dpr: i,
    size: n,
    isSizeUpdate: !0
  }), [u, s] = F(Ge);
  return [
    C(
      (d, f) => {
        const { gl: p } = d;
        return f && s(f), a(e, "uTexture0", u.texture0), a(e, "uTexture1", u.texture1), a(e, "uImageResolution", u.imageResolution), a(e, "uNoiseMap", u.noiseMap), a(e, "noiseStrength", u.noiseStrength), a(e, "progress", u.progress), a(e, "dirX", u.dir.x), a(e, "dirY", u.dir.y), c(p);
      },
      [c, e, u, s]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
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
const Xe = (n) => {
  const i = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return E(n, i, r), r;
}, Ye = {
  timeStrength: 0.3,
  noiseOctaves: 8,
  fbmOctaves: 3
}, et = ({
  size: n,
  dpr: i
}) => {
  const r = m(() => new t.Scene(), []), e = Xe(r), o = U(n), [l, c] = _({
    scene: r,
    camera: o,
    size: n,
    dpr: i
  }), [u, s] = F(Ye);
  return [
    C(
      (d, f) => {
        const { gl: p, clock: y } = d;
        return f && s(f), a(e, "timeStrength", u.timeStrength), a(e, "noiseOctaves", u.noiseOctaves), a(e, "fbmOctaves", u.fbmOctaves), a(e, "uTime", y.getElapsedTime()), c(p);
      },
      [c, e, s, u]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: o,
      renderTarget: l
    }
  ];
};
export {
  se as BRUSH_PARAMS,
  de as DUOTONE_PARAMS,
  ge as FOGPROJECTION_PARAMS,
  Ee as FRUID_PARAMS,
  Ye as NOISE_PARAMS,
  $e as RIPPLE_PARAMS,
  Ge as TRANSITIONBG_PARAMS,
  a as setUniform,
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
