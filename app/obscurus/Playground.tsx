"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useBeat,
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
   useWobble3D,
   useMorphParticles,
   useCreateMorphParticles,
   MorphParticlesParams,
   MORPHPARTICLES_PARAMS,
   useNoise,
   useFPSLimiter,
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
};

const MATERIAL_CONFIG: THREE.MeshPhysicalMaterialParameters = {
   iridescence: 1,
   metalness: 0.0,
   roughness: 0.0,
   transmission: 2,
   thickness: 1,
   transparent: true,
};

const PARTICLE_CONFIG: MorphParticlesParams = {
   ...structuredClone(MORPHPARTICLES_PARAMS),
   blurAlpha: 0.86,
   blurRadius: 0.07,
   pointSize: 0.9,
   color0: new THREE.Color(0x000000),
   color1: new THREE.Color(0x000000),
   color2: new THREE.Color(0x000000),
   color3: new THREE.Color(0x080808),
   wobbleStrength: 0.8,
   warpStrength: 0.7,
   wobblePositionFrequency: 0.4,
   wobbleTimeFrequency: 0.4,
};

const setGUI = (gui: GUI) => {
   // gui.addColor(CONFIG, "color0");
   // gui.addColor(CONFIG, "color1");
   // gui.addColor(CONFIG, "color2");
   // gui.addColor(CONFIG, "color3");
   // gui.add(CONFIG, "wobbleStrength", 0, 10, 0.01);
   // gui.add(CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   // gui.add(CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   // gui.add(CONFIG, "warpStrength", 0, 10, 0.01);
   // gui.add(CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   // gui.add(CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   // gui.add(CONFIG, "wobbleShine", 0, 5, 0.01);
   // gui.add(CONFIG, "samples", 0, 10, 1);
   // gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   // gui.add(CONFIG, "chromaticAberration", 0, 10, 0.01);
   // gui.add(CONFIG, "anisotropicBlur", 0, 10, 0.01);
   // gui.add(CONFIG, "distortion", 0, 10, 0.01);
   // gui.add(CONFIG, "distortionScale", 0, 10, 0.01);
   // gui.add(CONFIG, "temporalDistortion", 0, 10, 0.01);
   // const mpm = gui.addFolder("MeshPhysicalMaterial");
   // mpm.add(MATERIAL_CONFIG, "iridescence", 0, 1, 0.01);
   // mpm.add(MATERIAL_CONFIG, "metalness", 0, 1, 0.01);
   // mpm.add(MATERIAL_CONFIG, "roughness", 0, 1, 0.01);
   // mpm.add(MATERIAL_CONFIG, "transmission", 0, 10, 0.01);
   // mpm.add(MATERIAL_CONFIG, "thickness", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "blurAlpha", 0, 1, 0.01);
   gui.add(PARTICLE_CONFIG, "blurRadius", 0, 2, 0.01);
   gui.add(PARTICLE_CONFIG, "pointSize", 0.01, 2, 0.01);
   gui.addColor(PARTICLE_CONFIG, "color0");
   gui.addColor(PARTICLE_CONFIG, "color1");
   gui.addColor(PARTICLE_CONFIG, "color2");
   gui.addColor(PARTICLE_CONFIG, "color3");
   gui.add(PARTICLE_CONFIG, "wobbleStrength", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "warpStrength", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "displacementIntensity", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "displacementColorIntensity", 0, 40, 0.01);
   gui.add(PARTICLE_CONFIG, "sizeRandomIntensity", 0, 10, 0.01);
   gui.add(PARTICLE_CONFIG, "sizeRandomTimeFrequency", 0, 3, 0.01);
   gui.add(PARTICLE_CONFIG, "sizeRandomMin", 0, 1, 0.01);
   gui.add(PARTICLE_CONFIG, "sizeRandomMax", 1, 2, 0.01);
   gui.add(PARTICLE_CONFIG, "divergence", -2, 2, 0.1);
   return gui;
};
const setParticleConfig = () => {
   return {
      ...PARTICLE_CONFIG,
   } as MorphParticlesParams;
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const [noise] = useLoader(THREE.TextureLoader, ["/alphaMap.jpg"]);

   const { size, viewport, camera } = useThree();

   const [updateWobble, wobble] = useCreateWobble3D({
      baseMaterial: THREE.MeshPhysicalMaterial,
      materialParameters: { ...MATERIAL_CONFIG },
   });

   const [updateParticle, particles] = useCreateMorphParticles({
      size,
      dpr: viewport.dpr,
      geometry: useMemo(() => new THREE.IcosahedronGeometry(2, 10), []),
   });

   useEffect(() => {
      particles.points.material.blending = THREE.NormalBlending;
   }, []);

   const beat = useBeat(140, "easeInOutBack");
   const limiter = useFPSLimiter(5);

   useFrame((props) => {
      // updateWobble(props, {
      //    ...setConfig(),
      //    beat: beat(props.clock).beat,
      // });
      // const mat = wobble.mesh.material as THREE.MeshPhysicalMaterial;
      // mat.iridescence = MATERIAL_CONFIG.iridescence!;
      // mat.metalness = MATERIAL_CONFIG.metalness!;
      // mat.roughness = MATERIAL_CONFIG.roughness!;
      // mat.transmission = MATERIAL_CONFIG.transmission!;
      // mat.thickness = MATERIAL_CONFIG.thickness!;

      updateParticle(props, {
         ...setParticleConfig(),
         alphaMap: noise,
      });

      updateGUI();
   });

   return (
      <mesh>
         <OrbitControls />
         <Environment files={"/snowpark.exr"} background={true} />
         {/* <primitive object={wobble.mesh} /> */}
         <primitive object={particles.points} />
         {/* <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial key={FxMaterial.key} u_fx={noise} />
         </mesh> */}
      </mesh>
   );
};
