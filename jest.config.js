const { name: componentName } = require('./package.json');

module.exports = {
  verbose: true,
  moduleDirectories: ['node_modules'],
  coveragePathIgnorePatterns: ['__test__', 'config.ts'],
  transformIgnorePatterns: ['node_modules'],
  testPathIgnorePatterns: ['/node_modules/', '/target/'],
  testRunner: 'jest-jasmine2',
  coverageDirectory: `<rootDir>/target/reports/coverage/${componentName}`,
  transform: { '\\.(t|j)sx?$': '@swc/jest' },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/gully-cli.ts',
    '!src/gully.ts',
    '!src/s3Client.ts',
    '!src/commands/**/*',
  ],
};
