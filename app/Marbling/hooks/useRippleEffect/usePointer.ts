import * as THREE from "three";
import { useEffect, useRef } from "react";

export const usePointer = (
   meshArr: THREE.Mesh[],
   frequency: number,
   max: number
) => {
   const pointer = useRef(new THREE.Vector2(0, 0));
   const prevPointer = useRef(new THREE.Vector2(0, 0));
   const currentWave = useRef(0);

   const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      pointer.current.x = e.clientX - window.innerWidth / 2;
      pointer.current.y = window.innerHeight / 2 - e.clientY;
   };

   /**
    * マウス位置をトラックして、meshを操作する
    */
   const trackPointerPos = () => {
      const distance = pointer.current.distanceTo(prevPointer.current);
      if (frequency < distance) {
         const mesh = meshArr[currentWave.current];
         mesh.visible = true;
         mesh.position.set(pointer.current.x, pointer.current.y, 0);
         mesh.scale.x = mesh.scale.y = 0.2;
         (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5;
         currentWave.current = (currentWave.current + 1) % max;
      }
      prevPointer.current.x = pointer.current.x;
      prevPointer.current.y = pointer.current.y;
   };
   useEffect(() => {
      window.addEventListener("pointermove", handlePointerMove);
      return () => {
         window.removeEventListener("pointermove", handlePointerMove);
      };
   }, []);

   return trackPointerPos;
};
