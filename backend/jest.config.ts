import type { Config } from 'jest';

const config: Config = {
	moduleNameMapper: {
		'^@@/(.*)$': '<rootDir>/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	setupFiles: ['<rootDir>/env-config.ts'],
	testPathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
