import * as THREE from "three";
import { useEffect, useMemo } from "react";

type ObjectTypes = typeof THREE.Mesh | typeof THREE.Points;
type Object3D = THREE.Mesh | THREE.Points;

/**
 * Object3Dにgeometryとmaterialを追加してsceneに追加する
 */
export const useAddObject = (
   scene: THREE.Scene,
   geometry: THREE.BufferGeometry,
   material: THREE.Material,
   Proto: ObjectTypes
) => {
   const object3D = useMemo(() => {
      const Constructor = Proto as unknown as new (
         geometry: THREE.BufferGeometry,
         material: THREE.Material
      ) => Object3D;
      return new Constructor(geometry, material);
   }, [geometry, material, Proto]);

   useEffect(() => {
      scene.add(object3D);
   }, [scene, object3D]);

   useEffect(() => {
      return () => {
         scene.remove(object3D);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, object3D]);

   return object3D;
};
