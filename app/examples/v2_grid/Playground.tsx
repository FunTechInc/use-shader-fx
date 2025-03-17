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
idea of useGrid
セルカラーの可能性
- カラフル
- テクスチャ
- spriteテクスチャ
- 単純なカラー指定
- マッピングに使うテクスチャのカラーをそのままレンダリング
- サイズ調整map
- 円モード
- サイズ変更チャンネル
- カラー変更チャンネル
- alpha変更チャンネル
- カラーマップとかアルファマップ的なの加えて、陰影つけられるように。古文を3dモデルでなんかやる。
- shuffleCenterを追加する
MEMO * floorでgrid化するときは、Nearestにしないといけない

機能整理
- texture （SamplingFxMaterial）
- cellTexture
- spriteTexture

===============================================*/

const FxMaterialImpl = createFxMaterialImpl({
   uniforms: {
      celltxture: { value: null },
      spriteTexture: { value: null },
      time: { value: 0 },
      pointer: { value: new THREE.Vector2(0.5, 0.5) },
   },
   fragmentShader: `
	uniform sampler2D src;
	uniform sampler2D celltxture;
	uniform sampler2D spriteTexture;
	uniform vec2 pointer;
	uniform float time;

	float u_lineWidth = .01; // 0.01 ~
	vec2 u_gridCount = vec2(50.);
	vec3 u_fillColor = vec3(.0, 1.0, 0.0);
	vec3 u_backgroundColor = vec3(0.0, 0.0, 0.0);
	vec3 u_gridColor = vec3(.2, .2, .2);
	bool u_isEdge = false;
	float shuffleFrequency = 5.0;
	float shuffleRadius = 15.0;
	float maxShuffle = 2.0;
	
	float rand(vec2 n) {
		return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
	}
	
	// 2次元のセル座標からランダムな float を生成するハッシュ関数
	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
	}

	vec3 randomColor(float time) {
		return 0.5 + 0.5 * sin(vec3(12.9898, 78.233, 45.164) * time);
	}

	// cellIndex を時間に応じてシャッフルする関数
	vec2 shuffleIndex(vec2 cellIndex) {
		// 1秒あたり frequency 回更新、離散化
		float discreteTime = floor(time * shuffleFrequency);
		
		// cellIndex に基づく乱数を2種類生成
		float r1 = hash(cellIndex + vec2(0.123, discreteTime));
		float r2 = hash(cellIndex + vec2(0.789, discreteTime));
		
		// 乱数を使って -maxShuffle ～ +maxShuffle の整数オフセットを生成
		float offsetX = floor(r1 * (maxShuffle * 2.0 + 1.0)) - maxShuffle;
		float offsetY = floor(r2 * (maxShuffle * 2.0 + 1.0)) - maxShuffle;
		vec2 offset = vec2(offsetX, offsetY);
		
		// center からの距離を計算（cellIndex と center は同じグリッド座標系である前提）
		vec2 cellPointer = floor(pointer * u_gridCount);
		float d = distance(cellIndex, cellPointer);
		// d=0 のとき重み1、d>=radius で重み0になるよう補間
		float weight = 1.0 - smoothstep(0.0, shuffleRadius, d);
		
		// オフセットに重みを掛ける
		// TODO * ここでcenterに重み付できる
		// offset *= weight;
		
		// cellIndex にオフセットを加算し、グリッド内にラップアラウンド
		vec2 shuffled = cellIndex + offset;
		return mod(shuffled, u_gridCount);
	}

	void main() {

		vec2 fittedUV = vUv * fitScale + (1. - fitScale) / 2.;

		// 現在のセルのインデックスを計算（例：(3, 5) など）
		
		// TODO autoFitさせないようにもしないと柔軟性に欠けるね
		u_gridCount.x *= aspectRatio;
		
		vec2 cellIndex = floor(vUv * u_gridCount);
		// セル毎に一意のhashを生成
		float cellHash = hash(cellIndex);

		// セルシャッフル
		vec2 shuffledIndex = shuffleIndex(cellIndex);

		// セル内の位置 (0～1) AKA cellUV
		vec2 cellPos = fract(vUv * u_gridCount);

		// 各セルの中心座標を計算 テクスチャのfitScaleを考慮する
		vec2 cellCenterUV = ((shuffledIndex + 0.5) / u_gridCount) * fitScale + (1. - fitScale) / 2.;

		// セルの中心でテクスチャをサンプリング
		vec4 texColor = texture2D(src, cellCenterUV);
		// TODO この基準のチャンネルをcolor か alpha かを選べるようにする
		// TODO float len = texColor[0]; みたいにアクセスできるね
		float len = texColor[0];
		// float len = texColor.r;
		
		// --- セルカラー ---
		float threshold = 0.;
		// 1 セル毎のカラフル セル毎に一意のhashを生成しtimeに乗算する。
		// vec3 fillColor = (len >= threshold) ? randomColor((time * cellHash) * .1) : u_backgroundColor;
		// 2 セル毎のテクスチャ
		// vec3 fillColor = (len >= threshold) ? texture2D(celltxture,cellPos).rgb : u_backgroundColor;
		// 3. spriteテクスチャ
		// float spriteCount = 10.0;
		// float spritePos = fract(cellHash + time * 0.4);
		// float spriteIndex = floor(spritePos * spriteCount);
		// float spriteSize = 1.0 / spriteCount;
		// float spriteOffset = spriteIndex * spriteSize;
		// float spriteU = spriteOffset + cellPos.x * spriteSize;
		// vec2 spriteUV = vec2(spriteU, cellPos.y);
		
		// TODO スプライトテクスチャのrgbにtexColorのrgbを乗算できるようにする
		// THINK alphaはalpha mapとかにする？ => 普通にtextureのaをそのままが一旦シンプルかな

		// vec3 fillColor = (len >= threshold) ? texture2D(spriteTexture, spriteUV).rgb : u_backgroundColor;
		// 4. マッピングに使うテクスチャのカラーをそのままレンダリング
		vec3 fillColor = (len >= threshold) ? texColor.rgb : u_backgroundColor;

		// --- グリッド線描画の処理 ---
		// 各辺の境界までの距離を求める
		float distToEdgeX = min(cellPos.x, 1.0 - cellPos.x);
		float distToEdgeY = min(cellPos.y, 1.0 - cellPos.y);
		
		// 微小なマージン
		float margin = u_lineWidth;
		
		// smoothstep により、境界付近で 1.0、境界から離れると 0.0
		float edgeX = 1.0 - smoothstep(u_lineWidth, u_lineWidth + margin, distToEdgeX);
		float edgeY = 1.0 - smoothstep(u_lineWidth, u_lineWidth + margin, distToEdgeY);
		
		// X, Y のうちどちらかがエッジなら検出（両方の場合も 1.0 になる）
		float edge = max(edgeX, edgeY);
		
		// グリッド線部分は u_gridColor、そうでなければ fillColor
		vec3 finalColor = u_isEdge ? mix(fillColor, u_gridColor, edge) : fillColor;
		gl_FragColor = vec4(finalColor, 1.0);

	}
`,
});

extend({ FxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun, sprite] = useTexture([
      "/publicdomainq-0037959yqgbhh.jpg",
      "/sprite.jpg",
   ]);

   // MEMO * floorでgrid化するときは、Nearestにしないといけない
   funkun.minFilter = THREE.NearestFilter;
   funkun.magFilter = THREE.NearestFilter;

   const fitScale = useRef(new THREE.Vector2(1));
   const aspectRatio = size.width / size.height;
   fitScale.current.set(
      Math.min(aspectRatio / 0.642, 1),
      Math.min(0.642 / aspectRatio, 1)
   );

   const material = useRef<any>();
   useEffect(() => {
      material.current?.updateResolution(size);
   }, [size]);

   useFrame((state) => {
      material.current.uniforms.time.value = state.clock.getElapsedTime();
      material.current.uniforms.pointer.value = state.pointer
         .clone()
         .multiplyScalar(0.5)
         .addScalar(0.5);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl
            ref={material}
            key={FxMaterialImpl.key}
            src={funkun}
            fitScale={fitScale.current}
            celltxture={funkun}
            spriteTexture={sprite}
         />
      </mesh>
   );
};
