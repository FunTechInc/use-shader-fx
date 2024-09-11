import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class VorticityNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "VorticityNodeMaterial";
   }

   velocity: THREE.Texture;
   curl: THREE.Texture;
   curlIntensity: number;
   deltaTime: number;
   texelSize: THREE.Vector2;

   constructor(parameters = {}) {
      super();

      this.velocity = DEFAULT_TEXTURE;
      this.curl = DEFAULT_TEXTURE;
      this.curlIntensity = 0;
      this.deltaTime = 0.016;
      this.texelSize = new THREE.Vector2();

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const {
         uv,
         Fn,
         texture,
         vec4,
         vec2,
         float,
         varying,
         clamp,
         abs,
         length,
      } = TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      const vT = varying(uv().add(vec2(0, this.texelSize.y)));
      const vB = varying(uv().sub(vec2(0, this.texelSize.y)));

      this.fragmentNode = Fn(() => {
         const T = texture(this.curl, vT).r;
         const B = texture(this.curl, vB).r;
         const C = texture(this.curl, uv()).r;
         const force = vec2(abs(T).sub(abs(B)), 0);
         force.mul(
            float(1)
               .div(length(force.add(0.00001)))
               .mul(this.curlIntensity)
               .mul(C)
         );
         const vel = texture(this.velocity, uv()).rg;
         return vec4(vel.add(force.mul(this.deltaTime)), 0, 1);
      })();
   }
}
