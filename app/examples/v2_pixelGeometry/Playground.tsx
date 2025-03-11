"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   NoiseValues,
   useSingleFBO,
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useFluid,
} from "@/packages/use-shader-fx/src";
import {
   Float,
   OrbitControls,
   useTexture,
   useVideoTexture,
} from "@react-three/drei";

/*===============================================
idea of useCRT? / usePixelGeometry?
### pixel geometryについて

- サブピクセル…pixelよりもより細かい単位でRGBの単色の各点のこと
- LCD…液晶ディスプレイ
- CRT…ブラウン管

パターン

- delta 型
	- 主にCRTディスプレイで採用されている三角形の配置パターン
- stripe 型
	- 主にLCDディスプレイで採用される

その他、ペンタイル型とかあるけど、高解像度を実現するための手法なので、glslでの演出で旧来のディスプレイ表現を再現する目的では不要かな。

deltaとstripeだけでいいかな。


- ✅色収差

- ✅ノイズ
- ✅スキャンライン

- ✅グロー効果（発光っぽさ）
- ✅delta配置にする
- ✅サブピクセルを強調する

- ✅歪み（ジッター）

- ✅円形にする
- ✅ストライプ型も円形にする
===============================================*/
/*===============================================
- torusをCRTにしたやつ
- fluidをCRTにしたやつ
- fluidをgridにしてcrtにしたやつ
- torusを古文にしたやつ
- torusを古文にしたやつを、CRTにしたやつ
===============================================*/

const FxMaterialImpl = createFxMaterialImpl({
   uniforms: {
      time: { value: 0 },
   },
   fragmentShader: `
	uniform sampler2D src;
	uniform float time;

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
	}

	// uvとtimeに依存するジッターノイズ（-1～1）
	vec2 jitterNoise(vec2 uv, float t) {
		float jitterStrength = 0.001; // ジッター量
		float n1 = hash(uv + t);
		float n2 = hash(uv + t + 31.4159);
		return (vec2(n1, n2)*2.-1.) * jitterStrength;
	}

	// RGBストライプ型マスク（従来の実装）
	vec3 rgbMaskStripe(vec2 uv) {
		float subPixelSize = 1.; // サブピクセルのサイズ
		vec2 pixelPos = floor(uv * resolution / subPixelSize);

		// uv.x に基づいたシンプルなRGBストライプ
		float r = smoothstep(0.0, 1.0, mod(pixelPos.x, 3.0) / 3.0);
		float g = smoothstep(0.0, 1.0, mod(pixelPos.x + 1.0, 3.0) / 3.0);
		float b = smoothstep(0.0, 1.0, mod(pixelPos.x + 2.0, 3.0) / 3.0);

		// サブピクセル内での局所座標を計算（各サブピクセル内の位置）
		vec2 subPixelCoord = mod(uv * resolution, subPixelSize);
		vec2 center = vec2(subPixelSize * 0.5);
		float d = length(subPixelCoord - center);

		// 角丸（円形）マスク：中心から外側に向かって滑らかにフェードアウト
		float radius = .5;         // サブピクセルサイズに対する内側の半径（0～1の値）
		float fadeWidthFactor = 0.3;  // フェードアウトする幅（サブピクセルサイズに対する割合）
		float r0 = subPixelSize * radius;
		float r1 = subPixelSize * (radius + fadeWidthFactor);
		float circleMask = 1.0 - smoothstep(r0, r1, d);

		return vec3(r, g, b) * circleMask;
	}

	// Delta CRTディスプレイ
	vec3 rgbMaskDelta(vec2 uv) {
		float subPixelSize = 2.; // サブピクセルのサイズ（ピクセル単位）
		
		// サブピクセル単位の座標（各サブピクセルごとのインデックス）
		vec2 pixelPos = floor(uv * resolution / subPixelSize);
		
		// x, y方向のパターンを決定（3ピクセル周期、2行ごとのパターン変更）
		float x = mod(pixelPos.x, 3.0);
		float y = mod(pixelPos.y, 2.0);
		
		// サブピクセルごとのRGBチャンネル割り当て
		float r = 0.0, g = 0.0, b = 0.0;
		if (y == 0.0) {
			r = (x == 0.0) ? 1.0 : 0.0;
			g = (x == 1.0) ? 1.0 : 0.0;
			b = (x == 2.0) ? 1.0 : 0.0;
		} else {
			// 奇数行はシフトしたパターン（デルタ配置風）
			g = (x == 0.0) ? 1.0 : 0.0;
			b = (x == 1.0) ? 1.0 : 0.0;
			r = (x == 2.0) ? 1.0 : 0.0;
		}
		
		// サブピクセル内での局所座標を計算
		// uv*resolution の小数部分を使って、各サブピクセル内での相対位置を求める
		vec2 subPixelCoord = mod(uv * resolution, subPixelSize);
		
		vec2 center = vec2(subPixelSize * 0.5);
		float d = length(subPixelCoord - center);
		
		// サブピクセルは円形になるはずなので、中心から外側に向かってフェードアウトする
		// r0: 中心部で完全にON、r1: 外側で完全にOFF
		float radius = .4; // サブピクセルの半径
		float fadeWidthFactor = 0.3; // サブピクセルサイズに対するフェード幅の割合
		float r0 = subPixelSize * radius;
		float r1 = subPixelSize * (radius + fadeWidthFactor);
		float circleMask = 1.0 - smoothstep(r0, r1, d);
		
		return vec3(r, g, b) * circleMask;
	}

	// スキャンライン効果（必要に応じてパラメータ調整可）
	float scanline(vec2 uv) {
		float scanlineBaseBrightness = 0.8;
		float scanlineWave = 1.;
		return clamp(scanlineBaseBrightness + sin(uv.y * resolution.y * scanlineWave) * .5 + .5 , 0.0 , 1.0);
	} // return 0 ~ 1


	// 色収差（左右に微小なオフセット）
	vec3 chromaticAberration(vec2 uv) {
		float shiftStrength = .1;
		float radiusStrength = .1;
		
		// 画面中心からの距離に応じて強さを変える
		float offset = shiftStrength * length(uv - 0.5) * radiusStrength;
		vec3 col;
		col.r = texture(src, uv + vec2(-offset,offset)).r;
		col.g = texture(src, uv).g;
		col.b = texture(src, uv + vec2(offset,-offset)).b;
		return col;
	}

	// 発光
	vec3 glowEffect(vec2 uv) {
		vec3 glow = vec3(0.0);
		float glowIntensity = 0.04;
		float blurSize = 0.0;
		vec2 perDivSize = vec2(blurSize) / resolution;
		for (float i = -2.0; i <= 2.0; i++) {
			for (float j = -2.0; j <= 2.0; j++) {
					glow += texture2D(src, uv + vec2(i, j) * perDivSize).rgb;
			}
		}
		return glow * glowIntensity;
	}
	
	void main() {
		vec2 uv = vUv;

		// ジッターノイズ
		uv += jitterNoise(uv,time);
		
		// お好みで、以下のどちらかのマスク関数を選択
		// vec3 mask = rgbMaskStripe(uv); // RGBストライプ型（従来）
		vec3 mask = rgbMaskDelta(uv); // CRT風デルタ配置
		
		// 色収差をかけた色にマスクを適用
		vec3 color = chromaticAberration(uv) * mask;
		
		// スキャンライン効果を加える
		color *= scanline(uv);

		// ぼやけた発光を加える
		color += glowEffect(uv);

		// 0~1にクランプ
		color = clamp(color,0.,1.);

		gl_FragColor = vec4(color, 1.0);
	}
`,
});

extend({ FxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [offscreenScene] = useState(() => new THREE.Scene());
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
      depthBuffer: true,
   });

   const [funkun, sprite] = useTexture(["/momo.jpg", "/sprite.jpg"]);
   const funkunVideo = useVideoTexture("/FT_Ch02.mp4", {
      width: 1280,
      height: 720,
   });

   const fluid = useFluid({
      size,
      dpr: 0.3,
   });

   const material = useRef<any>();
   useEffect(() => {
      material.current?.updateResolution(size);
   }, [size]);

   useFrame((state) => {
      updateRenderTarget({ gl: state.gl });
      // fluid.render(state);
      material.current.uniforms.time.value = state.clock.getElapsedTime();
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterialImpl
               ref={material}
               key={FxMaterialImpl.key}
               src={funkunVideo}
            />
         </mesh>
         {createPortal(
            <Float rotationIntensity={2} floatIntensity={2} speed={2}>
               <mesh scale={0.8}>
                  <torusKnotGeometry args={[2, 0.5, 400, 32]} />
                  <ambientLight intensity={1.6} />
                  <directionalLight intensity={3} />
                  <meshStandardMaterial color={0xf8f2de} />
               </mesh>
               <OrbitControls />
            </Float>,
            offscreenScene
         )}
      </>
   );
};

/*===============================================

vec3 rgbMaskDelta(vec2 uv) {
		vec2 pixelPos = uv * resolution; // ピクセル単位の座標
		float x = mod(pixelPos.x, 3.0); // 3ピクセル周期でRGB
		float y = mod(pixelPos.y, 2.0); // 2行ごとにパターン変更

		float r = step(0.5, x) * step(1.5, y); // Rの配置
		float g = step(1.5, x) * step(0.5, y); // Gの配置
		float b = step(2.5, x) * step(1.5, y); // Bの配置

		return vec3(r, g, b);
	}

	// CRTのデルタ配置を模したマスク
	vec3 rgbMaskDelta2(vec2 uv) {
		// 画面上の絶対位置に変換
		vec2 pos = uv * resolution;
		
		// 各走査ラインごとに、水平方向に半ピクセル分のオフセットを加えることで
		// サブピクセルの位置を交互にシフト（デルタ配置風に）する。
		float lineOffset = mod(floor(pos.y), 2.0) * 0.5;
		pos.x += lineOffset;
		
		// 水平方向に3サブピクセル分の周期でRGBを割り当てる
		float r = smoothstep(0.0, 1.0, mod(pos.x, 3.0) / 3.0);
		float g = smoothstep(0.0, 1.0, mod(pos.x + 1.0, 3.0) / 3.0);
		float b = smoothstep(0.0, 1.0, mod(pos.x + 2.0, 3.0) / 3.0);
		return vec3(r, g, b);
	}

	vec3 rgbMaskDelta3(vec2 uv) {
		// ピクセル単位の座標に変換
		vec2 pixelPos = uv * resolution;
		
		// x座標は3サブピクセル周期でRGBを割り当てる
		float x = mod(pixelPos.x, 3.0);
		// floor()を用いて、整数の行番号を算出し、2行ごとにパターン変更
		float row = mod(floor(pixelPos.y), 2.0);
		
		vec3 mask;
		if (row < 1.0) {
			// 偶数行の場合：通常のRGB順
			mask.r = smoothstep(0.0, 1.0, mod(x, 3.0) / 3.0);
			mask.g = smoothstep(0.0, 1.0, mod(x + 1.0, 3.0) / 3.0);
			mask.b = smoothstep(0.0, 1.0, mod(x + 2.0, 3.0) / 3.0);
		} else {
			// 奇数行の場合：x方向に半サブピクセル分のオフセットを適用
			mask.r = smoothstep(0.0, 1.0, mod(x + 0.5, 3.0) / 3.0);
			mask.g = smoothstep(0.0, 1.0, mod(x + 1.5, 3.0) / 3.0);
			mask.b = smoothstep(0.0, 1.0, mod(x + 2.5, 3.0) / 3.0);
		}
		return mask;
	}

	vec3 rgbMaskDelta4(vec2 uv) {
		// ピクセル単位の座標に変換
		vec2 pixelPos = uv * resolution;
		
		// グローバルX方向オフセットを適用（この値は調整可能）
		float globalXOffset = 1.6;
		pixelPos.x += globalXOffset;
		
		// 3サブピクセル周期のx座標
		float x = mod(pixelPos.x, 3.0);
		// 2行ごとにパターンを変更するため、行番号の偶奇を判定
		float row = mod(floor(pixelPos.y), 2.0);
		
		vec3 mask;
		if (row < 1.0) {
			// 偶数行：通常のRGB順
			mask.r = smoothstep(0.0, 1.0, mod(x, 3.0) / 3.0);
			mask.g = smoothstep(0.0, 1.0, mod(x + 1.0, 3.0) / 3.0);
			mask.b = smoothstep(0.0, 1.0, mod(x + 2.0, 3.0) / 3.0);
		} else {
			// 奇数行：x方向に0.5サブピクセル分のオフセットを適用
			mask.r = smoothstep(0.0, 1.0, mod(x + 0.5, 3.0) / 3.0);
			mask.g = smoothstep(0.0, 1.0, mod(x + 1.5, 3.0) / 3.0);
			mask.b = smoothstep(0.0, 1.0, mod(x + 2.5, 3.0) / 3.0);
		}
		return mask;
	}

	vec3 rgbMaskDelta5(vec2 uv) {
		vec2 pixelPos = uv * resolution; // ピクセル単位の座標
		float x = mod(pixelPos.x, 3.0); // 3ピクセル周期
		float y = mod(pixelPos.y, 2.0); // 2行ごとにパターン変更

		float r = step(0.5, x) * step(1.5, y); // Rの配置
		float g = step(1.5, x) * step(0.5, y); // Gの配置
		float b = step(2.5, x) * step(1.5, y); // Bの配置

		return vec3(r, g, b);
	}
	


	// // Delta CRTディスプレイ
	// vec3 rgbMaskDelta(vec2 uv) {
	// 	float subPixelSize = 5.; // サブピクセルのサイズ
	// 	vec2 pixelPos = floor(uv * resolution / subPixelSize); // サブピクセル単位の座標

	// 	float x = mod(pixelPos.x, 3.0); // 3ピクセル周期
	// 	float y = mod(pixelPos.y, 2.0); // 2行ごとにパターン変更

	// 	float r, g, b;
		
	// 	if (y == 0.0) {
	// 		r = (x == 0.0) ? 1.0 : 0.0;
	// 		g = (x == 1.0) ? 1.0 : 0.0;
	// 		b = (x == 2.0) ? 1.0 : 0.0;
	// 	} else {
	// 		g = (x == 0.0) ? 1.0 : 0.0;
	// 		b = (x == 1.0) ? 1.0 : 0.0;
	// 		r = (x == 2.0) ? 1.0 : 0.0;
	// 	}

	// 	return vec3(r, g, b);
	// }
===============================================*/
