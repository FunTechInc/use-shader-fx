"use client";
import s from './index.module.scss';
import '@xyflow/react/dist/style.css';

import React,{
   useCallback
} from 'react';
import { 
   ReactFlow,
   useNodesState,
   useEdgesState,
   addEdge,  
} from '@xyflow/react';


const initialNodes = [
   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
 ];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


export default function Page() {
   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
   return (
      <div className={s.page}>
         <ReactFlow 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            // onConnect={onConnect}
         />
      </div>
   )
}
