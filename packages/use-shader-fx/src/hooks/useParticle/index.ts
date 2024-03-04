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


// maxLengthに合わせて配列を埋める関数
const fillPositiionArray = (arr: Float32Array, maxLength: number):Float32Array => {
   const diff = (maxLength - arr.length) / 3;
   const positionNum = Math.floor(arr.length / 3);
   const addArray = [];   
   for (let i = 0; i < diff; i++) {
      const index = i % positionNum;
      addArray.push(
         arr[index * 3],
         arr[index * 3 + 1],
         arr[index * 3 + 2]
      );
   }
   const oldArray = Array.from(arr);
   return new Float32Array([...oldArray, ...addArray]);
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

         
         // 配列の中身が一番多いものの長さを取得         
         const maxLength = Math.max(...[...targetsList,params.initGeometry!.attributes.position.array].map((arr) => arr.length));
         
         // positionの長さを揃える         
         const arr = fillPositiionArray(params.initGeometry!.attributes.position.array as Float32Array, maxLength);         
         points.geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));      
         
         let stringToAddToMorphAttibutes = '';
         let stringToAddToMortAttibutesList = '';         
         targetsList.forEach((arr, index) => {
            // 長さを揃える
            const target = fillPositiionArray(arr, maxLength);
            // morphTargetをgeometryに追加
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
            `vec3 attibutesList[${targetsList.length + 1}] = vec3[](position${stringToAddToMortAttibutesList});`
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
