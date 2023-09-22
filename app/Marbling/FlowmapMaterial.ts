import * as THREE from "three";
import vertexShader from "./shader/flowmap.vert";
import fragmentSahder from "./shader/flowmap.frag";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         flowmapMaterial: any;
      }
   }
}

export type TFlowmapUniforms = {
   u_bufferTexture: THREE.Texture;
   u_falloff: number;
   u_alpha: number;
   u_dissipation: number;
   u_pointer: THREE.Vec2;
   u_velocity: THREE.Vec2;
   u_easing: number;
};

export const FlowmapMaterial = shaderMaterial(
   {
      u_bufferTexture: new THREE.Texture(),
      u_falloff: 0.2 * 0.5,
      u_alpha: 1.5,
      u_dissipation: 0.98,
      u_pointer: new THREE.Vector2(0, 0),
      u_velocity: new THREE.Vector2(0, 0),
      u_easing: 10.0,
   },
   vertexShader,
   fragmentSahder
);
