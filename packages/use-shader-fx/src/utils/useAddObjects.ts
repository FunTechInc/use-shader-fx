import * as THREE from "three";
import { useEffect, useMemo } from "react";

type ObjectTypes = typeof THREE.Mesh | typeof THREE.Points;
type Objects = THREE.Mesh | THREE.Points;


export const useAddObjects = (
   scene: THREE.Scene,
   geometry: THREE.BufferGeometry,
   material: THREE.Material,
   Proto: ObjectTypes
) => {
   const objects = useMemo(() => {
      const Constructor = Proto as unknown as new (
         geometry: THREE.BufferGeometry,
         material: THREE.Material
      ) => Objects;
      console.log(Constructor,'add objects');
      
      return new THREE.Points(geometry, material);
   }, [geometry, material, Proto]);

   useEffect(() => {
      scene.add(objects);
   }, [scene, objects]);

   useEffect(() => {
      return () => {
         scene.remove(objects);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, objects]);

   return objects;
};