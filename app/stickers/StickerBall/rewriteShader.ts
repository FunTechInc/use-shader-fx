import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";
import { BASE_ROUGHNESS } from ".";

export const rewriteShader = (shader: OnBeforeInitParameters) => {
   // otherTextureをuniform追加
   shader.fragmentShader = shader.fragmentShader.replace(
      "void main(){",
      `
			uniform sampler2D uSilhouette;
			uniform float uWaitingValue;
			uniform bool uIsNotSticked;
			
			void main(){
		`
   );

   // mapのalphaをfloat変数に格納
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
   		vec4 sampledDiffuseColor = texture2D( map, vMapUv );

			#ifdef DECODE_VIDEO_TEXTURE
				// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)
				sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
			#endif

			diffuseColor *= sampledDiffuseColor;
			
			vec2 silhouettePosition = vec2(0.);
			float silhouetteRadius = 0.48;
			float silhouetteAlpha = 0.;
			float silhouetteDist = distance(silhouettePosition,vPosition);
			if (silhouetteDist < silhouetteRadius) {
				float waitingValue = uIsNotSticked ? uWaitingValue : 1.-uWaitingValue;
				vec2 sticker_texCoord = (vPosition-silhouettePosition)/(silhouetteRadius*2.);
				sticker_texCoord+=0.5;
				vec4 silhouetteColor = texture2D(uSilhouette,vec2(sticker_texCoord));
				// 境界が微妙にalphaを拾うので、smoothstepで調整
				silhouetteAlpha = smoothstep(0.5,0.8,silhouetteColor.a);
				diffuseColor = silhouetteAlpha > 0. ? vec4(silhouetteColor.rgb * waitingValue,1.) : diffuseColor;
			}

			// シルエットのalphaも加算する
			float customMapAlpha = min(sampledDiffuseColor.a + silhouetteAlpha,1.);

   	`
   );
   // iridescenceにmapのalphaをかける（mapだけiridescenceする）
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_begin>",
      `
   		#include <lights_fragment_begin>
   		material.iridescenceFresnel *= customMapAlpha;
   		material.iridescenceF0 *= customMapAlpha;
   	`
   );
   // クリアコートにmapのalphaをかける（mapだけclearcoatする）
   shader.fragmentShader = shader.fragmentShader.replace(
      "outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;",
      `
   		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat * customMapAlpha;
   	`
   );
   // roughnessにmapのalphaをかける（mapだけroughnessする）
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_fragment>",
      `
   		#include <lights_physical_fragment>
   		material.roughness = clamp(material.roughness * customMapAlpha,${BASE_ROUGHNESS},1.);
   	`
   );

   // metalnessにmapのalphaをかける（mapだけmetalnessする。あるいは強くする）
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <metalnessmap_fragment>",
      `
   		#include <metalnessmap_fragment>
   		metalnessFactor *= customMapAlpha;
   	`
   );

   console.log(shader.fragmentShader);
};
