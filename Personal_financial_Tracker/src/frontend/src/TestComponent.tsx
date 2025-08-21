import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-blue-600">CSS Test Component</h1>
      
      <div className="bg-red-500 text-white p-4 rounded-lg">
        Test 1: Red background, white text, padding, rounded corners
      </div>
      
      <div className="bg-green-600 text-yellow-300 p-6 rounded-xl shadow-lg">
        Test 2: Green background, yellow text, larger padding, shadow
      </div>
      
      <div className="flex items-center justify-center h-20 bg-blue-900 text-white rounded-md">
        Test 3: Flexbox center, blue background, white text
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-500 text-white p-4 text-center">Grid 1</div>
        <div className="bg-pink-500 text-white p-4 text-center">Grid 2</div>
        <div className="bg-indigo-500 text-white p-4 text-center">Grid 3</div>
      </div>
      
      <p className="text-gray-600">
        If you see colored boxes above with proper styling, Tailwind CSS is working.
        If you see plain text, Tailwind CSS is not being processed.
      </p>
    </div>
  );
};