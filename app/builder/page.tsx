'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  Plus, 
  Save, 
  Play, 
  Settings, 
  Trash2, 
  ArrowLeft,
  Shield,
  Clock,
  Image,
  FileText,
  Calculator,
  Zap,
  Puzzle
} from 'lucide-react';

// Custom node types for different task types
const nodeTypes = {
  taskNode: TaskNode,
};

interface TaskNodeData {
  label: string;
  taskType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  config: any;
}

function TaskNode({ data, selected }: { data: TaskNodeData; selected: boolean }) {
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'image_hunt': return <Image className="h-4 w-4" />;
      case 'form_fill': return <FileText className="h-4 w-4" />;
      case 'calculation': return <Calculator className="h-4 w-4" />;
      case 'wait_timer': return <Clock className="h-4 w-4" />;
      case 'captcha': return <Shield className="h-4 w-4" />;
      default: return <Puzzle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 border-green-300 text-green-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'hard': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[200px]
      ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
      ${getDifficultyColor(data.difficulty)}
    `}>
      <div className="flex items-center space-x-2 mb-2">
        {getTaskIcon(data.taskType)}
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs opacity-75 capitalize">
        {data.taskType.replace('_', ' ')} • {data.difficulty}
      </div>
    </div>
  );
}

const taskTemplates = [
  {
    type: 'image_hunt',
    label: 'Image Hunt',
    description: 'Find specific items in images',
    icon: <Image className="h-5 w-5" />,
    defaultConfig: { images: [], targetItems: [], timeLimit: 60 }
  },
  {
    type: 'form_fill',
    label: 'Form Filling',
    description: 'Complete complex forms',
    icon: <FileText className="h-5 w-5" />,
    defaultConfig: { fields: [], requiredFields: [], validationRules: {} }
  },
  {
    type: 'calculation',
    label: 'Math Problems',
    description: 'Solve arithmetic problems',
    icon: <Calculator className="h-5 w-5" />,
    defaultConfig: { problems: [], difficulty: 'medium', attempts: 3 }
  },
  {
    type: 'wait_timer',
    label: 'Wait Timer',
    description: 'Force user to wait',
    icon: <Clock className="h-5 w-5" />,
    defaultConfig: { duration: 30, allowSkip: false, message: 'Processing...' }
  },
  {
    type: 'captcha',
    label: 'CAPTCHA',
    description: 'Verify human interaction',
    icon: <Shield className="h-5 w-5" />,
    defaultConfig: { type: 'image', attempts: 3, difficulty: 'medium' }
  },
];

export default function MazeBuilder() {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [mazeName, setMazeName] = useState('Untitled Maze');
  const [saving, setSaving] = useState(false);

  // Initialize with start node
  useEffect(() => {
    const startNode: Node = {
      id: 'start',
      type: 'input',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
      draggable: false,
    };
    setNodes([startNode]);
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const taskType = event.dataTransfer.getData('application/reactflow');
      if (typeof taskType === 'undefined' || !taskType) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const template = taskTemplates.find(t => t.type === taskType);
      if (!template) return;

      const newNode: Node = {
        id: `${taskType}-${Date.now()}`,
        type: 'taskNode',
        position,
        data: {
          label: template.label,
          taskType: taskType,
          difficulty: 'medium' as const,
          config: template.defaultConfig,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<TaskNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'start') return; // Don't allow deleting start node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const saveMaze = async () => {
    setSaving(true);
    try {
      const mazeData = {
        name: mazeName,
        nodes: nodes,
        edges: edges,
        settings: {
          allowRestart: true,
          trackTime: true,
          captureScreenshots: false,
        }
      };

      const response = await fetch('/api/mazes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mazeData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Maze saved successfully!');
        router.push(`/maze/${result.id}`);
      } else {
        alert('Failed to save maze');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save maze');
    } finally {
      setSaving(false);
    }
  };

  const publishMaze = async () => {
    // First save, then publish
    await saveMaze();
    // TODO: Implement publish logic
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="border-l border-gray-300 h-6"></div>
          <input
            type="text"
            value={mazeName}
            onChange={(e) => setMazeName(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none"
            placeholder="Maze Name"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={saveMaze}
            disabled={saving}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={publishMaze}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Task Templates */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Task Types</h3>
          <div className="space-y-3">
            {taskTemplates.map((template) => (
              <div
                key={template.type}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', template.type);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 active:cursor-grabbing"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mr-3">
                  {template.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{template.label}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Template Mazes */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Templates</h3>
            <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="font-medium text-sm">Basic Loop</div>
              <div className="text-xs text-gray-500">5 task loop template</div>
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <div
              className="h-full"
              ref={reactFlowWrapper}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Background />
                <Controls />
                <MiniMap />
                
                {/* Floating Action Panel */}
                <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg border">
                  <div className="text-sm text-gray-600 mb-2">
                    Nodes: {nodes.length} | Edges: {edges.length}
                  </div>
                  {selectedNode && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Selected: {selectedNode.data.label}</div>
                      <button
                        onClick={() => deleteNode(selectedNode.id)}
                        className="flex items-center px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </Panel>
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedNode.data.difficulty}
                  onChange={(e) => updateNodeData(selectedNode.id, { difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Task-specific configuration */}
              {selectedNode.data.taskType === 'wait_timer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wait Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={selectedNode.data.config.duration}
                    onChange={(e) => updateNodeData(selectedNode.id, { 
                      config: { ...selectedNode.data.config, duration: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedNode.data.taskType === 'calculation' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Problems
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedNode.data.config.problems?.length || 3}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      const problems = Array(count).fill(null).map((_, i) => ({ 
                        question: `Problem ${i + 1}`, 
                        answer: 0 
                      }));
                      updateNodeData(selectedNode.id, { 
                        config: { ...selectedNode.data.config, problems }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}