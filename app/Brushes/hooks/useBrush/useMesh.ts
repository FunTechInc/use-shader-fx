import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useCallback, useEffect, useMemo } from "react";
import { useWindowResizeObserver } from "@funtech-inc/spice";

type TcreateMesh = {
   texture?: THREE.Texture;
   scene: THREE.Scene;
   radius: number;
   alpha: number;
   smudge: number;
   dissipation: number;
   magnification: number;
   motionBlur: number;
   motionSample: number;
};

type TUniforms = {
   tMap: { value: THREE.Texture | null };
   tTexture: { value: THREE.Texture | null };
   uResolution: { value: THREE.Vector2 };
   uRadius: { value: number };
   uAlpha: { value: number };
   uSmudge: { value: number };
   uDissipation: { value: number };
   uAspect: { value: number };
   uMouse: { value: THREE.Vector2 };
   uPrevMouse: { value: THREE.Vector2 };
   uVelocity: { value: THREE.Vector2 };
   uMagnification: { value: number };
   uMotionBlur: { value: number };
   uMotionSample: { value: number };
};

// Extend THREE.ShaderMaterial to strictly type the uniforms
export class FlowmapShaderMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useMesh = ({
   texture,
   scene,
   radius,
   alpha,
   smudge,
   dissipation,
   magnification,
   motionBlur,
   motionSample,
}: TcreateMesh) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               tMap: {
                  value: null,
               },
               tTexture: { value: texture },
               uResolution: { value: new THREE.Vector2(0, 0) },
               uAspect: { value: 1 },
               uRadius: { value: radius },
               uAlpha: { value: alpha },
               uSmudge: { value: smudge },
               uDissipation: { value: dissipation },
               uMouse: { value: new THREE.Vector2(0, 0) },
               uPrevMouse: { value: new THREE.Vector2(0, 0) },
               uVelocity: { value: new THREE.Vector2(0, 0) },
               uMagnification: { value: magnification },
               uMotionBlur: { value: motionBlur },
               uMotionSample: { value: motionSample },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      [
         radius,
         alpha,
         dissipation,
         magnification,
         smudge,
         texture,
         motionBlur,
         motionSample,
      ]
   );
   const handleResize = useCallback(
      (width: number, height: number) => {
         material.uniforms.uAspect.value = width / height;
         material.uniforms.uResolution.value = new THREE.Vector2(width, height);
      },
      [material]
   );
   useEffect(() => {
      handleResize(window.innerWidth, window.innerHeight);
   }, [handleResize]);
   useWindowResizeObserver({
      callback: ({ winW, winH }) => {
         handleResize(winW, winH);
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
