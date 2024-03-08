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
import {
   useBeat,
   useFluid,
   usePointer,
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { CONFIG as HomeConfig } from "../_home/Playground";
import {
   OrbitControls,
   useGLTF,
   Environment,
   MeshTransmissionMaterial,
} from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import wobbleVertexShader from "./vert.glsl";
import wobbleFragmentShader from "./frag.glsl";
import { mergeVertices } from "three-stdlib";

extend({ FxMaterial });

const CONFIG: Wobble3DParams = structuredClone(WOBBLE3D_PARAMS);
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
   gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   return gui;
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as Wobble3DParams;
};

/*===============================================
TODO : 
- geometryはbufferでなんでも許容する
- まずはMeshPhysicalMaterialで、シェーダをカスタムコンパイルする
- いまの機能全部
	- colorは4色線形保管
- displacement
	- これは頂点を操作する必要があるからあり
- depthMaterial
	- たぶん陰がwobbleにならないのを、これで解決してる感じだな。hookから吐き出したい
- たぶんmaterialは何でも受け付けられる。
	- csmと同様、ある種のmaterialの時にだけshaderを対応させればいい

v mapMixっていうuniformのつくろっと
	v デフォルトの色とカスタムしたカラーのmix率
- meshTransmissionMaterialの拡張版としよう
	- なんか透過したときに、rgb shiftしてシャボン玉みたいにできる感じ
	
	- chromatic aberation
	- anisotropicBlur
	- distortion
	- distortionScale
	- temporalDistortion
===============================================*/

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const { size, viewport, scene: rootScene, camera } = useThree();
   const [funkun, funkunAlpha] = useLoader(THREE.TextureLoader, [
      "/funkun.jpg",
      "/funkun-alpha.jpg",
   ]);
   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: viewport.dpr,
   });
   const [updateWobble, wobble] = useCreateWobble3D({
      scene: false,
      // geometry: new THREE.SphereGeometry(1, 32, 32),
      // baseMaterial: THREE.MeshToonMaterial,
      materialParameters: {
         // metalness: 0.4,
         // roughness: 0.5,
         // color: "#ffffff",
         transmission: 1.5,
         // ior: 1.5,
         thickness: 4,
         transparent: true,
         // wireframe: false,
         // side: THREE.DoubleSide,
         map: fluid,
      },
   });

   useEffect(() => {
      wobble.mesh.geometry = mergeVertices(wobble.mesh.geometry);
      wobble.mesh.geometry.computeTangents();
      // wobble.mesh.customDepthMaterial = depthMaterial;
      wobble.mesh.receiveShadow = true;
      wobble.mesh.castShadow = true;
   }, [wobble]);

   const updatePointer = usePointer();
   const refPointer = useRef(new THREE.Vector2(0, 0));
   const handlePointerMove = (e: any) => {
      if (!e?.pointer) {
         return;
      }
      refPointer.current = e.pointer;
   };

   useFrame((props) => {
      updateWobble(props, {
         ...setConfig(),
         // colorMix: 0,
      });
      updateFluid(props, {
         pointerValues: updatePointer(refPointer.current),
      });
      updateGUI();
   });

   return (
      <mesh>
         <ambientLight />
         <directionalLight scale={[2, 2, 2]} />
         <OrbitControls />
         <Environment preset="warehouse" background={true} />
         <primitive
            onPointerMove={handlePointerMove}
            object={wobble.mesh}
            position={[0, 0, 0]}
         />
         {/* <icosahedronGeometry args={[2, 50]} />
         <MeshTransmissionMaterial
            transmission={1}
            samples={4}
            backside
            thickness={4}
            // chromaticAberration={10.5}
            // anisotropicBlur={0}
            // distortion={10}
            distortionScale={10}
            temporalDistortion={10}
         /> */}
      </mesh>
   );
};

// export const Playground = () => {
//    const { size, viewport, scene: rootScene, camera } = useThree();

//    // camera.position.set(0, 0, 2);

//    // const funkun = useGLTF("/funkun.glb");
//    // const model = useGLTF(
//    //    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf"
//    // );

//    // console.log(model);

//    const [updateFluid, setFluid, fluid] = useFluid({ size, dpr: viewport.dpr });

//    const mesh = useMemo(() => {
//       const material = new CustomShaderMaterial({
//          // CSM
//          baseMaterial: THREE.MeshPhysicalMaterial,
//          vertexShader: wobbleVertexShader,
//          fragmentShader: wobbleFragmentShader,
//          uniforms: uniforms,
//          silent: true,

//          // MeshPhysicalMaterial
//          metalness: 0,
//          roughness: 0,
//          color: "#ffffff",
//          transmission: 1,
//          ior: 1.2,
//          thickness: 1.5,
//          transparent: true,
//          wireframe: false,
//       });
//       const depthMaterial = new CustomShaderMaterial({
//          // CSM
//          baseMaterial: THREE.MeshDepthMaterial,
//          vertexShader: wobbleVertexShader,
//          uniforms: uniforms,
//          silent: true,

//          // MeshDepthMaterial
//          depthPacking: THREE.RGBADepthPacking,
//       });
//       let geometry = new THREE.IcosahedronGeometry(
//          2.5,
//          50
//       ) as THREE.BufferGeometry;

//       geometry = mergeVertices(geometry);
//       geometry.computeTangents();

//       const wobble = new THREE.Mesh(geometry, material);
//       wobble.customDepthMaterial = depthMaterial;
//       wobble.receiveShadow = true;
//       wobble.castShadow = true;
//       return wobble;
//    }, []);

//    const beat = useBeat(140);
//    const updatePointer = usePointer();

//    const refPointer = useRef(new THREE.Vector2(0, 0));
//    const handlePointerMove = (e: any) =>
//       (refPointer.current = e.uv.multiplyScalar(2).subScalar(1));

//    useFrame((props) => {
//       const b = beat(props.clock);
//       updateFluid(props);
//       mesh.material.uniforms.uTime.value = b.beat;
//       mesh.material.uniforms.uFx.value = updateFluid(props, {
//          pointerValues: updatePointer(refPointer.current),
//       });
//    });

//    return (
//       <mesh>
//          <ambientLight />
//          <directionalLight />
//          <OrbitControls />
//          {/* <Environment preset="city" /> */}
//          {/* <Environment
//             preset="city"
//             background={true} // can be true, false or "only" (which only sets the background) (default: false)
//             blur={0} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
//             // files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
//             // path="/"
//             // preset={null}
//             // scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
//             // encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
//          /> */}
//          <primitive
//             onPointerMove={handlePointerMove}
//             object={mesh}
//             position={[0, 0, 0]}
//          />
//       </mesh>
//    );
// };
