'use client';

import { format } from 'date-fns';
import * as React from 'react';

import type { Student } from '@workspace/types/users';

import { MIN_WIDTH } from '@/app/layout';
import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/base/scroll-area';
import { Spinner } from '@/components/ui/base/spinner';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/base/table';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import * as studentsService from '@/services/students';

type DataState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			marks: Awaited<ReturnType<typeof studentsService.getStudentMarks>>;
	  };

export function ViewDialog({
	open,
	setOpen,
	student,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	student: Student;
}) {
	const [state, setState] = React.useState<DataState>({ loaded: false });

	React.useEffect(() => {
		async function loadData() {
			try {
				setState({ loaded: false });
				const marks = await studentsService.getStudentMarks({
					zid: student.zid,
				});
				setState({ loaded: true, marks });
			} catch {
				toast('Something went wrong, please try again');
			}
		}

		if (open) {
			loadData();
		}
	}, [open, student]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				showCloseButton={false}
				className="w-[calc(100%-32px)] bg-card shadow-regular"
				style={{ minWidth: `${MIN_WIDTH - 32}px` }}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle className="text-lg font-light">
						<span className="text-primary">Marks</span> for {student.name} (
						{student.zid})
					</DialogTitle>
				</DialogHeader>

				{!state.loaded ? (
					<Spinner className="my-4 mx-auto size-12" />
				) : (
					<div className="border rounded-strong w-full overflow-x-hidden">
						<ScrollArea className={state.marks.length > 10 ? 'h-96' : 'h-auto'}>
							<Table>
								<TableHeader>
									<TableRow className="**:[&th]:text-base **:[&th]:text-primary **:[&th]:font-light">
										<TableHead>Activity</TableHead>
										<TableHead>Mark</TableHead>
										<TableHead>Time marked</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{state.marks.length === 0 ? (
										<TableRow>
											<TableCell colSpan={3} className="p-4 text-center">
												No marks
											</TableCell>
										</TableRow>
									) : (
										state.marks.map((result) => (
											<TableRow key={result.activity.code}>
												<TableCell>{result.activity.name}</TableCell>
												<TableCell>
													{result.mark === null
														? '.'
														: Math.round(result.mark * 100) / 100}
													/{result.activity.maxMark}
												</TableCell>
												<TableCell>
													{result.markedAt === null
														? 'N/A'
														: format(
																new Date(result.markedAt),
																'EEEE do MMMM h:mmaaa',
															)}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</div>
				)}

				<Button variant="danger" onClick={() => setOpen(false)}>
					<Text>Close</Text>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
