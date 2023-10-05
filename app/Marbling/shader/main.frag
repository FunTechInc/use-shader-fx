precision mediump float;
varying vec2 vUv;
//FBO
uniform sampler2D u_bufferTexture;
// 背景の比率
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
//テクスチャー情報
uniform sampler2D u_bgTexture0;
uniform sampler2D u_bgTexture1;
//ノイズ
uniform sampler2D u_noiseTexture;
// ディストーションの強さを調整するためのパラメータ
uniform float u_noiseStrength;
// noiseの速さを調整するためのパラメータ
uniform float u_noiseTime;
// uv自体の歪みの強さを調整するためのパラメータ
uniform float u_waveStrength;
// 時間
uniform float u_time;
// 遷移フェーズを操作する
uniform float u_progress;
uniform float u_progress2;
// color
uniform vec3 u_color1;
uniform vec3 u_color2;

float PI = 3.141592653589;

// 画面遷移
float quarticInOut(float t){
	return t<.5
	?+8.*pow(t,4.)
	:-8.*pow(t-1.,4.)+1.;
}

void main() {
	vec2 bgRatio=vec2(
		min((u_resolution.x/u_resolution.y)/(u_imageResolution.x/u_imageResolution.y),1.),
		min((u_resolution.y/u_resolution.x)/(u_imageResolution.y/u_imageResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);

	// -------------FBOの値をテクスチャーに適用する----------------
	vec3 flow = texture2D(u_bufferTexture, vUv).rgb * 1.0;
	float theta = flow.r * 10.0 * PI;
	vec2 dir = vec2(sin(theta), cos(theta));
	uv += dir * flow.r * 1.0;
	// ---------------------------------------------

	// 単純にuvゆらゆら
	uv+=cos(u_time+uv*10.)*u_waveStrength;

	// -------------noise----------------
	// ノイズテクスチャの座標に時間関数による変化を加える
	vec2 timeNoiseOffset=vec2(sin(u_time),cos(u_time));
	vec2 uvWithTimeNoise=uv+timeNoiseOffset*u_noiseTime;
	// ノイズテクスチャ座標にランダムなオフセットを加える
	vec2 randomOffset=(texture2D(u_noiseTexture,uv*.1).rg*2.-1.)*.003;
	uvWithTimeNoise+=randomOffset;
	// 2Dノイズ値を取得して、-1.0 から 1.0 の範囲にリマップ
	vec2 noiseValue=texture2D(u_noiseTexture,uvWithTimeNoise).rg;
	noiseValue=noiseValue*2.-1.;
	// uvをnoiseさせる
	uv+=noiseValue*u_noiseStrength*.01;
	// //---------------------------------------------

	// // -----------------画面遷移--------------------
	// float transX=quarticInOut(u_progress);
	// float transY=quarticInOut(u_progress2);
	// vec2 uvOffsetX=(uv-vec2(.5))*(1.-.2*transX);
	// vec2 uvOffsetY=(uv-vec2(.5))*(1.-.2*transY);
	// vec4 color0=texture2D(u_bgTexture0,vec2(.5-.3*transX,.5)+uvOffsetX);
	// // ---------------------------------------------

	//一旦テクスチャーを
	vec3 tex = texture2D(u_bgTexture0, uv).rgb;

	// -----------------Duotone-------------------
	vec3 col = tex;
	col=vec3((col.r+col.g+col.b)/3.);
	vec3 kv=vec3(u_color1);
	vec3 lv=vec3(u_color2);
	col=smoothstep(.45,.55,col);
	col=smoothstep(.8,.9,col);
	col=mix(kv,lv,col*.5);
	// -------------------------------------------

	// vec3 colmix = mix(col,resultColor,0.01);
	// vec3 colmix = mix(tex,resultColor,0.01);

	// gl_FragColor = vec4(tex,1.0);
	gl_FragColor = vec4(flow,1.0);
}