precision highp float;
varying vec2 vUv;
uniform sampler2D u_fx;
uniform sampler2D u_noise;
uniform sampler2D u_bbbb;
uniform float u_hash;
uniform float u_noiseIntensity;
uniform float u_fract;

vec3 color0 = vec3(0.2,0.2,0.2);
vec3 color1 = vec3(1.,1.,0.);
vec3 color2 = vec3(1.,1.,0.);
vec3 color3 = vec3(1.,1.,0.);

void main() {
	vec2 uv = vUv;
	
	vec4 fx = texture2D(u_fx, uv);

	uv += fx.rg * (1.-u_fract) ;
	vec4 bbbb = texture2D(u_bbbb, uv);

	vec3 finalCol = mix(mix(color0, color1, fx.r), mix(color2, color3, fx.g), fx.b);

	vec4 mixColor = mix(vec4(finalCol, 1.0),bbbb, u_hash > 0.7 ? bbbb.a : 0.);

	mixColor.rgb*=smoothstep(.7,.3,length(uv-.5));

	gl_FragColor = mixColor;
	// gl_FragColor = vec4(finalCol, 1.0);
}