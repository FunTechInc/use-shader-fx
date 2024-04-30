import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";
import { MaterialProps } from "../../../fxs/types";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";

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
   scene,
   uniforms,
   onBeforeCompile,
}: {
   params: DomSyncerParams;
   size: Size;
   scene: THREE.Scene;
} & MaterialProps) => {
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
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            u_texture: { value: texture },
            u_textureResolution: {
               value: new THREE.Vector2(0, 0),
            },
            u_resolution: { value: new THREE.Vector2(0, 0) },
            u_borderRadius: {
               value: params.boderRadius![i] ? params.boderRadius![i] : 0.0,
            },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
         // Must be transparent.
         transparent: true,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      scene.add(mesh);
   });
};
