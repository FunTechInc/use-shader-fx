precision highp float;

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
	float rand = u_pattern;
	float complexity = u_complexity; 
	float complexityAttenuation = u_complexityAttenuation;
	float noiseIterations = u_iterations;

	for(float i;i<u_iterations;i++){
		p+=sin(p.yzx + rand);
		n=complexity*n+vec4(cross(cos(p + rand),sin(p.zxy + rand)),1.)*(1.+i*complexityAttenuation);
		p*=complexity;
	}
	return n.xyz/n.w;
}

void main() {
	float time = u_time * u_timeStrength;
	vec3 color = clamp(marble(vec3(gl_FragCoord.xy*u_scale,time)),0.,1.);
	gl_FragColor = vec4(color,1.);
}

