import * as a from "three";
import { BufferAttribute as De } from "three";
import { useMemo as b, useEffect as ae, useRef as L, useCallback as D, useState as Ee } from "react";
var Le = "#usf <planeVert>", $e = `precision highp float;

uniform sampler2D uBuffer;
uniform sampler2D uTexture;
uniform bool uIsTexture;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform float uMapIntensity;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;
uniform bool uIsCursor;
uniform float uPressureStart;
uniform float uPressureEnd;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float radius, float pressureStart, float pressureEnd) {
	
	float aspect = uResolution.x / uResolution.y;

	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	vec2 dir = normalize(end - start);
	vec2 n = vec2(dir.y, -dir.x);
	vec2 p0 = point - start;
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	float progress = clamp(distAlongLine / totalLength, 0.0, 1.0);
	float pressure = mix(pressureStart, pressureEnd, progress);
	radius = min(radius,radius * pressure);

	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < radius && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < radius || distFromEnd < radius;

	return float(withinLine);
}

vec4 createSmudge(vec2 uv){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);

	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uBuffer, uv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

vec4 createMotionBlur(vec2 uv , vec4 baseColor, vec2 velocity) {
	vec2 scaledV = velocity * uMotionBlur;
	for(int i = 1; i < uMotionSample; i++) {
		float t = float(i) / float(uMotionSample - 1);
		vec2 offset = t * scaledV / uResolution;
		baseColor += texture2D(uBuffer, uv + offset);
	}
	return baseColor / float(uMotionSample);
}

void main() {

	vec2 uv = vUv;
	if(uIsMap){
		vec2 mapColor = texture2D(uMap, uv).rg;
		vec2 normalizedMap = mapColor * 2.0 - 1.0;
		uv = uv * 2.0 - 1.0;
		uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
		uv = (uv + 1.0) / 2.0;
	}
	vec2 suv = uv*2.-1.;

	vec2 velocity = uVelocity * uResolution;

	float radius = max(0.0,uRadius);
	
	vec4 smudgedColor = uSmudge > 0. ? createSmudge(uv) : texture2D(uBuffer, uv);

	vec4 motionBlurredColor = uMotionBlur > 0. ? createMotionBlur(uv,smudgedColor, velocity) : smudgedColor;

	vec4 bufferColor = motionBlurredColor;
	bufferColor.a = bufferColor.a < 1e-10 ? 0.0 : bufferColor.a * uDissipation;
	
	vec4 brushColor = uIsTexture ? texture2D(uTexture, uv) : vec4(uColor,1.);
	
	float onLine = isOnLine(suv, uPrevMouse, uMouse, radius, uPressureStart,uPressureEnd);
	float isOnLine = length(velocity) > 0. ? onLine : uIsCursor ? onLine : 0.;

	vec4 finalColor = mix(bufferColor, brushColor, isOnLine);

	gl_FragColor = finalColor;
}`;
const Y = (e, t = !1) => {
  const n = t ? e.width * t : e.width, r = t ? e.height * t : e.height;
  return b(
    () => new a.Vector2(n, r),
    [n, r]
  );
}, A = (e) => (t, n) => {
  if (n === void 0)
    return;
  const r = e.uniforms;
  r && r[t] && (r[t].value = n);
}, z = (e) => (t) => {
  t !== void 0 && Object.keys(t).forEach((n) => {
    const r = e.uniforms;
    r && r[n] && (r[n].value = t[n]);
  });
}, $ = (e, t, n, r) => {
  const i = b(() => {
    const v = new r(t, n);
    return e && e.add(v), v;
  }, [t, n, r, e]);
  return ae(() => () => {
    e && e.remove(i), t.dispose(), n.dispose();
  }, [e, t, n, i]), i;
}, Ie = process.env.NODE_ENV === "development", B = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, T = new a.DataTexture(
  new Uint8Array([0, 0, 0, 0]),
  1,
  1,
  a.RGBAFormat
);
var je = `vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip)
{
	const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
	vec4 p,s;

	p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
	p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
	s = vec4(lessThan(p, vec4(0.0)));
	p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

	return p;
}

float simplexNoise4d(vec4 v)
{
	const vec2  C = vec2( 0.138196601125010504,  
									0.309016994374947451); 
	
	vec4 i  = floor(v + dot(v, C.yyyy) );
	vec4 x0 = v -   i + dot(i, C.xxxx);

	

	
	vec4 i0;

	vec3 isX = step( x0.yzw, x0.xxx );
	vec3 isYZ = step( x0.zww, x0.yyz );
	
	i0.x = isX.x + isX.y + isX.z;
	i0.yzw = 1.0 - isX;

	
	i0.y += isYZ.x + isYZ.y;
	i0.zw += 1.0 - isYZ.xy;

	i0.z += isYZ.z;
	i0.w += 1.0 - isYZ.z;

	
	vec4 i3 = clamp( i0, 0.0, 1.0 );
	vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
	vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

	
	vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
	vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
	vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
	vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

	
	i = mod(i, 289.0); 
	float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
	vec4 j1 = permute( permute( permute( permute (
					i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
				+ i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
				+ i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
				+ i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
	
	
	

	vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

	vec4 p0 = grad4(j0,   ip);
	vec4 p1 = grad4(j1.x, ip);
	vec4 p2 = grad4(j1.y, ip);
	vec4 p3 = grad4(j1.z, ip);
	vec4 p4 = grad4(j1.w, ip);

	
	vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	p4 *= taylorInvSqrt(dot(p4,p4));

	
	vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
	vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
	m0 = m0 * m0;
	m1 = m1 * m1;
	return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
						+ dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

float getWobble(vec3 position)
{
	vec3 warpedPosition = position;
	warpedPosition += simplexNoise4d(
		vec4(
				position * uWarpPositionFrequency,
				uTime * uWarpTimeFrequency
		)
	) * uWarpStrength;

	return simplexNoise4d(vec4(
		warpedPosition * uWobblePositionFrequency, 
		uTime * uWobbleTimeFrequency          
	)) * uWobbleStrength;
}`, qe = `vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;

float snoise(vec3 p) {

	vec3 s = floor(p + dot(p, vec3(F3)));
	vec3 x = p - s + dot(s, vec3(G3));
	
	vec3 e = step(vec3(0.0), x - x.yzx);
	vec3 i1 = e*(1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy*(1.0 - e);
 	
	vec3 x1 = x - i1 + G3;
	vec3 x2 = x - i2 + 2.0*G3;
	vec3 x3 = x - 1.0 + 3.0*G3;
	 
	vec4 w, d;
	 
	w.x = dot(x, x);
	w.y = dot(x1, x1);
	w.z = dot(x2, x2);
	w.w = dot(x3, x3);
	 
	w = max(0.6 - w, 0.0);
	 
	d.x = dot(random3(s), x);
	d.y = dot(random3(s + i1), x1);
	d.z = dot(random3(s + i2), x2);
	d.w = dot(random3(s + 1.0), x3);
	 
	w *= w;
	w *= w;
	d *= w;
	 
	return dot(d, vec4(52.0));
}

float snoiseFractal(vec3 m) {
	return   0.5333333* snoise(m)
				+0.2666667* snoise(2.0*m)
				+0.1333333* snoise(4.0*m)
				+0.0666667* snoise(8.0*m);
}`, We = `float screenAspect = uResolution.x / uResolution.y;
float textureAspect = uTextureResolution.x / uTextureResolution.y;
vec2 aspectRatio = vec2(
	min(screenAspect / textureAspect, 1.0),
	min(textureAspect / screenAspect, 1.0)
);
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`, Ne = `vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`, ke = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`;
const Ge = {
  wobble3D: je,
  snoise: qe,
  coverTexture: We,
  fxBlending: Ne,
  planeVert: ke
}, Ke = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function Xe(e, t) {
  let n = Ge[t] || "";
  return be(n);
}
function be(e) {
  return e.replace(Ke, Xe);
}
const He = (e) => {
  e.vertexShader = be(e.vertexShader), e.fragmentShader = be(e.fragmentShader);
}, V = (e) => (t, n) => {
  e && e(t, n), He(t);
}, Ye = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: i
}) => {
  const v = b(() => new a.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uBuffer: { value: T },
        uResolution: { value: new a.Vector2(0, 0) },
        uTexture: { value: T },
        uIsTexture: { value: !1 },
        uMap: { value: T },
        uIsMap: { value: !1 },
        uMapIntensity: { value: ne.mapIntensity },
        uRadius: { value: ne.radius },
        uSmudge: { value: ne.smudge },
        uDissipation: { value: ne.dissipation },
        uMotionBlur: { value: ne.motionBlur },
        uMotionSample: { value: ne.motionSample },
        uMouse: { value: new a.Vector2(-10, -10) },
        uPrevMouse: { value: new a.Vector2(-10, -10) },
        uVelocity: { value: new a.Vector2(0, 0) },
        uColor: { value: ne.color },
        uIsCursor: { value: !1 },
        uPressureStart: { value: 1 },
        uPressureEnd: { value: 1 },
        ...r
      },
      vertexShader: Le,
      fragmentShader: $e,
      ...B,
      // Must be transparent
      transparent: !0
    });
    return f.onBeforeCompile = V(i), f;
  }, [i, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = $(e, v, s, a.Mesh);
  return { material: s, mesh: c };
}, Qe = (e, t) => {
  const n = t, r = e / t, [i, v] = [n * r / 2, n / 2];
  return { width: i, height: v, near: -1e3, far: 1e3 };
}, j = (e, t = "OrthographicCamera") => {
  const n = Y(e), { width: r, height: i, near: v, far: s } = Qe(
    n.x,
    n.y
  );
  return b(() => t === "OrthographicCamera" ? new a.OrthographicCamera(
    -r,
    r,
    i,
    -i,
    v,
    s
  ) : new a.PerspectiveCamera(50, r / i), [r, i, v, s, t]);
}, _e = (e = 0) => {
  const t = L(new a.Vector2(0, 0)), n = L(new a.Vector2(0, 0)), r = L(new a.Vector2(0, 0)), i = L(0), v = L(new a.Vector2(0, 0)), s = L(!1);
  return D(
    (c) => {
      const f = performance.now();
      let d;
      s.current && e ? (r.current = r.current.lerp(
        c,
        1 - e
      ), d = r.current.clone()) : (d = c.clone(), r.current = d), i.current === 0 && (i.current = f, t.current = d);
      const y = Math.max(1, f - i.current);
      i.current = f, v.current.copy(d).sub(t.current).divideScalar(y);
      const x = v.current.length() > 0, o = s.current ? t.current.clone() : d;
      return !s.current && x && (s.current = !0), t.current = d, {
        currentPointer: d,
        prevPointer: o,
        diffPointer: n.current.subVectors(d, o),
        velocity: v.current,
        isVelocityUpdate: x
      };
    },
    [e]
  );
}, q = (e) => {
  const n = L(
    ((i) => Object.values(i).some((v) => typeof v == "function"))(e) ? e : structuredClone(e)
  ), r = D((i) => {
    if (i !== void 0)
      for (const v in i) {
        const s = v;
        s in n.current && i[s] !== void 0 && i[s] !== null ? n.current[s] = i[s] : console.error(
          `"${String(
            s
          )}" does not exist in the params. or "${String(
            s
          )}" is null | undefined`
        );
      }
  }, []);
  return [n.current, r];
}, he = {
  minFilter: a.LinearFilter,
  magFilter: a.LinearFilter,
  type: a.HalfFloatType,
  stencilBuffer: !1
}, Ce = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: i,
  onSwap: v
}) => {
  e.setRenderTarget(t), i(), e.clear(), e.render(n, r), v && v(), e.setRenderTarget(null), e.clear();
}, W = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: i = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var y;
  const c = L(), f = Y(n, r);
  c.current = b(
    () => {
      const x = new a.WebGLRenderTarget(
        f.x,
        f.y,
        {
          ...he,
          samples: v,
          depthBuffer: s
        }
      );
      return u && (x.depthTexture = new a.DepthTexture(
        f.x,
        f.y,
        a.FloatType
      )), x;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), i && ((y = c.current) == null || y.setSize(f.x, f.y)), ae(() => {
    const x = c.current;
    return () => {
      x == null || x.dispose();
    };
  }, []);
  const d = D(
    (x, o) => {
      const g = c.current;
      return Ce({
        gl: x,
        fbo: g,
        scene: e,
        camera: t,
        onBeforeRender: () => o && o({ read: g.texture })
      }), g.texture;
    },
    [e, t]
  );
  return [c.current, d];
}, se = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: i = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}) => {
  var x, o;
  const c = L({
    read: null,
    write: null,
    swap: function() {
      let g = this.read;
      this.read = this.write, this.write = g;
    }
  }), f = Y(n, r), d = b(() => {
    const g = new a.WebGLRenderTarget(f.x, f.y, {
      ...he,
      samples: v,
      depthBuffer: s
    }), l = new a.WebGLRenderTarget(f.x, f.y, {
      ...he,
      samples: v,
      depthBuffer: s
    });
    return u && (g.depthTexture = new a.DepthTexture(
      f.x,
      f.y,
      a.FloatType
    ), l.depthTexture = new a.DepthTexture(
      f.x,
      f.y,
      a.FloatType
    )), { read: g, write: l };
  }, []);
  c.current.read = d.read, c.current.write = d.write, i && ((x = c.current.read) == null || x.setSize(f.x, f.y), (o = c.current.write) == null || o.setSize(f.x, f.y)), ae(() => {
    const g = c.current;
    return () => {
      var l, p;
      (l = g.read) == null || l.dispose(), (p = g.write) == null || p.dispose();
    };
  }, []);
  const y = D(
    (g, l) => {
      var m;
      const p = c.current;
      return Ce({
        gl: g,
        scene: e,
        camera: t,
        fbo: p.write,
        onBeforeRender: () => l && l({
          read: p.read.texture,
          write: p.write.texture
        }),
        onSwap: () => p.swap()
      }), (m = p.read) == null ? void 0 : m.texture;
    },
    [e, t]
  );
  return [
    { read: c.current.read, write: c.current.write },
    y
  ];
}, U = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, ne = Object.freeze({
  texture: !1,
  map: !1,
  mapIntensity: 0.1,
  radius: 0.05,
  smudge: 0,
  dissipation: 1,
  motionBlur: 0,
  motionSample: 5,
  color: new a.Vector3(1, 0, 0),
  isCursor: !1,
  pressure: 1,
  pointerValues: !1
}), Gn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Ye({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), y = _e(), [x, o] = se({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [g, l] = q(ne), p = L(null), m = A(c), C = z(c), M = D(
    (S, _) => {
      l(S), C(_);
    },
    [l, C]
  );
  return [
    D(
      (S, _, w) => {
        const { gl: I, pointer: R } = S;
        M(_, w), g.texture ? (m("uIsTexture", !0), m("uTexture", g.texture)) : m("uIsTexture", !1), g.map ? (m("uIsMap", !0), m("uMap", g.map), m("uMapIntensity", g.mapIntensity)) : m("uIsMap", !1), m("uRadius", g.radius), m("uSmudge", g.smudge), m("uDissipation", g.dissipation), m("uMotionBlur", g.motionBlur), m("uMotionSample", g.motionSample);
        const F = g.pointerValues || y(R);
        F.isVelocityUpdate && (m("uMouse", F.currentPointer), m("uPrevMouse", F.prevPointer)), m("uVelocity", F.velocity);
        const P = typeof g.color == "function" ? g.color(F.velocity) : g.color;
        return m("uColor", P), m("uIsCursor", g.isCursor), m("uPressureEnd", g.pressure), p.current === null && (p.current = g.pressure), m("uPressureStart", p.current), p.current = g.pressure, o(I, ({ read: O }) => {
          m("uBuffer", O);
        });
      },
      [m, y, o, g, M]
    ),
    M,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var ee = `varying vec2 vUv;
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
}`, Ze = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const Je = () => b(() => new a.ShaderMaterial({
  vertexShader: ee,
  fragmentShader: Ze,
  ...B
}), []);
var et = `precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
	gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb,1.);
}`;
const tt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: T },
      uSource: { value: T },
      texelSize: { value: new a.Vector2() },
      dt: { value: Fe },
      dissipation: { value: 0 },
      ...t
    },
    vertexShader: ee,
    fragmentShader: et,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var nt = `precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

vec2 sampleVelocity(in vec2 uv) {
	vec2 clampedUV = clamp(uv, 0.0, 1.0);
	vec2 multiplier = vec2(1.0, 1.0);
	multiplier.x = uv.x < 0.0 || uv.x > 1.0 ? -1.0 : 1.0;
	multiplier.y = uv.y < 0.0 || uv.y > 1.0 ? -1.0 : 1.0;
	return multiplier * texture2D(uVelocity, clampedUV).xy;
}

void main () {
	float L = sampleVelocity(vL).x;
	float R = sampleVelocity(vR).x;
	float T = sampleVelocity(vT).y;
	float B = sampleVelocity(vB).y;
	float div = 0.5 * (R - L + T - B);
	gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;
const rt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: nt,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var ot = `precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
	float L = texture2D(uPressure, clamp(vL,0.,1.)).x;
	float R = texture2D(uPressure, clamp(vR,0.,1.)).x;
	float T = texture2D(uPressure, clamp(vT,0.,1.)).x;
	float B = texture2D(uPressure, clamp(vB,0.,1.)).x;
	float C = texture2D(uPressure, vUv).x;
	float divergence = texture2D(uDivergence, vUv).x;
	float pressure = (L + R + B + T - divergence) * 0.25;
	gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;
const at = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uPressure: { value: null },
      uDivergence: { value: null },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: ot,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var it = `precision highp float;

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
const ut = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: it,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var st = `precision highp float;

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
const lt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: 0 },
      dt: { value: Fe },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: st,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var ct = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const vt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uTexture: { value: T },
      value: { value: 0 },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: ct,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var pt = `precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uPressure, clamp(vL,0.,1.)).x;
	float R = texture2D(uPressure, clamp(vR,0.,1.)).x;
	float T = texture2D(uPressure, clamp(vT,0.,1.)).x;
	float B = texture2D(uPressure, clamp(vB,0.,1.)).x;
	vec2 velocity = texture2D(uVelocity, vUv).xy;
	velocity.xy -= vec2(R - L, T - B);
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;
const mt = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uPressure: { value: T },
      uVelocity: { value: T },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: pt,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]);
var dt = `precision highp float;

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
const ft = ({
  onBeforeCompile: e,
  uniforms: t
}) => b(() => {
  const r = new a.ShaderMaterial({
    uniforms: {
      uTarget: { value: T },
      aspectRatio: { value: 0 },
      color: { value: new a.Vector3() },
      point: { value: new a.Vector2() },
      radius: { value: 0 },
      texelSize: { value: new a.Vector2() },
      ...t
    },
    vertexShader: ee,
    fragmentShader: dt,
    ...B
  });
  return r.onBeforeCompile = V(e), r;
}, [e, t]), Q = (e, t) => e(t ?? {}), gt = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: r
}) => {
  const i = b(() => new a.PlaneGeometry(2, 2), []), {
    curl: v,
    vorticity: s,
    advection: u,
    divergence: c,
    pressure: f,
    clear: d,
    gradientSubtract: y,
    splat: x
  } = r ?? {}, o = Q(Je), g = o.clone(), l = Q(ut, v), p = Q(lt, s), m = Q(tt, u), C = Q(
    rt,
    c
  ), M = Q(at, f), h = Q(vt, d), S = Q(
    mt,
    y
  ), _ = Q(ft, x), w = b(
    () => ({
      vorticityMaterial: p,
      curlMaterial: l,
      advectionMaterial: m,
      divergenceMaterial: C,
      pressureMaterial: M,
      clearMaterial: h,
      gradientSubtractMaterial: S,
      splatMaterial: _
    }),
    [
      p,
      l,
      m,
      C,
      M,
      h,
      S,
      _
    ]
  ), I = Y(t, n);
  b(() => {
    A(w.splatMaterial)(
      "aspectRatio",
      I.x / I.y
    );
    for (const P of Object.values(w))
      A(P)(
        "texelSize",
        new a.Vector2(1 / I.x, 1 / I.y)
      );
  }, [I, w]);
  const R = $(e, i, o, a.Mesh);
  b(() => {
    o.dispose(), R.material = g;
  }, [o, R, g]), ae(() => () => {
    for (const P of Object.values(w))
      P.dispose();
  }, [w]);
  const F = D(
    (P) => {
      R.material = P, R.material.needsUpdate = !0;
    },
    [R]
  );
  return { materials: w, setMeshMaterial: F, mesh: R };
}, Fe = 0.016, ht = Object.freeze({
  density_dissipation: 0.98,
  velocity_dissipation: 0.99,
  velocity_acceleration: 10,
  pressure_dissipation: 0.9,
  pressure_iterations: 20,
  curl_strength: 35,
  splat_radius: 2e-3,
  fluid_color: new a.Vector3(1, 1, 1),
  pointerValues: !1
}), Kn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  customFluidProps: i
}) => {
  const v = U(t), s = b(() => new a.Scene(), []), { materials: u, setMeshMaterial: c, mesh: f } = gt({
    scene: s,
    size: e,
    dpr: v.shader,
    customFluidProps: i
  }), d = j(e), y = _e(), x = b(
    () => ({
      scene: s,
      camera: d,
      dpr: v.fbo,
      size: e,
      samples: n,
      isSizeUpdate: r
    }),
    [s, d, e, n, v.fbo, r]
  ), [o, g] = se(x), [l, p] = se(x), [m, C] = W(x), [M, h] = W(x), [S, _] = se(x), w = L(new a.Vector2(0, 0)), I = L(new a.Vector3(0, 0, 0)), [R, F] = q(ht), P = b(
    () => ({
      advection: A(u.advectionMaterial),
      splat: A(u.splatMaterial),
      curl: A(u.curlMaterial),
      vorticity: A(u.vorticityMaterial),
      divergence: A(u.divergenceMaterial),
      clear: A(u.clearMaterial),
      pressure: A(u.pressureMaterial),
      gradientSubtract: A(u.gradientSubtractMaterial)
    }),
    [u]
  ), O = b(
    () => ({
      advection: z(u.advectionMaterial),
      splat: z(u.splatMaterial),
      curl: z(u.curlMaterial),
      vorticity: z(u.vorticityMaterial),
      divergence: z(u.divergenceMaterial),
      clear: z(u.clearMaterial),
      pressure: z(u.pressureMaterial),
      gradientSubtract: z(u.gradientSubtractMaterial)
    }),
    [u]
  ), k = D(
    (H, K) => {
      F(H), K && Object.keys(K).forEach((ie) => {
        O[ie](
          K[ie]
        );
      });
    },
    [F, O]
  );
  return [
    D(
      (H, K, ie) => {
        const { gl: X, pointer: xe, size: we } = H;
        k(K, ie);
        const ye = g(X, ({ read: G }) => {
          c(u.advectionMaterial), P.advection("uVelocity", G), P.advection("uSource", G), P.advection(
            "dissipation",
            R.velocity_dissipation
          );
        }), Be = p(X, ({ read: G }) => {
          c(u.advectionMaterial), P.advection("uVelocity", ye), P.advection("uSource", G), P.advection(
            "dissipation",
            R.density_dissipation
          );
        }), me = R.pointerValues || y(xe);
        me.isVelocityUpdate && (g(X, ({ read: G }) => {
          c(u.splatMaterial), P.splat("uTarget", G), P.splat("point", me.currentPointer);
          const le = me.diffPointer.multiply(
            w.current.set(we.width, we.height).multiplyScalar(R.velocity_acceleration)
          );
          P.splat(
            "color",
            I.current.set(le.x, le.y, 1)
          ), P.splat("radius", R.splat_radius);
        }), p(X, ({ read: G }) => {
          c(u.splatMaterial), P.splat("uTarget", G);
          const le = typeof R.fluid_color == "function" ? R.fluid_color(me.velocity) : R.fluid_color;
          P.splat("color", le);
        }));
        const Oe = C(X, () => {
          c(u.curlMaterial), P.curl("uVelocity", ye);
        });
        g(X, ({ read: G }) => {
          c(u.vorticityMaterial), P.vorticity("uVelocity", G), P.vorticity("uCurl", Oe), P.vorticity("curl", R.curl_strength);
        });
        const Ue = h(X, () => {
          c(u.divergenceMaterial), P.divergence("uVelocity", ye);
        });
        _(X, ({ read: G }) => {
          c(u.clearMaterial), P.clear("uTexture", G), P.clear("value", R.pressure_dissipation);
        }), c(u.pressureMaterial), P.pressure("uDivergence", Ue);
        let Te;
        for (let G = 0; G < R.pressure_iterations; G++)
          Te = _(X, ({ read: le }) => {
            P.pressure("uPressure", le);
          });
        return g(X, ({ read: G }) => {
          c(u.gradientSubtractMaterial), P.gradientSubtract("uPressure", Te), P.gradientSubtract("uVelocity", G);
        }), Be;
      },
      [
        u,
        P,
        c,
        C,
        p,
        h,
        y,
        _,
        g,
        R,
        k
      ]
    ),
    k,
    {
      scene: s,
      mesh: f,
      materials: u,
      camera: d,
      renderTarget: {
        velocity: o,
        density: l,
        curl: m,
        divergence: M,
        pressure: S
      },
      output: l.read.texture
    }
  ];
};
var xt = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`, yt = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const bt = ({
  scale: e,
  max: t,
  texture: n,
  scene: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = b(
    () => new a.PlaneGeometry(e, e),
    [e]
  ), u = b(() => new a.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uMap: { value: n || T },
      ...i
    },
    blending: a.AdditiveBlending,
    vertexShader: xt,
    fragmentShader: yt,
    ...B,
    // Must be transparent.
    transparent: !0
  }), [n, i]), c = b(() => {
    const f = [];
    for (let d = 0; d < t; d++) {
      const y = u.clone();
      y.onBeforeCompile = V(v);
      const x = new a.Mesh(s.clone(), y);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, r.add(x), f.push(x);
    }
    return f;
  }, [v, s, u, r, t]);
  return ae(() => () => {
    c.forEach((f) => {
      f.geometry.dispose(), Array.isArray(f.material) ? f.material.forEach((d) => d.dispose()) : f.material.dispose(), r.remove(f);
    });
  }, [r, c]), c;
}, Mt = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeout_speed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), Xn = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: r,
  dpr: i,
  samples: v,
  isSizeUpdate: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = U(i), d = b(() => new a.Scene(), []), y = bt({
    scale: t,
    max: n,
    texture: e,
    scene: d,
    uniforms: u,
    onBeforeCompile: c
  }), x = j(r), o = _e(), [g, l] = W({
    scene: d,
    camera: x,
    size: r,
    dpr: f.fbo,
    samples: v,
    isSizeUpdate: s
  }), [p, m] = q(Mt), C = L(0), M = b(() => (S, _) => {
    m(S), y.forEach((w) => {
      if (w.visible) {
        const I = w.material;
        w.rotation.z += p.rotation, w.scale.x = p.fadeout_speed * w.scale.x + p.scale, w.scale.y = w.scale.x;
        const R = I.uniforms.uOpacity.value;
        A(I)(
          "uOpacity",
          R * p.fadeout_speed
        ), R < 1e-3 && (w.visible = !1);
      }
      z(w.material)(_);
    });
  }, [y, p, m]);
  return [
    D(
      (S, _, w) => {
        const { gl: I, pointer: R, size: F } = S;
        M(_, w);
        const P = p.pointerValues || o(R);
        if (p.frequency < P.diffPointer.length()) {
          const O = y[C.current], k = O.material;
          O.visible = !0, O.position.set(
            P.currentPointer.x * (F.width / 2),
            P.currentPointer.y * (F.height / 2),
            0
          ), O.scale.x = O.scale.y = 0, A(k)("uOpacity", p.alpha), C.current = (C.current + 1) % n;
        }
        return l(I);
      },
      [l, y, o, n, p, M]
    ),
    M,
    {
      scene: d,
      camera: x,
      meshArr: y,
      renderTarget: g,
      output: g.texture
    }
  ];
};
var St = "#usf <planeVert>", _t = `precision highp float;
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
const Ct = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        scale: { value: re.scale },
        timeStrength: { value: re.timeStrength },
        noiseOctaves: { value: re.noiseOctaves },
        fbmOctaves: { value: re.fbmOctaves },
        warpOctaves: { value: re.warpOctaves },
        warpDirection: { value: re.warpDirection },
        warpStrength: { value: re.warpStrength },
        ...t
      },
      vertexShader: St,
      fragmentShader: _t,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, re = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new a.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), Hn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Ct({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(re), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: w } = M;
        return m(h, S), l("scale", o.scale), l("timeStrength", o.timeStrength), l("noiseOctaves", o.noiseOctaves), l("fbmOctaves", o.fbmOctaves), l("warpOctaves", o.warpOctaves), l("warpDirection", o.warpDirection), l("warpStrength", o.warpStrength), l("uTime", o.beat || w.getElapsedTime()), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var wt = "#usf <planeVert>", Tt = `precision highp float;
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
const Dt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        isTexture: { value: !1 },
        scale: { value: Z.scale },
        noise: { value: T },
        noiseStrength: { value: Z.noiseStrength },
        isNoise: { value: !1 },
        laminateLayer: { value: Z.laminateLayer },
        laminateInterval: { value: Z.laminateInterval },
        laminateDetail: { value: Z.laminateDetail },
        distortion: { value: Z.distortion },
        colorFactor: { value: Z.colorFactor },
        uTime: { value: 0 },
        timeStrength: { value: Z.timeStrength },
        ...t
      },
      vertexShader: wt,
      fragmentShader: Tt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, Z = Object.freeze({
  texture: !1,
  scale: 1,
  laminateLayer: 1,
  laminateInterval: new a.Vector2(0.1, 0.1),
  laminateDetail: new a.Vector2(1, 1),
  distortion: new a.Vector2(0, 0),
  colorFactor: new a.Vector3(1, 1, 1),
  timeStrength: new a.Vector2(0, 0),
  noise: !1,
  noiseStrength: new a.Vector2(0, 0),
  beat: !1
}), Yn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Dt({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(Z), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: w } = M;
        return m(h, S), o.texture ? (l("uTexture", o.texture), l("isTexture", !0)) : (l("isTexture", !1), l("scale", o.scale)), o.noise ? (l("noise", o.noise), l("isNoise", !0), l("noiseStrength", o.noiseStrength)) : l("isNoise", !1), l("uTime", o.beat || w.getElapsedTime()), l("laminateLayer", o.laminateLayer), l("laminateInterval", o.laminateInterval), l("laminateDetail", o.laminateDetail), l("distortion", o.distortion), l("colorFactor", o.colorFactor), l("timeStrength", o.timeStrength), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Pt = "#usf <planeVert>", Rt = `precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform float u_pattern;
uniform float u_complexity;
uniform float u_complexityAttenuation;
uniform float u_iterations;
uniform float u_timeStrength;
uniform float u_scale;

vec3 marble(vec3 p){
	vec4 n;
	for(float i;i<u_iterations;i++){
		p+=sin(p.yzx + u_pattern);
		n=u_complexity*n+vec4(cross(cos(p + u_pattern),sin(p.zxy + u_pattern)),1.)*(1.+i*u_complexityAttenuation);
		p*=u_complexity;
	}
	return n.xyz/n.w;
}

void main() {
	float time = u_time * u_timeStrength;
	vec3 color = clamp(marble(vec3(gl_FragCoord.xy*u_scale,time)),0.,1.);
	gl_FragColor = vec4(color,1.);
}`;
const At = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_pattern: { value: ue.pattern },
        u_complexity: { value: ue.complexity },
        u_complexityAttenuation: {
          value: ue.complexityAttenuation
        },
        u_iterations: { value: ue.iterations },
        u_timeStrength: { value: ue.timeStrength },
        u_scale: { value: ue.scale },
        ...t
      },
      vertexShader: Pt,
      fragmentShader: Rt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, ue = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), Qn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = At({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(ue), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _, clock: w } = M;
        return m(h, S), l("u_pattern", o.pattern), l("u_complexity", o.complexity), l("u_complexityAttenuation", o.complexityAttenuation), l("u_iterations", o.iterations), l("u_timeStrength", o.timeStrength), l("u_scale", o.scale), l("u_time", o.beat || w.getElapsedTime()), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var It = "#usf <planeVert>", Ft = `precision highp float;
precision highp int;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uRgbWeight;

vec3 cosPalette(  float t,  vec3 color1,  vec3 color2,  vec3 color3, vec3 color4 ){
    return color1 + color2 * cos( 6.28318 * ( color3 * t + color4) );
}

void main() {

	vec4 tex = texture2D(uTexture, vUv);
	float gray = dot(tex.rgb, uRgbWeight);		

	vec3 outColor = cosPalette(
		gray,
		uColor1,
		uColor2,
		uColor3,
		uColor4
	);

	gl_FragColor = vec4(outColor, tex.a);
}`;
const Vt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uRgbWeight: { value: ce.rgbWeight },
        uColor1: { value: ce.color1 },
        uColor2: { value: ce.color2 },
        uColor3: { value: ce.color3 },
        uColor4: { value: ce.color4 },
        ...t
      },
      vertexShader: It,
      fragmentShader: Ft,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, ce = Object.freeze({
  texture: T,
  color1: new a.Color().set(0.5, 0.5, 0.5),
  color2: new a.Color().set(0.5, 0.5, 0.5),
  color3: new a.Color().set(1, 1, 1),
  color4: new a.Color().set(0, 0.1, 0.2),
  rgbWeight: new a.Vector3(0.299, 0.587, 0.114)
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Vt({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(ce), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("uTexture", o.texture), l("uColor1", o.color1), l("uColor2", o.color2), l("uColor3", o.color3), l("uColor4", o.color4), l("uRgbWeight", o.rgbWeight), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var zt = "#usf <planeVert>", Bt = `precision highp float;

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
const Ot = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uColor0: { value: Me.color0 },
        uColor1: { value: Me.color1 },
        ...t
      },
      vertexShader: zt,
      fragmentShader: Bt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, Me = Object.freeze({
  texture: T,
  color0: new a.Color(16777215),
  color1: new a.Color(0)
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Ot({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(Me), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("uTexture", o.texture), l("uColor0", o.color0), l("uColor1", o.color1), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Ut = "#usf <planeVert>", Et = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform bool u_isAlphaMap;
uniform sampler2D u_alphaMap;
uniform float uMapIntensity;
uniform vec3 u_brightness;
uniform float u_min;
uniform float u_max;
uniform vec3 u_dodgeColor;
uniform bool u_isDodgeColor;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	
	float brightness = dot(mapColor,u_brightness);
	vec4 textureMap = texture2D(u_texture, uv);
	float blendValue = smoothstep(u_min, u_max, brightness);

	
	vec3 dodgeColor = u_isDodgeColor ? u_dodgeColor : mapColor;
	vec3 outputColor = blendValue * dodgeColor + (1.0 - blendValue) * textureMap.rgb;
	
	
	float alpha = u_isAlphaMap ? texture2D(u_alphaMap, uv).a : textureMap.a;
	float mixValue = u_isAlphaMap ? alpha : 0.0;
	vec3 alphaColor = vec3(mix(outputColor,mapColor,mixValue));

	gl_FragColor = vec4(alphaColor,alpha);
}`;
const Lt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        uMap: { value: T },
        u_alphaMap: { value: T },
        u_isAlphaMap: { value: !1 },
        uMapIntensity: { value: ve.mapIntensity },
        u_brightness: { value: ve.brightness },
        u_min: { value: ve.min },
        u_max: { value: ve.max },
        u_dodgeColor: { value: new a.Color() },
        u_isDodgeColor: { value: !1 },
        ...t
      },
      vertexShader: Ut,
      fragmentShader: Et,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, ve = Object.freeze({
  texture: T,
  map: T,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), er = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Lt({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(ve), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("u_texture", o.texture), l("uMap", o.map), l("uMapIntensity", o.mapIntensity), o.alphaMap ? (l("u_alphaMap", o.alphaMap), l("u_isAlphaMap", !0)) : l("u_isAlphaMap", !1), l("u_brightness", o.brightness), l("u_min", o.min), l("u_max", o.max), o.dodgeColor ? (l("u_dodgeColor", o.dodgeColor), l("u_isDodgeColor", !0)) : l("u_isDodgeColor", !1), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var $t = "#usf <planeVert>", jt = `precision highp float;

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
	#usf <coverTexture>

	
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
const qt = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: i
}) => {
  const v = b(() => new a.PlaneGeometry(2, 2), []), s = b(() => {
    var d, y;
    const f = new a.ShaderMaterial({
      uniforms: {
        uResolution: { value: new a.Vector2() },
        uTextureResolution: { value: new a.Vector2() },
        uTexture0: { value: T },
        uTexture1: { value: T },
        padding: { value: oe.padding },
        uMap: { value: T },
        edgeIntensity: { value: oe.edgeIntensity },
        mapIntensity: { value: oe.mapIntensity },
        epicenter: { value: oe.epicenter },
        progress: { value: oe.progress },
        dirX: { value: (d = oe.dir) == null ? void 0 : d.x },
        dirY: { value: (y = oe.dir) == null ? void 0 : y.y },
        ...r
      },
      vertexShader: $t,
      fragmentShader: jt,
      ...B
    });
    return f.onBeforeCompile = V(i), f;
  }, [i, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = $(e, v, s, a.Mesh);
  return { material: s, mesh: c };
}, oe = Object.freeze({
  texture0: T,
  texture1: T,
  padding: 0,
  map: T,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  dir: new a.Vector2(0, 0)
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = qt({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(oe), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        var F, P, O, k, te, H, K, ie;
        const { gl: _ } = M;
        m(h, S), l("uTexture0", o.texture0), l("uTexture1", o.texture1), l("progress", o.progress);
        const w = [
          ((P = (F = o.texture0) == null ? void 0 : F.image) == null ? void 0 : P.width) || 0,
          ((k = (O = o.texture0) == null ? void 0 : O.image) == null ? void 0 : k.height) || 0
        ], I = [
          ((H = (te = o.texture1) == null ? void 0 : te.image) == null ? void 0 : H.width) || 0,
          ((ie = (K = o.texture1) == null ? void 0 : K.image) == null ? void 0 : ie.height) || 0
        ], R = w.map((X, xe) => X + (I[xe] - X) * o.progress);
        return l("uTextureResolution", R), l("padding", o.padding), l("uMap", o.map), l("mapIntensity", o.mapIntensity), l("edgeIntensity", o.edgeIntensity), l("epicenter", o.epicenter), l("dirX", o.dir.x), l("dirY", o.dir.y), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Wt = "#usf <planeVert>", Nt = `precision highp float;

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
const kt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_brightness: { value: de.brightness },
        u_min: { value: de.min },
        u_max: { value: de.max },
        ...t
      },
      vertexShader: Wt,
      fragmentShader: Nt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, de = Object.freeze({
  texture: T,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = kt({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(
    de
  ), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("u_texture", o.texture), l("u_brightness", o.brightness), l("u_min", o.min), l("u_max", o.max), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Gt = "#usf <planeVert>", Kt = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;
const Xt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        uMap: { value: T },
        uMapIntensity: { value: Ve.mapIntensity },
        ...t
      },
      vertexShader: Gt,
      fragmentShader: Kt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, Ve = Object.freeze({
  texture: T,
  map: T,
  mapIntensity: 0.3
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Xt({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(Ve), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("u_texture", o.texture), l("uMap", o.map), l("uMapIntensity", o.mapIntensity), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Ht = "#usf <planeVert>", Yt = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const Qt = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uMap: { value: T },
        ...t
      },
      vertexShader: Ht,
      fragmentShader: Yt,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, Zt = Object.freeze({
  texture: T,
  map: T
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Qt({
    scene: u,
    size: e,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(Zt), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("uTexture", o.texture), l("uMap", o.map), x(_);
      },
      [l, x, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var Jt = "#usf <planeVert>", en = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_saturation;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	vec4 tex = texture2D(u_texture, vUv);
	vec3 hsv = rgb2hsv(tex.rgb);
	hsv.y *= u_saturation;
	hsv.z *= u_brightness;
	vec3 final = hsv2rgb(hsv);
	gl_FragColor = vec4(final, tex.a);
}`;
const tn = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_brightness: { value: Se.brightness },
        u_saturation: { value: Se.saturation },
        ...t
      },
      vertexShader: Jt,
      fragmentShader: en,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, Se = Object.freeze({
  texture: T,
  brightness: 1,
  saturation: 1
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = tn({
    scene: u,
    size: e,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(Se), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("u_texture", o.texture), l("u_brightness", o.brightness), l("u_saturation", o.saturation), x(_);
      },
      [l, x, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var nn = "#usf <planeVert>", rn = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;
const on = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: i
}) => {
  const v = b(() => new a.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uResolution: { value: new a.Vector2() },
        uTextureResolution: { value: new a.Vector2() },
        uTexture: { value: T },
        ...r
      },
      vertexShader: nn,
      fragmentShader: rn,
      ...B
    });
    return f.onBeforeCompile = V(i), f;
  }, [i, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = $(e, v, s, a.Mesh);
  return { material: s, mesh: c };
}, an = Object.freeze({
  texture: T
}), ir = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = on({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    dpr: s.fbo,
    size: e,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(an), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        var w, I, R, F, P, O;
        const { gl: _ } = M;
        return m(h, S), l("uTexture", o.texture), l("uTextureResolution", [
          ((R = (I = (w = o.texture) == null ? void 0 : w.source) == null ? void 0 : I.data) == null ? void 0 : R.width) || 0,
          ((O = (P = (F = o.texture) == null ? void 0 : F.source) == null ? void 0 : P.data) == null ? void 0 : O.height) || 0
        ]), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var un = "#usf <planeVert>", sn = `precision highp float;

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
const ln = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uResolution: { value: new a.Vector2(0, 0) },
        uBlurSize: { value: ze.blurSize },
        ...t
      },
      vertexShader: un,
      fragmentShader: sn,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, ze = Object.freeze({
  texture: T,
  blurSize: 3,
  blurPower: 5
}), ur = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = ln({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, o] = se(y), [g, l] = q(ze), p = A(c), m = z(c), C = D(
    (h, S) => {
      l(h), m(S);
    },
    [l, m]
  );
  return [
    D(
      (h, S, _) => {
        var F, P, O, k, te, H;
        const { gl: w } = h;
        C(S, _), p("uTexture", g.texture), p("uResolution", [
          ((O = (P = (F = g.texture) == null ? void 0 : F.source) == null ? void 0 : P.data) == null ? void 0 : O.width) || 0,
          ((H = (te = (k = g.texture) == null ? void 0 : k.source) == null ? void 0 : te.data) == null ? void 0 : H.height) || 0
        ]), p("uBlurSize", g.blurSize);
        let I = o(w);
        const R = g.blurPower;
        for (let K = 0; K < R; K++)
          p("uTexture", I), I = o(w);
        return I;
      },
      [o, p, g, C]
    ),
    C,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var cn = "#usf <planeVert>", vn = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform vec2 uBegin;
uniform vec2 uEnd;
uniform float uStrength;

void main() {
	vec2 uv = vUv;	
	vec4 current = texture2D(uTexture, uv + uBegin*.1);
	vec4 back = texture2D(uBackbuffer, uv + uEnd*.1);
	vec4 mixed = mix(current,back,uStrength);
	gl_FragColor = mixed;
}`;
const pn = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uBackbuffer: { value: T },
        uBegin: { value: fe.begin },
        uEnd: { value: fe.end },
        uStrength: { value: fe.strength },
        ...t
      },
      vertexShader: cn,
      fragmentShader: vn,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, fe = Object.freeze({
  texture: T,
  begin: new a.Vector2(0, 0),
  end: new a.Vector2(0, 0),
  strength: 0.9
}), sr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = pn({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, o] = se(y), [g, l] = q(fe), p = A(c), m = z(c), C = D(
    (h, S) => {
      l(h), m(S);
    },
    [l, m]
  );
  return [
    D(
      (h, S, _) => {
        const { gl: w } = h;
        return C(S, _), p("uTexture", g.texture), p("uBegin", g.begin), p("uEnd", g.end), p("uStrength", g.strength), o(w, ({ read: I }) => {
          p("uBackbuffer", I);
        });
      },
      [o, p, C, g]
    ),
    C,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
};
var mn = "#usf <planeVert>", dn = `precision highp float;

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
const fn = ({
  scene: e,
  uniforms: t,
  onBeforeCompile: n
}) => {
  const r = b(() => new a.PlaneGeometry(2, 2), []), i = b(() => {
    const s = new a.ShaderMaterial({
      uniforms: {
        uEpicenter: { value: pe.epicenter },
        uProgress: { value: pe.progress },
        uStrength: { value: pe.strength },
        uWidth: { value: pe.width },
        uMode: { value: 0 },
        ...t
      },
      vertexShader: mn,
      fragmentShader: dn,
      ...B
    });
    return s.onBeforeCompile = V(n), s;
  }, [n, t]), v = $(e, r, i, a.Mesh);
  return { material: i, mesh: v };
}, pe = Object.freeze({
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), lr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = fn({ scene: u, uniforms: i, onBeforeCompile: v }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(pe), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("uEpicenter", o.epicenter), l("uProgress", o.progress), l("uWidth", o.width), l("uStrength", o.strength), l(
          "uMode",
          o.mode === "center" ? 0 : o.mode === "horizontal" ? 1 : 2
        ), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var gn = "#usf <planeVert>", hn = `precision highp float;
varying vec2 vUv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec3 u_keyColor;
uniform float u_similarity;
uniform float u_smoothness;
uniform float u_spill;

uniform vec4 u_color;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_gamma;

vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}
float getChromeDist(vec3 texColor){
	float chromaDist = distance(RGBtoUV(texColor), RGBtoUV(u_keyColor));
	return chromaDist;
}

float getBoxFilteredChromaDist(vec3 rgb, vec2 uv)
{
	vec2 pixel_size = vec2(1.) / u_resolution;
	vec2 h_pixel_size = pixel_size / 2.0;
	vec2 point_0 = vec2(pixel_size.x, h_pixel_size.y);
	vec2 point_1 = vec2(h_pixel_size.x, -pixel_size.y);
	float distVal = getChromeDist(texture2D(u_texture,uv-point_0).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv+point_0).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv-point_1).rgb);
	distVal += getChromeDist(texture2D(u_texture,uv+point_1).rgb);
	distVal *= 2.0;
	distVal += getChromeDist(rgb);
	return distVal / 9.0;
}

vec4 CalcColor(vec4 rgba)
{
	return vec4(pow(rgba.rgb, vec3(u_gamma, u_gamma, u_gamma)) * u_contrast + u_brightness, rgba.a);
}

void main() {

	vec2 uv = vUv;

	vec4 texColor = texture2D(u_texture, uv);
	texColor.rgb *= (texColor.a > 0.) ? (1. / texColor.a) : 0.;

	float chromaDist = getBoxFilteredChromaDist(texColor.rgb,uv);
	
	float baseMask = chromaDist - u_similarity;
	float fullMask = pow(clamp(baseMask / u_smoothness, 0., 1.), 1.5);
	
	texColor.rgba *= u_color;
	texColor.a = fullMask;

	float spillVal = pow(clamp(baseMask / u_spill, 0., 1.), 1.5);
	float desat = clamp(texColor.r * 0.2126 + texColor.g * 0.7152 + texColor.b * 0.0722, 0., 1.);
	texColor.rgb = mix(vec3(desat, desat, desat), texColor.rgb, spillVal);

	vec4 finColor = CalcColor(texColor);

	gl_FragColor = finColor;
}`;
const xn = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: i
}) => {
  const v = b(() => new a.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: T },
        u_resolution: { value: new a.Vector2() },
        u_keyColor: { value: J.color },
        u_similarity: { value: J.similarity },
        u_smoothness: { value: J.smoothness },
        u_spill: { value: J.spill },
        u_color: { value: J.color },
        u_contrast: { value: J.contrast },
        u_brightness: { value: J.brightness },
        u_gamma: { value: J.gamma },
        ...r
      },
      vertexShader: gn,
      fragmentShader: hn,
      ...B
    });
    return f.onBeforeCompile = V(i), f;
  }, [i, r]), u = Y(t, n);
  A(s)("u_resolution", u.clone());
  const c = $(e, v, s, a.Mesh);
  return { material: s, mesh: c };
}, J = Object.freeze({
  texture: T,
  keyColor: new a.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new a.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), cr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = xn({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), [y, x] = W({
    scene: u,
    camera: d,
    size: e,
    dpr: s.fbo,
    samples: n,
    isSizeUpdate: r
  }), [o, g] = q(J), l = A(c), p = z(c), m = D(
    (M, h) => {
      g(M), p(h);
    },
    [g, p]
  );
  return [
    D(
      (M, h, S) => {
        const { gl: _ } = M;
        return m(h, S), l("u_texture", o.texture), l("u_keyColor", o.keyColor), l("u_similarity", o.similarity), l("u_smoothness", o.smoothness), l("u_spill", o.spill), l("u_color", o.color), l("u_contrast", o.contrast), l("u_brightness", o.brightness), l("u_gamma", o.gamma), x(_);
      },
      [x, l, o, m]
    ),
    m,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: y,
      output: y.texture
    }
  ];
};
var yn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`, bn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

uniform sampler2D uTexture;
uniform sampler2D uBackbuffer;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

#usf <uniforms>

void main() {
	vec4 usf_FragColor = vec4(1.);

	#usf <main>
	
	gl_FragColor = usf_FragColor;
}`;
const Mn = ({
  scene: e,
  size: t,
  dpr: n,
  uniforms: r,
  onBeforeCompile: i
}) => {
  const v = b(() => new a.PlaneGeometry(2, 2), []), s = b(() => {
    const f = new a.ShaderMaterial({
      uniforms: {
        uTexture: { value: T },
        uBackbuffer: { value: T },
        uTime: { value: 0 },
        uPointer: { value: new a.Vector2() },
        uResolution: { value: new a.Vector2() },
        ...r
      },
      vertexShader: yn,
      fragmentShader: bn,
      ...B
    });
    return f.onBeforeCompile = V(i), f;
  }, [i, r]), u = Y(t, n);
  A(s)("uResolution", u.clone());
  const c = $(e, v, s, a.Mesh);
  return { material: s, mesh: c };
}, Sn = Object.freeze({
  texture: T,
  beat: !1
}), vr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  uniforms: i,
  onBeforeCompile: v
}) => {
  const s = U(t), u = b(() => new a.Scene(), []), { material: c, mesh: f } = Mn({
    scene: u,
    size: e,
    dpr: s.shader,
    uniforms: i,
    onBeforeCompile: v
  }), d = j(e), y = b(
    () => ({
      scene: u,
      camera: d,
      size: e,
      dpr: s.fbo,
      samples: n,
      isSizeUpdate: r
    }),
    [u, d, e, s.fbo, n, r]
  ), [x, o] = se(y), [g, l] = q(Sn), p = A(c), m = z(c), C = D(
    (h, S) => {
      l(h), m(S);
    },
    [l, m]
  );
  return [
    D(
      (h, S, _) => {
        const { gl: w, clock: I, pointer: R } = h;
        return C(S, _), p("uPointer", R), p("uTexture", g.texture), p("uTime", g.beat || I.getElapsedTime()), o(w, ({ read: F }) => {
          p("uBackbuffer", F);
        });
      },
      [o, p, g, C]
    ),
    C,
    {
      scene: u,
      mesh: f,
      material: c,
      camera: d,
      renderTarget: x,
      output: x.read.texture
    }
  ];
}, _n = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = $(
    e,
    t,
    n,
    a.Points
  ), i = $(
    e,
    b(() => t.clone(), [t]),
    b(() => n.clone(), [n]),
    a.Mesh
  );
  return i.visible = !1, {
    points: r,
    interactiveMesh: i
  };
};
var Cn = `uniform vec2 uResolution;
uniform float uMorphProgress;
uniform float uPointSize;

uniform sampler2D uPicture;
uniform bool uIsPicture;
uniform sampler2D uAlphaPicture;
uniform bool uIsAlphaPicture;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

uniform float uTime;

uniform float uWobblePositionFrequency;
uniform float uWobbleTimeFrequency;
uniform float uWobbleStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

uniform sampler2D uDisplacement;
uniform bool uIsDisplacement;
uniform float uDisplacementIntensity;

uniform float uSizeRandomIntensity;
uniform float uSizeRandomTimeFrequency;
uniform float uSizeRandomMin;
uniform float uSizeRandomMax;

uniform float uMapArrayLength;

uniform float uDivergence;
uniform vec3 uDivergencePoint;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;
varying float vMapArrayIndex;

#usf <morphPositions>

#usf <morphUvs>

#usf <wobble3D>

float random3D(vec3 co) {
	return fract(sin(dot(co.xyz ,vec3(12.9898, 78.233, 45.764))) * 43758.5453);
}

void main() {
	vec3 newPosition = position;
	vec2 newUv = uv;
	
	#usf <morphPositionTransition>
	#usf <morphUvTransition>

	
	vec3 displacement = uIsDisplacement ? texture2D(uDisplacement, newUv).rgb : vec3(0.0);
	float displacementIntensity = smoothstep(0., 1., displacement.g);
	vDisplacementColor = displacement;
	vDisplacementIntensity = displacementIntensity;

	
	displacement = displacement * 2.-1.;
	displacement *= displacementIntensity * uDisplacementIntensity;
	newPosition += displacement;

	
	vec3 divergenceDir = newPosition - uDivergencePoint;
	if (uDivergence > 0.0) {
		newPosition += normalize(divergenceDir) * uDivergence;
	} else if (uDivergence < 0.0) {
		newPosition -= normalize(divergenceDir) * abs(uDivergence);
	}

	
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	
	float wobble = uWobbleStrength > 0. ? getWobble(projectedPosition.xyz) : 0.0;

	gl_Position = projectedPosition += wobble;
	
	
	vColor = uIsPicture ? texture2D(uPicture, newUv).rgb : mix(mix(uColor0, uColor1, newPosition.x), mix(uColor2, uColor3, newPosition.y), newPosition.z);

	
	vPictureAlpha = uIsAlphaPicture ? texture2D(uAlphaPicture, newUv).g : 1.;

	
	
	float sizeRand = uSizeRandomIntensity > 0. ? mix(uSizeRandomMin,uSizeRandomMax,(simplexNoise4d(vec4(newPosition,uTime * uSizeRandomTimeFrequency))*.5+.5)) * uSizeRandomIntensity : 1.;
	gl_PointSize = uPointSize * vPictureAlpha * uResolution.y * sizeRand;
	gl_PointSize *= (1.0 / - viewPosition.z);

	
	vMapArrayIndex = uMapArrayLength > 0. ? floor(random3D(position) * uMapArrayLength) : 0.;
}`, wn = `precision highp float;
precision highp int;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;
varying float vMapArrayIndex;

uniform float uBlurAlpha;
uniform float uBlurRadius;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform sampler2D uAlphaMap;
uniform bool uIsAlphaMap;
uniform float uDisplacementColorIntensity;
uniform float uPointAlpha;

#usf <mapArrayUniforms>

void main() {    
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
   
	
	float distanceToCenter = length(uv - .5);
	float alpha = clamp(uBlurRadius / distanceToCenter - (1.-uBlurAlpha) , 0. , 1.);

	
	vec4 mapArrayColor;
	#usf <mapArraySwitcher>
	vec4 mapColor = isMapArray ? mapArrayColor : uIsMap ? texture2D(uMap,uv) : vec4(1.);
	vec3 finalColor = isMapArray || uIsMap ? mapColor.rgb : vColor;

	
	float mixIntensity = clamp(uDisplacementColorIntensity * vDisplacementIntensity,0.,1.);
	finalColor = vDisplacementIntensity > 0. ? mix(finalColor,vDisplacementColor,mixIntensity) : finalColor;

	
	float alphaMap = uIsAlphaMap ? texture2D(uAlphaMap,uv).g : 1.;

	gl_FragColor = vec4(finalColor,alpha * vPictureAlpha * alphaMap * mapColor.a * uPointAlpha);
}`;
const Pe = (e, t, n, r, i) => {
  var d;
  const v = n === "position" ? "positionTarget" : "uvTarget", s = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", u = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", c = n === "position" ? "positionsList" : "uvsList", f = n === "position" ? `
				float scaledProgress = uMorphProgress * ${e.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${e.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			` : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";
  if (e.length > 0) {
    t.deleteAttribute(n), t.setAttribute(
      n,
      new a.BufferAttribute(e[0], i)
    );
    let y = "", x = "";
    e.forEach((o, g) => {
      t.setAttribute(
        `${v}${g}`,
        new a.BufferAttribute(o, i)
      ), y += `attribute vec${i} ${v}${g};
`, g === 0 ? x += `${v}${g}` : x += `,${v}${g}`;
    }), r = r.replace(
      `${s}`,
      y
    ), r = r.replace(
      `${u}`,
      `vec${i} ${c}[${e.length}] = vec${i}[](${x});
				${f}
			`
    );
  } else
    r = r.replace(`${s}`, ""), r = r.replace(`${u}`, ""), (d = t == null ? void 0 : t.attributes[n]) != null && d.array || Ie && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, Re = (e, t, n, r) => {
  var v;
  let i = [];
  if (e && e.length > 0) {
    (v = t == null ? void 0 : t.attributes[n]) != null && v.array ? i = [
      t.attributes[n].array,
      ...e
    ] : i = e;
    const s = Math.max(...i.map((u) => u.length));
    i.forEach((u, c) => {
      if (u.length < s) {
        const f = (s - u.length) / r, d = [], y = Array.from(u);
        for (let x = 0; x < f; x++) {
          const o = Math.floor(u.length / r * Math.random()) * r;
          for (let g = 0; g < r; g++)
            d.push(y[o + g]);
        }
        i[c] = new Float32Array([...y, ...d]);
      }
    });
  }
  return i;
}, Tn = (e, t) => {
  let n = "";
  const r = {};
  let i = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((s, u) => {
    const c = `vMapArrayIndex < ${u}.1`, f = `texture2D(uMapArray${u}, uv)`;
    i += `( ${c} ) ? ${f} : `, n += `
        uniform sampler2D uMapArray${u};
      `, r[`uMapArray${u}`] = { value: s };
  }), i += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (i += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", i).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, Dn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: i,
  mapArray: v,
  uniforms: s,
  onBeforeCompile: u
}) => {
  const c = b(
    () => Re(r, n, "position", 3),
    [r, n]
  ), f = b(
    () => Re(i, n, "uv", 2),
    [i, n]
  ), d = b(() => {
    c.length !== f.length && Ie && console.log("use-shader-fx:positions and uvs are not matched");
    const x = Pe(
      f,
      n,
      "uv",
      Pe(
        c,
        n,
        "position",
        Cn,
        3
      ),
      2
    ), { rewritedFragmentShader: o, mapArrayUniforms: g } = Tn(v, wn), l = new a.ShaderMaterial({
      vertexShader: x,
      fragmentShader: o,
      blending: a.AdditiveBlending,
      ...B,
      // Must be transparent
      transparent: !0,
      uniforms: {
        uResolution: { value: new a.Vector2(0, 0) },
        uMorphProgress: { value: E.morphProgress },
        uBlurAlpha: { value: E.blurAlpha },
        uBlurRadius: { value: E.blurRadius },
        uPointSize: { value: E.pointSize },
        uPointAlpha: { value: E.pointAlpha },
        uPicture: { value: T },
        uIsPicture: { value: !1 },
        uAlphaPicture: { value: T },
        uIsAlphaPicture: { value: !1 },
        uColor0: { value: E.color0 },
        uColor1: { value: E.color1 },
        uColor2: { value: E.color2 },
        uColor3: { value: E.color3 },
        uMap: { value: T },
        uIsMap: { value: !1 },
        uAlphaMap: { value: T },
        uIsAlphaMap: { value: !1 },
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: E.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: E.wobbleTimeFrequency
        },
        uWobbleStrength: { value: E.wobbleStrength },
        uWarpPositionFrequency: {
          value: E.warpPositionFrequency
        },
        uWarpTimeFrequency: {
          value: E.warpTimeFrequency
        },
        uWarpStrength: { value: E.warpStrength },
        uDisplacement: { value: T },
        uIsDisplacement: { value: !1 },
        uDisplacementIntensity: {
          value: E.displacementIntensity
        },
        uDisplacementColorIntensity: {
          value: E.displacementColorIntensity
        },
        uSizeRandomIntensity: {
          value: E.sizeRandomIntensity
        },
        uSizeRandomTimeFrequency: {
          value: E.sizeRandomTimeFrequency
        },
        uSizeRandomMin: { value: E.sizeRandomMin },
        uSizeRandomMax: { value: E.sizeRandomMax },
        uDivergence: { value: E.divergence },
        uDivergencePoint: { value: E.divergencePoint },
        ...g,
        ...s
      }
    });
    return l.onBeforeCompile = V(u), l;
  }, [
    n,
    c,
    f,
    v,
    u,
    s
  ]), y = Y(e, t);
  return A(d)("uResolution", y.clone()), { material: d, modifiedPositions: c, modifiedUvs: f };
}, Pn = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: i,
  uvs: v,
  mapArray: s,
  uniforms: u,
  onBeforeCompile: c
}) => {
  const f = U(t), d = b(() => {
    const M = r || new a.SphereGeometry(1, 32, 32);
    return M.setIndex(null), M.deleteAttribute("normal"), M;
  }, [r]), { material: y, modifiedPositions: x, modifiedUvs: o } = Dn({
    size: e,
    dpr: f.shader,
    geometry: d,
    positions: i,
    uvs: v,
    mapArray: s,
    uniforms: u,
    onBeforeCompile: c
  }), { points: g, interactiveMesh: l } = _n({
    scene: n,
    geometry: d,
    material: y
  }), p = A(y), m = z(y);
  return [
    D(
      (M, h, S) => {
        M && p(
          "uTime",
          (h == null ? void 0 : h.beat) || M.clock.getElapsedTime()
        ), h !== void 0 && (p("uMorphProgress", h.morphProgress), p("uBlurAlpha", h.blurAlpha), p("uBlurRadius", h.blurRadius), p("uPointSize", h.pointSize), p("uPointAlpha", h.pointAlpha), h.picture ? (p("uPicture", h.picture), p("uIsPicture", !0)) : h.picture === !1 && p("uIsPicture", !1), h.alphaPicture ? (p("uAlphaPicture", h.alphaPicture), p("uIsAlphaPicture", !0)) : h.alphaPicture === !1 && p("uIsAlphaPicture", !1), p("uColor0", h.color0), p("uColor1", h.color1), p("uColor2", h.color2), p("uColor3", h.color3), h.map ? (p("uMap", h.map), p("uIsMap", !0)) : h.map === !1 && p("uIsMap", !1), h.alphaMap ? (p("uAlphaMap", h.alphaMap), p("uIsAlphaMap", !0)) : h.alphaMap === !1 && p("uIsAlphaMap", !1), p("uWobbleStrength", h.wobbleStrength), p(
          "uWobblePositionFrequency",
          h.wobblePositionFrequency
        ), p("uWobbleTimeFrequency", h.wobbleTimeFrequency), p("uWarpStrength", h.warpStrength), p("uWarpPositionFrequency", h.warpPositionFrequency), p("uWarpTimeFrequency", h.warpTimeFrequency), h.displacement ? (p("uDisplacement", h.displacement), p("uIsDisplacement", !0)) : h.displacement === !1 && p("uIsDisplacement", !1), p("uDisplacementIntensity", h.displacementIntensity), p(
          "uDisplacementColorIntensity",
          h.displacementColorIntensity
        ), p("uSizeRandomIntensity", h.sizeRandomIntensity), p(
          "uSizeRandomTimeFrequency",
          h.sizeRandomTimeFrequency
        ), p("uSizeRandomMin", h.sizeRandomMin), p("uSizeRandomMax", h.sizeRandomMax), p("uDivergence", h.divergence), p("uDivergencePoint", h.divergencePoint), m(S));
      },
      [p, m]
    ),
    {
      points: g,
      interactiveMesh: l,
      positions: x,
      uvs: o
    }
  ];
}, E = Object.freeze({
  morphProgress: 0,
  blurAlpha: 0.9,
  blurRadius: 0.05,
  pointSize: 0.05,
  pointAlpha: 1,
  picture: !1,
  alphaPicture: !1,
  color0: new a.Color(16711680),
  color1: new a.Color(65280),
  color2: new a.Color(255),
  color3: new a.Color(16776960),
  map: !1,
  alphaMap: !1,
  wobbleStrength: 0,
  wobblePositionFrequency: 0.5,
  wobbleTimeFrequency: 0.5,
  warpStrength: 0,
  warpPositionFrequency: 0.5,
  warpTimeFrequency: 0.5,
  displacement: !1,
  displacementIntensity: 1,
  displacementColorIntensity: 0,
  sizeRandomIntensity: 0,
  sizeRandomTimeFrequency: 0.2,
  sizeRandomMin: 0.5,
  sizeRandomMax: 1.5,
  divergence: 0,
  divergencePoint: new a.Vector3(0),
  beat: !1
}), pr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: i,
  geometry: v,
  positions: s,
  uvs: u,
  uniforms: c,
  onBeforeCompile: f
}) => {
  const d = U(t), y = b(() => new a.Scene(), []), [
    x,
    {
      points: o,
      interactiveMesh: g,
      positions: l,
      uvs: p
    }
  ] = Pn({
    scene: y,
    size: e,
    dpr: t,
    geometry: v,
    positions: s,
    uvs: u,
    uniforms: c,
    onBeforeCompile: f
  }), [m, C] = W({
    scene: y,
    camera: i,
    size: e,
    dpr: d.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = D(
    (S, _, w) => (x(S, _, w), C(S.gl)),
    [C, x]
  ), h = D(
    (S, _) => {
      x(null, S, _);
    },
    [x]
  );
  return [
    M,
    h,
    {
      scene: y,
      points: o,
      interactiveMesh: g,
      renderTarget: m,
      output: m.texture,
      positions: l,
      uvs: p
    }
  ];
};
function Rn(e, t = 1e-4) {
  t = Math.max(t, Number.EPSILON);
  const n = {}, r = e.getIndex(), i = e.getAttribute("position"), v = r ? r.count : i.count;
  let s = 0;
  const u = Object.keys(e.attributes), c = {}, f = {}, d = [], y = ["getX", "getY", "getZ", "getW"];
  for (let l = 0, p = u.length; l < p; l++) {
    const m = u[l];
    c[m] = [];
    const C = e.morphAttributes[m];
    C && (f[m] = new Array(C.length).fill(0).map(() => []));
  }
  const x = Math.log10(1 / t), o = Math.pow(10, x);
  for (let l = 0; l < v; l++) {
    const p = r ? r.getX(l) : l;
    let m = "";
    for (let C = 0, M = u.length; C < M; C++) {
      const h = u[C], S = e.getAttribute(h), _ = S.itemSize;
      for (let w = 0; w < _; w++)
        m += `${~~(S[y[w]](p) * o)},`;
    }
    if (m in n)
      d.push(n[m]);
    else {
      for (let C = 0, M = u.length; C < M; C++) {
        const h = u[C], S = e.getAttribute(h), _ = e.morphAttributes[h], w = S.itemSize, I = c[h], R = f[h];
        for (let F = 0; F < w; F++) {
          const P = y[F];
          if (I.push(S[P](p)), _)
            for (let O = 0, k = _.length; O < k; O++)
              R[O].push(_[O][P](p));
        }
      }
      n[m] = s, d.push(s), s++;
    }
  }
  const g = e.clone();
  for (let l = 0, p = u.length; l < p; l++) {
    const m = u[l], C = e.getAttribute(m), M = new C.array.constructor(c[m]), h = new De(M, C.itemSize, C.normalized);
    if (g.setAttribute(m, h), m in f)
      for (let S = 0; S < f[m].length; S++) {
        const _ = e.morphAttributes[m][S], w = new _.array.constructor(f[m][S]), I = new De(w, _.itemSize, _.normalized);
        g.morphAttributes[m][S] = I;
      }
  }
  return g.setIndex(d), g;
}
var An = `#ifdef USE_TRANSMISSION

	
	

	uniform float _transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;

	#ifdef USE_TRANSMISSIONMAP

		uniform sampler2D transmissionMap;

	#endif

	#ifdef USE_THICKNESSMAP

		uniform sampler2D thicknessMap;

	#endif

	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;

	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;

	varying vec3 vWorldPosition;

	
	

	float w0( float a ) {

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );

	}

	float w1( float a ) {

		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );

	}

	float w2( float a ){

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );

	}

	float w3( float a ) {

		return ( 1.0 / 6.0 ) * ( a * a * a );

	}

	
	float g0( float a ) {

		return w0( a ) + w1( a );

	}

	float g1( float a ) {

		return w2( a ) + w3( a );

	}

	
	float h0( float a ) {

		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );

	}

	float h1( float a ) {

		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );

	}

	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {

		uv = uv * texelSize.zw + 0.5;

		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );

		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );

		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );

	}

	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {

		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );

	}

	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {

		
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

		
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

		
		return normalize( refractionVector ) * thickness * modelScale;

	}

	float applyIorToRoughness( const in float roughness, const in float ior ) {

		
		
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );

	}

	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {

		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );

	}

	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {

		if ( isinf( attenuationDistance ) ) {

			
			return vec3( 1.0 );

		} else {

			
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); 
			return transmittance;

		}

	}

	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {

		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;

		
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;

		
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );

		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;

		
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );

		
		
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;

		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );

	}
#endif`, In = `#ifdef USE_TRANSMISSION

material.transmission = _transmission;
material.transmissionAlpha = 1.0;
material.thickness = thickness;
material.attenuationDistance = attenuationDistance;
material.attenuationColor = attenuationColor;

#ifdef USE_TRANSMISSIONMAP

	material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;

#endif

#ifdef USE_THICKNESSMAP

	material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;

#endif

vec3 pos = vWorldPosition;

vec3 v = normalize( cameraPosition - pos );
vec3 n = inverseTransformDirection( normal, viewMatrix );

vec4 transmitted = getIBLVolumeRefraction(
	n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
	pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
	material.attenuationColor, material.attenuationDistance );

material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );

float runningSeed = 0.0;
vec3 transmission = vec3(0.0);
float transmissionR, transmissionB, transmissionG;
float randomCoords = rand(runningSeed++);
float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), uAnisotropicBlur);
vec3 distortionNormal = vec3(0.0);
vec3 temporalOffset = vec3(uTime, -uTime, -uTime) * uTemporalDistortion;

if (uDistortion > 0.0) {
	distortionNormal = uDistortion * vec3(snoiseFractal(vec3((pos * uDistortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * uDistortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * uDistortionScale + temporalOffset)));
}

for (float i = 0.0; i < uRefractionSamples; i ++) {
	vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
	
	transmissionR = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).r;
	transmissionG = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + randomCoords) / uRefractionSamples) , material.thickness + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).g;
	transmissionB = getIBLVolumeRefraction(
		sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + randomCoords) / uRefractionSamples), material.thickness + thickness_smear * (i + randomCoords) / uRefractionSamples,
		material.attenuationColor, material.attenuationDistance
	).b;
	transmission.r += transmissionR;
	transmission.g += transmissionG;
	transmission.b += transmissionB;
}

transmission /= uRefractionSamples;

totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );

#endif`;
const Ae = (e) => {
  let t = e;
  return t = t.replace(
    "#include <beginnormal_vertex>",
    `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
  ), t = t.replace(
    "#include <begin_vertex>",
    `
		vec3 transformed = usf_Position;`
  ), t = t.replace(
    "void main() {",
    `
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;
		attribute vec4 tangent;
		varying float vWobble;
		varying vec2 vPosition;
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;
		#usf <wobble3D>
		void main() {
		`
  ), t = t.replace(
    "void main() {",
    `
		void main() {
		vec3 usf_Position = position;
		vec3 usf_Normal = normal;
		vec3 biTangent = cross(normal, tangent.xyz);
		
		// Neighbours positions
		float shift = 0.01;
		vec3 positionA = usf_Position + tangent.xyz * shift;
		vec3 positionB = usf_Position + biTangent * shift;
		
		// wobble
		float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
		float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
		float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
		
		usf_Position += wobble * normal;
		positionA += wobblePositionA * normal;
		positionB += wobblePositionB * normal;

		// Compute normal
		vec3 toA = normalize(positionA - usf_Position);
		vec3 toB = normalize(positionB - usf_Position);
		usf_Normal = cross(toA, toB);
		
		// Varying
		vPosition = usf_Position.xy;
		vWobble = wobble/uWobbleStrength;
		
		vEdgeNormal = normalize(normalMatrix * usf_Normal);
		vec4 viewPosition = viewMatrix * modelMatrix * vec4(usf_Position, 1.0);
		vEdgeViewPosition = normalize(viewPosition.xyz);
		`
  ), t;
}, Fn = ({
  baseMaterial: e,
  materialParameters: t,
  onBeforeCompile: n,
  depthOnBeforeCompile: r,
  isCustomTransmission: i = !1,
  uniforms: v
}) => {
  const { material: s, depthMaterial: u } = b(() => {
    const c = new (e || a.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(c.userData, {
      uniforms: {
        uTime: { value: 0 },
        uWobblePositionFrequency: {
          value: N.wobblePositionFrequency
        },
        uWobbleTimeFrequency: {
          value: N.wobbleTimeFrequency
        },
        uWobbleStrength: { value: N.wobbleStrength },
        uWarpPositionFrequency: {
          value: N.warpPositionFrequency
        },
        uWarpTimeFrequency: { value: N.warpTimeFrequency },
        uWarpStrength: { value: N.warpStrength },
        uColor0: { value: N.color0 },
        uColor1: { value: N.color1 },
        uColor2: { value: N.color2 },
        uColor3: { value: N.color3 },
        uColorMix: { value: N.colorMix },
        uEdgeThreshold: { value: N.edgeThreshold },
        uEdgeColor: { value: N.edgeColor },
        uChromaticAberration: {
          value: N.chromaticAberration
        },
        uAnisotropicBlur: { value: N.anisotropicBlur },
        uDistortion: { value: N.distortion },
        uDistortionScale: { value: N.distortionScale },
        uTemporalDistortion: { value: N.temporalDistortion },
        uRefractionSamples: { value: N.refractionSamples },
        transmission: { value: 0 },
        _transmission: { value: 1 },
        transmissionMap: { value: null },
        ...v
      }
    }), c.onBeforeCompile = (d, y) => {
      Object.assign(d.uniforms, c.userData.uniforms), d.vertexShader = Ae(d.vertexShader), d.fragmentShader = d.fragmentShader.replace(
        "#include <color_fragment>",
        `
					#include <color_fragment>

					if (uEdgeThreshold > 0.0) {
						float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
						diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
					} else {
						diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
					}
				`
      ), d.fragmentShader = d.fragmentShader.replace(
        "void main() {",
        `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				uniform float uEdgeThreshold;
				uniform vec3 uEdgeColor;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				uniform float uRefractionSamples;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				#usf <snoise>

				varying float vWobble;
				varying vec2 vPosition;
				varying vec3 vEdgeNormal;
				varying vec3 vEdgeViewPosition;
				
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);
				`
      ), c.type === "MeshPhysicalMaterial" && i && (d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_pars_fragment>",
        `${An}`
      ), d.fragmentShader = d.fragmentShader.replace(
        "#include <transmission_fragment>",
        `${In}`
      )), V(n)(d, y);
    }, c.needsUpdate = !0;
    const f = new a.MeshDepthMaterial({
      depthPacking: a.RGBADepthPacking
    });
    return f.onBeforeCompile = (d, y) => {
      Object.assign(d.uniforms, c.userData.uniforms), d.vertexShader = Ae(d.vertexShader), V(r)(d, y);
    }, f.needsUpdate = !0, { material: c, depthMaterial: f };
  }, [
    t,
    e,
    n,
    r,
    v,
    i
  ]);
  return {
    material: s,
    depthMaterial: u
  };
}, Vn = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: i,
  onBeforeCompile: v,
  depthOnBeforeCompile: s,
  uniforms: u
}) => {
  const c = b(() => {
    let p = t || new a.IcosahedronGeometry(2, 20);
    return p = Rn(p), p.computeTangents(), p;
  }, [t]), { material: f, depthMaterial: d } = Fn({
    baseMaterial: r,
    materialParameters: i,
    onBeforeCompile: v,
    depthOnBeforeCompile: s,
    uniforms: u,
    isCustomTransmission: n
  }), y = $(e, c, f, a.Mesh), x = f.userData, o = A(x), g = z(x);
  return [
    D(
      (p, m, C) => {
        p && o(
          "uTime",
          (m == null ? void 0 : m.beat) || p.clock.getElapsedTime()
        ), m !== void 0 && (o("uWobbleStrength", m.wobbleStrength), o(
          "uWobblePositionFrequency",
          m.wobblePositionFrequency
        ), o("uWobbleTimeFrequency", m.wobbleTimeFrequency), o("uWarpStrength", m.warpStrength), o("uWarpPositionFrequency", m.warpPositionFrequency), o("uWarpTimeFrequency", m.warpTimeFrequency), o("uColor0", m.color0), o("uColor1", m.color1), o("uColor2", m.color2), o("uColor3", m.color3), o("uColorMix", m.colorMix), o("uEdgeThreshold", m.edgeThreshold), o("uEdgeColor", m.edgeColor), o("uChromaticAberration", m.chromaticAberration), o("uAnisotropicBlur", m.anisotropicBlur), o("uDistortion", m.distortion), o("uDistortionScale", m.distortionScale), o("uRefractionSamples", m.refractionSamples), o("uTemporalDistortion", m.temporalDistortion), g(C));
      },
      [o, g]
    ),
    {
      mesh: y,
      depthMaterial: d
    }
  ];
}, N = Object.freeze({
  wobbleStrength: 0.3,
  wobblePositionFrequency: 0.3,
  wobbleTimeFrequency: 0.3,
  warpStrength: 0.3,
  warpPositionFrequency: 0.3,
  warpTimeFrequency: 0.3,
  color0: new a.Color(16711680),
  color1: new a.Color(65280),
  color2: new a.Color(255),
  color3: new a.Color(16776960),
  colorMix: 1,
  edgeThreshold: 0,
  edgeColor: new a.Color(0),
  chromaticAberration: 0.1,
  anisotropicBlur: 0.1,
  distortion: 0,
  distortionScale: 0.1,
  temporalDistortion: 0,
  refractionSamples: 6,
  beat: !1
}), mr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  camera: i,
  geometry: v,
  baseMaterial: s,
  materialParameters: u,
  uniforms: c,
  onBeforeCompile: f,
  depthOnBeforeCompile: d,
  isCustomTransmission: y
}) => {
  const x = U(t), o = b(() => new a.Scene(), []), [g, { mesh: l, depthMaterial: p }] = Vn({
    baseMaterial: s,
    materialParameters: u,
    scene: o,
    geometry: v,
    uniforms: c,
    onBeforeCompile: f,
    depthOnBeforeCompile: d,
    isCustomTransmission: y
  }), [m, C] = W({
    scene: o,
    camera: i,
    size: e,
    dpr: x.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0
  }), M = D(
    (S, _, w) => (g(S, _, w), C(S.gl)),
    [C, g]
  ), h = D(
    (S, _) => {
      g(null, S, _);
    },
    [g]
  );
  return [
    M,
    h,
    {
      scene: o,
      mesh: l,
      depthMaterial: p,
      renderTarget: m,
      output: m.texture
    }
  ];
}, dr = (e, t, n) => {
  const r = b(() => {
    const i = new a.Mesh(t, n);
    return e.add(i), i;
  }, [t, n, e]);
  return ae(() => () => {
    e.remove(r), t.dispose(), n.dispose();
  }, [e, t, n, r]), r;
}, ge = Object.freeze({
  easeInSine(e) {
    return 1 - Math.cos(e * Math.PI / 2);
  },
  easeOutSine(e) {
    return Math.sin(e * Math.PI / 2);
  },
  easeInOutSine(e) {
    return -(Math.cos(Math.PI * e) - 1) / 2;
  },
  easeInQuad(e) {
    return e * e;
  },
  easeOutQuad(e) {
    return 1 - (1 - e) * (1 - e);
  },
  easeInOutQuad(e) {
    return e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
  },
  easeInCubic(e) {
    return e * e * e;
  },
  easeOutCubic(e) {
    return 1 - Math.pow(1 - e, 3);
  },
  easeInOutCubic(e) {
    return e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  },
  easeInQuart(e) {
    return e * e * e * e;
  },
  easeOutQuart(e) {
    return 1 - Math.pow(1 - e, 4);
  },
  easeInOutQuart(e) {
    return e < 0.5 ? 8 * e * e * e * e : 1 - Math.pow(-2 * e + 2, 4) / 2;
  },
  easeInQuint(e) {
    return e * e * e * e * e;
  },
  easeOutQuint(e) {
    return 1 - Math.pow(1 - e, 5);
  },
  easeInOutQuint(e) {
    return e < 0.5 ? 16 * e * e * e * e * e : 1 - Math.pow(-2 * e + 2, 5) / 2;
  },
  easeInExpo(e) {
    return e === 0 ? 0 : Math.pow(2, 10 * e - 10);
  },
  easeOutExpo(e) {
    return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
  },
  easeInOutExpo(e) {
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2;
  },
  easeInCirc(e) {
    return 1 - Math.sqrt(1 - Math.pow(e, 2));
  },
  easeOutCirc(e) {
    return Math.sqrt(1 - Math.pow(e - 1, 2));
  },
  easeInOutCirc(e) {
    return e < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * e, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * e + 2, 2)) + 1) / 2;
  },
  easeInBack(e) {
    return 2.70158 * e * e * e - 1.70158 * e * e;
  },
  easeOutBack(e) {
    return 1 + 2.70158 * Math.pow(e - 1, 3) + 1.70158 * Math.pow(e - 1, 2);
  },
  easeInOutBack(e) {
    const n = 2.5949095;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((n + 1) * 2 * e - n) / 2 : (Math.pow(2 * e - 2, 2) * ((n + 1) * (e * 2 - 2) + n) + 2) / 2;
  },
  easeInElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * t);
  },
  easeOutElastic(e) {
    const t = 2 * Math.PI / 3;
    return e === 0 ? 0 : e === 1 ? 1 : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * t) + 1;
  },
  easeInOutElastic(e) {
    const t = 2 * Math.PI / 4.5;
    return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * t)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * t) / 2 + 1;
  },
  easeInBounce(e) {
    return 1 - ge.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - ge.easeOutBounce(1 - 2 * e)) / 2 : (1 + ge.easeOutBounce(2 * e - 1)) / 2;
  }
});
function zn(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const fr = (e, t = "easeOutQuart") => {
  const n = e / 60, r = ge[t];
  return D(
    (v) => {
      let s = v.getElapsedTime() * n;
      const u = Math.floor(s), c = r(s - u);
      s = c + u;
      const f = zn(u);
      return {
        beat: s,
        floor: u,
        fract: c,
        hash: f
      };
    },
    [n, r]
  );
}, gr = (e = 60) => {
  const t = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = L(null);
  return D(
    (i) => {
      const v = i.getElapsedTime();
      return n.current === null || v - n.current >= t ? (n.current = v, !0) : !1;
    },
    [t]
  );
}, Bn = (e) => {
  var r, i;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (i = e.texture) == null ? void 0 : i.length;
  return !t || !n || t !== n;
};
var On = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, Un = `precision highp float;

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
const En = ({
  params: e,
  scene: t,
  uniforms: n,
  onBeforeCompile: r
}) => {
  t.children.length > 0 && (t.children.forEach((i) => {
    i instanceof a.Mesh && (i.geometry.dispose(), i.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((i, v) => {
    const s = new a.ShaderMaterial({
      uniforms: {
        u_texture: { value: i },
        u_textureResolution: {
          value: new a.Vector2(0, 0)
        },
        u_resolution: { value: new a.Vector2(0, 0) },
        u_borderRadius: {
          value: e.boderRadius[v] ? e.boderRadius[v] : 0
        },
        ...n
      },
      vertexShader: On,
      fragmentShader: Un,
      ...B,
      // Must be transparent.
      transparent: !0
    });
    s.onBeforeCompile = V(r);
    const u = new a.Mesh(new a.PlaneGeometry(1, 1), s);
    t.add(u);
  });
}, Ln = () => {
  const e = L([]), t = L([]);
  return D(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: i,
      params: v
    }) => {
      e.current.length > 0 && e.current.forEach((u, c) => {
        u.unobserve(t.current[c]);
      }), t.current = [], e.current = [];
      const s = new Array(v.dom.length).fill(!1);
      r.current = [...s], i.current = [...s], v.dom.forEach((u, c) => {
        const f = (y) => {
          y.forEach((x) => {
            v.onIntersect[c] && v.onIntersect[c](x), r.current[c] = x.isIntersecting;
          });
        }, d = new IntersectionObserver(f, {
          rootMargin: "0px",
          threshold: 0
        });
        d.observe(u), e.current.push(d), t.current.push(u);
      });
    },
    []
  );
}, $n = () => {
  const e = L([]), t = D(
    ({
      params: n,
      customParams: r,
      size: i,
      resolutionRef: v,
      scene: s,
      isIntersectingRef: u
    }) => {
      s.children.length !== e.current.length && (e.current = new Array(s.children.length)), s.children.forEach((c, f) => {
        var x, o, g, l, p, m;
        const d = n.dom[f];
        if (!d)
          return;
        const y = d.getBoundingClientRect();
        if (e.current[f] = y, c.scale.set(y.width, y.height, 1), c.position.set(
          y.left + y.width * 0.5 - i.width * 0.5,
          -y.top - y.height * 0.5 + i.height * 0.5,
          0
        ), u.current[f] && (n.rotation[f] && c.rotation.copy(n.rotation[f]), c instanceof a.Mesh)) {
          const C = c.material, M = A(C), h = z(C);
          M("u_texture", n.texture[f]), M("u_textureResolution", [
            ((g = (o = (x = n.texture[f]) == null ? void 0 : x.source) == null ? void 0 : o.data) == null ? void 0 : g.width) || 0,
            ((m = (p = (l = n.texture[f]) == null ? void 0 : l.source) == null ? void 0 : p.data) == null ? void 0 : m.height) || 0
          ]), M(
            "u_resolution",
            v.current.set(y.width, y.height)
          ), M(
            "u_borderRadius",
            n.boderRadius[f] ? n.boderRadius[f] : 0
          ), h(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, jn = () => {
  const e = L([]), t = L([]), n = D((r, i = !1) => {
    e.current.forEach((s, u) => {
      s && (t.current[u] = !0);
    });
    const v = i ? [...t.current] : [...e.current];
    return r < 0 ? v : v[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, qn = (e) => ({ onView: n, onHidden: r }) => {
  const i = L(!1);
  ae(() => {
    let v;
    const s = () => {
      e.current.some((u) => u) ? i.current || (n && n(), i.current = !0) : i.current && (r && r(), i.current = !1), v = requestAnimationFrame(s);
    };
    return v = requestAnimationFrame(s), () => {
      cancelAnimationFrame(v);
    };
  }, [n, r]);
}, Wn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, hr = ({ size: e, dpr: t, samples: n, isSizeUpdate: r, uniforms: i, onBeforeCompile: v }, s = []) => {
  const u = U(t), c = b(() => new a.Scene(), []), f = j(e), [d, y] = W({
    scene: c,
    camera: f,
    size: e,
    dpr: u.fbo,
    samples: n,
    isSizeUpdate: r
  }), [x, o] = q({
    ...Wn,
    updateKey: performance.now()
  }), [g, l] = $n(), p = L(new a.Vector2(0, 0)), [m, C] = Ee(!0);
  b(
    () => C(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    s
  );
  const M = L(null), h = b(() => T, []), S = Ln(), { isIntersectingOnceRef: _, isIntersectingRef: w, isIntersecting: I } = jn(), R = qn(w), F = b(() => (O, k) => {
    o(O), l({
      params: x,
      customParams: k,
      size: e,
      resolutionRef: p,
      scene: c,
      isIntersectingRef: w
    });
  }, [w, o, l, e, c, x]);
  return [
    D(
      (O, k, te) => {
        const { gl: H, size: K } = O;
        if (F(k, te), Bn(x))
          return h;
        if (m) {
          if (M.current === x.updateKey)
            return h;
          M.current = x.updateKey;
        }
        return m && (En({
          params: x,
          size: K,
          scene: c,
          uniforms: i,
          onBeforeCompile: v
        }), S({
          isIntersectingRef: w,
          isIntersectingOnceRef: _,
          params: x
        }), C(!1)), y(H);
      },
      [
        y,
        i,
        S,
        v,
        m,
        c,
        x,
        _,
        w,
        h,
        F
      ]
    ),
    F,
    {
      scene: c,
      camera: f,
      renderTarget: d,
      output: d.texture,
      isIntersecting: I,
      DOMRects: g,
      intersections: w.current,
      useDomView: R
    }
  ];
}, xr = ({
  scene: e,
  camera: t,
  size: n,
  dpr: r = !1,
  isSizeUpdate: i = !1,
  samples: v = 0,
  depthBuffer: s = !1,
  depthTexture: u = !1
}, c) => {
  const f = L([]), d = Y(n, r);
  f.current = b(() => Array.from({ length: c }, () => {
    const x = new a.WebGLRenderTarget(
      d.x,
      d.y,
      {
        ...he,
        samples: v,
        depthBuffer: s
      }
    );
    return u && (x.depthTexture = new a.DepthTexture(
      d.x,
      d.y,
      a.FloatType
    )), x;
  }), [c]), i && f.current.forEach(
    (x) => x.setSize(d.x, d.y)
  ), ae(() => {
    const x = f.current;
    return () => {
      x.forEach((o) => o.dispose());
    };
  }, [c]);
  const y = D(
    (x, o, g) => {
      const l = f.current[o];
      return Ce({
        gl: x,
        scene: e,
        camera: t,
        fbo: l,
        onBeforeRender: () => g && g({ read: l.texture })
      }), l.texture;
    },
    [e, t]
  );
  return [f.current, y];
};
export {
  Zt as ALPHABLENDING_PARAMS,
  Sn as BLANK_PARAMS,
  ve as BLENDING_PARAMS,
  de as BRIGHTNESSPICKER_PARAMS,
  ne as BRUSH_PARAMS,
  J as CHROMAKEY_PARAMS,
  Z as COLORSTRATA_PARAMS,
  ce as COSPALETTE_PARAMS,
  an as COVERTEXTURE_PARAMS,
  Fe as DELTA_TIME,
  Wn as DOMSYNCER_PARAMS,
  Me as DUOTONE_PARAMS,
  ge as Easing,
  he as FBO_OPTION,
  ht as FLUID_PARAMS,
  Ve as FXBLENDING_PARAMS,
  oe as FXTEXTURE_PARAMS,
  Se as HSV_PARAMS,
  ue as MARBLE_PARAMS,
  E as MORPHPARTICLES_PARAMS,
  fe as MOTIONBLUR_PARAMS,
  re as NOISE_PARAMS,
  Mt as RIPPLE_PARAMS,
  ze as SIMPLEBLUR_PARAMS,
  pe as WAVE_PARAMS,
  N as WOBBLE3D_PARAMS,
  Ce as renderFBO,
  z as setCustomUniform,
  A as setUniform,
  dr as useAddMesh,
  or as useAlphaBlending,
  fr as useBeat,
  vr as useBlank,
  er as useBlending,
  nr as useBrightnessPicker,
  Gn as useBrush,
  j as useCamera,
  cr as useChromaKey,
  Yn as useColorStrata,
  xr as useCopyTexture,
  Zn as useCosPalette,
  ir as useCoverTexture,
  Pn as useCreateMorphParticles,
  Vn as useCreateWobble3D,
  hr as useDomSyncer,
  se as useDoubleFBO,
  Jn as useDuoTone,
  gr as useFPSLimiter,
  Kn as useFluid,
  rr as useFxBlending,
  tr as useFxTexture,
  ar as useHSV,
  Qn as useMarble,
  pr as useMorphParticles,
  sr as useMotionBlur,
  Hn as useNoise,
  q as useParams,
  _e as usePointer,
  Y as useResolution,
  Xn as useRipple,
  ur as useSimpleBlur,
  W as useSingleFBO,
  lr as useWave,
  mr as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
