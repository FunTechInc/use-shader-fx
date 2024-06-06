import * as THREE from "three";
import { useMemo, useCallback, useRef, useState } from "react";
import { useFrame, useThree, useLoader, Size } from "@react-three/fiber";
import { ResizeBoundary, Utils, useBlank } from "@/packages/use-shader-fx/src";
import { CanvasState } from "../CanvasState";

const STICKER_TEXCOORD = `
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
	vec2 sticker_texCoord = (uv-stamp)/(r*2.);
	sticker_texCoord *= rotationMatrix;
	sticker_texCoord += .5;
`;

const WRINKLE_TEXTURES = [
   "/stickers/webp/wrinkle0.webp",
   "/stickers/webp/wrinkle1.webp",
];

const STICKER_TEXTURES = [
   "/stickers/webp/sticker0.webp",
   "/stickers/webp/sticker1.webp",
   "/stickers/webp/sticker2.webp",
   "/stickers/webp/sticker3.webp",
   "/stickers/webp/sticker4.webp",
   "/stickers/webp/sticker5.webp",
   "/stickers/webp/sticker6.webp",
   "/stickers/webp/sticker7.webp",
   "/stickers/webp/sticker8.webp",
   "/stickers/webp/sticker9.webp",
];

export const STICKER_TEXTURES_LENGTH = STICKER_TEXTURES.length;

const MAX_DPR = {
   sticker: 5,
   normal: 5,
};

export const useStickers = (resizeBoundary: ResizeBoundary) => {
   const canvasState = CanvasState.getInstance();

   const textures = useLoader(THREE.TextureLoader, [
      ...WRINKLE_TEXTURES,
      ...STICKER_TEXTURES,
   ]);

   const wrinkles = textures.slice(0, WRINKLE_TEXTURES.length);
   const stickers = textures.slice(WRINKLE_TEXTURES.length);
   const silhouette = stickers[0];

   canvasState.textures = {
      wrinkles,
      stickers,
   };

   const { size } = useThree();

   const [updateSticker, _, { output: stickerMap }] = useBlank({
      size,
      dpr: Math.min(resizeBoundary.maxDpr, MAX_DPR.sticker),
      isSizeUpdate: resizeBoundary.isUpdate,
      onBeforeInit: useCallback(
         (parameters: any) => {
            Object.assign(parameters.uniforms, {
               uStampPoint: {
                  value: new THREE.Vector2(0),
               },
               uRandomSize: {
                  value: canvasState.stickerState.size,
               },
               uRandomAngle: {
                  value: canvasState.stickerState.angle,
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

					vec4 backColor = texture2D(uBackbuffer,uv);

					${STICKER_TEXCOORD}
					vec4 stampColor = texture2D(uTexture,sticker_texCoord);

					// Boundaries pick up alpha subtly, adjust with smoothstep.
					vec4 finalColor = mix(backColor,stampColor,smoothstep(0.8,0.9,stampColor.a));
					usf_FragColor = finalColor;
         	`
            );

            parameters.fragmentShader = parameters.fragmentShader.replace(
               "precision highp float;",
               "precision lowp float;"
            );
         },
         // eslint-disable-next-line react-hooks/exhaustive-deps
         []
      ),
   });

   const [updateNormal, __, { output: normalMap }] = useBlank({
      size,
      dpr: Math.min(resizeBoundary.maxDpr, MAX_DPR.normal),
      isSizeUpdate: resizeBoundary.isUpdate,
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
                  value: canvasState.stickerState.size,
               },
               uRandomAngle: {
                  value: canvasState.stickerState.angle,
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

					// Sampling height values from height maps.
					float mapAlpha = texture2D(uTexture, uv).a;
					float heightL = texture2D(uTexture, uv - vec2(texelSize.x, 0.0)).a;
					float heightR = texture2D(uTexture, uv + vec2(texelSize.x, 0.0)).a;
					float heightD = texture2D(uTexture, uv - vec2(0.0, texelSize.y)).a;
					float heightU = texture2D(uTexture, uv + vec2(0.0, texelSize.y)).a;

					vec4 backColor = texture2D(uBackbuffer, uv);

					// wrickle texture
					${STICKER_TEXCOORD}
					float stickerAlpha = texture2D(uStickerTexture,sticker_texCoord).a;
					vec3 wrinkledColor = texture2D(uWrinkleTexure,sticker_texCoord).rgb;
					wrinkledColor *= stickerAlpha * uWrinkleIntensity;
				
					// compute normal
					vec3 normal;
					normal.x = (heightL - heightR) + wrinkledColor.r;
					normal.y = (heightD - heightU) + wrinkledColor.g;
					normal.z = 1. + wrinkledColor.b;

					// normalize -1 ~ 1
					normal = normalize(normal);

					// 0 ~ 1
					vec4 normalColor = vec4(normal*.5+.5,1.);
					
					// Apply wrinkles to sticker areas and use backColour for the rest.
					vec4 finalColor = mix(normalColor,mix(backColor,normalColor,stickerAlpha),mapAlpha);
					usf_FragColor = finalColor;
         	`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
               "precision highp float;",
               "precision lowp float;"
            );
         },
         // eslint-disable-next-line react-hooks/exhaustive-deps
         []
      ),
   });

   const tickCount = useRef(-2);

   if (
      resizeBoundary.isUpdate &&
      tickCount.current === canvasState.stickerState.count
   ) {
      tickCount.current -= 2;
   }

   const [isReady, setIsReady] = useState(false);

   useFrame((state) => {
      if (tickCount.current === canvasState.stickerState.count) {
         return;
      }

      tickCount.current++;

      if (tickCount.current === 0 && !isReady) {
         setIsReady(true);
      }

      const updateState = {
         uStampPoint: canvasState.stickerState.point,
         uRandomSize: canvasState.stickerState.size,
         uRandomAngle: canvasState.stickerState.angle,
      };
      updateSticker(
         state,
         {
            texture: canvasState.stickerState.sticker ?? stickers[0],
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
            uStickerTexture: canvasState.stickerState.sticker ?? stickers[0],
            uWrinkleTexure: canvasState.stickerState.wrinkle ?? wrinkles[0],
            uWrinkleIntensity: canvasState.stickerState.wrinkleIntensity,
            ...updateState,
         }
      );
   });

   return { stickerMap, normalMap, isReady, silhouette };
};
