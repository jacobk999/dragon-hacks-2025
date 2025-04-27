export interface ClockDefaultProps {
	variant: "contrast" | "duoSolid" | "duoStroke" | "solid" | "stroke";
	className?: string;
}

export function ClockDefault({ variant, className }: ClockDefaultProps) {
	switch (variant) {
		case "contrast":
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
						d="M11.9996 21.1501C17.053 21.1501 21.1496 17.0535 21.1496 12.0001C21.1496 6.94669 17.053 2.8501 11.9996 2.8501C6.9462 2.8501 2.84961 6.94669 2.84961 12.0001C2.84961 17.0535 6.9462 21.1501 11.9996 21.1501Z"
						fill="currentColor"
					/>
					<path
						d="M11.9995 8.00012V12.8166C11.9995 12.9875 12.0869 13.1466 12.2311 13.2384L14.9995 15.0001M21.1496 12.0001C21.1496 17.0535 17.053 21.1501 11.9996 21.1501C6.9462 21.1501 2.84961 17.0535 2.84961 12.0001C2.84961 6.94669 6.9462 2.8501 11.9996 2.8501C17.053 2.8501 21.1496 6.94669 21.1496 12.0001Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

		case "duoSolid":
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
						d="M11.9996 1.8501C6.39392 1.8501 1.84961 6.39441 1.84961 12.0001C1.84961 17.6058 6.39392 22.1501 11.9996 22.1501C17.6053 22.1501 22.1496 17.6058 22.1496 12.0001C22.1496 6.39441 17.6053 1.8501 11.9996 1.8501Z"
						fill="currentColor"
					/>
					<path
						d="M12 7.8999V12.8163C12 12.9873 12.0873 13.1464 12.2316 13.2382L15.0437 15.0277"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

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
						d="M11.9996 21.1501C17.053 21.1501 21.1496 17.0535 21.1496 12.0001C21.1496 6.94669 17.053 2.8501 11.9996 2.8501C6.9462 2.8501 2.84961 6.94669 2.84961 12.0001C2.84961 17.0535 6.9462 21.1501 11.9996 21.1501Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 8V12.8164C12 12.9874 12.0873 13.1465 12.2316 13.2383L15 15"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);

		case "solid":
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
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M1.84961 12.0001C1.84961 6.39441 6.39392 1.8501 11.9996 1.8501C17.6053 1.8501 22.1496 6.39441 22.1496 12.0001C22.1496 17.6058 17.6053 22.1501 11.9996 22.1501C6.39392 22.1501 1.84961 17.6058 1.84961 12.0001ZM12.9995 7.90012C12.9995 7.34784 12.5518 6.90012 11.9995 6.90012C11.4472 6.90012 10.9995 7.34784 10.9995 7.90012V12.8166C10.9995 13.3294 11.2615 13.8067 11.6942 14.0821L14.5064 15.8716C14.9723 16.1681 15.5904 16.0308 15.8869 15.5648C16.1834 15.0989 16.046 14.4808 15.5801 14.1843L12.9995 12.5421V7.90012Z"
						fill="currentColor"
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
						d="M11.9995 8V12.8164C11.9995 12.9874 12.0869 13.1465 12.2311 13.2383L14.9995 15M21.1496 12.0001C21.1496 17.0535 17.053 21.1501 11.9996 21.1501C6.9462 21.1501 2.84961 17.0535 2.84961 12.0001C2.84961 6.94669 6.9462 2.8501 11.9996 2.8501C17.053 2.8501 21.1496 6.94669 21.1496 12.0001Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
	}
}
