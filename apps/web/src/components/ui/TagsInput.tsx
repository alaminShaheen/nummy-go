'use client';

import { useState, useEffect } from 'react';
import { BrandInput } from './BrandInput';

interface TagsInputProps {
	value?: string[] | null;
	onChange: (tags: string[] | undefined) => void;
	placeholder?: string;
	id?: string;
}

export function TagsInput({ value, onChange, placeholder, id }: TagsInputProps) {
	const [text, setText] = useState(Array.isArray(value) ? value.join(', ') : '');

	useEffect(() => {
		if (Array.isArray(value)) {
			setText((prev) => {
				const currentParsed = prev.split(',').map(t => t.trim()).filter(Boolean).join(', ');
				const newValue = value.join(', ');
				if (currentParsed !== newValue) return newValue;
				return prev;
			});
		} else if (!value) {
			setText('');
		}
	}, [value]);

	return (
		<BrandInput
			id={id}
			value={text}
			onChange={(e) => {
				setText(e.target.value);
				const arr = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
				onChange(arr.length ? arr : undefined);
			}}
			placeholder={placeholder}
		/>
	);
}
