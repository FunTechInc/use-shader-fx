import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";

export const createMesh = ({
   params,
   size,
   resolutionRef,
   scene,
}: {
   params: DomSyncerParams;
   size: Size;
   resolutionRef: React.MutableRefObject<THREE.Vector2>;
   scene: THREE.Scene;
}) => {
   // clean up
   if (scene.children.length > 0) {
      scene.children.forEach((child) => {
         if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
         }
      });
      scene.remove(...scene.children);
   }

   // add mesh to scene
   params.texture.forEach((texture, i) => {
      // If texture resolution is null, use size
      const textureResolution = params.resolution![i]
         ? params.resolution![i]
         : new THREE.Vector2(size.width, size.height);

      const mesh = new THREE.Mesh(
         new THREE.PlaneGeometry(1, 1),
         new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            uniforms: {
               u_texture: { value: texture },
               u_textureResolution: { value: textureResolution },
               u_resolution: { value: resolutionRef.current },
            },
         })
      );

      scene.add(mesh);
   });
};
