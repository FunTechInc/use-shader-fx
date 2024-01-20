import * as t from "three";
import { useMemo as p, useEffect as C, useRef as T, useCallback as y, useLayoutEffect as X, useState as ue } from "react";
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
const O = (r, u = !1) => {
  const o = u ? r.width * u : r.width, i = u ? r.height * u : r.height;
  return p(
    () => new t.Vector2(o, i),
    [o, i]
  );
}, F = (r, u, o) => {
  const i = p(
    () => new t.Mesh(u, o),
    [u, o]
  );
  return C(() => {
    r.add(i);
  }, [r, i]), C(() => () => {
    r.remove(i), u.dispose(), o.dispose();
  }, [r, u, o, i]), i;
}, a = (r, u, o) => {
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
  const i = p(() => new t.PlaneGeometry(2, 2), []), e = p(
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
  ), s = O(u, o);
  return C(() => {
    a(e, "uAspect", s.width / s.height), a(e, "uResolution", s.clone());
  }, [s, e]), F(r, i, e), e;
}, ve = (r, u) => {
  const o = u, i = r / u, [e, s] = [o * i / 2, o / 2];
  return { width: e, height: s, near: -1e3, far: 1e3 };
}, V = (r) => {
  const u = O(r), { width: o, height: i, near: e, far: s } = ve(
    u.x,
    u.y
  );
  return p(
    () => new t.OrthographicCamera(
      -o,
      o,
      i,
      -i,
      e,
      s
    ),
    [o, i, e, s]
  );
}, H = () => {
  const r = T(new t.Vector2(0, 0)), u = T(new t.Vector2(0, 0)), o = T(0), i = T(new t.Vector2(0, 0)), e = T(!1);
  return y((v) => {
    const c = performance.now(), n = v.clone();
    o.current === 0 && (o.current = c, r.current = n);
    const l = Math.max(1, c - o.current);
    o.current = c, i.current.copy(n).sub(r.current).divideScalar(l);
    const m = i.current.length() > 0, f = e.current ? r.current.clone() : n;
    return !e.current && m && (e.current = !0), r.current = n, {
      currentPointer: n,
      prevPointer: f,
      diffPointer: u.current.subVectors(n, f),
      velocity: i.current,
      isVelocityUpdate: m
    };
  }, []);
}, P = (r) => {
  const o = T(
    ((e) => Object.values(e).some((s) => typeof s == "function"))(r) ? r : structuredClone(r)
  ), i = y((e) => {
    for (const s in e) {
      const v = s;
      v in o.current && e[v] !== void 0 && e[v] !== null ? o.current[v] = e[v] : console.error(
        `"${String(
          v
        )}" does not exist in the params. or "${String(
          v
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, i];
}, $ = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, Y = ({
  gl: r,
  fbo: u,
  scene: o,
  camera: i,
  onBeforeRender: e,
  onSwap: s
}) => {
  r.setRenderTarget(u), e(), r.clear(), r.render(o, i), s && s(), r.setRenderTarget(null), r.clear();
}, R = ({
  scene: r,
  camera: u,
  size: o,
  dpr: i = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: v = !1,
  depthTexture: c = !1
}) => {
  const n = T(), l = O(o, i);
  n.current = p(
    () => {
      const f = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...$,
          samples: s,
          depthBuffer: v
        }
      );
      return c && (f.depthTexture = new t.DepthTexture(
        l.x,
        l.y,
        t.FloatType
      )), f;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), X(() => {
    var f;
    e && ((f = n.current) == null || f.setSize(l.x, l.y));
  }, [l, e]), C(() => {
    const f = n.current;
    return () => {
      f == null || f.dispose();
    };
  }, []);
  const m = y(
    (f, d) => {
      const g = n.current;
      return Y({
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
}, E = ({
  scene: r,
  camera: u,
  size: o,
  dpr: i = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: v = !1,
  depthTexture: c = !1
}) => {
  const n = T({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), l = O(o, i), m = p(() => {
    const d = new t.WebGLRenderTarget(l.x, l.y, {
      ...$,
      samples: s,
      depthBuffer: v
    }), g = new t.WebGLRenderTarget(l.x, l.y, {
      ...$,
      samples: s,
      depthBuffer: v
    });
    return c && (d.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    ), g.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), { read: d, write: g };
  }, []);
  n.current.read = m.read, n.current.write = m.write, X(() => {
    var d, g;
    e && ((d = n.current.read) == null || d.setSize(l.x, l.y), (g = n.current.write) == null || g.setSize(l.x, l.y));
  }, [l, e]), C(() => {
    const d = n.current;
    return () => {
      var g, x;
      (g = d.read) == null || g.dispose(), (x = d.write) == null || x.dispose();
    };
  }, []);
  const f = y(
    (d, g) => {
      var h;
      const x = n.current;
      return Y({
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
}, bt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ce({ scene: i, size: r, dpr: u }), s = V(r), v = H(), [c, n] = E({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [l, m] = P(de);
  return [
    y(
      (d, g) => {
        const { gl: x, pointer: h } = d;
        g && m(g), a(e, "uTexture", l.texture), a(e, "uRadius", l.radius), a(e, "uSmudge", l.smudge), a(e, "uDissipation", l.dissipation), a(e, "uMotionBlur", l.motionBlur), a(e, "uMotionSample", l.motionSample), a(e, "uColor", l.color);
        const { currentPointer: S, prevPointer: D, velocity: _ } = v(h);
        return a(e, "uMouse", S), a(e, "uPrevMouse", D), a(e, "uVelocity", _), n(x, ({ read: U }) => {
          a(e, "uMap", U);
        });
      },
      [e, v, n, l, m]
    ),
    m,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: c,
      output: c.read.texture
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
}, Ct = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = pe(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(ge);
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "uTexture", n.texture), a(e, "uColor0", n.color0), a(e, "uColor1", n.color1), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
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
}, Rt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ye(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(we);
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "u_texture", n.texture), a(e, "u_map", n.map), a(e, "u_mapIntensity", n.mapIntensity), n.alphaMap ? (a(e, "u_alphaMap", n.alphaMap), a(e, "u_isAlphaMap", !0)) : a(e, "u_isAlphaMap", !1), a(e, "u_brightness", n.brightness), a(e, "u_min", n.min), a(e, "u_max", n.max), n.dodgeColor ? (a(e, "u_dodgeColor", n.dodgeColor), a(e, "u_isDodgeColor", !0)) : a(e, "u_isDodgeColor", !1), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
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
  const i = p(() => new t.PlaneGeometry(2, 2), []), e = Se(), s = e.clone(), v = Pe(), c = Fe(), n = Me(), l = be(), m = Re(), f = Be(), d = Oe(), g = ze(), x = p(
    () => ({
      vorticityMaterial: c,
      curlMaterial: v,
      advectionMaterial: n,
      divergenceMaterial: l,
      pressureMaterial: m,
      clearMaterial: f,
      gradientSubtractMaterial: d,
      splatMaterial: g
    }),
    [
      c,
      v,
      n,
      l,
      m,
      f,
      d,
      g
    ]
  ), h = O(u, o);
  C(() => {
    a(
      x.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const _ of Object.values(x))
      a(
        _,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, x]);
  const S = F(r, i, e);
  C(() => {
    e.dispose(), S.material = s;
  }, [e, S, s]), C(() => () => {
    for (const _ of Object.values(x))
      _.dispose();
  }, [x]);
  const D = y(
    (_) => {
      S.material = _, S.material.needsUpdate = !0;
    },
    [S]
  );
  return [x, D];
}, $e = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1)
}, Vt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), [e, s] = Ee({ scene: i, size: r, dpr: u }), v = V(r), c = H(), n = p(
    () => ({
      scene: i,
      camera: v,
      size: r,
      samples: o
    }),
    [i, v, r, o]
  ), [l, m] = E(n), [f, d] = E(n), [g, x] = R(n), [h, S] = R(n), [D, _] = E(n), U = T(0), L = T(new t.Vector2(0, 0)), I = T(new t.Vector3(0, 0, 0)), [b, w] = P($e);
  return [
    y(
      (J, k) => {
        const { gl: A, pointer: Q, clock: G, size: q } = J;
        k && w(k), U.current === 0 && (U.current = G.getElapsedTime());
        const K = Math.min(
          (G.getElapsedTime() - U.current) / 3,
          0.02
        );
        U.current = G.getElapsedTime();
        const j = m(A, ({ read: M }) => {
          s(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", M), a(e.advectionMaterial, "uSource", M), a(e.advectionMaterial, "dt", K), a(
            e.advectionMaterial,
            "dissipation",
            b.velocity_dissipation
          );
        }), ee = d(A, ({ read: M }) => {
          s(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", j), a(e.advectionMaterial, "uSource", M), a(
            e.advectionMaterial,
            "dissipation",
            b.density_dissipation
          );
        }), { currentPointer: te, diffPointer: ne, isVelocityUpdate: re, velocity: oe } = c(Q);
        re && (m(A, ({ read: M }) => {
          s(e.splatMaterial), a(e.splatMaterial, "uTarget", M), a(e.splatMaterial, "point", te);
          const z = ne.multiply(
            L.current.set(q.width, q.height).multiplyScalar(b.velocity_acceleration)
          );
          a(
            e.splatMaterial,
            "color",
            I.current.set(z.x, z.y, 1)
          ), a(
            e.splatMaterial,
            "radius",
            b.splat_radius
          );
        }), d(A, ({ read: M }) => {
          s(e.splatMaterial), a(e.splatMaterial, "uTarget", M);
          const z = typeof b.fluid_color == "function" ? b.fluid_color(oe) : b.fluid_color;
          a(e.splatMaterial, "color", z);
        }));
        const ae = x(A, () => {
          s(e.curlMaterial), a(e.curlMaterial, "uVelocity", j);
        });
        m(A, ({ read: M }) => {
          s(e.vorticityMaterial), a(e.vorticityMaterial, "uVelocity", M), a(e.vorticityMaterial, "uCurl", ae), a(
            e.vorticityMaterial,
            "curl",
            b.curl_strength
          ), a(e.vorticityMaterial, "dt", K);
        });
        const ie = S(A, () => {
          s(e.divergenceMaterial), a(e.divergenceMaterial, "uVelocity", j);
        });
        _(A, ({ read: M }) => {
          s(e.clearMaterial), a(e.clearMaterial, "uTexture", M), a(
            e.clearMaterial,
            "value",
            b.pressure_dissipation
          );
        }), s(e.pressureMaterial), a(e.pressureMaterial, "uDivergence", ie);
        let Z;
        for (let M = 0; M < b.pressure_iterations; M++)
          Z = _(A, ({ read: z }) => {
            a(e.pressureMaterial, "uPressure", z);
          });
        return m(A, ({ read: M }) => {
          s(e.gradientSubtractMaterial), a(
            e.gradientSubtractMaterial,
            "uPressure",
            Z
          ), a(e.gradientSubtractMaterial, "uVelocity", M);
        }), ee;
      },
      [
        e,
        s,
        x,
        d,
        S,
        c,
        _,
        m,
        w,
        b
      ]
    ),
    w,
    {
      scene: i,
      materials: e,
      camera: v,
      renderTarget: {
        velocity: l,
        density: f,
        curl: g,
        divergence: h,
        pressure: D
      },
      output: f.read.texture
    }
  ];
}, Ne = ({ scale: r, max: u, texture: o, scene: i }) => {
  const e = T([]), s = p(
    () => new t.PlaneGeometry(r, r),
    [r]
  ), v = p(
    () => new t.MeshBasicMaterial({
      map: o ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [o]
  );
  return C(() => {
    for (let c = 0; c < u; c++) {
      const n = new t.Mesh(s.clone(), v.clone());
      n.rotateZ(2 * Math.PI * Math.random()), n.visible = !1, i.add(n), e.current.push(n);
    }
  }, [s, v, i, u]), C(() => () => {
    e.current.forEach((c) => {
      c.geometry.dispose(), Array.isArray(c.material) ? c.material.forEach((n) => n.dispose()) : c.material.dispose(), i.remove(c);
    }), e.current = [];
  }, [i]), e.current;
}, Ge = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Pt = ({
  texture: r,
  scale: u = 64,
  max: o = 100,
  size: i,
  dpr: e,
  samples: s = 0
}) => {
  const v = p(() => new t.Scene(), []), c = Ne({
    scale: u,
    max: o,
    texture: r,
    scene: v
  }), n = V(i), l = H(), [m, f] = R({
    scene: v,
    camera: n,
    size: i,
    dpr: e,
    samples: s
  }), [d, g] = P(Ge), x = T(0);
  return [
    y(
      (S, D) => {
        const { gl: _, pointer: U, size: L } = S;
        D && g(D);
        const { currentPointer: I, diffPointer: b } = l(U);
        if (d.frequency < b.length()) {
          const w = c[x.current];
          w.visible = !0, w.position.set(
            I.x * (L.width / 2),
            I.y * (L.height / 2),
            0
          ), w.scale.x = w.scale.y = 0, w.material.opacity = d.alpha, x.current = (x.current + 1) % o;
        }
        return c.forEach((w) => {
          if (w.visible) {
            const N = w.material;
            w.rotation.z += d.rotation, N.opacity *= d.fadeout_speed, w.scale.x = d.fadeout_speed * w.scale.x + d.scale, w.scale.y = w.scale.x, N.opacity < 2e-3 && (w.visible = !1);
          }
        }), f(_);
      },
      [f, c, l, o, d, g]
    ),
    g,
    {
      scene: v,
      camera: n,
      meshArr: c,
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
  const i = p(() => new t.PlaneGeometry(2, 2), []), e = p(
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
  ), s = O(u, o);
  return C(() => {
    e.uniforms.uResolution.value = s.clone();
  }, [s, e]), F(r, i, e), e;
}, He = {
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
}, Ut = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = Xe({ scene: i, size: r, dpr: u }), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    dpr: u,
    size: r,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = P(He);
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "uTexture0", n.texture0), a(e, "uTexture1", n.texture1), a(e, "uTextureResolution", n.textureResolution), a(e, "padding", n.padding), a(e, "uMap", n.map), a(e, "mapIntensity", n.mapIntensity), a(e, "edgeIntensity", n.edgeIntensity), a(e, "epicenter", n.epicenter), a(e, "progress", n.progress), a(e, "dirX", n.dir.x), a(e, "dirY", n.dir.y), c(g);
      },
      [c, e, n, l]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Ye = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ke = `precision highp float;
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
const qe = (r) => {
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
      vertexShader: Ye,
      fragmentShader: ke
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
}, Ft = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = qe(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(Ke);
  return [
    y(
      (f, d) => {
        const { gl: g, clock: x } = f;
        return d && l(d), a(e, "scale", n.scale), a(e, "timeStrength", n.timeStrength), a(e, "noiseOctaves", n.noiseOctaves), a(e, "fbmOctaves", n.fbmOctaves), a(e, "warpOctaves", n.warpOctaves), a(e, "warpDirection", n.warpDirection), a(e, "warpStrength", n.warpStrength), a(e, "uTime", x.getElapsedTime()), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
}, W = process.env.NODE_ENV === "development", Ze = (r) => {
  var e, s, v;
  const u = (e = r.dom) == null ? void 0 : e.length, o = (s = r.texture) == null ? void 0 : s.length, i = (v = r.resolution) == null ? void 0 : v.length;
  return !u || !o || !i ? (W && console.warn("No dom or texture or resolution is set"), !1) : u !== o || u !== i ? (W && console.warn("not Match dom , texture and resolution length"), !1) : !0;
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
  o.children.length > 0 && (o.children.forEach((i) => {
    i instanceof t.Mesh && (i.geometry.dispose(), i.material.dispose());
  }), o.remove(...o.children)), r.texture.forEach((i, e) => {
    const s = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: Je,
        fragmentShader: Qe,
        transparent: !0,
        uniforms: {
          u_texture: { value: i },
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
  const r = T([]), u = T([]);
  return y(
    ({
      isIntersectingRef: i,
      isIntersectingOnceRef: e,
      params: s
    }) => {
      r.current.length > 0 && r.current.forEach((c, n) => {
        c.unobserve(u.current[n]);
      }), u.current = [], r.current = [];
      const v = new Array(s.dom.length).fill(!1);
      i.current = [...v], e.current = [...v], s.dom.forEach((c, n) => {
        const l = (f) => {
          f.forEach((d) => {
            s.onIntersect[n] && s.onIntersect[n](d), i.current[n] = d.isIntersecting;
          });
        }, m = new IntersectionObserver(l, {
          rootMargin: "0px",
          threshold: 0
        });
        m.observe(c), r.current.push(m), u.current.push(c);
      });
    },
    []
  );
}, nt = () => {
  const r = T([]), u = y(
    ({ params: o, size: i, resolutionRef: e, scene: s, isIntersectingRef: v }) => {
      s.children.length !== r.current.length && (r.current = new Array(s.children.length)), s.children.forEach((c, n) => {
        const l = o.dom[n];
        if (!l) {
          W && console.warn("DOM is null.");
          return;
        }
        const m = l.getBoundingClientRect();
        if (r.current[n] = m, c.scale.set(m.width, m.height, 1), c.position.set(
          m.left + m.width * 0.5 - i.width * 0.5,
          -m.top - m.height * 0.5 + i.height * 0.5,
          0
        ), v.current[n] && (o.rotation[n] && c.rotation.copy(o.rotation[n]), c instanceof t.Mesh)) {
          const f = c.material;
          a(f, "u_texture", o.texture[n]), a(
            f,
            "u_textureResolution",
            o.resolution[n]
          ), a(
            f,
            "u_resolution",
            e.current.set(m.width, m.height)
          ), a(
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
  const r = T([]), u = T([]), o = y((i, e = !1) => {
    r.current.forEach((v, c) => {
      v && (u.current[c] = !0);
    });
    const s = e ? [...u.current] : [...r.current];
    return i < 0 ? s : s[i];
  }, []);
  return {
    isIntersectingRef: r,
    isIntersectingOnceRef: u,
    isIntersecting: o
  };
}, ot = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, At = ({ size: r, dpr: u, samples: o = 0 }, i = []) => {
  const e = p(() => new t.Scene(), []), s = V(r), [v, c] = R({
    scene: e,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = P(ot), [m, f] = nt(), d = T(new t.Vector2(0, 0)), [g, x] = ue(!0);
  C(() => {
    x(!0);
  }, i);
  const h = tt(), { isIntersectingOnceRef: S, isIntersectingRef: D, isIntersecting: _ } = rt();
  return [
    y(
      (L, I) => {
        const { gl: b, size: w } = L;
        return I && l(I), Ze(n) && (g && (et({
          params: n,
          size: w,
          scene: e
        }), h({
          isIntersectingRef: D,
          isIntersectingOnceRef: S,
          params: n
        }), x(!1)), f({
          params: n,
          size: w,
          resolutionRef: d,
          scene: e,
          isIntersectingRef: D
        })), c(b);
      },
      [
        c,
        l,
        h,
        f,
        g,
        e,
        n,
        S,
        D
      ]
    ),
    l,
    {
      scene: e,
      camera: s,
      renderTarget: v,
      output: v.texture,
      isIntersecting: _,
      DOMRects: m,
      intersections: D.current
    }
  ];
};
var at = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, it = `precision mediump float;

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
const ut = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: at,
      fragmentShader: it
    }),
    []
  );
  return F(r, u, o), o;
}, st = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, Bt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ut(i), s = V(r), v = p(
    () => ({
      scene: i,
      camera: s,
      size: r,
      dpr: u,
      samples: o
    }),
    [i, s, r, u, o]
  ), [c, n] = R(v), [l, m] = E(v), [f, d] = P(st);
  return [
    y(
      (x, h) => {
        const { gl: S } = x;
        h && d(h), a(e, "uTexture", f.texture), a(e, "uResolution", [
          f.texture.source.data.width,
          f.texture.source.data.height
        ]), a(e, "uBlurSize", f.blurSize);
        let D = m(S);
        const _ = f.blurPower;
        for (let U = 0; U < _; U++)
          a(e, "uTexture", D), D = m(S);
        return n(S);
      },
      [n, m, e, d, f]
    ),
    d,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: c,
      output: c.texture
    }
  ];
};
var lt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ct = `precision highp float;

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
const vt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new t.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uMode: { value: 0 }
      },
      vertexShader: lt,
      fragmentShader: ct
    }),
    []
  );
  return F(r, u, o), o;
}, dt = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, It = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = vt(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = P(dt);
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "uEpicenter", n.epicenter), a(e, "uProgress", n.progress), a(e, "uWidth", n.width), a(e, "uStrength", n.strength), a(
          e,
          "uMode",
          n.mode === "center" ? 0 : n.mode === "horizontal" ? 1 : 2
        ), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var ft = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, mt = `precision highp float;

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
const pt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: ft,
      fragmentShader: mt
    }),
    []
  );
  return F(r, u, o), o;
}, gt = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Ot = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = pt(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(
    gt
  );
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "u_texture", n.texture), a(e, "u_brightness", n.brightness), a(e, "u_min", n.min), a(e, "u_max", n.max), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var xt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ht = `precision highp float;
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
const yt = (r) => {
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
      vertexShader: xt,
      fragmentShader: ht
    }),
    []
  );
  return F(r, u, o), o;
}, wt = {
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
}, Lt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = yt(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(wt);
  return [
    y(
      (f, d) => {
        const { gl: g, clock: x } = f;
        return d && l(d), n.texture ? (a(e, "uTexture", n.texture), a(e, "isTexture", !0)) : (a(e, "isTexture", !1), a(e, "scale", n.scale)), n.noise ? (a(e, "noise", n.noise), a(e, "isNoise", !0), a(e, "noiseStrength", n.noiseStrength)) : a(e, "isNoise", !1), a(e, "uTime", x.getElapsedTime()), a(e, "laminateLayer", n.laminateLayer), a(e, "laminateInterval", n.laminateInterval), a(e, "laminateDetail", n.laminateDetail), a(e, "distortion", n.distortion), a(e, "colorFactor", n.colorFactor), a(e, "timeStrength", n.timeStrength), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
};
var Tt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, St = `precision highp float;

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
const _t = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Tt,
      fragmentShader: St
    }),
    []
  );
  return F(r, u, o), o;
}, Mt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, zt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = _t(i), s = V(r), [v, c] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = P(Mt);
  return [
    y(
      (f, d) => {
        const { gl: g } = f;
        return d && l(d), a(e, "u_texture", n.texture), a(e, "u_map", n.map), a(e, "u_mapIntensity", n.mapIntensity), c(g);
      },
      [c, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v,
      output: v.texture
    }
  ];
}, Et = ({
  scene: r,
  camera: u,
  size: o,
  dpr: i = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: v = !1,
  depthTexture: c = !1
}, n) => {
  const l = T([]), m = O(o, i);
  l.current = p(() => Array.from({ length: n }, () => {
    const d = new t.WebGLRenderTarget(
      m.x,
      m.y,
      {
        ...$,
        samples: s,
        depthBuffer: v
      }
    );
    return c && (d.depthTexture = new t.DepthTexture(
      m.x,
      m.y,
      t.FloatType
    )), d;
  }), [n]), X(() => {
    e && l.current.forEach(
      (d) => d.setSize(m.x, m.y)
    );
  }, [m, e]), C(() => {
    const d = l.current;
    return () => {
      d.forEach((g) => g.dispose());
    };
  }, [n]);
  const f = y(
    (d, g, x) => {
      const h = l.current[g];
      return Y({
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
  gt as BRIGHTNESSPICKER_PARAMS,
  de as BRUSH_PARAMS,
  wt as COLORSTRATA_PARAMS,
  ot as DOMSYNCER_PARAMS,
  ge as DUOTONE_PARAMS,
  $e as FLUID_PARAMS,
  Mt as FXBLENDING_PARAMS,
  He as FXTEXTURE_PARAMS,
  Ke as NOISE_PARAMS,
  Ge as RIPPLE_PARAMS,
  st as SIMPLEBLUR_PARAMS,
  dt as WAVE_PARAMS,
  a as setUniform,
  F as useAddMesh,
  Rt as useBlending,
  Ot as useBrightnessPicker,
  bt as useBrush,
  V as useCamera,
  Lt as useColorStrata,
  Et as useCopyTexture,
  At as useDomSyncer,
  E as useDoubleFBO,
  Ct as useDuoTone,
  Vt as useFluid,
  zt as useFxBlending,
  Ut as useFxTexture,
  Ft as useNoise,
  P as useParams,
  H as usePointer,
  O as useResolution,
  Pt as useRipple,
  Bt as useSimpleBlur,
  R as useSingleFBO,
  It as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
