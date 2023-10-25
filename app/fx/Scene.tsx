import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { RippleParams, useRipple } from "./hooks/useRipple";
import { useFlowmap } from "./hooks/useFlowmap";
import { useFruid } from "./hooks/useFruid";
import { Fruid2Params, useFruid_2 } from "./hooks/useFruid_2";
import { useBrush } from "./hooks/useBrush";
import { BgTextureParams, useBgTexture } from "./hooks/useBgTexture";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { useGUI } from "./gui/useGUI";
import { CONFIG } from "./config";
import { DuoToneParams, useDuoTone } from "./hooks/useDuoTone";
import { SimpleNoiseParams, useSimpleNoise } from "./hooks/useSimpleNoise";
import { extractParams } from "./hooks/utils/extractParams";
import {
   FogProjectionParams,
   useFogProjection,
} from "./hooks/useFogProjection";

extend({ MainShaderMaterial });

/*===============================================
TODO* https://thebookofshaders.com/13/?lan=jp read this
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
   const updateSimpleNoise = useSimpleNoise();
   const updateFogProjection = useFogProjection();
   // const updateFlowmap = useFlowmap();
   // const updateFruid = useFruid();
   // const updateBrush = useBrush(smoke);

   useFrame((props) => {
      /*===============================================
		fx
		===============================================*/
      let fx: THREE.Texture;
      switch (CONFIG.selectEffect) {
         case 0:
            fx = updateRipple(props, {
               ...(extractParams(CONFIG.ripple, [
                  "frequency",
                  "rotation",
                  "fadeout_speed",
                  "scale",
                  "alpha",
               ]) as RippleParams),
            });
            break;
         case 1:
            fx = updateFruid_2(props, {
               ...(extractParams(CONFIG.fruid2, [
                  "density_dissipation",
                  "velocity_dissipation",
                  "velocity_acceleration",
                  "pressure_dissipation",
                  "pressure_iterations",
                  "curl_strength",
                  "splat_radius",
                  "fruid_color",
               ]) as Fruid2Params),
            });
            break;
         default:
            fx = new THREE.Texture();
            break;
      }

      /*===============================================
		post fx
		===============================================*/
      const bgTexture = updateBgTexture(props, {
         ...(extractParams(CONFIG.bgTexture, [
            "imageResolution",
            "noiseStrength",
            "progress",
            "dir",
         ]) as BgTextureParams),
         texture: [bg, bg2],
         noise: noise,
      });

      let duoTone;
      if (CONFIG.duoTone.active) {
         duoTone = updateDuoTone(props, {
            ...(extractParams(CONFIG.duoTone, [
               "color0",
               "color1",
            ]) as DuoToneParams),
            texture: bgTexture,
         });
      } else {
         duoTone = bgTexture;
      }

      let simpleNoise;
      if (CONFIG.simpleNoise.active) {
         simpleNoise = updateSimpleNoise(props, {
            ...(extractParams(CONFIG.simpleNoise, [
               "xTimeStrength",
               "yTimeStrength",
               "xStrength",
               "yStrength",
            ]) as SimpleNoiseParams),
            texture: duoTone,
            xDir: new THREE.Vector2(
               CONFIG.simpleNoise.xDir.x,
               CONFIG.simpleNoise.xDir.y
            ),
            yDir: new THREE.Vector2(
               CONFIG.simpleNoise.yDir.x,
               CONFIG.simpleNoise.yDir.y
            ),
         });
      } else {
         simpleNoise = duoTone;
      }

      let fogProjection;
      fogProjection = updateFogProjection(props, {
         ...(extractParams(CONFIG.simpleNoise, [
            "xTimeStrength",
            "yTimeStrength",
            "xStrength",
            "yStrength",
         ]) as FogProjectionParams),
         texture: duoTone,
         xDir: new THREE.Vector2(
            CONFIG.simpleNoise.xDir.x,
            CONFIG.simpleNoise.xDir.y
         ),
         yDir: new THREE.Vector2(
            CONFIG.simpleNoise.yDir.x,
            CONFIG.simpleNoise.yDir.y
         ),
      });

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = fx;
         main.u_postFx = fogProjection;
         main.isBgActive = CONFIG.bgTexture.active;
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
