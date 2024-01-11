import * as t from "three";
import { useMemo as f, useEffect as R, useRef as w, useLayoutEffect as j, useCallback as h, useState as oe } from "react";
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
const O = (o, u = !1) => {
  const r = u ? o.width * u : o.width, e = u ? o.height * u : o.height;
  return f(
    () => new t.Vector2(r, e),
    [r, e]
  );
}, F = (o, u, r) => {
  const e = f(
    () => new t.Mesh(u, r),
    [u, r]
  );
  return R(() => {
    o.add(e);
  }, [o, e]), R(() => () => {
    o.remove(e), u.dispose(), r.dispose();
  }, [o, u, r, e]), e;
}, i = (o, u, r) => {
  o.uniforms && o.uniforms[u] && r !== void 0 && r !== null ? o.uniforms[u].value = r : console.error(
    `Uniform key "${String(
      u
    )}" does not exist in the material. or "${String(
      u
    )}" is null | undefined`
  );
}, ue = ({
  scene: o,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
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
      vertexShader: ae,
      fragmentShader: ie
    }),
    []
  ), l = O(u, r);
  return R(() => {
    i(a, "uAspect", l.width / l.height), i(a, "uResolution", l.clone());
  }, [l, a]), F(o, e, a), a;
}, se = (o, u) => {
  const r = u, e = o / u, [a, l] = [r * e / 2, r / 2];
  return { width: a, height: l, near: -1e3, far: 1e3 };
}, V = (o) => {
  const u = O(o), { width: r, height: e, near: a, far: l } = se(
    u.x,
    u.y
  );
  return f(
    () => new t.OrthographicCamera(
      -r,
      r,
      e,
      -e,
      a,
      l
    ),
    [r, e, a, l]
  );
}, z = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  stencilBuffer: !1
}, C = ({
  scene: o,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1,
  samples: l = 0,
  depthBuffer: c = !1
}) => {
  const n = w(), s = O(r, e);
  n.current = f(
    () => new t.WebGLRenderTarget(s.x, s.y, {
      ...z,
      samples: l,
      depthBuffer: c
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), j(() => {
    var v;
    a && ((v = n.current) == null || v.setSize(s.x, s.y));
  }, [s, a]), R(() => {
    const v = n.current;
    return () => {
      v == null || v.dispose();
    };
  }, []);
  const p = h(
    (v, d) => {
      const m = n.current;
      return v.setRenderTarget(m), d && d({ read: m.texture }), v.render(o, u), v.setRenderTarget(null), v.clear(), m.texture;
    },
    [o, u]
  );
  return [n.current, p];
}, E = ({
  scene: o,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1,
  samples: l = 0,
  depthBuffer: c = !1
}) => {
  const n = w({
    read: null,
    write: null,
    swap: function() {
      let d = this.read;
      this.read = this.write, this.write = d;
    }
  }), s = O(r, e), p = f(() => {
    const d = new t.WebGLRenderTarget(s.x, s.y, {
      ...z,
      samples: l,
      depthBuffer: c
    }), m = new t.WebGLRenderTarget(s.x, s.y, {
      ...z,
      samples: l,
      depthBuffer: c
    });
    return { read: d, write: m };
  }, []);
  n.current.read = p.read, n.current.write = p.write, j(() => {
    var d, m;
    a && ((d = n.current.read) == null || d.setSize(s.x, s.y), (m = n.current.write) == null || m.setSize(s.x, s.y));
  }, [s, a]), R(() => {
    const d = n.current;
    return () => {
      var m, g;
      (m = d.read) == null || m.dispose(), (g = d.write) == null || g.dispose();
    };
  }, []);
  const v = h(
    (d, m) => {
      var x;
      const g = n.current;
      return d.setRenderTarget(g.write), m && m({
        read: g.read.texture,
        write: g.write.texture
      }), d.render(o, u), g.swap(), d.setRenderTarget(null), d.clear(), (x = g.read) == null ? void 0 : x.texture;
    },
    [o, u]
  );
  return [
    { read: n.current.read, write: n.current.write },
    v
  ];
}, W = () => {
  const o = w(new t.Vector2(0, 0)), u = w(new t.Vector2(0, 0)), r = w(0), e = w(new t.Vector2(0, 0)), a = w(!1);
  return h((c) => {
    const n = performance.now(), s = c.clone();
    r.current === 0 && (r.current = n, o.current = s);
    const p = Math.max(1, n - r.current);
    r.current = n, e.current.copy(s).sub(o.current).divideScalar(p);
    const v = e.current.length() > 0, d = a.current ? o.current.clone() : s;
    return !a.current && v && (a.current = !0), o.current = s, {
      currentPointer: s,
      prevPointer: d,
      diffPointer: u.current.subVectors(s, d),
      velocity: e.current,
      isVelocityUpdate: v
    };
  }, []);
}, P = (o) => {
  const r = w(
    ((a) => Object.values(a).some((l) => typeof l == "function"))(o) ? o : structuredClone(o)
  ), e = h((a) => {
    for (const l in a) {
      const c = l;
      c in r.current && a[c] !== void 0 && a[c] !== null ? r.current[c] = a[c] : console.error(
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
  texture: new t.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Color(16777215)
}, _t = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = ue({ scene: r, size: o, dpr: u }), a = V(o), l = W(), [c, n] = E({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [s, p] = P(le);
  return [
    h(
      (d, m) => {
        const { gl: g, pointer: x } = d;
        m && p(m), i(e, "uTexture", s.texture), i(e, "uRadius", s.radius), i(e, "uSmudge", s.smudge), i(e, "uDissipation", s.dissipation), i(e, "uMotionBlur", s.motionBlur), i(e, "uMotionSample", s.motionSample), i(e, "uColor", s.color);
        const { currentPointer: T, prevPointer: S, velocity: D } = l(x);
        return i(e, "uMouse", T), i(e, "uPrevMouse", S), i(e, "uVelocity", D), n(g, ({ read: U }) => {
          i(e, "uMap", U);
        });
      },
      [e, l, n, s, p]
    ),
    p,
    {
      scene: r,
      material: e,
      camera: a,
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
const de = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: ce,
      fragmentShader: ve
    }),
    []
  );
  return F(o, u, r), r;
}, fe = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Mt = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = de(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(fe);
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "uTexture", n.texture), i(e, "uColor0", n.color0), i(e, "uColor1", n.color1), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
};
var me = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, pe = `precision highp float;

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
const ge = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
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
      vertexShader: me,
      fragmentShader: pe
    }),
    []
  );
  return F(o, u, r), r;
}, xe = {
  texture: new t.Texture(),
  map: new t.Texture(),
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, bt = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = ge(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(xe);
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "u_texture", n.texture), i(e, "u_map", n.map), i(e, "u_mapIntensity", n.mapIntensity), n.alphaMap ? (i(e, "u_alphaMap", n.alphaMap), i(e, "u_isAlphaMap", !0)) : i(e, "u_isAlphaMap", !1), i(e, "u_brightness", n.brightness), i(e, "u_min", n.min), i(e, "u_max", n.max), n.dodgeColor ? (i(e, "u_dodgeColor", n.dodgeColor), i(e, "u_isDodgeColor", !0)) : i(e, "u_isDodgeColor", !1), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
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
}`, he = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const ye = () => f(
  () => new t.ShaderMaterial({
    vertexShader: I,
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
const we = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: I,
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
const _e = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
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
const be = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Me
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
const De = () => f(
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
const Ve = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ce
  }),
  []
);
var Pe = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ue = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Pe
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
const Be = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Fe
  }),
  []
);
var Ie = `precision highp float;

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
const Oe = () => f(
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
    fragmentShader: Ie
  }),
  []
), Ae = ({
  scene: o,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = ye(), l = a.clone(), c = De(), n = Ve(), s = we(), p = _e(), v = be(), d = Ue(), m = Be(), g = Oe(), x = f(
    () => ({
      vorticityMaterial: n,
      curlMaterial: c,
      advectionMaterial: s,
      divergenceMaterial: p,
      pressureMaterial: v,
      clearMaterial: d,
      gradientSubtractMaterial: m,
      splatMaterial: g
    }),
    [
      n,
      c,
      s,
      p,
      v,
      d,
      m,
      g
    ]
  ), T = O(u, r);
  R(() => {
    i(
      x.splatMaterial,
      "aspectRatio",
      T.x / T.y
    );
    for (const M of Object.values(x))
      i(
        M,
        "texelSize",
        new t.Vector2(1 / T.x, 1 / T.y)
      );
  }, [T, x]);
  const S = F(o, e, a);
  R(() => {
    a.dispose(), S.material = l;
  }, [a, S, l]), R(() => () => {
    for (const M of Object.values(x))
      M.dispose();
  }, [x]);
  const D = h(
    (M) => {
      S.material = M, S.material.needsUpdate = !0;
    },
    [S]
  );
  return [x, D];
}, Le = {
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new t.Vector3(1, 1, 1)
}, Rt = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), [e, a] = Ae({ scene: r, size: o, dpr: u }), l = V(o), c = W(), n = f(
    () => ({
      scene: r,
      camera: l,
      size: o
    }),
    [r, l, o]
  ), [s, p] = E(n), [v, d] = E(n), [m, g] = C(n), [x, T] = C(n), [S, D] = E(n), M = w(0), U = w(new t.Vector2(0, 0)), A = w(new t.Vector3(0, 0, 0)), [b, y] = P(Le);
  return [
    h(
      (q, X) => {
        const { gl: B, pointer: K, clock: G, size: H } = q;
        X && y(X), M.current === 0 && (M.current = G.getElapsedTime());
        const Y = Math.min(
          (G.getElapsedTime() - M.current) / 3,
          0.02
        );
        M.current = G.getElapsedTime();
        const N = p(B, ({ read: _ }) => {
          a(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", _), i(e.advectionMaterial, "uSource", _), i(e.advectionMaterial, "dt", Y), i(
            e.advectionMaterial,
            "dissipation",
            b.velocity_dissipation
          );
        }), Z = d(B, ({ read: _ }) => {
          a(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", N), i(e.advectionMaterial, "uSource", _), i(
            e.advectionMaterial,
            "dissipation",
            b.density_dissipation
          );
        }), { currentPointer: J, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = c(K);
        ee && (p(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _), i(e.splatMaterial, "point", J);
          const L = Q.multiply(
            U.current.set(H.width, H.height).multiplyScalar(b.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            A.current.set(L.x, L.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            b.splat_radius
          );
        }), d(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _);
          const L = typeof b.fluid_color == "function" ? b.fluid_color(te) : b.fluid_color;
          i(e.splatMaterial, "color", L);
        }));
        const ne = g(B, () => {
          a(e.curlMaterial), i(e.curlMaterial, "uVelocity", N);
        });
        p(B, ({ read: _ }) => {
          a(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", _), i(e.vorticityMaterial, "uCurl", ne), i(
            e.vorticityMaterial,
            "curl",
            b.curl_strength
          ), i(e.vorticityMaterial, "dt", Y);
        });
        const re = T(B, () => {
          a(e.divergenceMaterial), i(e.divergenceMaterial, "uVelocity", N);
        });
        D(B, ({ read: _ }) => {
          a(e.clearMaterial), i(e.clearMaterial, "uTexture", _), i(
            e.clearMaterial,
            "value",
            b.pressure_dissipation
          );
        }), a(e.pressureMaterial), i(e.pressureMaterial, "uDivergence", re);
        let k;
        for (let _ = 0; _ < b.pressure_iterations; _++)
          k = D(B, ({ read: L }) => {
            i(e.pressureMaterial, "uPressure", L);
          });
        return p(B, ({ read: _ }) => {
          a(e.gradientSubtractMaterial), i(
            e.gradientSubtractMaterial,
            "uPressure",
            k
          ), i(e.gradientSubtractMaterial, "uVelocity", _);
        }), Z;
      },
      [
        e,
        a,
        g,
        d,
        T,
        c,
        D,
        p,
        y,
        b
      ]
    ),
    y,
    {
      scene: r,
      materials: e,
      camera: l,
      renderTarget: {
        velocity: s,
        density: v,
        curl: m,
        divergence: x,
        pressure: S
      }
    }
  ];
}, Ee = ({ scale: o, max: u, texture: r, scene: e }) => {
  const a = w([]), l = f(
    () => new t.PlaneGeometry(o, o),
    [o]
  ), c = f(
    () => new t.MeshBasicMaterial({
      map: r ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return R(() => {
    for (let n = 0; n < u; n++) {
      const s = new t.Mesh(l.clone(), c.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, e.add(s), a.current.push(s);
    }
  }, [l, c, e, u]), R(() => () => {
    a.current.forEach((n) => {
      n.geometry.dispose(), Array.isArray(n.material) ? n.material.forEach((s) => s.dispose()) : n.material.dispose(), e.remove(n);
    }), a.current = [];
  }, [e]), a.current;
}, ze = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Dt = ({
  texture: o,
  scale: u = 64,
  max: r = 100,
  size: e
}) => {
  const a = f(() => new t.Scene(), []), l = Ee({
    scale: u,
    max: r,
    texture: o,
    scene: a
  }), c = V(e), n = W(), [s, p] = C({
    scene: a,
    camera: c,
    size: e
  }), [v, d] = P(ze), m = w(0);
  return [
    h(
      (x, T) => {
        const { gl: S, pointer: D, size: M } = x;
        T && d(T);
        const { currentPointer: U, diffPointer: A } = n(D);
        if (v.frequency < A.length()) {
          const y = l[m.current];
          y.visible = !0, y.position.set(
            U.x * (M.width / 2),
            U.y * (M.height / 2),
            0
          ), y.scale.x = y.scale.y = 0, y.material.opacity = v.alpha, m.current = (m.current + 1) % r;
        }
        return l.forEach((y) => {
          if (y.visible) {
            const $ = y.material;
            y.rotation.z += v.rotation, $.opacity *= v.fadeout_speed, y.scale.x = v.fadeout_speed * y.scale.x + v.scale, y.scale.y = y.scale.x, $.opacity < 2e-3 && (y.visible = !1);
          }
        }), p(S);
      },
      [p, l, n, r, v, d]
    ),
    d,
    {
      scene: a,
      camera: c,
      meshArr: l,
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
const Ne = ({
  scene: o,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
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
      vertexShader: $e,
      fragmentShader: Ge
    }),
    []
  ), l = O(u, r);
  return R(() => {
    a.uniforms.uResolution.value = l.clone();
  }, [l, a]), F(o, e, a), a;
}, je = {
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
}, Ct = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = Ne({ scene: r, size: o, dpr: u }), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    dpr: u,
    size: o,
    isSizeUpdate: !0
  }), [n, s] = P(je);
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "uTexture0", n.texture0), i(e, "uTexture1", n.texture1), i(e, "uTextureResolution", n.textureResolution), i(e, "padding", n.padding), i(e, "uMap", n.map), i(e, "mapIntensity", n.mapIntensity), i(e, "edgeIntensity", n.edgeIntensity), i(e, "epicenter", n.epicenter), i(e, "progress", n.progress), i(e, "dirX", n.dir.x), i(e, "dirY", n.dir.y), c(m);
      },
      [c, e, n, s]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
};
var We = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Xe = `precision highp float;
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
const He = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
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
      vertexShader: We,
      fragmentShader: Xe
    }),
    []
  );
  return F(o, u, r), r;
}, Ye = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, Vt = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = He(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(Ye);
  return [
    h(
      (v, d) => {
        const { gl: m, clock: g } = v;
        return d && s(d), i(e, "scale", n.scale), i(e, "timeStrength", n.timeStrength), i(e, "noiseOctaves", n.noiseOctaves), i(e, "fbmOctaves", n.fbmOctaves), i(e, "warpOctaves", n.warpOctaves), i(e, "warpDirection", n.warpDirection), i(e, "warpStrength", n.warpStrength), i(e, "uTime", g.getElapsedTime()), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
}, ke = (o) => {
  var a, l, c;
  const u = (a = o.dom) == null ? void 0 : a.length, r = (l = o.texture) == null ? void 0 : l.length, e = (c = o.resolution) == null ? void 0 : c.length;
  if (!u || !r || !e)
    throw new Error("No dom or texture or resolution is set");
  if (u !== r || u !== e)
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
  params: o,
  size: u,
  scene: r
}) => {
  r.children.length > 0 && (r.children.forEach((e) => {
    e instanceof t.Mesh && (e.geometry.dispose(), e.material.dispose());
  }), r.remove(...r.children)), o.texture.forEach((e, a) => {
    const l = new t.Mesh(
      new t.PlaneGeometry(1, 1),
      new t.ShaderMaterial({
        vertexShader: qe,
        fragmentShader: Ke,
        transparent: !0,
        uniforms: {
          u_texture: { value: e },
          u_textureResolution: { value: new t.Vector2(0, 0) },
          u_resolution: { value: new t.Vector2(0, 0) },
          u_borderRadius: {
            value: o.boderRadius[a] ? o.boderRadius[a] : 0
          }
        }
      })
    );
    r.add(l);
  });
}, Je = () => {
  const o = w([]), u = w([]);
  return h(
    ({
      isIntersectingRef: e,
      isIntersectingOnceRef: a,
      params: l
    }) => {
      o.current.length > 0 && o.current.forEach((n, s) => {
        n.unobserve(u.current[s]);
      }), u.current = [], o.current = [];
      const c = new Array(l.dom.length).fill(!1);
      e.current = [...c], a.current = [...c], l.dom.forEach((n, s) => {
        const p = (d) => {
          d.forEach((m) => {
            l.onIntersect[s] && l.onIntersect[s](m), e.current[s] = m.isIntersecting;
          });
        }, v = new IntersectionObserver(p, {
          rootMargin: "0px",
          threshold: 0
        });
        v.observe(n), o.current.push(v), u.current.push(n);
      });
    },
    []
  );
}, Qe = () => {
  const o = w([]), u = h(
    ({ params: r, size: e, resolutionRef: a, scene: l, isIntersectingRef: c }) => {
      l.children.length !== o.current.length && (o.current = new Array(l.children.length)), l.children.forEach((n, s) => {
        const p = r.dom[s];
        if (!p)
          throw new Error("DOM is null.");
        const v = p.getBoundingClientRect();
        if (o.current[s] = v, n.scale.set(v.width, v.height, 1), n.position.set(
          v.left + v.width * 0.5 - e.width * 0.5,
          -v.top - v.height * 0.5 + e.height * 0.5,
          0
        ), c.current[s] && (r.rotation[s] && n.rotation.copy(r.rotation[s]), n instanceof t.Mesh)) {
          const d = n.material;
          i(d, "u_texture", r.texture[s]), i(
            d,
            "u_textureResolution",
            r.resolution[s]
          ), i(
            d,
            "u_resolution",
            a.current.set(v.width, v.height)
          ), i(
            d,
            "u_borderRadius",
            r.boderRadius[s] ? r.boderRadius[s] : 0
          );
        }
      });
    },
    []
  );
  return [o.current, u];
}, et = () => {
  const o = w([]), u = w([]), r = h((e, a = !1) => {
    o.current.forEach((c, n) => {
      c && (u.current[n] = !0);
    });
    const l = a ? [...u.current] : [...o.current];
    return e < 0 ? l : l[e];
  }, []);
  return {
    isIntersectingRef: o,
    isIntersectingOnceRef: u,
    isIntersecting: r
  };
}, tt = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Pt = ({
  size: o,
  dpr: u
}, r = []) => {
  const e = f(() => new t.Scene(), []), a = V(o), [l, c] = C({
    scene: e,
    camera: a,
    size: o,
    dpr: u,
    isSizeUpdate: !0
  }), [n, s] = P(tt), [p, v] = Qe(), d = w(new t.Vector2(0, 0)), [m, g] = oe(!0);
  R(() => {
    g(!0);
  }, r);
  const x = Je(), { isIntersectingOnceRef: T, isIntersectingRef: S, isIntersecting: D } = et();
  return [
    h(
      (U, A) => {
        const { gl: b, size: y } = U;
        return A && s(A), ke(n), m && (Ze({
          params: n,
          size: y,
          scene: e
        }), x({
          isIntersectingRef: S,
          isIntersectingOnceRef: T,
          params: n
        }), g(!1)), v({
          params: n,
          size: y,
          resolutionRef: d,
          scene: e,
          isIntersectingRef: S
        }), c(b);
      },
      [
        c,
        s,
        x,
        v,
        m,
        e,
        n,
        T,
        S
      ]
    ),
    s,
    {
      scene: e,
      camera: a,
      renderTarget: l,
      isIntersecting: D,
      DOMRects: p
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
const ot = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uResolution: { value: new t.Vector2(0, 0) },
        uBlurSize: { value: 1 }
      },
      vertexShader: nt,
      fragmentShader: rt
    }),
    []
  );
  return F(o, u, r), r;
}, at = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, Ut = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = ot(r), a = V(o), l = f(
    () => ({
      scene: r,
      camera: a,
      size: o,
      dpr: u
    }),
    [r, a, o, u]
  ), [c, n] = C(l), [s, p] = E(l), [v, d] = P(at);
  return [
    h(
      (g, x) => {
        const { gl: T } = g;
        x && d(x), i(e, "uTexture", v.texture), i(e, "uResolution", [
          v.texture.source.data.width,
          v.texture.source.data.height
        ]), i(e, "uBlurSize", v.blurSize);
        let S = p(T);
        const D = v.blurPower;
        for (let U = 0; U < D; U++)
          i(e, "uTexture", S), S = p(T);
        return n(T);
      },
      [n, p, e, d, v]
    ),
    d,
    {
      scene: r,
      material: e,
      camera: a,
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
  scene: o,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: new t.Vector2(0, 0) },
        uProgress: { value: 0 },
        uStrength: { value: 0 },
        uWidth: { value: 0 },
        uResolution: { value: new t.Vector2() },
        uMode: { value: 0 }
      },
      vertexShader: it,
      fragmentShader: ut
    }),
    []
  ), l = O(u, r);
  return R(() => {
    a.uniforms.uResolution.value = l.clone();
  }, [l, a]), F(o, e, a), a;
}, lt = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Ft = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = st({ scene: r, size: o, dpr: u }), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u,
    isSizeUpdate: !0
  }), [n, s] = P(lt);
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "uEpicenter", n.epicenter), i(e, "uProgress", n.progress), i(e, "uWidth", n.width), i(e, "uStrength", n.strength), i(
          e,
          "uMode",
          n.mode === "center" ? 0 : n.mode === "horizontal" ? 1 : 2
        ), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
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
	float alpha = clamp(smoothstep(u_min, u_max, brightness),0.0,1.0);
	gl_FragColor = vec4(color, alpha);
}`;
const dt = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 1 }
      },
      vertexShader: ct,
      fragmentShader: vt
    }),
    []
  );
  return F(o, u, r), r;
}, ft = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Bt = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = dt(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(
    ft
  );
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "u_texture", n.texture), i(e, "u_brightness", n.brightness), i(e, "u_min", n.min), i(e, "u_max", n.max), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
};
var mt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, pt = `precision highp float;
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
const gt = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
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
      vertexShader: mt,
      fragmentShader: pt
    }),
    []
  );
  return F(o, u, r), r;
}, xt = {
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
}, It = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = gt(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(xt);
  return [
    h(
      (v, d) => {
        const { gl: m, clock: g } = v;
        return d && s(d), n.texture ? (i(e, "uTexture", n.texture), i(e, "isTexture", !0)) : (i(e, "isTexture", !1), i(e, "scale", n.scale)), n.noise ? (i(e, "noise", n.noise), i(e, "isNoise", !0), i(e, "noiseStrength", n.noiseStrength)) : i(e, "isNoise", !1), i(e, "uTime", g.getElapsedTime()), i(e, "laminateLayer", n.laminateLayer), i(e, "laminateInterval", n.laminateInterval), i(e, "laminateDetail", n.laminateDetail), i(e, "distortion", n.distortion), i(e, "colorFactor", n.colorFactor), i(e, "timeStrength", n.timeStrength), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
};
var ht = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, yt = `precision highp float;

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
const Tt = (o) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 }
      },
      vertexShader: ht,
      fragmentShader: yt
    }),
    []
  );
  return F(o, u, r), r;
}, wt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Ot = ({
  size: o,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = Tt(r), a = V(o), [l, c] = C({
    scene: r,
    camera: a,
    size: o,
    dpr: u
  }), [n, s] = P(wt);
  return [
    h(
      (v, d) => {
        const { gl: m } = v;
        return d && s(d), i(e, "u_texture", n.texture), i(e, "u_map", n.map), i(e, "u_mapIntensity", n.mapIntensity), c(m);
      },
      [c, e, s, n]
    ),
    s,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
}, At = ({ scene: o, camera: u, size: r, dpr: e = !1, isSizeUpdate: a = !1 }, l) => {
  const c = w([]), n = O(r, e);
  c.current = f(() => Array.from(
    { length: l },
    () => new t.WebGLRenderTarget(n.x, n.y, z)
  ), [l]), j(() => {
    a && c.current.forEach(
      (p) => p.setSize(n.x, n.y)
    );
  }, [n, a]), R(() => {
    const p = c.current;
    return () => {
      p.forEach((v) => v.dispose());
    };
  }, [l]);
  const s = h(
    (p, v, d) => {
      const m = c.current[v];
      return p.setRenderTarget(m), d && d({ read: m.texture }), p.render(o, u), p.setRenderTarget(null), p.clear(), m.texture;
    },
    [o, u]
  );
  return [c.current, s];
};
export {
  xe as BLENDING_PARAMS,
  ft as BRIGHTNESSPICKER_PARAMS,
  le as BRUSH_PARAMS,
  xt as COLORSTRATA_PARAMS,
  tt as DOMSYNCER_PARAMS,
  fe as DUOTONE_PARAMS,
  Le as FLUID_PARAMS,
  wt as FXBLENDING_PARAMS,
  je as FXTEXTURE_PARAMS,
  Ye as NOISE_PARAMS,
  ze as RIPPLE_PARAMS,
  at as SIMPLEBLUR_PARAMS,
  lt as WAVE_PARAMS,
  i as setUniform,
  F as useAddMesh,
  bt as useBlending,
  Bt as useBrightnessPicker,
  _t as useBrush,
  V as useCamera,
  It as useColorStrata,
  At as useCopyTexture,
  Pt as useDomSyncer,
  E as useDoubleFBO,
  Mt as useDuoTone,
  Rt as useFluid,
  Ot as useFxBlending,
  Ct as useFxTexture,
  Vt as useNoise,
  P as useParams,
  W as usePointer,
  O as useResolution,
  Dt as useRipple,
  Ut as useSimpleBlur,
  C as useSingleFBO,
  Ft as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
