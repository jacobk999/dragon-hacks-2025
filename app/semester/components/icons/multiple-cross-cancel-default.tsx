export interface MultipleCrossCancelDefaultProps {
	variant: "duoStroke" | "stroke";
	className?: string;
}

export function MultipleCrossCancelDefault({
	variant,
	className,
}: MultipleCrossCancelDefaultProps) {
	switch (variant) {
		case "duoStroke":
			return (
				<svg
					className={className}
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						opacity="0.28"
						d="M6 18L18 6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6 6L18 18"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

		case "stroke":
			return (
				<svg
					className={className}
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6 18L12 12M12 12L18 6M12 12L6 6M12 12L18 18"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
	}
}
