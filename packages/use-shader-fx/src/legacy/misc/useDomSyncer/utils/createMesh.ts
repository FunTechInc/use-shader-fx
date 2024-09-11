import * as THREE from "three";
import { DomSyncerParams } from "../";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";
import { MaterialProps, Size } from "../../../fxs/types";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

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
   onBeforeInit,
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
         ...createMaterialParameters(
            {
               uniforms: {
                  u_texture: { value: texture },
                  u_textureResolution: {
                     value: new THREE.Vector2(0, 0),
                  },
                  u_resolution: { value: new THREE.Vector2(0, 0) },
                  u_borderRadius: {
                     value: params.boderRadius![i]
                        ? params.boderRadius![i]
                        : 0.0,
                  },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
         // Must be transparent.
         transparent: true,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      scene.add(mesh);
   });
};
