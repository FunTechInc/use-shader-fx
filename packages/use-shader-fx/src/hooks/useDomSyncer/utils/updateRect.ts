import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
import { setUniform } from "../../../utils/setUniforms";

export const updateRect = ({
   params,
   size,
   resolutionRef,
   scene,
   isIntersectingRef,
}: {
   params: DomSyncerParams;
   size: Size;
   resolutionRef: React.MutableRefObject<THREE.Vector2>;
   scene: THREE.Scene;
   isIntersectingRef: React.MutableRefObject<boolean[]>;
}) => {
   scene.children.forEach((mesh, i) => {
      const domElement = params.dom![i];
      if (!domElement) {
         throw new Error("DOM is null.");
      }
      if (isIntersectingRef.current[i]) {
         const rect = domElement.getBoundingClientRect();
         mesh.scale.set(rect.width, rect.height, 1.0);
         mesh.position.set(
            rect.left + rect.width * 0.5 - size.width * 0.5,
            -rect.top - rect.height * 0.5 + size.height * 0.5,
            0.0
         );
         if (mesh instanceof THREE.Mesh) {
            const material = mesh.material;
            setUniform(
               material,
               "u_resolution",
               resolutionRef.current.set(rect.width, rect.height)
            );
            setUniform(material, "u_textureResolution", params.resolution![i]);
         }
      }
   });
};
