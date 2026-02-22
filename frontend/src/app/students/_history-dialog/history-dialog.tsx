'use client';

import { format } from 'date-fns';
import { ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import type { ActivityAsTutor } from '@workspace/types/activities';
import type { RequestLogEvent } from '@workspace/types/logs';
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
import { cn } from '@/lib/utils';
import * as studentsService from '@/services/students';

type DataState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			logs: RequestLogEvent[];
	  };

export function HistoryDialog({
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
				const logs = await studentsService.getStudentLogs({
					zid: student.zid,
				});
				setState({ loaded: true, logs });
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
				className="w-[calc(100%-32px)] max-w-4xl! bg-card shadow-regular"
				style={{ minWidth: `${MIN_WIDTH - 32}px` }}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle className="text-lg font-light">
						<span className="text-primary">Request log</span> for {student.name}{' '}
						({student.zid})
					</DialogTitle>
				</DialogHeader>

				{!state.loaded ? (
					<Spinner className="my-4 mx-auto size-12" />
				) : (
					<div className="min-w-0 rounded-strong border overflow-x-hidden">
						<ScrollArea className={state.logs.length > 10 ? 'h-96' : 'h-auto'}>
							<Table>
								<TableHeader>
									<TableRow className="**:[&th]:text-base **:[&th]:text-primary **:[&th]:font-light">
										<TableHead>Event</TableHead>
										<TableHead>Activity</TableHead>
										<TableHead>Class</TableHead>
										<TableHead>Mark</TableHead>
										<TableHead>Marker/Approver</TableHead>
										<TableHead>Timestamp</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{state.logs.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="p-4 text-center">
												No events
											</TableCell>
										</TableRow>
									) : (
										state.logs.map((event, index) => (
											<LogTableRow key={index} event={event} />
										))
									)}
								</TableBody>
							</Table>

							<ScrollBar orientation="horizontal" />
							<ScrollBar />
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

function LogTableRow({ event }: { event: RequestLogEvent }) {
	const [expanded, setExpanded] = React.useState(false);

	const rowData = eventToRowData(event);
	const [eventType, activity, classCode, mark, staffName, reason] = rowData;

	return (
		<>
			<TableRow className={cn(expanded && 'bg-muted')}>
				<TableCell>{eventType}</TableCell>
				<TableCell>{activity?.name ?? '.'}</TableCell>
				<TableCell>{classCode ?? '.'}</TableCell>
				<TableCell>{mark ?? '.'}</TableCell>
				<TableCell>{staffName ?? '.'}</TableCell>
				<TableCell>{format(event.timestamp, 'EEE do MMM h:mmaaa')}</TableCell>
				<TableCell className="flex items-center">
					{reason !== null && (
						<button
							className="rounded-full focus-ring cursor-pointer"
							onClick={() => setExpanded((expanded) => !expanded)}
						>
							<ChevronRightIcon
								className={cn(
									'size-5 stroke-2.5 transition-all',
									expanded ? 'rotate-90' : 'rotate-0',
								)}
							/>
						</button>
					)}
				</TableCell>
			</TableRow>
			{expanded && (
				<TableRow>
					<TableCell colSpan={7}>
						<Text>
							<span className="font-semibold">Reason:</span> {reason}
						</Text>
					</TableCell>
				</TableRow>
			)}
		</>
	);
}

// prettier-ignore
function eventToRowData(event: RequestLogEvent): [
  eventType: string,
  activity: ActivityAsTutor | null,
  classCode: string | null,
  markStr: string | null,
  staffName: string | null,
  reason: string | null,
] {
	switch (event.eventType) {
		case 'class-changed':
			return [
        'Class changed',
        null, event.classCode, null, null, null,
      ];
		case 'request-created':
			return [
        'Request created',
        event.activity, event.classCode, null, null,null,
      ];
    case 'request-withdrawn':
      return [
        'Request withdrawn',
        event.activity, event.classCode, null, null, event.reason,
      ];
    case 'request-declined':
      return [
        'Request declined',
        event.activity, event.classCode, null, null, event.reason,
      ];
    case 'request-marked':
      return [
        'Request marked',
        event.activity, event.classCode,
        `${Math.round(100 * event.mark) / 100}/${event.activity.maxMark}`,
        event.markerName, null,
      ];
    case 'mark-amended':
      return [
        'Mark amended',
        event.activity, event.classCode,
        `${Math.round(100 * event.mark) / 100}/${event.activity.maxMark}`,
        event.markerName, null,
      ];
    case 'manual-request-created':
      return [
        'Manual request created',
        event.activity, null,
        `${Math.round(100 * event.mark) / 100}/${event.activity.maxMark}`,
        event.markerName, event.reason,
      ];
    case 'manual-request-approved':
      return [
        'Manual request approved',
        event.activity, null, null, event.approverName, null,
      ];
    case 'manual-request-denied':
      return [
        'Manual request denied',
        event.activity, null, null, event.approverName, event.reason,
      ];
	}
}
