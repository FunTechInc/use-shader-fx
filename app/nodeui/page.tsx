"use client";
import s from './index.module.scss';
import '@xyflow/react/dist/style.css';
// import { useShallow } from 'zustand/s';


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
   applyNodeChanges,
   applyEdgeChanges
} from '@xyflow/react';

import NoiseNode, {NoiseInitParams} from './nodes/noise'

const nodeTypes = { noiseNode: NoiseNode };


const initialNodes:Node[] = [   
   { 
      id: '2', 
      position: { x: 100, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: {...NoiseInitParams}
      }
   },
   { 
      id: '3', 
      position: { x: 500, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: {...NoiseInitParams}
      }
   },
 ];
const initialEdges = [{ id: 'e2-3', source: '2', target: '3' }];


export default function Page() {

   // 各ノードのパラメータはzustandで管理
   // それをedgesとnodesが変更した時にコンパイルする

   const [nodes, setNodes] = useNodesState(initialNodes);
   const [edges, setEdges] = useEdgesState(initialEdges);

   const onNodesChange = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes],
    );
    const onEdgesChange = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges],
    );
    const onConnect = useCallback(
      (connection) => setEdges((eds) => addEdge(connection, eds)),
      [setEdges],
    );  
   
  
   return (
      <div className={s.page}>
         <ReactFlow 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            onConnect={onConnect}
         />
      </div>
   )
}
