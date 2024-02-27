import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";

export class DomSyncerMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_textureResolution: { value: THREE.Vector2 };
      u_resolution: { value: THREE.Vector2 };
      u_borderRadius: { value: number };
   };
}

export const createMesh = ({
   params,
   size,
   scene,
}: {
   params: DomSyncerParams;
   size: Size;
   scene: THREE.Scene;
}) => {
   if (scene.children.length > 0) {
      scene.children.forEach((child) => {
         if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
         }
      });
      scene.remove(...scene.children);
   }

   params.texture!.forEach((texture, i) => {
      const mesh = new THREE.Mesh(
         new THREE.PlaneGeometry(1, 1),
         new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            uniforms: {
               u_texture: { value: texture },
               u_textureResolution: {
                  value: new THREE.Vector2(0, 0),
               },
               u_resolution: { value: new THREE.Vector2(0, 0) },
               u_borderRadius: {
                  value: params.boderRadius![i] ? params.boderRadius![i] : 0.0,
               },
            },
         })
      );
      scene.add(mesh);
   });
};
