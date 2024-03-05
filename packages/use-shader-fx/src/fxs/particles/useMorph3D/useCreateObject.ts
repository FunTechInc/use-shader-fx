import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useAddObject } from "../../../utils/useAddObject";

type UseMorphVerticesProps = {
   scene: THREE.Scene;
   geometry: THREE.BufferGeometry;
   material: THREE.ShaderMaterial | THREE.RawShaderMaterial;
   shaderPath: string;
   positions?: Float32Array[];
   Object: typeof THREE.Mesh | typeof THREE.Points;
};

const createMorphTransitionFunction = (length: number) => {
   /*===============================================
	TODO
	- uMorphProgress => usf_morphProgress
	===============================================*/
   if (length) {
      return `
			float scaledProgress = uMorphProgress * ${length}.;
			int baseIndex = int(floor(scaledProgress));		
			baseIndex = clamp(baseIndex, 0, ${length});		
			float progress = fract(scaledProgress);
			int nextIndex = baseIndex + 1;
			vec3 usf_newPosition = mix(attibutesList[baseIndex], attibutesList[nextIndex], progress);
		`;
   } else {
      return `
			vec3 usf_newPosition = position;
		`;
   }
};

function getObjectProperty(obj: any, path: string) {
   const parts = path.split(".");
   let currentPart: any = obj;
   for (let part of parts) {
      if (currentPart[part] === undefined) {
         return;
      }
      currentPart = currentPart[part];
   }
   return currentPart as string;
}

function setObjectProperty(obj: any, path: string, value: any): void {
   const parts = path.split(".");
   let currentPart = obj;
   for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (currentPart[part] === undefined) {
         currentPart[part] = {};
      }
      currentPart = currentPart[part];
   }
   currentPart[parts[parts.length - 1]] = value;
}

export const useCreateObject = ({
   scene,
   geometry,
   material,
   shaderPath,
   positions,
   Object,
}: UseMorphVerticesProps) => {
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

      // パフォーマンス
      geometry.setIndex(null);
      geometry.deleteAttribute("normal");

      let baseVertexShader = getObjectProperty(material, shaderPath);

      if (!baseVertexShader) {
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
         baseVertexShader = baseVertexShader.replace(
            `// #usf <morphPositions>`,
            stringToAddToMorphAttibutes
         );
         baseVertexShader = baseVertexShader.replace(
            `// #usf <morphTransition>`,
            `vec3 attibutesList[${
               modifiedPositions.length
            }] = vec3[](${stringToAddToMortAttibutesList});
				${createMorphTransitionFunction(modifiedPositions.length - 1)}
				`
         );
      } else {
         baseVertexShader = baseVertexShader.replace(
            `// #usf <morphPositions>`,
            ""
         );
         baseVertexShader = baseVertexShader.replace(
            `// #usf <morphTransition>`,
            `${createMorphTransitionFunction(0)}`
         );
         if (!geometry?.attributes?.position?.array) {
            console.error("geometry.attributes.position.array is not found");
         }
      }

      //TODO * wobble
      setObjectProperty(material, shaderPath, baseVertexShader);
      material.needsUpdate = true;
      // TODO * カスタムシェーダー      // material.update();

      // console.log(material.__csm.vertexShader);
   }, [positions, geometry, material, modifiedPositions, shaderPath]);

   const object = useAddObject(scene, geometry, material, Object);

   return { object, positions: modifiedPositions };
};
