"use client";

import * as THREE from "three";
import { useFrame, useThree  ,createPortal, Size} from "@react-three/fiber";
import {   
   useParticle,
} from "@/packages/use-shader-fx/src";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";

const setGUI = (gui: GUI) => {
};


const initParticleBufferGeo = (texSize:Size):THREE.BufferGeometry => {
    // Fibonacci球面配置
      const points = 4000; // 配置するパーティクルの数
      const size = .2; // pc
    // const size = 200; // sp
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const angleIncrement = Math.PI * 2 * goldenRatio;
   
    // BufferGeometryとFloat32Arrayを使用して頂点データを保持    
    const positions = new Float32Array(points * 3); // 各頂点にはx, y, zの3つの値があるため
   
   for (let i = 0; i < points; i++) {
      const t = i / points;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth) * (texSize.width / texSize.height);
      const z = Math.cos(inclination);
   
      // positions配列に頂点の位置データをセット
      positions[i * 3] = x * size;
      positions[i * 3 + 1] = y  * size;
      positions[i * 3 + 2] = z * size;
   }   

   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
   
   return geometry;
}


const morphPattern1Buffer = (texSize:Size):Float32Array => {
   const count = 100;
   const arr = [];
   for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {         
         arr.push(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1            
         );
      }
   }
   const positions = new Float32Array(arr);   
   return positions;
}

const morphPattern2Buffer = (texSize:Size):Float32Array => {
   const count = 200;
   const arr = [];
   
   // 円筒状にランダムに配置
   for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
         const r = 0.5;
         const theta = Math.random() * Math.PI * 2;
         const phi = Math.random() * Math.PI * 2;
         const x = r * Math.cos(theta);
         const y = r * Math.sin(theta);
         const z = r * Math.sin(phi);
         arr.push(x, y, z);
      }
   }

   const positions = new Float32Array(arr);   
   return positions;
}

export const Playground = () => {
   const updateGUI = useGUI(setGUI);   


   const { size, dpr,camera } = useThree((state) => { 
      return { size: state.size, dpr: state.viewport.dpr,camera:state.camera };
   });


   const [updateParticle,setParticle,{points,scene:particleScene,output,camera:pCam}] = useParticle({size,dpr});


   const morphList = [morphPattern1Buffer(size), morphPattern2Buffer(size)];    
   
   setParticle({
      initGeometry: initParticleBufferGeo(size),
      morphTargets: morphList,
   })

   useFrame((props) => {         
      updateParticle(props, {
         morphProgress: (props.mouse.x + 1.0)  / 2.0 *  (morphList.length)
      });
      
      updateGUI();
   });

   return (
      <>         
      {/* 
         {createPortal(
            <mesh>
               <sphereGeometry args={[10, 10, 10]} />
               <meshBasicMaterial color={"hotpink"} />
            </mesh>,
            particleScene
         )} */}
         
         <mesh>
         <planeGeometry args={[2, 2]} />
         <shaderMaterial            
            vertexShader={`
					varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 1.0);
						}
						`}
            fragmentShader={`
						precision highp float;
						varying vec2 vUv;
						uniform sampler2D u_fx;
						
						void main() {
							vec2 uv = vUv;

							gl_FragColor = texture2D(u_fx, uv);
						}
					`}
            uniforms={{
               u_fx: { value: output },
            }}
         />
      </mesh>
      </>
   ) 
};
