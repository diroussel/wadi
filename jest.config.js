module.exports = {
	rootDir: '.',
	testEnvironment: 'node',
	moduleDirectories: ['node_modules'],
	coveragePathIgnorePatterns: ['__test__', 'config.ts'],
	transformIgnorePatterns: ['node_modules'],
	testPathIgnorePatterns: ['/node_modules/', '/target/'],
	coverageDirectory: '<rootDir>/target/reports/coverage',
	transform: {'\\.(t|j)sx?$': '@swc/jest'},
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/wadi-cli.ts',
		'!src/wadi.ts',
		'!src/s3Client.ts',
		'!src/commands/**/*',
	],
};
