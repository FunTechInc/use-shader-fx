import * as t from "three";
import { useMemo as m, useEffect as b, useRef as T, useLayoutEffect as j, useCallback as g, useState as oe } from "react";
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
const O = (n, u = !1) => {
  const r = u ? n.width * u : n.width, e = u ? n.height * u : n.height;
  return m(
    () => new t.Vector2(r, e),
    [r, e]
  );
}, F = (n, u, r) => {
  const e = m(
    () => new t.Mesh(u, r),
    [u, r]
  );
  return b(() => {
    n.add(e);
  }, [n, e]), b(() => () => {
    n.remove(e), u.dispose(), r.dispose();
  }, [n, u, r, e]), e;
}, i = (n, u, r) => {
  n.uniforms && n.uniforms[u] && r !== void 0 && r !== null ? n.uniforms[u].value = r : console.error(
    `Uniform key "${String(
      u
    )}" does not exist in the material. or "${String(
      u
    )}" is null | undefined`
  );
}, ue = ({
  scene: n,
  size: u,
  dpr: r
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
  ), s = O(u, r);
  return b(() => {
    i(a, "uAspect", s.width / s.height), i(a, "uResolution", s.clone());
  }, [s, a]), F(n, e, a), a;
}, se = (n, u) => {
  const r = u, e = n / u, [a, s] = [r * e / 2, r / 2];
  return { width: a, height: s, near: -1e3, far: 1e3 };
}, C = (n) => {
  const u = O(n), { width: r, height: e, near: a, far: s } = se(
    u.x,
    u.y
  );
  return m(
    () => new t.OrthographicCamera(
      -r,
      r,
      e,
      -e,
      a,
      s
    ),
    [r, e, a, s]
  );
}, z = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, D = ({
  scene: n,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const s = T(), c = O(r, e);
  s.current = m(
    () => new t.WebGLRenderTarget(c.x, c.y, z),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), j(() => {
    var l;
    a && ((l = s.current) == null || l.setSize(c.x, c.y));
  }, [c, a]), b(() => {
    const l = s.current;
    return () => {
      l == null || l.dispose();
    };
  }, []);
  const o = g(
    (l, v) => {
      const d = s.current;
      return l.setRenderTarget(d), v && v({ read: d.texture }), l.render(n, u), l.setRenderTarget(null), l.clear(), d.texture;
    },
    [n, u]
  );
  return [s.current, o];
}, E = ({
  scene: n,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const s = T({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), c = O(r, e), o = m(() => {
    const v = new t.WebGLRenderTarget(
      c.x,
      c.y,
      z
    ), d = new t.WebGLRenderTarget(
      c.x,
      c.y,
      z
    );
    return { read: v, write: d };
  }, []);
  s.current.read = o.read, s.current.write = o.write, j(() => {
    var v, d;
    a && ((v = s.current.read) == null || v.setSize(c.x, c.y), (d = s.current.write) == null || d.setSize(c.x, c.y));
  }, [c, a]), b(() => {
    const v = s.current;
    return () => {
      var d, f;
      (d = v.read) == null || d.dispose(), (f = v.write) == null || f.dispose();
    };
  }, []);
  const l = g(
    (v, d) => {
      var p;
      const f = s.current;
      return v.setRenderTarget(f.write), d && d({
        read: f.read.texture,
        write: f.write.texture
      }), v.render(n, u), f.swap(), v.setRenderTarget(null), v.clear(), (p = f.read) == null ? void 0 : p.texture;
    },
    [n, u]
  );
  return [
    { read: s.current.read, write: s.current.write },
    l
  ];
}, W = () => {
  const n = T(new t.Vector2(0, 0)), u = T(new t.Vector2(0, 0)), r = T(0), e = T(new t.Vector2(0, 0)), a = T(!1);
  return g((c) => {
    const o = performance.now(), l = c.clone();
    r.current === 0 && (r.current = o, n.current = l);
    const v = Math.max(1, o - r.current);
    r.current = o, e.current.copy(l).sub(n.current).divideScalar(v);
    const d = e.current.length() > 0, f = a.current ? n.current.clone() : l;
    return !a.current && d && (a.current = !0), n.current = l, {
      currentPointer: l,
      prevPointer: f,
      diffPointer: u.current.subVectors(l, f),
      velocity: e.current,
      isVelocityUpdate: d
    };
  }, []);
}, P = (n) => {
  const r = T(
    ((a) => Object.values(a).some((s) => typeof s == "function"))(n) ? n : structuredClone(n)
  ), e = g((a) => {
    for (const s in a) {
      const c = s;
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
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = ue({ scene: r, size: n, dpr: u }), a = C(n), s = W(), [c, o] = E({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [l, v] = P(le);
  return [
    g(
      (f, p) => {
        const { gl: x, pointer: h } = f;
        p && v(p), i(e, "uTexture", l.texture), i(e, "uRadius", l.radius), i(e, "uSmudge", l.smudge), i(e, "uDissipation", l.dissipation), i(e, "uMotionBlur", l.motionBlur), i(e, "uMotionSample", l.motionSample), i(e, "uColor", l.color);
        const { currentPointer: y, prevPointer: M, velocity: R } = s(h);
        return i(e, "uMouse", y), i(e, "uPrevMouse", M), i(e, "uVelocity", R), o(x, ({ read: U }) => {
          i(e, "uMap", U);
        });
      },
      [e, s, o, l, v]
    ),
    v,
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
const de = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, fe = {
  texture: new t.Texture(),
  color0: new t.Color(16777215),
  color1: new t.Color(0)
}, Mt = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = de(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(fe);
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "uTexture", o.texture), i(e, "uColor0", o.color0), i(e, "uColor1", o.color1), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
uniform vec3 u_color;

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

	vec3 outputColor = blendValue * u_color + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}`;
const xe = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
    () => new t.ShaderMaterial({
      uniforms: {
        u_texture: { value: new t.Texture() },
        u_map: { value: new t.Texture() },
        u_mapIntensity: { value: 0 },
        u_brightness: { value: new t.Vector3() },
        u_min: { value: 0 },
        u_max: { value: 0.9 },
        u_color: { value: new t.Color(16777215) }
      },
      vertexShader: me,
      fragmentShader: pe
    }),
    []
  );
  return F(n, u, r), r;
}, ge = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3,
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  color: new t.Color(16777215)
}, bt = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = xe(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(ge);
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "u_texture", o.texture), i(e, "u_map", o.map), i(e, "u_mapIntensity", o.mapIntensity), i(e, "u_brightness", o.brightness), i(e, "u_min", o.min), i(e, "u_max", o.max), i(e, "u_color", o.color), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = m(() => new t.PlaneGeometry(2, 2), []), a = ye(), s = a.clone(), c = De(), o = Pe(), l = we(), v = _e(), d = be(), f = Ue(), p = Be(), x = Oe(), h = m(
    () => ({
      vorticityMaterial: o,
      curlMaterial: c,
      advectionMaterial: l,
      divergenceMaterial: v,
      pressureMaterial: d,
      clearMaterial: f,
      gradientSubtractMaterial: p,
      splatMaterial: x
    }),
    [
      o,
      c,
      l,
      v,
      d,
      f,
      p,
      x
    ]
  ), y = O(u, r);
  b(() => {
    i(
      h.splatMaterial,
      "aspectRatio",
      y.x / y.y
    );
    for (const w of Object.values(h))
      i(
        w,
        "texelSize",
        new t.Vector2(1 / y.x, 1 / y.y)
      );
  }, [y, h]);
  const M = F(n, e, a);
  b(() => {
    a.dispose(), M.material = s;
  }, [a, M, s]), b(() => () => {
    for (const w of Object.values(h))
      w.dispose();
  }, [h]);
  const R = g(
    (w) => {
      M.material = w, M.material.needsUpdate = !0;
    },
    [M]
  );
  return [h, R];
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
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), [e, a] = Le({ scene: r, size: n, dpr: u }), s = C(n), c = W(), o = m(
    () => ({
      scene: r,
      camera: s,
      size: n
    }),
    [r, s, n]
  ), [l, v] = E(o), [d, f] = E(o), [p, x] = D(o), [h, y] = D(o), [M, R] = E(o), w = T(0), U = T(new t.Vector2(0, 0)), L = T(new t.Vector3(0, 0, 0)), [V, S] = P(Ae);
  return [
    g(
      (q, X) => {
        const { gl: B, pointer: K, clock: G, size: H } = q;
        X && S(X), w.current === 0 && (w.current = G.getElapsedTime());
        const Y = Math.min(
          (G.getElapsedTime() - w.current) / 3,
          0.02
        );
        w.current = G.getElapsedTime();
        const N = v(B, ({ read: _ }) => {
          a(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", _), i(e.advectionMaterial, "uSource", _), i(e.advectionMaterial, "dt", Y), i(
            e.advectionMaterial,
            "dissipation",
            V.velocity_dissipation
          );
        }), Z = f(B, ({ read: _ }) => {
          a(e.advectionMaterial), i(e.advectionMaterial, "uVelocity", N), i(e.advectionMaterial, "uSource", _), i(
            e.advectionMaterial,
            "dissipation",
            V.density_dissipation
          );
        }), { currentPointer: J, diffPointer: Q, isVelocityUpdate: ee, velocity: te } = c(K);
        ee && (v(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _), i(e.splatMaterial, "point", J);
          const A = Q.multiply(
            U.current.set(H.width, H.height).multiplyScalar(V.velocity_acceleration)
          );
          i(
            e.splatMaterial,
            "color",
            L.current.set(A.x, A.y, 1)
          ), i(
            e.splatMaterial,
            "radius",
            V.splat_radius
          );
        }), f(B, ({ read: _ }) => {
          a(e.splatMaterial), i(e.splatMaterial, "uTarget", _);
          const A = typeof V.fluid_color == "function" ? V.fluid_color(te) : V.fluid_color;
          i(e.splatMaterial, "color", A);
        }));
        const ne = x(B, () => {
          a(e.curlMaterial), i(e.curlMaterial, "uVelocity", N);
        });
        v(B, ({ read: _ }) => {
          a(e.vorticityMaterial), i(e.vorticityMaterial, "uVelocity", _), i(e.vorticityMaterial, "uCurl", ne), i(
            e.vorticityMaterial,
            "curl",
            V.curl_strength
          ), i(e.vorticityMaterial, "dt", Y);
        });
        const re = y(B, () => {
          a(e.divergenceMaterial), i(e.divergenceMaterial, "uVelocity", N);
        });
        R(B, ({ read: _ }) => {
          a(e.clearMaterial), i(e.clearMaterial, "uTexture", _), i(
            e.clearMaterial,
            "value",
            V.pressure_dissipation
          );
        }), a(e.pressureMaterial), i(e.pressureMaterial, "uDivergence", re);
        let k;
        for (let _ = 0; _ < V.pressure_iterations; _++)
          k = R(B, ({ read: A }) => {
            i(e.pressureMaterial, "uPressure", A);
          });
        return v(B, ({ read: _ }) => {
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
        x,
        f,
        y,
        c,
        R,
        v,
        S,
        V
      ]
    ),
    S,
    {
      scene: r,
      materials: e,
      camera: s,
      renderTarget: {
        velocity: l,
        density: d,
        curl: p,
        divergence: h,
        pressure: M
      }
    }
  ];
}, Ee = ({ scale: n, max: u, texture: r, scene: e }) => {
  const a = T([]), s = m(
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
    for (let o = 0; o < u; o++) {
      const l = new t.Mesh(s.clone(), c.clone());
      l.rotateZ(2 * Math.PI * Math.random()), l.visible = !1, e.add(l), a.current.push(l);
    }
  }, [s, c, e, u]), b(() => () => {
    a.current.forEach((o) => {
      o.geometry.dispose(), Array.isArray(o.material) ? o.material.forEach((l) => l.dispose()) : o.material.dispose(), e.remove(o);
    }), a.current = [];
  }, [e]), a.current;
}, ze = {
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6
}, Dt = ({
  texture: n,
  scale: u = 64,
  max: r = 100,
  size: e
}) => {
  const a = m(() => new t.Scene(), []), s = Ee({
    scale: u,
    max: r,
    texture: n,
    scene: a
  }), c = C(e), o = W(), [l, v] = D({
    scene: a,
    camera: c,
    size: e
  }), [d, f] = P(ze), p = T(0);
  return [
    g(
      (h, y) => {
        const { gl: M, pointer: R, size: w } = h;
        y && f(y);
        const { currentPointer: U, diffPointer: L } = o(R);
        if (d.frequency < L.length()) {
          const S = s[p.current];
          S.visible = !0, S.position.set(
            U.x * (w.width / 2),
            U.y * (w.height / 2),
            0
          ), S.scale.x = S.scale.y = 0, S.material.opacity = d.alpha, p.current = (p.current + 1) % r;
        }
        return s.forEach((S) => {
          if (S.visible) {
            const $ = S.material;
            S.rotation.z += d.rotation, $.opacity *= d.fadeout_speed, S.scale.x = d.fadeout_speed * S.scale.x + d.scale, S.scale.y = S.scale.x, $.opacity < 2e-3 && (S.visible = !1);
          }
        }), v(M);
      },
      [v, s, o, r, d, f]
    ),
    f,
    {
      scene: a,
      camera: c,
      meshArr: s,
      renderTarget: l
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
  scene: n,
  size: u,
  dpr: r
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
  ), s = O(u, r);
  return b(() => {
    a.uniforms.uResolution.value = s.clone();
  }, [s, a]), F(n, e, a), a;
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
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = Ne({ scene: r, size: n, dpr: u }), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    dpr: u,
    size: n,
    isSizeUpdate: !0
  }), [o, l] = P(je);
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "uTexture0", o.texture0), i(e, "uTexture1", o.texture1), i(e, "uTextureResolution", o.textureResolution), i(e, "padding", o.padding), i(e, "uMap", o.map), i(e, "mapIntensity", o.mapIntensity), i(e, "edgeIntensity", o.edgeIntensity), i(e, "epicenter", o.epicenter), i(e, "progress", o.progress), i(e, "dirX", o.dir.x), i(e, "dirY", o.dir.y), c(p);
      },
      [c, e, o, l]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
const He = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, Ye = {
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new t.Vector2(2, 2),
  warpStrength: 8
}, Pt = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = He(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(Ye);
  return [
    g(
      (d, f) => {
        const { gl: p, clock: x } = d;
        return f && l(f), i(e, "scale", o.scale), i(e, "timeStrength", o.timeStrength), i(e, "noiseOctaves", o.noiseOctaves), i(e, "fbmOctaves", o.fbmOctaves), i(e, "warpOctaves", o.warpOctaves), i(e, "warpDirection", o.warpDirection), i(e, "warpStrength", o.warpStrength), i(e, "uTime", x.getElapsedTime()), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
    }
  ];
}, ke = (n) => {
  var a, s, c;
  const u = (a = n.dom) == null ? void 0 : a.length, r = (s = n.texture) == null ? void 0 : s.length, e = (c = n.resolution) == null ? void 0 : c.length;
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
  params: n,
  size: u,
  scene: r
}) => {
  r.children.length > 0 && (r.children.forEach((e) => {
    e instanceof t.Mesh && (e.geometry.dispose(), e.material.dispose());
  }), r.remove(...r.children)), n.texture.forEach((e, a) => {
    const s = new t.Mesh(
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
            value: n.boderRadius[a] ? n.boderRadius[a] : 0
          }
        }
      })
    );
    r.add(s);
  });
}, Je = () => {
  const n = T([]), u = T([]);
  return g(
    ({
      isIntersectingRef: e,
      isIntersectingOnceRef: a,
      params: s
    }) => {
      n.current.length > 0 && n.current.forEach((o, l) => {
        o.unobserve(u.current[l]);
      }), u.current = [], n.current = [];
      const c = new Array(s.dom.length).fill(!1);
      e.current = [...c], a.current = [...c], s.dom.forEach((o, l) => {
        const v = (f) => {
          f.forEach((p) => {
            s.onIntersect[l] && s.onIntersect[l](p), e.current[l] = p.isIntersecting;
          });
        }, d = new IntersectionObserver(v, {
          rootMargin: "0px",
          threshold: 0
        });
        d.observe(o), n.current.push(d), u.current.push(o);
      });
    },
    []
  );
}, Qe = ({
  params: n,
  size: u,
  resolutionRef: r,
  scene: e,
  isIntersectingRef: a
}) => {
  e.children.forEach((s, c) => {
    const o = n.dom[c];
    if (!o)
      throw new Error("DOM is null.");
    if (a.current[c]) {
      const l = o.getBoundingClientRect();
      if (s.scale.set(l.width, l.height, 1), s.position.set(
        l.left + l.width * 0.5 - u.width * 0.5,
        -l.top - l.height * 0.5 + u.height * 0.5,
        0
      ), n.rotation[c] && s.rotation.copy(n.rotation[c]), s instanceof t.Mesh) {
        const v = s.material;
        i(v, "u_texture", n.texture[c]), i(v, "u_textureResolution", n.resolution[c]), i(
          v,
          "u_resolution",
          r.current.set(l.width, l.height)
        ), i(
          v,
          "u_borderRadius",
          n.boderRadius[c] ? n.boderRadius[c] : 0
        );
      }
    }
  });
}, et = () => {
  const n = T([]), u = T([]), r = g((e, a = !1) => {
    n.current.forEach((c, o) => {
      c && (u.current[o] = !0);
    });
    const s = a ? [...u.current] : [...n.current];
    return e < 0 ? s : s[e];
  }, []);
  return {
    isIntersectingRef: n,
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
}, Vt = ({
  size: n,
  dpr: u
}, r = []) => {
  const e = m(() => new t.Scene(), []), a = C(n), [s, c] = D({
    scene: e,
    camera: a,
    size: n,
    dpr: u,
    isSizeUpdate: !0
  }), [o, l] = P(tt), v = T(new t.Vector2(0, 0)), [d, f] = oe(!0);
  b(() => {
    f(!0);
  }, r);
  const p = Je(), { isIntersectingOnceRef: x, isIntersectingRef: h, isIntersecting: y } = et();
  return [
    g(
      (R, w) => {
        const { gl: U, size: L } = R;
        return w && l(w), ke(o), d && (Ze({
          params: o,
          size: L,
          scene: e
        }), p({
          isIntersectingRef: h,
          isIntersectingOnceRef: x,
          params: o
        }), f(!1)), Qe({
          params: o,
          size: L,
          resolutionRef: v,
          scene: e,
          isIntersectingRef: h
        }), c(U);
      },
      [
        c,
        l,
        p,
        d,
        e,
        o,
        x,
        h
      ]
    ),
    l,
    {
      scene: e,
      camera: a,
      renderTarget: s,
      isIntersecting: y
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
const ot = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, at = {
  texture: new t.Texture(),
  blurSize: 3,
  blurPower: 5
}, Ut = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = ot(r), a = C(n), s = m(
    () => ({
      scene: r,
      camera: a,
      size: n,
      dpr: u
    }),
    [r, a, n, u]
  ), [c, o] = D(s), [l, v] = E(s), [d, f] = P(at);
  return [
    g(
      (x, h) => {
        const { gl: y } = x;
        h && f(h), i(e, "uTexture", d.texture), i(e, "uResolution", [
          d.texture.source.data.width,
          d.texture.source.data.height
        ]), i(e, "uBlurSize", d.blurSize);
        let M = v(y);
        const R = d.blurPower;
        for (let U = 0; U < R; U++)
          i(e, "uTexture", M), M = v(y);
        return o(y);
      },
      [o, v, e, f, d]
    ),
    f,
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
  scene: n,
  size: u,
  dpr: r
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
  ), s = O(u, r);
  return b(() => {
    a.uniforms.uResolution.value = s.clone();
  }, [s, a]), F(n, e, a), a;
}, lt = {
  epicenter: new t.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}, Ft = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = st({ scene: r, size: n, dpr: u }), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u,
    isSizeUpdate: !0
  }), [o, l] = P(lt);
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "uEpicenter", o.epicenter), i(e, "uProgress", o.progress), i(e, "uWidth", o.width), i(e, "uStrength", o.strength), i(
          e,
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
const dt = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, ft = {
  texture: new t.Texture(),
  brightness: new t.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}, Bt = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = dt(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(
    ft
  );
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "u_texture", o.texture), i(e, "u_brightness", o.brightness), i(e, "u_min", o.min), i(e, "u_max", o.max), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
const xt = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, gt = {
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
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = xt(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(gt);
  return [
    g(
      (d, f) => {
        const { gl: p, clock: x } = d;
        return f && l(f), o.texture ? (i(e, "uTexture", o.texture), i(e, "isTexture", !0)) : (i(e, "isTexture", !1), i(e, "scale", o.scale)), o.noise ? (i(e, "noise", o.noise), i(e, "isNoise", !0), i(e, "noiseStrength", o.noiseStrength)) : i(e, "isNoise", !1), i(e, "uTime", x.getElapsedTime()), i(e, "laminateLayer", o.laminateLayer), i(e, "laminateInterval", o.laminateInterval), i(e, "laminateDetail", o.laminateDetail), i(e, "distortion", o.distortion), i(e, "colorFactor", o.colorFactor), i(e, "timeStrength", o.timeStrength), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
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
const Tt = (n) => {
  const u = m(() => new t.PlaneGeometry(2, 2), []), r = m(
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
  return F(n, u, r), r;
}, wt = {
  texture: new t.Texture(),
  map: new t.Texture(),
  mapIntensity: 0.3
}, Ot = ({
  size: n,
  dpr: u
}) => {
  const r = m(() => new t.Scene(), []), e = Tt(r), a = C(n), [s, c] = D({
    scene: r,
    camera: a,
    size: n,
    dpr: u
  }), [o, l] = P(wt);
  return [
    g(
      (d, f) => {
        const { gl: p } = d;
        return f && l(f), i(e, "u_texture", o.texture), i(e, "u_map", o.map), i(e, "u_mapIntensity", o.mapIntensity), c(p);
      },
      [c, e, l, o]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
    }
  ];
}, Lt = ({ scene: n, camera: u, size: r, dpr: e = !1, isSizeUpdate: a = !1 }, s) => {
  const c = T([]), o = O(r, e);
  c.current = m(() => Array.from(
    { length: s },
    () => new t.WebGLRenderTarget(o.x, o.y, z)
  ), [s]), j(() => {
    a && c.current.forEach(
      (v) => v.setSize(o.x, o.y)
    );
  }, [o, a]), b(() => {
    const v = c.current;
    return () => {
      v.forEach((d) => d.dispose());
    };
  }, [s]);
  const l = g(
    (v, d, f) => {
      const p = c.current[d];
      return v.setRenderTarget(p), f && f({ read: p.texture }), v.render(n, u), v.setRenderTarget(null), v.clear(), p.texture;
    },
    [n, u]
  );
  return [c.current, l];
};
export {
  ge as BLENDING_PARAMS,
  ft as BRIGHTNESSPICKER_PARAMS,
  le as BRUSH_PARAMS,
  gt as COLORSTRATA_PARAMS,
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
  C as useCamera,
  It as useColorStrata,
  Lt as useCopyTexture,
  Vt as useDomSyncer,
  E as useDoubleFBO,
  Mt as useDuoTone,
  Rt as useFluid,
  Ot as useFxBlending,
  Ct as useFxTexture,
  Pt as useNoise,
  P as useParams,
  W as usePointer,
  O as useResolution,
  Dt as useRipple,
  Ut as useSimpleBlur,
  D as useSingleFBO,
  Ft as useWave
};
//# sourceMappingURL=use-shader-fx.js.map
