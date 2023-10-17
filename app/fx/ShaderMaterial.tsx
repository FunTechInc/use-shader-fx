import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { shaderMaterial } from "@react-three/drei";

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
   u_bgTexture: THREE.Texture;
};

export const MainShaderMaterial = shaderMaterial(
   {
      u_bufferTexture: null,
      u_resolution: new THREE.Vector2(0, 0),
      u_imageResolution: new THREE.Vector2(1440, 1440),
      u_bgTexture: new THREE.Texture(),
   },
   vertexShader,
   fragmentShader
);
