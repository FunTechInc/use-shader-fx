precision highp float;
precision highp int;

varying vec3 vPosition;
uniform float uTime;

const float per  = 0.5;
const float PI   = 3.14159265359;

void main() {    
    gl_FragColor = vec4(1.0);
}


// precision highp float;

// varying vec4 vColor;
// varying vec2 vUv;

// void main() {

// 	vec2 uv = gl_PointCoord;

// 	// 円形にする
// 	float distanceToCenter = length(uv - vec2(0.5));
// 	if(distanceToCenter > 0.5)
// 		discard;

//    gl_FragColor = vColor;
// }

