import * as t from "three";
import { useMemo as p, useEffect as C, useRef as T, useCallback as y, useLayoutEffect as X, useState as ie } from "react";
var ue = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, se = `precision highp float;

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
const z = (r, u = !1) => {
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
}, le = ({
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
      vertexShader: ue,
      fragmentShader: se
    }),
    []
  ), s = z(u, o);
  return C(() => {
    a(e, "uAspect", s.width / s.height), a(e, "uResolution", s.clone());
  }, [s, e]), F(r, i, e), e;
}, ce = (r, u) => {
  const o = u, i = r / u, [e, s] = [o * i / 2, o / 2];
  return { width: e, height: s, near: -1e3, far: 1e3 };
}, P = (r) => {
  const u = z(r), { width: o, height: i, near: e, far: s } = ce(
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
  return y((d) => {
    const v = performance.now(), n = d.clone();
    o.current === 0 && (o.current = v, r.current = n);
    const l = Math.max(1, v - o.current);
    o.current = v, i.current.copy(n).sub(r.current).divideScalar(l);
    const m = i.current.length() > 0, f = e.current ? r.current.clone() : n;
    return !e.current && m && (e.current = !0), r.current = n, {
      currentPointer: n,
      prevPointer: f,
      diffPointer: u.current.subVectors(n, f),
      velocity: i.current,
      isVelocityUpdate: m
    };
  }, []);
}, V = (r) => {
  const o = T(
    ((e) => Object.values(e).some((s) => typeof s == "function"))(r) ? r : structuredClone(r)
  ), i = y((e) => {
    for (const s in e) {
      const d = s;
      d in o.current && e[d] !== void 0 && e[d] !== null ? o.current[d] = e[d] : console.error(
        `"${String(
          d
        )}" does not exist in the params. or "${String(
          d
        )}" is null | undefined`
      );
    }
  }, []);
  return [o.current, i];
}, N = {
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
  depthBuffer: d = !1,
  depthTexture: v = !1
}) => {
  const n = T(), l = z(o, i);
  n.current = p(
    () => {
      const f = new t.WebGLRenderTarget(
        l.x,
        l.y,
        {
          ...N,
          samples: s,
          depthBuffer: d
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
    (f, c) => {
      const x = n.current;
      return Y({
        gl: f,
        fbo: x,
        scene: r,
        camera: u,
        onBeforeRender: () => c && c({ read: x.texture })
      }), x.texture;
    },
    [r, u]
  );
  return [n.current, m];
}, $ = ({
  scene: r,
  camera: u,
  size: o,
  dpr: i = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: d = !1,
  depthTexture: v = !1
}) => {
  const n = T({
    read: null,
    write: null,
    swap: function() {
      let c = this.read;
      this.read = this.write, this.write = c;
    }
  }), l = z(o, i), m = p(() => {
    const c = new t.WebGLRenderTarget(l.x, l.y, {
      ...N,
      samples: s,
      depthBuffer: d
    }), x = new t.WebGLRenderTarget(l.x, l.y, {
      ...N,
      samples: s,
      depthBuffer: d
    });
    return v && (c.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    ), x.depthTexture = new t.DepthTexture(
      l.x,
      l.y,
      t.FloatType
    )), { read: c, write: x };
  }, []);
  n.current.read = m.read, n.current.write = m.write, X(() => {
    var c, x;
    e && ((c = n.current.read) == null || c.setSize(l.x, l.y), (x = n.current.write) == null || x.setSize(l.x, l.y));
  }, [l, e]), C(() => {
    const c = n.current;
    return () => {
      var x, g;
      (x = c.read) == null || x.dispose(), (g = c.write) == null || g.dispose();
    };
  }, []);
  const f = y(
    (c, x) => {
      var h;
      const g = n.current;
      return Y({
        gl: c,
        scene: r,
        camera: u,
        fbo: g.write,
        onBeforeRender: () => x && x({
          read: g.read.texture,
          write: g.write.texture
        }),
        onSwap: () => g.swap()
      }), (h = g.read) == null ? void 0 : h.texture;
    },
    [r, u]
  );
  return [
    { read: n.current.read, write: n.current.write },
    f
  ];
}, ve = {
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
  const i = p(() => new t.Scene(), []), e = le({ scene: i, size: r, dpr: u }), s = P(r), d = H(), [v, n] = $({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [l, m] = V(ve);
  return [
    y(
      (c, x) => {
        const { gl: g, pointer: h } = c;
        x && m(x), a(e, "uTexture", l.texture), a(e, "uRadius", l.radius), a(e, "uSmudge", l.smudge), a(e, "uDissipation", l.dissipation), a(e, "uMotionBlur", l.motionBlur), a(e, "uMotionSample", l.motionSample), a(e, "uColor", l.color);
        const { currentPointer: w, prevPointer: M, velocity: S } = d(h);
        return a(e, "uMouse", w), a(e, "uPrevMouse", M), a(e, "uVelocity", S), n(g, ({ read: U }) => {
          a(e, "uMap", U);
        });
      },
      [e, d, n, l, m]
    ),
    m,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v
    }
  ];
};
var de = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, fe = `precision highp float;

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
const me = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: de,
      fragmentShader: fe
    }),
    []
  );
  return F(r, u, o), o;
}, pe = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Dt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = me(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(pe);
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "uTexture", n.texture), a(e, "uColor0", n.color0), a(e, "uColor1", n.color1), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
};
var xe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ge = `precision highp float;

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
const he = (r) => {
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
      fragmentShader: ge
    }),
    []
  );
  return F(r, u, o), o;
}, ye = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, Ct = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = he(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(ye);
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "u_texture", n.texture), a(e, "u_map", n.map), a(e, "u_mapIntensity", n.mapIntensity), n.alphaMap ? (a(e, "u_alphaMap", n.alphaMap), a(e, "u_isAlphaMap", !0)) : a(e, "u_isAlphaMap", !1), a(e, "u_brightness", n.brightness), a(e, "u_min", n.min), a(e, "u_max", n.max), n.dodgeColor ? (a(e, "u_dodgeColor", n.dodgeColor), a(e, "u_isDodgeColor", !0)) : a(e, "u_isDodgeColor", !1), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
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
const we = () => p(
  () => new t.ShaderMaterial({
    vertexShader: I,
    fragmentShader: Te,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Se = `precision highp float;

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
const _e = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: I,
    fragmentShader: Se
  }),
  []
);
var Me = `precision highp float;

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
    fragmentShader: Me
  }),
  []
);
var De = `precision highp float;

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
const Ce = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: De
  }),
  []
);
var Re = `precision highp float;

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
    fragmentShader: Re
  }),
  []
);
var Ve = `precision highp float;

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
const Ue = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ve
  }),
  []
);
var Fe = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ae = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Fe
  }),
  []
);
var Be = `precision highp float;

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
const Ie = () => p(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Be
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
const Le = () => p(
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
    fragmentShader: Oe
  }),
  []
), ze = ({
  scene: r,
  size: u,
  dpr: o
}) => {
  const i = p(() => new t.PlaneGeometry(2, 2), []), e = we(), s = e.clone(), d = Pe(), v = Ue(), n = _e(), l = be(), m = Ce(), f = Ae(), c = Ie(), x = Le(), g = p(
    () => ({
      vorticityMaterial: v,
      curlMaterial: d,
      advectionMaterial: n,
      divergenceMaterial: l,
      pressureMaterial: m,
      clearMaterial: f,
      gradientSubtractMaterial: c,
      splatMaterial: x
    }),
    [
      v,
      d,
      n,
      l,
      m,
      f,
      c,
      x
    ]
  ), h = z(u, o);
  C(() => {
    a(
      g.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const S of Object.values(g))
      a(
        S,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, g]);
  const w = F(r, i, e);
  C(() => {
    e.dispose(), w.material = s;
  }, [e, w, s]), C(() => () => {
    for (const S of Object.values(g))
      S.dispose();
  }, [g]);
  const M = y(
    (S) => {
      w.material = S, w.material.needsUpdate = !0;
    },
    [w]
  );
  return [g, M];
}, Ee = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1)
}, Rt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), [e, s] = ze({ scene: i, size: r, dpr: u }), d = P(r), v = H(), n = p(
    () => ({
      scene: i,
      camera: d,
      size: r,
      samples: o
    }),
    [i, d, r, o]
  ), [l, m] = $(n), [f, c] = $(n), [x, g] = R(n), [h, w] = R(n), [M, S] = $(n), B = T(0), U = T(new t.Vector2(0, 0)), O = T(new t.Vector3(0, 0, 0)), [b, L] = V(Ee);
  return [
    y(
      (G, k) => {
        const { gl: A, pointer: J, clock: j, size: q } = G;
        k && L(k), B.current === 0 && (B.current = j.getElapsedTime());
        const K = Math.min(
          (j.getElapsedTime() - B.current) / 3,
          0.02
        );
        B.current = j.getElapsedTime();
        const W = m(A, ({ read: _ }) => {
          s(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", _), a(e.advectionMaterial, "uSource", _), a(e.advectionMaterial, "dt", K), a(
            e.advectionMaterial,
            "dissipation",
            b.velocity_dissipation
          );
        }), Q = c(A, ({ read: _ }) => {
          s(e.advectionMaterial), a(e.advectionMaterial, "uVelocity", W), a(e.advectionMaterial, "uSource", _), a(
            e.advectionMaterial,
            "dissipation",
            b.density_dissipation
          );
        }), { currentPointer: ee, diffPointer: te, isVelocityUpdate: ne, velocity: re } = v(J);
        ne && (m(A, ({ read: _ }) => {
          s(e.splatMaterial), a(e.splatMaterial, "uTarget", _), a(e.splatMaterial, "point", ee);
          const E = te.multiply(
            U.current.set(q.width, q.height).multiplyScalar(b.velocity_acceleration)
          );
          a(
            e.splatMaterial,
            "color",
            O.current.set(E.x, E.y, 1)
          ), a(
            e.splatMaterial,
            "radius",
            b.splat_radius
          );
        }), c(A, ({ read: _ }) => {
          s(e.splatMaterial), a(e.splatMaterial, "uTarget", _);
          const E = typeof b.fluid_color == "function" ? b.fluid_color(re) : b.fluid_color;
          a(e.splatMaterial, "color", E);
        }));
        const oe = g(A, () => {
          s(e.curlMaterial), a(e.curlMaterial, "uVelocity", W);
        });
        m(A, ({ read: _ }) => {
          s(e.vorticityMaterial), a(e.vorticityMaterial, "uVelocity", _), a(e.vorticityMaterial, "uCurl", oe), a(
            e.vorticityMaterial,
            "curl",
            b.curl_strength
          ), a(e.vorticityMaterial, "dt", K);
        });
        const ae = w(A, () => {
          s(e.divergenceMaterial), a(e.divergenceMaterial, "uVelocity", W);
        });
        S(A, ({ read: _ }) => {
          s(e.clearMaterial), a(e.clearMaterial, "uTexture", _), a(
            e.clearMaterial,
            "value",
            b.pressure_dissipation
          );
        }), s(e.pressureMaterial), a(e.pressureMaterial, "uDivergence", ae);
        let Z;
        for (let _ = 0; _ < b.pressure_iterations; _++)
          Z = S(A, ({ read: E }) => {
            a(e.pressureMaterial, "uPressure", E);
          });
        return m(A, ({ read: _ }) => {
          s(e.gradientSubtractMaterial), a(
            e.gradientSubtractMaterial,
            "uPressure",
            Z
          ), a(e.gradientSubtractMaterial, "uVelocity", _);
        }), Q;
      },
      [
        e,
        s,
        g,
        c,
        w,
        v,
        S,
        m,
        L,
        b
      ]
    ),
    L,
    {
      scene: i,
      materials: e,
      camera: d,
      renderTarget: {
        velocity: l,
        density: f,
        curl: x,
        divergence: h,
        pressure: M
      }
    }
  ];
}, $e = ({ scale: r, max: u, texture: o, scene: i }) => {
  const e = T([]), s = p(
    () => new t.PlaneGeometry(r, r),
    [r]
  ), d = p(
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
    for (let v = 0; v < u; v++) {
      const n = new t.Mesh(s.clone(), d.clone());
      n.rotateZ(2 * Math.PI * Math.random()), n.visible = !1, i.add(n), e.current.push(n);
    }
  }, [s, d, i, u]), C(() => () => {
    e.current.forEach((v) => {
      v.geometry.dispose(), Array.isArray(v.material) ? v.material.forEach((n) => n.dispose()) : v.material.dispose(), i.remove(v);
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
  const d = p(() => new t.Scene(), []), v = $e({
    scale: u,
    max: o,
    texture: r,
    scene: d
  }), n = P(i), l = H(), [m, f] = R({
    scene: d,
    camera: n,
    size: i,
    dpr: e,
    samples: s
  }), [c, x] = V(Ge), g = T(0);
  return [
    y(
      (w, M) => {
        const { gl: S, pointer: B, size: U } = w;
        M && x(M);
        const { currentPointer: O, diffPointer: b } = l(B);
        if (c.frequency < b.length()) {
          const D = v[g.current];
          D.visible = !0, D.position.set(
            O.x * (U.width / 2),
            O.y * (U.height / 2),
            0
          ), D.scale.x = D.scale.y = 0, D.material.opacity = c.alpha, g.current = (g.current + 1) % o;
        }
        return v.forEach((D) => {
          if (D.visible) {
            const G = D.material;
            D.rotation.z += c.rotation, G.opacity *= c.fadeout_speed, D.scale.x = c.fadeout_speed * D.scale.x + c.scale, D.scale.y = D.scale.x, G.opacity < 2e-3 && (D.visible = !1);
          }
        }), f(S);
      },
      [f, v, l, o, c, x]
    ),
    x,
    {
      scene: d,
      camera: n,
      meshArr: v,
      renderTarget: m
    }
  ];
};
var Ne = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, je = `precision highp float;

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
const We = ({
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
      vertexShader: Ne,
      fragmentShader: je
    }),
    []
  ), s = z(u, o);
  return C(() => {
    e.uniforms.uResolution.value = s.clone();
  }, [s, e]), F(r, i, e), e;
}, Xe = {
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
}, Vt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = We({ scene: i, size: r, dpr: u }), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    dpr: u,
    size: r,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = V(Xe);
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "uTexture0", n.texture0), a(e, "uTexture1", n.texture1), a(e, "uTextureResolution", n.textureResolution), a(e, "padding", n.padding), a(e, "uMap", n.map), a(e, "mapIntensity", n.mapIntensity), a(e, "edgeIntensity", n.edgeIntensity), a(e, "epicenter", n.epicenter), a(e, "progress", n.progress), a(e, "dirX", n.dir.x), a(e, "dirY", n.dir.y), v(x);
      },
      [v, e, n, l]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
};
var He = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ye = `precision highp float;
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
      vertexShader: He,
      fragmentShader: Ye
    }),
    []
  );
  return F(r, u, o), o;
}, qe = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, Ut = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ke(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(qe);
  return [
    y(
      (f, c) => {
        const { gl: x, clock: g } = f;
        return c && l(c), a(e, "scale", n.scale), a(e, "timeStrength", n.timeStrength), a(e, "noiseOctaves", n.noiseOctaves), a(e, "fbmOctaves", n.fbmOctaves), a(e, "warpOctaves", n.warpOctaves), a(e, "warpDirection", n.warpDirection), a(e, "warpStrength", n.warpStrength), a(e, "uTime", g.getElapsedTime()), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
}, Ke = (r) => {
  var e, s, d;
  const u = (e = r.dom) == null ? void 0 : e.length, o = (s = r.texture) == null ? void 0 : s.length, i = (d = r.resolution) == null ? void 0 : d.length;
  if (!u || !o || !i)
    throw new Error("No dom or texture or resolution is set");
  if (u !== o || u !== i)
    throw new Error("Match dom, texture and resolution length");
};
var Ze = `varying vec2 vUv;

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
const Qe = ({
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
        vertexShader: Ze,
        fragmentShader: Je,
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
}, et = () => {
  const r = T([]), u = T([]);
  return y(
    ({
      isIntersectingRef: i,
      isIntersectingOnceRef: e,
      params: s
    }) => {
      r.current.length > 0 && r.current.forEach((v, n) => {
        v.unobserve(u.current[n]);
      }), u.current = [], r.current = [];
      const d = new Array(s.dom.length).fill(!1);
      i.current = [...d], e.current = [...d], s.dom.forEach((v, n) => {
        const l = (f) => {
          f.forEach((c) => {
            s.onIntersect[n] && s.onIntersect[n](c), i.current[n] = c.isIntersecting;
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
}, tt = () => {
  const r = T([]), u = y(
    ({ params: o, size: i, resolutionRef: e, scene: s, isIntersectingRef: d }) => {
      s.children.length !== r.current.length && (r.current = new Array(s.children.length)), s.children.forEach((v, n) => {
        const l = o.dom[n];
        if (!l)
          throw new Error("DOM is null.");
        const m = l.getBoundingClientRect();
        if (r.current[n] = m, v.scale.set(m.width, m.height, 1), v.position.set(
          m.left + m.width * 0.5 - i.width * 0.5,
          -m.top - m.height * 0.5 + i.height * 0.5,
          0
        ), d.current[n] && (o.rotation[n] && v.rotation.copy(o.rotation[n]), v instanceof t.Mesh)) {
          const f = v.material;
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
}, nt = () => {
  const r = T([]), u = T([]), o = y((i, e = !1) => {
    r.current.forEach((d, v) => {
      d && (u.current[v] = !0);
    });
    const s = e ? [...u.current] : [...r.current];
    return i < 0 ? s : s[i];
  }, []);
  return {
    isIntersectingRef: r,
    isIntersectingOnceRef: u,
    isIntersecting: o
  };
}, rt = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Ft = ({ size: r, dpr: u, samples: o = 0 }, i = []) => {
  const e = p(() => new t.Scene(), []), s = P(r), [d, v] = R({
    scene: e,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = V(rt), [m, f] = tt(), c = T(new t.Vector2(0, 0)), [x, g] = ie(!0);
  C(() => {
    g(!0);
  }, i);
  const h = et(), { isIntersectingOnceRef: w, isIntersectingRef: M, isIntersecting: S } = nt();
  return [
    y(
      (U, O) => {
        const { gl: b, size: L } = U;
        return O && l(O), Ke(n), x && (Qe({
          params: n,
          size: L,
          scene: e
        }), h({
          isIntersectingRef: M,
          isIntersectingOnceRef: w,
          params: n
        }), g(!1)), f({
          params: n,
          size: L,
          resolutionRef: c,
          scene: e,
          isIntersectingRef: M
        }), v(b);
      },
      [
        v,
        l,
        h,
        f,
        x,
        e,
        n,
        w,
        M
      ]
    ),
    l,
    {
      scene: e,
      camera: s,
      renderTarget: d,
      isIntersecting: S,
      DOMRects: m
    }
  ];
};
var ot = `precision mediump float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, at = `precision mediump float;

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
const it = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: ot,
      fragmentShader: at
    }),
    []
  );
  return F(r, u, o), o;
}, ut = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, At = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = it(i), s = P(r), d = p(
    () => ({
      scene: i,
      camera: s,
      size: r,
      dpr: u,
      samples: o
    }),
    [i, s, r, u, o]
  ), [v, n] = R(d), [l, m] = $(d), [f, c] = V(ut);
  return [
    y(
      (g, h) => {
        const { gl: w } = g;
        h && c(h), a(e, "uTexture", f.texture), a(e, "uResolution", [
          f.texture.source.data.width,
          f.texture.source.data.height
        ]), a(e, "uBlurSize", f.blurSize);
        let M = m(w);
        const S = f.blurPower;
        for (let U = 0; U < S; U++)
          a(e, "uTexture", M), M = m(w);
        return n(w);
      },
      [n, m, e, c, f]
    ),
    c,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: v
    }
  ];
};
var st = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, lt = `precision highp float;

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
const ct = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new t.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uMode: { value: 0 }
      },
      vertexShader: st,
      fragmentShader: lt
    }),
    []
  );
  return F(r, u, o), o;
}, vt = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Bt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ct(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o,
    isSizeUpdate: !0
  }), [n, l] = V(vt);
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "uEpicenter", n.epicenter), a(e, "uProgress", n.progress), a(e, "uWidth", n.width), a(e, "uStrength", n.strength), a(
          e,
          "uMode",
          n.mode === "center" ? 0 : n.mode === "horizontal" ? 1 : 2
        ), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
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
const mt = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: dt,
      fragmentShader: ft
    }),
    []
  );
  return F(r, u, o), o;
}, pt = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, It = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = mt(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(
    pt
  );
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "u_texture", n.texture), a(e, "u_brightness", n.brightness), a(e, "u_min", n.min), a(e, "u_max", n.max), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
};
var xt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, gt = `precision highp float;
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
const ht = (r) => {
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
      fragmentShader: gt
    }),
    []
  );
  return F(r, u, o), o;
}, yt = {
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
}, Ot = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = ht(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(yt);
  return [
    y(
      (f, c) => {
        const { gl: x, clock: g } = f;
        return c && l(c), n.texture ? (a(e, "uTexture", n.texture), a(e, "isTexture", !0)) : (a(e, "isTexture", !1), a(e, "scale", n.scale)), n.noise ? (a(e, "noise", n.noise), a(e, "isNoise", !0), a(e, "noiseStrength", n.noiseStrength)) : a(e, "isNoise", !1), a(e, "uTime", g.getElapsedTime()), a(e, "laminateLayer", n.laminateLayer), a(e, "laminateInterval", n.laminateInterval), a(e, "laminateDetail", n.laminateDetail), a(e, "distortion", n.distortion), a(e, "colorFactor", n.colorFactor), a(e, "timeStrength", n.timeStrength), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
};
var Tt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, wt = `precision highp float;

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
const St = (r) => {
  const u = p(() => new t.PlaneGeometry(2, 2), []), o = p(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: Tt,
      fragmentShader: wt
    }),
    []
  );
  return F(r, u, o), o;
}, _t = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Lt = ({
  size: r,
  dpr: u,
  samples: o = 0
}) => {
  const i = p(() => new t.Scene(), []), e = St(i), s = P(r), [d, v] = R({
    scene: i,
    camera: s,
    size: r,
    dpr: u,
    samples: o
  }), [n, l] = V(_t);
  return [
    y(
      (f, c) => {
        const { gl: x } = f;
        return c && l(c), a(e, "u_texture", n.texture), a(e, "u_map", n.map), a(e, "u_mapIntensity", n.mapIntensity), v(x);
      },
      [v, e, l, n]
    ),
    l,
    {
      scene: i,
      material: e,
      camera: s,
      renderTarget: d
    }
  ];
}, zt = ({
  scene: r,
  camera: u,
  size: o,
  dpr: i = !1,
  isSizeUpdate: e = !1,
  samples: s = 0,
  depthBuffer: d = !1,
  depthTexture: v = !1
}, n) => {
  const l = T([]), m = z(o, i);
  l.current = p(() => Array.from({ length: n }, () => {
    const c = new t.WebGLRenderTarget(
      m.x,
      m.y,
      {
        ...N,
        samples: s,
        depthBuffer: d
      }
    );
    return v && (c.depthTexture = new t.DepthTexture(
      m.x,
      m.y,
      t.FloatType
    )), c;
  }), [n]), X(() => {
    e && l.current.forEach(
      (c) => c.setSize(m.x, m.y)
    );
  }, [m, e]), C(() => {
    const c = l.current;
    return () => {
      c.forEach((x) => x.dispose());
    };
  }, [n]);
  const f = y(
    (c, x, g) => {
      const h = l.current[x];
      return Y({
        gl: c,
        scene: r,
        camera: u,
        fbo: h,
        onBeforeRender: () => g && g({ read: h.texture })
      }), h.texture;
    },
    [r, u]
  );
  return [l.current, f];
};
export {
  ye as BLENDING_PARAMS,
  pt as BRIGHTNESSPICKER_PARAMS,
  ve as BRUSH_PARAMS,
  yt as COLORSTRATA_PARAMS,
  rt as DOMSYNCER_PARAMS,
  pe as DUOTONE_PARAMS,
  Ee as FLUID_PARAMS,
  _t as FXBLENDING_PARAMS,
  Xe as FXTEXTURE_PARAMS,
  qe as NOISE_PARAMS,
  Ge as RIPPLE_PARAMS,
  ut as SIMPLEBLUR_PARAMS,
  vt as WAVE_PARAMS,
  a as setUniform,
  F as useAddMesh,
  Ct as useBlending,
  It as useBrightnessPicker,
  bt as useBrush,
  P as useCamera,
  Ot as useColorStrata,
  zt as useCopyTexture,
  Ft as useDomSyncer,
  $ as useDoubleFBO,
  Dt as useDuoTone,
  Rt as useFluid,
  Lt as useFxBlending,
  Vt as useFxTexture,
  Ut as useNoise,
  V as useParams,
  H as usePointer,
  z as useResolution,
  Pt as useRipple,
  At as useSimpleBlur,
  R as useSingleFBO,
  Bt as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
