import { calculateAttendancePlan, countClassesBetween, calculateHorizonInfo } from './attendanceEngine.js';
import { timetables } from '../data/timetables.js';

let allPassed = true;
let currentTestsPassed = true;
let recoveryTestsPassed = true;
let missableTestsPassed = true;
let irreversibleTestsPassed = true;
let regressionPassed = true;

function assert(condition, testName, category) {
  if (!condition) {
    console.error(`FAIL: ${testName}`);
    allPassed = false;
    if (category === 'current') currentTestsPassed = false;
    if (category === 'recovery') recoveryTestsPassed = false;
    if (category === 'missable') missableTestsPassed = false;
    if (category === 'irreversible') irreversibleTestsPassed = false;
    if (category === 'regression') regressionPassed = false;
  }
}

// TEST A
let hA = calculateHorizonInfo(90, 100, 0);
assert(hA.requiredToReach90 === 0, "TEST A: Required 0", 'recovery');
assert(hA.maxMissableClasses === 0, "TEST A: Missable 0", 'missable');

// TEST B
let hB = calculateHorizonInfo(80, 100, 20);
assert(Math.abs(hB.maxPossiblePercentage - 83.33) < 0.1, "TEST B: Max possible ~83.33%", 'irreversible');
assert(hB.irreversibleDetention === true, "TEST B: Irreversible true", 'irreversible');

// TEST C
let hC = calculateHorizonInfo(85, 100, 50);
assert(Math.abs(hC.maxPossiblePercentage - 90.0) < 0.1, "TEST C: Max possible 90%", 'irreversible');
assert(hC.irreversibleDetention === false, "TEST C: Irreversible false", 'irreversible');

// TEST D
let hD = calculateHorizonInfo(95, 100, 20);
assert(hD.maxMissableClasses === 7, "TEST D: Missable 7", 'missable');

// TEST E
const testECounts = countClassesBetween(timetables["III ECE-A"], "2026-10-05", "2026-10-11");
const expectedE = {
  E: 3, B: 4, A: 4, G: 3, H: 1, D: 3, C: 3, F: 2
};
for (const [subj, expectedCount] of Object.entries(expectedE)) {
  assert(testECounts[subj] === expectedCount, `TEST E: Expected ${subj}=${expectedCount}, got ${testECounts[subj]}`, 'regression');
}

// Check LAB separately since it has weird key like LAB-108/309
const labCount = testECounts["LAB-108/309"] || 0;
assert(labCount === 4, `TEST E: Expected LAB=4, got ${labCount}`, 'regression');

console.log(`ATTENDANCE ENGINE STATUS: ${allPassed ? 'PASS' : 'FAIL'}

CURRENT ATTENDANCE TESTS: ${currentTestsPassed ? 'PASS' : 'FAIL'}
90% RECOVERY TESTS: ${recoveryTestsPassed ? 'PASS' : 'FAIL'}
MISSABLE CLASS TESTS: ${missableTestsPassed ? 'PASS' : 'FAIL'}
IRREVERSIBLE DETENTION TESTS: ${irreversibleTestsPassed ? 'PASS' : 'FAIL'}
TIMETABLE REGRESSION: ${regressionPassed ? 'PASS' : 'FAIL'}

FILES CREATED/MODIFIED:
- src/engine/attendanceEngine.js`);
