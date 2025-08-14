'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Image, 
  FileText, 
  Calculator, 
  Shield, 
  Play,
  Eye,
  Copy
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  preview: string[];
  nodes: any[];
  edges: any[];
}

const templates: Template[] = [
  {
    id: 'basic-loop',
    name: 'Basic Loop',
    description: 'A simple 5-task loop designed to waste maximum time with minimal effort. Perfect for beginners.',
    taskCount: 5,
    estimatedTime: '15-30 min',
    difficulty: 'Easy',
    preview: [
      'Image Hunt (Find 3 objects)',
      'Form Filling (Personal Details)',
      'Math Problems (5 calculations)',
      'Wait Timer (30 seconds)',
      'CAPTCHA Verification'
    ],
    nodes: [
      {
        id: 'start',
        type: 'input',
        position: { x: 250, y: 50 },
        data: { label: 'Start' }
      },
      {
        id: 'image-hunt-1',
        type: 'taskNode',
        position: { x: 250, y: 150 },
        data: {
          label: 'Find Objects',
          taskType: 'image_hunt',
          difficulty: 'medium',
          config: {
            images: ['office.jpg', 'kitchen.jpg'],
            targetItems: ['red stapler', 'coffee mug', 'keyboard'],
            timeLimit: 120
          }
        }
      },
      {
        id: 'form-fill-1',
        type: 'taskNode',
        position: { x: 250, y: 250 },
        data: {
          label: 'Personal Information',
          taskType: 'form_fill',
          difficulty: 'easy',
          config: {
            fields: [
              'Full Name',
              'Date of Birth',
              'Phone Number',
              'Address',
              'Emergency Contact'
            ]
          }
        }
      },
      {
        id: 'calculation-1',
        type: 'taskNode',
        position: { x: 250, y: 350 },
        data: {
          label: 'Security Questions',
          taskType: 'calculation',
          difficulty: 'medium',
          config: {
            problems: [
              { question: '47 + 83 = ?', answer: 130 },
              { question: '156 - 89 = ?', answer: 67 },
              { question: '23 × 4 = ?', answer: 92 },
              { question: '144 ÷ 12 = ?', answer: 12 },
              { question: '25² = ?', answer: 625 }
            ]
          }
        }
      },
      {
        id: 'wait-timer-1',
        type: 'taskNode',
        position: { x: 250, y: 450 },
        data: {
          label: 'Processing',
          taskType: 'wait_timer',
          difficulty: 'easy',
          config: {
            duration: 30,
            message: 'Verifying your information...'
          }
        }
      },
      {
        id: 'captcha-1',
        type: 'taskNode',
        position: { x: 250, y: 550 },
        data: {
          label: 'Security Check',
          taskType: 'captcha',
          difficulty: 'medium',
          config: {
            type: 'image',
            attempts: 3
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'image-hunt-1' },
      { id: 'e2', source: 'image-hunt-1', target: 'form-fill-1' },
      { id: 'e3', source: 'form-fill-1', target: 'calculation-1' },
      { id: 'e4', source: 'calculation-1', target: 'wait-timer-1' },
      { id: 'e5', source: 'wait-timer-1', target: 'captcha-1' },
      { id: 'e6', source: 'captcha-1', target: 'image-hunt-1' } // Loop back
    ]
  },
  {
    id: 'document-verification',
    name: 'Document Verification',
    description: 'Complex document upload and verification process with multiple validation steps.',
    taskCount: 7,
    estimatedTime: '30-45 min',
    difficulty: 'Hard',
    preview: [
      'Document Upload',
      'Photo Verification',
      'Form Details',
      'Address Verification',
      'Phone Verification',
      'Wait for Processing',
      'Final Review'
    ],
    nodes: [],
    edges: []
  },
  {
    id: 'customer-service',
    name: 'Customer Service Portal',
    description: 'Simulates a frustrating customer service experience with multiple redirects.',
    taskCount: 6,
    estimatedTime: '20-35 min',
    difficulty: 'Medium',
    preview: [
      'Select Issue Type',
      'Provide Account Details',
      'Upload Screenshots',
      'Schedule Callback',
      'Wait for Agent',
      'Transfer to Department'
    ],
    nodes: [],
    edges: []
  }
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);

  const createFromTemplate = async (template: Template) => {
    setLoading(true);
    try {
      const mazeData = {
        name: `${template.name} - Copy`,
        nodes: template.nodes,
        edges: template.edges,
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
        router.push(`/builder?mazeId=${result.id}`);
      } else {
        alert('Failed to create maze from template');
      }
    } catch (error) {
      console.error('Template creation error:', error);
      alert('Failed to create maze from template');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="border-l border-gray-300 h-6"></div>
            <h1 className="text-2xl font-bold text-gray-900">Maze Templates</h1>
          </div>
          <Link
            href="/builder"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Create from Scratch
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pre-built Templates</h2>
          <p className="text-lg text-gray-600">
            Choose from our collection of proven scammer-wasting maze templates. 
            Each template is designed to maximize time waste and frustration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{template.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{template.taskCount} tasks</span>
                  <span>{template.estimatedTime}</span>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Task Flow:</h4>
                  <ul className="space-y-1">
                    {template.preview.slice(0, 3).map((task, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        {task}
                      </li>
                    ))}
                    {template.preview.length > 3 && (
                      <li className="text-sm text-gray-400">
                        +{template.preview.length - 3} more tasks...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => createFromTemplate(template)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Complete Task Flow:</h4>
                  <div className="space-y-2">
                    {selectedTemplate.preview.map((task, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      createFromTemplate(selectedTemplate);
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}