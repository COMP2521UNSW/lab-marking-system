import type { Time } from '@/types/time';

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

function addMinutes(time: Time, numMinutes: number): Time {
	const [hours, minutes] = time.split(':').map(Number);

	let total = hours * MINUTES_PER_HOUR + minutes + numMinutes;

	total = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

	const newHours = Math.floor(total / MINUTES_PER_HOUR)
		.toString()
		.padStart(2, '0');
	const newMinutes = (total % MINUTES_PER_HOUR).toString().padStart(2, '0');

	return `${newHours}:${newMinutes}` as Time;
}

function subtractMinutes(time: Time, numMinutes: number): Time {
	return addMinutes(time, -numMinutes);
}

export { addMinutes, subtractMinutes };
