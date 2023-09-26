import * as THREE from "three";
import { useEffect, useRef } from "react";

import { FlowmapShaderMaterial } from "./useMesh";

export const usePointer = () => {
   const lastTime = useRef<number>(0);
   const isVelocityUpdate = useRef(false);
   const pointer = useRef(new THREE.Vector2(0, 0));
   const velocity = useRef(new THREE.Vector2(0, 0));
   const lastMouse = useRef(new THREE.Vector2(0, 0));

   const handlePointerMove = (e: PointerEvent) => {
      const posX = e.clientX;
      const posY = e.clientY;

      const normalizeX = posX / window.innerWidth;
      const normalizeY = 1 - posY / window.innerHeight;

      pointer.current = new THREE.Vector2(normalizeX, normalizeY);

      // Calculate velocity
      if (!lastTime.current) {
         // First frame
         lastTime.current = performance.now();
         lastMouse.current.set(posX, posY);
      }

      const deltaX = posX - lastMouse.current.x;
      const deltaY = posY - lastMouse.current.y;
      lastMouse.current.set(posX, posY);

      let time = performance.now();
      // Avoid dividing by 0
      let delta = Math.max(10.4, time - lastTime.current);
      lastTime.current = time;
      velocity.current.x = deltaX / delta;
      velocity.current.y = deltaY / delta;
      // Flag update to prevent hanging velocity values when not moving
      isVelocityUpdate.current = true;
   };

   useEffect(() => {
      window.addEventListener("pointermove", handlePointerMove);
      return () => {
         window.removeEventListener("pointermove", handlePointerMove);
      };
   }, []);

   const updateVelocity = (material: FlowmapShaderMaterial) => {
      if (!isVelocityUpdate.current) {
         material.uniforms.uMouse.value.set(-1, -1);
         velocity.current.set(0, 0);
      }
      isVelocityUpdate.current = false;
      material.uniforms.uMouse.value = pointer.current;
      material.uniforms.uVelocity.value.lerp(
         velocity.current,
         velocity.current.length() ? 0.15 : 0.1
      );
   };

   return updateVelocity;
};
