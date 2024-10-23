import * as THREE from "three";
import { warn } from "../utils/warn";
import { THREE_TYPES } from "../libs/constants";

export type Uniforms = { [uniform: string]: THREE.IUniform<any> };

export type ShaderWithUniforms = {
   uniforms?: Uniforms;
   vertexShader?: string;
   fragmentShader?: string;
};

type Nest<K extends string, V> = K extends `${infer First}_${infer Rest}`
   ? { [P in First]?: Nest<Rest, V> }
   : { [P in K]?: V };

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
   k: infer I
) => void
   ? I
   : never;

/**
 * test_test => { test: { test: number } }
 */
export type NestUniformValues<U extends Uniforms> = UnionToIntersection<
   { [K in keyof U]: Nest<Extract<K, string>, U[K]["value"]> }[keyof U]
>;

function isTHREE(property: any) {
   return property && THREE_TYPES.has(property.constructor);
}

/**
 * {test:{test:1}} => {test_test:1}
 */
export function flattenUniformValues(
   obj: Record<string, any>
): Record<string, any> {
   const flatObject: Record<string, any> = {};

   const helper = (currentObj: any, parentKey = ""): void => {
      for (const key in currentObj) {
         if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
            const value = currentObj[key];
            const newKey = parentKey ? `${parentKey}_${key}` : key;
            if (
               value &&
               typeof value === "object" &&
               !Array.isArray(value) &&
               !isTHREE(value)
            ) {
               helper(value, newKey);
            } else {
               if (flatObject.hasOwnProperty(newKey)) {
                  warn(`${newKey} already exists and will be overwritten.`);
               }
               flatObject[newKey] = value;
            }
         }
      }
   };

   helper(obj);
   return flatObject;
}
