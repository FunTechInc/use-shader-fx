import * as THREE from "three";
import gsap from "gsap";
import { BgTextureParams } from "./hooks/useBgTexture";
import { Fruid2Params } from "./hooks/useFruid_2";
import { RippleParams } from "./hooks/useRipple";

type TConfig = {
   bgTexture: BgTextureParams;
   fruid2: Fruid2Params;
   ripple: RippleParams;
   transform: () => void;
   isBg: boolean;
   transformDir: number;
   selectEffect: number;
};

export const CONFIG: TConfig = {
   bgTexture: {
      texture: [new THREE.Texture()],
      noise: new THREE.Texture(),
      noiseStrength: 0.0,
      progress: 0.0,
      dir: new THREE.Vector2(0.3, 0.2),
      imageResolution: new THREE.Vector2(1440, 1440),
   },
   fruid2: {
      density_dissipation: 0.98,
      velocity_dissipation: 0.99,
      velocity_acceleration: 8.0,
      pressure_dissipation: 0.9,
      pressure_iterations: 20,
      curl_strength: 4,
      splat_radius: 0.002,
      fruid_color: (velocity) => {
         const rCol = Math.max(0.0, velocity.x * 100);
         const gCol = Math.max(0.0, velocity.y * 100);
         const bCol = (rCol + gCol) / 2;
         return new THREE.Vector3(rCol, gCol, bCol);
      },
   },
   ripple: {
      frequency: 0.01,
      rotation: 0.01,
      fadeout_speed: 0.9, //乗算される透明度係数 0~1 1で残り続ける
      scale: 0.15,
      alpha: 0.6,
   },
   transformDir: 1,
   isBg: true,
   transform: () => {
      CONFIG.transformDir = CONFIG.transformDir * -1;
      const tl = gsap.timeline({
         defaults: { duration: 2 },
      });
      tl.to(CONFIG.bgTexture, {
         noiseStrength: 0.2,
         progress: 0.5,
         ease: "power3.in",
      });
      tl.to(CONFIG.bgTexture, {
         noiseStrength: 0.0,
         progress: CONFIG.transformDir > 0 ? 0.0 : 1.0,
         ease: "power3.out",
      });
   },
   selectEffect: -1,
};
