'use client';
import { useState } from 'react';
import { useAIActions } from '@/lib/ai-actions';

export default function AIPage() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { execute } = useAIActions();

  const handleSubmit = async () => {
    setIsProcessing(true);
    const { error } = await execute(prompt);
    if (error) alert(`Error: ${error}`);
    setPrompt('');
    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Scheduler</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Tell me what to change (e.g. 'Remove CMSC131', 'Drop section 0101')"
        className="w-full p-2 border rounded mb-2 h-32"
      />
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Apply Changes'}
      </button>
    </div>
  );
}