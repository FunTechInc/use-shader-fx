import * as THREE from "three";
import { useCallback, useEffect, useRef } from "react";

export const usePointer = (
   meshArr: THREE.Mesh[],
   frequency: number,
   max: number
) => {
   const pointer = useRef(new THREE.Vector2(0, 0));
   const prevPointer = useRef(new THREE.Vector2(0, 0));
   const currentWave = useRef(0);

   //pointer event
   const handlePointerMove = useCallback((e: PointerEvent) => {
      e.preventDefault();
      pointer.current.x = e.clientX - window.innerWidth / 2;
      pointer.current.y = window.innerHeight / 2 - e.clientY;
   }, []);
   useEffect(() => {
      window.addEventListener("pointermove", handlePointerMove);
      return () => {
         window.removeEventListener("pointermove", handlePointerMove);
      };
   }, [handlePointerMove]);

   //trach mouse pos , and controll meshArr
   const trackPointerPos = useCallback(() => {
      const distance = pointer.current.distanceTo(prevPointer.current);
      if (frequency < distance) {
         const mesh = meshArr[currentWave.current];
         mesh.visible = true;
         mesh.position.set(pointer.current.x, pointer.current.y, 0);
         mesh.scale.x = mesh.scale.y = 0.2;
         (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5;
         currentWave.current = (currentWave.current + 1) % max;
      }
      meshArr.forEach((mesh) => {
         if (mesh.visible) {
            const material = mesh.material as THREE.MeshBasicMaterial;
            mesh.rotation.z += 0.02;
            material.opacity *= 0.97;
            mesh.scale.x = 0.98 * mesh.scale.x + 0.17;
            mesh.scale.y = mesh.scale.x;
            if (material.opacity < 0.002) mesh.visible = false;
         }
      });
      prevPointer.current.x = pointer.current.x;
      prevPointer.current.y = pointer.current.y;
   }, [frequency, meshArr, max]);

   return trackPointerPos;
};
