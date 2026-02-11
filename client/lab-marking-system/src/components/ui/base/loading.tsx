import { Spinner } from '@/components/ui/base/spinner';
import { Text } from '@/components/ui/base/typography';

export function Loading() {
	return (
		<div className="flex flex-col items-center gap-4 p-8">
			<Text className="text-3xl">Loading</Text>
			<Spinner className="size-12" />
		</div>
	);
}
