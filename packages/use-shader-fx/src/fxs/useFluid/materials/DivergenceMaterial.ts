import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/divergence.frag";
import { FxMaterial, DefaultUniforms } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

type DivergenceUniforms = {
   isBounce: { value: boolean };
   velocity: { value: THREE.Texture };
   dt: { value: number };
} & DefaultUniforms;

export class DivergenceMaterial extends FxMaterial {
   static get type() {
      return "DivergenceMaterial";
   }

   uniforms!: DivergenceUniforms;

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = DivergenceMaterial.type;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            isBounce: { value: true },
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         },
      ]) as DivergenceUniforms;

      this.resolveDefaultShaders(vertex.main, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
