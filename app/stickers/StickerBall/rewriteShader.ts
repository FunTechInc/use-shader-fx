import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";
import { BASE_ROUGHNESS } from ".";

export const rewriteShader = (shader: OnBeforeInitParameters) => {
   shader.fragmentShader = shader.fragmentShader.replace(
      "void main(){",
      `
			uniform sampler2D uSilhouette;			
			void main(){
		`
   );

   // Map alpha to float.
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
			float silhouetteRadius = 0.56;
			float silhouetteAlpha = 0.;
			float silhouetteDist = distance(silhouettePosition,vPosition);
			if (silhouetteDist < silhouetteRadius) {

				vec2 sticker_texCoord = (vPosition-silhouettePosition)/(silhouetteRadius*2.);
				sticker_texCoord+=0.5;
				vec4 silhouetteColor = texture2D(uSilhouette,vec2(sticker_texCoord));
				
				// Boundaries pick up alpha subtly, adjust with smoothstep.
				silhouetteAlpha = smoothstep(0.8,0.9,silhouetteColor.a);

				// 範囲内のカラー
				vec3 overwriteColor = sampledDiffuseColor.a > 0. ? sampledDiffuseColor.rgb : silhouetteColor.rgb;

				diffuseColor = silhouetteAlpha > 0. ? vec4(overwriteColor,1.) : diffuseColor;
			}

			// Also add the alpha of the silhouette.
			float customMapAlpha = min(sampledDiffuseColor.a + silhouetteAlpha,1.);

   	`
   );
   // Multiply iridescence by alpha of map (only map iridescences).
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_begin>",
      `
   		#include <lights_fragment_begin>
   		material.iridescenceFresnel *= customMapAlpha;
   		material.iridescenceF0 *= customMapAlpha;
   	`
   );
   // Multiply clearcoat by alpha of map (only map clearcoat).
   shader.fragmentShader = shader.fragmentShader.replace(
      "outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;",
      `
   		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat * customMapAlpha;
   	`
   );
   // Multiply roughness by alpha of map (only map roughness).
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_fragment>",
      `
   		#include <lights_physical_fragment>
   		material.roughness = clamp(material.roughness * customMapAlpha,${BASE_ROUGHNESS},1.);
   	`
   );

   // Multiply metalness by alpha of map (only map metalness).
   shader.fragmentShader = shader.fragmentShader.replace(
      "#include <metalnessmap_fragment>",
      `
   		#include <metalnessmap_fragment>
   		metalnessFactor *= customMapAlpha;
   	`
   );
};
