import * as THREE from "three";
import { useEffect, useMemo } from "react";

/** Generate mesh from geometry and material and add to scene */
export const useAddMesh = (
   scene: THREE.Scene,
   geometry: THREE.BufferGeometry,
   material: THREE.Material
) => {
   const mesh = useMemo(() => {
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
   }, [geometry, material, scene]);

   useEffect(() => {
      return () => {
         scene.remove(mesh);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, mesh]);

   return mesh;
};
