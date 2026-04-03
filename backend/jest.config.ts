import type { Config } from 'jest';

const config: Config = {
	moduleNameMapper: {
		'^@@/(.*)$': '<rootDir>/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	testPathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
