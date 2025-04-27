export interface CheckTickSingleProps {
	variant: "duoStroke" | "stroke";
	className?: string;
}

export function CheckTickSingle({ variant, className }: CheckTickSingleProps) {
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
						d="M6 11.5L10.5 16"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						opacity="0.28"
						d="M10.5 16L18.5 8"
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
						d="M6 11.5L10.5 16L18.5 8"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
	}
}