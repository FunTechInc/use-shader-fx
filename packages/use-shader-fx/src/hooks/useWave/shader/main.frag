precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uStrength;
uniform float uWidth;
uniform vec2 uEpicenter;
uniform int uMode;

float PI = 3.141592653589;

void main() {
	float progress = min(uProgress, 1.0);
	float progressFactor = sin(progress * PI);

	float border = progress - progress * progressFactor * uWidth;
	float blur = uStrength * progressFactor;
	
	// 0 ~ 1
	vec2 normalizeCenter = (uEpicenter + 1.0) / 2.0;

	// 0:center 1:horizontal 2:vertical
	float dist = uMode == 0 ? length(vUv - normalizeCenter) : uMode == 1 ? length(vUv.x - normalizeCenter.x) : length(vUv.y - normalizeCenter.y);

	// Calculate the maximum distance to the four corners of the screen
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

	// Scale distance so that waves extend to the edge of the screen
	dist = maxDistance > 0.0 ? dist / maxDistance : dist;

	vec3 color = vec3(smoothstep(border - blur, border, dist) -
                  smoothstep(progress, progress + blur, dist));
	
	// Ensure color is 0 when progress is 0,1
	color *= progressFactor;

	gl_FragColor = vec4(color, 1.0);
}

