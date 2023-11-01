import * as THREE from "three";
import { useEffect, useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/splat.frag";
import { useResolution } from "../../utils/useResolution";

type TUniforms = {
   uTarget: { value: THREE.Texture };
   aspectRatio: { value: number };
   color: { value: THREE.Vector3 };
   point: { value: THREE.Vector2 };
   radius: { value: number };
   texelSize: { value: THREE.Vector2 };
};

export class SplatMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useSplateMaterial = () => {
   const splatMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTarget: { value: new THREE.Texture() },
               aspectRatio: { value: 0 },
               color: { value: new THREE.Vector3() },
               point: { value: new THREE.Vector2() },
               radius: { value: 0.0 },
               texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   const resolution = useResolution(true);
   useEffect(() => {
      splatMaterial.uniforms.aspectRatio.value = resolution.x / resolution.y;
   }, [resolution, splatMaterial]);

   return splatMaterial as SplatMaterial;
};
