import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class ClearNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "ClearNodeMaterial";
   }

   texture: THREE.Texture;
   value: number;

   constructor(parameters = {}) {
      super();

      this.texture = DEFAULT_TEXTURE;
      this.value = 0;

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { uv, Fn, texture, vec4, float } = TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);
      this.fragmentNode = Fn(() => {
         const outColor = texture(this.texture, uv()).mul(float(this.value));
         return outColor;
      })();
   }
}
