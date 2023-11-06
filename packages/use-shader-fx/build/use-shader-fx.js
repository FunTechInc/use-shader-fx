import * as t from "three";
import { useMemo as f, useEffect as _, useRef as C, useLayoutEffect as H, useCallback as P } from "react";
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
const F = (n, u = !1) => {
  const r = u ? n.width * u : n.width, e = u ? n.height * u : n.height;
  return f(
    () => new t.Vector2(r, e),
    [r, e]
  );
}, O = (n, u, r) => {
  const e = f(
    () => new t.Mesh(u, r),
    [u, r]
  );
  return _(() => {
    n.add(e);
  }, [n, e]), e;
}, o = (n, u, r) => {
  n.uniforms && n.uniforms[u] && r !== void 0 && r !== null ? n.uniforms[u].value = r : console.error(
    `Uniform key "${u}" does not exist in the material. or "${u}" is null | undefined`
  );
}, ue = ({
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uMap: {
          value: null
        },
        uResolution: { value: new t.Vector2(0, 0) },
        uAspect: { value: 1 },
        uTexture: { value: new t.Texture() },
        uRadius: { value: 0 },
        uAlpha: { value: 0 },
        uSmudge: { value: 0 },
        uDissipation: { value: 0 },
        uMagnification: { value: 0 },
        uMotionBlur: { value: 0 },
        uMotionSample: { value: 10 },
        uMouse: { value: new t.Vector2(0, 0) },
        uPrevMouse: { value: new t.Vector2(0, 0) },
        uVelocity: { value: new t.Vector2(0, 0) }
      },
      vertexShader: ae,
      fragmentShader: ie
    }),
    []
  ), i = F(u, r);
  return _(() => {
    o(a, "uAspect", i.width / i.height), o(a, "uResolution", i.clone());
  }, [i, a]), O(n, e, a), a;
}, le = (n, u) => {
  const r = u, e = n / u, [a, i] = [r * e / 2, r / 2];
  return { width: a, height: i, near: -1e3, far: 1e3 };
}, U = (n) => {
  const u = F(n), { width: r, height: e, near: a, far: i } = le(
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
      i
    ),
    [r, e, a, i]
  );
}, Y = {
  minFilter: t.LinearFilter,
  magFilter: t.LinearFilter,
  type: t.HalfFloatType,
  depthBuffer: !1,
  stencilBuffer: !1
}, E = ({
  scene: n,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const i = C(), s = F(r, e);
  i.current = f(
    () => new t.WebGLRenderTarget(s.x, s.y, Y),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), H(() => {
    var l;
    a && ((l = i.current) == null || l.setSize(s.x, s.y));
  }, [s, a]);
  const v = P(
    (l, c) => {
      const d = i.current;
      return l.setRenderTarget(d), c && c({ read: d.texture }), l.render(n, u), l.setRenderTarget(null), l.clear(), d.texture;
    },
    [n, u]
  );
  return [i.current, v];
}, A = ({
  scene: n,
  camera: u,
  size: r,
  dpr: e = !1,
  isSizeUpdate: a = !1
}) => {
  const i = C({
    read: null,
    write: null,
    swap: function() {
      let c = this.read;
      this.read = this.write, this.write = c;
    }
  }), s = F(r, e), v = f(() => {
    const c = new t.WebGLRenderTarget(
      s.x,
      s.y,
      Y
    ), d = new t.WebGLRenderTarget(
      s.x,
      s.y,
      Y
    );
    return { read: c, write: d };
  }, []);
  i.current.read = v.read, i.current.write = v.write, H(() => {
    var c, d;
    a && ((c = i.current.read) == null || c.setSize(s.x, s.y), (d = i.current.write) == null || d.setSize(s.x, s.y));
  }, [s, a]);
  const l = P(
    (c, d) => {
      var p;
      const m = i.current;
      return c.setRenderTarget(m.write), d && d({
        read: m.read.texture,
        write: m.write.texture
      }), c.render(n, u), m.swap(), c.setRenderTarget(null), c.clear(), (p = m.read) == null ? void 0 : p.texture;
    },
    [n, u]
  );
  return [
    { read: i.current.read, write: i.current.write },
    l
  ];
}, z = () => {
  const n = C(new t.Vector2(0, 0)), u = C(new t.Vector2(0, 0)), r = C(0), e = C(new t.Vector2(0, 0)), a = C(!1);
  return P((s) => {
    const v = performance.now(), l = s.clone();
    r.current === 0 && (r.current = v, n.current = l);
    const c = Math.max(1, v - r.current);
    r.current = v, e.current.copy(l).sub(n.current).divideScalar(c);
    const d = e.current.length() > 0, m = a.current ? n.current.clone() : l;
    return !a.current && d && (a.current = !0), n.current = l, {
      currentPointer: l,
      prevPointer: m,
      diffPointer: u.current.subVectors(l, m),
      velocity: e.current,
      isVelocityUpdate: d
    };
  }, []);
}, B = (n) => {
  const u = C(n), r = P((e) => {
    for (const a in e) {
      const i = a;
      i in u.current && e[i] !== void 0 && e[i] !== null ? u.current[i] = e[i] : console.error(
        `"${String(
          i
        )}" does not exist in the params. or "${String(
          i
        )}" is null | undefined`
      );
    }
  }, []);
  return [u.current, r];
}, Qe = ({
  size: n,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = ue({ scene: r, size: n, dpr: u }), a = U(n), i = z(), [s, v] = A({
    scene: r,
    camera: a,
    size: n
  }), [l, c] = B({
    texture: new t.Texture(),
    radius: 0,
    alpha: 0,
    smudge: 0,
    dissipation: 0,
    magnification: 0,
    motionBlur: 0,
    motionSample: 10
  });
  return [
    P(
      (m, p) => {
        const { gl: M, pointer: g } = m;
        c(p), o(e, "uTexture", l.texture), o(e, "uRadius", l.radius), o(e, "uAlpha", l.alpha), o(e, "uSmudge", l.smudge), o(e, "uDissipation", l.dissipation), o(e, "uMagnification", l.magnification), o(e, "uMotionBlur", l.motionBlur), o(e, "uMotionSample", l.motionSample);
        const { currentPointer: h, prevPointer: w, velocity: V } = i(g);
        return o(e, "uMouse", h), o(e, "uPrevMouse", w), o(e, "uVelocity", V), v(M, ({ read: L }) => {
          o(e, "uMap", L);
        });
      },
      [e, i, v, l, c]
    ),
    c,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
    }
  ];
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
const ve = (n) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uTexture: { value: new t.Texture() },
        uColor0: { value: new t.Color(16777215) },
        uColor1: { value: new t.Color(0) }
      },
      vertexShader: se,
      fragmentShader: ce
    }),
    []
  );
  return O(n, u, r), r;
}, et = ({
  size: n
}) => {
  const u = f(() => new t.Scene(), []), r = ve(u), e = U(n), [a, i] = E({
    scene: u,
    camera: e,
    size: n
  }), [s, v] = B({
    texture: new t.Texture(),
    color0: new t.Color(16777215),
    color1: new t.Color(0)
  });
  return [
    P(
      (c, d) => {
        const { gl: m } = c;
        return v(d), o(r, "uTexture", s.texture), o(r, "uColor0", s.color0), o(r, "uColor1", s.color1), i(m);
      },
      [i, r, v, s]
    ),
    v,
    {
      scene: u,
      material: r,
      camera: e,
      renderTarget: a
    }
  ];
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
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uMap: { value: null },
        uResolution: { value: new t.Vector2(0, 0) },
        uAspect: { value: 1 },
        uRadius: { value: 0 },
        uAlpha: { value: 0 },
        uDissipation: { value: 0 },
        uMagnification: { value: 0 },
        uMouse: { value: new t.Vector2(0, 0) },
        uVelocity: { value: new t.Vector2(0, 0) }
      },
      vertexShader: fe,
      fragmentShader: de
    }),
    []
  ), i = F(u, r);
  return _(() => {
    o(a, "uAspect", i.width / i.height), o(a, "uResolution", i.clone());
  }, [i, a]), O(n, e, a), a;
}, tt = ({
  size: n,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = me({ scene: r, size: n, dpr: u }), a = U(n), i = z(), [s, v] = A({
    scene: r,
    camera: a,
    size: n
  }), [l, c] = B({
    radius: 0,
    magnification: 0,
    alpha: 0,
    dissipation: 0
  });
  return [
    P(
      (m, p) => {
        const { gl: M, pointer: g } = m;
        c(p), o(e, "uRadius", l.radius), o(e, "uAlpha", l.alpha), o(e, "uDissipation", l.dissipation), o(e, "uMagnification", l.magnification);
        const { currentPointer: h, velocity: w } = i(g);
        return o(e, "uMouse", h), o(e, "uVelocity", w), v(M, ({ read: T }) => {
          o(e, "uMap", T);
        });
      },
      [e, i, v, l, c]
    ),
    c,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: s
    }
  ];
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
const xe = (n) => {
  const u = f(() => new t.PlaneGeometry(2, 2), []), r = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new t.Texture() },
        timeStrength: { value: 0 },
        distortionStrength: { value: 0 },
        fogEdge0: { value: 0 },
        fogEdge1: { value: 0.9 },
        fogColor: { value: new t.Color(16777215) },
        noiseOct: { value: 8 },
        fbmOct: { value: 3 }
      },
      vertexShader: pe,
      fragmentShader: ge
    }),
    []
  );
  return O(n, u, r), r;
}, nt = ({
  size: n
}) => {
  const u = f(() => new t.Scene(), []), r = xe(u), e = U(n), [a, i] = E({
    scene: u,
    camera: e,
    size: n
  }), [s, v] = B({
    texture: new t.Texture(),
    timeStrength: 0,
    distortionStrength: 0,
    fogEdge0: 0,
    fogEdge1: 0.9,
    fogColor: new t.Color(16777215),
    noiseOct: 8,
    fbmOct: 3
  });
  return [
    P(
      (c, d) => {
        const { gl: m, clock: p } = c;
        return v(d), o(r, "uTime", p.getElapsedTime()), o(r, "uTexture", s.texture), o(r, "timeStrength", s.timeStrength), o(r, "distortionStrength", s.distortionStrength), o(r, "fogEdge0", s.fogEdge0), o(r, "fogEdge1", s.fogEdge1), o(r, "fogColor", s.fogColor), o(r, "noiseOct", s.noiseOct), o(r, "fbmOct", s.fbmOct), i(m);
      },
      [i, r, v, s]
    ),
    v,
    {
      scene: u,
      material: r,
      camera: e,
      renderTarget: a
    }
  ];
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
  () => new t.ShaderMaterial({
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
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: new t.Texture() },
      uSource: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() },
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
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
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
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Pe
  }),
  []
);
var Ve = `precision mediump float;
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
const be = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Ve
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
  () => new t.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: 0 },
      texelSize: { value: new t.Vector2() }
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
  () => new t.ShaderMaterial({
    uniforms: {
      uTexture: { value: new t.Texture() },
      value: { value: 0 },
      texelSize: { value: new t.Vector2() }
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
  () => new t.ShaderMaterial({
    uniforms: {
      uPressure: { value: new t.Texture() },
      uVelocity: { value: new t.Texture() },
      texelSize: { value: new t.Vector2() }
    },
    vertexShader: D,
    fragmentShader: Ue
  }),
  []
);
var Le = `precision mediump float;
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
    vertexShader: D,
    fragmentShader: Le
  }),
  []
), $e = ({
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = Me(), i = a.clone(), s = be(), v = _e(), l = Te(), c = Se(), d = Ce(), m = Fe(), p = Be(), M = Oe(), g = f(
    () => ({
      vorticityMaterial: v,
      curlMaterial: s,
      advectionMaterial: l,
      divergenceMaterial: c,
      pressureMaterial: d,
      clearMaterial: m,
      gradientSubtractMaterial: p,
      splatMaterial: M
    }),
    [
      v,
      s,
      l,
      c,
      d,
      m,
      p,
      M
    ]
  ), h = F(u, r);
  _(() => {
    o(
      g.splatMaterial,
      "aspectRatio",
      h.x / h.y
    );
    for (const T of Object.values(g))
      o(
        T,
        "texelSize",
        new t.Vector2(1 / h.x, 1 / h.y)
      );
  }, [h, g]);
  const w = O(n, e, a);
  _(() => {
    a.dispose(), w.material = i;
  }, [a, w, i]);
  const V = P(
    (T) => {
      w.material = T, w.material.needsUpdate = !0;
    },
    [w]
  );
  return [g, V];
}, rt = ({
  size: n,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), [e, a] = $e({ scene: r, size: n, dpr: u }), i = U(n), s = z(), v = f(
    () => ({
      scene: r,
      camera: i,
      size: n,
      dpr: u
    }),
    [r, i, n, u]
  ), [l, c] = A(v), [d, m] = A(v), [p, M] = E(v), [g, h] = E(v), [w, V] = A(v), T = C(0), L = C(new t.Vector2(0, 0)), b = C(new t.Vector3(0, 0, 0)), [S, x] = B({
    density_dissipation: 0,
    velocity_dissipation: 0,
    velocity_acceleration: 0,
    pressure_dissipation: 0,
    pressure_iterations: 20,
    curl_strength: 0,
    splat_radius: 1e-3,
    fruid_color: new t.Vector3(1, 1, 1)
  });
  return [
    P(
      (K, N) => {
        const { gl: R, pointer: Z, clock: G, size: j } = K;
        x(N), T.current === 0 && (T.current = G.getElapsedTime());
        const W = Math.min(
          (G.getElapsedTime() - T.current) / 3,
          0.02
        );
        T.current = G.getElapsedTime();
        const X = c(R, ({ read: y }) => {
          a(e.advectionMaterial), o(e.advectionMaterial, "uVelocity", y), o(e.advectionMaterial, "uSource", y), o(e.advectionMaterial, "dt", W), o(
            e.advectionMaterial,
            "dissipation",
            S.velocity_dissipation
          );
        }), J = m(R, ({ read: y }) => {
          a(e.advectionMaterial), o(e.advectionMaterial, "uVelocity", X), o(e.advectionMaterial, "uSource", y), o(
            e.advectionMaterial,
            "dissipation",
            S.density_dissipation
          );
        }), { currentPointer: Q, diffPointer: ee, isVelocityUpdate: te, velocity: ne } = s(Z);
        te && (c(R, ({ read: y }) => {
          a(e.splatMaterial), o(e.splatMaterial, "uTarget", y), o(e.splatMaterial, "point", Q);
          const $ = ee.multiply(
            L.current.set(j.width, j.height).multiplyScalar(S.velocity_acceleration)
          );
          o(
            e.splatMaterial,
            "color",
            b.current.set($.x, $.y, 1)
          ), o(
            e.splatMaterial,
            "radius",
            S.splat_radius
          );
        }), m(R, ({ read: y }) => {
          a(e.splatMaterial), o(e.splatMaterial, "uTarget", y);
          const $ = typeof S.fruid_color == "function" ? S.fruid_color(ne) : S.fruid_color;
          o(e.splatMaterial, "color", $);
        }));
        const re = M(R, () => {
          a(e.curlMaterial), o(e.curlMaterial, "uVelocity", X);
        });
        c(R, ({ read: y }) => {
          a(e.vorticityMaterial), o(e.vorticityMaterial, "uVelocity", y), o(e.vorticityMaterial, "uCurl", re), o(
            e.vorticityMaterial,
            "curl",
            S.curl_strength
          ), o(e.vorticityMaterial, "dt", W);
        });
        const oe = h(R, () => {
          a(e.divergenceMaterial), o(e.divergenceMaterial, "uVelocity", X);
        });
        V(R, ({ read: y }) => {
          a(e.clearMaterial), o(e.clearMaterial, "uTexture", y), o(
            e.clearMaterial,
            "value",
            S.pressure_dissipation
          );
        }), a(e.pressureMaterial), o(e.pressureMaterial, "uDivergence", oe);
        let k;
        for (let y = 0; y < S.pressure_iterations; y++)
          k = V(R, ({ read: $ }) => {
            o(e.pressureMaterial, "uPressure", $);
          });
        return c(R, ({ read: y }) => {
          a(e.gradientSubtractMaterial), o(
            e.gradientSubtractMaterial,
            "uPressure",
            k
          ), o(e.gradientSubtractMaterial, "uVelocity", y);
        }), J;
      },
      [
        e,
        a,
        M,
        m,
        h,
        s,
        V,
        c,
        x,
        S
      ]
    ),
    x,
    {
      scene: r,
      materials: e,
      camera: i,
      renderTarget: {
        velocity: l,
        density: d,
        curl: p,
        divergence: g,
        pressure: w
      }
    }
  ];
}, Ae = ({ scale: n, max: u, texture: r, scene: e }) => {
  const a = C([]), i = f(
    () => new t.PlaneGeometry(n, n),
    [n]
  ), s = f(
    () => new t.MeshBasicMaterial({
      map: r ?? null,
      transparent: !0,
      blending: t.AdditiveBlending,
      depthTest: !1,
      depthWrite: !1
    }),
    [r]
  );
  return _(() => {
    for (let v = 0; v < u; v++) {
      const l = new t.Mesh(i.clone(), s.clone());
      l.rotateZ(2 * Math.PI * Math.random()), l.visible = !1, e.add(l), a.current.push(l);
    }
  }, [i, s, e, u]), a.current;
}, ot = ({
  texture: n,
  scale: u = 64,
  max: r = 100,
  size: e
}) => {
  const a = f(() => new t.Scene(), []), i = Ae({
    scale: u,
    max: r,
    texture: n,
    scene: a
  }), s = U(e), v = z(), [l, c] = E({
    scene: a,
    camera: s,
    size: e
  }), [d, m] = B({
    frequency: 0.01,
    rotation: 0.01,
    fadeout_speed: 0.9,
    scale: 0.15,
    alpha: 0.6
  }), p = C(0);
  return [
    P(
      (g, h) => {
        const { gl: w, pointer: V, size: T } = g;
        m(h);
        const { currentPointer: L, diffPointer: b } = v(V);
        if (d.frequency < b.length()) {
          const x = i[p.current];
          x.visible = !0, x.position.set(
            L.x * (T.width / 2),
            L.y * (T.height / 2),
            0
          ), x.scale.x = x.scale.y = 0, x.material.opacity = d.alpha, p.current = (p.current + 1) % r;
        }
        return i.forEach((x) => {
          if (x.visible) {
            const q = x.material;
            x.rotation.z += d.rotation, q.opacity *= d.fadeout_speed, x.scale.x = d.fadeout_speed * x.scale.x + d.scale, x.scale.y = x.scale.x, q.opacity < 2e-3 && (x.visible = !1);
          }
        }), c(w);
      },
      [c, i, v, r, d, m]
    ),
    m,
    {
      scene: a,
      camera: s,
      meshArr: i,
      renderTarget: l
    }
  ];
};
var I = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ee = `precision mediump float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const ze = () => f(
  () => new t.ShaderMaterial({
    vertexShader: I,
    fragmentShader: Ee,
    depthTest: !1,
    depthWrite: !1
  }),
  []
);
var Ie = `precision highp float;

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
const qe = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      resolution: { value: new t.Vector2() },
      dataTex: { value: null },
      pointerPos: { value: null },
      beforePointerPos: { value: null },
      viscosity: { value: 0 },
      forceRadius: { value: 0 },
      forceCoefficient: { value: 0 }
    },
    vertexShader: I,
    fragmentShader: Ie
  }),
  []
);
var Ge = `precision highp float;

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
const Xe = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      resolution: { value: new t.Vector2(0, 0) },
      dataTex: { value: null },
      attenuation: { value: 0 }
    },
    vertexShader: I,
    fragmentShader: Ge
  }),
  []
);
var Ye = `precision highp float;

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
const je = () => f(
  () => new t.ShaderMaterial({
    uniforms: {
      resolution: { value: new t.Vector2() },
      dataTex: { value: null }
    },
    vertexShader: I,
    fragmentShader: Ye
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
  () => new t.ShaderMaterial({
    uniforms: {
      resolution: { value: new t.Vector2() },
      dataTex: { value: null },
      alpha: { value: 0 },
      beta: { value: 0 }
    },
    vertexShader: I,
    fragmentShader: We
  }),
  []
), He = ({
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = ze(), i = a.clone(), s = qe(), v = Xe(), l = je(), c = ke(), d = f(
    () => ({
      velocityMaterial: s,
      advectionMaterial: v,
      divergenceMaterial: l,
      pressureMaterial: c
    }),
    [
      s,
      v,
      l,
      c
    ]
  ), m = F(u, r);
  _(() => {
    for (const g of Object.values(d))
      o(g, "resolution", m);
  }, [m, d]);
  const p = O(n, e, a);
  _(() => {
    a.dispose(), p.material = i;
  }, [a, p, i]);
  const M = P(
    (g) => {
      p.material = g, p.material.needsUpdate = !0;
    },
    [p]
  );
  return [d, M];
}, at = ({
  size: n,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), [e, a] = He({ scene: r, size: n, dpr: u }), i = U(n), s = z(), [v, l] = A({
    scene: r,
    camera: i,
    size: n,
    isSizeUpdate: !0
  }), [c, d] = B({
    pressure_iterations: 20,
    attenuation: 1,
    alpha: 1,
    beta: 1,
    viscosity: 0.99,
    forceRadius: 90,
    forceCoefficient: 1
  });
  return [
    P(
      (p, M) => {
        const { gl: g, pointer: h } = p;
        d(M), o(
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
        ), l(g, ({ read: b }) => {
          a(e.divergenceMaterial), o(e.divergenceMaterial, "dataTex", b);
        });
        const w = c.pressure_iterations;
        for (let b = 0; b < w; b++)
          l(g, ({ read: S }) => {
            a(e.pressureMaterial), o(e.pressureMaterial, "dataTex", S);
          });
        const { currentPointer: V, prevPointer: T } = s(h);
        return o(e.velocityMaterial, "pointerPos", V), o(
          e.velocityMaterial,
          "beforePointerPos",
          T
        ), l(g, ({ read: b }) => {
          a(e.velocityMaterial), o(e.velocityMaterial, "dataTex", b);
        }), l(g, ({ read: b }) => {
          a(e.advectionMaterial), o(e.advectionMaterial, "dataTex", b);
        });
      },
      [
        e,
        a,
        s,
        l,
        d,
        c
      ]
    ),
    d,
    {
      scene: r,
      materials: e,
      camera: i,
      renderTarget: v
    }
  ];
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
  scene: n,
  size: u,
  dpr: r
}) => {
  const e = f(() => new t.PlaneGeometry(2, 2), []), a = f(
    () => new t.ShaderMaterial({
      uniforms: {
        uResolution: { value: new t.Vector2() },
        uImageResolution: { value: new t.Vector2() },
        uTexture0: { value: new t.Texture() },
        uTexture1: { value: new t.Texture() },
        noise: { value: new t.Texture() },
        noiseStrength: { value: 0 },
        progress: { value: 0 },
        dirX: { value: 0 },
        dirY: { value: 0 }
      },
      vertexShader: Ke,
      fragmentShader: Ne
    }),
    []
  ), i = F(u, r);
  return _(() => {
    a.uniforms.uResolution.value = i.clone();
  }, [i, a]), O(n, e, a), a;
}, it = ({
  size: n,
  dpr: u
}) => {
  const r = f(() => new t.Scene(), []), e = Ze({ scene: r, size: n, dpr: u }), a = U(n), [i, s] = E({
    scene: r,
    camera: a,
    dpr: u,
    size: n,
    isSizeUpdate: !0
  }), [v, l] = B({
    texture0: new t.Texture(),
    texture1: new t.Texture(),
    imageResolution: new t.Vector2(0, 0),
    noise: new t.Texture(),
    noiseStrength: 0,
    progress: 0,
    dir: new t.Vector2(0, 0)
  });
  return [
    P(
      (d, m) => {
        const { gl: p } = d;
        return l(m), o(e, "uTexture0", v.texture0), o(e, "uTexture1", v.texture1), o(e, "uImageResolution", v.imageResolution), o(e, "noise", v.noise), o(e, "noiseStrength", v.noiseStrength), o(e, "progress", v.progress), o(e, "dirX", v.dir.x), o(e, "dirY", v.dir.y), s(p);
      },
      [s, e, v, l]
    ),
    l,
    {
      scene: r,
      material: e,
      camera: a,
      renderTarget: i
    }
  ];
};
export {
  o as setUniform,
  O as useAddMesh,
  Qe as useBrush,
  U as useCamera,
  A as useDoubleFBO,
  et as useDuoTone,
  tt as useFlowmap,
  nt as useFogProjection,
  rt as useFruid,
  B as useParams,
  z as usePointer,
  F as useResolution,
  ot as useRipple,
  at as useSimpleFruid,
  E as useSingleFBO,
  it as useTransitionBg
};
//# sourceMappingURL=use-shader-fx.js.map
