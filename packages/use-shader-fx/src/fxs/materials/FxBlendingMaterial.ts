import * as THREE from "three";
import { DEFAULT_TEXTURE } from "../../libs/constants";
import {
   resolveIncludes,
   includePattern,
} from "../../libs/shaders/resolveShaders";
import { FxMaterial } from "./FxMaterial";

export type FxBlendingUniforms = {
   fxBlendingSrc: { value: THREE.Texture };
   uvBlending: { value: number };
   alphaBlending: { value: number };
   fxBlendingSrcResolution: { value: THREE.Vector2 };
   // TODO * resolutionはFXMaterialで定義しようかな。全部にあるべきだし
   resolution: { value: THREE.Vector2 };
};

export class FxBlendingMaterial extends FxMaterial {
   fxBlending: boolean;
   blendingUniforms: FxBlendingUniforms;

   constructor(parameters = {}) {
      super();

      this.fxBlending = false;

      this.blendingUniforms = {
         fxBlendingSrc: { value: DEFAULT_TEXTURE },
         uvBlending: { value: 0 },
         alphaBlending: { value: 0 },
         resolution: { value: new THREE.Vector2() },
         fxBlendingSrcResolution: { value: new THREE.Vector2() },
      };

      super.setValues(parameters);
   }

   resolveBlendingShader(vertexShader: string, fragmentShader: string) {
      this.vertexShader = this.fxBlending
         ? resolveIncludes(vertexShader)
         : vertexShader.replace(includePattern, "");
      this.fragmentShader = this.fxBlending
         ? resolveIncludes(fragmentShader)
         : fragmentShader.replace(includePattern, "");
   }
}
