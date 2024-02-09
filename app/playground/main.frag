precision highp float;
varying vec2 vUv;

uniform vec2 u_resolution;
uniform vec2 u_textureResolution;
uniform vec3 u_keyColor;

uniform sampler2D u_texture;

// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
// 色の輝度（Y成分）に影響されずに、色の差異（彩度と色相）だけを使って背景を判定する
vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}

void main() {
	// テクスチャー座標をアスペクト比に合わせる
	float screenAspect = u_resolution.x / u_resolution.y;
	float textureAspect = u_textureResolution.x / u_textureResolution.y;
	vec2 aspectRatio = vec2(
		min(screenAspect / textureAspect, 1.0),
		min(textureAspect / screenAspect, 1.0)
	);
	vec2 uv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;

	// texture の色を取得
	vec4 texColor = texture2D(u_texture, uv);

	// マルチサンプリングと平均化処理
	float offset = 1.0 / u_textureResolution.y;
	vec4 sampleUp = texture2D(u_texture, uv + vec2(0.0, offset));
	vec4 sampleDown = texture2D(u_texture, uv + vec2(0.0, -offset));
	vec4 sampleLeft = texture2D(u_texture, uv + vec2(-offset, 0.0));
	vec4 sampleRight = texture2D(u_texture, uv + vec2(offset, 0.0));
	vec4 avgColor = (texColor + sampleUp + sampleDown + sampleLeft + sampleRight) / 5.0;
	
	// key colorとの距離
	float chromaDist = distance(RGBtoUV(texColor.rgb), RGBtoUV(u_keyColor));

	// 閾値
	float similarity = 0.2;
	float baseMask = chromaDist - similarity;
	
	// 透明度の境界の滑らかさ
	float smoothness = 0.1;
	float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
	texColor.a = fullMask;

	// スピル抑制：クロマキーの反射部分の処理 値が大きいほど反射を削除する
	float spill = 1.1;
	float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
	float desat = clamp(texColor.r * 0.2126 + texColor.g * 0.7152 + texColor.b * 0.0722, 0., 1.);
	texColor.rgb = mix(vec3(desat, desat, desat), texColor.rgb, spillVal);


	// ブレンディングによるアンチエイリアス処理の強化
	texColor = mix(texColor, avgColor, fullMask);

	gl_FragColor = texColor;
}



// ノイズリダクション
// マルチサンプリングとブレンディングをして、境界のアンチエイリアス処理をしたい