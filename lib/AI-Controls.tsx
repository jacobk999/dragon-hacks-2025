// packages/site/lib/AIControls.tsx
'use client';

import { useState } from 'react';
import { useAIActions } from './ai-actions';  // adjust path if needed

export default function AIControls() {
	const [prompt, setPrompt] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const { execute } = useAIActions();

	const handleSubmit = async () => {
		setIsProcessing(true);
		const res = await execute(prompt);
		if (res.error) {
			alert(`Error: ${res.error}`);
		} /*else if (res.affectedItems?.length) {
			alert(res.affectedItems.join('\n'));
		}*/
		setPrompt('');
		setIsProcessing(false);
	};

	return (
		<div className="bg-white/80 w-1/2 p-4 rounded shadow mt-4">
			<h2 className="text-lg font-semibold mb-2">Talk to Schedulino! made with tears of celsius</h2>
			<textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
				placeholder="e.g. Remove HISP200 or Drop section 0101"
				className="w-full p-2 border rounded mb-2 h-24"
			/>
			<button
				type="button" // Explicit type prop added
				onClick={handleSubmit}
				disabled={isProcessing}
				className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
			>
				{isProcessing ? 'Processing...' : 'Apply Changes'}
			</button>
		</div>
	);
}
