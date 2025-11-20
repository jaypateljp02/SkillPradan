
import React from 'react';

export default function PointsWidget() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-amber-600">📚</span>
        </div>
        <h3 className="text-lg font-medium mb-1">Complete Daily Quiz</h3>
        <p className="text-gray-500 text-sm mb-3">Test your knowledge and earn points</p>
        <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
          +20 points
        </button>
      </div>

      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-indigo-600">🤝</span>
        </div>
        <h3 className="text-lg font-medium mb-1">Complete Exchange</h3>
        <p className="text-gray-500 text-sm mb-3">Earn points for each completed skill exchange</p>
        <button className="bg-[hsl(var(--indigo-button))] text-white px-4 py-2 rounded-md hover:bg-[hsl(var(--indigo-button)/0.9)]">
          +100 points
        </button>
      </div>
    </div>
  );
}
