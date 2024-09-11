precision highp float;

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
	// vec3 splat = color * -dot(p, p) / radius;
	vec3 base = texture2D(uTarget, vUv).xyz;
	gl_FragColor = vec4(base + splat, 1.0);

	//  vec2 circle = (vUv - 0.5) * 2.0;
   //  float d = 1.0-min(length(circle), 1.0);
   //  d *= d;
   //  gl_FragColor = vec4(color.xy * d, 0., 1.);
}