import type { NextConfig } from 'next';
import type { PHASE_TYPE } from 'next/constants';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const nextConfig = (
	phase: PHASE_TYPE,
	{ defaultConfig }: { defaultConfig: NextConfig },
): NextConfig => {
	/* config options here */
	if (phase === PHASE_PRODUCTION_BUILD) {
		return {
			...defaultConfig,
			output: 'export',
			trailingSlash: true,
		};
	}

	return defaultConfig;
};

export default nextConfig;
