'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Settings, Play, Save, Trash2, Copy, RotateCcw } from 'lucide-react';

interface TrialBlock {
  id: string;
  type: string;
  name: string;
  description: string;
  difficulty: number;
  config: any;
  position: number;
}

interface MazeBuilder {
  id: string;
  name: string;
  description: string;
  trials: TrialBlock[];
  settings: {
    theme: string;
    allowSkip: boolean;
    showHints: boolean;
    enableSounds: boolean;
    coverStory: string;
    loopEnabled: boolean;
    loopChance: number;
  };
}

const TRIAL_TYPES = [
  {
    type: 'image_hunt',
    name: 'Image Hunt',
    description: 'Select images matching criteria',
    icon: '🖼️',
    defaultConfig: {
      tiles: 16,
      pattern: [2, 7, 11, 14],
      instruction: 'Select all images containing traffic lights',
      minMs: 3000,
      difficulty: 1
    }
  },
  {
    type: 'drag_sum',
    name: 'Drag Sum',
    description: 'Drag items to match target sum',
    icon: '🧮',
    defaultConfig: {
      target: 100,
      exactly: 4,
      items: [15, 25, 30, 35, 40, 45],
      instruction: 'Drag exactly 4 items that sum to 100',
      difficulty: 2
    }
  },
  {
    type: 'loading_abyss',
    name: 'Loading Abyss',
    description: 'Extended loading with progress',
    icon: '⏳',
    defaultConfig: {
      minMs: 30000,
      resetOnBlur: true,
      message: 'Processing verification...',
      checkpoints: [10000, 20000, 25000],
      difficulty: 3
    }
  },
  {
    type: 'multi_layer_captcha',
    name: 'Multi-Layer CAPTCHA',
    description: 'Multiple verification steps',
    icon: '🔐',
    defaultConfig: {
      difficulty: 3,
      steps: [
        { type: 'image', expectedAnswer: 'bridge' },
        { type: 'math', expectedAnswer: 42 },
        { type: 'sequence', expectedAnswer: [1, 3, 5] }
      ]
    }
  },
  {
    type: 'slow_reveal',
    name: 'Slow Reveal',
    description: 'Gradually reveal verification content',
    icon: '👁️',
    defaultConfig: {
      difficulty: 4,
      revealMs: 45000,
      image: 'captcha-text',
      expectedAnswer: 'VERIFY'
    }
  }
];

export default function MazeBuilderPage() {
  const [maze, setMaze] = useState<MazeBuilder>({
    id: 'new-maze',
    name: 'Untitled Maze',
    description: 'A custom verification maze',
    trials: [],
    settings: {
      theme: 'business',
      allowSkip: false,
      showHints: false,
      enableSounds: true,
      coverStory: 'Complete verification to proceed with your transaction.',
      loopEnabled: false,
      loopChance: 0.5
    }
  });

  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const addTrial = useCallback((trialType: string) => {
    const trialTemplate = TRIAL_TYPES.find(t => t.type === trialType);
    if (!trialTemplate) return;

    const newTrial: TrialBlock = {
      id: `trial-${Date.now()}`,
      type: trialType,
      name: trialTemplate.name,
      description: trialTemplate.description,
      difficulty: trialTemplate.defaultConfig.difficulty || 1,
      config: { ...trialTemplate.defaultConfig },
      position: maze.trials.length
    };

    setMaze(prev => ({
      ...prev,
      trials: [...prev.trials, newTrial]
    }));
  }, [maze.trials.length]);

  const removeTrial = useCallback((trialId: string) => {
    setMaze(prev => ({
      ...prev,
      trials: prev.trials.filter(t => t.id !== trialId)
    }));
    setSelectedTrial(null);
  }, []);

  const duplicateTrial = useCallback((trialId: string) => {
    const trial = maze.trials.find(t => t.id === trialId);
    if (!trial) return;

    const newTrial: TrialBlock = {
      ...trial,
      id: `trial-${Date.now()}`,
      position: maze.trials.length
    };

    setMaze(prev => ({
      ...prev,
      trials: [...prev.trials, newTrial]
    }));
  }, [maze.trials]);

  const updateTrialConfig = useCallback((trialId: string, config: any) => {
    setMaze(prev => ({
      ...prev,
      trials: prev.trials.map(t => 
        t.id === trialId ? { ...t, config: { ...t.config, ...config } } : t
      )
    }));
  }, []);

  const updateTrialDifficulty = useCallback((trialId: string, difficulty: number) => {
    setMaze(prev => ({
      ...prev,
      trials: prev.trials.map(t => 
        t.id === trialId ? { ...t, difficulty } : t
      )
    }));
  }, []);

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(maze.trials);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setMaze(prev => ({
      ...prev,
      trials: updatedItems
    }));
  }, [maze.trials]);

  const saveMaze = useCallback(() => {
    // TODO: Implement save functionality
    console.log('Saving maze:', maze);
  }, [maze]);

  const previewMaze = useCallback(() => {
    // TODO: Implement preview functionality
    console.log('Previewing maze:', maze);
  }, [maze]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Maze Builder</h1>
              <input
                type="text"
                value={maze.name}
                onChange={(e) => setMaze(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                placeholder="Enter maze name..."
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={previewMaze}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={saveMaze}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Maze
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Trial Library */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trial Library</h3>
              <div className="space-y-3">
                {TRIAL_TYPES.map((trialType) => (
                  <div
                    key={trialType.type}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    onClick={() => addTrial(trialType.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{trialType.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{trialType.name}</h4>
                        <p className="text-sm text-gray-500">{trialType.description}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maze Canvas */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Maze Flow</h3>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={maze.settings.loopEnabled}
                      onChange={(e) => setMaze(prev => ({
                        ...prev,
                        settings: { ...prev.settings, loopEnabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Enable Looping
                  </label>
                  {maze.settings.loopEnabled && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={maze.settings.loopChance}
                      onChange={(e) => setMaze(prev => ({
                        ...prev,
                        settings: { ...prev.settings, loopChance: parseFloat(e.target.value) }
                      }))}
                      className="w-20"
                    />
                  )}
                </div>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="maze-trials">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4 min-h-[400px]"
                    >
                      {maze.trials.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-4">📋</div>
                          <p>Drag trials from the library to build your maze</p>
                        </div>
                      ) : (
                        maze.trials.map((trial, index) => (
                          <Draggable key={trial.id} draggableId={trial.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  p-4 border-2 rounded-lg cursor-move transition-all
                                  ${selectedTrial === trial.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                  ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
                                `}
                                onClick={() => setSelectedTrial(trial.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl">
                                      {TRIAL_TYPES.find(t => t.type === trial.type)?.icon}
                                    </span>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{trial.name}</h4>
                                      <p className="text-sm text-gray-500">{trial.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                          key={level}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateTrialDifficulty(trial.id, level);
                                          }}
                                          className={`
                                            w-3 h-3 rounded-full text-xs
                                            ${trial.difficulty >= level
                                              ? 'bg-red-500 text-white'
                                              : 'bg-gray-200 text-gray-400'
                                            }
                                          `}
                                        >
                                          {level}
                                        </button>
                                      ))}
                                    </div>
                                  
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateTrial(trial.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTrial(trial.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {maze.settings.loopEnabled && index === maze.trials.length - 1 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      {Math.round(maze.settings.loopChance * 100)}% chance to loop back
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Trial Configuration */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
              
              {selectedTrial ? (
                <TrialConfigPanel
                  trial={maze.trials.find(t => t.id === selectedTrial)!}
                  onUpdate={updateTrialConfig}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a trial to configure</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrialConfigPanelProps {
  trial: TrialBlock;
  onUpdate: (trialId: string, config: any) => void;
}

function TrialConfigPanel({ trial, onUpdate }: TrialConfigPanelProps) {
  const renderConfigFields = () => {
    switch (trial.type) {
      case 'image_hunt':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Size
              </label>
              <select
                value={trial.config.tiles}
                onChange={(e) => onUpdate(trial.id, { tiles: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={9}>3x3 (9 tiles)</option>
                <option value={16}>4x4 (16 tiles)</option>
                <option value={25}>5x5 (25 tiles)</option>
                <option value={36}>6x6 (36 tiles)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruction
              </label>
              <input
                type="text"
                value={trial.config.instruction}
                onChange={(e) => onUpdate(trial.id, { instruction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Select all images containing traffic lights"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Time (ms)
              </label>
              <input
                type="number"
                value={trial.config.minMs}
                onChange={(e) => onUpdate(trial.id, { minMs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3000"
              />
            </div>
          </div>
        );
        
      case 'drag_sum':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Sum
              </label>
              <input
                type="number"
                value={trial.config.target}
                onChange={(e) => onUpdate(trial.id, { target: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items to Select
              </label>
              <input
                type="number"
                value={trial.config.exactly}
                onChange={(e) => onUpdate(trial.id, { exactly: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Numbers
              </label>
              <input
                type="text"
                value={trial.config.items.join(', ')}
                onChange={(e) => onUpdate(trial.id, { 
                  items: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15, 25, 30, 35, 40, 45"
              />
            </div>
          </div>
        );
        
      case 'loading_abyss':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (ms)
              </label>
              <input
                type="number"
                value={trial.config.minMs}
                onChange={(e) => onUpdate(trial.id, { minMs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                type="text"
                value={trial.config.message}
                onChange={(e) => onUpdate(trial.id, { message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Processing verification..."
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={trial.config.resetOnBlur}
                  onChange={(e) => onUpdate(trial.id, { resetOnBlur: e.target.checked })}
                  className="mr-2"
                />
                Reset on tab switch
              </label>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>Configuration options for this trial type are not yet available.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">{trial.name}</h4>
      <p className="text-sm text-gray-500 mb-4">{trial.description}</p>
      
      {renderConfigFields()}
    </div>
  );
}
