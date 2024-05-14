"use client";

import * as THREE from "three";
import { Environment, OrbitControls, useGLTF, useFBX } from "@react-three/drei";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useStickers } from "./useStickers";

export const Playground = () => {
   const { stickerMap, setStickerState, normalMap } = useStickers();
   // const normalMap = useLoader(THREE.TextureLoader, [
   //    "/stickers/decal-normal.jpg",
   // ]);
   // const banana = useFBX(`/model/apple.fbx`) as any;
   // const { nodes } = useGLTF(
   //    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf"
   // );
   // console.log(nodes.Suzanne);

   return (
      <mesh>
         <mesh onClick={(e) => setStickerState(e.uv!)}>
            <icosahedronGeometry args={[2, 20]} />
            <meshPhysicalMaterial
               map={stickerMap}
               normalMap={normalMap}
               normalScale={new THREE.Vector2(1, 1)}
               // displacementMap={normalMap}
               // displacementScale={2}
               // ここからの設定はmapのalphaを乗算することでmapだけに適用される仕組み
               roughness={1}
               clearcoat={1}
               iridescence={1}
               metalness={1}
               iridescenceIOR={1}
               iridescenceThicknessRange={[0, 1400]}
               // ここまで
               onBeforeCompile={(shader) => {
                  // mapのalphaをfloat変数に格納
                  shader.fragmentShader = shader.fragmentShader.replace(
                     "#include <map_fragment>",
                     `
							#include <map_fragment>
							float customMapAlpha = sampledDiffuseColor.a;
						`
                  );
                  // iridescenceにmapのalphaをかける（mapだけiridescenceする）
                  shader.fragmentShader = shader.fragmentShader.replace(
                     "#include <lights_fragment_begin>",
                     `
							#include <lights_fragment_begin>
							material.iridescenceFresnel *= customMapAlpha;
							material.iridescenceF0 *= customMapAlpha;
						`
                  );
                  // クリアコートにmapのalphaをかける（mapだけclearcoatする）
                  shader.fragmentShader = shader.fragmentShader.replace(
                     "outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;",
                     `
               		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat * customMapAlpha;
               	`
                  );
                  // roughnessにmapのalphaをかける（mapだけroughnessする）
                  shader.fragmentShader = shader.fragmentShader.replace(
                     "#include <lights_physical_fragment>",
                     `
							#include <lights_physical_fragment>
							material.roughness = clamp(material.roughness * customMapAlpha,.24,1.);
						`
                  );

                  // metalnessにmapのalphaをかける（mapだけmetalnessする。あるいは強くする）
                  shader.fragmentShader = shader.fragmentShader.replace(
                     "#include <metalnessmap_fragment>",
                     `
							#include <metalnessmap_fragment>
							metalnessFactor *= customMapAlpha;
						`
                  );
               }}
            />
         </mesh>
         <Environment preset="warehouse" environmentIntensity={0.8} />
         {/* <mesh scale={100}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshBasicMaterial map={sticker} side={THREE.BackSide} />
         </mesh> */}
         <OrbitControls />
      </mesh>
   );
};
