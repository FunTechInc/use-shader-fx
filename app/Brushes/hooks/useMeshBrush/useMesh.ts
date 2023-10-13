import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useThree } from "@react-three/fiber";

type TcreateMesh = {
   texture?: THREE.Texture;
   scene: THREE.Scene;
};
export const useMesh = ({ texture, scene }: TcreateMesh) => {
   const size = useThree((state) => state.size);
   const resolution = useMemo(
      () => new THREE.Vector2(size.width, size.height),
      [size]
   );
   const geometry = useMemo(() => new MeshLineGeometry(), []);
   const material = useMemo(
      () =>
         new MeshLineMaterial({
            map: texture,
            useMap: 1,
            lineWidth: 0.1,
            resolution: new THREE.Vector2(0, 0),
            color: "hotpink",
            sizeAttenuation: 0,
         }),
      [texture]
   );
   useEffect(() => {
      material.resolution = resolution;
   }, [resolution, material]);
   const mesh = new THREE.Mesh(geometry, material);
   scene.add(mesh);
   return geometry;
};
