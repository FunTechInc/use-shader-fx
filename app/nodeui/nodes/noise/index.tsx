import { useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import s from './style.module.scss';

import { GUI } from 'lil-gui';
import { useGUI } from '@/utils/useGUI';

 
const handleStyle = { left: 10 };
 
function NoiseNode({ data }) {
  
  const parametersEl = useRef<HTMLDivElement>(null);  

    const setupGUI = useCallback(
        (gui: GUI) => {

        },
        [data,parametersEl]
    );
    const updateBasicFxGUI = useGUI(setupGUI, "Noise", parametersEl);
 
  return (
    <div className={s.node}>
      <Handle type="target" position={Position.Left} />
      <div className={s.nodeHead}>
        Noise
      </div>
      <div className={s.nodeBody} ref={parametersEl}>
        aaa
      </div>
      
      <Handle type="source" position={Position.Right} id="a" />
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      /> */}
    </div>
  );
}

export default NoiseNode;