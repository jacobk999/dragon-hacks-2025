'use client';

import { ComponentProps, useState, useTransition } from 'react';
import { useAIActions } from '~/lib/ai-actions';

export function AiControls({ onOpenChange, ref }: { onOpenChange: (open: boolean) => void; } & ComponentProps<"textarea">) {
	const [prompt, setPrompt] = useState('');
	const [isPending, startTransition] = useTransition();
	const { execute } = useAIActions();

	const handleSubmit = () => {
		startTransition(async () => {
			const res = await execute(prompt);
			if (res.error) alert(`Error: ${res.error}`);
			startTransition(() => onOpenChange(false));
		});
	};

	return (
		<>
			<div className="absolute inset-0 bg-glass rounded-2xl" />
			<textarea
				value={prompt}
				ref={ref}
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
				disabled={isPending || (prompt === "")}
				className="bg-slate-400/20 hover:bg-slate-400/40 text-slate-600 transition-colors rounded-lg px-4 py-2"
			>
				{isPending ? 'Processing...' : 'Apply Changes'}
			</button>
		</>
	);
}
