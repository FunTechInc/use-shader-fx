import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { shaderMaterial } from "@react-three/drei";
import { TEXTURE_RATIO } from "./store";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         mainShaderMaterial: any;
      }
   }
}

export type TMainShaderUniforms = {
   u_bufferTexture: any;
   u_resolution: THREE.Vec2;
   u_imageResolution: THREE.Vec2;
   u_noiseTexture: THREE.Texture;
   u_bgTexture0: THREE.Texture;
   u_bgTexture1: THREE.Texture;
   u_noiseStrength: number;
   u_noiseTime: number;
   u_waveStrength: number;
   u_progress: number;
   u_progress2: number;
   u_time: number;
   u_pointer: THREE.Vec2;
   u_color1: THREE.Color;
   u_color2: THREE.Color;
};

export const MainShaderMaterial = shaderMaterial(
   {
      u_bufferTexture: null,
      u_resolution: new THREE.Vector2(0, 0),
      u_imageResolution: new THREE.Vector2(TEXTURE_RATIO.x, TEXTURE_RATIO.y),
      u_noiseTexture: new THREE.Texture(),
      u_bgTexture0: new THREE.Texture(),
      u_bgTexture1: new THREE.Texture(),
      u_noiseStrength: 0.0,
      u_noiseTime: 0.0,
      u_waveStrength: 0.0,
      u_progress: 0.0,
      u_progress2: 0.0,
      u_time: 0.0,
      u_pointer: new THREE.Vector2(0, 0),
      u_color1: new THREE.Color("#f9f6ef"),
      u_color2: new THREE.Color("#efeae2"),
   },
   vertexShader,
   fragmentShader
);
