import type { ComponentProps, ReactNode } from "react";
import { cn } from "~/lib/util";

export function Input({ className, children, ref, ...props }: ComponentProps<"input"> & { children?: ReactNode }) {
	return (
		<div className={cn("relative w-[150px] rounded-lg border border-slate-300/80 hover:border-slate-500/80 focus-within:border-slate-400/90  transition-colors overflow-hidden", className)}>
			<div className="absolute w-full h-full bg-glass" />
			<div className="transition-colors w-full h-full text-slate-700 bg-slate-200/50 focus-within:bg-slate-300/40 flex items-center">
				{children && <div className="pl-2">{children}</div>}
				<input {...props} ref={ref} className="outline-0 p-2 grow h-full" />
			</div>
		</div>)
}