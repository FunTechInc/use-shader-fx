import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useResolution } from "../../../utils/useResolution";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { setUniform } from "../../../utils/setUniforms";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";

export class FxTextureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uTextureResolution: { value: THREE.Vector2 };
      uTexture0: { value: THREE.Texture };
      uTexture1: { value: THREE.Texture };
      padding: { value: number };
      uMap: { value: THREE.Texture };
      edgeIntensity: { value: number };
      mapIntensity: { value: number };
      epicenter: { value: THREE.Vector2 };
      progress: { value: number };
      dirX: { value: number };
      dirY: { value: number };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
}) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uResolution: { value: new THREE.Vector2() },
               uTextureResolution: { value: new THREE.Vector2() },
               uTexture0: { value: new THREE.Texture() },
               uTexture1: { value: new THREE.Texture() },
               padding: { value: 0.0 },
               uMap: { value: new THREE.Texture() },
               edgeIntensity: { value: 0.0 },
               mapIntensity: { value: 0.0 },
               epicenter: { value: new THREE.Vector2(0.0, 0.0) },
               progress: { value: 0.0 },
               dirX: { value: 0.0 },
               dirY: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as FxTextureMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material, "uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
