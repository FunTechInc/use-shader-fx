import { use, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../utils/useAddMesh";

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTime: { value: 0.0 },
               uTexture: { value: new THREE.Texture() },
               timeStrength: { value: 0.0 },
               distortionStrength: { value: 0.0 },
               fogEdge0: { value: 0.0 },
               fogEdge1: { value: 0.9 },
               fogColor: { value: new THREE.Color(0xffffff) },
               noiseOct: { value: 8 },
               fbmOct: { value: 3 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material;
};
