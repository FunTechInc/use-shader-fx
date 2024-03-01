import { useCallback, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { usePoints } from "./usePoints";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { useParams } from "../../utils/useParams";
import { HooksProps, HooksReturn } from "../types";

import vertexShader from "./shader/main.vert";


export type ParticleParams = {
   initGeometry?: THREE.BufferGeometry;
   pointSize?: number;
   displacement?: THREE.Texture | THREE.Texture[];
   attributes?: {
      displacement?: THREE.BufferAttribute;
      color?: THREE.BufferAttribute;
      size?: THREE.BufferAttribute;      
   };
   fxMap?: THREE.Texture;
   morphTargets?: Float32Array[];
   morphProgress?: number;
};

export type ParticleObject = {
   scene: THREE.Scene;
   points: THREE.Points;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const PARTICLE_PARAMS: ParticleParams = {
   initGeometry: undefined,
   morphTargets: [],
   morphProgress: 0,   
};


export const useParticle = ({
   size,
   dpr,
}: HooksProps): HooksReturn<ParticleParams, ParticleObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);   
   const [material,points] = usePoints(scene);
   const camera = useCamera(size);   
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,      
      dpr,
   });


   const [params, setParams] = useParams<ParticleParams>(PARTICLE_PARAMS);

   useEffect(() => {      
      if (params.initGeometry)
         points.geometry = params.initGeometry;   
   },[params.initGeometry])


   // morphTargetsがある場合はそれをgeometryに追加
   // その後、attributeを利用できるようにvertexShaderを更新
   useEffect(() => {
      const targetsList = params.morphTargets;
      let baseVertexShader = vertexShader;
      
      if(targetsList && targetsList.length > 0) {

         const all = [...targetsList,params.initGeometry!.attributes.position.array];         

         // 配列の中身が一番多いものの長さを取得して、それに合わせて他の配列を伸ばす
         const maxLength = Math.max(...all.map((arr) => arr.length));                  
         all.forEach((arr,i) => {
            if (arr.length < maxLength) {
               const diff = (maxLength - arr.length) / 3 ;
               const addArray = [];
               for (let i = 0; i < diff; i++) {
                  addArray.push(
                     arr[0],
                     arr[1],
                     arr[2]
                  )
               }
               const oldArray =  Array.from(arr);
               all[i] = new Float32Array([...oldArray, ...addArray]);
            }
         })         
         

         // pointsのgeometryにattibuteとしてmorphTargetsを追加
         
         let stringToAddToMorphAttibutes = '';
         let stringToAddToMortAttibutesList = '';         
         targetsList.forEach((target, index) => {
            points.geometry.setAttribute(`morphTarget${index}`, new THREE.BufferAttribute(target, 3));            
            // vertexShaderに書き込むattributeを追加
            stringToAddToMorphAttibutes += `attribute vec3 morphTarget${index};\n`;     
            stringToAddToMortAttibutesList += ` ,morphTarget${index}`; 
         })

         // morphTargetsの数をuniformとして追加                  
         setUniform(material, "uMorphLength", targetsList.length);

         // vertexShaderに追加するattributeを追加
         baseVertexShader = baseVertexShader.replace(
            `// #include <morphAttibutes>`,
            stringToAddToMorphAttibutes
         );
         baseVertexShader = baseVertexShader.replace(
            `// #include <morphAttibutesList>`,
            `vec3 attibutesList[${all.length}] = vec3[](position${stringToAddToMortAttibutesList});`
         );
                  
      } else {         
         setUniform(material, "uMorphLength", 0);
         baseVertexShader = baseVertexShader.replace(
            `// #include <morphAttibutesList>`,
            'vec3 attibutesList[1] = vec3[](position);'
         );                  
      }
      material.vertexShader = baseVertexShader;
      material.needsUpdate = true;

   },[params.morphTargets])


   const updateFx = useCallback(
      (props: RootState, updateParams?: ParticleParams) => {
         const { gl, clock } = props;

         updateParams && setParams(updateParams);        

         setUniform(material, "uTime", clock.getElapsedTime());                  
         setUniform(material, "uMorphProgress", params.morphProgress!);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, material, setParams, params]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         points: points,
         material: material,         
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
