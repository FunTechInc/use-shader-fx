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
uniform float u_progress;
uniform float u_progress2;

//hogehoge
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
		
	// ノイズテクスチャの座標に時間関数による変化を加える
	vec2 timeNoiseOffset=vec2(sin(u_time),cos(u_time));
	vec2 uvWithTimeNoise=uv+timeNoiseOffset * 0.1;

	// ノイズテクスチャ座標にランダムなオフセットを加える
	vec2 randomOffset=(texture2D(u_noiseTexture,uv*.1).rg*2.-1.)*0.003;
	uvWithTimeNoise+=randomOffset;

	// 2Dノイズ値を取得して、-1.0 から 1.0 の範囲にリマップ
	vec2 noiseValue=texture2D(u_noiseTexture,uvWithTimeNoise).rg;
	noiseValue=noiseValue*2.-1.;

	//-------------元のコード------------------------
	// 2Dノイズ値を取得して、-1.0 から 1.0 の範囲にリマップ
	// vec2 noiseValue=texture2D(u_noiseTexture,uv).rg;
	// noiseValue=noiseValue*2.-1.;
	//---------------------------------------------

	// uvをnoiseさせる
	uv += noiseValue * u_noiseStrength * 0.01;
		
	// 2枚のtextureをu_transの値で混ざるように切り替える
	// float transX = quarticInOut(u_progress);
	// float transY = quarticInOut(u_progress2);
		
	// vec4 color0 = texture2D(u_bgTexture0, vec2(0.5 - 0.3 * transX, 0.5) + (uv - vec2(0.5)) * (1.0 - 0.2 * transX));

	// vec4 color1 = texture2D(u_bgTexture1, vec2(0.5 + sin( (1. - transX) * 0.1), 0.5 ) + (uv - vec2(0.5)) * (0.9 + 0.1 * transX));

	// vec4 color2 = texture2D(u_bgTexture0, vec2(0.5, 0.5 - 0.3 * transY) + (uv - vec2(0.5)) * (1.0 - 0.2 * transY));

	// vec4 color3 = texture2D(u_bgTexture1, vec2(0.5, 0.5 + sin((1.0 - transY) * 0.1)) + (uv - vec2(0.5)) * (0.9 + 0.1 * transY));

	// gl_FragColor = mix(color0, color1 , transX);
	// gl_FragColor = mix(color2, color3, transY);

	float transX=quarticInOut(u_progress);
	float transY=quarticInOut(u_progress2);

	vec2 uvOffsetX=(uv-vec2(.5))*(1.-.2*transX);
	vec2 uvOffsetY=(uv-vec2(.5))*(1.-.2*transY);

	vec4 color0=texture2D(u_bgTexture0,vec2(.5-.3*transX,.5)+uvOffsetX);
	vec4 color1=texture2D(u_bgTexture1,vec2(.5+sin((1.-transX)*.1),.5)+uvOffsetX);

	vec4 color2=texture2D(u_bgTexture0,vec2(.5,.5-.3*transY)+uvOffsetY);
	vec4 color3=texture2D(u_bgTexture1,vec2(.5,.5+sin((1.-transY)*.1))+uvOffsetY);

	vec4 finalColorX=mix(color0,color1,transX);
	vec4 finalColorY=mix(color2,color3,transY);

	gl_FragColor=mix(finalColorX,finalColorY,0.5);
}