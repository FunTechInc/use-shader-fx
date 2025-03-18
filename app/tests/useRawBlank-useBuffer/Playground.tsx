"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useFluid, useRawBlank, useBuffer } from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { Output } from "../_utils/Output";

export const Playground = () => {
   const { size } = useThree();

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const rawShader = useRawBlank({
      size,
      dpr: 1,
      uniforms: {
         src: { value: fluid.velocity },
         time: { value: 0 },
         pointer: { value: new THREE.Vector2() },
      },
      vertexShader: `
			void main() {
				gl_Position = vec4(position, 1.0);
			}
		`,
      fragmentShader: `
			precision mediump float;

			uniform float time;
			uniform vec2 pointer;

			#define PI 3.14159265359
			#define MAX_STEPS 100
			#define MAX_DIST 100.0
			#define SURF_DIST 0.001

			// SDF for a sphere
			float sdSphere(vec3 p, float r) {
				return length(p) - r;
			}

			// Smooth minimum function for gooey effect
			float smin(float a, float b, float k) {
				float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
				return mix(b, a, h) - k * h * (1.0 - h);
			}

			// Noise function for added texture
			float hash21(vec2 p) {
				p = fract(p * vec2(123.34, 456.21));
				p += dot(p, p + 45.32);
				return fract(p.x * p.y);
			}

			// Scene SDF
			float map(vec3 p) {
				// Mouse influence on movement
				vec2 m = pointer * 2.0 - 1.0;
				
				// First sphere position with time-based animation
				vec3 p1 = p - vec3(sin(time * 0.5) * 1.5 + m.x, cos(time * 0.7) * 0.5 + m.y, 0.0);
				float sphere1 = sdSphere(p1, 1.0 + 0.2 * sin(time));
				
				// Second sphere position with different animation pattern
				vec3 p2 = p - vec3(cos(time * 0.6) * 1.5 - m.x, sin(time * 0.4) * 0.5 - m.y, 0.0);
				float sphere2 = sdSphere(p2, 0.8 + 0.3 * cos(time * 0.8));
				
				// Gooey blend between the two spheres
				float mouseInfluence = length(m) * 2.0; // Stronger influence when mouse is further from center
				float blendFactor = 0.8 + 0.5 * mouseInfluence;
				return smin(sphere1, sphere2, blendFactor);
			}

			// Calculate normal
			vec3 getNormal(vec3 p) {
				float d = map(p);
				vec2 e = vec2(0.001, 0.0);
				
				vec3 n = d - vec3(
					map(p - e.xyy),
					map(p - e.yxy),
					map(p - e.yyx)
				);
				
				return normalize(n);
			}

			// Raymarching
			float rayMarch(vec3 ro, vec3 rd) {
				float dO = 0.0;
				
				for(int i = 0; i < MAX_STEPS; i++) {
					vec3 p = ro + rd * dO;
					float dS = map(p);
					dO += dS;
					if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
				}
				
				return dO;
			}

			// Color palette function
			vec3 palette(float t) {
				vec3 a = vec3(0.5, 0.5, 0.5);
				vec3 b = vec3(0.5, 0.5, 0.5);
				vec3 c = vec3(1.0, 1.0, 1.0);
				vec3 d = vec3(0.3, 0.2, 0.2);
				return a + b * cos(6.28318 * (c * t + d));
			}

			void main() {
				// Adjust for aspect ratio
				vec2 uv = vUv - 0.5;
				uv.x *= resolution.x / resolution.y;
				
				// Setup camera
				vec3 ro = vec3(0.0, 0.0, -4.0);
				vec3 rd = normalize(vec3(uv, 1.0));
				
				// Raymarch
				float d = rayMarch(ro, rd);
				
				// Background color - deep purple
				vec3 col = vec3(0.1, 0.05, 0.2);
				
				// If we hit something
				if(d < MAX_DIST) {
					vec3 p = ro + rd * d;
					vec3 n = getNormal(p);
					
					// Basic lighting
					vec3 lightPos = vec3(2.0, 4.0, -3.0);
					vec3 lightDir = normalize(lightPos - p);
					float diff = max(dot(n, lightDir), 0.0);
					
					// Add specular highlight
					vec3 viewDir = normalize(ro - p);
					vec3 reflectDir = reflect(-lightDir, n);
					float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
					
					// Gooey color based on position and time
					float t = length(p) * 0.2 + time * 0.1;
					vec3 baseColor = palette(t);
					
					// Add some noise texture
					float noise = hash21(p.xy * 10.0 + time);
					baseColor += noise * 0.05;
					
					// Final color with lighting
					col = baseColor * (diff * 0.8 + 0.2) + vec3(1.0) * spec * 0.5;
					
					// Add rim lighting for gooey effect
					float rim = 1.0 - max(dot(viewDir, n), 0.0);
					rim = pow(rim, 4.0);
					col += rim * vec3(0.3, 0.5, 0.7) * 0.5;
				}
				
				// Apply subtle vignette
				float vignette = 1.0 - length(vUv - 0.5) * 0.8;
				col *= vignette;
				
				// Output final color
				gl_FragColor = vec4(col, 1.0);
				
				#include <colorspace_fragment>
			}
		`,
   });

   const basic = useBuffer({
      size,
      dpr: 1,
      texture: {
         src: rawShader.texture,
         fit: 0,
      },
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      basic.setValues,
      {
         mixSrc: fluid.texture,
         mixDst: fluid.texture,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      basic.render(state, {
         ...setBasicFxGUIValues(),
      });
      rawShader.render(state);
      rawShader.material!.uniforms.time.value = state.clock.getElapsedTime();
      rawShader.material!.uniforms.pointer.value.lerp(state.pointer, 0.1);
      fluid.render(state);
      updateBasicFxGUI();
   });

   return <Output src={basic.texture} />;
};
