import * as THREE from "three";
import { useEffect, useMemo } from "react";

/** Generate mesh from geometry and material and add to scene */
export const useAddMesh = (
   scene: THREE.Scene,
   geometry: THREE.PlaneGeometry,
   material: THREE.Material
) => {
   const mesh = useMemo(
      () => new THREE.Mesh(geometry, material),
      [geometry, material]
   );

   useEffect(() => {
      scene.add(mesh);
   }, [scene, mesh]);

   useEffect(() => {
      return () => {
         scene.remove(mesh);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, mesh]);

   return mesh;
};
