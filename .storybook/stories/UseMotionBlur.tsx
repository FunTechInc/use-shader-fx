import * as THREE from "three";
import * as React from "react";
import { useFrame, extend, useThree, createPortal } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useMotionBlur, useSingleFBO } from "../../packages/use-shader-fx/src";
import {
   MotionBlurParams,
   MOTIONBLUR_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/effects/useMotionBlur";
import { OrbitControls } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: MotionBlurParams = structuredClone(MOTIONBLUR_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "strength", 0, 0.99, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as MotionBlurParams;
};

export const UseMotionBlur = (args: MotionBlurParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, viewport, camera } = useThree();
   const [updateMotionBlur, setMotionBlur] = useMotionBlur({
      size,
      dpr: viewport.dpr,
   });

   // This scene is rendered offscreen
   const offscreenScene = React.useMemo(() => new THREE.Scene(), []);

   // create FBO for offscreen rendering
   const [boxView, updateRenderTarget] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
      samples: 4,
   });

   setMotionBlur({
      texture: boxView.texture,
   });

   useFrame((props) => {
      updateRenderTarget(props.gl);
      const fx = updateMotionBlur(props, {
         strength: setConfig().strength,
      });
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <>
         {createPortal(
            <mesh>
               <ambientLight intensity={Math.PI} />
               <spotLight
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  decay={0}
                  intensity={Math.PI}
               />
               <pointLight
                  position={[-10, -10, -10]}
                  decay={0}
                  intensity={Math.PI}
               />
               <Box position={[-1.5, 0, 0]} />
               <Box position={[1.5, 0, 0]} />
            </mesh>,
            offscreenScene
         )}
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial key={FxMaterial.key} ref={fxRef} />
         </mesh>
         <OrbitControls />
      </>
   );
};

function Box(props: any) {
   // This reference will give us direct access to the mesh
   const meshRef = React.useRef<THREE.Mesh>();
   // Set up state for the hovered and active state
   const [hovered, setHover] = React.useState(false);
   const [active, setActive] = React.useState(false);
   // Subscribe this component to the render-loop, rotate the mesh every frame
   useFrame((state, delta) => {
      meshRef.current!.rotation.x += delta;
      meshRef.current!.rotation.y -= delta;
   });
   // Return view, these are regular three.js elements expressed in JSX
   return (
      <mesh
         {...props}
         ref={meshRef}
         scale={active ? 2 : 1.5}
         onClick={(event) => setActive(!active)}
         onPointerOver={(event) => setHover(true)}
         onPointerOut={(event) => setHover(false)}>
         <boxGeometry args={[1, 1, 1]} />
         <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
   );
}
