import NextImage from 'next/image';
import { preload } from 'react-dom';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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

function preloadImage(src: string) {
	preload(`${basePath}${src}`, { as: 'image' });
}

export { Image, preloadImage };
