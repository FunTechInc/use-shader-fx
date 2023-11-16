import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useEffect, useMemo } from "react";
import { useResolution } from "../../utils/useResolution";
import { useAddMesh } from "../../utils/useAddMesh";
import { setUniform } from "../../utils/setUniforms";
import { Size } from "@react-three/fiber";

export class BrushMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uMap: { value: THREE.Texture };
      uResolution: { value: THREE.Texture };
      uAspect: { value: number };
      uTexture: { value: THREE.Texture };
      uRadius: { value: number };
      uSmudge: { value: number };
      uDissipation: { value: number };
      uMotionBlur: { value: number };
      uMotionSample: { value: number };
      uMouse: { value: number };
      uPrevMouse: { value: number };
      uVelocity: { value: number };
      uColor: { value: THREE.Color };
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
               uMap: { value: new THREE.Texture() },
               uResolution: { value: new THREE.Vector2(0, 0) },
               uAspect: { value: 0.0 },
               uTexture: { value: new THREE.Texture() },
               uRadius: { value: 0.0 },
               uSmudge: { value: 0.0 },
               uDissipation: { value: 0.0 },
               uMotionBlur: { value: 0.0 },
               uMotionSample: { value: 0 },
               uMouse: { value: new THREE.Vector2(0, 0) },
               uPrevMouse: { value: new THREE.Vector2(0, 0) },
               uVelocity: { value: new THREE.Vector2(0, 0) },
               uColor: { value: new THREE.Color(0xffffff) },
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

   return material as BrushMaterial;
};
