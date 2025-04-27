import { useState } from "react";

export function useControlled<T>(params: {
	controlled?: T;
	onChange?: (value: T) => void;
	defaultValue: T;
}): readonly [T, (value: T) => void];
export function useControlled<T>(params: {
	controlled?: T;
	onChange?: (value: T) => void;
	defaultValue?: T;
}): readonly [T | undefined, (value: T) => void];
export function useControlled<T>({
	controlled,
	onChange,
	defaultValue,
}: {
	controlled?: T;
	onChange?: (value: T) => void;
	defaultValue?: T;
}) {
	const [internal, setInternal] = useState(defaultValue);

	function handleChange(value: T) {
		onChange?.(value);
		setInternal(value);
	}

	const value = controlled ?? internal;

	return [value, handleChange] as const;
}