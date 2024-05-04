precision highp float;

varying vec2 vUv;
#usf varyings

#usf uniforms

void main() {
	vec4 usf_Position = vec4(position,1.);
	vUv = uv;

	#usf main
	
	gl_Position = usf_Position;
}