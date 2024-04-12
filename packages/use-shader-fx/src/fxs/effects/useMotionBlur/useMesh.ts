import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MOTIONBLUR_PARAMS } from ".";

export class MotionBlurMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uBackbuffer: { value: THREE.Texture };
      uBegin: { value: THREE.Vector2 };
      uEnd: { value: THREE.Vector2 };
      uStrength: { value: number };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: MOTIONBLUR_PARAMS.texture },
               uBackbuffer: { value: new THREE.Texture() },
               uBegin: { value: MOTIONBLUR_PARAMS.begin },
               uEnd: { value: MOTIONBLUR_PARAMS.end },
               uStrength: { value: MOTIONBLUR_PARAMS.strength },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as MotionBlurMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
