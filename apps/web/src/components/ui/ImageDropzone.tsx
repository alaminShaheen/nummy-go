'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Trash2, Camera } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageDropzoneProps {
	value?: string | null;
	onChange: (dataUrl: string | undefined) => void;
	label: string;
	isAvatar?: boolean;
	hint?: string;
}

export function ImageDropzone({ value, onChange, label, isAvatar, hint }: ImageDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		setErrorMsg('');

		let file: File | null = null;
		if ('dataTransfer' in e) {
			file = e.dataTransfer.files?.[0] || null;
		} else if ('target' in e && (e.target as HTMLInputElement).files) {
			file = (e.target as HTMLInputElement).files?.[0] || null;
		}

		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const img = document.createElement('img');
				img.onload = () => {
					const canvas = document.createElement('canvas');
					const MAX_WIDTH = isAvatar ? 512 : 1600;
					const scaleSize = MAX_WIDTH / img.width;
					canvas.width = MAX_WIDTH;
					canvas.height = img.height * scaleSize;

					const ctx = canvas.getContext('2d');
					if (isAvatar && ctx) {
						// Optional constraints applied on avatar shapes if needed
					}
					ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

					// Compress heavy UI uploads natively avoiding external CDN constraints
					const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
					onChange(dataUrl);
				};
				img.src = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else if (file) {
			setErrorMsg("Invalid file. Please upload a JPG or PNG image.");
		}
	};

	return (
		<div>
			<label className="block text-[13px] font-semibold text-[#f1f5f9] mb-1.5 px-0.5">{label}</label>
			{hint && <p className="text-[11px] text-[#64748b] mb-3 px-0.5">{hint}</p>}
			{errorMsg && <p className="text-xs text-rose-500 mb-2">{errorMsg}</p>}

			{value ? (
				<div 
					className={clsx(
						"relative overflow-hidden group border border-white/10 shadow-xl", 
						isAvatar ? "w-28 h-28 rounded-full" : "w-full h-32 rounded-xl"
					)}
				>
					<Image src={value} alt="Preview" fill className="object-cover" />
					<div className="absolute inset-0 bg-[#0D1117]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
						<button 
							type="button" 
							onClick={() => onChange('')}
							className="p-2.5 bg-rose-500/90 rounded-full text-white hover:scale-110 transition-transform shadow-lg"
						>
							<Trash2 className="size-4" />
						</button>
					</div>
				</div>
			) : (
				<div 
					onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleFileUpload}
					onClick={() => {
						const input = document.getElementById(`file-upload-${label.replace(/\s+/g, '-')}`) as HTMLInputElement;
						input?.click();
					}}
					className={clsx(
						"border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden",
						isAvatar ? "w-28 h-28 rounded-full" : "w-full h-32 rounded-xl",
						isDragging 
							? "border-amber-500 bg-amber-500/5 text-amber-400 scale-[1.02]" 
							: "border-white/10 hover:border-amber-500/40 bg-white/5 text-slate-500 hover:text-slate-300"
					)}
				>
					<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-amber-500/10 to-transparent transition-opacity" />
					
					{isAvatar ? (
						<>
							<Camera className={clsx("size-6 mb-1 relative z-10 transition-transform", isDragging && "animate-bounce text-amber-400")} />
							<span className="text-[10px] font-medium relative z-10">Upload</span>
						</>
					) : (
						<>
							<UploadCloud className={clsx("size-7 mb-2 relative z-10 transition-transform", isDragging && "animate-bounce text-amber-400")} />
							<p className="text-sm font-medium relative z-10">Click or drag image here</p>
							<p className="text-[10px] mt-1 relative z-10 opacity-60">Max size naturally reduced holding D1 limits</p>
						</>
					)}
					<input 
						id={`file-upload-${label.replace(/\s+/g, '-')}`}
						type="file" 
						accept="image/jpeg, image/png, image/webp" 
						className="hidden" 
						onChange={handleFileUpload} 
					/>
				</div>
			)}
		</div>
	);
}
