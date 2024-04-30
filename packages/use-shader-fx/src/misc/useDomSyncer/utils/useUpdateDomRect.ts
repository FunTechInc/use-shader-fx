import * as THREE from "three";
import { DomSyncerParams } from "..";
import { Size } from "@react-three/fiber";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { DomSyncerMaterial } from "./createMesh";
import { useCallback, useRef } from "react";

type UpdateDomRect = ({
   params,
   customParams,
   size,
   resolutionRef,
   scene,
   isIntersectingRef,
}: {
   params: DomSyncerParams;
   customParams?: CustomParams;
   size: Size;
   resolutionRef: React.MutableRefObject<THREE.Vector2>;
   scene: THREE.Scene;
   isIntersectingRef: React.MutableRefObject<boolean[]>;
}) => void;

type UseUpdateDomRectReturn = [DOMRect[], UpdateDomRect];

export const useUpdateDomRect = (): UseUpdateDomRectReturn => {
   const domRects = useRef<DOMRect[]>([]);

   const updateDomRects: UpdateDomRect = useCallback(
      ({
         params,
         customParams,
         size,
         resolutionRef,
         scene,
         isIntersectingRef,
      }) => {
         // Initialize domRects if the number of children in the scene is different from the number of DOMRect
         if (scene.children.length !== domRects.current!.length) {
            domRects.current = new Array(scene.children.length);
         }

         scene.children.forEach((mesh, i) => {
            const domElement = params.dom![i];
            if (!domElement) {
               return;
            }

            // DOMRect is updated even outside the intersection
            const rect = domElement.getBoundingClientRect();
            domRects.current[i] = rect;

            // Intersection cannot be determined accurately depending on the mobile navigation bar, so it seems better to update it constantly
            mesh.scale.set(rect.width, rect.height, 1.0);
            mesh.position.set(
               rect.left + rect.width * 0.5 - size.width * 0.5,
               -rect.top - rect.height * 0.5 + size.height * 0.5,
               0.0
            );

            if (isIntersectingRef.current[i]) {
               if (params.rotation![i]) {
                  mesh.rotation.copy(params.rotation![i]);
               }

               if (mesh instanceof THREE.Mesh) {
                  const material: DomSyncerMaterial = mesh.material;
                  const updateValue = setUniform(material);
                  const updateCustomValue = setCustomUniform(material);
                  updateValue("u_texture", params.texture![i]);
                  updateValue("u_textureResolution", [
                     params.texture![i]?.source?.data?.width || 0,
                     params.texture![i]?.source?.data?.height || 0,
                  ]);
                  updateValue(
                     "u_resolution",
                     resolutionRef.current.set(rect.width, rect.height)
                  );
                  updateValue(
                     "u_borderRadius",
                     params.boderRadius![i] ? params.boderRadius![i] : 0.0
                  );
                  updateCustomValue(customParams);
               }
            }
         });
      },
      []
   );

   return [domRects.current, updateDomRects];
};
