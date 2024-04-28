import * as THREE from "three";
import { useMemo } from "react";
import getWobble from "../../../libs/shaders/getWobble.glsl";
import snoise from "../../../libs/shaders/snoise.glsl";
import transmission_pars_fragment from "./shaders/transmission_pars_fragment.glsl";
import transmission_fragment from "./shaders/transmission_fragment.glsl";
import { WOBBLE3D_PARAMS } from ".";
import { MaterialProps } from "../../types";

export class Wobble3DMaterial extends THREE.Material {
   uniforms!: {
      uTime: { value: number };
      uWobblePositionFrequency: { value: number };
      uWobbleTimeFrequency: { value: number };
      uWobbleStrength: { value: number };
      uWarpPositionFrequency: { value: number };
      uWarpTimeFrequency: { value: number };
      uWarpStrength: { value: number };
      uWobbleShine: { value: number };
      uIsWobbleMap: { value: boolean };
      uWobbleMap: { value: THREE.Texture };
      uWobbleMapStrength: { value: number };
      uWobbleMapDistortion: { value: number };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColorMix: { value: number };
      uEdgeThreshold: { value: number };
      uEdgeColor: { value: THREE.Color };
      uChromaticAberration: { value: number };
      uAnisotropicBlur: { value: number };
      uDistortion: { value: number };
      uDistortionScale: { value: number };
      uTemporalDistortion: { value: number };
      uSamples: { value: number };
   };
}

/** You also need to rewrite the vertext shader of depthMaterial */
const rewriteVertex = (vertex: string) => {
   let shader = vertex;
   shader = shader.replace(
      "#include <beginnormal_vertex>",
      `
		vec3 objectNormal = usf_Normal;
		#ifdef USE_TANGENT
		vec3 objectTangent = vec3( tangent.xyz );
		#endif`
   );
   // position
   shader = shader.replace(
      "#include <begin_vertex>",
      `
		vec3 transformed = usf_Position;`
   );

   // uniforms
   shader = shader.replace(
      "void main() {",
      `
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;
		uniform bool uIsWobbleMap;
		uniform sampler2D uWobbleMap;
		uniform float uWobbleMapStrength;
		uniform float uWobbleMapDistortion;
		attribute vec4 tangent;
		varying float vWobble;
		varying vec2 vPosition;
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;
		// #usf <getWobble>
		void main() {`
   );

   // wobble
   shader = shader.replace("// #usf <getWobble>", `${getWobble}`);

   // vert
   shader = shader.replace(
      "void main() {",
      `
		void main() {
		vec3 usf_Position = position;
		vec3 usf_Normal = normal;
		vec3 biTangent = cross(normal, tangent.xyz);
		
		// Neighbours positions
		float shift = 0.01;
		vec3 positionA = usf_Position + tangent.xyz * shift;
		vec3 positionB = usf_Position + biTangent * shift;
		
		// wobbleMap & wobble
		float wobbleMap = uIsWobbleMap ? texture2D(uWobbleMap, uv).g : 0.0;
		vec3 nWobbleMap = wobbleMap * normal * uWobbleMapStrength;
		float wobbleMapDistortion = wobbleMap * uWobbleMapDistortion;

		float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
		float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
		float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
		
		usf_Position += nWobbleMap + (wobble * normal);
		positionA += nWobbleMap + wobbleMapDistortion + (wobblePositionA * normal);
		positionB += nWobbleMap + wobbleMapDistortion + (wobblePositionB * normal);

		// Compute normal
		vec3 toA = normalize(positionA - usf_Position);
		vec3 toB = normalize(positionB - usf_Position);
		usf_Normal = cross(toA, toB);
		
		// Varying
		vPosition = usf_Position.xy;
		vWobble = wobble/uWobbleStrength;
		
		vEdgeNormal = normalize(normalMatrix * usf_Normal);
		vec4 viewPosition = viewMatrix * modelMatrix * vec4(usf_Position, 1.0);
		vEdgeViewPosition = normalize(viewPosition.xyz);
		`
   );
   return shader;
};

export type WobbleMaterialConstructor = new (opts: {
   [key: string]: any;
}) => THREE.Material;
type MaterialParams<T extends WobbleMaterialConstructor> =
   ConstructorParameters<T>[0];
export interface WobbleMaterialProps<T extends WobbleMaterialConstructor>
   extends MaterialProps {
   /** default:THREE.MeshPhysicalMaterial */
   baseMaterial?: T;
   materialParameters?: MaterialParams<T>;
   /**
    * An optional callback that is executed immediately before the depth shader program is compiled.
    * @param shader — Source code of the shader
    * @param renderer — WebGLRenderer Context that is initializing the material
    */
   depthOnBeforeCompile?: (
      shader: THREE.Shader,
      renderer: THREE.WebGLRenderer
   ) => void;
}

export const useMaterial = <T extends WobbleMaterialConstructor>({
   baseMaterial,
   materialParameters,
   onBeforeCompile,
   depthOnBeforeCompile,
   uniforms,
}: WobbleMaterialProps<T>) => {
   const { material, depthMaterial } = useMemo(() => {
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
            uWobblePositionFrequency: {
               value: WOBBLE3D_PARAMS.wobblePositionFrequency,
            },
            uWobbleTimeFrequency: {
               value: WOBBLE3D_PARAMS.wobbleTimeFrequency,
            },
            uWobbleStrength: { value: WOBBLE3D_PARAMS.wobbleStrength },
            uWarpPositionFrequency: {
               value: WOBBLE3D_PARAMS.warpPositionFrequency,
            },
            uWarpTimeFrequency: { value: WOBBLE3D_PARAMS.warpTimeFrequency },
            uWarpStrength: { value: WOBBLE3D_PARAMS.warpStrength },
            uWobbleShine: { value: WOBBLE3D_PARAMS.wobbleShine },
            uIsWobbleMap: { value: false },
            uWobbleMap: { value: new THREE.Texture() },
            uWobbleMapStrength: { value: WOBBLE3D_PARAMS.wobbleMapStrength },
            uWobbleMapDistortion: {
               value: WOBBLE3D_PARAMS.wobbleMapDistortion,
            },
            uColor0: { value: WOBBLE3D_PARAMS.color0 },
            uColor1: { value: WOBBLE3D_PARAMS.color1 },
            uColor2: { value: WOBBLE3D_PARAMS.color2 },
            uColor3: { value: WOBBLE3D_PARAMS.color3 },
            uColorMix: { value: WOBBLE3D_PARAMS.colorMix },
            uEdgeThreshold: { value: WOBBLE3D_PARAMS.edgeThreshold },
            uEdgeColor: { value: WOBBLE3D_PARAMS.edgeColor },
            uChromaticAberration: {
               value: WOBBLE3D_PARAMS.chromaticAberration,
            },
            uAnisotropicBlur: { value: WOBBLE3D_PARAMS.anisotropicBlur },
            uDistortion: { value: WOBBLE3D_PARAMS.distortion },
            uDistortionScale: { value: WOBBLE3D_PARAMS.distortionScale },
            uTemporalDistortion: { value: WOBBLE3D_PARAMS.temporalDistortion },
            uSamples: { value: WOBBLE3D_PARAMS.samples },
            transmission: { value: 0 },
            _transmission: { value: 1 },
            transmissionMap: { value: null },
            ...uniforms,
         },
      });

      mat.onBeforeCompile = (shader, renderer) => {
         Object.assign(shader.uniforms, mat.userData.uniforms);

         /********************
			vert
			********************/
         shader.vertexShader = rewriteVertex(shader.vertexShader);

         /********************
			frag
			********************/
         // diffuse color , Manipulate color mixing ratio with `uColorMix`
         shader.fragmentShader = shader.fragmentShader.replace(
            "#include <color_fragment>",
            `
					#include <color_fragment>

					if (uEdgeThreshold > 0.0) {
						float edgeThreshold = dot(vEdgeNormal, -vEdgeViewPosition);
						diffuseColor = edgeThreshold < uEdgeThreshold ? vec4(uEdgeColor, 1.0) : mix(diffuseColor, usf_DiffuseColor, uColorMix);
					} else {
						diffuseColor = mix(diffuseColor, usf_DiffuseColor, uColorMix);
					}
				`
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

         // frag
         shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
				uniform float uEdgeThreshold;
				uniform vec3 uEdgeColor;
				uniform float uWobbleShine;
				
				// transmission
				uniform float uChromaticAberration;         
				uniform float uAnisotropicBlur;      
				uniform float uTime;
				uniform float uDistortion;
				uniform float uDistortionScale;
				uniform float uTemporalDistortion;
				uniform float uSamples;
				
				float rand(float n){return fract(sin(n) * 43758.5453123);}
				${snoise}

				varying float vWobble;
				varying vec2 vPosition;
				varying vec3 vEdgeNormal;
				varying vec3 vEdgeViewPosition;
				
				void main(){
					vec4 usf_DiffuseColor = vec4(1.0);
					${hasRoughness ? "float usf_Roughness = roughness;" : ""}
					float colorWobbleMix = smoothstep(-1.,1.,vWobble);
					vec2 colorPosMix = vec2(smoothstep(-1.,1.,vPosition.x),smoothstep(-1.,1.,vPosition.y));
				
					usf_DiffuseColor.rgb = mix(mix(uColor0, uColor1, colorPosMix.x), mix(uColor2, uColor3, colorPosMix.y), colorWobbleMix);

					${
                  hasRoughness
                     ? "usf_Roughness = max(roughness - colorWobbleMix * uWobbleShine,0.);"
                     : ""
               }`
         );

         // transmission
         if (hasTransmission) {
            shader.fragmentShader = shader.fragmentShader.replace(
               "#include <transmission_pars_fragment>",
               `${transmission_pars_fragment}`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
               "#include <transmission_fragment>",
               `${transmission_fragment}`
            );
         }

         onBeforeCompile && onBeforeCompile(shader, renderer);
      };
      mat.needsUpdate = true;

      /*===============================================
		depthMaterial
		===============================================*/
      const depthMat = new THREE.MeshDepthMaterial({
         depthPacking: THREE.RGBADepthPacking,
      });
      depthMat.onBeforeCompile = (shader, renderer) => {
         Object.assign(shader.uniforms, mat.userData.uniforms);
         shader.vertexShader = rewriteVertex(shader.vertexShader);
         depthOnBeforeCompile && depthOnBeforeCompile(shader, renderer);
      };
      depthMat.needsUpdate = true;

      return { material: mat, depthMaterial: depthMat };
   }, [
      materialParameters,
      baseMaterial,
      onBeforeCompile,
      depthOnBeforeCompile,
      uniforms,
   ]);

   return {
      material: material as Wobble3DMaterial,
      depthMaterial,
   };
};
