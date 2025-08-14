import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TimeSink
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scammer Deterrence Research Platform
          </p>
          
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-gray-700 mb-6">
              TimeSink is a research platform for creating and deploying verification mazes 
              designed to waste scammers' time. Build custom workflows with deliberately 
              frustrating elements and track the time wasted.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>Research Use Only:</strong> This platform is designed for scammer 
                deterrence research. Use responsibly and in compliance with applicable laws.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/dashboard" 
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-blue-600 text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">
                View analytics, manage mazes, and track time wasted
              </p>
            </Link>

            <Link 
              href="/build" 
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-purple-600 text-3xl mb-3">🔧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Maze Builder</h3>
              <p className="text-gray-600 text-sm">
                Create custom mazes with drag-and-drop interface
              </p>
            </Link>

            <Link 
              href="/templates" 
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-green-600 text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
              <p className="text-gray-600 text-sm">
                Browse and use pre-built maze templates
              </p>
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-medium text-gray-900 mb-1">16 Trial Types</h3>
                <p className="text-sm text-gray-600">
                  From simple image hunts to complex multi-layer puzzles
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">📹</div>
                <h3 className="font-medium text-gray-900 mb-1">Session Recording</h3>
                <p className="text-sm text-gray-600">
                  Full rrweb session replay for analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-medium text-gray-900 mb-1">Privacy by Design</h3>
                <p className="text-sm text-gray-600">
                  7-day retention, no PII collection, bucketed IPs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            Abuse-deterrence research; no personal services provided.
          </p>
          <p className="text-xs mt-2">
            Use responsibly and in compliance with applicable laws.
          </p>
        </div>
      </footer>
    </div>
  );
}