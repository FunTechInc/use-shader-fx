import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useResolution } from "../../../utils/useResolution";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../../utils/useAddMesh";
import { setUniform } from "../../../utils/setUniforms";
import { Size } from "@react-three/fiber";

export class FxTextureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uTextureResolution: { value: THREE.Vector2 };
      uTexture: { value: THREE.Texture };
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
               uResolution: { value: new THREE.Vector2() },
               uTextureResolution: { value: new THREE.Vector2() },
               uTexture: { value: new THREE.Texture() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as FxTextureMaterial;

   const resolution = useResolution(size, dpr);
   useEffect(() => {
      setUniform(material, "uResolution", resolution.clone());
   }, [resolution, material]);

   useAddMesh(scene, geometry, material);

   return material;
};
