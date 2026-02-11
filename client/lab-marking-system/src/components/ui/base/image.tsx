import NextImage from 'next/image';

import config from '@/../next.config';

const basePath = config.basePath ?? '';

/**
 * This adds basePath in front of the src prop as required by
 * https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
 */
function Image({
	src,
	...props
}: React.ComponentProps<typeof NextImage> & {
	src: `/${string}`;
}) {
	return <NextImage src={`${basePath}${src}`} {...props} />;
}

export { Image };
