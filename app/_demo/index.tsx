import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { usePerformanceMonitor } from "@react-three/drei";
import {
   useRipple,
   useFruid,
   useBrush,
   useTransitionBg,
   useDuoTone,
   useFogProjection,
   useNoise,
} from "@/packages/use-shader-fx/src";
import {
   FxTextureMaterial,
   TFxTextureMaterial,
} from "@/utils/fxTextureMaterial";
import { CONFIG, setGUI } from "./config";
import { useGUI } from "@/utils/useGUI";

extend({ FxTextureMaterial });

/*===============================================
TODO*
- structuredCloneしていく
	- 関数はディープコピーできないので注意〜
- packageの作り込み
	- renderTargetをclean upさせる
	- cameraとか、scene、マテリアルとか諸々clean upさせないとか
- CreateKitの作り込み
- 初期値とGUIの整理
- demoをもっと簡略化して、かっこいいビジュアルつくる
	- you can experience more effects hereみたいなリンクつけてstory bookに飛ばす
===============================================*/

export const Demo = () => {
   const [bg, bg2, ripple] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
      "momo.jpg",
      "smoke.png",
   ]);
   const updateGUI = useGUI(setGUI);
   const mainShaderRef = useRef<TFxTextureMaterial>();

   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   // noise
   const [updateNoise] = useNoise({ size, dpr });

   // fx
   const [updateRipple] = useRipple({ texture: ripple, size });
   const [updateFruid, setFruid] = useFruid({
      size,
      dpr,
   });
   const [updateBrush] = useBrush({ size, dpr });

   // post fx
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateDuoTone] = useDuoTone({ size });
   const [updateFogProjection] = useFogProjection({ size });

   // Monitor performance changes and execute update functions of params
   usePerformanceMonitor({
      onChange({ factor }) {
         setFruid({
            pressure_iterations: Math.max(2, Math.floor(20 * factor)),
         });
      },
   });

   useFrame((props) => {
      const noise = updateNoise(props, {
         timeStrength: 0.3,
         noiseOctaves: 8,
         fbmOctaves: 3,
      });

      // fx
      let fx = null;
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
               curl_strength: CONFIG.fruid.curl_strength,
               splat_radius: CONFIG.fruid.splat_radius,
               fruid_color: CONFIG.fruid.fruid_color,
            });
            break;
         case 2:
            fx = updateBrush(props, {
               texture: noise,
               radius: CONFIG.brush.radius,
               smudge: CONFIG.brush.smudge,
               dissipation: CONFIG.brush.dissipation,
               motionBlur: CONFIG.brush.motionBlur,
            });
            break;
         default:
            break;
      }

      // post fx
      let postFx: THREE.Texture;
      postFx = updateTransitionBg(props, {
         imageResolution: CONFIG.transitionBg.imageResolution,
         noiseStrength: CONFIG.transitionBg.noiseStrength,
         progress: CONFIG.transitionBg.progress,
         dir: CONFIG.transitionBg.dir,
         texture0: bg,
         texture1: bg2,
         uNoiseMap: noise,
      });

      if (CONFIG.duoTone.active) {
         postFx = updateDuoTone(props, {
            texture: postFx,
            color0: CONFIG.duoTone.color0,
            color1: CONFIG.duoTone.color1,
         });
      }

      if (CONFIG.fogProjection.active) {
         postFx = updateFogProjection(props, {
            distortionStrength: CONFIG.fogProjection.distortionStrength,
            fogEdge0: CONFIG.fogProjection.fogEdge0,
            fogEdge1: CONFIG.fogProjection.fogEdge1,
            fogColor: CONFIG.fogProjection.fogColor,
            texture: postFx,
            noiseMap: noise,
         });
      }

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = fx;
         main.u_postFx = postFx;
      }
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxTextureMaterial key={FxTextureMaterial.key} ref={mainShaderRef} />
      </mesh>
   );
};
