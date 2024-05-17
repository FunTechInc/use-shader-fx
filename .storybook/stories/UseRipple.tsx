import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useRipple, useFxTexture } from "../../packages/use-shader-fx/src";
import {
   RippleParams,
   RIPPLE_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/simulations/useRipple";
import { OnBeforeInitParameters } from "../../packages/use-shader-fx/src/fxs/types";

extend({ FxMaterial });

const CONFIG: RippleParams = structuredClone(RIPPLE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "frequency", 0, 0.1, 0.01);
   gui.add(CONFIG, "rotation", 0, 1, 0.01);
   gui.add(CONFIG, "fadeoutSpeed", 0, 0.99, 0.01);
   gui.add(CONFIG, "scale", 0, 1, 0.01);
   gui.add(CONFIG, "alpha", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as RippleParams;
};

export const UseRipple = (args: RippleParams) => {
   const [ripple] = useLoader(THREE.TextureLoader, ["smoke.png"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, viewport } = useThree();
   const [updateRipple, setRipple] = useRipple({
      size,
      texture: ripple,
      dpr: viewport.dpr,
      max: 80,
      onBeforeInit: React.useCallback((shader: OnBeforeInitParameters) => {
         Object.assign(shader.uniforms, {
            testtest: { value: 0 },
         });
         shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
      		uniform float testtest;
      		void main() {
      		`
         );
         shader.fragmentShader = shader.fragmentShader.replace(
            "vec3 color = texture2D(uMap, uv).rgb",
            `
      		vec3 color = texture2D(uMap, uv).rgb;
      		color.r *= sin(testtest)*.5+.5;
      		color.g *= cos(testtest)*.5+.5;
      		`
         );
      }, []),
   });

   useFrame((props) => {
      const fx = updateRipple(props, setConfig(), {
         testtest: props.clock.getElapsedTime(),
      });
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};

export const UseRippleWithTexture = (args: RippleParams) => {
   const [bg, ripple] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
      "smoke.png",
   ]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFxTexture] = useFxTexture({ size, dpr });
   const [updateRipple] = useRipple({
      size,
      dpr,
      texture: ripple,
   });

   useFrame((props) => {
      const fx = updateRipple(props, setConfig());

      const bgTexture = updateFxTexture(props, {
         texture0: bg,
         map: fx,
         mapIntensity: 1.3,
      });

      fxRef.current!.u_fx = bgTexture;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
