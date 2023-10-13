import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/velocity.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   viscosity: { value: number };
   forceRadius: { value: number };
   forceCoefficient: { value: number };
   dataTex: { value: THREE.Texture };
   pointerPos: { value: THREE.Vector2 };
   beforePointerPos: { value: THREE.Vector2 };
};

export class VelocityMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useVelocityMaterial = () => {
   const velocityMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               resolution: { value: new THREE.Vector2(0, 0) },
               dataTex: { value: null },
               pointerPos: { value: null },
               beforePointerPos: { value: null },
               viscosity: { value: 0.99 }, //粘度
               forceRadius: { value: 90 }, //力を加える円の半径
               forceCoefficient: { value: 1.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return velocityMaterial as VelocityMaterial;
};
