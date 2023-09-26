import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useCallback, useEffect, useMemo } from "react";
import { useWindowResizeObserver } from "@funtech-inc/spice";

type TcreateMesh = {
   scene: THREE.Scene;
   falloff: number;
   alpha: number;
   dissipation: number;
};

type TUniforms = {
   tMap: { value: THREE.Texture | null };
   uFalloff: { value: number };
   uAlpha: { value: number };
   uDissipation: { value: number };
   uAspect: { value: number };
   uMouse: { value: THREE.Vector2 };
   uVelocity: { value: THREE.Vector2 };
};

// Extend THREE.ShaderMaterial to strictly type the uniforms
export class FlowmapShaderMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useMesh = ({
   scene,
   falloff,
   alpha,
   dissipation,
}: TcreateMesh) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               tMap: {
                  value: null,
               },
               uFalloff: { value: falloff * 0.5 },
               uAlpha: { value: alpha },
               uDissipation: { value: dissipation },
               uAspect: { value: 1 },
               uMouse: { value: new THREE.Vector2(0, 0) },
               uVelocity: { value: new THREE.Vector2(0, 0) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      [falloff, alpha, dissipation]
   );
   const handleResize = useCallback(() => {
      material.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
   }, [material]);
   useEffect(() => {
      handleResize();
   }, [handleResize]);
   useWindowResizeObserver({
      callback: () => {
         handleResize();
      },
      debounce: 100,
      dependencies: [handleResize],
   });
   const mesh = useMemo(
      () => new THREE.Mesh(geometry, material),
      [geometry, material]
   );
   scene.add(mesh);
   return material as FlowmapShaderMaterial;
};
