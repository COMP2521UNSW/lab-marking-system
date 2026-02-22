'use client';

import { Helmet } from '@dr.pogodin/react-helmet';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { ActivityAsTutor } from '@workspace/types/activities';
import type { StudentDetails } from '@workspace/types/users';

import { LoginRequired } from '@/components/guards/login-required';
import { TutorRequired } from '@/components/guards/role-required';
import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { Loading } from '@/components/ui/base/loading';
import { ScrollArea, ScrollBar } from '@/components/ui/base/scroll-area';
import { SearchBar } from '@/components/ui/base/search-bar';
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
import { ApiError } from '@/lib/errors';
import * as activitiesService from '@/services/activities';
import * as studentsService from '@/services/students';

import {
	HistoryDialogProvider,
	useHistoryDialog,
} from './_history-dialog/context';
import { MarkDialogProvider, useMarkDialog } from './_mark-dialog/context';
import { useViewDialog, ViewDialogProvider } from './_view-dialog/context';

type LoadingState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			data: {
				activities: ActivityAsTutor[];
			};
	  };

export default function Page() {
	return (
		<LoginRequired>
			<TutorRequired>
				<Helmet title="Student Search" />
				<StudentSearchPage />
			</TutorRequired>
		</LoginRequired>
	);
}

function StudentSearchPage() {
	const [loadingState, setLoadingState] = React.useState<LoadingState>({
		loaded: false,
	});

	React.useEffect(() => {
		async function fetchData() {
			try {
				const activities = await activitiesService.getAllActivities();

				setLoadingState({
					loaded: true,
					data: { activities },
				});
			} catch (err) {
				if (err instanceof ApiError) {
					toast(err.message);
				} else {
					toast('Something went wrong, please try again');
				}
			}
		}

		fetchData();
	}, []);

	if (!loadingState.loaded) {
		return <Loading />;
	}

	const data = loadingState.data;
	return (
		<MarkDialogProvider activities={data.activities}>
			<ViewDialogProvider>
				<HistoryDialogProvider>
					<StudentSearch />
				</HistoryDialogProvider>
			</ViewDialogProvider>
		</MarkDialogProvider>
	);
}

function StudentSearch() {
	const [query, setQuery] = React.useState('');

	const queryRef = React.useRef('');
	const [loading, setLoading] = React.useState(false);

	const [results, setResults] = React.useState<StudentDetails[] | null>(null);

	const debouncedSearch = useDebouncedCallback(async (query: string) => {
		if (query.trim().length < 2) return;

		queryRef.current = query;
		setLoading(true);
		const students = await studentsService.searchStudents({ q: query });
		if (query === queryRef.current) {
			setResults(students);
			setLoading(false);
		}
	}, 500);

	const handleChange = (query: string) => {
		setQuery(query);

		debouncedSearch(query);
	};

	return (
		<Card className="min-h-full py-6 px-4 space-y-4">
			<div className="text-center space-y-4">
				<Text>Search for student by name or zID</Text>

				<SearchBar
					value={query}
					placeholder="Search (min. 2 characters)"
					onChange={(e) => handleChange(e.target.value)}
				/>
			</div>

			{loading ? (
				<Spinner className="mt-6 mx-auto size-12" />
			) : (
				results && <SearchResults students={results} />
			)}
		</Card>
	);
}

function SearchResults({ students }: { students: StudentDetails[] }) {
	const { markStudent } = useMarkDialog();
	const { viewMarks } = useViewDialog();
	const { viewHistory } = useHistoryDialog();

	return (
		<div className="space-y-2">
			<Text>
				{students.length === 0 ? 'No' : students.length} result
				{students.length === 1 ? '' : 's'} found.
			</Text>

			{/* TODO: stop hardcoding widths */}
			<div className="rounded-strong border w-[calc(100vw-66px)] min-w-[296px] max-w-[calc(896px-66px)] overflow-x-auto">
				<ScrollArea>
					<Table>
						<TableHeader className="font-semibold">
							<TableRow>
								<TableHead>
									<Text>zID</Text>
								</TableHead>
								<TableHead>
									<Text>Name</Text>
								</TableHead>
								<TableHead className="text-center w-56">
									<Text>Actions</Text>
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{students.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="py-6">
										<Text className="text-center">No students</Text>
									</TableCell>
								</TableRow>
							) : (
								students.map((student) => (
									<TableRow key={student.zid}>
										<TableCell>{student.zid}</TableCell>
										<TableCell>{student.name}</TableCell>
										<TableCell className="text-center space-x-2">
											<Button size="sm" onClick={() => markStudent(student)}>
												<Text>Mark</Text>
											</Button>
											<Button size="sm" onClick={() => viewMarks(student)}>
												<Text>View</Text>
											</Button>
											<Button size="sm" onClick={() => viewHistory(student)}>
												<Text>History</Text>
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</div>
	);
}
