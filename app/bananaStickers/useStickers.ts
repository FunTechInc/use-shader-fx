import * as THREE from "three";
import { useMemo, useCallback, useReducer } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useBlank } from "@/packages/use-shader-fx/src";

type StickersState = {
   point: THREE.Vector2;
   sticker?: THREE.Texture;
   size?: number;
};

const STICKERSIZE = {
   min: 0.04,
   max: 0.1,
};

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
   const { size } = useThree();

   const [updateBlank, _, { output: sticker }] = useBlank({
      size,
      dpr: 4,
      uniforms: useMemo(
         () => ({
            uStampPoint: {
               value: new THREE.Vector2(0),
            },
            uRandomSize: {
               value: STICKERSIZE.min,
            },
         }),
         []
      ),
      onBeforeCompile: useCallback((shader: any) => {
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform vec2 uStampPoint;
					uniform float uRandomSize;
				`
         );

         shader.fragmentShader = shader.fragmentShader.replace(
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
					vec4 stampColor = texture2D(uTexture,(uv-stamp)/(r*2.)+.5);
					
					// 最終色
					vec4 finalColor = d<r ? mix(backColor,stampColor,stampColor.a) : backColor;

					usf_FragColor = finalColor;
         	`
         );
      }, []),
   });

   const [stickerState, setStickerState] = useReducer(
      (state: StickersState, point: THREE.Vector2): StickersState => {
         return {
            ...state,
            point: point,
            sticker: stickers[Math.floor(Math.random() * stickers.length)],
            size:
               Math.random() * (STICKERSIZE.max - STICKERSIZE.min) +
               STICKERSIZE.min,
         };
      },
      {
         point: new THREE.Vector2(0, 0),
         sticker: stickers[0],
         size: STICKERSIZE.max,
      }
   );

   useFrame((state) => {
      updateBlank(
         state,
         {
            texture: stickerState.sticker,
         },
         {
            uStampPoint: stickerState.point,
            uRandomSize: stickerState.size,
         }
      );
   });

   return { sticker, setStickerState };
};
