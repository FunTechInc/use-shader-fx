"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
   useCreateMorphParticles,
   MorphParticlesParams,
   MORPHPARTICLES_PARAMS,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { OrbitControls, Environment } from "@react-three/drei";

extend({ FxMaterial });

const WOBBLE_CONFIG: Wobble3DParams = {
   ...structuredClone(WOBBLE3D_PARAMS),
   color0: new THREE.Color(0x000000),
   color1: new THREE.Color(0x000000),
   color2: new THREE.Color(0x000000),
   color3: new THREE.Color(0x000000),
   wobbleStrength: 0.35,
   wobbleTimeFrequency: 0.2,
   warpStrength: 0.2,
   colorMix: 0.3,
   chromaticAberration: 0.05,
   anisotropicBlur: 0.2,
   distortion: 0.3,
   distortionScale: 0.5,
   temporalDistortion: 0.3,
};

const MATERIAL_CONFIG: THREE.MeshPhysicalMaterialParameters = {
   iridescence: 0.1,
   metalness: 0.0,
   roughness: 0.0,
   transmission: 2,
   thickness: 1.2,
   transparent: true,
};

const PARTICLE_CONFIG: MorphParticlesParams = {
   ...structuredClone(MORPHPARTICLES_PARAMS),
   blurAlpha: 0.01,
   blurRadius: 0.6,
   pointSize: 0.4,
   sizeRandomIntensity: 1,
   sizeRandomMax: 2.5,
   sizeRandomMin: 0.8,
   sizeRandomTimeFrequency: 1,
   color0: new THREE.Color(0x000000),
   color1: new THREE.Color(0x000000),
   color2: new THREE.Color(0x000000),
   color3: new THREE.Color(0x000000),
   wobbleStrength: 0.6,
   warpStrength: 3,
   wobblePositionFrequency: 0.4,
   wobbleTimeFrequency: 0.4,
   warpTimeFrequency: 0.2,
};

const setGUI = (gui: GUI) => {
   const wobble = gui.addFolder("Wobble3D");
   wobble.addColor(WOBBLE_CONFIG, "color0");
   wobble.addColor(WOBBLE_CONFIG, "color1");
   wobble.addColor(WOBBLE_CONFIG, "color2");
   wobble.addColor(WOBBLE_CONFIG, "color3");
   wobble.add(WOBBLE_CONFIG, "wobbleStrength", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "warpStrength", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   // wobble.add(WOBBLE_CONFIG, "wobbleShine", 0, 5, 0.01);
   // wobble.add(WOBBLE_CONFIG, "samples", 0, 10, 1);
   wobble.add(WOBBLE_CONFIG, "colorMix", 0, 1, 0.01);
   wobble.add(WOBBLE_CONFIG, "chromaticAberration", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "anisotropicBlur", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "distortion", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "distortionScale", 0, 10, 0.01);
   wobble.add(WOBBLE_CONFIG, "temporalDistortion", 0, 10, 0.01);

   const mpm = gui.addFolder("MeshPhysicalMaterial");
   mpm.add(MATERIAL_CONFIG, "iridescence", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "metalness", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "roughness", 0, 1, 0.01);
   mpm.add(MATERIAL_CONFIG, "transmission", 0, 10, 0.01);
   mpm.add(MATERIAL_CONFIG, "thickness", 0, 10, 0.01);

   const particle = gui.addFolder("MorphParticles");
   particle.add(PARTICLE_CONFIG, "blurAlpha", 0, 1, 0.01);
   particle.add(PARTICLE_CONFIG, "blurRadius", 0, 2, 0.01);
   particle.add(PARTICLE_CONFIG, "pointSize", 0.01, 2, 0.01);
   particle.addColor(PARTICLE_CONFIG, "color0");
   particle.addColor(PARTICLE_CONFIG, "color1");
   particle.addColor(PARTICLE_CONFIG, "color2");
   particle.addColor(PARTICLE_CONFIG, "color3");
   particle.add(PARTICLE_CONFIG, "wobbleStrength", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "warpStrength", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "displacementIntensity", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "displacementColorIntensity", 0, 40, 0.01);
   particle.add(PARTICLE_CONFIG, "sizeRandomIntensity", 0, 10, 0.01);
   particle.add(PARTICLE_CONFIG, "sizeRandomTimeFrequency", 0, 3, 0.01);
   particle.add(PARTICLE_CONFIG, "sizeRandomMin", 0, 1, 0.01);
   particle.add(PARTICLE_CONFIG, "sizeRandomMax", 1, 2, 0.01);
   particle.add(PARTICLE_CONFIG, "divergence", -2, 2, 0.1);
   return gui;
};
const setParticleConfig = () => {
   return {
      ...PARTICLE_CONFIG,
   } as MorphParticlesParams;
};
const setWobbleConfig = () => {
   return {
      ...WOBBLE_CONFIG,
   } as Wobble3DParams;
};

export const Playground = () => {
   useGUI(setGUI);
   const { size, viewport, camera } = useThree();
   const [noise] = useLoader(THREE.TextureLoader, ["/noise.jpg"]);
   const [updateWobble, wobble] = useCreateWobble3D({
      geometry: useMemo(() => new THREE.IcosahedronGeometry(2.4, 10), []),
      materialParameters: MATERIAL_CONFIG,
      isCustomTransmission: true,
   });
   const [updateParticle, particles] = useCreateMorphParticles({
      size,
      dpr: viewport.dpr,
      geometry: useMemo(() => new THREE.IcosahedronGeometry(0.8, 10), []),
   });
   useMemo(() => {
      particles.points.material.blending = THREE.NormalBlending;
      camera.position.z = 8;
   }, [particles.points.material, camera]);
   useFrame((props) => {
      updateWobble(props, {
         ...setWobbleConfig(),
      });
      const mat = wobble.mesh.material as THREE.MeshPhysicalMaterial;
      mat.iridescence = MATERIAL_CONFIG.iridescence!;
      mat.metalness = MATERIAL_CONFIG.metalness!;
      mat.roughness = MATERIAL_CONFIG.roughness!;
      mat.transmission = MATERIAL_CONFIG.transmission!;
      mat.thickness = MATERIAL_CONFIG.thickness!;
      updateParticle(props, {
         ...setParticleConfig(),
         alphaMap: noise,
      });
   });

   return (
      <mesh>
         <OrbitControls />
         <Environment files={"/snowpark.exr"} background={true} />
         <primitive object={wobble.mesh} />
         <primitive object={particles.points} />
      </mesh>
   );
};

/*===============================================
simple version
===============================================*/
// export const Playground = () => {
//    const { size, viewport, camera } = useThree();
//    const [noise] = useLoader(THREE.TextureLoader, ["/noise.jpg"]);

// 	const [updateWobble, wobble] = useCreateWobble3D({
//       baseMaterial: THREE.MeshPhysicalMaterial,
//       geometry: useMemo(() => new THREE.IcosahedronGeometry(2.4, 10), []),
//       materialParameters: MATERIAL_CONFIG,
//    });
//    const [updateParticle, particles] = useCreateMorphParticles({
//       size,
//       dpr: viewport.dpr,
//       geometry: useMemo(() => new THREE.IcosahedronGeometry(0.8, 10), []),
//    });

// 	useEffect(() => {
//       particles.points.material.blending = THREE.NormalBlending;
//       camera.position.z = 8;
//       updateWobble(null, WOBBLE_CONFIG);
//       updateParticle(null, { ...PARTICLE_CONFIG, alphaMap: noise });
//    }, [particles.points.material, camera, updateWobble, updateParticle, noise]);
//    useFrame((props) => {
//       updateWobble(props);
//       updateParticle(props);
//    });

// 	return (
//       <mesh>
//          <OrbitControls />
//          <Environment files={"/snowpark.exr"} background={true} />
//          <primitive object={wobble.mesh} />
//          <primitive object={particles.points} />
//       </mesh>
//    );
// };
