import * as THREE from "three";
import { resolveIncludes } from "../../libs/shaders/resolveShaders";
import { mergeShaderLib } from "../../libs/shaders/mergeShaderLib";

export type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
};

export type Uniforms = { [uniform: string]: THREE.IUniform<any> };
export type ShaderWithUniforms = {
   uniforms?: Uniforms;
   vertexShader?: string;
   fragmentShader?: string;
};

export type FxMaterialProps<T = {}> = {
   uniformValues?: T;
   materialParameters?: {};
} & ShaderWithUniforms;

export class FxMaterial extends THREE.ShaderMaterial {
   public static readonly key: string = THREE.MathUtils.generateUUID();

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps = {}) {
      super();

      this.uniforms = THREE.UniformsUtils.merge([
         {
            resolution: { value: new THREE.Vector2() },
            texelSize: { value: new THREE.Vector2() },
            aspectRatio: { value: 0 },
            maxAspect: { value: new THREE.Vector2() },
         },
         uniforms || {},
      ]) as DefaultUniforms;

      this.setupDefaultShaders(vertexShader, fragmentShader);

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }

   /** This is updated in useFxScene */
   updateResolution(resolution: THREE.Vector2) {
      const { width, height } = resolution;
      const maxAspect = Math.max(width, height);
      this.uniforms.resolution.value.set(width, height);
      this.uniforms.texelSize.value.set(1 / width, 1 / height);
      this.uniforms.aspectRatio.value = width / height;
      this.uniforms.maxAspect.value.set(maxAspect / width, maxAspect / height);
   }

   setupDefaultShaders(vertexShader?: string, fragmentShader?: string) {
      const [vertex, fragment] = mergeShaderLib(
         vertexShader,
         fragmentShader,
         "default"
      );
      this.vertexShader = vertex ? resolveIncludes(vertex) : this.vertexShader;
      this.fragmentShader = fragment
         ? resolveIncludes(fragment)
         : this.fragmentShader;
   }

   setUniformValues(values?: { [key: string]: any }) {
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

   /**
    * Create getter/setters, This method should be called in the implementing class
    */
   defineUniformAccessors(onSet?: () => void) {
      const entries = Object.entries(this.uniforms);

      entries.forEach(([name]) => {
         if (this.hasOwnProperty(name)) {
            console.warn(`use-shader-fx: ${name} is already defined.`);
            return;
         }

         Object.defineProperty(this, name, {
            get: () => this.uniforms[name].value,
            set: (v) => {
               this.uniforms[name].value = v;
               onSet?.();
            },
         });
      });
   }
}
