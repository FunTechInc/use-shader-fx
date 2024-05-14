import * as THREE from "three";
import { useMemo, useCallback, useReducer, useRef } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useBlank, useBrush } from "@/packages/use-shader-fx/src";

type StickersState = {
   point: THREE.Vector2;
   sticker?: THREE.Texture;
   size?: number;
   angle?: number;
   count: number;
};

const STICKERSIZE = {
   min: 0.04,
   max: 0.1,
};

const getRandomAngle = () => Math.random() * Math.PI * 2;
const getRandomSize = () =>
   Math.random() * (STICKERSIZE.max - STICKERSIZE.min) + STICKERSIZE.min;

export const useStickers = () => {
   const stickers = useLoader(THREE.TextureLoader, [
      "/stickers/sticker0.png",
      "/stickers/sticker1.png",
      "/stickers/sticker2.png",
      "/stickers/sticker3.png",
      "/stickers/sticker4.png",
      "/stickers/sticker5.png",
      "/stickers/sticker6.png",
      "/stickers/sticker8.png",
      "/stickers/sticker9.png",
      "/stickers/sticker10.png",
      "/stickers/sticker11.png",
      "/stickers/sticker12.png",
      "/stickers/sticker13.png",
      "/stickers/sticker14.png",
      "/stickers/sticker15.png",
      "/stickers/sticker16.png",
   ]);

   const [wrinkle] = useLoader(THREE.TextureLoader, ["/stickers/wrinkle.webp"]);

   const { size } = useThree();

   const [updateBlank, _, { output: stickerMap }] = useBlank({
      size,
      dpr: 8,
      onBeforeInit: useCallback((parameters: any) => {
         Object.assign(parameters.uniforms, {
            uStampPoint: {
               value: new THREE.Vector2(0),
            },
            uRandomSize: {
               value: getRandomSize(),
            },
            uRandomAngle: {
               value: getRandomAngle(),
            },
         });
         parameters.fragmentShader = parameters.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform vec2 uStampPoint;
					uniform float uRandomSize;
					uniform float uRandomAngle;
				`
         );

         parameters.fragmentShader = parameters.fragmentShader.replace(
            "#usf <main>",
            `
					vec2 uv = vUv;
					vec2 stamp = uStampPoint;

					// バッファー取得
					vec4 backColor = texture2D(uBackbuffer,uv);

					uv.x *= 2.;
					stamp.x *= 2.;

					// 距離と半径
					float d = distance(uv, stamp);
					float r = uRandomSize;

					// スタンプ
					float angle = uRandomAngle;
					float cosAngle = cos(angle);
					float sinAngle = sin(angle);
					mat2 rotationMatrix = mat2(
						cosAngle, -sinAngle,
						sinAngle, cosAngle
					);
					vec2 texCoord = (uv-stamp)/(r*2.);
					texCoord *= rotationMatrix;
					texCoord += .5;
					vec4 stampColor = texture2D(uTexture,texCoord);

					// 最終色
					vec4 finalColor = mix(backColor,stampColor,smoothstep(0.9,1.,stampColor.a));
					usf_FragColor = finalColor;
         	`
         );
      }, []),
   });

   const [updateNormal, setNormal, { output: normalMap }] = useBlank({
      size,
      dpr: 4,
      onBeforeInit: useCallback((shader: any) => {
         Object.assign(shader.uniforms, {
            uWrinkleTexure: {
               value: wrinkle,
            },
            uStickerTexture: {
               value: new THREE.Texture(),
            },
            uStampPoint: {
               value: new THREE.Vector2(0),
            },
            uRandomSize: {
               value: getRandomSize(),
            },
            uRandomAngle: {
               value: getRandomAngle(),
            },
         });
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform sampler2D uWrinkleTexure;
					uniform sampler2D uStickerTexture;
					uniform vec2 uStampPoint;
					uniform float uRandomSize;
					uniform float uRandomAngle;
				`
         );
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf <main>",
            `
					vec2 uv = vUv;

					vec2 texelSize = 1.0 / uResolution;

					// 高さマップから高さ値をサンプリング
					float mapAlpha = texture2D(uTexture, uv).a;
					float heightL = texture2D(uTexture, uv - vec2(texelSize.x, 0.0)).a;
					float heightR = texture2D(uTexture, uv + vec2(texelSize.x, 0.0)).a;
					float heightD = texture2D(uTexture, uv - vec2(0.0, texelSize.y)).a;
					float heightU = texture2D(uTexture, uv + vec2(0.0, texelSize.y)).a;

					// バックバッファー
					vec4 backColor = texture2D(uBackbuffer, uv);

					// シワ
					vec2 stamp = uStampPoint;
					uv.x *= 2.;
					stamp.x *= 2.;
					float d = distance(uv, stamp);
					float r = uRandomSize;
					float angle = uRandomAngle;
					float cosAngle = cos(angle);
					float sinAngle = sin(angle);
					mat2 rotationMatrix = mat2(
						cosAngle, -sinAngle,
						sinAngle, cosAngle
					);
					vec2 texCoord = (uv-stamp)/(r*2.);
					texCoord *= rotationMatrix;
					texCoord += .5;
					float stickerAlpha = texture2D(uStickerTexture,texCoord).a;
					vec3 wrinkledColor = texture2D(uWrinkleTexure,texCoord).rgb * 2. - 1.;
					wrinkledColor *= stickerAlpha * .4;// シワのintensity
				
					// 法線ベクトルを計算
					vec3 normal;
					normal.x = (heightL - heightR) + wrinkledColor.r;
					normal.y = (heightD - heightU) + wrinkledColor.g;
					normal.z = 1. + wrinkledColor.b;

					// 法線ベクトルを正規化 -1 ~ 1
					normal = normalize(normal);

					// 法線ベクトルを [0, 1] の範囲に変換してテクスチャに格納
					vec4 normalColor = vec4(normal * .5 + 0.5,1.);
					

					vec4 finalColor = mix(backColor,normalColor,stickerAlpha);
					vec4 finalNormal = mix(normalColor,finalColor,mapAlpha);

					usf_FragColor = finalNormal;
         	`
         );
      }, []),
   });

   setNormal({
      texture: stickerMap,
   });

   const [stickerState, setStickerState] = useReducer(
      (state: StickersState, point: THREE.Vector2): StickersState => {
         return {
            ...state,
            point: point,
            sticker: stickers[Math.floor(Math.random() * stickers.length)],
            size: getRandomSize(),
            angle: getRandomAngle(),
            count: state.count + 2, // backbuffer分の更新を行うため
         };
      },
      {
         point: new THREE.Vector2(0, 0),
         sticker: stickers[0],
         size: getRandomSize(),
         angle: getRandomAngle(),
         count: 0,
      }
   );

   const tickCount = useRef(0);
   useFrame((state) => {
      if (tickCount.current !== stickerState.count) {
         tickCount.current++;
         updateBlank(
            state,
            {
               texture: stickerState.sticker,
            },
            {
               uStampPoint: stickerState.point,
               uRandomSize: stickerState.size,
               uRandomAngle: stickerState.angle,
            }
         );
         updateNormal(
            state,
            {},
            {
               uStickerTexture: stickerState.sticker,
               uStampPoint: stickerState.point,
               uRandomSize: stickerState.size,
               uRandomAngle: stickerState.angle,
            }
         );
      }
   });

   return { stickerMap, normalMap, setStickerState };
};
