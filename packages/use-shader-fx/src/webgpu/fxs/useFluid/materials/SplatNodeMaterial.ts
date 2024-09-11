import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class SplatNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "SplatNodeMaterial";
   }

   target: THREE.Texture;
   aspectRatio: number;
   color: THREE.Vector3;
   point: THREE.Vector2;
   radius: number;

   constructor(parameters = {}) {
      super();

      this.target = DEFAULT_TEXTURE;
      this.aspectRatio = 0;
      this.color = new THREE.Vector3();
      this.point = new THREE.Vector2();
      this.radius = 0.0;

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { uv, Fn, texture, vec4, vec2, vec3, exp, dot, float } = TSL;
      const _uv = vec2(uv().x, float(1).sub(uv().y));

      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);
      this.fragmentNode = Fn(() => {
         const nPoint = vec2(this.point).add(1).mul(0.5);
         const p = _uv.sub(nPoint);
         p.x = p.x.mul(float(this.aspectRatio));
         const splat = vec3(
            exp(dot(p, p).mul(-1).div(this.radius)).mul(vec3(this.color))
         );
         const base = vec3(texture(this.target, _uv).rgb);
         return vec4(base.add(splat), 1);
      })();
   }
}
