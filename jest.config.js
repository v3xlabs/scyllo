/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/.history/', '/node_modules/'],
    /*reporters: [
        'jest-nyancat-reporter'
    ]*/
};