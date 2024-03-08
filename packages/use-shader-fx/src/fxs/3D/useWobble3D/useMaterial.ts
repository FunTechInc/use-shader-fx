import * as THREE from "three";
import { useMemo } from "react";
import getWobble from "../../../libs/shaders/getWobble.glsl";
import snoise from "../../../libs/shaders/snoise.glsl";

export class Wobble3DMaterial extends THREE.MeshPhysicalMaterial {
   uniforms!: {
      uTime: { value: number };
      uWobblePositionFrequency: { value: number };
      uWobbleTimeFrequency: { value: number };
      uWobbleStrength: { value: number };
      uWarpPositionFrequency: { value: number };
      uWarpTimeFrequency: { value: number };
      uWarpStrength: { value: number };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColorMix: { value: number };
      // transmission
      uChromaticAberration: { value: number };
      uAnisotropicBlur: { value: number };
      uDistortion: { value: number };
      uDistortionScale: { value: number };
      uTemporalDistortion: { value: number };
   };
}

export type WobbleMaterialConstructor = new (opts: {
   [key: string]: any;
}) => THREE.Material;
type MaterialParams<T extends WobbleMaterialConstructor> =
   ConstructorParameters<T>[0];
export type WobbleMaterialProps<T extends WobbleMaterialConstructor> = {
   /** ベースとなるマテリアル , default:THREE.MeshPhysicalMaterial */
   baseMaterial?: T;
   /** マテリアルのparameters */
   materialParameters?: MaterialParams<T>;
};

/*===============================================
TODO 
- あとでsamples を　uniform
- パフォーマンス周りの調整
- 無駄なコードがないか検証
- リファクタリング
===============================================*/
const SAMPLES = 6;

export const useMaterial = <T extends WobbleMaterialConstructor>({
   baseMaterial,
   materialParameters,
}: WobbleMaterialProps<T>) => {
   const material = useMemo(() => {
      const mat = new (baseMaterial || THREE.MeshPhysicalMaterial)(
         materialParameters || {}
      );
      const hasRoughness =
         mat.type === "MeshPhysicalMaterial" ||
         mat.type === "MeshStandardMaterial";

      const hasTransmission = mat.type === "MeshPhysicalMaterial";

      Object.assign(mat.userData, {
         uniforms: {
            uTime: { value: 0 },
            uWobblePositionFrequency: { value: 0 },
            uWobbleTimeFrequency: { value: 0 },
            uWobbleStrength: { value: 0 },
            uWarpPositionFrequency: { value: 0 },
            uWarpTimeFrequency: { value: 0 },
            uWarpStrength: { value: 0 },
            uColor0: { value: new THREE.Color() },
            uColor1: { value: new THREE.Color() },
            uColor2: { value: new THREE.Color() },
            uColor3: { value: new THREE.Color() },
            uColorMix: { value: 0 },
            // transmission
            uChromaticAberration: { value: 0 },
            uAnisotropicBlur: { value: 0 },
            uDistortion: { value: 0 },
            uDistortionScale: { value: 0 },
            uTemporalDistortion: { value: 0 },
            // TODO 実験
            transmission: { value: 0 },
            _transmission: { value: 1 },
            transmissionMap: { value: null },
         },
      });

      mat.onBeforeCompile = (shader) => {
         Object.assign(shader.uniforms, mat.userData.uniforms);

         // normal
         shader.vertexShader = shader.vertexShader.replace(
            "#include <beginnormal_vertex>",
            `vec3 objectNormal = usf_Normal;
         #ifdef USE_TANGENT
         vec3 objectTangent = vec3( tangent.xyz );
         #endif`
         );

         // position
         shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `vec3 transformed = usf_Position;`
         );

         // uniforms
         shader.vertexShader = shader.vertexShader.replace(
            "void main() {",
            `uniform float uTime;
					uniform float uWobblePositionFrequency;
					uniform float uWobbleTimeFrequency;
					uniform float uWobbleStrength;
					uniform float uWarpPositionFrequency;
					uniform float uWarpTimeFrequency;
					uniform float uWarpStrength;
					attribute vec4 tangent;
					varying float vWobble;
					varying vec2 vPosition;
					// #usf <getWobble>
					void main() {`
         );

         // wobble
         shader.vertexShader = shader.vertexShader.replace(
            "// #usf <getWobble>",
            `${getWobble}`
         );

         // vert
         shader.vertexShader = shader.vertexShader.replace(
            "void main() {",
            `void main() {
					vec3 usf_Position = position;
					vec3 usf_Normal = normal;
					vec3 biTangent = cross(normal, tangent.xyz);
					
					// Neighbours positions
					float shift = 0.01;
					vec3 positionA = usf_Position + tangent.xyz * shift;
					vec3 positionB = usf_Position + biTangent * shift;
					// Wobble
					float wobble = getWobble(usf_Position);
					usf_Position += wobble * normal;
					positionA    += getWobble(positionA) * normal;
					positionB    += getWobble(positionB) * normal;
					// Compute normal
					vec3 toA = normalize(positionA - usf_Position);
					vec3 toB = normalize(positionB - usf_Position);
					usf_Normal = cross(toA, toB);
					// Varying
					vPosition = usf_Position.xy;
					vWobble = wobble / uWobbleStrength;`
         );

         /*===============================================
			frag
			===============================================*/
         // diffuse color , `uColorMix`で色の混合率を操作
         shader.fragmentShader = shader.fragmentShader.replace(
            "#include <color_fragment>",
            `
					#include <color_fragment>
					diffuseColor = mix(diffuseColor,usf_DiffuseColor,uColorMix);`
         );

         // roughness
         if (hasRoughness) {
            shader.fragmentShader = shader.fragmentShader.replace(
               "#include <roughnessmap_fragment>",
               `
					#include <roughnessmap_fragment>
					roughnessFactor = usf_Roughness;`
            );
         }

         shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				${snoise}

				varying float vWobble;
				varying vec2 vPosition;
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${hasRoughness ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${hasRoughness ? "usf_Roughness = 1.0 - colorWobbleMix;" : ""}`
         );

         // transmission
         if (hasTransmission) {
            shader.fragmentShader = shader.fragmentShader.replace(
               "#include <transmission_pars_fragment>",
               `
#ifdef USE_TRANSMISSION

	// Transmission code is based on glTF-Sampler-Viewer
	// https://github.com/KhronosGroup/glTF-Sample-Viewer

	uniform float _transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;

	#ifdef USE_TRANSMISSIONMAP

		uniform sampler2D transmissionMap;

	#endif

	#ifdef USE_THICKNESSMAP

		uniform sampler2D thicknessMap;

	#endif

	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;

	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;

	varying vec3 vWorldPosition;

	// Mipped Bicubic Texture Filtering by N8
	// https://www.shadertoy.com/view/Dl2SDW

	float w0( float a ) {

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );

	}

	float w1( float a ) {

		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );

	}

	float w2( float a ){

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );

	}

	float w3( float a ) {

		return ( 1.0 / 6.0 ) * ( a * a * a );

	}

	// g0 and g1 are the two amplitude functions
	float g0( float a ) {

		return w0( a ) + w1( a );

	}

	float g1( float a ) {

		return w2( a ) + w3( a );

	}

	// h0 and h1 are the two offset functions
	float h0( float a ) {

		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );

	}

	float h1( float a ) {

		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );

	}

	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {

		uv = uv * texelSize.zw + 0.5;

		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );

		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );

		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );

	}

	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {

		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );

	}

	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {

		// Direction of refracted light.
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

		// Compute rotation-independant scaling of the model matrix.
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

		// The thickness is specified in local space.
		return normalize( refractionVector ) * thickness * modelScale;

	}

	float applyIorToRoughness( const in float roughness, const in float ior ) {

		// Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
		// an IOR of 1.5 results in the default amount of microfacet refraction.
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );

	}

	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {

		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );

	}

	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {

		if ( isinf( attenuationDistance ) ) {

			// Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
			return vec3( 1.0 );

		} else {

			// Compute light attenuation using Beer's law.
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
			return transmittance;

		}

	}

	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {

		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;

		// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;

		// Sample framebuffer to get pixel the refracted ray hits.
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );

		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;

		// Get the specular component.
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );

		// As less light is transmitted, the opacity should be increased. This simple approximation does a decent job 
		// of modulating a CSS background, and has no effect when the buffer is opaque, due to a solid object or clear color.
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;

		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );

	}
#endif
					`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
               "#include <transmission_fragment>",
               `
					#ifdef USE_TRANSMISSION

					material.transmission = _transmission;
					material.transmissionAlpha = 1.0;
					material.thickness = thickness;
					material.attenuationDistance = attenuationDistance;
					material.attenuationColor = attenuationColor;

					#ifdef USE_TRANSMISSIONMAP

						material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;

					#endif

					#ifdef USE_THICKNESSMAP

						material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;

					#endif

					vec3 pos = vWorldPosition;

					vec3 v = normalize( cameraPosition - pos );
					vec3 n = inverseTransformDirection( normal, viewMatrix );

					vec4 transmitted = getIBLVolumeRefraction(
						n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
						pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
						material.attenuationColor, material.attenuationDistance );

					material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );

					//カスタム
					float runningSeed = 0.0;
					vec3 transmission = vec3(0.0);
					float transmissionR, transmissionB, transmissionG;
					float randomCoords = rand(runningSeed++);
					float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), uAnisotropicBlur);
					vec3 distortionNormal = vec3(0.0);
					vec3 temporalOffset = vec3(uTime, -uTime, -uTime) * uTemporalDistortion;
					if (uDistortion > 0.0) {
          distortionNormal = uDistortion * vec3(snoiseFractal(vec3((pos * uDistortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * uDistortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * uDistortionScale + temporalOffset)));
        }
					//ここまでカスタム

					// カスタム
					for (float i = 0.0; i < ${SAMPLES}.0; i ++) {
					vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
					transmissionR = getIBLVolumeRefraction(
						sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
						pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / float(${SAMPLES}),
						material.attenuationColor, material.attenuationDistance
					).r;
					transmissionG = getIBLVolumeRefraction(
						sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
						pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + randomCoords) / float(${SAMPLES})) , material.thickness + thickness_smear * (i + randomCoords) / float(${SAMPLES}),
						material.attenuationColor, material.attenuationDistance
					).g;
					transmissionB = getIBLVolumeRefraction(
						sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
						pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + randomCoords) / float(${SAMPLES})), material.thickness + thickness_smear * (i + randomCoords) / float(${SAMPLES}),
						material.attenuationColor, material.attenuationDistance
					).b;
					transmission.r += transmissionR;
					transmission.g += transmissionG;
					transmission.b += transmissionB;
				}
				transmission /= ${SAMPLES}.0;
				
				// ここまでカスタム
			
				totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );

				#endif
					`
            );
         }
      };
      mat.needsUpdate = true;
      return mat;
   }, [materialParameters, baseMaterial]);
   return material as Wobble3DMaterial;
};
