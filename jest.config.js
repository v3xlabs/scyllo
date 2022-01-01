/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/.history/', '/node_modules/', '/__tests__/__.*.ts'],
    /*reporters: [
        'jest-nyancat-reporter'
    ]*/
    globalSetup: './__tests__/__GLOBAL_SETUP__.ts',
    globalTeardown: './__tests__/__GLOBAL_TEARDOWN__.ts',
};