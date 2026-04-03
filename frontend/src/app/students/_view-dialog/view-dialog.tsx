'use client';

import * as React from 'react';

import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Mark } from '@/components/ui/base/mark';
import { NotApplicable } from '@/components/ui/base/not-applicable';
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
import { formatTimestamp } from '@/lib/date';
import studentsService from '@/services/students';

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
			<DialogContent className="max-w-max" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="sm">
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
													<Mark
														mark={result.mark}
														outOf={result.activity.maxMark}
													/>
												</TableCell>
												<TableCell>
													{result.markedAt === null ? (
														<NotApplicable />
													) : (
														formatTimestamp(result.markedAt)
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
