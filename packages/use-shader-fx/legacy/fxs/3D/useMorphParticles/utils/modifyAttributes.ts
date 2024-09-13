import * as THREE from "three";

/**
 * Calculate the maximum length of attribute (position and uv) to match the length of all lists. Randomly map missing attributes when matching to maximum length
 * */
export const modifyAttributes = (
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
