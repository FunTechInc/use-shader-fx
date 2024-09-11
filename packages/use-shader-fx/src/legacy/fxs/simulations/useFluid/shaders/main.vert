varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
varying vec2 vL2;
varying vec2 vR2;
varying vec2 vT2;
varying vec2 vB2;
uniform vec2 texelSize;

void main () {
	vUv = uv;
	vL = vUv - vec2(texelSize.x, 0.0);
	vR = vUv + vec2(texelSize.x, 0.0);
	vT = vUv + vec2(0.0, texelSize.y);
	vB = vUv - vec2(0.0, texelSize.y);
	vL2 = vUv - vec2(texelSize.x * 2., 0.0);
	vR2 = vUv + vec2(texelSize.x * 2., 0.0);
	vT2 = vUv + vec2(0.0, texelSize.y * 2.);
	vB2 = vUv - vec2(0.0, texelSize.y * 2.);
	
	gl_Position = vec4(position, 1.0);
}