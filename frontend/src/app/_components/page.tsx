'use client';

import * as React from 'react';
import { Temporal } from 'temporal-polyfill';

import { Button } from '@/components/ui/base/button';
import { PasswordInput, TextInput } from '@/components/ui/base/input';
import { ScrollArea } from '@/components/ui/base/scroll-area';
import { SearchBar } from '@/components/ui/base/search-bar';
import { Select } from '@/components/ui/base/select';
import { Separator } from '@/components/ui/base/separator';
import { Tag } from '@/components/ui/base/tag';
import { Toggle } from '@/components/ui/base/toggle';
import { H1, H2, Text } from '@/components/ui/base/typography';
import { ActivitySelect } from '@/components/ui/requests/activity-select';
import { StudentRequestCard } from '@/components/ui/requests/student-request-card';
import { TutorRequestCard } from '@/components/ui/requests/tutor-request-card';

export default function BaseComponentsPage() {
	return (
		<div className="flex flex-col gap-3">
			<H1>Components</H1>
			<Buttons />
			<Toggles />
			<Tags />
			<Inputs />
			<Selects />
			<ActivitySelects />
			<ScrollAreas />
			<Separators />
			<SearchBars />
			<StudentRequestCards />
			<TutorRequestCards />
		</div>
	);
}

function Buttons() {
	return (
		<div>
			<H2 className="mb-2">Button</H2>

			<div className="w-[320px] flex flex-col gap-2">
				<Button onClick={() => console.log('primary button clicked')}>
					<Text>primary button</Text>
				</Button>

				<Button disabled>
					<Text>disabled primary button</Text>
				</Button>

				<Button
					variant="danger"
					onClick={() => console.log('danger button clicked')}
				>
					<Text>danger button</Text>
				</Button>

				<Button variant="danger" disabled>
					<Text>disabled danger button</Text>
				</Button>
			</div>
		</div>
	);
}

function Toggles() {
	return (
		<div>
			<H2 className="mb-2">Toggle</H2>

			<div className="space-y-2">
				<Toggle
					options={[
						{ value: 'option1', label: 'Option 1' },
						{ value: 'option2', label: 'Option 2' },
					]}
					defaultValue="option1"
					onValueChange={(value) => console.log(`toggle changed: ${value}`)}
				/>
			</div>
		</div>
	);
}

function Tags() {
	return (
		<div>
			<H2 className="mb-2">Tag</H2>

			<div className="flex gap-2">
				<Tag label="lab01" />
				<Tag
					label="lab01"
					onDeleteClick={() => console.log('tag delete button clicked')}
				/>
			</div>
		</div>
	);
}

function Inputs() {
	return (
		<div>
			<H2 className="mb-2">Input</H2>

			<div className="w-[320px] space-y-2">
				<TextInput
					placeholder="text"
					onChange={(e) => console.log(`text input changed: ${e.target.value}`)}
				/>
				<PasswordInput
					placeholder="password"
					onChange={(e) =>
						console.log(`password input changed: ${e.target.value}`)
					}
				/>
			</div>
		</div>
	);
}

function Selects() {
	return (
		<div>
			<H2 className="mb-2">Select</H2>

			<div className="w-[320px] space-y-2">
				<Select
					className="w-full"
					options={[
						{ value: 'F11A', label: 'F11A (Alto Lab)' },
						{ value: 'F11B', label: 'F11B (Bass Lab)' },
						{ value: 'F11C', label: 'F11C (Kora Lab)' },
						{ value: 'F11D', label: 'F11D (Online)' },
					]}
					placeholder="Select a class..."
					onValueChange={(value) =>
						console.log(`class selection changed: ${value}`)
					}
				/>
			</div>
		</div>
	);
}

function ActivitySelects() {
	return (
		<div>
			<H2 className="mb-2">Lab Select</H2>

			<div className="w-[320px] flex flex-col space-y-2">
				<ActivitySelect
					activities={[
						{ activity: { code: 'lab01', name: 'Lab 1' }, marked: false },
						{ activity: { code: 'lab02', name: 'Lab 2' }, marked: false },
						{ activity: { code: 'lab03', name: 'Lab 3' }, marked: false },
					]}
					placeholder="Select labs..."
					onChange={(value) => console.log(`lab selection changed: ${value}`)}
				/>

				<ActivitySelect
					activities={[
						{ activity: { code: 'lab01', name: 'Lab 1' }, marked: true },
						{ activity: { code: 'lab02', name: 'Lab 2' }, marked: false },
						{ activity: { code: 'lab03', name: 'Lab 3' }, marked: false },
					]}
					placeholder="Select labs..."
					onChange={(value) => console.log(`lab selection changed: ${value}`)}
				/>

				<ActivitySelect
					activities={[
						{ activity: { code: 'lab01', name: 'Lab 1' }, marked: false },
						{ activity: { code: 'lab02', name: 'Lab 2' }, marked: false },
						{ activity: { code: 'lab03', name: 'Lab 3' }, marked: false },
					]}
					preselected={[{ code: 'lab01', name: 'Lab 1' }]}
					placeholder="Select labs..."
					onChange={(value) => console.log(`lab selection changed: ${value}`)}
				/>

				<ActivitySelect
					activities={[
						{ activity: { code: 'lab01', name: 'Lab 1' }, marked: true },
						{ activity: { code: 'lab02', name: 'Lab 2' }, marked: false },
						{ activity: { code: 'lab03', name: 'Lab 3' }, marked: false },
					]}
					preselected={[{ code: 'lab02', name: 'Lab 2' }]}
					placeholder="Select labs..."
					onChange={(value) => console.log(`lab selection changed: ${value}`)}
				/>

				<ActivitySelect
					activities={[
						{ activity: { code: 'lab01', name: 'Lab 1' }, marked: false },
						{ activity: { code: 'lab02', name: 'Lab 2' }, marked: false },
						{ activity: { code: 'lab03', name: 'Lab 3' }, marked: false },
					]}
					preselected={[
						{ code: 'lab01', name: 'Lab 1' },
						{ code: 'lab02', name: 'Lab 2' },
						{ code: 'lab03', name: 'Lab 3' },
					]}
					placeholder="Select labs..."
					onChange={(value) => console.log(`lab selection changed: ${value}`)}
				/>
			</div>
		</div>
	);
}

function ScrollAreas() {
	return (
		<div>
			<H2 className="mb-2">Scroll Area</H2>

			<ScrollArea className="h-48 w-[320px] rounded-md border border-outline">
				<div>
					{Array.from({ length: 50 }).map((_, i) => (
						<React.Fragment key={i}>
							<div className="p-2 text-sm">
								<Text>Item {i + 1}</Text>
							</div>
							<Separator />
						</React.Fragment>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function Separators() {
	return (
		<div>
			<H2 className="mb-2">Separator</H2>

			<Separator />
		</div>
	);
}

function SearchBars() {
	return (
		<div>
			<H2 className="mb-2">Search Bar</H2>

			<SearchBar
				placeholder="Search here"
				onChange={(e) => console.log(`search input changed: ${e.target.value}`)}
			/>
		</div>
	);
}

function StudentRequestCards() {
	return (
		<div>
			<H2 className="mb-2">Student Request Card</H2>

			<div className="space-y-2">
				<StudentRequestCard
					request={{
						id: 1,
						activity: { code: 'lab01', name: 'lab01' },
						createdAt: Temporal.Now.instant(),
						status: 'marked',
						closedAt: Temporal.Now.instant(),
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab01')}
				/>

				<StudentRequestCard
					request={{
						id: 2,
						activity: { code: 'lab02', name: 'lab02' },
						createdAt: Temporal.Now.instant(),
						status: 'marked',
						closedAt: Temporal.Now.instant(),
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab02')}
				/>

				<StudentRequestCard
					request={{
						id: 3,
						activity: { code: 'lab03', name: 'lab03' },
						createdAt: Temporal.Now.instant(),
						status: 'pending',
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab03')}
				/>

				<StudentRequestCard
					request={{
						id: 4,
						activity: { code: 'lab04', name: 'lab with a long name' },
						createdAt: Temporal.Now.instant(),
						status: 'pending',
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab04')}
				/>

				<StudentRequestCard
					request={{
						id: 5,
						activity: {
							code: 'lab05',
							name: 'lab with a very very very very very very very very very long name',
						},
						createdAt: Temporal.Now.instant(),
						status: 'pending',
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab05')}
				/>

				<StudentRequestCard
					request={{
						id: 6,
						activity: {
							code: 'lab07',
							name: 'lab with a veryveryveryveryveryveryveryveryvery long name',
						},
						createdAt: Temporal.Now.instant(),
						status: 'pending',
					}}
					onWithdrawClick={() => console.log('withdraw button clicked: lab07')}
				/>
			</div>
		</div>
	);
}

function TutorRequestCards() {
	return (
		<div>
			<H2 className="mb-2">Tutor Request Card</H2>

			<div className="space-y-2">
				<TutorRequestCard
					student={{ zid: 'z5123456', name: 'Andrew Taylor' }}
					requests={[
						{
							id: 1,
							activity: { code: 'lab01', name: 'lab01', maxMark: 3 },
							createdAt: Temporal.Now.instant(),
							status: 'marked',
							closedAt: Temporal.Now.instant(),
							markerName: 'Sussus Amogus',
							mark: 3,
						},
						{
							id: 2,
							activity: { code: 'lab02', name: 'lab02', maxMark: 1 },
							createdAt: Temporal.Now.instant(),
							status: 'marked',
							closedAt: Temporal.Now.instant(),
							markerName: 'Sussus Amogus',
							mark: 1,
						},
						{
							id: 3,
							activity: { code: 'lab03', name: 'lab03', maxMark: 5 },
							createdAt: Temporal.Now.instant(),
							status: 'pending',
							claimer: null,
						},
						{
							id: 4,
							activity: {
								code: 'lab04',
								name: 'lab with a long name',
								maxMark: 1,
							},
							createdAt: Temporal.Now.instant(),
							status: 'pending',
							claimer: null,
						},
						{
							id: 5,
							activity: {
								code: 'lab05',
								name: 'lab with a very very very very very very very very very long name',
								maxMark: 1,
							},
							createdAt: Temporal.Now.instant(),
							status: 'pending',
							claimer: null,
						},
						{
							id: 6,
							activity: {
								code: 'lab07',
								name: 'lab with a veryveryveryveryveryveryveryveryvery long name',
								maxMark: 5,
							},
							createdAt: Temporal.Now.instant(),
							status: 'pending',
							claimer: null,
						},
					]}
					onMarkClick={(request) =>
						console.log(`mark button clicked: ${request}`)
					}
					onDeclineClick={(request) =>
						console.log(`decline button clicked: ${request}`)
					}
					onAmendClick={(request) =>
						console.log(`amend button clicked: ${request}`)
					}
					onViewClick={(request) =>
						console.log(`view button clicked: ${request}`)
					}
				/>
			</div>
		</div>
	);
}
