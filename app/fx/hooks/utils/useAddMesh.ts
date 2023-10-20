import * as THREE from "three";
import { useEffect, useMemo } from "react";

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
   return mesh;
};
