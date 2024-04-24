import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MaterialProps } from "../../types";

type UseMeshProps = {
   scale: number;
   max: number;
   texture?: THREE.Texture;
   scene: THREE.Scene;
};

export const useMesh = ({
   scale,
   max,
   texture,
   scene,
   onBeforeCompile,
}: UseMeshProps & MaterialProps) => {
   const meshArr = useRef<THREE.Mesh[]>([]);
   const geometry = useMemo(
      () => new THREE.PlaneGeometry(scale, scale),
      [scale]
   );
   const material = useMemo(() => {
      const mat = new THREE.MeshBasicMaterial({
         map: texture,
         transparent: true,
         blending: THREE.AdditiveBlending,
         depthTest: false,
         depthWrite: false,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [texture, onBeforeCompile]);

   useEffect(() => {
      for (let i = 0; i < max; i++) {
         const mesh = new THREE.Mesh(geometry.clone(), material.clone());
         mesh.rotateZ(2 * Math.PI * Math.random());
         mesh.visible = false;
         scene.add(mesh);
         meshArr.current.push(mesh);
      }
   }, [geometry, material, scene, max]);

   useEffect(() => {
      return () => {
         meshArr.current.forEach((mesh) => {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
               mesh.material.forEach((material) => material.dispose());
            } else {
               mesh.material.dispose();
            }
            scene.remove(mesh);
         });
         meshArr.current = [];
      };
   }, [scene]);

   return meshArr.current;
};
