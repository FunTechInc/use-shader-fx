import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class AdvectionNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "AdvectionNodeMaterial";
   }

   velocity: THREE.Texture;
   source: THREE.Texture;
   texelSize: THREE.Vector2;
   deltaTime: number;
   dissipation: number;

   constructor(parameters = {}) {
      super();

      this.velocity = DEFAULT_TEXTURE;
      this.source = DEFAULT_TEXTURE;
      this.texelSize = new THREE.Vector2();
      this.deltaTime = 0.016;
      this.dissipation = 0.0;

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
         vec3,
         float,
         varying,
         viewportUV,
         rotateUV,
         equirectUV,
         reflectView,
      } = TSL;

      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      this.fragmentNode = Fn(() => {
         const _uv = vec2(uv().x, float(1).sub(uv().y));

         const vel = vec2(texture(this.velocity).rg);
         const coord = vec2(
            _uv.sub(vel.mul(vec2(this.texelSize)).mul(float(this.deltaTime)))
         );
         const outC = vec3(
            texture(this.source, coord).rgb.mul(this.dissipation)
         );
         return vec4(outC, 1);
      })();
   }
}
