"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   Size,
} from "@react-three/fiber";
import { useBeat, useFluid, usePointer } from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { CONFIG as HomeConfig } from "../_home/Playground";
import { OrbitControls, useGLTF } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import wobbleVertexShader from "./vert.glsl";
import wobbleFragmentShader from "./frag.glsl";
import { mergeVertices } from "three-stdlib";

extend({ FxMaterial });

const uniforms = {
   uTime: new THREE.Uniform(0),
   uPositionFrequency: new THREE.Uniform(0.5),
   uTimeFrequency: new THREE.Uniform(0.2),
   uStrength: new THREE.Uniform(0.9),
   uWarpPositionFrequency: new THREE.Uniform(0.2),
   uWarpTimeFrequency: new THREE.Uniform(0.2),
   uWarpStrength: new THREE.Uniform(0.2),
   uColorA: new THREE.Uniform(new THREE.Color("white")),
   uColorB: new THREE.Uniform(new THREE.Color("black")),
   uBaloon: new THREE.Uniform(0),
   uFx: new THREE.Uniform(new THREE.Texture()),
};

export const Playground = () => {
   const { size, viewport, scene: rootScene, camera } = useThree();

   // camera.position.set(0, 0, 2);

   // const { scene } = useGLTF(
   //    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf"
   // );

   const [updateFluid, setFluid, fluid] = useFluid({ size, dpr: viewport.dpr });

   const mesh = useMemo(() => {
      const material = new CustomShaderMaterial({
         // CSM
         baseMaterial: THREE.MeshPhysicalMaterial,
         vertexShader: wobbleVertexShader,
         fragmentShader: wobbleFragmentShader,
         uniforms: uniforms,
         silent: true,

         // MeshPhysicalMaterial
         metalness: 0.9,
         roughness: 0.5,
         color: "#ffffff",
         transmission: 0,
         ior: 1.5,
         thickness: 1.5,
         transparent: true,
         wireframe: false,
      });
      const depthMaterial = new CustomShaderMaterial({
         // CSM
         baseMaterial: THREE.MeshDepthMaterial,
         vertexShader: wobbleVertexShader,
         uniforms: uniforms,
         silent: true,

         // MeshDepthMaterial
         depthPacking: THREE.RGBADepthPacking,
      });
      let geometry = new THREE.IcosahedronGeometry(
         2.5,
         50
      ) as THREE.BufferGeometry;
      // let geometry = scene.children[0].geometry as THREE.BufferGeometry;

      geometry = mergeVertices(geometry);
      geometry.computeTangents();

      const wobble = new THREE.Mesh(geometry, material);
      wobble.customDepthMaterial = depthMaterial;
      wobble.receiveShadow = true;
      wobble.castShadow = true;
      return wobble;
   }, []);

   const beat = useBeat(140);
   const updatePointer = usePointer();

   const raycaster = useMemo(() => new THREE.Raycaster(), []);
   const rayCursor = useRef<THREE.Vector2 | null>(null);

   useFrame((props) => {
      const b = beat(props.clock);
      updateFluid(props);
      mesh.material.uniforms.uTime.value = b.beat;

      raycaster.setFromCamera(props.pointer, camera);
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) {
         const uv = intersects[0]?.uv as THREE.Vector2;
         if (!uv) return;
         rayCursor.current = uv.multiplyScalar(2).subScalar(1);
      }
      if (rayCursor.current) {
         mesh.material.uniforms.uFx.value = updateFluid(props, {
            pointerValues: updatePointer(rayCursor.current),
         });
      }
   });

   return (
      <mesh>
         <ambientLight />
         <directionalLight />
         <OrbitControls />
         <primitive object={mesh} position={[0, 0, 0]} />
      </mesh>
   );
};
