import { useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import s from './style.module.scss';
import { useEffect } from 'react';

import { GUI } from 'lil-gui';
import { useGUI } from '@/utils/useGUI';
import useStore from '../../store';
// import { NoiseValues } from '@/packages/use-shader-fx/src';
// import { BASICFX_VALUES } from '@/packages/use-shader-fx/src';
import * as THREE from 'three';
 
export const BASICFX_VALUES = {
  mixSrc: {
    /*===============================================
      mixSrc
    ===============================================*/
    mixSrc: { value: false },
    mixSrc_src: { value: new THREE.Texture() },
    mixSrc_fit: { value: 0 },
    mixSrc_fitScale: { value: new THREE.Vector2(1, 1) },

    // uv
    mixSrc_uv: { value: false },
    mixSrc_uv_ch: { value: 0 },
    mixSrc_uv_factor: { value: 0 },
    mixSrc_uv_offset: { value: new THREE.Vector2(0, 0) },
    mixSrc_uv_radius: { value: 0.5 },
    mixSrc_uv_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixSrc_uv_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixSrc_uv_mixMap: { value: false },
    mixSrc_uv_mixMap_ch: { value: 0 },

    // color
    mixSrc_color: { value: false },
    mixSrc_color_factor: { value: 0 },
    mixSrc_color_radius: { value: 0.5 },
    mixSrc_color_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixSrc_color_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixSrc_color_mixMap: { value: false },
    mixSrc_color_mixMap_ch: { value: 0 },

    // alpha
    mixSrc_alpha: { value: false },
    mixSrc_alpha_factor: { value: 0 },
    mixSrc_alpha_radius: { value: 0.5 },
    mixSrc_alpha_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixSrc_alpha_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixSrc_alpha_mixMap: { value: false },
    mixSrc_alpha_mixMap_ch: { value: 0 },

  },
  mixDst: {
    /*===============================================
      mixDst
    ===============================================*/
    mixDst: { value: false },
    mixDst_src: { value: new THREE.Texture() },
    mixDst_fit: { value: 0 },
    mixDst_fitScale: { value: new THREE.Vector2(1, 1) },

    // uv
    mixDst_uv: { value: false },
    mixDst_uv_ch: { value: 0 },
    mixDst_uv_factor: { value: 0 },
    mixDst_uv_offset: { value: new THREE.Vector2(0, 0) },
    mixDst_uv_radius: { value: 0.5 },
    mixDst_uv_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixDst_uv_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixDst_uv_mixMap: { value: false },
    mixDst_uv_mixMap_ch: { value: 0 },

    // color
    mixDst_color: { value: false },
    mixDst_color_factor: { value: 0 },
    mixDst_color_radius: { value: 0.5 },
    mixDst_color_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixDst_color_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixDst_color_mixMap: { value: false },
    mixDst_color_mixMap_ch: { value: 0 },

    // alpha
    mixDst_alpha: { value: false },
    mixDst_alpha_factor: { value: 0 },
    mixDst_alpha_radius: { value: 0.5 },
    mixDst_alpha_position: { value: new THREE.Vector2(0.5, 0.5) },
    mixDst_alpha_range: { value: new THREE.Vector2(0.0, 1.0) },
    mixDst_alpha_mixMap: { value: false },
    mixDst_alpha_mixMap_ch: { value: 0 },
  },
  adjustments: {
    /*===============================================
      adjustments
    ===============================================*/
    // levels
    levels: { value: false },
    levels_shadows: { value: new THREE.Vector4(0, 0, 0, 0) },
    levels_midtones: { value: new THREE.Vector4(1, 1, 1, 1) },
    levels_highlights: { value: new THREE.Vector4(1, 1, 1, 1) },
    levels_outputMin: { value: new THREE.Vector4(0, 0, 0, 0) },
    levels_outputMax: { value: new THREE.Vector4(1, 1, 1, 1) },

    // contrast
    contrast: { value: false },
    factor: { value: new THREE.Vector4(1, 1, 1, 1) },

    // colorBalance
    colorBalance: { value: false },
    colorBalance_factor: { value: new THREE.Vector3(1, 1, 1) },

    // hsv
    hsv: { value: false },
    hsv_hueShift: { value: 0 },
    hsv_saturation: { value: 1 },
    hsv_brightness: { value: 1 },

    // posterize
    posterize: { value: false },
    posterize_levels: { value: new THREE.Vector4(0, 0, 0, 0) },

    // grayscale
    grayscale: { value: false },
    grayscale_weight: { value: new THREE.Vector3(0, 0, 0) },
    grayscale_duotone: { value: false },
    grayscale_duotone_color0: { value: new THREE.Color(0x000000) },
    grayscale_duotone_color1: { value: new THREE.Color(0xffffff) },
    grayscale_threshold: { value: -1 },
  }
};


export const NoiseInitParams = {     
    scale: 0.004,
    timeStrength: 0.3,
    noiseOctaves: 2,
    fbmOctaves: 2,
    warpOctaves: 2,
    warpDirection: new THREE.Vector2(2.0, 2.0),
    warpStrength: 8,


    // contrast
    contrast: {
      factor: new THREE.Vector4(1, 1, 1, 1),
    }    
};
 
function NoiseNode({ data: {
  params
}, id }: {
  id: string,
  data: {
    params: typeof NoiseInitParams,    
  },   
}) {        
  // console.log(id);  
  const {
    nodes,
    updateNodeParameter,    
  } = useStore(state => state);
  const parametersEl = useRef<HTMLDivElement>(null);  
  
    const setupGUI = useCallback(
        (gui: GUI) => {            
            gui.add(params, 'scale', 0, 1, 0.0001);
            gui.add(params, 'timeStrength', 0, 100, 0.0001);
            gui.add(params, 'noiseOctaves', 0, 10, 1);
            gui.add(params, 'fbmOctaves', 0, 10, 1);
            gui.add(params, 'warpOctaves', 0, 10, 1);
            gui.add(params, 'warpStrength', 0, 10, 0.1);
            gui.add(params.warpDirection, 'x', 0, 10, 0.1);
            gui.add(params.warpDirection, 'y', 0, 10, 0.1);


            // contrast      
            const contrast = gui.addFolder('contrast');      
            contrast.add(params.contrast.factor, 'x', 0, 5, 0.1);
            contrast.add(params.contrast.factor, 'y', 0, 5, 0.1);
            contrast.add(params.contrast.factor, 'z', 0, 5, 0.1);
            contrast.add(params.contrast.factor, 'w', 0, 5, 0.1);



            gui.onChange(({property}) => {              
              updateNodeParameter(id, params);
            })
        },
        [params, parametersEl]
    );
    
  const updateBasicFxGUI = useGUI(setupGUI, "Parameters", parametersEl);


 
  return (
    <div className={s.node}>
      <div className={`${s.nodeHead} draghandle`}>
        Noise
      </div>
      <div className={s.nodeBody}>
        <div className={`${s.nodeSide} draghandle`}>
          <div className={s.nodeSideItem} style={{top: '25%'}}>
            mixSrc
          </div>
          <div className={s.nodeSideItem} style={{top: '50%'}}>
            mixDst
          </div>
          <div className={s.nodeSideItem} style={{top: '75%'}}>
            mixMap
          </div>
          <Handle id="mixSrc" type="target" position={Position.Left} className={s.nodeTargetEdge} style={{ top: '25%' }}  />
          <Handle id="mixDst" type="target" position={Position.Left} className={s.nodeTargetEdge} style={{ top: '50%' }}  />
          <Handle id="mixMap" type="target" position={Position.Left} className={s.nodeTargetEdge} style={{ top: '75%' }}  />
        </div>
        <div className={s.nodeMain} ref={parametersEl}>

        </div>
        <div className={`${s.nodeOut} draghandle`}>
          Out
          <Handle type="source" position={Position.Right} id="out" style={{
            top: '50%',
            transform: 'translate(50%, -50%)',
          }} />          
        </div>
      </div>
    </div>
  );
}

export default NoiseNode;