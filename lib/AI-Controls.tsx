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

	// TODO: maybe change this to modal or action button
	return (
		<div className="relative rounded-2xl bg-white/80 backdrop-blur-xl w-1/2 p-4 flex flex-col gap-2 mx-auto mb-4">
			<div className="absolute inset-0 bg-glass rounded-2xl" />
			<h2 className="text-lg text-slate-600">Talk to <span className="font-bold">Schedulino</span>! made with tears of celsius</h2>
			<textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
				placeholder="e.g. Remove CMSC132, Drop section 0101, I dont want to take (Professor)"
				className="w-full outline-none bg-white/60 rounded-xl resize-none p-2"
			/>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={isProcessing}
				className="bg-slate-500/40 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-500 hover:text-slate-50 transition-colors"
			>
				{isProcessing ? 'Processing...' : 'Apply Changes'}
			</button>
		</div>
	);
}
