import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useAddObject } from "../../../../utils/useAddObject";
import { ISDEV } from "../../../../libs/constants";
import getWobble from "../../../../libs/shaders//getWobble.glsl";

type UseCreateObjectProps = {
   scene: THREE.Scene | false;
   geometry: THREE.BufferGeometry;
   material: THREE.ShaderMaterial;
   positions?: Float32Array[];
   uvs?: Float32Array[];
};

/**
 * Calculate the maximum length of attribute (position and uv) to match the length of all lists. Randomly map missing attributes when matching to maximum length
 * */
const modifyAttributes = (
   attribute: Float32Array[] | undefined,
   targetGeometry: THREE.BufferGeometry,
   targetAttibute: "position" | "uv",
   itemSize: number
) => {
   let modifiedAttribute: Float32Array[] = [];
   if (attribute && attribute.length > 0) {
      if (targetGeometry?.attributes[targetAttibute]?.array) {
         modifiedAttribute = [
            targetGeometry.attributes[targetAttibute].array as Float32Array,
            ...attribute,
         ];
      } else {
         modifiedAttribute = attribute;
      }

      const maxLength = Math.max(...modifiedAttribute.map((arr) => arr.length));

      modifiedAttribute.forEach((arr, i) => {
         if (arr.length < maxLength) {
            const diff = (maxLength - arr.length) / itemSize;
            const addArray = [];
            const oldArray = Array.from(arr);
            for (let i = 0; i < diff; i++) {
               const randomIndex =
                  Math.floor((arr.length / itemSize) * Math.random()) *
                  itemSize;
               for (let j = 0; j < itemSize; j++) {
                  addArray.push(oldArray[randomIndex + j]);
               }
            }
            modifiedAttribute[i] = new Float32Array([...oldArray, ...addArray]);
         }
      });
   }
   return modifiedAttribute;
};

const rewriteVertexShader = (
   modifeidAttributes: Float32Array[],
   targetGeometry: THREE.BufferGeometry,
   targetAttibute: "position" | "uv",
   vertexShader: string,
   itemSize: number
) => {
   const vTargetName =
      targetAttibute === "position" ? "positionTarget" : "uvTarget";
   const vAttributeRewriteKey =
      targetAttibute === "position"
         ? "// #usf <morphPositions>"
         : "// #usf <morphUvs>";
   const vTransitionRewriteKey =
      targetAttibute === "position"
         ? "// #usf <morphPositionTransition>"
         : "// #usf <morphUvTransition>";
   const vListName =
      targetAttibute === "position" ? "positionsList" : "uvsList";
   const vMorphTransition =
      targetAttibute === "position"
         ? `
				float scaledProgress = uMorphProgress * ${modifeidAttributes.length - 1}.;
				int baseIndex = int(floor(scaledProgress));		
				baseIndex = clamp(baseIndex, 0, ${modifeidAttributes.length - 1});		
				float progress = fract(scaledProgress);
				int nextIndex = baseIndex + 1;
				newPosition = mix(positionsList[baseIndex], positionsList[nextIndex], progress);
			`
         : "newUv = mix(uvsList[baseIndex], uvsList[nextIndex], progress);";

   if (modifeidAttributes.length > 0) {
      // Delete the position at initialization and add the position after normalization
      targetGeometry.deleteAttribute(targetAttibute);
      targetGeometry.setAttribute(
         targetAttibute,
         new THREE.BufferAttribute(modifeidAttributes[0], itemSize)
      );

      let stringToAddToMorphAttibutes = "";
      let stringToAddToMorphAttibutesList = "";

      modifeidAttributes.forEach((target, index) => {
         targetGeometry.setAttribute(
            `${vTargetName}${index}`,
            new THREE.BufferAttribute(target, itemSize)
         );
         stringToAddToMorphAttibutes += `attribute vec${itemSize} ${vTargetName}${index};\n`;
         if (index === 0) {
            stringToAddToMorphAttibutesList += `${vTargetName}${index}`;
         } else {
            stringToAddToMorphAttibutesList += `,${vTargetName}${index}`;
         }
      });

      vertexShader = vertexShader.replace(
         `${vAttributeRewriteKey}`,
         stringToAddToMorphAttibutes
      );
      vertexShader = vertexShader.replace(
         `${vTransitionRewriteKey}`,
         `vec${itemSize} ${vListName}[${modifeidAttributes.length}] = vec${itemSize}[](${stringToAddToMorphAttibutesList});
				${vMorphTransition}
			`
      );
   } else {
      vertexShader = vertexShader.replace(`${vAttributeRewriteKey}`, "");
      vertexShader = vertexShader.replace(`${vTransitionRewriteKey}`, "");
      if (!targetGeometry?.attributes[targetAttibute]?.array) {
         ISDEV &&
            console.error(
               `use-shader-fx:geometry.attributes.${targetAttibute}.array is not found`
            );
      }
   }

   return vertexShader;
};

export const useCreateObject = ({
   scene,
   geometry,
   material,
   positions,
   uvs,
}: UseCreateObjectProps) => {
   const modifiedPositions = useMemo(
      () => modifyAttributes(positions, geometry, "position", 3),
      [positions, geometry]
   );

   const modifiedUvs = useMemo(
      () => modifyAttributes(uvs, geometry, "uv", 2),
      [uvs, geometry]
   );

   useEffect(() => {
      if (!geometry || !material) {
         return;
      }

      geometry.setIndex(null);
      // Since it is a particle, normal is not necessary
      geometry.deleteAttribute("normal");

      if (modifiedPositions.length !== modifiedUvs.length) {
         ISDEV &&
            console.log("use-shader-fx:positions and uvs are not matched");
      }

      let vertexShader = material.vertexShader;
      if (!vertexShader) {
         ISDEV && console.error("use-shader-fx:baseVertexShader is not found");
         return;
      }

      const rewritedShader = rewriteVertexShader(
         modifiedUvs,
         geometry,
         "uv",
         rewriteVertexShader(
            modifiedPositions,
            geometry,
            "position",
            vertexShader,
            3
         ),
         2
      ).replace(`// #usf <getWobble>`, `${getWobble}`);

      material.vertexShader = rewritedShader;
   }, [positions, geometry, material, modifiedPositions, modifiedUvs, uvs]);

   const object = useAddObject(scene, geometry, material, THREE.Points);

   // Generate a mesh for pointer
   const interactiveMesh = useAddObject(
      scene,
      useMemo(() => geometry.clone(), [geometry]),
      useMemo(() => material.clone(), [material]),
      THREE.Mesh
   );
   interactiveMesh.visible = false;

   return {
      object,
      interactiveMesh,
      positions: modifiedPositions,
      uvs: modifiedUvs,
   };
};
