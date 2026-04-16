'use client';

import * as React from 'react';

import { Clock } from 'lucide-react';
import { Button, cn, Popover, PopoverContent, PopoverTrigger, ScrollArea, ScrollBar } from '@nummygo/shared/ui';
import { clsx } from 'clsx';
import { useTheme } from '@/lib/themes';

export type Time = {
	hour: string;
	minute: string;
};

type TimePickerProps = {
	value?: Time | null;
	onChange?: (time: Time) => void;
};

export function TimePicker(props: TimePickerProps) {
	const { value, onChange } = props;
	const [isOpen, setIsOpen] = React.useState(false);
	const { theme } = useTheme();
	const isLight = theme.name === 'light';

	const hours = Array.from({ length: 24 }, (_, i) => i);

	const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
		const padded = val.padStart(2, '0');
		const newTime = {
			hour: value?.hour ?? '00',
			minute: value?.minute ?? '00',
			[type]: padded,
		};
		onChange?.(newTime);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
				>
					<Clock />
					{value ? `${value.hour}:${value.minute}` : <span>hh:mm</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 border" style={{ background: theme.bg, borderColor: theme.card.border }}>
				<div className="flex">
					<div className="flex h-[300px] divide-x" style={{ borderColor: theme.card.border }}>
						{/* HOURS */}
						<ScrollArea className="h-full w-20">
							<div className="flex flex-col p-2 gap-1">
								{[...hours].reverse().map((hour) => (
									<Button
										key={hour}
										size="sm"
										variant={value && value.hour === hour.toString() ? 'default' : 'ghost'}
										className={clsx('w-full shrink-0 cursor-pointer', {
											'bg-amber-500/20 text-[#ea580c] dark:text-amber-400': value && value.hour === hour.toString(),
											'hover:bg-amber-500/10 hover:text-[#ea580c] dark:hover:text-amber-400': !(value && value.hour === hour.toString()),
										})}
										style={value && value.hour === hour.toString() ? {} : { color: theme.text.primary }}
										onClick={() => handleTimeChange('hour', hour.toString())}
									>
										{hour.toString().padStart(2, '0')}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>

						{/* MINUTES */}
						<ScrollArea className="h-full w-20">
							<div className="flex flex-col p-2 gap-1">
								{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
									<Button
										key={minute}
										size="sm"
										variant={value && value.minute === minute.toString() ? 'default' : 'ghost'}
										className={clsx('w-full shrink-0 cursor-pointer', {
											'bg-amber-500/20 text-[#ea580c] dark:text-amber-400': value && value.minute === minute.toString(),
											'hover:bg-amber-500/10 hover:text-[#ea580c] dark:hover:text-amber-400': !(value && value.minute === minute.toString()),
										})}
										style={value && value.minute === minute.toString() ? {} : { color: theme.text.primary }}
										onClick={() => handleTimeChange('minute', minute.toString())}
									>
										{minute.toString().padStart(2, '0')}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
