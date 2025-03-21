"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useBuffer, useNoise } from "@/packages/use-shader-fx/src";
import { TextureRenderer } from "@/app/_components/WebGL/TextureRenderer";
import useStore from "./store";
import { useEffect } from "react";
import { useTexture } from "@react-three/drei";

export const Playground = () => {
   const { size } = useThree();
   const {nodes,edges, pipeline, setPipeline} = useStore((state) => state);
   const [mask] = useTexture(["/momo.jpg"]);   

   const output = useBuffer({
      size,
      dpr: 0.5,
   })
   
   output.setValues({
      texture: {
         src: mask,
      }
   })
   
   pipeline.push(output);

   // 各フックのNodeのパラメーターを更新する
   useEffect(() => {
      nodes.forEach((node) => {
         console.log(node.id);
         if(node.id === "output") {            
            output.setValues(node.data.params);
         }      
      })
   },[nodes])

   // レンダリングのプロセスを更新する
   useEffect(() => {
      // id=outputのNodeは必ず存在する
      // outputが接続されているEdgeを取得する
      const lastEdge = edges.find((edge) => edge.target === "output");

      // console.log(lastEdge);

      // if(lastEdge) {

      // } else {
      //    output.setValues({
      //       texture: {
      //          src: undefined,
      //       }
      //    })
      // }




   },[edges, output])
   

   useFrame((state) => {         

      pipeline.forEach((fx:any) => {
         fx.render(state);
      })
   });

   return <TextureRenderer src={output.texture} />;
};
