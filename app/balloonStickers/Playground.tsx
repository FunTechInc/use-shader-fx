"use client";

import * as THREE from "three";
import { memo } from "react";
import { Environment, OrbitControls, useGLTF, useFBX } from "@react-three/drei";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { useStickers } from "./useStickers";
import { CanvasState } from "./CanvasState";

const Background = memo(({ stickerMap }: { stickerMap: THREE.Texture }) => {
   return (
      <>
         <Environment preset="warehouse" environmentIntensity={0.8} />
         <mesh scale={100}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshBasicMaterial
               color={new THREE.Color(0x333333)}
               map={stickerMap}
               side={THREE.BackSide}
            />
         </mesh>
      </>
   );
});
Background.displayName = "Background";

const StickerBall = memo(
   ({
      stickerMap,
      normalMap,
   }: {
      stickerMap: THREE.Texture;
      normalMap: THREE.Texture;
   }) => {
      const canvasState = CanvasState.getInstance();
      const BASE_ROUGHNESS = 0.4;
      return (
         <mesh
            onClick={(e) => {
               canvasState.setState(e.uv!, e.point!);
            }}
            onPointerOver={(e) => (canvasState.cursorState.isOver = true)}
            onPointerOut={(e) => (canvasState.cursorState.isOver = false)}
            onPointerMove={(e) => {
               canvasState.cursorState.point.set(e.offsetX, e.offsetY);
            }}>
            <icosahedronGeometry args={[2, 20]} />
            <meshPhysicalMaterial
               map={stickerMap}
               normalMap={normalMap}
               // normalScale={new THREE.Vector2(2, 2)}
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
								material.roughness = clamp(material.roughness * customMapAlpha,${BASE_ROUGHNESS},1.);
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
      );
   }
);

StickerBall.displayName = "StickerBall";

export const Playground = () => {
   const { stickerMap, normalMap, isReady } = useStickers();
   const canvasState = CanvasState.getInstance();
   useFrame(({ camera }, delta) => {
      if (!isReady) {
         return;
      }
      if (canvasState.state.cameraPoint.z < 4) {
         canvasState.state.cameraPoint.z += delta;
      }
      camera.position.lerp(canvasState.state.cameraPoint, 0.16);
      camera.lookAt(0, 0, 0);
   });
   return (
      <mesh visible={isReady}>
         <StickerBall stickerMap={stickerMap} normalMap={normalMap} />
         <Background stickerMap={stickerMap} />
         <OrbitControls />
      </mesh>
   );
};
