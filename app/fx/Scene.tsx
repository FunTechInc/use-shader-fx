import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useRipple } from "./hooks/useRipple";
import { useFlowmap } from "./hooks/useFlowmap";
import { useFruid } from "./hooks/useFruid";
import { useFruid_2 } from "./hooks/useFruid_2";
import { useBrush } from "./hooks/useBrush";
import { useBgTexture } from "./hooks/useBgTexture";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { useGUI } from "./gui/useGUI";
import { CONFIG } from "./config";
import { useDuoTone } from "./hooks/useDuoTone";
import { useSimpleNoise } from "./hooks/useSimpleNoise";

extend({ MainShaderMaterial });

/*===============================================
TODO*snoiseを2重でかけたら、いい感じになるね〜
===============================================*/

export const Scene = () => {
   const [bg, bg2, smoke, ripple, noise, pNoise] = useLoader(
      THREE.TextureLoader,
      [
         "background.jpg",
         "background2.jpeg",
         "smoke.png",
         "ripple.png",
         "noise.png",
         "p-noise.webp",
      ]
   );
   const updateGUI = useGUI();
   const mainShaderRef = useRef<TMainShaderUniforms>();
   const updateBgTexture = useBgTexture();
   const updateRipple = useRipple({ texture: smoke, max: 100, size: 64 });
   const updateFruid_2 = useFruid_2();
   const updateDuoTone = useDuoTone();
   const updateSNoise = useSimpleNoise();
   // const updateFlowmap = useFlowmap();
   // const updateFruid = useFruid();
   // const updateBrush = useBrush(smoke);

   useFrame((props) => {
      /*===============================================
		background effects
		===============================================*/
      const bgTexture = updateBgTexture(props, {
         texture: [bg, bg2],
         imageResolution: CONFIG.bgTexture.imageResolution,
         noise: noise,
         noiseStrength: CONFIG.bgTexture.noiseStrength,
         progress: CONFIG.bgTexture.progress,
         dir: CONFIG.bgTexture.dir,
      });
      const duoEffect = updateDuoTone(props, {
         texture: bgTexture,
         color: [new THREE.Color(0xf0eee8), new THREE.Color(0xf9f6ee)],
      });
      const bgEffect = updateSNoise(props, {
         texture: duoEffect,
      });

      /*===============================================
		after effects
		===============================================*/
      let afterEffect: THREE.Texture;
      switch (CONFIG.selectEffect) {
         case 0:
            afterEffect = updateRipple(props, {
               frequency: CONFIG.ripple.frequency,
               rotation: CONFIG.ripple.rotation,
               fadeout_speed: CONFIG.ripple.fadeout_speed,
               scale: CONFIG.ripple.scale,
               alpha: CONFIG.ripple.alpha,
            });
            break;
         case 1:
            afterEffect = updateFruid_2(props, {
               density_dissipation: CONFIG.fruid2.density_dissipation,
               velocity_dissipation: CONFIG.fruid2.velocity_dissipation,
               velocity_acceleration: CONFIG.fruid2.velocity_acceleration,
               pressure_dissipation: CONFIG.fruid2.pressure_dissipation,
               pressure_iterations: CONFIG.fruid2.pressure_iterations,
               curl_strength: CONFIG.fruid2.curl_strength,
               splat_radius: CONFIG.fruid2.splat_radius,
               fruid_color: CONFIG.fruid2.fruid_color,
            });
            break;
         default:
            afterEffect = new THREE.Texture();
            break;
      }

      const main = mainShaderRef.current;
      if (main) {
         main.u_bgTexture = bgEffect;
         main.u_effectTexture = afterEffect;
         main.isBg = CONFIG.isBg;
      }
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <mainShaderMaterial
            key={MainShaderMaterial.key}
            ref={mainShaderRef}
            u_resolution={
               new THREE.Vector2(window.innerWidth, window.innerHeight)
            }
         />
      </mesh>
   );
};

/*===============================================
TODO:
- resize
- clean up

TODO*
-drei の performance monitor調べる
- Movement regressionてか、このページよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#movement-regression
- dreiのパフォーマンス
-このページもよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls
===============================================*/

/*===============================================
2つのbrushを共存させて複雑な絵作りの実験をあこのやつでやるか〜
fluidの上にbrush載せたら、lusionみたいな演出になりそう
===============================================*/

/*===============================================
TODO*
水面fxつくる useWatarSurface
beniのサイトは水面にまだ乾いてない絵の具で描いた絵が水面ギリギリで浮かんでるみた
いな
https://medium.com/@martinRenou/real-time-rendering-of-water-caustics-59cda1d74aa
===============================================*/
