import * as THREE from "three";
import { useMemo } from "react";
import getWobble from "../../../libs/shaders/getWobble.glsl";
import snoise from "../../../libs/shaders/snoise.glsl";
import transmission_pars_fragment from "./shaders/transmission_pars_fragment.glsl";
import transmission_fragment from "./shaders/transmission_fragment.glsl";

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
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColorMix: { value: number };
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
		attribute vec4 tangent;
		varying float vWobble;
		varying vec2 vPosition;
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
   return shader;
};

export type WobbleMaterialConstructor = new (opts: {
   [key: string]: any;
}) => THREE.Material;
type MaterialParams<T extends WobbleMaterialConstructor> =
   ConstructorParameters<T>[0];
export type WobbleMaterialProps<T extends WobbleMaterialConstructor> = {
   /** default:THREE.MeshPhysicalMaterial */
   baseMaterial?: T;
   materialParameters?: MaterialParams<T>;
};

export const useMaterial = <T extends WobbleMaterialConstructor>({
   baseMaterial,
   materialParameters,
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
            uWobblePositionFrequency: { value: 0 },
            uWobbleTimeFrequency: { value: 0 },
            uWobbleStrength: { value: 0 },
            uWarpPositionFrequency: { value: 0 },
            uWarpTimeFrequency: { value: 0 },
            uWarpStrength: { value: 0 },
            uWobbleShine: { value: 0 },
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
            uSamples: { value: 6 },
            transmission: { value: 0 },
            _transmission: { value: 1 },
            transmissionMap: { value: null },
         },
      });

      mat.onBeforeCompile = (shader) => {
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

         // frag
         shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
				uniform vec3 uColor0;
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				uniform vec3 uColor3;
				uniform float uColorMix;
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
      };
      mat.needsUpdate = true;

      /*===============================================
		depthMaterial
		===============================================*/
      const depthMat = new THREE.MeshDepthMaterial({
         depthPacking: THREE.RGBADepthPacking,
      });
      depthMat.onBeforeCompile = (shader) => {
         Object.assign(shader.uniforms, mat.userData.uniforms);
         shader.vertexShader = rewriteVertex(shader.vertexShader);
      };
      depthMat.needsUpdate = true;

      return { material: mat, depthMaterial: depthMat };
   }, [materialParameters, baseMaterial]);

   return {
      material: material as Wobble3DMaterial,
      depthMaterial,
   };
};
