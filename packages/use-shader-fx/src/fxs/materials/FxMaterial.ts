import * as THREE from "three";

export class FxMaterial extends THREE.ShaderMaterial {
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

         const currentValue = curretUniform.value;

         if (currentValue && currentValue.isColor) {
            currentValue.set(newValue);
         } else if (
            currentValue &&
            currentValue.isVector3 &&
            newValue &&
            newValue.isVector3
         ) {
            currentValue.copy(newValue);
         } else {
            curretUniform.value = newValue;
         }
      }
   }
}
