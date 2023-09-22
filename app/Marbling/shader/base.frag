precision mediump float;

uniform sampler2D u_bufferTexture;

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
// noiseの速さを調整するためのパラメータ
uniform float u_noiseTime;
// uv自体の歪みの強さを調整するためのパラメータ
uniform float u_waveStrength;
// 時間
uniform float u_time;
//pointer
uniform vec2 u_pointer;
// 遷移フェーズを操作する
uniform float u_progress;
uniform float u_progress2;
// color
uniform vec3 u_color1;
uniform vec3 u_color2;
// flowmap
uniform float u_flowmapStrength;
uniform float u_flowmapSpeed;
uniform float u_flowmapRadius;

// glass effect
uniform float u_glassStrength;
uniform float u_glassTime;

vec2 grey2normal(vec2 uv){
	float ep=.001;
	float s0=texture2D(u_bgTexture0,uv).r;
	float sx=texture2D(u_bgTexture0,uv+vec2(ep,0.)).r;
	float sy=texture2D(u_bgTexture0,uv+vec2(0.,ep)).r;
	return vec2(sx-s0,sy-s0);
}
// 画面遷移
float quarticInOut(float t){
	return t<.5
	?+8.*pow(t,4.)
	:-8.*pow(t-1.,4.)+1.;
}

//flowmap
float saturate(float x){
	return clamp(x,0.,1.);
}
vec2 flowmap(in vec2 uv){
	vec2 dir=uv-vec2(.5,.5);
	vec2 flow=normalize(vec2(dir.y,-dir.x));
	flow*=saturate(1.-4.*abs(.25-length(dir)))*1.;
	flow=mix(vec2(0.,.5),flow,saturate(length(flow)*2.));
	return flow;
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

	vec3 flow = texture2D(u_bufferTexture, vUv).rgb;

	uv += flow.xy * 0.05;

	// 単純にuvゆらゆら
	uv+=cos(u_time+uv*10.)*u_waveStrength;

	// -------------pngNoise 扱い方----------------
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
	//---------------------------------------------

	// ---------------flowmap---------------------
	float maxPullRadius=u_flowmapRadius;
	vec2 distanceToMouse=abs(uv-u_pointer);
	vec3 stamp=vec3(1.*vec2(1,-1),1.-pow(1.-min(1.,length(1.)),3.));
	float falloff=smoothstep(.15,0.,length(distanceToMouse));
	vec4 colorm=texture2D(u_bgTexture0,vUv);
	colorm.rgb=mix(colorm.rgb,stamp,vec3(falloff));
	float normalizedDistance=length(distanceToMouse)/maxPullRadius;
	float pullStrength=smoothstep(1.,0.,normalizedDistance);
	vec2 fl=-flowmap(uv)*pullStrength;
	float phase0=fract(u_time*u_flowmapSpeed+.5);
	float phase1=fract(u_time*u_flowmapSpeed+1.);
	vec2 f0=fl*phase0*u_flowmapStrength;
	vec2 f1=fl*phase1*u_flowmapStrength;
	vec3 s0=texture2D(u_bgTexture0,uv+f0).xyz;
	vec3 s1=texture2D(u_bgTexture0,uv+f1).xyz;
	float lerp=saturate(abs((.5-phase0)/.5));
	vec3 flowCol=mix(s0,s1,lerp);
	vec3 resultColor=flowCol;
	gl_FragColor.rgb = resultColor;
	// -------------------------------------------

	// --------------glass effect-----------------
	// ------select------
	// vec2 glassDis=grey2normal(uv)*u_glassStrength;
	vec2 glassDis=(texture2D(u_bgTexture0,-uv).rg-.5*2.)*u_glassStrength;
	// vec2 glassDis = (uv - .5) * u_glassStrength;
	// ------------------
	float scaletime=(u_time+texture2D(u_noiseTexture,uv).r)*u_glassTime;
	float flow_t0=fract(scaletime);
	float flow_t1=fract(scaletime+.5);
	float alternate=abs((flow_t0-.5)*2.);
	vec4 samp0=texture2D(u_bgTexture0,uv+glassDis*flow_t0);
	vec4 samp1=texture2D(u_bgTexture0,uv+glassDis*flow_t1);
	vec4 dismix=mix(samp0,samp1,alternate);
	uv*=dismix.xy;
	// -------------------------------------------

	// -----------------画面遷移--------------------
	float transX=quarticInOut(u_progress);
	float transY=quarticInOut(u_progress2);
	vec2 uvOffsetX=(uv-vec2(.5))*(1.-.2*transX);
	vec2 uvOffsetY=(uv-vec2(.5))*(1.-.2*transY);
	vec4 color0=texture2D(u_bgTexture0,vec2(.5-.3*transX,.5)+uvOffsetX);
	// ---------------------------------------------

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

	vec3 colmix = mix(col,resultColor,0.01);

	gl_FragColor.rgb = colmix;
    // gl_FragColor.rgb = flow;
	gl_FragColor.a = 1.0;
}