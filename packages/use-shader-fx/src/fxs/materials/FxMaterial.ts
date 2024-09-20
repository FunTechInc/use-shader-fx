import * as THREE from "three";
import { RootState } from "../types";
import { resolveIncludes } from "../../libs/shaders/resolveShaders";

export type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   screenAspect: { value: number };
};

export class FxMaterial extends THREE.ShaderMaterial {
   constructor(parameters = {}) {
      super();

      this.uniforms = {
         resolution: { value: new THREE.Vector2() },
         screenAspect: { value: 0 },
      } as DefaultUniforms;

      this.setValues(parameters);
   }

   updateDefaultValues(rootState: RootState) {
      const { size } = rootState;
      this.uniforms.resolution.value.set(size.width, size.height);
      this.uniforms.screenAspect.value = size.width / size.height;
   }

   resolveDefaultShaders(vertexShader: string, fragmentShader: string) {
      return {
         vertexShader: resolveIncludes(vertexShader),
         fragmentShader: resolveIncludes(fragmentShader),
      };
   }

   setUniformValues(values: any) {
      if (values === undefined) return;

      for (const key in values) {
         const newValue = values[key];

         if (newValue === undefined) {
            console.warn(
               `use-shader-fx: parameter '${key}' has value of undefined.`
            );
            continue;
         }

         const curretUniform = this.uniforms[key];

         if (curretUniform === undefined) {
            console.warn(
               `use-shader-fx: '${key}' is not a uniform property of ${this.type}.`
            );
            return;
         }

         curretUniform.value = newValue;
      }
   }
}
