import { COURSE_CODE } from '@workspace/config';

function CourseCode({ code = COURSE_CODE }: { code?: string }) {
	const ariaLabel = courseCodeToAriaLabel(code);

	return (
		<>
			<span aria-hidden="true">{code}</span>
			<span className="sr-only" role="text">
				{ariaLabel}
			</span>
		</>
	);
}

function courseCodeToAriaLabel(courseCode: string) {
	const prefix = courseCode.slice(0, 4);
	const suffix = courseCode.slice(4);

	return `${prefix} ${courseCodeSuffixToAriaLabel(suffix)}`;
}

function courseCodeSuffixToAriaLabel(suffix: string) {
	if (suffix.match(/.000/)) {
		return `${suffix.charAt(0)} thousand`;
	} else if (suffix.match(/..00/)) {
		return `${suffix.slice(0, 2)} hundred`;
	} else {
		return [...suffix].join(' ');
	}
}

export { CourseCode };
