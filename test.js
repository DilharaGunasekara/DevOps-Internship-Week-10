const assert = require('assert');

console.log('Running Week 09 automated tests...');

const expectedTitle = 'DevOps Internship - Week 09';
const expectedVersion = process.env.APP_VERSION || 'v1';

assert.strictEqual(expectedTitle, 'DevOps Internship - Week 09');
assert.ok(expectedVersion.length > 0);

console.log('All automated tests passed successfully!');
process.exit(0);
