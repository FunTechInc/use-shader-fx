import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useEffect, useMemo } from "react";
import { useAddMesh } from "../utils/useAddMesh";
import { useResolution } from "../utils/useResolution";
import { setUniform } from "../utils/setUniforms";
import { Size } from "@react-three/fiber";

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
               uMap: { value: null },
               uResolution: { value: new THREE.Vector2(0, 0) },
               uAspect: { value: 1 },
               uRadius: { value: 0.0 },
               uAlpha: { value: 0.0 },
               uDissipation: { value: 0.0 },
               uMagnification: { value: 0.0 },
               uMouse: { value: new THREE.Vector2(0, 0) },
               uVelocity: { value: new THREE.Vector2(0, 0) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   const resolution = useResolution(size, dpr);

   useEffect(() => {
      setUniform(material, "uAspect", resolution.width / resolution.height);
      setUniform(material, "uResolution", resolution.clone());
   }, [resolution, material]);

   useAddMesh(scene, geometry, material);

   return material;
};
