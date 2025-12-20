import { useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  MarkerType,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { DependencyGraph } from '../types';

interface DependencyGraphFlowProps {
  dependencyGraph: DependencyGraph;
}

export default function DependencyGraphFlow({ dependencyGraph }: DependencyGraphFlowProps) {
  // Convert graph data to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodeMap = new Map<string, number>();
    dependencyGraph.nodes.forEach((node, index) => {
      nodeMap.set(node, index);
    });

    // Calculate positions in a radial or hierarchical layout
    const nodes: Node[] = dependencyGraph.nodes.map((node, index) => {
      const totalNodes = dependencyGraph.nodes.length;
      const angle = (2 * Math.PI * index) / totalNodes;
      const radius = Math.max(150, totalNodes * 30);

      return {
        id: node,
        data: { label: node },
        position: {
          x: 250 + radius * Math.cos(angle),
          y: 250 + radius * Math.sin(angle),
        },
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: '1px solid #4a5568',
          borderRadius: '8px',
          padding: '10px 15px',
          fontSize: '12px',
          fontFamily: 'monospace',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        },
      };
    });

    const edges: Edge[] = dependencyGraph.edges.map((edge, index) => ({
      id: `e-${index}-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#64748b',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b',
        width: 20,
        height: 20,
      },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [dependencyGraph]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background
          color="#475569"
          gap={16}
          size={1}
          className="bg-slate-900"
        />
        <Controls
          className="bg-slate-800 border border-slate-700"
        />
        <MiniMap
          nodeColor="#667eea"
          maskColor="rgba(0, 0, 0, 0.6)"
          className="bg-slate-800 border border-slate-700"
          style={{ backgroundColor: '#1e293b' }}
        />
      </ReactFlow>
    </div>
  );
}

