import { useRef } from "react";
import * as THREE from "three";
import { useRipple } from "@/packages/use-shader-fx/src";
import { useFlowmap } from "@/packages/use-shader-fx/src";
import { useSimpleFruid } from "@/packages/use-shader-fx/src";
import { useFruid } from "@/packages/use-shader-fx/src";
import { useBrush } from "@/packages/use-shader-fx/src";
import { useTransitionBg } from "@/packages/use-shader-fx/src";
import { useDuoTone } from "@/packages/use-shader-fx/src";
import { useFogProjection } from "@/packages/use-shader-fx/src";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { usePerformanceMonitor } from "@react-three/drei";
import { useGUI } from "./gui/useGUI";
import { CONFIG } from "./config";

extend({ MainShaderMaterial });

/*===============================================
TODO*
- dprは入れ込んだほうがいいかも?
- 初期値とGUIの整理
- read meの整理
- fx hookは配列で返すようにするか
	- 配列とオブジェクトの出ストラクチャリングについてちゃんとstyle bookにまとめよっと
	- いや、名前に意味があるし、拡張性的には、オブジェクトか？
		- usePointerは確実にオブジェクトで返すいのがいいよな。名前に意味があるし。順不同だから。
		- そう考えると、順は確定してるし、今後も増やす必要はないから（むしろそういう設計にしたほうがいい）、配列か
===============================================*/

export const Scene = () => {
   const [bg, bg2, ripple, noise] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
      "momo.jpg",
      "ripple.png",
      "noise.png",
   ]);
   const updateGUI = useGUI();
   const mainShaderRef = useRef<TMainShaderUniforms>();

   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   // fx
   const { updateFx: updateRipple } = useRipple({ texture: ripple, size });
   const { updateFx: updateFruid, setParams: setFruid } = useFruid({
      size,
      dpr,
   });
   const { updateFx: updateFlowmap } = useFlowmap({ size });
   const { updateFx: updateSimpleFruid } = useSimpleFruid({ size });
   const { updateFx: updateBrush } = useBrush({ size });

   // post fx
   const { updateFx: updateTransitionBg } = useTransitionBg({ size, dpr });
   const { updateFx: updateDuoTone } = useDuoTone({ size });
   const { updateFx: updateFogProjection } = useFogProjection({ size });

   // Monitor performance changes and execute update functions of params
   usePerformanceMonitor({
      onChange({ factor }) {
         setFruid({
            pressure_iterations: Math.round(20 * factor),
         });
      },
   });

   useFrame((props) => {
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
               texture: ripple,
               radius: CONFIG.brush.radius,
               alpha: CONFIG.brush.alpha,
               smudge: CONFIG.brush.smudge,
               dissipation: CONFIG.brush.dissipation,
               magnification: CONFIG.brush.magnification,
               motionBlur: CONFIG.brush.motionBlur,
            });
            break;
         case 3:
            fx = updateFlowmap(props, {
               radius: CONFIG.flowmap.radius,
               magnification: CONFIG.flowmap.magnification,
               alpha: CONFIG.flowmap.alpha,
               dissipation: CONFIG.flowmap.dissipation,
            });
            break;
         case 4:
            fx = updateSimpleFruid(props, {
               attenuation: CONFIG.simpleFruid.attenuation,
               alpha: CONFIG.simpleFruid.alpha,
               beta: CONFIG.simpleFruid.beta,
               viscosity: CONFIG.simpleFruid.viscosity,
               forceRadius: CONFIG.simpleFruid.forceRadius,
               forceCoefficient: CONFIG.simpleFruid.forceCoefficient,
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
         noise: noise,
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
            timeStrength: CONFIG.fogProjection.timeStrength,
            distortionStrength: CONFIG.fogProjection.distortionStrength,
            fogEdge0: CONFIG.fogProjection.fogEdge0,
            fogEdge1: CONFIG.fogProjection.fogEdge1,
            fogColor: CONFIG.fogProjection.fogColor,
            texture: postFx,
         });
      }

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = fx;
         main.u_postFx = postFx;
         main.isBgActive = CONFIG.transitionBg.active;
      }
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <mainShaderMaterial key={MainShaderMaterial.key} ref={mainShaderRef} />
      </mesh>
   );
};
