import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class PressureNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "PressureNodeMaterial";
   }

   pressure: THREE.Texture;
   divergence: THREE.Texture;
   texelSize: THREE.Vector2;

   constructor(parameters = {}) {
      super();

      this.pressure = DEFAULT_TEXTURE;
      this.divergence = DEFAULT_TEXTURE;
      this.texelSize = new THREE.Vector2(0);

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { uv, Fn, texture, vec4, vec2, float, varying, clamp } = TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      const vL = varying(uv().sub(vec2(this.texelSize.x, 0)));
      const vR = varying(uv().add(vec2(this.texelSize.x, 0)));
      const vT = varying(uv().add(vec2(0, this.texelSize.y)));
      const vB = varying(uv().sub(vec2(0, this.texelSize.y)));

      this.fragmentNode = Fn(() => {
         const L = float(texture(this.pressure, clamp(vL, 0, 1)).r);
         const R = float(texture(this.pressure, clamp(vR, 0, 1)).r);
         const T = float(texture(this.pressure, clamp(vT, 0, 1)).r);
         const B = float(texture(this.pressure, clamp(vB, 0, 1)).r);
         const div = float(texture(this.divergence, uv()).r);
         const pressure = L.add(R).add(T).add(B).sub(div).mul(0.25);
         return vec4(pressure, 0, 0, 1);
      })();
   }
}
