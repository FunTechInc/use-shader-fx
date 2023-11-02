import * as n from "three";
import { useMemo as f, useEffect as _, useRef as C, useLayoutEffect as H, useCallback as S } from "react";
var ae = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ie = `precision mediump float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;

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
	
	
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, uVelocity, uMotionBlur,uMotionSample);

	
	vec4 bufferColor = motionBlurredColor * uDissipation;

	
	float modifiedRadius = uRadius + (length(velocity) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);

	
	
	vec3 color = vec3(1.0,1.0,1.0);

	
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	
	float onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect);

	
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);
	gl_FragColor = bufferColor;
}`;
const F = (r, a = !1) => {
  const e = a ? r.width * a : r.width, t = a ? r.height * a : r.height;
  return f(
    () => new n.Vector2(e, t),
    [e, t]
  );
}, O = (r, a, e) => {
  const t = f(
    () => new n.Mesh(a, e),
    [a, e]
  );
  return _(() => {
    r.add(t);
  }, [r, t]), t;
}, o = (r, a, e) => {
  r.uniforms && r.uniforms[a] && e !== void 0 && e !== null ? r.uniforms[a].value = e : console.error(
    `Uniform key "${a}" does not exist in the material. or "${a}" is null | undefined`
  );
}, ue = ({
  scene: r,
  size: a
}) => {
  const e = f(() => new n.PlaneGeometry(2, 2), []), t = f(
    () => new n.ShaderMaterial({
      uniforms: {
        uMap: {
          value: null
        },
        uResolution: { value: new n.Vector2(0, 0) },
        uAspect: { value: 1 },
        uTexture: { value: new n.Texture() },
        uRadius: { value: 0 },
        uAlpha: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMagnification: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 10 },
        uMouse: { value: new n.Vector2(0, 0) },
        uPrevMouse: { value: new n.Vector2(0, 0) },
        uVelocity: { value: new n.Vector2(0, 0) }
      },
      vertexShader: ae,
      fragmentShader: ie
    }),
    []
  ), i = F(a);
  return _(() => {
    o(t, "uAspect", i.width / i.height), o(t, "uResolution", i.clone());
  }, [i, t]), O(r, e, t), t;
}, le = (r, a) => {
  const e = a, t = r / a, [i, l] = [e * t / 2, e / 2];
  return { width: i, height: l, near: -1e3, far: 1e3 };
}, U = (r) => {
  const a = F(r), { width: e, height: t, near: i, far: l } = le(
    a.x,
    a.y
  );
  return f(
    () => new n.OrthographicCamera(
      -e,
      e,
      t,
      -t,
      i,
      l
    ),
    [e, t, i, l]
  );
}, X = {
  minFilter: n.LinearFilter,
  magFilter: n.LinearFilter,
  type: n.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, A = ({
  scene: r,
  camera: a,
  size: e,
  dpr: t = !1,
  isSizeUpdate: i = !1
}) => {
  const l = C(), u = F(e, t);
  l.current = f(
    () => new n.WebGLRenderTarget(u.x, u.y, X),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), H(() => {
    var c;
    i && ((c = l.current) == null || c.setSize(u.x, u.y));
  }, [u, i]);
  const s = S(
    (c, v) => {
      const d = l.current;
      return c.setRenderTarget(d), v && v({ read: d.texture }), c.render(r, a), c.setRenderTarget(null), c.clear(), d.texture;
    },
    [r, a]
  );
  return [l.current, s];
}, $ = ({
  scene: r,
  camera: a,
  size: e,
  dpr: t = !1,
  isSizeUpdate: i = !1
}) => {
  const l = C({
    read: null,
    write: null,
    swap: function() {
      let v = this.read;
      this.read = this.write, this.write = v;
    }
  }), u = F(e, t), s = f(() => {
    const v = new n.WebGLRenderTarget(
      u.x,
      u.y,
      X
    ), d = new n.WebGLRenderTarget(
      u.x,
      u.y,
      X
    );
    return { read: v, write: d };
  }, []);
  l.current.read = s.read, l.current.write = s.write, H(() => {
    var v, d;
    i && ((v = l.current.read) == null || v.setSize(u.x, u.y), (d = l.current.write) == null || d.setSize(u.x, u.y));
  }, [u, i]);
  const c = S(
    (v, d) => {
      var p;
      const m = l.current;
      return v.setRenderTarget(m.write), d && d({
        read: m.read.texture,
        write: m.write.texture
      }), v.render(r, a), m.swap(), v.setRenderTarget(null), v.clear(), (p = m.read) == null ? void 0 : p.texture;
    },
    [r, a]
  );
  return [
    { read: l.current.read, write: l.current.write },
    c
  ];
}, j = () => {
  const r = C(new n.Vector2(0, 0)), a = C(new n.Vector2(0, 0)), e = C(0), t = C(new n.Vector2(0, 0)), i = C(!1);
  return S((u) => {
    const s = performance.now(), c = u.clone();
    e.current === 0 && (e.current = s, r.current = c);
    const v = Math.max(1, s - e.current);
    e.current = s, t.current.copy(c).sub(r.current).divideScalar(v);
    const d = t.current.length() > 0, m = i.current ? r.current.clone() : c;
    return !i.current && d && (i.current = !0), r.current = c, {
      currentPointer: c,
      prevPointer: m,
      diffPointer: a.current.subVectors(c, m),
      velocity: t.current,
      isVelocityUpdate: d
    };
  }, []);
}, B = (r) => {
  const a = C(r), e = S((t) => {
    for (const i in t) {
      const l = i;
      l in a.current && t[l] !== void 0 && t[l] !== null ? a.current[l] = t[l] : console.error(
        `"${String(
          l
        )}" does not exist in the params. or "${String(
          l
        )}" is null | undefined`
      );
    }
  }, []);
  return [a.current, e];
}, Qe = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), e = ue({ scene: a, size: r }), t = U(r), i = j(), [l, u] = $({
    scene: a,
    camera: t,
    size: r
  }), [s, c] = B({
    texture: new n.Texture(),
    radius: 0,
    alpha: 0,
    smudge: 0,
    dissipation: 0,
    magnification: 0,
    motionBlur: 0,
    motionSample: 10
  });
  return {
    updateFx: S(
      (d, m) => {
        const { gl: p, pointer: g } = d;
        c(m), o(e, "uTexture", s.texture), o(e, "uRadius", s.radius), o(e, "uAlpha", s.alpha), o(e, "uSmudge", s.smudge), o(e, "uDissipation", s.dissipation), o(e, "uMagnification", s.magnification), o(e, "uMotionBlur", s.motionBlur), o(e, "uMotionSample", s.motionSample);
        const { currentPointer: h, prevPointer: M, velocity: T } = i(g);
        return o(e, "uMouse", h), o(e, "uPrevMouse", M), o(e, "uVelocity", T), u(p, ({ read: w }) => {
          o(e, "uMap", w);
        });
      },
      [e, i, u, s, c]
    ),
    setParams: c,
    fxObject: {
      scene: a,
      material: e,
      camera: t,
      renderTarget: l
    }
  };
};
var se = `varying vec2 vUv;

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
  const a = f(() => new n.PlaneGeometry(2, 2), []), e = f(
    () => new n.ShaderMaterial({
      uniforms: {
        uTexture: { value: new n.Texture() },
        uColor0: { value: new n.Color(16777215) },
        uColor1: { value: new n.Color(0) }
      },
      vertexShader: se,
      fragmentShader: ce
    }),
    []
  );
  return O(r, a, e), e;
}, et = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), e = ve(a), t = U(r), [i, l] = A({
    scene: a,
    camera: t,
    size: r
  }), [u, s] = B({
    texture: new n.Texture(),
    color0: new n.Color(16777215),
    color1: new n.Color(0)
  });
  return {
    updateFx: S(
      (v, d) => {
        const { gl: m } = v;
        return s(d), o(e, "uTexture", u.texture), o(e, "uColor0", u.color0), o(e, "uColor1", u.color1), l(m);
      },
      [l, e, s, u]
    ),
    setParams: s,
    fxObject: {
      scene: a,
      material: e,
      camera: t,
      renderTarget: i
    }
  };
};
var fe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, de = `precision mediump float;

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
const me = ({
  scene: r,
  size: a
}) => {
  const e = f(() => new n.PlaneGeometry(2, 2), []), t = f(
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
      vertexShader: fe,
      fragmentShader: de
    }),
    []
  ), i = F(a);
  return _(() => {
    o(t, "uAspect", i.width / i.height), o(t, "uResolution", i.clone());
  }, [i, t]), O(r, e, t), t;
}, tt = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), e = me({ scene: a, size: r }), t = U(r), i = j(), [l, u] = $({
    scene: a,
    camera: t,
    size: r
  }), [s, c] = B({
    radius: 0,
    magnification: 0,
    alpha: 0,
    dissipation: 0
  });
  return {
    updateFx: S(
      (d, m) => {
        const { gl: p, pointer: g } = d;
        c(m), o(e, "uRadius", s.radius), o(e, "uAlpha", s.alpha), o(e, "uDissipation", s.dissipation), o(e, "uMagnification", s.magnification);
        const { currentPointer: h, velocity: M } = i(g);
        return o(e, "uMouse", h), o(e, "uVelocity", M), u(p, ({ read: b }) => {
          o(e, "uMap", b);
        });
      },
      [e, i, u, s, c]
    ),
    setParams: c,
    fxObject: {
      scene: a,
      material: e,
      camera: t,
      renderTarget: l
    }
  };
};
var pe = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, ge = `precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform float timeStrength;
uniform float distortionStrength;
uniform float fogEdge0;
uniform float fogEdge1;
uniform vec3 fogColor;
uniform int noiseOct; 
uniform int fbmOct; 

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
	for(int i = 0; i < noiseOct; i++){
		float freq = pow(2.0, float(i));
		float amp  = pow(per, float(noiseOct - i));
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
	for (int i = 0; i < fbmOct; ++i) {
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
	
	float noiseTextureMap = noiseMap*2.0-1.0;
	uv += noiseTextureMap * distortionStrength;
	vec3 textureMap = texture2D(uTexture, uv).rgb;

	float edge0 = fogEdge0;
	float edge1 = fogEdge1;
	float blendValue = smoothstep(edge0, edge1, noiseMap);

	vec3 outputColor = blendValue * fogColor + (1.0 - blendValue) * textureMap;
	gl_FragColor = vec4(outputColor, 1.0);
}`;
const xe = (r) => {
  const a = f(() => new n.PlaneGeometry(2, 2), []), e = f(
    () => new n.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new n.Texture() },
        timeStrength: { value: 0 },
        distortionStrength: { value: 0 },
        fogEdge0: { value: 0 },
        fogEdge1: { value: 0.9 },
        fogColor: { value: new n.Color(16777215) },
        noiseOct: { value: 8 },
        fbmOct: { value: 3 }
      },
      vertexShader: pe,
      fragmentShader: ge
    }),
    []
  );
  return O(r, a, e), e;
}, nt = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), e = xe(a), t = U(r), [i, l] = A({
    scene: a,
    camera: t,
    size: r
  }), [u, s] = B({
    texture: new n.Texture(),
    timeStrength: 0,
    distortionStrength: 0,
    fogEdge0: 0,
    fogEdge1: 0.9,
    fogColor: new n.Color(16777215),
    noiseOct: 8,
    fbmOct: 3
  });
  return {
    updateFx: S(
      (v, d) => {
        const { gl: m, clock: p } = v;
        return s(d), o(e, "uTime", p.getElapsedTime()), o(e, "uTexture", u.texture), o(e, "timeStrength", u.timeStrength), o(e, "distortionStrength", u.distortionStrength), o(e, "fogEdge0", u.fogEdge0), o(e, "fogEdge1", u.fogEdge1), o(e, "fogColor", u.fogColor), o(e, "noiseOct", u.noiseOct), o(e, "fbmOct", u.fbmOct), l(m);
      },
      [l, e, s, u]
    ),
    setParams: s,
    fxObject: {
      scene: a,
      material: e,
      camera: t,
      renderTarget: i
    }
  };
};
var D = `precision mediump float;
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
}`, ye = `precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Me = () => f(
  () => new n.ShaderMaterial({
    vertexShader: D,
    fragmentShader: ye,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var he = `precision mediump float;
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
const Te = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new n.Texture() },
      uSource: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 }
    },
    vertexShader: D,
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
const Se = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: we
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
const Ce = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Pe
  }),
  []
);
var be = `precision mediump float;
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
const Ve = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: be
  }),
  []
);
var Re = `precision mediump float;
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
const _e = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Re
  }),
  []
);
var De = `precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const Fe = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uTexture: { value: new n.Texture() },
      value: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: De
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
const Be = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uPressure: { value: new n.Texture() },
      uVelocity: { value: new n.Texture() },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Ue
  }),
  []
);
var Oe = `precision mediump float;
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
const Le = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      uTarget: { value: new n.Texture() },
      aspectRatio: { value: 0 },
      color: { value: new n.Vector3() },
      point: { value: new n.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new n.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Oe
  }),
  []
), $e = ({
  scene: r,
  size: a,
  dpr: e
}) => {
  const t = f(() => new n.PlaneGeometry(2, 2), []), i = Me(), l = i.clone(), u = Ve(), s = _e(), c = Te(), v = Se(), d = Ce(), m = Fe(), p = Be(), g = Le(), h = f(
    () => ({
      vorticityMaterial: s,
      curlMaterial: u,
      advectionMaterial: c,
      divergenceMaterial: v,
      pressureMaterial: d,
      clearMaterial: m,
      gradientSubtractMaterial: p,
      splatMaterial: g
    }),
    [
      s,
      u,
      c,
      v,
      d,
      m,
      p,
      g
    ]
  ), M = F(a, e);
  _(() => {
    o(
      h.splatMaterial,
      "aspectRatio",
      M.x / M.y
    );
    for (const w of Object.values(h))
      o(
        w,
        "texelSize",
        new n.Vector2(1 / M.x, 1 / M.y)
      );
  }, [M, h]);
  const T = O(r, t, i);
  _(() => {
    i.dispose(), T.material = l;
  }, [i, T, l]);
  const b = S(
    (w) => {
      T.material = w, T.material.needsUpdate = !0;
    },
    [T]
  );
  return [h, b];
}, rt = ({
  size: r,
  dpr: a
}) => {
  const e = f(() => new n.Scene(), []), [t, i] = $e({ scene: e, size: r, dpr: a }), l = U(r), u = j(), s = f(
    () => ({
      scene: e,
      camera: l,
      size: r,
      dpr: a
    }),
    [e, l, r, a]
  ), [c, v] = $(s), [d, m] = $(s), [p, g] = A(s), [h, M] = A(s), [T, b] = $(s), w = C(0), P = C(new n.Vector2(0, 0)), E = C(new n.Vector3(0, 0, 0)), [V, x] = B({
    density_dissipation: 0,
    velocity_dissipation: 0,
    velocity_acceleration: 0,
    pressure_dissipation: 0,
    pressure_iterations: 20,
    curl_strength: 0,
    splat_radius: 1e-3,
    fruid_color: new n.Vector3(1, 1, 1)
  });
  return {
    updateFx: S(
      (K, N) => {
        const { gl: R, pointer: Z, clock: q, size: Y } = K;
        x(N), w.current === 0 && (w.current = q.getElapsedTime());
        const W = Math.min(
          (q.getElapsedTime() - w.current) / 3,
          0.02
        );
        w.current = q.getElapsedTime();
        const G = v(R, ({ read: y }) => {
          i(t.advectionMaterial), o(t.advectionMaterial, "uVelocity", y), o(t.advectionMaterial, "uSource", y), o(t.advectionMaterial, "dt", W), o(
            t.advectionMaterial,
            "dissipation",
            V.velocity_dissipation
          );
        }), J = m(R, ({ read: y }) => {
          i(t.advectionMaterial), o(t.advectionMaterial, "uVelocity", G), o(t.advectionMaterial, "uSource", y), o(
            t.advectionMaterial,
            "dissipation",
            V.density_dissipation
          );
        }), { currentPointer: Q, diffPointer: ee, isVelocityUpdate: te, velocity: ne } = u(Z);
        te && (v(R, ({ read: y }) => {
          i(t.splatMaterial), o(t.splatMaterial, "uTarget", y), o(t.splatMaterial, "point", Q);
          const L = ee.multiply(
            P.current.set(Y.width, Y.height).multiplyScalar(V.velocity_acceleration)
          );
          o(
            t.splatMaterial,
            "color",
            E.current.set(L.x, L.y, 1)
          ), o(
            t.splatMaterial,
            "radius",
            V.splat_radius
          );
        }), m(R, ({ read: y }) => {
          i(t.splatMaterial), o(t.splatMaterial, "uTarget", y);
          const L = typeof V.fruid_color == "function" ? V.fruid_color(ne) : V.fruid_color;
          o(t.splatMaterial, "color", L);
        }));
        const re = g(R, () => {
          i(t.curlMaterial), o(t.curlMaterial, "uVelocity", G);
        });
        v(R, ({ read: y }) => {
          i(t.vorticityMaterial), o(t.vorticityMaterial, "uVelocity", y), o(t.vorticityMaterial, "uCurl", re), o(
            t.vorticityMaterial,
            "curl",
            V.curl_strength
          ), o(t.vorticityMaterial, "dt", W);
        });
        const oe = M(R, () => {
          i(t.divergenceMaterial), o(t.divergenceMaterial, "uVelocity", G);
        });
        b(R, ({ read: y }) => {
          i(t.clearMaterial), o(t.clearMaterial, "uTexture", y), o(
            t.clearMaterial,
            "value",
            V.pressure_dissipation
          );
        }), i(t.pressureMaterial), o(t.pressureMaterial, "uDivergence", oe);
        let k;
        for (let y = 0; y < V.pressure_iterations; y++)
          k = b(R, ({ read: L }) => {
            o(t.pressureMaterial, "uPressure", L);
          });
        return v(R, ({ read: y }) => {
          i(t.gradientSubtractMaterial), o(
            t.gradientSubtractMaterial,
            "uPressure",
            k
          ), o(t.gradientSubtractMaterial, "uVelocity", y);
        }), J;
      },
      [
        t,
        i,
        g,
        m,
        M,
        u,
        b,
        v,
        x,
        V
      ]
    ),
    setParams: x,
    fxObject: {
      scene: e,
      materials: t,
      camera: l,
      renderTarget: {
        velocity: c,
        density: d,
        curl: p,
        divergence: h,
        pressure: T
      }
    }
  };
}, Ae = ({ scale: r, max: a, texture: e, scene: t }) => {
  const i = C([]), l = f(
    () => new n.PlaneGeometry(r, r),
    [r]
  ), u = f(
    () => new n.MeshBasicMaterial({
      map: e ?? null,
      transparent: !0,
      blending: n.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [e]
  );
  return _(() => {
    for (let s = 0; s < a; s++) {
      const c = new n.Mesh(l.clone(), u.clone());
      c.rotateZ(2 * Math.PI * Math.random()), c.visible = !1, t.add(c), i.current.push(c);
    }
  }, [l, u, t, a]), i.current;
}, ot = ({
  texture: r,
  scale: a = 64,
  max: e = 100,
  size: t
}) => {
  const i = f(() => new n.Scene(), []), l = Ae({
    scale: a,
    max: e,
    texture: r,
    scene: i
  }), u = U(t), s = j(), [c, v] = A({
    scene: i,
    camera: u,
    size: t
  }), [d, m] = B({
    frequency: 0.01,
    rotation: 0.01,
    fadeout_speed: 0.9,
    scale: 0.15,
    alpha: 0.6
  }), p = C(0);
  return {
    updateFx: S(
      (h, M) => {
        const { gl: T, pointer: b, size: w } = h;
        m(M);
        const { currentPointer: P, diffPointer: E } = s(b);
        if (d.frequency < E.length()) {
          const x = l[p.current];
          x.visible = !0, x.position.set(
            P.x * (w.width / 2),
            P.y * (w.height / 2),
            0
          ), x.scale.x = x.scale.y = 0, x.material.opacity = d.alpha, p.current = (p.current + 1) % e;
        }
        return l.forEach((x) => {
          if (x.visible) {
            const I = x.material;
            x.rotation.z += d.rotation, I.opacity *= d.fadeout_speed, x.scale.x = d.fadeout_speed * x.scale.x + d.scale, x.scale.y = x.scale.x, I.opacity < 2e-3 && (x.visible = !1);
          }
        }), v(T);
      },
      [v, l, s, e, d, m]
    ),
    setParams: m,
    fxObject: {
      scene: i,
      camera: u,
      meshArr: l,
      renderTarget: c
    }
  };
};
var z = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ee = `precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const je = () => f(
  () => new n.ShaderMaterial({
    vertexShader: z,
    fragmentShader: Ee,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var ze = `precision highp float;

uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform vec2 resolution;
uniform sampler2D dataTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;

#pragma glslify: map            = require('./map.glsl')
#pragma glslify: samplePressure = require('./samplePressure.glsl')
#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')

varying vec2 vUv;

void main(){
	vec2 r = resolution;
	vec2 uv = gl_FragCoord.xy / r;
	vec4 data = texture2D(dataTex, uv);
	vec2 v = data.xy;

	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	
	vec2 mPos = 0.5 * (pointerPos + 1.0) * r;
	vec2 mPPos = 0.5 * (beforePointerPos + 1.0) * r;
	vec2 mouseV = mPos - mPPos;
	float len = length(mPos - uv * r) / forceRadius;
	float d = clamp(1.0 - len, 0.0, 1.0) * length(mouseV) * forceCoefficient;
	vec2 mforce = d * normalize(mPos - uv * r + mouseV);

	v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
	v += mforce;
	v *= viscosity;

	gl_FragColor = vec4(v, data.zw);
}`;
const Ie = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      resolution: { value: new n.Vector2() },
      dataTex: { value: null },
      pointerPos: { value: null },
      beforePointerPos: { value: null },
      viscosity: { value: 0 },
      forceRadius: { value: 0 },
      forceCoefficient: { value: 0 }
    },
    vertexShader: z,
    fragmentShader: ze
  }),
  []
);
var qe = `precision highp float;

uniform float attenuation;
uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')
#pragma glslify: samplePressure = require('./samplePressure.glsl')

varying vec2 vUv;

vec2 bilerpVelocity(sampler2D tex, vec2 p, vec2 resolution) {
	vec4 ij; 
	ij.xy = floor(p - 0.5) + 0.5;
	ij.zw = ij.xy + 1.0;

	vec4 uv = ij / resolution.xyxy;
	vec2 d11 = sampleVelocity(tex, uv.xy, resolution);
	vec2 d21 = sampleVelocity(tex, uv.zy, resolution);
	vec2 d12 = sampleVelocity(tex, uv.xw, resolution);
	vec2 d22 = sampleVelocity(tex, uv.zw, resolution);

	vec2 a = p - ij.xy;

	return mix(mix(d11, d21, a.x), mix(d12, d22, a.x), a.y);
}

void main(){
	vec2 r = resolution;
	vec2 p = gl_FragCoord.xy - sampleVelocity(dataTex, gl_FragCoord.xy / r, r);

	gl_FragColor = vec4(bilerpVelocity(dataTex, p, r) * attenuation, samplePressure(dataTex, gl_FragCoord.xy / r, r), 0.0);
}`;
const Ge = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      resolution: { value: new n.Vector2(0, 0) },
      dataTex: { value: null },
      attenuation: { value: 0 }
    },
    vertexShader: z,
    fragmentShader: qe
  }),
  []
);
var Xe = `precision highp float;

uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')

void main(){
	vec2 r = resolution;
	vec4 data = texture2D(dataTex, gl_FragCoord.xy / r);

	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	
	vec2 vLeft   = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	vec2 vRight  = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	vec2 vTop    = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	vec2 vBottom = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y)) * 0.5;

	gl_FragColor = vec4(data.xy, data.z, divergence);

}`;
const Ye = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      resolution: { value: new n.Vector2() },
      dataTex: { value: null }
    },
    vertexShader: z,
    fragmentShader: Xe
  }),
  []
);
var We = `precision highp float;

uniform float alpha;
uniform float beta;
uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: samplePressure = require('./samplePressure.glsl')

void main(){
	vec2 r = resolution;
	vec4 data = texture2D(dataTex, gl_FragCoord.xy / r);

	
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - vec2(1.0, 0.0)) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + vec2(1.0, 0.0)) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - vec2(0.0, 1.0)) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + vec2(0.0, 1.0)) / r, r);

	float divergence = data.w;
	float pressure = (divergence * alpha + (pLeft + pRight + pTop + pBottom)) * 0.25 * beta;
	gl_FragColor = vec4(data.xy, pressure, divergence);
}`;
const ke = () => f(
  () => new n.ShaderMaterial({
    uniforms: {
      resolution: { value: new n.Vector2() },
      dataTex: { value: null },
      alpha: { value: 0 },
      beta: { value: 0 }
    },
    vertexShader: z,
    fragmentShader: We
  }),
  []
), He = ({
  scene: r,
  size: a
}) => {
  const e = f(() => new n.PlaneGeometry(2, 2), []), t = je(), i = t.clone(), l = Ie(), u = Ge(), s = Ye(), c = ke(), v = f(
    () => ({
      velocityMaterial: l,
      advectionMaterial: u,
      divergenceMaterial: s,
      pressureMaterial: c
    }),
    [
      l,
      u,
      s,
      c
    ]
  ), d = F(a);
  _(() => {
    for (const g of Object.values(v))
      o(g, "resolution", d);
  }, [d, v]);
  const m = O(r, e, t);
  _(() => {
    t.dispose(), m.material = i;
  }, [t, m, i]);
  const p = S(
    (g) => {
      m.material = g, m.material.needsUpdate = !0;
    },
    [m]
  );
  return [v, p];
}, at = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), [e, t] = He({ scene: a, size: r }), i = U(r), l = j(), [u, s] = $({
    scene: a,
    camera: i,
    size: r,
    isSizeUpdate: !0
  }), [c, v] = B({
    pressure_iterations: 20,
    attenuation: 1,
    alpha: 1,
    beta: 1,
    viscosity: 0.99,
    forceRadius: 90,
    forceCoefficient: 1
  });
  return {
    updateFx: S(
      (m, p) => {
        const { gl: g, pointer: h } = m;
        v(p), o(
          e.advectionMaterial,
          "attenuation",
          c.attenuation
        ), o(e.pressureMaterial, "alpha", c.alpha), o(e.pressureMaterial, "beta", c.beta), o(e.velocityMaterial, "viscosity", c.viscosity), o(
          e.velocityMaterial,
          "forceRadius",
          c.forceRadius
        ), o(
          e.velocityMaterial,
          "forceCoefficient",
          c.forceCoefficient
        ), s(g, ({ read: P }) => {
          t(e.divergenceMaterial), o(e.divergenceMaterial, "dataTex", P);
        });
        const M = c.pressure_iterations;
        for (let P = 0; P < M; P++)
          s(g, ({ read: E }) => {
            t(e.pressureMaterial), o(e.pressureMaterial, "dataTex", E);
          });
        const { currentPointer: T, prevPointer: b } = l(h);
        return o(e.velocityMaterial, "pointerPos", T), o(
          e.velocityMaterial,
          "beforePointerPos",
          b
        ), s(g, ({ read: P }) => {
          t(e.velocityMaterial), o(e.velocityMaterial, "dataTex", P);
        }), s(g, ({ read: P }) => {
          t(e.advectionMaterial), o(e.advectionMaterial, "dataTex", P);
        });
      },
      [
        e,
        t,
        l,
        s,
        v,
        c
      ]
    ),
    setParams: v,
    fxObject: {
      scene: a,
      materials: e,
      camera: i,
      renderTarget: u
    }
  };
};
var Ke = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ne = `precision mediump float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uImageResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D noise;
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

	
	vec2 noiseMap = texture2D(noise, uv).rg;
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
const Ze = ({
  scene: r,
  size: a
}) => {
  const e = f(() => new n.PlaneGeometry(2, 2), []), t = f(
    () => new n.ShaderMaterial({
      uniforms: {
        uResolution: { value: new n.Vector2() },
        uImageResolution: { value: new n.Vector2() },
        uTexture0: { value: new n.Texture() },
        uTexture1: { value: new n.Texture() },
        noise: { value: new n.Texture() },
        noiseStrength: { value: 0 },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: Ke,
      fragmentShader: Ne
    }),
    []
  ), i = F(a);
  return _(() => {
    t.uniforms.uResolution.value = i.clone();
  }, [i, t]), O(r, e, t), t;
}, it = ({
  size: r
}) => {
  const a = f(() => new n.Scene(), []), e = Ze({ scene: a, size: r }), t = U(r), [i, l] = A({
    scene: a,
    camera: t,
    size: r
  }), [u, s] = B({
    texture0: new n.Texture(),
    texture1: new n.Texture(),
    imageResolution: new n.Vector2(0, 0),
    noise: new n.Texture(),
    noiseStrength: 0,
    progress: 0,
    dir: new n.Vector2(0, 0)
  });
  return {
    updateFx: S(
      (v, d) => {
        const { gl: m } = v;
        return s(d), o(e, "uTexture0", u.texture0), o(e, "uTexture1", u.texture1), o(e, "uImageResolution", u.imageResolution), o(e, "noise", u.noise), o(e, "noiseStrength", u.noiseStrength), o(e, "progress", u.progress), o(e, "dirX", u.dir.x), o(e, "dirY", u.dir.y), l(m);
      },
      [l, e, u, s]
    ),
    setParams: s,
    fxObject: {
      scene: a,
      material: e,
      camera: t,
      renderTarget: i
    }
  };
};
export {
  Qe as useBrush,
  et as useDuoTone,
  tt as useFlowmap,
  nt as useFogProjection,
  rt as useFruid,
  ot as useRipple,
  at as useSimpleFruid,
  it as useTransitionBg
};
//# sourceMappingURL=use-shader-fx.js.map
