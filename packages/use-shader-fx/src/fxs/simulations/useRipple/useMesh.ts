import * as THREE from "three";
import { useEffect, useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { MaterialProps } from "../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../libs/constants";
import { setOnBeforeCompile } from "../../../utils/setOnBeforeCompile";

type UseMeshProps = {
   scale: number;
   max: number;
   scene: THREE.Scene;
   texture?: THREE.Texture;
};

export const useMesh = ({
   scale,
   max,
   texture,
   scene,
   uniforms,
   onBeforeCompile,
}: UseMeshProps & MaterialProps) => {
   const geometry = useMemo(
      () => new THREE.PlaneGeometry(scale, scale),
      [scale]
   );

   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uOpacity: { value: 0.0 },
            uMap: { value: texture || DEFAULT_TEXTURE },
            ...uniforms,
         },
         blending: THREE.AdditiveBlending,
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
         // Must be transparent.
         transparent: true,
      });
      return mat;
   }, [texture, uniforms]);

   const meshArr = useMemo(() => {
      const temp = [];
      for (let i = 0; i < max; i++) {
         const clonedMat = material.clone();

         clonedMat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

         const mesh = new THREE.Mesh(geometry.clone(), clonedMat);
         mesh.rotateZ(2 * Math.PI * Math.random());
         mesh.visible = false;
         scene.add(mesh);
         temp.push(mesh);
      }
      return temp;
   }, [onBeforeCompile, geometry, material, scene, max]);

   useEffect(() => {
      return () => {
         meshArr.forEach((mesh) => {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
               mesh.material.forEach((material) => material.dispose());
            } else {
               mesh.material.dispose();
            }
            scene.remove(mesh);
         });
      };
   }, [scene, meshArr]);

   return meshArr;
};
