import * as THREE from "three";
import {
   useMemo,
   useCallback,
   useReducer,
   useRef,
   useState,
   useEffect,
} from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useBlank, useBrush } from "@/packages/use-shader-fx/src";
import { CanvasState } from "./CanvasState";

const STICKER_TEXCOORD = `
	vec2 stamp = uStampPoint;
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
	vec2 sticker_texCoord = (uv-stamp)/(r*2.);
	sticker_texCoord *= rotationMatrix;
	sticker_texCoord += .5;
`;

const WRINKLE_TEXTURES = ["/stickers/wrinkle0.jpg", "/stickers/wrinkle1.jpg"];

const STICKER_TEXTURES = [
   "/stickers/sticker0.png",
   "/stickers/sticker1.png",
   "/stickers/sticker2.png",
   "/stickers/sticker3.png",
   "/stickers/sticker4.png",
   "/stickers/sticker5.png",
   "/stickers/sticker6.png",
   "/stickers/sticker7.png",
   "/stickers/sticker8.png",
   "/stickers/sticker9.png",
   "/stickers/sticker10.png",
   "/stickers/sticker11.png",
   "/stickers/sticker12.png",
   "/stickers/sticker13.png",
   "/stickers/sticker14.png",
   "/stickers/sticker15.png",
   "/stickers/sticker16.png",
   "/stickers/sticker17.png",
   "/stickers/sticker18.png",
   "/stickers/sticker19.png",
];

const GIF_IMAGES = [...Array(STICKER_TEXTURES.length)].map(
   (_, i) => `/stickers/gif/gif${i}.gif`
);

const useGifPreLoader = () => {
   useEffect(() => {
      GIF_IMAGES.forEach((src) => {
         const img = new Image();
         img.src = src;
      });
   }, []);
};

export const useStickers = () => {
   const canvasState = CanvasState.getInstance();

   const textures = useLoader(THREE.TextureLoader, [
      ...WRINKLE_TEXTURES,
      ...STICKER_TEXTURES,
   ]);

   useGifPreLoader();

   const wrinkles = textures.slice(0, WRINKLE_TEXTURES.length);
   const stickers = textures.slice(WRINKLE_TEXTURES.length);

   canvasState.textures = {
      wrinkles,
      stickers,
   };

   const { size } = useThree();

   const [updateSticker, _, { output: stickerMap }] = useBlank({
      size,
      dpr: 8,
      onBeforeInit: useCallback(
         (parameters: any) => {
            Object.assign(parameters.uniforms, {
               uStampPoint: {
                  value: new THREE.Vector2(0),
               },
               uRandomSize: {
                  value: canvasState.state.size,
               },
               uRandomAngle: {
                  value: canvasState.state.angle,
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

					// バッファー取得
					vec4 backColor = texture2D(uBackbuffer,uv);

					${STICKER_TEXCOORD}
					vec4 stampColor = texture2D(uTexture,sticker_texCoord);

					// 最終色
					vec4 finalColor = mix(backColor,stampColor,smoothstep(0.9,1.,stampColor.a));
					usf_FragColor = finalColor;
         	`
            );
         },
         // eslint-disable-next-line react-hooks/exhaustive-deps
         []
      ),
   });

   const [updateNormal, __, { output: normalMap }] = useBlank({
      size,
      dpr: 6,
      onBeforeInit: useCallback(
         (shader: any) => {
            Object.assign(shader.uniforms, {
               uWrinkleTexure: {
                  value: wrinkles[0],
               },
               uWrinkleIntensity: {
                  value: 0,
               },
               uStickerTexture: {
                  value: stickers[0],
               },
               uStampPoint: {
                  value: new THREE.Vector2(0),
               },
               uRandomSize: {
                  value: canvasState.state.size,
               },
               uRandomAngle: {
                  value: canvasState.state.angle,
               },
            });
            shader.fragmentShader = shader.fragmentShader.replace(
               "#usf <uniforms>",
               `
					uniform sampler2D uWrinkleTexure;
					uniform sampler2D uStickerTexture;
					uniform float uWrinkleIntensity;
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
					${STICKER_TEXCOORD}
					float stickerAlpha = texture2D(uStickerTexture,sticker_texCoord).a;
					vec3 wrinkledColor = texture2D(uWrinkleTexure,sticker_texCoord).rgb;
					wrinkledColor *= stickerAlpha * uWrinkleIntensity; // シワのintensity
				
					// 法線ベクトルを計算
					vec3 normal;
					normal.x = (heightL - heightR) + wrinkledColor.r;
					normal.y = (heightD - heightU) + wrinkledColor.g;
					normal.z = 1. + wrinkledColor.b;

					// 法線ベクトルを正規化 -1 ~ 1
					normal = normalize(normal);

					// 法線ベクトルを [0, 1] の範囲に変換してテクスチャに格納
					vec4 normalColor = vec4(normal*.5+.5,1.);
					
					// ステッカーの部分はシワを適用して、それ以外はbackColorを使う
					vec4 finalColor = mix(normalColor,mix(backColor,normalColor,stickerAlpha),mapAlpha);
					usf_FragColor = finalColor;
         	`
            );
         },
         // eslint-disable-next-line react-hooks/exhaustive-deps
         []
      ),
   });

   const tickCount = useRef(-2);

   const [isReady, setIsReady] = useState(false);

   useFrame((state) => {
      if (tickCount.current !== canvasState.state.count) {
         tickCount.current++;

         if (tickCount.current === 0) {
            setIsReady(true);
         }

         const updateState = {
            uStampPoint: canvasState.state.point,
            uRandomSize: canvasState.state.size,
            uRandomAngle: canvasState.state.angle,
         };
         updateSticker(
            state,
            {
               texture: canvasState.state.sticker ?? stickers[0],
            },
            {
               ...updateState,
            }
         );
         updateNormal(
            state,
            {
               texture: stickerMap,
            },
            {
               uStickerTexture: canvasState.state.sticker ?? stickers[0],
               uWrinkleTexure: canvasState.state.wrinkle ?? wrinkles[0],
               uWrinkleIntensity: canvasState.state.wrinkleIntensity,
               ...updateState,
            }
         );
      }
   });

   return { stickerMap, normalMap, isReady };
};
