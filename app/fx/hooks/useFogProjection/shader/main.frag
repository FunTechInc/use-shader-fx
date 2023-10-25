precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;

uniform vec2 xDir;
uniform vec2 yDir;
uniform float xTimeStrength;
uniform float yTimeStrength;
uniform float xStrength;
uniform float yStrength;

const int   noiseOct  = 8; //noiseの振幅回数
const int   fbmOct = 3; //fbmの振幅回数
const float per  = 0.5;
const float PI   = 3.1415926;

float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

float irnd(vec2 p){
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec4 v = vec4(rnd(vec2(i.x,       i.y      )),
					rnd(vec2(i.x + 1.0, i.y      )),
					rnd(vec2(i.x,       i.y + 1.0)),
					rnd(vec2(i.x + 1.0, i.y + 1.0)));
	return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
}

float noise(vec2 p, float time){
	float t = 0.0;
	for(int i = 0; i < noiseOct; i++){
		float freq = pow(2.0, float(i));
		float amp  = pow(per, float(noiseOct - i));
		t += irnd(vec2(p.y / freq + time, p.x / freq + time)) * amp; // 時間のオフセットを追加
	}
	return t;
}

float fbm(vec2 x, float time) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	float sign = 1.0; // 初期符号をセット
	for (int i = 0; i < fbmOct; ++i) {
		v += a * noise(x, time * sign);  // signを乗算してtimeの符号を変更
		x = rot * x * 2.0 + shift;
		a *= 0.5;
		sign *= -1.0;  // 符号を反転
	}
	return v;
}

void main() {
	vec2 uv = vUv;
	
	//ノイズ生成
	float noiseMap = fbm(gl_FragCoord.xy ,uTime * -.7); // フォグの時間係数
	
	float noiseTextureMap = noiseMap*2.0-1.0;
	uv += noiseTextureMap * 0.02; // 歪ませる強さ
	vec3 textureMap = texture2D(uTexture, uv).rgb;

	// フォグとの境界を算出
	float edge0 = 0.0;
	float edge1 = 0.7;
	float blendValue = smoothstep(edge0, edge1, noiseMap);

	// フォグのカラーを指定
	vec3 specifiedNoiseColor = vec3(1.0, 1.0, 1.0);

	// 最終出力
	vec3 outputColor = blendValue * specifiedNoiseColor + (1.0 - blendValue) * textureMap;
	gl_FragColor = vec4(outputColor, 1.0);

	// gl_FragColor = vec4(noiseMap,noiseMap,noiseMap, 1.0);
}


