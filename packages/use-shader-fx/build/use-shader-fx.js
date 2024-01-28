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
const I = (r, u = !1) => {
  const o = u ? r.width * u : r.width, a = u ? r.height * u : r.height;
  return p(
    () => new t.Vector2(o, a),
    [o, a]
  );
}, F = (r, u, o) => {
  const a = p(
    () => new t.Mesh(u, o),
    [u, o]
  );
  return R(() => {
    r.add(a);
  }, [r, a]), R(() => () => {
    r.remove(a), u.dispose(), o.dispose();
  }, [r, u, o, a]), a;
}, i = (r, u, o) => {
  r.uniforms && r.uniforms[u] && o !== void 0 && o !== null ? r.uniforms[u].value = o : console.error(
    `Uniform key "${String(
      u
    )}" does not exist in the material. or "${String(
      u
    )}" is null | undefined`
  );
}, ce = ({
  scene: r,
  size: u,
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
  ), s = I(u, o);
  return R(() => {
    i(e, "uAspect", s.width / s.height), i(e, "uResolution", s.clone());
  }, [s, e]), F(r, a, e), e;
}, ve = (r, u) => {
  const o = u, a = r / u, [e, s] = [o * a / 2, o / 2];
  return { width: e, height: s, near: -1e3, far: 1e3 };
}, P = (r) => {
  const u = I(r), { width: o, height: a, near: e, far: s } = ve(
    u.x,
    u.y
  );
  return p(
    () => new t.OrthographicCamera(
      -o,
      o,
      a,
      -a,
      e,
      s
    ),
    [o, a, e, s]
  );
}, H = () => {
  const r = y(new t.Vector2(0, 0)), u = y(new t.Vector2(0, 0)), o = y(0), a = y(new t.Vector2(0, 0)), e = y(!1);
  return w((c) => {
    const v = performance.now(), n = c.clone();
    o.current === 0 && (o.current = v, r.current = n);
    const l = Math.max(1, v - o.current);
    o.current = v, a.current.copy(n).sub(r.current).divideScalar(l);
    const m = a.current.length() > 0, f = e.current ? r.current.clone() : n;
    return !e.current && m && (e.current = !0), r.current = n, {
      currentPointer: n,
      prevPointer: f,
      diffPointer: u.current.subVectors(n, f),
      velocity: a.current,
      isVelocityUpdate: m
    };
  }, []);
}, U = (r) => {
  const o = y(
    ((e) => Object.values(e).some((s) => typeof s == "function"))(r) ? r : structuredClone(r)
  ), a = w((e) => {
    for (const s in e) {
      const c = s;
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
}, G = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, k = ({
  gl: r,
  fbo: u,
  scene: o,
  camera: a,
  onBeforeRender: e,
  onSwap: s
}) => {
  r.setRenderTarget(u), e(), r.clear(), r.render(o, a), s && s(), r.setRenderTarget(null), r.clear();
}, V = ({
  scene: r,
  camera: u,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}) => {
  const n = y(), l = I(o, a);
  n.current = p(
    () => {
      const f = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...G,
          samples: s,
          depthBuffer: c
        }
      );
      return v && (f.depthTexture = new t.DepthTexture(
        l.x,
        l.y,
        t.FloatType
      )), f;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), q(() => {
    var f;
    e && ((f = n.current) == null || f.setSize(l.x, l.y));
  }, [l, e]), R(() => {
    const f = n.current;
    return () => {
      f == null || f.dispose();
    };
  }, []);
  const m = w(
    (f, d) => {
      const g = n.current;
      return k({
        gl: f,
        fbo: g,
        scene: r,
        camera: u,
        onBeforeRender: () => d && d({ read: g.texture })
      }), g.texture;
    },
    [r, u]
  );
  return [n.current, m];
}, N = ({
  scene: r,
  camera: u,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}) => {
  const n = y({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), l = I(o, a), m = p(() => {
    const d = new t.WebGLRenderTarget(l.x, l.y, {
      ...G,
      samples: s,
      depthBuffer: c
    }), g = new t.WebGLRenderTarget(l.x, l.y, {
      ...G,
      samples: s,
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
  n.current.read = m.read, n.current.write = m.write, q(() => {
    var d, g;
    e && ((d = n.current.read) == null || d.setSize(l.x, l.y), (g = n.current.write) == null || g.setSize(l.x, l.y));
  }, [l, e]), R(() => {
    const d = n.current;
    return () => {
      var g, x;
      (g = d.read) == null || g.dispose(), (x = d.write) == null || x.dispose();
    };
  }, []);
  const f = w(
    (d, g) => {
      var h;
      const x = n.current;
      return k({
        gl: d,
        scene: r,
        camera: u,
        fbo: x.write,
        onBeforeRender: () => g && g({
          read: x.read.texture,
          write: x.write.texture
        }),
        onSwap: () => x.swap()
      }), (h = x.read) == null ? void 0 : h.texture;
    },
    [r, u]
  );
  return [
    { read: n.current.read, write: n.current.write },
    f
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
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ce({ scene: a, size: r, dpr: u }), s = P(r), c = H(), [v, n] = N({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [l, m] = U(de);
  return [
    w(
      (d, g) => {
        const { gl: x, pointer: h } = d;
        g && m(g), i(e, "uTexture", l.texture), i(e, "uRadius", l.radius), i(e, "uSmudge", l.smudge), i(e, "uDissipation", l.dissipation), i(e, "uMotionBlur", l.motionBlur), i(e, "uMotionSample", l.motionSample), i(e, "uColor", l.color);
        const { currentPointer: T, prevPointer: b, velocity: _ } = c(h);
        return i(e, "uMouse", T), i(e, "uPrevMouse", b), i(e, "uVelocity", _), n(x, ({ read: M }) => {
          i(e, "uMap", M);
        });
      },
      [e, c, n, l, m]
    ),
    m,
    {
      scene: a,
      material: e,
      camera: s,
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
const pe = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, ge = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Rt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = pe(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(ge);
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "uTexture", n.texture), i(e, "uColor0", n.color0), i(e, "uColor1", n.color1), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
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
const ye = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
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
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ye(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(we);
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "u_texture", n.texture), i(e, "u_map", n.map), i(e, "u_mapIntensity", n.mapIntensity), n.alphaMap ? (i(e, "u_alphaMap", n.alphaMap), i(e, "u_isAlphaMap", !0)) : i(e, "u_isAlphaMap", !1), i(e, "u_brightness", n.brightness), i(e, "u_min", n.min), i(e, "u_max", n.max), n.dodgeColor ? (i(e, "u_dodgeColor", n.dodgeColor), i(e, "u_isDodgeColor", !0)) : i(e, "u_isDodgeColor", !1), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
      renderTarget: c,
      output: c.texture
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
}`, Te = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Se = () => p(
  () => new t.ShaderMaterial({
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
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
    vertexShader: B,
    fragmentShader: Le
  }),
  []
), Ee = ({
  scene: r,
  size: u,
  dpr: o
}) => {
  const a = p(() => new t.PlaneGeometry(2, 2), []), e = Se(), s = e.clone(), c = Pe(), v = Fe(), n = Me(), l = be(), m = Re(), f = Be(), d = Oe(), g = ze(), x = p(
    () => ({
      vorticityMaterial: v,
      curlMaterial: c,
      advectionMaterial: n,
      divergenceMaterial: l,
      pressureMaterial: m,
      clearMaterial: f,
      gradientSubtractMaterial: d,
      splatMaterial: g
    }),
    [
      v,
      c,
      n,
      l,
      m,
      f,
      d,
      g
    ]
  ), h = I(u, o);
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
  const T = F(r, a, e);
  R(() => {
    e.dispose(), T.material = s;
  }, [e, T, s]), R(() => () => {
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
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), [e, s] = Ee({ scene: a, size: r, dpr: u }), c = P(r), v = H(), n = p(
    () => ({
      scene: a,
      camera: c,
      size: r,
      samples: o
    }),
    [a, c, r, o]
  ), [l, m] = N(n), [f, d] = N(n), [g, x] = V(n), [h, T] = V(n), [b, _] = N(n), M = y(0), O = y(new t.Vector2(0, 0)), L = y(new t.Vector3(0, 0, 0)), [C, S] = U($e);
  return [
    w(
      (j, $) => {
        const { gl: A, pointer: Q, clock: W, size: K } = j;
        $ && S($), M.current === 0 && (M.current = W.getElapsedTime());
        const Z = Math.min(
          (W.getElapsedTime() - M.current) / 3,
          0.02
        );
        M.current = W.getElapsedTime();
        const X = m(A, ({ read: D }) => {
          s(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", D), i(e.advectionMaterial, "uSource", D), i(e.advectionMaterial, "dt", Z), i(
            e.advectionMaterial,
            "dissipation",
            C.velocity_dissipation
          );
        }), ee = d(A, ({ read: D }) => {
          s(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", X), i(e.advectionMaterial, "uSource", D), i(
            e.advectionMaterial,
            "dissipation",
            C.density_dissipation
          );
        }), { currentPointer: te, diffPointer: ne, isVelocityUpdate: re, velocity: oe } = v(Q);
        re && (m(A, ({ read: D }) => {
          s(e.splatMaterial), i(e.splatMaterial, "uTarget", D), i(e.splatMaterial, "point", te);
          const E = ne.multiply(
            O.current.set(K.width, K.height).multiplyScalar(C.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            L.current.set(E.x, E.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            C.splat_radius
          );
        }), d(A, ({ read: D }) => {
          s(e.splatMaterial), i(e.splatMaterial, "uTarget", D);
          const E = typeof C.fluid_color == "function" ? C.fluid_color(oe) : C.fluid_color;
          i(e.splatMaterial, "color", E);
        }));
        const ae = x(A, () => {
          s(e.curlMaterial), i(e.curlMaterial, "uVelocity", X);
        });
        m(A, ({ read: D }) => {
          s(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", D), i(e.vorticityMaterial, "uCurl", ae), i(
            e.vorticityMaterial,
            "curl",
            C.curl_strength
          ), i(e.vorticityMaterial, "dt", Z);
        });
        const ie = T(A, () => {
          s(e.divergenceMaterial), i(e.divergenceMaterial, "uVelocity", X);
        });
        _(A, ({ read: D }) => {
          s(e.clearMaterial), i(e.clearMaterial, "uTexture", D), i(
            e.clearMaterial,
            "value",
            C.pressure_dissipation
          );
        }), s(e.pressureMaterial), i(e.pressureMaterial, "uDivergence", ie);
        let J;
        for (let D = 0; D < C.pressure_iterations; D++)
          J = _(A, ({ read: E }) => {
            i(e.pressureMaterial, "uPressure", E);
          });
        return m(A, ({ read: D }) => {
          s(e.gradientSubtractMaterial), i(
            e.gradientSubtractMaterial,
            "uPressure",
            J
          ), i(e.gradientSubtractMaterial, "uVelocity", D);
        }), ee;
      },
      [
        e,
        s,
        x,
        d,
        T,
        v,
        _,
        m,
        S,
        C
      ]
    ),
    S,
    {
      scene: a,
      materials: e,
      camera: c,
      renderTarget: {
        velocity: l,
        density: f,
        curl: g,
        divergence: h,
        pressure: b
      },
      output: f.read.texture
    }
  ];
}, Ne = ({ scale: r, max: u, texture: o, scene: a }) => {
  const e = y([]), s = p(
    () => new t.PlaneGeometry(r, r),
    [r]
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
    for (let v = 0; v < u; v++) {
      const n = new t.Mesh(s.clone(), c.clone());
      n.rotateZ(2 * Math.PI * Math.random()), n.visible = !1, a.add(n), e.current.push(n);
    }
  }, [s, c, a, u]), R(() => () => {
    e.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((n) => n.dispose()) : v.material.dispose(), a.remove(v);
    }), e.current = [];
  }, [a]), e.current;
}, Ge = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Ut = ({
  texture: r,
  scale: u = 64,
  max: o = 100,
  size: a,
  dpr: e,
  samples: s = 0
}) => {
  const c = p(() => new t.Scene(), []), v = Ne({
    scale: u,
    max: o,
    texture: r,
    scene: c
  }), n = P(a), l = H(), [m, f] = V({
    scene: c,
    camera: n,
    size: a,
    dpr: e,
    samples: s
  }), [d, g] = U(Ge), x = y(0);
  return [
    w(
      (T, b) => {
        const { gl: _, pointer: M, size: O } = T;
        b && g(b);
        const { currentPointer: L, diffPointer: C } = l(M);
        if (d.frequency < C.length()) {
          const S = v[x.current];
          S.visible = !0, S.position.set(
            L.x * (O.width / 2),
            L.y * (O.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = d.alpha, x.current = (x.current + 1) % o;
        }
        return v.forEach((S) => {
          if (S.visible) {
            const z = S.material;
            S.rotation.z += d.rotation, z.opacity *= d.fadeout_speed, S.scale.x = d.fadeout_speed * S.scale.x + d.scale, S.scale.y = S.scale.x, z.opacity < 2e-3 && (S.visible = !1);
          }
        }), f(_);
      },
      [f, v, l, o, d, g]
    ),
    g,
    {
      scene: c,
      camera: n,
      meshArr: v,
      renderTarget: m,
      output: m.texture
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
  scene: r,
  size: u,
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
  ), s = I(u, o);
  return R(() => {
    e.uniforms.uResolution.value = s.clone();
  }, [s, e]), F(r, a, e), e;
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
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = Xe({ scene: a, size: r, dpr: u }), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    dpr: u,
    size: r,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = U(Ye);
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "uTexture0", n.texture0), i(e, "uTexture1", n.texture1), i(e, "uTextureResolution", n.textureResolution), i(e, "padding", n.padding), i(e, "uMap", n.map), i(e, "mapIntensity", n.mapIntensity), i(e, "edgeIntensity", n.edgeIntensity), i(e, "epicenter", n.epicenter), i(e, "progress", n.progress), i(e, "dirX", n.dir.x), i(e, "dirY", n.dir.y), v(g);
      },
      [v, e, n, l]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
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
const ke = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, Ke = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, At = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = ke(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(Ke);
  return [
    w(
      (f, d) => {
        const { gl: g, clock: x } = f;
        return d && l(d), i(e, "scale", n.scale), i(e, "timeStrength", n.timeStrength), i(e, "noiseOctaves", n.noiseOctaves), i(e, "fbmOctaves", n.fbmOctaves), i(e, "warpOctaves", n.warpOctaves), i(e, "warpDirection", n.warpDirection), i(e, "warpStrength", n.warpStrength), i(e, "uTime", x.getElapsedTime()), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
}, Y = process.env.NODE_ENV === "development", Ze = (r) => {
  var e, s, c;
  const u = (e = r.dom) == null ? void 0 : e.length, o = (s = r.texture) == null ? void 0 : s.length, a = (c = r.resolution) == null ? void 0 : c.length;
  return !u || !o || !a ? (Y && console.warn("No dom or texture or resolution is set"), !0) : u !== o || u !== a ? (Y && console.warn("not Match dom , texture and resolution length"), !0) : !1;
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
  params: r,
  size: u,
  scene: o
}) => {
  o.children.length > 0 && (o.children.forEach((a) => {
    a instanceof t.Mesh && (a.geometry.dispose(), a.material.dispose());
  }), o.remove(...o.children)), r.texture.forEach((a, e) => {
    const s = new t.Mesh(
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
            value: r.boderRadius[e] ? r.boderRadius[e] : 0
          }
        }
      })
    );
    o.add(s);
  });
}, tt = () => {
  const r = y([]), u = y([]);
  return w(
    ({
      isIntersectingRef: a,
      isIntersectingOnceRef: e,
      params: s
    }) => {
      r.current.length > 0 && r.current.forEach((v, n) => {
        v.unobserve(u.current[n]);
      }), u.current = [], r.current = [];
      const c = new Array(s.dom.length).fill(!1);
      a.current = [...c], e.current = [...c], s.dom.forEach((v, n) => {
        const l = (f) => {
          f.forEach((d) => {
            s.onIntersect[n] && s.onIntersect[n](d), a.current[n] = d.isIntersecting;
          });
        }, m = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        m.observe(v), r.current.push(m), u.current.push(v);
      });
    },
    []
  );
}, nt = () => {
  const r = y([]), u = w(
    ({ params: o, size: a, resolutionRef: e, scene: s, isIntersectingRef: c }) => {
      s.children.length !== r.current.length && (r.current = new Array(s.children.length)), s.children.forEach((v, n) => {
        const l = o.dom[n];
        if (!l) {
          Y && console.warn("DOM is null.");
          return;
        }
        const m = l.getBoundingClientRect();
        if (r.current[n] = m, v.scale.set(m.width, m.height, 1), v.position.set(
          m.left + m.width * 0.5 - a.width * 0.5,
          -m.top - m.height * 0.5 + a.height * 0.5,
          0
        ), c.current[n] && (o.rotation[n] && v.rotation.copy(o.rotation[n]), v instanceof t.Mesh)) {
          const f = v.material;
          i(f, "u_texture", o.texture[n]), i(
            f,
            "u_textureResolution",
            o.resolution[n]
          ), i(
            f,
            "u_resolution",
            e.current.set(m.width, m.height)
          ), i(
            f,
            "u_borderRadius",
            o.boderRadius[n] ? o.boderRadius[n] : 0
          );
        }
      });
    },
    []
  );
  return [r.current, u];
}, rt = () => {
  const r = y([]), u = y([]), o = w((a, e = !1) => {
    r.current.forEach((c, v) => {
      c && (u.current[v] = !0);
    });
    const s = e ? [...u.current] : [...r.current];
    return a < 0 ? s : s[a];
  }, []);
  return {
    isIntersectingRef: r,
    isIntersectingOnceRef: u,
    isIntersecting: o
  };
}, ot = (r) => ({ onView: o, onHidden: a }) => {
  const e = y(!1);
  R(() => {
    let s;
    const c = () => {
      r.current.some((v) => v) ? e.current || (o && o(), e.current = !0) : e.current && (a && a(), e.current = !1), s = requestAnimationFrame(c);
    };
    return s = requestAnimationFrame(c), () => {
      cancelAnimationFrame(s);
    };
  }, [o, a]);
}, at = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Bt = ({ size: r, dpr: u, samples: o = 0 }, a = []) => {
  const e = p(() => new t.Scene(), []), s = P(r), [c, v] = V({
    scene: e,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = U({
    ...at,
    updateKey: performance.now()
  }), [m, f] = nt(), d = y(new t.Vector2(0, 0)), [g, x] = ue(!0);
  R(() => {
    x(!0);
  }, a);
  const h = y(null), T = p(() => new t.Texture(), []), b = tt(), { isIntersectingOnceRef: _, isIntersectingRef: M, isIntersecting: O } = rt(), L = ot(M);
  return [
    w(
      (S, z) => {
        const { gl: j, size: $ } = S;
        if (z && l(z), Ze(n))
          return T;
        if (g) {
          if (h.current === n.updateKey)
            return T;
          h.current = n.updateKey;
        }
        return g && (et({
          params: n,
          size: $,
          scene: e
        }), b({
          isIntersectingRef: M,
          isIntersectingOnceRef: _,
          params: n
        }), x(!1)), f({
          params: n,
          size: $,
          resolutionRef: d,
          scene: e,
          isIntersectingRef: M
        }), v(j);
      },
      [
        v,
        l,
        b,
        f,
        g,
        e,
        n,
        _,
        M,
        T
      ]
    ),
    l,
    {
      scene: e,
      camera: s,
      renderTarget: c,
      output: c.texture,
      isIntersecting: O,
      DOMRects: m,
      intersections: M.current,
      useDomView: L
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
const st = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, lt = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, It = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = st(a), s = P(r), c = p(
    () => ({
      scene: a,
      camera: s,
      size: r,
      dpr: u,
      samples: o
    }),
    [a, s, r, u, o]
  ), [v, n] = V(c), [l, m] = N(c), [f, d] = U(lt);
  return [
    w(
      (x, h) => {
        const { gl: T } = x;
        h && d(h), i(e, "uTexture", f.texture), i(e, "uResolution", [
          f.texture.source.data.width,
          f.texture.source.data.height
        ]), i(e, "uBlurSize", f.blurSize);
        let b = m(T);
        const _ = f.blurPower;
        for (let M = 0; M < _; M++)
          i(e, "uTexture", b), b = m(T);
        return n(T);
      },
      [n, m, e, d, f]
    ),
    d,
    {
      scene: a,
      material: e,
      camera: s,
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
const dt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, ft = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Ot = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = dt(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = U(ft);
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "uEpicenter", n.epicenter), i(e, "uProgress", n.progress), i(e, "uWidth", n.width), i(e, "uStrength", n.strength), i(
          e,
          "uMode",
          n.mode === "center" ? 0 : n.mode === "horizontal" ? 1 : 2
        ), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
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
const gt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, xt = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Lt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = gt(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(
    xt
  );
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "u_texture", n.texture), i(e, "u_brightness", n.brightness), i(e, "u_min", n.min), i(e, "u_max", n.max), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
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
const wt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
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
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = wt(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(Tt);
  return [
    w(
      (f, d) => {
        const { gl: g, clock: x } = f;
        return d && l(d), n.texture ? (i(e, "uTexture", n.texture), i(e, "isTexture", !0)) : (i(e, "isTexture", !1), i(e, "scale", n.scale)), n.noise ? (i(e, "noise", n.noise), i(e, "isNoise", !0), i(e, "noiseStrength", n.noiseStrength)) : i(e, "isNoise", !1), i(e, "uTime", x.getElapsedTime()), i(e, "laminateLayer", n.laminateLayer), i(e, "laminateInterval", n.laminateInterval), i(e, "laminateDetail", n.laminateDetail), i(e, "distortion", n.distortion), i(e, "colorFactor", n.colorFactor), i(e, "timeStrength", n.timeStrength), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
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
const Mt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
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
  return F(r, u, o), o;
}, Dt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Et = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const a = p(() => new t.Scene(), []), e = Mt(a), s = P(r), [c, v] = V({
    scene: a,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = U(Dt);
  return [
    w(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), i(e, "u_texture", n.texture), i(e, "u_map", n.map), i(e, "u_mapIntensity", n.mapIntensity), v(g);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: a,
      material: e,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
}, $t = ({
  scene: r,
  camera: u,
  size: o,
  dpr: a = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: c = !1,
  depthTexture: v = !1
}, n) => {
  const l = y([]), m = I(o, a);
  l.current = p(() => Array.from({ length: n }, () => {
    const d = new t.WebGLRenderTarget(
      m.x,
      m.y,
      {
        ...G,
        samples: s,
        depthBuffer: c
      }
    );
    return v && (d.depthTexture = new t.DepthTexture(
      m.x,
      m.y,
      t.FloatType
    )), d;
  }), [n]), q(() => {
    e && l.current.forEach(
      (d) => d.setSize(m.x, m.y)
    );
  }, [m, e]), R(() => {
    const d = l.current;
    return () => {
      d.forEach((g) => g.dispose());
    };
  }, [n]);
  const f = w(
    (d, g, x) => {
      const h = l.current[g];
      return k({
        gl: d,
        scene: r,
        camera: u,
        fbo: h,
        onBeforeRender: () => x && x({ read: h.texture })
      }), h.texture;
    },
    [r, u]
  );
  return [l.current, f];
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
  F as useAddMesh,
  Vt as useBlending,
  Lt as useBrightnessPicker,
  Ct as useBrush,
  P as useCamera,
  zt as useColorStrata,
  $t as useCopyTexture,
  Bt as useDomSyncer,
  N as useDoubleFBO,
  Rt as useDuoTone,
  Pt as useFluid,
  Et as useFxBlending,
  Ft as useFxTexture,
  At as useNoise,
  U as useParams,
  H as usePointer,
  I as useResolution,
  Ut as useRipple,
  It as useSimpleBlur,
  V as useSingleFBO,
  Ot as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
