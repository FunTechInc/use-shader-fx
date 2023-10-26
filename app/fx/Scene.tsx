import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { RippleParams, useRipple } from "./hooks/useRipple";
import { useFlowmap } from "./hooks/useFlowmap";
import { useSimpleFruid } from "./hooks/useSimpleFruid";
import { FruidParams, useFruid } from "./hooks/useFruid";
import { useBrush } from "./hooks/useBrush";
import { TransitionBgParams, useTransitionBg } from "./hooks/useTransitionBg";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { useGUI } from "./gui/useGUI";
import { CONFIG } from "./config";
import { DuoToneParams, useDuoTone } from "./hooks/useDuoTone";
import {
   FogProjectionParams,
   useFogProjection,
} from "./hooks/useFogProjection";

extend({ MainShaderMaterial });

/*===============================================
TODO*extract paramsはライブラリからはずそっと：わかりにくくなる
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

   //fx
   const updateRipple = useRipple({ texture: smoke, max: 100, size: 64 });
   const updateFruid = useFruid();
   // const updateFlowmap = useFlowmap();
   // const updateSimpleFruid = useSimpleFruid();
   // const updateBrush = useBrush(smoke);

   //post fx
   const updateTransitionBg = useTransitionBg();
   const updateDuoTone = useDuoTone();
   const updateFogProjection = useFogProjection();

   useFrame((props) => {
      /*===============================================
		fx
		===============================================*/
      let fx: THREE.Texture;
      switch (CONFIG.selectEffect) {
         case 0:
            fx = updateRipple(props, {
               frequency: CONFIG.ripple.frequency,
               rotation: CONFIG.ripple.rotation,
               fadeout_speed: CONFIG.ripple.fadeout_speed,
               scale: CONFIG.ripple.scale,
               alpha: CONFIG.ripple.alpha,
            });
            break;
         case 1:
            fx = updateFruid(props, {
               density_dissipation: CONFIG.fruid.density_dissipation,
               velocity_dissipation: CONFIG.fruid.velocity_dissipation,
               velocity_acceleration: CONFIG.fruid.velocity_acceleration,
               pressure_dissipation: CONFIG.fruid.pressure_dissipation,
               pressure_iterations: CONFIG.fruid.pressure_iterations,
               curl_strength: CONFIG.fruid.curl_strength,
               splat_radius: CONFIG.fruid.splat_radius,
               fruid_color: CONFIG.fruid.fruid_color,
            });
            break;
         default:
            fx = new THREE.Texture();
            break;
      }

      /*===============================================
		post fx
		===============================================*/
      const bgTexture = updateTransitionBg(props, {
         imageResolution: CONFIG.transitionBg.imageResolution,
         noiseStrength: CONFIG.transitionBg.noiseStrength,
         progress: CONFIG.transitionBg.progress,
         dir: CONFIG.transitionBg.dir,
         texture: [bg, bg2],
         noise: noise,
      });

      let duoTone;
      if (CONFIG.duoTone.active) {
         duoTone = updateDuoTone(props, {
            color0: CONFIG.duoTone.color0,
            color1: CONFIG.duoTone.color1,
            texture: bgTexture,
         });
      } else {
         duoTone = bgTexture;
      }

      let fogProjection;
      if (CONFIG.fogProjection.active) {
         fogProjection = updateFogProjection(props, {
            timeStrength: CONFIG.fogProjection.timeStrength,
            distortionStrength: CONFIG.fogProjection.distortionStrength,
            fogEdge0: CONFIG.fogProjection.fogEdge0,
            fogEdge1: CONFIG.fogProjection.fogEdge1,
            fogColor: CONFIG.fogProjection.fogColor,
            texture: duoTone,
         });
      } else {
         fogProjection = duoTone;
      }

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = fx;
         main.u_postFx = fogProjection;
         main.isBgActive = CONFIG.transitionBg.active;
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
