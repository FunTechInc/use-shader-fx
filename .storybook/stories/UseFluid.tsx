import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useFPSLimiter,
   useFluid,
   useFxTexture,
} from "../../packages/use-shader-fx/src";
import {
   FLUID_PARAMS,
   FluidParams,
} from "../../packages/use-shader-fx/src/fxs/simulations/useFluid";

extend({ FxMaterial });

const CONFIG: FluidParams = structuredClone(FLUID_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "densityDissipation", 0, 1, 0.01);
   gui.add(CONFIG, "velocityDissipation", 0, 1, 0.01);
   gui.add(CONFIG, "velocityAcceleration", 0, 100, 1);
   gui.add(CONFIG, "pressureDissipation", 0, 1, 0.01);
   gui.add(CONFIG, "pressureIterations", 0, 30, 1);
   gui.add(CONFIG, "curlStrength", 0, 100, 1);
   gui.add(CONFIG, "splatRadius", 0, 0.2, 0.001);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as FluidParams;
};

export const UseFluid = (args: FluidParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFluid] = useFluid({
      size,
      dpr,
      customFluidProps: {
         curl: {
            onBeforeInit: React.useCallback((shader: any) => {
               console.log(shader.fragmentShader);
            }, []),
         },
      },
   });

   useFrame((state) => {
      const fx = updateFluid(state, setConfig());
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

export const UseFluidWithTexture = (args: FluidParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFluid] = useFluid({ size, dpr });

   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const [updateFxTexture] = useFxTexture({ size, dpr });

   useFrame((props) => {
      const fx = updateFluid(props, setConfig());

      const bgTexture = updateFxTexture(props, {
         map: fx,
         padding: 0.1,
         mapIntensity: 0.3,
         edgeIntensity: 0.3,
         texture0: bg,
      });

      fxRef.current!.u_fx = bgTexture;
      fxRef.current!.u_alpha = 0.0;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
