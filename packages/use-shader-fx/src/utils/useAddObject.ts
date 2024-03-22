import * as THREE from "three";
import { useEffect, useMemo } from "react";

type Object3DConstructor<T, M extends THREE.Material> = new (
   geometry: THREE.BufferGeometry,
   material: M
) => T;

/**
 * Add geometry and material to Object3D and add them to scene.
 */
export const useAddObject = <
   T extends THREE.Object3D,
   M extends THREE.Material
>(
   scene: THREE.Scene | false,
   geometry: THREE.BufferGeometry,
   material: M,
   Proto: Object3DConstructor<T, M>
) => {
   const object3D = useMemo(() => {
      return new Proto(geometry, material);
   }, [geometry, material, Proto]);

   useEffect(() => {
      scene && scene.add(object3D);
   }, [scene, object3D]);

   useEffect(() => {
      return () => {
         scene && scene.remove(object3D);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, object3D]);

   return object3D;
};
