import React from 'react';

export function Status() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>
        
        <div className="space-y-6">
          {/* Status indicators will go here later */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Service Status</h2>
            <p className="text-muted-foreground">Status indicators will be added here soon...</p>
          </div>

          {/* Test error button */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Testing & Debugging</h2>
            <p className="text-muted-foreground mb-4">Use this button to test error reporting:</p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => {throw new Error("This is your first error!");}}
            >
              Big Red Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}