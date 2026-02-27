import { format } from 'date-fns';

function formatDate(date: Date) {
	return format(date, 'EEEE do MMMM h:mmaaa');
}

export { formatDate };
