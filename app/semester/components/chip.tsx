import type { ComponentProps } from "react";
import { cn } from "~/lib/util";
import { colorForCourseNumber } from "./schedule";

export function Chip({ className, style, ...props }: ComponentProps<"div"> & ({ section: string } | { code: string; department: string; })) {
	const color = "section" in props ? colorForCourseNumber(props.section, "") : colorForCourseNumber(props.code, props.department);

	return (
		<div
			{...props}
			className={cn("relative flex justify-between px-2 py-1 rounded-lg text-sm [&_svg]:size-4 [&_svg]:opacity-60 border", className)}
			style={{
				...style,
				backgroundColor: `color-mix(in srgb, ${color} 40%, transparent)`,
				borderColor: `color-mix(in srgb, ${color} 60%, transparent)`,
				color: `color-mix(in srgb, ${color} 40%, black)`
			}}
		/>
	);
}