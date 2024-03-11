import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Size } from "@react-three/fiber";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { setUniform } from "../../../utils/setUniforms";
import { useResolution } from "../../../utils/useResolution";
import { useAddObject } from "../../../utils/useAddObject";

export class ChromaKeyMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_resolution: { value: THREE.Vector2 };
      u_keyColor: { value: THREE.Color };
      u_similarity: { value: number };
      u_smoothness: { value: number };
      u_spill: { value: number };
      u_color: { value: THREE.Vector4 };
      u_contrast: { value: number };
      u_brightness: { value: number };
      u_gamma: { value: number };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number;
}) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               u_texture: { value: new THREE.Texture() },
               u_resolution: { value: new THREE.Vector2() },
               u_keyColor: { value: new THREE.Color() },
               u_similarity: { value: 0 },
               u_smoothness: { value: 0 },
               u_spill: { value: 0 },
               u_color: { value: new THREE.Vector4() },
               u_contrast: { value: 0 },
               u_brightness: { value: 0 },
               u_gamma: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as ChromaKeyMaterial;

   const resolution = useResolution(size, dpr);
   useEffect(() => {
      setUniform(material, "u_resolution", resolution.clone());
   }, [resolution, material]);

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
