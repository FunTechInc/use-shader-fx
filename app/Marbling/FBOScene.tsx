import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useFBO, shaderMaterial } from "@react-three/drei";
import { useWindowResizeObserver } from "@funtech-inc/spice";
import vertexShader from "./shader/main.vert";
import fragmentSahder from "./shader/main.frag";
import postVertexShader from "./shader/post.vert";
import postFragmentShader from "./shader/post.frag";
import { distortionState, TEXTURE_RATIO } from "./store";
import testVertexShader from "./shader/test.vert";
import testFragmentSahder from "./shader/test.frag";
import test2VertexShader from "./shader/test2.vert";
import test2FragmentSahder from "./shader/test2.frag";
import { useSetGUI } from "./hooks/setGUI";
import { useAppStore } from "../_context/useAppStore";
import { BaseShaderMaterial, TBaseShaderUniforms } from "./BaseShaderMaterial";
import { FlowmapMaterial, TFlowmapUniforms } from "./FlowmapMaterial";
extend({ BaseShaderMaterial, FlowmapMaterial });

export const FBOScene = () => {
   const renderTarget = useFBO(); //TODO：ここのセッティング読む
   const flowmapRef = useRef<TFlowmapUniforms>();
   const baseShaderRef = useRef<TBaseShaderUniforms>();

   //てきすチャーの読み込み
   const [noiseTexture, bgTexure0, bgTexure1] = useLoader(THREE.TextureLoader, [
      "noiseTexture.jpg",
      "sample.jpg",
      "sample2.jpg",
   ]);

   useFrame((props) => {
      const { gl, scene, clock, camera, pointer } = props;
      gl.setRenderTarget(renderTarget);
      gl.render(scene, camera);
      gl.setRenderTarget(null);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         {/* <flowmapMaterial
            key={FlowmapMaterial.key}
            ref={flowmapRef}
            u_bufferTexture={renderTarget.texture}
         />
         <baseShaderMaterial
            key={BaseShaderMaterial.key}
            ref={baseShaderRef}
            u_resolution={
               new THREE.Vector2(window.innerWidth, window.innerHeight)
            }
            u_noiseTexture={noiseTexture}
            u_bgTexture0={bgTexure0}
            u_bgTexture1={bgTexure1}
            u_bufferTexture={renderTarget.texture}
         /> */}
         <rawShaderMaterial
            uniforms={{}}
            vertexShader={testVertexShader}
            fragmentShader={testFragmentSahder}
         />
         <rawShaderMaterial
            uniforms={{}}
            vertexShader={test2VertexShader}
            fragmentShader={test2FragmentSahder}
         />
      </mesh>
   );
};
