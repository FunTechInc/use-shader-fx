import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class CurlNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "CurlNodeMaterial";
   }

   velocity: THREE.Texture;
   texelSize: THREE.Vector2;

   constructor(parameters = {}) {
      super();

      this.velocity = DEFAULT_TEXTURE;
      this.texelSize = new THREE.Vector2();

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { uv, Fn, texture, vec4, vec2, float, varying } = TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      const vL = varying(uv().sub(vec2(this.texelSize.x, 0)));
      const vR = varying(uv().add(vec2(this.texelSize.x, 0)));
      const vT = varying(uv().add(vec2(0, this.texelSize.y)));
      const vB = varying(uv().sub(vec2(0, this.texelSize.y)));

      this.fragmentNode = Fn(() => {
         const L = float(texture(this.velocity, vL).g);
         const R = float(texture(this.velocity, vR).g);
         const T = float(texture(this.velocity, vT).r);
         const B = float(texture(this.velocity, vB).r);
         const velocity = float(R.sub(L).sub(T.add(B)));
         return vec4(velocity, 0, 0, 1);
      })();
   }
}
