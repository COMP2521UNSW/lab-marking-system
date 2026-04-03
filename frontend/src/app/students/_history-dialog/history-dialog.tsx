'use client';

import { ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import type { ActivityAsTutor } from '@workspace/types/activities';
import type { LogEvent } from '@workspace/types/logs';
import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Mark } from '@/components/ui/base/mark';
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
import { cn } from '@/lib/utils';
import studentsService from '@/services/students';

type DataState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			logs: LogEvent[];
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
			<DialogContent className="max-w-4xl" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="sm">
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
										<TableHead aria-hidden />
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

function LogTableRow({ event }: { event: LogEvent }) {
	const [expanded, setExpanded] = React.useState(false);

	const rowData = eventToRowData(event);
	const [eventType, activity, classCode, mark, staffName, reason] = rowData;

	return (
		<>
			<TableRow data-state={expanded ? 'expanded' : 'collapsed'}>
				<TableCell>{eventType}</TableCell>
				<TableCell>
					<LogData>{activity?.name}</LogData>
				</TableCell>
				<TableCell>
					<LogData>{classCode}</LogData>
				</TableCell>
				<TableCell>
					<LogData>{mark}</LogData>
				</TableCell>
				<TableCell>
					<LogData>{staffName}</LogData>
				</TableCell>
				<TableCell>{formatTimestamp(event.timestamp)}</TableCell>
				<TableCell className="flex items-center" aria-hidden={reason === null}>
					{reason !== null && (
						<button
							aria-label="Expand row"
							aria-expanded={expanded}
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

function LogData({ children }: { children: React.ReactNode }) {
	return (
		children ?? (
			<>
				<span aria-hidden>.</span>
				<span className="sr-only" role="text">
					Blank
				</span>
			</>
		)
	);
}

// prettier-ignore
function eventToRowData(event: LogEvent): [
  eventType: string,
  activity: ActivityAsTutor | null,
  classCode: string | null,
  markStr: React.ReactNode,
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
        event.activity, event.classCode, null, event.markerName, event.reason,
      ];
    case 'request-marked':
      return [
        'Request marked',
        event.activity, event.classCode,
        <Mark key={null} mark={event.mark} outOf={event.activity.maxMark} />,
        event.markerName, null,
      ];
    case 'mark-amended':
      return [
        'Mark amended',
        event.activity, event.classCode,
        <Mark key={null} mark={event.mark} outOf={event.activity.maxMark} />,
        event.markerName, null,
      ];
    case 'manual-request-created':
      return [
        'Manual request created',
        event.activity, null,
        <Mark key={null} mark={event.mark} outOf={event.activity.maxMark} />,
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
    case 'mark-imported-from-sms':
      return [
        'Mark imported from SMS',
        event.activity, null,
        <Mark key={null} mark={event.mark} outOf={event.activity.maxMark} />,
        null, null,
      ]
	}
}
