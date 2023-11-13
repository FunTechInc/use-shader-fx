import * as n from "three";
import { useMemo as d, useEffect as U, useRef as S, useLayoutEffect as H, useCallback as w } from "react";
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
const B = (r, i = !1) => {
  const t = i ? r.width * i : r.width, e = i ? r.height * i : r.height;
  return d(
    () => new n.Vector2(t, e),
    [t, e]
  );
}, O = (r, i, t) => {
  const e = d(
    () => new n.Mesh(i, t),
    [i, t]
  );
  return U(() => {
    r.add(e);
  }, [r, e]), e;
}, a = (r, i, t) => {
  r.uniforms && r.uniforms[i] && t !== void 0 && t !== null ? r.uniforms[i].value = t : console.error(
    `Uniform key "${String(
      i
    )}" does not exist in the material. or "${String(
      i
    )}" is null | undefined`
  );
}, ie = ({
  scene: r,
  size: i,
  dpr: t
}) => {
  const e = d(() => new n.PlaneGeometry(2, 2), []), o = d(
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
      vertexShader: oe,
      fragmentShader: ae
    }),
    []
  ), u = B(i, t);
  return U(() => {
    a(o, "uAspect", u.width / u.height), a(o, "uResolution", u.clone());
  }, [u, o]), O(r, e, o), o;
}, ue = (r, i) => {
  const t = i, e = r / i, [o, u] = [t * e / 2, t / 2];
  return { width: o, height: u, near: -1e3, far: 1e3 };
}, P = (r) => {
  const i = B(r), { width: t, height: e, near: o, far: u } = ue(
    i.x,
    i.y
  );
  return d(
    () => new n.OrthographicCamera(
      -t,
      t,
      e,
      -e,
      o,
      u
    ),
    [t, e, o, u]
  );
}, W = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, F = ({
  scene: r,
  camera: i,
  size: t,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = S(), s = B(t, e);
  u.current = d(
    () => new n.WebGLRenderTarget(s.x, s.y, W),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), H(() => {
    var l;
    o && ((l = u.current) == null || l.setSize(s.x, s.y));
  }, [s, o]);
  const c = w(
    (l, v) => {
      const f = u.current;
      return l.setRenderTarget(f), v && v({ read: f.texture }), l.render(r, i), l.setRenderTarget(null), l.clear(), f.texture;
    },
    [r, i]
  );
  return [u.current, c];
}, E = ({
  scene: r,
  camera: i,
  size: t,
  dpr: e = !1,
  isSizeUpdate: o = !1
}) => {
  const u = S({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), s = B(t, e), c = d(() => {
    const v = new n.WebGLRenderTarget(
      s.x,
      s.y,
      W
    ), f = new n.WebGLRenderTarget(
      s.x,
      s.y,
      W
    );
    return { read: v, write: f };
  }, []);
  u.current.read = c.read, u.current.write = c.write, H(() => {
    var v, f;
    o && ((v = u.current.read) == null || v.setSize(s.x, s.y), (f = u.current.write) == null || f.setSize(s.x, s.y));
  }, [s, o]);
  const l = w(
    (v, f) => {
      var p;
      const m = u.current;
      return v.setRenderTarget(m.write), f && f({
        read: m.read.texture,
        write: m.write.texture
      }), v.render(r, i), m.swap(), v.setRenderTarget(null), v.clear(), (p = m.read) == null ? void 0 : p.texture;
    },
    [r, i]
  );
  return [
    { read: u.current.read, write: u.current.write },
    l
  ];
}, $ = () => {
  const r = S(new n.Vector2(0, 0)), i = S(new n.Vector2(0, 0)), t = S(0), e = S(new n.Vector2(0, 0)), o = S(!1);
  return w((s) => {
    const c = performance.now(), l = s.clone();
    t.current === 0 && (t.current = c, r.current = l);
    const v = Math.max(1, c - t.current);
    t.current = c, e.current.copy(l).sub(r.current).divideScalar(v);
    const f = e.current.length() > 0, m = o.current ? r.current.clone() : l;
    return !o.current && f && (o.current = !0), r.current = l, {
      currentPointer: l,
      prevPointer: m,
      diffPointer: i.current.subVectors(l, m),
      velocity: e.current,
      isVelocityUpdate: f
    };
  }, []);
}, _ = (r) => {
  const i = S(r), t = w((e) => {
    for (const o in e) {
      const u = o;
      u in i.current && e[u] !== void 0 && e[u] !== null ? i.current[u] = e[u] : console.error(
        `"${String(
          u
        )}" does not exist in the params. or "${String(
          u
        )}" is null | undefined`
      );
    }
  }, []);
  return [i.current, t];
}, se = {
  texture: new n.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 0.9,
  motionBlur: 0,
  motionSample: 5,
  color: new n.Color(16777215)
}, Ze = ({
  size: r,
  dpr: i
}) => {
  const t = d(() => new n.Scene(), []), e = ie({ scene: t, size: r, dpr: i }), o = P(r), u = $(), [s, c] = E({
    scene: t,
    camera: o,
    size: r
  }), [l, v] = _(se);
  return [
    w(
      (m, p) => {
        const { gl: M, pointer: R } = m;
        p && v(p), a(e, "uTexture", l.texture), a(e, "uRadius", l.radius), a(e, "uSmudge", l.smudge), a(e, "uDissipation", l.dissipation), a(e, "uMotionBlur", l.motionBlur), a(e, "uMotionSample", l.motionSample), a(e, "uColor", l.color);
        const { currentPointer: y, prevPointer: h, velocity: b } = u(R);
        return a(e, "uMouse", y), a(e, "uPrevMouse", h), a(e, "uVelocity", b), c(M, ({ read: L }) => {
          a(e, "uMap", L);
        });
      },
      [e, u, c, l, v]
    ),
    v,
    {
      scene: t,
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
  const i = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uColor0: { value: new n.Color(16777215) },
        uColor1: { value: new n.Color(0) }
      },
      vertexShader: le,
      fragmentShader: ce
    }),
    []
  );
  return O(r, i, t), t;
}, fe = {
  texture: new n.Texture(),
  color0: new n.Color(16777215),
  color1: new n.Color(0)
}, Qe = ({
  size: r
}) => {
  const i = d(() => new n.Scene(), []), t = ve(i), e = P(r), [o, u] = F({
    scene: i,
    camera: e,
    size: r
  }), [s, c] = _(fe);
  return [
    w(
      (v, f) => {
        const { gl: m } = v;
        return f && c(f), a(t, "uTexture", s.texture), a(t, "uColor0", s.color0), a(t, "uColor1", s.color1), u(m);
      },
      [u, t, c, s]
    ),
    c,
    {
      scene: i,
      material: t,
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

uniform sampler2D uMap;
uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {

	vec2 st = vUv * 2.0 - 1.0; 

	vec2 vel = uVelocity * uResolution;

	
	vec4 bufferColor = texture2D(uMap, vUv) * uDissipation;
	
	
	vec3 color = vec3(vel * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(vel)), 1.0));
	

	
	vec2 nMouse = (uMouse + vec2(1.0)) * 0.5;
	vec2 cursor = vUv - nMouse;
	cursor.x *= uAspect;

	
	float modifiedRadius = uRadius + (length(vel) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);
	float finalBrush = smoothstep(modifiedRadius,0.0,length(cursor)) * uAlpha;

	
	bufferColor.rgb = mix(bufferColor.rgb, color, vec3(finalBrush));

	gl_FragColor = bufferColor;
}`;
const pe = ({
  scene: r,
  size: i,
  dpr: t
}) => {
  const e = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uMap: { value: null },
        uResolution: { value: new n.Vector2(0, 0) },
        uAspect: { value: 1 },
        uRadius: { value: 0 },
        uAlpha: { value: 0 },
        uDissipation: { value: 0 },
        uMagnification: { value: 0 },
        uMouse: { value: new n.Vector2(0, 0) },
        uVelocity: { value: new n.Vector2(0, 0) }
      },
      vertexShader: de,
      fragmentShader: me
    }),
    []
  ), u = B(i, t);
  return U(() => {
    a(o, "uAspect", u.width / u.height), a(o, "uResolution", u.clone());
  }, [u, o]), O(r, e, o), o;
}, ge = {
  radius: 0.1,
  magnification: 0,
  alpha: 0,
  dissipation: 0.9
}, en = ({
  size: r,
  dpr: i
}) => {
  const t = d(() => new n.Scene(), []), e = pe({ scene: t, size: r, dpr: i }), o = P(r), u = $(), [s, c] = E({
    scene: t,
    camera: o,
    size: r
  }), [l, v] = _(ge);
  return [
    w(
      (m, p) => {
        const { gl: M, pointer: R } = m;
        p && v(p), a(e, "uRadius", l.radius), a(e, "uAlpha", l.alpha), a(e, "uDissipation", l.dissipation), a(e, "uMagnification", l.magnification);
        const { currentPointer: y, velocity: h } = u(R);
        return a(e, "uMouse", y), a(e, "uVelocity", h), c(M, ({ read: T }) => {
          a(e, "uMap", T);
        });
      },
      [e, u, c, l, v]
    ),
    v,
    {
      scene: t,
      material: e,
      camera: o,
      renderTarget: s
    }
  ];
};
var xe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ye = `precision mediump float;

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
const Me = (r) => {
  const i = d(() => new n.PlaneGeometry(2, 2), []), t = d(
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
      vertexShader: xe,
      fragmentShader: ye
    }),
    []
  );
  return O(r, i, t), t;
}, Te = {
  texture: new n.Texture(),
  noiseMap: new n.Texture(),
  distortionStrength: 0.03,
  fogEdge0: 0,
  fogEdge1: 0.9,
  fogColor: new n.Color(16777215)
}, nn = ({
  size: r
}) => {
  const i = d(() => new n.Scene(), []), t = Me(i), e = P(r), [o, u] = F({
    scene: i,
    camera: e,
    size: r
  }), [s, c] = _(Te);
  return [
    w(
      (v, f) => {
        const { gl: m, clock: p } = v;
        return f && c(f), a(t, "uTime", p.getElapsedTime()), a(t, "uTexture", s.texture), a(t, "uNoiseMap", s.noiseMap), a(t, "distortionStrength", s.distortionStrength), a(t, "fogEdge0", s.fogEdge0), a(t, "fogEdge1", s.fogEdge1), a(t, "fogColor", s.fogColor), u(m);
      },
      [u, t, c, s]
    ),
    c,
    {
      scene: i,
      material: t,
      camera: e,
      renderTarget: o
    }
  ];
};
var V = `precision mediump float;
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
}`, he = `precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Se = () => d(
  () => new n.ShaderMaterial({
    vertexShader: V,
    fragmentShader: he,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var we = `precision mediump float;
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
const Re = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: V,
    fragmentShader: we
  }),
  []
);
var Ce = `precision mediump float;
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
const be = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Ce
  }),
  []
);
var De = `precision mediump float;
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
const Ve = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: De
  }),
  []
);
var Pe = `precision mediump float;
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
const _e = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Pe
  }),
  []
);
var Ue = `precision mediump float;
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
const Fe = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Ue
  }),
  []
);
var Be = `precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Oe = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Be
  }),
  []
);
var Le = `precision mediump float;
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
const Ae = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Le
  }),
  []
);
var Ee = `precision mediump float;
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
const $e = () => d(
  () => new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: V,
    fragmentShader: Ee
  }),
  []
), Ie = ({
  scene: r,
  size: i,
  dpr: t
}) => {
  const e = d(() => new n.PlaneGeometry(2, 2), []), o = Se(), u = o.clone(), s = _e(), c = Fe(), l = Re(), v = be(), f = Ve(), m = Oe(), p = Ae(), M = $e(), R = d(
    () => ({
      vorticityMaterial: c,
      curlMaterial: s,
      advectionMaterial: l,
      divergenceMaterial: v,
      pressureMaterial: f,
      clearMaterial: m,
      gradientSubtractMaterial: p,
      splatMaterial: M
    }),
    [
      c,
      s,
      l,
      v,
      f,
      m,
      p,
      M
    ]
  ), y = B(i, t);
  U(() => {
    a(
      R.splatMaterial,
      "aspectRatio",
      y.x / y.y
    );
    for (const T of Object.values(R))
      a(
        T,
        "texelSize",
        new n.Vector2(1 / y.x, 1 / y.y)
      );
  }, [y, R]);
  const h = O(r, e, o);
  U(() => {
    o.dispose(), h.material = u;
  }, [o, h, u]);
  const b = w(
    (T) => {
      h.material = T, h.material.needsUpdate = !0;
    },
    [h]
  );
  return [R, b];
}, Ne = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fruid_color: new n.Vector3(1, 1, 1)
}, tn = ({
  size: r,
  dpr: i
}) => {
  const t = d(() => new n.Scene(), []), [e, o] = Ie({ scene: t, size: r, dpr: i }), u = P(r), s = $(), c = d(
    () => ({
      scene: t,
      camera: u,
      size: r,
      dpr: i
    }),
    [t, u, r, i]
  ), [l, v] = E(c), [f, m] = E(c), [p, M] = F(c), [R, y] = F(c), [h, b] = E(c), T = S(0), L = S(new n.Vector2(0, 0)), I = S(new n.Vector3(0, 0, 0)), [C, g] = _(Ne);
  return [
    w(
      (j, q) => {
        const { gl: D, pointer: J, clock: G, size: X } = j;
        q && g(q), T.current === 0 && (T.current = G.getElapsedTime());
        const Y = Math.min(
          (G.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = G.getElapsedTime();
        const z = v(D, ({ read: x }) => {
          o(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", x), a(e.advectionMaterial, "uSource", x), a(e.advectionMaterial, "dt", Y), a(
            e.advectionMaterial,
            "dissipation",
            C.velocity_dissipation
          );
        }), K = m(D, ({ read: x }) => {
          o(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", z), a(e.advectionMaterial, "uSource", x), a(
            e.advectionMaterial,
            "dissipation",
            C.density_dissipation
          );
        }), { currentPointer: Z, diffPointer: Q, isVelocityUpdate: ee, velocity: ne } = s(J);
        ee && (v(D, ({ read: x }) => {
          o(e.splatMaterial), a(e.splatMaterial, "uTarget", x), a(e.splatMaterial, "point", Z);
          const A = Q.multiply(
            L.current.set(X.width, X.height).multiplyScalar(C.velocity_acceleration)
          );
          a(
            e.splatMaterial,
            "color",
            I.current.set(A.x, A.y, 1)
          ), a(
            e.splatMaterial,
            "radius",
            C.splat_radius
          );
        }), m(D, ({ read: x }) => {
          o(e.splatMaterial), a(e.splatMaterial, "uTarget", x);
          const A = typeof C.fruid_color == "function" ? C.fruid_color(ne) : C.fruid_color;
          a(e.splatMaterial, "color", A);
        }));
        const te = M(D, () => {
          o(e.curlMaterial), a(e.curlMaterial, "uVelocity", z);
        });
        v(D, ({ read: x }) => {
          o(e.vorticityMaterial), a(e.vorticityMaterial, "uVelocity", x), a(e.vorticityMaterial, "uCurl", te), a(
            e.vorticityMaterial,
            "curl",
            C.curl_strength
          ), a(e.vorticityMaterial, "dt", Y);
        });
        const re = y(D, () => {
          o(e.divergenceMaterial), a(e.divergenceMaterial, "uVelocity", z);
        });
        b(D, ({ read: x }) => {
          o(e.clearMaterial), a(e.clearMaterial, "uTexture", x), a(
            e.clearMaterial,
            "value",
            C.pressure_dissipation
          );
        }), o(e.pressureMaterial), a(e.pressureMaterial, "uDivergence", re);
        let k;
        for (let x = 0; x < C.pressure_iterations; x++)
          k = b(D, ({ read: A }) => {
            a(e.pressureMaterial, "uPressure", A);
          });
        return v(D, ({ read: x }) => {
          o(e.gradientSubtractMaterial), a(
            e.gradientSubtractMaterial,
            "uPressure",
            k
          ), a(e.gradientSubtractMaterial, "uVelocity", x);
        }), K;
      },
      [
        e,
        o,
        M,
        m,
        y,
        s,
        b,
        v,
        g,
        C
      ]
    ),
    g,
    {
      scene: t,
      materials: e,
      camera: u,
      renderTarget: {
        velocity: l,
        density: f,
        curl: p,
        divergence: R,
        pressure: h
      }
    }
  ];
}, Ge = ({ scale: r, max: i, texture: t, scene: e }) => {
  const o = S([]), u = d(
    () => new n.PlaneGeometry(r, r),
    [r]
  ), s = d(
    () => new n.MeshBasicMaterial({
      map: t ?? null,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [t]
  );
  return U(() => {
    for (let c = 0; c < i; c++) {
      const l = new n.Mesh(u.clone(), s.clone());
      l.rotateZ(2 * Math.PI * Math.random()), l.visible = !1, e.add(l), o.current.push(l);
    }
  }, [u, s, e, i]), o.current;
}, ze = {
  frequency: 0.01,
  rotation: 0.01,
  fadeout_speed: 0.9,
  scale: 0.15,
  alpha: 0.6
}, rn = ({
  texture: r,
  scale: i = 64,
  max: t = 100,
  size: e
}) => {
  const o = d(() => new n.Scene(), []), u = Ge({
    scale: i,
    max: t,
    texture: r,
    scene: o
  }), s = P(e), c = $(), [l, v] = F({
    scene: o,
    camera: s,
    size: e
  }), [f, m] = _(ze), p = S(0);
  return [
    w(
      (R, y) => {
        const { gl: h, pointer: b, size: T } = R;
        y && m(y);
        const { currentPointer: L, diffPointer: I } = c(b);
        if (f.frequency < I.length()) {
          const g = u[p.current];
          g.visible = !0, g.position.set(
            L.x * (T.width / 2),
            L.y * (T.height / 2),
            0
          ), g.scale.x = g.scale.y = 0, g.material.opacity = f.alpha, p.current = (p.current + 1) % t;
        }
        return u.forEach((g) => {
          if (g.visible) {
            const N = g.material;
            g.rotation.z += f.rotation, N.opacity *= f.fadeout_speed, g.scale.x = f.fadeout_speed * g.scale.x + f.scale, g.scale.y = g.scale.x, N.opacity < 2e-3 && (g.visible = !1);
          }
        }), v(h);
      },
      [v, u, c, t, f, m]
    ),
    m,
    {
      scene: o,
      camera: s,
      meshArr: u,
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
const Xe = ({
  scene: r,
  size: i,
  dpr: t
}) => {
  const e = d(() => new n.PlaneGeometry(2, 2), []), o = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uResolution: { value: new n.Vector2() },
        uImageResolution: { value: new n.Vector2() },
        uTexture0: { value: new n.Texture() },
        uTexture1: { value: new n.Texture() },
        uNoiseMap: { value: new n.Texture() },
        noiseStrength: { value: 0 },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: We,
      fragmentShader: qe
    }),
    []
  ), u = B(i, t);
  return U(() => {
    o.uniforms.uResolution.value = u.clone();
  }, [u, o]), O(r, e, o), o;
}, Ye = {
  texture0: new n.Texture(),
  texture1: new n.Texture(),
  imageResolution: new n.Vector2(0, 0),
  uNoiseMap: new n.Texture(),
  noiseStrength: 0,
  progress: 0,
  dir: new n.Vector2(0, 0)
}, on = ({
  size: r,
  dpr: i
}) => {
  const t = d(() => new n.Scene(), []), e = Xe({ scene: t, size: r, dpr: i }), o = P(r), [u, s] = F({
    scene: t,
    camera: o,
    dpr: i,
    size: r,
    isSizeUpdate: !0
  }), [c, l] = _(Ye);
  return [
    w(
      (f, m) => {
        const { gl: p } = f;
        return m && l(m), a(e, "uTexture0", c.texture0), a(e, "uTexture1", c.texture1), a(e, "uImageResolution", c.imageResolution), a(e, "uNoiseMap", c.uNoiseMap), a(e, "noiseStrength", c.noiseStrength), a(e, "progress", c.progress), a(e, "dirX", c.dir.x), a(e, "dirY", c.dir.y), s(p);
      },
      [s, e, c, l]
    ),
    l,
    {
      scene: t,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
var ke = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, He = `precision mediump float;

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
const je = (r) => {
  const i = d(() => new n.PlaneGeometry(2, 2), []), t = d(
    () => new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        timeStrength: { value: 0 },
        noiseOctaves: { value: 0 },
        fbmOctaves: { value: 0 }
      },
      vertexShader: ke,
      fragmentShader: He
    }),
    []
  );
  return O(r, i, t), t;
}, Je = {
  timeStrength: 0.3,
  noiseOctaves: 8,
  fbmOctaves: 3
}, an = ({
  size: r,
  dpr: i
}) => {
  const t = d(() => new n.Scene(), []), e = je(t), o = P(r), [u, s] = F({
    scene: t,
    camera: o,
    size: r,
    dpr: i
  }), [c, l] = _(Je);
  return [
    w(
      (f, m) => {
        const { gl: p, clock: M } = f;
        return m && l(m), a(e, "timeStrength", c.timeStrength), a(e, "noiseOctaves", c.noiseOctaves), a(e, "fbmOctaves", c.fbmOctaves), a(e, "uTime", M.getElapsedTime()), s(p);
      },
      [s, e, l, c]
    ),
    l,
    {
      scene: t,
      material: e,
      camera: o,
      renderTarget: u
    }
  ];
};
export {
  a as setUniform,
  O as useAddMesh,
  Ze as useBrush,
  P as useCamera,
  E as useDoubleFBO,
  Qe as useDuoTone,
  en as useFlowmap,
  nn as useFogProjection,
  tn as useFruid,
  an as useNoise,
  _ as useParams,
  $ as usePointer,
  B as useResolution,
  rn as useRipple,
  F as useSingleFBO,
  on as useTransitionBg
};
//# sourceMappingURL=use-shader-fx.js.map
