import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useAddObject } from "../../../../utils/useAddObject";
import getWobble from "../../../../libs/shaders//getWobble.glsl";

type UseCreateObjectProps = {
   scene: THREE.Scene | false;
   geometry: THREE.BufferGeometry;
   material: THREE.ShaderMaterial;
   positions?: Float32Array[];
};

const createMorphTransitionFunction = (length: number) => {
   if (length) {
      return `
			float scaledProgress = uMorphProgress * ${length}.;
			int baseIndex = int(floor(scaledProgress));		
			baseIndex = clamp(baseIndex, 0, ${length});		
			float progress = fract(scaledProgress);
			int nextIndex = baseIndex + 1;
			newPosition = mix(attibutesList[baseIndex], attibutesList[nextIndex], progress);
		`;
   }
};

export const useCreateObject = ({
   scene,
   geometry,
   material,
   positions,
}: UseCreateObjectProps) => {
   const modifiedPositions = useMemo(() => {
      let mergedPositions: Float32Array[] = [];
      if (positions && positions.length > 0) {
         if (geometry?.attributes?.position?.array) {
            mergedPositions = [
               geometry.attributes.position.array as Float32Array,
               ...positions,
            ];
         } else {
            mergedPositions = positions;
         }

         // 配列の中身が一番多いものの長さを取得して、それに合わせて他の配列を伸ばす
         const maxLength = Math.max(
            ...mergedPositions.map((arr) => arr.length)
         );

         mergedPositions.forEach((arr, i) => {
            if (arr.length < maxLength) {
               const diff = (maxLength - arr.length) / 3;
               const addArray = [];
               const oldArray = Array.from(arr);
               for (let i = 0; i < diff; i++) {
                  const randomIndex =
                     Math.floor((arr.length / 3) * Math.random()) * 3;
                  addArray.push(
                     oldArray[randomIndex + 0],
                     oldArray[randomIndex + 1],
                     oldArray[randomIndex + 2]
                  );
               }
               mergedPositions[i] = new Float32Array([
                  ...oldArray,
                  ...addArray,
               ]);
            }
         });
      }
      return mergedPositions;
   }, [positions, geometry]);

   useEffect(() => {
      if (!geometry || !material) {
         return;
      }

      geometry.setIndex(null);
      // particleにはnormalはいらない
      geometry.deleteAttribute("normal");

      // シェーダーの書き換え
      let vertexShader = material.vertexShader;
      if (!vertexShader) {
         console.log("baseVertexShader is not found");
         return;
      }

      if (positions && positions.length > 0) {
         // 初期化時のpositionを削除して正規化後のpositionを追加
         geometry.deleteAttribute("position");
         geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(modifiedPositions[0], 3)
         );

         // pointsのgeometryにattibuteとしてmorphTargetsを追加
         let stringToAddToMorphAttibutes = "";
         let stringToAddToMortAttibutesList = "";

         modifiedPositions.forEach((target, index) => {
            geometry.setAttribute(
               `morphTarget${index}`,
               new THREE.BufferAttribute(target, 3)
            );
            // vertexShaderに書き込むattributeを追加
            stringToAddToMorphAttibutes += `attribute vec3 morphTarget${index};\n`;
            if (index === 0) {
               stringToAddToMortAttibutesList += `morphTarget${index}`;
            } else {
               stringToAddToMortAttibutesList += `,morphTarget${index}`;
            }
         });

         // vertexShaderに追加するattributeを追加
         vertexShader = vertexShader.replace(
            `// #usf <morphPositions>`,
            stringToAddToMorphAttibutes
         );
         vertexShader = vertexShader.replace(
            `// #usf <morphTransition>`,
            `vec3 attibutesList[${
               modifiedPositions.length
            }] = vec3[](${stringToAddToMortAttibutesList});
				${createMorphTransitionFunction(modifiedPositions.length - 1)}
				`
         );
      } else {
         vertexShader = vertexShader.replace(`// #usf <morphPositions>`, "");
         vertexShader = vertexShader.replace(`// #usf <morphTransition>`, "");
         if (!geometry?.attributes?.position?.array) {
            console.error("geometry.attributes.position.array is not found");
         }
      }
      // wobble
      vertexShader = vertexShader.replace(
         `// #usf <getWobble>`,
         `${getWobble}`
      );
      material.vertexShader = vertexShader;
   }, [positions, geometry, material, modifiedPositions]);

   const object = useAddObject(scene, geometry, material, THREE.Points);

   return { object, positions: modifiedPositions };
};
