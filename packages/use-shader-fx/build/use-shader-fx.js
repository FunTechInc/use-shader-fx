import * as a from "three";
import { useMemo as b, useEffect as ie, useRef as L, useCallback as w, useState as Ee } from "react";
import { mergeVertices as Le } from "three-stdlib";
var $e = "#usf <planeVertex>", qe = `precision highp float;

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
}, R = (e) => (t, n) => {
  if (n === void 0)
    return;
  const r = e.uniforms;
  r && r[t] && (r[t].value = n);
}, F = (e) => (t) => {
  t !== void 0 && Object.keys(t).forEach((n) => {
    const r = e.uniforms;
    r && r[n] && (r[n].value = t[n]);
  });
}, $ = (e, t, n, r) => {
  const u = b(() => {
    const c = new r(t, n);
    return e && e.add(c), c;
  }, [t, n, r, e]);
  return ie(() => () => {
    e && e.remove(u), t.dispose(), n.dispose();
  }, [e, t, n, u]), u;
}, Ve = process.env.NODE_ENV === "development", I = {
  transparent: !1,
  depthTest: !1,
  depthWrite: !1
}, _ = new a.DataTexture(
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
}`, We = `vec3 random3(vec3 c) {
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
}`, Ne = `float screenAspect = uResolution.x / uResolution.y;
float textureAspect = uTextureResolution.x / uTextureResolution.y;
vec2 aspectRatio = vec2(
	min(screenAspect / textureAspect, 1.0),
	min(textureAspect / screenAspect, 1.0)
);
vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;`, ke = `vec3 mapColor = texture2D(uMap, uv).rgb;
vec3 normalizedMap = mapColor * 2.0 - 1.0;

uv = uv * 2.0 - 1.0;
uv *= mix(vec2(1.0), abs(normalizedMap.rg), uMapIntensity);
uv = (uv + 1.0) / 2.0;`, Ge = `precision highp float;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}`, Ke = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`, Xe = `vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`, Ye = `vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}`;
const He = Object.freeze({
  wobble3D: je,
  snoise: We,
  coverTexture: Ne,
  fxBlending: ke,
  planeVertex: Ge,
  defaultVertex: Ke,
  hsv2rgb: Xe,
  rgb2hsv: Ye
}), Qe = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function Ze(e, t) {
  return be(He[t] || "");
}
function be(e) {
  return e.replace(Qe, Ze);
}
const A = (e, t) => (t && t(e), e.vertexShader = be(e.vertexShader), e.fragmentShader = be(e.fragmentShader), e), Je = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), c = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uBuffer: { value: _ },
          uResolution: { value: new a.Vector2(0, 0) },
          uTexture: { value: _ },
          uIsTexture: { value: !1 },
          uMap: { value: _ },
          uIsMap: { value: !1 },
          uMapIntensity: { value: re.mapIntensity },
          uRadius: { value: re.radius },
          uSmudge: { value: re.smudge },
          uDissipation: { value: re.dissipation },
          uMotionBlur: { value: re.motionBlur },
          uMotionSample: { value: re.motionSample },
          uMouse: { value: new a.Vector2(-10, -10) },
          uPrevMouse: { value: new a.Vector2(-10, -10) },
          uVelocity: { value: new a.Vector2(0, 0) },
          uColor: { value: re.color },
          uIsCursor: { value: !1 },
          uPressureStart: { value: 1 },
          uPressureEnd: { value: 1 }
        },
        vertexShader: $e,
        fragmentShader: qe
      },
      r
    ),
    ...I,
    // Must be transparent
    transparent: !0
  }), [r]), p = Y(t, n);
  R(c)("uResolution", p.clone());
  const l = $(e, u, c, a.Mesh);
  return { material: c, mesh: l };
}, et = (e, t) => {
  const n = t, r = e / t, [u, c] = [n * r / 2, n / 2];
  return { width: u, height: c, near: -1e3, far: 1e3 };
}, q = (e, t = "OrthographicCamera") => {
  const n = Y(e), { width: r, height: u, near: c, far: p } = et(
    n.x,
    n.y
  );
  return b(() => t === "OrthographicCamera" ? new a.OrthographicCamera(
    -r,
    r,
    u,
    -u,
    c,
    p
  ) : new a.PerspectiveCamera(50, r / u), [r, u, c, p, t]);
}, Ce = (e = 0) => {
  const t = L(new a.Vector2(0, 0)), n = L(new a.Vector2(0, 0)), r = L(new a.Vector2(0, 0)), u = L(0), c = L(new a.Vector2(0, 0)), p = L(!1);
  return w(
    (i) => {
      const m = performance.now();
      let g;
      p.current && e ? (r.current = r.current.lerp(
        i,
        1 - e
      ), g = r.current.clone()) : (g = i.clone(), r.current = g), u.current === 0 && (u.current = m, t.current = g);
      const x = Math.max(1, m - u.current);
      u.current = m, c.current.copy(g).sub(t.current).divideScalar(x);
      const v = c.current.length() > 0, s = p.current ? t.current.clone() : g;
      return !p.current && v && (p.current = !0), t.current = g, {
        currentPointer: g,
        prevPointer: s,
        diffPointer: n.current.subVectors(g, s),
        velocity: c.current,
        isVelocityUpdate: v
      };
    },
    [e]
  );
}, j = (e) => {
  const n = L(
    ((u) => Object.values(u).some((c) => typeof c == "function"))(e) ? e : structuredClone(e)
  ), r = w((u) => {
    if (u !== void 0)
      for (const c in u) {
        const p = c;
        p in n.current && u[p] !== void 0 && u[p] !== null ? n.current[p] = u[p] : console.error(
          `"${String(
            p
          )}" does not exist in the params. or "${String(
            p
          )}" is null | undefined`
        );
      }
  }, []);
  return [n.current, r];
}, xe = {
  depthBuffer: !1
}, _e = ({
  gl: e,
  fbo: t,
  scene: n,
  camera: r,
  onBeforeRender: u,
  onSwap: c
}) => {
  e.setRenderTarget(t), u(), e.clear(), e.render(n, r), c && c(), e.setRenderTarget(null), e.clear();
}, W = (e) => {
  var x;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: u = !1,
    isSizeUpdate: c = !1,
    depth: p = !1,
    ...l
  } = e, i = L(), m = Y(r, u);
  i.current = b(
    () => {
      const v = new a.WebGLRenderTarget(
        m.x,
        m.y,
        {
          ...xe,
          ...l
        }
      );
      return p && (v.depthTexture = new a.DepthTexture(
        m.x,
        m.y,
        a.FloatType
      )), v;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ), c && ((x = i.current) == null || x.setSize(m.x, m.y)), ie(() => {
    const v = i.current;
    return () => {
      v == null || v.dispose();
    };
  }, []);
  const g = w(
    (v, s) => {
      const d = i.current;
      return _e({
        gl: v,
        fbo: d,
        scene: t,
        camera: n,
        onBeforeRender: () => s && s({ read: d.texture })
      }), d.texture;
    },
    [t, n]
  );
  return [i.current, g];
}, le = (e) => {
  var x, v;
  const {
    scene: t,
    camera: n,
    size: r,
    dpr: u = !1,
    isSizeUpdate: c = !1,
    depth: p = !1,
    ...l
  } = e, i = Y(r, u), m = b(() => {
    const s = new a.WebGLRenderTarget(i.x, i.y, {
      ...xe,
      ...l
    }), d = new a.WebGLRenderTarget(i.x, i.y, {
      ...xe,
      ...l
    });
    return p && (s.depthTexture = new a.DepthTexture(
      i.x,
      i.y,
      a.FloatType
    ), d.depthTexture = new a.DepthTexture(
      i.x,
      i.y,
      a.FloatType
    )), {
      read: s,
      write: d,
      swap: function() {
        let o = this.read;
        this.read = this.write, this.write = o;
      }
    };
  }, []);
  c && ((x = m.read) == null || x.setSize(i.x, i.y), (v = m.write) == null || v.setSize(i.x, i.y)), ie(() => {
    const s = m;
    return () => {
      var d, o;
      (d = s.read) == null || d.dispose(), (o = s.write) == null || o.dispose();
    };
  }, [m]);
  const g = w(
    (s, d) => {
      var h;
      const o = m;
      return _e({
        gl: s,
        scene: t,
        camera: n,
        fbo: o.write,
        onBeforeRender: () => d && d({
          read: o.read.texture,
          write: o.write.texture
        }),
        onSwap: () => o.swap()
      }), (h = o.read) == null ? void 0 : h.texture;
    },
    [t, n, m]
  );
  return [
    { read: m.read, write: m.write },
    g
  ];
}, B = (e) => typeof e == "number" ? { shader: e, fbo: e } : {
  shader: e.shader ?? !1,
  fbo: e.fbo ?? !1
}, re = Object.freeze({
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
}), Zn = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Je({
    scene: l,
    size: e,
    dpr: p.shader,
    onBeforeInit: c
  }), g = q(e), x = Ce(), [v, s] = le({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [d, o] = j(re), h = L(null), y = R(i), T = F(i), f = w(
    (S, C) => {
      o(S), T(C);
    },
    [o, T]
  );
  return [
    w(
      (S, C, D) => {
        const { gl: z, pointer: U } = S;
        f(C, D), d.texture ? (y("uIsTexture", !0), y("uTexture", d.texture)) : y("uIsTexture", !1), d.map ? (y("uIsMap", !0), y("uMap", d.map), y("uMapIntensity", d.mapIntensity)) : y("uIsMap", !1), y("uRadius", d.radius), y("uSmudge", d.smudge), y("uDissipation", d.dissipation), y("uMotionBlur", d.motionBlur), y("uMotionSample", d.motionSample);
        const V = d.pointerValues || x(U);
        V.isVelocityUpdate && (y("uMouse", V.currentPointer), y("uPrevMouse", V.prevPointer)), y("uVelocity", V.velocity);
        const O = typeof d.color == "function" ? d.color(V.velocity) : d.color;
        return y("uColor", O), y("uIsCursor", d.isCursor), y("uPressureEnd", d.pressure), h.current === null && (h.current = d.pressure), y("uPressureStart", h.current), h.current = d.pressure, s(z, ({ read: P }) => {
          y("uBuffer", P);
        });
      },
      [y, x, s, d, f]
    ),
    f,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: v,
      output: v.read.texture
    }
  ];
};
var J = `varying vec2 vUv;
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
}`, tt = `precision highp float;

void main(){
	gl_FragColor = vec4(0.0);
}`;
const nt = () => b(() => new a.ShaderMaterial({
  vertexShader: J,
  fragmentShader: tt,
  ...I
}), []);
var rt = `precision highp float;

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
const ot = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uVelocity: { value: _ },
        uSource: { value: _ },
        texelSize: { value: new a.Vector2() },
        dt: { value: Ae },
        dissipation: { value: 0 }
      },
      vertexShader: J,
      fragmentShader: rt
    },
    e
  ),
  ...I
}), [e]);
var at = `precision highp float;

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
const it = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: at
    },
    e
  ),
  ...I
}), [e]);
var ut = `precision highp float;

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
const st = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: ut
    },
    e
  ),
  ...I
}), [e]);
var lt = `precision highp float;

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
const ct = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uVelocity: { value: null },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: lt
    },
    e
  ),
  ...I
}), [e]);
var vt = `precision highp float;

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
const mt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: 0 },
        dt: { value: Ae },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: vt
    },
    e
  ),
  ...I
}), [e]);
var pt = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}`;
const dt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uTexture: { value: _ },
        value: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: pt
    },
    e
  ),
  ...I
}), [e]);
var ft = `precision highp float;

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
const gt = ({
  onBeforeInit: e
}) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uPressure: { value: _ },
        uVelocity: { value: _ },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: ft
    },
    e
  ),
  ...I
}), [e]);
var ht = `precision highp float;

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
const xt = ({ onBeforeInit: e }) => b(() => new a.ShaderMaterial({
  ...A(
    {
      uniforms: {
        uTarget: { value: _ },
        aspectRatio: { value: 0 },
        color: { value: new a.Vector3() },
        point: { value: new a.Vector2() },
        radius: { value: 0 },
        texelSize: { value: new a.Vector2() }
      },
      vertexShader: J,
      fragmentShader: ht
    },
    e
  ),
  ...I
}), [e]), H = (e, t) => e(t ?? {}), yt = ({
  scene: e,
  size: t,
  dpr: n,
  customFluidProps: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), {
    curl: c,
    vorticity: p,
    advection: l,
    divergence: i,
    pressure: m,
    clear: g,
    gradientSubtract: x,
    splat: v
  } = r ?? {}, s = H(nt), d = s.clone(), o = H(ct, c), h = H(mt, p), y = H(ot, l), T = H(
    it,
    i
  ), f = H(st, m), M = H(dt, g), S = H(
    gt,
    x
  ), C = H(xt, v), D = b(
    () => ({
      vorticityMaterial: h,
      curlMaterial: o,
      advectionMaterial: y,
      divergenceMaterial: T,
      pressureMaterial: f,
      clearMaterial: M,
      gradientSubtractMaterial: S,
      splatMaterial: C
    }),
    [
      h,
      o,
      y,
      T,
      f,
      M,
      S,
      C
    ]
  ), z = Y(t, n);
  b(() => {
    R(D.splatMaterial)(
      "aspectRatio",
      z.x / z.y
    );
    for (const O of Object.values(D))
      R(O)(
        "texelSize",
        new a.Vector2(1 / z.x, 1 / z.y)
      );
  }, [z, D]);
  const U = $(e, u, s, a.Mesh);
  b(() => {
    s.dispose(), U.material = d;
  }, [s, U, d]), ie(() => () => {
    for (const O of Object.values(D))
      O.dispose();
  }, [D]);
  const V = w(
    (O) => {
      U.material = O, U.material.needsUpdate = !0;
    },
    [U]
  );
  return { materials: D, setMeshMaterial: V, mesh: U };
}, Ae = 0.016, bt = Object.freeze({
  densityDissipation: 0.98,
  velocityDissipation: 0.99,
  velocityAcceleration: 10,
  pressureDissipation: 0.9,
  pressureIterations: 20,
  curlStrength: 35,
  splatRadius: 2e-3,
  fluidColor: new a.Vector3(1, 1, 1),
  pointerValues: !1
}), Jn = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  customFluidProps: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { materials: i, setMeshMaterial: m, mesh: g } = yt({
    scene: l,
    size: e,
    dpr: p.shader,
    customFluidProps: c
  }), x = q(e), v = Ce(), s = b(
    () => ({
      scene: l,
      camera: x,
      dpr: p.fbo,
      size: e,
      samples: n,
      isSizeUpdate: u,
      type: a.HalfFloatType,
      ...r
    }),
    [
      l,
      x,
      e,
      n,
      p.fbo,
      u,
      r
    ]
  ), [d, o] = le(s), [h, y] = le(s), [T, f] = W(s), [M, S] = W(s), [C, D] = le(s), z = L(new a.Vector2(0, 0)), U = L(new a.Vector3(0, 0, 0)), [V, O] = j(bt), P = b(
    () => ({
      advection: R(i.advectionMaterial),
      splat: R(i.splatMaterial),
      curl: R(i.curlMaterial),
      vorticity: R(i.vorticityMaterial),
      divergence: R(i.divergenceMaterial),
      clear: R(i.clearMaterial),
      pressure: R(i.pressureMaterial),
      gradientSubtract: R(i.gradientSubtractMaterial)
    }),
    [i]
  ), G = b(
    () => ({
      advection: F(i.advectionMaterial),
      splat: F(i.splatMaterial),
      curl: F(i.curlMaterial),
      vorticity: F(i.vorticityMaterial),
      divergence: F(i.divergenceMaterial),
      clear: F(i.clearMaterial),
      pressure: F(i.pressureMaterial),
      gradientSubtract: F(i.gradientSubtractMaterial)
    }),
    [i]
  ), X = w(
    (te, ne) => {
      O(te), ne && Object.keys(ne).forEach((ue) => {
        G[ue](
          ne[ue]
        );
      });
    },
    [O, G]
  );
  return [
    w(
      (te, ne, ue) => {
        const { gl: K, pointer: ze, size: we } = te;
        X(ne, ue);
        const ye = o(K, ({ read: k }) => {
          m(i.advectionMaterial), P.advection("uVelocity", k), P.advection("uSource", k), P.advection(
            "dissipation",
            V.velocityDissipation
          );
        }), Ue = y(K, ({ read: k }) => {
          m(i.advectionMaterial), P.advection("uVelocity", ye), P.advection("uSource", k), P.advection(
            "dissipation",
            V.densityDissipation
          );
        }), de = V.pointerValues || v(ze);
        de.isVelocityUpdate && (o(K, ({ read: k }) => {
          m(i.splatMaterial), P.splat("uTarget", k), P.splat("point", de.currentPointer);
          const ce = de.diffPointer.multiply(
            z.current.set(we.width, we.height).multiplyScalar(V.velocityAcceleration)
          );
          P.splat(
            "color",
            U.current.set(ce.x, ce.y, 1)
          ), P.splat("radius", V.splatRadius);
        }), y(K, ({ read: k }) => {
          m(i.splatMaterial), P.splat("uTarget", k);
          const ce = typeof V.fluidColor == "function" ? V.fluidColor(de.velocity) : V.fluidColor;
          P.splat("color", ce);
        }));
        const Oe = f(K, () => {
          m(i.curlMaterial), P.curl("uVelocity", ye);
        });
        o(K, ({ read: k }) => {
          m(i.vorticityMaterial), P.vorticity("uVelocity", k), P.vorticity("uCurl", Oe), P.vorticity("curl", V.curlStrength);
        });
        const Be = S(K, () => {
          m(i.divergenceMaterial), P.divergence("uVelocity", ye);
        });
        D(K, ({ read: k }) => {
          m(i.clearMaterial), P.clear("uTexture", k), P.clear("value", V.pressureDissipation);
        }), m(i.pressureMaterial), P.pressure("uDivergence", Be);
        let Te;
        for (let k = 0; k < V.pressureIterations; k++)
          Te = D(K, ({ read: ce }) => {
            P.pressure("uPressure", ce);
          });
        return o(K, ({ read: k }) => {
          m(i.gradientSubtractMaterial), P.gradientSubtract("uPressure", Te), P.gradientSubtract("uVelocity", k);
        }), Ue;
      },
      [
        i,
        P,
        m,
        f,
        y,
        S,
        v,
        D,
        o,
        V,
        X
      ]
    ),
    X,
    {
      scene: l,
      mesh: g,
      materials: i,
      camera: x,
      renderTarget: {
        velocity: d,
        density: h,
        curl: T,
        divergence: M,
        pressure: C
      },
      output: h.read.texture
    }
  ];
};
var Mt = "#usf <defaultVertex>", St = `precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec3 color = texture2D(uMap, uv).rgb;
	gl_FragColor = vec4(color,uOpacity);
}`;
const Ct = ({
  scale: e,
  max: t,
  texture: n,
  scene: r,
  onBeforeInit: u
}) => {
  const c = b(
    () => new a.PlaneGeometry(e, e),
    [e]
  ), p = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uOpacity: { value: 0 },
          uMap: { value: n || _ }
        },
        vertexShader: Mt,
        fragmentShader: St
      },
      u
    ),
    blending: a.AdditiveBlending,
    ...I,
    // Must be transparent.
    transparent: !0
  }), [n, u]), l = b(() => {
    const i = [];
    for (let m = 0; m < t; m++) {
      const g = p.clone(), x = new a.Mesh(c.clone(), g);
      x.rotateZ(2 * Math.PI * Math.random()), x.visible = !1, r.add(x), i.push(x);
    }
    return i;
  }, [c, p, r, t]);
  return ie(() => () => {
    l.forEach((i) => {
      i.geometry.dispose(), Array.isArray(i.material) ? i.material.forEach((m) => m.dispose()) : i.material.dispose(), r.remove(i);
    });
  }, [r, l]), l;
}, _t = Object.freeze({
  frequency: 0.01,
  rotation: 0.05,
  fadeoutSpeed: 0.9,
  scale: 0.3,
  alpha: 0.6,
  pointerValues: !1
}), er = ({
  texture: e,
  scale: t = 64,
  max: n = 100,
  size: r,
  dpr: u,
  renderTargetOptions: c,
  samples: p,
  isSizeUpdate: l,
  onBeforeInit: i
}) => {
  const m = B(u), g = b(() => new a.Scene(), []), x = Ct({
    scale: t,
    max: n,
    texture: e,
    scene: g,
    onBeforeInit: i
  }), v = q(r), s = Ce(), [d, o] = W({
    scene: g,
    camera: v,
    size: r,
    dpr: m.fbo,
    samples: p,
    isSizeUpdate: l,
    ...c
  }), [h, y] = j(_t), T = L(0), f = b(() => (S, C) => {
    y(S), x.forEach((D) => {
      if (D.visible) {
        const z = D.material;
        D.rotation.z += h.rotation, D.scale.x = h.fadeoutSpeed * D.scale.x + h.scale, D.scale.y = D.scale.x;
        const U = z.uniforms.uOpacity.value;
        R(z)("uOpacity", U * h.fadeoutSpeed), U < 1e-3 && (D.visible = !1);
      }
      F(D.material)(C);
    });
  }, [x, h, y]);
  return [
    w(
      (S, C, D) => {
        const { gl: z, pointer: U, size: V } = S;
        f(C, D);
        const O = h.pointerValues || s(U);
        if (h.frequency < O.diffPointer.length()) {
          const P = x[T.current], G = P.material;
          P.visible = !0, P.position.set(
            O.currentPointer.x * (V.width / 2),
            O.currentPointer.y * (V.height / 2),
            0
          ), P.scale.x = P.scale.y = 0, R(G)("uOpacity", h.alpha), T.current = (T.current + 1) % n;
        }
        return o(z);
      },
      [o, x, s, n, h, f]
    ),
    f,
    {
      scene: g,
      camera: v,
      meshArr: x,
      renderTarget: d,
      output: d.texture
    }
  ];
};
var wt = "#usf <planeVertex>", Tt = `precision highp float;
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
const Dt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTime: { value: 0 },
          scale: { value: oe.scale },
          timeStrength: { value: oe.timeStrength },
          noiseOctaves: { value: oe.noiseOctaves },
          fbmOctaves: { value: oe.fbmOctaves },
          warpOctaves: { value: oe.warpOctaves },
          warpDirection: { value: oe.warpDirection },
          warpStrength: { value: oe.warpStrength }
        },
        vertexShader: wt,
        fragmentShader: Tt
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, oe = Object.freeze({
  scale: 4e-3,
  timeStrength: 0.3,
  noiseOctaves: 2,
  fbmOctaves: 2,
  warpOctaves: 2,
  warpDirection: new a.Vector2(2, 2),
  warpStrength: 8,
  beat: !1
}), tr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Dt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(oe), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C, clock: D } = f;
        return y(M, S), o("scale", s.scale), o("timeStrength", s.timeStrength), o("noiseOctaves", s.noiseOctaves), o("fbmOctaves", s.fbmOctaves), o("warpOctaves", s.warpOctaves), o("warpDirection", s.warpDirection), o("warpStrength", s.warpStrength), o("uTime", s.beat || D.getElapsedTime()), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Pt = "#usf <planeVertex>", Rt = `precision highp float;
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
const Vt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          isTexture: { value: !1 },
          scale: { value: Q.scale },
          noise: { value: _ },
          noiseStrength: { value: Q.noiseStrength },
          isNoise: { value: !1 },
          laminateLayer: { value: Q.laminateLayer },
          laminateInterval: {
            value: Q.laminateInterval
          },
          laminateDetail: { value: Q.laminateDetail },
          distortion: { value: Q.distortion },
          colorFactor: { value: Q.colorFactor },
          uTime: { value: 0 },
          timeStrength: { value: Q.timeStrength }
        },
        vertexShader: Pt,
        fragmentShader: Rt
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Q = Object.freeze({
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
}), nr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Vt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(Q), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C, clock: D } = f;
        return y(M, S), s.texture ? (o("uTexture", s.texture), o("isTexture", !0)) : (o("isTexture", !1), o("scale", s.scale)), s.noise ? (o("noise", s.noise), o("isNoise", !0), o("noiseStrength", s.noiseStrength)) : o("isNoise", !1), o("uTime", s.beat || D.getElapsedTime()), o("laminateLayer", s.laminateLayer), o("laminateInterval", s.laminateInterval), o("laminateDetail", s.laminateDetail), o("distortion", s.distortion), o("colorFactor", s.colorFactor), o("timeStrength", s.timeStrength), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var At = "#usf <planeVertex>", Ft = `precision highp float;

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
const It = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_time: { value: 0 },
          u_pattern: { value: se.pattern },
          u_complexity: { value: se.complexity },
          u_complexityAttenuation: {
            value: se.complexityAttenuation
          },
          u_iterations: { value: se.iterations },
          u_timeStrength: { value: se.timeStrength },
          u_scale: { value: se.scale }
        },
        vertexShader: At,
        fragmentShader: Ft
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, se = Object.freeze({
  pattern: 0,
  complexity: 2,
  complexityAttenuation: 0.2,
  iterations: 8,
  timeStrength: 0.2,
  scale: 2e-3,
  beat: !1
}), rr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = It({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(se), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C, clock: D } = f;
        return y(M, S), o("u_pattern", s.pattern), o("u_complexity", s.complexity), o("u_complexityAttenuation", s.complexityAttenuation), o("u_iterations", s.iterations), o("u_timeStrength", s.timeStrength), o("u_scale", s.scale), o("u_time", s.beat || D.getElapsedTime()), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var zt = "#usf <planeVertex>", Ut = `precision highp float;
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
const Ot = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uRgbWeight: { value: ve.rgbWeight },
          uColor1: { value: ve.color1 },
          uColor2: { value: ve.color2 },
          uColor3: { value: ve.color3 },
          uColor4: { value: ve.color4 }
        },
        vertexShader: zt,
        fragmentShader: Ut
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, ve = Object.freeze({
  texture: _,
  color1: new a.Color().set(0.5, 0.5, 0.5),
  color2: new a.Color().set(0.5, 0.5, 0.5),
  color3: new a.Color().set(1, 1, 1),
  color4: new a.Color().set(0, 0.1, 0.2),
  rgbWeight: new a.Vector3(0.299, 0.587, 0.114)
}), or = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Ot({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(ve), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("uTexture", s.texture), o("uColor1", s.color1), o("uColor2", s.color2), o("uColor3", s.color3), o("uColor4", s.color4), o("uRgbWeight", s.rgbWeight), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Bt = "#usf <planeVertex>", Et = `precision highp float;

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
const Lt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uColor0: { value: Me.color0 },
          uColor1: { value: Me.color1 }
        },
        vertexShader: Bt,
        fragmentShader: Et
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Me = Object.freeze({
  texture: _,
  color0: new a.Color(16777215),
  color1: new a.Color(0)
}), ar = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Lt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(Me), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("uTexture", s.texture), o("uColor0", s.color0), o("uColor1", s.color1), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var $t = "#usf <planeVertex>", qt = `precision highp float;

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
const jt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_texture: { value: _ },
          uMap: { value: _ },
          u_alphaMap: { value: _ },
          u_isAlphaMap: { value: !1 },
          uMapIntensity: { value: me.mapIntensity },
          u_brightness: { value: me.brightness },
          u_min: { value: me.min },
          u_max: { value: me.max },
          u_dodgeColor: { value: new a.Color() },
          u_isDodgeColor: { value: !1 }
        },
        vertexShader: $t,
        fragmentShader: qt
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, me = Object.freeze({
  texture: _,
  map: _,
  alphaMap: !1,
  mapIntensity: 0.3,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1,
  dodgeColor: !1
}), ir = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = jt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(me), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("u_texture", s.texture), o("uMap", s.map), o("uMapIntensity", s.mapIntensity), s.alphaMap ? (o("u_alphaMap", s.alphaMap), o("u_isAlphaMap", !0)) : o("u_isAlphaMap", !1), o("u_brightness", s.brightness), o("u_min", s.min), o("u_max", s.max), s.dodgeColor ? (o("u_dodgeColor", s.dodgeColor), o("u_isDodgeColor", !0)) : o("u_isDodgeColor", !1), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Wt = "#usf <planeVertex>", Nt = `precision highp float;

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
const kt = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), c = b(() => {
    var m, g;
    return new a.ShaderMaterial({
      ...A(
        {
          uniforms: {
            uResolution: { value: new a.Vector2() },
            uTextureResolution: { value: new a.Vector2() },
            uTexture0: { value: _ },
            uTexture1: { value: _ },
            padding: { value: ae.padding },
            uMap: { value: _ },
            edgeIntensity: { value: ae.edgeIntensity },
            mapIntensity: { value: ae.mapIntensity },
            epicenter: { value: ae.epicenter },
            progress: { value: ae.progress },
            dirX: { value: (m = ae.dir) == null ? void 0 : m.x },
            dirY: { value: (g = ae.dir) == null ? void 0 : g.y }
          },
          vertexShader: Wt,
          fragmentShader: Nt
        },
        r
      ),
      ...I
    });
  }, [r]), p = Y(t, n);
  R(c)("uResolution", p.clone());
  const l = $(e, u, c, a.Mesh);
  return { material: c, mesh: l };
}, ae = Object.freeze({
  texture0: _,
  texture1: _,
  padding: 0,
  map: _,
  mapIntensity: 0,
  edgeIntensity: 0,
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  dir: new a.Vector2(0, 0)
}), ur = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = kt({
    scene: l,
    size: e,
    dpr: p.shader,
    onBeforeInit: c
  }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    dpr: p.fbo,
    size: e,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(ae), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        var V, O, P, G, X, ee, te, ne;
        const { gl: C } = f;
        y(M, S), o("uTexture0", s.texture0), o("uTexture1", s.texture1), o("progress", s.progress);
        const D = [
          ((O = (V = s.texture0) == null ? void 0 : V.image) == null ? void 0 : O.width) || 0,
          ((G = (P = s.texture0) == null ? void 0 : P.image) == null ? void 0 : G.height) || 0
        ], z = [
          ((ee = (X = s.texture1) == null ? void 0 : X.image) == null ? void 0 : ee.width) || 0,
          ((ne = (te = s.texture1) == null ? void 0 : te.image) == null ? void 0 : ne.height) || 0
        ], U = D.map((ue, K) => ue + (z[K] - ue) * s.progress);
        return o("uTextureResolution", U), o("padding", s.padding), o("uMap", s.map), o("mapIntensity", s.mapIntensity), o("edgeIntensity", s.edgeIntensity), o("epicenter", s.epicenter), o("dirX", s.dir.x), o("dirY", s.dir.y), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Gt = "#usf <planeVertex>", Kt = `precision highp float;

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
const Xt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_texture: { value: _ },
          u_brightness: { value: fe.brightness },
          u_min: { value: fe.min },
          u_max: { value: fe.max }
        },
        vertexShader: Gt,
        fragmentShader: Kt
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, fe = Object.freeze({
  texture: _,
  brightness: new a.Vector3(0.5, 0.5, 0.5),
  min: 0,
  max: 1
}), sr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Xt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(
    fe
  ), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("u_texture", s.texture), o("u_brightness", s.brightness), o("u_min", s.min), o("u_max", s.max), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Yt = "#usf <planeVertex>", Ht = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D uMap;
uniform float uMapIntensity;

void main() {
	vec2 uv = vUv;

	#usf <fxBlending>

	gl_FragColor = texture2D(u_texture, uv);
}`;
const Qt = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_texture: { value: _ },
          uMap: { value: _ },
          uMapIntensity: { value: Fe.mapIntensity }
        },
        vertexShader: Yt,
        fragmentShader: Ht
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Fe = Object.freeze({
  texture: _,
  map: _,
  mapIntensity: 0.3
}), lr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Qt({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(Fe), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("u_texture", s.texture), o("uMap", s.map), o("uMapIntensity", s.mapIntensity), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Zt = "#usf <planeVertex>", Jt = `precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(uTexture, uv);
	vec4 map = texture2D(uMap, uv);
	gl_FragColor = mix(tex,map,map.a);
}`;
const en = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uMap: { value: _ }
        },
        vertexShader: Zt,
        fragmentShader: Jt
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, tn = Object.freeze({
  texture: _,
  map: _
}), cr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = en({
    scene: l,
    size: e,
    onBeforeInit: c
  }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(tn), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("uTexture", s.texture), o("uMap", s.map), v(C);
      },
      [o, v, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var nn = "#usf <planeVertex>", rn = `precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_saturation;

#usf <rgb2hsv>

#usf <hsv2rgb>

void main() {
	vec4 tex = texture2D(u_texture, vUv);
	vec3 hsv = rgb2hsv(tex.rgb);
	hsv.y *= u_saturation;
	hsv.z *= u_brightness;
	vec3 final = hsv2rgb(hsv);
	gl_FragColor = vec4(final, tex.a);
}`;
const on = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_texture: { value: _ },
          u_brightness: { value: Se.brightness },
          u_saturation: { value: Se.saturation }
        },
        vertexShader: nn,
        fragmentShader: rn
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Se = Object.freeze({
  texture: _,
  brightness: 1,
  saturation: 1
}), vr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = on({
    scene: l,
    size: e,
    onBeforeInit: c
  }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(Se), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("u_texture", s.texture), o("u_brightness", s.brightness), o("u_saturation", s.saturation), v(C);
      },
      [o, v, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var an = "#usf <planeVertex>", un = `precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2D uTexture;

void main() {
	#usf <coverTexture>
	
	gl_FragColor = texture2D(uTexture, uv);
}`;
const sn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), c = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uResolution: { value: new a.Vector2() },
          uTextureResolution: { value: new a.Vector2() },
          uTexture: { value: _ }
        },
        vertexShader: an,
        fragmentShader: un
      },
      r
    ),
    ...I
  }), [r]), p = Y(t, n);
  R(c)("uResolution", p.clone());
  const l = $(e, u, c, a.Mesh);
  return { material: c, mesh: l };
}, ln = Object.freeze({
  texture: _
}), mr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = sn({
    scene: l,
    size: e,
    dpr: p.shader,
    onBeforeInit: c
  }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    dpr: p.fbo,
    size: e,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(ln), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        var D, z, U, V, O, P;
        const { gl: C } = f;
        return y(M, S), o("uTexture", s.texture), o("uTextureResolution", [
          ((U = (z = (D = s.texture) == null ? void 0 : D.source) == null ? void 0 : z.data) == null ? void 0 : U.width) || 0,
          ((P = (O = (V = s.texture) == null ? void 0 : V.source) == null ? void 0 : O.data) == null ? void 0 : P.height) || 0
        ]), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var cn = "#usf <planeVertex>", vn = `precision highp float;

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
const mn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uResolution: { value: new a.Vector2(0, 0) },
          uBlurSize: { value: Ie.blurSize }
        },
        vertexShader: cn,
        fragmentShader: vn
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, Ie = Object.freeze({
  texture: _,
  blurSize: 3,
  blurPower: 5
}), pr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = mn({ scene: l, onBeforeInit: c }), g = q(e), x = b(
    () => ({
      scene: l,
      camera: g,
      size: e,
      dpr: p.fbo,
      samples: n,
      isSizeUpdate: u,
      ...r
    }),
    [
      l,
      g,
      e,
      p.fbo,
      n,
      u,
      r
    ]
  ), [v, s] = le(x), [d, o] = j(Ie), h = R(i), y = F(i), T = w(
    (M, S) => {
      o(M), y(S);
    },
    [o, y]
  );
  return [
    w(
      (M, S, C) => {
        var U, V, O, P, G, X;
        const { gl: D } = M;
        T(S, C), h("uTexture", d.texture), h("uResolution", [
          ((O = (V = (U = d.texture) == null ? void 0 : U.source) == null ? void 0 : V.data) == null ? void 0 : O.width) || 0,
          ((X = (G = (P = d.texture) == null ? void 0 : P.source) == null ? void 0 : G.data) == null ? void 0 : X.height) || 0
        ]), h("uBlurSize", d.blurSize);
        let z = s(D);
        for (let ee = 0; ee < d.blurPower; ee++)
          h("uTexture", z), z = s(D);
        return z;
      },
      [s, h, d, T]
    ),
    T,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: v,
      output: v.read.texture
    }
  ];
};
var pn = "#usf <planeVertex>", dn = `precision highp float;

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
const fn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uBackbuffer: { value: _ },
          uBegin: { value: ge.begin },
          uEnd: { value: ge.end },
          uStrength: { value: ge.strength }
        },
        vertexShader: pn,
        fragmentShader: dn
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, ge = Object.freeze({
  texture: _,
  begin: new a.Vector2(0, 0),
  end: new a.Vector2(0, 0),
  strength: 0.9
}), dr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = fn({ scene: l, onBeforeInit: c }), g = q(e), x = b(
    () => ({
      scene: l,
      camera: g,
      size: e,
      dpr: p.fbo,
      samples: n,
      isSizeUpdate: u,
      ...r
    }),
    [
      l,
      g,
      e,
      p.fbo,
      n,
      u,
      r
    ]
  ), [v, s] = le(x), [d, o] = j(ge), h = R(i), y = F(i), T = w(
    (M, S) => {
      o(M), y(S);
    },
    [o, y]
  );
  return [
    w(
      (M, S, C) => {
        const { gl: D } = M;
        return T(S, C), h("uTexture", d.texture), h("uBegin", d.begin), h("uEnd", d.end), h("uStrength", d.strength), s(D, ({ read: z }) => {
          h("uBackbuffer", z);
        });
      },
      [s, h, T, d]
    ),
    T,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: v,
      output: v.read.texture
    }
  ];
};
var gn = "#usf <planeVertex>", hn = `precision highp float;

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
const xn = ({
  scene: e,
  onBeforeInit: t
}) => {
  const n = b(() => new a.PlaneGeometry(2, 2), []), r = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uEpicenter: { value: pe.epicenter },
          uProgress: { value: pe.progress },
          uStrength: { value: pe.strength },
          uWidth: { value: pe.width },
          uMode: { value: 0 }
        },
        vertexShader: gn,
        fragmentShader: hn
      },
      t
    ),
    ...I
  }), [t]), u = $(e, n, r, a.Mesh);
  return { material: r, mesh: u };
}, pe = Object.freeze({
  epicenter: new a.Vector2(0, 0),
  progress: 0,
  width: 0,
  strength: 0,
  mode: "center"
}), fr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = xn({ scene: l, onBeforeInit: c }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(pe), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("uEpicenter", s.epicenter), o("uProgress", s.progress), o("uWidth", s.width), o("uStrength", s.strength), o(
          "uMode",
          s.mode === "center" ? 0 : s.mode === "horizontal" ? 1 : 2
        ), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var yn = "#usf <planeVertex>", bn = `precision highp float;
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
const Mn = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), c = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          u_texture: { value: _ },
          u_resolution: { value: new a.Vector2() },
          u_keyColor: { value: Z.color },
          u_similarity: { value: Z.similarity },
          u_smoothness: { value: Z.smoothness },
          u_spill: { value: Z.spill },
          u_color: { value: Z.color },
          u_contrast: { value: Z.contrast },
          u_brightness: { value: Z.brightness },
          u_gamma: { value: Z.gamma }
        },
        vertexShader: yn,
        fragmentShader: bn
      },
      r
    ),
    ...I
  }), [r]), p = Y(t, n);
  R(c)("u_resolution", p.clone());
  const l = $(e, u, c, a.Mesh);
  return { material: c, mesh: l };
}, Z = Object.freeze({
  texture: _,
  keyColor: new a.Color(65280),
  similarity: 0.2,
  smoothness: 0.1,
  spill: 0.2,
  color: new a.Vector4(1, 1, 1, 1),
  contrast: 1,
  brightness: 0,
  gamma: 1
}), gr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = Mn({
    scene: l,
    size: e,
    dpr: p.shader,
    onBeforeInit: c
  }), g = q(e), [x, v] = W({
    scene: l,
    camera: g,
    size: e,
    dpr: p.fbo,
    samples: n,
    isSizeUpdate: u,
    ...r
  }), [s, d] = j(Z), o = R(i), h = F(i), y = w(
    (f, M) => {
      d(f), h(M);
    },
    [d, h]
  );
  return [
    w(
      (f, M, S) => {
        const { gl: C } = f;
        return y(M, S), o("u_texture", s.texture), o("u_keyColor", s.keyColor), o("u_similarity", s.similarity), o("u_smoothness", s.smoothness), o("u_spill", s.spill), o("u_color", s.color), o("u_contrast", s.contrast), o("u_brightness", s.brightness), o("u_gamma", s.gamma), v(C);
      },
      [v, o, s, y]
    ),
    y,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: x,
      output: x.texture
    }
  ];
};
var Sn = `precision highp float;

varying vec2 vUv;
#usf <varyings>

#usf <uniforms>

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf <main>
	
	gl_Position = usf_Position;
}`, Cn = `precision highp float;

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
const _n = ({
  scene: e,
  size: t,
  dpr: n,
  onBeforeInit: r
}) => {
  const u = b(() => new a.PlaneGeometry(2, 2), []), c = b(() => new a.ShaderMaterial({
    ...A(
      {
        uniforms: {
          uTexture: { value: _ },
          uBackbuffer: { value: _ },
          uTime: { value: 0 },
          uPointer: { value: new a.Vector2() },
          uResolution: { value: new a.Vector2() }
        },
        vertexShader: Sn,
        fragmentShader: Cn
      },
      r
    ),
    ...I
  }), [r]), p = Y(t, n);
  R(c)("uResolution", p.clone());
  const l = $(e, u, c, a.Mesh);
  return { material: c, mesh: l };
}, wn = Object.freeze({
  texture: _,
  beat: !1
}), hr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  onBeforeInit: c
}) => {
  const p = B(t), l = b(() => new a.Scene(), []), { material: i, mesh: m } = _n({
    scene: l,
    size: e,
    dpr: p.shader,
    onBeforeInit: c
  }), g = q(e), x = b(
    () => ({
      scene: l,
      camera: g,
      size: e,
      dpr: p.fbo,
      samples: n,
      isSizeUpdate: u,
      ...r
    }),
    [
      l,
      g,
      e,
      p.fbo,
      n,
      u,
      r
    ]
  ), [v, s] = le(x), [d, o] = j(wn), h = R(i), y = F(i), T = w(
    (M, S) => {
      o(M), y(S);
    },
    [o, y]
  );
  return [
    w(
      (M, S, C) => {
        const { gl: D, clock: z, pointer: U } = M;
        return T(S, C), h("uPointer", U), h("uTexture", d.texture), h("uTime", d.beat || z.getElapsedTime()), s(D, ({ read: V }) => {
          h("uBackbuffer", V);
        });
      },
      [s, h, d, T]
    ),
    T,
    {
      scene: l,
      mesh: m,
      material: i,
      camera: g,
      renderTarget: v,
      output: v.read.texture
    }
  ];
}, Tn = ({
  scene: e,
  geometry: t,
  material: n
}) => {
  const r = $(
    e,
    t,
    n,
    a.Points
  ), u = $(
    e,
    b(() => t.clone(), [t]),
    b(() => n.clone(), [n]),
    a.Mesh
  );
  return u.visible = !1, {
    points: r,
    interactiveMesh: u
  };
};
var Dn = `uniform vec2 uResolution;
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
}`, Pn = `precision highp float;
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
const De = (e, t, n, r, u) => {
  var g;
  const c = n === "position" ? "positionTarget" : "uvTarget", p = n === "position" ? "#usf <morphPositions>" : "#usf <morphUvs>", l = n === "position" ? "#usf <morphPositionTransition>" : "#usf <morphUvTransition>", i = n === "position" ? "positionsList" : "uvsList", m = n === "position" ? `
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
      new a.BufferAttribute(e[0], u)
    );
    let x = "", v = "";
    e.forEach((s, d) => {
      t.setAttribute(
        `${c}${d}`,
        new a.BufferAttribute(s, u)
      ), x += `attribute vec${u} ${c}${d};
`, d === 0 ? v += `${c}${d}` : v += `,${c}${d}`;
    }), r = r.replace(
      `${p}`,
      x
    ), r = r.replace(
      `${l}`,
      `vec${u} ${i}[${e.length}] = vec${u}[](${v});
				${m}
			`
    );
  } else
    r = r.replace(`${p}`, ""), r = r.replace(`${l}`, ""), (g = t == null ? void 0 : t.attributes[n]) != null && g.array || Ve && console.error(
      `use-shader-fx:geometry.attributes.${n}.array is not found`
    );
  return r;
}, Pe = (e, t, n, r) => {
  var c;
  let u = [];
  if (e && e.length > 0) {
    (c = t == null ? void 0 : t.attributes[n]) != null && c.array ? u = [
      t.attributes[n].array,
      ...e
    ] : u = e;
    const p = Math.max(...u.map((l) => l.length));
    u.forEach((l, i) => {
      if (l.length < p) {
        const m = (p - l.length) / r, g = [], x = Array.from(l);
        for (let v = 0; v < m; v++) {
          const s = Math.floor(l.length / r * Math.random()) * r;
          for (let d = 0; d < r; d++)
            g.push(x[s + d]);
        }
        u[i] = new Float32Array([...x, ...g]);
      }
    });
  }
  return u;
}, Rn = (e, t) => {
  let n = "";
  const r = {};
  let u = "mapArrayColor = ";
  return e && e.length > 0 ? (e.forEach((p, l) => {
    const i = `vMapArrayIndex < ${l}.1`, m = `texture2D(uMapArray${l}, uv)`;
    u += `( ${i} ) ? ${m} : `, n += `
        uniform sampler2D uMapArray${l};
      `, r[`uMapArray${l}`] = { value: p };
  }), u += "vec4(1.);", n += "bool isMapArray = true;", r.uMapArrayLength = { value: e.length }) : (u += "vec4(1.0);", n += "bool isMapArray = false;", r.uMapArrayLength = { value: 0 }), { rewritedFragmentShader: t.replace("#usf <mapArraySwitcher>", u).replace("#usf <mapArrayUniforms>", n), mapArrayUniforms: r };
}, Vn = ({
  size: e,
  dpr: t,
  geometry: n,
  positions: r,
  uvs: u,
  mapArray: c,
  onBeforeInit: p
}) => {
  const l = b(
    () => Pe(r, n, "position", 3),
    [r, n]
  ), i = b(
    () => Pe(u, n, "uv", 2),
    [u, n]
  ), m = b(() => {
    l.length !== i.length && Ve && console.log("use-shader-fx:positions and uvs are not matched");
    const x = De(
      i,
      n,
      "uv",
      De(
        l,
        n,
        "position",
        Dn,
        3
      ),
      2
    ), { rewritedFragmentShader: v, mapArrayUniforms: s } = Rn(c, Pn);
    return new a.ShaderMaterial({
      ...A(
        {
          uniforms: {
            uResolution: { value: new a.Vector2(0, 0) },
            uMorphProgress: {
              value: E.morphProgress
            },
            uBlurAlpha: { value: E.blurAlpha },
            uBlurRadius: { value: E.blurRadius },
            uPointSize: { value: E.pointSize },
            uPointAlpha: { value: E.pointAlpha },
            uPicture: { value: _ },
            uIsPicture: { value: !1 },
            uAlphaPicture: { value: _ },
            uIsAlphaPicture: { value: !1 },
            uColor0: { value: E.color0 },
            uColor1: { value: E.color1 },
            uColor2: { value: E.color2 },
            uColor3: { value: E.color3 },
            uMap: { value: _ },
            uIsMap: { value: !1 },
            uAlphaMap: { value: _ },
            uIsAlphaMap: { value: !1 },
            uTime: { value: 0 },
            uWobblePositionFrequency: {
              value: E.wobblePositionFrequency
            },
            uWobbleTimeFrequency: {
              value: E.wobbleTimeFrequency
            },
            uWobbleStrength: {
              value: E.wobbleStrength
            },
            uWarpPositionFrequency: {
              value: E.warpPositionFrequency
            },
            uWarpTimeFrequency: {
              value: E.warpTimeFrequency
            },
            uWarpStrength: { value: E.warpStrength },
            uDisplacement: { value: _ },
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
            uSizeRandomMin: {
              value: E.sizeRandomMin
            },
            uSizeRandomMax: {
              value: E.sizeRandomMax
            },
            uDivergence: { value: E.divergence },
            uDivergencePoint: {
              value: E.divergencePoint
            },
            ...s
          },
          vertexShader: x,
          fragmentShader: v
        },
        p
      ),
      ...I,
      blending: a.AdditiveBlending,
      // Must be transparent
      transparent: !0
    });
  }, [
    n,
    l,
    i,
    c,
    p
  ]), g = Y(e, t);
  return R(m)("uResolution", g.clone()), { material: m, modifiedPositions: l, modifiedUvs: i };
}, An = ({
  size: e,
  dpr: t,
  scene: n = !1,
  geometry: r,
  positions: u,
  uvs: c,
  mapArray: p,
  onBeforeInit: l
}) => {
  const i = B(t), m = b(() => {
    const T = r || new a.SphereGeometry(1, 32, 32);
    return T.setIndex(null), T.deleteAttribute("normal"), T;
  }, [r]), { material: g, modifiedPositions: x, modifiedUvs: v } = Vn({
    size: e,
    dpr: i.shader,
    geometry: m,
    positions: u,
    uvs: c,
    mapArray: p,
    onBeforeInit: l
  }), { points: s, interactiveMesh: d } = Tn({
    scene: n,
    geometry: m,
    material: g
  }), o = R(g), h = F(g);
  return [
    w(
      (T, f, M) => {
        T && o(
          "uTime",
          (f == null ? void 0 : f.beat) || T.clock.getElapsedTime()
        ), f !== void 0 && (o("uMorphProgress", f.morphProgress), o("uBlurAlpha", f.blurAlpha), o("uBlurRadius", f.blurRadius), o("uPointSize", f.pointSize), o("uPointAlpha", f.pointAlpha), f.picture ? (o("uPicture", f.picture), o("uIsPicture", !0)) : f.picture === !1 && o("uIsPicture", !1), f.alphaPicture ? (o("uAlphaPicture", f.alphaPicture), o("uIsAlphaPicture", !0)) : f.alphaPicture === !1 && o("uIsAlphaPicture", !1), o("uColor0", f.color0), o("uColor1", f.color1), o("uColor2", f.color2), o("uColor3", f.color3), f.map ? (o("uMap", f.map), o("uIsMap", !0)) : f.map === !1 && o("uIsMap", !1), f.alphaMap ? (o("uAlphaMap", f.alphaMap), o("uIsAlphaMap", !0)) : f.alphaMap === !1 && o("uIsAlphaMap", !1), o("uWobbleStrength", f.wobbleStrength), o(
          "uWobblePositionFrequency",
          f.wobblePositionFrequency
        ), o("uWobbleTimeFrequency", f.wobbleTimeFrequency), o("uWarpStrength", f.warpStrength), o("uWarpPositionFrequency", f.warpPositionFrequency), o("uWarpTimeFrequency", f.warpTimeFrequency), f.displacement ? (o("uDisplacement", f.displacement), o("uIsDisplacement", !0)) : f.displacement === !1 && o("uIsDisplacement", !1), o("uDisplacementIntensity", f.displacementIntensity), o(
          "uDisplacementColorIntensity",
          f.displacementColorIntensity
        ), o("uSizeRandomIntensity", f.sizeRandomIntensity), o(
          "uSizeRandomTimeFrequency",
          f.sizeRandomTimeFrequency
        ), o("uSizeRandomMin", f.sizeRandomMin), o("uSizeRandomMax", f.sizeRandomMax), o("uDivergence", f.divergence), o("uDivergencePoint", f.divergencePoint), h(M));
      },
      [o, h]
    ),
    {
      points: s,
      interactiveMesh: d,
      positions: x,
      uvs: v
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
}), xr = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  renderTargetOptions: u,
  camera: c,
  geometry: p,
  positions: l,
  uvs: i,
  onBeforeInit: m
}) => {
  const g = B(t), x = b(() => new a.Scene(), []), [
    v,
    {
      points: s,
      interactiveMesh: d,
      positions: o,
      uvs: h
    }
  ] = An({
    scene: x,
    size: e,
    dpr: t,
    geometry: p,
    positions: l,
    uvs: i,
    onBeforeInit: m
  }), [y, T] = W({
    scene: x,
    camera: c,
    size: e,
    dpr: g.fbo,
    samples: n,
    isSizeUpdate: r,
    depthBuffer: !0,
    ...u
  }), f = w(
    (S, C, D) => (v(S, C, D), T(S.gl)),
    [T, v]
  ), M = w(
    (S, C) => {
      v(null, S, C);
    },
    [v]
  );
  return [
    f,
    M,
    {
      scene: x,
      points: s,
      interactiveMesh: d,
      renderTarget: y,
      output: y.texture,
      positions: o,
      uvs: h
    }
  ];
}, Re = (e) => {
  e.vertexShader = e.vertexShader.replace(
    "void main() {",
    `
			uniform float uTime;
			uniform float uWobblePositionFrequency;
			uniform float uWobbleTimeFrequency;
			uniform float uWobbleStrength;
			uniform float uWarpPositionFrequency;
			uniform float uWarpTimeFrequency;
			uniform float uWarpStrength;
			varying float vWobble;
			varying vec2 vPosition;
			
			// edge
			varying vec3 vEdgeNormal;
			varying vec3 vEdgeViewPosition;

			#usf <wobble3D>

			void main() {
		`
  ), e.vertexShader = e.vertexShader.replace(
    "#include <beginnormal_vertex>",
    `
			vec3 objectNormal = usf_Normal;
			#ifdef USE_TANGENT
			vec3 objectTangent = vec3( tangent.xyz );
			#endif
		`
  ), e.vertexShader = e.vertexShader.replace(
    "#include <begin_vertex>",
    `
			vec3 transformed = usf_Position;
		`
  ), e.vertexShader = e.vertexShader.replace(
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
  );
}, Fn = (e) => {
  e.fragmentShader = e.fragmentShader.replace(
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
  ), e.fragmentShader = e.fragmentShader.replace(
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
  );
};
var In = `#ifdef USE_TRANSMISSION

	
	

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
#endif`, zn = `#ifdef USE_TRANSMISSION

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
const Un = ({
  mat: e,
  isCustomTransmission: t,
  parameters: n
}) => {
  e.type === "MeshPhysicalMaterial" && t && (n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_pars_fragment>",
    `${In}`
  ), n.fragmentShader = n.fragmentShader.replace(
    "#include <transmission_fragment>",
    `${zn}`
  )), e.normalMap || (n.vertexShader = n.vertexShader.replace(
    "void main() {",
    `
				attribute vec4 tangent;
				
				void main() {
			`
  ));
}, On = ({
  baseMaterial: e,
  materialParameters: t,
  isCustomTransmission: n = !1,
  onBeforeInit: r,
  depthOnBeforeInit: u
}) => {
  const { material: c, depthMaterial: p } = b(() => {
    const l = new (e || a.MeshPhysicalMaterial)(
      t || {}
    );
    Object.assign(l.userData, {
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
        transmissionMap: { value: null }
      }
    }), l.onBeforeCompile = (m) => {
      Re(m), Fn(m), Un({
        parameters: m,
        mat: l,
        isCustomTransmission: n
      });
      const g = A(
        {
          fragmentShader: m.fragmentShader,
          vertexShader: m.vertexShader,
          // Because wobble3D uses userData to update uniforms.
          uniforms: l.userData.uniforms
        },
        r
      );
      m.fragmentShader = g.fragmentShader, m.vertexShader = g.vertexShader, Object.assign(m.uniforms, g.uniforms);
    }, l.needsUpdate = !0;
    const i = new a.MeshDepthMaterial({
      depthPacking: a.RGBADepthPacking
    });
    return i.onBeforeCompile = (m) => {
      Object.assign(m.uniforms, l.userData.uniforms), Re(m), A(m, u);
    }, i.needsUpdate = !0, { material: l, depthMaterial: i };
  }, [
    t,
    e,
    r,
    u,
    n
  ]);
  return {
    material: c,
    depthMaterial: p
  };
}, Bn = ({
  scene: e = !1,
  geometry: t,
  isCustomTransmission: n,
  baseMaterial: r,
  materialParameters: u,
  onBeforeInit: c,
  depthOnBeforeInit: p
}) => {
  const l = b(() => {
    let o = t || new a.IcosahedronGeometry(2, 20);
    return o = Le(o), o.computeTangents(), o;
  }, [t]), { material: i, depthMaterial: m } = On({
    baseMaterial: r,
    materialParameters: u,
    isCustomTransmission: n,
    onBeforeInit: c,
    depthOnBeforeInit: p
  }), g = $(e, l, i, a.Mesh), x = i.userData, v = R(x), s = F(x);
  return [
    w(
      (o, h, y) => {
        o && v(
          "uTime",
          (h == null ? void 0 : h.beat) || o.clock.getElapsedTime()
        ), h !== void 0 && (v("uWobbleStrength", h.wobbleStrength), v(
          "uWobblePositionFrequency",
          h.wobblePositionFrequency
        ), v("uWobbleTimeFrequency", h.wobbleTimeFrequency), v("uWarpStrength", h.warpStrength), v("uWarpPositionFrequency", h.warpPositionFrequency), v("uWarpTimeFrequency", h.warpTimeFrequency), v("uColor0", h.color0), v("uColor1", h.color1), v("uColor2", h.color2), v("uColor3", h.color3), v("uColorMix", h.colorMix), v("uEdgeThreshold", h.edgeThreshold), v("uEdgeColor", h.edgeColor), v("uChromaticAberration", h.chromaticAberration), v("uAnisotropicBlur", h.anisotropicBlur), v("uDistortion", h.distortion), v("uDistortionScale", h.distortionScale), v("uRefractionSamples", h.refractionSamples), v("uTemporalDistortion", h.temporalDistortion), s(y));
      },
      [v, s]
    ),
    {
      mesh: g,
      depthMaterial: m
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
}), yr = ({
  size: e,
  dpr: t,
  samples: n,
  renderTargetOptions: r,
  isSizeUpdate: u,
  camera: c,
  geometry: p,
  baseMaterial: l,
  materialParameters: i,
  isCustomTransmission: m,
  onBeforeInit: g,
  depthOnBeforeInit: x
}) => {
  const v = B(t), s = b(() => new a.Scene(), []), [d, { mesh: o, depthMaterial: h }] = Bn({
    baseMaterial: l,
    materialParameters: i,
    scene: s,
    geometry: p,
    isCustomTransmission: m,
    onBeforeInit: g,
    depthOnBeforeInit: x
  }), [y, T] = W({
    scene: s,
    camera: c,
    size: e,
    dpr: v.fbo,
    samples: n,
    isSizeUpdate: u,
    depthBuffer: !0,
    ...r
  }), f = w(
    (S, C, D) => (d(S, C, D), T(S.gl)),
    [T, d]
  ), M = w(
    (S, C) => {
      d(null, S, C);
    },
    [d]
  );
  return [
    f,
    M,
    {
      scene: s,
      mesh: o,
      depthMaterial: h,
      renderTarget: y,
      output: y.texture
    }
  ];
}, br = (e, t, n) => {
  const r = b(() => {
    const u = new a.Mesh(t, n);
    return e.add(u), u;
  }, [t, n, e]);
  return ie(() => () => {
    e.remove(r), t.dispose(), n.dispose();
  }, [e, t, n, r]), r;
}, En = (e, t, n, r, u, c) => {
  const p = e < n - u || t < r - u, l = e > n + u || t > r + u;
  return c === "smaller" && p || c === "larger" && l || c === "both" && (p || l);
}, Mr = ({
  gl: e,
  size: t,
  boundFor: n,
  threshold: r
}) => {
  const u = L(t);
  return b(() => {
    const { width: p, height: l } = t, { width: i, height: m } = u.current, g = En(
      p,
      l,
      i,
      m,
      r,
      n
    ), x = Yn.getMaxDpr(e, t);
    return g && (u.current = t), {
      maxDpr: x,
      isUpdate: g
    };
  }, [t, e, n, r]);
}, he = Object.freeze({
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
    return 1 - he.easeOutBounce(1 - e);
  },
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce(e) {
    return e < 0.5 ? (1 - he.easeOutBounce(1 - 2 * e)) / 2 : (1 + he.easeOutBounce(2 * e - 1)) / 2;
  }
});
function Ln(e) {
  let t = Math.sin(e * 12.9898) * 43758.5453;
  return t - Math.floor(t);
}
const Sr = (e, t = "easeOutQuart") => {
  const n = e / 60, r = he[t];
  return w(
    (c) => {
      let p = c.getElapsedTime() * n;
      const l = Math.floor(p), i = r(p - l);
      p = i + l;
      const m = Ln(l);
      return {
        beat: p,
        floor: l,
        fract: i,
        hash: m
      };
    },
    [n, r]
  );
}, Cr = (e = 60) => {
  const t = b(() => 1 / Math.max(Math.min(e, 60), 1), [e]), n = L(null);
  return w(
    (u) => {
      const c = u.getElapsedTime();
      return n.current === null || c - n.current >= t ? (n.current = c, !0) : !1;
    },
    [t]
  );
}, $n = (e) => {
  var r, u;
  const t = (r = e.dom) == null ? void 0 : r.length, n = (u = e.texture) == null ? void 0 : u.length;
  return !t || !n || t !== n;
};
var qn = `varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`, jn = `precision highp float;

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
const Wn = ({
  params: e,
  scene: t,
  onBeforeInit: n
}) => {
  t.children.length > 0 && (t.children.forEach((r) => {
    r instanceof a.Mesh && (r.geometry.dispose(), r.material.dispose());
  }), t.remove(...t.children)), e.texture.forEach((r, u) => {
    const c = new a.ShaderMaterial({
      ...A(
        {
          uniforms: {
            u_texture: { value: r },
            u_textureResolution: {
              value: new a.Vector2(0, 0)
            },
            u_resolution: { value: new a.Vector2(0, 0) },
            u_borderRadius: {
              value: e.boderRadius[u] ? e.boderRadius[u] : 0
            }
          },
          vertexShader: qn,
          fragmentShader: jn
        },
        n
      ),
      ...I,
      // Must be transparent.
      transparent: !0
    }), p = new a.Mesh(new a.PlaneGeometry(1, 1), c);
    t.add(p);
  });
}, Nn = () => {
  const e = L([]), t = L([]);
  return w(
    ({
      isIntersectingRef: r,
      isIntersectingOnceRef: u,
      params: c
    }) => {
      e.current.length > 0 && e.current.forEach((l, i) => {
        l.unobserve(t.current[i]);
      }), t.current = [], e.current = [];
      const p = new Array(c.dom.length).fill(!1);
      r.current = [...p], u.current = [...p], c.dom.forEach((l, i) => {
        const m = (x) => {
          x.forEach((v) => {
            c.onIntersect[i] && c.onIntersect[i](v), r.current[i] = v.isIntersecting;
          });
        }, g = new IntersectionObserver(m, {
          rootMargin: "0px",
          threshold: 0
        });
        g.observe(l), e.current.push(g), t.current.push(l);
      });
    },
    []
  );
}, kn = () => {
  const e = L([]), t = w(
    ({
      params: n,
      customParams: r,
      size: u,
      resolutionRef: c,
      scene: p,
      isIntersectingRef: l
    }) => {
      p.children.length !== e.current.length && (e.current = new Array(p.children.length)), p.children.forEach((i, m) => {
        var v, s, d, o, h, y;
        const g = n.dom[m];
        if (!g)
          return;
        const x = g.getBoundingClientRect();
        if (e.current[m] = x, i.scale.set(x.width, x.height, 1), i.position.set(
          x.left + x.width * 0.5 - u.width * 0.5,
          -x.top - x.height * 0.5 + u.height * 0.5,
          0
        ), l.current[m] && (n.rotation[m] && i.rotation.copy(n.rotation[m]), i instanceof a.Mesh)) {
          const T = i.material, f = R(T), M = F(T);
          f("u_texture", n.texture[m]), f("u_textureResolution", [
            ((d = (s = (v = n.texture[m]) == null ? void 0 : v.source) == null ? void 0 : s.data) == null ? void 0 : d.width) || 0,
            ((y = (h = (o = n.texture[m]) == null ? void 0 : o.source) == null ? void 0 : h.data) == null ? void 0 : y.height) || 0
          ]), f(
            "u_resolution",
            c.current.set(x.width, x.height)
          ), f(
            "u_borderRadius",
            n.boderRadius[m] ? n.boderRadius[m] : 0
          ), M(r);
        }
      });
    },
    []
  );
  return [e.current, t];
}, Gn = () => {
  const e = L([]), t = L([]), n = w((r, u = !1) => {
    e.current.forEach((p, l) => {
      p && (t.current[l] = !0);
    });
    const c = u ? [...t.current] : [...e.current];
    return r < 0 ? c : c[r];
  }, []);
  return {
    isIntersectingRef: e,
    isIntersectingOnceRef: t,
    isIntersecting: n
  };
}, Kn = (e) => ({ onView: n, onHidden: r }) => {
  const u = L(!1);
  ie(() => {
    let c;
    const p = () => {
      e.current.some((l) => l) ? u.current || (n && n(), u.current = !0) : u.current && (r && r(), u.current = !1), c = requestAnimationFrame(p);
    };
    return c = requestAnimationFrame(p), () => {
      cancelAnimationFrame(c);
    };
  }, [n, r]);
}, Xn = {
  texture: [],
  dom: [],
  boderRadius: [],
  rotation: [],
  onIntersect: []
}, _r = ({
  size: e,
  dpr: t,
  samples: n,
  isSizeUpdate: r,
  renderTargetOptions: u,
  onBeforeInit: c
}, p = []) => {
  const l = B(t), i = b(() => new a.Scene(), []), m = q(e), [g, x] = W({
    scene: i,
    camera: m,
    size: e,
    dpr: l.fbo,
    samples: n,
    isSizeUpdate: r,
    ...u
  }), [v, s] = j({
    ...Xn,
    updateKey: performance.now()
  }), [d, o] = kn(), h = L(new a.Vector2(0, 0)), [y, T] = Ee(!0);
  b(
    () => T(!0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    p
  );
  const f = L(null), M = b(() => _, []), S = Nn(), { isIntersectingOnceRef: C, isIntersectingRef: D, isIntersecting: z } = Gn(), U = Kn(D), V = b(() => (P, G) => {
    s(P), o({
      params: v,
      customParams: G,
      size: e,
      resolutionRef: h,
      scene: i,
      isIntersectingRef: D
    });
  }, [D, s, o, e, i, v]);
  return [
    w(
      (P, G, X) => {
        const { gl: ee, size: te } = P;
        if (V(G, X), $n(v))
          return M;
        if (y) {
          if (f.current === v.updateKey)
            return M;
          f.current = v.updateKey;
        }
        return y && (Wn({
          params: v,
          size: te,
          scene: i,
          onBeforeInit: c
        }), S({
          isIntersectingRef: D,
          isIntersectingOnceRef: C,
          params: v
        }), T(!1)), x(ee);
      },
      [
        x,
        S,
        c,
        V,
        y,
        i,
        v,
        C,
        D,
        M
      ]
    ),
    V,
    {
      scene: i,
      camera: m,
      renderTarget: g,
      output: g.texture,
      isIntersecting: z,
      DOMRects: d,
      intersections: D.current,
      useDomView: U
    }
  ];
}, wr = (e, t) => {
  const {
    scene: n,
    camera: r,
    size: u,
    dpr: c = !1,
    isSizeUpdate: p = !1,
    depth: l = !1,
    ...i
  } = e, m = L([]), g = Y(u, c);
  m.current = b(() => Array.from({ length: t }, () => {
    const v = new a.WebGLRenderTarget(
      g.x,
      g.y,
      {
        ...xe,
        ...i
      }
    );
    return l && (v.depthTexture = new a.DepthTexture(
      g.x,
      g.y,
      a.FloatType
    )), v;
  }), [t]), p && m.current.forEach(
    (v) => v.setSize(g.x, g.y)
  ), ie(() => {
    const v = m.current;
    return () => {
      v.forEach((s) => s.dispose());
    };
  }, [t]);
  const x = w(
    (v, s, d) => {
      const o = m.current[s];
      return _e({
        gl: v,
        scene: n,
        camera: r,
        fbo: o,
        onBeforeRender: () => d && d({ read: o.texture })
      }), o.texture;
    },
    [n, r]
  );
  return [m.current, x];
}, Yn = Object.freeze({
  interpolate(e, t, n, r = 1e-6) {
    const u = e + (t - e) * n;
    return Math.abs(u) < r ? 0 : u;
  },
  getMaxDpr(e, t) {
    return Math.floor(
      e.capabilities.maxTextureSize / Math.max(t.width, t.height)
    );
  }
});
export {
  tn as ALPHABLENDING_PARAMS,
  wn as BLANK_PARAMS,
  me as BLENDING_PARAMS,
  fe as BRIGHTNESSPICKER_PARAMS,
  re as BRUSH_PARAMS,
  Z as CHROMAKEY_PARAMS,
  Q as COLORSTRATA_PARAMS,
  ve as COSPALETTE_PARAMS,
  ln as COVERTEXTURE_PARAMS,
  Ae as DELTA_TIME,
  Xn as DOMSYNCER_PARAMS,
  Me as DUOTONE_PARAMS,
  he as Easing,
  xe as FBO_DEFAULT_OPTION,
  bt as FLUID_PARAMS,
  Fe as FXBLENDING_PARAMS,
  ae as FXTEXTURE_PARAMS,
  Se as HSV_PARAMS,
  se as MARBLE_PARAMS,
  E as MORPHPARTICLES_PARAMS,
  ge as MOTIONBLUR_PARAMS,
  oe as NOISE_PARAMS,
  _t as RIPPLE_PARAMS,
  Ie as SIMPLEBLUR_PARAMS,
  He as ShaderChunk,
  Yn as Utils,
  pe as WAVE_PARAMS,
  N as WOBBLE3D_PARAMS,
  _e as renderFBO,
  F as setCustomUniform,
  R as setUniform,
  br as useAddMesh,
  cr as useAlphaBlending,
  Sr as useBeat,
  hr as useBlank,
  ir as useBlending,
  sr as useBrightnessPicker,
  Zn as useBrush,
  q as useCamera,
  gr as useChromaKey,
  nr as useColorStrata,
  wr as useCopyTexture,
  or as useCosPalette,
  mr as useCoverTexture,
  An as useCreateMorphParticles,
  Bn as useCreateWobble3D,
  _r as useDomSyncer,
  le as useDoubleFBO,
  ar as useDuoTone,
  Cr as useFPSLimiter,
  Jn as useFluid,
  lr as useFxBlending,
  ur as useFxTexture,
  vr as useHSV,
  rr as useMarble,
  xr as useMorphParticles,
  dr as useMotionBlur,
  tr as useNoise,
  j as useParams,
  Ce as usePointer,
  Mr as useResizeBoundary,
  Y as useResolution,
  er as useRipple,
  pr as useSimpleBlur,
  W as useSingleFBO,
  fr as useWave,
  yr as useWobble3D
};
//# sourceMappingURL=use-shader-fx.js.map
