import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useBlending,
   useNoise,
   useBrightnessPicker,
   useFluid,
   useCoverTexture,
} from "../../packages/use-shader-fx/src";
import {
   BlendingParams,
   BLENDING_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/utils/useBlending";

extend({ FxMaterial });

const CONFIG: BlendingParams = structuredClone(BLENDING_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "mapIntensity", 0, 1, 0.01);
   gui.add(CONFIG, "min", 0, 1, 0.01);
   gui.add(CONFIG, "max", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as BlendingParams;
};

/**
 * Blend map to texture. You can set the threshold for blending with brightness. You can set the dodge color by setting color. If you don't want to reflect the map's color, you can use useFxBlending instead.
 */
export const UseBlending = (args: BlendingParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["momo.jpg"]);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateCover] = useCoverTexture({ size, dpr });
   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr,
   });
   const [updateBlending] = useBlending({ size, dpr });

   const colorVec = React.useMemo(() => new THREE.Vector3(), []);

   setFluid({
      density_dissipation: 0.92,
      velocity_dissipation: 0.99,
      velocity_acceleration: 12.0,
      splat_radius: 0.015,
      curl_strength: 5.0,
      pressure_iterations: 4,
      fluid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, Math.abs(velocity.x) * 150);
         const gCol = Math.max(0.0, Math.abs(velocity.y) * 150);
         const bCol = Math.max(0.1, (rCol + gCol) / 2);
         return colorVec.set(rCol, gCol, bCol);
      },
   });

   useFrame((props) => {
      const bgTexture = updateCover(props, {
         texture: bg,
      });
      updateFluid(props);
      const fx = updateBlending(props, {
         ...setConfig(),
         texture: bgTexture,
         map: fluid,
      });
      fxRef.current!.u_fx = fx;
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
