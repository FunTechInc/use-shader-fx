import { useMemo, useRef } from "react";
import * as THREE from "three";

type TcreateMesh = {
   size: number;
   max: number;
   texture: THREE.Texture;
   scene: THREE.Scene;
};
export const useMesh = ({ size, max, texture, scene }: TcreateMesh) => {
   const meshArr = useRef<THREE.Mesh[]>([]);
   const geometry = useMemo(() => new THREE.PlaneGeometry(size, size), [size]);
   const material = useMemo(
      () =>
         new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
         }),
      [texture]
   );
   for (let i = 0; i < max; i++) {
      const mesh = new THREE.Mesh(geometry.clone(), material.clone());
      mesh.rotateZ(2 * Math.PI * Math.random());
      mesh.visible = false;
      scene.add(mesh);
      meshArr.current.push(mesh);
   }
   return meshArr.current;
};
