import { useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import s from './style.module.scss';
import { useEffect } from 'react';
import * as THREE from 'three';

import { GUI } from 'lil-gui';
import { useGUI } from '@/utils/useGUI';
import useStore from '../../store';
import { BufferMaterialProps, BufferProps, BufferValues } from '@/packages/use-shader-fx/types';
const FIT_TYPE = ["fill", "cover", "contain"];


const PARAMS = {
  texture: {
    fit: 0,    
  }  
}

export const OutputNodeParams:BufferValues = {
  texture: {
    src: new THREE.Texture(),
    fit: 0,
  }
};
 
function OutputNode({ data: {
  params
}, id }: {
  id: string,
  data: {
    params: BufferValues,    
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
            // gui.add(params.texture, 'fit')
            gui
            .add(PARAMS.texture, "fit", FIT_TYPE)
            .name("fit")
            .onChange((v: string) =>  {
              if(params.texture) params.texture.fit = FIT_TYPE.indexOf(v) as 0 | 1 | 2;             
            })

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
        Output
      </div>
      <div className={s.nodeBody}>
        <div className={`${s.nodeSide} draghandle`}>          
          <div className={s.nodeSideItem} style={{top: '50%'}}>
            texture
          </div>          
          <Handle id="texture" type="target" position={Position.Left} className={s.nodeTargetEdge} style={{ top: '50%' }}  />          
        </div>
        <div className={s.nodeMain} ref={parametersEl}>

        </div>
        <div className={`${s.nodeOut} draghandle`}>
        </div>
      </div>
    </div>
  );
}

export default OutputNode;