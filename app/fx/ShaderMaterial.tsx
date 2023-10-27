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
   u_fx: THREE.Texture | null;
   u_postFx: THREE.Texture;
   isBgActive: boolean;
};

export const MainShaderMaterial = shaderMaterial(
   {
      u_fx: null,
      u_postFx: null,
      isBgActive: true,
   },
   vertexShader,
   fragmentShader
);
