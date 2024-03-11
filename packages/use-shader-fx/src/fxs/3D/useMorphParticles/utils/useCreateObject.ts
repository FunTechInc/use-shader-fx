import * as THREE from "three";
import { useMemo } from "react";
import { useAddObject } from "../../../../utils/useAddObject";

type UseCreateObjectProps = {
   scene: THREE.Scene | false;
   geometry: THREE.BufferGeometry;
   material: THREE.ShaderMaterial;
};

export const useCreateObject = ({
   scene,
   geometry,
   material,
}: UseCreateObjectProps) => {
   const points = useAddObject(scene, geometry, material, THREE.Points);

   // Generate a mesh for pointer
   const interactiveMesh = useAddObject(
      scene,
      useMemo(() => geometry.clone(), [geometry]),
      useMemo(() => material.clone(), [material]),
      THREE.Mesh
   );
   interactiveMesh.visible = false;

   return {
      points,
      interactiveMesh,
   };
};
