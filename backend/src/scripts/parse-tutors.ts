import '@/../env.config';

import { SESSION } from '@workspace/config';

import { executeCommand } from './utils';

async function main() {
	const tutors = await parseTutors();

	printTutorsToml(tutors);
}

async function parseTutors() {
	let stdout: string;

	try {
		stdout = await executeCommand(
			`cut -f3,4 ~/public_html/${SESSION}/tutors/tutors_names | sort | uniq`,
		);
	} catch {
		process.exit(1);
	}

	return stdout
		.split('\n')
		.filter((line) => line.length > 0)
		.map((line) => line.split('\t'))
		.map(([zid, name]) => ({ zid, name }));
}

function printTutorsToml(tutors: Awaited<ReturnType<typeof parseTutors>>) {
	console.log('tutors = [');
	for (const tutor of tutors) {
		const name = tutor.name.replace('\\', '\\\\').replace('"', '\\"');
		console.log(`\t{ zid = '${tutor.zid}', name = "${name}" }`);
	}
	console.log(']');
}

void main();
