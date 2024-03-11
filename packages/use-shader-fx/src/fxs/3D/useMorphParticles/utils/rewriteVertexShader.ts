import * as THREE from "three";
import { ISDEV } from "../../../../libs/constants";

export const rewriteVertexShader = (
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
         ? "#usf <morphPositions>"
         : "#usf <morphUvs>";
   const vTransitionRewriteKey =
      targetAttibute === "position"
         ? "#usf <morphPositionTransition>"
         : "#usf <morphUvTransition>";
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
