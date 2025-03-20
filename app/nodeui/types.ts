import {
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type BuiltInNode,
  } from '@xyflow/react';
  
   
  export type AppNode = Node | BuiltInNode;
   
  export type AppState = {
    nodes: AppNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateNodeParameter: (nodeId: string, newParams: any) => void;
  };