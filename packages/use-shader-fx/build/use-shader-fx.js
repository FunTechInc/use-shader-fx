import * as t from "three";
import { useMemo as p, useEffect as R, useRef as y, useCallback as w, useLayoutEffect as q, useState as ue } from "react";
var se = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, le = `precision highp float;

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
const O = (n, s = !1) => {
  const o = s ? n.width * s : n.width, a = s ? n.height * s : n.height;
  return p(
    () => new t.Vector2(o, a),
    [o, a]
  );
}, A = (n, s, o) => {
  const a = p(
    () => new t.Mesh(s, o),
    [s, o]
  );
  return R(() => {
    n.add(a);
  }, [n, a]), R(() => () => {
    n.remove(a), s.dispose(), o.dispose();
  }, [n, s, o, a]), a;
}, i = (n, s, o) => {
  n.uniforms && n.uniforms[s] && o !== void 0 && o !== null ? n.uniforms[s].value = o : console.error(
    `Uniform key "${String(
      s
    )}" does not exist in the material. or "${String(
      s
    )}" is null | undefined`
  );
}, ce = ({
  scene: n,
  size: s,
  dpr: o
}) => {
  const a = p(() => new t.PlaneGeometry(2, 2), []), e = p(
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
      vertexShader: se,
      fragmentShader: le
    }),
    []
  ), u = O(s, o);
  return R(() => {
    i(e, "uAspect", u.width / u.height), i(e, "uResolution", u.clone());
  }, [u, e]), A(n, a, e), e;
}, ve = (n, s) => {
  const o = s, a = n / s, [e, u] = [o * a / 2, o / 2];
  return { width: e, height: u, near: -1e3, far: 1e3 };
}, U = (n) => {
  const s = O(n), { width: o, height: a, near: e, far: u } = ve(
    s.x,
    s.y
  );
  return p(
    () => new t.OrthographicCamera(
      -o,
      o,
      a,
      -a,
      e,
      u
    ),
    [o, a, e, u]
  );
}, H = () => {
  const n = y(new t.Vector2(0, 0)), s = y(new t.Vector2(0, 0)), o = y(0), a = y(new t.Vector2(0, 0)), e = y(!1);
  return w((c) => {
    const v = performance.now(), r = c.clone();
    o.current === 0 && (o.current = v, n.current = r);
    const l = Math.max(1, v - o.current);
    o.current = v, a.current.copy(r).sub(n.current).divideScalar(l);
    const f = a.current.length() > 0, m = e.current ? n.current.clone() : r;
    return !e.current && f && (e.current = !0), n.current = r, {
      currentPointer: r,
      prevPointer: m,
      diffPointer: s.current.subVectors(r, m),
      velocity: a.current,
      isVelocityUpdate: f
    };
  }, []);
}, F = (n) => {
  const o = y(
    ((e) => Object.values(e).some((u) => typeof u == "function"))(n) ? n : structuredClone(n)
  ), a = w((e) => {
    for (const u in e) {
      const c = u;
      c in o.current && e[c] !== void 0 && e[c] !== null ? o.current[c] = e[c] : console.error(
        `"${String(
          c
        )}" does not exist in the params. or "${String(
          c
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, a];
}, j = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, k = ({
  gl: n,
  fbo: s,
  scene: o,
  camera: a,
  onBeforeRender: e,
  onSwap: u
}) => {
  n.setRenderTarget(s), e(), n.clear(), n.render(o, a), u && u(), n.setRenderTarget(null), n.clear();
}, P = ({
  scene: n,
  camera: s,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: u = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}) => {
  const r = y(), l = O(o, a);
  r.current = p(
    () => {
      const m = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...j,
          samples: u,
          depthBuffer: c
        }
      );
      return v && (m.depthTexture = new t.DepthTexture(
        l.x,
        l.y,
        t.FloatType
      )), m;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), q(() => {
    var m;
    e && ((m = r.current) == null || m.setSize(l.x, l.y));
  }, [l, e]), R(() => {
    const m = r.current;
    return () => {
      m == null || m.dispose();
    };
  }, []);
  const f = w(
    (m, d) => {
      const g = r.current;
      return k({
        gl: m,
        fbo: g,
        scene: n,
        camera: s,
        onBeforeRender: () => d && d({ read: g.texture })
      }), g.texture;
    },
    [n, s]
  );
  return [r.current, f];
}, $ = ({
  scene: n,
  camera: s,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: u = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}) => {
  const r = y({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), l = O(o, a), f = p(() => {
    const d = new t.WebGLRenderTarget(l.x, l.y, {
      ...j,
      samples: u,
      depthBuffer: c
    }), g = new t.WebGLRenderTarget(l.x, l.y, {
      ...j,
      samples: u,
      depthBuffer: c
    });
    return v && (d.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    ), g.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), { read: d, write: g };
  }, []);
  r.current.read = f.read, r.current.write = f.write, q(() => {
    var d, g;
    e && ((d = r.current.read) == null || d.setSize(l.x, l.y), (g = r.current.write) == null || g.setSize(l.x, l.y));
  }, [l, e]), R(() => {
    const d = r.current;
    return () => {
      var g, x;
      (g = d.read) == null || g.dispose(), (x = d.write) == null || x.dispose();
    };
  }, []);
  const m = w(
    (d, g) => {
      var h;
      const x = r.current;
      return k({
        gl: d,
        scene: n,
        camera: s,
        fbo: x.write,
        onBeforeRender: () => g && g({
          read: x.read.texture,
          write: x.write.texture
        }),
        onSwap: () => x.swap()
      }), (h = x.read) == null ? void 0 : h.texture;
    },
    [n, s]
  );
  return [
    { read: r.current.read, write: r.current.write },
    m
  ];
}, de = {
  texture: new t.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Color(16777215)
}, Ct = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ce({ scene: a, size: n, dpr: s }), u = U(n), c = H(), [v, r] = $({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [l, f] = F(de);
  return [
    w(
      (d, g) => {
        const { gl: x, pointer: h } = d;
        g && f(g), i(e, "uTexture", l.texture), i(e, "uRadius", l.radius), i(e, "uSmudge", l.smudge), i(e, "uDissipation", l.dissipation), i(e, "uMotionBlur", l.motionBlur), i(e, "uMotionSample", l.motionSample), i(e, "uColor", l.color);
        const { currentPointer: T, prevPointer: b, velocity: _ } = c(h);
        return i(e, "uMouse", T), i(e, "uPrevMouse", b), i(e, "uVelocity", _), r(x, ({ read: C }) => {
          i(e, "uMap", C);
        });
      },
      [e, c, r, l, f]
    ),
    f,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: v,
      output: v.read.texture
    }
  ];
};
var fe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, me = `precision highp float;

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
const pe = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: fe,
      fragmentShader: me
    }),
    []
  );
  return A(n, s, o), o;
}, ge = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Rt = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = pe(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(ge);
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "uTexture", r.texture), i(e, "uColor0", r.color0), i(e, "uColor1", r.color1), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var xe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, he = `precision highp float;

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
const ye = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
      vertexShader: xe,
      fragmentShader: he
    }),
    []
  );
  return A(n, s, o), o;
}, we = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Vt = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ye(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(we);
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "u_texture", r.texture), i(e, "u_map", r.map), i(e, "u_mapIntensity", r.mapIntensity), r.alphaMap ? (i(e, "u_alphaMap", r.alphaMap), i(e, "u_isAlphaMap", !0)) : i(e, "u_isAlphaMap", !1), i(e, "u_brightness", r.brightness), i(e, "u_min", r.min), i(e, "u_max", r.max), r.dodgeColor ? (i(e, "u_dodgeColor", r.dodgeColor), i(e, "u_isDodgeColor", !0)) : i(e, "u_isDodgeColor", !1), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var I = `varying vec2 vUv;
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
}`, Te = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Se = () => p(
  () => new t.ShaderMaterial({
    vertexShader: I,
    fragmentShader: Te,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var _e = `precision highp float;

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
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: I,
    fragmentShader: _e
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
const be = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: De
  }),
  []
);
var Ce = `precision highp float;

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
const Re = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ce
  }),
  []
);
var Ve = `precision highp float;

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
const Pe = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ve
  }),
  []
);
var Ue = `precision highp float;

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
const Fe = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ue
  }),
  []
);
var Ae = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Be = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ae
  }),
  []
);
var Ie = `precision highp float;

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
const Oe = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ie
  }),
  []
);
var Le = `precision highp float;

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
const ze = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uTarget: { value: new t.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new t.Vector3() },
      point: { value: new t.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Le
  }),
  []
), Ee = ({
  scene: n,
  size: s,
  dpr: o
}) => {
  const a = p(() => new t.PlaneGeometry(2, 2), []), e = Se(), u = e.clone(), c = Pe(), v = Fe(), r = Me(), l = be(), f = Re(), m = Be(), d = Oe(), g = ze(), x = p(
    () => ({
      vorticityMaterial: v,
      curlMaterial: c,
      advectionMaterial: r,
      divergenceMaterial: l,
      pressureMaterial: f,
      clearMaterial: m,
      gradientSubtractMaterial: d,
      splatMaterial: g
    }),
    [
      v,
      c,
      r,
      l,
      f,
      m,
      d,
      g
    ]
  ), h = O(s, o);
  R(() => {
    i(
      x.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const _ of Object.values(x))
      i(
        _,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, x]);
  const T = A(n, a, e);
  R(() => {
    e.dispose(), T.material = u;
  }, [e, T, u]), R(() => () => {
    for (const _ of Object.values(x))
      _.dispose();
  }, [x]);
  const b = w(
    (_) => {
      T.material = _, T.material.needsUpdate = !0;
    },
    [T]
  );
  return [x, b];
}, $e = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1)
}, Pt = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), [e, u] = Ee({ scene: a, size: n, dpr: s }), c = U(n), v = H(), r = p(
    () => ({
      scene: a,
      camera: c,
      size: n,
      samples: o
    }),
    [a, c, n, o]
  ), [l, f] = $(r), [m, d] = $(r), [g, x] = P(r), [h, T] = P(r), [b, _] = $(r), C = y(0), B = y(new t.Vector2(0, 0)), L = y(new t.Vector3(0, 0, 0)), [D, S] = F($e);
  return [
    w(
      (N, G) => {
        const { gl: V, pointer: Q, clock: W, size: K } = N;
        G && S(G), C.current === 0 && (C.current = W.getElapsedTime());
        const Z = Math.min(
          (W.getElapsedTime() - C.current) / 3,
          0.02
        );
        C.current = W.getElapsedTime();
        const X = f(V, ({ read: M }) => {
          u(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", M), i(e.advectionMaterial, "uSource", M), i(e.advectionMaterial, "dt", Z), i(
            e.advectionMaterial,
            "dissipation",
            D.velocity_dissipation
          );
        }), ee = d(V, ({ read: M }) => {
          u(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", X), i(e.advectionMaterial, "uSource", M), i(
            e.advectionMaterial,
            "dissipation",
            D.density_dissipation
          );
        }), { currentPointer: te, diffPointer: ne, isVelocityUpdate: re, velocity: oe } = v(Q);
        re && (f(V, ({ read: M }) => {
          u(e.splatMaterial), i(e.splatMaterial, "uTarget", M), i(e.splatMaterial, "point", te);
          const z = ne.multiply(
            B.current.set(K.width, K.height).multiplyScalar(D.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            L.current.set(z.x, z.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            D.splat_radius
          );
        }), d(V, ({ read: M }) => {
          u(e.splatMaterial), i(e.splatMaterial, "uTarget", M);
          const z = typeof D.fluid_color == "function" ? D.fluid_color(oe) : D.fluid_color;
          i(e.splatMaterial, "color", z);
        }));
        const ae = x(V, () => {
          u(e.curlMaterial), i(e.curlMaterial, "uVelocity", X);
        });
        f(V, ({ read: M }) => {
          u(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", M), i(e.vorticityMaterial, "uCurl", ae), i(
            e.vorticityMaterial,
            "curl",
            D.curl_strength
          ), i(e.vorticityMaterial, "dt", Z);
        });
        const ie = T(V, () => {
          u(e.divergenceMaterial), i(e.divergenceMaterial, "uVelocity", X);
        });
        _(V, ({ read: M }) => {
          u(e.clearMaterial), i(e.clearMaterial, "uTexture", M), i(
            e.clearMaterial,
            "value",
            D.pressure_dissipation
          );
        }), u(e.pressureMaterial), i(e.pressureMaterial, "uDivergence", ie);
        let J;
        for (let M = 0; M < D.pressure_iterations; M++)
          J = _(V, ({ read: z }) => {
            i(e.pressureMaterial, "uPressure", z);
          });
        return f(V, ({ read: M }) => {
          u(e.gradientSubtractMaterial), i(
            e.gradientSubtractMaterial,
            "uPressure",
            J
          ), i(e.gradientSubtractMaterial, "uVelocity", M);
        }), ee;
      },
      [
        e,
        u,
        x,
        d,
        T,
        v,
        _,
        f,
        S,
        D
      ]
    ),
    S,
    {
      scene: a,
      materials: e,
      camera: c,
      renderTarget: {
        velocity: l,
        density: m,
        curl: g,
        divergence: h,
        pressure: b
      },
      output: m.read.texture
    }
  ];
}, Ne = ({ scale: n, max: s, texture: o, scene: a }) => {
  const e = y([]), u = p(
    () => new t.PlaneGeometry(n, n),
    [n]
  ), c = p(
    () => new t.MeshBasicMaterial({
      map: o ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [o]
  );
  return R(() => {
    for (let v = 0; v < s; v++) {
      const r = new t.Mesh(u.clone(), c.clone());
      r.rotateZ(2 * Math.PI * Math.random()), r.visible = !1, a.add(r), e.current.push(r);
    }
  }, [u, c, a, s]), R(() => () => {
    e.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((r) => r.dispose()) : v.material.dispose(), a.remove(v);
    }), e.current = [];
  }, [a]), e.current;
}, Ge = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Ut = ({
  texture: n,
  scale: s = 64,
  max: o = 100,
  size: a,
  dpr: e,
  samples: u = 0
}) => {
  const c = p(() => new t.Scene(), []), v = Ne({
    scale: s,
    max: o,
    texture: n,
    scene: c
  }), r = U(a), l = H(), [f, m] = P({
    scene: c,
    camera: r,
    size: a,
    dpr: e,
    samples: u
  }), [d, g] = F(Ge), x = y(0);
  return [
    w(
      (T, b) => {
        const { gl: _, pointer: C, size: B } = T;
        b && g(b);
        const { currentPointer: L, diffPointer: D } = l(C);
        if (d.frequency < D.length()) {
          const S = v[x.current];
          S.visible = !0, S.position.set(
            L.x * (B.width / 2),
            L.y * (B.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = d.alpha, x.current = (x.current + 1) % o;
        }
        return v.forEach((S) => {
          if (S.visible) {
            const E = S.material;
            S.rotation.z += d.rotation, E.opacity *= d.fadeout_speed, S.scale.x = d.fadeout_speed * S.scale.x + d.scale, S.scale.y = S.scale.x, E.opacity < 2e-3 && (S.visible = !1);
          }
        }), m(_);
      },
      [m, v, l, o, d, g]
    ),
    g,
    {
      scene: c,
      camera: r,
      meshArr: v,
      renderTarget: f,
      output: f.texture
    }
  ];
};
var je = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, We = `precision highp float;

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
const Xe = ({
  scene: n,
  size: s,
  dpr: o
}) => {
  const a = p(() => new t.PlaneGeometry(2, 2), []), e = p(
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
      vertexShader: je,
      fragmentShader: We
    }),
    []
  ), u = O(s, o);
  return R(() => {
    e.uniforms.uResolution.value = u.clone();
  }, [u, e]), A(n, a, e), e;
}, Ye = {
  texture0: new t.Texture(),
  texture1: new t.Texture(),
  textureResolution: new t.Vector2(0, 0),
  padding: 0,
  map: new t.Texture(),
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  dir: new t.Vector2(0, 0)
}, Ft = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = Xe({ scene: a, size: n, dpr: s }), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    dpr: s,
    size: n,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = F(Ye);
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "uTexture0", r.texture0), i(e, "uTexture1", r.texture1), i(e, "uTextureResolution", r.textureResolution), i(e, "padding", r.padding), i(e, "uMap", r.map), i(e, "mapIntensity", r.mapIntensity), i(e, "edgeIntensity", r.edgeIntensity), i(e, "epicenter", r.epicenter), i(e, "progress", r.progress), i(e, "dirX", r.dir.x), i(e, "dirY", r.dir.y), v(g);
      },
      [v, e, r, l]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var qe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, He = `precision highp float;
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
const ke = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
      vertexShader: qe,
      fragmentShader: He
    }),
    []
  );
  return A(n, s, o), o;
}, Ke = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, At = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ke(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(Ke);
  return [
    w(
      (m, d) => {
        const { gl: g, clock: x } = m;
        return d && l(d), i(e, "scale", r.scale), i(e, "timeStrength", r.timeStrength), i(e, "noiseOctaves", r.noiseOctaves), i(e, "fbmOctaves", r.fbmOctaves), i(e, "warpOctaves", r.warpOctaves), i(e, "warpDirection", r.warpDirection), i(e, "warpStrength", r.warpStrength), i(e, "uTime", x.getElapsedTime()), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
}, Y = process.env.NODE_ENV === "development", Ze = (n) => {
  var e, u, c;
  const s = (e = n.dom) == null ? void 0 : e.length, o = (u = n.texture) == null ? void 0 : u.length, a = (c = n.resolution) == null ? void 0 : c.length;
  return !s || !o || !a ? (Y && console.warn("No dom or texture or resolution is set"), !1) : s !== o || s !== a ? (Y && console.warn("not Match dom , texture and resolution length"), !1) : !0;
};
var Je = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Qe = `precision highp float;

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
const et = ({
  params: n,
  size: s,
  scene: o
}) => {
  o.children.length > 0 && (o.children.forEach((a) => {
    a instanceof t.Mesh && (a.geometry.dispose(), a.material.dispose());
  }), o.remove(...o.children)), n.texture.forEach((a, e) => {
    const u = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: Je,
        fragmentShader: Qe,
        transparent: !0,
        uniforms: {
          u_texture: { value: a },
          u_textureResolution: { value: new t.Vector2(0, 0) },
          u_resolution: { value: new t.Vector2(0, 0) },
          u_borderRadius: {
            value: n.boderRadius[e] ? n.boderRadius[e] : 0
          }
        }
      })
    );
    o.add(u);
  });
}, tt = () => {
  const n = y([]), s = y([]);
  return w(
    ({
      isIntersectingRef: a,
      isIntersectingOnceRef: e,
      params: u
    }) => {
      n.current.length > 0 && n.current.forEach((v, r) => {
        v.unobserve(s.current[r]);
      }), s.current = [], n.current = [];
      const c = new Array(u.dom.length).fill(!1);
      a.current = [...c], e.current = [...c], u.dom.forEach((v, r) => {
        const l = (m) => {
          m.forEach((d) => {
            u.onIntersect[r] && u.onIntersect[r](d), a.current[r] = d.isIntersecting;
          });
        }, f = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        f.observe(v), n.current.push(f), s.current.push(v);
      });
    },
    []
  );
}, nt = () => {
  const n = y([]), s = w(
    ({ params: o, size: a, resolutionRef: e, scene: u, isIntersectingRef: c }) => {
      u.children.length !== n.current.length && (n.current = new Array(u.children.length)), u.children.forEach((v, r) => {
        const l = o.dom[r];
        if (!l) {
          Y && console.warn("DOM is null.");
          return;
        }
        const f = l.getBoundingClientRect();
        if (n.current[r] = f, v.scale.set(f.width, f.height, 1), v.position.set(
          f.left + f.width * 0.5 - a.width * 0.5,
          -f.top - f.height * 0.5 + a.height * 0.5,
          0
        ), c.current[r] && (o.rotation[r] && v.rotation.copy(o.rotation[r]), v instanceof t.Mesh)) {
          const m = v.material;
          i(m, "u_texture", o.texture[r]), i(
            m,
            "u_textureResolution",
            o.resolution[r]
          ), i(
            m,
            "u_resolution",
            e.current.set(f.width, f.height)
          ), i(
            m,
            "u_borderRadius",
            o.boderRadius[r] ? o.boderRadius[r] : 0
          );
        }
      });
    },
    []
  );
  return [n.current, s];
}, rt = () => {
  const n = y([]), s = y([]), o = w((a, e = !1) => {
    n.current.forEach((c, v) => {
      c && (s.current[v] = !0);
    });
    const u = e ? [...s.current] : [...n.current];
    return a < 0 ? u : u[a];
  }, []);
  return {
    isIntersectingRef: n,
    isIntersectingOnceRef: s,
    isIntersecting: o
  };
}, ot = (n) => ({ onView: o, onHidden: a }) => {
  const e = y(!1);
  R(() => {
    let u;
    const c = () => {
      n.current.some((v) => v) ? e.current || (o && o(), e.current = !0) : e.current && (a && a(), e.current = !1), u = requestAnimationFrame(c);
    };
    return u = requestAnimationFrame(c), () => {
      cancelAnimationFrame(u);
    };
  }, [o, a]);
}, at = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Bt = ({ size: n, dpr: s, samples: o = 0 }, a = [], e) => {
  const u = p(() => new t.Scene(), []), c = U(n), [v, r] = P({
    scene: u,
    camera: c,
    size: n,
    dpr: s,
    samples: o,
    isSizeUpdate: !0
  }), [l, f] = F({
    ...at,
    updateKey: e
  }), [m, d] = nt(), g = y(new t.Vector2(0, 0)), [x, h] = ue(!0);
  R(() => {
    h(!0);
  }, a);
  const T = y(null), b = p(() => new t.Texture(), []), _ = tt(), { isIntersectingOnceRef: C, isIntersectingRef: B, isIntersecting: L } = rt(), D = ot(B);
  return [
    w(
      (E, N) => {
        const { gl: G, size: V } = E;
        if (N && f(N), Ze(l)) {
          if (x) {
            if (T.current === l.updateKey)
              return b;
            T.current = l.updateKey;
          }
          x && (et({
            params: l,
            size: V,
            scene: u
          }), _({
            isIntersectingRef: B,
            isIntersectingOnceRef: C,
            params: l
          }), h(!1)), d({
            params: l,
            size: V,
            resolutionRef: g,
            scene: u,
            isIntersectingRef: B
          });
        }
        return r(G);
      },
      [
        r,
        f,
        _,
        d,
        x,
        u,
        l,
        C,
        B,
        b
      ]
    ),
    f,
    {
      scene: u,
      camera: c,
      renderTarget: v,
      output: v.texture,
      isIntersecting: L,
      DOMRects: m,
      intersections: B.current,
      useDomView: D
    }
  ];
};
var it = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ut = `precision mediump float;

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
const st = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: it,
      fragmentShader: ut
    }),
    []
  );
  return A(n, s, o), o;
}, lt = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, It = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = st(a), u = U(n), c = p(
    () => ({
      scene: a,
      camera: u,
      size: n,
      dpr: s,
      samples: o
    }),
    [a, u, n, s, o]
  ), [v, r] = P(c), [l, f] = $(c), [m, d] = F(lt);
  return [
    w(
      (x, h) => {
        const { gl: T } = x;
        h && d(h), i(e, "uTexture", m.texture), i(e, "uResolution", [
          m.texture.source.data.width,
          m.texture.source.data.height
        ]), i(e, "uBlurSize", m.blurSize);
        let b = f(T);
        const _ = m.blurPower;
        for (let C = 0; C < _; C++)
          i(e, "uTexture", b), b = f(T);
        return r(T);
      },
      [r, f, e, d, m]
    ),
    d,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var ct = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, vt = `precision highp float;

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
const dt = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new t.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uMode: { value: 0 }
      },
      vertexShader: ct,
      fragmentShader: vt
    }),
    []
  );
  return A(n, s, o), o;
}, ft = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Ot = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = dt(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o,
    isSizeUpdate: !0
  }), [r, l] = F(ft);
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "uEpicenter", r.epicenter), i(e, "uProgress", r.progress), i(e, "uWidth", r.width), i(e, "uStrength", r.strength), i(
          e,
          "uMode",
          r.mode === "center" ? 0 : r.mode === "horizontal" ? 1 : 2
        ), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var mt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, pt = `precision highp float;

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
const gt = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: mt,
      fragmentShader: pt
    }),
    []
  );
  return A(n, s, o), o;
}, xt = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Lt = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = gt(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(
    xt
  );
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "u_texture", r.texture), i(e, "u_brightness", r.brightness), i(e, "u_min", r.min), i(e, "u_max", r.max), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
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
const wt = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
      vertexShader: ht,
      fragmentShader: yt
    }),
    []
  );
  return A(n, s, o), o;
}, Tt = {
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new t.Vector2(0.1, 0.1),
  laminateDetail: new t.Vector2(1, 1),
  distortion: new t.Vector2(0, 0),
  colorFactor: new t.Vector3(1, 1, 1),
  timeStrength: new t.Vector2(0, 0),
  noise: !1,
  noiseStrength: new t.Vector2(0, 0)
}, zt = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = wt(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(Tt);
  return [
    w(
      (m, d) => {
        const { gl: g, clock: x } = m;
        return d && l(d), r.texture ? (i(e, "uTexture", r.texture), i(e, "isTexture", !0)) : (i(e, "isTexture", !1), i(e, "scale", r.scale)), r.noise ? (i(e, "noise", r.noise), i(e, "isNoise", !0), i(e, "noiseStrength", r.noiseStrength)) : i(e, "isNoise", !1), i(e, "uTime", x.getElapsedTime()), i(e, "laminateLayer", r.laminateLayer), i(e, "laminateInterval", r.laminateInterval), i(e, "laminateDetail", r.laminateDetail), i(e, "distortion", r.distortion), i(e, "colorFactor", r.colorFactor), i(e, "timeStrength", r.timeStrength), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var St = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, _t = `precision highp float;

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
const Mt = (n) => {
  const s = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: St,
      fragmentShader: _t
    }),
    []
  );
  return A(n, s, o), o;
}, Dt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Et = ({
  size: n,
  dpr: s,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = Mt(a), u = U(n), [c, v] = P({
    scene: a,
    camera: u,
    size: n,
    dpr: s,
    samples: o
  }), [r, l] = F(Dt);
  return [
    w(
      (m, d) => {
        const { gl: g } = m;
        return d && l(d), i(e, "u_texture", r.texture), i(e, "u_map", r.map), i(e, "u_mapIntensity", r.mapIntensity), v(g);
      },
      [v, e, l, r]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: u,
      renderTarget: c,
      output: c.texture
    }
  ];
}, $t = ({
  scene: n,
  camera: s,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: u = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}, r) => {
  const l = y([]), f = O(o, a);
  l.current = p(() => Array.from({ length: r }, () => {
    const d = new t.WebGLRenderTarget(
      f.x,
      f.y,
      {
        ...j,
        samples: u,
        depthBuffer: c
      }
    );
    return v && (d.depthTexture = new t.DepthTexture(
      f.x,
      f.y,
      t.FloatType
    )), d;
  }), [r]), q(() => {
    e && l.current.forEach(
      (d) => d.setSize(f.x, f.y)
    );
  }, [f, e]), R(() => {
    const d = l.current;
    return () => {
      d.forEach((g) => g.dispose());
    };
  }, [r]);
  const m = w(
    (d, g, x) => {
      const h = l.current[g];
      return k({
        gl: d,
        scene: n,
        camera: s,
        fbo: h,
        onBeforeRender: () => x && x({ read: h.texture })
      }), h.texture;
    },
    [n, s]
  );
  return [l.current, m];
};
export {
  we as BLENDING_PARAMS,
  xt as BRIGHTNESSPICKER_PARAMS,
  de as BRUSH_PARAMS,
  Tt as COLORSTRATA_PARAMS,
  at as DOMSYNCER_PARAMS,
  ge as DUOTONE_PARAMS,
  $e as FLUID_PARAMS,
  Dt as FXBLENDING_PARAMS,
  Ye as FXTEXTURE_PARAMS,
  Ke as NOISE_PARAMS,
  Ge as RIPPLE_PARAMS,
  lt as SIMPLEBLUR_PARAMS,
  ft as WAVE_PARAMS,
  i as setUniform,
  A as useAddMesh,
  Vt as useBlending,
  Lt as useBrightnessPicker,
  Ct as useBrush,
  U as useCamera,
  zt as useColorStrata,
  $t as useCopyTexture,
  Bt as useDomSyncer,
  $ as useDoubleFBO,
  Rt as useDuoTone,
  Pt as useFluid,
  Et as useFxBlending,
  Ft as useFxTexture,
  At as useNoise,
  F as useParams,
  H as usePointer,
  O as useResolution,
  Ut as useRipple,
  It as useSimpleBlur,
  P as useSingleFBO,
  Ot as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
