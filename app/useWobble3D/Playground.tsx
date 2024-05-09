"use client";

import * as THREE from "three";
import { useEffect } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useBeat,
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
   useWobble3D,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { OrbitControls, Environment } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: Wobble3DParams = {
   ...structuredClone(WOBBLE3D_PARAMS),
   color0: new THREE.Color(0x1adb91),
   color1: new THREE.Color(0xdbff57),
   color2: new THREE.Color(0xdf6bff),
   color3: new THREE.Color(0x9eaeff),
   wobbleStrength: 0.8,
   wobbleTimeFrequency: 0.4,
   warpStrength: 0.2,
   colorMix: 0.6,
   chromaticAberration: 0.8,
   anisotropicBlur: 0.2,
   distortion: 2,
   distortionScale: 0.8,
   temporalDistortion: 0.3,
   refractionSamples: 6,
};

const MATERIAL_CONFIG: THREE.MeshPhysicalMaterialParameters = {
   iridescence: 0,
   metalness: 0.0,
   roughness: 0.0,
   transmission: 0.99,
   thickness: 0.2,
   transparent: true,
};

const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "color0");
   gui.addColor(CONFIG, "color1");
   gui.addColor(CONFIG, "color2");
   gui.addColor(CONFIG, "color3");
   gui.add(CONFIG, "wobbleStrength", 0, 10, 0.01);
   gui.add(CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpStrength", 0, 10, 0.01);
   gui.add(CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "refractionSamples", 0, 10, 1);
   gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   gui.add(CONFIG, "chromaticAberration", 0, 10, 0.01);
   gui.add(CONFIG, "anisotropicBlur", 0, 10, 0.01);
   gui.add(CONFIG, "distortion", 0, 10, 0.01);
   gui.add(CONFIG, "distortionScale", 0, 10, 0.01);
   gui.add(CONFIG, "temporalDistortion", 0, 10, 0.01);
   const mpm = gui.addFolder("MeshPhysicalMaterial");
   mpm.add(MATERIAL_CONFIG, "iridescence", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "metalness", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "roughness", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "transmission", 0, 10, 0.01);
   mpm.add(MATERIAL_CONFIG, "thickness", 0, 10, 0.01);
   return gui;
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as Wobble3DParams;
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);

   /*===============================================
	example of FBO
	===============================================*/
   // const { size, viewport, camera } = useThree();
   // const [update, _, { output, scene }] = useWobble3D({
   //    size,
   //    dpr: viewport.dpr,
   //    camera,
   // });
   // useEffect(() => {
   //    const light = new THREE.AmbientLight(0xffffff, 2);
   //    scene.add(light);
   // }, [scene]);
   // useFrame((props) => update(props));

   /*===============================================
	example of primitive
	===============================================*/
   const [updateWobble, wobble] = useCreateWobble3D({
      baseMaterial: THREE.MeshPhysicalMaterial,
      materialParameters: MATERIAL_CONFIG,
      isCustomTransmission: true,
   });
   wobble.mesh.customDepthMaterial = wobble.depthMaterial;
   wobble.mesh.receiveShadow = true;
   wobble.mesh.castShadow = true;

   const beat = useBeat(140, "easeInOutBack");

   useFrame((state) => {
      updateWobble(state, {
         ...setConfig(),
         beat: beat(state.clock).beat,
      });
      const mat = wobble.mesh.material as THREE.MeshPhysicalMaterial;
      mat.iridescence = MATERIAL_CONFIG.iridescence!;
      mat.metalness = MATERIAL_CONFIG.metalness!;
      mat.roughness = MATERIAL_CONFIG.roughness!;
      mat.transmission = MATERIAL_CONFIG.transmission!;
      mat.thickness = MATERIAL_CONFIG.thickness!;
      updateGUI();
   });

   return (
      <mesh>
         <directionalLight
            color={"white"}
            position={[0.25, 2, 3]}
            intensity={3}
            castShadow
         />
         <OrbitControls />
         <Environment preset="warehouse" background={true} />
         <primitive object={wobble.mesh} />
         <mesh receiveShadow position={[0, -4, -8]}>
            <planeGeometry args={[15, 15, 15]} />
            <meshStandardMaterial map={funkun} />
         </mesh>
         {/* <OrbitControls />
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={output} /> */}
      </mesh>
   );
};

/*===============================================
simpler example
===============================================*/
// export const Playground = () => {
//    const [updateWobble, wobble] = useCreateWobble3D({
//       baseMaterial: THREE.MeshPhysicalMaterial,
//       materialParameters: {
//          roughness: 0.0,
//          transmission: 1,
//          thickness: 1,
//       },
//    });
//    useFrame((state) => updateWobble(state));
//    return (
//       <mesh>
//          <Environment preset="warehouse" background />
//          <primitive object={wobble.mesh} />
//       </mesh>
//    );
// };
