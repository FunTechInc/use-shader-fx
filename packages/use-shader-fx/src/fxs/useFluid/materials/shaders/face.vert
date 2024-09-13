precision highp float;

uniform vec2 texelsize;
varying vec2 vUv;

void main(){
	vec3 pos = position;
	vec2 scale = 1.0 - texelsize * 2.0;
	pos.xy = pos.xy * scale;
	vUv = vec2(0.5)+(pos.xy)*0.5;
	gl_Position = vec4(pos, 1.0);


	// vUv = uv;
	// gl_Position = vec4(position, 1.0);

}
