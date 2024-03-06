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
   uStrength: new THREE.Uniform(0.1),
   uWarpPositionFrequency: new THREE.Uniform(0.2),
   uWarpTimeFrequency: new THREE.Uniform(0.2),
   uWarpStrength: new THREE.Uniform(0.2),
   uColorA: new THREE.Uniform(new THREE.Color("white")),
   uColorB: new THREE.Uniform(new THREE.Color("orange")),
   uBaloon: new THREE.Uniform(0),
   uFx: new THREE.Uniform(new THREE.Texture()),
};

/*===============================================
TODO : 
- onbeforeConopileを使って、meshPhusycalMaterialのuniforomsを更新する。
	- デフォルトで
	- 気が向いたらtoonShaderも追加する？
- isPrimitiveみたいな感じで、Object3Dをsceneに追加しないパターンもつくる。
	- Lightとかがあるから、primitiveで使う方がユースケース的にはあるよな
	- まあLightもuseEffectとかで追加できるから、isPrimitiveは例外的な使い方としよう。
- r3fはprimitiveをanmount時にsceneから削除するのかな？ 追加されてるobjectは自分でdisposeしないといけないのはわかる。
- あと、primitiveの場合は、useFrameとかも使えないのかな？

- 内部的にraycaster使ってonPointerMoveも更新関数に追加するとかありかもね。
===============================================*/

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

   const refPointer = useRef(new THREE.Vector2(0, 0));
   const handlePointerMove = (e: any) =>
      (refPointer.current = e.uv.multiplyScalar(2).subScalar(1));

   useFrame((props) => {
      const b = beat(props.clock);
      updateFluid(props);
      mesh.material.uniforms.uTime.value = b.beat;
      mesh.material.uniforms.uFx.value = updateFluid(props, {
         pointerValues: updatePointer(refPointer.current),
      });
   });

   return (
      <mesh>
         <ambientLight />
         <directionalLight />
         <OrbitControls />
         <primitive
            onPointerMove={handlePointerMove}
            object={mesh}
            position={[0, 0, 0]}
         />
      </mesh>
   );
};
