"use client";

import { Environment } from "@react-three/drei";
import { useStickers } from "./useStickers";

export const Playground = () => {
   const { sticker, setStickerState } = useStickers();

   return (
      <mesh
         // geometry={balloon.nodes.ball.geometry}
         onClick={(e) => {
            setStickerState(e.uv!);
         }}>
         <Environment preset="city" />
         <icosahedronGeometry args={[2, 20]} />
         <meshPhysicalMaterial
            map={sticker}
            // ここからの設定はmapのalphaを乗算することでmapだけに適用される仕組み
            roughness={1}
            clearcoat={1}
            iridescence={1}
            metalness={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            // ここまで
            // onBeforeCompile={(shader) => {
            //    //mapのalphaをfloat変数に格納;
            //    shader.fragmentShader = shader.fragmentShader.replace(
            //       "#include <map_fragment>",
            //       `
            //    		#include <map_fragment>
            //    		float customMapAlpha = sampledDiffuseColor.a;
            //    	`
            //    );
            //    // iridescenceにmapのalphaをかける（mapだけiridescenceする）
            //    shader.fragmentShader = shader.fragmentShader.replace(
            //       "#include <lights_fragment_begin>",
            //       `
            //    		#include <lights_fragment_begin>
            //    		material.iridescenceFresnel *= customMapAlpha;
            //    		material.iridescenceF0 *= customMapAlpha;
            //    	`
            //    );
            //    // クリアコートにmapのalphaをかける（mapだけclearcoatする）
            //    shader.fragmentShader = shader.fragmentShader.replace(
            //       "outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;",
            //       `
            //    		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat * customMapAlpha;
            //    	`
            //    );
            //    // roughnessにmapのalphaをかける（mapだけroughnessする）
            //    shader.fragmentShader = shader.fragmentShader.replace(
            //       "#include <lights_physical_fragment>",
            //       `
            //    		#include <lights_physical_fragment>
            //    		material.roughness = clamp(material.roughness * customMapAlpha,.24,1.);
            //    	`
            //    );
            //    // metalnessにmapのalphaをかける（mapだけmetalnessする。あるいは強くする）
            //    shader.fragmentShader = shader.fragmentShader.replace(
            //       "#include <metalnessmap_fragment>",
            //       `
            //    		#include <metalnessmap_fragment>
            //    		metalnessFactor *= customMapAlpha;
            //    	`
            //    );
            //    console.log(shader.fragmentShader);
            // }}
         />
      </mesh>
   );
};
