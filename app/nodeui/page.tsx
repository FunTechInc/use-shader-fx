"use client";
import s from './index.module.scss';
import '@xyflow/react/dist/style.css';

import React,{
   useCallback,
   useEffect
} from 'react';
import { 
   ReactFlow,
   useNodesState,
   useEdgesState,
   addEdge,
   Node,  
} from '@xyflow/react';


// Nodes
// Noise
import NoiseNode, {NoiseInitParams} from './nodes/noise'

const nodeTypes = { noiseNode: NoiseNode };


// https://reactflow.dev/api-reference/types/node
const initialNodes:Node[] = [
   // { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
   // { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
   { 
      id: '3', 
      position: { x: 0, y: 200 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: {...NoiseInitParams}
      }
   },
 ];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


export default function Page() {

   // 各ノードのパラメータはzustandで管理
   // それをedgesとnodesが変更した時にコンパイルする

   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
   return (
      <div className={s.page}>
         <ReactFlow 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            // onConnect={onConnect}
         />
      </div>
   )
}
