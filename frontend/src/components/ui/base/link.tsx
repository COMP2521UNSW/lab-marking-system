import NextLink from 'next/link';
import * as React from 'react';

function Link({
	prefetch = false,
	...props
}: React.ComponentProps<typeof NextLink>) {
	return <NextLink prefetch={prefetch} {...props} />;
}

export { Link };
