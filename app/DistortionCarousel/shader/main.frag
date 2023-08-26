precision mediump float;

// 背景の比率
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
varying vec2 vUv;

//テクスチャー情報
uniform sampler2D u_bgTexture0;
uniform sampler2D u_bgTexture1;

//ノイズ
uniform sampler2D u_noiseTexture;
// ディストーションの強さを調整するためのパラメータ
uniform float u_noiseStrength;
// 時間
uniform float u_time; 
// 遷移フェーズを操作する
uniform float u_trans;
//
float quarticInOut(float t) {
	return t < 0.5
		? +8.0 * pow(t, 4.0)
		: -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

void main(){
	
	//テクスチャーのアスペクト比と画面幅を計算して、アスペクト比を維持したまま画面ぴったりに表示する
	vec2 bgRatio = vec2(
		min((u_resolution.x / u_resolution.y) / (u_imageResolution.x / u_imageResolution.y), 1.0),
		min((u_resolution.y / u_resolution.x) / (u_imageResolution.y / u_imageResolution.x), 1.0)
	);
	vec2 uv = vec2(
		vUv.x * bgRatio.x + (1.0 - bgRatio.x) * 0.5,
		vUv.y * bgRatio.y + (1.0 - bgRatio.y) * 0.5
	);

	// 2Dノイズ値を取得して、-1.0 から 1.0 の範囲にリマップ
	vec2 noiseValue = texture2D(u_noiseTexture, uv).rg;
	noiseValue = noiseValue * 2.0 - 1.0;

	// uvをnoiseさせる
	uv += noiseValue * u_noiseStrength;
		
	// 2枚のtextureをu_transの値で混ざるように切り替える
	float trans = quarticInOut(u_trans);
		
	vec4 color0 = texture2D(u_bgTexture0, vec2(0.5 - 0.3 * trans, 0.5) + (uv - vec2(0.5)) * (1.0 - 0.2 * trans));

	vec4 color1 = texture2D(u_bgTexture1, vec2(0.5 + sin( (1. - trans) * 0.1), 0.5 ) + (uv - vec2(0.5)) * (0.9 + 0.1 * trans));

	gl_FragColor = mix(color0, color1 , trans);
}