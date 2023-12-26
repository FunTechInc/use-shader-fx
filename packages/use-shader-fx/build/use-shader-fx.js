import * as t from "three";
import { useMemo as m, useEffect as R, useRef as T, useLayoutEffect as j, useCallback as x, useState as oe } from "react";
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
const O = (r, u = !1) => {
  const n = u ? r.width * u : r.width, e = u ? r.height * u : r.height;
  return m(
    () => new t.Vector2(n, e),
    [n, e]
  );
}, F = (r, u, n) => {
  const e = m(
    () => new t.Mesh(u, n),
    [u, n]
  );
  return R(() => {
    r.add(e);
  }, [r, e]), R(() => () => {
    r.remove(e), u.dispose(), n.dispose();
  }, [r, u, n, e]), e;
}, i = (r, u, n) => {
  r.uniforms && r.uniforms[u] && n !== void 0 && n !== null ? r.uniforms[u].value = n : console.error(
    `Uniform key "${String(
      u
    )}" does not exist in the material. or "${String(
      u
    )}" is null | undefined`
  );
}, ue = ({
  scene: r,
  size: u,
  dpr: n
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), a = m(
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
  ), l = O(u, n);
  return R(() => {
    i(a, "uAspect", l.width / l.height), i(a, "uResolution", l.clone());
  }, [l, a]), F(r, e, a), a;
}, se = (r, u) => {
  const n = u, e = r / u, [a, l] = [n * e / 2, n / 2];
  return { width: a, height: l, near: -1e3, far: 1e3 };
}, P = (r) => {
  const u = O(r), { width: n, height: e, near: a, far: l } = se(
    u.x,
    u.y
  );
  return m(
    () => new t.OrthographicCamera(
      -n,
      n,
      e,
      -e,
      a,
      l
    ),
    [n, e, a, l]
  );
}, z = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, C = ({
  scene: r,
  camera: u,
  size: n,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const l = T(), c = O(n, e);
  l.current = m(
    () => new t.WebGLRenderTarget(c.x, c.y, z),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), j(() => {
    var s;
    a && ((s = l.current) == null || s.setSize(c.x, c.y));
  }, [c, a]), R(() => {
    const s = l.current;
    return () => {
      s == null || s.dispose();
    };
  }, []);
  const o = x(
    (s, f) => {
      const v = l.current;
      return s.setRenderTarget(v), f && f({ read: v.texture }), s.render(r, u), s.setRenderTarget(null), s.clear(), v.texture;
    },
    [r, u]
  );
  return [l.current, o];
}, E = ({
  scene: r,
  camera: u,
  size: n,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const l = T({
    read: null,
    write: null,
    swap: function() {
      let f = this.read;
      this.read = this.write, this.write = f;
    }
  }), c = O(n, e), o = m(() => {
    const f = new t.WebGLRenderTarget(
      c.x,
      c.y,
      z
    ), v = new t.WebGLRenderTarget(
      c.x,
      c.y,
      z
    );
    return { read: f, write: v };
  }, []);
  l.current.read = o.read, l.current.write = o.write, j(() => {
    var f, v;
    a && ((f = l.current.read) == null || f.setSize(c.x, c.y), (v = l.current.write) == null || v.setSize(c.x, c.y));
  }, [c, a]), R(() => {
    const f = l.current;
    return () => {
      var v, d;
      (v = f.read) == null || v.dispose(), (d = f.write) == null || d.dispose();
    };
  }, []);
  const s = x(
    (f, v) => {
      var p;
      const d = l.current;
      return f.setRenderTarget(d.write), v && v({
        read: d.read.texture,
        write: d.write.texture
      }), f.render(r, u), d.swap(), f.setRenderTarget(null), f.clear(), (p = d.read) == null ? void 0 : p.texture;
    },
    [r, u]
  );
  return [
    { read: l.current.read, write: l.current.write },
    s
  ];
}, W = () => {
  const r = T(new t.Vector2(0, 0)), u = T(new t.Vector2(0, 0)), n = T(0), e = T(new t.Vector2(0, 0)), a = T(!1);
  return x((c) => {
    const o = performance.now(), s = c.clone();
    n.current === 0 && (n.current = o, r.current = s);
    const f = Math.max(1, o - n.current);
    n.current = o, e.current.copy(s).sub(r.current).divideScalar(f);
    const v = e.current.length() > 0, d = a.current ? r.current.clone() : s;
    return !a.current && v && (a.current = !0), r.current = s, {
      currentPointer: s,
      prevPointer: d,
      diffPointer: u.current.subVectors(s, d),
      velocity: e.current,
      isVelocityUpdate: v
    };
  }, []);
}, V = (r) => {
  const n = T(
    ((a) => Object.values(a).some((l) => typeof l == "function"))(r) ? r : structuredClone(r)
  ), e = x((a) => {
    for (const l in a) {
      const c = l;
      c in n.current && a[c] !== void 0 && a[c] !== null ? n.current[c] = a[c] : console.error(
        `"${String(
          c
        )}" does not exist in the params. or "${String(
          c
        )}" is null | undefined`
      );
    }
  }, []);
  return [n.current, e];
}, le = {
  texture: new t.Texture(),
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new t.Color(16777215)
}, _t = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = ue({ scene: n, size: r, dpr: u }), a = P(r), l = W(), [c, o] = E({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [s, f] = V(le);
  return [
    x(
      (d, p) => {
        const { gl: g, pointer: w } = d;
        p && f(p), i(e, "uTexture", s.texture), i(e, "uRadius", s.radius), i(e, "uSmudge", s.smudge), i(e, "uDissipation", s.dissipation), i(e, "uMotionBlur", s.motionBlur), i(e, "uMotionSample", s.motionSample), i(e, "uColor", s.color);
        const { currentPointer: y, prevPointer: S, velocity: D } = l(w);
        return i(e, "uMouse", y), i(e, "uPrevMouse", S), i(e, "uVelocity", D), o(g, ({ read: U }) => {
          i(e, "uMap", U);
        });
      },
      [e, l, o, s, f]
    ),
    f,
    {
      scene: n,
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
const de = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
}, fe = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Mt = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = de(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(fe);
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "uTexture", o.texture), i(e, "uColor0", o.color0), i(e, "uColor1", o.color1), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
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

	float brightness = dot(mapColor,u_brightness);
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(u_texture, uv);

	float blendValue = smoothstep(u_min, u_max, brightness);

	vec3 dodgeColor = u_isDodgeColor ? u_dodgeColor : mapColor;

	vec3 outputColor = blendValue * dodgeColor + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;
const ge = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
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
  return F(r, u, n), n;
}, xe = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}, bt = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = ge(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(xe);
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "u_texture", o.texture), i(e, "u_map", o.map), i(e, "u_mapIntensity", o.mapIntensity), i(e, "u_brightness", o.brightness), i(e, "u_min", o.min), i(e, "u_max", o.max), o.dodgeColor ? (i(e, "u_dodgeColor", o.dodgeColor), i(e, "u_isDodgeColor", !0)) : i(e, "u_isDodgeColor", !1), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
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
const ye = () => m(
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
const we = () => m(
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
const _e = () => m(
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
const be = () => m(
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
const De = () => m(
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
const Pe = () => m(
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
var Ve = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Ue = () => m(
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: I,
    fragmentShader: Ve
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
    vertexShader: I,
    fragmentShader: Ie
  }),
  []
), Le = ({
  scene: r,
  size: u,
  dpr: n
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), a = ye(), l = a.clone(), c = De(), o = Pe(), s = we(), f = _e(), v = be(), d = Ue(), p = Be(), g = Oe(), w = m(
    () => ({
      vorticityMaterial: o,
      curlMaterial: c,
      advectionMaterial: s,
      divergenceMaterial: f,
      pressureMaterial: v,
      clearMaterial: d,
      gradientSubtractMaterial: p,
      splatMaterial: g
    }),
    [
      o,
      c,
      s,
      f,
      v,
      d,
      p,
      g
    ]
  ), y = O(u, n);
  R(() => {
    i(
      w.splatMaterial,
      "aspectRatio",
      y.x / y.y
    );
    for (const M of Object.values(w))
      i(
        M,
        "texelSize",
        new t.Vector2(1 / y.x, 1 / y.y)
      );
  }, [y, w]);
  const S = F(r, e, a);
  R(() => {
    a.dispose(), S.material = l;
  }, [a, S, l]), R(() => () => {
    for (const M of Object.values(w))
      M.dispose();
  }, [w]);
  const D = x(
    (M) => {
      S.material = M, S.material.needsUpdate = !0;
    },
    [S]
  );
  return [w, D];
}, Ae = {
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
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), [e, a] = Le({ scene: n, size: r, dpr: u }), l = P(r), c = W(), o = m(
    () => ({
      scene: n,
      camera: l,
      size: r
    }),
    [n, l, r]
  ), [s, f] = E(o), [v, d] = E(o), [p, g] = C(o), [w, y] = C(o), [S, D] = E(o), M = T(0), U = T(new t.Vector2(0, 0)), L = T(new t.Vector3(0, 0, 0)), [b, h] = V(Ae);
  return [
    x(
      (q, X) => {
        const { gl: B, pointer: K, clock: G, size: H } = q;
        X && h(X), M.current === 0 && (M.current = G.getElapsedTime());
        const Y = Math.min(
          (G.getElapsedTime() - M.current) / 3,
          0.02
        );
        M.current = G.getElapsedTime();
        const N = f(B, ({ read: _ }) => {
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
        ee && (f(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _), i(e.splatMaterial, "point", J);
          const A = Q.multiply(
            U.current.set(H.width, H.height).multiplyScalar(b.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            L.current.set(A.x, A.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            b.splat_radius
          );
        }), d(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _);
          const A = typeof b.fluid_color == "function" ? b.fluid_color(te) : b.fluid_color;
          i(e.splatMaterial, "color", A);
        }));
        const ne = g(B, () => {
          a(e.curlMaterial), i(e.curlMaterial, "uVelocity", N);
        });
        f(B, ({ read: _ }) => {
          a(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", _), i(e.vorticityMaterial, "uCurl", ne), i(
            e.vorticityMaterial,
            "curl",
            b.curl_strength
          ), i(e.vorticityMaterial, "dt", Y);
        });
        const re = y(B, () => {
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
          k = D(B, ({ read: A }) => {
            i(e.pressureMaterial, "uPressure", A);
          });
        return f(B, ({ read: _ }) => {
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
        y,
        c,
        D,
        f,
        h,
        b
      ]
    ),
    h,
    {
      scene: n,
      materials: e,
      camera: l,
      renderTarget: {
        velocity: s,
        density: v,
        curl: p,
        divergence: w,
        pressure: S
      }
    }
  ];
}, Ee = ({ scale: r, max: u, texture: n, scene: e }) => {
  const a = T([]), l = m(
    () => new t.PlaneGeometry(r, r),
    [r]
  ), c = m(
    () => new t.MeshBasicMaterial({
      map: n ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [n]
  );
  return R(() => {
    for (let o = 0; o < u; o++) {
      const s = new t.Mesh(l.clone(), c.clone());
      s.rotateZ(2 * Math.PI * Math.random()), s.visible = !1, e.add(s), a.current.push(s);
    }
  }, [l, c, e, u]), R(() => () => {
    a.current.forEach((o) => {
      o.geometry.dispose(), Array.isArray(o.material) ? o.material.forEach((s) => s.dispose()) : o.material.dispose(), e.remove(o);
    }), a.current = [];
  }, [e]), a.current;
}, ze = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Dt = ({
  texture: r,
  scale: u = 64,
  max: n = 100,
  size: e
}) => {
  const a = m(() => new t.Scene(), []), l = Ee({
    scale: u,
    max: n,
    texture: r,
    scene: a
  }), c = P(e), o = W(), [s, f] = C({
    scene: a,
    camera: c,
    size: e
  }), [v, d] = V(ze), p = T(0);
  return [
    x(
      (w, y) => {
        const { gl: S, pointer: D, size: M } = w;
        y && d(y);
        const { currentPointer: U, diffPointer: L } = o(D);
        if (v.frequency < L.length()) {
          const h = l[p.current];
          h.visible = !0, h.position.set(
            U.x * (M.width / 2),
            U.y * (M.height / 2),
            0
          ), h.scale.x = h.scale.y = 0, h.material.opacity = v.alpha, p.current = (p.current + 1) % n;
        }
        return l.forEach((h) => {
          if (h.visible) {
            const $ = h.material;
            h.rotation.z += v.rotation, $.opacity *= v.fadeout_speed, h.scale.x = v.fadeout_speed * h.scale.x + v.scale, h.scale.y = h.scale.x, $.opacity < 2e-3 && (h.visible = !1);
          }
        }), f(S);
      },
      [f, l, o, n, v, d]
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
  scene: r,
  size: u,
  dpr: n
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), a = m(
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
  ), l = O(u, n);
  return R(() => {
    a.uniforms.uResolution.value = l.clone();
  }, [l, a]), F(r, e, a), a;
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
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = Ne({ scene: n, size: r, dpr: u }), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    dpr: u,
    size: r,
    isSizeUpdate: !0
  }), [o, s] = V(je);
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "uTexture0", o.texture0), i(e, "uTexture1", o.texture1), i(e, "uTextureResolution", o.textureResolution), i(e, "padding", o.padding), i(e, "uMap", o.map), i(e, "mapIntensity", o.mapIntensity), i(e, "edgeIntensity", o.edgeIntensity), i(e, "epicenter", o.epicenter), i(e, "progress", o.progress), i(e, "dirX", o.dir.x), i(e, "dirY", o.dir.y), c(p);
      },
      [c, e, o, s]
    ),
    s,
    {
      scene: n,
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
const He = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
}, Ye = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, Pt = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = He(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(Ye);
  return [
    x(
      (v, d) => {
        const { gl: p, clock: g } = v;
        return d && s(d), i(e, "scale", o.scale), i(e, "timeStrength", o.timeStrength), i(e, "noiseOctaves", o.noiseOctaves), i(e, "fbmOctaves", o.fbmOctaves), i(e, "warpOctaves", o.warpOctaves), i(e, "warpDirection", o.warpDirection), i(e, "warpStrength", o.warpStrength), i(e, "uTime", g.getElapsedTime()), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
}, ke = (r) => {
  var a, l, c;
  const u = (a = r.dom) == null ? void 0 : a.length, n = (l = r.texture) == null ? void 0 : l.length, e = (c = r.resolution) == null ? void 0 : c.length;
  if (!u || !n || !e)
    throw new Error("No dom or texture or resolution is set");
  if (u !== n || u !== e)
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
  params: r,
  size: u,
  scene: n
}) => {
  n.children.length > 0 && (n.children.forEach((e) => {
    e instanceof t.Mesh && (e.geometry.dispose(), e.material.dispose());
  }), n.remove(...n.children)), r.texture.forEach((e, a) => {
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
            value: r.boderRadius[a] ? r.boderRadius[a] : 0
          }
        }
      })
    );
    n.add(l);
  });
}, Je = () => {
  const r = T([]), u = T([]);
  return x(
    ({
      isIntersectingRef: e,
      isIntersectingOnceRef: a,
      params: l
    }) => {
      r.current.length > 0 && r.current.forEach((o, s) => {
        o.unobserve(u.current[s]);
      }), u.current = [], r.current = [];
      const c = new Array(l.dom.length).fill(!1);
      e.current = [...c], a.current = [...c], l.dom.forEach((o, s) => {
        const f = (d) => {
          d.forEach((p) => {
            l.onIntersect[s] && l.onIntersect[s](p), e.current[s] = p.isIntersecting;
          });
        }, v = new IntersectionObserver(f, {
          rootMargin: "0px",
          threshold: 0
        });
        v.observe(o), r.current.push(v), u.current.push(o);
      });
    },
    []
  );
}, Qe = () => {
  const r = T([]), u = x(
    ({ params: n, size: e, resolutionRef: a, scene: l, isIntersectingRef: c }) => {
      l.children.length !== r.current.length && (r.current = new Array(l.children.length)), l.children.forEach((o, s) => {
        const f = n.dom[s];
        if (!f)
          throw new Error("DOM is null.");
        const v = f.getBoundingClientRect();
        if (r.current[s] = v, o.scale.set(v.width, v.height, 1), o.position.set(
          v.left + v.width * 0.5 - e.width * 0.5,
          -v.top - v.height * 0.5 + e.height * 0.5,
          0
        ), c.current[s] && (n.rotation[s] && o.rotation.copy(n.rotation[s]), o instanceof t.Mesh)) {
          const d = o.material;
          i(d, "u_texture", n.texture[s]), i(
            d,
            "u_textureResolution",
            n.resolution[s]
          ), i(
            d,
            "u_resolution",
            a.current.set(v.width, v.height)
          ), i(
            d,
            "u_borderRadius",
            n.boderRadius[s] ? n.boderRadius[s] : 0
          );
        }
      });
    },
    []
  );
  return [r.current, u];
}, et = () => {
  const r = T([]), u = T([]), n = x((e, a = !1) => {
    r.current.forEach((c, o) => {
      c && (u.current[o] = !0);
    });
    const l = a ? [...u.current] : [...r.current];
    return e < 0 ? l : l[e];
  }, []);
  return {
    isIntersectingRef: r,
    isIntersectingOnceRef: u,
    isIntersecting: n
  };
}, tt = {
  texture: [],
  dom: [],
  resolution: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, Vt = ({
  size: r,
  dpr: u
}, n = []) => {
  const e = m(() => new t.Scene(), []), a = P(r), [l, c] = C({
    scene: e,
    camera: a,
    size: r,
    dpr: u,
    isSizeUpdate: !0
  }), [o, s] = V(tt), [f, v] = Qe(), d = T(new t.Vector2(0, 0)), [p, g] = oe(!0);
  R(() => {
    g(!0);
  }, n);
  const w = Je(), { isIntersectingOnceRef: y, isIntersectingRef: S, isIntersecting: D } = et();
  return [
    x(
      (U, L) => {
        const { gl: b, size: h } = U;
        return L && s(L), ke(o), p && (Ze({
          params: o,
          size: h,
          scene: e
        }), w({
          isIntersectingRef: S,
          isIntersectingOnceRef: y,
          params: o
        }), g(!1)), v({
          params: o,
          size: h,
          resolutionRef: d,
          scene: e,
          isIntersectingRef: S
        }), c(b);
      },
      [
        c,
        s,
        w,
        v,
        p,
        e,
        o,
        y,
        S
      ]
    ),
    s,
    {
      scene: e,
      camera: a,
      renderTarget: l,
      isIntersecting: D,
      DOMRects: f
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
const ot = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
}, at = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, Ut = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = ot(n), a = P(r), l = m(
    () => ({
      scene: n,
      camera: a,
      size: r,
      dpr: u
    }),
    [n, a, r, u]
  ), [c, o] = C(l), [s, f] = E(l), [v, d] = V(at);
  return [
    x(
      (g, w) => {
        const { gl: y } = g;
        w && d(w), i(e, "uTexture", v.texture), i(e, "uResolution", [
          v.texture.source.data.width,
          v.texture.source.data.height
        ]), i(e, "uBlurSize", v.blurSize);
        let S = f(y);
        const D = v.blurPower;
        for (let U = 0; U < D; U++)
          i(e, "uTexture", S), S = f(y);
        return o(y);
      },
      [o, f, e, d, v]
    ),
    d,
    {
      scene: n,
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
  scene: r,
  size: u,
  dpr: n
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), a = m(
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
  ), l = O(u, n);
  return R(() => {
    a.uniforms.uResolution.value = l.clone();
  }, [l, a]), F(r, e, a), a;
}, lt = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Ft = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = st({ scene: n, size: r, dpr: u }), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u,
    isSizeUpdate: !0
  }), [o, s] = V(lt);
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "uEpicenter", o.epicenter), i(e, "uProgress", o.progress), i(e, "uWidth", o.width), i(e, "uStrength", o.strength), i(
          e,
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
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
const dt = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
}, ft = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Bt = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = dt(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(
    ft
  );
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "u_texture", o.texture), i(e, "u_brightness", o.brightness), i(e, "u_min", o.min), i(e, "u_max", o.max), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
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
const gt = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
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
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = gt(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(xt);
  return [
    x(
      (v, d) => {
        const { gl: p, clock: g } = v;
        return d && s(d), o.texture ? (i(e, "uTexture", o.texture), i(e, "isTexture", !0)) : (i(e, "isTexture", !1), i(e, "scale", o.scale)), o.noise ? (i(e, "noise", o.noise), i(e, "isNoise", !0), i(e, "noiseStrength", o.noiseStrength)) : i(e, "isNoise", !1), i(e, "uTime", g.getElapsedTime()), i(e, "laminateLayer", o.laminateLayer), i(e, "laminateInterval", o.laminateInterval), i(e, "laminateDetail", o.laminateDetail), i(e, "distortion", o.distortion), i(e, "colorFactor", o.colorFactor), i(e, "timeStrength", o.timeStrength), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
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
const Tt = (r) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), n = m(
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
  return F(r, u, n), n;
}, wt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Ot = ({
  size: r,
  dpr: u
}) => {
  const n = m(() => new t.Scene(), []), e = Tt(n), a = P(r), [l, c] = C({
    scene: n,
    camera: a,
    size: r,
    dpr: u
  }), [o, s] = V(wt);
  return [
    x(
      (v, d) => {
        const { gl: p } = v;
        return d && s(d), i(e, "u_texture", o.texture), i(e, "u_map", o.map), i(e, "u_mapIntensity", o.mapIntensity), c(p);
      },
      [c, e, s, o]
    ),
    s,
    {
      scene: n,
      material: e,
      camera: a,
      renderTarget: l
    }
  ];
}, Lt = ({ scene: r, camera: u, size: n, dpr: e = !1, isSizeUpdate: a = !1 }, l) => {
  const c = T([]), o = O(n, e);
  c.current = m(() => Array.from(
    { length: l },
    () => new t.WebGLRenderTarget(o.x, o.y, z)
  ), [l]), j(() => {
    a && c.current.forEach(
      (f) => f.setSize(o.x, o.y)
    );
  }, [o, a]), R(() => {
    const f = c.current;
    return () => {
      f.forEach((v) => v.dispose());
    };
  }, [l]);
  const s = x(
    (f, v, d) => {
      const p = c.current[v];
      return f.setRenderTarget(p), d && d({ read: p.texture }), f.render(r, u), f.setRenderTarget(null), f.clear(), p.texture;
    },
    [r, u]
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
  Ae as FLUID_PARAMS,
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
  P as useCamera,
  It as useColorStrata,
  Lt as useCopyTexture,
  Vt as useDomSyncer,
  E as useDoubleFBO,
  Mt as useDuoTone,
  Rt as useFluid,
  Ot as useFxBlending,
  Ct as useFxTexture,
  Pt as useNoise,
  V as useParams,
  W as usePointer,
  O as useResolution,
  Dt as useRipple,
  Ut as useSimpleBlur,
  C as useSingleFBO,
  Ft as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
