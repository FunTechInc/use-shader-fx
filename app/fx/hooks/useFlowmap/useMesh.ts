import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { useAddMesh } from "../utils/useAddMesh";
import { useResolution } from "../utils/useResolution";
import { setUniform } from "../utils/setUniforms";

type TcreateMesh = {
   scene: THREE.Scene;
   radius: number;
   alpha: number;
   dissipation: number;
   magnification: number;
};

type TUniforms = {
   tMap: { value: THREE.Texture | null };
   uResolution: { value: THREE.Vector2 };
   uRadius: { value: number };
   uAlpha: { value: number };
   uDissipation: { value: number };
   uAspect: { value: number };
   uMouse: { value: THREE.Vector2 };
   uVelocity: { value: THREE.Vector2 };
   uMagnification: { value: number };
};

// Extend THREE.ShaderMaterial to strictly type the uniforms
export class FlowmapShaderMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useMesh = ({
   scene,
   radius,
   alpha,
   dissipation,
   magnification,
}: TcreateMesh) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               tMap: {
                  value: null,
               },
               uResolution: { value: new THREE.Vector2(0, 0) },
               uAspect: { value: 1 },
               uRadius: { value: radius },
               uAlpha: { value: alpha },
               uDissipation: { value: dissipation },
               uMouse: { value: new THREE.Vector2(0, 0) },
               uVelocity: { value: new THREE.Vector2(0, 0) },
               uMagnification: { value: magnification },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      [radius, alpha, dissipation, magnification]
   );

   const resolution = useResolution();
   setUniform(material, "uAspect", resolution.width / resolution.height);
   setUniform(material, "uResolution", resolution.clone());

   useAddMesh(scene, geometry, material);

   return material as FlowmapShaderMaterial;
};
