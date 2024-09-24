import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/advection.frag";
import { FxMaterial, DefaultUniforms } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

type AdvectionUniforms = {
   velocity: { value: THREE.Texture };
   dt: { value: number };
} & DefaultUniforms;

export class AdvectionMaterial extends FxMaterial {
   static get type() {
      return "AdvectionMaterial";
   }

   uniforms!: AdvectionUniforms;

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = AdvectionMaterial.type;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         },
      ]) as AdvectionUniforms;

      this.resolveDefaultShaders(vertex.advection, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
